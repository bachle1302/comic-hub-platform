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
import { AuditLogsService } from '../admin/audit-logs/audit-logs.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AdminGuard } from '../auth/guards/admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { AnnouncementsService } from './announcements.service';
import { BroadcastAnnouncementDto } from './dto/broadcast-announcement.dto';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import {
  ListActiveAnnouncementsQueryDto,
  ListAnnouncementsQueryDto,
} from './dto/list-announcements-query.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';

@Controller()
export class AnnouncementsController {
  constructor(
    private readonly announcementsService: AnnouncementsService,
    private readonly auditLogsService: AuditLogsService,
  ) {}

  @Get('announcements/active')
  findActive(@Query() query: ListActiveAnnouncementsQueryDto) {
    return this.announcementsService.findActive(query);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin/announcements')
  findAll(@Query() query: ListAnnouncementsQueryDto) {
    return this.announcementsService.findAll(query);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('admin/announcements')
  async create(
    @CurrentUser() admin: AuthenticatedUser,
    @Req() request: Request,
    @Body() dto: CreateAnnouncementDto,
  ) {
    const announcement = await this.announcementsService.create(admin.id, dto);
    await this.auditLogsService.createLog({
      admin,
      action: AdminAuditAction.SYSTEM,
      entityType: 'Announcement',
      entityId: announcement.id,
      message: 'Admin created announcement',
      metadata: this.toAuditMetadata(announcement),
      ip: request.ip,
      userAgent: request.get('user-agent'),
    });

    return announcement;
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin/announcements/:id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.announcementsService.findOne(id);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch('admin/announcements/:id')
  async update(
    @CurrentUser() admin: AuthenticatedUser,
    @Req() request: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAnnouncementDto,
  ) {
    const announcement = await this.announcementsService.update(
      id,
      admin.id,
      dto,
    );
    await this.auditLogsService.createLog({
      admin,
      action: AdminAuditAction.SYSTEM,
      entityType: 'Announcement',
      entityId: announcement.id,
      message: 'Admin updated announcement',
      metadata: {
        ...this.toAuditMetadata(announcement),
        changes: dto,
      },
      ip: request.ip,
      userAgent: request.get('user-agent'),
    });

    return announcement;
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete('admin/announcements/:id')
  async remove(
    @CurrentUser() admin: AuthenticatedUser,
    @Req() request: Request,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const result = await this.announcementsService.remove(id, admin.id);
    await this.auditLogsService.createLog({
      admin,
      action: AdminAuditAction.SYSTEM,
      entityType: 'Announcement',
      entityId: result.announcement.id,
      message: 'Admin disabled announcement',
      metadata: {
        ...this.toAuditMetadata(result.announcement),
        previousIsActive: result.previousIsActive,
      },
      ip: request.ip,
      userAgent: request.get('user-agent'),
    });

    return {
      message: result.message,
    };
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Post('admin/announcements/:id/broadcast')
  async broadcast(
    @CurrentUser() admin: AuthenticatedUser,
    @Req() request: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: BroadcastAnnouncementDto,
  ) {
    const result = await this.announcementsService.broadcast(id, dto);
    await this.auditLogsService.createLog({
      admin,
      action: AdminAuditAction.SYSTEM,
      entityType: 'Announcement',
      entityId: id,
      message: 'Admin broadcasted announcement',
      metadata: {
        announcementId: id,
        target: result.target,
        createdCount: result.createdCount,
      },
      ip: request.ip,
      userAgent: request.get('user-agent'),
    });

    return result;
  }

  private toAuditMetadata(announcement: {
    id: number;
    isActive: boolean;
    target: string;
    title: string;
    type: string;
  }) {
    return {
      announcementId: announcement.id,
      title: announcement.title,
      type: announcement.type,
      target: announcement.target,
      isActive: announcement.isActive,
    };
  }
}
