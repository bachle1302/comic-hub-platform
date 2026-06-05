import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { NotificationsService } from '../../notifications/notifications.service';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { CreateAdminChapterDto } from './dto/create-admin-chapter.dto';
import { ChapterImageDto } from './dto/chapter-image.dto';
import { UpdateAdminChapterDto } from './dto/update-admin-chapter.dto';

const chapterListSelect = {
  id: true,
  name: true,
  chapterNumber: true,
  price: true,
  isPublic: true,
  deletedAt: true,
  deletedById: true,
  deleteReason: true,
  viewTotal: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      images: true,
      comments: true,
      purchases: true,
    },
  },
} as const;

const chapterDetailSelect = {
  id: true,
  name: true,
  chapterNumber: true,
  price: true,
  isPublic: true,
  deletedAt: true,
  deletedById: true,
  deleteReason: true,
  viewTotal: true,
  comic: {
    select: {
      id: true,
      name: true,
      slug: true,
      thumbnail: true,
    },
  },
  images: {
    select: {
      id: true,
      url: true,
      key: true,
      order: true,
      width: true,
      height: true,
      size: true,
      mimeType: true,
    },
    orderBy: {
      order: 'asc',
    },
  },
  createdAt: true,
  updatedAt: true,
} as const;

type ComicIdentity = {
  deletedAt: Date | null;
  id: number;
  isPublic: boolean;
  name: string;
  slug: string;
};

type DeletedFilter = 'active' | 'deleted' | 'all';

@Injectable()
export class ChaptersService {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async findAllByComic(comicId: number, deleted: DeletedFilter = 'active') {
    await this.ensureComicExists(comicId);

    return this.prisma.chapter.findMany({
      where: this.withDeletedFilter({ comicId }, deleted),
      select: chapterListSelect,
      orderBy: {
        chapterNumber: 'desc',
      },
    });
  }

  async create(comicId: number, dto: CreateAdminChapterDto) {
    const comic = await this.ensureComicExists(comicId);
    if (comic.deletedAt !== null) {
      throw new BadRequestException(
        'Comic is deleted. Restore before updating.',
      );
    }

    await this.ensureChapterNumberAvailable(comicId, dto.chapterNumber);

    const chapter = await this.prisma.$transaction(async (tx) => {
      const createdChapter = await tx.chapter.create({
        data: {
          name: dto.name,
          chapterNumber: dto.chapterNumber,
          price: dto.price,
          isPublic: dto.isPublic,
          comicId,
        },
        select: {
          id: true,
        },
      });

      if (dto.images && dto.images.length > 0) {
        await tx.chapterImage.createMany({
          data: this.toImageCreateManyInput(createdChapter.id, dto.images),
        });
      }

      const chapterCount = await tx.chapter.count({
        where: {
          comicId,
          deletedAt: null,
        },
      });

      await tx.comic.update({
        where: {
          id: comicId,
        },
        data: {
          chapterCount,
          lastChapterAt: new Date(),
        },
      });

      return tx.chapter.findUnique({
        where: {
          id: createdChapter.id,
        },
        select: chapterDetailSelect,
      });
    });

    await this.clearComicCache(comic.slug);

    if (comic.isPublic && dto.isPublic !== false && chapter) {
      await this.notificationsService.createNewChapterNotifications({
        chapterId: chapter.id,
        chapterName: chapter.name,
        chapterNumber: chapter.chapterNumber,
        comicId: comic.id,
        comicName: comic.name,
        comicSlug: comic.slug,
      });
    }

    return chapter;
  }

  async findOne(id: number) {
    const chapter = await this.prisma.chapter.findUnique({
      where: {
        id,
      },
      select: chapterDetailSelect,
    });

    if (!chapter) {
      throw new NotFoundException('Chapter not found');
    }

    return chapter;
  }

