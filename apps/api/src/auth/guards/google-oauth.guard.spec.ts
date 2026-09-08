import { ExecutionContext, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AppConfig } from '../../config/configuration';
import { GoogleOAuthGuard } from './google-oauth.guard';

describe('GoogleOAuthGuard', () => {
  let guard: GoogleOAuthGuard;
  let mockConfigService: { get: jest.Mock };

  beforeEach(() => {
    mockConfigService = {
      get: jest.fn(),
    };
    guard = new GoogleOAuthGuard(
      mockConfigService as unknown as ConfigService<AppConfig, true>,
    );
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should throw ServiceUnavailableException when clientId is missing', () => {
    mockConfigService.get.mockReturnValue({
      clientId: '',
      clientSecret: 'secret',
    });

    const mockContext = {} as ExecutionContext;
    expect(() => guard.canActivate(mockContext)).toThrow(
      ServiceUnavailableException,
    );
  });

  it('should throw ServiceUnavailableException when clientSecret is missing', () => {
    mockConfigService.get.mockReturnValue({
      clientId: 'client-id',
      clientSecret: '',
    });

    const mockContext = {} as ExecutionContext;
    expect(() => guard.canActivate(mockContext)).toThrow(
      ServiceUnavailableException,
    );
  });

  it('should call super.canActivate when credentials are configured', () => {
    mockConfigService.get.mockReturnValue({
      clientId: 'client-id',
      clientSecret: 'secret',
    });

    const mockContext = {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({}),
        getResponse: jest.fn().mockReturnValue({}),
      }),
    } as unknown as ExecutionContext;

    // Spy on super.canActivate (prototype of AuthGuard)
    const superCanActivateSpy = jest
      .spyOn(
        Object.getPrototypeOf(GoogleOAuthGuard.prototype) as {
          canActivate: (c: ExecutionContext) => boolean;
        },
        'canActivate',
      )
      .mockReturnValue(true);

    const result = guard.canActivate(mockContext);
    expect(superCanActivateSpy).toHaveBeenCalledWith(mockContext);
    expect(result).toBe(true);

    superCanActivateSpy.mockRestore();
  });
});
