import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from '../dto/v1/create-post.dto';
import { UpdatePostDto } from '../dto/v1/update-post.dto';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import { Post } from '@prisma/client';
import { ImageService } from '@/common/image/image.service';
import slugify from 'slugify';

@Injectable()
export class PostService {
  constructor(private readonly prisma: PrismaService,
              private readonly imageService : ImageService) {}

  private async generateUniqueSlug(baseSlug: string): Promise<string> {
    let slug = baseSlug;
    let counter = 1;

    while (await this.prisma.post.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return slug;
  }

  async create(createPostDto: CreatePostDto) {
    const uniqueSlug = await this.generateUniqueSlug(createPostDto.slug);
    return this.prisma.post.create({
      data: { ...createPostDto, slug: uniqueSlug },
    });
  }
  async createV2(createPostDto: CreatePostDto, file?: Express.Multer.File): Promise<Post> {
    let imageUrl: string | undefined;

    if (file) {
      if (!file.mimetype.startsWith('image/')) {
        throw new BadRequestException('File không phải hình ảnh');
      }
      const upload = await this.imageService.uploadImage(file);
      imageUrl = upload?.url;
    }

    const rawSlug = createPostDto.slug || slugify(createPostDto.title, { lower: true });
    const uniqueSlug = await this.generateUniqueSlug(rawSlug);

    return this.prisma.post.create({
      data: {
        ...createPostDto,
        ...(imageUrl && { thumbnail_url: imageUrl }),
        slug: uniqueSlug
      }
    });
  }


  async findAll(
    page = 1,
    limit = 10,
  ): Promise<{ items: Omit<Post, 'content'>[]; total: number }> {
    const skip = (page - 1) * limit;
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
    return { items, total };
  }

  async findOne(id: string) {
    const post = await this.prisma.post.findUnique({ where: { id } });
    if (!post) throw new NotFoundException('Post not found');
    return post;
  }

  async update(id: string, updatePostDto: UpdatePostDto) {
    return this.prisma.post.update({ where: { id }, data: updatePostDto });
  }

  async remove(id: string) {
    return this.prisma.post.delete({ where: { id } });
  }
}
