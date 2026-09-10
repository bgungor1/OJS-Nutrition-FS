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
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
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
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Webhook successfully validated and processed.',
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid webhook payload structure.',
  })
  @ApiResponse({
    status: HttpStatus.UNAUTHORIZED,
    description: 'Missing or invalid webhook HMAC signature.',
  })
  handleWebhook(@Body() dto: PaymentWebhookDto): {
    received: boolean;
    status: string;
  } {
    return this.paymentsService.handleWebhook(dto);
  }
}
