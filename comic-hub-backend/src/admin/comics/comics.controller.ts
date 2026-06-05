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
import { ComicsService } from './comics.service';
import { CreateAdminComicDto } from './dto/create-admin-comic.dto';
import { UpdateAdminComicDto } from './dto/update-admin-comic.dto';

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/comics')
export class ComicsController {
  constructor(
    private readonly auditLogsService: AuditLogsService,
    private readonly comicsService: ComicsService,
  ) {}

  @Get()
  findAll(@Query('deleted') deleted?: string) {
    return this.comicsService.findAll(this.parseDeletedFilter(deleted));
  }

  @Post()
  async create(
    @CurrentUser() admin: AuthenticatedUser,
    @Req() request: Request,
    @Body() dto: CreateAdminComicDto,
  ) {
    const comic = await this.comicsService.create(dto);
    await this.auditLogsService.createLog({
      admin,
      action: AdminAuditAction.CREATE_COMIC,
      entityType: 'Comic',
      entityId: comic.id,
      message: 'Admin created comic',
      metadata: {
        comicId: comic.id,
        name: comic.name,
        slug: comic.slug,
        authorId: comic.authorId,
        categoryIds: dto.categoryIds ?? [],
        isPublic: comic.isPublic,
        status: comic.status,
      },
      ip: request.ip,
      userAgent: request.get('user-agent'),
    });

    return comic;
  }

  @Patch(':id')
  async update(
    @CurrentUser() admin: AuthenticatedUser,
    @Req() request: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAdminComicDto,
  ) {
    const comic = await this.comicsService.update(id, dto);
    await this.auditLogsService.createLog({
      admin,
      action: AdminAuditAction.UPDATE_COMIC,
      entityType: 'Comic',
      entityId: id,
      message: 'Admin updated comic',
      metadata: {
        comicId: id,
        slug: comic.slug,
        changes: dto,
      },
      ip: request.ip,
      userAgent: request.get('user-agent'),
    });

    return comic;
  }

  @Delete(':id')
  async remove(
    @CurrentUser() admin: AuthenticatedUser,
    @Req() request: Request,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const result = await this.comicsService.remove(id, admin.id);
    await this.auditLogsService.createLog({
      admin,
      action: AdminAuditAction.DELETE_COMIC,
      entityType: 'Comic',
      entityId: id,
      message: 'Admin deleted comic',
      metadata: {
        comicId: id,
        slug: result.comic.slug,
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
