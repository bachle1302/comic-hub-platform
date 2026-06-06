import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  Prisma,
  Role,
  TransactionStatus,
  TransactionType,
} from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { AdjustUserCoinDto } from './dto/adjust-user-coin.dto';
import { BanUserDto } from './dto/ban-user.dto';
import { ListAdminUsersQueryDto } from './dto/list-admin-users-query.dto';

type PaginationInput = {
  limit?: number;
  page?: number;
};

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(query: ListAdminUsersQueryDto) {
    const page = this.normalizePage(query.page);
    const limit = this.normalizeLimit(query.limit);
    const skip = (page - 1) * limit;
    const where = this.buildUserWhere(query);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        select: this.userListSelect(),
      }),
      this.prisma.user.count({
        where,
      }),
    ]);
    const totalPages = Math.ceil(total / limit);

    return {
      items: items.map((item) => this.addBanStatus(item)),
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

  async findOne(id: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
      select: this.userDetailSelect(),
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.addBanStatus(user);
  }

  async adjustCoin(id: number, dto: AdjustUserCoinDto) {
    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          coin: true,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      const balanceBefore = user.coin;
      const balanceAfter = balanceBefore + dto.amount;

      if (balanceAfter < 0) {
        throw new BadRequestException('Balance cannot be negative');
      }

      const updatedUser = await tx.user.update({
        where: {
          id,
        },
        data: {
          coin: balanceAfter,
        },
        select: {
          id: true,
          coin: true,
        },
      });

      const transaction = await tx.transaction.create({
        data: {
          userId: id,
          amount: dto.amount,
          balanceBefore,
          balanceAfter,
          description:
            dto.reason ??
            (dto.amount > 0 ? 'Admin coin recharge' : 'Admin coin deduction'),
          type:
            dto.amount > 0 ? TransactionType.RECHARGE : TransactionType.SPEND,
          status: TransactionStatus.SUCCESS,
        },
        select: this.transactionSelect(),
      });

      return {
        user: updatedUser,
        transaction,
      };
    });
  }

  async banUser(id: number, dto: BanUserDto, adminId: number) {
    if (id === adminId) {
      throw new ForbiddenException('Admin cannot ban themselves');
    }

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: {
          id,
        },
        select: {
          id: true,
          role: true,
          bannedAt: true,
        },
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      if (user.role === Role.ADMIN) {
        throw new ForbiddenException('Admin users cannot be banned');
      }

      if (!user.bannedAt) {
        await tx.user.update({
          where: {
            id,
          },
          data: {
            bannedAt: new Date(),
            banReason: this.optionalReason(dto.reason),
          },
        });
      }

      await tx.refreshToken.updateMany({
        where: {
          userId: id,
          isRevoked: false,
        },
        data: {
          isRevoked: true,
        },
      });

      const updatedUser = await tx.user.findUnique({
        where: {
          id,
        },
        select: this.userDetailSelect(),
      });

      if (!updatedUser) {
        throw new NotFoundException('User not found');
      }

      return this.addBanStatus(updatedUser);
    });
  }

  async unbanUser(id: number) {
    await this.ensureUserExists(id);

    const user = await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        bannedAt: null,
        banReason: null,
      },
      select: this.userDetailSelect(),
    });

    return this.addBanStatus(user);
  }

  async findUserTransactions(id: number, pagination: PaginationInput) {
    await this.ensureUserExists(id);

    const page = this.normalizePage(pagination.page);
    const limit = this.normalizeLimit(pagination.limit);
    const skip = (page - 1) * limit;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.transaction.findMany({
        where: {
          userId: id,
        },
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        select: this.transactionSelect(),
      }),
      this.prisma.transaction.count({
        where: {
          userId: id,
        },
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

  private async ensureUserExists(id: number) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }
  }

  private buildUserWhere(query: ListAdminUsersQueryDto): Prisma.UserWhereInput {
    const trimmedQuery = query.q?.trim();

    return {
      role: query.role,
      OR: trimmedQuery
        ? [
            {
              name: {
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
          ]
        : undefined,
    };
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

  private userListSelect() {
    return {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      coin: true,
      emailVerifiedAt: true,
      provider: true,
      googleId: true,
      bannedAt: true,
      banReason: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          purchases: true,
          comments: true,
          follows: true,
          histories: true,
          transactions: true,
        },
      },
    } satisfies Prisma.UserSelect;
  }

  private userDetailSelect() {
    return {
      id: true,
      name: true,
      email: true,
      role: true,
      avatar: true,
      coin: true,
      emailVerifiedAt: true,
      provider: true,
      googleId: true,
      bannedAt: true,
      banReason: true,
      createdAt: true,
      updatedAt: true,
      _count: {
        select: {
          purchases: true,
          comments: true,
          follows: true,
          histories: true,
          transactions: true,
        },
      },
      purchases: {
        take: 5,
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          id: true,
          price: true,
          createdAt: true,
          chapter: {
            select: {
              id: true,
              name: true,
              chapterNumber: true,
              comic: {
                select: {
                  id: true,
                  name: true,
                  slug: true,
                },
              },
            },
          },
        },
      },
      transactions: {
        take: 10,
        orderBy: {
          createdAt: 'desc',
        },
        select: this.transactionSelect(),
      },
    } satisfies Prisma.UserSelect;
  }

  private transactionSelect() {
    return {
      id: true,
      userId: true,
      amount: true,
      orderId: true,
      type: true,
      status: true,
      balanceBefore: true,
      balanceAfter: true,
      description: true,
      createdAt: true,
    } satisfies Prisma.TransactionSelect;
  }

  private addBanStatus<
    T extends {
      bannedAt: Date | null;
      emailVerifiedAt: Date | null;
      googleId: string | null;
    },
  >(
    user: T,
  ): T & {
    hasGoogleLinked: boolean;
    isBanned: boolean;
    isEmailVerified: boolean;
  } {
    return {
      ...user,
      hasGoogleLinked: user.googleId !== null,
      isBanned: user.bannedAt !== null,
      isEmailVerified: user.emailVerifiedAt !== null,
    };
  }

  private optionalReason(value?: string): string | null {
    const trimmed = value?.trim();

    return trimmed ? trimmed : null;
  }
}
