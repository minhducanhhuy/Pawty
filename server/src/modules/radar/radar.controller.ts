import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { RadarService } from './radar.service';
import {
  ActivePet,
  CurrentUser,
} from '../../common/decorators/current-user.decorator';
import {
  MatchActionType,
  PetRecord,
  UserRecord,
} from '../../database/types';

@Controller('radar')
export class RadarController {
  constructor(private readonly radarService: RadarService) {}

  @Get()
  getNearbyPets(
    @CurrentUser() user: UserRecord,
    @ActivePet() activePet: PetRecord | undefined,
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('radius') radius?: string,
    @Query('species') species?: string,
    @Query('size') size?: string,
    @Query('verifiedOnly') verifiedOnly?: string,
    @Query('walkingNow') walkingNow?: string,
  ) {
    return this.radarService.getRadarFeed(user, activePet, {
      lat,
      lng,
      radius,
      species,
      size,
      verifiedOnly,
      walkingNow,
    });
  }

  @Post('matches')
  @HttpCode(HttpStatus.OK)
  handleRadarMatchAlias(
    @CurrentUser() user: UserRecord,
    @ActivePet() activePet: PetRecord | undefined,
    @Body()
    body: {
      targetPetId: string;
      action: MatchActionType;
      senderPetId?: string;
    },
  ) {
    return this.radarService.handleSwipe(user, activePet, body);
  }
}

@Controller('matches')
export class MatchesController {
  constructor(private readonly radarService: RadarService) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  createMatch(
    @CurrentUser() user: UserRecord,
    @ActivePet() activePet: PetRecord | undefined,
    @Body()
    body: {
      targetPetId: string;
      action: MatchActionType;
      senderPetId?: string;
    },
  ) {
    return this.radarService.handleSwipe(user, activePet, body);
  }

  @Post('rewind')
  @HttpCode(HttpStatus.OK)
  rewindSwipe(
    @CurrentUser() user: UserRecord,
    @ActivePet() activePet: PetRecord | undefined,
  ) {
    return this.radarService.rewindLastSwipe(user, activePet);
  }

  @Get('likes-me')
  getLikesMe(@CurrentUser() user: UserRecord) {
    return this.radarService.getLikesMe(user);
  }

  @Get()
  getMyMatches(@CurrentUser() user: UserRecord) {
    return this.radarService.getMyMatches(user);
  }
}

@Controller('boosts')
export class BoostsController {
  constructor(private readonly radarService: RadarService) {}

  @Post('activate')
  @HttpCode(HttpStatus.OK)
  activateBoost(@CurrentUser() user: UserRecord) {
    return this.radarService.activateBoost(user);
  }
}
