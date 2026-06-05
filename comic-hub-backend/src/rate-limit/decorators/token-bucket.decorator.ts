import { SetMetadata } from '@nestjs/common';
import type { TokenBucketOptions } from '../types/token-bucket-options.type';

export const TOKEN_BUCKET_RATE_LIMIT_KEY = 'token_bucket_rate_limit';

export const TokenBucketRateLimit = (options: Partial<TokenBucketOptions>) =>
  SetMetadata(TOKEN_BUCKET_RATE_LIMIT_KEY, options);
