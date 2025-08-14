import { Module } from '@nestjs/common';
import { PostService } from '@/modules/post/services/post.service';
import { PostsV1Controller } from '@/modules/post/controllers/posts-v1.controller';
import { PostsV2Controller } from '@/modules/post/controllers/posts-v2.controller';
import { ImageModule } from '@/common/image/image.module';


@Module({
  imports: [ImageModule],
  controllers: [PostsV1Controller, PostsV2Controller],
  providers: [PostService],
})
export class PostModule {}
