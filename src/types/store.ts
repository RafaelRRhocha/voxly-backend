import { Store as PrismaStore } from "@prisma/client";

export interface StoreCreate {
  name: string;
  entity_id: number;
}

export interface StoreUpdate {
  name?: string;
}

export interface StoreResponse {
  id: number;
  name: string;
  entityId: number;
  created_at: Date;
  updated_at: Date | null;
}

export type Store = PrismaStore;
