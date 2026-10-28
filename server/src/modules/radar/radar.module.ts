import { Module } from '@nestjs/common';
import { RadarService } from './radar.service';
import {
  BoostsController,
  MatchesController,
  RadarController,
} from './radar.controller';

@Module({
  controllers: [RadarController, MatchesController, BoostsController],
  providers: [RadarService],
  exports: [RadarService],
})
export class RadarModule {}
