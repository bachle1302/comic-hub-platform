import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { ComicSort } from '../search/dto/search-comics-query.dto';
import { AuthorComicsQueryDto } from './dto/author-comics-query.dto';

type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

type ComicsResult = {
  message: string;
  items: unknown[];
  meta: PaginationMeta;
};

type ComicWithCounts = {
  _count?: {
    follows?: number;
    likes?: number;
  };
  followCount?: number;
};

const comicInclude = {
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
} as const;

@Injectable()
export class AuthorsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async findComicsBySlug(
    slug: string,
    query: AuthorComicsQueryDto,
  ): Promise<ComicsResult> {
    const author = await this.prisma.author.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
      },
    });

    if (!author) {
      throw new NotFoundException('Author not found');
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const cacheKey = `authors:${slug}:comics:${this.toCacheQueryString(query)}`;
    const cached = await this.redis.get<ComicsResult>(cacheKey);

    if (cached) {
      return cached;
    }

    const where: Prisma.ComicWhereInput = {
      isPublic: true,
      deletedAt: null,
      authorId: author.id,
      ...(query.status ? { status: query.status } : {}),
    };

    const [items, total] = await this.prisma.$transaction([
      this.prisma.comic.findMany({
        where,
        include: comicInclude,
        orderBy: this.getOrderBy(query.sort),
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.comic.count({
        where,
      }),
    ]);

    const result: ComicsResult = {
      message: 'Author comics fetched successfully',
      items: items.map((item) => this.withPublicCounts(item)),
      meta: this.buildMeta(page, limit, total),
    };

    await this.redis.set(cacheKey, result, 60);

    return result;
  }

  private getOrderBy(sort?: ComicSort): Prisma.ComicOrderByWithRelationInput {
    switch (sort ?? ComicSort.Latest) {
      case ComicSort.Hot:
        return {
          viewTotal: 'desc',
        };
      case ComicSort.Newest:
        return {
          createdAt: 'desc',
        };
      case ComicSort.Name:
        return {
          name: 'asc',
        };
      case ComicSort.Latest:
      default:
        return {
          lastChapterAt: 'desc',
        };
    }
  }

  private buildMeta(
    page: number,
    limit: number,
    total: number,
  ): PaginationMeta {
    const totalPages = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    };
  }

  private toCacheQueryString(query: AuthorComicsQueryDto): string {
    const params = new URLSearchParams();
    const entries = Object.entries(query).sort(([left], [right]) =>
      left.localeCompare(right),
    );

    for (const [key, value] of entries) {
      if (value !== undefined && value !== null && value !== '') {
        params.set(key, String(value));
      }
    }

    return params.toString() || 'default';
  }

  private withPublicCounts<TComic extends ComicWithCounts>(comic: TComic) {
    return {
      ...comic,
      followCount: comic.followCount ?? comic._count?.follows ?? 0,
      likeCount: comic._count?.likes ?? 0,
    };
  }
}
