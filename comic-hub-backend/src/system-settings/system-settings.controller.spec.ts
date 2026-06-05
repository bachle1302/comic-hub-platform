import { Test, TestingModule } from '@nestjs/testing';
import { SystemSettingsController } from './system-settings.controller';
import { SystemSettingsService } from './system-settings.service';

describe('SystemSettingsController', () => {
  let controller: SystemSettingsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SystemSettingsController],
      providers: [
        {
          provide: SystemSettingsService,
          useValue: {
            getPublicSettings: jest.fn(),
            listSettings: jest.fn(),
            updateSetting: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<SystemSettingsController>(SystemSettingsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
