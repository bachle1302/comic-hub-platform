import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { CommentReportsController } from './comment-reports.controller';
import { CommentReportsService } from './comment-reports.service';

describe('CommentReportsController', () => {
  let controller: CommentReportsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentReportsController],
      providers: [
        {
          provide: AuditLogsService,
          useValue: {},
        },
        {
          provide: CommentReportsService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<CommentReportsController>(CommentReportsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
