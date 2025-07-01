import { Request, Response } from 'express';
import * as authService from '../../services/authService';
import * as authController from '../authController';
import { LoginRequest, LoginResponse } from '../../types/auth';

jest.mock('../../services/authService');

describe('AuthController', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {
      body: {},
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
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
      const error = new Error('Credenciais inválidas');
      jest.spyOn(authService, 'login').mockRejectedValue(error);

      await authController.login(mockRequest as Request, mockResponse as Response);

      expect(authService.login).toHaveBeenCalledWith(loginData);
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Credenciais inválidas'
      });
    });
  });
}); 