import { SessionRepository } from '@/utils/session.repository';
import { Injectable } from '@nestjs/common';
import { SystemConfig } from '@/common/config/system.conf';
import { LoggingRepository } from '@/infrastructure/logging';
import { ConfigRepository } from '@/infrastructure/config';
import { EventRepository } from '@/infrastructure/event';
import { getConfig, updateConfig } from '@/utils/config';
import { CryptoRepository } from '@/utils/crypto.repository';
import { ApiKeyRepository } from '@/utils/api-key.repository';
import { SystemMetadataRepository } from '@/infrastructure/meta';

export const BASE_SERVICE_DEPENDENCIES = [
  LoggingRepository,
  ConfigRepository,
  EventRepository,
];

@Injectable()
export class BaseService {
  constructor(
    protected logger: LoggingRepository,
    protected configRepository: ConfigRepository,
    protected eventRepository: EventRepository,
    protected metadataRepository: SystemMetadataRepository,
    protected cryptoRepository: CryptoRepository,
    protected apiKeyRepository: ApiKeyRepository,
    protected sessionRepository: SessionRepository,
  ) {
    this.logger.setContext(this.constructor.name);
  }

  get worker() {
    return this.configRepository.getWorker();
  }

  private get configRepos() {
    return {
      configRepo: this.configRepository,
      metadataRepo: this.metadataRepository,
      logger: this.logger,
    };
  }

  getConfig(options: { withCache: boolean }) {
    return getConfig(this.configRepos, options);
  }

  updateConfig(newConfig: SystemConfig) {
    return updateConfig(this.configRepos, newConfig);
  }

  requireAccess() {
    // Note: AccessRepository is not available, so this method needs to be implemented differently
    throw new Error('AccessRepository not available');
  }

  checkAccess() {
    // Note: AccessRepository is not available, so this method needs to be implemented differently
    throw new Error('AccessRepository not available');
  }

  createUser() {
    // Note: UserRepository and CryptoRepository are not available, so this method needs to be implemented differently
    throw new Error('UserRepository and CryptoRepository not available');
  }
}
