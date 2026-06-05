import { Module } from '@nestjs/common';
import { AuditLogsModule } from '../admin/audit-logs/audit-logs.module';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';
import { SystemSettingsController } from './system-settings.controller';
import { MaintenanceService } from './maintenance.service';
import { SystemSettingsService } from './system-settings.service';

@Module({
  imports: [AuditLogsModule, PrismaModule, RedisModule],
  controllers: [SystemSettingsController],
  providers: [MaintenanceService, SystemSettingsService],
  exports: [MaintenanceService, SystemSettingsService],
})
export class SystemSettingsModule {}