  async update(id: number, dto: UpdateAdminChapterDto) {
    const chapter = await this.ensureChapterExists(id);

    if (chapter.deletedAt !== null) {
      throw new BadRequestException(
        'Chapter is deleted. Restore before updating.',
      );
    }

    if (dto.chapterNumber !== undefined) {
      await this.ensureChapterNumberAvailable(
        chapter.comicId,
        dto.chapterNumber,
        id,
      );
    }

    const { images, ...chapterData } = dto;

    const updatedChapter = await this.prisma.$transaction(async (tx) => {
      await tx.chapter.update({
        where: {
          id,
        },
        data: chapterData,
      });

      if (images) {
        await tx.chapterImage.deleteMany({
          where: {
            chapterId: id,
          },
        });

        if (images.length > 0) {
          await tx.chapterImage.createMany({
            data: this.toImageCreateManyInput(id, images),
          });
        }
      }

      return tx.chapter.findUnique({
        where: {
          id,
        },
        select: chapterDetailSelect,
      });
    });

    await this.clearComicCache(chapter.comic.slug);

    return updatedChapter;
  }

  async remove(id: number, deletedById: number) {
    const chapter = await this.ensureChapterExists(id);

    await this.prisma.$transaction(async (tx) => {
      if (chapter.deletedAt === null) {
        await tx.chapter.update({
          where: {
            id,
          },
          data: {
            deletedAt: new Date(),
            deletedById,
            deleteReason: null,
            isPublic: false,
          },
        });
      }

      const chapterCount = await tx.chapter.count({
        where: {
          comicId: chapter.comicId,
          deletedAt: null,
        },
      });

      const latestChapter = await tx.chapter.findFirst({
        where: {
          comicId: chapter.comicId,
          deletedAt: null,
        },
        orderBy: {
          createdAt: 'desc',
        },
        select: {
          createdAt: true,
        },
      });

      await tx.comic.update({
        where: {
          id: chapter.comicId,
        },
        data: {
          chapterCount,
          lastChapterAt: latestChapter?.createdAt ?? null,
        },
      });
    });

    await this.clearComicCache(chapter.comic.slug);

    return {
      message: 'Chapter deleted successfully',
      chapter: {
        id: chapter.id,
        comicId: chapter.comicId,
        chapterNumber: chapter.chapterNumber,
        comicSlug: chapter.comic.slug,
      },
    };
  }

  private async ensureComicExists(comicId: number): Promise<ComicIdentity> {
    const comic = await this.prisma.comic.findUnique({
      where: {
        id: comicId,
      },
      select: {
        id: true,
        name: true,
        isPublic: true,
        slug: true,
        deletedAt: true,
      },
    });

    if (!comic) {
      throw new NotFoundException('Comic not found');
    }

    return comic;
  }

  private async ensureChapterExists(id: number) {
    const chapter = await this.prisma.chapter.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        comicId: true,
        chapterNumber: true,
        deletedAt: true,
        comic: {
          select: {
            slug: true,
          },
        },
      },
    });

    if (!chapter) {
      throw new NotFoundException('Chapter not found');
    }

    return chapter;
  }

  private withDeletedFilter(
    where: Prisma.ChapterWhereInput,
    deleted: DeletedFilter,
  ): Prisma.ChapterWhereInput {
    if (deleted === 'all') {
      return where;
    }

    return {
      ...where,
      deletedAt: deleted === 'deleted' ? { not: null } : null,
    };
  }

  private async ensureChapterNumberAvailable(
    comicId: number,
    chapterNumber: number,
    ignoredChapterId?: number,
  ) {
    const chapter = await this.prisma.chapter.findFirst({
      where: {
        comicId,
        chapterNumber,
      },
      select: {
        id: true,
      },
    });

    if (chapter && chapter.id !== ignoredChapterId) {
      throw new ConflictException('Chapter number already exists');
    }
  }

  private toImageCreateManyInput(chapterId: number, images: ChapterImageDto[]) {
    return images.map((image) => ({
      chapterId,
      url: image.url,
      key: image.key,
      order: image.order,
      width: image.width,
      height: image.height,
      size: image.size,
      mimeType: image.mimeType,
    }));
  }

  private async clearComicCache(slug: string) {
    await this.redis.del('comics:all');
    await this.redis.del('comics:latest');
    await this.redis.del('comics:hot');
    await this.redis.delByPattern('comics:ranking:*');
    await this.redis.del('categories:all');
    await this.redis.del(`comics:detail:${slug}`);
    await this.redis.delByPattern(`comics:chapter:${slug}:*`);
    await this.redis.delByPattern('categories:*:comics:*');
    await this.redis.delByPattern('authors:*:comics:*');
    await this.redis.delByPattern('search:comics:*');
  }
}
