import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

import { UserRole } from "../enums/user";
import prisma from "../lib/prisma";
import {
  JwtPayload,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RegisterRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
  UserProfile,
} from "../types/auth";

const JWT_SECRET = process.env.JWT_SECRET || "secret";
const SALT_ROUNDS = 10;

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const user = await prisma.user.findUnique({
    where: {
      email: data.email,
      deleted_at: null,
    },
  });

  if (!user) throw new Error("Invalid credentials");

  const valid = await bcrypt.compare(data.password, user.password_hash);
  if (!valid) throw new Error("Invalid credentials");

  const entity = await prisma.entity.findUnique({
    where: {
      id: user.entity_id,
      deleted_at: null,
    },
  });

  if (!entity) throw new Error("Entity not found or inactive");

  const payload: JwtPayload = {
    userId: user.id,
    entityId: user.entity_id,
    role: user.role as UserRole,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });

  return {
    user: {
      id: user.id.toString(),
      email: user.email,
      name: user.name,
      entityId: user.entity_id,
      role: user.role as UserRole,
    },
    token,
  };
}

export async function register(data: RegisterRequest): Promise<LoginResponse> {
  const existingUser = await prisma.user.findUnique({
    where: { email: data.email },
  });

  if (existingUser) throw new Error("Email already registered");

  const defaultEntity = await prisma.entity.findFirst({
    where: { deleted_at: null },
  });

  if (!defaultEntity) throw new Error("No entity available for registration");

  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password_hash: passwordHash,
      entity_id: defaultEntity.id,
      role: UserRole.SELLER,
    },
  });

  const payload: JwtPayload = {
    userId: user.id,
    entityId: user.entity_id,
    role: user.role as UserRole,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });

  return {
    user: {
      id: user.id.toString(),
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
      entityId: user.entity_id,
    },
    token,
  };
}

export async function getProfile(userId: number): Promise<UserProfile> {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
      deleted_at: null,
    },
  });

  const entity = await prisma.entity.findUnique({
    where: {
      id: user?.entity_id,
      deleted_at: null,
    },
  });

  if (!user || !entity) throw new Error("User or Entity not found");

  return {
    ...user,
    entityName: entity.name,
    entityId: entity.id,
    id: user.id.toString(),
  };
}

export async function refreshToken(
  data: RefreshTokenRequest,
): Promise<LoginResponse> {
  const user = await prisma.user.findUnique({
    where: {
      email: data.email,
      deleted_at: null,
    },
  });

  if (!user) throw new Error("User not found");

  const entity = await prisma.entity.findUnique({
    where: {
      id: user.entity_id,
      deleted_at: null,
    },
  });

  if (!entity) throw new Error("Entity not found or inactive");

  const payload: JwtPayload = {
    userId: user.id,
    entityId: user.entity_id,
    role: user.role as UserRole,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });

  return {
    user: {
      id: user.id.toString(),
      email: user.email,
      name: user.name,
      role: user.role as UserRole,
      entityId: user.entity_id,
    },
    token,
  };
}

export async function resetPassword(
  data: ResetPasswordRequest,
): Promise<{ email: string }> {
  const user = await prisma.user.findUnique({
    where: {
      email: data.email,
      deleted_at: null,
    },
  });

  if (!user) throw new Error("User not found");

  const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      password_hash: passwordHash,
      updated_at: new Date(),
    },
  });

  return { email: data.email };
}

export async function updateProfile(
  userId: number,
  data: UpdateProfileRequest,
): Promise<UserProfile> {
  const updateData: Record<string, unknown> = {};

  if (data.name !== undefined) {
    updateData.name = data.name;
  }

  if (data.email !== undefined) {
    const existingUser = await prisma.user.findUnique({
      where: {
        email: data.email,
        deleted_at: null,
      },
    });

    if (existingUser && existingUser.id !== userId) {
      throw new Error("Email already in use");
    }

    updateData.email = data.email;
  }

  if (data.password !== undefined) {
    updateData.password_hash = await bcrypt.hash(data.password, SALT_ROUNDS);
  }

  if (Object.keys(updateData).length === 0) {
    throw new Error("No fields to update");
  }

  updateData.updated_at = new Date();

  const user = await prisma.user.update({
    where: {
      id: userId,
      deleted_at: null,
    },
    data: updateData,
  });

  const entity = await prisma.entity.findUnique({
    where: {
      id: user.entity_id,
      deleted_at: null,
    },
  });

  if (!entity) throw new Error("Entity not found");

  return {
    id: user.id.toString(),
    email: user.email,
    name: user.name,
    entityName: entity.name,
    entityId: entity.id,
  };
}
