import { Controller, Post, Body, Param } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('repositories/:id/search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  @Post()
  async search(
    @Param('id') repositoryId: string,
    @Body('query') query: string,
  ) {
    return this.searchService.searchRepository(repositoryId, query);
  }
}
