import { Module } from '@nestjs/common';
import { FeedController, MomentsController } from './moments.controller';

@Module({
  controllers: [MomentsController, FeedController],
})
export class MomentsModule {}
