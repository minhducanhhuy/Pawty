import { HttpStatus, Injectable } from '@nestjs/common';
import { DataStoreService } from '../database/data-store.service';
import { PetFriendlyPlaceRecord, PlaceCategoryType } from '../database/types';
import { DomainException } from '../common/errors';

export interface PlacesQueryInput {
  lat?: number;
  lng?: number;
  radiusMeters?: number;
  category?: PlaceCategoryType | 'all';
  q?: string;
}

export interface PlacesProvider {
  searchPlaces(
    input: PlacesQueryInput,
  ): Array<PetFriendlyPlaceRecord & { distanceMeters: number }>;
  getMidpointSuggestions(
    latA: number,
    lngA: number,
    latB: number,
    lngB: number,
  ): {
    midpoint: { lat: number; lng: number };
    suggestions: Array<PetFriendlyPlaceRecord & { distanceMeters: number }>;
  };
}

@Injectable()
export class PlacesAdapterService implements PlacesProvider {
  constructor(private readonly dataStore: DataStoreService) {}

  private ensureProviderConfigured() {
    const mode = (process.env.PLACES_PROVIDER || 'sandbox').toLowerCase();
    if (mode === 'google' && !process.env.GOOGLE_MAPS_API_KEY) {
      throw new DomainException(
        'NOT_CONFIGURED',
        'Google Places API chưa được cấu hình khoá thật (GOOGLE_MAPS_API_KEY).',
        HttpStatus.NOT_IMPLEMENTED,
      );
    }
  }

  searchPlaces(
    input: PlacesQueryInput,
  ): Array<PetFriendlyPlaceRecord & { distanceMeters: number }> {
    this.ensureProviderConfigured();
    const lat = input.lat ?? 10.7951;
    const lng = input.lng ?? 106.7218;
    const radius = input.radiusMeters ?? 50000;
    const qLower = input.q?.trim().toLowerCase();

    return this.dataStore.places
      .map((place) => ({
        ...place,
        distanceMeters: this.dataStore.calculatePostGisDistanceMeters(
          lat,
          lng,
          place.lat,
          place.lng,
        ),
      }))
      .filter((place) => {
        if (input.radiusMeters && place.distanceMeters > radius) return false;
        if (
          input.category &&
          input.category !== 'all' &&
          place.category !== input.category
        ) {
          return false;
        }
        if (qLower) {
          const hay = `${place.name} ${place.address} ${place.category}`.toLowerCase();
          if (!hay.includes(qLower)) return false;
        }
        return true;
      })
      .sort((a, b) => a.distanceMeters - b.distanceMeters);
  }

  getMidpointSuggestions(
    latA: number,
    lngA: number,
    latB: number,
    lngB: number,
  ) {
    this.ensureProviderConfigured();
    // ST_Centroid(ST_Collect(locA, locB))
    const midLat = Number(((latA + latB) / 2).toFixed(6));
    const midLng = Number(((lngA + lngB) / 2).toFixed(6));

    const suggestions = this.dataStore.places
      .map((place) => ({
        ...place,
        distanceMeters: this.dataStore.calculatePostGisDistanceMeters(
          midLat,
          midLng,
          place.lat,
          place.lng,
        ),
      }))
      .sort((a, b) => a.distanceMeters - b.distanceMeters)
      .slice(0, 3);

    return {
      midpoint: { lat: midLat, lng: midLng },
      suggestions,
    };
  }
}
