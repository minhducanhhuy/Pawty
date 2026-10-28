import {
  ChatRoom, ChatMessage, PetFriendlyPlace, Club, EventItem,
  NotificationItem, ReminderItem, BadgeItem, VoucherItem, SosAlert,
} from '../types';
import { mockCoreStore } from './mockStoreCore';

export const mockCommunityStore: {
  rooms: ChatRoom[];
  messages: Record<string, ChatMessage[]>;
  places: PetFriendlyPlace[];
  clubs: Club[];
  events: EventItem[];
  notifications: NotificationItem[];
  reminders: ReminderItem[];
  badges: { earned: BadgeItem[]; locked: BadgeItem[] };
  vouchers: VoucherItem[];
  sosAlerts: SosAlert[];
} = {
  rooms: [],
  messages: {},
  places: [
    {
      id: 'place_01', name: 'Bãi cỏ ven sông Vinhomes Central Park', category: 'park',
      address: 'Khu công viên ven sông Landmark 81, Bình Thạnh', lat: 10.7955, lng: 106.7222, distanceMeters: 210,
      thumbnailUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=500&q=80',
      ratingAvg: 4.9, reviewsCount: 38,
      reviews: [{ id: 'rv_1', placeId: 'place_01', userId: 'u_2', userName: 'Cư Dân', rating: 5, text: 'Bãi cỏ siêu rộng, gió mát, có thùng rác riêng cho thú cưng!', createdAt: 'Hôm qua' }],
    },
    {
      id: 'place_02', name: 'Corgi & Friends Pet Cafe Thảo Điền', category: 'cafe',
      address: '24 Xuân Thủy, Thảo Điền, TP. Thủ Đức', lat: 10.8012, lng: 106.7315, distanceMeters: 850,
      thumbnailUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=500&q=80',
      ratingAvg: 4.8, reviewsCount: 24, reviews: [],
    },
    {
      id: 'place_03', name: 'Pawty Luxury Pet Spa & Grooming', category: 'spa',
      address: 'Shophouse Park 5, Vinhomes Central Park', lat: 10.7942, lng: 106.7209, distanceMeters: 340,
      thumbnailUrl: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=500&q=80',
      ratingAvg: 4.9, reviewsCount: 52, reviews: [],
    },
  ],
  clubs: [
    {
      id: 'club_01', name: 'Hội Corgi Mông Trái Tim Sài Gòn', type: 'breed', breedOrBuilding: 'Corgi Pembroke',
      coverUrl: 'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?auto=format&fit=crop&w=500&q=80',
      description: 'Nơi giao lưu, chia sẻ kinh nghiệm chăm lông và offline cuối tuần cho các bé Corgi.',
      ownerUserId: 'usr_sen_01', membersCount: 148, isMember: true,
    },
    {
      id: 'club_02', name: 'CLB Thú Cưng Vinhomes Central Park', type: 'building', breedOrBuilding: 'Vinhomes Central Park',
      coverUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=500&q=80',
      description: 'Cộng đồng cư dân nuôi Boss văn minh, giữ vệ sinh chung và dắt dạo mỗi tối.',
      ownerUserId: 'usr_sen_02', membersCount: 312, isMember: false,
    },
  ],
  events: [
    {
      id: 'evt_01', clubId: 'club_01', clubName: 'Hội Corgi Mông Trái Tim Sài Gòn',
      title: 'Offline Đua Corgi Chân Ngắn Mùa Thu 🏃‍♂️🐾',
      description: 'Cuộc thi chạy tiếp sức 50m cho các bé Corgi, tặng quà pate tươi và huy chương.',
      coverUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=500&q=80',
      placeName: 'Bãi cỏ ven sông Vinhomes Central Park', lat: 10.7955, lng: 106.7222,
      startsAt: 'Chủ Nhật • 16:30 (01/11/2026)', capacity: 30, rsvpCount: 19, myRsvp: 'going',
    },
  ],
  notifications: [
    { id: 'notif_01', type: 'match', title: '🎉 Khớp lệnh mới với Mochi!', body: 'Bơ Lùn và Mochi đã thích nhau. Nhắn tin lên kèo đi dạo ngay!', payload: { roomId: 'room_mochi_01' }, isRead: false, createdAt: '15 phút trước' },
    { id: 'notif_02', type: 'reminder', title: '💉 Nhắc lịch tẩy giun định kỳ', body: 'Còn 3 ngày nữa đến lịch tẩy giun định kỳ của Bơ Lùn.', isRead: true, createdAt: '2 giờ trước' },
  ],
  reminders: [
    { id: 'rem_01', petId: 'pet_bo_01', petName: 'Bơ Lùn', kind: 'vaccine', title: 'Mũi nhắc 7 bệnh Vanguard Plus', dueDate: '15/01/2027', isDone: false },
    { id: 'rem_02', petId: 'pet_bo_01', petName: 'Bơ Lùn', kind: 'deworm', title: 'Tẩy giun định kỳ Drontal', dueDate: '05/11/2026', isDone: false },
  ],
  badges: {
    earned: [
      { code: 'first_match', nameVi: 'Khớp Lệnh Đầu Tiên', nameEn: 'First Match', icon: '💖', descriptionVi: 'Có lượt Match đầu tiên trên Radar', descriptionEn: 'Got your first Radar match', earnedAt: '20/10/2026' },
      { code: 'safe_pet', nameVi: 'Đại Sứ Safe Pet', nameEn: 'Safe Pet Ambassador', icon: '🛡️', descriptionVi: 'Sổ tiêm chủng được xác minh an toàn', descriptionEn: 'Verified vaccination record', earnedAt: '22/10/2026' },
    ],
    locked: [
      { code: 'walk_7_streak', nameVi: 'Chiến Thần Dắt Dạo 7 Ngày', nameEn: '7-Day Walk Streak', icon: '🔥', descriptionVi: 'Dắt Boss đi dạo 7 ngày liên tiếp', descriptionEn: 'Walk 7 days in a row', progress: 4, target: 7 },
      { code: 'social_butterfly', nameVi: 'Ngoại Giao Chung Cư', nameEn: 'Social Butterfly', icon: '🦋', descriptionVi: 'Hoàn thành 5 kèo hẹn dạo chung', descriptionEn: 'Complete 5 walk dates', progress: 2, target: 5 },
      { code: 'referral_3', nameVi: 'Lan Tỏa Pawty', nameEn: 'Pawty Ambassador', icon: '🎁', descriptionVi: 'Mời thành công 3 người bạn', descriptionEn: 'Invite 3 friends', progress: 1, target: 3 },
    ],
  },
  vouchers: [
    { id: 'vch_01', adId: 'ad_spa_01', businessName: 'Pawty Luxury Pet Spa & Grooming', title: 'Giảm 35% Combo Tắm Khoáng & Cắt Tỉa', discountPercent: 35, code: 'PAW-35SPA9', status: 'saved', expiresAt: '12/11/2026' },
  ],
  sosAlerts: [
    {
      id: 'sos_01', petName: 'Miu Miu', species: 'cat', breed: 'Mèo Ragdoll Mắt Xanh',
      petPhotoUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=500&q=80',
      lastSeenAddress: 'Sảnh đón xe Landmark 2 - Vinhomes Central Park',
      rewardAmountVnd: '5.000.000 VNĐ', contactPhone: '0909112233',
      notes: 'Bé đeo vòng cổ chuông màu hồng san hô, rất nhát người lạ.', status: 'active', distanceMeters: 420, createdAt: '25 phút trước',
    },
  ],
};
