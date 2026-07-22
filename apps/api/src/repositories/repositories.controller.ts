import { Controller, Post, Body, Get, Param, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { RepositoriesService } from './repositories.service';

@Controller('repositories')
export class RepositoriesController {
  private readonly logger = new Logger(RepositoriesController.name);

  constructor(private readonly repositoriesService: RepositoriesService) {}

  @Post()
  async importRepository(@Body('githubUrl') githubUrl: string) {
    try {
      return await this.repositoriesService.importRepository(githubUrl);
    } catch (error) {
      this.logger.error(`Failed to import repo: ${error.message}`, error.stack);
      throw new HttpException({
        status: HttpStatus.INTERNAL_SERVER_ERROR,
        error: error.message,
        stack: error.stack,
      }, HttpStatus.INTERNAL_SERVER_ERROR);
    }
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
