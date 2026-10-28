import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { DataStoreService } from '../../database/data-store.service';
import { PlacesAdapterService } from '../../adapters/places.adapter';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { DomainException } from '../../common/errors';
import { PlaceCategoryType, UserRecord } from '../../database/types';

@Controller('places')
export class PlacesController {
  constructor(
    private readonly dataStore: DataStoreService,
    private readonly placesAdapter: PlacesAdapterService,
  ) {}

  @Get('suggestions')
  getSuggestions(
    @Query('petAId') petAId?: string,
    @Query('petBId') petBId?: string,
  ) {
    const petA =
      (petAId && this.dataStore.pets.find((p) => p.id === petAId)) ||
      this.dataStore.pets[0];
    const petB =
      (petBId && this.dataStore.pets.find((p) => p.id === petBId)) ||
      this.dataStore.pets[1] ||
      petA;

    const result = this.placesAdapter.getMidpointSuggestions(
      petA.latitude,
      petA.longitude,
      petB.latitude,
      petB.longitude,
    );

    return {
      midpoint: result.midpoint,
      suggestions: result.suggestions,
      items: result.suggestions,
    };
  }

  @Get()
  getPlaces(
    @CurrentUser() user: UserRecord,
    @Query('lat') lat?: string,
    @Query('lng') lng?: string,
    @Query('radius') radius?: string,
    @Query('category') category?: PlaceCategoryType | 'all',
    @Query('q') q?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const list = this.placesAdapter.searchPlaces({
      lat: lat ? parseFloat(lat) : user?.latitude,
      lng: lng ? parseFloat(lng) : user?.longitude,
      radiusMeters: radius ? parseInt(radius, 10) : undefined,
      category,
      q,
    });

    return this.dataStore.paginate(list, page, limit);
  }

  @Get(':id')
  getPlaceDetail(@Param('id') id: string) {
    const place = this.dataStore.places.find((p) => p.id === id);
    if (!place) {
      throw new DomainException(
        'NOT_FOUND',
        'Không tìm thấy địa điểm.',
        HttpStatus.NOT_FOUND,
      );
    }

    const reviews = this.dataStore.placeReviews
      .filter((r) => r.placeId === id)
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
      .slice(0, 5)
      .map((r) => {
        const author = this.dataStore.users.find((u) => u.id === r.userId);
        return {
          ...r,
          user: author
            ? {
                id: author.id,
                fullName: author.fullName,
                nickname: author.nickname,
                avatarUrl: author.avatarUrl,
              }
            : null,
        };
      });

    return {
      ...place,
      reviews,
    };
  }

  @Post(':id/reviews')
  createPlaceReview(
    @CurrentUser() user: UserRecord,
    @Param('id') id: string,
    @Body() body: { rating: number; text: string },
  ) {
    const place = this.dataStore.places.find((p) => p.id === id);
    if (!place) {
      throw new DomainException(
        'NOT_FOUND',
        'Không tìm thấy địa điểm.',
        HttpStatus.NOT_FOUND,
      );
    }

    const rating = Math.min(5, Math.max(1, Number(body?.rating || 5)));
    const review = {
      id: `rev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      placeId: id,
      userId: user.id,
      rating,
      text: (body?.text || '').trim(),
      createdAt: new Date().toISOString(),
    };

    this.dataStore.placeReviews.unshift(review);

    const allReviews = this.dataStore.placeReviews.filter(
      (r) => r.placeId === id,
    );
    const avg =
      allReviews.reduce((acc, r) => acc + r.rating, 0) / allReviews.length;
    place.ratingAvg = Number(avg.toFixed(1));
    place.reviewsCount = allReviews.length;

    this.dataStore.save();
    return {
      ...review,
      placeRatingAvg: place.ratingAvg,
      placeReviewsCount: place.reviewsCount,
    };
  }
}
