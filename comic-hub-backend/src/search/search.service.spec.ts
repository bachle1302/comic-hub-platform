import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { SearchService } from './search.service';

describe('SearchService', () => {
  let service: SearchService;
  const prisma = {
    comic: {
      findMany: jest.fn(),
    },
  };
  const redis = {
    get: jest.fn(),
    set: jest.fn(),
  };

  beforeEach(async () => {
    jest.clearAllMocks();

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        {
          provide: PrismaService,
          useValue: prisma,
        },
        {
          provide: RedisService,
          useValue: redis,
        },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('returns empty suggestions for blank keyword', async () => {
    await expect(service.suggestions({ q: '   ' })).resolves.toEqual([]);
    expect(redis.get).not.toHaveBeenCalled();
    expect(prisma.comic.findMany).not.toHaveBeenCalled();
  });

  it('returns cached suggestions without querying database', async () => {
    const cached = [
      {
        id: 1,
        title: 'Naruto Demo',
        slug: 'naruto-demo',
        thumbnail: null,
        authorName: 'Kishimoto Masashi',
        status: 'ONGOING',
        latestChapterNumber: 12,
      },
    ];
    redis.get.mockResolvedValue(cached);

    await expect(service.suggestions({ q: 'naruto', limit: 8 })).resolves.toBe(
      cached,
    );
    expect(redis.get).toHaveBeenCalledWith('search:suggestions:naruto:8');
    expect(prisma.comic.findMany).not.toHaveBeenCalled();
  });

  it('queries lightweight suggestions and clamps limit to 10', async () => {
    redis.get.mockResolvedValue(null);
    prisma.comic.findMany.mockResolvedValue([
      {
        id: 1,
        name: 'Naruto Demo',
        slug: 'naruto-demo',
        thumbnail: null,
        status: 'ONGOING',
        viewTotal: 100,
        followCount: 5,
        updatedAt: new Date(),
        author: {
          name: 'Kishimoto Masashi',
        },
        chapters: [
          {
            chapterNumber: 12,
          },
        ],
      },
    ]);

    await expect(
      service.suggestions({ q: 'naruto', limit: 20 }),
    ).resolves.toEqual([
      {
        id: 1,
        title: 'Naruto Demo',
        slug: 'naruto-demo',
        thumbnail: null,
        authorName: 'Kishimoto Masashi',
        status: 'ONGOING',
        latestChapterNumber: 12,
      },
    ]);
    expect(prisma.comic.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        take: 30,
      }),
    );
    expect(redis.set).toHaveBeenCalledWith(
      'search:suggestions:naruto:10',
      expect.arrayContaining([
        expect.objectContaining({
          id: 1,
        }),
      ]),
      60,
    );
  });
});
