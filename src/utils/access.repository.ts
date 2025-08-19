import { Injectable } from '@nestjs/common';
import { ChunkedSet, DummyValue, GenerateSql } from '@/common/decorators';
import { AlbumUserRole, AssetVisibility } from '@/common/enums';
import { PrismaService } from '@/infrastructure/database/prisma.service';

class ActivityAccess {
  constructor(private prisma: PrismaService) {}

  @GenerateSql({ params: [DummyValue.UUID, DummyValue.UUID_SET] })
  @ChunkedSet({ paramIndex: 1 })
  async checkOwnerAccess(userId: string, activityIds: Set<string>) {
    if (activityIds.size === 0) {
      return new Set<string>();
    }

    const rows = await this.prisma.activity.findMany({
      where: {
        id: { in: [...activityIds] },
        userId,
      },
      select: { id: true },
    });
    return new Set(rows.map((r) => r.id));
  }

  @GenerateSql({ params: [DummyValue.UUID, DummyValue.UUID_SET] })
  @ChunkedSet({ paramIndex: 1 })
  async checkAlbumOwnerAccess(userId: string, activityIds: Set<string>) {
    if (activityIds.size === 0) {
      return new Set<string>();
    }

    const rows = await this.prisma.activity.findMany({
      where: {
        id: { in: [...activityIds] },
        album: { ownerId: userId, deletedAt: null },
      },
      select: { id: true },
    });
    return new Set(rows.map((r) => r.id));
  }

  @GenerateSql({ params: [DummyValue.UUID, DummyValue.UUID_SET] })
  @ChunkedSet({ paramIndex: 1 })
  async checkCreateAccess(userId: string, albumIds: Set<string>) {
    if (albumIds.size === 0) {
      return new Set<string>();
    }

    const rows = await this.prisma.album.findMany({
      where: {
        id: { in: [...albumIds] },
        isActivityEnabled: true,
        deletedAt: null,
        OR: [
          { ownerId: userId },
          {
            albumUsers: {
              some: { usersId: userId, user: { deletedAt: null } },
            },
          },
        ],
      },
      select: { id: true },
    });
    return new Set(rows.map((r) => r.id));
  }
}

class AlbumAccess {
  constructor(private prisma: PrismaService) {}

  @GenerateSql({ params: [DummyValue.UUID, DummyValue.UUID_SET] })
  @ChunkedSet({ paramIndex: 1 })
  async checkOwnerAccess(userId: string, albumIds: Set<string>) {
    if (albumIds.size === 0) {
      return new Set<string>();
    }

    const rows = await this.prisma.album.findMany({
      where: {
        id: { in: [...albumIds] },
        ownerId: userId,
        deletedAt: null,
      },
      select: { id: true },
    });
    return new Set(rows.map((r) => r.id));
  }

  @GenerateSql({ params: [DummyValue.UUID, DummyValue.UUID_SET] })
  @ChunkedSet({ paramIndex: 1 })
  async checkSharedAlbumAccess(
    userId: string,
    albumIds: Set<string>,
    access: AlbumUserRole,
  ) {
    if (albumIds.size === 0) {
      return new Set<string>();
    }

    const accessRole =
      access === AlbumUserRole.Editor
        ? [AlbumUserRole.Editor]
        : [AlbumUserRole.Editor, AlbumUserRole.Viewer];

    const rows = await this.prisma.album.findMany({
      where: {
        id: { in: [...albumIds] },
        deletedAt: null,
        albumUsers: {
          some: {
            usersId: userId,
            role: { in: accessRole as string[] },
            user: { deletedAt: null },
          },
        },
      },
      select: { id: true },
    });
    return new Set(rows.map((r) => r.id));
  }

  @GenerateSql({ params: [DummyValue.UUID, DummyValue.UUID_SET] })
  @ChunkedSet({ paramIndex: 1 })
  async checkSharedLinkAccess(sharedLinkId: string, albumIds: Set<string>) {
    if (albumIds.size === 0) {
      return new Set<string>();
    }

    const rows = await this.prisma.sharedLink.findMany({
      where: { id: sharedLinkId, albumId: { in: [...albumIds] } },
      select: { albumId: true },
    });
    return new Set(rows.flatMap((r) => (r.albumId ? [r.albumId] : [])));
  }
}

