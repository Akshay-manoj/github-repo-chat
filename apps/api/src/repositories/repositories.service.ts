import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';

@Injectable()
export class RepositoriesService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('repository-index-queue') private readonly indexQueue: Queue,
  ) {}

  async importRepository(githubUrl: string) {
    if (!githubUrl || !githubUrl.includes('github.com')) {
      throw new BadRequestException('Invalid GitHub URL');
    }

    // Check if repo already exists
    let repository = await this.prisma.repository.findUnique({
      where: { github_url: githubUrl },
    });

    if (!repository) {
      repository = await this.prisma.repository.create({
        data: {
          github_url: githubUrl,
          // We'll populate language and default_branch later during indexing
        },
      });
    }

    // Push indexing job to BullMQ
    await this.indexQueue.add('index-repo', {
      repositoryId: repository.id,
      githubUrl: repository.github_url,
    });

    return {
      message: 'Repository import started successfully',
      repositoryId: repository.id,
      status: 'indexing',
    };
  }

  async getRepository(id: string) {
    return this.prisma.repository.findUnique({
      where: { id },
      include: {
        _count: {
          select: { files: true },
        },
      },
    });
  }

  async listRepositories() {
    return this.prisma.repository.findMany({
      orderBy: { created_at: 'desc' },
    });
  }

  async getRepositoryFiles(id: string) {
    return this.prisma.file.findMany({
      where: { repository_id: id },
      select: {
        id: true,
        path: true,
        _count: { select: { chunks: true } },
      },
      orderBy: { path: 'asc' },
    });
  }
}
