import { Request, Response } from 'express';
import * as userService from '../../services/userService';
import { UserRole } from '../../enums/user';
import { UserResponse, UserCreate, UserUpdate } from '../../types/user';
import * as userController from '../userController';

jest.mock('../../services/userService');

interface RequestWithUser extends Request {
  user?: {
    id: number;
    entityId: number;
    role: string;
  };
}

describe('UserController', () => {
  let mockRequest: Partial<Request & RequestWithUser>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {
      params: {},
      body: {},
      query: {},
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      send: jest.fn(),
    };

    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should create a user successfully', async () => {
      const userData: UserCreate = {
        email: 'test@example.com',
        password: 'password123',
        entity_id: 1,
        role: UserRole.SELLER,
      };

      const createdUser: UserResponse = {
        id: 1,
        email: 'test@example.com',
        entity_id: 1,
        role: UserRole.SELLER,
        created_at: new Date(),
        updated_at: null,
      };

      mockRequest.body = userData;
      jest.spyOn(userService, 'createUser').mockResolvedValue(createdUser);

      await userController.register(mockRequest as Request, mockResponse as Response);

      expect(userService.createUser).toHaveBeenCalledWith(userData);
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(createdUser);
    });

    it('should return 400 when required fields are missing', async () => {
      mockRequest.body = { email: 'test@example.com' };

      await userController.register(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Campos obrigatórios: email, password, entity_id'
      });
    });

    it('should return 409 when email is already in use', async () => {
      const userData: UserCreate = {
        email: 'test@example.com',
        password: 'password123',
        entity_id: 1,
        role: UserRole.SELLER,
      };

      mockRequest.body = userData;
      const error = new Error('Unique constraint');
      jest.spyOn(userService, 'createUser').mockRejectedValue(error);

      await userController.register(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Email já está em uso'
      });
    });
  });

  describe('getUserById', () => {
    it('should return user when found', async () => {
      const user: UserResponse = {
        id: 1,
        email: 'test@example.com',
        entity_id: 1,
        role: UserRole.SELLER,
        created_at: new Date(),
        updated_at: null,
      };

      mockRequest.params = { id: '1' };
      jest.spyOn(userService, 'getUserById').mockResolvedValue(user);

      await userController.getUserById(mockRequest as Request, mockResponse as Response);

      expect(userService.getUserById).toHaveBeenCalledWith(1);
      expect(mockResponse.json).toHaveBeenCalledWith(user);
    });

    it('should return 404 when user is not found', async () => {
      mockRequest.params = { id: '1' };
      jest.spyOn(userService, 'getUserById').mockResolvedValue(null);

      await userController.getUserById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Usuário não encontrado'
      });
    });
  });

  describe('listUsersByEntity', () => {
    it('should return users when entity_id is provided in query', async () => {
      const users: UserResponse[] = [{
        id: 1,
        email: 'test@example.com',
        entity_id: 1,
        role: UserRole.SELLER,
        created_at: new Date(),
        updated_at: null,
      }];

      mockRequest.query = { entity_id: '1' };
      jest.spyOn(userService, 'getUsersByEntityId').mockResolvedValue(users);

      await userController.listUsersByEntity(mockRequest as RequestWithUser, mockResponse as Response);

      expect(userService.getUsersByEntityId).toHaveBeenCalledWith(1);
      expect(mockResponse.json).toHaveBeenCalledWith(users);
    });

    it('should return 400 when entity_id is missing', async () => {
      mockRequest.query = {};
      mockRequest.user = undefined;

      await userController.listUsersByEntity(mockRequest as RequestWithUser, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'entity_id obrigatório'
      });
    });
  });

  describe('updateUser', () => {
    it('should update user successfully', async () => {
      const updateData: UserUpdate = {
        email: 'updated@example.com',
        role: UserRole.MANAGER,
      };

      const updatedUser: UserResponse = {
        id: 1,
        email: 'updated@example.com',
        entity_id: 1,
        role: UserRole.MANAGER,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockRequest.params = { id: '1' };
      mockRequest.body = updateData;
      jest.spyOn(userService, 'updateUser').mockResolvedValue(updatedUser);

      await userController.updateUser(mockRequest as Request, mockResponse as Response);

      expect(userService.updateUser).toHaveBeenCalledWith(1, updateData);
      expect(mockResponse.json).toHaveBeenCalledWith(updatedUser);
    });

    it('should return 400 when trying to update entity_id', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { entity_id: 2 };

      await userController.updateUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Não é permitido alterar a entidade do usuário'
      });
    });
  });

  describe('deleteUser', () => {
    it('should delete user successfully', async () => {
      mockRequest.params = { id: '1' };
      jest.spyOn(userService, 'deleteUser').mockResolvedValue(undefined);

      await userController.deleteUser(mockRequest as Request, mockResponse as Response);

      expect(userService.deleteUser).toHaveBeenCalledWith(1);
      expect(mockResponse.status).toHaveBeenCalledWith(204);
      expect(mockResponse.send).toHaveBeenCalled();
    });

    it('should return 404 when user is not found', async () => {
      mockRequest.params = { id: '1' };
      const error = new Error('Record to update not found');
      jest.spyOn(userService, 'deleteUser').mockRejectedValue(error);

      await userController.deleteUser(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: 'Usuário não encontrado'
      });
    });
  });
}); 