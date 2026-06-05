import { Role } from '@prisma/client';

export type AuthenticatedUser = {
  id: number;
  name: string;
  email: string;
  role: Role;
  avatar: string | null;
  coin: number;
  createdAt: Date;
};
