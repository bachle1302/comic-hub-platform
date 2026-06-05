import { Test, TestingModule } from '@nestjs/testing';
import { AuditLogsService } from '../audit-logs/audit-logs.service';
import { CoinPackagesController } from './coin-packages.controller';
import { CoinPackagesService } from './coin-packages.service';

describe('CoinPackagesController', () => {
  let controller: CoinPackagesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CoinPackagesController],
      providers: [
        {
          provide: AuditLogsService,
          useValue: {
            createLog: jest.fn(),
          },
        },
        {
          provide: CoinPackagesService,
          useValue: {},
        },
      ],
    }).compile();

    controller = module.get<CoinPackagesController>(CoinPackagesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
