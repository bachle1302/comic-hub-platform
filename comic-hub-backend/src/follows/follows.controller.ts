import {
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  UseGuards,
} from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { FollowsService } from './follows.service';

@UseGuards(JwtAuthGuard)
@Controller('follows')
export class FollowsController {
  constructor(private readonly followsService: FollowsService) {}

  @Post('comics/:comicId')
  followComic(
    @CurrentUser() user: AuthenticatedUser,
    @Param('comicId', ParseIntPipe) comicId: number,
  ) {
    return this.followsService.followComic(user.id, comicId);
  }

  @Delete('comics/:comicId')
  unfollowComic(
    @CurrentUser() user: AuthenticatedUser,
    @Param('comicId', ParseIntPipe) comicId: number,
  ) {
    return this.followsService.unfollowComic(user.id, comicId);
  }

  @Get('me')
  findMyFollows(@CurrentUser() user: AuthenticatedUser) {
    return this.followsService.findMyFollows(user.id);
  }

  @Get('comics/:comicId/status')
  getFollowStatus(
    @CurrentUser() user: AuthenticatedUser,
    @Param('comicId', ParseIntPipe) comicId: number,
  ) {
    return this.followsService.getFollowStatus(user.id, comicId);
  }
}
