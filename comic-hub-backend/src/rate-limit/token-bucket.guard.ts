import {
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import type { Request, Response } from 'express';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { TOKEN_BUCKET_RATE_LIMIT_KEY } from './decorators/token-bucket.decorator';
import { TokenBucketService } from './token-bucket.service';
import type { TokenBucketOptions } from './types/token-bucket-options.type';

type RateLimitRequest = Request & {
  user?: Pick<AuthenticatedUser, 'id'>;
};

type ResolvedTokenBucketOptions = Required<TokenBucketOptions>;

@Injectable()
export class TokenBucketGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly tokenBucketService: TokenBucketService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RateLimitRequest>();
    const response = context.switchToHttp().getResponse<Response>();
    const options = this.resolveOptions(context);
    const identity = this.getIdentity(request);
    const key = `rate:${options.keyPrefix}:${identity}`;
    const result = await this.consumeTokenBucket(key, options);

    response.setHeader('X-RateLimit-Limit', String(options.capacity));
    response.setHeader(
      'X-RateLimit-Remaining',
      String(Math.max(0, Math.floor(result.tokensRemaining))),
    );

    if (!result.allowed) {
      response.setHeader(
        'Retry-After',
        String(Math.ceil(result.retryAfterMs / 1000)),
      );
      throw new HttpException(
        'Too Many Requests',
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    return true;
  }

  private resolveOptions(
    context: ExecutionContext,
  ): ResolvedTokenBucketOptions {
    const routeOptions =
      this.reflector.getAllAndOverride<Partial<TokenBucketOptions>>(
        TOKEN_BUCKET_RATE_LIMIT_KEY,
        [context.getHandler(), context.getClass()],
      ) ?? {};

    return {
      capacity:
        routeOptions.capacity ??
        this.configService.get<number>('TOKEN_BUCKET_CAPACITY', 10),
      refillRate:
        routeOptions.refillRate ??
        this.configService.get<number>('TOKEN_BUCKET_REFILL_RATE', 1),
      refillIntervalMs:
        routeOptions.refillIntervalMs ??
        this.configService.get<number>('TOKEN_BUCKET_REFILL_INTERVAL_MS', 1000),
      cost:
        routeOptions.cost ??
        this.configService.get<number>('TOKEN_BUCKET_COST', 1),
      keyPrefix: routeOptions.keyPrefix ?? 'global',
    };
  }

  private getIdentity(request: RateLimitRequest): string {
    if (request.user?.id !== undefined) {
      return `user:${request.user.id}`;
    }

    return `ip:${request.ip ?? 'unknown'}`;
  }

  private async consumeTokenBucket(
    key: string,
    options: ResolvedTokenBucketOptions,
  ) {
    try {
      return await this.tokenBucketService.consume({
        key,
        capacity: options.capacity,
        refillRate: options.refillRate,
        refillIntervalMs: options.refillIntervalMs,
        cost: options.cost,
      });
    } catch {
      throw new ServiceUnavailableException(
        'Rate limit service is temporarily unavailable',
      );
    }
  }
}
