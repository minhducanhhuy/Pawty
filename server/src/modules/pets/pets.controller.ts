import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { DataStoreService } from '../../database/data-store.service';
import { OcrAdapterService } from '../../adapters/ocr.adapter';
import { BadgesService } from '../badges/badges.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { DomainException } from '../../common/errors';
import { BUSINESS_RULES } from '../../config/business-rules';
import {
  PetGenderType,
  PetRecord,
  PetSizeType,
  PetSpeciesType,
  UserRecord,
} from '../../database/types';

function computePetSize(weightKg: number, fallback?: PetSizeType): PetSizeType {
  if (typeof weightKg === 'number' && !Number.isNaN(weightKg)) {
    if (weightKg < 5) return 'small';
    if (weightKg <= 15) return 'medium';
    return 'large';
  }
  return fallback || 'medium';
}

@Controller('pets')
export class PetsController {
  constructor(
    private readonly dataStore: DataStoreService,
    private readonly ocrAdapter: OcrAdapterService,
    private readonly badgesService: BadgesService,
  ) {}

  @Get('me')
  getMyPets(@CurrentUser() user: UserRecord): PetRecord[] {
    return this.dataStore.pets.filter((p) => p.userId === user.id);
  }

  @Post()
  createPet(@CurrentUser() user: UserRecord, @Body() body: any) {
    if (!body?.name || !body?.breed) {
      throw new DomainException(
        'BAD_REQUEST',
        'Vui lòng nhập tên và giống loài của Boss.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const myPets = this.dataStore.pets.filter((p) => p.userId === user.id);
    const tierRule =
      BUSINESS_RULES.tiers[user.vipTier] || BUSINESS_RULES.tiers.free;

    if (myPets.length >= tierRule.maxPets) {
      throw new DomainException(
        'PET_LIMIT_REACHED',
        `Gói thành viên ${user.vipTier.toUpperCase()} tối đa ${tierRule.maxPets} Boss. Vui lòng nâng cấp VIP để thêm Boss mới!`,
        HttpStatus.FORBIDDEN,
      );
    }

    const weightKg = Number(body.weightKg ?? 10);
    const species: PetSpeciesType = body.species === 'cat' ? 'cat' : 'dog';
    const gender: PetGenderType = body.gender === 'female' ? 'female' : 'male';
    const avatarUrl =
      body.avatarUrl ||
      'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?auto=format&fit=crop&w=600&q=80';

    const newPet: PetRecord = {
      id: `pet_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      userId: user.id,
      isPrimary: myPets.length === 0,
      name: body.name.trim(),
      species,
      breed: body.breed.trim(),
      gender,
      isNeutered: Boolean(body.isNeutered),
      ageYears: Number(body.ageYears ?? 1),
      ageMonths: Number(body.ageMonths ?? 0),
      weightKg,
      size: computePetSize(weightKg, body.size),
      isVaccinated: body.isVaccinated ?? true,
      lastVaccineDate: body.lastVaccineDate || null,
      vaccineDetails: body.vaccineDetails || null,
      vaccineStatus: 'none',
      vaccineProofUrls: [],
      vaccineNextDueDate: null,
      vaccineRejectReason: null,
      isSafePet: false,
      bio: body.bio || '',
      tags: Array.isArray(body.tags) ? body.tags : ['Thân thiện'],
      habitsGood: Array.isArray(body.habitsGood) ? body.habitsGood : [],
      habitsBad: Array.isArray(body.habitsBad) ? body.habitsBad : [],
      avatarUrl,
      photos:
        Array.isArray(body.photos) && body.photos.length > 0
          ? body.photos
          : [avatarUrl],
      latitude: user.latitude,
      longitude: user.longitude,
      condoComplex: user.condoComplex,
      ownerName: user.fullName,
      ownerAvatar: user.avatarUrl,
      ownerAge: user.age || undefined,
      ownerGender: user.gender || undefined,
      ownerOccupation: user.occupation || undefined,
      ownerBio: user.bio || undefined,
      intentTags: user.intentTags || undefined,
      createdAt: new Date().toISOString(),
    };

    this.dataStore.pets.push(newPet);
    this.dataStore.save();
    return newPet;
  }

  @Patch(':id')
  updatePet(
    @CurrentUser() user: UserRecord,
    @Param('id') id: string,
    @Body() body: Partial<PetRecord>,
  ) {
    const pet = this.dataStore.pets.find((p) => p.id === id);
    if (!pet) {
      throw new DomainException(
        'NOT_FOUND',
        'Không tìm thấy hồ sơ Boss.',
        HttpStatus.NOT_FOUND,
      );
    }
    if (pet.userId !== user.id) {
      throw new DomainException(
        'FORBIDDEN',
        'Bạn chỉ có thể chỉnh sửa hồ sơ Boss của chính mình.',
        HttpStatus.FORBIDDEN,
      );
    }

    if (body.name !== undefined) pet.name = body.name;
    if (body.species === 'dog' || body.species === 'cat') {
      pet.species = body.species;
    }
    if (body.breed !== undefined) pet.breed = body.breed;
    if (body.gender === 'male' || body.gender === 'female') {
      pet.gender = body.gender;
    }
    if (typeof body.isNeutered === 'boolean') pet.isNeutered = body.isNeutered;
    if (typeof body.ageYears === 'number') pet.ageYears = body.ageYears;
    if (typeof body.ageMonths === 'number') pet.ageMonths = body.ageMonths;
    if (typeof body.weightKg === 'number') {
      pet.weightKg = body.weightKg;
      pet.size = computePetSize(body.weightKg, body.size);
    } else if (body.size) {
      pet.size = body.size;
    }
    if (typeof body.isVaccinated === 'boolean') {
      pet.isVaccinated = body.isVaccinated;
    }
    if (body.lastVaccineDate !== undefined) {
      pet.lastVaccineDate = body.lastVaccineDate;
    }
    if (body.vaccineDetails !== undefined) {
      pet.vaccineDetails = body.vaccineDetails;
    }
    if (body.bio !== undefined) pet.bio = body.bio;
    if (Array.isArray(body.tags)) pet.tags = body.tags;
    if (Array.isArray(body.habitsGood)) pet.habitsGood = body.habitsGood;
    if (Array.isArray(body.habitsBad)) pet.habitsBad = body.habitsBad;
    if (body.avatarUrl !== undefined) pet.avatarUrl = body.avatarUrl;
    if (Array.isArray(body.photos)) pet.photos = body.photos;

    this.dataStore.save();
    return pet;
  }

  @Delete(':id')
  deletePet(@CurrentUser() user: UserRecord, @Param('id') id: string) {
    const myPets = this.dataStore.pets.filter((p) => p.userId === user.id);
    const target = myPets.find((p) => p.id === id);

    if (!target) {
      throw new DomainException(
        'NOT_FOUND',
        'Không tìm thấy Boss thuộc sở hữu của bạn.',
        HttpStatus.NOT_FOUND,
      );
    }

    if (myPets.length <= 1) {
      throw new DomainException(
        'CANNOT_DELETE_ONLY_PET',
        'Không thể xoá Boss duy nhất của tài khoản.',
        HttpStatus.BAD_REQUEST,
      );
    }

    this.dataStore.pets = this.dataStore.pets.filter((p) => p.id !== id);
    if (target.isPrimary) {
      const remaining = this.dataStore.pets.find((p) => p.userId === user.id);
      if (remaining) remaining.isPrimary = true;
    }

    this.dataStore.save();
    return { deleted: true, id };
  }

  @Post(':id/primary')
  @HttpCode(HttpStatus.OK)
  setPrimaryPet(@CurrentUser() user: UserRecord, @Param('id') id: string) {
    const myPets = this.dataStore.pets.filter((p) => p.userId === user.id);
    const target = myPets.find((p) => p.id === id);
    if (!target) {
      throw new DomainException(
        'NOT_FOUND',
        'Không tìm thấy Boss thuộc sở hữu của bạn.',
        HttpStatus.NOT_FOUND,
      );
    }

    for (const p of myPets) {
      p.isPrimary = p.id === id;
    }

    this.dataStore.save();
    return target;
  }

  @Get(':id')
  getPetById(@Param('id') id: string) {
    const pet = this.dataStore.pets.find((p) => p.id === id);
    if (!pet) {
      throw new DomainException(
        'NOT_FOUND',
        `Không tìm thấy Boss với mã ${id}`,
        HttpStatus.NOT_FOUND,
      );
    }

    const owner = this.dataStore.users.find((u) => u.id === pet.userId);
    const badges = this.badgesService.getBadgesForUser(pet.userId).earned;
    const moments = this.dataStore.moments.filter(
      (m) => m.petId === pet.id && !m.isHidden,
    );

    return {
      ...pet,
      owner: owner
        ? {
            id: owner.id,
            fullName: owner.fullName,
            nickname: owner.nickname,
            avatarUrl: owner.avatarUrl,
            isVerified: owner.isVerified,
            isVip: owner.isVip,
            vipTier: owner.vipTier,
            condoComplex: owner.condoComplex,
            walkStreakDays: owner.walkStreakDays,
          }
        : null,
      badges,
      moments,
    };
  }

  @Post(':id/vaccine-proof')
  @HttpCode(HttpStatus.OK)
  async uploadVaccineProof(
    @CurrentUser() user: UserRecord,
    @Param('id') id: string,
    @Body()
    body: {
      proofUrls: string[];
      vaccineDetails?: string;
      lastVaccineDate?: string;
      nextDueDate?: string;
    },
  ) {
    const pet = this.dataStore.pets.find((p) => p.id === id);
    if (!pet) {
      throw new DomainException(
        'NOT_FOUND',
        'Không tìm thấy hồ sơ Boss.',
        HttpStatus.NOT_FOUND,
      );
    }
    if (pet.userId !== user.id) {
      throw new DomainException(
        'FORBIDDEN',
        'Bạn chỉ có thể tải sổ tiêm cho Boss của mình.',
        HttpStatus.FORBIDDEN,
      );
    }

    if (!Array.isArray(body?.proofUrls) || body.proofUrls.length === 0) {
      throw new DomainException(
        'BAD_REQUEST',
        'Vui lòng tải lên ít nhất 1 ảnh chụp sổ tiêm chủng.',
        HttpStatus.BAD_REQUEST,
      );
    }

    pet.vaccineProofUrls = body.proofUrls.slice(0, 4);
    pet.vaccineStatus = 'pending';
    pet.isSafePet = false;
    pet.vaccineRejectReason = null;
    if (body.vaccineDetails !== undefined) {
      pet.vaccineDetails = body.vaccineDetails;
    }
    if (body.lastVaccineDate !== undefined) {
      pet.lastVaccineDate = body.lastVaccineDate;
    }
    if (body.nextDueDate !== undefined) {
      pet.vaccineNextDueDate = body.nextDueDate;
    }

    const ocrResult = await this.ocrAdapter.extractVaccineInfo(
      pet.vaccineProofUrls,
    );
    this.dataStore.save();

    return {
      ...pet,
      ocr: ocrResult,
    };
  }
}
