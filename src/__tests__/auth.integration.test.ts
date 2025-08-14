import request from 'supertest';
import app from '../app';
import prisma from '../lib/prisma';

describe('Auth Integration Tests', () => {
  beforeAll(async () => {
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'test'
        }
      }
    });
    await prisma.$disconnect();
  });

  afterEach(async () => {
    await prisma.user.deleteMany({
      where: {
        email: {
          contains: 'integration'
        }
      }
    });
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        email: 'integration.test@example.com',
        password: 'password123',
        name: 'Integration Test User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.name).toBe(userData.name);
    });

    it('should return 400 for invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'password123',
        name: 'Test User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for short password', async () => {
      const userData = {
        email: 'integration.test2@example.com',
        password: '123',
        name: 'Test User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'integration.login@example.com',
          password: 'password123',
          name: 'Login Test User'
        });
    });

    it('should login successfully with valid credentials', async () => {
      const loginData = {
        email: 'integration.login@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(loginData.email);
    });

    it('should return 401 for invalid credentials', async () => {
      const loginData = {
        email: 'integration.login@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 400 for invalid email format', async () => {
      const loginData = {
        email: 'invalid-email',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/auth/profile', () => {
    let authToken: string;

    beforeEach(async () => {
      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'integration.profile@example.com',
          password: 'password123',
          name: 'Profile Test User'
        });

      authToken = registerResponse.body.token;
    });

    it('should return user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body).toHaveProperty('email');
      expect(response.body).toHaveProperty('name');
      expect(response.body.email).toBe('integration.profile@example.com');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    it('should return 403 with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(403);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/refresh', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'integration.refresh@example.com',
          password: 'password123',
          name: 'Refresh Test User'
        });
    });

    it('should refresh token successfully', async () => {
      const refreshData = {
        email: 'integration.refresh@example.com'
      };

      const response = await request(app)
        .post('/api/auth/refresh')
        .send(refreshData)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(refreshData.email);
    });

    it('should return 400 for non-existent user', async () => {
      const refreshData = {
        email: 'nonexistent@example.com'
      };

      const response = await request(app)
        .post('/api/auth/refresh')
        .send(refreshData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'integration.forgot@example.com',
          password: 'password123',
          name: 'Forgot Test User'
        });
    });

    it('should send forgot password email successfully', async () => {
      const forgotData = {
        email: 'integration.forgot@example.com'
      };

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send(forgotData)
        .expect(204);

      expect(response.body).toEqual({});
    });

    it('should return 204 even for non-existent email', async () => {
      const forgotData = {
        email: 'nonexistent@example.com'
      };

      const response = await request(app)
        .post('/api/auth/forgot-password')
        .send(forgotData)
        .expect(204);

      expect(response.body).toEqual({});
    });
  });

  describe('POST /api/auth/reset-password', () => {
    let resetToken: string;

    beforeEach(async () => {
      await request(app)
        .post('/api/auth/register')
        .send({
          email: 'integration.reset@example.com',
          password: 'password123',
          name: 'Reset Test User'
        });

      await request(app)
        .post('/api/auth/forgot-password')
        .send({ email: 'integration.reset@example.com' });

      const user = await prisma.user.findUnique({
        where: { email: 'integration.reset@example.com' }
      });

      resetToken = user?.reset_token || '';
    });

    it('should reset password successfully', async () => {
      const resetData = {
        token: resetToken,
        password: 'newpassword123'
      };

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send(resetData)
        .expect(204);

      expect(response.body).toEqual({});

      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'integration.reset@example.com',
          password: 'newpassword123'
        })
        .expect(200);

      expect(loginResponse.body).toHaveProperty('token');
    });

    it('should return 400 for invalid token', async () => {
      const resetData = {
        token: 'invalid-token',
        password: 'newpassword123'
      };

      const response = await request(app)
        .post('/api/auth/reset-password')
        .send(resetData)
        .expect(400);

      expect(response.body).toHaveProperty('error');
    });
  });
});
