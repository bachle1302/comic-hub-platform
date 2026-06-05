import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { CreateAdminComicDto } from './dto/create-admin-comic.dto';
import { UpdateAdminComicDto } from './dto/update-admin-comic.dto';

const comicInclude = {
  author: {
    select: {
      id: true,
      name: true,
      slug: true,
    },
  },
  categories: {
    include: {
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  },
  chapters: {
    where: {
      deletedAt: null,
    },
    orderBy: {
      chapterNumber: 'desc',
    },
    take: 1,
    select: {
      id: true,
      name: true,
      chapterNumber: true,
      price: true,
      isPublic: true,
      createdAt: true,
    },
  },
  _count: {
    select: {
      chapters: true,
      follows: true,
      comments: true,
      likes: true,
    },
  },
} satisfies Prisma.ComicInclude;

type DeletedFilter = 'active' | 'deleted' | 'all';

@Injectable()
export class ComicsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  findAll(deleted: DeletedFilter = 'active') {
    return this.prisma.comic.findMany({
      where: this.withDeletedFilter({}, deleted),
      orderBy: {
        createdAt: 'desc',
      },
      include: comicInclude,
    });
  }

  async create(dto: CreateAdminComicDto) {
    await this.ensureSlugAvailable(dto.slug);
    await this.ensureAuthorExists(dto.authorId);
    await this.ensureCategoriesExist(dto.categoryIds ?? []);

    const comic = await this.prisma.comic.create({
      data: {
        name: dto.name,
        slug: dto.slug,
        description: this.optionalText(dto.description),
        seoTitle: this.optionalText(dto.seoTitle),
        seoDescription: this.optionalText(dto.seoDescription),
        thumbnail: this.optionalText(dto.thumbnail),
        status: dto.status,
        isPublic: dto.isPublic ?? true,
        authorId: dto.authorId,
        categories: {
          create: (dto.categoryIds ?? []).map((categoryId) => ({
            categoryId,
          })),
        },
      },
      include: comicInclude,
    });

    await this.clearPublicCatalogCache(comic.slug);

    return comic;
  }

  async update(id: number, dto: UpdateAdminComicDto) {
    const existingComic = await this.findExistingComic(id);

    if (existingComic.deletedAt !== null) {
      throw new BadRequestException(
        'Comic is deleted. Restore before updating.',
      );
    }

    if (dto.slug) {
      await this.ensureSlugAvailable(dto.slug, id);
    }

    if (dto.authorId) {
      await this.ensureAuthorExists(dto.authorId);
    }

    if (dto.categoryIds) {
      await this.ensureCategoriesExist(dto.categoryIds);
    }

    const updatedComic = await this.prisma.$transaction(async (tx) => {
      if (dto.categoryIds) {
        await tx.comicCategory.deleteMany({
          where: {
            comicId: id,
          },
        });
      }

      return tx.comic.update({
        where: {
          id,
        },
        data: {
          name: dto.name,
          slug: dto.slug,
          description:
            dto.description === undefined
              ? undefined
              : this.optionalText(dto.description),
          seoTitle:
            dto.seoTitle === undefined
              ? undefined
              : this.optionalText(dto.seoTitle),
          seoDescription:
            dto.seoDescription === undefined
              ? undefined
              : this.optionalText(dto.seoDescription),
          thumbnail:
            dto.thumbnail === undefined
              ? undefined
              : this.optionalText(dto.thumbnail),
          status: dto.status,
          isPublic: dto.isPublic,
          authorId: dto.authorId,
          categories: dto.categoryIds
            ? {
                create: dto.categoryIds.map((categoryId) => ({
                  categoryId,
                })),
              }
            : undefined,
        },
        include: comicInclude,
      });
    });

    await this.clearPublicCatalogCache(existingComic.slug);
    await this.clearPublicCatalogCache(updatedComic.slug);

    return updatedComic;
  }

  async remove(id: number, deletedById: number) {
    const existingComic = await this.findExistingComic(id);

    if (existingComic.deletedAt === null) {
      await this.prisma.comic.update({
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

    await this.clearPublicCatalogCache(existingComic.slug);

    return {
      message: 'Comic deleted successfully',
      comic: {
        id: existingComic.id,
        slug: existingComic.slug,
      },
    };
  }

  private async findExistingComic(id: number) {
    const comic = await this.prisma.comic.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        slug: true,
        deletedAt: true,
      },
    });

    if (!comic) {
      throw new NotFoundException('Comic not found');
    }

    return comic;
  }

  private withDeletedFilter(
    where: Prisma.ComicWhereInput,
    deleted: DeletedFilter,
  ): Prisma.ComicWhereInput {
    if (deleted === 'all') {
      return where;
    }

    return {
      ...where,
      deletedAt: deleted === 'deleted' ? { not: null } : null,
    };
  }

  private async ensureSlugAvailable(slug: string, ignoredComicId?: number) {
    const comic = await this.prisma.comic.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
      },
    });

    if (comic && comic.id !== ignoredComicId) {
      throw new ConflictException('Comic slug already exists');
    }
  }

  private async ensureAuthorExists(authorId: number) {
    const author = await this.prisma.author.findUnique({
      where: {
        id: authorId,
      },
      select: {
        id: true,
      },
    });

    if (!author) {
      throw new BadRequestException('Author not found');
    }
  }

  private async ensureCategoriesExist(categoryIds: number[]) {
    const uniqueCategoryIds = Array.from(new Set(categoryIds));

    if (uniqueCategoryIds.length === 0) {
      return;
    }

    const count = await this.prisma.category.count({
      where: {
        id: {
          in: uniqueCategoryIds,
        },
      },
    });

    if (count !== uniqueCategoryIds.length) {
      throw new BadRequestException('One or more categories were not found');
    }
  }

  private optionalText(value?: string): string | null | undefined {
    if (value === undefined) {
      return undefined;
    }

    const trimmed = value.trim();

    return trimmed ? trimmed : null;
  }

  private async clearPublicCatalogCache(slug: string) {
    await this.redis.del('comics:all');
    await this.redis.del('comics:latest');
    await this.redis.del('comics:hot');
    await this.redis.delByPattern('comics:ranking:*');
    await this.redis.del(`comics:detail:${slug}`);
    await this.redis.delByPattern(`comics:chapter:${slug}:*`);
    await this.redis.del('categories:all');
    await this.redis.delByPattern('categories:*:comics:*');
    await this.redis.delByPattern('authors:*:comics:*');
    await this.redis.delByPattern('search:comics:*');
  }
}
