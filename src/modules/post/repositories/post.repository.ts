import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import { Post, Prisma } from '@prisma/client';

@Injectable()
export class PostRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findUnique(where: Prisma.PostWhereUniqueInput): Promise<Post | null> {
    return this.prisma.post.findUnique({ where });
  }

  async findMany(params: {
    where?: Prisma.PostWhereInput;
    skip?: number;
    take?: number;
    orderBy?: Prisma.PostOrderByWithRelationInput;
    select?: Prisma.PostSelect;
  }): Promise<Post[]> {
    const { where, skip, take, orderBy, select } = params;
    return this.prisma.post.findMany({
      where,
      skip,
      take,
      orderBy,
      select,
    });
  }

  async count(where?: Prisma.PostWhereInput): Promise<number> {
    return this.prisma.post.count({ where });
  }

  async create(data: Prisma.PostCreateInput): Promise<Post> {
    return this.prisma.post.create({ data });
  }

  async update(params: {
    where: Prisma.PostWhereUniqueInput;
    data: Prisma.PostUpdateInput;
  }): Promise<Post> {
    const { where, data } = params;
    return this.prisma.post.update({ where, data });
  }

  async delete(where: Prisma.PostWhereUniqueInput): Promise<Post> {
    return this.prisma.post.delete({ where });
  }

  async transaction<T>(fn: (prisma: PrismaService) => Promise<T>): Promise<T> {
    return this.prisma.$transaction(fn);
  }

  async findManyWithCount(params: {
    where?: Prisma.PostWhereInput;
    skip?: number;
    take?: number;
    orderBy?: Prisma.PostOrderByWithRelationInput;
    select?: Prisma.PostSelect;
  }): Promise<{ items: Post[]; total: number }> {
    const { where, skip, take, orderBy, select } = params;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.post.findMany({
        where,
        skip,
        take,
        orderBy,
        select,
      }),
      this.prisma.post.count({ where }),
    ]);

    return { items, total };
  }

  async searchPosts(
    params: string,
  ): Promise<{ items: Omit<Post, 'content'>[]; total: number }> {
    const where: Prisma.PostWhereInput = {
      OR: [
        {
          title: {
            contains: params,
          },
        },
        {
          content: {
            contains: params,
          },
        },
      ],
    };

    const select: Prisma.PostSelect = {
      id: true,
      title: true,
      slug: true,
      summary: true,
      thumbnail_url: true,
      status: true,
      created_at: true,
      updated_at: true,
      published_at: true,
    };

    const orderBy: Prisma.PostOrderByWithRelationInput = { created_at: 'desc' };

    return this.findManyWithCount({
      where,
      select,
      orderBy,
    });
  }

  async findPostsWithFilters(params: {
    page?: number;
    limit?: number;
    filters?: {
      status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
      search?: string;
      author?: string;
      createdFrom?: string;
      createdTo?: string;
      sortBy?: 'created_at' | 'updated_at' | 'title' | 'status';
      sortOrder?: 'asc' | 'desc';
      tags?: string[];
    };
  }): Promise<{ items: Omit<Post, 'content'>[]; total: number }> {
    const { page = 1, limit = 10, filters } = params;
    const skip = (page - 1) * limit;

    // Build where clause
    const where: Prisma.PostWhereInput = {};

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { content: { contains: filters.search, mode: 'insensitive' } },
        { summary: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    if (filters?.createdFrom || filters?.createdTo) {
      where.created_at = {};
      if (filters.createdFrom) {
        (where.created_at as Prisma.DateTimeFilter).gte = new Date(
          filters.createdFrom,
        );
      }
      if (filters.createdTo) {
        (where.created_at as Prisma.DateTimeFilter).lte = new Date(
          filters.createdTo,
        );
      }
    }

    // Build orderBy clause
    const orderBy: Prisma.PostOrderByWithRelationInput = {};
    const sortBy = filters?.sortBy || 'created_at';
    const sortOrder = filters?.sortOrder || 'desc';
    orderBy[sortBy] = sortOrder;

    const select: Prisma.PostSelect = {
      id: true,
      title: true,
      slug: true,
      summary: true,
      thumbnail_url: true,
      status: true,
      created_at: true,
      updated_at: true,
      published_at: true,
    };

    return this.findManyWithCount({
      where,
      skip,
      take: limit,
      orderBy,
      select,
    });
  }
}
