import { Module } from '@nestjs/common';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { CommentReportsController } from './comment-reports.controller';
import { CommentReportsService } from './comment-reports.service';

@Module({
  imports: [AuditLogsModule, PrismaModule],
  controllers: [CommentReportsController],
  providers: [CommentReportsService],
})
export class CommentReportsModule {}
