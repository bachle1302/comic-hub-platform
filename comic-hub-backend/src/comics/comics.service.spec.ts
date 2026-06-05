import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import { ViewsService } from '../views/views.service';
import { ComicsService } from './comics.service';

describe('ComicsService', () => {
  let service: ComicsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComicsService,
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: RedisService,
          useValue: {},
        },
        {
          provide: ViewsService,
          useValue: {
            trackView: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ComicsService>(ComicsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
