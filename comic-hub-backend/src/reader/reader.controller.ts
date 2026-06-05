import {
  Controller,
  Get,
  Param,
  ParseFloatPipe,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { ReaderService } from './reader.service';

@UseGuards(JwtAuthGuard)
@Controller('reader')
export class ReaderController {
  constructor(private readonly readerService: ReaderService) {}

  @Get('comics/:slug/chapters/:chapterNumber')
  findProtectedChapter(
    @Req() request: Request,
    @CurrentUser() user: AuthenticatedUser,
    @Param('slug') slug: string,
    @Param('chapterNumber', ParseFloatPipe) chapterNumber: number,
  ) {
    return this.readerService.findProtectedChapter(
      user.id,
      slug,
      chapterNumber,
      {
        ip: this.getClientIp(request),
        userAgent: request.headers['user-agent'] ?? null,
      },
    );
  }

  private getClientIp(request: Request) {
    const forwardedFor = request.headers['x-forwarded-for'];
    const forwardedIp = Array.isArray(forwardedFor)
      ? forwardedFor[0]
      : forwardedFor?.split(',')[0]?.trim();

    return (
      forwardedIp ?? request.ip ?? request.socket.remoteAddress ?? 'unknown-ip'
    );
  }
}
