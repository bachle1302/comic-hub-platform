import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { CoinPackagesService } from './coin-packages.service';

describe('CoinPackagesService', () => {
  let service: CoinPackagesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CoinPackagesService,
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

    service = module.get<CoinPackagesService>(CoinPackagesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
