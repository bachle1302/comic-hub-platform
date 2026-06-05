import { Module } from '@nestjs/common';
import { AuditLogsModule } from '../admin/audit-logs/audit-logs.module';
import { PrismaModule } from '../prisma/prisma.module';
import { ContactTicketsController } from './contact-tickets.controller';
import { ContactTicketsService } from './contact-tickets.service';

@Module({
  imports: [AuditLogsModule, PrismaModule],
  controllers: [ContactTicketsController],
  providers: [ContactTicketsService],
})
export class ContactTicketsModule {}
