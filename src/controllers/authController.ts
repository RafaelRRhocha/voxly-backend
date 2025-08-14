import { Request, Response } from 'express';
import * as authService from '../services/authService';
import { 
  LoginRequest, 
  RegisterRequest, 
  RefreshTokenRequest, 
  ForgotPasswordRequest, 
  ResetPasswordRequest 
} from '../types/auth';

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const loginData: LoginRequest = req.body;

    const result = await authService.login(loginData);
    res.json(result);
  } catch (err) {
    res.status(401).json({ error: (err as Error).message });
  }
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const registerData: RegisterRequest = req.body;
    const result = await authService.register(registerData);
    res.status(201).json(result);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};

export const profile = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }
    const result = await authService.getProfile(userId);
    res.json(result);
  } catch (err) {
    res.status(404).json({ error: (err as Error).message });
  }
};

export const refreshToken = async (req: Request, res: Response): Promise<void> => {
  try {
    const refreshData: RefreshTokenRequest = req.body;
    const result = await authService.refreshToken(refreshData);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const forgotData: ForgotPasswordRequest = req.body;
    await authService.forgotPassword(forgotData);
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};

export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const resetData: ResetPasswordRequest = req.body;
    await authService.resetPassword(resetData);
    res.status(204).send();
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
};
