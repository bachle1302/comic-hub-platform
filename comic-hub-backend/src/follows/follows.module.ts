import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';
import { FollowsController } from './follows.controller';
import { FollowsService } from './follows.service';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [FollowsController],
  providers: [FollowsService],
})
export class FollowsModule {}
