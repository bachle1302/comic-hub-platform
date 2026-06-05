import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { RedisModule } from '../redis/redis.module';
import { ViewsService } from './views.service';

@Module({
  imports: [PrismaModule, RedisModule],
  providers: [ViewsService],
  exports: [ViewsService],
})
export class ViewsModule {}
