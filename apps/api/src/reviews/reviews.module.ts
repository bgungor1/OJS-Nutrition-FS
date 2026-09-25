import { Module } from '@nestjs/common';
import { MediaModule } from '../media/media.module';
import { ReviewsAdminController } from './reviews-admin.controller';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';

@Module({
  imports: [MediaModule],
  controllers: [ReviewsController, ReviewsAdminController],
  providers: [ReviewsService],
  exports: [ReviewsService],
})
export class ReviewsModule {}
