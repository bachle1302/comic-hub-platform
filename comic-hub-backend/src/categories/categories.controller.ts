import { Controller, Get, Param, Query } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CategoryComicsQueryDto } from './dto/category-comics-query.dto';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  @Get()
  findAll() {
    return this.categoriesService.findAll();
  }

  @Get(':slug/comics')
  findComicsBySlug(
    @Param('slug') slug: string,
    @Query() query: CategoryComicsQueryDto,
  ) {
    return this.categoriesService.findComicsBySlug(slug, query);
  }
}
