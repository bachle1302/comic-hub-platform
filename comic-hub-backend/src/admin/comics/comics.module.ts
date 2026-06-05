import { Module } from '@nestjs/common';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { RedisModule } from '../../redis/redis.module';
import { ComicsController } from './comics.controller';
import { ComicsService } from './comics.service';

@Module({
  imports: [AuditLogsModule, PrismaModule, RedisModule],
  controllers: [ComicsController],
  providers: [ComicsService],
})
export class ComicsModule {}
