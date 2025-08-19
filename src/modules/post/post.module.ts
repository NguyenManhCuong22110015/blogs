import { Module } from '@nestjs/common';
import { PostService } from '@/modules/post/services/post.service';
import { PostRepository } from '@/modules/post/repositories/post.repository';
import { PostsV1Controller } from '@/modules/post/controllers/posts-v1.controller';
import { PostsV2Controller } from '@/modules/post/controllers/posts-v2.controller';
import { ImageModule } from '@/common/image/image.module';
import { PrismaModule } from '@/infrastructure/database/prisma.module';

@Module({
  imports: [ImageModule, PrismaModule],
  controllers: [PostsV1Controller, PostsV2Controller],
  providers: [PostService, PostRepository],
})
export class PostModule {}
