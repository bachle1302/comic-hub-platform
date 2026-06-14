import { Controller, Get, Query } from '@nestjs/common';
import { TokenBucketRateLimit } from '../rate-limit/decorators/token-bucket.decorator';
import { SearchComicsQueryDto } from './dto/search-comics-query.dto';
import { SearchSuggestionsQueryDto } from './dto/search-suggestions-query.dto';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @TokenBucketRateLimit({
    capacity: 30,
    refillRate: 2,
    refillIntervalMs: 1000,
    cost: 1,
    keyPrefix: 'search',
  })
  @Get('suggestions')
  suggestions(@Query() query: SearchSuggestionsQueryDto) {
    return this.searchService.suggestions(query);
  }

  @TokenBucketRateLimit({
    capacity: 30,
    refillRate: 2,
    refillIntervalMs: 1000,
    cost: 1,
    keyPrefix: 'search',
  })
  @Get()
  search(@Query() query: SearchComicsQueryDto) {
    return this.searchService.search(query);
  }
}
