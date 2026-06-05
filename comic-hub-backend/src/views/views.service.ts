import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ViewTargetType } from '@prisma/client';
import { createHash } from 'crypto';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import type { TrackViewInput } from './types/track-view-input.type';

@Injectable()
export class ViewsService {
  private readonly logger = new Logger(ViewsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly configService: ConfigService,
  ) {}

  async trackView(input: TrackViewInput): Promise<void> {
    try {
      const targetId = this.getTargetId(input);
      const identity = this.getIdentity(input);

      if (!targetId || !identity) {
        return;
      }

      const dedupeKey = `view:${input.targetType}:${targetId}:${identity}`;
      const exists = await this.redis.get<boolean>(dedupeKey);

      if (exists) {
        return;
      }

      const ttlSeconds = this.configService.get<number>(
        'VIEW_DEDUPE_TTL_SECONDS',
        3600,
      );

      await this.redis.set(dedupeKey, true, ttlSeconds);
      await this.createViewAndIncrement(input);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'Unknown view tracking error';
      this.logger.warn(`View tracking skipped: ${message}`);
    }
  }

  private getTargetId(input: TrackViewInput) {
    return input.targetType === 'COMIC' ? input.comicId : input.chapterId;
  }

  private getIdentity(input: TrackViewInput) {
    if (input.userId) {
      return `user:${input.userId}`;
    }

    const ipHash = this.hashIp(input.ip);
    return ipHash ? `ip:${ipHash}` : null;
  }

  private hashIp(ip?: string | null) {
    if (!ip) {
      return null;
    }

    return createHash('sha256').update(ip).digest('hex');
  }

  private async createViewAndIncrement(input: TrackViewInput) {
    const ipHash = this.hashIp(input.ip);
    const targetType =
      input.targetType === 'COMIC'
        ? ViewTargetType.COMIC
        : ViewTargetType.CHAPTER;

    await this.prisma.$transaction(async (tx) => {
      await tx.viewEvent.create({
        data: {
          targetType,
          comicId: input.comicId ?? null,
          chapterId: input.chapterId ?? null,
          userId: input.userId ?? null,
          ipHash,
          userAgent: input.userAgent?.slice(0, 500) ?? null,
        },
      });

      if (input.targetType === 'COMIC' && input.comicId) {
        await tx.comic.update({
          where: {
            id: input.comicId,
          },
          data: {
            viewTotal: {
              increment: 1,
            },
          },
        });
        return;
      }

      if (input.targetType === 'CHAPTER' && input.chapterId) {
        const chapter = await tx.chapter.update({
          where: {
            id: input.chapterId,
          },
          data: {
            viewTotal: {
              increment: 1,
            },
          },
          select: {
            comicId: true,
          },
        });

        await tx.comic.update({
          where: {
            id: input.comicId ?? chapter.comicId,
          },
          data: {
            viewTotal: {
              increment: 1,
            },
          },
        });
      }
    });
  }
}
