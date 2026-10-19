import { Module } from '@nestjs/common';
import { MomentsController } from './moments.controller';

@Module({
  controllers: [MomentsController],
})
export class MomentsModule {}
