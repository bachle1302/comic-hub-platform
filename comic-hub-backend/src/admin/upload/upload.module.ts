import { Module } from '@nestjs/common';
import { AuditLogsModule } from '../audit-logs/audit-logs.module';
import { StorageModule } from '../../storage/storage.module';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

@Module({
  imports: [AuditLogsModule, StorageModule],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
