import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const SAMPLE_NAMES = [
  'Minh Anh', 'Hoàng Nam', 'Thảo Vy', 'Đức Huy', 'Khánh Linh',
  'Tuấn Kiệt', 'Bảo Ngọc', 'Gia Huy', 'Phương Thảo', 'Quốc Bảo',
  'Trúc Mai', 'Hải Đăng', 'Thu Hà', 'Thành Long', 'Diệu Linh',
  'Quang Minh', 'Hà My', 'Anh Dũng', 'Kim Ngân', 'Việt Hoàng',
  'Yến Nhi', 'Minh Quân', 'Thanh Hằng', 'Phúc Lâm', 'Ánh Tuyết',
  'Hữu Thắng', 'Mai Phương', 'Tấn Phát', 'Cẩm Tú', 'Đăng Khoa'
];

const SAMPLE_AREAS = [
  { district: 'Bình Thạnh', neighborhood: 'Vinhomes Central Park' },
  { district: 'TP. Thủ Đức', neighborhood: 'Vinhomes Grand Park' },
  { district: 'TP. Thủ Đức', neighborhood: 'Masteri Thảo Điền' },
  { district: 'Quận 7', neighborhood: 'Phú Mỹ Hưng - Midtown' },
  { district: 'Quận 1', neighborhood: 'Bến Nghé - Vinhomes Golden River' },
  { district: 'Bình Thạnh', neighborhood: 'Sunwah Pearl' },
  { district: 'Bình Thạnh', neighborhood: 'Saigon Pearl' },
  { district: 'TP. Thủ Đức', neighborhood: 'The Metropole Thủ Thiêm' },
  { district: 'TP. Thủ Đức', neighborhood: 'Đảo Kim Cương - Diamond Island' },
  { district: 'Quận 2', neighborhood: 'Khu Đô Thị Sala Đại Quang Minh' },
  { district: 'Quận 4', neighborhood: 'The GoldView' },
  { district: 'Quận 10', neighborhood: 'Hà Đô Centrosa Garden' },
  { district: 'Tân Bình', neighborhood: 'Botanica Premier' },
  { district: 'Phú Nhuận', neighborhood: 'Golden Mansion' },
  { district: 'Quận 7', neighborhood: 'Sunrise City' },
];

const SAMPLE_AVATARS = [
  'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1548142813-c348350df52b?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1517849845537-4d257902454a?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1527980965255-d3b416303d12?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1502685104226-ee32379fefbe?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80',
  'https://images.unsplash.com/photo-1561037404-61cd46aa615b?auto=format&fit=crop&w=600&q=80',
];

const SAMPLE_BIOS = [
  'Rất thích dắt cún đi dạo công viên mỗi chiều. Cần tìm bạn đồng hành!',
  'Nuôi một bé Corgi mông to siêu quậy. Tìm bạn giao lưu cuối tuần.',
  'Yêu mèo và thích cà phê sách. Cực kỳ thân thiện!',
  'Boss nhà mình là Golden Retriever thân thiện, thích kết bạn với mọi loại cún.',
  'Tìm bạn dắt cún chung quanh khu vực Vinhomes mỗi 18h hàng ngày.',
  'Mê động vật, thích chụp hình các khoảnh khắc hài hước của Boss.',
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

  console.log('[Seed] Đã dọn dẹp sạch sẽ database. Bắt đầu tạo 30 tài khoản test1 -> test30...');

  const createdUsers = [];

  for (let i = 1; i <= 30; i++) {
    const username = `test${i}`;
    const nameSuffix = SAMPLE_NAMES[i - 1] || `Người Dùng ${i}`;
    const area = SAMPLE_AREAS[(i - 1) % SAMPLE_AREAS.length];
    const avatar = SAMPLE_AVATARS[(i - 1) % SAMPLE_AVATARS.length];
    const bio = SAMPLE_BIOS[(i - 1) % SAMPLE_BIOS.length];
    const phone = `09000000${i.toString().padStart(2, '0')}`;

    const user = await prisma.user.create({
      data: {
        id: `user-test${i}`,
        username,
        password: '123456',
        phone,
        displayName: `${nameSuffix} (@${username})`,
        avatarUrl: avatar,
        bio,
        district: area.district,
        neighborhood: area.neighborhood,
        isVip: false,
        role: 'user',
        status: 'active',
        showLocation: true,
        showPhone: false,
        allowMessages: 'circle_and_matches',
      },
    });

    createdUsers.push(user);
  }

  console.log(`[Seed Thành Công] Đã khởi tạo thành công ${createdUsers.length} tài khoản từ test1 -> test30:`);
  console.log(`- Mật khẩu chung: 123456`);
  console.log(`- Tài khoản từ test1 đến test30 đã có profile, avatar, khu vực sinh sống, sẵn sàng quẹt thẻ hẹn hò.`);
}

// Chạy trực tiếp nếu file được gọi qua CLI
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
