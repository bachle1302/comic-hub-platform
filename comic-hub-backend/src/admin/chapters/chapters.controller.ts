import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AdminAuditAction } from '@prisma/client';
import type { Request } from 'express';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../../auth/types/authenticated-user.type';
import { ChaptersService } from './chapters.service';
import { CreateAdminChapterDto } from './dto/create-admin-chapter.dto';
import { UpdateAdminChapterDto } from './dto/update-admin-chapter.dto';

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller()
export class ChaptersController {
  constructor(
    private readonly auditLogsService: AuditLogsService,
    private readonly chaptersService: ChaptersService,
  ) {}

  @Get('admin/comics/:comicId/chapters')
  findAllByComic(
    @Param('comicId', ParseIntPipe) comicId: number,
    @Query('deleted') deleted?: string,
  ) {
    return this.chaptersService.findAllByComic(
      comicId,
      this.parseDeletedFilter(deleted),
    );
  }

  @Post('admin/comics/:comicId/chapters')
  async create(
    @CurrentUser() admin: AuthenticatedUser,
    @Req() request: Request,
    @Param('comicId', ParseIntPipe) comicId: number,
    @Body() dto: CreateAdminChapterDto,
  ) {
    const chapter = await this.chaptersService.create(comicId, dto);
    await this.auditLogsService.createLog({
      admin,
      action: AdminAuditAction.CREATE_CHAPTER,
      entityType: 'Chapter',
      entityId: chapter?.id,
      message: 'Admin created chapter',
      metadata: {
        comicId,
        comicSlug: chapter?.comic.slug,
        chapterId: chapter?.id,
        chapterNumber: chapter?.chapterNumber ?? dto.chapterNumber,
        price: chapter?.price ?? dto.price,
        isPublic: chapter?.isPublic ?? dto.isPublic,
      },
      ip: request.ip,
      userAgent: request.get('user-agent'),
    });

    return chapter;
  }

  @Get('admin/chapters/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.chaptersService.findOne(id);
  }

  @Patch('admin/chapters/:id')
  async update(
    @CurrentUser() admin: AuthenticatedUser,
    @Req() request: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAdminChapterDto,
  ) {
    const chapter = await this.chaptersService.update(id, dto);
    await this.auditLogsService.createLog({
      admin,
      action: AdminAuditAction.UPDATE_CHAPTER,
      entityType: 'Chapter',
      entityId: id,
      message: 'Admin updated chapter',
      metadata: {
        chapterId: id,
        comicId: chapter?.comic.id,
        comicSlug: chapter?.comic.slug,
        changes: dto,
      },
      ip: request.ip,
      userAgent: request.get('user-agent'),
    });

    return chapter;
  }

  @Delete('admin/chapters/:id')
  async remove(
    @CurrentUser() admin: AuthenticatedUser,
    @Req() request: Request,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const result = await this.chaptersService.remove(id, admin.id);
    await this.auditLogsService.createLog({
      admin,
      action: AdminAuditAction.DELETE_CHAPTER,
      entityType: 'Chapter',
      entityId: id,
      message: 'Admin deleted chapter',
      metadata: {
        chapterId: id,
        comicId: result.chapter.comicId,
        comicSlug: result.chapter.comicSlug,
        chapterNumber: result.chapter.chapterNumber,
        softDelete: true,
      },
      ip: request.ip,
      userAgent: request.get('user-agent'),
    });

    return result;
  }

  private parseDeletedFilter(
    value?: string,
  ): 'active' | 'deleted' | 'all' | undefined {
    return value === 'all' || value === 'deleted' || value === 'active'
      ? value
      : undefined;
  }
}
