import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { AuthTokenType, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { Request } from 'express';
import { OAuth2Client } from 'google-auth-library';
import { MailService } from '../mail/mail.service';
import { PrismaService } from '../prisma/prisma.service';
import { AuthTokenService } from './auth-token.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';

type SafeUser = {
  id: number;
  name: string;
  email: string;
  role: Role;
  avatar: string | null;
  coin: number;
};

@Injectable()
export class AuthService {
  constructor(
    private readonly authTokenService: AuthTokenService,
    private readonly mailService: MailService,
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        role: Role.USER,
        provider: 'local',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        coin: true,
        createdAt: true,
      },
    });
    const rawToken = await this.authTokenService.createEmailVerifyToken(
      user.id,
    );
    await this.mailService.sendVerifyEmail({
      to: user.email,
      name: user.name,
      verifyUrl: this.buildAppUrl('/verify-email', rawToken),
    });

    return {
      message: 'Register successful. Please verify your email.',
      user,
    };
  }

  async login(dto: LoginDto, request: Request) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    this.assertUserNotBanned(user);

    if (!user.password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.provider === 'local' && !user.emailVerifiedAt) {
      throw new ForbiddenException(
        'Please verify your email before logging in',
      );
    }

    const safeUser: SafeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      coin: user.coin,
    };

    const tokens = await this.generateTokens(safeUser);

    await this.saveRefreshToken(user.id, tokens.refreshToken, request);

    return {
      message: 'Login successful',
      user: safeUser,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  async refresh(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    const refreshTokenRecord = await this.prisma.refreshToken.findUnique({
      where: {
        token: refreshToken,
      },
      include: {
        user: true,
      },
    });

    if (!refreshTokenRecord) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (refreshTokenRecord.isRevoked) {
      throw new UnauthorizedException('Refresh token revoked');
    }

    if (refreshTokenRecord.expiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    try {
      await this.jwtService.verifyAsync(refreshToken, {
        secret:
          this.configService.get<string>('JWT_REFRESH_SECRET') ??
          'refresh_secret_manga_web',
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = refreshTokenRecord.user;

    this.assertUserNotBanned(user);

    const safeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      coin: user.coin,
    };

    const accessToken = await this.generateAccessToken(safeUser);

    return {
      message: 'Access token refreshed successfully',
      user: safeUser,
      accessToken,
    };
  }

  async logout(refreshToken: string) {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    await this.prisma.refreshToken.updateMany({
      where: {
        token: refreshToken,
        isRevoked: false,
      },
      data: {
        isRevoked: true,
      },
    });

    return {
      message: 'Logout successful',
    };
  }

  async getMe(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        avatar: true,
        coin: true,
        bannedAt: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('Unauthorized');
    }

    this.assertUserNotBanned(user);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      coin: user.coin,
      createdAt: user.createdAt,
    };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const token = await this.authTokenService.verifyToken({
      rawToken: dto.token,
      type: AuthTokenType.EMAIL_VERIFY,
    });

    await this.prisma.user.update({
      where: {
        id: token.userId,
      },
      data: {
        emailVerifiedAt: token.user.emailVerifiedAt ?? new Date(),
      },
    });

    return {
      message: 'Email verified successfully',
    };
  }

  async resendVerification(dto: ResendVerificationDto) {
    const genericResponse = {
      message: 'If the email exists, verification email has been sent',
    };
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        emailVerifiedAt: true,
        provider: true,
      },
    });

    if (!user) {
      return genericResponse;
    }

    if (user.emailVerifiedAt) {
      return {
        message: 'Email already verified',
      };
    }

    if (user.provider === 'google') {
      return {
        message: 'Google account is already verified',
      };
    }

    const rawToken = await this.authTokenService.createEmailVerifyToken(
      user.id,
    );
    await this.mailService.sendVerifyEmail({
      to: user.email,
      name: user.name,
      verifyUrl: this.buildAppUrl('/verify-email', rawToken),
    });

    return genericResponse;
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const response = {
      message: 'If the email exists, password reset email has been sent',
    };
    const user = await this.prisma.user.findUnique({
      where: {
        email: dto.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
      },
    });

    if (!user || !user.password) {
      return response;
    }

    const rawToken = await this.authTokenService.createPasswordResetToken(
      user.id,
    );
    await this.mailService.sendResetPasswordEmail({
      to: user.email,
      name: user.name,
      resetUrl: this.buildAppUrl('/reset-password', rawToken),
    });

    return response;
  }

  async resetPassword(dto: ResetPasswordDto) {
    const token = await this.authTokenService.verifyToken({
      rawToken: dto.token,
      type: AuthTokenType.PASSWORD_RESET,
    });
    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: {
          id: token.userId,
        },
        data: {
          password: hashedPassword,
          provider:
            token.user.provider === 'google' ? 'local' : token.user.provider,
          emailVerifiedAt: token.user.emailVerifiedAt ?? new Date(),
        },
      }),
      this.prisma.refreshToken.updateMany({
        where: {
          userId: token.userId,
          isRevoked: false,
        },
        data: {
          isRevoked: true,
        },
      }),
    ]);

    return {
      message: 'Password reset successfully',
    };
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        password: true,
      },
    });

    if (!user || !user.password) {
      throw new BadRequestException('Password login is not available');
    }

    const isPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    await this.prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        password: await bcrypt.hash(dto.newPassword, 10),
      },
    });

    return {
      message: 'Password changed successfully',
    };
  }

  async googleLogin(dto: GoogleLoginDto, request: Request) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID') ?? '';

    if (!clientId) {
      throw new BadRequestException('Google login is not configured');
    }

    const ticket = await new OAuth2Client(clientId).verifyIdToken({
      idToken: dto.idToken,
      audience: clientId,
    });
    const payload = ticket.getPayload();

    if (!payload?.sub || !payload.email) {
      throw new UnauthorizedException('Invalid Google token');
    }

    if (!payload.email_verified) {
      throw new ForbiddenException('Google email is not verified');
    }

    const now = new Date();
    const existingByGoogleId = await this.prisma.user.findUnique({
      where: {
        googleId: payload.sub,
      },
    });
    const user =
      existingByGoogleId ??
      (await this.upsertGoogleUser({
        avatar: payload.picture ?? null,
        email: payload.email,
        googleId: payload.sub,
        name: payload.name ?? payload.email,
        verifiedAt: now,
      }));

    this.assertUserNotBanned(user);

    const safeUser: SafeUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      coin: user.coin,
    };
    const tokens = await this.generateTokens(safeUser);

    await this.saveRefreshToken(user.id, tokens.refreshToken, request);

    return {
      message: 'Login successful',
      user: safeUser,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
    };
  }

  private async generateTokens(user: SafeUser) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = await this.jwtService.signAsync(payload, {
      secret:
        this.configService.get<string>('JWT_ACCESS_SECRET') ??
        'access_secret_manga_web',
      expiresIn: '15m',
    });

    const refreshToken = await this.jwtService.signAsync(payload, {
      secret:
        this.configService.get<string>('JWT_REFRESH_SECRET') ??
        'refresh_secret_manga_web',
      expiresIn: '7d',
    });

    return {
      accessToken,
      refreshToken,
    };
  }
  private async generateAccessToken(user: SafeUser) {
    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    return this.jwtService.signAsync(payload, {
      secret:
        this.configService.get<string>('JWT_ACCESS_SECRET') ??
        'access_secret_manga_web',
      expiresIn: '15m',
    });
  }

  private async saveRefreshToken(
    userId: number,
    refreshToken: string,
    request: Request,
  ) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId,
        userAgent: request.headers['user-agent'],
        ip: request.ip,
        expiresAt,
      },
    });
  }

  private buildAppUrl(path: string, token: string): string {
    const appUrl = (
      this.configService.get<string>('APP_URL') ??
      this.configService.get<string>('FRONTEND_URL') ??
      'http://localhost:3000'
    ).replace(/\/+$/, '');

    return `${appUrl}${path}?token=${encodeURIComponent(token)}`;
  }

  private async upsertGoogleUser(input: {
    avatar: string | null;
    email: string;
    googleId: string;
    name: string;
    verifiedAt: Date;
  }) {
    const existingByEmail = await this.prisma.user.findUnique({
      where: {
        email: input.email,
      },
    });

    if (existingByEmail) {
      return this.prisma.user.update({
        where: {
          id: existingByEmail.id,
        },
        data: {
          googleId: existingByEmail.googleId ?? input.googleId,
          avatar: existingByEmail.avatar ?? input.avatar,
          emailVerifiedAt: existingByEmail.emailVerifiedAt ?? input.verifiedAt,
        },
      });
    }

    return this.prisma.user.create({
      data: {
        email: input.email,
        name: input.name,
        avatar: input.avatar,
        googleId: input.googleId,
        provider: 'google',
        emailVerifiedAt: input.verifiedAt,
        role: Role.USER,
      },
    });
  }

  private assertUserNotBanned(user: { bannedAt: Date | null }) {
    if (user.bannedAt) {
      throw new ForbiddenException('Your account has been banned');
    }
  }
}
