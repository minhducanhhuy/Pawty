import * as dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// ==========================================
// 1. CONFIG: 15 NỮ NGHỆ SĨ & 15 BÉ CÚN
// ==========================================
const FEMALE_CELEBRITIES = [
  {
    index: 1,
    name: 'Chi Pu',
    username: 'chipu',
    phone: '0900000001',
    age: 31,
    occupation: 'Ca sĩ & Diễn viên',
    district: 'Bình Thạnh',
    neighborhood: 'Vinhomes Central Park',
    bio: 'Ca sĩ, diễn viên. Yêu thích thời trang, âm nhạc và những buổi chiều dắt bé Bông dạo bờ sông Landmark 81.',
    datingBio: 'Yêu âm nhạc, thời trang và lối sống năng động. Tìm bạn cùng gu dắt cún dạo mát và cà phê cuối tuần.',
    avatarUrl: 'https://kenh14cdn.com/203336854389633024/2023/4/3/laem-chipu0415-16805352397721941667135.jpeg',
    pet: {
      name: 'Bông',
      species: 'Chó',
      breed: 'Golden Retriever',
      weightKg: 28,
      ageLabel: '2 tuổi',
      gender: 'Đực',
      avatarUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80',
      bio: 'Bé Golden thân thiện, hay vẫy đuôi mừng khách và cực kỳ thích bơi lội.',
      goodHabits: ['Biết bắt tay và ngồi đợi', 'Đi vệ sinh đúng chỗ ngoài cỏ', 'Rất thân thiện với trẻ em'],
      cautionHabits: ['Hơi háu ăn khi thấy xúc xích', 'Thích nhảy xuống hồ nước'],
    },
  },
  {
    index: 2,
    name: 'Midu',
    username: 'midu',
    phone: '0900000002',
    age: 35,
    occupation: 'Giảng viên & Doanh nhân',
    district: 'Quận 2',
    neighborhood: 'Thảo Điền Pearl',
    bio: 'Giảng viên đại học, người sáng lập thương hiệu thời trang. Yêu không gian yên bình và cún cưng trung thành.',
    datingBio: 'Thích đọc sách, trà chiều và dạo công viên xanh mát. Tìm người đồng điệu, tử tế và biết yêu thương động vật.',
    avatarUrl: 'https://admin.vov.gov.vn/UploadFolder/KhoTin/Images/UploadFolder/VOVVN/Images/sites/default/files/styles/large/public/2024-04/z5360145166693_aa1cc3986363235b17caabc9f6dc94a7.jpg',
    pet: {
      name: 'Nâu',
      species: 'Chó',
      breed: 'Labrador Retriever',
      weightKg: 30,
      ageLabel: '3 tuổi',
      gender: 'Đực',
      avatarUrl: 'https://images.unsplash.com/photo-1579202673506-ca3ce28943ef?auto=format&fit=crop&w=800&q=80',
      bio: 'Chú chó Labrador điềm đạm, thông minh, luôn biết cách an ủi và đi dạo rất ngoan.',
      goodHabits: ['Điềm đạm, không bao giờ sủa bừa', 'Luôn đi cạnh chủ', 'Biết mang dép cho chủ'],
      cautionHabits: ['Hơi nặng cân, cần đi bộ điều độ'],
    },
  },
  {
    index: 3,
    name: 'Băng Di',
    username: 'bangdi',
    phone: '0900000003',
    age: 34,
    occupation: 'Diễn viên & Ca sĩ',
    district: 'Quận 1',
    neighborhood: 'Sailing Tower',
    bio: 'Diễn viên năng động, thích phiêu lưu và cắm trại cuối tuần cùng Boss siêu quậy ngáo ngơ.',
    datingBio: 'Sống hết mình với đam mê nghệ thuật. Tìm người hài hước, thích trekking hoặc dắt thú cưng vi vu.',
    avatarUrl: 'https://images2.thanhnien.vn/zoom/686_429/528068263637045248/2025/3/12/img2829-1741777387320803253834-111-0-1711-2560-crop-1741777716404296306932.jpg',
    pet: {
      name: 'Sói',
      species: 'Chó',
      breed: 'Siberian Husky',
      weightKg: 24,
      ageLabel: '2 tuổi',
      gender: 'Đực',
      avatarUrl: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?auto=format&fit=crop&w=800&q=80',
      bio: 'Siêu ngáo ngơ, thích hú theo tiếng còi xe và hay chạy vòng vòng trong công viên.',
      goodHabits: ['Rất năng động, kéo dây chạy khỏe', 'Thân thiện với tất cả mọi người'],
      cautionHabits: ['Dễ bị phân tâm bởi tiếng động lạ', 'Hay hờn dỗi nếu không được dắt đi chơi'],
    },
  },
  {
    index: 4,
    name: 'Nguyễn Ngọc Anh',
    username: 'ngocanh',
    phone: '0900000004',
    age: 36,
    occupation: 'MC & Biên tập viên',
    district: 'Cầu Giấy',
    neighborhood: 'Discovery Complex',
    bio: 'Người dẫn chương trình truyền hình. Thích lối sống thanh lịch, trà ngon và những góc ban công rực rỡ.',
    datingBio: 'Trân trọng những cuộc trò chuyện sâu sắc và sự chân thành. Thích cuối tuần cùng dắt Boss đi dạo.',
    avatarUrl: 'https://cdn.anninhthudo.vn/images/f374aa78c1b11b1649e3ce075c7cdd23d9c3839ff2d1052dbfc319fff218e072198dfaafc96c95043819b9923fdd41257bf79723727159044d411dbface5f303/ngoc-anh18389-1572-1565.jpg',
    pet: {
      name: 'Mochi',
      species: 'Chó',
      breed: 'Shiba Inu',
      weightKg: 10,
      ageLabel: '2 tuổi',
      gender: 'Cái',
      avatarUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80',
      bio: 'Nụ cười chuẩn Shiba Nhật Bản, hơi chảnh một chút nhưng cực kỳ quấn chủ khi đói.',
      goodHabits: ['Sạch sẽ như mèo, tự liếm lông gọn gàng', 'Biết tạo dáng chụp hình triệu like'],
      cautionHabits: ['Không thích bị người lạ chạm vào đuôi'],
    },
  },
  {
    index: 5,
    name: 'Phương Anh Đào',
    username: 'phuonganhdao',
    phone: '0900000005',
    age: 32,
    occupation: 'Diễn viên điện ảnh',
    district: 'Quận 7',
    neighborhood: 'Phú Mỹ Hưng Midtown',
    bio: 'Nữ chính các bộ phim điện ảnh Việt. Thích cuộc sống mộc mạc, gần gũi thiên nhiên và chăm sóc cún cưng.',
    datingBio: 'Một tâm hồn mộc mạc và chân thành. Thích những buổi đi dạo yên tĩnh dưới những tán cây xanh.',
    avatarUrl: 'https://vcdn1-giaitri.vnecdn.net/2022/10/09/-7783-1665297599.jpg?dpr=1&fit=crop&h=0&q=100&s=M1b9JNhtgRkcGfl1IkXKgA&w=1200',
    pet: {
      name: 'Bắp',
      species: 'Chó',
      breed: 'Pembroke Welsh Corgi',
      weightKg: 12,
      ageLabel: '1.5 tuổi',
      gender: 'Đực',
      avatarUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80',
      bio: 'Chân ngắn mông to hình trái tim, chạy lon ton trông cực kỳ đáng yêu và biết nịnh.',
      goodHabits: ['Mông trái tim cực kỳ ăn ảnh', 'Biết lăn qua lăn lại xin đồ ăn vặt'],
      cautionHabits: ['Hay sủa xe máy chạy nhanh', 'Chân ngắn nên ngại leo cầu thang cao'],
    },
  },
  {
    index: 6,
    name: 'Khả Ngân',
    username: 'khangan',
    phone: '0900000006',
    age: 27,
    occupation: 'Diễn viên truyền hình',
    district: 'Bình Thạnh',
    neighborhood: 'Sunwah Pearl',
    bio: 'Đam mê thể thao, boxing và diễn xuất. Bạn đồng hành thân thiết là bé Tuyết trắng muốt như mây.',
    datingBio: 'Yêu thích vận động và lối sống lành mạnh. Cần tìm một người bạn cùng dắt cún chạy bộ sáng sớm!',
    avatarUrl: 'https://vnmedia.vn/file/8a10a0d36ccebc89016ce0c6fa3e1b83/8a10a0d36d961641016da40adf3508e0/012022/1_20220107080323.jpg',
    pet: {
      name: 'Tuyết',
      species: 'Chó',
      breed: 'Samoyed',
      weightKg: 22,
      ageLabel: '2 tuổi',
      gender: 'Cái',
      avatarUrl: 'https://images.unsplash.com/photo-1529429617124-95b109e86bb8?auto=format&fit=crop&w=800&q=80',
      bio: 'Nàng bạch tuyết 4 chân luôn nở nụ cười thiên thần, lông dày êm ái như gối ôm.',
      goodHabits: ['Nụ cười thiên thần làm tan chảy mọi người', 'Rất thích được chải lông'],
      cautionHabits: ['Rụng lông theo mùa, cần hút bụi kỹ'],
    },
  },
  {
    index: 7,
    name: 'Đoàn Thiên Ân',
    username: 'thienan',
    phone: '0900000007',
    age: 24,
    occupation: 'Hoa hậu & Người mẫu',
    district: 'Quận 4',
    neighborhood: 'The GoldView',
    bio: 'Miss Grand Vietnam 2022. Thích đọc sách, nấu ăn tại nhà và cưng nựng chú cún nhỏ của mình.',
    datingBio: 'Trưởng thành, độc lập nhưng rất ấm áp. Hy vọng gặp được người cùng sở thích yêu thú cưng và du lịch.',
    avatarUrl: 'https://cdn-images.vtv.vn/2022/11/9/hoa-hau-doan-thien-an-3-16679986615861952589676.jpg',
    pet: {
      name: 'Gấu',
      species: 'Chó',
      breed: 'Pomeranian',
      weightKg: 2.8,
      ageLabel: '1 tuổi',
      gender: 'Đực',
      avatarUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=800&q=80',
      bio: 'Bé cưng tí hon như cục bông gòn di động, thích nhảy tưng tưng xin ăn vặt.',
      goodHabits: ['Nhỏ gọn dễ bế đi cà phê', 'Biết đi vệ sinh đúng khay thấm hút'],
      cautionHabits: ['Hơi nhát khi gặp chó to'],
    },
  },
  {
    index: 8,
    name: 'Kaity Nguyễn',
    username: 'kaitynguyen',
    phone: '0900000008',
    age: 25,
    occupation: 'Diễn viên điện ảnh & Nhà sản xuất',
    district: 'Quận 2',
    neighborhood: 'Masteri An Phú',
    bio: 'Điện ảnh và ẩm thực là đam mê lớn nhất. Cực kỳ thích những buổi dạo chơi ngoài trời cuối tuần.',
    datingBio: 'Vui vẻ, nhiều năng lượng tích cực. Thích cà phê ngoài trời và những chú cún tinh nghịch.',
    avatarUrl: 'https://sohanews.sohacdn.com/160588918557773824/2022/6/16/kaity-6-1628735569-719-width667height1000-16553154544011425348258.jpeg',
    pet: {
      name: 'Mít',
      species: 'Chó',
      breed: 'Beagle',
      weightKg: 11,
      ageLabel: '2 tuổi',
      gender: 'Đực',
      avatarUrl: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=800&q=80',
      bio: 'Đôi tai dài chấm đất, chiếc mũi thính vô địch, chuyên gia đi tìm thức ăn giấu kín.',
      goodHabits: ['Đánh hơi cực nhạy, thích trò trốn tìm', 'Rất tình cảm và quấn chủ'],
      cautionHabits: ['Hay hít hà mọi ngóc ngách, đi dạo phải dắt dây cẩn thận'],
    },
  },
  {
    index: 9,
    name: 'Hòa Minzy',
    username: 'hoaminzy',
    phone: '0900000009',
    age: 29,
    occupation: 'Ca sĩ',
    district: 'Nam Từ Liêm',
    neighborhood: 'Vinhomes Smart City',
    bio: 'Ca sĩ giọng hát ngọt ngào và tính cách lầy lội, tràn ngập tiếng cười mỗi ngày.',
    datingBio: 'Thích sự vui vẻ, mộc mạc và chân thành. Nếu bạn cũng thích nghe nhạc và nuôi cún thì match ngay nha!',
    avatarUrl: 'https://media.phunutoday.vn/files/news/2025/10/10/hoa-minzy-cung-ba-con-chong-lu-trong-dem-172004.jpg',
    pet: {
      name: 'Xúc Xích',
      species: 'Chó',
      breed: 'Dachshund',
      weightKg: 6.5,
      ageLabel: '2 tuổi',
      gender: 'Cái',
      avatarUrl: 'https://images.unsplash.com/photo-1612195583950-b8fd34c87093?auto=format&fit=crop&w=800&q=80',
      bio: 'Lưng dài chân ngắn, lon ton chạy trước đón chủ về mỗi khi đi diễn xong.',
      goodHabits: ['Lon ton đón chủ siêu mừng', 'Thích chui vào chăn ấm ngủ cùng'],
      cautionHabits: ['Cần chú ý xương sống, không cho nhảy từ trên ghế cao xuống'],
    },
  },
  {
    index: 10,
    name: 'Ninh Dương Lan Ngọc',
    username: 'lanngoc',
    phone: '0900000010',
    age: 34,
    occupation: 'Diễn viên điện ảnh',
    district: 'Quận 2',
    neighborhood: 'Đảo Kim Cương',
    bio: 'Ngọc nữ màn ảnh Việt. Thích tận hưởng không gian nghỉ dưỡng tại gia bên chú cún cưng lanh lợi.',
    datingBio: 'Thích sự tự do, vui vẻ và nụ cười rạng rỡ. Tìm người bạn cùng dắt cún đi ngắm hoàng hôn bờ sông.',
    avatarUrl: 'https://img.tripi.vn/cdn-cgi/image/width=700,height=700/https://gcs.tripi.vn/public-tripi/tripi-feed/img/473753yZf/ninh-duong-lan-ngoc-866233.jpg',
    pet: {
      name: 'Lucky',
      species: 'Chó',
      breed: 'Border Collie',
      weightKg: 18,
      ageLabel: '2 tuổi',
      gender: 'Đực',
      avatarUrl: 'https://images.unsplash.com/photo-1503256207526-0d5d80fa2f47?auto=format&fit=crop&w=800&q=80',
      bio: 'Giống chó thông minh nhất thế giới, biết bắt đĩa bay cực đỉnh và rất nghe lời.',
      goodHabits: ['Bắt đĩa bay 10/10 chính xác', 'Biết thu dọn đồ chơi vào giỏ', 'Nghe hiệu lệnh cực nhạy'],
      cautionHabits: ['Rất nhiều năng lượng, cần vận động ít nhất 1 tiếng mỗi ngày'],
    },
  },
  {
    index: 11,
    name: 'Huỳnh Thị Thanh Thủy',
    username: 'thanhthuy',
    phone: '0900000011',
    age: 22,
    occupation: 'Hoa hậu Quốc tế 2024',
    district: 'Ba Đình',
    neighborhood: 'Vinhomes Metropolis Liễu Giai',
    bio: 'Miss International 2024. Yêu chuộng lối sống năng động, các hoạt động bảo vệ động vật và môi trường.',
    datingBio: 'Dịu dàng, ham học hỏi và trân trọng những giá trị bình dị. Thích dạo phố Hà Nội mùa thu cùng Boss.',
    avatarUrl: 'https://media.vov.vn/sites/default/files/styles/large/public/2025-06/z6714776219419_b60a2aea9e7e72f39ec3172c4a0afb1e.jpg',
    pet: {
      name: 'Rex',
      species: 'Chó',
      breed: 'German Shepherd',
      weightKg: 32,
      ageLabel: '3 tuổi',
      gender: 'Đực',
      avatarUrl: 'https://images.unsplash.com/photo-1568572933382-74d440642117?auto=format&fit=crop&w=800&q=80',
      bio: 'Vệ sĩ 4 chân dũng cảm, trung thành tuyệt đối và cực kỳ nhã nhặn với trẻ em.',
      goodHabits: ['Bảo vệ chủ tuyệt đối', 'Đi dạo luôn giữ khoảng cách an toàn', 'Biết canh nhà chuẩn mực'],
      cautionHabits: ['Khuôn mặt hơi nghiêm nghị làm người lạ e dè'],
    },
  },
  {
    index: 12,
    name: 'Jun Vũ',
    username: 'junvu',
    phone: '0900000012',
    age: 29,
    occupation: 'Diễn viên & Người mẫu',
    district: 'Quận 7',
    neighborhood: 'Sunrise City',
    bio: 'Người đẹp yêu thích phong cách tối giản, gaming và dạo chơi công viên bờ hồ cùng chú cún đốm.',
    datingBio: 'Thích chơi game, nghe podcast và dắt cún đi cà phê cuối tuần. Tìm bạn đồng hành hài hước và tinh tế.',
    avatarUrl: 'https://thanhnien.mediacdn.vn/Uploaded/thuyttl/2021_06_21/junvu/2_jun-vu_TBHT.jpg',
    pet: {
      name: 'Đốm',
      species: 'Chó',
      breed: 'Dalmatian',
      weightKg: 23,
      ageLabel: '2 tuổi',
      gender: 'Đực',
      avatarUrl: 'https://images.unsplash.com/photo-1517423440428-a5a00ad493e8?auto=format&fit=crop&w=800&q=80',
      bio: 'Những chấm đốm đen huyền thoại trên nền lông trắng, cực kỳ dẻo dai và thích chạy việt dã.',
      goodHabits: ['Sức bền cao, chạy bộ cùng chủ mỗi sáng', 'Lông ngắn sạch sẽ dễ chăm sóc'],
      cautionHabits: ['Thích đuổi bồ câu trong công viên'],
    },
  },
  {
    index: 13,
    name: 'Mỹ Tâm',
    username: 'mytam',
    phone: '0900000013',
    age: 43,
    occupation: 'Ca sĩ & Nhạc sĩ',
    district: 'Quận 3',
    neighborhood: 'Biệt thự Nam Kỳ Khởi Nghĩa',
    bio: 'Họa mi tóc nâu. Yêu âm nhạc thuần khiết, những chú cún to lớn khỏe khoắn và những buổi tập đàn tại gia.',
    datingBio: 'Hẹn ước từ hư vô. Thích sự chân thành, giản dị và không màu mè. Trân trọng những buổi chiều bình yên.',
    avatarUrl: 'https://kenh14cdn.com/203336854389633024/2025/12/1/5924058321373265317513415359194965278910225n-210148-1764598141925-1764598142586785513113.jpg',
    pet: {
      name: 'Bruno',
      species: 'Chó',
      breed: 'Boxer',
      weightKg: 29,
      ageLabel: '4 tuổi',
      gender: 'Đực',
      avatarUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80',
      bio: 'Trông ngầu nhưng tính cách như trẻ con, bảo vệ chủ tuyệt vời và rất hiếu động.',
      goodHabits: ['Điềm tĩnh và dũng cảm', 'Biết ngồi im lắng nghe chủ hát'],
      cautionHabits: ['Thích gặm đồ chơi cao su kêu chít chít'],
    },
  },
  {
    index: 14,
    name: 'Bích Phương',
    username: 'bichphuong',
    phone: '0900000014',
    age: 35,
    occupation: 'Ca sĩ',
    district: 'Tây Hồ',
    neighborhood: 'Quảng An - Hồ Tây',
    bio: 'Bà hoàng bắt trend. Thích ở nhà cày phim, ăn ngon và chơi đùa với chú cún Poodle xù xì đáng yêu.',
    datingBio: 'Hướng nội bán phần, thích ở nhà hơn ra ngoài nhưng nếu dắt cún đi cà phê thì luôn sẵn sàng!',
    avatarUrl: 'https://m.media-amazon.com/images/M/MV5BN2Y5MmExM2MtOGEyMi00MmFjLTg4YWUtZjI1YTNjOTdkYWZkXkEyXkFqcGc@._V1_.jpg',
    pet: {
      name: 'Kem',
      species: 'Chó',
      breed: 'Toy Poodle',
      weightKg: 3.5,
      ageLabel: '2 tuổi',
      gender: 'Cái',
      avatarUrl: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80',
      bio: 'Lông xoăn tít màu kem ngọt ngào, điệu đà thích mặc áo đẹp mỗi khi xuống phố.',
      goodHabits: ['Thông minh lanh lợi, học trò xiếc rất nhanh', 'Không rụng lông, rất sạch sẽ'],
      cautionHabits: ['Thích làm nũng đòi bế suốt ngày'],
    },
  },
  {
    index: 15,
    name: 'Hồ Ngọc Hà',
    username: 'hongocha',
    phone: '0900000015',
    age: 40,
    occupation: 'Ca sĩ & Doanh nhân',
    district: 'Thành phố Thủ Đức',
    neighborhood: 'Thảo Điền Villa',
    bio: 'Nữ hoàng giải trí. Đam mê yoga, thời trang cao cấp và gia đình ấm áp bên các Boss cưng.',
    datingBio: 'Tự tin, thanh lịch và viên mãn. Yêu lối sống healthy, thể thao và thiên nhiên xanh mát.',
    avatarUrl: 'https://ss-images.saostar.vn/wp700/2024/9/30/pc/1727661417008/wrijokefpd1-5ja78cg1uu2-vsz5pobfjo3.jpg',
    pet: {
      name: 'Bơ',
      species: 'Chó',
      breed: 'French Bulldog',
      weightKg: 12,
      ageLabel: '2 tuổi',
      gender: 'Đực',
      avatarUrl: 'https://images.unsplash.com/photo-1583511655826-05700d52f4d9?auto=format&fit=crop&w=800&q=80',
      bio: 'Mặt xệ tai dơi siêu ngầu, dáng đi bệ vệ hài hước và rất thích nằm ngủ ngáy pho pho dưới chân chủ.',
      goodHabits: ['Rất thân thiện và hài hước', 'Biết tự nằm cạnh thảm yoga khi chủ tập'],
      cautionHabits: ['Thở hơi khò khè khi trời nóng, thích nằm phòng máy lạnh'],
    },
  },
];

