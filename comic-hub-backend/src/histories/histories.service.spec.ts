import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { HistoriesService } from './histories.service';

describe('HistoriesService', () => {
  let service: HistoriesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HistoriesService,
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<HistoriesService>(HistoriesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
