import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JwtPayload } from '../types/auth';
import { UserRole } from '../enums/user';

const JWT_SECRET = process.env.JWT_SECRET || 'secret';

export const authenticate = (req: Request, res: Response, next: NextFunction): void => {
  const auth = req.headers.authorization;
  if (!auth) {
    res.status(401).json({ error: 'Token missing' });
    return;
  }

  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, JWT_SECRET) as JwtPayload;

    req.body.user = {
      id: payload.userId,
      entityId: payload.entityId,
      role: payload.role,
    };
    next();
  } catch {
    res.status(403).json({ error: 'Invalid token' });
  }
};

export const requireRole = (role: UserRole) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.body.user || req.body.user.role !== role) {
      res.status(403).json({ error: 'Access restricted' });
      return;
    }
    next();
  };
};

export const requireAdmin = requireRole(UserRole.ADMIN);
