import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { AuthenticatedUser } from '../auth/types/authenticated-user.type';
import { ListRecommendationsQueryDto } from './dto/list-recommendations-query.dto';
import { RecommendationsService } from './recommendations.service';

const DEFAULT_LIMIT = 12;

@Controller('recommendations')
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
  ) {}

  /**
   * GET /recommendations/home
   * Public endpoint — returns popular/fallback recommendations.
   */
  @Get('home')
  getHome(@Query() query: ListRecommendationsQueryDto) {
    const limit = query.limit ?? DEFAULT_LIMIT;
    return this.recommendationsService.getHomeRecommendations(limit);
  }

  /**
   * GET /recommendations/me
   * Protected — returns personalized recommendations for the logged-in user.
   */
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getMe(
    @CurrentUser() user: AuthenticatedUser,
    @Query() query: ListRecommendationsQueryDto,
  ) {
    const limit = query.limit ?? DEFAULT_LIMIT;
    return this.recommendationsService.getUserRecommendations(user.id, limit);
  }

  /**
   * GET /recommendations/comics/:slug/similar
   * Public — returns comics similar to the given slug.
   */
  @Get('comics/:slug/similar')
  getSimilar(
    @Param('slug') slug: string,
    @Query() query: ListRecommendationsQueryDto,
  ) {
    const limit = query.limit ?? DEFAULT_LIMIT;
    return this.recommendationsService.getSimilarComics(slug, limit);
  }
}
