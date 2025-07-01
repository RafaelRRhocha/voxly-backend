import { Request, Response } from 'express';
import * as authService from '../services/authService';
import { LoginRequest } from '../types/auth';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const loginData: LoginRequest = req.body;
    const result = await authService.login(loginData);
    res.json(result);
  } catch (err) {
    res.status(401).json({ error: (err as Error).message });
  }
};
