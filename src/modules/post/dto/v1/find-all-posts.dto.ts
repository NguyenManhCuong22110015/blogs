import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsOptional,
  IsString,
  IsIn,
  IsDateString,
  Min,
  Max,
} from 'class-validator';
import { Transform, Type } from 'class-transformer';

export class FindAllPostsDto {
  @ApiPropertyOptional({
    description: 'Page number (starts from 1)',
    example: 1,
    minimum: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({
    description: 'Filter by post status',
    enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
    example: 'PUBLISHED',
  })
  @IsOptional()
  @IsIn(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

  // @ApiPropertyOptional({
  //   description: 'Filter posts created until this date (ISO format)',
  //   example: '2024-12-31T23:59:59.999Z',
  // })
  // @IsOptional()
  // @IsDateString()
  // createdTo?: string;

  @ApiPropertyOptional({
    description: 'Sort by field',
    enum: ['created_at', 'updated_at', 'title', 'status'],
    example: 'created_at',
  })
  @IsOptional()
  @IsIn(['created_at', 'updated_at', 'title', 'status'])
  sortBy?: 'created_at' | 'updated_at' | 'title' | 'status' = 'created_at';

  @ApiPropertyOptional({
    description: 'Sort order',
    enum: ['asc', 'desc'],
    example: 'desc',
  })
  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';

  // @ApiPropertyOptional({
  //   description: 'Filter by tags (if you have tags field)',
  //   example: 'health,wellness',
  // })
  // @IsOptional()
  // @Transform(({ value }) => value?.split(',').map((tag) => tag.trim()))
  // tags?: string[];
}
