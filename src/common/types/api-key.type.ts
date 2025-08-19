import { ApiKey, User } from '@prisma/client';

export type AuthApiKey = ApiKey & {
  user: User;
};

export type CreateApiKeyDto = {
  key: string;
  name?: string;
  permissions: any[];
  userId: string;
};

export type UpdateApiKeyDto = Partial<Omit<CreateApiKeyDto, 'userId'>>;
