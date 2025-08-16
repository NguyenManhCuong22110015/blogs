import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { PostService } from '../services/post.service';
import { CreatePostDto } from '../dto/v1/create-post.dto';
import { UpdatePostDto } from '../dto/v1/update-post.dto';
import { FindAllPostsDto } from '../dto/v1/find-all-posts.dto';
import { ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PaginatedResponseDto } from '@/common/dtos/responses/base.response';
import { UuidPipe } from '@/common/pipes/uuid.pipe';

@Controller({
  path: 'posts',
  version: '1',
})
export class PostsV1Controller {
  constructor(private readonly postService: PostService) {}

  @Post()
  @ApiOperation({
    summary: 'create  post',
  })
  create(@Body() createPostDto: CreatePostDto) {
    return this.postService.create(createPostDto);
  }

  @Get('/search')
  @ApiOperation({
    summary: 'search posts by keywords',
  })
  @ApiQuery({ name: 'params', required: false, type: String })
  async search(@Query('params') params: string) {
    const { items, total } = await this.postService.search(params);
    return new PaginatedResponseDto(items, 1, items.length, total);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all posts with filters',
  })
  async findAll(@Query() query: FindAllPostsDto) {
    const { page = 1, limit = 10, ...filters } = query;
    const { items, total } = await this.postService.findAll(
      page,
      limit,
      filters,
    );
    return new PaginatedResponseDto(items, page, limit, total);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get  post by id',
  })
  findOne(@Param('id', UuidPipe) id: string) {
    return this.postService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'update  post',
  })
  update(
    @Param('id', UuidPipe) id: string,
    @Body() updatePostDto: UpdatePostDto,
  ) {
    return this.postService.update(id, updatePostDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'delete  post',
  })
  remove(@Param('id', UuidPipe) id: string) {
    return this.postService.remove(id);
  }
}
