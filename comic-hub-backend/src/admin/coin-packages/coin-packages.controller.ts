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
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../../auth/types/authenticated-user.type';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { CoinPackagesService } from './coin-packages.service';
import { CreateCoinPackageDto } from './dto/create-coin-package.dto';
import { ListCoinPackagesQueryDto } from './dto/list-coin-packages-query.dto';
import { UpdateCoinPackageDto } from './dto/update-coin-package.dto';

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/coin-packages')
export class CoinPackagesController {
  constructor(
    private readonly auditLogsService: AuditLogsService,
    private readonly coinPackagesService: CoinPackagesService,
  ) {}

  @Get()
  findAll(@Query() query: ListCoinPackagesQueryDto) {
    return this.coinPackagesService.findAll(query);
  }

  @Post()
  async create(
    @CurrentUser() admin: AuthenticatedUser,
    @Req() request: Request,
    @Body() dto: CreateCoinPackageDto,
  ) {
    const coinPackage = await this.coinPackagesService.create(dto);
    await this.auditLogsService.createLog({
      admin,
      action: AdminAuditAction.SYSTEM,
      entityType: 'CoinPackage',
      entityId: coinPackage.id,
      message: 'Admin created coin package',
      metadata: this.toAuditMetadata(coinPackage),
      ip: request.ip,
      userAgent: request.get('user-agent'),
    });

    return coinPackage;
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.coinPackagesService.findOne(id);
  }

  @Patch(':id')
  async update(
    @CurrentUser() admin: AuthenticatedUser,
    @Req() request: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCoinPackageDto,
  ) {
    const coinPackage = await this.coinPackagesService.update(id, dto);
    await this.auditLogsService.createLog({
      admin,
      action: AdminAuditAction.SYSTEM,
      entityType: 'CoinPackage',
      entityId: coinPackage.id,
      message: 'Admin updated coin package',
      metadata: {
        ...this.toAuditMetadata(coinPackage),
        changes: dto,
      },
      ip: request.ip,
      userAgent: request.get('user-agent'),
    });

    return coinPackage;
  }

  @Delete(':id')
  async disable(
    @CurrentUser() admin: AuthenticatedUser,
    @Req() request: Request,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const result = await this.coinPackagesService.disable(id);
    await this.auditLogsService.createLog({
      admin,
      action: AdminAuditAction.SYSTEM,
      entityType: 'CoinPackage',
      entityId: result.coinPackage.id,
      message: 'Admin disabled coin package',
      metadata: this.toAuditMetadata(result.coinPackage),
      ip: request.ip,
      userAgent: request.get('user-agent'),
    });

    return {
      message: result.message,
    };
  }

  private toAuditMetadata(coinPackage: {
    bonusCoin: number;
    coin: number;
    id: number;
    isActive: boolean;
    name: string;
    price: number;
    sortOrder: number;
  }) {
    return {
      coinPackageId: coinPackage.id,
      name: coinPackage.name,
      coin: coinPackage.coin,
      bonusCoin: coinPackage.bonusCoin,
      price: coinPackage.price,
      isActive: coinPackage.isActive,
      sortOrder: coinPackage.sortOrder,
    };
  }
}
