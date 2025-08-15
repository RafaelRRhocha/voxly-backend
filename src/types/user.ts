import { User as PrismaUser } from '@prisma/client';
import { UserRole } from '../enums/user';

export interface UserCreate {
  name: string;
  email: string;
  password: string;
  entity_id: number;
  role: UserRole;
}

export interface UserUpdate {
  name?: string;
  email?: string;
  password?: string;
  role?: UserRole;
  entity_id?: number;
}

export interface UserResponse {
  id: number;
  name: string;
  email: string;
  entityId: number;
  entityName: string;
  role: string;
  created_at: Date;
  updated_at: Date | null;
}

export type User = Omit<PrismaUser, 'password_hash'>;
