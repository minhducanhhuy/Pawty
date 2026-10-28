import { Module } from '@nestjs/common';
import { SosController } from './sos.controller';

@Module({
  controllers: [SosController],
})
export class SosModule {}
