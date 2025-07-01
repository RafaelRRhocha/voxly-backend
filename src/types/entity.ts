import { Entity as PrismaEntity } from '@prisma/client';

export interface EntityCreate {
  name: string;
}

export interface EntityUpdate {
  name?: string;
}

export interface EntityResponse {
  id: number;
  name: string;
  created_at: Date;
  updated_at: Date | null;
}

export type Entity = PrismaEntity; 