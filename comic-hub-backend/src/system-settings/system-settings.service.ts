import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  AdminAuditAction,
  SystemSetting,
  SystemSettingValueType,
} from '@prisma/client';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { AuditLogsService } from '../admin/audit-logs/audit-logs.service';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

const PUBLIC_SETTINGS_CACHE_KEY = 'system-settings:public';
const PUBLIC_SETTINGS_CACHE_TTL_SECONDS = 300;

type JsonRecord = {
  [key: string]: JsonValue;
};

type JsonValue = JsonRecord | JsonValue[] | boolean | null | number | string;

export type GroupedPublicSettings = Record<string, Record<string, unknown>>;

type ListSettingsQuery = {
  group?: string;
  isPublic?: boolean;
};

type UpdateSettingInput = {
  admin?: AuthenticatedUser;
  ip?: string;
  key: string;
  userAgent?: string;
  value: unknown;
};

@Injectable()
export class SystemSettingsService {
  constructor(
    private readonly auditLogsService: AuditLogsService,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async getPublicSettings(): Promise<GroupedPublicSettings> {
    const cached = await this.redis.get<GroupedPublicSettings>(
      PUBLIC_SETTINGS_CACHE_KEY,
    );

    if (cached) {
      return cached;
    }

    const settings = await this.prisma.systemSetting.findMany({
      where: {
        isPublic: true,
      },
      orderBy: [
        {
          group: 'asc',
        },
        {
          key: 'asc',
        },
      ],
    });
    const grouped = this.groupPublicSettings(settings);

    await this.redis.set(
      PUBLIC_SETTINGS_CACHE_KEY,
      grouped,
      PUBLIC_SETTINGS_CACHE_TTL_SECONDS,
    );

    return grouped;
  }

  async listSettings(query: ListSettingsQuery = {}): Promise<SystemSetting[]> {
    return this.prisma.systemSetting.findMany({
      where: {
        group: query.group?.trim() || undefined,
        isPublic: query.isPublic,
      },
      orderBy: [
        {
          group: 'asc',
        },
        {
          key: 'asc',
        },
      ],
    });
  }

  parseSettingValue(
    setting: Pick<SystemSetting, 'value' | 'valueType'>,
  ): unknown {
    switch (setting.valueType) {
      case SystemSettingValueType.NUMBER:
        return Number(setting.value);
      case SystemSettingValueType.BOOLEAN:
        return setting.value === 'true';
      case SystemSettingValueType.JSON:
        return JSON.parse(setting.value) as unknown;
      case SystemSettingValueType.STRING:
      default:
        return setting.value;
    }
  }

  serializeSettingValue(
    value: unknown,
    valueType: SystemSettingValueType,
  ): string {
    switch (valueType) {
      case SystemSettingValueType.NUMBER:
        if (typeof value !== 'number' || !Number.isFinite(value)) {
          throw new BadRequestException(
            'Setting value must be a finite number',
          );
        }

        return String(value);
      case SystemSettingValueType.BOOLEAN:
        if (typeof value !== 'boolean') {
          throw new BadRequestException('Setting value must be a boolean');
        }

        return value ? 'true' : 'false';
      case SystemSettingValueType.JSON:
        return JSON.stringify(this.toJsonValue(value));
      case SystemSettingValueType.STRING:
      default:
        return String(value);
    }
  }

  async updateSetting(input: UpdateSettingInput): Promise<SystemSetting> {
    const existingSetting = await this.prisma.systemSetting.findUnique({
      where: {
        key: input.key,
      },
    });

    if (!existingSetting) {
      throw new NotFoundException('System setting not found');
    }

    const oldValue = this.parseSettingValue(existingSetting);
    const serializedValue = this.serializeSettingValue(
      input.value,
      existingSetting.valueType,
    );
    const updatedSetting = await this.prisma.systemSetting.update({
      where: {
        key: input.key,
      },
      data: {
        value: serializedValue,
      },
    });
    const newValue = this.parseSettingValue(updatedSetting);

    if (updatedSetting.isPublic) {
      await this.redis.del(PUBLIC_SETTINGS_CACHE_KEY);
    }

    await this.auditLogsService.createLog({
      admin: input.admin,
      action: AdminAuditAction.UPDATE_SYSTEM_SETTING,
      entityType: 'SystemSetting',
      entityId: input.key,
      message: 'Admin updated system setting',
      metadata: {
        key: input.key,
        oldValue,
        newValue,
        group: updatedSetting.group,
        isPublic: updatedSetting.isPublic,
      },
      ip: input.ip,
      userAgent: input.userAgent,
    });

    return updatedSetting;
  }

  private groupPublicSettings(
    settings: SystemSetting[],
  ): GroupedPublicSettings {
    const grouped: GroupedPublicSettings = {};

    for (const setting of settings) {
      grouped[setting.group] ??= {};
      grouped[setting.group][this.getPublicSettingName(setting)] =
        this.parseSettingValue(setting);
    }

    return grouped;
  }

  private getPublicSettingName(setting: Pick<SystemSetting, 'group' | 'key'>) {
    const prefix = `${setting.group}.`;

    return setting.key.startsWith(prefix)
      ? setting.key.slice(prefix.length)
      : setting.key;
  }

  private toJsonValue(value: unknown): JsonValue {
    if (
      value === null ||
      typeof value === 'string' ||
      typeof value === 'boolean'
    ) {
      return value;
    }

    if (typeof value === 'number') {
      if (!Number.isFinite(value)) {
        throw new BadRequestException('JSON setting contains invalid number');
      }

      return value;
    }

    if (Array.isArray(value)) {
      return value.map((item) => this.toJsonValue(item));
    }

    if (typeof value === 'object') {
      if (value instanceof Date) {
        throw new BadRequestException(
          'JSON setting must not contain Date values',
        );
      }

      const record = value as Record<string, unknown>;
      const jsonRecord: JsonRecord = {};

      for (const [key, item] of Object.entries(record)) {
        if (item === undefined || typeof item === 'function') {
          throw new BadRequestException(
            'JSON setting contains unsupported value',
          );
        }

        jsonRecord[key] = this.toJsonValue(item);
      }

      return jsonRecord;
    }

    throw new BadRequestException('Setting value must be JSON serializable');
  }
}

export { PUBLIC_SETTINGS_CACHE_KEY, PUBLIC_SETTINGS_CACHE_TTL_SECONDS };
