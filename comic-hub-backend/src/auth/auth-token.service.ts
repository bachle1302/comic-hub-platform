import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthTokenType, Prisma } from '@prisma/client';
import { createHash, randomBytes } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';

const authTokenWithUserSelect = {
  id: true,
  userId: true,
  type: true,
  tokenHash: true,
  expiresAt: true,
  usedAt: true,
  createdAt: true,
  user: true,
} satisfies Prisma.AuthTokenSelect;

export type AuthTokenWithUser = Prisma.AuthTokenGetPayload<{
  select: typeof authTokenWithUserSelect;
}>;

@Injectable()
export class AuthTokenService {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  createEmailVerifyToken(userId: number): Promise<string> {
    return this.createToken({
      expiresInMinutes:
        this.configService.get<number>('EMAIL_VERIFY_TOKEN_EXPIRES_MINUTES') ??
        60,
      type: AuthTokenType.EMAIL_VERIFY,
      userId,
    });
  }

  createPasswordResetToken(userId: number): Promise<string> {
    return this.createToken({
      expiresInMinutes:
        this.configService.get<number>(
          'PASSWORD_RESET_TOKEN_EXPIRES_MINUTES',
        ) ?? 30,
      type: AuthTokenType.PASSWORD_RESET,
      userId,
    });
  }

  async verifyToken(input: {
    rawToken: string;
    type: AuthTokenType;
  }): Promise<AuthTokenWithUser> {
    const tokenHash = this.hashToken(input.rawToken);
    const token = await this.prisma.authToken.findFirst({
      where: {
        tokenHash,
        type: input.type,
        usedAt: null,
        expiresAt: {
          gt: new Date(),
        },
      },
      select: authTokenWithUserSelect,
    });

    if (!token) {
      throw new BadRequestException('Invalid or expired token');
    }

    await this.prisma.authToken.update({
      where: {
        id: token.id,
      },
      data: {
        usedAt: new Date(),
      },
    });

    return token;
  }

  private async createToken(input: {
    expiresInMinutes: number;
    type: AuthTokenType;
    userId: number;
  }): Promise<string> {
    const rawToken = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + input.expiresInMinutes);

    await this.prisma.$transaction([
      this.prisma.authToken.updateMany({
        where: {
          userId: input.userId,
          type: input.type,
          usedAt: null,
        },
        data: {
          usedAt: new Date(),
        },
      }),
      this.prisma.authToken.create({
        data: {
          userId: input.userId,
          type: input.type,
          tokenHash: this.hashToken(rawToken),
          expiresAt,
        },
      }),
    ]);

    return rawToken;
  }

  private hashToken(rawToken: string): string {
    return createHash('sha256').update(rawToken).digest('hex');
  }
}
