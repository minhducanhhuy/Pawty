import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed] Đang dọn dẹp dữ liệu cũ trong PostgreSQL...');

  // Xóa theo thứ tự quan hệ khóa ngoại (Foreign Keys)
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.match.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.sightingTrajectory.deleteMany();
  await prisma.petSightingMatch.deleteMany();
  await prisma.sosAlert.deleteMany();
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

  console.log('[Seed] Đã dọn dẹp xong. Bắt đầu nạp dữ liệu chuẩn...');

  // 1. Tạo Users
  const userMai = await prisma.user.create({
    data: {
      id: 'user-mai',
      phone: '0912345678',
      username: 'mai_nguyen',
      password: 'password123',
      displayName: 'Mai Nguyễn',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
      bio: 'Mẹ của Lu (Golden) & Miu (British Shorthair). Thích dắt cún đi dạo công viên nội khu mỗi chiều.',
      district: 'TP. Thủ Đức (Quận 9)',
      neighborhood: 'Vinhomes Grand Park - Khu Rainbow',
      isVip: true,
      role: 'user',
      status: 'active',
      primaryNeed: 'social',
      showLocation: true,
      showPhone: false,
    },
  });

  const userHung = await prisma.user.create({
    data: {
      id: 'user-hung',
      phone: '0901234567',
      username: 'hung_le',
      password: 'password123',
      displayName: 'Hùng Lê',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      bio: 'Ba của Lu. Chuyên gia ném đĩa frisbee và nhặt bóng cho cún ở công viên.',
      district: 'TP. Thủ Đức (Quận 9)',
      neighborhood: 'Vinhomes Grand Park - S1.02',
      isVip: false,
      role: 'user',
      status: 'active',
    },
  });

  const userLan = await prisma.user.create({
    data: {
      id: 'user-lan',
      phone: '0934567890',
      username: 'lan_tran',
      password: 'password123',
      displayName: 'Lan Trần',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      bio: 'Hàng xóm yêu mèo tầng 12. Sẵn sàng hỗ trợ cho Boss ăn khi ba mẹ vắng nhà.',
      district: 'TP. Thủ Đức (Quận 9)',
      neighborhood: 'Vinhomes Grand Park - S1.02',
      isVip: false,
      role: 'user',
      status: 'active',
    },
  });

  // Candidate users for Tinder & Community
  const userYen = await prisma.user.create({
    data: {
      id: 'user-yenn',
      phone: '0988776655',
      username: 'hai_yen',
      password: 'password123',
      displayName: 'Hải Yến',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
      bio: 'Mẹ 2 con (Bông & Kem). Thích dạo bộ chiều tà và cà phê pet friendly cuối tuần ☕️🐾',
      district: 'TP. Thủ Đức',
      neighborhood: 'Masteri Thảo Điền - Tháp T2',
      isVip: true,
      role: 'user',
      status: 'active',
      primaryNeed: 'playdate',
      showLocation: true,
      showPhone: false,
    },
  });

  const userTuan = await prisma.user.create({
    data: {
      id: 'user-tuan',
      phone: '0977665544',
      username: 'tuan_anh',
      password: 'password123',
      displayName: 'Tuấn Anh',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=800&q=80',
      bio: 'Kỹ sư phần mềm nuôi Corgi mông to. Tìm bạn chạy bộ quanh công viên Landmark.',
      district: 'Bình Thạnh',
      neighborhood: 'Vinhomes Central Park - Landmark 4',
      isVip: false,
      role: 'user',
      status: 'active',
      primaryNeed: 'dating',
      showLocation: true,
      showPhone: false,
    },
  });

  const userThu = await prisma.user.create({
    data: {
      id: 'user-thu',
      phone: '0966554433',
      username: 'minh_thu',
      password: 'password123',
      displayName: 'Minh Thư',
      avatarUrl: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=800&q=80',
      bio: 'Chủ tiệm hoa tươi kiêm sen của Bơ & Mochi. Tìm bạn dạo cún không gian rộng.',
      district: 'Quận 2',
      neighborhood: 'The Vista An Phú',
      isVip: true,
      role: 'user',
      status: 'active',
      primaryNeed: 'community',
      showLocation: true,
      showPhone: false,
    },
  });

  console.log('[Seed] Đã tạo 6 người dùng chuẩn.');

  // 2. Tạo Hộ Gia Đình (Households)
  const hhMai = await prisma.household.create({
    data: {
      id: 'hh-mai',
      name: 'Nhà của Lu & Miu (Khu Rainbow S1.02)',
      ownerId: userMai.id,
    },
  });

  const hhYen = await prisma.household.create({
    data: {
      id: 'hh-yen',
      name: 'Nhà Bông & Kem',
      ownerId: userYen.id,
    },
  });

  const hhTuan = await prisma.household.create({
    data: {
      id: 'hh-tuan',
      name: 'Nhà Rex Corgi',
      ownerId: userTuan.id,
    },
  });

  const hhThu = await prisma.household.create({
    data: {
      id: 'hh-thu',
      name: 'Nhà Bơ & Mochi',
      ownerId: userThu.id,
    },
  });

  // 3. Tạo Thành Viên Circle
  await prisma.circleMember.createMany({
    data: [
      { id: 'cm-1', householdId: hhMai.id, userId: userMai.id, role: 'owner', status: 'active' },
      { id: 'cm-2', householdId: hhMai.id, userId: userHung.id, role: 'caretaker', status: 'active' },
      { id: 'cm-3', householdId: hhMai.id, userId: userLan.id, role: 'viewer', status: 'active' },
    ],
  });

  // 4. Tạo Thú Cưng (Pets)
  const petLu = await prisma.pet.create({
    data: {
      id: 'pet-lu',
      householdId: hhMai.id,
      ownerId: userMai.id,
      name: 'Lu',
      species: 'dog',
      breed: 'Golden Retriever',
      gender: 'male',
      dateOfBirth: new Date('2022-04-12'),
      weightKg: 28.5,
      sizeCategory: 'large',
      energyLevel: 'high',
      avatarUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80',
      coverPhotoUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1000&q=80',
      isNeutered: true,
      allergies: 'Dị ứng đạm bò công nghiệp',
      medicalNotes: 'Khớp háng hơi yếu khi chạy nhảy quá sức',
      vetName: 'Dr. Thắng - PetCare Q9',
      vetContact: '0988112233',
      vaccinationStatus: 'verified',
      lastVaccineDate: new Date('2024-03-10'),
      isPublic: true,
      followerCount: 142,
    },
  });

  const petMiu = await prisma.pet.create({
    data: {
      id: 'pet-miu',
      householdId: hhMai.id,
      ownerId: userMai.id,
      name: 'Miu',
      species: 'cat',
      breed: 'British Shorthair (Mèo Anh Lông Ngắn)',
      gender: 'female',
      dateOfBirth: new Date('2023-01-20'),
      weightKg: 4.2,
      sizeCategory: 'small',
      energyLevel: 'low',
      avatarUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
      coverPhotoUrl: 'https://images.unsplash.com/photo-1513360382564-850126167794?auto=format&fit=crop&w=1000&q=80',
      isNeutered: true,
      allergies: 'Không',
      medicalNotes: 'Định kỳ sổ giun 3 tháng/lần',
      vetName: 'Dr. Thắng - PetCare Q9',
      vetContact: '0988112233',
      vaccinationStatus: 'verified',
      lastVaccineDate: new Date('2024-02-15'),
      isPublic: true,
      followerCount: 88,
    },
  });

  const petBong = await prisma.pet.create({
    data: {
      id: 'pet-bong',
      householdId: hhYen.id,
      ownerId: userYen.id,
      name: 'Bông',
      species: 'dog',
      breed: 'Poodle Teacup',
      gender: 'female',
      dateOfBirth: new Date('2023-02-14'),
      weightKg: 3.2,
      sizeCategory: 'small',
      energyLevel: 'medium',
      avatarUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80',
      vaccinationStatus: 'verified',
      isPublic: true,
    },
  });

  const petKem = await prisma.pet.create({
    data: {
      id: 'pet-kem',
      householdId: hhYen.id,
      ownerId: userYen.id,
      name: 'Kem',
      species: 'cat',
      breed: 'Mèo Ba Tư Trắng',
      gender: 'male',
      dateOfBirth: new Date('2023-08-10'),
      weightKg: 3.8,
      sizeCategory: 'small',
      energyLevel: 'low',
      avatarUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
      vaccinationStatus: 'verified',
      isPublic: true,
    },
  });

  const petBap = await prisma.pet.create({
    data: {
      id: 'pet-bap',
      householdId: hhMai.id,
      ownerId: userHung.id,
      name: 'Bắp',
      species: 'dog',
      breed: 'Corgi Pembroke',
      gender: 'male',
      dateOfBirth: new Date('2023-05-18'),
      weightKg: 11.2,
      sizeCategory: 'medium',
      energyLevel: 'high',
      avatarUrl: 'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?auto=format&fit=crop&w=800&q=80',
      coverPhotoUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1000&q=80',
      isNeutered: true,
      allergies: 'Không',
      medicalNotes: 'Tiêm phòng đầy đủ hàng năm',
      vaccinationStatus: 'verified',
      lastVaccineDate: new Date('2024-04-01'),
      isPublic: true,
      followerCount: 95,
    },
  });

  const petRex = await prisma.pet.create({
    data: {
      id: 'pet-rex',
      householdId: hhTuan.id,
      ownerId: userTuan.id,
      name: 'Rex',
      species: 'dog',
      breed: 'Pembroke Welsh Corgi',
      gender: 'male',
      dateOfBirth: new Date('2022-09-05'),
      weightKg: 12.0,
      sizeCategory: 'medium',
      energyLevel: 'high',
      avatarUrl: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=800&q=80',
      vaccinationStatus: 'verified',
      isPublic: true,
    },
  });

  const petBo = await prisma.pet.create({
    data: {
      id: 'pet-bo',
      householdId: hhThu.id,
      ownerId: userThu.id,
      name: 'Bơ',
      species: 'dog',
      breed: 'Golden Retriever',
      gender: 'female',
      dateOfBirth: new Date('2023-05-18'),
      weightKg: 25.0,
      sizeCategory: 'large',
      energyLevel: 'high',
      avatarUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80',
      vaccinationStatus: 'verified',
      isPublic: true,
    },
  });

  console.log('[Seed] Đã tạo 6 thú cưng đầy đủ thông tin.');

  // 5. Tạo Thói Quen & Hành Vi (PetBehavior)
  await prisma.petBehavior.createMany({
    data: [
      { id: 'bh-1', petId: petLu.id, category: 'good_habit', label: 'Đi vệ sinh đúng chỗ', description: 'Chỉ đi trên khay cỏ hoặc ngoài bãi cỏ công viên' },
      { id: 'bh-2', petId: petLu.id, category: 'personality', label: 'Thân thiện trẻ em', description: 'Rất kiên nhẫn khi chơi cùng em bé' },
      { id: 'bh-3', petId: petLu.id, category: 'caution', label: 'Sợ sấm sét', description: 'Cần ôm hoặc bật nhạc nhẹ khi trời mưa lớn' },
      { id: 'bh-4', petId: petBong.id, category: 'personality', label: 'Năng động vui vẻ', description: 'Thích nhặt bóng và nhảy nhót' },
      { id: 'bh-5', petId: petRex.id, category: 'good_habit', label: 'Biết bắt tay, nằm', description: 'Nghe lệnh rất nhanh' },
    ],
  });

  // 6. Tạo Sổ Tiêm Điện Tử (Vaccination)
  await prisma.vaccination.createMany({
    data: [
      { id: 'vac-1', petId: petLu.id, vaccineName: 'Vắc-xin 7 bệnh (Zoetis Vanguard Plus 5/L)', dateGiven: new Date('2024-03-10'), nextDueDate: new Date('2025-03-10'), vetName: 'Phòng khám PetCare Q9', verified: true },
      { id: 'vac-2', petId: petLu.id, vaccineName: 'Phòng dại (Rabisin)', dateGiven: new Date('2024-03-10'), nextDueDate: new Date('2025-03-10'), vetName: 'Phòng khám PetCare Q9', verified: true },
      { id: 'vac-3', petId: petBong.id, vaccineName: 'Vắc-xin 7 bệnh', dateGiven: new Date('2024-01-15'), nextDueDate: new Date('2025-01-15'), vetName: 'Thú Y Thảo Điền', verified: true },
      { id: 'vac-4', petId: petRex.id, vaccineName: 'Phòng dại + 7 bệnh', dateGiven: new Date('2024-02-20'), nextDueDate: new Date('2025-02-20'), vetName: 'Bệnh viện Thú Y Landmark', verified: true },
    ],
  });

  // 7. Tạo Công Việc Chăm Sóc (CareTask)
  await prisma.careTask.createMany({
    data: [
      { id: 'task-1', householdId: hhMai.id, petId: petLu.id, createdBy: userMai.id, assignedTo: userHung.id, title: 'Cho Lu ăn hạt & uống nước', description: '2 chén hạt Ganador vị cá hồi + nửa viên dầu cá hồi', category: 'feeding', dueDate: new Date(Date.now() + 2 * 3600000), status: 'pending', reminderEnabled: true },
      { id: 'task-2', householdId: hhMai.id, petId: petLu.id, createdBy: userMai.id, assignedTo: userHung.id, title: 'Dắt Lu dạo công viên Rainbow', description: 'Đi dạo 30 phút, nhớ mang theo túi nhặt phân và bình nước', category: 'walk', dueDate: new Date(Date.now() + 6 * 3600000), status: 'pending', reminderEnabled: true },
      { id: 'task-3', householdId: hhMai.id, petId: petMiu.id, createdBy: userMai.id, assignedTo: userLan.id, title: 'Dọn khay cát cho Miu', description: 'Xúc cát vón cục và bổ sung thêm nửa túi cát đậu nành', category: 'litter', dueDate: new Date(Date.now() - 3600000), status: 'done', completedAt: new Date(), completedBy: userLan.id, completionNote: 'Đã dọn sạch và xịt khử mùi sả chanh.', reminderEnabled: false },
    ],
  });

  // 8. Tạo Bài Viết MXH (Posts)
  const post1 = await prisma.post.create({
    data: {
      id: 'post-1',
      authorId: userMai.id,
      contentType: 'moment',
      textContent: 'Chiều nay hoàng hôn ở công viên Rainbow đẹp quá! Lu gặp bạn Corgi cùng tòa chạy đuổi nhau mệt nhoài 🐾🌤️',
      media: [
        { id: 'm-1', type: 'image', url: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80' },
        { id: 'm-2', type: 'image', url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=80' },
      ],
      hashtags: ['#PawtyLocal', '#GoldenRetriever', '#VinhomesGrandPark'],
      locationName: 'Công viên Ánh Sáng - Vinhomes Grand Park',
      hasHealthDisclaimer: false,
      visibility: 'public',
      pawCount: 24,
      commentCount: 5,
    },
  });

  const post2 = await prisma.post.create({
    data: {
      id: 'post-2',
      authorId: userYen.id,
      contentType: 'moment',
      textContent: 'Bông vừa được đi spa tỉa lông tròn như cục kẹo bông gòn nè các cô chú ơi! 🐩✨',
      media: [
        { id: 'm-3', type: 'image', url: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=900&q=80' },
      ],
      hashtags: ['#PoodleCute', '#PetSpa', '#MasteriThaoDien'],
      locationName: 'Masteri Thảo Điền',
      visibility: 'public',
      pawCount: 38,
      commentCount: 8,
    },
  });

  const postSighting = await prisma.post.create({
    data: {
      id: 'post-sighting-1',
      authorId: userHung.id,
      contentType: 'moment',
      textContent: 'Mọi người ơi mình vừa thấy một bé Poodle nâu đỏ lạc ở sảnh S1.03 lúc 19h15 tối nay, bé đang đeo vòng cổ chuông vàng!',
      media: [
        { id: 'm-s1', type: 'image', url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=900&q=80' },
      ],
      hashtags: ['#TimChoLac', '#VinhomesGrandPark', '#S103'],
      locationName: 'Sảnh Tòa S1.03 Vinhomes Grand Park',
      visibility: 'public',
      pawCount: 15,
      commentCount: 3,
    },
  });

  // 9. Tạo Cảnh Báo SOS (SosAlert)
  const sosAlert = await prisma.sosAlert.create({
    data: {
      id: 'sos-1',
      userId: userMai.id,
      petId: petLu.id,
      lastSeenLocation: 'Sảnh S1.02 Vinhomes Grand Park, Phường Long Thạnh Mỹ, TP. Thủ Đức',
      radiusKm: 3,
      description: 'Bé Lu bị giật mình bởi tiếng còi xe tải lúc 18:00 chiều nay và chạy tuột khỏi dây xích hướng về công viên nội khu. Bé đeo vòng cổ xanh mint.',
      rewardText: '2.000.000 VNĐ',
      feePaidVnd: 39000,
      status: 'active',
      visualSignatures: {
        species: 'dog',
        breed: 'Golden Retriever',
        primaryColor: 'Vàng kim nhạt',
        hasCollar: true,
        distinctiveFeatures: ['Vòng cổ màu xanh mint có gắn thẻ tên Lu', 'Lông tai dài xoăn nhẹ', 'Đốm trắng nhỏ ở ngực'],
      },
      sightings: [
        {
          id: 'sight-1',
          reporterName: 'Thành Long (Cư dân S1.03)',
          locationName: 'Sảnh S1.03 Vinhomes Grand Park',
          coords: { lat: 10.8425, lng: 106.8295 },
          createdAt: '19:15 Hôm qua',
          photoUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80',
          note: 'Thấy bé đang nép vào bụi cây cạnh sảnh lễ tân.',
        },
      ],
    },
  });

  // 10. Tạo Manh Mối AI Khớp & Lộ Trình
  await prisma.petSightingMatch.create({
    data: {
      id: 'match-s103-lu',
      sosAlertId: sosAlert.id,
      postId: postSighting.id,
      matchScore: 88,
      visualSimilarity: 92,
      textSimilarity: 85,
      kinematicPlausibility: 95,
      detectedLocationName: 'Sảnh Tòa S1.03 Vinhomes Grand Park',
      detectedCoords: { lat: 10.8425, lng: 106.8295 },
      status: 'pending_review',
    },
  });

  await prisma.sightingTrajectory.create({
    data: {
      id: 'traj-sos-1',
      sosAlertId: sosAlert.id,
      totalDistanceMeters: 520,
      points: [
        { id: 'pt-1', timestamp: '18:00 - Điểm mất tích', lat: 10.8418, lng: 106.8289, locationName: 'Tòa S1.02 Vinhomes Grand Park', source: 'initial_lost', confidenceScore: 1.0, photoUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80', note: 'Điểm nhìn thấy Boss lần cuối' },
        { id: 'pt-2', timestamp: '19:15 - Bài đăng Feed khớp AI (88%)', lat: 10.8425, lng: 106.8295, locationName: 'Sảnh Tòa S1.03 (Cách 120m)', source: 'ai_feed_match', confidenceScore: 0.88, photoUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80', reporterName: 'Hùng Lê', note: 'AI phát hiện cún Poodle nâu có vòng cổ chuông' },
        { id: 'pt-3', timestamp: '20:30 - Manh mối cộng đồng (90%)', lat: 10.8455, lng: 106.8348, locationName: 'Cổng Công viên Ánh Sáng (Cách 400m)', source: 'community_sighting', confidenceScore: 0.9, photoUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&q=80', reporterName: 'Thành Long (S1.03)', note: 'Bé đang chạy hướng vào bãi cỏ công viên' },
      ],
    },
  });

  // 11. Bảng Matches khởi tạo sạch (Chưa có ai thích hoặc khớp nhau để dễ test)
  console.log('[Seed] Khởi tạo sạch bảng Matches (0 bản ghi tương hợp).');

  // 12. Tạo Phòng Chat & Tin Nhắn Thực Tế
  const conv1 = await prisma.conversation.create({
    data: {
      id: 'conv-mai-yen',
      type: 'direct',
      participantIds: [userMai.id, userYen.id],
      lastMessageText: 'Dạ cảm ơn Yến nha! Chiều nay bạn có định cho bé Bông ra công viên dạo không?',
      lastMessageAt: new Date(Date.now() - 15 * 60000),
    },
  });

  await prisma.message.createMany({
    data: [
      {
        id: 'msg-1',
        conversationId: conv1.id,
        senderId: userYen.id,
        text: 'Chào bạn Mai nha! Bé Lu nhà bạn nhìn ngoan và đáng yêu quá ❤️',
        createdAt: new Date(Date.now() - 30 * 60000),
        isRead: true,
      },
      {
        id: 'msg-2',
        conversationId: conv1.id,
        senderId: userMai.id,
        text: 'Dạ cảm ơn Yến nha! Chiều nay bạn có định cho bé Bông ra công viên dạo không?',
        createdAt: new Date(Date.now() - 15 * 60000),
        isRead: true,
      },
    ],
  });

  const conv2 = await prisma.conversation.create({
    data: {
      id: 'conv-mai-tuan',
      type: 'direct',
      participantIds: [userMai.id, userTuan.id],
      lastMessageText: 'Bé Rex nhà mình rất thích chơi kéo co với Golden đó haha',
      lastMessageAt: new Date(Date.now() - 2 * 3600000),
    },
  });

  await prisma.message.createMany({
    data: [
      {
        id: 'msg-3',
        conversationId: conv2.id,
        senderId: userTuan.id,
        text: 'Bé Rex nhà mình rất thích chơi kéo co với Golden đó haha',
        createdAt: new Date(Date.now() - 2 * 3600000),
        isRead: true,
      },
    ],
  });

  // 13. Tạo Thông Báo Thực Tế (Notifications)
  await prisma.notification.createMany({
    data: [

      {
        id: 'notif-2',
        userId: userMai.id,
        type: 'sos_match',
        title: 'Manh Mối SOS Mới! 🚨',
        body: 'Hệ thống AI vừa phát hiện hình ảnh nghi vấn bé Lu ở Sảnh S1.03 (Độ khớp 88%).',
        isRead: false,
      },
    ],
  });

  console.log('[Seed] Đã nạp thành công toàn bộ dữ liệu chuẩn vào PostgreSQL thật!');
}

main()
  .catch((e) => {
    console.error('[Seed Error]:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
