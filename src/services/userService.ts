import bcrypt from "bcrypt";

import prisma from "../lib/prisma";
import { UserCreate, UserResponse, UserUpdate } from "../types/user";

import * as entityService from "./entityService";

export async function createUser(data: UserCreate): Promise<UserResponse> {
  const entityExists = await entityService.validateEntityExists(data.entity_id);
  if (!entityExists) {
    throw new Error("Entity not found");
  }

  const hashed = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password_hash: hashed,
      entity_id: data.entity_id,
      role: data.role,
    },
  });

  const entity = await prisma.entity.findUnique({
    where: { id: user.entity_id },
  });

  if (!entity) {
    throw new Error("Entity not found");
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    entityId: user.entity_id,
    entityName: entity.name,
    role: user.role,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}

export async function getUserById(id: number): Promise<UserResponse | null> {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) return null;

  const entity = await prisma.entity.findUnique({
    where: { id: user.entity_id },
  });

  if (!entity) {
    throw new Error("Entity not found");
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    entityId: user.entity_id,
    entityName: entity.name,
    role: user.role,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}

export async function getUsersByEntityId(
  entityId: number,
): Promise<Array<UserResponse>> {
  const entityExists = await entityService.validateEntityExists(entityId);
  if (!entityExists) {
    throw new Error("Entity not found");
  }

  const users = await prisma.user.findMany({
    where: {
      entity_id: entityId,
      deleted_at: null,
    },
  });

  const entity = await prisma.entity.findUnique({
    where: { id: entityId },
  });

  if (!entity) {
    throw new Error("Entity not found");
  }

  return users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    entityId: user.entity_id,
    entityName: entity.name,
    role: user.role,
    created_at: user.created_at,
    updated_at: user.updated_at,
  }));
}

export async function updateUser(
  id: number,
  data: UserUpdate,
): Promise<UserResponse> {
  const updateData: Record<string, unknown> = { ...data };

  if (data.entity_id) {
    const entityExists = await entityService.validateEntityExists(
      data.entity_id,
    );
    if (!entityExists) {
      throw new Error("Entity not found");
    }
  }

  if (data.password) {
    updateData.password_hash = await bcrypt.hash(data.password, 10);
    delete updateData.password;
  }

  const user = await prisma.user.update({
    where: { id },
    data: {
      ...updateData,
      updated_at: new Date(),
    },
  });

  const entity = await prisma.entity.findUnique({
    where: { id: user.entity_id },
  });

  if (!entity) {
    throw new Error("Entity not found");
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    entityId: user.entity_id,
    entityName: entity.name,
    role: user.role,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}

export async function deleteUser(id: number): Promise<void> {
  await prisma.user.update({
    where: { id },
    data: {
      deleted_at: new Date(),
    },
  });
}
