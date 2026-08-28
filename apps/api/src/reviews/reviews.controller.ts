import { Controller } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { ReviewsService } from './reviews.service';

/**
 * BACKEND_PLAN §5.7:
 *  GET  /products/:slug/reviews?limit=&offset=&rating=  @Public
 *       -> { count, results: Review[], stats: ReviewStats }
 *  POST /products/:slug/reviews   Bearer   { rating, title, text, images? } -> Review
 */
@ApiTags('reviews')
@Controller('products/:slug/reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}
}