class AssetAccess {
  constructor(private prisma: PrismaService) {}

  @GenerateSql({ params: [DummyValue.UUID, DummyValue.UUID_SET] })
  @ChunkedSet({ paramIndex: 1 })
  async checkAlbumAccess(userId: string, assetIds: Set<string>) {
    if (assetIds.size === 0) {
      return new Set<string>();
    }

    const rows = await this.prisma.asset.findMany({
      where: {
        OR: [
          { id: { in: [...assetIds] } },
          { livePhotoVideoId: { in: [...assetIds] } },
        ],
        deletedAt: null,
        albumAssets: {
          some: {
            album: {
              deletedAt: null,
              OR: [
                { ownerId: userId },
                {
                  albumUsers: {
                    some: { usersId: userId, user: { deletedAt: null } },
                  },
                },
              ],
            },
          },
        },
      },
      select: { id: true, livePhotoVideoId: true },
    });
    const allowedIds = new Set<string>();
    for (const row of rows) {
      if (row.id && assetIds.has(row.id)) {
        allowedIds.add(row.id);
      }
      if (row.livePhotoVideoId && assetIds.has(row.livePhotoVideoId)) {
        allowedIds.add(row.livePhotoVideoId);
      }
    }
    return allowedIds;
  }

  @GenerateSql({ params: [DummyValue.UUID, DummyValue.UUID_SET] })
  @ChunkedSet({ paramIndex: 1 })
  async checkOwnerAccess(
    userId: string,
    assetIds: Set<string>,
    hasElevatedPermission: boolean | undefined,
  ) {
    if (assetIds.size === 0) {
      return new Set<string>();
    }

    const rows = await this.prisma.asset.findMany({
      where: {
        id: { in: [...assetIds] },
        ownerId: userId,
        ...(hasElevatedPermission
          ? {}
          : {
              visibility: { not: AssetVisibility.Locked as unknown as string },
            }),
      },
      select: { id: true },
    });
    return new Set(rows.map((r) => r.id));
  }

  @GenerateSql({ params: [DummyValue.UUID, DummyValue.UUID_SET] })
  @ChunkedSet({ paramIndex: 1 })
  async checkPartnerAccess(userId: string, assetIds: Set<string>) {
    if (assetIds.size === 0) {
      return new Set<string>();
    }

    const partners = await this.prisma.partner.findMany({
      where: { sharedWithId: userId },
      select: { sharedById: true },
    });
    const sharedByIds = partners.map((p) => p.sharedById);
    if (sharedByIds.length === 0) {
      return new Set<string>();
    }
    const rows = await this.prisma.asset.findMany({
      where: {
        id: { in: [...assetIds] },
        ownerId: { in: sharedByIds },
        deletedAt: null,
        visibility: {
          in: [
            AssetVisibility.Timeline as unknown as string,
            AssetVisibility.Hidden as unknown as string,
          ],
        },
      },
      select: { id: true },
    });
    return new Set(rows.map((r) => r.id));
  }

