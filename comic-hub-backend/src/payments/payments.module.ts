import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { PayosService } from './payos.service';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';

@Module({
  imports: [PrismaModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, PayosService],
})
export class PaymentsModule {}
