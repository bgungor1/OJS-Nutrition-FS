import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { JwtAuthGuard } from './jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let mockReflector: {
    getAllAndOverride: jest.Mock;
  };
  let mockContext: ExecutionContext;

  beforeEach(() => {
    mockReflector = {
      getAllAndOverride: jest.fn(),
    };

    guard = new JwtAuthGuard(mockReflector as unknown as Reflector);

    mockContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should skip authentication and return true for endpoint marked with @Public()', () => {
    mockReflector.getAllAndOverride.mockReturnValue(true);

    const result = guard.canActivate(mockContext);

    expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith(
      IS_PUBLIC_KEY,
      [mockContext.getHandler(), mockContext.getClass()],
    );
    expect(result).toBe(true);
  });

  it('should call super.canActivate for protected endpoint without @Public()', () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);

    const superCanActivateSpy = jest
      .spyOn(AuthGuard('jwt').prototype, 'canActivate')
      .mockReturnValue(true);

    const result = guard.canActivate(mockContext);

    expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith(
      IS_PUBLIC_KEY,
      [mockContext.getHandler(), mockContext.getClass()],
    );
    expect(superCanActivateSpy).toHaveBeenCalledWith(mockContext);
    expect(result).toBe(true);

    superCanActivateSpy.mockRestore();
  });
});
