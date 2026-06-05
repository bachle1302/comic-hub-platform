import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  PaymentOrderStatus,
  PaymentProvider,
  Prisma,
  TransactionStatus,
  TransactionType,
} from '@prisma/client';
import type { Webhook, WebhookData } from '@payos/node';
import { PrismaService } from '../prisma/prisma.service';
import { PayosService } from './payos.service';
import type { CreatePaymentOrderDto } from './dto/create-payment-order.dto';
import type { ListPaymentOrdersQueryDto } from './dto/list-payment-orders-query.dto';
import { RedisService } from '../redis/redis.service';
import { ACTIVE_COIN_PACKAGES_CACHE_KEY } from './payment-cache-keys';

type PaymentOrderWithPackage = {
  amount: number;
  bonusCoin: number;
  checkoutUrl: string | null;
  coin: number;
  coinPackage: {
    id: number;
    name: string;
  } | null;
  createdAt: Date;
  id: number;
  orderCode: string;
  paidAt: Date | null;
  paymentLinkId: string | null;
  provider: PaymentProvider;
  status: PaymentOrderStatus;
  totalCoin: number;
  updatedAt: Date;
};

@Injectable()
export class PaymentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly payosService: PayosService,
    private readonly redisService: RedisService,
  ) {}

  async findCoinPackages() {
    const cached = await this.redisService.get<
      Array<{
        bonusCoin: number;
        coin: number;
        id: number;
        name: string;
        price: number;
        totalCoin: number;
      }>
    >(ACTIVE_COIN_PACKAGES_CACHE_KEY);

    if (cached) {
      return cached;
    }

    const packages = await this.prisma.coinPackage.findMany({
      where: {
        isActive: true,
      },
      orderBy: [
        {
          sortOrder: 'asc',
        },
        {
          price: 'asc',
        },
      ],
      select: {
        id: true,
        name: true,
        coin: true,
        bonusCoin: true,
        price: true,
      },
    });

    const mappedPackages = packages.map((coinPackage) => ({
      ...coinPackage,
      totalCoin: coinPackage.coin + coinPackage.bonusCoin,
    }));

    await this.redisService.set(
      ACTIVE_COIN_PACKAGES_CACHE_KEY,
      mappedPackages,
      300,
    );

    return mappedPackages;
  }

  async createOrder(userId: number, dto: CreatePaymentOrderDto) {
    const coinPackage = await this.prisma.coinPackage.findFirst({
      where: {
        id: dto.coinPackageId,
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        coin: true,
        bonusCoin: true,
        price: true,
      },
    });

    if (!coinPackage) {
      throw new NotFoundException('Coin package not found');
    }

    const totalCoin = coinPackage.coin + coinPackage.bonusCoin;
    const orderCode = await this.createUniqueOrderCode(userId);
    const order = await this.prisma.paymentOrder.create({
      data: {
        orderCode,
        userId,
        coinPackageId: coinPackage.id,
        provider: PaymentProvider.PAYOS,
        status: PaymentOrderStatus.PENDING,
        amount: coinPackage.price,
        coin: coinPackage.coin,
        bonusCoin: coinPackage.bonusCoin,
        totalCoin,
      },
      include: this.orderInclude(),
    });

    try {
      const paymentLink = await this.payosService.createPaymentLink({
        orderCode: Number(orderCode),
        amount: order.amount,
        description: `Nap ${totalCoin} coin`,
      });
      const updatedOrder = await this.prisma.paymentOrder.update({
        where: {
          id: order.id,
        },
        data: {
          checkoutUrl: paymentLink.checkoutUrl,
          paymentLinkId: paymentLink.paymentLinkId,
          providerPayload: paymentLink,
        },
        include: this.orderInclude(),
      });

      return {
        order: this.mapOrder(updatedOrder),
        checkoutUrl: paymentLink.checkoutUrl,
      };
    } catch (error) {
      await this.prisma.paymentOrder.update({
        where: {
          id: order.id,
        },
        data: {
          status: PaymentOrderStatus.FAILED,
          providerPayload: this.toJsonObject({
            message:
              error instanceof Error
                ? error.message
                : 'PayOS create payment link failed',
          }),
        },
      });

      throw error instanceof BadRequestException ||
        error instanceof NotFoundException
        ? error
        : new BadGatewayException(
            error instanceof Error
              ? error.message
              : 'PayOS create payment link failed',
          );
    }
  }

  async findMyOrders(userId: number, query: ListPaymentOrdersQueryDto) {
    const page = query.page ?? 1;
    const limit = Math.min(query.limit ?? 20, 100);
    const skip = (page - 1) * limit;
    const where = {
      userId,
    };
    const [items, total] = await Promise.all([
      this.prisma.paymentOrder.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          createdAt: 'desc',
        },
        include: this.orderInclude(),
      }),
      this.prisma.paymentOrder.count({
        where,
      }),
    ]);
    const totalPages = Math.ceil(total / limit);

    return {
      items: items.map((order) => this.mapOrder(order)),
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

  async findMyOrderById(userId: number, orderId: number) {
    const order = await this.prisma.paymentOrder.findFirst({
      where: {
        id: orderId,
        userId,
      },
      include: this.orderInclude(),
    });

    if (!order) {
      throw new NotFoundException('Payment order not found');
    }

    return this.mapOrder(order);
  }

  async handlePayosWebhook(payload: Webhook) {
    const webhookData = await this.payosService.verifyWebhook(payload);
    const order = await this.prisma.paymentOrder.findUnique({
      where: {
        orderCode: String(webhookData.orderCode),
      },
      select: {
        id: true,
        orderCode: true,
        status: true,
        amount: true,
        totalCoin: true,
        userId: true,
      },
    });

    if (!order) {
      return {
        message: 'Payment webhook received',
      };
    }

    if (order.status === PaymentOrderStatus.PAID) {
      return {
        message: 'Payment order already processed',
      };
    }

    if (webhookData.amount !== order.amount) {
      await this.prisma.paymentOrder.update({
        where: {
          id: order.id,
        },
        data: {
          status: PaymentOrderStatus.FAILED,
          providerPayload: this.toJsonObject(payload),
        },
      });

      return {
        message: 'Payment amount mismatch',
      };
    }

    if (this.isSuccessWebhook(payload, webhookData)) {
      await this.markOrderPaid(order, payload);

      return {
        message: 'Payment order processed successfully',
      };
    }

    await this.markOrderNotPaid(order.id, payload, webhookData);

    return {
      message: 'Payment webhook processed',
    };
  }

  private async markOrderPaid(
    order: {
      amount: number;
      id: number;
      orderCode: string;
      totalCoin: number;
      userId: number;
    },
    payload: Webhook,
  ) {
    try {
      await this.prisma.$transaction(async (tx) => {
        const currentOrder = await tx.paymentOrder.findUnique({
          where: {
            id: order.id,
          },
          select: {
            id: true,
            orderCode: true,
            status: true,
            totalCoin: true,
            userId: true,
          },
        });

        if (!currentOrder || currentOrder.status === PaymentOrderStatus.PAID) {
          return;
        }

        const user = await tx.user.findUnique({
          where: {
            id: currentOrder.userId,
          },
          select: {
            id: true,
            coin: true,
          },
        });

        if (!user) {
          throw new NotFoundException('User not found');
        }

        const balanceBefore = user.coin;
        const balanceAfter = balanceBefore + currentOrder.totalCoin;

        await tx.paymentOrder.update({
          where: {
            id: currentOrder.id,
          },
          data: {
            status: PaymentOrderStatus.PAID,
            paidAt: new Date(),
            providerPayload: this.toJsonObject(payload),
          },
        });
        await tx.user.update({
          where: {
            id: user.id,
          },
          data: {
            coin: balanceAfter,
          },
        });
        await tx.transaction.create({
          data: {
            userId: user.id,
            amount: currentOrder.totalCoin,
            orderId: `payment:${currentOrder.orderCode}`,
            type: TransactionType.RECHARGE,
            status: TransactionStatus.SUCCESS,
            balanceBefore,
            balanceAfter,
            description: `Recharge ${currentOrder.totalCoin} coins via PayOS`,
          },
        });
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        return;
      }

      throw error;
    }
  }

  private async markOrderNotPaid(
    orderId: number,
    payload: Webhook,
    webhookData: WebhookData,
  ) {
    const status =
      webhookData.code === '01'
        ? PaymentOrderStatus.CANCELLED
        : PaymentOrderStatus.FAILED;

    await this.prisma.paymentOrder.update({
      where: {
        id: orderId,
      },
      data: {
        status,
        cancelledAt:
          status === PaymentOrderStatus.CANCELLED ? new Date() : undefined,
        providerPayload: this.toJsonObject(payload),
      },
    });
  }

  private isSuccessWebhook(
    payload: Webhook,
    webhookData: WebhookData,
  ): boolean {
    return (
      payload.success && payload.code === '00' && webhookData.code === '00'
    );
  }

  private async createUniqueOrderCode(userId: number): Promise<string> {
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const orderCode = `${Date.now()}${userId % 1000}${Math.floor(
        Math.random() * 100,
      )
        .toString()
        .padStart(2, '0')}`;
      const existingOrder = await this.prisma.paymentOrder.findUnique({
        where: {
          orderCode,
        },
        select: {
          id: true,
        },
      });

      if (!existingOrder) {
        return orderCode;
      }
    }

    throw new BadRequestException('Could not create payment order code');
  }

  private orderInclude() {
    return {
      coinPackage: {
        select: {
          id: true,
          name: true,
        },
      },
    } satisfies Prisma.PaymentOrderInclude;
  }

  private mapOrder(order: PaymentOrderWithPackage) {
    return {
      id: order.id,
      orderCode: order.orderCode,
      provider: order.provider,
      status: order.status,
      amount: order.amount,
      coin: order.coin,
      bonusCoin: order.bonusCoin,
      totalCoin: order.totalCoin,
      checkoutUrl: order.checkoutUrl,
      paymentLinkId: order.paymentLinkId,
      paidAt: order.paidAt,
      createdAt: order.createdAt,
      updatedAt: order.updatedAt,
      coinPackage: order.coinPackage,
    };
  }

  private toJsonObject(value: unknown): Prisma.InputJsonObject {
    return JSON.parse(JSON.stringify(value)) as Prisma.InputJsonObject;
  }
}
