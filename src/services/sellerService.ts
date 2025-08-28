import prisma from "../lib/prisma";
import { SellerCreate, SellerResponse, SellerUpdate } from "../types/seller";

export async function createSeller(
  data: SellerCreate,
): Promise<SellerResponse> {
  const existingSeller = await prisma.seller.findUnique({
    where: {
      email: data.email,
    },
  });

  if (existingSeller && !existingSeller.deleted_at) {
    throw new Error("Seller email must be unique");
  }

  const store = await prisma.store.findFirst({
    where: {
      id: data.store_id,
      deleted_at: null,
    },
  });

  if (!store) {
    throw new Error("Store not found");
  }

  const seller = await prisma.seller.create({
    data: {
      name: data.name,
      email: data.email,
      store_id: data.store_id,
    },
  });

  return {
    id: seller.id,
    name: seller.name,
    email: seller.email,
    storeId: seller.store_id,
    created_at: seller.created_at,
    updated_at: seller.updated_at,
  };
}

export async function getSellerById(
  id: number,
): Promise<SellerResponse | null> {
  const seller = await prisma.seller.findFirst({
    where: {
      id,
      deleted_at: null,
    },
    include: {
      store: true,
    },
  });

  if (!seller) {
    return null;
  }

  return {
    id: seller.id,
    name: seller.name,
    email: seller.email,
    storeId: seller.store_id,
    created_at: seller.created_at,
    updated_at: seller.updated_at,
  };
}

export async function getSellersByStoreId(
  storeId: number,
): Promise<Array<SellerResponse>> {
  const sellers = await prisma.seller.findMany({
    where: {
      store_id: storeId,
      deleted_at: null,
    },
    orderBy: {
      created_at: "desc",
    },
  });

  return sellers.map((seller) => ({
    id: seller.id,
    name: seller.name,
    email: seller.email,
    storeId: seller.store_id,
    created_at: seller.created_at,
    updated_at: seller.updated_at,
  }));
}

export async function updateSeller(
  id: number,
  data: SellerUpdate,
): Promise<SellerResponse> {
  const existingSeller = await prisma.seller.findFirst({
    where: {
      id,
      deleted_at: null,
    },
  });

  if (!existingSeller) {
    throw new Error("Seller not found");
  }

  if (data.email) {
    const sellerWithSameEmail = await prisma.seller.findFirst({
      where: {
        email: data.email,
        deleted_at: null,
        NOT: {
          id,
        },
      },
    });

    if (sellerWithSameEmail) {
      throw new Error("Seller email must be unique");
    }
  }

  const seller = await prisma.seller.update({
    where: { id },
    data: {
      ...data,
      updated_at: new Date(),
    },
  });

  return {
    id: seller.id,
    name: seller.name,
    email: seller.email,
    storeId: seller.store_id,
    created_at: seller.created_at,
    updated_at: seller.updated_at,
  };
}

export async function deleteSeller(id: number): Promise<void> {
  const seller = await prisma.seller.findFirst({
    where: {
      id,
      deleted_at: null,
    },
  });

  if (!seller) {
    throw new Error("Seller not found");
  }

  await prisma.seller.update({
    where: { id },
    data: {
      deleted_at: new Date(),
    },
  });
}

export async function validateSellerAccess(
  sellerId: number,
  entityId: number,
): Promise<boolean> {
  const seller = await prisma.seller.findFirst({
    where: {
      id: sellerId,
      deleted_at: null,
    },
    include: {
      store: {
        include: {
          entity: true,
        },
      },
    },
  });

  return seller?.store.entity_id === entityId;
}

export async function validateStoreAccess(
  storeId: number,
  entityId: number,
): Promise<boolean> {
  const store = await prisma.store.findFirst({
    where: {
      id: storeId,
      entity_id: entityId,
      deleted_at: null,
    },
  });

  return !!store;
}
