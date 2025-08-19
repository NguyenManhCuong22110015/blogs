import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import {
  CreateSharedLinkDto,
  UpdateSharedLinkDto,
  AuthSharedLink,
} from '@/common/types';
import { SharedLink } from '@prisma/client';

@Injectable()
export class SharedLinkRepository {
  constructor(private prisma: PrismaService) {}

  getByKey(key: Buffer): Promise<AuthSharedLink | null> {
    return this.prisma.sharedLink.findFirst({
      where: {
        key: key.toString('base64'),
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        user: {
          deletedAt: null,
        },
      },
      include: {
        user: true,
      },
    });
  }

  getBySlug(slug: string): Promise<AuthSharedLink | null> {
    return this.prisma.sharedLink.findFirst({
      where: {
        slug,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        user: {
          deletedAt: null,
        },
      },
      include: {
        user: true,
      },
    });
  }

  create(dto: CreateSharedLinkDto): Promise<SharedLink> {
    return this.prisma.sharedLink.create({
      data: dto,
    });
  }

  update(id: string, dto: UpdateSharedLinkDto): Promise<SharedLink> {
    return this.prisma.sharedLink.update({
      where: { id },
      data: dto,
    });
  }

  delete(id: string): Promise<SharedLink> {
    return this.prisma.sharedLink.delete({
      where: { id },
    });
  }

  getByUserId(userId: string): Promise<SharedLink[]> {
    return this.prisma.sharedLink.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
