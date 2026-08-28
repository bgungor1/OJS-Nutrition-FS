import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ContactService } from './contact.service';

/**
 * BACKEND_PLAN §5.9:
 *  POST /contact   @Public (IP rate-limit)  { name, email, message }
 *       -> { id, message: 'Mesajınız alındı' }
 *  Admin: GET /contact?handled=, PUT /contact/:id { handled }
 */
@ApiTags('contact')
@Controller('contact')
export class ContactController {
  constructor(private readonly contactService: ContactService) {}
}
