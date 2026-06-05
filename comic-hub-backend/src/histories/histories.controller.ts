import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { UpsertHistoryDto } from './dto/upsert-history.dto';
import { HistoriesService } from './histories.service';

@UseGuards(JwtAuthGuard)
@Controller('histories')
export class HistoriesController {
  constructor(private readonly historiesService: HistoriesService) {}

  @Post()
  upsertHistory(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: UpsertHistoryDto,
  ) {
    return this.historiesService.upsertHistory(user.id, dto);
  }

  @Get('me')
  findMyHistories(
    @CurrentUser() user: AuthenticatedUser,
    @Query('limit') limit?: string,
  ) {
    const parsedLimit = limit === undefined ? undefined : Number(limit);

    return this.historiesService.findMyHistories(user.id, parsedLimit);
  }

  @Get('comics/:comicId')
  findComicHistory(
    @CurrentUser() user: AuthenticatedUser,
    @Param('comicId', ParseIntPipe) comicId: number,
  ) {
    return this.historiesService.findComicHistory(user.id, comicId);
  }

  @Delete(':id')
  deleteHistory(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id', ParseIntPipe) id: number,
  ) {
    return this.historiesService.deleteHistory(user.id, id);
  }
}
