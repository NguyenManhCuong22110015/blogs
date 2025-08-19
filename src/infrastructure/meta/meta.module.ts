import { Module } from '@nestjs/common';
import { PrismaModule } from '@/infrastructure/database/prisma.module';
import { SystemMetadataRepository } from './system-metadata.repository';

@Module({
  imports: [PrismaModule],
  providers: [SystemMetadataRepository],
  exports: [SystemMetadataRepository],
})
export class MetaModule {} 