import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Public } from '../common/decorators/public.decorator';
import { ErrorResponseDto } from '../common/dto';
import { PaymentWebhookDto, PaymentWebhookResponseDto } from './dto';
import { IyzicoWebhookGuard } from './guards/iyzico-webhook.guard';
import { PaymentsService } from './payments.service';

@ApiTags('payments')
@Controller('payments')
export class PaymentsWebhookController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Public()
  @UseGuards(IyzicoWebhookGuard)
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Handle iyzico async payment and refund webhook notifications',
    description:
      'HMAC imza doğrulaması ile iyzico webhook çağrılarını işler ve sipariş/ödeme durumunu günceller.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Webhook successfully validated and processed.',
    type: PaymentWebhookResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid webhook payload structure.',
    type: ErrorResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Missing or invalid webhook HMAC signature.',
    type: ErrorResponseDto,
  })
  handleWebhook(@Body() dto: PaymentWebhookDto): {
    received: boolean;
    status: string;
  } {
    return this.paymentsService.handleWebhook(dto);
  }
}
