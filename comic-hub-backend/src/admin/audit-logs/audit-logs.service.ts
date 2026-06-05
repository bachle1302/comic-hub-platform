import { Injectable, Logger } from '@nestjs/common';
import { AdminAuditAction, Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { ListAuditLogsQueryDto } from './dto/list-audit-logs-query.dto';

const SENSITIVE_KEY_PATTERNS = [
  'password',
  'token',
  'secret',
  'authorization',
  'refreshtoken',
  'accesstoken',
  'credential',
  'idtoken',
] as const;

type AuditAdminSnapshot = {
  email?: string;
  id: number;
  name?: string;
};

type CreateAuditLogInput = {
  action: AdminAuditAction;
  admin?: AuditAdminSnapshot | null;
  entityId?: number | string | null;
  entityType: string;
  ip?: string | null;
  message: string;
  metadata?: unknown;
  userAgent?: string | null;
};

@Injectable()
export class AuditLogsService {
  private readonly logger = new Logger(AuditLogsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async createLog(input: CreateAuditLogInput): Promise<void> {
    try {
      await this.prisma.adminAuditLog.create({
        data: {
          adminId: input.admin?.id,
          adminEmail: input.admin?.email,
          adminName: input.admin?.name,
          action: input.action,
          entityType: input.entityType,
          entityId:
            input.entityId === null || input.entityId === undefined
              ? undefined
              : String(input.entityId),
          message: input.message,
          metadata: this.sanitizeAuditMetadata(input.metadata),
          ip: input.ip ?? undefined,
          userAgent: input.userAgent ?? undefined,
        },
      });
    } catch (error) {
      this.logger.warn(
        error instanceof Error
          ? `Failed to create admin audit log: ${error.message}`
          : 'Failed to create admin audit log',
      );
    }
  }

  async findAll(query: ListAuditLogsQueryDto) {
    const page = this.normalizePage(query.page);
    const limit = this.normalizeLimit(query.limit);
    const skip = (page - 1) * limit;
    const where = this.buildWhere(query);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.adminAuditLog.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.adminAuditLog.count({
        where,
      }),
    ]);
    const totalPages = Math.ceil(total / limit);

    return {
      items,
      meta: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  }

  sanitizeAuditMetadata(metadata: unknown): Prisma.InputJsonValue | undefined {
    if (metadata === undefined) {
      return undefined;
    }

    return this.toSafeJsonValue(metadata);
  }

  private buildWhere(
    query: ListAuditLogsQueryDto,
  ): Prisma.AdminAuditLogWhereInput {
    const trimmedQuery = query.q?.trim();

    return {
      adminId: query.adminId,
      action: query.action,
      entityType: query.entityType?.trim() || undefined,
      entityId: query.entityId?.trim() || undefined,
      createdAt: this.buildDateFilter(query.dateFrom, query.dateTo),
      OR: trimmedQuery
        ? [
            {
              message: {
                contains: trimmedQuery,
                mode: 'insensitive',
              },
            },
            {
              adminEmail: {
                contains: trimmedQuery,
                mode: 'insensitive',
              },
            },
            {
              adminName: {
                contains: trimmedQuery,
                mode: 'insensitive',
              },
            },
            {
              entityType: {
                contains: trimmedQuery,
                mode: 'insensitive',
              },
            },
            {
              entityId: {
                contains: trimmedQuery,
                mode: 'insensitive',
              },
            },
          ]
        : undefined,
    };
  }

  private buildDateFilter(
    dateFrom?: string,
    dateTo?: string,
  ): Prisma.DateTimeFilter | undefined {
    const gte = dateFrom ? new Date(dateFrom) : undefined;
    const lte = dateTo ? new Date(dateTo) : undefined;

    return {
      gte: gte && Number.isFinite(gte.getTime()) ? gte : undefined,
      lte: lte && Number.isFinite(lte.getTime()) ? lte : undefined,
    };
  }

  private isSensitiveKey(key: string) {
    const normalizedKey = key.toLowerCase();

    return SENSITIVE_KEY_PATTERNS.some((pattern) =>
      normalizedKey.includes(pattern),
    );
  }

  private normalizePage(page?: number) {
    if (!page || !Number.isFinite(page)) {
      return 1;
    }

    return Math.max(Math.trunc(page), 1);
  }

  private normalizeLimit(limit?: number) {
    if (!limit || !Number.isFinite(limit)) {
      return 20;
    }

    return Math.min(Math.max(Math.trunc(limit), 1), 100);
  }

  private toSafeJsonValue(value: unknown): Prisma.InputJsonValue | undefined {
    if (value === null) {
      return undefined;
    }

    if (
      typeof value === 'string' ||
      typeof value === 'number' ||
      typeof value === 'boolean'
    ) {
      return value;
    }

    if (value instanceof Date) {
      return value.toISOString();
    }

    if (Array.isArray(value)) {
      return value
        .map((item) => this.toSafeJsonValue(item))
        .filter((item): item is Prisma.InputJsonValue => item !== undefined);
    }

    if (typeof value === 'object') {
      const record = value as Record<string, unknown>;
      const sanitized: Record<string, Prisma.InputJsonValue> = {};

      for (const [key, item] of Object.entries(record)) {
        if (this.isSensitiveKey(key)) {
          continue;
        }

        const safeValue = this.toSafeJsonValue(item);

        if (safeValue !== undefined) {
          sanitized[key] = safeValue;
        }
      }

      return sanitized;
    }

    return undefined;
  }
}
