import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { ViewsService } from '../views/views.service';

type ViewContext = {
  ip?: string | null;
  userAgent?: string | null;
};

type ReaderImage = {
  height: number | null;
  id: number;
  key: string | null;
  mimeType: string | null;
  order: number;
  size: number | null;
  url: string;
  width: number | null;
};

@Injectable()
export class ReaderService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storageService: StorageService,
    private readonly viewsService: ViewsService,
  ) {}

  async findProtectedChapter(
    userId: number,
    comicSlug: string,
    chapterNumber: number,
    viewContext?: ViewContext,
  ) {
    const comic = await this.prisma.comic.findUnique({
      where: {
        slug: comicSlug,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        thumbnail: true,
        isPublic: true,
        deletedAt: true,
      },
    });

    if (!comic || !comic.isPublic || comic.deletedAt !== null) {
      throw new NotFoundException('Comic not found');
    }

    const chapter = await this.prisma.chapter.findFirst({
      where: {
        comicId: comic.id,
        chapterNumber,
        isPublic: true,
        deletedAt: null,
      },
      select: {
        id: true,
        name: true,
        chapterNumber: true,
        price: true,
        isPublic: true,
        viewTotal: true,
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
      },
    });

    if (!chapter) {
      throw new NotFoundException('Chapter not found');
    }

    const isFree = chapter.price <= 0;
    const purchase = isFree
      ? null
      : await this.prisma.purchase.findUnique({
          where: {
            userId_chapterId: {
              userId,
              chapterId: chapter.id,
            },
          },
          select: {
            id: true,
          },
        });
    const isPurchased = Boolean(purchase);
    const hasAccess = isFree || isPurchased;
    const navigation = await this.getNavigation(comic.id, chapterNumber);

    if (hasAccess) {
      void this.viewsService.trackView({
        targetType: 'CHAPTER',
        comicId: comic.id,
        chapterId: chapter.id,
        userId,
        ip: viewContext?.ip,
        userAgent: viewContext?.userAgent,
      });
    }

    return {
      comic: {
        id: comic.id,
        name: comic.name,
        slug: comic.slug,
        thumbnail: comic.thumbnail,
      },
      chapter: {
        id: chapter.id,
        name: chapter.name,
        chapterNumber: chapter.chapterNumber,
        price: chapter.price,
        isPublic: chapter.isPublic,
        viewTotal: chapter.viewTotal,
      },
      images: await this.resolveChapterImages({
        hasAccess,
        images: chapter.images,
        isPaid: chapter.price > 0,
      }),
      navigation,
      access: {
        hasAccess,
        isFree,
        isPurchased,
        price: chapter.price,
      },
    };
  }

  private async resolveChapterImages(input: {
    hasAccess: boolean;
    images: ReaderImage[];
    isPaid: boolean;
  }): Promise<ReaderImage[]> {
    if (!input.hasAccess) {
      return [];
    }

    if (!input.isPaid || !this.storageService.isPrivateBucketMode()) {
      return input.images;
    }

    return Promise.all(
      input.images.map(async (image) => {
        if (!image.key) {
          return image;
        }

        return {
          ...image,
          url: await this.storageService.createPresignedReadUrl({
            key: image.key,
          }),
        };
      }),
    );
  }

  private async getNavigation(comicId: number, chapterNumber: number) {
    const previousChapter = await this.prisma.chapter.findFirst({
      where: {
        comicId,
        chapterNumber: {
          lt: chapterNumber,
        },
        isPublic: true,
        deletedAt: null,
      },
      orderBy: {
        chapterNumber: 'desc',
      },
      select: {
        chapterNumber: true,
        name: true,
      },
    });

    const nextChapter = await this.prisma.chapter.findFirst({
      where: {
        comicId,
        chapterNumber: {
          gt: chapterNumber,
        },
        isPublic: true,
        deletedAt: null,
      },
      orderBy: {
        chapterNumber: 'asc',
      },
      select: {
        chapterNumber: true,
        name: true,
      },
    });

    return {
      previousChapter,
      nextChapter,
    };
  }
}
