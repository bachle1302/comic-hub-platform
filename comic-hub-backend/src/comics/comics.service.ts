import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import {
  ComicRankingPeriod,
  ComicRankingQueryDto,
  ComicRankingType,
} from './dto/comic-ranking-query.dto';
import { ViewsService } from '../views/views.service';

const comicListInclude = {
  author: true,
  categories: {
    include: {
      category: true,
    },
  },
  chapters: {
    where: {
      isPublic: true,
      deletedAt: null,
    },
    orderBy: {
      chapterNumber: 'desc',
    },
    take: 1,
  },
  _count: {
    select: {
      follows: true,
      likes: true,
    },
  },
} satisfies Prisma.ComicInclude;

const comicDetailInclude = {
  author: true,
  categories: {
    include: {
      category: true,
    },
  },
  chapters: {
    where: {
      isPublic: true,
      deletedAt: null,
    },
    orderBy: {
      chapterNumber: 'desc',
    },
    select: {
      id: true,
      name: true,
      chapterNumber: true,
      price: true,
      isPublic: true,
      viewTotal: true,
      createdAt: true,
      updatedAt: true,
    },
  },
  _count: {
    select: {
      follows: true,
      likes: true,
    },
  },
} satisfies Prisma.ComicInclude;

type ComicWithCounts = {
  _count?: {
    follows?: number;
    likes?: number;
  };
  followCount?: number;
};

type RankingWhereInput = Prisma.ComicWhereInput;

type ViewContext = {
  ip?: string | null;
  userAgent?: string | null;
  userId?: number | null;
};

type CachedComicDetail = {
  id: number;
};

type CachedChapterReader = {
  id: number;
  comicId: number;
  price: number;
};

