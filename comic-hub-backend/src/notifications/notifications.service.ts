import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { NotificationType, Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import {
  NotificationPayload,
  NotificationsGateway,
} from './notifications.gateway';

type PaginationInput = {
  limit?: number;
  page?: number;
  unreadOnly?: boolean;
};

type CreateNewChapterNotificationsInput = {
  chapterId: number;
  chapterName: string;
  chapterNumber: number;
  comicId: number;
  comicName: string;
  comicSlug: string;
};

type NotifyCommentCreatedInput = {
  actorUserId: number;
  chapterId?: number | null;
  comicId?: number | null;
  commentId: number;
  parentId?: number | null;
};

type CreateSystemNotificationsInput = {
  message?: string | null;
  targetUrl: string;
  title: string;
};

const notificationSelect = {
  id: true,
  userId: true,
  type: true,
  title: true,
  message: true,
  targetUrl: true,
  isRead: true,
  comicId: true,
  chapterId: true,
  createdAt: true,
  updatedAt: true,
  comic: {
    select: {
      id: true,
      name: true,
      slug: true,
      thumbnail: true,
    },
  },
  chapter: {
    select: {
      id: true,
      name: true,
      chapterNumber: true,
    },
  },
} satisfies Prisma.NotificationSelect;

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly notificationsGateway: NotificationsGateway,
  ) {}

  async findMine(userId: number, pagination: PaginationInput) {
    const page = this.normalizePage(pagination.page);
    const limit = this.normalizeLimit(pagination.limit);
    const skip = (page - 1) * limit;
    const where: Prisma.NotificationWhereInput = {
      userId,
      ...(pagination.unreadOnly ? { isRead: false } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.notification.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        select: notificationSelect,
      }),
      this.prisma.notification.count({
        where,
      }),
    ]);
    const totalPages = Math.ceil(total / limit);

    return {
      items,
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

  async getUnreadCount(userId: number) {
    const count = await this.prisma.notification.count({
      where: {
        userId,
        isRead: false,
      },
    });

    return {
      count,
    };
  }

  async markAsRead(userId: number, id: number) {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    return this.prisma.notification.update({
      where: {
        id,
      },
      data: {
        isRead: true,
      },
      select: notificationSelect,
    });
  }

  async markAllAsRead(userId: number) {
    const result = await this.prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return {
      updatedCount: result.count,
    };
  }

  async deleteNotification(userId: number, id: number) {
    const notification = await this.prisma.notification.findFirst({
      where: {
        id,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    await this.prisma.notification.delete({
      where: {
        id,
      },
    });

    return {
      message: 'Notification deleted successfully',
    };
  }

  async createNewChapterNotifications(
    input: CreateNewChapterNotificationsInput,
  ) {
    const followers = await this.prisma.follow.findMany({
      where: {
        comicId: input.comicId,
      },
      select: {
        userId: true,
      },
    });

    if (followers.length === 0) {
      return {
        createdCount: 0,
      };
    }

    const notifications = await Promise.all(
      followers.map((follow) =>
        this.prisma.notification.upsert({
          where: {
            userId_type_chapterId: {
              userId: follow.userId,
              type: NotificationType.NEW_CHAPTER,
              chapterId: input.chapterId,
            },
          },
          update: {},
          create: {
            userId: follow.userId,
            type: NotificationType.NEW_CHAPTER,
            title: `${input.comicName} co chuong moi`,
            message: `${input.chapterName} da duoc cap nhat.`,
            targetUrl: `/truyen/${input.comicSlug}/chapter/${input.chapterNumber}`,
            comicId: input.comicId,
            chapterId: input.chapterId,
          },
          select: notificationSelect,
        }),
      ),
    );

    for (const notification of notifications) {
      this.notificationsGateway.emitNotificationToUser(
        notification.userId,
        this.toRealtimePayload(notification),
      );
    }

    return {
      createdCount: notifications.length,
    };
  }

  async createSystemNotifications(
    userIds: number[],
    input: CreateSystemNotificationsInput,
  ) {
    const uniqueUserIds = Array.from(new Set(userIds));

    if (uniqueUserIds.length === 0) {
      return {
        createdCount: 0,
      };
    }

    const notifications = await Promise.all(
      uniqueUserIds.map((userId) =>
        this.prisma.notification.create({
          data: {
            userId,
            type: NotificationType.SYSTEM,
            title: input.title,
            message: input.message,
            targetUrl: input.targetUrl,
          },
          select: notificationSelect,
        }),
      ),
    );

    for (const notification of notifications) {
      this.notificationsGateway.emitNotificationToUser(
        notification.userId,
        this.toRealtimePayload(notification),
      );
    }

    return {
      createdCount: notifications.length,
    };
  }

  async notifyCommentCreated(input: NotifyCommentCreatedInput): Promise<void> {
    try {
      if (input.parentId) {
        await this.notifyReplyComment(input);
        return;
      }

      await this.notifyCommentOnFollowedComic(input);
    } catch (error) {
      this.logger.warn(
        error instanceof Error
          ? `Failed to create comment notification: ${error.message}`
          : 'Failed to create comment notification',
      );
    }
  }

  private async notifyReplyComment(input: NotifyCommentCreatedInput) {
    if (!input.parentId) {
      return;
    }

    const parent = await this.prisma.comment.findUnique({
      where: {
        id: input.parentId,
      },
      select: {
        userId: true,
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
            chapterNumber: true,
          },
        },
      },
    });

    if (!parent || parent.userId === input.actorUserId) {
      return;
    }

    const targetUrl = this.buildNotificationUrl(
      parent.comic.slug,
      parent.chapter?.chapterNumber ?? null,
    );

    const notification = await this.prisma.notification.create({
      data: {
        userId: parent.userId,
        type: NotificationType.REPLY_COMMENT,
        title: 'Co phan hoi moi cho binh luan cua ban',
        message: 'Mot nguoi dung da tra loi binh luan cua ban.',
        targetUrl,
        comicId: parent.comic.id,
      },
      select: notificationSelect,
    });

    this.notificationsGateway.emitNotificationToUser(
      notification.userId,
      this.toRealtimePayload(notification),
    );
  }

  private async notifyCommentOnFollowedComic(input: NotifyCommentCreatedInput) {
    const target = await this.resolveCommentNotificationTarget(input);

    if (!target) {
      return;
    }

    const followers = await this.prisma.follow.findMany({
      where: {
        comicId: target.comicId,
        userId: {
          not: input.actorUserId,
        },
      },
      select: {
        userId: true,
      },
    });

    if (followers.length === 0) {
      return;
    }

    const notifications = await Promise.all(
      followers.map((follow) =>
        this.prisma.notification.create({
          data: {
            userId: follow.userId,
            type: NotificationType.COMMENT,
            title: `${target.comicName} co binh luan moi`,
            message: target.chapterNumber
              ? `Co binh luan moi o chapter ${target.chapterNumber}.`
              : `Co binh luan moi o truyen ${target.comicName}.`,
            targetUrl: this.buildNotificationUrl(
              target.comicSlug,
              target.chapterNumber,
            ),
            comicId: target.comicId,
          },
          select: notificationSelect,
        }),
      ),
    );

    for (const notification of notifications) {
      this.notificationsGateway.emitNotificationToUser(
        notification.userId,
        this.toRealtimePayload(notification),
      );
    }
  }

  private async resolveCommentNotificationTarget(
    input: NotifyCommentCreatedInput,
  ) {
    if (input.chapterId) {
      const chapter = await this.prisma.chapter.findUnique({
        where: {
          id: input.chapterId,
        },
        select: {
          chapterNumber: true,
          comic: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
        },
      });

      if (!chapter) {
        return null;
      }

      return {
        chapterNumber: chapter.chapterNumber,
        comicId: chapter.comic.id,
        comicName: chapter.comic.name,
        comicSlug: chapter.comic.slug,
      };
    }

    if (!input.comicId) {
      return null;
    }

    const comic = await this.prisma.comic.findUnique({
      where: {
        id: input.comicId,
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
    });

    if (!comic) {
      return null;
    }

    return {
      chapterNumber: null,
      comicId: comic.id,
      comicName: comic.name,
      comicSlug: comic.slug,
    };
  }

  private buildNotificationUrl(
    comicSlug: string,
    chapterNumber: number | null,
  ): string {
    if (chapterNumber === null) {
      return `/truyen/${comicSlug}`;
    }

    return `/truyen/${comicSlug}/chapter/${chapterNumber}`;
  }

  private normalizePage(page?: number) {
    if (!page || !Number.isFinite(page)) {
      return 1;
    }

    return Math.max(Math.trunc(page), 1);
  }

  private normalizeLimit(limit?: number) {
    if (!limit || !Number.isFinite(limit)) {
      return 10;
    }

    return Math.min(Math.max(Math.trunc(limit), 1), 50);
  }

  private toRealtimePayload(
    notification: Prisma.NotificationGetPayload<{
      select: typeof notificationSelect;
    }>,
  ): NotificationPayload {
    return {
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      url: notification.targetUrl,
      isRead: notification.isRead,
      createdAt: notification.createdAt.toISOString(),
    };
  }
}
