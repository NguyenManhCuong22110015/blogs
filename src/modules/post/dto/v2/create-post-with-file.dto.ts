import { CreatePostDto } from '@/modules/post/dto/v2/create-post.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePostWithFileDto extends CreatePostDto {
  @ApiPropertyOptional({
    type: 'string',
    format: 'binary',
    description: 'Optional image file to upload',
  })
  file?: Express.Multer.File;
}
