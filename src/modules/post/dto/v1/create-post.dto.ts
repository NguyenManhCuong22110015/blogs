import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreatePostDto {
  @ApiProperty({
    example: '10 Natural Ways to Boost Your Energy',
    description: 'The title of the blog post',
  })
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiProperty({
    example: '10-natural-ways-boost-energy',
    description: 'URL-friendly slug for the post',
  })
  @IsString()
  @MaxLength(255)
  slug: string;

  @ApiProperty({
    example:
      '# 10 Natural Ways to Boost Your Energy\n\nAre you feeling tired and sluggish? Instead of reaching for another cup of coffee, try these natural energy boosters:\n\n## 1. Stay Hydrated\nDehydration is one of the leading causes of fatigue. Make sure to drink at least 8 glasses of water daily.\n\n## 2. Get Moving\nEven a 10-minute walk can increase your energy levels for up to 12 hours.',
    description: 'The main content of the blog post in markdown format',
  })
  @IsString()
  content: string;

  @ApiPropertyOptional({
    example:
      'Discover natural methods to increase your daily energy levels without caffeine or stimulants. From hydration to sunlight exposure, these simple tips can transform your day.',
    description: 'A brief summary of the post content',
  })
  @IsOptional()
  @IsString()
  summary?: string | null;

  @ApiPropertyOptional({
    example:
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800',
    description: 'URL to the post thumbnail image',
  })
  @IsOptional()
  @IsString()
  thumbnail_url?: string | null;

  @ApiPropertyOptional({
    enum: ['DRAFT', 'PUBLISHED', 'ARCHIVED'],
    example: 'DRAFT',
    description: 'Publication status of the post',
    default: 'DRAFT',
  })
  @IsOptional()
  @IsIn(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
  status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';

}
