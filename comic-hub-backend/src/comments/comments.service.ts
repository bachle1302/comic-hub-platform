import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CommentReportStatus, Prisma, Role } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { ReportCommentDto } from './dto/report-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

type PaginationInput = {
  limit?: number;
  page?: number;
};

type CommentTarget = {
  chapterId: number | null;
  comicId: number;
  parentId: number | null;
};

type CommentUserPayload = {
  avatar: string | null;
  id: number;
  name: string;
};

type CommentLikeCountPayload = {
  _count: {
    likes: number;
  };
};

type CommentReplyPayload = CommentLikeCountPayload & {
  chapterId: number | null;
  comicId: number;
  content: string;
  createdAt: Date;
  deletedAt: Date | null;
  deletedById: number | null;
  deleteReason: string | null;
  id: number;
  parentId: number | null;
  updatedAt: Date;
  user: CommentUserPayload;
  userId: number;
};

type CommentPayload = CommentReplyPayload & {
  replies: CommentReplyPayload[];
};

type AdminCommentPayload = CommentReplyPayload & {
  chapter: {
    chapterNumber: number;
    id: number;
    name: string;
  } | null;
  comic: {
    id: number;
    name: string;
    slug: string;
  };
  parent: {
    content: string;
    id: number;
  } | null;
};

type AdminDeletedFilter = 'active' | 'deleted' | 'all';

