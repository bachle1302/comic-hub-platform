import { Module } from '@nestjs/common';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { CoinPackagesController } from './coin-packages.controller';
import { CoinPackagesService } from './coin-packages.service';

@Module({
  imports: [AuditLogsModule],
  controllers: [CoinPackagesController],
  providers: [CoinPackagesService],
  exports: [CoinPackagesService],
})
export class CoinPackagesModule {}
