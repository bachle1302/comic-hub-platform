import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { AdminAuditAction, SystemSettingValueType } from '@prisma/client';
import { AuditLogsService } from '../admin/audit-logs/audit-logs.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';
import {
  PUBLIC_SETTINGS_CACHE_KEY,
  SystemSettingsService,
} from './system-settings.service';

const now = new Date('2026-06-04T00:00:00.000Z');

function createSetting(input: {
  group: string;
  isPublic?: boolean;
  key: string;
  value: string;
  valueType: SystemSettingValueType;
}) {
  return {
    id: 1,
    key: input.key,
    value: input.value,
    valueType: input.valueType,
    group: input.group,
    label: null,
    description: null,
    isPublic: input.isPublic ?? true,
    createdAt: now,
    updatedAt: now,
  };
}

describe('SystemSettingsService', () => {
  let createLogMock: jest.MockedFunction<(input: unknown) => Promise<void>>;
  let auditLogsService: {
    createLog: (input: unknown) => Promise<void>;
  };
  let prisma: {
    systemSetting: {
      findMany: jest.MockedFunction<() => Promise<unknown>>;
      findUnique: jest.MockedFunction<() => Promise<unknown>>;
      update: jest.MockedFunction<() => Promise<unknown>>;
    };
  };
  let redisDelMock: jest.MockedFunction<(key: string) => Promise<void>>;
  let redisGetMock: jest.MockedFunction<(key: string) => Promise<unknown>>;
  let redisSetMock: jest.MockedFunction<
    (key: string, value: unknown, ttlSeconds: number) => Promise<void>
  >;
  let redis: {
    del: (key: string) => Promise<void>;
    get: (key: string) => Promise<unknown>;
    set: (key: string, value: unknown, ttlSeconds: number) => Promise<void>;
  };
  let service: SystemSettingsService;

  beforeEach(async () => {
    createLogMock = jest
      .fn<(input: unknown) => Promise<void>>()
      .mockResolvedValue(undefined);
    auditLogsService = {
      createLog: createLogMock,
    };
    prisma = {
      systemSetting: {
        findMany: jest.fn<() => Promise<unknown>>(),
        findUnique: jest.fn<() => Promise<unknown>>(),
        update: jest.fn<() => Promise<unknown>>(),
      },
    };
    redisDelMock = jest
      .fn<(key: string) => Promise<void>>()
      .mockResolvedValue(undefined);
    redisGetMock = jest
      .fn<(key: string) => Promise<unknown>>()
      .mockResolvedValue(null);
    redisSetMock = jest
      .fn<(key: string, value: unknown, ttlSeconds: number) => Promise<void>>()
      .mockResolvedValue(undefined);
    redis = {
      del: redisDelMock,
      get: redisGetMock,
      set: redisSetMock,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SystemSettingsService,
        {
          provide: AuditLogsService,
          useValue: auditLogsService,
        },
        {
          provide: PrismaService,
          useValue: prisma,
        },
        {
          provide: RedisService,
          useValue: redis,
        },
      ],
    }).compile();

    service = module.get<SystemSettingsService>(SystemSettingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('parses boolean and number setting values', () => {
    expect(
      service.parseSettingValue({
        value: 'true',
        valueType: SystemSettingValueType.BOOLEAN,
      }),
    ).toBe(true);
    expect(
      service.parseSettingValue({
        value: '12',
        valueType: SystemSettingValueType.NUMBER,
      }),
    ).toBe(12);
  });

  it('returns grouped public settings and caches them', async () => {
    prisma.systemSetting.findMany.mockResolvedValue([
      createSetting({
        key: 'general.siteName',
        value: 'Manga Platform',
        valueType: SystemSettingValueType.STRING,
        group: 'general',
      }),
      createSetting({
        key: 'system.maintenanceMode',
        value: 'false',
        valueType: SystemSettingValueType.BOOLEAN,
        group: 'system',
      }),
    ]);

    await expect(service.getPublicSettings()).resolves.toEqual({
      general: {
        siteName: 'Manga Platform',
      },
      system: {
        maintenanceMode: false,
      },
    });
    expect(redisSetMock).toHaveBeenCalledWith(
      PUBLIC_SETTINGS_CACHE_KEY,
      {
        general: {
          siteName: 'Manga Platform',
        },
        system: {
          maintenanceMode: false,
        },
      },
      300,
    );
  });

  it('throws NotFoundException when updating unknown key', async () => {
    prisma.systemSetting.findUnique.mockResolvedValue(null);

    await expect(
      service.updateSetting({
        key: 'missing.key',
        value: 'value',
      }),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('updates public setting, clears cache, and creates audit log', async () => {
    const existingSetting = createSetting({
      key: 'general.supportEmail',
      value: 'support@example.com',
      valueType: SystemSettingValueType.STRING,
      group: 'general',
    });
    const updatedSetting = {
      ...existingSetting,
      value: 'support@your-domain.com',
    };

    prisma.systemSetting.findUnique.mockResolvedValue(existingSetting);
    prisma.systemSetting.update.mockResolvedValue(updatedSetting);

    await expect(
      service.updateSetting({
        key: 'general.supportEmail',
        value: 'support@your-domain.com',
        ip: '127.0.0.1',
        userAgent: 'jest',
      }),
    ).resolves.toEqual(updatedSetting);

    expect(redisDelMock).toHaveBeenCalledWith(PUBLIC_SETTINGS_CACHE_KEY);
    expect(createLogMock).toHaveBeenCalledWith(
      expect.objectContaining({
        action: AdminAuditAction.UPDATE_SYSTEM_SETTING,
        entityType: 'SystemSetting',
        entityId: 'general.supportEmail',
      }),
    );
  });
});
