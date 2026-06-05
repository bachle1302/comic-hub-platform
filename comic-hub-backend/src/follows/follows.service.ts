import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class FollowsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
  ) {}

  async followComic(userId: number, comicId: number) {
    const comic = await this.ensurePublicComic(comicId);

    const result = await this.prisma.$transaction(async (tx) => {
      const existingFollow = await tx.follow.findUnique({
        where: {
          userId_comicId: {
            userId,
            comicId,
          },
        },
      });

      if (existingFollow) {
        return {
          follow: existingFollow,
          changed: false,
        };
      }

      const follow = await tx.follow.create({
        data: {
          userId,
          comicId,
        },
      });

      await tx.comic.update({
        where: {
          id: comicId,
        },
        data: {
          followCount: {
            increment: 1,
          },
        },
      });

      return {
        follow,
        changed: true,
      };
    });

    if (result.changed) {
      await this.clearComicCache(comic.slug);
    }

    return {
      isFollowing: true,
      follow: result.follow,
    };
  }

  async unfollowComic(userId: number, comicId: number) {
    const comic = await this.ensurePublicComic(comicId);

    const deleted = await this.prisma.$transaction(async (tx) => {
      const existingFollow = await tx.follow.findUnique({
        where: {
          userId_comicId: {
            userId,
            comicId,
          },
        },
      });

      if (!existingFollow) {
        return false;
      }

      await tx.follow.delete({
        where: {
          id: existingFollow.id,
        },
      });

      await tx.comic.update({
        where: {
          id: comicId,
        },
        data:
          comic.followCount > 0
            ? {
                followCount: {
                  decrement: 1,
                },
              }
            : {
                followCount: 0,
              },
      });

      return true;
    });

    if (deleted) {
      await this.clearComicCache(comic.slug);
    }

    return {
      isFollowing: false,
    };
  }

  findMyFollows(userId: number) {
    return this.prisma.follow.findMany({
      where: {
        userId,
        comic: {
          isPublic: true,
          deletedAt: null,
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        comic: {
          include: {
            author: true,
            categories: {
              include: {
                category: true,
              },
            },
            chapters: {
              where: {
                isPublic: true,
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
                viewTotal: true,
                createdAt: true,
                updatedAt: true,
              },
            },
          },
        },
      },
    });
  }

  async getFollowStatus(userId: number, comicId: number) {
    await this.ensurePublicComic(comicId);

    const follow = await this.prisma.follow.findUnique({
      where: {
        userId_comicId: {
          userId,
          comicId,
        },
      },
      select: {
        id: true,
      },
    });

    return {
      isFollowing: Boolean(follow),
    };
  }

  private async ensurePublicComic(comicId: number) {
    const comic = await this.prisma.comic.findUnique({
      where: {
        id: comicId,
      },
      select: {
        id: true,
        slug: true,
        isPublic: true,
        deletedAt: true,
        followCount: true,
      },
    });

    if (!comic || !comic.isPublic || comic.deletedAt !== null) {
      throw new NotFoundException('Comic not found');
    }

    return comic;
  }

  private async clearComicCache(slug: string) {
    await this.redis.del('comics:all');
    await this.redis.del('comics:latest');
    await this.redis.del('comics:hot');
    await this.redis.delByPattern('comics:ranking:*');
    await this.redis.del(`comics:detail:${slug}`);
    await this.redis.delByPattern('search:comics:*');
    await this.redis.delByPattern('categories:*:comics:*');
    await this.redis.delByPattern('authors:*:comics:*');
  }
}
