import { Module } from '@nestjs/common';
import { ComicsService } from './comics.service';
import { ComicsController } from './comics.controller';
import { ViewsModule } from '../views/views.module';

@Module({
  imports: [ViewsModule],
  controllers: [ComicsController],
  providers: [ComicsService],
})
export class ComicsModule {}
