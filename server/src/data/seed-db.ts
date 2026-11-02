import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Unsplash high quality online image assets (100% web images, zero Cloudinary clutter)
const UN_PORTRAITS = {
  female: [
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1524250502761-1ac6f2e30d43?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=800&q=80',
  ],
  male: [
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&w=800&q=80',
  ],
};

const UN_DOGS = [
  { breed: 'Phốc Sóc (Pomeranian)', url: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=900&q=80', weight: 2.5 },
  { breed: 'Golden Retriever', url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=80', weight: 28 },
  { breed: 'Corgi', url: 'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?auto=format&fit=crop&w=900&q=80', weight: 12 },
  { breed: 'Poodle', url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=900&q=80', weight: 4.2 },
  { breed: 'Shiba Inu', url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=900&q=80', weight: 9.5 },
  { breed: 'Samoyed', url: 'https://images.unsplash.com/photo-1529429617124-95b109e86bb8?auto=format&fit=crop&w=900&q=80', weight: 24 },
  { breed: 'Husky Siberia', url: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=900&q=80', weight: 25 },
  { breed: 'Beagle', url: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=900&q=80', weight: 11 },
  { breed: 'Bull Pháp', url: 'https://images.unsplash.com/photo-1583511655826-05700d52f4d9?auto=format&fit=crop&w=900&q=80', weight: 12.5 },
  { breed: 'Dachshund (Lạp xưởng)', url: 'https://images.unsplash.com/photo-1612195527405-f3bc7a71dc98?auto=format&fit=crop&w=900&q=80', weight: 6.8 },
];

const UN_CATS = [
  { breed: 'Mèo Anh lông ngắn', url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=900&q=80', weight: 4.5 },
  { breed: 'Mèo Ragdoll', url: 'https://images.unsplash.com/photo-1513360382564-850126167794?auto=format&fit=crop&w=900&q=80', weight: 5.2 },
  { breed: 'Mèo Ba Tư', url: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=900&q=80', weight: 4.8 },
  { breed: 'Mèo Mướp Vàng', url: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=900&q=80', weight: 4.0 },
  { breed: 'Mèo Scottish Fold', url: 'https://images.unsplash.com/photo-1561948955-570b270e7c36?auto=format&fit=crop&w=900&q=80', weight: 3.8 },
];

interface SeedUserConfig {
  name: string;
  gender: 'Nam' | 'Nữ';
  age: number;
  area: { district: string; neighborhood: string };
  intent: 'playdate' | 'dating' | 'community';
  lookingFor: string;
  bio: string;
  datingBio: string;
  photoCount: number; // 1, 2, or 3 personal photos
  pets: {
    name: string;
    species: 'Chó' | 'Mèo';
    breed: string;
    ageLabel: string;
    weightKg: number;
    avatarUrl: string;
    bio: string;
  }[];
}

const SEED_USERS_CONFIG: SeedUserConfig[] = [
  // --- NHÓM 1: 2-3 Ảnh Cá Nhân + 1 Thú Cưng (test1 -> test6) ---
  {
    name: 'Minh Anh',
    gender: 'Nữ',
    age: 24,
    area: { district: 'Bình Thạnh', neighborhood: 'Vinhomes Central Park' },
    intent: 'playdate',
    lookingFor: 'Cùng dắt thú cưng đi dạo',
    bio: 'Yêu cún, thích dắt bé dạo bờ sông Vinhomes Central Park mỗi chiều hoàng hôn.',
    datingBio: 'Tìm bạn cùng gu dắt cún dạo mát và cà phê cuối tuần.',
    photoCount: 2,
    pets: [
      {
        name: 'Huhu',
        species: 'Chó',
        breed: 'Phốc Sóc (Pomeranian)',
        ageLabel: '1 tuổi',
        weightKg: 2.5,
        avatarUrl: UN_DOGS[0].url,
        bio: 'Bé Huhu siêu lanh lợi, thích đuổi bướm và được vuốt ve.',
      },
    ],
  },
  {
    name: 'Hoàng Nam',
    gender: 'Nam',
    age: 26,
    area: { district: 'TP. Thủ Đức', neighborhood: 'Masteri Thảo Điền' },
    intent: 'dating',
    lookingFor: 'Tìm bạn hẹn hò yêu thú cưng',
    bio: 'Software engineer đam mê chạy bộ cùng cún cưng ở công viên Thảo Điền.',
    datingBio: 'Muốn tìm bạn gái yêu động vật, thỉnh thoảng đi dã ngoại cùng cún.',
    photoCount: 2,
    pets: [
      {
        name: 'Bơ',
        species: 'Chó',
        breed: 'Golden Retriever',
        ageLabel: '2 tuổi',
        weightKg: 28,
        avatarUrl: UN_DOGS[1].url,
        bio: 'Bé Bơ cực kỳ quấn người, đã huấn luyện biết nhặt bóng.',
      },
    ],
  },
  {
    name: 'Thảo Vy',
    gender: 'Nữ',
    age: 23,
    area: { district: 'Quận 7', neighborhood: 'Phú Mỹ Hưng - Midtown' },
    intent: 'community',
    lookingFor: 'Giao lưu chia sẻ kinh nghiệm',
    bio: 'Nuôi mèo tại căn hộ Midtown, thích đọc sách và làm bánh.',
    datingBio: 'Kết nối những người bạn yêu mèo, thích không gian yên bình.',
    photoCount: 3,
    pets: [
      {
        name: 'Miu',
        species: 'Mèo',
        breed: 'Mèo Anh lông ngắn',
        ageLabel: '1.5 tuổi',
        weightKg: 4.2,
        avatarUrl: UN_CATS[0].url,
        bio: 'Bé Miu lười vận động, thích nằm phơi nắng bên cửa sổ.',
      },
    ],
  },
  {
    name: 'Đức Huy',
    gender: 'Nam',
    age: 27,
    area: { district: 'Bình Thạnh', neighborhood: 'Sunwah Pearl' },
    intent: 'playdate',
    lookingFor: 'Dắt cún dạo công viên bờ sông',
    bio: 'Kiến trúc sư sống tại Sunwah Pearl, thích cún mông to Corgi.',
    datingBio: 'Tìm bạn dắt cún cùng lộ trình Landmark - Sunwah mỗi 18h.',
    photoCount: 2,
    pets: [
      {
        name: 'Lu',
        species: 'Chó',
        breed: 'Corgi',
        ageLabel: '3 tuổi',
        weightKg: 11.5,
        avatarUrl: UN_DOGS[2].url,
        bio: 'Lu chân ngắn nhưng chạy rất nhanh, hay sủa mừng khi gặp bạn mới.',
      },
    ],
  },
  {
    name: 'Khánh Linh',
    gender: 'Nữ',
    age: 25,
    area: { district: 'Bình Thạnh', neighborhood: 'Saigon Pearl' },
    intent: 'dating',
    lookingFor: 'Tìm bạn cafe cuối tuần cùng Boss',
    bio: 'Graphic Designer, mê màu pastel và nuôi 1 bé Poodle trắng.',
    datingBio: 'Tìm người bạn cùng đi pet-friendly cafe quanh Quận 1 và Bình Thạnh.',
    photoCount: 2,
    pets: [
      {
        name: 'Mochi',
        species: 'Chó',
        breed: 'Poodle',
        ageLabel: '8 tháng tuổi',
        weightKg: 3.8,
        avatarUrl: UN_DOGS[3].url,
        bio: 'Mochi lông xoăn đáng yêu, thích mặc áo đẹp đi dạo.',
      },
    ],
  },
  {
    name: 'Tuấn Kiệt',
    gender: 'Nam',
    age: 28,
    area: { district: 'TP. Thủ Đức', neighborhood: 'The Metropole Thủ Thiêm' },
    intent: 'playdate',
    lookingFor: 'Tìm bạn chạy bộ cùng cún',
    bio: 'Finance guy, thích chạy bộ qua cầu Ba Son mỗi sáng sớm cùng Boss.',
    datingBio: 'Tìm bạn năng động, cùng dắt cún rèn luyện thể thao.',
    photoCount: 3,
    pets: [
      {
        name: 'Simba',
        species: 'Chó',
        breed: 'Samoyed',
        ageLabel: '2 tuổi',
        weightKg: 24,
        avatarUrl: UN_DOGS[5].url,
        bio: 'Simba lông trắng như tuyết, luôn tươi cười thân thiện.',
      },
    ],
  },

  // --- NHÓM 2: 2 Ảnh Cá Nhân + Nhiều Thú Cưng (2-3 bé) (test7 -> test12) ---
  {
    name: 'Bảo Ngọc',
    gender: 'Nữ',
    age: 24,
    area: { district: 'TP. Thủ Đức', neighborhood: 'Đảo Kim Cương - Diamond Island' },
    intent: 'playdate',
    lookingFor: 'Cùng dắt thú cưng đi dạo',
    bio: 'Nhà có cả cún và mèo sống hòa thuận, cực kỳ quấn quýt nhau.',
    datingBio: 'Tìm bạn dắt cún giao lưu tại Đảo Kim Cương thoáng đãng.',
    photoCount: 2,
    pets: [
      {
        name: 'Kem',
        species: 'Chó',
        breed: 'Corgi',
        ageLabel: '1.5 tuổi',
        weightKg: 12,
        avatarUrl: UN_DOGS[2].url,
        bio: 'Kem hay nằm ăn vạ khi đi dạo mệt.',
      },
      {
        name: 'Sữa',
        species: 'Mèo',
        breed: 'Mèo Ragdoll',
        ageLabel: '2 tuổi',
        weightKg: 4.5,
        avatarUrl: UN_CATS[1].url,
        bio: 'Sữa mắt xanh biếc, ngoan ngoãn và thích bế.',
      },
    ],
  },
  {
    name: 'Gia Huy',
    gender: 'Nam',
    age: 29,
    area: { district: 'Quận 2', neighborhood: 'Khu Đô Thị Sala Đại Quang Minh' },
    intent: 'dating',
    lookingFor: 'Tìm bạn hẹn hò yêu thú cưng',
    bio: 'Nuôi 2 chú chó năng động tại khu đô thị Sala.',
    datingBio: 'Thích đi dạo công viên Sala, tìm bạn gái đồng điệu tâm hồn.',
    photoCount: 2,
    pets: [
      {
        name: 'Rex',
        species: 'Chó',
        breed: 'Husky Siberia',
        ageLabel: '3 tuổi',
        weightKg: 25,
        avatarUrl: UN_DOGS[6].url,
        bio: 'Rex hay hú gọi đàn vào 17h chiều, cực kỳ vui tính.',
      },
      {
        name: 'Max',
        species: 'Chó',
        breed: 'Shiba Inu',
        ageLabel: '1 tuổi',
        weightKg: 9.5,
        avatarUrl: UN_DOGS[4].url,
        bio: 'Max biểu cảm mặt cười thương hiệu, quấn anh hai Rex.',
      },
    ],
  },
  {
    name: 'Phụng Thảo',
    gender: 'Nữ',
    age: 25,
    area: { district: 'Quận 4', neighborhood: 'The GoldView' },
    intent: 'community',
    lookingFor: 'Giao lưu chia sẻ kinh nghiệm',
    bio: 'Gia đình đông vui với 3 bé thú cưng lông xù đáng yêu.',
    datingBio: 'Chào đón mọi người giao lưu kinh nghiệm chăm sóc thú cưng.',
    photoCount: 2,
    pets: [
      {
        name: 'Đậu Đậu',
        species: 'Chó',
        breed: 'Poodle',
        ageLabel: '1 tuổi',
        weightKg: 4,
        avatarUrl: UN_DOGS[3].url,
        bio: 'Bé Đậu hay làm nũng đòi ăn vặt.',
      },
      {
        name: 'Bắp',
        species: 'Mèo',
        breed: 'Mèo Ba Tư',
        ageLabel: '2 tuổi',
        weightKg: 4.8,
        avatarUrl: UN_CATS[2].url,
        bio: 'Bắp mặt tịt quý phái, lông trắng dài mượt.',
      },
      {
        name: 'Gạo',
        species: 'Mèo',
        breed: 'Mèo Anh lông ngắn',
        ageLabel: '6 tháng tuổi',
        weightKg: 2.5,
        avatarUrl: UN_CATS[0].url,
        bio: 'Em út Gạo hiếu động, thích nghịch bóng len.',
      },
    ],
  },
  {
    name: 'Quốc Bảo',
    gender: 'Nam',
    age: 27,
    area: { district: 'Quận 10', neighborhood: 'Hà Đô Centrosa Garden' },
    intent: 'playdate',
    lookingFor: 'Dắt cún dạo chung nội khu',
    bio: 'Nuôi cặp đôi chó săn thỏ Beagle và Bull Pháp hài hước.',
    datingBio: 'Tìm bạn cùng chung cư dẫn cún đi dạo nội khu Centrosa.',
    photoCount: 2,
    pets: [
      {
        name: 'Milo',
        species: 'Chó',
        breed: 'Beagle',
        ageLabel: '2 tuổi',
        weightKg: 12.5,
        avatarUrl: UN_DOGS[7].url,
        bio: 'Milo mũi siêu thính, đi đâu cũng hít hà khám phá.',
      },
      {
        name: 'Oreo',
        species: 'Chó',
        breed: 'Bull Pháp',
        ageLabel: '1.5 tuổi',
        weightKg: 13,
        avatarUrl: UN_DOGS[8].url,
        bio: 'Oreo dáng đi núc ních, ngủ hay ngáy nhỏ dễ thương.',
      },
    ],
  },
  {
    name: 'Trúc Mai',
    gender: 'Nữ',
    age: 23,
    area: { district: 'Tân Bình', neighborhood: 'Botanica Premier' },
    intent: 'dating',
    lookingFor: 'Tìm bạn hẹn hò yêu thú cưng',
    bio: 'Tiếp viên hàng không, mỗi khi hạ cánh là về ôm ấp 2 bé cưng.',
    datingBio: 'Tìm người chân thành, yêu thương động vật như người nhà.',
    photoCount: 2,
    pets: [
      {
        name: 'Bông',
        species: 'Chó',
        breed: 'Phốc Sóc (Pomeranian)',
        ageLabel: '1 tuổi',
        weightKg: 2.8,
        avatarUrl: UN_DOGS[0].url,
        bio: 'Bông tròn như cục bông gòn, thích được vuốt cằm.',
      },
      {
        name: 'Mun',
        species: 'Mèo',
        breed: 'Mèo Mướp Vàng',
        ageLabel: '2 tuổi',
        weightKg: 3.9,
        avatarUrl: UN_CATS[3].url,
        bio: 'Mun bắt gián cực giỏi, ban đêm thích ngủ dưới chân giường.',
      },
    ],
  },
  {
    name: 'Hải Đăng',
    gender: 'Nam',
    age: 30,
    area: { district: 'Phú Nhuận', neighborhood: 'Golden Mansion' },
    intent: 'playdate',
    lookingFor: 'Dắt cún đi dạo công viên Gia Định',
    bio: 'Chủ của 2 chú cún khổng lồ Alaska và Golden hiền lành.',
    datingBio: 'Thường dẫn cún đi dạo công viên Gia Định mỗi cuối tuần.',
    photoCount: 2,
    pets: [
      {
        name: 'Rocky',
        species: 'Chó',
        breed: 'Husky Siberia',
        ageLabel: '4 tuổi',
        weightKg: 30,
        avatarUrl: UN_DOGS[6].url,
        bio: 'Rocky to con nhưng nhát gan, thấy mèo là lùi lại.',
      },
      {
        name: 'Ruby',
        species: 'Chó',
        breed: 'Golden Retriever',
        ageLabel: '2 tuổi',
        weightKg: 27,
        avatarUrl: UN_DOGS[1].url,
        bio: 'Ruby là cô gái dịu dàng, thích ngậm đồ chơi đón chủ.',
      },
    ],
  },

  // --- NHÓM 3: Ảnh Cá Nhân + 0 Thú Cưng (test13 -> test18) ---
  {
    name: 'Thu Hà',
    gender: 'Nữ',
    age: 22,
    area: { district: 'Quận 7', neighborhood: 'Sunrise City' },
    intent: 'playdate',
    lookingFor: 'Tìm bạn dắt thú cưng đi dạo',
    bio: 'Chưa đủ điều kiện nuôi pet riêng nhưng cực kỳ mê cún mèo, muốn dắt dạo cùng bạn bè.',
    datingBio: 'Muốn tìm người bạn có thú cưng để cùng đi dạo và chăm sóc các bé.',
    photoCount: 2,
    pets: [],
  },
  {
    name: 'Thành Long',
    gender: 'Nam',
    age: 26,
    area: { district: 'TP. Thủ Đức', neighborhood: 'Vinhomes Grand Park' },
    intent: 'community',
    lookingFor: 'Giao lưu học hỏi kinh nghiệm',
    bio: 'Đang lên kế hoạch đón 1 bé Corgi về nuôi, muốn tìm hiểu kinh nghiệm trước.',
    datingBio: 'Rất vui được kết nối với cộng đồng yêu thú cưng khu Grand Park.',
    photoCount: 2,
    pets: [],
  },
  {
    name: 'Diệu Linh',
    gender: 'Nữ',
    age: 24,
    area: { district: 'TP. Thủ Đức', neighborhood: 'Masteri Thảo Điền' },
    intent: 'dating',
    lookingFor: 'Tìm bạn hẹn hò yêu thú cưng',
    bio: 'Bác sĩ nha khoa, rất thích động vật và mong muốn gặp gỡ người cùng đam mê.',
    datingBio: 'Một buổi hẹn cafe có thú cưng sẽ là khởi đầu hoàn hảo.',
    photoCount: 2,
    pets: [],
  },
  {
    name: 'Quang Minh',
    gender: 'Nam',
    age: 28,
    area: { district: 'Quận 7', neighborhood: 'Phú Mỹ Hưng - Midtown' },
    intent: 'playdate',
    lookingFor: 'Đi dạo và chạy bộ công viên',
    bio: 'Người yêu thể thao, thích tham gia các hội nhóm dắt cún rèn luyện sức khỏe.',
    datingBio: 'Sẵn sàng làm bạn đồng hành chạy bộ cùng bạn và Boss.',
    photoCount: 2,
    pets: [],
  },
  {
    name: 'Hà My',
    gender: 'Nữ',
    age: 23,
    area: { district: 'Quận 1', neighborhood: 'Bến Nghé - Vinhomes Golden River' },
    intent: 'dating',
    lookingFor: 'Tìm bạn hẹn hò chân thành',
    bio: 'Sống tại Ba Son, yêu thích thú cưng và không gian sống xanh bên bờ sông.',
    datingBio: 'Tìm kiếm mối quan hệ nghiêm túc với người yêu động vật.',
    photoCount: 2,
    pets: [],
  },
  {
    name: 'Anh Dũng',
    gender: 'Nam',
    age: 27,
    area: { district: 'Bình Thạnh', neighborhood: 'Sunwah Pearl' },
    intent: 'community',
    lookingFor: 'Kết nối cộng đồng cư dân',
    bio: 'Tình nguyện viên cứu hộ động vật, sẵn sàng hỗ trợ các gia đình nuôi pet.',
    datingBio: 'Giao lưu và chia sẻ kiến thức chăm sóc thú cưng an toàn.',
    photoCount: 2,
    pets: [],
  },

  // --- NHÓM 4: 1 Ảnh Cá Nhân + 1 Thú Cưng (test19 -> test24) ---
  {
    name: 'Kim Ngân',
    gender: 'Nữ',
    age: 24,
    area: { district: 'Bình Thạnh', neighborhood: 'Vinhomes Central Park' },
    intent: 'playdate',
    lookingFor: 'Cùng dắt cún dạo công viên',
    bio: 'Nhà có bé Corgi Bánh Bao 1 tuổi siêu tinh nghịch.',
    datingBio: 'Dắt cún đi dạo nội khu Central Park mỗi 17h30.',
    photoCount: 1,
    pets: [
      {
        name: 'Bánh Bao',
        species: 'Chó',
        breed: 'Corgi',
        ageLabel: '1 tuổi',
        weightKg: 11,
        avatarUrl: UN_DOGS[2].url,
        bio: 'Bánh Bao thích ăn dưa leo và chạy vòng tròn.',
      },
    ],
  },
  {
    name: 'Việt Hoàng',
    gender: 'Nam',
    age: 29,
    area: { district: 'Quận 2', neighborhood: 'Khu Đô Thị Sala Đại Quang Minh' },
    intent: 'dating',
    lookingFor: 'Tìm bạn hẹn hò yêu thú cưng',
    bio: 'Chủ bé Shiba Inu Ken, thích chụp ảnh đường phố và cún cưng.',
    datingBio: 'Tìm bạn gái yêu thích văn hóa Nhật và chó Shiba.',
    photoCount: 1,
    pets: [
      {
        name: 'Ken',
        species: 'Chó',
        breed: 'Shiba Inu',
        ageLabel: '2 tuổi',
        weightKg: 9.8,
        avatarUrl: UN_DOGS[4].url,
        bio: 'Ken mặt ngố, rất ngoan và biết nghe lời hiệu lệnh.',
      },
    ],
  },
  {
    name: 'Yến Nhi',
    gender: 'Nữ',
    age: 23,
    area: { district: 'TP. Thủ Đức', neighborhood: 'The Metropole Thủ Thiêm' },
    intent: 'community',
    lookingFor: 'Giao lưu hội mèo cảnh',
    bio: 'Nuôi bé mèo Scottish Fold tai cụp dễ thương.',
    datingBio: 'Chia sẻ các địa chỉ spa và phòng khám thú y uy tín.',
    photoCount: 1,
    pets: [
      {
        name: 'Mimi',
        species: 'Mèo',
        breed: 'Mèo Scottish Fold',
        ageLabel: '1 tuổi',
        weightKg: 3.8,
        avatarUrl: UN_CATS[4].url,
        bio: 'Mimi tai cụp tròn xoe, thích được gãi tai.',
      },
    ],
  },
  {
    name: 'Minh Quân',
    gender: 'Nam',
    age: 27,
    area: { district: 'Bình Thạnh', neighborhood: 'Saigon Pearl' },
    intent: 'playdate',
    lookingFor: 'Dắt cún dạo chung',
    bio: 'Nuôi 1 chú lạp xưởng Dachshund thân dài đáng yêu.',
    datingBio: 'Cuối tuần hay dắt bé đi dạo dọc bờ sông Sài Gòn.',
    photoCount: 1,
    pets: [
      {
        name: 'Xúc Xích',
        species: 'Chó',
        breed: 'Dachshund (Lạp xưởng)',
        ageLabel: '1.5 tuổi',
        weightKg: 6.8,
        avatarUrl: UN_DOGS[9].url,
        bio: 'Xúc Xích chân ngắn ngủn nhưng đào bới cực kỳ hăng say.',
      },
    ],
  },
  {
    name: 'Thanh Hằng',
    gender: 'Nữ',
    age: 25,
    area: { district: 'Quận 4', neighborhood: 'The GoldView' },
    intent: 'dating',
    lookingFor: 'Tìm bạn hẹn hò yêu thú cưng',
    bio: 'Bé Poodle Xù là người bạn thân thiết nhất của mình.',
    datingBio: 'Muốn tìm chàng trai kiên nhẫn, ấm áp và yêu động vật.',
    photoCount: 1,
    pets: [
      {
        name: 'Xù',
        species: 'Chó',
        breed: 'Poodle',
        ageLabel: '2 tuổi',
        weightKg: 4.1,
        avatarUrl: UN_DOGS[3].url,
        bio: 'Xù biết đi 2 chân và làm trò xin ăn.',
      },
    ],
  },
  {
    name: 'Phúc Lâm',
    gender: 'Nam',
    age: 28,
    area: { district: 'TP. Thủ Đức', neighborhood: 'Đảo Kim Cương - Diamond Island' },
    intent: 'playdate',
    lookingFor: 'Tìm bạn dắt cún bơi lội',
    bio: 'Bé Golden Nếp thích bơi lội tại khu vực Đảo Kim Cương.',
    datingBio: 'Tìm bạn có cún cùng sở thích bơi lội và chạy nhảy.',
    photoCount: 1,
    pets: [
      {
        name: 'Nếp',
        species: 'Chó',
        breed: 'Golden Retriever',
        ageLabel: '2 tuổi',
        weightKg: 29,
        avatarUrl: UN_DOGS[1].url,
        bio: 'Nếp bơi rất giỏi, thấy nước là nhảy xuống liền.',
      },
    ],
  },

  // --- NHÓM 5: 3 Ảnh Cá Nhân + 1 hoặc 2 Thú Cưng Đa Dạng (test25 -> test30) ---
  {
    name: 'Ánh Tuyết',
    gender: 'Nữ',
    age: 25,
    area: { district: 'TP. Thủ Đức', neighborhood: 'Masteri Thảo Điền' },
    intent: 'playdate',
    lookingFor: 'Dắt cún dạo công viên',
    bio: 'Mê cún tuyết Samoyed, thích phong cách sống healthy.',
    datingBio: 'Cùng dắt cún dạo và thưởng thức trà chiều Thảo Điền.',
    photoCount: 3,
    pets: [
      {
        name: 'Tuyết',
        species: 'Chó',
        breed: 'Samoyed',
        ageLabel: '2 tuổi',
        weightKg: 23.5,
        avatarUrl: UN_DOGS[5].url,
        bio: 'Tuyết như cục bông khổng lồ, rất thích trẻ em.',
      },
    ],
  },
  {
    name: 'Hữu Thắng',
    gender: 'Nam',
    age: 31,
    area: { district: 'Quận 7', neighborhood: 'Phú Mỹ Hưng - Midtown' },
    intent: 'dating',
    lookingFor: 'Tìm bạn hẹn hò yêu thú cưng',
    bio: 'Kinh doanh tự do, nhà có 1 bé Corgi và 1 bé mèo Anh cam.',
    datingBio: 'Tìm bạn đời cùng chung tình yêu lớn dành cho thú cưng.',
    photoCount: 3,
    pets: [
      {
        name: 'Bo',
        species: 'Chó',
        breed: 'Corgi',
        ageLabel: '2 tuổi',
        weightKg: 12.2,
        avatarUrl: UN_DOGS[2].url,
        bio: 'Bo tròn vo, thích được gãi bụng.',
      },
      {
        name: 'Cam',
        species: 'Mèo',
        breed: 'Mèo Anh lông ngắn',
        ageLabel: '1 tuổi',
        weightKg: 4.6,
        avatarUrl: UN_CATS[3].url,
        bio: 'Cam béo múp míp, lúc nào cũng đòi ăn pate.',
      },
    ],
  },
  {
    name: 'Mai Phương',
    gender: 'Nữ',
    age: 24,
    area: { district: 'Quận 1', neighborhood: 'Bến Nghé - Vinhomes Golden River' },
    intent: 'dating',
    lookingFor: 'Tìm bạn hẹn hò yêu thú cưng',
    bio: 'Yêu mèo Ragdoll quý phái, thích nghe nhạc jazz và dạo phố.',
    datingBio: 'Hy vọng tìm được người thấu hiểu và tôn trọng sở thích.',
    photoCount: 3,
    pets: [
      {
        name: 'Mây',
        species: 'Mèo',
        breed: 'Mèo Ragdoll',
        ageLabel: '1.5 tuổi',
        weightKg: 4.8,
        avatarUrl: UN_CATS[1].url,
        bio: 'Mây có bộ lông mềm như lụa, thích được chải lông.',
      },
    ],
  },
  {
    name: 'Tấn Phát',
    gender: 'Nam',
    age: 28,
    area: { district: 'Bình Thạnh', neighborhood: 'Sunwah Pearl' },
    intent: 'playdate',
    lookingFor: 'Dắt cún dạo chung',
    bio: 'Chú Bull Pháp Bốp là bạn thân của mình trong mọi cuộc vui.',
    datingBio: 'Tìm bạn dắt cún giao lưu quanh khu vực cầu Thủ Thiêm.',
    photoCount: 3,
    pets: [
      {
        name: 'Bốp',
        species: 'Chó',
        breed: 'Bull Pháp',
        ageLabel: '2 tuổi',
        weightKg: 13.5,
        avatarUrl: UN_DOGS[8].url,
        bio: 'Bốp mặt nhăn dễ thương, thích gặm xương cao su.',
      },
    ],
  },
  {
    name: 'Cẩm Tú',
    gender: 'Nữ',
    age: 26,
    area: { district: 'Tân Bình', neighborhood: 'Botanica Premier' },
    intent: 'community',
    lookingFor: 'Giao lưu hội yêu cún nhỏ',
    bio: 'Bé Chíp Phốc Sóc nhỏ xinh luôn bên cạnh mình mỗi ngày.',
    datingBio: 'Giao lưu với các bạn nuôi cún dòng nhỏ tại Tân Bình và Phú Nhuận.',
    photoCount: 3,
    pets: [
      {
        name: 'Chíp',
        species: 'Chó',
        breed: 'Phốc Sóc (Pomeranian)',
        ageLabel: '1 tuổi',
        weightKg: 2.6,
        avatarUrl: UN_DOGS[0].url,
        bio: 'Chíp sủa tiếng líu lo, thích chạy theo gót chân chủ.',
      },
    ],
  },
  {
    name: 'Đăng Khoa',
    gender: 'Nam',
    age: 29,
    area: { district: 'Bình Thạnh', neighborhood: 'Vinhomes Central Park' },
    intent: 'playdate',
    lookingFor: 'Dắt cún dạo công viên Landmark 81',
    bio: 'Nhà có 2 chú cún: Golden Gấu và Poodle Mì lúc nào cũng tràn đầy năng lượng.',
    datingBio: 'Hẹn gặp các sen và boss tại công viên Landmark 81 mỗi chiều tối.',
    photoCount: 3,
    pets: [
      {
        name: 'Gấu',
        species: 'Chó',
        breed: 'Golden Retriever',
        ageLabel: '3 tuổi',
        weightKg: 30,
        avatarUrl: UN_DOGS[1].url,
        bio: 'Gấu hiền lành như một chú gấu lớn, bảo vệ em Mì.',
      },
      {
        name: 'Mì',
        species: 'Chó',
        breed: 'Poodle',
        ageLabel: '1.5 tuổi',
        weightKg: 3.9,
        avatarUrl: UN_DOGS[3].url,
        bio: 'Mì lông nâu đỏ xoăn tít, thích nhảy lên đùi ngồi.',
      },
    ],
  },
];

export async function seedDatabase() {
  console.log('[Seed] Đang dọn dẹp toàn bộ dữ liệu trong PostgreSQL...');

  // Xóa theo thứ tự quan hệ khóa ngoại (Foreign Keys)
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.match.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.sightingTrajectory.deleteMany();
  await prisma.petSightingMatch.deleteMany();
  await prisma.sosAlert.deleteMany();
  await prisma.report.deleteMany();
  await prisma.consentRecord.deleteMany();
  await prisma.analyticsEvent.deleteMany();
  await prisma.reaction.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.post.deleteMany();
  await prisma.careRecord.deleteMany();
  await prisma.careTask.deleteMany();
  await prisma.circleMember.deleteMany();
  await prisma.vaccination.deleteMany();
  await prisma.petBehavior.deleteMany();
  await prisma.pet.deleteMany();
  await prisma.household.deleteMany();
  await prisma.user.deleteMany();

  console.log('[Seed] Đã dọn dẹp database. Bắt đầu tạo 30 tài khoản test1 -> test30 với đầy đủ album hẹn hò và thú cưng...');

  for (let i = 1; i <= 30; i++) {
    const config = SEED_USERS_CONFIG[i - 1];
    const username = `test${i}`;
    const phone = `09000000${i.toString().padStart(2, '0')}`;

    // Lấy ảnh chân dung Unsplash theo giới tính
    const pool = config.gender === 'Nữ' ? UN_PORTRAITS.female : UN_PORTRAITS.male;
    const personalPhotos: string[] = [];
    for (let p = 0; p < config.photoCount; p++) {
      personalPhotos.push(pool[(i * 3 + p) % pool.length]);
    }
    const avatarUrl = personalPhotos[0];

    // 1. Tạo User
    const user = await prisma.user.create({
      data: {
        id: `user-test${i}`,
        username,
        password: '123456',
        phone,
        displayName: config.name,
        avatarUrl,
        bio: config.bio,
        district: config.area.district,
        neighborhood: config.area.neighborhood,
        isVip: false,
        role: 'user',
        status: 'active',
        showLocation: true,
        showPhone: false,
        allowMessages: 'circle_and_matches',
      },
    });

    // 2. Tạo Household cho User
    const household = await prisma.household.create({
      data: {
        id: `household-test${i}`,
        name: `Gia đình ${config.name}`,
        ownerId: user.id,
      },
    });

    // 3. Tạo các bé thú cưng (nếu có)
    const createdPetIds: string[] = [];
    for (let pIdx = 0; pIdx < config.pets.length; pIdx++) {
      const petCfg = config.pets[pIdx];
      const petId = `pet-test${i}-${pIdx + 1}`;
      createdPetIds.push(petId);

      const createdPet = await prisma.pet.create({
        data: {
          id: petId,
          name: petCfg.name,
          species: petCfg.species,
          breed: petCfg.breed,
          gender: pIdx % 2 === 0 ? 'Đực' : 'Cái',
          householdId: household.id,
          ownerId: user.id,
          avatarUrl: petCfg.avatarUrl,
          coverPhotoUrl: petCfg.avatarUrl,
          weightKg: petCfg.weightKg,
          isNeutered: true,
          vaccinationStatus: 'verified',
          isPublic: true,
          medicalNotes: petCfg.bio,
        },
      });

      // Tạo careRecord để lưu thông số chi tiết (ageLabel, thức ăn, tiêm chủng)
      await prisma.careRecord.create({
        data: {
          petId: createdPet.id,
          recordType: 'pet_profile_meta',
          recordedBy: user.id,
          title: 'Hồ sơ sức khỏe',
          dataJson: {
            ageLabel: petCfg.ageLabel,
            favoriteFood: petCfg.species === 'Chó' ? 'Hạt dinh dưỡng & Ức gà xé' : 'Pate cá hồi & Hạt Royal Canin',
            dewormingHistory: 'Định kỳ 3 tháng/lần',
            medicalHistory: 'Khỏe mạnh, không có tiền sử bệnh nền',
            vaccineRecords: [
              {
                id: `vac-${createdPet.id}-1`,
                vaccineName: petCfg.species === 'Chó' ? 'Phòng dại & 7 bệnh cơ bản' : 'Phòng dại & 4 bệnh cơ bản cho mèo',
                doseLabel: 'Mũi 2',
                clinicName: 'Bệnh viện thú y Pawty Care',
                dateGiven: '01/10/2025',
              },
            ],
            goodHabits: ['Biết đi vệ sinh đúng chỗ', 'Thân thiện với người lạ', 'Biết nghe lệnh cơ bản'],
            cautionHabits: petCfg.species === 'Chó' ? ['Hơi nhát khi gặp chó lớn'] : ['Sợ tiếng sấm'],
          },
        },
      });
    }

    // 4. Tạo Hồ Sơ Hẹn Hò TinderSetup trong analyticsEvent (user_profile_meta)
    await prisma.analyticsEvent.create({
      data: {
        userId: user.id,
        eventType: 'user_profile_meta',
        eventData: {
          age: config.age,
          gender: config.gender,
          occupation: config.gender === 'Nữ' ? 'Marketing Specialist' : 'Product Designer',
          tinderSetup: {
            displayName: config.name,
            age: config.age,
            gender: config.gender,
            intent: config.intent,
            lookingFor: config.lookingFor,
            bio: config.datingBio,
            photos: personalPhotos, // 100% là ảnh cá nhân từ Unsplash, không lẫn ảnh thú cưng
            photoUrls: personalPhotos,
            datingPetId: createdPetIds[0] || undefined,
            smoking: 'Không hút thuốc',
            workout: 'Dắt thú đi bộ mỗi chiều',
            drinking: 'Thỉnh thoảng giao lưu',
            zodiac: config.gender === 'Nữ' ? 'Cự Giải' : 'Sư Tử',
            chatStyle: 'Thân thiện, phản hồi nhanh',
          },
        },
      },
    });
  }

  // 5. Tạo một vài tương tác Match & Like mẫu để màn hình Kết nối có dữ liệu sinh động
  // test2 và test3 thích test1
  await prisma.match.create({
    data: {
      userAId: 'user-test2',
      userBId: 'user-test1',
      status: 'pending',
    },
  });

  await prisma.match.create({
    data: {
      userAId: 'user-test3',
      userBId: 'user-test1',
      status: 'pending',
          },
  });

  console.log(`[Seed Thành Công] Đã khởi tạo 30 tài khoản test1 -> test30:`);
  console.log(`- Mật khẩu: 123456`);
  console.log(`- Đầy đủ các trường hợp: 2-3 ảnh người + 1 pet, 2 ảnh người + 2-3 pets, ảnh người + 0 pet, 1 ảnh người + 1 pet.`);
  console.log(`- 100% link ảnh chất lượng cao từ Unsplash trên mạng (Không upload bừa bãi vào Cloudinary).`);
}

if (require.main === module) {
  seedDatabase()
    .then(async () => {
      await prisma.$disconnect();
    })
    .catch(async (e) => {
      console.error('[Seed Error]:', e);
      await prisma.$disconnect();
      process.exit(1);
    });
}
