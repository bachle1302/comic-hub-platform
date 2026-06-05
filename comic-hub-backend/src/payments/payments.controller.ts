import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import type { Webhook } from '@payos/node';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { TokenBucketRateLimit } from '../rate-limit/decorators/token-bucket.decorator';
import { CreatePaymentOrderDto } from './dto/create-payment-order.dto';
import { ListPaymentOrdersQueryDto } from './dto/list-payment-orders-query.dto';
import { PaymentsService } from './payments.service';

const PAYMENTS_TOKEN_BUCKET = {
  capacity: 5,
  refillRate: 1,
  refillIntervalMs: 3000,
  cost: 1,
  keyPrefix: 'payments',
} as const;

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Get('coin-packages')
  findCoinPackages() {
    return this.paymentsService.findCoinPackages();
  }

  @UseGuards(JwtAuthGuard)
  @TokenBucketRateLimit(PAYMENTS_TOKEN_BUCKET)
  @Post('orders')
  createOrder(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreatePaymentOrderDto,
  ) {
    return this.paymentsService.createOrder(user.id, dto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('orders/me')
  findMyOrders(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListPaymentOrdersQueryDto,
  ) {
    return this.paymentsService.findMyOrders(user.id, query);
  }

  @UseGuards(JwtAuthGuard)
  @Get('orders/:id')
  findMyOrderById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.paymentsService.findMyOrderById(user.id, id);
  }

  @Post('payos/webhook')
  handlePayosWebhook(@Body() payload: Webhook) {
    return this.paymentsService.handlePayosWebhook(payload);
  }
}
