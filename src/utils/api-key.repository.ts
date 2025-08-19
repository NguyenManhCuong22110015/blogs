import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import { CreateApiKeyDto, UpdateApiKeyDto, AuthApiKey } from '@/common/types';
import { ApiKey } from '@prisma/client';

@Injectable()
export class ApiKeyRepository {
  constructor(private prisma: PrismaService) {}

  create(dto: CreateApiKeyDto): Promise<ApiKey> {
    return this.prisma.apiKey.create({
      data: dto,
    });
  }

  update(userId: string, id: string, dto: UpdateApiKeyDto): Promise<ApiKey> {
    return this.prisma.apiKey.update({
      where: {
        id,
        userId,
      },
      data: dto,
    });
  }

  async delete(userId: string, id: string): Promise<void> {
    await this.prisma.apiKey.delete({
      where: {
        id,
        userId,
      },
    });
  }

  getKey(hashedToken: string): Promise<AuthApiKey | null> {
    return this.prisma.apiKey.findFirst({
      where: {
        key: hashedToken,
        user: {
          deletedAt: null,
        },
      },
      include: {
        user: true,
      },
    });
  }

  getById(userId: string, id: string): Promise<ApiKey | null> {
    return this.prisma.apiKey.findFirst({
      where: {
        id,
        userId,
      },
    });
  }

  getByUserId(userId: string): Promise<ApiKey[]> {
    return this.prisma.apiKey.findMany({
      where: {
        userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
  }
}
