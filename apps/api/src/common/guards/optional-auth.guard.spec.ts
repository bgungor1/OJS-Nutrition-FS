import { Role } from '@prisma/client';
import { OptionalAuthGuard } from './optional-auth.guard';
import { AuthenticatedUser } from '../types/authenticated-user';

describe('OptionalAuthGuard', () => {
  let guard: OptionalAuthGuard;

  beforeEach(() => {
    guard = new OptionalAuthGuard();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  describe('handleRequest', () => {
    it('should return user when user is provided', () => {
      const mockUser: AuthenticatedUser = {
        id: 'usr-1',
        email: 'test@example.com',
        role: Role.customer,
      };

      const result = guard.handleRequest(null, mockUser);
      expect(result).toEqual(mockUser);
    });

    it('should return undefined when user is false', () => {
      const result = guard.handleRequest(null, false);
      expect(result).toBeUndefined();
    });

    it('should return undefined when user is null or undefined', () => {
      const result = guard.handleRequest(null, undefined as unknown as false);
      expect(result).toBeUndefined();
    });
  });
});
