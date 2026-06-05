import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { PayosService } from './payos.service';

describe('PayosService', () => {
  let service: PayosService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PayosService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('test'),
          },
        },
      ],
    }).compile();

    service = module.get<PayosService>(PayosService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
