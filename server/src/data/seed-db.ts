import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('[Seed] Đang dọn dẹp dữ liệu cũ trong PostgreSQL...');

  // Xóa theo thứ tự quan hệ khóa ngoại (Foreign Keys)
  await prisma.sightingTrajectory.deleteMany();
  await prisma.petSightingMatch.deleteMany();
  await prisma.sosAlert.deleteMany();
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.partner.deleteMany();
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

  console.log(`[Seed] Đã tạo 3 người dùng: ${userMai.displayName}, ${userHung.displayName}, ${userLan.displayName}`);

  // 2. Tạo Hộ Gia Đình (Household)
  const household = await prisma.household.create({
    data: {
      id: 'hh-mai',
      name: 'Nhà của Lu & Miu (Khu Rainbow S1.02)',
      ownerId: userMai.id,
    },
  });

  // 3. Tạo Thành Viên Circle
  await prisma.circleMember.createMany({
    data: [
      {
        id: 'cm-1',
        householdId: household.id,
        userId: userMai.id,
        role: 'owner',
        status: 'active',
      },
      {
        id: 'cm-2',
        householdId: household.id,
        userId: userHung.id,
        role: 'caretaker',
        status: 'active',
      },
      {
        id: 'cm-3',
        householdId: household.id,
        userId: userLan.id,
        role: 'viewer',
        status: 'active',
      },
    ],
  });

  // 4. Tạo Hồ Sơ Thú Cưng (Pets)
  const petLu = await prisma.pet.create({
    data: {
      id: 'pet-lu',
      householdId: household.id,
      ownerId: userMai.id,
      name: 'Lu',
      species: 'dog',
      breed: 'Golden Retriever',
      gender: 'male',
      dateOfBirth: new Date('2024-04-15'),
      weightKg: 28.4,
      sizeCategory: 'large',
      energyLevel: 'high',
      isNeutered: true,
      avatarUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80',
      vaccinationStatus: 'full',
      vetName: 'BS. Trần Minh Khoa',
      vetContact: '028 3899 1122',
      isPublic: true,
      followerCount: 254,
    },
  });

  const petMiu = await prisma.pet.create({
    data: {
      id: 'pet-miu',
      householdId: household.id,
      ownerId: userMai.id,
      name: 'Miu',
      species: 'cat',
      breed: 'Mèo Anh Lông Ngắn (British Shorthair)',
      gender: 'female',
      dateOfBirth: new Date('2024-09-20'),
      weightKg: 4.3,
      sizeCategory: 'small',
      energyLevel: 'low',
      isNeutered: true,
      avatarUrl: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=600&q=80',
      vaccinationStatus: 'full',
      vetName: 'BS. Nguyễn Lan Anh',
      vetContact: '028 3899 1122',
      isPublic: true,
      followerCount: 189,
    },
  });

  // 5. Tạo Hành Vi & Tính Cách (Pet Behaviors)
  await prisma.petBehavior.createMany({
    data: [
      { id: 'bh-1', petId: petLu.id, category: 'personality', label: 'Thân thiện với chó nhỏ', description: 'Rất hiền lành, chơi hòa đồng' },
      { id: 'bh-2', petId: petLu.id, category: 'good_habit', label: 'Đi vệ sinh đúng chỗ', description: 'Đã huấn luyện thói quen tốt' },
      { id: 'bh-3', petId: petLu.id, category: 'caution', label: 'Hay đuổi bồ câu', description: 'Cần giữ dây dắt khi gặp chim bồ câu' },
      { id: 'bh-4', petId: petMiu.id, category: 'personality', label: 'Quấn chủ, thích gãi cằm', description: 'Thích nằm sưởi nắng ban công' },
      { id: 'bh-5', petId: petMiu.id, category: 'caution', label: 'Sợ người lạ trong 15 phút đầu', description: 'Cần để bé tự làm quen' },
    ],
  });

  // 6. Tạo Sổ Tiêm Điện Tử (Vaccinations)
  await prisma.vaccination.createMany({
    data: [
      {
        id: 'vac-1',
        petId: petLu.id,
        vaccineName: 'Vắc-xin 7 bệnh chó (Vanguard Plus 5/CV-L)',
        dateGiven: new Date('2025-11-10'),
        nextDueDate: new Date('2026-11-10'),
        vetName: 'Phòng Khám Thú Y Dr. Paw',
        verified: true,
      },
      {
        id: 'vac-2',
        petId: petLu.id,
        vaccineName: 'Vắc-xin Phòng Dại (Rabisin)',
        dateGiven: new Date('2025-11-10'),
        nextDueDate: new Date('2026-11-10'),
        vetName: 'Phòng Khám Thú Y Dr. Paw',
        verified: true,
      },
      {
        id: 'vac-3',
        petId: petMiu.id,
        vaccineName: 'Vắc-xin 4 bệnh Mèo (Felocell 4)',
        dateGiven: new Date('2025-12-01'),
        nextDueDate: new Date('2026-12-01'),
        vetName: 'Phòng Khám Thú Y Dr. Paw',
        verified: true,
      },
    ],
  });

  // 7. Tạo Công Việc Chăm Sóc (Care Tasks)
  await prisma.careTask.createMany({
    data: [
      {
        id: 'task-1',
        householdId: household.id,
        petId: petLu.id,
        createdBy: userMai.id,
        assignedTo: userHung.id,
        title: 'Cho Lu ăn sáng (200g hạt Royal Canin + ức gà luộc)',
        description: 'Giờ ăn sáng: 07:30',
        category: 'feeding',
        dueDate: new Date(),
        status: 'done',
        completedAt: new Date(),
        completedBy: userHung.id,
        completionNote: 'Lu ăn hết sạch trong 3 phút, uống thêm 300ml nước.',
      },
      {
        id: 'task-2',
        householdId: household.id,
        petId: petLu.id,
        createdBy: userMai.id,
        assignedTo: userMai.id,
        title: 'Dắt Lu đi dạo chiều 30 phút quanh công viên nội khu',
        description: 'Giờ đi dạo: 17:30',
        category: 'walk',
        dueDate: new Date(),
        status: 'pending',
      },
      {
        id: 'task-3',
        householdId: household.id,
        petId: petMiu.id,
        createdBy: userMai.id,
        assignedTo: userHung.id,
        title: 'Chải lông & dọn khay cát vệ sinh cho Miu',
        description: 'Giờ vệ sinh: 19:00',
        category: 'grooming',
        dueDate: new Date(),
        status: 'pending',
      },
    ],
  });

  // 8. Tạo Đối Tác Dịch Vụ (Partners)
  const partnerVet = await prisma.partner.create({
    data: {
      id: 'partner-vet-1',
      name: 'Bệnh Viện Thú Y Dr. Paw Pet Care',
      type: 'vet',
      description: 'Phòng khám thú y quốc tế tiêu chuẩn 5 sao tại Vinhomes Grand Park.',
      address: 'Shophouse S1.02 Vinhomes Grand Park, TP. Thủ Đức',
      district: 'TP. Thủ Đức',
      phone: '028 3899 1122',
      avatarUrl: 'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=400&q=80',
      ratingAvg: 4.95,
      reviewCount: 142,
      verificationStatus: 'verified',
      isActive: true,
      services: [
        { id: 'srv-1', name: 'Khám sức khỏe tổng quát', priceVnd: 250000 },
        { id: 'srv-2', name: 'Tiêm phòng định kỳ & sổ theo dõi', priceVnd: 350000 },
      ],
    },
  });

  const partnerSpa = await prisma.partner.create({
    data: {
      id: 'partner-spa-1',
      name: 'Paws & Bubbles Spa Grooming Salon',
      type: 'grooming',
      description: 'Spa tắm sấy, cắt tỉa tạo hình thú cưng chuyên nghiệp.',
      address: 'Shophouse S2.03 Vinhomes Grand Park, TP. Thủ Đức',
      district: 'TP. Thủ Đức',
      phone: '0908 776 554',
      avatarUrl: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=400&q=80',
      ratingAvg: 4.88,
      reviewCount: 98,
      verificationStatus: 'verified',
      isActive: true,
      services: [
        { id: 'srv-3', name: 'Tắm spa khử mùi 7 bước', priceVnd: 180000 },
        { id: 'srv-4', name: 'Cắt tỉa tạo kiểu lông Poodle/Corgi', priceVnd: 320000 },
      ],
    },
  });

  // 9. Tạo Bài Đăng Mạng Xã Hội (Social Posts)
  const post1 = await prisma.post.create({
    data: {
      id: 'post-1',
      authorId: userMai.id,
      contentType: 'moment',
      textContent: 'Chiều nay ra công viên nội khu Vinhomes Grand Park gặp hội bạn Corgi chạy mệt nghỉ luôn! Có Sen nào ở khu Rainbow tối nay dắt cún đi dạo chung không ạ? 🐾🌅',
      media: [{ id: 'm-1', type: 'image', url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=80' }],
      hashtags: ['#GoldenRetriever', '#VinhomesGrandPark', '#HẹnDạo'],
      locationName: 'Vinhomes Grand Park - Khu Rainbow',
      visibility: 'public',
      pawCount: 42,
      commentCount: 8,
    },
  });

  const postSighting = await prisma.post.create({
    data: {
      id: 'post-s103-sighting',
      authorId: userHung.id,
      contentType: 'moment',
      textContent: 'Vừa thấy một bé cún Poodle nâu đỏ đeo vòng cổ chuông xanh chạy lạc ở gần s1.03 Vinhomes Grand Park, ai là chủ liên hệ mình nhé!',
      media: [{ id: 'm-2', type: 'image', url: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=800&q=80' }],
      hashtags: ['#ChoLac', '#VinhomesGrandPark', '#S103'],
      locationName: 'Tòa S1.03 Vinhomes Grand Park',
      visibility: 'public',
      pawCount: 15,
      commentCount: 4,
    },
  });

  // 10. Tạo Tin Cảnh Báo Khẩn Cấp (SosAlert)
  const sosAlert = await prisma.sosAlert.create({
    data: {
      id: 'sos-1',
      userId: userMai.id,
      petId: petLu.id,
      lastSeenLocation: 'Tòa S1.02 Vinhomes Grand Park (Gần sân chơi trẻ em)',
      radiusKm: 3,
      description: 'Bé bị giật mình bởi tiếng pháo hoa mini lúc 18h tối qua nên tuột dây dắt chạy về hướng công viên nội khu. Bé đeo vòng cổ màu xanh mint có gắn chuông vàng nhỏ.',
      rewardText: '2.000.000đ & Hậu tạ chân thành',
      feePaidVnd: 39000,
      status: 'active',
      visualSignatures: {
        species: 'dog',
        breed: 'Poodle',
        primaryColor: 'Nâu đỏ',
        hasCollar: true,
        collarColor: 'Xanh mint',
        distinctiveFeatures: ['tai cụp', 'mảng ngực trắng'],
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

  // 11. Tạo Manh Mối AI Khớp (PetSightingMatch)
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

  // 12. Tạo Chuỗi Lộ Trình Di Chuyển Phỏng Đoán (SightingTrajectory)
  await prisma.sightingTrajectory.create({
    data: {
      id: 'traj-sos-1',
      sosAlertId: sosAlert.id,
      totalDistanceMeters: 520,
      points: [
        {
          id: 'pt-1',
          timestamp: '18:00 - Điểm mất tích',
          lat: 10.8418,
          lng: 106.8289,
          locationName: 'Tòa S1.02 Vinhomes Grand Park',
          source: 'initial_lost',
          confidenceScore: 1.0,
          photoUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80',
          note: 'Điểm nhìn thấy Boss lần cuối',
        },
        {
          id: 'pt-2',
          timestamp: '19:15 - Bài đăng Feed khớp AI (88%)',
          lat: 10.8425,
          lng: 106.8295,
          locationName: 'Sảnh Tòa S1.03 (Cách 120m)',
          source: 'ai_feed_match',
          confidenceScore: 0.88,
          photoUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=400&q=80',
          reporterName: 'Hùng Lê',
          note: 'AI phát hiện cún Poodle nâu có vòng cổ chuông',
        },
        {
          id: 'pt-3',
          timestamp: '20:30 - Manh mối cộng đồng (90%)',
          lat: 10.8455,
          lng: 106.8348,
          locationName: 'Cổng Công viên Ánh Sáng (Cách 400m)',
          source: 'community_sighting',
          confidenceScore: 0.9,
          photoUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&q=80',
          reporterName: 'Thành Long (S1.03)',
          note: 'Bé đang chạy hướng vào bãi cỏ công viên',
        },
      ],
    },
  });

  // 13. Tạo Booking dịch vụ mẫu
  await prisma.booking.create({
    data: {
      id: 'bk-1',
      userId: userMai.id,
      partnerId: partnerVet.id,
      petId: petLu.id,
      serviceName: 'Khám sức khỏe tổng quát',
      servicePrice: 250000,
      scheduledDate: new Date(),
      status: 'confirmed',
    },
  });

  console.log('[Seed] Đã nạp thành công toàn bộ dữ liệu vào PostgreSQL thật!');
}

main()
  .catch((e) => {
    console.error('[Seed Error]:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
