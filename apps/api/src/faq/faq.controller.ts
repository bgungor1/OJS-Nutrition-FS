import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FaqService } from './faq.service';

/**
 * BACKEND_PLAN §5.8:
 *  GET /faq?category=   @Public   -> FaqItem[]
 *  Admin: POST /faq, PUT /faq/:id, DELETE /faq/:id  @Roles('admin')
 */
@ApiTags('faq')
@Controller('faq')
export class FaqController {
  constructor(private readonly faqService: FaqService) {}
}
