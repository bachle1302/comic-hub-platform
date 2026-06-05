import { HttpException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TOKEN_BUCKET_RATE_LIMIT_KEY } from './decorators/token-bucket.decorator';
import { TokenBucketGuard } from './token-bucket.guard';
import { TokenBucketService } from './token-bucket.service';
import type {
  TokenBucketConsumeInput,
  TokenBucketConsumeResult,
} from './types/token-bucket-options.type';

class MockTokenBucketService {
  input: TokenBucketConsumeInput | null = null;
  result: TokenBucketConsumeResult = {
    allowed: true,
    retryAfterMs: 0,
    tokensRemaining: 9,
  };

  consume(input: TokenBucketConsumeInput): Promise<TokenBucketConsumeResult> {
    this.input = input;

    return Promise.resolve(this.result);
  }
}

class MockConfigService {
  get<T>(_key: string, defaultValue: T): T {
    return defaultValue;
  }
}

type MockResponse = {
  headers: Record<string, string>;
  setHeader: (name: string, value: string) => void;
};

function createContext(input?: {
  handler?: () => void;
  ip?: string;
  userId?: number;
}): { context: ExecutionContext; response: MockResponse } {
  const handler = input?.handler ?? (() => undefined);
  const request = {
    ip: input?.ip ?? '127.0.0.1',
    user:
      input?.userId === undefined
        ? undefined
        : {
            id: input.userId,
          },
  };
  const response: MockResponse = {
    headers: {},
    setHeader(this: MockResponse, name: string, value: string) {
      this.headers[name] = value;
    },
  };
  const context = {
    getClass: () => class TestController {},
    getHandler: () => handler,
    switchToHttp: () => ({
      getRequest: () => request,
      getResponse: () => response,
    }),
  } as unknown as ExecutionContext;

  return {
    context,
    response,
  };
}

describe('TokenBucketGuard', () => {
  let tokenBucketService: MockTokenBucketService;
  let guard: TokenBucketGuard;
  let reflector: Reflector;

  beforeEach(() => {
    tokenBucketService = new MockTokenBucketService();
    reflector = new Reflector();
    guard = new TokenBucketGuard(
      reflector,
      tokenBucketService as unknown as TokenBucketService,
      new MockConfigService() as unknown as ConfigService,
    );
  });

  it('allows request when token bucket allows it', async () => {
    const { context, response } = createContext({
      ip: '10.0.0.1',
    });

    await expect(guard.canActivate(context)).resolves.toBe(true);
    expect(response.headers['X-RateLimit-Limit']).toBe('10');
    expect(response.headers['X-RateLimit-Remaining']).toBe('9');
  });

  it('throws 429 when token bucket denies it', async () => {
    tokenBucketService.result = {
      allowed: false,
      retryAfterMs: 2000,
      tokensRemaining: 0,
    };
    const { context, response } = createContext();

    await expect(guard.canActivate(context)).rejects.toBeInstanceOf(
      HttpException,
    );
    expect(response.headers['Retry-After']).toBe('2');
  });

  it('uses custom key prefix from route metadata', async () => {
    const handler = () => undefined;

    Reflect.defineMetadata(
      TOKEN_BUCKET_RATE_LIMIT_KEY,
      {
        capacity: 5,
        refillRate: 1,
        refillIntervalMs: 10000,
        keyPrefix: 'auth',
      },
      handler,
    );

    const { context } = createContext({
      handler,
      userId: 12,
    });

    await guard.canActivate(context);

    expect(tokenBucketService.input?.key).toBe('rate:auth:user:12');
    expect(tokenBucketService.input?.capacity).toBe(5);
  });
});
