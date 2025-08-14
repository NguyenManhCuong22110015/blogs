// src/features/image/image.repository.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database';

@Injectable()
export class ImageRepository {
  constructor(private prisma: PrismaService) {}

  async findById(id: number) {
    return this.prisma.image.findUnique({
      where: { id }
    });
  }

  async findByIds(ids: number[]) {
    return this.prisma.image.findMany({
      where: {
        id: { in: ids }
      }
    });
  }

  async create(data: any) {
    return this.prisma.image.create({ data });
  }

  async delete(id: number) {
    return this.prisma.image.delete({
      where: { id }
    });
  }
}