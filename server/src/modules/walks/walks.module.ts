import { Global, Module } from '@nestjs/common';
import { WalksService } from './walks.service';
import { WalksController } from './walks.controller';

@Global()
@Module({
  controllers: [WalksController],
  providers: [WalksService],
  exports: [WalksService],
})
export class WalksModule {}
