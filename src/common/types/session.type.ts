import { Session, User } from '@prisma/client';

export type AuthSession = Session & {
  user: User;
};

export type CreateSessionDto = {
  token: string;
  userId: string;
  deviceOS?: string;
  deviceType?: string;
  expiresAt?: Date;
  pinExpiresAt?: Date;
  isPendingSyncReset?: boolean;
};

export type UpdateSessionDto = Partial<Omit<CreateSessionDto, 'userId'>>;

export type SessionSearchOptions = { updatedBefore: Date };
