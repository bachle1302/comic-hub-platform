import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { MailModule } from '../mail/mail.module';
import { AuthTokenService } from './auth-token.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [JwtModule.register({}), MailModule, PassportModule],
  controllers: [AuthController],
  providers: [AuthService, AuthTokenService, JwtStrategy],
  exports: [AuthService],
})
export class AuthModule {}
