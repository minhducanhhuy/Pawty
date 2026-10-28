import { Body, Controller, Get, Post } from '@nestjs/common';
import { ReferralsService } from './referrals.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRecord } from '../../database/types';

@Controller('referrals')
export class ReferralsController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Get('me')
  getMyReferrals(@CurrentUser() user: UserRecord) {
    return this.referralsService.getReferralSummary(user);
  }

  @Post('apply')
  async applyReferral(
    @CurrentUser() user: UserRecord,
    @Body() body: { referralCode: string },
  ) {
    return this.referralsService.applyReferralCode(user, body.referralCode || '');
  }
}

@Controller('streak')
export class StreakController {
  constructor(private readonly referralsService: ReferralsService) {}

  @Get('me')
  getMyStreak(@CurrentUser() user: UserRecord) {
    return this.referralsService.getStreakSummary(user);
  }
}
