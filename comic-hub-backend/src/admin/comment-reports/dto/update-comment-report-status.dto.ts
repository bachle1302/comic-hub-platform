import { CommentReportStatus } from '@prisma/client';
import { IsEnum } from 'class-validator';

export class UpdateCommentReportStatusDto {
  @IsEnum(CommentReportStatus)
  status: CommentReportStatus;
}
