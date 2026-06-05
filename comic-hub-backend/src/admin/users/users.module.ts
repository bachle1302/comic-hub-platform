import { Module } from '@nestjs/common';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { PrismaModule } from '../../prisma/prisma.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [AuditLogsModule, PrismaModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
