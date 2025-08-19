import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePostDto } from '../dto/v1/create-post.dto';
import { UpdatePostDto } from '../dto/v1/update-post.dto';
import { Post } from '@prisma/client';
import { ImageService } from '@/common/image/image.service';
import { RedisService } from '@/infrastructure/cache/redis/redis.service';
import { PostRepository } from '../repositories/post.repository';
import slugify from 'slugify';

@Injectable()
export class PostService {
  constructor(
    private readonly postRepository: PostRepository,
    private readonly imageService: ImageService,
    private readonly redisService: RedisService,
  ) {}

  private async generateUniqueSlug(baseSlug: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (await this.postRepository.findUnique({ slug })) {
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

    const result = await this.postRepository.searchPosts(params);
    const ttl = 60; // seconds
    await this.redisService.set(cacheKey, result, ttl);
    return result;
  }

  async create(createPostDto: CreatePostDto) {
    const uniqueSlug = await this.generateUniqueSlug(createPostDto.slug);
    const created = await this.postRepository.create({
      ...createPostDto,
      slug: uniqueSlug,
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

    const created = await this.postRepository.create({
      ...createPostDto,
      ...(imageUrl && { thumbnail_url: imageUrl }),
      slug: uniqueSlug,
    });
    await this.redisService.delByPattern('posts:list:*');
    await this.redisService.delByPattern('posts:search:*');
    return created;
  }

  async findAll(
    page = 1,
    limit = 10,
    filters?: {
      status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
      search?: string;
      author?: string;
      createdFrom?: string;
      createdTo?: string;
      sortBy?: 'created_at' | 'updated_at' | 'title' | 'status';
      sortOrder?: 'asc' | 'desc';
      tags?: string[];
    },
  ): Promise<{ items: Omit<Post, 'content'>[]; total: number }> {
    // Create cache key with filters
    const filterKey = filters ? JSON.stringify(filters) : 'no-filters';
    const cacheKey = `posts:list:${page}:${limit}:${filterKey}`;

    const cached = await this.redisService.get<{
      items: Omit<Post, 'content'>[];
      total: number;
    }>(cacheKey);

    if (cached) return cached;

    const result = await this.postRepository.findPostsWithFilters({
      page,
      limit,
      filters,
    });

    const ttl = 60; // seconds; could move to config if needed
    await this.redisService.set(cacheKey, result, ttl);
    return result;
  }

  async findOne(id: string) {
    const cacheKey = `posts:detail:${id}`;
    const cached = await this.redisService.get<Post>(cacheKey);
    if (cached) return cached;
    const post = await this.postRepository.findUnique({ id });
    if (!post) throw new NotFoundException('Post not found');
    await this.redisService.set(cacheKey, post, 120);
    return post;
  }

  async update(id: string, updatePostDto: UpdatePostDto) {
    try {
      // Check if post exists first
      const existingPost = await this.postRepository.findUnique({ id });

      if (!existingPost) {
        throw new NotFoundException(`Post with ID ${id} not found`);
      }

      // If slug is being updated, generate unique slug if needed
      if (updatePostDto.slug && updatePostDto.slug !== existingPost.slug) {
        updatePostDto.slug = await this.generateUniqueSlug(updatePostDto.slug);
      }

      const updated = await this.postRepository.update({
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

  async updateV2(
    id: string,
    updatePostDto: UpdatePostDto,
    file?: Express.Multer.File,
  ): Promise<Post> {
    try {
      // Check if post exists first
      const existingPost = await this.postRepository.findUnique({ id });

      if (!existingPost) {
        throw new NotFoundException(`Post with ID ${id} not found`);
      }

      // Handle image upload if file is provided
      let imageUrl: string | undefined;
      if (file) {
        if (!file.mimetype.startsWith('image/')) {
          throw new BadRequestException('File không phải hình ảnh');
        }
        const upload = await this.imageService.uploadImage(file);
        imageUrl = upload?.url;
      }

      // If slug is being updated, generate unique slug if needed
      if (updatePostDto.slug && updatePostDto.slug !== existingPost.slug) {
        updatePostDto.slug = await this.generateUniqueSlug(updatePostDto.slug);
      }

      // Prepare update data
      const updateData = {
        ...updatePostDto,
        ...(imageUrl && { thumbnail_url: imageUrl }),
      };

      const updated = await this.postRepository.update({
        where: { id },
        data: updateData,
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
      const existingPost = await this.postRepository.findUnique({ id });

      if (!existingPost) {
        throw new NotFoundException(`Post with ID ${id} not found`);
      }

      await this.postRepository.delete({ id });

      // Clear cache after successful deletion
      try {
        await this.redisService.del([`posts:detail:${id}`]);
        await this.redisService.delByPattern('posts:list:*');
        await this.redisService.delByPattern('posts:search:*');
      } catch (cacheError) {
        console.error('Cache clearing error:', cacheError);
        // Don't fail the deletion if cache clearing fails
      }

      return 'Deleted Successfully';
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      console.error('Remove post error:', error);
      throw new Error(`Failed to remove post: ${(error as Error).message}`);
    }
  }
}
