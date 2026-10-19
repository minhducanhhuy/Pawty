import { Controller, Post, Get, Param, Body, NotFoundException } from '@nestjs/common';
import { DataStoreService } from '../../database/data-store.service';

@Controller('pets')
export class PetsController {
  constructor(private readonly dataStore: DataStoreService) {}

  @Get('me')
  getMyPet() {
    const pet = this.dataStore.pets[0];
    return { success: true, data: pet };
  }

  @Get(':id')
  getPetById(@Param('id') id: string) {
    const pet = this.dataStore.pets.find((p) => p.id === id);
    if (!pet) {
      throw new NotFoundException(`Không tìm thấy Boss với mã ${id}`);
    }
    return { success: true, data: pet };
  }

  @Post()
  createPet(@Body() body: any) {
    const newPet = {
      id: `pet_${Date.now()}`,
      userId: body.userId || 'usr_sen_01',
      name: body.name,
      species: body.species || 'dog',
      breed: body.breed,
      gender: body.gender || 'male',
      isNeutered: body.isNeutered ?? false,
      ageYears: body.ageYears || 1,
      ageMonths: body.ageMonths || 0,
      weightKg: body.weightKg || 10,
      size: body.size || 'medium',
      isVaccinated: body.isVaccinated ?? true,
      lastVaccineDate: body.lastVaccineDate || '15/01/2026',
      vaccineDetails: body.vaccineDetails || '7 bệnh Vanguard Plus & Dại',
      bio: body.bio || '',
      tags: body.tags || ['Thân thiện'],
      habitsGood: body.habitsGood || ['Đi vệ sinh đúng chỗ'],
      habitsBad: body.habitsBad || ['Hay sủa xe máy'],
      avatarUrl: body.avatarUrl || 'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?auto=format&fit=crop&w=600&q=80',
      photos: [body.avatarUrl || 'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?auto=format&fit=crop&w=600&q=80'],
      latitude: body.latitude || 10.7951,
      longitude: body.longitude || 106.7218,
      condoComplex: body.condoComplex || 'Vinhomes Central Park',
      ownerName: body.ownerName || 'Minh Anh',
      ownerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    };

    this.dataStore.pets.unshift(newPet);
    return {
      success: true,
      message: `Hồ sơ Boss ${newPet.name} đã được tạo thành công!`,
      data: newPet,
    };
  }
}
