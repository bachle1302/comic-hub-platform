import { Module } from '@nestjs/common';
import { AuditLogsModule } from '../admin/audit-logs/audit-logs.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { AnnouncementsController } from './announcements.controller';
import { AnnouncementsService } from './announcements.service';

@Module({
  imports: [AuditLogsModule, NotificationsModule],
  controllers: [AnnouncementsController],
  providers: [AnnouncementsService],
})
export class AnnouncementsModule {}
