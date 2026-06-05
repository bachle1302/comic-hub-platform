import { Module } from '@nestjs/common';
import { AuditLogsModule } from '../admin/audit-logs/audit-logs.module';
import { PrismaModule } from '../prisma/prisma.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { CommentsController } from './comments.controller';
import { CommentsService } from './comments.service';

@Module({
  imports: [AuditLogsModule, NotificationsModule, PrismaModule],
  controllers: [CommentsController],
  providers: [CommentsService],
})
export class CommentsModule {}
