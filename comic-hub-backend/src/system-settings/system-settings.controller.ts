import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AdminGuard } from '../auth/guards/admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { ListSystemSettingsQueryDto } from './dto/list-system-settings-query.dto';
import { UpdateSystemSettingDto } from './dto/update-system-setting.dto';
import { SystemSettingsService } from './system-settings.service';

@Controller()
export class SystemSettingsController {
  constructor(private readonly systemSettingsService: SystemSettingsService) {}

  @Get('system-settings/public')
  getPublicSettings() {
    return this.systemSettingsService.getPublicSettings();
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin/system-settings')
  listSettings(@Query() query: ListSystemSettingsQueryDto) {
    return this.systemSettingsService.listSettings(query);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Patch('admin/system-settings/:key')
  updateSetting(
    @CurrentUser() admin: AuthenticatedUser,
    @Req() request: Request,
    @Param('key') key: string,
    @Body() dto: UpdateSystemSettingDto,
  ) {
    return this.systemSettingsService.updateSetting({
      key,
      value: dto.value,
      admin,
      ip: request.ip,
      userAgent: request.get('user-agent'),
    });
  }
}
