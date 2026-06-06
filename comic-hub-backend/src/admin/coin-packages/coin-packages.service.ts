import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { RedisService } from '../../redis/redis.service';
import { ACTIVE_COIN_PACKAGES_CACHE_KEY } from '../../payments/payment-cache-keys';
import { CreateCoinPackageDto } from './dto/create-coin-package.dto';
import { ListCoinPackagesQueryDto } from './dto/list-coin-packages-query.dto';
import { UpdateCoinPackageDto } from './dto/update-coin-package.dto';

const coinPackageSelect = {
  id: true,
  name: true,
  coin: true,
  price: true,
  bonusCoin: true,
  isActive: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
  _count: {
    select: {
      orders: true,
    },
  },
} satisfies Prisma.CoinPackageSelect;

type CoinPackagePayload = Prisma.CoinPackageGetPayload<{
  select: typeof coinPackageSelect;
}>;

@Injectable()
export class CoinPackagesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly redisService: RedisService,
  ) {}

  async findAll(query: ListCoinPackagesQueryDto) {
    const page = this.normalizePage(query.page);
    const limit = this.normalizeLimit(query.limit);
    const skip = (page - 1) * limit;
    const where = this.buildWhere(query);

    const [items, total] = await this.prisma.$transaction([
      this.prisma.coinPackage.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          {
            sortOrder: 'asc',
          },
          {
            price: 'asc',
          },
        ],
        select: coinPackageSelect,
      }),
      this.prisma.coinPackage.count({
        where,
      }),
    ]);
    const totalPages = Math.ceil(total / limit);

    return {
      items: items.map((item) => this.serializeCoinPackage(item)),
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
    const coinPackage = await this.prisma.coinPackage.findUnique({
      where: {
        id,
      },
      select: coinPackageSelect,
    });

    if (!coinPackage) {
      throw new NotFoundException('Coin package not found');
    }

    return this.serializeCoinPackage(coinPackage);
  }

  async create(dto: CreateCoinPackageDto) {
    const coinPackage = await this.prisma.coinPackage.create({
      data: {
        name: dto.name,
        coin: dto.coin,
        price: dto.price,
        bonusCoin: dto.bonusCoin,
        isActive: dto.isActive,
        sortOrder: dto.sortOrder,
      },
      select: coinPackageSelect,
    });

    await this.clearPublicCache();

    return this.serializeCoinPackage(coinPackage);
  }

  async update(id: number, dto: UpdateCoinPackageDto) {
    await this.findOne(id);

    const coinPackage = await this.prisma.coinPackage.update({
      where: {
        id,
      },
      data: {
        name: dto.name,
        coin: dto.coin,
        price: dto.price,
        bonusCoin: dto.bonusCoin,
        isActive: dto.isActive,
        sortOrder: dto.sortOrder,
      },
      select: coinPackageSelect,
    });

    await this.clearPublicCache();

    return this.serializeCoinPackage(coinPackage);
  }

  async disable(id: number) {
    await this.findOne(id);

    const coinPackage = await this.prisma.coinPackage.update({
      where: {
        id,
      },
      data: {
        isActive: false,
      },
      select: coinPackageSelect,
    });

    await this.clearPublicCache();

    return {
      message: 'Coin package disabled successfully',
      coinPackage: this.serializeCoinPackage(coinPackage),
    };
  }

  async clearPublicCache() {
    await this.redisService.del(ACTIVE_COIN_PACKAGES_CACHE_KEY);
  }

  private buildWhere(
    query: ListCoinPackagesQueryDto,
  ): Prisma.CoinPackageWhereInput {
    const trimmedQuery = query.q?.trim();

    return {
      isActive: query.isActive,
      OR: trimmedQuery
        ? [
            {
              name: {
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

  private serializeCoinPackage(coinPackage: CoinPackagePayload) {
    const { _count, ...rest } = coinPackage;

    return {
      ...rest,
      orderCount: _count.orders,
      totalCoin: rest.coin + rest.bonusCoin,
      _count,
    };
  }
}
