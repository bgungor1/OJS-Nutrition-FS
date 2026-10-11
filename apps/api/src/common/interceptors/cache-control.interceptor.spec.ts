import { CallHandler, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { lastValueFrom, of } from 'rxjs';
import { CACHE_CONTROL_METADATA_KEY } from '../decorators/cache-control.decorator';
import { CacheControlInterceptor } from './cache-control.interceptor';

describe('CacheControlInterceptor', () => {
  let interceptor: CacheControlInterceptor;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    interceptor = new CacheControlInterceptor(reflector);
  });

  const createMockContext = (
    options: {
      type?: string;
      setHeader?: jest.Mock;
    } = {},
  ): ExecutionContext => {
    const setHeader = options.setHeader ?? jest.fn();
    return {
      getType: () => options.type ?? 'http',
      getHandler: () => () => {},
      getClass: () => class TestController {},
      switchToHttp: () => ({
        getResponse: () => ({
          setHeader,
        }),
      }),
    } as unknown as ExecutionContext;
  };

  it('sets formatted Cache-Control header when decorator options exist', async () => {
    const setHeaderMock = jest.fn();
    const context = createMockContext({ setHeader: setHeaderMock });
    const next: CallHandler = { handle: () => of({ success: true }) };

    const spy = jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue({
      maxAge: 86400,
      scope: 'public',
      sMaxAge: 3600,
      staleWhileRevalidate: 3600,
      mustRevalidate: true,
    });

    await lastValueFrom(interceptor.intercept(context, next));

    expect(spy).toHaveBeenCalledWith(
      CACHE_CONTROL_METADATA_KEY,
      expect.any(Array),
    );

    expect(setHeaderMock).toHaveBeenCalledWith(
      'Cache-Control',
      'public, max-age=86400, s-maxage=3600, stale-while-revalidate=3600, must-revalidate',
    );
  });

  it('defaults scope to public when scope is not explicitly provided', async () => {
    const setHeaderMock = jest.fn();
    const context = createMockContext({ setHeader: setHeaderMock });
    const next: CallHandler = { handle: () => of('data') };

    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue({
      maxAge: 300,
    });

    await lastValueFrom(interceptor.intercept(context, next));

    expect(setHeaderMock).toHaveBeenCalledWith(
      'Cache-Control',
      'public, max-age=300',
    );
  });

  it('does not set header when no CacheControl metadata is present', async () => {
    const setHeaderMock = jest.fn();
    const context = createMockContext({ setHeader: setHeaderMock });
    const next: CallHandler = { handle: () => of('data') };

    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

    await lastValueFrom(interceptor.intercept(context, next));

    expect(setHeaderMock).not.toHaveBeenCalled();
  });

  it('does not set header for non-HTTP context types', async () => {
    const setHeaderMock = jest.fn();
    const context = createMockContext({
      type: 'rpc',
      setHeader: setHeaderMock,
    });
    const next: CallHandler = { handle: () => of('data') };

    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue({ maxAge: 60 });

    await lastValueFrom(interceptor.intercept(context, next));

    expect(setHeaderMock).not.toHaveBeenCalled();
  });
});
