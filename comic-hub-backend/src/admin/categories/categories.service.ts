import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { CreateAdminCategoryDto } from './dto/create-admin-category.dto';
import { UpdateAdminCategoryDto } from './dto/update-admin-category.dto';

const categorySelect = {
  id: true,
  name: true,
  slug: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class CategoriesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  findAll() {
    return this.prisma.category.findMany({
      select: {
        ...categorySelect,
        _count: {
          select: {
            comics: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async create(dto: CreateAdminCategoryDto) {
    await this.ensureSlugAvailable(dto.slug);

    const category = await this.prisma.category.create({
      data: dto,
      select: categorySelect,
    });

    await this.clearPublicCatalogCache();

    return category;
  }

  async update(id: number, dto: UpdateAdminCategoryDto) {
    await this.ensureCategoryExists(id);

    if (dto.slug) {
      await this.ensureSlugAvailable(dto.slug, id);
    }

    const category = await this.prisma.category.update({
      where: {
        id,
      },
      data: dto,
      select: categorySelect,
    });

    await this.clearPublicCatalogCache();

    return category;
  }

  async remove(id: number) {
    await this.ensureCategoryExists(id);

    const linkedComics = await this.prisma.comicCategory.count({
      where: {
        categoryId: id,
      },
    });

    if (linkedComics > 0) {
      throw new BadRequestException(
        'Cannot delete category because it is linked to comics',
      );
    }

    const category = await this.prisma.category.delete({
      where: {
        id,
      },
      select: categorySelect,
    });

    await this.clearPublicCatalogCache();

    return category;
  }

  private async ensureCategoryExists(id: number) {
    const category = await this.prisma.category.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }
  }

  private async ensureSlugAvailable(slug: string, ignoredCategoryId?: number) {
    const category = await this.prisma.category.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
      },
    });

    if (category && category.id !== ignoredCategoryId) {
      throw new ConflictException('Category slug already exists');
    }
  }

  private async clearPublicCatalogCache() {
    await this.redis.del('comics:all');
    await this.redis.del('comics:latest');
    await this.redis.del('comics:hot');
    await this.redis.del('categories:all');
    await this.redis.delByPattern('categories:*:comics:*');
    await this.redis.delByPattern('authors:*:comics:*');
    await this.redis.delByPattern('search:comics:*');
  }
}
