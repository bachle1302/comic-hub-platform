import { Module } from '@nestjs/common';
import { RedisModule } from '../redis/redis.module';
import { TokenBucketService } from './token-bucket.service';

@Module({
  imports: [RedisModule],
  providers: [TokenBucketService],
  exports: [TokenBucketService],
})
export class RateLimitModule {}
