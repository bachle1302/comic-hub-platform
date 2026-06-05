import {
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { GoogleLoginDto } from './dto/google-login.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { ResendVerificationDto } from './dto/resend-verification.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { extractBearerToken } from './utils/extract-bearer-token';
import { TokenBucketRateLimit } from '../rate-limit/decorators/token-bucket.decorator';

const AUTH_TOKEN_BUCKET = {
  capacity: 5,
  refillRate: 1,
  refillIntervalMs: 10000,
  cost: 1,
  keyPrefix: 'auth',
} as const;

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @TokenBucketRateLimit(AUTH_TOKEN_BUCKET)
  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @TokenBucketRateLimit(AUTH_TOKEN_BUCKET)
  @Post('login')
  @HttpCode(200)
  login(@Body() dto: LoginDto, @Req() request: Request) {
    return this.authService.login(dto, request);
  }

  @TokenBucketRateLimit(AUTH_TOKEN_BUCKET)
  @Post('refresh')
  @HttpCode(200)
  refresh(@Headers('authorization') authorization: string | undefined) {
    const refreshToken = extractBearerToken(authorization);

    return this.authService.refresh(refreshToken);
  }

  @Post('logout')
  @HttpCode(200)
  logout(@Headers('authorization') authorization: string | undefined) {
    const refreshToken = extractBearerToken(authorization);

    return this.authService.logout(refreshToken);
  }

  @TokenBucketRateLimit(AUTH_TOKEN_BUCKET)
  @Post('verify-email')
  @HttpCode(200)
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto);
  }

  @TokenBucketRateLimit(AUTH_TOKEN_BUCKET)
  @Post('resend-verification')
  @HttpCode(200)
  resendVerification(@Body() dto: ResendVerificationDto) {
    return this.authService.resendVerification(dto);
  }

  @TokenBucketRateLimit(AUTH_TOKEN_BUCKET)
  @Post('forgot-password')
  @HttpCode(200)
  forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @TokenBucketRateLimit(AUTH_TOKEN_BUCKET)
  @Post('reset-password')
  @HttpCode(200)
  resetPassword(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @HttpCode(200)
  changePassword(
    @CurrentUser() user: { id: number },
    @Body() dto: ChangePasswordDto,
  ) {
    return this.authService.changePassword(user.id, dto);
  }

  @TokenBucketRateLimit(AUTH_TOKEN_BUCKET)
  @Post('google')
  @HttpCode(200)
  googleLogin(@Body() dto: GoogleLoginDto, @Req() request: Request) {
    return this.authService.googleLogin(dto, request);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(@CurrentUser() user: { id: number }) {
    return this.authService.getMe(user.id);
  }
}
