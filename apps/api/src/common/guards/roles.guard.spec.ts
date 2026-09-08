import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let mockReflector: {
    getAllAndOverride: jest.Mock;
  };
  let mockRequest: {
    user?: {
      id: string;
      email: string;
      role: Role;
    };
  };
  let mockContext: ExecutionContext;

  beforeEach(() => {
    mockReflector = {
      getAllAndOverride: jest.fn(),
    };

    guard = new RolesGuard(mockReflector as unknown as Reflector);

    mockRequest = {};

    mockContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('rol kısıtı bulunmayan (@Roles tanımlanmamış) endpoint için true dönmeli', () => {
    mockReflector.getAllAndOverride.mockReturnValue(undefined);

    const result = guard.canActivate(mockContext);

    expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
      mockContext.getHandler(),
      mockContext.getClass(),
    ]);
    expect(result).toBe(true);
  });

  it('boş rol dizisi verildiğinde true dönmeli', () => {
    mockReflector.getAllAndOverride.mockReturnValue([]);

    const result = guard.canActivate(mockContext);

    expect(result).toBe(true);
  });

  it('kullanıcı oturumu yoksa (request.user undefined) ForbiddenException fırlatmalı', () => {
    mockReflector.getAllAndOverride.mockReturnValue([Role.admin]);
    mockRequest.user = undefined;

    expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(mockContext)).toThrow(
      'Bu işlem için yetkiniz yok.',
    );
  });

  it('kullanıcı rolü yetersizse (customer iken admin isteniyorsa) ForbiddenException fırlatmalı', () => {
    mockReflector.getAllAndOverride.mockReturnValue([Role.admin]);
    mockRequest.user = {
      id: 'user-1',
      email: 'customer@example.com',
      role: Role.customer,
    };

    expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
  });

  it('kullanıcı gerekli role sahipse (admin) true dönmeli', () => {
    mockReflector.getAllAndOverride.mockReturnValue([Role.admin]);
    mockRequest.user = {
      id: 'admin-1',
      email: 'admin@example.com',
      role: Role.admin,
    };

    const result = guard.canActivate(mockContext);

    expect(result).toBe(true);
  });
});
