import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Query,
} from '@nestjs/common';
import { WalksService } from './walks.service';
import {
  ActivePet,
  CurrentUser,
} from '../../common/decorators/current-user.decorator';
import { PetRecord, UserRecord } from '../../database/types';

@Controller('walks')
export class WalksController {
  constructor(private readonly walksService: WalksService) {}

  @Get('live')
  getLiveWalkers(
    @CurrentUser() user: UserRecord,
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('radius') radius?: string,
  ) {
    return this.walksService.getLiveWalkers(user, lat, lng, radius);
  }

  @Post('start')
  @HttpCode(HttpStatus.OK)
  startWalk(
    @CurrentUser() user: UserRecord,
    @ActivePet() activePet: PetRecord | undefined,
    @Body() body: { lat?: number; lng?: number; petId?: string },
  ) {
    return this.walksService.startWalk(user, activePet, body || {});
  }

  @Post('heartbeat')
  @HttpCode(HttpStatus.OK)
  heartbeatWalk(
    @CurrentUser() user: UserRecord,
    @Body() body: { lat: number; lng: number },
  ) {
    return this.walksService.heartbeatWalk(user, body);
  }

  @Post('stop')
  @HttpCode(HttpStatus.OK)
  stopWalk(
    @CurrentUser() user: UserRecord,
    @ActivePet() activePet: PetRecord | undefined,
    @Body() body: { points?: Array<{ lat: number; lng: number; t?: number }> },
  ) {
    return this.walksService.stopWalk(user, activePet, body);
  }
}
