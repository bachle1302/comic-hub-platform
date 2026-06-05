import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { ChaptersController } from './chapters.controller';
import { ChaptersService } from './chapters.service';

describe('ChaptersController', () => {
  let controller: ChaptersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChaptersController],
      providers: [
        {
          provide: AuditLogsService,
          useValue: {},
        },
        {
          provide: ChaptersService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<ChaptersController>(ChaptersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
