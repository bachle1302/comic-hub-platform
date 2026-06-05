import { Controller, Get, Param, Query } from '@nestjs/common';
import { AuthorsService } from './authors.service';
import { AuthorComicsQueryDto } from './dto/author-comics-query.dto';

@Controller('authors')
export class AuthorsController {
  constructor(private readonly authorsService: AuthorsService) {}

  @Get(':slug/comics')
  findComicsBySlug(
    @Param('slug') slug: string,
    @Query() query: AuthorComicsQueryDto,
  ) {
    return this.authorsService.findComicsBySlug(slug, query);
  }
}