  @GenerateSql({ params: [DummyValue.UUID, DummyValue.UUID_SET] })
  @ChunkedSet({ paramIndex: 1 })
  async checkSharedLinkAccess(sharedLinkId: string, assetIds: Set<string>) {
    if (assetIds.size === 0) {
      return new Set<string>();
    }

    const shared = await this.prisma.sharedLinkAsset.findMany({
      where: {
        sharedLinksId: sharedLinkId,
        asset: {
          deletedAt: null,
          OR: [
            { id: { in: [...assetIds] } },
            { livePhotoVideoId: { in: [...assetIds] } },
          ],
        },
      },
      select: { asset: { select: { id: true, livePhotoVideoId: true } } },
    });
    const link = await this.prisma.sharedLink.findUnique({
      where: { id: sharedLinkId },
      select: { albumId: true },
    });
    let albumAssets: Array<{
      id: string | null;
      livePhotoVideoId: string | null;
    }> = [];
    if (link?.albumId) {
      const aa = await this.prisma.albumAsset.findMany({
        where: {
          albumsId: link.albumId,
          asset: {
            deletedAt: null,
            OR: [
              { id: { in: [...assetIds] } },
              { livePhotoVideoId: { in: [...assetIds] } },
            ],
          },
        },
        select: { asset: { select: { id: true, livePhotoVideoId: true } } },
      });
      albumAssets = aa.map((x) => x.asset);
    }
    const rows = [...shared.map((x) => x.asset), ...albumAssets];
    const allowedIds = new Set<string>();
    for (const row of rows) {
      if (row.id && assetIds.has(row.id)) {
        allowedIds.add(row.id);
      }
      if (row.livePhotoVideoId && assetIds.has(row.livePhotoVideoId)) {
        allowedIds.add(row.livePhotoVideoId);
      }
    }
    return allowedIds;
  }
}

class AuthDeviceAccess {
  constructor(private prisma: PrismaService) {}

  @GenerateSql({ params: [DummyValue.UUID, DummyValue.UUID_SET] })
  @ChunkedSet({ paramIndex: 1 })
  async checkOwnerAccess(userId: string, deviceIds: Set<string>) {
    if (deviceIds.size === 0) {
      return new Set<string>();
    }

    const sessions = await this.prisma.session.findMany({
      where: {
        userId,
        id: { in: [...deviceIds] },
      },
      select: { id: true },
    });
    return new Set(sessions.map((s) => s.id));
  }
}

class NotificationAccess {
  constructor(private prisma: PrismaService) {}

  @GenerateSql({ params: [DummyValue.UUID, DummyValue.UUID_SET] })
  @ChunkedSet({ paramIndex: 1 })
  async checkOwnerAccess(userId: string, notificationIds: Set<string>) {
    if (notificationIds.size === 0) {
      return new Set<string>();
    }

    const rows = await this.prisma.notification.findMany({
      where: { id: { in: [...notificationIds] }, userId },
      select: { id: true },
    });
    return new Set(rows.map((r) => r.id));
  }
}

class SessionAccess {
  constructor(private prisma: PrismaService) {}

  @GenerateSql({ params: [DummyValue.UUID, DummyValue.UUID_SET] })
  @ChunkedSet({ paramIndex: 1 })
  async checkOwnerAccess(userId: string, sessionIds: Set<string>) {
    if (sessionIds.size === 0) {
      return new Set<string>();
    }

    const sessions = await this.prisma.session.findMany({
      where: {
        id: { in: [...sessionIds] },
        userId,
      },
      select: { id: true },
    });
    return new Set(sessions.map((s) => s.id));
  }
}
class StackAccess {
  constructor(private prisma: PrismaService) {}

  @GenerateSql({ params: [DummyValue.UUID, DummyValue.UUID_SET] })
  @ChunkedSet({ paramIndex: 1 })
  async checkOwnerAccess(userId: string, stackIds: Set<string>) {
    if (stackIds.size === 0) {
      return new Set<string>();
    }

    const rows = await this.prisma.stack.findMany({
      where: { id: { in: [...stackIds] }, ownerId: userId },
      select: { id: true },
    });
    return new Set(rows.map((r) => r.id));
  }
}

class TimelineAccess {
  constructor(private prisma: PrismaService) {}

  @GenerateSql({ params: [DummyValue.UUID, DummyValue.UUID_SET] })
  @ChunkedSet({ paramIndex: 1 })
  async checkPartnerAccess(userId: string, partnerIds: Set<string>) {
    if (partnerIds.size === 0) {
      return new Set<string>();
    }

    const rows = await this.prisma.partner.findMany({
      where: { sharedById: { in: [...partnerIds] }, sharedWithId: userId },
      select: { sharedById: true },
    });
    return new Set(rows.map((r) => r.sharedById));
  }
}

class MemoryAccess {
  constructor(private prisma: PrismaService) {}

