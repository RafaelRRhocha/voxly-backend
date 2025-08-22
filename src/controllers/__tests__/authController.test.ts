import { Request, Response } from "express";

import { UserRole } from "../../enums/user";
import * as authService from "../../services/authService";
import {
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  ResetPasswordRequest,
  UpdateProfileRequest,
  UserProfile,
} from "../../types/auth";
import * as authController from "../authController";

import "../../types/express";

jest.mock("../../services/authService");

describe("AuthController", () => {
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

  describe("login", () => {
    it("should login successfully", async () => {
      const loginData: LoginRequest = {
        email: "test@example.com",
        password: "password123",
      };

      const loginResponse: LoginResponse = {
        user: {
          id: "1",
          email: "test@example.com",
          name: "Test User",
          role: UserRole.SELLER,
          entityId: 1,
        },
        token: "jwt-token",
      };

      mockRequest.body = loginData;
      jest.spyOn(authService, "login").mockResolvedValue(loginResponse);

      await authController.login(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(authService.login).toHaveBeenCalledWith(loginData);
      expect(mockResponse.json).toHaveBeenCalledWith(loginResponse);
    });

    it("should return 401 when login fails", async () => {
      const loginData: LoginRequest = {
        email: "test@example.com",
        password: "wrong-password",
      };

      mockRequest.body = loginData;
      const error = new Error("Invalid credentials");
      jest.spyOn(authService, "login").mockRejectedValue(error);

      await authController.login(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(authService.login).toHaveBeenCalledWith(loginData);
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Invalid credentials",
      });
    });
  });

  describe("updateProfile", () => {
    it("should update profile successfully", async () => {
      const updateData: UpdateProfileRequest = {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      };

      const updateResponse: UserProfile = {
        id: "1",
        email: "test@example.com",
        name: "Test User",
        entityName: "Test Entity",
        entityId: 1,
      };

      mockRequest.body = updateData;
      mockRequest.user = { id: 1, entityId: 1, role: UserRole.SELLER };
      jest
        .spyOn(authService, "updateProfile")
        .mockResolvedValue(updateResponse);

      await authController.updateProfile(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(authService.updateProfile).toHaveBeenCalledWith(1, updateData);
      expect(mockResponse.json).toHaveBeenCalledWith(updateResponse);
    });

    it("should return 401 when user not authenticated", async () => {
      const updateData: UpdateProfileRequest = {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      };

      mockRequest.body = updateData;
      mockRequest.user = undefined;

      await authController.updateProfile(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "User not authenticated",
      });
    });

    it("should return 400 when no fields to update", async () => {
      const updateData: UpdateProfileRequest = {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      };

      mockRequest.body = updateData;
      mockRequest.user = { id: 1, entityId: 1, role: UserRole.SELLER };
      const error = new Error("No fields to update");
      jest.spyOn(authService, "updateProfile").mockRejectedValue(error);

      await authController.updateProfile(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(authService.updateProfile).toHaveBeenCalledWith(1, updateData);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "No fields to update",
      });
    });

    it("should return 409 when email already in use", async () => {
      const updateData: UpdateProfileRequest = {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      };

      mockRequest.body = updateData;
      mockRequest.user = { id: 1, entityId: 1, role: UserRole.SELLER };
      const error = new Error("Email already in use");
      jest.spyOn(authService, "updateProfile").mockRejectedValue(error);

      await authController.updateProfile(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(authService.updateProfile).toHaveBeenCalledWith(1, updateData);
      expect(mockResponse.status).toHaveBeenCalledWith(409);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Email already in use",
      });
    });

    it("should return 500 for other errors", async () => {
      const updateData: UpdateProfileRequest = {
        email: "test@example.com",
        password: "password123",
        name: "Test User",
      };

      mockRequest.body = updateData;
      mockRequest.user = { id: 1, entityId: 1, role: UserRole.SELLER };
      const error = new Error("Database connection error");
      jest.spyOn(authService, "updateProfile").mockRejectedValue(error);

      await authController.updateProfile(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(authService.updateProfile).toHaveBeenCalledWith(1, updateData);
      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "Database connection error",
      });
    });
  });

  describe("profile", () => {
    it("should return user profile successfully", async () => {
      const userProfile = {
        id: "1",
        email: "test@example.com",
        name: "Test User",
        entityName: "Test Entity",
        entityId: 1,
      };

      mockRequest.user = { id: 1, entityId: 1, role: UserRole.SELLER };
      jest.spyOn(authService, "getProfile").mockResolvedValue(userProfile);

      await authController.profile(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(authService.getProfile).toHaveBeenCalledWith(1);
      expect(mockResponse.json).toHaveBeenCalledWith(userProfile);
    });

    it("should return 401 when user not authenticated", async () => {
      mockRequest.user = undefined;

      await authController.profile(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "User not authenticated",
      });
    });
  });

  describe("refreshToken", () => {
    it("should refresh token successfully", async () => {
      const refreshData: RefreshTokenRequest = {
        email: "test@example.com",
      };

      const refreshResponse: LoginResponse = {
        user: {
          id: "1",
          email: "test@example.com",
          name: "Test User",
          role: UserRole.SELLER,
          entityId: 1,
        },
        token: "new-jwt-token",
      };

      mockRequest.body = refreshData;
      jest
        .spyOn(authService, "refreshToken")
        .mockResolvedValue(refreshResponse);

      await authController.refreshToken(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(authService.refreshToken).toHaveBeenCalledWith(refreshData);
      expect(mockResponse.json).toHaveBeenCalledWith(refreshResponse);
    });
  });

  describe("resetPassword", () => {
    it("should reset password successfully", async () => {
      const resetData: ResetPasswordRequest = {
        email: "test@example.com",
        password: "newpassword123",
      };

      const resetResponse = { email: "test@example.com" };

      mockRequest.body = resetData;
      jest.spyOn(authService, "resetPassword").mockResolvedValue(resetResponse);

      await authController.resetPassword(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(authService.resetPassword).toHaveBeenCalledWith(resetData);
      expect(mockResponse.json).toHaveBeenCalledWith(resetResponse);
    });

    it("should return 400 when reset fails", async () => {
      const resetData: ResetPasswordRequest = {
        email: "nonexistent@example.com",
        password: "newpassword123",
      };

      mockRequest.body = resetData;
      const error = new Error("User not found");
      jest.spyOn(authService, "resetPassword").mockRejectedValue(error);

      await authController.resetPassword(
        mockRequest as Request,
        mockResponse as Response,
      );

      expect(authService.resetPassword).toHaveBeenCalledWith(resetData);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({
        error: "User not found",
      });
    });
  });
});
