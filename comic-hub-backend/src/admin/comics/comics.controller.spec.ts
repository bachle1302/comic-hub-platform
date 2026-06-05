import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { ComicsController } from './comics.controller';
import { ComicsService } from './comics.service';

describe('Admin ComicsController', () => {
  let controller: ComicsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComicsController],
      providers: [
        {
          provide: AuditLogsService,
          useValue: {},
        },
        {
          provide: ComicsService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<ComicsController>(ComicsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
