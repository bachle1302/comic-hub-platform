import { createHash } from 'node:crypto';
import { Injectable, NotFoundException } from '@nestjs/common';
import {
  AdminAuditAction,
  ContactTicket,
  ContactTicketStatus,
  Prisma,
} from '@prisma/client';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { AuditLogsService } from '../admin/audit-logs/audit-logs.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateContactTicketDto } from './dto/create-contact-ticket.dto';
import { ListContactTicketsQueryDto } from './dto/list-contact-tickets-query.dto';
import { UpdateContactTicketDto } from './dto/update-contact-ticket.dto';

type RequestContext = {
  ip?: string;
  user?: AuthenticatedUser | null;
  userAgent?: string;
};

type AdminRequestContext = {
  admin?: AuthenticatedUser;
  ip?: string;
  userAgent?: string;
};

@Injectable()
export class ContactTicketsService {
  constructor(
    private readonly auditLogsService: AuditLogsService,
    private readonly prisma: PrismaService,
  ) {}

  async createTicket(dto: CreateContactTicketDto, context: RequestContext) {
    const ticket = await this.prisma.contactTicket.create({
      data: {
        userId: context.user?.id,
        type: dto.type,
        status: ContactTicketStatus.NEW,
        name: this.normalizeOptionalString(dto.name),
        email: dto.email.trim().toLowerCase(),
        subject: dto.subject.trim(),
        message: dto.message.trim(),
        relatedUrl: this.normalizeOptionalString(dto.relatedUrl),
        orderCode: this.normalizeOptionalString(dto.orderCode),
        ipHash: this.hashIp(context.ip),
        userAgent: this.normalizeOptionalString(context.userAgent),
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    return {
      message: 'Yêu cầu hỗ trợ đã được gửi thành công',
      ticket,
    };
  }

  async listTickets(query: ListContactTicketsQueryDto) {
    const page = this.normalizePage(query.page);
    const limit = this.normalizeLimit(query.limit);
    const where = this.buildWhere(query);
    const skip = (page - 1) * limit;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.contactTicket.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              avatar: true,
            },
          },
        },
      }),
      this.prisma.contactTicket.count({
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

  async getTicket(id: number) {
    const ticket = await this.prisma.contactTicket.findUnique({
      where: {
        id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    if (!ticket) {
      throw new NotFoundException('Contact ticket not found');
    }

    return ticket;
  }

  async updateTicket(
    id: number,
    dto: UpdateContactTicketDto,
    context: AdminRequestContext,
  ) {
    const existingTicket = await this.prisma.contactTicket.findUnique({
      where: {
        id,
      },
    });

    if (!existingTicket) {
      throw new NotFoundException('Contact ticket not found');
    }

    const data: Prisma.ContactTicketUpdateInput = {};

    if (dto.status) {
      data.status = dto.status;

      if (
        dto.status === ContactTicketStatus.RESOLVED &&
        !existingTicket.resolvedAt
      ) {
        data.resolvedAt = new Date();
      }

      if (
        dto.status === ContactTicketStatus.CLOSED &&
        !existingTicket.closedAt
      ) {
        data.closedAt = new Date();
      }
    }

    if (dto.adminNote !== undefined) {
      data.adminNote = this.normalizeOptionalString(dto.adminNote);
    }

    const updatedTicket = await this.prisma.contactTicket.update({
      where: {
        id,
      },
      data,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatar: true,
          },
        },
      },
    });

    await this.writeUpdateAuditLog(existingTicket, updatedTicket, context);

    return updatedTicket;
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

  private buildWhere(
    query: ListContactTicketsQueryDto,
  ): Prisma.ContactTicketWhereInput {
    const trimmedQuery = query.q?.trim();

    return {
      type: query.type,
      status: query.status,
      email: query.email
        ? {
            contains: query.email.trim(),
            mode: 'insensitive',
          }
        : undefined,
      userId: query.userId,
      createdAt: this.buildDateFilter(query.dateFrom, query.dateTo),
      OR: trimmedQuery
        ? [
            {
              subject: {
                contains: trimmedQuery,
                mode: 'insensitive',
              },
            },
            {
              message: {
                contains: trimmedQuery,
                mode: 'insensitive',
              },
            },
            {
              email: {
                contains: trimmedQuery,
                mode: 'insensitive',
              },
            },
            {
              name: {
                contains: trimmedQuery,
                mode: 'insensitive',
              },
            },
            {
              orderCode: {
                contains: trimmedQuery,
                mode: 'insensitive',
              },
            },
            {
              relatedUrl: {
                contains: trimmedQuery,
                mode: 'insensitive',
              },
            },
          ]
        : undefined,
    };
  }

  private hashIp(ip?: string): string | undefined {
    const normalizedIp = ip?.trim();

    if (!normalizedIp) {
      return undefined;
    }

    return createHash('sha256').update(normalizedIp).digest('hex');
  }

  private normalizeLimit(limit?: number) {
    if (!limit || !Number.isFinite(limit)) {
      return 20;
    }

    return Math.min(Math.max(Math.trunc(limit), 1), 100);
  }

  private normalizeOptionalString(value?: string): string | undefined {
    const normalizedValue = value?.trim();

    return normalizedValue ? normalizedValue : undefined;
  }

  private normalizePage(page?: number) {
    if (!page || !Number.isFinite(page)) {
      return 1;
    }

    return Math.max(Math.trunc(page), 1);
  }

  private async writeUpdateAuditLog(
    oldTicket: ContactTicket,
    updatedTicket: ContactTicket,
    context: AdminRequestContext,
  ): Promise<void> {
    await this.auditLogsService.createLog({
      admin: context.admin,
      action: AdminAuditAction.UPDATE_CONTACT_TICKET,
      entityType: 'ContactTicket',
      entityId: updatedTicket.id,
      message: 'Admin updated contact ticket',
      metadata: {
        oldStatus: oldTicket.status,
        newStatus: updatedTicket.status,
        type: updatedTicket.type,
        email: updatedTicket.email,
        subject: updatedTicket.subject,
      },
      ip: context.ip,
      userAgent: context.userAgent,
    });
  }
}
