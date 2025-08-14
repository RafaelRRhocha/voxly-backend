import { Request, Response } from 'express';
import * as authService from '../../services/authService';
import * as authController from '../authController';
import { 
  LoginRequest, 
  LoginResponse, 
  RegisterRequest, 
  RefreshTokenRequest, 
  ForgotPasswordRequest, 
  ResetPasswordRequest 
} from '../../types/auth';

jest.mock('../../services/authService');

describe('AuthController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let mockSend: jest.Mock;

  beforeEach(() => {
    mockSend = jest.fn();
    
    mockRequest = {
      body: {},
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: mockSend,
    };

    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const loginData: LoginRequest = {
        email: 'test@example.com',
        password: 'password123',
      };

      const loginResponse: LoginResponse = {
        user: { id: '1', email: 'test@example.com', name: 'Test User' },
        token: 'jwt-token',
      };

      mockRequest.body = loginData;
      jest.spyOn(authService, 'login').mockResolvedValue(loginResponse);

      await authController.login(mockRequest as Request, mockResponse as Response);

      expect(authService.login).toHaveBeenCalledWith(loginData);
      expect(mockResponse.json).toHaveBeenCalledWith(loginResponse);
    });

    it('should return 401 when login fails', async () => {
      const loginData: LoginRequest = {
        email: 'test@example.com',
        password: 'wrong-password',
      };

      mockRequest.body = loginData;
      const error = new Error('Invalid credentials');
      jest.spyOn(authService, 'login').mockRejectedValue(error);

      await authController.login(mockRequest as Request, mockResponse as Response);

      expect(authService.login).toHaveBeenCalledWith(loginData);
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid credentials'
      });
    });
  });

  describe('register', () => {
    it('should register successfully', async () => {
      const registerData: RegisterRequest = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      const registerResponse: LoginResponse = {
        user: { id: '1', email: 'test@example.com', name: 'Test User' },
        token: 'jwt-token',
      };

      mockRequest.body = registerData;
      jest.spyOn(authService, 'register').mockResolvedValue(registerResponse);

      await authController.register(mockRequest as Request, mockResponse as Response);

      expect(authService.register).toHaveBeenCalledWith(registerData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(registerResponse);
    });

    it('should return 400 when registration fails', async () => {
      const registerData: RegisterRequest = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      };

      mockRequest.body = registerData;
      const error = new Error('Email already registered');
      jest.spyOn(authService, 'register').mockRejectedValue(error);

      await authController.register(mockRequest as Request, mockResponse as Response);

      expect(authService.register).toHaveBeenCalledWith(registerData);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Email already registered'
      });
    });
  });

  describe('profile', () => {
    it('should return user profile successfully', async () => {
      const userProfile = { id: '1', email: 'test@example.com', name: 'Test User' };

      (mockRequest as any).user = { id: 1 };
      jest.spyOn(authService, 'getProfile').mockResolvedValue(userProfile);

      await authController.profile(mockRequest as Request, mockResponse as Response);

      expect(authService.getProfile).toHaveBeenCalledWith(1);
      expect(mockResponse.json).toHaveBeenCalledWith(userProfile);
    });

    it('should return 401 when user not authenticated', async () => {
      (mockRequest as any).user = undefined;

      await authController.profile(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'User not authenticated'
      });
    });
  });

  describe('refreshToken', () => {
    it('should refresh token successfully', async () => {
      const refreshData: RefreshTokenRequest = {
        email: 'test@example.com',
      };

      const refreshResponse: LoginResponse = {
        user: { id: '1', email: 'test@example.com', name: 'Test User' },
        token: 'new-jwt-token',
      };

      mockRequest.body = refreshData;
      jest.spyOn(authService, 'refreshToken').mockResolvedValue(refreshResponse);

      await authController.refreshToken(mockRequest as Request, mockResponse as Response);

      expect(authService.refreshToken).toHaveBeenCalledWith(refreshData);
      expect(mockResponse.json).toHaveBeenCalledWith(refreshResponse);
    });
  });

  describe('forgotPassword', () => {
    it('should send forgot password email successfully', async () => {
      const forgotData: ForgotPasswordRequest = {
        email: 'test@example.com',
      };

      mockRequest.body = forgotData;
      jest.spyOn(authService, 'forgotPassword').mockResolvedValue();

      await authController.forgotPassword(mockRequest as Request, mockResponse as Response);

      expect(authService.forgotPassword).toHaveBeenCalledWith(forgotData);
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockSend).toHaveBeenCalled();
    });
  });

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      const resetData: ResetPasswordRequest = {
        token: 'reset-token',
        password: 'newpassword123',
      };

      mockRequest.body = resetData;
      jest.spyOn(authService, 'resetPassword').mockResolvedValue();

      await authController.resetPassword(mockRequest as Request, mockResponse as Response);

      expect(authService.resetPassword).toHaveBeenCalledWith(resetData);
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockSend).toHaveBeenCalled();
    });

    it('should return 400 when reset fails', async () => {
      const resetData: ResetPasswordRequest = {
        token: 'invalid-token',
        password: 'newpassword123',
      };

      mockRequest.body = resetData;
      const error = new Error('Invalid or expired reset token');
      jest.spyOn(authService, 'resetPassword').mockRejectedValue(error);

      await authController.resetPassword(mockRequest as Request, mockResponse as Response);

      expect(authService.resetPassword).toHaveBeenCalledWith(resetData);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Invalid or expired reset token'
      });
    });
  });
}); 