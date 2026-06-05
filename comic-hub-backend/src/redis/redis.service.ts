import { Injectable, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly redis: Redis;

  constructor() {
    this.redis = new Redis(process.env.REDIS_URL ?? 'redis://localhost:6379');
  }

  async get<T>(key: string): Promise<T | null> {
    const value = await this.redis.get(key);

    if (!value) {
      return null;
    }

    return JSON.parse(value) as T;
  }

  async set(key: string, value: unknown, ttlSeconds = 60): Promise<void> {
    await this.redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
  }

  async del(key: string): Promise<void> {
    await this.redis.del(key);
  }

  async delByPattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);

    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }

  async increment(key: string): Promise<number> {
    return this.redis.incr(key);
  }

  async expire(key: string, ttlSeconds: number): Promise<void> {
    await this.redis.expire(key, ttlSeconds);
  }

  async eval(script: string, keys: string[], args: string[]): Promise<unknown> {
    const result: unknown = await this.redis.eval(
      script,
      keys.length,
      ...keys,
      ...args,
    );

    return result;
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }
}
