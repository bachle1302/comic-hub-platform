import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

describe('UploadController', () => {
  let controller: UploadController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UploadController],
      providers: [
        {
          provide: AuditLogsService,
          useValue: {},
        },
        {
          provide: UploadService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<UploadController>(UploadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
