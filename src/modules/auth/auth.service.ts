import {
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { IncomingHttpHeaders } from 'node:http';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { AuthDto } from './dto/auth.dto';
import { Permission } from '@/common/enums';
import { ImmichCookie, ImmichHeader, ImmichQuery } from '@/common/enums';
import { isGranted } from '@/utils/misc';
import { AuthSharedLink, AuthUser } from '@/common/types';
import { parse } from 'node:path';
import { DateTime } from 'luxon';
import { ApiKeyRepository } from '@/utils/api-key.repository';
import { SessionRepository } from '@/utils/session.repository';
import { SharedLinkRepository } from '@/utils/shared-link.repository';
import { BaseService } from '@/common/core/base.service';
import { LoggingRepository } from '@/infrastructure/logging';
import { ConfigRepository } from '@/infrastructure/config';
import { EventRepository } from '@/infrastructure/event';
import { SystemMetadataRepository } from '@/infrastructure/meta';
import { CryptoRepository } from '@/utils/crypto.repository';
import { ApiKeyRepository } from '@/utils/api-key.repository';

export interface LoginDetails {
  isSecure: boolean;
  clientIp: string;
  deviceType: string;
  deviceOS: string;
}

interface ClaimOptions<T> {
  key: string;
  default: T;
  isValid: (value: unknown) => boolean;
}

export type ValidateRequest = {
  headers: IncomingHttpHeaders;
  queryParams: Record<string, string>;
  metadata: {
    sharedLinkRoute: boolean;
    adminRoute: boolean;
    /** `false` explicitly means no permission is required, which otherwise defaults to `all` */
    permission?: Permission | false;
    uri: string;
  };
};

@Injectable()
export class AuthService extends BaseService {
  constructor(
    protected override logger: LoggingRepository,
    protected override configRepository: ConfigRepository,
    protected override eventRepository: EventRepository,
    protected override metadataRepository: SystemMetadataRepository,
    protected override cryptoRepository: CryptoRepository,
    protected override apiKeyRepository: ApiKeyRepository,
    protected override sessionRepository: SessionRepository,
    private readonly sharedLinkRepository: SharedLinkRepository,
  ) {
    super(
      logger,
      configRepository,
      eventRepository,
      metadataRepository,
      cryptoRepository,
      apiKeyRepository,
      sessionRepository,
    );
  }

  create(createAuthDto: CreateAuthDto) {
    return 'This action adds a new auth';
  }

  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }

  private async validate({
    headers,
    queryParams,
  }: Omit<ValidateRequest, 'metadata'>): Promise<AuthDto> {
    const shareKey = (headers[ImmichHeader.SharedLinkKey] ||
      queryParams[ImmichQuery.SharedLinkKey]) as string;
    const shareSlug = (headers[ImmichHeader.SharedLinkSlug] ||
      queryParams[ImmichQuery.SharedLinkSlug]) as string;
    const session = (headers[ImmichHeader.UserToken] ||
      headers[ImmichHeader.SessionToken] ||
      queryParams[ImmichQuery.SessionKey] ||
      this.getBearerToken(headers) ||
      this.getCookieToken(headers)) as string;
    const apiKey = (headers[ImmichHeader.ApiKey] ||
      queryParams[ImmichQuery.ApiKey]) as string;

    if (shareKey) {
      return this.validateSharedLinkKey(shareKey);
    }

    if (shareSlug) {
      return this.validateSharedLinkSlug(shareSlug);
    }

    if (session) {
      return this.validateSession(session);
    }

    if (apiKey) {
      return this.validateApiKey(apiKey);
    }

    throw new UnauthorizedException('Authentication required');
  }
  private async validateSession(tokenValue: string): Promise<AuthDto> {
    const hashedToken = this.cryptoRepository.hashSha256(tokenValue);
    const session = await this.sessionRepository.getByToken(hashedToken);
    if (session?.user) {
      const now = DateTime.now();
      const updatedAt = DateTime.fromJSDate(session.updatedAt);
      const diff = now.diff(updatedAt, ['hours']);
      if (diff.hours > 1) {
        await this.sessionRepository.update(session.id, {
          id: session.id,
          updatedAt: new Date(),
        });
      }

      // Pin check
      let hasElevatedPermission = false;

      if (session.pinExpiresAt) {
        const pinExpiresAt = DateTime.fromJSDate(session.pinExpiresAt);
        hasElevatedPermission = pinExpiresAt > now;

        if (hasElevatedPermission && now.plus({ minutes: 5 }) > pinExpiresAt) {
          await this.sessionRepository.update(session.id, {
            pinExpiresAt: DateTime.now().plus({ minutes: 5 }).toJSDate(),
          });
        }
      }

      return {
        user: session.user,
        session: {
          id: session.id,
          hasElevatedPermission,
        },
      };
    }

    throw new UnauthorizedException('Invalid user token');
  }
  async authenticate({
    headers,
    queryParams,
    metadata,
  }: ValidateRequest): Promise<AuthDto> {
    const authDto = await this.validate({ headers, queryParams });
    const { adminRoute, sharedLinkRoute, uri } = metadata;
    const requestedPermission = metadata.permission ?? Permission.All;

    if (!authDto.user.isAdmin && adminRoute) {
      this.logger.warn(`Denied access to admin only route: ${uri}`);
      throw new ForbiddenException('Forbidden');
    }

    if (authDto.sharedLink && !sharedLinkRoute) {
      this.logger.warn(`Denied access to non-shared route: ${uri}`);
      throw new ForbiddenException('Forbidden');
    }

    if (
      authDto.apiKey &&
      requestedPermission !== false &&
      !isGranted({
        requested: [requestedPermission],
        current: authDto.apiKey.permissions,
      })
    ) {
      throw new ForbiddenException(
        `Missing required permission: ${requestedPermission}`,
      );
    }

    return authDto;
  }
  async validateSharedLinkKey(key: string | string[]): Promise<AuthDto> {
    key = Array.isArray(key) ? key[0] : key;

    const bytes = Buffer.from(key, key.length === 100 ? 'hex' : 'base64url');
    const sharedLink = await this.sharedLinkRepository.getByKey(bytes);
    if (!this.isValidSharedLink(sharedLink)) {
      throw new UnauthorizedException('Invalid share key');
    }

    return { user: sharedLink.user, sharedLink };
  }

  async validateSharedLinkSlug(slug: string | string[]): Promise<AuthDto> {
    slug = Array.isArray(slug) ? slug[0] : slug;

    const sharedLink = await this.sharedLinkRepository.getBySlug(slug);
    if (!this.isValidSharedLink(sharedLink)) {
      throw new UnauthorizedException('Invalid share slug');
    }

    return { user: sharedLink.user, sharedLink };
  }

  private isValidSharedLink(
    sharedLink?: AuthSharedLink & { user: AuthUser | null },
  ): sharedLink is AuthSharedLink & { user: AuthUser } {
    return (
      !!sharedLink?.user &&
      (!sharedLink.expiresAt || new Date(sharedLink.expiresAt) > new Date())
    );
  }

  private async validateApiKey(key: string): Promise<AuthDto> {
    const hashedKey = this.cryptoRepository.hashSha256(key);
    const apiKey = await this.apiKeyRepository.getKey(hashedKey);
    if (apiKey?.user) {
      return {
        user: apiKey.user,
        apiKey,
      };
    }

    throw new UnauthorizedException('Invalid API key');
  }

  private getBearerToken(headers: IncomingHttpHeaders): string | null {
    const [type, token] = (headers.authorization || '').split(' ');
    if (type.toLowerCase() === 'bearer') {
      return token;
    }

    return null;
  }
  private getCookieToken(headers: IncomingHttpHeaders): string | null {
    const cookies = parse(headers.cookie || '');
    return cookies[ImmichCookie.AccessToken] || null;
  }
}
