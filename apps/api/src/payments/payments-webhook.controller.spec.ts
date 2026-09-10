import { Test, TestingModule } from '@nestjs/testing';
import { PaymentsWebhookController } from './payments-webhook.controller';
import { PaymentsService } from './payments.service';
import { PaymentWebhookDto } from './dto/payment-webhook.dto';
import { IyzicoWebhookGuard } from './guards/iyzico-webhook.guard';

describe('PaymentsWebhookController', () => {
  let controller: PaymentsWebhookController;
  let paymentsService: {
    handleWebhook: jest.Mock;
  };

  const sampleDto: PaymentWebhookDto = {
    status: 'SUCCESS',
    paymentId: 'iyz_pay_12345',
    conversationId: 'conv_order_987',
    iyziEventType: 'CHECKOUT_FORM_AUTH',
    iyziReferenceCode: 'REF_999',
    token: 'tok_abc123',
  };

  beforeEach(async () => {
    paymentsService = {
      handleWebhook: jest.fn().mockReturnValue({
        received: true,
        status: 'SUCCESS',
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [PaymentsWebhookController],
      providers: [
        {
          provide: PaymentsService,
          useValue: paymentsService,
        },
      ],
    })
      .overrideGuard(IyzicoWebhookGuard)
      .useValue({ canActivate: jest.fn().mockReturnValue(true) })
      .compile();

    controller = module.get<PaymentsWebhookController>(
      PaymentsWebhookController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('handleWebhook', () => {
    it('should process webhook payload and return success response', () => {
      const result = controller.handleWebhook(sampleDto);

      expect(paymentsService.handleWebhook).toHaveBeenCalledWith(sampleDto);
      expect(result).toEqual({
        received: true,
        status: 'SUCCESS',
      });
    });
  });
});
