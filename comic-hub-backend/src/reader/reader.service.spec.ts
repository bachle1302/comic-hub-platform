import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { ViewsService } from '../views/views.service';
import { ReaderService } from './reader.service';

describe('ReaderService', () => {
  let service: ReaderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ReaderService,
        {
          provide: PrismaService,
          useValue: {},
        },
        {
          provide: ViewsService,
          useValue: {
            trackView: jest.fn(),
          },
        },
        {
          provide: StorageService,
          useValue: {
            createPresignedReadUrl: jest.fn(),
            isPrivateBucketMode: jest.fn().mockReturnValue(false),
          },
        },
      ],
    }).compile();

    service = module.get<ReaderService>(ReaderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
