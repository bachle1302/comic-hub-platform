import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { HistoriesController } from './histories.controller';
import { HistoriesService } from './histories.service';

@Module({
  imports: [PrismaModule],
  controllers: [HistoriesController],
  providers: [HistoriesService],
})
export class HistoriesModule {}
