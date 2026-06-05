import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { ComicSort } from '../search/dto/search-comics-query.dto';
import { CategoryComicsQueryDto } from './dto/category-comics-query.dto';

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

type CategoriesResult = {
  message: string;
  categories: unknown[];
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
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async findAll(): Promise<CategoriesResult> {
    const cacheKey = 'categories:all';
    const cached = await this.redis.get<CategoriesResult>(cacheKey);

    if (cached) {
      return cached;
    }

    const categories = await this.prisma.category.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: {
            comics: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    const result: CategoriesResult = {
      message: 'Categories fetched successfully',
      categories,
    };

    await this.redis.set(cacheKey, result, 60);

    return result;
  }

  async findComicsBySlug(
    slug: string,
    query: CategoryComicsQueryDto,
  ): Promise<ComicsResult> {
    const category = await this.prisma.category.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const cacheKey = `categories:${slug}:comics:${this.toCacheQueryString(query)}`;
    const cached = await this.redis.get<ComicsResult>(cacheKey);

    if (cached) {
      return cached;
    }

    const where: Prisma.ComicWhereInput = {
      isPublic: true,
      deletedAt: null,
      categories: {
        some: {
          categoryId: category.id,
        },
      },
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
      message: 'Category comics fetched successfully',
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

  private toCacheQueryString(query: CategoryComicsQueryDto): string {
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
