import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import { readFile } from 'node:fs/promises';
import { GenerateSql } from '@/common/decorators';
import { SystemMetadata } from '@/common/types';

@Injectable()
export class SystemMetadataRepository {
  constructor(private readonly prisma: PrismaService) {}

  @GenerateSql({ params: ['metadata_key'] })
  async get<T extends keyof SystemMetadata>(
    key: T,
  ): Promise<SystemMetadata[T] | null> {
    try {
      const metadata = await this.prisma.systemMetadata.findUnique({
        where: { key: key as string },
        select: { value: true },
      });

      if (!metadata) {
        return null;
      }
      return metadata.value as SystemMetadata[T];
    } catch (error) {
      console.error('Error getting system metadata:', error);
      return null;
    }
  }

  async set<T extends keyof SystemMetadata>(
    key: T,
    value: SystemMetadata[T],
  ): Promise<void> {
    try {
      await this.prisma.systemMetadata.upsert({
        where: { key: key as string },
        update: { value },
        create: {
          key: key as string,
          value,
        },
      });
    } catch (error) {
      console.error('Error setting system metadata:', error);
      throw error;
    }
  }

  @GenerateSql({ params: ['metadata_key'] })
  async delete<T extends keyof SystemMetadata>(key: T): Promise<void> {
    try {
      await this.prisma.systemMetadata.delete({
        where: { key: key as string },
      });
    } catch (error) {
      console.error('Error deleting system metadata:', error);
      throw error;
    }
  }

  readFile(filename: string): Promise<string> {
    return readFile(filename, { encoding: 'utf8' });
  }
}
