import { Injectable } from '@nestjs/common';

/**
 * Faz 3 — BACKEND_PLAN §5.7.
 *  - list(slug, { limit, offset, rating }): { count, results, stats }
 *  - create(slug, userId, dto): reviewerName kullanıcıdan; isVerified = Order'da
 *    eşleşme; Product.commentCount/averageStar aynı transaction'da güncellenir.
 *  - Admin: DELETE /reviews/:id (moderasyon).
 */
@Injectable()
export class ReviewsService {}
