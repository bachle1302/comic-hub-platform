import {
  Injectable,
  Logger,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import nodemailer from 'nodemailer';

type EmailInput = {
  name: string;
  to: string;
};

type VerifyEmailInput = EmailInput & {
  verifyUrl: string;
};

type ResetPasswordEmailInput = EmailInput & {
  resetUrl: string;
};

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly configService: ConfigService) {}

  sendVerifyEmail(input: VerifyEmailInput): Promise<void> {
    return this.sendMail({
      to: input.to,
      subject: 'Verify your email',
      text: `Hello ${input.name}, verify your email: ${input.verifyUrl}`,
      html: `<p>Hello ${input.name},</p><p>Please verify your email:</p><p><a href="${input.verifyUrl}">${input.verifyUrl}</a></p>`,
      devUrl: input.verifyUrl,
    });
  }

  sendResetPasswordEmail(input: ResetPasswordEmailInput): Promise<void> {
    return this.sendMail({
      to: input.to,
      subject: 'Reset your password',
      text: `Hello ${input.name}, reset your password: ${input.resetUrl}`,
      html: `<p>Hello ${input.name},</p><p>Reset your password:</p><p><a href="${input.resetUrl}">${input.resetUrl}</a></p>`,
      devUrl: input.resetUrl,
    });
  }

  private async sendMail(input: {
    devUrl: string;
    html: string;
    subject: string;
    text: string;
    to: string;
  }): Promise<void> {
    const host = this.configService.get<string>('MAIL_HOST') ?? '';
    const nodeEnv = this.configService.get<string>('NODE_ENV') ?? 'development';

    if (!host) {
      if (nodeEnv === 'production') {
        throw new ServiceUnavailableException('Mail service is not configured');
      }

      this.logger.warn(
        `Mail is not configured. Dev email URL: ${input.devUrl}`,
      );
      return;
    }

    const port = this.configService.get<number>('MAIL_PORT') ?? 587;
    const user = this.configService.get<string>('MAIL_USER') ?? '';
    const password = this.configService.get<string>('MAIL_PASSWORD') ?? '';
    const from =
      this.configService.get<string>('MAIL_FROM') ??
      'Manga Platform <no-reply@manga.local>';

    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465,
      auth:
        user && password
          ? {
              user,
              pass: password,
            }
          : undefined,
    });

    await transporter.sendMail({
      from,
      to: input.to,
      subject: input.subject,
      text: input.text,
      html: input.html,
    });
  }
}
