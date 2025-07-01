import prisma from '../lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { LoginRequest, LoginResponse, JwtPayload } from '../types/auth';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export async function login(
  data: LoginRequest
): Promise<LoginResponse> {
  const user = await prisma.user.findUnique({ 
    where: { 
      email: data.email,
      deleted_at: null
    } 
  });
  
  if (!user) throw new Error('Usuário não encontrado');

  const valid = await bcrypt.compare(data.password, user.password_hash);
  if (!valid) throw new Error('Senha inválida');

  const entity = await prisma.entity.findUnique({
    where: {
      id: user.entity_id,
      deleted_at: null
    }
  });

  if (!entity) throw new Error('Entidade não encontrada ou inativa');

  const payload: JwtPayload = {
    userId: user.id,
    entityId: user.entity_id,
    role: user.role,
  };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1d' });

  return { token };
}
