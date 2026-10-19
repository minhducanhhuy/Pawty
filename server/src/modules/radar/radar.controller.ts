import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { DataStoreService } from '../../database/data-store.service';

@Controller('radar')
export class RadarController {
  constructor(private readonly dataStore: DataStoreService) {}

  @Get()
  getNearbyPets(
    @Query('lat') latStr: string,
    @Query('lng') lngStr: string,
    @Query('radius') radiusStr?: string,
    @Query('species') species?: string,
    @Query('size') size?: string,
    @Query('verifiedOnly') verifiedOnly?: string,
  ) {
    const lat = latStr ? parseFloat(latStr) : 10.7951;
    const lng = lngStr ? parseFloat(lngStr) : 106.7218;
    const radiusMeters = radiusStr ? parseInt(radiusStr, 10) : 2500;
    const isVerifiedOnly = verifiedOnly === 'true';

    // PostGIS Spatial Filter: ST_DWithin(pet.location, ST_MakePoint(lng, lat)::geography, radius)
    const results = this.dataStore.pets
      .filter((pet) => pet.id !== 'pet_bo_01') // exclude own pet
      .map((pet) => {
        const distance = this.dataStore.calculatePostGisDistanceMeters(lat, lng, pet.latitude, pet.longitude);
        return {
          ...pet,
          distanceMeters: distance,
        };
      })
      .filter((pet) => {
        if (pet.distanceMeters > radiusMeters) return false;
        if (species && species !== 'all' && pet.species !== species) return false;
        if (size && size !== 'all' && pet.size !== size) return false;
        if (isVerifiedOnly && !pet.isVaccinated) return false;
        return true;
      })
      .sort((a, b) => a.distanceMeters - b.distanceMeters);

    return {
      success: true,
      query: { lat, lng, radiusMeters },
      totalFound: results.length,
      data: results,
    };
  }

  @Post('matches')
  handleMatchAction(@Body() body: { senderPetId: string; targetPetId: string; action: 'like' | 'dislike' }) {
    const { senderPetId, targetPetId, action } = body;

    if (action === 'dislike') {
      this.dataStore.matches.push({
        id: `m_${Date.now()}`,
        senderPetId,
        targetPetId,
        status: 'disliked',
        matchedAt: null,
      });
      return { success: true, isMatch: false, status: 'disliked' };
    }

    // Check if mutual like (simulation of high affinity match)
    const isMutual = ['pet_mochi_02', 'pet_bunbo_03', 'pet_banhbao_04'].includes(targetPetId);

    if (isMutual) {
      const matchRecord = {
        id: `m_${Date.now()}`,
        senderPetId,
        targetPetId,
        status: 'matched',
        matchedAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      };
      this.dataStore.matches.push(matchRecord);

      return {
        success: true,
        isMatch: true,
        status: 'matched',
        message: 'Hú hồn! Cả hai Boss đều đã quẹt thích nhau! 🐾',
        matchedAt: matchRecord.matchedAt,
        roomId: `room_${targetPetId}`,
      };
    } else {
      this.dataStore.matches.push({
        id: `m_${Date.now()}`,
        senderPetId,
        targetPetId,
        status: 'liked',
        matchedAt: null,
      });
      return { success: true, isMatch: false, status: 'liked' };
    }
  }
}
