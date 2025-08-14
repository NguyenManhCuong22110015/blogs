// src/features/image/image.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ImageRepository } from './image.repository';
import { CloudinaryService } from '@/infrastructure/storage/cloudinary/cloudinary.service';

@Injectable()
export class ImageService {
  constructor(
    private readonly cloudinaryService: CloudinaryService,
    private readonly imageRepository: ImageRepository
  ) {}

  async uploadImage(file: Express.Multer.File): Promise<{ id: number; url: string } | null> {
    try {
      const uploaded = await this.cloudinaryService.uploadImage(file);
      return uploaded?.id ? { id: uploaded.id, url: uploaded.url } : null;
    } catch (error) {
      throw new InternalServerErrorException('Failed to upload image');
    }
  }

  async deleteImage(imageId: number): Promise<void> {
    try {
      await this.cloudinaryService.deleteImage(imageId);
    } catch (error) {
      console.warn('Failed to delete image from Cloudinary:', error);
    }
  }

  async getImageUrl(imageId: number): Promise<string | null | undefined> {
    try {
      if (imageId) {
        return await this.cloudinaryService.getImageUrl(imageId);
      }
    } catch (error) {
      console.warn('Failed to get image URL:', error);
      return undefined;
    }
  }

  async getImageById(id: number) {
    return this.imageRepository.findById(id);
  }

  async getImagesByIds(ids: number[]) {
    return this.imageRepository.findByIds(ids);
  }
}