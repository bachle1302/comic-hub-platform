import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseFloatPipe,
  ParseIntPipe,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { createHash } from 'crypto';
import type { Request } from 'express';
import { ComicsService } from './comics.service';
import { BatchComicLikeStatusDto } from './dto/batch-comic-like-status.dto';
import { ComicRankingQueryDto } from './dto/comic-ranking-query.dto';

@Controller('comics')
export class ComicsController {
  constructor(private readonly comicsService: ComicsService) {}

  @Get()
  findAll() {
    return this.comicsService.findAll();
  }

  @Get('latest')
  findLatest() {
    return this.comicsService.findLatest();
  }

  @Get('hot')
  findHot() {
    return this.comicsService.findHot();
  }

  @Get('ranking')
  findRanking(@Query() query: ComicRankingQueryDto) {
    return this.comicsService.findRanking(query);
  }

  @Post('like-status/batch')
  getBatchLikeStatus(
    @Req() request: Request,
    @Body() dto: BatchComicLikeStatusDto,
  ) {
    return this.comicsService.getBatchLikeStatus(
      this.getAnonymousLikeId(request),
      dto.comicIds,
    );
  }

  @Post(':id/like')
  likeComic(@Req() request: Request, @Param('id', ParseIntPipe) id: number) {
    return this.comicsService.likeComic(this.getAnonymousLikeId(request), id);
  }

  @Delete(':id/like')
  unlikeComic(@Req() request: Request, @Param('id', ParseIntPipe) id: number) {
    return this.comicsService.unlikeComic(this.getAnonymousLikeId(request), id);
  }

  @Get(':id/like-status')
  getLikeStatus(
    @Req() request: Request,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.comicsService.getLikeStatus(
      this.getAnonymousLikeId(request),
      id,
    );
  }

  @Get(':slug')
  findBySlug(@Req() request: Request, @Param('slug') slug: string) {
    return this.comicsService.findBySlug(slug, this.getViewContext(request));
  }

  @Get(':slug/chapters/:chapterNumber')
  findChapter(
    @Req() request: Request,
    @Param('slug') slug: string,
    @Param('chapterNumber', ParseFloatPipe) chapterNumber: number,
  ) {
    return this.comicsService.findChapter(
      slug,
      chapterNumber,
      this.getViewContext(request),
    );
  }

  private getAnonymousLikeId(request: Request) {
    const ip = this.getClientIp(request);
    const userAgent = request.headers['user-agent'] ?? 'unknown-user-agent';

    return createHash('sha256').update(`${ip}|${userAgent}`).digest('hex');
  }

  private getViewContext(request: Request) {
    return {
      ip: this.getClientIp(request),
      userAgent: request.headers['user-agent'] ?? null,
    };
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
