import { Global, Module } from '@nestjs/common';
import { ReferralsService } from './referrals.service';
import { ReferralsController, StreakController } from './referrals.controller';

@Global()
@Module({
  controllers: [ReferralsController, StreakController],
  providers: [ReferralsService],
  exports: [ReferralsService],
})
export class ReferralsModule {}
