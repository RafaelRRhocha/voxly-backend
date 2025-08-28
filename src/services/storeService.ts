import prisma from "../lib/prisma";
import { StoreCreate, StoreResponse, StoreUpdate } from "../types/store";

export async function createStore(data: StoreCreate): Promise<StoreResponse> {
  const existingStore = await prisma.store.findFirst({
    where: {
      name: data.name,
      entity_id: data.entity_id,
      deleted_at: null,
    },
  });

  if (existingStore) {
    throw new Error("Store name must be unique within the entity");
  }

  const entity = await prisma.entity.findUnique({
    where: {
      id: data.entity_id,
      deleted_at: null,
    },
  });

  if (!entity) {
    throw new Error("Entity not found");
  }

  const store = await prisma.store.create({
    data: {
      name: data.name,
      entity_id: data.entity_id,
    },
  });

  return {
    id: store.id,
    name: store.name,
    entityId: store.entity_id,
    created_at: store.created_at,
    updated_at: store.updated_at,
  };
}

export async function getStoreById(id: number): Promise<StoreResponse | null> {
  const store = await prisma.store.findFirst({
    where: {
      id,
      deleted_at: null,
    },
  });

  if (!store) {
    return null;
  }

  return {
    id: store.id,
    name: store.name,
    entityId: store.entity_id,
    created_at: store.created_at,
    updated_at: store.updated_at,
  };
}

export async function getStoresByEntityId(
  entityId: number,
): Promise<Array<StoreResponse>> {
  const stores = await prisma.store.findMany({
    where: {
      entity_id: entityId,
      deleted_at: null,
    },
    orderBy: {
      created_at: "desc",
    },
  });

  return stores.map((store) => ({
    id: store.id,
    name: store.name,
    entityId: store.entity_id,
    created_at: store.created_at,
    updated_at: store.updated_at,
  }));
}

export async function updateStore(
  id: number,
  data: StoreUpdate,
): Promise<StoreResponse> {
  const existingStore = await prisma.store.findFirst({
    where: {
      id,
      deleted_at: null,
    },
  });

  if (!existingStore) {
    throw new Error("Store not found");
  }

  if (data.name) {
    const storeWithSameName = await prisma.store.findFirst({
      where: {
        name: data.name,
        entity_id: existingStore.entity_id,
        deleted_at: null,
        NOT: {
          id,
        },
      },
    });

    if (storeWithSameName) {
      throw new Error("Store name must be unique within the entity");
    }
  }

  const store = await prisma.store.update({
    where: { id },
    data: {
      ...data,
      updated_at: new Date(),
    },
  });

  return {
    id: store.id,
    name: store.name,
    entityId: store.entity_id,
    created_at: store.created_at,
    updated_at: store.updated_at,
  };
}

export async function deleteStore(id: number): Promise<void> {
  const store = await prisma.store.findFirst({
    where: {
      id,
      deleted_at: null,
    },
  });

  if (!store) {
    throw new Error("Store not found");
  }

  await prisma.store.update({
    where: { id },
    data: {
      deleted_at: new Date(),
    },
  });
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
