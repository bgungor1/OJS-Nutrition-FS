import { AuthProvider, Role } from '@prisma/client';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';

export const createMockRegisterDto = (
  overrides: Partial<RegisterDto> = {},
): RegisterDto => ({
  email: 'test@example.com',
  password: 'Password1',
  password2: 'Password1',
  first_name: 'Test',
  last_name: 'User',
  ...overrides,
});

export const createMockLoginDto = (
  overrides: Partial<LoginDto> = {},
): LoginDto => ({
  username: 'test@example.com',
  password: 'Password1',
  ...overrides,
});

export const createMockUser = (overrides = {}) => ({
  id: 'uuid-1234',
  email: 'test@example.com',
  passwordHash: '$2b$10$EPVvCgU8cM09N8jB6L0QO.V/Pkn3q4zDkZ8V2V2hKq7iVlKqFkQ1.',
  authProvider: AuthProvider.local,
  googleId: null,
  role: Role.customer,
  firstName: 'Test',
  lastName: 'User',
  phoneNumber: null,
  createdAt: new Date('2026-09-07T12:00:00Z'),
  updatedAt: new Date('2026-09-07T12:00:00Z'),
  ...overrides,
});

export const createMockSafeUser = (overrides = {}) => ({
  id: 'uuid-1234',
  email: 'test@example.com',
  firstName: 'Test',
  lastName: 'User',
  role: Role.customer,
  createdAt: new Date('2026-09-07T12:00:00Z'),
  ...overrides,
});

export const createMockRefreshToken = (overrides = {}) => ({
  id: 'token-uuid-1234',
  userId: 'uuid-1234',
  tokenHash: 'mock-sha256-hash',
  expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  revokedAt: null,
  createdAt: new Date('2026-09-07T12:00:00Z'),
  ...overrides,
});

export const createMockRefreshTokenDto = (overrides = {}) => ({
  refresh: 'valid.mock.refresh-token',
  ...overrides,
});
