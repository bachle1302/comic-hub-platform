import { Injectable, Logger } from '@nestjs/common';
import { SystemSettingsService } from './system-settings.service';

const DEFAULT_MAINTENANCE_MESSAGE =
  'Website \u0111ang b\u1ea3o tr\u00ec, vui l\u00f2ng quay l\u1ea1i sau.';

export type MaintenanceState = {
  enabled: boolean;
  message: string;
};

@Injectable()
export class MaintenanceService {
  private readonly logger = new Logger(MaintenanceService.name);

  constructor(private readonly systemSettingsService: SystemSettingsService) {}

  async isMaintenanceMode(): Promise<MaintenanceState> {
    try {
      const settings = await this.systemSettingsService.getPublicSettings();
      const systemSettings = settings.system ?? {};
      const rawEnabled = systemSettings.maintenanceMode;
      const rawMessage = systemSettings.maintenanceMessage;

      return {
        enabled: typeof rawEnabled === 'boolean' ? rawEnabled : false,
        message:
          typeof rawMessage === 'string' && rawMessage.trim()
            ? rawMessage.trim()
            : DEFAULT_MAINTENANCE_MESSAGE,
      };
    } catch (error) {
      this.logger.warn(
        error instanceof Error
          ? `Failed to read maintenance settings: ${error.message}`
          : 'Failed to read maintenance settings',
      );

      return {
        enabled: false,
        message: DEFAULT_MAINTENANCE_MESSAGE,
      };
    }
  }
}

export { DEFAULT_MAINTENANCE_MESSAGE };
