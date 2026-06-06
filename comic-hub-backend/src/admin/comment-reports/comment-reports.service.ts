import { Injectable, NotFoundException } from '@nestjs/common';
import { CommentReportStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ListCommentReportsQueryDto } from './dto/list-comment-reports-query.dto';
import { UpdateCommentReportStatusDto } from './dto/update-comment-report-status.dto';

@Injectable()
export class CommentReportsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListCommentReportsQueryDto) {
    const page = this.normalizePage(query.page);
    const limit = this.normalizeLimit(query.limit);
    const skip = (page - 1) * limit;
    const where = this.buildWhere(query);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.commentReport.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        select: this.commentReportSelect(),
      }),
      this.prisma.commentReport.count({
        where,
      }),
    ]);
    const totalPages = Math.ceil(total / limit);

    return {
      items: items.map((item) => this.serializeReport(item)),
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  async updateStatus(id: number, dto: UpdateCommentReportStatusDto) {
    await this.ensureReportExists(id);

    const report = await this.prisma.commentReport.update({
      where: {
        id,
      },
      data: {
        status: dto.status,
      },
      select: this.commentReportSelect(),
    });

    return this.serializeReport(report);
  }

  async deleteReportedComment(id: number, deletedById: number) {
    const report = await this.prisma.commentReport.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        commentId: true,
        comment: {
          select: {
            deletedAt: true,
          },
        },
      },
    });

    if (!report) {
      throw new NotFoundException('Comment report not found');
    }

    await this.prisma.$transaction(async (tx) => {
      if (report.comment.deletedAt === null) {
        await tx.comment.update({
          where: {
            id: report.commentId,
          },
          data: {
            deletedAt: new Date(),
            deletedById,
            deleteReason: 'Deleted from comment report moderation',
          },
          select: {
            id: true,
          },
        });
      }

      await tx.commentReport.update({
        where: {
          id,
        },
        data: {
          status: CommentReportStatus.RESOLVED,
        },
        select: {
          id: true,
        },
      });
    });

    return {
      message: 'Reported comment deleted successfully',
    };
  }

  private async ensureReportExists(id: number) {
    const report = await this.prisma.commentReport.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

    if (!report) {
      throw new NotFoundException('Comment report not found');
    }
  }

  private buildWhere(
    query: ListCommentReportsQueryDto,
  ): Prisma.CommentReportWhereInput {
    return {
      status: query.status,
      commentId: query.commentId,
      userId: query.userId,
    };
  }

  private normalizePage(page?: number) {
    if (!page || !Number.isFinite(page)) {
      return 1;
    }

    return Math.max(Math.trunc(page), 1);
  }

  private normalizeLimit(limit?: number) {
    if (!limit || !Number.isFinite(limit)) {
      return 20;
    }

    return Math.min(Math.max(Math.trunc(limit), 1), 100);
  }

  private serializeReport<T extends { comment: { deletedAt: Date | null } }>(
    report: T,
  ): T & { comment: T['comment'] & { isDeleted: boolean } } {
    return {
      ...report,
      comment: {
        ...report.comment,
        isDeleted: report.comment.deletedAt !== null,
      },
    };
  }

  private commentReportSelect() {
    return {
      id: true,
      commentId: true,
      userId: true,
      reason: true,
      status: true,
      createdAt: true,
      updatedAt: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
        },
      },
      comment: {
        select: {
          id: true,
          content: true,
          userId: true,
          comicId: true,
          chapterId: true,
          parentId: true,
          deletedAt: true,
          deletedById: true,
          deleteReason: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
          comic: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          chapter: {
            select: {
              id: true,
              name: true,
              chapterNumber: true,
            },
          },
        },
      },
    } satisfies Prisma.CommentReportSelect;
  }
}