@Injectable()
export class CommentsService {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly prisma: PrismaService,
  ) {}

  async findComicComments(comicId: number, pagination: PaginationInput) {
    await this.ensurePublicComic(comicId);

    return this.paginateComments(
      {
        comicId,
        chapterId: null,
      },
      pagination,
    );
  }

  async findChapterComments(chapterId: number, pagination: PaginationInput) {
    await this.ensurePublicChapter(chapterId);

    return this.paginateComments(
      {
        chapterId,
      },
      pagination,
    );
  }

  async createComment(userId: number, dto: CreateCommentDto) {
    const target = await this.resolveCommentTarget(userId, dto);

    const comment = await this.prisma.comment.create({
      data: {
        content: dto.content.trim(),
        userId,
        comicId: target.comicId,
        chapterId: target.chapterId,
        parentId: target.parentId,
      },
      select: this.commentSelect(),
    });

    const serializedComment = this.serializeComment(comment);

    await this.notificationsService.notifyCommentCreated({
      actorUserId: userId,
      commentId: serializedComment.id,
      comicId: serializedComment.comicId,
      chapterId: serializedComment.chapterId,
      parentId: serializedComment.parentId,
    });

    return serializedComment;
  }

  async updateComment(
    userId: number,
    role: Role,
    id: number,
    dto: UpdateCommentDto,
  ) {
    const existingComment = await this.prisma.comment.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        userId: true,
        deletedAt: true,
      },
    });

    if (!existingComment) {
      throw new NotFoundException('Comment not found');
    }

    if (existingComment.deletedAt !== null) {
      throw new BadRequestException('Comment has been deleted');
    }

    if (existingComment.userId !== userId && role !== Role.ADMIN) {
      throw new ForbiddenException('You cannot update this comment');
    }

    const comment = await this.prisma.comment.update({
      where: {
        id,
      },
      data: {
        content: dto.content.trim(),
      },
      select: this.commentSelect(),
    });

    return this.serializeComment(comment);
  }

  async deleteComment(userId: number, role: Role, id: number) {
    const comment = await this.prisma.comment.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        userId: true,
        deletedAt: true,
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.deletedAt !== null) {
      return {
        message: 'Comment deleted successfully',
      };
    }

    if (comment.userId !== userId && role !== Role.ADMIN) {
      throw new ForbiddenException('You cannot delete this comment');
    }

    await this.softDeleteComment(id, userId);

    return {
      message: 'Comment deleted successfully',
    };
  }

  async reportComment(userId: number, id: number, dto: ReportCommentDto) {
    const comment = await this.prisma.comment.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        userId: true,
        deletedAt: true,
      },
    });

    if (!comment) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.deletedAt !== null) {
      throw new NotFoundException('Comment not found');
    }

    if (comment.userId === userId) {
      throw new BadRequestException('You cannot report your own comment');
    }

    const existingReport = await this.prisma.commentReport.findUnique({
      where: {
        commentId_userId: {
          commentId: id,
          userId,
        },
      },
      select: this.reportSelect(),
    });

    if (existingReport) {
      return {
        message: 'Comment already reported',
        report: existingReport,
      };
    }

    const report = await this.prisma.commentReport.create({
      data: {
        commentId: id,
        userId,
        reason: dto.reason.trim(),
        status: CommentReportStatus.PENDING,
      },
      select: this.reportSelect(),
    });

    return {
      report,
    };
  }

  async likeComment(userId: number, id: number) {
    await this.ensureCommentExists(id);

    await this.prisma.commentLike.upsert({
      where: {
        commentId_userId: {
          commentId: id,
          userId,
        },
      },
      update: {},
      create: {
        commentId: id,
        userId,
      },
      select: {
        id: true,
      },
    });

    return {
      isLiked: true,
      likeCount: await this.countCommentLikes(id),
    };
  }

  async unlikeComment(userId: number, id: number) {
    await this.ensureCommentExists(id);

    await this.prisma.commentLike.deleteMany({
      where: {
        commentId: id,
        userId,
      },
    });

    return {
      isLiked: false,
      likeCount: await this.countCommentLikes(id),
    };
  }

  async getCommentLikeStatus(userId: number, id: number) {
    await this.ensureCommentExists(id);

    const [like, likeCount] = await this.prisma.$transaction([
      this.prisma.commentLike.findUnique({
        where: {
          commentId_userId: {
            commentId: id,
            userId,
          },
        },
        select: {
          id: true,
        },
      }),
      this.prisma.commentLike.count({
        where: {
          commentId: id,
        },
      }),
    ]);

    return {
      isLiked: like !== null,
      likeCount,
    };
  }

  async getBatchCommentLikeStatus(userId: number, commentIds: number[]) {
    const uniqueCommentIds = Array.from(new Set(commentIds));

    if (uniqueCommentIds.length === 0) {
      return {
        items: [],
      };
    }

    const likes = await this.prisma.commentLike.findMany({
      where: {
        commentId: {
          in: uniqueCommentIds,
        },
        comment: {
          deletedAt: null,
        },
        userId,
      },
      select: {
        commentId: true,
      },
    });
    const likedIds = new Set(likes.map((like) => like.commentId));

    return {
      items: uniqueCommentIds.map((commentId) => ({
        commentId,
        isLiked: likedIds.has(commentId),
      })),
    };
  }

  findAdminComments(
    pagination: PaginationInput,
    filters: {
      chapterId?: number;
      comicId?: number;
      deleted?: AdminDeletedFilter;
    },
  ) {
    return this.paginateComments(
      this.withAdminDeletedFilter(
        {
          chapterId: filters.chapterId,
          comicId: filters.comicId,
        },
        filters.deleted,
      ),
      pagination,
      true,
    );
  }

  private async paginateComments(
    where: Prisma.CommentWhereInput,
    pagination: PaginationInput,
    includeRelations = false,
  ) {
    const page = this.normalizePage(pagination.page);
    const limit = this.normalizeLimit(pagination.limit);
    const skip = (page - 1) * limit;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.comment.findMany({
        where: includeRelations
          ? where
          : { ...where, parentId: null, deletedAt: null },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        select: includeRelations
          ? this.adminCommentSelect()
          : this.commentSelect(),
      }),
      this.prisma.comment.count({
        where: includeRelations
          ? where
          : { ...where, parentId: null, deletedAt: null },
      }),
    ]);
    const totalPages = Math.ceil(total / limit);

    const serializedItems = includeRelations
      ? (items as AdminCommentPayload[]).map((item) =>
          this.serializeAdminComment(item),
        )
      : (items as CommentPayload[]).map((item) => this.serializeComment(item));

    return {
      items: serializedItems,
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

  private async resolveCommentTarget(
    userId: number,
    dto: CreateCommentDto,
  ): Promise<CommentTarget> {
    if (!dto.comicId && !dto.chapterId && !dto.parentId) {
      throw new BadRequestException(
        'comicId, chapterId or parentId is required',
      );
    }

    if (dto.parentId) {
      return this.resolveReplyTarget(userId, dto.parentId);
    }

    if (dto.chapterId) {
      const chapter = await this.ensurePublicChapter(dto.chapterId);

      if (dto.comicId && dto.comicId !== chapter.comicId) {
        throw new BadRequestException('Chapter does not belong to comic');
      }

      if (chapter.price > 0) {
        const purchase = await this.prisma.purchase.findUnique({
          where: {
            userId_chapterId: {
              userId,
              chapterId: chapter.id,
            },
          },
          select: {
            id: true,
          },
        });

        if (!purchase) {
          throw new ForbiddenException('Chapter has not been purchased');
        }
      }

      return {
        comicId: chapter.comicId,
        chapterId: chapter.id,
        parentId: null,
      };
    }

    if (!dto.comicId) {
      throw new BadRequestException('comicId is required');
    }

    const comic = await this.ensurePublicComic(dto.comicId);

    return {
      comicId: comic.id,
      chapterId: null,
      parentId: null,
    };
  }

  private async resolveReplyTarget(
    userId: number,
    parentId: number,
  ): Promise<CommentTarget> {
    const parent = await this.prisma.comment.findUnique({
      where: {
        id: parentId,
      },
      select: {
        id: true,
        comicId: true,
        chapterId: true,
        parentId: true,
        deletedAt: true,
      },
    });

    if (!parent) {
      throw new NotFoundException('Parent comment not found');
    }

    if (parent.deletedAt !== null) {
      throw new BadRequestException('Parent comment has been deleted');
    }

    if (parent.parentId !== null) {
      throw new BadRequestException('Only one-level replies are supported');
    }

    if (parent.chapterId) {
      const chapter = await this.ensurePublicChapter(parent.chapterId);

      if (chapter.price > 0) {
        const purchase = await this.prisma.purchase.findUnique({
          where: {
            userId_chapterId: {
              userId,
              chapterId: chapter.id,
            },
          },
          select: {
            id: true,
          },
        });

        if (!purchase) {
          throw new ForbiddenException('Chapter has not been purchased');
        }
      }
    } else {
      await this.ensurePublicComic(parent.comicId);
    }

    return {
      comicId: parent.comicId,
      chapterId: parent.chapterId,
      parentId: parent.id,
    };
  }

  private async ensurePublicComic(comicId: number) {
    const comic = await this.prisma.comic.findUnique({
      where: {
        id: comicId,
      },
      select: {
        id: true,
        isPublic: true,
        deletedAt: true,
      },
    });

    if (!comic || !comic.isPublic || comic.deletedAt !== null) {
      throw new NotFoundException('Comic not found');
    }

    return comic;
  }

  private async ensurePublicChapter(chapterId: number) {
    const chapter = await this.prisma.chapter.findUnique({
      where: {
        id: chapterId,
      },
      select: {
        id: true,
        comicId: true,
        isPublic: true,
        price: true,
        deletedAt: true,
        comic: {
          select: {
            isPublic: true,
            deletedAt: true,
          },
        },
      },
    });

    if (
      !chapter ||
      !chapter.isPublic ||
      chapter.deletedAt !== null ||
      !chapter.comic.isPublic ||
      chapter.comic.deletedAt !== null
    ) {
      throw new NotFoundException('Chapter not found');
    }

    return chapter;
  }

  private async ensureCommentExists(id: number) {
    const comment = await this.prisma.comment.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        deletedAt: true,
      },
    });

    if (!comment || comment.deletedAt !== null) {
      throw new NotFoundException('Comment not found');
    }

    return comment;
  }

  private countCommentLikes(id: number) {
    return this.prisma.commentLike.count({
      where: {
        commentId: id,
      },
    });
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

    return Math.min(Math.max(Math.trunc(limit), 1), 50);
  }

  private commentSelect() {
    return {
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
          avatar: true,
        },
      },
      _count: {
        select: {
          likes: true,
        },
      },
      replies: {
        where: {
          deletedAt: null,
        },
        orderBy: {
          createdAt: 'asc',
        },
        select: this.replySelect(),
      },
    } satisfies Prisma.CommentSelect;
  }

  private adminCommentSelect() {
    return {
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
      parent: {
        select: {
          id: true,
          content: true,
        },
      },
      _count: {
        select: {
          likes: true,
        },
      },
    } satisfies Prisma.CommentSelect;
  }

  private replySelect() {
    return {
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
          avatar: true,
        },
      },
      _count: {
        select: {
          likes: true,
        },
      },
    } satisfies Prisma.CommentSelect;
  }

  private serializeComment(comment: CommentPayload) {
    const { _count, replies, ...rest } = comment;

    return {
      ...rest,
      isDeleted: rest.deletedAt !== null,
      likeCount: _count.likes,
      replies: replies.map((reply) => this.serializeReply(reply)),
    };
  }

  private serializeReply(reply: CommentReplyPayload) {
    const { _count, ...rest } = reply;

    return {
      ...rest,
      isDeleted: rest.deletedAt !== null,
      likeCount: _count.likes,
    };
  }

  private serializeAdminComment(comment: AdminCommentPayload) {
    const { _count, ...rest } = comment;

    return {
      ...rest,
      isDeleted: rest.deletedAt !== null,
      likeCount: _count.likes,
    };
  }

  private softDeleteComment(id: number, deletedById: number, reason?: string) {
    return this.prisma.comment.update({
      where: {
        id,
      },
      data: {
        deletedAt: new Date(),
        deletedById,
        deleteReason: reason,
      },
      select: {
        id: true,
      },
    });
  }

  private withAdminDeletedFilter(
    where: Prisma.CommentWhereInput,
    deleted: AdminDeletedFilter = 'active',
  ): Prisma.CommentWhereInput {
    if (deleted === 'all') {
      return where;
    }

    return {
      ...where,
      deletedAt: deleted === 'deleted' ? { not: null } : null,
    };
  }

  private reportSelect() {
    return {
      id: true,
      commentId: true,
      userId: true,
      reason: true,
      status: true,
      createdAt: true,
      updatedAt: true,
    } satisfies Prisma.CommentReportSelect;
  }
}