  @GenerateSql({ params: [DummyValue.UUID, DummyValue.UUID_SET] })
  @ChunkedSet({ paramIndex: 1 })
  async checkOwnerAccess(userId: string, memoryIds: Set<string>) {
    if (memoryIds.size === 0) {
      return new Set<string>();
    }

    const rows = await this.prisma.memory.findMany({
      where: {
        id: { in: [...memoryIds] },
        ownerId: userId,
        deletedAt: null,
      },
      select: { id: true },
    });
    return new Set(rows.map((r) => r.id));
  }
}

class PersonAccess {
  constructor(private prisma: PrismaService) {}

  @GenerateSql({ params: [DummyValue.UUID, DummyValue.UUID_SET] })
  @ChunkedSet({ paramIndex: 1 })
  async checkOwnerAccess(userId: string, personIds: Set<string>) {
    if (personIds.size === 0) {
      return new Set<string>();
    }

    const rows = await this.prisma.person.findMany({
      where: { id: { in: [...personIds] }, ownerId: userId },
      select: { id: true },
    });
    return new Set(rows.map((r) => r.id));
  }

  @GenerateSql({ params: [DummyValue.UUID, DummyValue.UUID_SET] })
  @ChunkedSet({ paramIndex: 1 })
  async checkFaceOwnerAccess(userId: string, assetFaceIds: Set<string>) {
    if (assetFaceIds.size === 0) {
      return new Set<string>();
    }

    const rows = await this.prisma.assetFace.findMany({
      where: {
        id: { in: [...assetFaceIds] },
        asset: { ownerId: userId, deletedAt: null },
      },
      select: { id: true },
    });
    return new Set(rows.map((r) => r.id));
  }
}

class PartnerAccess {
  constructor(private prisma: PrismaService) {}

  @GenerateSql({ params: [DummyValue.UUID, DummyValue.UUID_SET] })
  @ChunkedSet({ paramIndex: 1 })
  async checkUpdateAccess(userId: string, partnerIds: Set<string>) {
    if (partnerIds.size === 0) {
      return new Set<string>();
    }

    const rows = await this.prisma.partner.findMany({
      where: { sharedById: { in: [...partnerIds] }, sharedWithId: userId },
      select: { sharedById: true },
    });
    return new Set(rows.map((r) => r.sharedById));
  }
}

class TagAccess {
  constructor(private prisma: PrismaService) {}

  @GenerateSql({ params: [DummyValue.UUID, DummyValue.UUID_SET] })
  @ChunkedSet({ paramIndex: 1 })
  async checkOwnerAccess(userId: string, tagIds: Set<string>) {
    if (tagIds.size === 0) {
      return new Set<string>();
    }

    const rows = await this.prisma.tag.findMany({
      where: { id: { in: [...tagIds] }, userId },
      select: { id: true },
    });
    return new Set(rows.map((r) => r.id));
  }
}

@Injectable()
export class AccessRepository {
  activity: ActivityAccess;
  album: AlbumAccess;
  asset: AssetAccess;
  authDevice: AuthDeviceAccess;
  memory: MemoryAccess;
  notification: NotificationAccess;
  person: PersonAccess;
  partner: PartnerAccess;
  session: SessionAccess;
  stack: StackAccess;
  tag: TagAccess;
  timeline: TimelineAccess;

  constructor(private readonly prisma: PrismaService) {
    this.activity = new ActivityAccess(this.prisma);
    this.album = new AlbumAccess(this.prisma);
    this.asset = new AssetAccess(this.prisma);
    this.authDevice = new AuthDeviceAccess(this.prisma);
    this.memory = new MemoryAccess(this.prisma);
    this.notification = new NotificationAccess(this.prisma);
    this.person = new PersonAccess(this.prisma);
    this.partner = new PartnerAccess(this.prisma);
    this.session = new SessionAccess(this.prisma);
    this.stack = new StackAccess(this.prisma);
    this.tag = new TagAccess(this.prisma);
    this.timeline = new TimelineAccess(this.prisma);
  }
}
