import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { CommentReportsService } from './comment-reports.service';

describe('CommentReportsService', () => {
  let service: CommentReportsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CommentReportsService,
        {
          provide: PrismaService,
          useValue: {},
        },
      ],
    }).compile();

    service = module.get<CommentReportsService>(CommentReportsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
