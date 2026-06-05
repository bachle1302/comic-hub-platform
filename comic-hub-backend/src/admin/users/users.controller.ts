import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
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
import { AdjustUserCoinDto } from './dto/adjust-user-coin.dto';
import { BanUserDto } from './dto/ban-user.dto';
import { ListAdminUsersQueryDto } from './dto/list-admin-users-query.dto';
import { UsersService } from './users.service';

@UseGuards(JwtAuthGuard, AdminGuard)
@Controller('admin/users')
export class UsersController {
  constructor(
    private readonly auditLogsService: AuditLogsService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  findAll(@Query() query: ListAdminUsersQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findOne(id);
  }

  @Patch(':id/coin')
  async adjustCoin(
    @CurrentUser() admin: AuthenticatedUser,
    @Req() request: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: AdjustUserCoinDto,
  ) {
    const result = await this.usersService.adjustCoin(id, dto);
    await this.auditLogsService.createLog({
      admin,
      action: AdminAuditAction.ADJUST_USER_COIN,
      entityType: 'User',
      entityId: id,
      message: 'Admin adjusted user coin',
      metadata: {
        targetUserId: id,
        amount: dto.amount,
        balanceBefore: result.transaction.balanceBefore,
        balanceAfter: result.transaction.balanceAfter,
        reason: dto.reason,
        transactionId: result.transaction.id,
      },
      ip: request.ip,
      userAgent: request.get('user-agent'),
    });

    return result;
  }

  @Patch(':id/ban')
  async banUser(
    @CurrentUser() admin: AuthenticatedUser,
    @Req() request: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: BanUserDto,
  ) {
    const user = await this.usersService.banUser(id, dto, admin.id);
    await this.auditLogsService.createLog({
      admin,
      action: AdminAuditAction.BAN_USER,
      entityType: 'User',
      entityId: id,
      message: 'Admin banned user',
      metadata: {
        targetUserId: user.id,
        targetEmail: user.email,
        reason: dto.reason,
      },
      ip: request.ip,
      userAgent: request.get('user-agent'),
    });

    return user;
  }

  @Patch(':id/unban')
  async unbanUser(
    @CurrentUser() admin: AuthenticatedUser,
    @Req() request: Request,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const user = await this.usersService.unbanUser(id);
    await this.auditLogsService.createLog({
      admin,
      action: AdminAuditAction.UNBAN_USER,
      entityType: 'User',
      entityId: id,
      message: 'Admin unbanned user',
      metadata: {
        targetUserId: user.id,
        targetEmail: user.email,
      },
      ip: request.ip,
      userAgent: request.get('user-agent'),
    });

    return user;
  }

  @Get(':id/transactions')
  findUserTransactions(
    @Param('id', ParseIntPipe) id: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.usersService.findUserTransactions(id, {
      page: this.parseOptionalNumber(page),
      limit: this.parseOptionalNumber(limit),
    });
  }

  private parseOptionalNumber(value?: string) {
    if (value === undefined) {
      return undefined;
    }

    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : undefined;
  }
}
