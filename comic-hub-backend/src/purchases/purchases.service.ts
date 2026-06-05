import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, TransactionStatus, TransactionType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PurchasesService {
  constructor(private readonly prisma: PrismaService) {}

  async purchaseChapter(userId: number, chapterId: number) {
    const chapter = await this.prisma.chapter.findUnique({
      where: {
        id: chapterId,
      },
      select: {
        id: true,
        name: true,
        chapterNumber: true,
        price: true,
        deletedAt: true,
        comic: {
          select: {
            name: true,
            deletedAt: true,
            isPublic: true,
          },
        },
      },
    });

    if (
      !chapter ||
      chapter.deletedAt !== null ||
      chapter.comic.deletedAt !== null ||
      !chapter.comic.isPublic
    ) {
      throw new NotFoundException('Chapter not found');
    }

    if (chapter.price <= 0) {
      return {
        message: 'Chapter is free',
        purchase: null,
        user: await this.findUserCoin(userId),
        transaction: null,
      };
    }

    try {
      return await this.prisma.$transaction(async (tx) => {
        const existingPurchase = await this.findPurchase(userId, chapterId, tx);

        if (existingPurchase) {
          return {
            purchase: existingPurchase,
            user: await this.findUserCoin(userId, tx),
            transaction: null,
          };
        }

        const user = await tx.user.findUnique({
          where: {
            id: userId,
          },
          select: {
            id: true,
            coin: true,
          },
        });

        if (!user) {
          throw new NotFoundException('User not found');
        }

        if (user.coin < chapter.price) {
          throw new BadRequestException('Not enough coins');
        }

        const balanceBefore = user.coin;
        const balanceAfter = balanceBefore - chapter.price;

        const updatedUser = await tx.user.update({
          where: {
            id: userId,
          },
          data: {
            coin: {
              decrement: chapter.price,
            },
          },
          select: {
            id: true,
            coin: true,
          },
        });

        const purchase = await tx.purchase.create({
          data: {
            userId,
            chapterId,
            price: chapter.price,
          },
          include: {
            chapter: {
              select: {
                id: true,
                name: true,
                chapterNumber: true,
              },
            },
          },
        });

        const transaction = await tx.transaction.create({
          data: {
            userId,
            amount: -chapter.price,
            type: TransactionType.SPEND,
            status: TransactionStatus.SUCCESS,
            balanceBefore,
            balanceAfter,
            description: `Purchase chapter ${chapter.comic.name} - ${chapter.name}`,
          },
        });

        return {
          purchase,
          user: updatedUser,
          transaction,
        };
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        return {
          purchase: await this.findPurchase(userId, chapterId),
          user: await this.findUserCoin(userId),
          transaction: null,
        };
      }

      throw error;
    }
  }

  async findMyPurchases(userId: number) {
    return this.prisma.purchase.findMany({
      where: {
        userId,
      },
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
                thumbnail: true,
              },
            },
          },
        },
      },
    });
  }

  async checkChapterAccess(userId: number, chapterId: number) {
    const chapter = await this.prisma.chapter.findUnique({
      where: {
        id: chapterId,
      },
      select: {
        id: true,
        price: true,
        deletedAt: true,
        comic: {
          select: {
            deletedAt: true,
            isPublic: true,
          },
        },
      },
    });

    if (
      !chapter ||
      chapter.deletedAt !== null ||
      chapter.comic.deletedAt !== null ||
      !chapter.comic.isPublic
    ) {
      throw new NotFoundException('Chapter not found');
    }

    const isFree = chapter.price <= 0;

    if (isFree) {
      return {
        hasAccess: true,
        isFree: true,
        isPurchased: false,
        price: chapter.price,
      };
    }

    const purchase = await this.prisma.purchase.findUnique({
      where: {
        userId_chapterId: {
          userId,
          chapterId,
        },
      },
      select: {
        id: true,
      },
    });

    const isPurchased = Boolean(purchase);

    return {
      hasAccess: isPurchased,
      isFree: false,
      isPurchased,
      price: chapter.price,
    };
  }

  async getWallet(userId: number) {
    return this.findUserCoin(userId);
  }

  async getTransactions(userId: number) {
    return this.prisma.transaction.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      select: {
        id: true,
        amount: true,
        type: true,
        status: true,
        balanceBefore: true,
        balanceAfter: true,
        description: true,
        createdAt: true,
      },
    });
  }

  private async findUserCoin(
    userId: number,
    client: Prisma.TransactionClient | PrismaService = this.prisma,
  ) {
    const user = await client.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        coin: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  private findPurchase(
    userId: number,
    chapterId: number,
    client: Prisma.TransactionClient | PrismaService = this.prisma,
  ) {
    return client.purchase.findUnique({
      where: {
        userId_chapterId: {
          userId,
          chapterId,
        },
      },
      include: {
        chapter: {
          select: {
            id: true,
            name: true,
            chapterNumber: true,
          },
        },
      },
    });
  }
}
