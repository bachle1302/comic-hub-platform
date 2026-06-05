import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AdminAuditAction } from '@prisma/client';
import type { Request } from 'express';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { CurrentUser } from '../../auth/decorators/current-user.decorator';
import { AdminGuard } from '../../auth/guards/admin.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../../auth/types/authenticated-user.type';
import { CommentReportsService } from './comment-reports.service';
import { ListCommentReportsQueryDto } from './dto/list-comment-reports-query.dto';
import { UpdateCommentReportStatusDto } from './dto/update-comment-report-status.dto';

@Controller('admin/comment-reports')
@UseGuards(JwtAuthGuard, AdminGuard)
export class CommentReportsController {
  constructor(
    private readonly auditLogsService: AuditLogsService,
    private readonly commentReportsService: CommentReportsService,
  ) {}

  @Get()
  findAll(@Query() query: ListCommentReportsQueryDto) {
    return this.commentReportsService.findAll(query);
  }

  @Patch(':id/status')
  async updateStatus(
    @CurrentUser() admin: AuthenticatedUser,
    @Req() request: Request,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCommentReportStatusDto,
  ) {
    const report = await this.commentReportsService.updateStatus(id, dto);
    await this.auditLogsService.createLog({
      admin,
      action: AdminAuditAction.UPDATE_COMMENT_REPORT_STATUS,
      entityType: 'CommentReport',
      entityId: id,
      message: 'Admin updated comment report status',
      metadata: {
        reportId: id,
        newStatus: report.status,
        commentId: report.commentId,
      },
      ip: request.ip,
      userAgent: request.get('user-agent'),
    });

    return report;
  }

  @Delete(':id/comment')
  async deleteReportedComment(
    @CurrentUser() admin: AuthenticatedUser,
    @Req() request: Request,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const result = await this.commentReportsService.deleteReportedComment(
      id,
      admin.id,
    );
    await this.auditLogsService.createLog({
      admin,
      action: AdminAuditAction.DELETE_REPORTED_COMMENT,
      entityType: 'CommentReport',
      entityId: id,
      message: 'Admin deleted reported comment',
      metadata: {
        reportId: id,
        softDelete: true,
        deletedById: admin.id,
      },
      ip: request.ip,
      userAgent: request.get('user-agent'),
    });

    return result;
  }
}
