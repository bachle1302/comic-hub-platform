import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { TokenBucketRateLimit } from '../rate-limit/decorators/token-bucket.decorator';
import { PurchasesService } from './purchases.service';

const PURCHASES_TOKEN_BUCKET = {
  capacity: 5,
  refillRate: 1,
  refillIntervalMs: 3000,
  cost: 1,
  keyPrefix: 'purchases',
} as const;

@UseGuards(JwtAuthGuard)
@Controller()
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @TokenBucketRateLimit(PURCHASES_TOKEN_BUCKET)
  @Post('purchases/chapters/:chapterId')
  purchaseChapter(
    @CurrentUser() user: AuthenticatedUser,
    @Param('chapterId', ParseIntPipe) chapterId: number,
  ) {
    return this.purchasesService.purchaseChapter(user.id, chapterId);
  }

  @Get('purchases/me')
  findMyPurchases(@CurrentUser() user: AuthenticatedUser) {
    return this.purchasesService.findMyPurchases(user.id);
  }

  @Get('purchases/chapters/:chapterId/access')
  checkChapterAccess(
    @CurrentUser() user: AuthenticatedUser,
    @Param('chapterId', ParseIntPipe) chapterId: number,
  ) {
    return this.purchasesService.checkChapterAccess(user.id, chapterId);
  }

  @Get('me/wallet')
  getWallet(@CurrentUser() user: AuthenticatedUser) {
    return this.purchasesService.getWallet(user.id);
  }

  @Get('me/transactions')
  getTransactions(@CurrentUser() user: AuthenticatedUser) {
    return this.purchasesService.getTransactions(user.id);
  }
}