@Injectable()
export class ComicsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly viewsService: ViewsService,
  ) {}

  async findAll() {
    const cacheKey = 'comics:all';

    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return cached;
    }

    const comics = await this.prisma.comic.findMany({
      where: {
        isPublic: true,
        deletedAt: null,
      },
      orderBy: {
        updatedAt: 'desc',
      },
      include: comicListInclude,
    });
    const result = comics.map((comic) => this.withPublicCounts(comic));

    await this.redis.set(cacheKey, result, 60);

    return result;
  }

  async findLatest() {
    const cacheKey = 'comics:latest';

    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return cached;
    }

    const comics = await this.prisma.comic.findMany({
      where: {
        isPublic: true,
        deletedAt: null,
      },
      orderBy: {
        lastChapterAt: 'desc',
      },
      take: 20,
      include: comicListInclude,
    });
    const result = comics.map((comic) => this.withPublicCounts(comic));

    await this.redis.set(cacheKey, result, 60);

    return result;
  }

  async findHot() {
    const cacheKey = 'comics:hot';

    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return cached;
    }

    const comics = await this.prisma.comic.findMany({
      where: {
        isPublic: true,
        deletedAt: null,
      },
      orderBy: {
        viewTotal: 'desc',
      },
      take: 20,
      include: comicListInclude,
    });
    const result = comics.map((comic) => this.withPublicCounts(comic));

    await this.redis.set(cacheKey, result, 60);

    return result;
  }

  async findRanking(query: ComicRankingQueryDto) {
    const type = query.type ?? ComicRankingType.HOT;
    const period = query.period ?? ComicRankingPeriod.ALL;
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const cacheKey = `comics:ranking:${type}:${period}:${page}:${limit}`;

    const cached = await this.redis.get(cacheKey);
    if (cached) {
      return cached;
    }

    if (
      period !== ComicRankingPeriod.ALL &&
      (type === ComicRankingType.VIEWS || type === ComicRankingType.HOT)
    ) {
      const result = await this.findViewEventRanking(type, period, page, limit);
      await this.redis.set(cacheKey, result, 60);

      return result;
    }

    const where = this.buildRankingWhere(period);
    const orderBy = this.buildRankingOrderBy(type);
    const skip = (page - 1) * limit;
    const [total, comics] = await Promise.all([
      this.prisma.comic.count({ where }),
      this.prisma.comic.findMany({
        where,
        orderBy,
        skip,
        take: limit,
        include: comicListInclude,
      }),
    ]);
    const totalPages = Math.ceil(total / limit);
    const result = {
      items: comics.map((comic) => this.withPublicCounts(comic)),
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };

    await this.redis.set(cacheKey, result, 60);

    return result;
  }

  async findBySlug(slug: string, viewContext?: ViewContext) {
    const cacheKey = `comics:detail:${slug}`;

    const cached = await this.redis.get<CachedComicDetail>(cacheKey);
    if (cached) {
      this.trackComicView(cached.id, viewContext);
      return cached;
    }

    const comic = await this.prisma.comic.findUnique({
      where: {
        slug,
      },
      include: comicDetailInclude,
    });

    if (!comic || !comic.isPublic || comic.deletedAt !== null) {
      throw new NotFoundException('Comic not found');
    }

    const result = this.withPublicCounts(comic);

    await this.redis.set(cacheKey, result, 60);
    this.trackComicView(comic.id, viewContext);

    return result;
  }

  async likeComic(anonymousId: string, comicId: number) {
    const comic = await this.ensurePublicComic(comicId);

    await this.prisma.comicLike.upsert({
      where: {
        comicId_anonymousId: {
          comicId,
          anonymousId,
        },
      },
      update: {},
      create: {
        comicId,
        anonymousId,
      },
    });

    await this.clearLikeCache(comic.slug);

    return {
      isLiked: true,
      likeCount: await this.getComicLikeCount(comicId),
    };
  }

  async unlikeComic(anonymousId: string, comicId: number) {
    const comic = await this.ensurePublicComic(comicId);

    await this.prisma.comicLike.deleteMany({
      where: {
        comicId,
        anonymousId,
      },
    });

    await this.clearLikeCache(comic.slug);

    return {
      isLiked: false,
      likeCount: await this.getComicLikeCount(comicId),
    };
  }

  async getLikeStatus(anonymousId: string, comicId: number) {
    await this.ensurePublicComic(comicId);

    const like = await this.prisma.comicLike.findUnique({
      where: {
        comicId_anonymousId: {
          comicId,
          anonymousId,
        },
      },
      select: {
        id: true,
      },
    });

    return {
      isLiked: Boolean(like),
      likeCount: await this.getComicLikeCount(comicId),
    };
  }

  async getBatchLikeStatus(anonymousId: string, comicIds: number[]) {
    const uniqueComicIds = Array.from(new Set(comicIds));

    if (uniqueComicIds.length === 0) {
      return {
        items: [],
      };
    }

    const likes = await this.prisma.comicLike.findMany({
      where: {
        anonymousId,
        comicId: {
          in: uniqueComicIds,
        },
        comic: {
          isPublic: true,
          deletedAt: null,
        },
      },
      select: {
        comicId: true,
      },
    });
    const likedComicIds = new Set(likes.map((like) => like.comicId));

    return {
      items: uniqueComicIds.map((comicId) => ({
        comicId,
        isLiked: likedComicIds.has(comicId),
      })),
    };
  }

  async findChapter(
    comicSlug: string,
    chapterNumber: number,
    viewContext?: ViewContext,
  ) {
    const cacheKey = `comics:chapter:${comicSlug}:${chapterNumber}`;

    const cached = await this.redis.get<CachedChapterReader>(cacheKey);
    if (cached) {
      if (cached.price <= 0) {
        this.trackChapterView(cached.comicId, cached.id, viewContext);
      }
      return cached;
    }

    const comic = await this.prisma.comic.findUnique({
      where: {
        slug: comicSlug,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        isPublic: true,
        deletedAt: true,
      },
    });

    if (!comic || !comic.isPublic || comic.deletedAt !== null) {
      throw new NotFoundException('Comic not found');
    }

    const chapter = await this.prisma.chapter.findFirst({
      where: {
        comicId: comic.id,
        chapterNumber,
        isPublic: true,
        deletedAt: null,
      },
      include: {
        images: {
          orderBy: {
            order: 'asc',
          },
        },
        comic: {
          select: {
            id: true,
            name: true,
            slug: true,
            thumbnail: true,
          },
        },
      },
    });

    if (!chapter) {
      throw new NotFoundException('Chapter not found');
    }

    const previousChapter = await this.prisma.chapter.findFirst({
      where: {
        comicId: comic.id,
        chapterNumber: {
          lt: chapterNumber,
        },
        isPublic: true,
        deletedAt: null,
      },
      orderBy: {
        chapterNumber: 'desc',
      },
      select: {
        chapterNumber: true,
        name: true,
      },
    });

    const nextChapter = await this.prisma.chapter.findFirst({
      where: {
        comicId: comic.id,
        chapterNumber: {
          gt: chapterNumber,
        },
        isPublic: true,
        deletedAt: null,
      },
      orderBy: {
        chapterNumber: 'asc',
      },
      select: {
        chapterNumber: true,
        name: true,
      },
    });

    const isFree = chapter.price <= 0;
    const result = {
      ...chapter,
      images: isFree ? chapter.images : [],
      navigation: {
        previousChapter,
        nextChapter,
      },
      access: {
        hasAccess: isFree,
        isFree,
        isPurchased: false,
        price: chapter.price,
      },
    };

    await this.redis.set(cacheKey, result, 120);
    if (isFree) {
      this.trackChapterView(comic.id, chapter.id, viewContext);
    }

    return result;
  }

  async clearComicCache(slug?: string) {
    await this.redis.del('comics:all');
    await this.redis.del('comics:latest');
    await this.redis.del('comics:hot');
    await this.redis.delByPattern('comics:ranking:*');

    if (slug) {
      await this.redis.del(`comics:detail:${slug}`);
      await this.redis.delByPattern(`comics:chapter:${slug}:*`);
    }
  }

  private async ensurePublicComic(comicId: number) {
    const comic = await this.prisma.comic.findUnique({
      where: {
        id: comicId,
      },
      select: {
        id: true,
        slug: true,
        isPublic: true,
        deletedAt: true,
      },
    });

    if (!comic || !comic.isPublic || comic.deletedAt !== null) {
      throw new NotFoundException('Comic not found');
    }

    return comic;
  }

  private async getComicLikeCount(comicId: number) {
    return this.prisma.comicLike.count({
      where: {
        comicId,
      },
    });
  }

  private async clearLikeCache(slug: string) {
    await this.redis.del('comics:all');
    await this.redis.del('comics:latest');
    await this.redis.del('comics:hot');
    await this.redis.delByPattern('comics:ranking:*');
    await this.redis.del(`comics:detail:${slug}`);
    await this.redis.delByPattern('search:comics:*');
    await this.redis.delByPattern('categories:*:comics:*');
    await this.redis.delByPattern('authors:*:comics:*');
  }

  private withPublicCounts<TComic extends ComicWithCounts>(comic: TComic) {
    return {
      ...comic,
      followCount: comic.followCount ?? comic._count?.follows ?? 0,
      likeCount: comic._count?.likes ?? 0,
    };
  }

  private buildRankingWhere(period: ComicRankingPeriod): RankingWhereInput {
    const where: RankingWhereInput = {
      isPublic: true,
      deletedAt: null,
    };
    const cutoff = this.getRankingCutoff(period);

    if (cutoff) {
      where.OR = [
        {
          lastChapterAt: {
            gte: cutoff,
          },
        },
        {
          updatedAt: {
            gte: cutoff,
          },
        },
      ];
    }

    return where;
  }

  private getRankingCutoff(period: ComicRankingPeriod) {
    if (period === ComicRankingPeriod.ALL) {
      return null;
    }

    const now = new Date();
    const days =
      period === ComicRankingPeriod.DAY
        ? 1
        : period === ComicRankingPeriod.WEEK
          ? 7
          : 30;

    return new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  }

  private buildRankingOrderBy(
    type: ComicRankingType,
  ): Prisma.ComicOrderByWithRelationInput[] {
    if (type === ComicRankingType.LIKES) {
      return [
        {
          likes: {
            _count: 'desc',
          },
        },
        {
          viewTotal: 'desc',
        },
      ];
    }

    if (type === ComicRankingType.FOLLOWS) {
      return [
        {
          follows: {
            _count: 'desc',
          },
        },
        {
          viewTotal: 'desc',
        },
      ];
    }

    if (type === ComicRankingType.LATEST) {
      return [
        {
          lastChapterAt: 'desc',
        },
        {
          updatedAt: 'desc',
        },
      ];
    }

    return [
      {
        viewTotal: 'desc',
      },
      {
        followCount: 'desc',
      },
    ];
  }

  private async findViewEventRanking(
    type: ComicRankingType,
    period: ComicRankingPeriod,
    page: number,
    limit: number,
  ) {
    const cutoff = this.getRankingCutoff(period);
    const where: Prisma.ViewEventWhereInput = {
      comicId: {
        not: null,
      },
      comic: {
        isPublic: true,
        deletedAt: null,
      },
      createdAt: cutoff
        ? {
            gte: cutoff,
          }
        : undefined,
    };
    const skip = (page - 1) * limit;
    const groupedViews = await this.prisma.viewEvent.groupBy({
      by: ['comicId'],
      where,
      _count: {
        comicId: true,
      },
      orderBy: {
        _count: {
          comicId: 'desc',
        },
      },
      skip,
      take: limit,
    });
    const totalGroups = await this.prisma.viewEvent.groupBy({
      by: ['comicId'],
      where,
      _count: {
        comicId: true,
      },
    });
    const comicIds = groupedViews
      .map((item) => item.comicId)
      .filter((comicId): comicId is number => comicId !== null);
    const comics =
      comicIds.length === 0
        ? []
        : await this.prisma.comic.findMany({
            where: {
              id: {
                in: comicIds,
              },
              isPublic: true,
              deletedAt: null,
            },
            include: comicListInclude,
          });
    const comicById = new Map(comics.map((comic) => [comic.id, comic]));
    const items = comicIds
      .map((comicId) => comicById.get(comicId))
      .filter((comic): comic is NonNullable<typeof comic> => Boolean(comic))
      .map((comic) => this.withPublicCounts(comic));
    const total = totalGroups.length;
    const totalPages = Math.ceil(total / limit);

    if (type === ComicRankingType.HOT) {
      items.sort((left, right) => {
        const leftScore =
          left.viewTotal + left.likeCount * 3 + left.followCount * 5;
        const rightScore =
          right.viewTotal + right.likeCount * 3 + right.followCount * 5;

        return rightScore - leftScore;
      });
    }

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

  private trackComicView(comicId: number, viewContext?: ViewContext) {
    void this.viewsService.trackView({
      targetType: 'COMIC',
      comicId,
      userId: viewContext?.userId,
      ip: viewContext?.ip,
      userAgent: viewContext?.userAgent,
    });
  }

  private trackChapterView(
    comicId: number,
    chapterId: number,
    viewContext?: ViewContext,
  ) {
    void this.viewsService.trackView({
      targetType: 'CHAPTER',
      comicId,
      chapterId,
      userId: viewContext?.userId,
      ip: viewContext?.ip,
      userAgent: viewContext?.userAgent,
    });
  }
}
