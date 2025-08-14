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
  ParseIntPipe, UseInterceptors,
} from '@nestjs/common';
import { PostService } from '../services/post.service';
import { CreatePostDto } from '../dto/v1/create-post.dto';
import { UpdatePostDto } from '../dto/v1/update-post.dto';
import { ApiConsumes, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { PaginatedResponseDto } from '@/common/dtos/responses/base.response';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller({
  path: 'posts',
  version: '1'
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



  @Get()
  @ApiOperation({
    summary: 'Get all posts',
  })
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
  @ApiOperation({
    summary: 'Get  post by id',
  })
  findOne(@Param('id') id: string) {
    return this.postService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'update  post',
  })
  update(@Param('id') id: string, @Body() updatePostDto: UpdatePostDto) {
    return this.postService.update(id, updatePostDto);
  }



  @Delete(':id')
  @ApiOperation({
    summary: 'delete  post',
  })
  remove(@Param('id') id: string) {
    return this.postService.remove(id);
  }
}
