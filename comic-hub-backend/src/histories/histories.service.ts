import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpsertHistoryDto } from './dto/upsert-history.dto';

@Injectable()
export class HistoriesService {
  constructor(private readonly prisma: PrismaService) {}

  async upsertHistory(userId: number, dto: UpsertHistoryDto) {
    const comic = await this.prisma.comic.findUnique({
      where: {
        id: dto.comicId,
      },
      select: {
        id: true,
        isPublic: true,
        deletedAt: true,
      },
    });

    if (!comic || !comic.isPublic || comic.deletedAt !== null) {
      throw new NotFoundException('Comic not found');
    }

    const chapter = await this.prisma.chapter.findFirst({
      where: {
        id: dto.chapterId,
        comicId: dto.comicId,
        isPublic: true,
        deletedAt: null,
      },
      select: {
        id: true,
        price: true,
      },
    });

    if (!chapter) {
      throw new NotFoundException('Chapter not found');
    }

    if (chapter.price > 0) {
      const purchase = await this.prisma.purchase.findUnique({
        where: {
          userId_chapterId: {
            userId,
            chapterId: dto.chapterId,
          },
        },
        select: {
          id: true,
        },
      });

      if (!purchase) {
        throw new ForbiddenException('Chapter has not been purchased');
      }
    }

    return this.prisma.history.upsert({
      where: {
        userId_comicId: {
          userId,
          comicId: dto.comicId,
        },
      },
      update: {
        chapterId: dto.chapterId,
        imageIndex: dto.imageIndex ?? 0,
        progress: dto.progress ?? 0,
        updatedAt: new Date(),
      },
      create: {
        userId,
        comicId: dto.comicId,
        chapterId: dto.chapterId,
        imageIndex: dto.imageIndex ?? 0,
        progress: dto.progress ?? 0,
      },
      include: {
        comic: true,
        chapter: true,
      },
    });
  }

  findMyHistories(userId: number, limit?: number) {
    const take = this.normalizeLimit(limit);

    return this.prisma.history.findMany({
      where: {
        userId,
      },
      take,
      orderBy: {
        updatedAt: 'desc',
      },
      include: {
        comic: {
          select: {
            id: true,
            name: true,
            slug: true,
            thumbnail: true,
            status: true,
          },
        },
        chapter: {
          select: {
            id: true,
            name: true,
            chapterNumber: true,
            price: true,
          },
        },
      },
    });
  }

  async findComicHistory(userId: number, comicId: number) {
    const history = await this.prisma.history.findUnique({
      where: {
        userId_comicId: {
          userId,
          comicId,
        },
      },
      include: {
        comic: {
          select: {
            id: true,
            name: true,
            slug: true,
            thumbnail: true,
            status: true,
          },
        },
        chapter: {
          select: {
            id: true,
            name: true,
            chapterNumber: true,
            price: true,
          },
        },
      },
    });

    return {
      history,
    };
  }

  async deleteHistory(userId: number, id: number) {
    const history = await this.prisma.history.findFirst({
      where: {
        id,
        userId,
      },
      select: {
        id: true,
      },
    });

    if (!history) {
      throw new NotFoundException('History not found');
    }

    await this.prisma.history.delete({
      where: {
        id,
      },
    });

    return {
      message: 'History deleted successfully',
    };
  }

  private normalizeLimit(limit?: number) {
    if (!limit || !Number.isFinite(limit)) {
      return 50;
    }

    return Math.min(Math.max(Math.trunc(limit), 1), 100);
  }
}
