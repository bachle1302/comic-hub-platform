import { ExecutionContext, ServiceUnavailableException } from '@nestjs/common';
import { Role } from '@prisma/client';
import {
  MaintenanceService,
  type MaintenanceState,
} from '../../system-settings/maintenance.service';
import { MaintenanceGuard } from './maintenance.guard';

type GuardRequest = {
  originalUrl?: string;
  url?: string;
  user?: {
    role?: string;
  };
};

function createExecutionContext(request: GuardRequest): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: <TRequest>() => request as TRequest,
    }),
  } as unknown as ExecutionContext;
}

describe('MaintenanceGuard', () => {
  let guard: MaintenanceGuard;
  let isMaintenanceModeMock: jest.MockedFunction<
    () => Promise<MaintenanceState>
  >;

  beforeEach(() => {
    isMaintenanceModeMock = jest.fn<() => Promise<MaintenanceState>>();
    guard = new MaintenanceGuard({
      isMaintenanceMode: isMaintenanceModeMock,
    } as unknown as MaintenanceService);
  });

  it('allows public route when maintenance is disabled', async () => {
    isMaintenanceModeMock.mockResolvedValue({
      enabled: false,
      message: 'Maintenance',
    });

    await expect(
      guard.canActivate(createExecutionContext({ originalUrl: '/comics' })),
    ).resolves.toBe(true);
  });

  it('blocks public route when maintenance is enabled', async () => {
    isMaintenanceModeMock.mockResolvedValue({
      enabled: true,
      message: 'Website dang bao tri',
    });

    await expect(
      guard.canActivate(createExecutionContext({ originalUrl: '/comics' })),
    ).rejects.toBeInstanceOf(ServiceUnavailableException);
  });

  it('allows health route during maintenance', async () => {
    await expect(
      guard.canActivate(createExecutionContext({ originalUrl: '/health' })),
    ).resolves.toBe(true);
    expect(isMaintenanceModeMock).not.toHaveBeenCalled();
  });

  it('allows admin routes during maintenance', async () => {
    await expect(
      guard.canActivate(
        createExecutionContext({ originalUrl: '/admin/users?page=1' }),
      ),
    ).resolves.toBe(true);
    expect(isMaintenanceModeMock).not.toHaveBeenCalled();
  });

  it('allows PayOS webhook during maintenance', async () => {
    await expect(
      guard.canActivate(
        createExecutionContext({ originalUrl: '/payments/payos/webhook' }),
      ),
    ).resolves.toBe(true);
    expect(isMaintenanceModeMock).not.toHaveBeenCalled();
  });

  it('allows admin user if request already has user context', async () => {
    isMaintenanceModeMock.mockResolvedValue({
      enabled: true,
      message: 'Maintenance',
    });

    await expect(
      guard.canActivate(
        createExecutionContext({
          originalUrl: '/reader/comics/demo/chapters/1',
          user: {
            role: Role.ADMIN,
          },
        }),
      ),
    ).resolves.toBe(true);
  });
});
