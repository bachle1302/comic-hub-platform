import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { ComicSort, SearchComicsQueryDto } from './dto/search-comics-query.dto';
import { SearchSuggestionsQueryDto } from './dto/search-suggestions-query.dto';

type PaginationMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

type SearchResult = {
  message: string;
  items: unknown[];
  meta: PaginationMeta;
};

type SearchSuggestion = {
  id: number;
  title: string;
  slug: string;
  thumbnail: string | null;
  authorName: string | null;
  status: string;
  latestChapterNumber: number | null;
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

const suggestionSelect = {
  id: true,
  name: true,
  slug: true,
  thumbnail: true,
  status: true,
  viewTotal: true,
  followCount: true,
  updatedAt: true,
  author: {
    select: {
      name: true,
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
    select: {
      chapterNumber: true,
    },
  },
} satisfies Prisma.ComicSelect;

type SuggestionComic = Prisma.ComicGetPayload<{
  select: typeof suggestionSelect;
}>;

@Injectable()
export class SearchService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async search(query: SearchComicsQueryDto): Promise<SearchResult> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const cacheKey = `search:comics:${this.toCacheQueryString(query)}`;
    const cached = await this.redis.get<SearchResult>(cacheKey);

    if (cached) {
      return cached;
    }

    const where = this.buildWhere(query);
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

    const result: SearchResult = {
      message: 'Comics searched successfully',
      items: items.map((item) => this.withPublicCounts(item)),
      meta: this.buildMeta(page, limit, total),
    };

    await this.redis.set(cacheKey, result, 60);

    return result;
  }

  async suggestions(
    query: SearchSuggestionsQueryDto,
  ): Promise<SearchSuggestion[]> {
    const normalizedQ = this.normalizeKeyword(query.q);

    if (!normalizedQ) {
      return [];
    }

    const limit = Math.min(query.limit ?? 8, 10);
    const cacheKey = `search:suggestions:${normalizedQ}:${limit}`;
    const cached = await this.redis.get<SearchSuggestion[]>(cacheKey);

    if (cached) {
      return cached;
    }

    const candidates = await this.prisma.comic.findMany({
      where: {
        isPublic: true,
        deletedAt: null,
        OR: [
          {
            name: {
              contains: normalizedQ,
              mode: 'insensitive',
            },
          },
          {
            slug: {
              contains: normalizedQ,
              mode: 'insensitive',
            },
          },
          {
            author: {
              name: {
                contains: normalizedQ,
                mode: 'insensitive',
              },
            },
          },
        ],
      },
      select: suggestionSelect,
      orderBy: [
        {
          viewTotal: 'desc',
        },
        {
          followCount: 'desc',
        },
        {
          updatedAt: 'desc',
        },
      ],
      take: limit * 3,
    });

    const result = candidates
      .sort(
        (left, right) =>
          this.getSuggestionRank(left, normalizedQ) -
          this.getSuggestionRank(right, normalizedQ),
      )
      .slice(0, limit)
      .map((comic) => this.toSuggestion(comic));

    await this.redis.set(cacheKey, result, 60);

    return result;
  }

  private buildWhere(query: SearchComicsQueryDto): Prisma.ComicWhereInput {
    const where: Prisma.ComicWhereInput = {
      isPublic: true,
      deletedAt: null,
    };

    if (query.q) {
      where.OR = [
        {
          name: {
            contains: query.q,
            mode: 'insensitive',
          },
        },
        {
          description: {
            contains: query.q,
            mode: 'insensitive',
          },
        },
      ];
    }

    if (query.category) {
      where.categories = {
        some: {
          category: {
            slug: query.category,
          },
        },
      };
    }

    if (query.status) {
      where.status = query.status;
    }

    return where;
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

  private toCacheQueryString(query: SearchComicsQueryDto): string {
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

  private normalizeKeyword(keyword?: string): string {
    return keyword?.trim().toLowerCase() ?? '';
  }

  private getSuggestionRank(
    comic: SuggestionComic,
    normalizedQ: string,
  ): number {
    const name = comic.name.toLowerCase();
    const slug = comic.slug.toLowerCase();
    const authorName = comic.author?.name.toLowerCase() ?? '';

    if (name === normalizedQ || slug === normalizedQ) {
      return 0;
    }

    if (name.startsWith(normalizedQ) || slug.startsWith(normalizedQ)) {
      return 1;
    }

    if (authorName.startsWith(normalizedQ)) {
      return 2;
    }

    return 3;
  }

  private toSuggestion(comic: SuggestionComic): SearchSuggestion {
    return {
      id: comic.id,
      title: comic.name,
      slug: comic.slug,
      thumbnail: comic.thumbnail,
      authorName: comic.author?.name ?? null,
      status: comic.status,
      latestChapterNumber: comic.chapters[0]?.chapterNumber ?? null,
    };
  }
}
