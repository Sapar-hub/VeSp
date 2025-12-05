import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AuthService } from '../../src/services/AuthService';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import prisma from '../../src/db';

// Mock bcryptjs
vi.mock('bcryptjs', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    __esModule: true, // This is important for default exports
    ...actual,
    default: {
      hash: vi.fn((password) => Promise.resolve(`hashed-${password}`)),
      compare: vi.fn((password, hashedPassword) => Promise.resolve(hashedPassword === `hashed-${password}`)),
    },
  };
});

// Mock jsonwebtoken
vi.mock('jsonwebtoken', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    __esModule: true, // This is important for default exports
    ...actual,
    default: {
      sign: vi.fn(() => 'mocked-jwt-token'),
    },
  };
});

// Mock prisma client
vi.mock('../../src/db', () => ({
  default: {
    user: {
      findUnique: vi.fn(),
      create: vi.fn(),
    },
  },
}));

describe('AuthService', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
  });

  // Ensure process.env.JWT_SECRET is set for tests
  const originalEnv = process.env;
  beforeEach(() => {
    process.env = { ...originalEnv, JWT_SECRET: 'test-secret' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('register', () => {
    it('should register a new user and return a token', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      const createdUser = { id: 1, email, password: 'hashed-password123' };

      // Mock Prisma's findUnique to return null (user does not exist)
      (prisma.user.findUnique as vi.Mock).mockResolvedValue(null);
      // Mock Prisma's create to return the newly created user
      (prisma.user.create as vi.Mock).mockResolvedValue(createdUser);

      // Act
      const result = await AuthService.register(email, password);

      // Assert
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email } });
      expect(bcrypt.hash).toHaveBeenCalledWith(password, 10);
      expect(prisma.user.create).toHaveBeenCalledWith({
        data: {
          email,
          password: `hashed-${password}`,
        },
      });
      expect(jwt.sign).toHaveBeenCalledWith({ userId: createdUser.id }, 'super-secret-dev-key', { expiresIn: '7d' });
      expect(result).toEqual({
        user: { id: createdUser.id, email: createdUser.email },
        token: 'mocked-jwt-token',
      });
    });

    it('should throw an error if user already exists', async () => {
      // Arrange
      const email = 'existing@example.com';
      const password = 'password123';

      // Mock Prisma's findUnique to return an existing user
      (prisma.user.findUnique as vi.Mock).mockResolvedValue({ id: 1, email, password: 'hashed-password' });

      // Act & Assert
      await expect(AuthService.register(email, password)).rejects.toThrow('User already exists');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email } });
      expect(prisma.user.create).not.toHaveBeenCalled();
      expect(bcrypt.hash).not.toHaveBeenCalled();
      expect(jwt.sign).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('should log in an existing user and return a token', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'password123';
      const user = { id: 1, email, password: `hashed-${password}` };

      // Mock Prisma's findUnique to return an existing user
      (prisma.user.findUnique as vi.Mock).mockResolvedValue(user);
      // bcrypt.compare is mocked globally to return true if passwords match the hashed format

      // Act
      const result = await AuthService.login(email, password);

      // Assert
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email } });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, user.password);
      expect(jwt.sign).toHaveBeenCalledWith({ userId: user.id }, 'super-secret-dev-key', { expiresIn: '7d' });
      expect(result).toEqual({
        user: { id: user.id, email: user.email },
        token: 'mocked-jwt-token',
      });
    });

    it('should throw an error for invalid credentials (user not found)', async () => {
      // Arrange
      const email = 'nonexistent@example.com';
      const password = 'password123';

      // Mock Prisma's findUnique to return null (user not found)
      (prisma.user.findUnique as vi.Mock).mockResolvedValue(null);

      // Act & Assert
      await expect(AuthService.login(email, password)).rejects.toThrow('Invalid credentials');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email } });
      expect(bcrypt.compare).not.toHaveBeenCalled();
      expect(jwt.sign).not.toHaveBeenCalled();
    });

    it('should throw an error for invalid credentials (incorrect password)', async () => {
      // Arrange
      const email = 'test@example.com';
      const password = 'wrong-password';
      const user = { id: 1, email, password: 'hashed-correct-password' }; // Hashed password for a different correct password

      // Mock Prisma's findUnique to return an existing user
      (prisma.user.findUnique as vi.Mock).mockResolvedValue(user);
      // bcrypt.compare is mocked globally to return false if passwords don't match

      // Act & Assert
      await expect(AuthService.login(email, password)).rejects.toThrow('Invalid credentials');
      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { email } });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, user.password);
      expect(jwt.sign).not.toHaveBeenCalled();
    });
  });
});