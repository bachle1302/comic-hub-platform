import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { ViewsModule } from '../views/views.module';
import { ReaderController } from './reader.controller';
import { ReaderService } from './reader.service';

@Module({
  imports: [PrismaModule, ViewsModule],
  controllers: [ReaderController],
  providers: [ReaderService],
})
export class ReaderModule {}
