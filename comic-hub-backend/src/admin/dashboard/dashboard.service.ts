import { Injectable } from '@nestjs/common';
import { Role } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats() {
    const [
      totalUsers,
      totalAdmins,
      totalComics,
      publicComics,
      totalChapters,
      publicChapters,
      paidChapters,
      freeChapters,
      totalComments,
      totalFollows,
      totalPurchases,
      purchaseCoinAggregate,
      totalTransactions,
    ] = await this.prisma.$transaction([
      this.prisma.user.count(),
      this.prisma.user.count({
        where: {
          role: Role.ADMIN,
        },
      }),
      this.prisma.comic.count(),
      this.prisma.comic.count({
        where: {
          isPublic: true,
        },
      }),
      this.prisma.chapter.count(),
      this.prisma.chapter.count({
        where: {
          isPublic: true,
        },
      }),
      this.prisma.chapter.count({
        where: {
          price: {
            gt: 0,
          },
        },
      }),
      this.prisma.chapter.count({
        where: {
          price: {
            lte: 0,
          },
        },
      }),
      this.prisma.comment.count(),
      this.prisma.follow.count(),
      this.prisma.purchase.count(),
      this.prisma.purchase.aggregate({
        _sum: {
          price: true,
        },
      }),
      this.prisma.transaction.count(),
    ]);

    return {
      users: {
        total: totalUsers,
        admins: totalAdmins,
      },
      comics: {
        total: totalComics,
        public: publicComics,
      },
      chapters: {
        total: totalChapters,
        public: publicChapters,
        paid: paidChapters,
        free: freeChapters,
      },
      comments: {
        total: totalComments,
      },
      follows: {
        total: totalFollows,
      },
      purchases: {
        total: totalPurchases,
        totalCoinSpent: purchaseCoinAggregate._sum.price ?? 0,
      },
      transactions: {
        total: totalTransactions,
      },
    };
  }
}
