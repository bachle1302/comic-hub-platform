import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { AuthorsController } from './authors.controller';
import { AuthorsService } from './authors.service';

describe('AuthorsController', () => {
  let controller: AuthorsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthorsController],
      providers: [
        {
          provide: AuditLogsService,
          useValue: {},
        },
        {
          provide: AuthorsService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<AuthorsController>(AuthorsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
