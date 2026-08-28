import { Injectable } from '@nestjs/common';

/**
 * Faz 3 — BACKEND_PLAN §5.9. POST /contact { name, email, message }.
 * E-posta bildirimi ana request-response akışını bloklamaz
 * (ENGINEERING_STANDARDS §5.2). Admin: GET /contact, PUT /contact/:id.
 */
@Injectable()
export class ContactService {}
