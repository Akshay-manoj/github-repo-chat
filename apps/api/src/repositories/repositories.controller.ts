import { Controller, Post, Body, Get, Param } from '@nestjs/common';
import { RepositoriesService } from './repositories.service';

@Controller('repositories')
export class RepositoriesController {
  constructor(private readonly repositoriesService: RepositoriesService) {}

  @Post()
  async importRepository(@Body('githubUrl') githubUrl: string) {
    return this.repositoriesService.importRepository(githubUrl);
  }

  @Get()
  async listRepositories() {
    return this.repositoriesService.listRepositories();
  }

  @Get(':id')
  async getRepository(@Param('id') id: string) {
    return this.repositoriesService.getRepository(id);
  }
}
