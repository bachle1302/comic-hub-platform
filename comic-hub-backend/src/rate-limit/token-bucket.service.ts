import { Injectable } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import type {
  TokenBucketConsumeInput,
  TokenBucketConsumeResult,
} from './types/token-bucket-options.type';

const TOKEN_BUCKET_LUA_SCRIPT = `
local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local refillRate = tonumber(ARGV[2])
local refillIntervalMs = tonumber(ARGV[3])
local cost = tonumber(ARGV[4])
local now = tonumber(ARGV[5])
local ttlSeconds = tonumber(ARGV[6])

local tokens = redis.call('HGET', key, 'tokens')
local updatedAt = redis.call('HGET', key, 'updatedAt')

if tokens == false or updatedAt == false then
  tokens = capacity
  updatedAt = now
else
  tokens = tonumber(tokens)
  updatedAt = tonumber(updatedAt)
end

local elapsed = math.max(0, now - updatedAt)
local refillSteps = math.floor(elapsed / refillIntervalMs)

if refillSteps > 0 then
  tokens = math.min(capacity, tokens + (refillSteps * refillRate))
  updatedAt = updatedAt + (refillSteps * refillIntervalMs)
end

local allowed = 0
local tokensRemaining = tokens
local retryAfterMs = 0

if tokens >= cost then
  allowed = 1
  tokensRemaining = tokens - cost
else
  local missingTokens = cost - tokens
  local requiredSteps = math.ceil(missingTokens / refillRate)
  local nextRefillInMs = (updatedAt + refillIntervalMs) - now

  if nextRefillInMs <= 0 then
    nextRefillInMs = refillIntervalMs
  end

  retryAfterMs = nextRefillInMs + ((requiredSteps - 1) * refillIntervalMs)
end

redis.call('HSET', key, 'tokens', tokensRemaining, 'updatedAt', updatedAt)
redis.call('EXPIRE', key, ttlSeconds)

return { allowed, tokensRemaining, retryAfterMs }
`;

function isRedisTuple(value: unknown): value is [number, number, number] {
  return (
    Array.isArray(value) &&
    value.length === 3 &&
    value.every((item) => typeof item === 'number')
  );
}

@Injectable()
export class TokenBucketService {
  constructor(private readonly redis: RedisService) {}

  async consume(
    input: TokenBucketConsumeInput,
  ): Promise<TokenBucketConsumeResult> {
    const ttlSeconds = this.calculateTtlSeconds(input);
    const result = await this.redis.eval(
      TOKEN_BUCKET_LUA_SCRIPT,
      [input.key],
      [
        String(input.capacity),
        String(input.refillRate),
        String(input.refillIntervalMs),
        String(input.cost),
        String(Date.now()),
        String(ttlSeconds),
      ],
    );

    if (!isRedisTuple(result)) {
      throw new Error('Invalid token bucket Redis response');
    }

    return {
      allowed: result[0] === 1,
      tokensRemaining: result[1],
      retryAfterMs: result[2],
    };
  }

  private calculateTtlSeconds(input: TokenBucketConsumeInput): number {
    const fullRefillMs =
      (input.capacity / input.refillRate) * input.refillIntervalMs;

    return Math.max(60, Math.ceil(fullRefillMs / 1000) * 2);
  }
}
