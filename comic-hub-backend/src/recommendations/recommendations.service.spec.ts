import { Test, TestingModule } from '@nestjs/testing';
import { RecommendationsService } from './recommendations.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

// ---------------------------------------------------------------------------
// Minimal mocks
// ---------------------------------------------------------------------------

const mockComic = (
  overrides: Partial<{
    id: number;
    isPublic: boolean;
    deletedAt: null | Date;
    followCount: number;
    viewTotal: number;
    lastChapterAt: Date | null;
  }> = {},
) => ({
  id: 1,
  name: 'Demo Comic',
  slug: 'demo-comic',
  thumbnail: null,
  status: 'ONGOING',
  viewTotal: overrides.viewTotal ?? 100,
  followCount: overrides.followCount ?? 10,
  lastChapterAt: overrides.lastChapterAt ?? null,
  isPublic: overrides.isPublic ?? true,
  deletedAt: overrides.deletedAt ?? null,
  author: { id: 1, name: 'Author One', slug: 'author-one' },
  categories: [{ category: { id: 1, name: 'Action', slug: 'action' } }],
  _count: { likes: 5 },
  chapters: [{ chapterNumber: 3 }],
});

const makeRedis = (cached: unknown = null): Partial<RedisService> => ({
  get: jest.fn().mockResolvedValue(cached),
  set: jest.fn().mockResolvedValue(undefined),
});

const makePrisma = (
  comics: ReturnType<typeof mockComic>[] = [mockComic()],
): Partial<PrismaService> => ({
  comic: {
    findMany: jest.fn().mockResolvedValue(comics),
    findUnique: jest.fn().mockResolvedValue(null),
  } as unknown as PrismaService['comic'],
  history: {
    findMany: jest.fn().mockResolvedValue([]),
  } as unknown as PrismaService['history'],
  follow: {
    findMany: jest.fn().mockResolvedValue([]),
  } as unknown as PrismaService['follow'],
  comicLike: {
    findMany: jest.fn().mockResolvedValue([]),
  } as unknown as PrismaService['comicLike'],
  purchase: {
    findMany: jest.fn().mockResolvedValue([]),
  } as unknown as PrismaService['purchase'],
  comment: {
    findMany: jest.fn().mockResolvedValue([]),
  } as unknown as PrismaService['comment'],
});

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('RecommendationsService', () => {
  let service: RecommendationsService;

  const buildModule = async (
    prismaPartial: Partial<PrismaService>,
    redisPartial: Partial<RedisService>,
  ) => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RecommendationsService,
        { provide: PrismaService, useValue: prismaPartial },
        { provide: RedisService, useValue: redisPartial },
      ],
    }).compile();
    return module.get<RecommendationsService>(RecommendationsService);
  };

  describe('getHomeRecommendations', () => {
    it('returns items from public comics', async () => {
      const prisma = makePrisma([mockComic()]);
      const redis = makeRedis();
      service = await buildModule(prisma, redis);

      const result = await service.getHomeRecommendations(12);

      expect(result.items).toHaveLength(1);
      expect(result.items[0].slug).toBe('demo-comic');
    });

    it('returns items with a reasons array', async () => {
      const prisma = makePrisma([mockComic()]);
      const redis = makeRedis();
      service = await buildModule(prisma, redis);

      const result = await service.getHomeRecommendations(12);

      expect(result.items[0].reasons.length).toBeGreaterThan(0);
    });

    it('respects limit: returns at most limit items', async () => {
      const comics = Array.from({ length: 20 }, (_, i) =>
        mockComic({ id: i + 1 }),
      );
      const prisma = makePrisma(comics);
      const redis = makeRedis();
      service = await buildModule(prisma, redis);

      const result = await service.getHomeRecommendations(5);

      expect(result.items.length).toBeLessThanOrEqual(5);
      expect(result.meta.limit).toBe(5);
    });

    it('returns cached result when cache hit', async () => {
      const cachedResult = {
        items: [
          {
            id: 99,
            title: 'Cached',
            slug: 'cached',
            reasons: ['cached'],
          } as unknown,
        ],
        meta: { total: 1, limit: 12 },
      };
      const prisma = makePrisma();
      const redis = makeRedis(cachedResult);
      service = await buildModule(prisma, redis);

      const result = await service.getHomeRecommendations(12);

      expect(result).toEqual(cachedResult);
      // Should NOT have called prisma when cache hits
      expect(
        (prisma.comic as { findMany: jest.Mock }).findMany,
      ).not.toHaveBeenCalled();
    });
  });

  describe('getUserRecommendations', () => {
    it('excludes already-read comics via negative score', async () => {
      const comic = mockComic({ id: 42 });
      const prisma = makePrisma([comic]);
      (prisma.history as { findMany: jest.Mock }).findMany = jest
        .fn()
        .mockResolvedValue([
          {
            comicId: 42,
            comic: { author: null, categories: [] },
          },
        ]);
      const redis = makeRedis();
      service = await buildModule(prisma, redis);

      const result = await service.getUserRecommendations(1, 12);

      // The comic gets a -20 penalty for being already read; score should be <= 0
      expect(result.items[0].score).toBeLessThanOrEqual(0);
    });

    it('returns reasons array for each item', async () => {
      const prisma = makePrisma([mockComic()]);
      const redis = makeRedis();
      service = await buildModule(prisma, redis);

      const result = await service.getUserRecommendations(1, 12);

      for (const item of result.items) {
        expect(Array.isArray(item.reasons)).toBe(true);
        expect(item.reasons.length).toBeGreaterThan(0);
      }
    });
  });

  describe('getSimilarComics', () => {
    it('does not include source comic in results', async () => {
      const sourceMock = {
        id: 1,
        author: { id: 10 },
        categories: [{ categoryId: 1 }],
      };
      const comic1 = mockComic({ id: 1 }); // source
      const comic2 = mockComic({ id: 2 }); // sibling
      const prisma = makePrisma([comic1, comic2]);
      (prisma.comic as { findUnique: jest.Mock }).findUnique = jest
        .fn()
        .mockResolvedValue(sourceMock);
      const redis = makeRedis();
      service = await buildModule(prisma, redis);

      const result = await service.getSimilarComics('demo-comic', 12);

      const ids = result.items.map((i) => i.id);
      expect(ids).not.toContain(1);
    });

    it('returns empty when source comic not found', async () => {
      const prisma = makePrisma([]);
      (prisma.comic as { findUnique: jest.Mock }).findUnique = jest
        .fn()
        .mockResolvedValue(null);
      const redis = makeRedis();
      service = await buildModule(prisma, redis);

      const result = await service.getSimilarComics('non-existent', 12);

      expect(result.items).toHaveLength(0);
    });
  });

  describe('limit enforcement', () => {
    it('max 30 items are ever returned', async () => {
      const comics = Array.from({ length: 200 }, (_, i) =>
        mockComic({ id: i + 1 }),
      );
      const prisma = makePrisma(comics);
      const redis = makeRedis();
      service = await buildModule(prisma, redis);

      const result = await service.getHomeRecommendations(30);

      expect(result.items.length).toBeLessThanOrEqual(30);
    });
  });
});
