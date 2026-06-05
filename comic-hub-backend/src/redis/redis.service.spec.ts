import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from './redis.service';

const redisQuitMock = jest.fn<Promise<'OK'>, []>().mockResolvedValue('OK');

jest.mock('ioredis', () => {
  return {
    __esModule: true,
    default: jest.fn().mockImplementation(() => ({
      quit: redisQuitMock,
    })),
  };
});

describe('RedisService', () => {
  let module: TestingModule;
  let service: RedisService;

  beforeEach(async () => {
    redisQuitMock.mockClear();

    module = await Test.createTestingModule({
      providers: [RedisService],
    }).compile();

    service = module.get<RedisService>(RedisService);
  });

  afterEach(async () => {
    await module.close();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
