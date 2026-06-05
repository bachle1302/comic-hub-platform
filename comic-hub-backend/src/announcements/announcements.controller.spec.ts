import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogsService } from '../admin/audit-logs/audit-logs.service';
import { AnnouncementsController } from './announcements.controller';
import { AnnouncementsService } from './announcements.service';

describe('AnnouncementsController', () => {
  let controller: AnnouncementsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AnnouncementsController],
      providers: [
        {
          provide: AnnouncementsService,
          useValue: {},
        },
        {
          provide: AuditLogsService,
          useValue: {
            createLog: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<AnnouncementsController>(AnnouncementsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
