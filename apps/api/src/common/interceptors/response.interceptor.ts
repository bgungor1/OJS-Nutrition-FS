import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

export interface SuccessResponse<T> {
  status: 'success';
  data: T;
}

/**
 * Her başarılı yanıtı `{ status: 'success', data }` şekline sarar.
 * Controller'lar yalnızca ham veriyi döndürür — zarf tek yerde yönetilir
 * (BACKEND_PLAN §3, ENGINEERING_STANDARDS §2).
 */
@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  SuccessResponse<T>
> {
  intercept(
    _context: ExecutionContext,
    next: CallHandler<T>,
  ): Observable<SuccessResponse<T>> {
    return next.handle().pipe(map((data) => ({ status: 'success', data })));
  }
}
