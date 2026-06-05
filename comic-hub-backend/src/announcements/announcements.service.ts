import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { AnnouncementTarget, Prisma } from '@prisma/client';
import { NotificationsService } from '../notifications/notifications.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { BroadcastAnnouncementDto } from './dto/broadcast-announcement.dto';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import {
  ListActiveAnnouncementsQueryDto,
  ListAnnouncementsQueryDto,
} from './dto/list-announcements-query.dto';
import { UpdateAnnouncementDto } from './dto/update-announcement.dto';

const ACTIVE_ANNOUNCEMENTS_CACHE_TTL_SECONDS = 60;
const ACTIVE_ANNOUNCEMENTS_CACHE_PATTERN = 'announcements:active:*';

const announcementSelect = {
  id: true,
  title: true,
  message: true,
  type: true,
  target: true,
  linkUrl: true,
  linkLabel: true,
  isActive: true,
  priority: true,
  startsAt: true,
  endsAt: true,
  createdById: true,
  updatedById: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.AnnouncementSelect;

type AnnouncementResult = Prisma.AnnouncementGetPayload<{
  select: typeof announcementSelect;
}>;

@Injectable()
export class AnnouncementsService {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async findActive(query: ListActiveAnnouncementsQueryDto) {
    const limit = this.normalizeLimit(query.limit, 5, 20);
    const target = query.target ?? AnnouncementTarget.GUEST;
    const cacheKey = this.buildActiveCacheKey(target, limit);
    const cached = await this.redisService.get<AnnouncementResult[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const now = new Date();
    const items = await this.prisma.announcement.findMany({
      where: {
        isActive: true,
        target: {
          in: this.buildPublicTargets(query.target),
        },
        OR: [
          {
            startsAt: null,
          },
          {
            startsAt: {
              lte: now,
            },
          },
        ],
        AND: [
          {
            OR: [
              {
                endsAt: null,
              },
              {
                endsAt: {
                  gte: now,
                },
              },
            ],
          },
        ],
      },
      take: limit,
      orderBy: [
        {
          priority: 'desc',
        },
        {
          createdAt: 'desc',
        },
      ],
      select: announcementSelect,
    });

    await this.redisService.set(
      cacheKey,
      items,
      ACTIVE_ANNOUNCEMENTS_CACHE_TTL_SECONDS,
    );

    return items;
  }

  async findAll(query: ListAnnouncementsQueryDto) {
    const page = this.normalizePage(query.page);
    const limit = this.normalizeLimit(query.limit, 20, 100);
    const skip = (page - 1) * limit;
    const where = this.buildAdminWhere(query);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.announcement.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          {
            priority: 'desc',
          },
          {
            createdAt: 'desc',
          },
        ],
        select: announcementSelect,
      }),
      this.prisma.announcement.count({
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

  async findOne(id: number) {
    const announcement = await this.prisma.announcement.findUnique({
      where: {
        id,
      },
      select: announcementSelect,
    });

    if (!announcement) {
      throw new NotFoundException('Announcement not found');
    }

    return announcement;
  }

  async create(adminId: number, dto: CreateAnnouncementDto) {
    this.validateDateRange(dto.startsAt, dto.endsAt);

    const announcement = await this.prisma.announcement.create({
      data: {
        title: dto.title,
        message: dto.message,
        type: dto.type,
        target: dto.target,
        linkUrl: dto.linkUrl,
        linkLabel: dto.linkLabel,
        isActive: dto.isActive,
        priority: dto.priority,
        startsAt: this.parseOptionalDate(dto.startsAt),
        endsAt: this.parseOptionalDate(dto.endsAt),
        createdById: adminId,
        updatedById: adminId,
      },
      select: announcementSelect,
    });

    await this.clearActiveCache();

    return announcement;
  }

  async update(id: number, adminId: number, dto: UpdateAnnouncementDto) {
    const existing = await this.findOne(id);
    const startsAt = dto.startsAt ?? existing.startsAt?.toISOString();
    const endsAt = dto.endsAt ?? existing.endsAt?.toISOString();
    this.validateDateRange(startsAt, endsAt);

    const announcement = await this.prisma.announcement.update({
      where: {
        id,
      },
      data: {
        title: dto.title,
        message: dto.message,
        type: dto.type,
        target: dto.target,
        linkUrl: dto.linkUrl,
        linkLabel: dto.linkLabel,
        isActive: dto.isActive,
        priority: dto.priority,
        startsAt:
          dto.startsAt === undefined
            ? undefined
            : this.parseOptionalDate(dto.startsAt),
        endsAt:
          dto.endsAt === undefined
            ? undefined
            : this.parseOptionalDate(dto.endsAt),
        updatedById: adminId,
      },
      select: announcementSelect,
    });

    await this.clearActiveCache();

    return announcement;
  }

  async remove(id: number, adminId: number) {
    const existing = await this.findOne(id);
    const announcement = await this.prisma.announcement.update({
      where: {
        id,
      },
      data: {
        isActive: false,
        updatedById: adminId,
      },
      select: announcementSelect,
    });

    await this.clearActiveCache();

    return {
      message: 'Announcement disabled successfully',
      announcement,
      previousIsActive: existing.isActive,
    };
  }

  async broadcast(id: number, dto: BroadcastAnnouncementDto) {
    const announcement = await this.findOne(id);
    const target = dto.target ?? AnnouncementTarget.AUTHENTICATED;
    const users = await this.prisma.user.findMany({
      where: {
        bannedAt: null,
      },
      select: {
        id: true,
      },
    });

    if (users.length === 0) {
      return {
        createdCount: 0,
        target,
      };
    }

    const result = await this.notificationsService.createSystemNotifications(
      users.map((user) => user.id),
      {
        title: announcement.title,
        message: announcement.message,
        targetUrl: announcement.linkUrl ?? '/',
      },
    );

    return {
      createdCount: result.createdCount,
      target,
    };
  }

  async clearActiveCache() {
    await this.redisService.delByPattern(ACTIVE_ANNOUNCEMENTS_CACHE_PATTERN);
  }

  private buildAdminWhere(
    query: ListAnnouncementsQueryDto,
  ): Prisma.AnnouncementWhereInput {
    const trimmedQuery = query.q?.trim();

    return {
      type: query.type,
      target: query.target,
      isActive: query.isActive,
      OR: trimmedQuery
        ? [
            {
              title: {
                contains: trimmedQuery,
                mode: 'insensitive',
              },
            },
            {
              message: {
                contains: trimmedQuery,
                mode: 'insensitive',
              },
            },
          ]
        : undefined,
    };
  }

  private buildActiveCacheKey(
    target: AnnouncementTarget,
    limit: number,
  ): string {
    return `announcements:active:${target}:${limit}`;
  }

  private buildPublicTargets(
    target?: AnnouncementTarget,
  ): AnnouncementTarget[] {
    if (!target) {
      return [AnnouncementTarget.ALL, AnnouncementTarget.GUEST];
    }

    if (target === AnnouncementTarget.ALL) {
      return [AnnouncementTarget.ALL];
    }

    return [AnnouncementTarget.ALL, target];
  }

  private normalizePage(page?: number) {
    if (!page || !Number.isFinite(page)) {
      return 1;
    }

    return Math.max(Math.trunc(page), 1);
  }

  private normalizeLimit(
    limit: number | undefined,
    defaultLimit: number,
    max: number,
  ) {
    if (!limit || !Number.isFinite(limit)) {
      return defaultLimit;
    }

    return Math.min(Math.max(Math.trunc(limit), 1), max);
  }

  private parseOptionalDate(value?: string): Date | undefined {
    return value ? new Date(value) : undefined;
  }

  private validateDateRange(startsAt?: string, endsAt?: string) {
    if (!startsAt || !endsAt) {
      return;
    }

    const startDate = new Date(startsAt);
    const endDate = new Date(endsAt);

    if (startDate.getTime() > endDate.getTime()) {
      throw new BadRequestException('startsAt must be before endsAt');
    }
  }
}