// ==========================================
// 2. CONFIG: 15 NAM NGHỆ SĨ & 15 BÉ MÈO
// ==========================================
const MALE_CELEBRITIES = [
  {
    index: 16,
    name: 'HIEUTHUHAI',
    username: 'hieuthuhai',
    phone: '0900000016',
    age: 25,
    occupation: 'Rapper & Ca sĩ',
    district: 'Bình Thạnh',
    neighborhood: 'Vinhomes Central Park',
    bio: 'Ngủ Một Mình nhưng nuôi một em mèo mập. Thích làm nhạc đêm và ngắm Boss ngủ say trên bàn phím.',
    datingBio: 'Hướng nội nhưng lên sân khấu cháy hết mình. Tìm một bạn cùng nuôi mèo và có gu âm nhạc xịn sò!',
    avatarUrl: 'https://cdn.24h.com.vn/upload/2-2026/images/2026-04-30/hieuthuhai-2-1777539695-750-width1366height1366.jpg',
    pet: {
      name: 'Bánh Bao',
      species: 'Mèo',
      breed: 'British Shorthair',
      weightKg: 5.5,
      ageLabel: '2 tuổi',
      gender: 'Đực',
      avatarUrl: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=800&q=80',
      bio: 'Má bánh bao nọng phúng phính, tròn quay lười biếng, cả ngày chỉ nằm ngủ và ăn pate.',
      goodHabits: ['Hiền lành như cục bột, ai bế cũng được', 'Đi vệ sinh đúng chậu cát'],
      cautionHabits: ['Lười vận động, thích nằm bẹp một góc'],
    },
  },
  {
    index: 17,
    name: 'Quốc Anh',
    username: 'quocanh',
    phone: '0900000017',
    age: 26,
    occupation: 'Diễn viên & Người mẫu',
    district: 'Quận 1',
    neighborhood: 'Vinhomes Golden River Ba Son',
    bio: 'Chiều cao 1m86, đam mê gym, bóng rổ và nuôi chú mèo khổng lồ Maine Coon quý phái.',
    datingBio: 'Thể thao, chân thành và thích chăm sóc người khác. Tìm bạn cùng dạo phố đêm Sài Gòn.',
    avatarUrl: 'https://bna.1cdn.vn/2023/12/06/uploaded-dinhnguyetbna-2023_12_06-_qanh5-5444.jpg',
    pet: {
      name: 'Leo',
      species: 'Mèo',
      breed: 'Maine Coon',
      weightKg: 8.5,
      ageLabel: '3 tuổi',
      gender: 'Đực',
      avatarUrl: 'https://images.unsplash.com/photo-1533738363-b7f9aef128ce?auto=format&fit=crop&w=800&q=80',
      bio: 'Chú mèo sư tử khổng lồ với bờm cổ uy nghiêm nhưng tính cách ngọt ngào như một chú cún con.',
      goodHabits: ['Khổng lồ nhưng tính cực kỳ dịu dàng', 'Thích uống nước chảy từ vòi'],
      cautionHabits: ['Bộ lông dài cần chải mỗi ngày'],
    },
  },
  {
    index: 18,
    name: 'SOOBIN',
    username: 'soobin',
    phone: '0900000018',
    age: 32,
    occupation: 'Ca sĩ & Nhà sản xuất',
    district: 'Quận 2',
    neighborhood: 'The River Thủ Thiêm',
    bio: 'Hoàng tử RnB. Âm nhạc là hơi thở, thời trang là cảm hứng và hoàng thượng là người sếp khó tính nhất.',
    datingBio: 'Lãng mạn, tinh tế và trân trọng sự đồng điệu trong tâm hồn. Cùng đi nghe acoustic và vuốt ve mèo cưng nhé.',
    avatarUrl: 'https://salt.tkbcdn.com/ts/ds/d5/9c/de/48694235e2f7a41416f99e22aed75592.png',
    pet: {
      name: 'Ú',
      species: 'Mèo',
      breed: 'Scottish Fold',
      weightKg: 4.8,
      ageLabel: '2 tuổi',
      gender: 'Đực',
      avatarUrl: 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?auto=format&fit=crop&w=800&q=80',
      bio: 'Đôi tai cụp sát đầu ngơ ngác, đôi mắt tròn xoe màu hổ phách luôn đòi ôm ấp.',
      goodHabits: ['Tai cụp ngộ nghĩnh, thích ngồi kiểu tượng Phật', 'Rất thích được gãi cằm'],
      cautionHabits: ['Sợ tiếng máy hút bụi'],
    },
  },
  {
    index: 19,
    name: 'Đức Phúc',
    username: 'ducphuc',
    phone: '0900000019',
    age: 28,
    occupation: 'Ca sĩ',
    district: 'Nam Từ Liêm',
    neighborhood: 'The Manor Hà Nội',
    bio: 'Quán quân Giọng hát Việt. Yêu đời, tích cực, thích làm video vui nhộn bên hoàng thượng lông xám sang chảnh.',
    datingBio: 'Vui tính, ngọt ngào và biết nấu ăn. Hát ru mỗi tối cho người thương và các bé mèo nghe!',
    avatarUrl: 'https://media.yeah1.com/files/tothucvy/2023/02/17/329946239_536270585153864_3601637052651530992_n-152752.jpg',
    pet: {
      name: 'Khói',
      species: 'Mèo',
      breed: 'Russian Blue',
      weightKg: 4.2,
      ageLabel: '2 tuổi',
      gender: 'Đực',
      avatarUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
      bio: 'Bộ lông màu xám bạc ánh kim cực sang, đôi mắt xanh lục biếc kiêu kỳ và rất quấn chủ.',
      goodHabits: ['Lông xám bạc óng ánh, bước đi êm ru', 'Cực kỳ gắn bó và quấn quýt chủ'],
      cautionHabits: ['Ban đầu hơi dè chừng người lạ'],
    },
  },
  {
    index: 20,
    name: 'Song Luân',
    username: 'songluan',
    phone: '0900000020',
    age: 33,
    occupation: 'Diễn viên & Ca sĩ',
    district: 'Quận 4',
    neighborhood: 'Saigon Royal',
    bio: 'Diễn viên Hậu Duệ Mặt Trời. Thích tập gym thể thao và chăm sóc chú mèo rừng lông dày Bắc Âu.',
    datingBio: 'Ấm áp, hài hước, mẫu bạn trai ga lăng tiêu chuẩn. "Bạn gái sẽ được giữ hết lương, chỉ cần phát tiền ăn sáng"!',
    avatarUrl: 'https://media.yeah1.com/files/thientruc/2022/08/19/song-luan-ban-gai-se-duoc-giu-het-luong-chi-can-phat-toi-tien-an-sang-212415.jpg',
    pet: {
      name: 'Mây',
      species: 'Mèo',
      breed: 'Norwegian Forest Cat',
      weightKg: 6.8,
      ageLabel: '3 tuổi',
      gender: 'Đực',
      avatarUrl: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?auto=format&fit=crop&w=800&q=80',
      bio: 'Lông bờm rậm rạp như tuyết mùa đông, thích leo trèo lên nóc tủ và ngồi canh chủ tập gym.',
      goodHabits: ['Leo trèo cực giỏi, cơ bắp săn chắc', 'Rất kiên nhẫn khi chơi với trẻ nhỏ'],
      cautionHabits: ['Thích ngắm chim ngoài ban công, cần rào lưới an toàn'],
    },
  },
  {
    index: 21,
    name: 'Isaac',
    username: 'isaac',
    phone: '0900000021',
    age: 36,
    occupation: 'Ca sĩ & Diễn viên',
    district: 'Quận 7',
    neighborhood: 'Sky Garden Phú Mỹ Hưng',
    bio: 'Quý ông lịch lãm của showbiz. Tỉ mỉ, chỉn chu trong mọi việc và là một "con sen" cuồng mèo Ba Tư chính hiệu.',
    datingBio: 'Lịch thiệp, trưởng thành và ấm áp. Thích chuẩn bị bữa tối ấm cúng tại nhà với tiếng nhạc Jazz du dương.',
    avatarUrl: 'https://1.bp.blogspot.com/-45khMTVoUoQ/W6ILwGvVtvI/AAAAAAAE_hw/-i3ZjxJApIkDUmTIizZ-eXJXnnOvhc-9ACEwYBhgL/s1600/isaaclion_17663416_1210607375703613_6862467667165446144_n.jpg',
    pet: {
      name: 'Bông Gòn',
      species: 'Mèo',
      breed: 'Persian',
      weightKg: 4.5,
      ageLabel: '2.5 tuổi',
      gender: 'Cái',
      avatarUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
      bio: 'Mặt tịt quý phái, lông trắng mượt như nhung, tính tình dịu dàng thích nằm trong lòng sưởi ấm.',
      goodHabits: ['Trầm tính quý phái, thích nằm trong lòng chủ', 'Ăn uống từ tốn nhẹ nhàng'],
      cautionHabits: ['Cần vệ sinh khóe mắt hàng ngày'],
    },
  },
  {
    index: 22,
    name: 'Sơn Tùng M-TP',
    username: 'sontung',
    phone: '0900000022',
    age: 30,
    occupation: 'Ca sĩ & Chủ tịch M-TP Ent',
    district: 'Quận 7',
    neighborhood: 'Phú Mỹ Hưng Ven Sông',
    bio: 'Nghệ sĩ tiên phong nhạc trẻ Việt. Thích sáng tác trong đêm yên tĩnh bên chú mèo Bengal hoang dã dũng mãnh.',
    datingBio: 'Nơi này có anh. Sống đam mê, bí ẩn và hết mình vì tình yêu đích thực. Match để trò chuyện về nghệ thuật nhé.',
    avatarUrl: 'https://danviet.ex-cdn.com/files/f1/296231569849192448/2024/6/13/son-tung-mtp-17182382517241228747767.jpg',
    pet: {
      name: 'Báo',
      species: 'Mèo',
      breed: 'Bengal',
      weightKg: 6.2,
      ageLabel: '2 tuổi',
      gender: 'Đực',
      avatarUrl: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=800&q=80',
      bio: 'Hoa văn da báo gấm cực kỳ dũng mãnh, nhảy cao phi thường và thích chơi trò nhặt bóng nước.',
      goodHabits: ['Hoa văn da báo siêu đẹp, nhảy bật cao 2m', 'Rất thích chơi với nước'],
      cautionHabits: ['Nhiều năng lượng, thích chạy đuổi đồ chơi lúc nửa đêm'],
    },
  },
  {
    index: 23,
    name: 'JSOL',
    username: 'jsol',
    phone: '0900000023',
    age: 27,
    occupation: 'Ca sĩ & Content Creator',
    district: 'Đống Đa',
    neighborhood: 'Vinhomes Nguyễn Chí Thanh',
    bio: 'Chàng ca sĩ điển trai với nụ cười tỏa nắng. Yêu thích quay clip vui bên mèo Xiêm mắt xanh.',
    datingBio: 'Trẻ trung, đáng yêu và hay tạo bất ngờ lãng mạn. Thích cùng bạn đi cà phê thú cưng mỗi chiều thứ Bảy!',
    avatarUrl: 'https://vanhoathoidai.vn/uploads/images/2025/04/18/anh-jsol-001-1744979318.jpg',
    pet: {
      name: 'Sữa',
      species: 'Mèo',
      breed: 'Siamese',
      weightKg: 3.8,
      ageLabel: '1.5 tuổi',
      gender: 'Cái',
      avatarUrl: 'https://images.unsplash.com/photo-1561948955-570b270e7c36?auto=format&fit=crop&w=800&q=80',
      bio: 'Khuôn mặt vệt xám đen trứ danh, giọng kêu "meo meo" lanh lảnh và cực kỳ thích trò chuyện với chủ.',
      goodHabits: ['Kêu tiếng meo meo nũng nịu siêu dễ thương', 'Thích giao tiếp trò chuyện'],
      cautionHabits: ['Hay ghen tị nếu chủ vuốt ve mèo khác'],
    },
  },
  {
    index: 24,
    name: 'B Trần',
    username: 'btran',
    phone: '0900000024',
    age: 34,
    occupation: 'Diễn viên điện ảnh',
    district: 'Hai Bà Trưng',
    neighborhood: 'Times City',
    bio: 'Diễn viên điển trai Hà Thành. Thích phong cách vintage, xe cổ và chú mèo Angora trắng muốt kiêu kỳ.',
    datingBio: 'Điềm đạm, ấm áp, thích lắng nghe. Hy vọng gặp được người cùng sở thích điện ảnh và yêu thương thú cưng.',
    avatarUrl: 'https://1.vikiplatform.com/pr/24248pr/d77373db42.jpg?x=b',
    pet: {
      name: 'Trắng',
      species: 'Mèo',
      breed: 'Turkish Angora',
      weightKg: 4.0,
      ageLabel: '2 tuổi',
      gender: 'Cái',
      avatarUrl: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=800&q=80',
      bio: 'Nữ hoàng lông tuyết kiêu sa, bước đi uyển chuyển như vũ công và có cặp mắt lấp lánh như ngọc.',
      goodHabits: ['Bước đi uyển chuyển nhẹ nhàng', 'Thông minh và thích quan sát xung quanh'],
      cautionHabits: ['Hơi kén chọn hạt ăn'],
    },
  },
  {
    index: 25,
    name: 'Bình An',
    username: 'binhan',
    phone: '0900000025',
    age: 31,
    occupation: 'Diễn viên truyền hình VTV',
    district: 'Cầu Giấy',
    neighborhood: 'Indochina Plaza',
    bio: 'Diễn viên đắt show phim giờ vàng. Yêu thích cuộc sống bình dị, thể thao ngoài trời và chú mèo chân ngắn Munchkin.',
    datingBio: 'Chân thật, tình cảm, thích tạo niềm vui cho mọi người xung quanh. Cùng dạo phố hoàng hôn nhé!',
    avatarUrl: 'https://phunuvietnam.mediacdn.vn/thumb_w/700/179072216278405120/2022/8/11/binh-an-1660190289986711137266-21-0-471-720-crop-1660190302475641587782.jpg',
    pet: {
      name: 'Chân Ngắn',
      species: 'Mèo',
      breed: 'Munchkin',
      weightKg: 3.2,
      ageLabel: '1.5 tuổi',
      gender: 'Đực',
      avatarUrl: 'https://images.unsplash.com/photo-1592194996308-7b43878e84a6?auto=format&fit=crop&w=800&q=80',
      bio: 'Bốn chân ngắn cũn cỡn chạy lúp xúp dưới sàn, thích đứng bằng hai chân sau như chồn đất.',
      goodHabits: ['Đứng bằng 2 chân sau xin đồ ăn cực đỉnh', 'Chạy lon ton vui mắt'],
      cautionHabits: ['Chân ngắn nên không nhảy lên bàn cao được'],
    },
  },
  {
    index: 26,
    name: 'Dương Domic',
    username: 'duongdomic',
    phone: '0900000026',
    age: 24,
    occupation: 'Ca sĩ & Nhạc sĩ Gen Z',
    district: 'Tây Hồ',
    neighborhood: 'Sun Grand City Thụy Khuê',
    bio: 'Nghệ sĩ Gen Z cá tính, làm nhạc với tinh thần phóng khoáng và nuôi chú mèo Sphynx không lông siêu độc lạ.',
    datingBio: 'Năng động, thích những trải nghiệm mới mẻ và âm nhạc đột phá. Match nếu bạn cũng là người thích sự khác biệt!',
    avatarUrl: 'https://images2.thanhnien.vn/zoom/686_429/528068263637045248/2024/7/1/duong-domic-2-1719824385622873310447-283-0-1883-2560-crop-17198247511321047651214.jpg',
    pet: {
      name: 'Yoda',
      species: 'Mèo',
      breed: 'Sphynx',
      weightKg: 3.6,
      ageLabel: '2 tuổi',
      gender: 'Đực',
      avatarUrl: 'https://images.unsplash.com/photo-1520315342629-6ea920342047?auto=format&fit=crop&w=800&q=80',
      bio: 'Làn da ấm áp nhẵn thui độc nhất vô nhị, cực kỳ thông minh, tình cảm và thích rúc vào áo chủ ngủ.',
      goodHabits: ['Không rụng một sợi lông nào, người luôn ấm áp', 'Siêu tình cảm thích ôm cổ chủ'],
      cautionHabits: ['Cần mặc áo giữ ấm khi trời lạnh và lau da định kỳ'],
    },
  },
  {
    index: 27,
    name: 'RHYDER',
    username: 'rhyder',
    phone: '0900000027',
    age: 23,
    occupation: 'Rapper & Ca sĩ',
    district: 'Thanh Xuân',
    neighborhood: 'Royal City',
    bio: 'Quán quân The Voice Kids & Á quân Rap Việt. Đam mê hiphop, beatmaking và chú mèo tuyết Siberian dũng mãnh.',
    datingBio: 'Chill, chân chất và giàu năng lượng tích cực. Thích những buổi đi dạo bờ hồ đêm hóng gió và tâm sự.',
    avatarUrl: 'https://cdn2.tuoitre.vn/471584752817336320/2024/10/29/rhyder2-17301922182021668053558.jpg',
    pet: {
      name: 'Bắc',
      species: 'Mèo',
      breed: 'Siberian',
      weightKg: 6.0,
      ageLabel: '2 tuổi',
      gender: 'Đực',
      avatarUrl: 'https://images.unsplash.com/photo-1548802673-380ab8ebc7b7?auto=format&fit=crop&w=800&q=80',
      bio: 'Xuất xứ từ xứ lạnh Siberia, bộ lông 3 lớp siêu dày không gây dị ứng, cực kỳ mạnh mẽ và can đảm.',
      goodHabits: ['Lông không gây dị ứng cho người nhạy cảm', 'Rất dũng cảm và dẻo dai'],
      cautionHabits: ['Lông dày cần máy lạnh vào mùa hè oi bức'],
    },
  },
  {
    index: 28,
    name: 'MONO',
    username: 'mono',
    phone: '0900000028',
    age: 24,
    occupation: 'Ca sĩ trình diễn',
    district: 'Bình Thạnh',
    neighborhood: 'Opal Riverside',
    bio: 'Waiting For You. Thích vũ đạo, rèn luyện thể lực mỗi ngày và chăm sóc chú mèo Mỹ lông ngắn lanh lợi.',
    datingBio: 'Trẻ trung, nhiệt huyết và chân thành. Thích những buổi cà phê ngoài trời ngắm hoàng hôn cùng Boss.',
    avatarUrl: 'https://duan24h.net/wp-content/uploads/2023/12/mono-3.webp',
    pet: {
      name: 'Miu',
      species: 'Mèo',
      breed: 'American Shorthair',
      weightKg: 4.6,
      ageLabel: '1.5 tuổi',
      gender: 'Cái',
      avatarUrl: 'https://images.unsplash.com/photo-1548247416-ec66f4900b2e?auto=format&fit=crop&w=800&q=80',
      bio: 'Vân vằn hổ xám khỏe khoắn, tính tình hiền lành, rất thích chơi cần câu mèo và bắt chuột giả.',
      goodHabits: ['Săn mồi siêu nhanh, phản xạ cực nhạy', 'Rất ngoan ngoãn và nghe lời'],
      cautionHabits: ['Thích cào vào trụ cào móng'],
    },
  },
  {
    index: 29,
    name: 'Quang Hùng MasterD',
    username: 'quanghung',
    phone: '0900000029',
    age: 27,
    occupation: 'Ca sĩ & Nhạc sĩ',
    district: 'Quận 1',
    neighborhood: 'The Grand Manhattan',
    bio: 'Dễ Đến Dễ Đi. Thích sáng tác nhạc catchy và cưng chiều cô bé mèo Ragdoll mắt xanh biển biếc.',
    datingBio: 'Ngọt ngào, hay cười và luôn biết cách chăm sóc đối phương. Thích cùng bạn đi dạo phố ngắm hoa.',
    avatarUrl: 'https://sohanews.sohacdn.com/zoom/700_438/160588918557773824/2024/12/27/1-qh-cover-1735193787654868003471-17352826023382105475257.jpg',
    pet: {
      name: 'Nơ',
      species: 'Mèo',
      breed: 'Ragdoll',
      weightKg: 5.2,
      ageLabel: '2 tuổi',
      gender: 'Cái',
      avatarUrl: 'https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&w=800&q=80',
      bio: 'Búp bê lông mềm, khi bế lên người thì nhũn ra như bông gòn, mắt xanh sapphire hút hồn.',
      goodHabits: ['Mắt xanh sapphire tuyệt đẹp, tính tình búp bê nhũn như bông', 'Không bao giờ cào cấu'],
      cautionHabits: ['Cần được chải lông hàng tuần'],
    },
  },
  {
    index: 30,
    name: 'Anh Tú Atus',
    username: 'anhtuatus',
    phone: '0900000030',
    age: 31,
    occupation: 'Diễn viên điện ảnh & Ca sĩ',
    district: 'Quận 2',
    neighborhood: 'Gateway Thảo Điền',
    bio: 'Sao Nam Hài Hước Nhất. Thích thời trang cá tính, chụp ảnh film và chú mèo Abyssinian nhanh nhẹn.',
    datingBio: 'Hài hước, tự tin, luôn đem lại tiếng cười bất tận. Cần tìm đồng đội đi cà phê sống ảo và dắt Boss vi vu.',
    avatarUrl: 'https://vnmedia.vn/file/8a10a0d36ccebc89016ce0c6fa3e1b83/012023/1_20230107170046.jpg',
    pet: {
      name: 'Hạt Dẻ',
      species: 'Mèo',
      breed: 'Abyssinian',
      weightKg: 3.9,
      ageLabel: '2 tuổi',
      gender: 'Đực',
      avatarUrl: 'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?auto=format&fit=crop&w=800&q=80',
      bio: 'Bộ lông óng ánh màu hổ phách như linh miêu Ai Cập cổ đại, di chuyển thoăn thoắt và rất tò mò.',
      goodHabits: ['Dáng vóc linh miêu cổ đại, cực kỳ nhanh nhẹn', 'Thích quan sát mọi việc trong nhà'],
      cautionHabits: ['Tò mò mọi thứ mới lạ, thích nhảy lên các kệ cao'],
    },
  },
];

