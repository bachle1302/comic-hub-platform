import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from '../../notifications/notifications.service';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { ChaptersService } from './chapters.service';

describe('ChaptersService', () => {
  let service: ChaptersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChaptersService,
        {
          provide: NotificationsService,
          useValue: {},
        },
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: RedisService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<ChaptersService>(ChaptersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
