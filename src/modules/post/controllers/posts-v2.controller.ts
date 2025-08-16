import {
  Controller,
  Post,
  Body,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  UseInterceptors,
  Patch,
  Param,
} from '@nestjs/common';
import { PostService } from '../services/post.service';
import { ApiBody, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreatePostWithFileDto } from '@/modules/post/dto/v2/create-post-with-file.dto';
import { CreatePostDto } from '@/modules/post/dto/v2/create-post.dto';
import { UpdatePostDto } from '@/modules/post/dto/v1/update-post.dto';
import { UuidPipe } from '@/common/pipes/uuid.pipe';
import multer from 'multer';

@Controller({
  path: 'posts',
  version: '2',
})
export class PostsV2Controller {
  constructor(private readonly postService: PostService) {}

  @Post()
  @ApiOperation({
    summary: 'create a posts',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreatePostWithFileDto })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),
    }),
  )
  create(
    @Body() createPostDto: CreatePostDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /^image\//i }),
        ],
        fileIsRequired: false,
      }),
    )
    file?: Express.Multer.File,
  ) {
    return this.postService.createV2(createPostDto, file);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'update post with image',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({ type: CreatePostWithFileDto })
  @UseInterceptors(
    FileInterceptor('file', {
      storage: multer.memoryStorage(),
    }),
  )
  update(
    @Param('id', UuidPipe) id: string,
    @Body() updatePostDto: UpdatePostDto,
    @UploadedFile(
      new ParseFilePipe({
        validators: [
          new MaxFileSizeValidator({ maxSize: 5 * 1024 * 1024 }),
          new FileTypeValidator({ fileType: /^image\//i }),
        ],
        fileIsRequired: false,
      }),
    )
    file?: Express.Multer.File,
  ) {
    return this.postService.updateV2(id, updatePostDto, file);
  }
}
