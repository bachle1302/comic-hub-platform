import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { CreateAdminAuthorDto } from './dto/create-admin-author.dto';
import { UpdateAdminAuthorDto } from './dto/update-admin-author.dto';

const authorSelect = {
  id: true,
  name: true,
  slug: true,
  createdAt: true,
  updatedAt: true,
};

@Injectable()
export class AuthorsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async findAll() {
    const authors = await this.prisma.author.findMany({
      select: {
        ...authorSelect,
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

    return authors.map(({ _count, ...author }) => ({
      ...author,
      comicCount: _count.comics,
      _count,
    }));
  }

  async create(dto: CreateAdminAuthorDto) {
    await this.ensureSlugAvailable(dto.slug);

    const author = await this.prisma.author.create({
      data: dto,
      select: authorSelect,
    });

    await this.clearPublicCatalogCache();

    return author;
  }

  async update(id: number, dto: UpdateAdminAuthorDto) {
    await this.ensureAuthorExists(id);

    if (dto.slug) {
      await this.ensureSlugAvailable(dto.slug, id);
    }

    const author = await this.prisma.author.update({
      where: {
        id,
      },
      data: dto,
      select: authorSelect,
    });

    await this.clearPublicCatalogCache();

    return author;
  }

  async remove(id: number) {
    await this.ensureAuthorExists(id);

    const linkedComics = await this.prisma.comic.count({
      where: {
        authorId: id,
      },
    });

    if (linkedComics > 0) {
      throw new BadRequestException(
        'Cannot delete author because it is linked to comics',
      );
    }

    const author = await this.prisma.author.delete({
      where: {
        id,
      },
      select: authorSelect,
    });

    await this.clearPublicCatalogCache();

    return author;
  }

  private async ensureAuthorExists(id: number) {
    const author = await this.prisma.author.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
      },
    });

    if (!author) {
      throw new NotFoundException('Author not found');
    }
  }

  private async ensureSlugAvailable(slug: string, ignoredAuthorId?: number) {
    const author = await this.prisma.author.findUnique({
      where: {
        slug,
      },
      select: {
        id: true,
      },
    });

    if (author && author.id !== ignoredAuthorId) {
      throw new ConflictException('Author slug already exists');
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
