import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { NotificationsService } from './notifications.service';

@UseGuards(JwtAuthGuard)
@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get('me')
  findMine(
    @CurrentUser() user: AuthenticatedUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('unreadOnly') unreadOnly?: string,
  ) {
    return this.notificationsService.findMine(user.id, {
      page: this.parseOptionalNumber(page),
      limit: this.parseOptionalNumber(limit),
      unreadOnly: this.parseOptionalBoolean(unreadOnly),
    });
  }

  @Get('unread-count')
  getUnreadCount(@CurrentUser() user: AuthenticatedUser) {
    return this.notificationsService.getUnreadCount(user.id);
  }

  @Patch(':id/read')
  markAsRead(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.notificationsService.markAsRead(user.id, id);
  }

  @Patch('read-all')
  markAllAsRead(@CurrentUser() user: AuthenticatedUser) {
    return this.notificationsService.markAllAsRead(user.id);
  }

  @Delete(':id')
  deleteNotification(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.notificationsService.deleteNotification(user.id, id);
  }

  private parseOptionalNumber(value?: string) {
    if (value === undefined) {
      return undefined;
    }

    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : undefined;
  }

  private parseOptionalBoolean(value?: string) {
    if (value === undefined) {
      return undefined;
    }

    return value === 'true';
  }
}
