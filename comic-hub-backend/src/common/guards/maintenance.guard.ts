import {
  CanActivate,
  ExecutionContext,
  Injectable,
  ServiceUnavailableException,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import type { Request } from 'express';
import { MaintenanceService } from '../../system-settings/maintenance.service';

type MaintenanceRequest = Request & {
  user?: {
    role?: string;
  };
};

const EXACT_BYPASS_PATHS = new Set([
  '/health',
  '/system-settings/public',
  '/auth/login',
  '/auth/google',
  '/auth/refresh',
  '/auth/logout',
  '/payments/payos/webhook',
]);

@Injectable()
export class MaintenanceGuard implements CanActivate {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<MaintenanceRequest>();
    const path = this.getRequestPath(request);

    if (this.shouldBypassPath(path)) {
      return true;
    }

    const state = await this.maintenanceService.isMaintenanceMode();

    if (!state.enabled) {
      return true;
    }

    if (request.user?.role === Role.ADMIN) {
      return true;
    }

    throw new ServiceUnavailableException(state.message);
  }

  private getRequestPath(request: MaintenanceRequest): string {
    const originalUrl = request.originalUrl || request.url || '/';

    return originalUrl.split('?')[0] || '/';
  }

  private shouldBypassPath(path: string): boolean {
    return EXACT_BYPASS_PATHS.has(path) || path.startsWith('/admin/');
  }
}
