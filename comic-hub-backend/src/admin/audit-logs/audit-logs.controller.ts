import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AuditLogsService } from './audit-logs.service';
import { ListAuditLogsQueryDto } from './dto/list-audit-logs-query.dto';

@Controller('admin/audit-logs')
@UseGuards(JwtAuthGuard, AdminGuard)
export class AuditLogsController {
  constructor(private readonly auditLogsService: AuditLogsService) {}

  @Get()
  findAll(@Query() query: ListAuditLogsQueryDto) {
    return this.auditLogsService.findAll(query);
  }
}
