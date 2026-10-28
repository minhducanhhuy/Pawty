import * as crypto from 'crypto';
import { DataStoreService } from '../src/database/data-store.service';
import {
  UserRecord,
  PetRecord,
  NativeAdRecord,
  PartnerRecord,
  PetFriendlyPlaceRecord,
  WalkAppointmentRecord,
  ChatRoomRecord,
  MatchRecord,
  ClubRecord,
  EventRecord,
  SosAlertRecord,
} from '../src/database/types';

export function setupE2eFixtures(dataStore: DataStoreService) {
  const yesterday = new Date(Date.now() - 24 * 3600 * 1000)
    .toISOString()
    .split('T')[0];

  // 1. Users
  const userSen01: UserRecord = {
    id: 'usr_sen_01',
    phone: '0908123456',
    email: 'sen.bo@gmail.com',
    authProvider: 'phone',
    role: 'user',
    locale: 'vi',
    fullName: 'Hoàng Long',
    nickname: 'Long Sen',
    age: 26,
    gender: 'male',
    occupation: 'Software Engineer',
    bio: 'Thích dắt cún đi dạo công viên Landmark 81 lúc hoàng hôn.',
    intentTags: ['dating', 'walk_buddy'],
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    isVerified: true,
    isVip: false,
    vipTier: 'free',
    vipExpiresAt: null,
    dailySwipesCount: 0,
    superLikesToday: 0,
    superLikeBalance: 1,
    boostBalance: 1,
    boostExpiresAt: null,
    isWalkingNow: false,
    walkingUntil: null,
    referralCode: 'SENBO888',
    referredByUserId: null,
    walkStreakDays: 3,
    lastWalkDate: yesterday,
    totalWalkMeters: 12500,
    latitude: 10.7951,
    longitude: 106.7218,
    isDistanceHidden: false,
    condoComplex: 'Vinhomes Central Park - Park 3',
    flakeReportsCount: 0,
    isBannedSwiping: false,
    banUntil: null,
    fcmToken: null,
    notificationPrefs: {
      match: true,
      message: true,
      appointment: true,
      sos: true,
      reminder: true,
      event: true,
    },
    isDeleted: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const userSen02: UserRecord = {
    ...userSen01,
    id: 'usr_sen_02',
    phone: '0909111222',
    fullName: 'Thanh Hằng',
    referralCode: 'PAWTYHANG',
    walkStreakDays: 1,
  };

  const userSen03: UserRecord = {
    ...userSen01,
    id: 'usr_sen_03',
    phone: '0908123458',
    fullName: 'Minh Tuấn',
    referralCode: 'PAWTYTUAN',
  };

  const userSen04: UserRecord = {
    ...userSen01,
    id: 'usr_sen_04',
    phone: '0908123459',
    fullName: 'Thuý Vi',
    referralCode: 'PAWTYVI',
  };

  const userSenVy: UserRecord = {
    ...userSen01,
    id: 'usr_06',
    phone: '0909555666',
    fullName: 'Thảo Vy',
    referralCode: 'PAWTYVY',
    isDistanceHidden: true,
  };

  const userMod: UserRecord = {
    ...userSen01,
    id: 'usr_mod_01',
    phone: '0900000001',
    role: 'moderator',
    fullName: 'Kiểm Duyệt Viên',
  };

  const userAdmin: UserRecord = {
    ...userSen01,
    id: 'usr_admin_01',
    phone: '0900000000',
    role: 'admin',
    fullName: 'Quản Trị Viên',
  };

  const userSen07: UserRecord = {
    ...userSen01,
    id: 'usr_sen_07',
    phone: '0908111999',
    fullName: 'Quang Khải',
    referralCode: 'PAWTYKHAI',
  };

  const userSen08: UserRecord = {
    ...userSen01,
    id: 'usr_sen_08',
    phone: '0908222999',
    fullName: 'Diệu Nhi',
    referralCode: 'PAWTYNHI',
  };

  dataStore.users = [
    userSen01,
    userSen02,
    userSen03,
    userSen04,
    userSenVy,
    userMod,
    userAdmin,
    userSen07,
    userSen08,
  ];

  // 2. Pets
  const petBo01: PetRecord = {
    id: 'pet_bo_01',
    userId: 'usr_sen_01',
    isPrimary: true,
    name: 'Bơ Lùn',
    species: 'dog',
    breed: 'Corgi Pembroke',
    gender: 'male',
    isNeutered: true,
    ageYears: 2,
    ageMonths: 4,
    weightKg: 11,
    size: 'medium',
    isVaccinated: true,
    lastVaccineDate: '2026-05-15',
    vaccineDetails: 'Vanguard 7 bệnh + Rabisin dại',
    vaccineStatus: 'verified',
    vaccineProofUrls: ['https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=600'],
    vaccineNextDueDate: '2027-05-15',
    vaccineRejectReason: null,
    isSafePet: true,
    bio: 'Corgi mông to, thích giao lưu công viên Landmark 81!',
    tags: ['Thân thiện', 'Tăng động', 'Mê xúc xích'],
    habitsGood: ['Đi vệ sinh đúng giờ', 'Nghe lời chủ'],
    habitsBad: [],
    avatarUrl: 'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?w=600',
    photos: ['https://images.unsplash.com/photo-1612536057832-2ff7ead58194?w=600'],
    latitude: 10.7951,
    longitude: 106.7218,
    condoComplex: 'Vinhomes Central Park - Park 3',
    ownerName: 'Hoàng Long',
    ownerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400',
    createdAt: new Date().toISOString(),
  };

  const petMochi02: PetRecord = {
    ...petBo01,
    id: 'pet_mochi_02',
    userId: 'usr_sen_02',
    name: 'Mochi',
    breed: 'Poodle',
    gender: 'female',
    weightKg: 4.5,
    size: 'small',
    ownerName: 'Thanh Hằng',
  };

  const petBunBo03: PetRecord = {
    ...petBo01,
    id: 'pet_bunbo_03',
    userId: 'usr_sen_03',
    name: 'Bún Bò',
    breed: 'Golden Retriever',
    weightKg: 28,
    size: 'large',
    ownerName: 'Minh Tuấn',
  };

  const petBanhBao04: PetRecord = {
    ...petBo01,
    id: 'pet_banhbao_04',
    userId: 'usr_sen_04',
    name: 'Bánh Bao',
    breed: 'Pug',
    weightKg: 8,
    size: 'medium',
    ownerName: 'Thuý Vi',
  };

  const petSuaTuoi06: PetRecord = {
    ...petBo01,
    id: 'pet_suatuoi_06',
    userId: 'usr_06',
    name: 'Sữa Tươi',
    isSafePet: false,
    vaccineStatus: 'none',
    ownerName: 'Thảo Vy',
  };

  const petLu07: PetRecord = {
    ...petBo01,
    id: 'pet_lu_07',
    userId: 'usr_sen_07',
    name: 'Lu Lu',
    breed: 'Shiba Inu',
    weightKg: 10,
    size: 'medium',
    ownerName: 'Quang Khải',
  };

  const petKiki08: PetRecord = {
    ...petBo01,
    id: 'pet_kiki_08',
    userId: 'usr_sen_08',
    name: 'Kiki',
    breed: 'Husky',
    weightKg: 22,
    size: 'large',
    ownerName: 'Diệu Nhi',
  };

  dataStore.pets = [
    petBo01,
    petMochi02,
    petBunBo03,
    petBanhBao04,
    petSuaTuoi06,
    petLu07,
    petKiki08,
  ];

  // 3. Matches
  const superlikeMatch: MatchRecord = {
    id: 'match_super_01',
    senderPetId: 'pet_bunbo_03',
    targetPetId: 'pet_bo_01',
    action: 'superlike',
    status: 'liked',
    isUndone: false,
    matchedAt: null,
    createdAt: new Date().toISOString(),
  };
  dataStore.matches = [superlikeMatch];

  // 4. Chat Rooms & Appointments
  const roomMochi01: ChatRoomRecord = {
    id: 'room_mochi_01',
    petAId: 'pet_bo_01',
    petBId: 'pet_mochi_02',
    lastMessageText: 'Hẹn gặp chiều nay ở bãi cỏ nhé!',
    lastMessageAt: new Date().toISOString(),
    createdAt: new Date().toISOString(),
  };
  dataStore.chatRooms = [roomMochi01];

  const aptMochi01: WalkAppointmentRecord = {
    id: 'apt_mochi_01',
    roomId: 'room_mochi_01',
    senderPetId: 'pet_mochi_02',
    receiverPetId: 'pet_bo_01',
    scheduledTime: new Date(Date.now() + 20 * 60 * 1000).toISOString(),
    displayTime: 'Hôm nay lúc 17:30',
    placeName: 'Công viên Landmark 81',
    placeAddress: '208 Nguyễn Hữu Cảnh, Bình Thạnh',
    placeThumbnail: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=500',
    placeLat: 10.7948,
    placeLng: 106.7222,
    checkedInSenderAt: null,
    checkedInReceiverAt: null,
    reminderSentAt: null,
    completedAt: null,
    note: null,
    status: 'confirmed',
    createdAt: new Date().toISOString(),
  };
  dataStore.appointments = [aptMochi01];

  // 5. Partners & Native Ads
  const partner01: PartnerRecord = {
    id: 'ptn_01',
    businessName: 'Pawty Luxury Pet Spa',
    category: 'spa',
    contactEmail: 'partner@pawtyspa.vn',
    passwordHash: 'pawty123',
    phone: '0901234567',
    lat: 10.7942,
    lng: 106.7209,
    address: 'Shophouse Park 5, Vinhomes Central Park',
    status: 'approved',
    plan: 'cpc',
    balanceVnd: 500000,
    createdAt: new Date().toISOString(),
  };
  dataStore.partners = [partner01];

  const ad01: NativeAdRecord = {
    id: 'ad_01',
    partnerId: 'ptn_01',
    title: 'Tắm Spa & Tỉa Lông Thú Cưng Giảm 35%',
    description: 'Chỉ áp dụng cho cư dân Vinhomes Central Park.',
    imageUrl: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=500',
    discountPercent: 35,
    voucherQuota: 100,
    vouchersIssued: 1,
    radiusMeters: 3000,
    targetLat: 10.7948,
    targetLng: 106.7222,
    status: 'active',
    impressions: 0,
    clicks: 0,
    startsAt: new Date(Date.now() - 3600000).toISOString(),
    endsAt: new Date(Date.now() + 30 * 86400000).toISOString(),
  };
  dataStore.nativeAds = [ad01];

  // 6. Places
  const place01: PetFriendlyPlaceRecord = {
    id: 'place_01',
    name: 'Công viên ven sông Landmark 81',
    category: 'park',
    address: 'Vinhomes Central Park, Bình Thạnh',
    lat: 10.7948,
    lng: 106.7222,
    thumbnailUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=500',
    ratingAvg: 4.9,
    reviewsCount: 42,
    partnerId: 'ptn_01',
  };
  dataStore.places = [place01];

  // 7. Clubs & Events
  const club01: ClubRecord = {
    id: 'club_01',
    name: 'CLB Corgi Sài Gòn',
    type: 'breed',
    breedOrBuilding: 'Corgi Pembroke',
    coverUrl: 'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?w=500',
    description: 'CLB dành cho các bé Corgi.',
    ownerUserId: 'usr_sen_01',
    membersCount: 25,
    createdAt: new Date().toISOString(),
  };
  dataStore.clubs = [club01];

  const evt01: EventRecord = {
    id: 'evt_01',
    clubId: 'club_01',
    title: 'Offline Corgi cuối tuần',
    description: 'Họp mặt bãi cỏ',
    coverUrl: null,
    placeName: 'Công viên Landmark 81',
    lat: 10.7948,
    lng: 106.7222,
    startsAt: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    capacity: 50,
    rsvpCount: 10,
    createdBy: 'usr_sen_01',
  };
  dataStore.events = [evt01];

  // 8. SOS
  const sos01: SosAlertRecord = {
    id: 'sos_01',
    userId: 'usr_sen_01',
    petId: 'pet_bo_01',
    petName: 'Bơ Lùn',
    species: 'dog',
    breed: 'Corgi Pembroke',
    petPhotoUrl: 'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?w=600',
    latitude: 10.7951,
    longitude: 106.7218,
    lastSeenAddress: 'Toà Park 3, Vinhomes Central Park',
    radiusKm: 3,
    rewardAmountVnd: '500000',
    contactPhone: '0908123456',
    notes: 'Bé bị lạc quanh sân chơi trẻ em.',
    status: 'active',
    createdAt: new Date().toISOString(),
  };
  dataStore.sosAlerts = [sos01];

  // 9. Moments
  dataStore.moments = [
    {
      id: 'moment_01',
      petId: 'pet_bo_01',
      mediaUrl: 'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?w=600',
      mediaType: 'image',
      caption: 'Bơ Lùn đi dạo',
      likesCount: 5,
      createdAt: new Date().toISOString(),
    },
  ];
}
