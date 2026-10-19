import { Injectable } from '@nestjs/common';

export interface LocationPoint {
  latitude: number;
  longitude: number;
}

@Injectable()
export class DataStoreService {
  // In-Memory Database store with PostGIS geometry calculation
  public users = [
    {
      id: 'usr_sen_01',
      phone: '0908123456',
      fullName: 'Minh Anh & Tuấn Kiệt',
      nickname: 'Nhà Sen Bơ',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
      isVerified: true,
      isVip: false,
      dailySwipesCount: 0,
      latitude: 10.7951,
      longitude: 106.7218,
      condoComplex: 'Vinhomes Central Park, Bình Thạnh',
      flakeReportsCount: 0,
      isBannedSwiping: false,
      banUntil: null,
    },
  ];

  public pets = [
    {
      id: 'pet_bo_01',
      userId: 'usr_sen_01',
      name: 'Bơ Lùn',
      species: 'dog',
      breed: 'Corgi Pembroke',
      gender: 'male',
      isNeutered: true,
      ageYears: 1,
      ageMonths: 6,
      weightKg: 11.2,
      size: 'medium',
      isVaccinated: true,
      lastVaccineDate: '15/01/2026',
      vaccineDetails: '7 bệnh Vanguard Plus & Dại',
      bio: 'Mông trái tim, chân ngắn 1 khúc nhưng chạy nhanh hơn bồ cũ lật mặt.',
      tags: ['Tăng động', 'Thân thiện', 'Mê xúc xích'],
      habitsGood: ['Đi vệ sinh đúng bãi cỏ', 'Biết ngồi chờ hiệu lệnh'],
      habitsBad: ['Hay sủa xe máy nẹt pô', 'Thấy bồ câu là rượt'],
      avatarUrl: 'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?auto=format&fit=crop&w=600&q=80',
      photos: ['https://images.unsplash.com/photo-1612536057832-2ff7ead58194?auto=format&fit=crop&w=800&q=80'],
      latitude: 10.7951,
      longitude: 106.7218,
      condoComplex: 'Vinhomes Central Park',
      ownerName: 'Minh Anh',
      ownerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'pet_mochi_02',
      userId: 'usr_02',
      name: 'Mochi',
      species: 'dog',
      breed: 'Shiba Inu',
      gender: 'female',
      isNeutered: true,
      ageYears: 2,
      ageMonths: 2,
      weightKg: 9.8,
      size: 'medium',
      isVaccinated: true,
      lastVaccineDate: '02/02/2026',
      vaccineDetails: 'Mũi nhắc 7 bệnh & Phổi PetCare',
      bio: 'Nữ hoàng drama chung cư Park 3. Mặt lúc nào cũng cười nhưng ghét nhất đụng đuôi!',
      tags: ['Ngoan ngoãn', 'Quý tộc', 'Thánh biểu cảm'],
      habitsGood: ['Không cắn đồ', 'Dắt dây rất ngoan'],
      habitsBad: ['Hơi chảnh với cún nhỏ', 'Sợ tiếng máy sấy'],
      avatarUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=600&q=80',
      photos: ['https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80'],
      latitude: 10.7938,
      longitude: 106.7225,
      condoComplex: 'Vinhomes Central Park - Park 3',
      ownerName: 'Thanh Hằng',
      ownerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'pet_bunbo_03',
      userId: 'usr_03',
      name: 'Bún Bò',
      species: 'dog',
      breed: 'Poodle Teacup',
      gender: 'female',
      isNeutered: false,
      ageYears: 1,
      ageMonths: 1,
      weightKg: 3.4,
      size: 'small',
      isVaccinated: true,
      lastVaccineDate: '10/12/2025',
      vaccineDetails: 'Đầy đủ sổ chích ngừa Vinmec Pet',
      bio: 'Tuy bé hạt tiêu nhưng giọng sủa như loa phóng thanh. Cần bạn bự che chở.',
      tags: ['Điệu đà', 'Bám đuôi', 'Tăng động'],
      habitsGood: ['Biết đi 2 chân', 'Rất thích thơm má'],
      habitsBad: ['Hay hờn dỗi', 'Nhảy tót vào lòng người lạ'],
      avatarUrl: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=600&q=80',
      photos: ['https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=800&q=80'],
      latitude: 10.7965,
      longitude: 106.7205,
      condoComplex: 'Landmark Plus',
      ownerName: 'Hoàng Long',
      ownerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    },
    {
      id: 'pet_banhbao_04',
      userId: 'usr_04',
      name: 'Bánh Bao',
      species: 'cat',
      breed: 'Mèo Anh Lông Ngắn',
      gender: 'male',
      isNeutered: true,
      ageYears: 2,
      ageMonths: 8,
      weightKg: 5.8,
      size: 'small',
      isVaccinated: true,
      lastVaccineDate: '18/01/2026',
      vaccineDetails: 'Vaccine 4 bệnh mèo PureVax',
      bio: 'Má phính như 2 bánh bao hấp. Thích ngồi xe đẩy dạo hoàng hôn Central Park.',
      tags: ['Lười vận động', 'Quý tộc', 'Mê pate'],
      habitsGood: ['Không cào cấu', 'Cho ẵm bồng thoải mái'],
      habitsBad: ['Ngủ 18 tiếng mỗi ngày', 'Ghét tiếng còi xe'],
      avatarUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80',
      photos: ['https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80'],
      latitude: 10.7915,
      longitude: 106.7252,
      condoComplex: 'The Sun Avenue',
      ownerName: 'Lan Phương',
      ownerAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80',
    },
  ];

