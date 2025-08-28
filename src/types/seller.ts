import { Seller as PrismaSeller } from "@prisma/client";

export interface SellerCreate {
  name: string;
  email: string;
  store_id: number;
}

export interface SellerUpdate {
  name?: string;
  email?: string;
}

export interface SellerResponse {
  id: number;
  name: string;
  email: string;
  storeId: number;
  created_at: Date;
  updated_at: Date | null;
}

export type Seller = PrismaSeller;
