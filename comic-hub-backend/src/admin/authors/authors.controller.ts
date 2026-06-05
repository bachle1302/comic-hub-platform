import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
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
import { AuthorsService } from './authors.service';
import { CreateAdminAuthorDto } from './dto/create-admin-author.dto';
import { UpdateAdminAuthorDto } from './dto/update-admin-author.dto';

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/authors')
export class AuthorsController {
  constructor(
    private readonly auditLogsService: AuditLogsService,
    private readonly authorsService: AuthorsService,
  ) {}

  @Get()
  findAll() {
    return this.authorsService.findAll();
  }

  @Post()
  async create(
    @CurrentUser() admin: AuthenticatedUser,
    @Req() request: Request,
    @Body() dto: CreateAdminAuthorDto,
  ) {
    const author = await this.authorsService.create(dto);
    await this.auditLogsService.createLog({
      admin,
      action: AdminAuditAction.CREATE_AUTHOR,
      entityType: 'Author',
      entityId: author.id,
      message: 'Admin created author',
      metadata: {
        authorId: author.id,
        name: author.name,
        slug: author.slug,
      },
      ip: request.ip,
      userAgent: request.get('user-agent'),
    });

    return author;
  }

  @Patch(':id')
  async update(
    @CurrentUser() admin: AuthenticatedUser,
    @Req() request: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAdminAuthorDto,
  ) {
    const author = await this.authorsService.update(id, dto);
    await this.auditLogsService.createLog({
      admin,
      action: AdminAuditAction.UPDATE_AUTHOR,
      entityType: 'Author',
      entityId: id,
      message: 'Admin updated author',
      metadata: {
        authorId: id,
        changes: dto,
      },
      ip: request.ip,
      userAgent: request.get('user-agent'),
    });

    return author;
  }

  @Delete(':id')
  async remove(
    @CurrentUser() admin: AuthenticatedUser,
    @Req() request: Request,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const result = await this.authorsService.remove(id);
    await this.auditLogsService.createLog({
      admin,
      action: AdminAuditAction.DELETE_AUTHOR,
      entityType: 'Author',
      entityId: id,
      message: 'Admin deleted author',
      metadata: {
        authorId: id,
      },
      ip: request.ip,
      userAgent: request.get('user-agent'),
    });

    return result;
  }
}
