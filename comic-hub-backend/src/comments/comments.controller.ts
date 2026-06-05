import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { AdminAuditAction } from '@prisma/client';
import type { Request } from 'express';
import { AuditLogsService } from '../admin/audit-logs/audit-logs.service';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AdminGuard } from '../auth/guards/admin.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { TokenBucketRateLimit } from '../rate-limit/decorators/token-bucket.decorator';
import { CommentsService } from './comments.service';
import { BatchCommentLikeStatusDto } from './dto/batch-comment-like-status.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ReportCommentDto } from './dto/report-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

const COMMENTS_TOKEN_BUCKET = {
  capacity: 10,
  refillRate: 1,
  refillIntervalMs: 5000,
  cost: 1,
  keyPrefix: 'comments',
} as const;

@Controller()
export class CommentsController {
  constructor(
    private readonly auditLogsService: AuditLogsService,
    private readonly commentsService: CommentsService,
  ) {}

  @Get('comments/comics/:comicId')
  findComicComments(
    @Param('comicId', ParseIntPipe) comicId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.commentsService.findComicComments(comicId, {
      page: this.parseOptionalNumber(page),
      limit: this.parseOptionalNumber(limit),
    });
  }

  @Get('comments/chapters/:chapterId')
  findChapterComments(
    @Param('chapterId', ParseIntPipe) chapterId: number,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.commentsService.findChapterComments(chapterId, {
      page: this.parseOptionalNumber(page),
      limit: this.parseOptionalNumber(limit),
    });
  }

  @TokenBucketRateLimit(COMMENTS_TOKEN_BUCKET)
  @UseGuards(JwtAuthGuard)
  @Post('comments')
  createComment(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateCommentDto,
  ) {
    return this.commentsService.createComment(user.id, dto);
  }

  @TokenBucketRateLimit(COMMENTS_TOKEN_BUCKET)
  @UseGuards(JwtAuthGuard)
  @Post('comments/:id/report')
  reportComment(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ReportCommentDto,
  ) {
    return this.commentsService.reportComment(user.id, id, dto);
  }

  @TokenBucketRateLimit(COMMENTS_TOKEN_BUCKET)
  @UseGuards(JwtAuthGuard)
  @Post('comments/like-status/batch')
  getBatchCommentLikeStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: BatchCommentLikeStatusDto,
  ) {
    return this.commentsService.getBatchCommentLikeStatus(
      user.id,
      dto.commentIds,
    );
  }

  @TokenBucketRateLimit(COMMENTS_TOKEN_BUCKET)
  @UseGuards(JwtAuthGuard)
  @Post('comments/:id/like')
  likeComment(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.commentsService.likeComment(user.id, id);
  }

  @TokenBucketRateLimit(COMMENTS_TOKEN_BUCKET)
  @UseGuards(JwtAuthGuard)
  @Delete('comments/:id/like')
  unlikeComment(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.commentsService.unlikeComment(user.id, id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('comments/:id/like-status')
  getCommentLikeStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.commentsService.getCommentLikeStatus(user.id, id);
  }

  @TokenBucketRateLimit(COMMENTS_TOKEN_BUCKET)
  @UseGuards(JwtAuthGuard)
  @Patch('comments/:id')
  updateComment(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateCommentDto,
  ) {
    return this.commentsService.updateComment(user.id, user.role, id, dto);
  }

  @TokenBucketRateLimit(COMMENTS_TOKEN_BUCKET)
  @UseGuards(JwtAuthGuard)
  @Delete('comments/:id')
  deleteComment(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.commentsService.deleteComment(user.id, user.role, id);
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Get('admin/comments')
  findAdminComments(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('comicId') comicId?: string,
    @Query('chapterId') chapterId?: string,
    @Query('deleted') deleted?: string,
  ) {
    return this.commentsService.findAdminComments(
      {
        page: this.parseOptionalNumber(page),
        limit: this.parseOptionalNumber(limit),
      },
      {
        comicId: this.parseOptionalNumber(comicId),
        chapterId: this.parseOptionalNumber(chapterId),
        deleted: this.parseDeletedFilter(deleted),
      },
    );
  }

  @UseGuards(JwtAuthGuard, AdminGuard)
  @Delete('admin/comments/:id')
  async deleteAdminComment(
    @CurrentUser() user: AuthenticatedUser,
    @Req() request: Request,
    @Param('id', ParseIntPipe) id: number,
  ) {
    const result = await this.commentsService.deleteComment(
      user.id,
      user.role,
      id,
    );
    await this.auditLogsService.createLog({
      admin: user,
      action: AdminAuditAction.DELETE_COMMENT,
      entityType: 'Comment',
      entityId: id,
      message: 'Admin deleted comment',
      metadata: {
        commentId: id,
        softDelete: true,
        deletedById: user.id,
      },
      ip: request.ip,
      userAgent: request.get('user-agent'),
    });

    return result;
  }

  private parseOptionalNumber(value?: string) {
    if (value === undefined) {
      return undefined;
    }

    const parsed = Number(value);

    return Number.isFinite(parsed) ? parsed : undefined;
  }

  private parseDeletedFilter(
    value?: string,
  ): 'active' | 'deleted' | 'all' | undefined {
    return value === 'all' || value === 'deleted' || value === 'active'
      ? value
      : undefined;
  }
}
