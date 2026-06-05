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
import { CategoriesService } from './categories.service';
import { CreateAdminCategoryDto } from './dto/create-admin-category.dto';
import { UpdateAdminCategoryDto } from './dto/update-admin-category.dto';

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/categories')
export class CategoriesController {
  constructor(
    private readonly auditLogsService: AuditLogsService,
    private readonly categoriesService: CategoriesService,
  ) {}

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Post()
  async create(
    @CurrentUser() admin: AuthenticatedUser,
    @Req() request: Request,
    @Body() dto: CreateAdminCategoryDto,
  ) {
    const category = await this.categoriesService.create(dto);
    await this.auditLogsService.createLog({
      admin,
      action: AdminAuditAction.CREATE_CATEGORY,
      entityType: 'Category',
      entityId: category.id,
      message: 'Admin created category',
      metadata: {
        categoryId: category.id,
        name: category.name,
        slug: category.slug,
      },
      ip: request.ip,
      userAgent: request.get('user-agent'),
    });

    return category;
  }

  @Patch(':id')
  async update(
    @CurrentUser() admin: AuthenticatedUser,
    @Req() request: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateAdminCategoryDto,
  ) {
    const category = await this.categoriesService.update(id, dto);
    await this.auditLogsService.createLog({
      admin,
      action: AdminAuditAction.UPDATE_CATEGORY,
      entityType: 'Category',
      entityId: id,
      message: 'Admin updated category',
      metadata: {
        categoryId: id,
        changes: dto,
      },
      ip: request.ip,
      userAgent: request.get('user-agent'),
    });

    return category;
  }

  @Delete(':id')
  async remove(
    @CurrentUser() admin: AuthenticatedUser,
    @Req() request: Request,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const result = await this.categoriesService.remove(id);
    await this.auditLogsService.createLog({
      admin,
      action: AdminAuditAction.DELETE_CATEGORY,
      entityType: 'Category',
      entityId: id,
      message: 'Admin deleted category',
      metadata: {
        categoryId: id,
      },
      ip: request.ip,
      userAgent: request.get('user-agent'),
    });

    return result;
  }
}