  public moments = [
    {
      id: 'moment_01',
      petId: 'pet_bo_01',
      mediaUrl: 'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?auto=format&fit=crop&w=800&q=80',
      mediaType: 'image',
      caption: 'Đang ngắm hoàng hôn thì phát hiện quầy xúc xích nướng Landmark 5 🌭👀',
      likesCount: 38,
      createdAt: new Date().toISOString(),
    },
  ];

  public matches = [
    {
      id: 'm_01',
      senderPetId: 'pet_bo_01',
      targetPetId: 'pet_mochi_02',
      status: 'matched',
      matchedAt: '17:30',
    },
  ];

  public appointments = [
    {
      id: 'apt_mochi_01',
      roomId: 'room_mochi_01',
      senderPetId: 'pet_mochi_02',
      receiverPetId: 'pet_bo_01',
      scheduledTime: new Date(Date.now() + 3600000).toISOString(),
      displayTime: 'Tối nay • 19:30',
      placeName: 'Công viên Landmark 81 ven sông',
      placeAddress: '208 Nguyễn Hữu Cảnh, Bình Thạnh',
      placeThumbnail: 'https://images.unsplash.com/photo-1519331379826-f10be5486c6f?auto=format&fit=crop&w=600&q=80',
      placeDistanceMeters: 250,
      note: 'Mang theo bóng tennis và túi rác nhé Sen!',
      status: 'pending',
      createdAt: '17:40',
    },
  ];

  public sosAlerts = [
    {
      id: 'sos_01',
      petName: 'Miu Miu',
      species: 'cat',
      breed: 'Mèo Xiêm lai',
      petPhotoUrl: 'https://images.unsplash.com/photo-1513360309081-38f076278f19?auto=format&fit=crop&w=600&q=80',
      latitude: 10.794,
      longitude: 106.721,
      lastSeenAddress: 'Sảnh Lễ Tân Landmark 2, ngách hầm B1',
      radiusKm: 3,
      rewardAmountVnd: '5.000.000 VNĐ',
      contactPhone: '0912 888 999',
      notes: 'Bé đeo vòng cổ đỏ lục lạc vàng, rất nhát người.',
      status: 'active',
      createdAt: '25 phút trước',
    },
  ];

  // PostGIS Spatial Distance Simulation (Haversine formula on WGS84 sphere)
  public calculatePostGisDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth radius in meters
    const phi1 = (lat1 * Math.PI) / 180;
    const phi2 = (lat2 * Math.PI) / 180;
    const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
    const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
      Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return Math.round(R * c);
  }
}
