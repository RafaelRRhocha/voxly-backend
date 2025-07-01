import { User as PrismaUser } from '@prisma/client';
import { UserRole } from '../enums/user';

export interface UserCreate {
  email: string;
  password: string;
  entity_id: number;
  role: UserRole;
}

export interface UserUpdate {
  email?: string;
  password?: string;
  role?: UserRole;
  entity_id?: number;
}

export interface UserResponse {
  id: number;
  email: string;
  entity_id: number;
  role: string;
  created_at: Date;
  updated_at: Date | null;
}

export type User = Omit<PrismaUser, 'password_hash'>;
