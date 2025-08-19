import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/infrastructure/database/prisma.service';
import {
  CreateSessionDto,
  UpdateSessionDto,
  AuthSession,
} from '@/common/types';
import { Session } from '@prisma/client';
import { DateTime } from 'luxon';

@Injectable()
export class SessionRepository {
  constructor(private prisma: PrismaService) {}

  async cleanup() {
    const cutoffDate = DateTime.now().minus({ days: 90 }).toJSDate();
    const expiredDate = DateTime.now().toJSDate();

    const sessionsToDelete = await this.prisma.session.findMany({
      where: {
        OR: [
          { updatedAt: { lte: cutoffDate } },
          {
            AND: [
              { expiresAt: { not: null } },
              { expiresAt: { lte: expiredDate } },
            ],
          },
        ],
      },
      select: {
        id: true,
        deviceOS: true,
        deviceType: true,
      },
    });

    await this.prisma.session.deleteMany({
      where: {
        OR: [
          { updatedAt: { lte: cutoffDate } },
          {
            AND: [
              { expiresAt: { not: null } },
              { expiresAt: { lte: expiredDate } },
            ],
          },
        ],
      },
    });

    return sessionsToDelete;
  }

  get(id: string): Promise<Session | null> {
    return this.prisma.session.findFirst({
      where: { id },
      select: {
        id: true,
        expiresAt: true,
        pinExpiresAt: true,
      },
    });
  }

  async isPendingSyncReset(id: string): Promise<boolean> {
    const result = await this.prisma.session.findFirst({
      where: { id },
      select: { isPendingSyncReset: true },
    });
    return result?.isPendingSyncReset ?? false;
  }

  getByToken(token: string): Promise<AuthSession | null> {
    return this.prisma.session.findFirst({
      where: {
        token,
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

  getByUserId(userId: string): Promise<Session[]> {
    return this.prisma.session.findMany({
      where: {
        userId,
        OR: [{ expiresAt: null }, { expiresAt: { gt: new Date() } }],
        user: {
          deletedAt: null,
        },
      },
      orderBy: [{ updatedAt: 'desc' }, { createdAt: 'desc' }],
    });
  }

  create(dto: CreateSessionDto): Promise<Session> {
    return this.prisma.session.create({
      data: dto,
    });
  }

  update(id: string, dto: UpdateSessionDto): Promise<Session> {
    return this.prisma.session.update({
      where: { id },
      data: dto,
    });
  }

  async delete(id: string): Promise<void> {
    await this.prisma.session.delete({
      where: { id },
    });
  }

  async lockAll(userId: string): Promise<void> {
    await this.prisma.session.updateMany({
      where: { userId },
      data: { pinExpiresAt: null },
    });
  }

  async resetSyncProgress(sessionId: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      await tx.session.update({
        where: { id: sessionId },
        data: { isPendingSyncReset: false },
      });

      // Note: session_sync_checkpoint table doesn't exist in current schema
      // You may need to add it or handle this differently
      // await tx.sessionSyncCheckpoint.deleteMany({
      //   where: { sessionId },
      // });
    });
  }
}