export async function seedDatabase() {
  console.log('[Seed] Bắt đầu dọn dẹp toàn bộ dữ liệu cũ trong PostgreSQL...');

  // Dọn dẹp theo thứ tự khóa ngoại an toàn 100%
  await prisma.petSightingMatch.deleteMany();
  await prisma.sightingTrajectory.deleteMany();
  await prisma.sosAlert.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.match.deleteMany();
  await prisma.notification.deleteMany();
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

  console.log('[Seed] Đã dọn dẹp sạch sẽ. Bắt đầu khởi tạo 30 nghệ sĩ (15 nữ + 15 nam) và 30 thú cưng (15 cún + 15 mèo)...');

  const allConfigs = [...FEMALE_CELEBRITIES, ...MALE_CELEBRITIES];

  for (const config of allConfigs) {
    const userId = `user-test${config.index}`;
    const householdId = `household-test${config.index}`;
    const petId = `pet-test${config.index}-1`;

    // 1. Tạo User
    const user = await prisma.user.create({
      data: {
        id: userId,
        username: config.username,
        password: bcrypt.hashSync('123456', 10),
        phone: config.phone,
        displayName: config.name,
        avatarUrl: config.avatarUrl,
        bio: config.bio,
        district: config.district,
        neighborhood: config.neighborhood,
        isVip: config.index <= 5, // Top 5 là VIP
        role: 'user',
        status: 'active',
        showLocation: true,
        showPhone: false,
        allowMessages: 'circle_and_matches',
      },
    });

    // 2. Tạo Household
    const household = await prisma.household.create({
      data: {
        id: householdId,
        name: `Nhà của ${config.name}`,
        ownerId: user.id,
      },
    });

    // 3. Tạo Pet (chính xác tên, giống loài, và ảnh từ yêu cầu)
    const petCfg = config.pet;
    const petAgeYears = parseFloat(petCfg.ageLabel) || 2;
    const petDob = new Date(Date.now() - Math.round(petAgeYears * 365.25 * 86400000));
    const petBirthDateStr = petDob.toLocaleDateString('vi-VN');

    const createdPet = await prisma.pet.create({
      data: {
        id: petId,
        name: petCfg.name,
        species: petCfg.species,
        breed: petCfg.breed,
        gender: petCfg.gender,
        dateOfBirth: petDob,
        householdId: household.id,
        ownerId: user.id,
        avatarUrl: petCfg.avatarUrl,
        coverPhotoUrl: petCfg.avatarUrl,
        weightKg: petCfg.weightKg,
        isNeutered: true,
        vaccinationStatus: 'verified',
        isPublic: true,
        medicalNotes: petCfg.bio,
        followerCount: Math.floor(Math.random() * 200) + 50,
      },
    });

    // 4. Tạo Sổ Sức Khỏe CareRecord (pet_profile_meta)
    await prisma.careRecord.create({
      data: {
        petId: createdPet.id,
        recordType: 'pet_profile_meta',
        recordedBy: user.id,
        title: 'Hồ sơ sức khỏe',
        dataJson: {
          bio: petCfg.bio,
          ageLabel: petCfg.ageLabel,
          birthDate: petBirthDateStr,
          weightKg: petCfg.weightKg,
          weightLabel: `${petCfg.weightKg} kg`,
          galleryUrls: [petCfg.avatarUrl],
          likesCount: Math.floor(Math.random() * 100) + 20,
          isVaccinatedAndRabies: true,
          favoriteFood: petCfg.species === 'Chó' ? 'Hạt Orijen & Ức gà xé luộc' : 'Pate Royal Canin & Cá hồi tươi',
          dewormingHistory: 'Tẩy giun định kỳ 3 tháng/lần',
          medicalHistory: 'Khỏe mạnh 100%, không dị ứng, thể lực dẻo dai',
          vaccineRecords: [
            {
              id: `vac-${createdPet.id}-1`,
              vaccineName: petCfg.species === 'Chó' ? 'Phòng dại & 7 bệnh cơ bản' : 'Phòng dại & 4 bệnh cơ bản cho mèo',
              doseLabel: 'Mũi 2',
              clinicName: 'Bệnh viện Thú Y Pawty Care Quốc Tế',
              dateGiven: '15/10/2025',
            },
          ],
          goodHabits: petCfg.goodHabits,
          cautionHabits: petCfg.cautionHabits,
        },
      },
    });

    // 5. Tạo Hồ Sơ Hẹn Hò TinderSetup trong analyticsEvent (user_profile_meta)
    const personalPhotos = [config.avatarUrl];
    await prisma.analyticsEvent.create({
      data: {
        userId: user.id,
        eventType: 'user_profile_meta',
        eventData: {
          age: config.age,
          gender: config.index <= 15 ? 'Nữ' : 'Nam',
          occupation: config.occupation,
          tinderSetup: {
            displayName: config.name,
            age: config.age,
            gender: config.index <= 15 ? 'Nữ' : 'Nam',
            intent: config.index % 2 === 0 ? 'playdate' : 'dating',
            lookingFor: config.index <= 15 ? 'Cùng dắt cún cưng đi dạo mát' : 'Cùng cà phê và chia sẻ chuyện nuôi mèo',
            bio: config.datingBio,
            photos: personalPhotos,
            photoUrls: personalPhotos,
            datingPetId: createdPet.id,
            smoking: 'Không hút thuốc',
            workout: 'Tập gym & chạy bộ đều đặn',
            drinking: 'Thỉnh thoảng giao lưu tiệc nhẹ',
            zodiac: config.index <= 15 ? 'Song Tử' : 'Thiên Bình',
            chatStyle: 'Thân thiện, tích cực, phản hồi nhanh',
          },
        },
      },
    });
  }

  // 3. TẠO BÀI VIẾT MXH KHÁM PHÁ (POSTS)
  // ==========================================
  console.log('[Seed] Khởi tạo các bài viết cộng đồng sinh động...');

  // Bài 1: Chi Pu
  const postChiPu = await prisma.post.create({
    data: {
      id: 'post-seed-chipu',
      authorId: 'user-test1',
      contentType: 'image',
      textContent: 'Chiều hoàng hôn tại Vinhomes Central Park cùng bé Bông Golden! Bông vừa làm quen được 3 bạn cún mới siêu ngoan. Có ai đang dạo quanh Landmark 81 hông ta? 🐕✨',
      media: [{ url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80', type: 'image' }],
      hashtags: ['#GoldenBong', '#PawtyLife', '#CentralPark'],
      petTags: ['Bông'],
      locationName: 'Vinhomes Central Park - Bờ sông Landmark 81',
      pawCount: 42,
      commentCount: 6,
      visibility: 'public',
      createdAt: new Date(Date.now() - 3600000 * 5),
    },
  });

  // Bài 2: HIEUTHUHAI
  const postHiếu = await prisma.post.create({
    data: {
      id: 'post-seed-hieu',
      authorId: 'user-test16',
      contentType: 'image',
      textContent: 'Sếp Bánh Bao mặt mâm kiểm tra chất lượng demo bài hát mới. Nghe được 30 giây là lăn ra ngủ ngáy pho pho rồi 🐱💤',
      media: [{ url: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=800&q=80', type: 'image' }],
      hashtags: ['#BanhBaoMatMam', '#BritishShorthair', '#MeoCung'],
      petTags: ['Bánh Bao'],
      locationName: 'Vinhomes Central Park - Landmark Plus',
      pawCount: 88,
      commentCount: 3,
      visibility: 'public',
      createdAt: new Date(Date.now() - 3600000 * 3),
    },
  });

  // Bài 3: Sơn Tùng M-TP
  const postSonTung = await prisma.post.create({
    data: {
      id: 'post-seed-sontung',
      authorId: 'user-test22',
      contentType: 'image',
      textContent: 'Good morning cả nhà! Chú Báo gấm nhà tôi hôm nay dậy sớm đòi ăn pate cá ngừ hảo hạng. Chúc cả nhà một ngày tràn đầy năng lượng tích cực! 🐾🔥',
      media: [{ url: 'https://images.unsplash.com/photo-1518717758536-85ae29035b6d?auto=format&fit=crop&w=800&q=80', type: 'image' }],
      hashtags: ['#SonTungMTP', '#BengalCat', '#SkyPawty'],
      petTags: ['Báo'],
      locationName: 'Phú Mỹ Hưng - Quận 7',
      pawCount: 156,
      commentCount: 2,
      visibility: 'public',
      createdAt: new Date(Date.now() - 3600000 * 12),
    },
  });

  // Bài 4: Ninh Dương Lan Ngọc
  const postLanNgoc = await prisma.post.create({
    data: {
      id: 'post-seed-lanngoc',
      authorId: 'user-test10',
      contentType: 'image',
      textContent: 'Cuối tuần dẫn bé Lucky Border Collie đi tập ném đĩa ở Đảo Kim Cương. Bé bắt dính 10/10 không trượt phát nào luôn mọi người ơi! Tự hào về Boss ghê 🎾🐕',
      media: [{ url: 'https://images.unsplash.com/photo-1503256207526-0d5d80fa2f47?auto=format&fit=crop&w=800&q=80', type: 'image' }],
      hashtags: ['#LuckyCollie', '#DaoKimCuong', '#NgocNu'],
      petTags: ['Lucky'],
      locationName: 'Đảo Kim Cương - Quận 2',
      pawCount: 65,
      commentCount: 1,
      visibility: 'public',
      createdAt: new Date(Date.now() - 3600000 * 18),
    },
  });

  // Bài 5: Phương Anh Đào
  await prisma.post.create({
    data: {
      id: 'post-seed-phuonganhdao',
      authorId: 'user-test5',
      contentType: 'image',
      textContent: 'Góc mông trái tim của em Bắp Corgi làm cả khu Midtown xôn xao chiều nay. Ai đi qua cũng phải dừng lại xin chụp hình ké một tấm 🍑🐶',
      media: [{ url: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80', type: 'image' }],
      hashtags: ['#BapCorgi', '#MongTraiTim', '#PawtyWalk'],
      petTags: ['Bắp'],
      locationName: 'Midtown Phú Mỹ Hưng',
      pawCount: 51,
      commentCount: 0,
      visibility: 'public',
      createdAt: new Date(Date.now() - 3600000 * 24),
    },
  });

  // Bài 6: Băng Di
  await prisma.post.create({
    data: {
      id: 'post-seed-bangdi',
      authorId: 'user-test3',
      contentType: 'image',
      textContent: 'Bé Sói ngáo ngơ hôm nay đòi đi dạo tới 3 vòng công viên vẫn chưa chịu về. Ai ở gần bờ kè bến thuyền thì hú một tiếng giao lưu nhé!',
      media: [{ url: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?auto=format&fit=crop&w=800&q=80', type: 'image' }],
      hashtags: ['#SoiHusky', '#NgaoNgo', '#SailingTower'],
      petTags: ['Sói'],
      locationName: 'Sailing Tower - Bến thuyền Quận 1',
      pawCount: 39,
      commentCount: 0,
      visibility: 'public',
      createdAt: new Date(Date.now() - 3600000 * 30),
    },
  });

  // Bài 7: Quang Hùng MasterD
  await prisma.post.create({
    data: {
      id: 'post-seed-quanghung',
      authorId: 'user-test29',
      contentType: 'image',
      textContent: 'Bé Nơ Ragdoll mắt xanh như ngọc bích. Mỗi lần viết nhạc tình là Nơ lại nhảy lên đùi nằm lim dim 🎵💙',
      media: [{ url: 'https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&w=800&q=80', type: 'image' }],
      hashtags: ['#NoRagdoll', '#BlueEyes', '#MasterD'],
      petTags: ['Nơ'],
      locationName: 'The Grand Manhattan - Quận 1',
      pawCount: 77,
      commentCount: 0,
      visibility: 'public',
      createdAt: new Date(Date.now() - 3600000 * 36),
    },
  });

  // Bài 8: Huỳnh Thị Thanh Thủy
  await prisma.post.create({
    data: {
      id: 'post-seed-thanhthuy',
      authorId: 'user-test11',
      contentType: 'image',
      textContent: 'Hà Nội chớm lạnh, dắt vệ sĩ Rex đi dạo hồ Tây ngắm gió mùa. Rex ngoan ngoãn đi cạnh bảo vệ chủ suốt cả buổi tối 🍁🐕',
      media: [{ url: 'https://images.unsplash.com/photo-1568572933382-74d440642117?auto=format&fit=crop&w=800&q=80', type: 'image' }],
      hashtags: ['#RexBecgie', '#HoTayHaNoi', '#ThanhThuy'],
      petTags: ['Rex'],
      locationName: 'Hồ Tây - Hà Nội',
      pawCount: 94,
      commentCount: 0,
      visibility: 'public',
      createdAt: new Date(Date.now() - 3600000 * 48),
    },
  });

  // ==========================================
  // 4. TẠO REACTION (PAW LIKES)
  // ==========================================
  console.log('[Seed] Khởi tạo cảm xúc Paw cho bài viết...');
  await prisma.reaction.createMany({
    data: [
      { userId: 'user-test16', postId: postChiPu.id, reactionType: 'paw' }, // HIEUTHUHAI thích Chi Pu
      { userId: 'user-test2', postId: postChiPu.id, reactionType: 'paw' },  // Midu thích Chi Pu
      { userId: 'user-test10', postId: postChiPu.id, reactionType: 'paw' }, // Lan Ngọc thích Chi Pu
      { userId: 'user-test20', postId: postChiPu.id, reactionType: 'paw' }, // Song Luân thích Chi Pu
      { userId: 'user-test1', postId: postHiếu.id, reactionType: 'paw' },   // Chi Pu thích Hiếu
      { userId: 'user-test28', postId: postHiếu.id, reactionType: 'paw' },  // MONO thích Hiếu
      { userId: 'user-test18', postId: postSonTung.id, reactionType: 'paw' },// SOOBIN thích Sơn Tùng
    ],
    skipDuplicates: true,
  });

  // ==========================================
  // 6. TẠO COMMENT & TRẢ LỜI ĐA TẦNG FACEBOOK-STYLE
  // ==========================================
  console.log('[Seed] Khởi tạo cây bình luận Facebook-style đa thế hệ...');

  // Bình luận gốc 1 trên bài Chi Pu (từ Midu)
  const comment1 = await prisma.comment.create({
    data: {
      id: 'comment-root-1',
      postId: postChiPu.id,
      authorId: 'user-test2', // Midu
      textContent: 'Bé Bông lớn nhanh quá Chi ơi! Chiều mai cho Bông hẹn bé Nâu nhà chị giao lưu nhé!',
      reactionCount: 4,
      createdAt: new Date(Date.now() - 3600000 * 4),
    },
  });

  // Trả lời cấp 1: Chi Pu rep Midu
  const reply1_1 = await prisma.comment.create({
    data: {
      id: 'comment-reply-1-1',
      postId: postChiPu.id,
      authorId: 'user-test1', // Chi Pu
      parentId: comment1.id,
      textContent: '@Midu Dạ chị iu ơi! 5h chiều mai ở bãi cỏ khu Landmark nhé chị!',
      mentions: ['@Midu'],
      reactionCount: 2,
      createdAt: new Date(Date.now() - 3600000 * 3.8),
    },
  });

  // Trả lời cấp 2: HIEUTHUHAI rep vào chuỗi
  const reply1_2 = await prisma.comment.create({
    data: {
      id: 'comment-reply-1-2',
      postId: postChiPu.id,
      authorId: 'user-test16', // HIEUTHUHAI
      parentId: reply1_1.id, // Trả lời cấp 2 nối vào reply1_1
      textContent: '@Chi Pu Cho em dắt ké bé Bánh Bao ra ké không hai chị ơi haha',
      mentions: ['@Chi Pu'],
      reactionCount: 5,
      createdAt: new Date(Date.now() - 3600000 * 3.5),
    },
  });

  // Trả lời cấp 3: Chi Pu rep HIEUTHUHAI
  await prisma.comment.create({
    data: {
      id: 'comment-reply-1-3',
      postId: postChiPu.id,
      authorId: 'user-test1', // Chi Pu
      parentId: reply1_2.id,
      textContent: '@HIEUTHUHAI Bé Bánh Bao mập ú ra là cả công viên bu lại nựng liền đó Hiếu ơi 😆',
      mentions: ['@HIEUTHUHAI'],
      reactionCount: 3,
      createdAt: new Date(Date.now() - 3600000 * 3.2),
    },
  });

  // Bình luận gốc 2 trên bài Chi Pu (từ Song Luân)
  const comment2 = await prisma.comment.create({
    data: {
      id: 'comment-root-2',
      postId: postChiPu.id,
      authorId: 'user-test20', // Song Luân
      textContent: 'Nhìn cưng quá, Bông biết bắt đĩa bay chưa em?',
      reactionCount: 1,
      createdAt: new Date(Date.now() - 3600000 * 2.5),
    },
  });

  // Chi Pu rep Song Luân
  await prisma.comment.create({
    data: {
      id: 'comment-reply-2-1',
      postId: postChiPu.id,
      authorId: 'user-test1', // Chi Pu
      parentId: comment2.id,
      textContent: '@Song Luân Dạ Bông chạy theo đĩa xong ôm luôn không chịu nhả anh ạ haha',
      mentions: ['@Song Luân'],
      reactionCount: 2,
      createdAt: new Date(Date.now() - 3600000 * 2),
    },
  });

  // Bình luận trên bài HIEUTHUHAI
  const commentHiếu1 = await prisma.comment.create({
    data: {
      id: 'comment-hieu-1',
      postId: postHiếu.id,
      authorId: 'user-test8', // Kaity Nguyễn
      textContent: 'Mặt mâm tròn xoe nhìn chỉ muốn véo má thôi trời ơii!',
      reactionCount: 6,
      createdAt: new Date(Date.now() - 3600000 * 2.2),
    },
  });

  await prisma.comment.create({
    data: {
      id: 'comment-hieu-reply-1',
      postId: postHiếu.id,
      authorId: 'user-test16', // HIEUTHUHAI
      parentId: commentHiếu1.id,
      textContent: '@Kaity Nguyễn Véo là bị ăn một cú cào yêu thương đấy nhé haha',
      mentions: ['@Kaity Nguyễn'],
      reactionCount: 4,
      createdAt: new Date(Date.now() - 3600000 * 1.8),
    },
  });

  // Bình luận trên bài Sơn Tùng
  const commentST1 = await prisma.comment.create({
    data: {
      id: 'comment-st-1',
      postId: postSonTung.id,
      authorId: 'user-test18', // SOOBIN
      textContent: 'Boss nhìn uy tín và chiến thật sự anh ơi!',
      reactionCount: 12,
      createdAt: new Date(Date.now() - 3600000 * 8),
    },
  });

  await prisma.comment.create({
    data: {
      id: 'comment-st-reply-1',
      postId: postSonTung.id,
      authorId: 'user-test22', // Sơn Tùng
      parentId: commentST1.id,
      textContent: '@SOOBIN Hôm nào rảnh ghé anh chơi làm tách cà phê nhé em!',
      mentions: ['@SOOBIN'],
      reactionCount: 8,
      createdAt: new Date(Date.now() - 3600000 * 7),
    },
  });

  // ==========================================
  // 6. TẠO SOS ALERTS (BÁO ĐỘNG TÌM BOSS LẠC)
  // ==========================================
  console.log('[Seed] Khởi tạo các tin báo SOS tìm Boss lạc...');

  // SOS Đang Hoạt Động: Băng Di tìm Husky Sói
  await prisma.sosAlert.create({
    data: {
      id: 'sos-active-husky',
      userId: 'user-test3', // Băng Di
      petId: 'pet-test3-1', // Sói Husky
      lastSeenLocation: 'Gần tháp Landmark 81, Vinhomes Central Park, Bình Thạnh, TP.HCM',
      radiusKm: 3,
      description: 'Bé Sói (Husky lông xám trắng mắt xanh) bị tuột dây xích lúc 17h30 gần khu vui chơi trẻ em Landmark 81. Bé tính nhát người lạ nhưng rất háu ăn, có đeo vòng cổ màu cam phản quang có gắn chuông. Bác nào thấy bé xin vui lòng liên hệ gấp!',
      rewardText: '5.000.000đ và lời cảm ơn chân thành từ gia đình',
      feePaidVnd: 39000,
      status: 'active',
      visualSignatures: {
        imageUrl: 'https://images.unsplash.com/photo-1605568427561-40dd23c2acea?auto=format&fit=crop&w=800&q=80',
        primaryBreed: 'Siberian Husky',
        furColor: 'Xám trắng',
        petName: 'Sói',
      },
      sightings: [
        {
          id: 'sight-1',
          time: '18:15',
          reporterName: 'Cư dân Park 5',
          description: 'Thấy bé đang chạy ngơ ngác gần bãi cỏ ven sông',
          coords: { lat: 10.7935, lng: 106.7218 },
        },
      ],
      createdAt: new Date(Date.now() - 3600000 * 2),
    },
  });

  // SOS Đã Giải Quyết: Đức Phúc tìm mèo Nga Khói
  await prisma.sosAlert.create({
    data: {
      id: 'sos-resolved-cat',
      userId: 'user-test19', // Đức Phúc
      petId: 'pet-test19-1', // Khói Russian Blue
      lastSeenLocation: 'Khuôn viên The Manor Hà Nội, Mễ Trì, Nam Từ Liêm',
      radiusKm: 2,
      description: 'Bé Khói (mèo Nga mắt xanh lông xám bạc) trốn ra ngoài hành lang. Gia đình đã tìm thấy bé nấp dưới hầm B1 nhờ tin báo của cư dân. Cảm ơn cộng đồng Pawty rất nhiều!',
      rewardText: '2.000.000đ',
      feePaidVnd: 39000,
      status: 'resolved',
      visualSignatures: {
        imageUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
        primaryBreed: 'Russian Blue',
        furColor: 'Xám tro',
        petName: 'Khói',
      },
      createdAt: new Date(Date.now() - 3600000 * 48),
    },
  });

  // ==========================================
  // 7. TẠO TƯƠNG TÁC MATCH & LIKE (TINDER KẾT NỐI)
  // ==========================================
  console.log('[Seed] Khởi tạo các cặp Match và Lượt Thích...');

  // Các nghệ sĩ nam thích Chi Pu (user-test1) -> Hiển thị trên tab "Ai Thích Tôi" của Chi Pu
  await prisma.match.createMany({
    data: [
      { userAId: 'user-test16', userBId: 'user-test1', status: 'matched' }, // HIEUTHUHAI và Chi Pu đã Match
      { userAId: 'user-test20', userBId: 'user-test1', status: 'pending' }, // Song Luân thích Chi Pu
      { userAId: 'user-test17', userBId: 'user-test1', status: 'pending' }, // Quốc Anh thích Chi Pu
      { userAId: 'user-test21', userBId: 'user-test1', status: 'pending' }, // Isaac thích Chi Pu
      { userAId: 'user-test18', userBId: 'user-test1', status: 'pending' }, // SOOBIN thích Chi Pu
    ],
  });

  // Midu và Song Luân đã Match
  await prisma.match.create({
    data: {
      userAId: 'user-test2',
      userBId: 'user-test20',
      status: 'matched',
    },
  });

  // Ninh Dương Lan Ngọc và Quốc Anh đã Match
  await prisma.match.create({
    data: {
      userAId: 'user-test10',
      userBId: 'user-test17',
      status: 'matched',
    },
  });

  // Các nghệ sĩ đang gửi lượt thích kết nối
  await prisma.match.createMany({
    data: [
      { userAId: 'user-test5', userBId: 'user-test20', status: 'pending' },  // Phương Anh Đào thích Song Luân
      { userAId: 'user-test8', userBId: 'user-test21', status: 'pending' },  // Kaity Nguyễn thích Isaac
      { userAId: 'user-test11', userBId: 'user-test22', status: 'pending' }, // Thanh Thủy thích Sơn Tùng
      { userAId: 'user-test14', userBId: 'user-test18', status: 'pending' }, // Bích Phương thích SOOBIN
      { userAId: 'user-test10', userBId: 'user-test29', status: 'pending' }, // Lan Ngọc thích Quang Hùng
    ],
  });

  // ==========================================
  // 8. TẠO PHÒNG CHAT & TIN NHẮN REAL-TIME
  // ==========================================
  console.log('[Seed] Khởi tạo phòng chat và tin nhắn mẫu...');

  // Chat 1: Chi Pu & HIEUTHUHAI
  const convChiPuHieu = await prisma.conversation.create({
    data: {
      id: 'conv-chipu-hieu',
      type: 'direct',
      participantIds: ['user-test1', 'user-test16'],
      lastMessageText: 'Có nha, tầm 17h Chi với Bông ra đó. Hiếu bế Bánh Bao ra giao lưu nhé!',
      lastMessageAt: new Date(Date.now() - 3600000 * 1),
    },
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: convChiPuHieu.id,
        senderId: 'user-test16',
        text: 'Chào Chi nha! Bé Bông Golden nhà Chi dễ thương xỉu luôn á 🐕',
        createdAt: new Date(Date.now() - 3600000 * 2),
      },
      {
        conversationId: convChiPuHieu.id,
        senderId: 'user-test1',
        text: 'Cảm ơn Hiếu nè! Nhìn sếp Bánh Bao mặt mâm nhà Hiếu tròn quay mê thiệt chứ haha',
        createdAt: new Date(Date.now() - 3600000 * 1.8),
      },
      {
        conversationId: convChiPuHieu.id,
        senderId: 'user-test16',
        text: 'Haha Bánh Bao chỉ giỏi ăn với ngủ thôi. Chiều mai Chi có ra bờ sông Landmark 81 dắt cún hông?',
        createdAt: new Date(Date.now() - 3600000 * 1.5),
      },
      {
        conversationId: convChiPuHieu.id,
        senderId: 'user-test1',
        text: 'Có nha, tầm 17h Chi với Bông ra đó. Hiếu bế Bánh Bao ra giao lưu nhé!',
        createdAt: new Date(Date.now() - 3600000 * 1),
      },
    ],
  });

  // Chat 2: Ninh Dương Lan Ngọc & Quốc Anh
  const convLanNgocQuocAnh = await prisma.conversation.create({
    data: {
      id: 'conv-lanngoc-quocanh',
      type: 'direct',
      participantIds: ['user-test10', 'user-test17'],
      lastMessageText: 'Cuối tuần này bên công viên Landmark có buổi offline thú cưng, bạn có định tham gia hông nè?',
      lastMessageAt: new Date(Date.now() - 3600000 * 0.5),
    },
  });

  await prisma.message.createMany({
    data: [
      {
        conversationId: convLanNgocQuocAnh.id,
        senderId: 'user-test10',
        text: 'Chào Quốc Anh! Rất vui được kết nối với bạn và bé Leo trên Pawty nha ✨',
        createdAt: new Date(Date.now() - 3600000 * 1.2),
      },
      {
        conversationId: convLanNgocQuocAnh.id,
        senderId: 'user-test17',
        text: 'Chào Ngọc! Mình rất vui được làm quen với bạn và bé Lucky nè. Leo nhà mình to xác vậy chứ hiền khô à 😸',
        createdAt: new Date(Date.now() - 3600000 * 0.8),
      },
      {
        conversationId: convLanNgocQuocAnh.id,
        senderId: 'user-test10',
        text: 'Cuối tuần này bên công viên Landmark có buổi offline thú cưng, bạn có định tham gia hông nè?',
        createdAt: new Date(Date.now() - 3600000 * 0.5),
      },
    ],
  });

  // ==========================================
  // 9. TẠO THÔNG BÁO MẪU (NOTIFICATIONS)
  // ==========================================
  console.log('[Seed] Khởi tạo danh sách thông báo...');
  await prisma.notification.createMany({
    data: [
      {
        userId: 'user-test1', // Chi Pu
        type: 'match',
        title: 'Tương hợp mới! 🎉',
        body: 'Bạn và HIEUTHUHAI đã tương hợp với nhau. Hãy bắt đầu trò chuyện ngay!',
        data: { senderId: 'user-test16', senderName: 'HIEUTHUHAI', conversationId: convChiPuHieu.id },
      },
      {
        userId: 'user-test1', // Chi Pu
        type: 'post_reaction',
        title: 'Yêu thích mới 🐾',
        body: 'Midu và 4 người khác đã thả Paw cho bài viết của bạn.',
        data: { postId: postChiPu.id },
      },
      {
        userId: 'user-test17', // Quốc Anh
        type: 'match',
        title: 'Tương hợp mới! 🎉',
        body: 'Bạn và Ninh Dương Lan Ngọc đã tương hợp với nhau. Hãy bắt đầu trò chuyện ngay!',
        data: { senderId: 'user-test10', senderName: 'Ninh Dương Lan Ngọc', conversationId: convLanNgocQuocAnh.id },
      },
      {
        userId: 'user-test17', // Quốc Anh
        type: 'sos_alert',
        title: '🚨 Báo động SOS gần bạn',
        body: 'Bé Sói (Husky) bị lạc cách bạn khoảng 1.2km tại Vinhomes Central Park.',
        data: { sosAlertId: 'sos-active-husky' },
      },
      {
        userId: 'user-test10', // Ninh Dương Lan Ngọc
        type: 'match',
        title: 'Tương hợp mới! 🎉',
        body: 'Bạn và Quốc Anh đã tương hợp với nhau. Hãy bắt đầu trò chuyện ngay!',
        data: { senderId: 'user-test17', senderName: 'Quốc Anh', conversationId: convLanNgocQuocAnh.id },
      },
    ],
  });

  console.log('===========================================================');
  console.log('✅ [Seed Thành Công 100%]');
  console.log('===========================================================');
  console.log('- 15 Nữ nghệ sĩ hàng đầu Việt Nam kèm 15 bé cún giống chuẩn:');
  console.log('  1. Chi Pu (Bông - Golden) | 2. Midu (Nâu - Labrador) | 3. Băng Di (Sói - Husky)');
  console.log('  4. Nguyễn Ngọc Anh (Mochi - Shiba) | 5. Phương Anh Đào (Bắp - Corgi) | 6. Khả Ngân (Tuyết - Samoyed)');
  console.log('  7. Đoàn Thiên Ân (Gấu - Pomeranian) | 8. Kaity Nguyễn (Mít - Beagle) | 9. Hòa Minzy (Xúc Xích - Dachshund)');
  console.log('  10. Ninh Dương Lan Ngọc (Lucky - Border Collie) | 11. Huỳnh Thị Thanh Thủy (Rex - Becgie)');
  console.log('  12. Jun Vũ (Đốm - Dalmatian) | 13. Mỹ Tâm (Bruno - Boxer) | 14. Bích Phương (Kem - Toy Poodle)');
  console.log('  15. Hồ Ngọc Hà (Bơ - Bull Pháp)');
  console.log('- 15 Nam nghệ sĩ hàng đầu Việt Nam kèm 15 bé mèo giống chuẩn:');
  console.log('  16. HIEUTHUHAI (Bánh Bao - British Shorthair) | 17. Quốc Anh (Leo - Maine Coon) | 18. SOOBIN (Ú - Scottish Fold)');
  console.log('  19. Đức Phúc (Khói - Russian Blue) | 20. Song Luân (Mây - Norwegian Forest) | 21. Isaac (Bông Gòn - Persian)');
  console.log('  22. Sơn Tùng M-TP (Báo - Bengal) | 23. JSOL (Sữa - Siamese) | 24. B Trần (Trắng - Turkish Angora)');
  console.log('  25. Bình An (Chân Ngắn - Munchkin) | 26. Dương Domic (Yoda - Sphynx) | 27. RHYDER (Bắc - Siberian)');
  console.log('  28. MONO (Miu - American Shorthair) | 29. Quang Hùng MasterD (Nơ - Ragdoll) | 30. Anh Tú Atus (Hạt Dẻ - Abyssinian)');
  console.log('- 100% tài khoản nghệ sĩ (Mật khẩu: 123456) đầy đủ thông tin, ảnh đại diện, ảnh hẹn hò, thú cưng, sổ tiêm và tiểu sử!');
  console.log('- 100% link ảnh người và thú cưng lưu trực tiếp vào database.');
  console.log('- Đầy đủ 8 bài viết, cây bình luận Facebook đa thế hệ (@mentions), 2 tin SOS, lượt thích Tinder và phòng chat thực tế.');
  console.log('===========================================================');
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
