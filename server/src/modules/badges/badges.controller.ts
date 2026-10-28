import { Controller, Get } from '@nestjs/common';
import { BadgesService } from './badges.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRecord } from '../../database/types';

@Controller('badges')
export class BadgesController {
  constructor(private readonly badgesService: BadgesService) {}

  @Get('me')
  async getMyBadges(@CurrentUser() user: UserRecord) {
    await this.badgesService.checkAndAwardBadges(user.id);
    return this.badgesService.getBadgesForUser(user.id);
  }
}
