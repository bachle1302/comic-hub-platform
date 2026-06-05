import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AdminAuditAction } from '@prisma/client';
import type { Request } from 'express';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../../auth/types/authenticated-user.type';
import { CreatePresignedComicAvatarUploadDto } from '../../storage/dto/create-presigned-comic-avatar-upload.dto';
import { CreatePresignedUploadDto } from '../../storage/dto/create-presigned-upload.dto';
import { UploadService } from './upload.service';

@Controller('admin/upload')
@UseGuards(JwtAuthGuard, AdminGuard)
export class UploadController {
  constructor(
    private readonly auditLogsService: AuditLogsService,
    private readonly uploadService: UploadService,
  ) {}

  @Post('presigned-urls')
  async createPresignedUrls(
    @CurrentUser() admin: AuthenticatedUser,
    @Req() request: Request,
    @Body() dto: CreatePresignedUploadDto,
  ) {
    const result = await this.uploadService.createPresignedUrls(dto);
    await this.auditLogsService.createLog({
      admin,
      action: AdminAuditAction.UPLOAD_CHAPTER_IMAGES,
      entityType: 'ChapterImage',
      message: 'Admin created presigned chapter image upload URLs',
      metadata: {
        comicSlug: dto.comicSlug,
        chapterNumber: dto.chapterNumber,
        fileCount: dto.files.length,
      },
      ip: request.ip,
      userAgent: request.get('user-agent'),
    });

    return result;
  }

  @Post('comic-avatar/presigned-url')
  async createComicAvatarPresignedUrl(
    @CurrentUser() admin: AuthenticatedUser,
    @Req() request: Request,
    @Body() dto: CreatePresignedComicAvatarUploadDto,
  ) {
    const result = await this.uploadService.createComicAvatarPresignedUrl(dto);
    await this.auditLogsService.createLog({
      admin,
      action: AdminAuditAction.SYSTEM,
      entityType: 'Comic',
      entityId: dto.comicSlug,
      message: 'Admin created presigned comic avatar upload URL',
      metadata: {
        comicSlug: dto.comicSlug,
        fileName: dto.file.fileName,
        contentType: dto.file.contentType,
        size: dto.file.size,
      },
      ip: request.ip,
      userAgent: request.get('user-agent'),
    });

    return result;
  }
}
