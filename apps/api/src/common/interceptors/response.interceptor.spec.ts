import { lastValueFrom, of } from 'rxjs';
import { ResponseInterceptor } from './response.interceptor';
import type { CallHandler, ExecutionContext } from '@nestjs/common';

describe('ResponseInterceptor', () => {
  it('wraps the handler result in { status: "success", data }', async () => {
    const interceptor = new ResponseInterceptor<{ id: number }>();
    const next: CallHandler<{ id: number }> = { handle: () => of({ id: 1 }) };

    const result = await lastValueFrom(
      interceptor.intercept({} as ExecutionContext, next),
    );

    expect(result).toEqual({ status: 'success', data: { id: 1 } });
  });
});
