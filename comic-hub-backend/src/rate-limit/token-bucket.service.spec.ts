import { RedisService } from '../redis/redis.service';
import { TokenBucketService } from './token-bucket.service';

type BucketState = {
  tokens: number;
  updatedAt: number;
};

class MockRedisService {
  private readonly buckets = new Map<string, BucketState>();

  eval(_script: string, keys: string[], args: string[]): Promise<unknown> {
    const key = keys[0];
    const capacity = Number(args[0]);
    const refillRate = Number(args[1]);
    const refillIntervalMs = Number(args[2]);
    const cost = Number(args[3]);
    const now = Number(args[4]);
    const currentState = this.buckets.get(key);
    let tokens = currentState?.tokens ?? capacity;
    let updatedAt = currentState?.updatedAt ?? now;
    const elapsed = Math.max(0, now - updatedAt);
    const refillSteps = Math.floor(elapsed / refillIntervalMs);

    if (refillSteps > 0) {
      tokens = Math.min(capacity, tokens + refillSteps * refillRate);
      updatedAt += refillSteps * refillIntervalMs;
    }

    let allowed = 0;
    let tokensRemaining = tokens;
    let retryAfterMs = 0;

    if (tokens >= cost) {
      allowed = 1;
      tokensRemaining = tokens - cost;
    } else {
      const missingTokens = cost - tokens;
      const requiredSteps = Math.ceil(missingTokens / refillRate);
      let nextRefillInMs = updatedAt + refillIntervalMs - now;

      if (nextRefillInMs <= 0) {
        nextRefillInMs = refillIntervalMs;
      }

      retryAfterMs = nextRefillInMs + (requiredSteps - 1) * refillIntervalMs;
    }

    this.buckets.set(key, {
      tokens: tokensRemaining,
      updatedAt,
    });

    return Promise.resolve([allowed, tokensRemaining, retryAfterMs]);
  }
}

describe('TokenBucketService', () => {
  let service: TokenBucketService;
  let now: number;

  beforeEach(() => {
    jest.spyOn(Date, 'now').mockImplementation(() => now);
    service = new TokenBucketService(
      new MockRedisService() as unknown as RedisService,
    );
    now = 1_000_000;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('allows a new bucket request', async () => {
    const result = await service.consume({
      key: 'rate:test:new',
      capacity: 10,
      refillRate: 1,
      refillIntervalMs: 1000,
      cost: 1,
    });

    expect(result.allowed).toBe(true);
    expect(result.tokensRemaining).toBe(9);
  });

  it('subtracts tokens on consume', async () => {
    await service.consume({
      key: 'rate:test:subtract',
      capacity: 2,
      refillRate: 1,
      refillIntervalMs: 1000,
      cost: 1,
    });
    const result = await service.consume({
      key: 'rate:test:subtract',
      capacity: 2,
      refillRate: 1,
      refillIntervalMs: 1000,
      cost: 1,
    });

    expect(result.allowed).toBe(true);
    expect(result.tokensRemaining).toBe(0);
  });

  it('denies when the bucket is empty', async () => {
    const input = {
      key: 'rate:test:empty',
      capacity: 1,
      refillRate: 1,
      refillIntervalMs: 1000,
      cost: 1,
    };

    await service.consume(input);
    const result = await service.consume(input);

    expect(result.allowed).toBe(false);
    expect(result.tokensRemaining).toBe(0);
    expect(result.retryAfterMs).toBe(1000);
  });

  it('allows after refill time passes', async () => {
    const input = {
      key: 'rate:test:refill',
      capacity: 1,
      refillRate: 1,
      refillIntervalMs: 1000,
      cost: 1,
    };

    await service.consume(input);
    now += 1000;
    const result = await service.consume(input);

    expect(result.allowed).toBe(true);
    expect(result.tokensRemaining).toBe(0);
  });

  it('does not refill above capacity', async () => {
    const input = {
      key: 'rate:test:capacity',
      capacity: 3,
      refillRate: 10,
      refillIntervalMs: 1000,
      cost: 1,
    };

    await service.consume(input);
    now += 5000;
    const result = await service.consume(input);

    expect(result.allowed).toBe(true);
    expect(result.tokensRemaining).toBe(2);
  });
});
