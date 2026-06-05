import { NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import {
  AdminAuditAction,
  ContactTicketStatus,
  ContactTicketType,
} from '@prisma/client';
import { AuditLogsService } from '../admin/audit-logs/audit-logs.service';
import { PrismaService } from '../prisma/prisma.service';
import { ContactTicketsService } from './contact-tickets.service';

const now = new Date('2026-06-04T00:00:00.000Z');

type ContactTicketCreateCall = {
  data?: {
    email?: unknown;
    ipHash?: unknown;
    message?: unknown;
    subject?: unknown;
  };
  include?: unknown;
};

type ContactTicketUpdateCall = {
  data?: {
    resolvedAt?: unknown;
    status?: unknown;
  };
  include?: unknown;
  where?: unknown;
};

type ContactTicketFixture = {
  adminNote: string | null;
  closedAt: Date | null;
  createdAt: Date;
  email: string;
  id: number;
  ipHash: string | null;
  message: string;
  name: string | null;
  orderCode: string | null;
  relatedUrl: string | null;
  resolvedAt: Date | null;
  status: ContactTicketStatus;
  subject: string;
  type: ContactTicketType;
  updatedAt: Date;
  userAgent: string | null;
  userId: number | null;
};

function createTicket(
  overrides: Partial<ContactTicketFixture> = {},
): ContactTicketFixture {
  return {
    id: 1,
    userId: null,
    type: ContactTicketType.TECHNICAL,
    status: ContactTicketStatus.NEW,
    name: 'Reader',
    email: 'reader@example.com',
    subject: 'Cannot upload image',
    message: 'Upload fails with a storage error',
    relatedUrl: null,
    orderCode: null,
    adminNote: null,
    ipHash: null,
    userAgent: null,
    createdAt: now,
    updatedAt: now,
    resolvedAt: null,
    closedAt: null,
    ...overrides,
  };
}

describe('ContactTicketsService', () => {
  let capturedCreateInput: ContactTicketCreateCall | undefined;
  let capturedUpdateInput: ContactTicketUpdateCall | undefined;
  let createLogMock: jest.MockedFunction<(input: unknown) => Promise<void>>;
  let prisma: {
    $transaction: jest.MockedFunction<
      (queries: unknown[]) => Promise<[unknown[], number]>
    >;
    contactTicket: {
      count: jest.MockedFunction<() => Promise<number>>;
      create: jest.MockedFunction<
        (input: ContactTicketCreateCall) => Promise<unknown>
      >;
      findMany: jest.MockedFunction<() => Promise<unknown[]>>;
      findUnique: jest.MockedFunction<() => Promise<unknown>>;
      update: jest.MockedFunction<
        (input: ContactTicketUpdateCall) => Promise<unknown>
      >;
    };
  };
  let service: ContactTicketsService;

  beforeEach(async () => {
    capturedCreateInput = undefined;
    capturedUpdateInput = undefined;
    createLogMock = jest
      .fn<(input: unknown) => Promise<void>>()
      .mockResolvedValue(undefined);
    prisma = {
      $transaction:
        jest.fn<(queries: unknown[]) => Promise<[unknown[], number]>>(),
      contactTicket: {
        count: jest.fn<() => Promise<number>>(),
        create: jest.fn<(input: ContactTicketCreateCall) => Promise<unknown>>(),
        findMany: jest.fn<() => Promise<unknown[]>>(),
        findUnique: jest.fn<() => Promise<unknown>>(),
        update: jest.fn<(input: ContactTicketUpdateCall) => Promise<unknown>>(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ContactTicketsService,
        {
          provide: AuditLogsService,
          useValue: {
            createLog: createLogMock,
          },
        },
        {
          provide: PrismaService,
          useValue: prisma,
        },
      ],
    }).compile();

    service = module.get<ContactTicketsService>(ContactTicketsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('creates a ticket with normalized fields and hashed IP', async () => {
    const ticket = createTicket({
      ipHash:
        '12ca17b49af22894b8e55c0b3a901afabdd04fbe2ecef2d5b29ae9e35dd94eaf',
    });

    prisma.contactTicket.create.mockImplementation(
      (input: ContactTicketCreateCall) => {
        capturedCreateInput = input;

        return Promise.resolve(ticket);
      },
    );

    const result = await service.createTicket(
      {
        type: ContactTicketType.TECHNICAL,
        email: 'Reader@Example.com',
        subject: ' Cannot upload image ',
        message: ' Upload fails with a storage error ',
      },
      {
        ip: '127.0.0.1',
        userAgent: 'jest',
      },
    );

    expect(result.ticket).toEqual(ticket);
    expect(capturedCreateInput?.data?.email).toBe('reader@example.com');
    expect(capturedCreateInput?.data?.subject).toBe('Cannot upload image');
    expect(capturedCreateInput?.data?.message).toBe(
      'Upload fails with a storage error',
    );
    expect(capturedCreateInput?.data?.ipHash).not.toBe('127.0.0.1');
  });

  it('lists tickets with pagination metadata', async () => {
    const ticket = createTicket();

    prisma.contactTicket.findMany.mockResolvedValue([ticket]);
    prisma.contactTicket.count.mockResolvedValue(1);
    prisma.$transaction.mockResolvedValue([[ticket], 1]);

    await expect(service.listTickets({ page: 1, limit: 20 })).resolves.toEqual({
      items: [ticket],
      meta: {
        page: 1,
        limit: 20,
        total: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });
  });

  it('throws NotFoundException when updating missing ticket', async () => {
    prisma.contactTicket.findUnique.mockResolvedValue(null);

    await expect(
      service.updateTicket(
        404,
        {
          status: ContactTicketStatus.RESOLVED,
        },
        {},
      ),
    ).rejects.toBeInstanceOf(NotFoundException);
  });

  it('sets resolvedAt and writes audit log when resolving ticket', async () => {
    const existingTicket = createTicket();
    const updatedTicket = createTicket({
      status: ContactTicketStatus.RESOLVED,
      resolvedAt: now,
    });

    prisma.contactTicket.findUnique.mockResolvedValue(existingTicket);
    prisma.contactTicket.update.mockImplementation(
      (input: ContactTicketUpdateCall) => {
        capturedUpdateInput = input;

        return Promise.resolve(updatedTicket);
      },
    );

    await expect(
      service.updateTicket(
        1,
        {
          status: ContactTicketStatus.RESOLVED,
        },
        {
          ip: '127.0.0.1',
          userAgent: 'jest',
        },
      ),
    ).resolves.toEqual(updatedTicket);

    expect(capturedUpdateInput?.data?.status).toBe(
      ContactTicketStatus.RESOLVED,
    );
    expect(capturedUpdateInput?.data?.resolvedAt).toBeInstanceOf(Date);
    expect(createLogMock).toHaveBeenCalledWith(
      expect.objectContaining({
        action: AdminAuditAction.UPDATE_CONTACT_TICKET,
        entityType: 'ContactTicket',
        entityId: 1,
      }),
    );
  });
});
