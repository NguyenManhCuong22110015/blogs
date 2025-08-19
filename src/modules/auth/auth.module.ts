import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { ApiKeyRepository } from '@/utils/api-key.repository';
import { SessionRepository } from '@/utils/session.repository';
import { SharedLinkRepository } from '@/utils/shared-link.repository';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import { MetaModule } from '@/infrastructure/meta';
import { LoggingRepository } from '@/infrastructure/logging';
import { ConfigRepository } from '@/infrastructure/config';
import { EventRepository } from '@/infrastructure/event';
import { CryptoRepository } from '@/utils/crypto.repository';

@Module({
  imports: [MetaModule],
  controllers: [AuthController],
  providers: [
    AuthService,
    // BaseService deps
    LoggingRepository,
    ConfigRepository,
    EventRepository,
    CryptoRepository,
    ApiKeyRepository,
    SessionRepository,
    // Feature deps
    SharedLinkRepository,
    PrismaService,
  ],
  exports: [AuthService],
})
export class AuthModule {}
