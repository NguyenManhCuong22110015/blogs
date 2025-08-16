import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from '../dto/v1/create-post.dto';
import { UpdatePostDto } from '../dto/v1/update-post.dto';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import { Post } from '@prisma/client';
import { ImageService } from '@/common/image/image.service';
import { RedisService } from '@/infrastructure/cache/redis/redis.service';
import slugify from 'slugify';

@Injectable()
export class PostService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly imageService: ImageService,
    private readonly redisService: RedisService,
  ) {}

  private async generateUniqueSlug(baseSlug: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (await this.prisma.post.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  async search(
    params: string,
  ): Promise<{ items: Omit<Post, 'content'>[]; total: number }> {
    if (!params || params.trim() === '') {
      return this.findAll();
    }

    const cacheKey = `posts:search:${params}`;
    const cached = await this.redisService.get<{
      items: Omit<Post, 'content'>[];
      total: number;
    }>(cacheKey);

    if (cached) return cached;

    const [items, total] = await this.prisma.$transaction([
      this.prisma.post.findMany({
        where: {
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
        },
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          summary: true,
          thumbnail_url: true,
          status: true,
          created_at: true,
          updated_at: true,
          published_at: true,
        },
      }),
      this.prisma.post.count({
        where: {
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
        },
      }),
    ]);

    const result = { items, total };
    const ttl = 60; // seconds
    await this.redisService.set(cacheKey, result, ttl);
    return result;
  }

  async create(createPostDto: CreatePostDto) {
    const uniqueSlug = await this.generateUniqueSlug(createPostDto.slug);
    const created = await this.prisma.post.create({
      data: { ...createPostDto, slug: uniqueSlug },
    });
    // Invalidate cached lists
    await this.redisService.delByPattern('posts:list:*');
    await this.redisService.delByPattern('posts:search:*');
    return created;
  }
  async createV2(
    createPostDto: CreatePostDto,
    file?: Express.Multer.File,
  ): Promise<Post> {
    let imageUrl: string | undefined;

    if (file) {
      if (!file.mimetype.startsWith('image/')) {
        throw new BadRequestException('File không phải hình ảnh');
      }
      const upload = await this.imageService.uploadImage(file);
      imageUrl = upload?.url;
    }

    const rawSlug =
      createPostDto.slug || slugify(createPostDto.title, { lower: true });
    const uniqueSlug = await this.generateUniqueSlug(rawSlug);

    const created = await this.prisma.post.create({
      data: {
        ...createPostDto,
        ...(imageUrl && { thumbnail_url: imageUrl }),
        slug: uniqueSlug,
      },
    });
    await this.redisService.delByPattern('posts:list:*');
    await this.redisService.delByPattern('posts:search:*');
    return created;
  }

  async findAll(
    page = 1,
    limit = 10,
  ): Promise<{ items: Omit<Post, 'content'>[]; total: number }> {
    const skip = (page - 1) * limit;
    const cacheKey = `posts:list:${page}:${limit}`;
    const cached = await this.redisService.get<{
      items: Omit<Post, 'content'>[];
      total: number;
    }>(cacheKey);
    console.log('Cached:', cached);
    if (cached) return cached;
    const [items, total] = await this.prisma.$transaction([
      this.prisma.post.findMany({
        skip,
        take: limit,
        orderBy: { created_at: 'desc' },
        select: {
          id: true,
          title: true,
          slug: true,
          summary: true,
          thumbnail_url: true,
          status: true,
          created_at: true,
          updated_at: true,
          published_at: true,
        },
      }),
      this.prisma.post.count(),
    ]);
    const result = { items, total };
    const ttl = 60; // seconds; could move to config if needed
    await this.redisService.set(cacheKey, result, ttl);
    return result;
  }

  async findOne(id: string) {
    const cacheKey = `posts:detail:${id}`;
    const cached = await this.redisService.get<Post>(cacheKey);
    if (cached) return cached;
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Post not found');
    await this.redisService.set(cacheKey, post, 120);
    return post;
  }

  async update(id: string, updatePostDto: UpdatePostDto) {
    try {
      // Check if post exists first
      const existingPost = await this.prisma.post.findUnique({
        where: { id },
      });

      if (!existingPost) {
        throw new NotFoundException(`Post with ID ${id} not found`);
      }

      // If slug is being updated, generate unique slug if needed
      if (updatePostDto.slug && updatePostDto.slug !== existingPost.slug) {
        updatePostDto.slug = await this.generateUniqueSlug(updatePostDto.slug);
      }

      const updated = await this.prisma.post.update({
        where: { id },
        data: updatePostDto,
      });

      // Clear cache after successful update
      try {
        await this.redisService.del([`posts:detail:${id}`]);
        await this.redisService.delByPattern('posts:list:*');
        await this.redisService.delByPattern('posts:search:*');
      } catch (cacheError) {
        console.error('Cache clearing error:', cacheError);
        // Don't fail the update if cache clearing fails
      }

      return updated;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }

      console.error('Update post error:', error);
      throw new Error(`Failed to update post: ${(error as Error).message}`);
    }
  }

  async remove(id: string) {
    try {
      // Check if post exists first
      const existingPost = await this.prisma.post.findUnique({
        where: { id },
      });

      if (!existingPost) {
        throw new NotFoundException(`Post with ID ${id} not found`);
      }

      const deleted = await this.prisma.post.delete({ where: { id } });

      // Clear cache after successful deletion
      try {
        await this.redisService.del([`posts:detail:${id}`]);
        await this.redisService.delByPattern('posts:list:*');
        await this.redisService.delByPattern('posts:search:*');
      } catch (cacheError) {
        console.error('Cache clearing error:', cacheError);
        // Don't fail the deletion if cache clearing fails
      }

      return deleted;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      console.error('Remove post error:', error);
      throw new Error(`Failed to remove post: ${(error as Error).message}`);
    }
  }
}
