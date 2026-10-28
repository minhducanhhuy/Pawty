import { Module } from '@nestjs/common';
import { AdsController, VouchersController } from './ads.controller';

@Module({
  controllers: [AdsController, VouchersController],
})
export class AdsModule {}
