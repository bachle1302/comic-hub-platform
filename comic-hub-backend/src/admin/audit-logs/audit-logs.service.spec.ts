import { AdminAuditAction } from '@prisma/client';
import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from '../../prisma/prisma.service';
import { AuditLogsService } from './audit-logs.service';

describe('AuditLogsService', () => {
  let service: AuditLogsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditLogsService,
        {
          provide: PrismaService,
          useValue: {
            adminAuditLog: {
              create: jest.fn(),
              count: jest.fn(),
              findMany: jest.fn(),
            },
            $transaction: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AuditLogsService>(AuditLogsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should sanitize sensitive metadata fields', () => {
    const metadata = service.sanitizeAuditMetadata({
      accessToken: 'hidden',
      nested: {
        password: 'hidden',
        safe: 'visible',
      },
      safe: true,
    });

    expect(metadata).toEqual({
      nested: {
        safe: 'visible',
      },
      safe: true,
    });
  });

  it('should not throw when create log fails', async () => {
    const prisma = {
      adminAuditLog: {
        create: jest.fn().mockRejectedValue(new Error('db failed')),
      },
    };
    const localService = new AuditLogsService(
      prisma as unknown as PrismaService,
    );

    await expect(
      localService.createLog({
        action: AdminAuditAction.SYSTEM,
        entityType: 'System',
        message: 'Audit test',
      }),
    ).resolves.toBeUndefined();
  });
});
