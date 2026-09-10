import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { PaymentsService } from '../payments.service';

@Injectable()
export class IyzicoWebhookGuard implements CanActivate {
  constructor(private readonly paymentsService: PaymentsService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const signature = this.extractHeader(
      request,
      'x-iyzico-signature',
      'x-iyzi-signature',
      'x-iyzico-signature-v2',
    );

    if (!signature) {
      throw new UnauthorizedException('Missing payment webhook signature.');
    }

    const timestamp = this.extractHeader(
      request,
      'x-iyzico-timestamp',
      'x-iyzi-timestamp',
    );

    const rawPayload = this.extractPayload(request);
    const isValid = this.paymentsService.verifyWebhookSignature(
      rawPayload,
      signature,
      timestamp,
    );

    if (!isValid) {
      throw new UnauthorizedException('Invalid payment webhook signature.');
    }

    return true;
  }

  private extractHeader(
    request: Request,
    ...headerNames: string[]
  ): string | undefined {
    for (const name of headerNames) {
      const value = request.headers[name];
      if (typeof value === 'string' && value.trim()) {
        return value.trim();
      }
      if (Array.isArray(value) && value.length > 0 && value[0]) {
        return value[0].trim();
      }
    }
    return undefined;
  }

  private extractPayload(request: Request): string {
    const customRequest = request as unknown as { rawBody?: Buffer | string };
    if (Buffer.isBuffer(customRequest.rawBody)) {
      return customRequest.rawBody.toString('utf8');
    }
    if (typeof customRequest.rawBody === 'string') {
      return customRequest.rawBody;
    }
    return JSON.stringify(request.body ?? {});
  }
}
