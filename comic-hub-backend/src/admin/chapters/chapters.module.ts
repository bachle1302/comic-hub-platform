import { Module } from '@nestjs/common';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { NotificationsModule } from '../../notifications/notifications.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { RedisModule } from '../../redis/redis.module';
import { ChaptersController } from './chapters.controller';
import { ChaptersService } from './chapters.service';

@Module({
  imports: [AuditLogsModule, NotificationsModule, PrismaModule, RedisModule],
  controllers: [ChaptersController],
  providers: [ChaptersService],
})
export class ChaptersModule {}
