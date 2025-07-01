import prisma from '../lib/prisma';
import bcrypt from 'bcrypt';
import { UserCreate, UserUpdate, UserResponse } from '../types/user';
import * as entityService from './entityService';

export async function createUser(data: UserCreate): Promise<UserResponse> {
  const entityExists = await entityService.validateEntityExists(data.entity_id);
  if (!entityExists) {
    throw new Error('Entity not found');
  }

  const hashed = await bcrypt.hash(data.password, 10);

  const user = await prisma.user.create({
    data: {
      email: data.email,
      password_hash: hashed,
      entity_id: data.entity_id,
      role: data.role,
    },
  });

  return {
    id: user.id,
    email: user.email,
    entity_id: user.entity_id,
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

  return {
    id: user.id,
    email: user.email,
    entity_id: user.entity_id,
    role: user.role,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
}

export async function getUsersByEntityId(entityId: number): Promise<UserResponse[]> {
  const entityExists = await entityService.validateEntityExists(entityId);
  if (!entityExists) {
    throw new Error('Entity not found');
  }

  const users = await prisma.user.findMany({
    where: { 
      entity_id: entityId,
      deleted_at: null
    },
  });

  return users.map(user => ({
    id: user.id,
    email: user.email,
    entity_id: user.entity_id,
    role: user.role,
    created_at: user.created_at,
    updated_at: user.updated_at,
  }));
}

export async function updateUser(
  id: number,
  data: UserUpdate
): Promise<UserResponse> {
  const updateData: Record<string, unknown> = { ...data };
  
  if (data.entity_id) {
    const entityExists = await entityService.validateEntityExists(data.entity_id);
    if (!entityExists) {
      throw new Error('Entity not found');
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

  return {
    id: user.id,
    email: user.email,
    entity_id: user.entity_id,
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