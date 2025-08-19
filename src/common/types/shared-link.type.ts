import { SharedLink, User } from '@prisma/client';

export type AuthSharedLink = SharedLink & {
  user: User;
};

export type CreateSharedLinkDto = {
  key: string;
  slug?: string;
  userId: string;
  expiresAt?: Date;
};

export type UpdateSharedLinkDto = Partial<Omit<CreateSharedLinkDto, 'userId'>>;
