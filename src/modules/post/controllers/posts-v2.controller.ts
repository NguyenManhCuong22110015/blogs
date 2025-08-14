import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  DefaultValuePipe,
  ParseIntPipe,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
  FileTypeValidator,
  UseInterceptors,
} from '@nestjs/common';
import { PostService } from '../services/post.service';
import { UpdatePostDto } from '../dto/v2/update-post.dto';
import { ApiBody, ApiConsumes, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PaginatedResponseDto } from '@/common/dtos/responses/base.response';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreatePostWithFileDto } from '@/modules/post/dto/v2/create-post-with-file.dto';
import { CreatePostDto } from '@/modules/post/dto/v2/create-post.dto';
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

  @Get()
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const { items, total } = await this.postService.findAll(page, limit);
    return new PaginatedResponseDto(items, page, limit, total);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.postService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postService.update(id, updatePostDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.postService.remove(id);
  }
}
