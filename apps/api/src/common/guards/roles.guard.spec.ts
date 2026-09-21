import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Role } from '@prisma/client';
import { AuditEvent, SecurityAuditService } from '../audit';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RolesGuard } from './roles.guard';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let mockReflector: {
    getAllAndOverride: jest.Mock;
  };
  let mockAuditService: {
    warn: jest.Mock;
    info: jest.Mock;
    alarm: jest.Mock;
    record: jest.Mock;
  };
  let mockRequest: {
    user?: {
      id: string;
      email: string;
      role: Role;
    };
    ip?: string;
    path?: string;
  };
  let mockContext: ExecutionContext;

  beforeEach(() => {
    mockReflector = {
      getAllAndOverride: jest.fn(),
    };
    mockAuditService = {
      warn: jest.fn(),
      info: jest.fn(),
      alarm: jest.fn(),
      record: jest.fn(),
    };

    guard = new RolesGuard(
      mockReflector as unknown as Reflector,
      mockAuditService as unknown as SecurityAuditService,
    );

    mockRequest = {
      ip: '127.0.0.1',
      path: '/admin/dashboard',
    };

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

  it('should return true for endpoint without role restrictions (@Roles not defined)', () => {
    mockReflector.getAllAndOverride.mockReturnValue(undefined);

    const result = guard.canActivate(mockContext);

    expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
      mockContext.getHandler(),
      mockContext.getClass(),
    ]);
    expect(result).toBe(true);
  });

  it('should return true when empty roles array is provided', () => {
    mockReflector.getAllAndOverride.mockReturnValue([]);

    const result = guard.canActivate(mockContext);

    expect(result).toBe(true);
  });

  it('should throw ForbiddenException when user session does not exist (request.user undefined)', () => {
    mockReflector.getAllAndOverride.mockReturnValue([Role.admin]);
    mockRequest.user = undefined;

    expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(mockContext)).toThrow(
      'Bu işlem için yetkiniz yok.',
    );
  });

  it('should throw ForbiddenException when user role is insufficient (customer when admin is required)', () => {
    mockReflector.getAllAndOverride.mockReturnValue([Role.admin]);
    mockRequest.user = {
      id: 'user-1',
      email: 'customer@example.com',
      role: Role.customer,
    };

    expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    expect(mockAuditService.warn).toHaveBeenCalledWith(
      AuditEvent.ADMIN_ACCESS_DENIED,
      expect.objectContaining({
        ip: '127.0.0.1',
        userId: 'user-1',
        details: {
          userRole: Role.customer,
          requiredRoles: [Role.admin],
          path: '/admin/dashboard',
        },
      }),
    );
  });

  it('should return true when user has the required role (admin)', () => {
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
