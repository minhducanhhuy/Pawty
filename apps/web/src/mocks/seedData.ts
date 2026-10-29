import type {
  CareHandoverNote,
  CareTask,
  ChatMessage,
  CircleActivityItem,
  CircleMember,
  CommunityGroup,
  ContentReport,
  Conversation,
  MatchRecord,
  NorthStarDashboardMetrics,
  PartnerProfile,
  PetFriendlyPlace,
  PetProfile,
  RadarCandidate,
  ServiceBooking,
  SocialPost,
  SosAlert,
  UserProfile,
  WalkAppointment,
} from '@pawty/types';

export const INITIAL_USER: UserProfile = {
  id: 'user-mai',
  phone: '0912345678',
  displayName: 'Mai Nguyễn',
  username: 'mai_petmom',
  avatarUrl:
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
  bio: 'Nuôi Lu và Bơ. Hay đi bộ buổi chiều quanh công viên nội khu Vinhomes Q9.',
  district: 'TP. Thủ Đức (Quận 9)',
  neighborhood: 'Vinhomes Grand Park - Khu Rainbow',
  location: { lat: 10.8412, lng: 106.8286 },
  isVip: false,
  vipPlan: 'free',
  role: 'user',
  status: 'active',
  primaryNeeds: ['care_management', 'family_circle', 'walk_buddy'],
  noShowCount: 0,
  dailySwipeCount: 2,
  privacy: {
    showLocation: true,
    showPhone: false,
    allowMessages: 'circle_and_matches',
    consents: {
      dataCollection: true,
      location: true,
      notifications: true,
      marketing: false,
      updatedAt: '2026-10-29T08:00:00Z',
    },
  },
  createdAt: '2026-09-15T08:00:00Z',
};

export const INITIAL_PETS: PetProfile[] = [
  {
    id: 'pet-lu',
    householdId: 'hh-mai',
    ownerId: 'user-mai',
    name: 'Lu',
    species: 'dog',
    breed: 'Golden Retriever',
    gender: 'male',
    dateOfBirth: '2024-07-15',
    ageDisplay: '2 năm 3 tháng',
    weightKg: 28,
    sizeCategory: 'large',
    energyLevel: 'high',
    avatarUrl:
      'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80',
    coverPhotoUrl:
      'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?auto=format&fit=crop&w=900&q=80',
    isNeutered: true,
    allergies: 'Dị ứng nhẹ với đạm hải sản có vỏ',
    medicalNotes: 'Khỏe mạnh, cần vận động tối thiểu 45 phút/ngày.',
    vetName: 'BS. Nguyễn Văn An — Phòng khám PetCare Q9',
    vetContact: '0909 112 233',
    vaccinationStatus: 'full',
    lastVaccineDate: '2026-10-15',
    isPublic: true,
    followerCount: 245,
    behaviors: [
      { id: 'b-1', petId: 'pet-lu', category: 'personality', label: 'Thân thiện' },
      { id: 'b-2', petId: 'pet-lu', category: 'personality', label: 'Hiếu động' },
      { id: 'b-3', petId: 'pet-lu', category: 'good_habit', label: 'Nghe lệnh tốt' },
      { id: 'b-4', petId: 'pet-lu', category: 'good_habit', label: 'Thích chơi bóng' },
      { id: 'b-5', petId: 'pet-lu', category: 'good_habit', label: 'Đi vệ sinh đúng chỗ' },
      {
        id: 'b-6',
        petId: 'pet-lu',
        category: 'caution',
        label: 'Hay nhảy lên người khi mừng',
      },
      { id: 'b-7', petId: 'pet-lu', category: 'caution', label: 'Sợ tiếng pháo/sấm' },
      { id: 'b-8', petId: 'pet-lu', category: 'caution', label: 'Bảo vệ đồ ăn' },
    ],
    vaccinations: [
      {
        id: 'vac-1',
        petId: 'pet-lu',
        vaccineName: 'Vắc-xin 7 bệnh (Zoetis Vanguard Plus 5/CV-L)',
        dateGiven: '2026-10-15',
        nextDueDate: '2027-10-15',
        vetName: 'BS. Nguyễn Văn An — PetCare Q9',
        verified: true,
      },
      {
        id: 'vac-2',
        petId: 'pet-lu',
        vaccineName: 'Vắc-xin Phòng Dại (Rabisin)',
        dateGiven: '2026-09-20',
        nextDueDate: '2027-09-20',
        vetName: 'BS. Nguyễn Văn An — PetCare Q9',
        verified: true,
      },
    ],
    weightHistory: [
      { date: '06/2026', weightKg: 26.2 },
      { date: '07/2026', weightKg: 26.8 },
      { date: '08/2026', weightKg: 27.4 },
      { date: '09/2026', weightKg: 27.9 },
      { date: '10/2026', weightKg: 28.0 },
    ],
    speciesMeta: {
      walkFrequencyPerDay: 2,
    },
  },
  {
    id: 'pet-bo',
    householdId: 'hh-mai',
    ownerId: 'user-mai',
    name: 'Bơ',
    species: 'cat',
    breed: 'Mèo Anh Lông Ngắn (British Shorthair)',
    gender: 'female',
    dateOfBirth: '2025-02-10',
    ageDisplay: '1 năm 8 tháng',
    weightKg: 4.5,
    sizeCategory: 'small',
    energyLevel: 'low',
    avatarUrl:
      'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=600&q=80',
    coverPhotoUrl:
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=900&q=80',
    isNeutered: true,
    allergies: 'Không có',
    medicalNotes: 'Hay búi lông mùa thay lông, cần chải lông 3 lần/tuần.',
    vetName: 'BS. Trần Minh Thảo — VetClinic Thảo Điền',
    vetContact: '0908 665 544',
    vaccinationStatus: 'full',
    lastVaccineDate: '2026-08-12',
    isPublic: true,
    followerCount: 168,
    behaviors: [
      { id: 'b-9', petId: 'pet-bo', category: 'personality', label: 'Điềm tĩnh' },
      { id: 'b-10', petId: 'pet-bo', category: 'personality', label: 'Quấn chủ' },
      { id: 'b-11', petId: 'pet-bo', category: 'good_habit', label: 'Đi khay cát chuẩn 100%' },
      { id: 'b-12', petId: 'pet-bo', category: 'good_habit', label: 'Không cào sofa' },
      { id: 'b-13', petId: 'pet-bo', category: 'caution', label: 'Sợ máy sấy tiếng to' },
    ],
    vaccinations: [
      {
        id: 'vac-3',
        petId: 'pet-bo',
        vaccineName: 'Vắc-xin 4 bệnh Mèo (Felocell 4)',
        dateGiven: '2026-08-12',
        nextDueDate: '2027-08-12',
        vetName: 'BS. Trần Minh Thảo — VetClinic',
        verified: true,
      },
    ],
    weightHistory: [
      { date: '07/2026', weightKg: 4.1 },
      { date: '08/2026', weightKg: 4.3 },
      { date: '09/2026', weightKg: 4.4 },
      { date: '10/2026', weightKg: 4.5 },
    ],
    speciesMeta: {
      litterCleanFrequencyPerDay: 2,
      coatCycleNote: 'Đang vào chu kỳ thay lông thu-đông, bổ sung gel tiêu búi lông.',
      indoorActivityLevel: 'moderate',
    },
  },
];

export const INITIAL_CIRCLE_MEMBERS: CircleMember[] = [
  {
    id: 'cm-1',
    householdId: 'hh-mai',
    userId: 'user-mai',
    displayName: 'Mai Nguyễn (Bạn)',
    avatarUrl:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    relationLabel: 'Chủ nuôi chính',
    role: 'owner',
    inviteCode: 'PAWTY-MAI88',
    status: 'active',
    joinedAt: '2026-09-15',
  },
  {
    id: 'cm-2',
    householdId: 'hh-mai',
    userId: 'user-mom',
    displayName: 'Mẹ Mai (Cô Lan)',
    avatarUrl:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
    relationLabel: 'Mẹ',
    role: 'caretaker',
    inviteCode: 'PAWTY-LAN01',
    status: 'active',
    joinedAt: '2026-09-18',
  },
  {
    id: 'cm-3',
    householdId: 'hh-mai',
    userId: 'user-dad',
    displayName: 'Ba Mai (Chú Hùng)',
    avatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    relationLabel: 'Ba',
    role: 'caretaker',
    inviteCode: 'PAWTY-HUNG02',
    status: 'active',
    joinedAt: '2026-09-20',
  },
];

export const INITIAL_CARE_TASKS: CareTask[] = [
  {
    id: 'task-1',
    householdId: 'hh-mai',
    petId: 'pet-lu',
    createdBy: 'user-mai',
    assignedTo: 'user-mom',
    assignedToName: 'Mẹ Mai',
    title: 'Cho Lu ăn sáng (200g hạt Royal Canin + ức gà)',
    description: 'Nhớ trộn thêm 1 muỗng dầu cá hồi cho mượt lông.',
    category: 'feeding',
    isRecurring: true,
    recurrenceRule: 'FREQ=DAILY',
    dueDate: '2026-10-29',
    dueTime: '07:30',
    status: 'pending',
    reminderEnabled: true,
  },
  {
    id: 'task-2',
    householdId: 'hh-mai',
    petId: 'pet-lu',
    createdBy: 'user-mai',
    assignedTo: 'user-mai',
    assignedToName: 'Mai Nguyễn',
    title: 'Uống thuốc tẩy giun định kỳ (NexGard Spectra)',
    description: 'Cho uống sau bữa sáng 30 phút.',
    category: 'medicine',
    isRecurring: false,
    dueDate: '2026-10-29',
    dueTime: '08:00',
    status: 'pending',
    reminderEnabled: true,
  },
  {
    id: 'task-3',
    householdId: 'hh-mai',
    petId: 'pet-lu',
    createdBy: 'user-mai',
    assignedTo: 'user-dad',
    assignedToName: 'Ba Mai',
    title: 'Dắt Lu đi dạo sáng quanh công viên nội khu',
    description: 'Đeo dây dắt ngực và mang túi hốt phân.',
    category: 'walk',
    isRecurring: true,
    recurrenceRule: 'FREQ=DAILY',
    dueDate: '2026-10-29',
    dueTime: '06:30',
    status: 'done',
    completedAt: '2026-10-29T06:45:00Z',
    completedBy: 'user-dad',
    completedByName: 'Ba Mai',
    completionNote: 'Lu chạy 3 vòng hồ, gặp bạn Corgi rất ngoan!',
    reminderEnabled: true,
  },
  {
    id: 'task-4',
    householdId: 'hh-mai',
    petId: 'pet-bo',
    createdBy: 'user-mai',
    assignedTo: 'user-mai',
    assignedToName: 'Mai Nguyễn',
    title: 'Dọn khay cát vệ sinh & chải lông cho Bơ',
    description: 'Bổ sung thêm cát đậu nành mới.',
    category: 'litter',
    isRecurring: true,
    recurrenceRule: 'FREQ=DAILY',
    dueDate: '2026-10-29',
    dueTime: '19:00',
    status: 'pending',
    reminderEnabled: true,
  },
];

export const INITIAL_CIRCLE_ACTIVITIES: CircleActivityItem[] = [
  {
    id: 'act-1',
    householdId: 'hh-mai',
    actorId: 'user-mom',
    actorName: 'Mẹ Mai',
    actorAvatar:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
    actionText: 'đã hoàn thành "Thay nước sạch cho Lu & Bơ" lúc 07:15',
    detailText: 'Đã rửa sạch bình lọc nước tự động.',
    createdAt: '25 phút trước',
  },
  {
    id: 'act-2',
    householdId: 'hh-mai',
    actorId: 'user-dad',
    actorName: 'Ba Mai',
    actorAvatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    actionText: 'đã hoàn thành "Dắt Lu đi dạo sáng" lúc 06:45',
    detailText: '"Lu ăn hết bát sáng rồi nha, đi dạo 35 phút rất ngoan!"',
    photoUrl:
      'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=500&q=80',
    createdAt: '55 phút trước',
  },
];

export const INITIAL_HANDOVER_NOTE: CareHandoverNote = {
  id: 'ho-1',
  householdId: 'hh-mai',
  petId: 'pet-lu',
  createdBy: 'user-mai',
  caretakerName: 'Mẹ Mai & Ba Mai',
  startDate: '01/11/2026',
  endDate: '03/11/2026',
  feedingInstructions: '2 bữa/ngày (7h30 sáng & 18h30 tối). Tuyệt đối không cho ăn xương gà nhỏ hoặc sô-cô-la.',
  medicationInstructions: 'Viên nhai dưỡng khớp để ở ngăn kéo tủ bếp số 2 (1 viên sau bữa sáng).',
  emergencyVetContact: 'BS. Nguyễn Văn An (PetCare Q9) — 0909 112 233',
  checklist: [
    { id: 'chk-1', label: 'Chuẩn bị sẵn hạt & pate chia theo khẩu phần ngày', checked: true },
    { id: 'chk-2', label: 'Để sổ tiêm điện tử & dây dắt ở kệ giày cửa ra vào', checked: true },
    { id: 'chk-3', label: 'Bật camera phòng khách kết nối điện thoại Mẹ', checked: false },
  ],
  isActive: true,
};

export const INITIAL_POSTS: SocialPost[] = [
  {
    id: 'post-1',
    authorId: 'user-mai',
    authorName: 'Mai Nguyễn',
    authorUsername: 'mai_petmom',
    authorAvatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
    authorIsVip: true,
    petIds: ['pet-lu'],
    petName: 'Lu',
    petBreed: 'Golden Retriever',
    petAvatar:
      'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=300&q=80',
    contentType: 'moment',
    textContent:
      'Lu sáng nay tắm xong thơm phức, chạy ra sân cỏ phơi nắng liền. Cuối tuần này nhà nào ở Vinhomes Q9 rảnh cho các bé ra chạy bộ chung không?',
    media: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=80',
        aspectRatio: '4:5',
      },
    ],
    hashtags: ['#GoldenRetriever', '#Grooming', '#VinhomesQ9', '#BossNghịch'],
    location: {
      name: 'Vinhomes Grand Park Q9',
      approximate: true,
      point: { lat: 10.8412, lng: 106.8286 },
    },
    speciesTags: ['dog'],
    breedTags: ['golden_retriever'],
    topicTags: ['grooming', 'walk'],
    visibility: 'public',
    isExpertContent: false,
    expertVerified: false,
    hasHealthDisclaimer: false,
    isSponsored: false,
    feedSource: 'circle_following',
    engagement: {
      pawCount: 45,
      commentCount: 2,
      shareCount: 4,
      saveCount: 9,
      reactionBreakdown: {
        paw: 28,
        heart_eyes: 11,
        laughing: 6,
        worried: 0,
        helpful: 0,
      },
    },
    userReaction: null,
    isBookmarked: false,
    moderationStatus: 'approved',
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    comments: [
      {
        id: 'cmt-1',
        postId: 'post-1',
        authorId: 'user-hoa',
        authorName: 'Hòa Trần (Sen Miu)',
        authorAvatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        textContent: 'Nhìn mặt Lu cưng xỉu! Sáng Chủ nhật 7h cho Miu Corgi ra chạy chung nha!',
        mentions: [],
        isExpert: false,
        hasHealthDisclaimer: false,
        reactions: { paw: 5, helpful: 1 },
        createdAt: '1 giờ trước',
      },
      {
        id: 'cmt-2',
        postId: 'post-1',
        authorId: 'user-vet',
        authorName: 'BS. Nguyễn Văn An',
        authorAvatar:
          'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=300&q=80',
        textContent:
          'Golden lông dày sau khi tắm nhớ sấy thật khô phần kẽ chân và vành tai để phòng viêm da ẩm nhé mẹ Mai!',
        mentions: ['@mai_petmom'],
        isExpert: true,
        expertTitle: 'Bác sĩ Thú y Xác minh · PetCare Q9',
        hasHealthDisclaimer: true,
        reactions: { paw: 14, helpful: 19 },
        createdAt: '45 phút trước',
      },
    ],
  },
  {
    id: 'post-expert-tip',
    authorId: 'user-vet',
    authorName: 'BS. Nguyễn Văn An',
    authorUsername: 'dr_an_petcare',
    authorAvatar:
      'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=300&q=80',
    authorIsVip: true,
    petIds: [],
    petName: 'Chuyên gia Thú y',
    petBreed: 'PetCare Clinic Q9',
    petAvatar:
      'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=300&q=80',
    contentType: 'tip',
    textContent:
      '3 dấu hiệu phân biệt chó bị say nắng khi đi dạo trưa và mệt thông thường:\n1. Thở gấp kèm lưỡi đỏ sẫm.\n2. Chảy nước dãi đặc, bước đi chậm.\n3. Thân nhiệt cao.\nNên mang theo bình nước gấp gọn và tránh mặt đường nhựa nóng từ 10h đến 16h.',
    media: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80',
        aspectRatio: '16:9',
      },
    ],
    hashtags: ['#MẹoChămSóc', '#TiêmPhòng', '#DắtDạo', '#AnToànChoBoss'],
    location: {
      name: 'TP. Thủ Đức (Quận 9)',
      approximate: true,
      point: { lat: 10.8385, lng: 106.8241 },
    },
    speciesTags: ['dog', 'cat'],
    breedTags: ['golden_retriever', 'corgi'],
    topicTags: ['health', 'walk'],
    visibility: 'public',
    isExpertContent: true,
    expertTitle: 'Bác sĩ Thú y · 9 năm kinh nghiệm',
    expertVerified: true,
    hasHealthDisclaimer: true,
    isSponsored: false,
    feedSource: 'expert',
    engagement: {
      pawCount: 112,
      commentCount: 1,
      shareCount: 38,
      saveCount: 64,
      reactionBreakdown: {
        paw: 42,
        heart_eyes: 10,
        laughing: 0,
        worried: 4,
        helpful: 56,
      },
    },
    userReaction: 'helpful',
    isBookmarked: true,
    bookmarkFolder: 'Mẹo chăm sóc',
    moderationStatus: 'approved',
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
    comments: [
      {
        id: 'cmt-3',
        postId: 'post-expert-tip',
        authorId: 'user-minh',
        authorName: 'Minh Khôi',
        authorAvatar:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
        textContent: 'Bài viết hữu ích quá bác sĩ ơi, mình lưu lại ngay vào sổ tay chăm Boss!',
        mentions: [],
        isExpert: false,
        hasHealthDisclaimer: false,
        reactions: { paw: 3, helpful: 4 },
        createdAt: '3 giờ trước',
      },
    ],
  },
  {
    id: 'post-question-1',
    authorId: 'user-linh',
    authorName: 'Khánh Linh',
    authorUsername: 'linh_meoanh',
    authorAvatar:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
    petIds: ['pet-milo'],
    petName: 'Milo',
    petBreed: 'Mèo Anh Lông Ngắn',
    petAvatar:
      'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=300&q=80',
    contentType: 'question',
    textContent:
      'Mèo 4 tháng tuổi nhà mình mới tiêm phòng mũi 2 về hơi mệt và ăn ít bữa tối nay thì có bình thường không mọi người? Theo dõi bao lâu thì cần đưa lại phòng khám?',
    media: [],
    hashtags: ['#MèoAnh', '#TiêmPhòng', '#HỏiĐápSứcKhỏe'],
    location: {
      name: 'Masteri Thảo Điền Q2',
      approximate: true,
      point: { lat: 10.8021, lng: 106.7422 },
    },
    speciesTags: ['cat'],
    breedTags: ['british_shorthair'],
    topicTags: ['vaccination', 'nutrition'],
    visibility: 'public',
    isExpertContent: false,
    expertVerified: false,
    hasHealthDisclaimer: true,
    isSponsored: false,
    feedSource: 'local',
    engagement: {
      pawCount: 19,
      commentCount: 1,
      shareCount: 2,
      saveCount: 15,
      reactionBreakdown: {
        paw: 5,
        heart_eyes: 0,
        laughing: 0,
        worried: 8,
        helpful: 6,
      },
    },
    moderationStatus: 'approved',
    createdAt: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
    comments: [
      {
        id: 'cmt-4',
        postId: 'post-question-1',
        authorId: 'user-vet',
        authorName: 'BS. Nguyễn Văn An',
        authorAvatar:
          'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=300&q=80',
        textContent:
          'Chào bạn! Sau tiêm vắc-xin 12–24h đầu bé có thể sốt nhẹ và mệt mỏi. Bạn chuẩn bị sẵn nước ấm và pate mềm cho bé. Tuy nhiên nếu bé sưng phù mặt, nôn mửa hoặc mệt quá 24h thì đưa bé tới bác sĩ thú y kiểm tra ngay nhé!',
        mentions: ['@linh_meoanh'],
        isExpert: true,
        expertTitle: 'Bác sĩ Thú y Xác minh · PetCare Q9',
        hasHealthDisclaimer: true,
        reactions: { paw: 12, helpful: 27 },
        createdAt: '2 giờ trước',
      },
    ],
  },
  {
    id: 'post-sponsored-1',
    authorId: 'partner-spa-abc',
    authorName: 'PetSpa Bubble & Paws',
    authorUsername: 'petspa_bubble',
    authorAvatar:
      'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=300&q=80',
    petIds: [],
    petName: 'Đối tác Xác minh',
    petBreed: 'Grooming & Organic Spa · Q9',
    petAvatar:
      'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=300&q=80',
    contentType: 'service_review',
    textContent:
      'Ưu đãi cho cư dân Vinhomes và Thủ Đức: Giảm 20% gói tắm thảo dược và cắt tỉa cho bé mới đặt lịch qua Pawty. Dùng sữa tắm hữu cơ dịu nhẹ và phòng sấy êm.',
    media: [
      {
        type: 'image',
        url: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=900&q=80',
        aspectRatio: '16:9',
      },
    ],
    hashtags: ['#GroomingSG', '#PetSpaXácMinh', '#VinhomesQ9'],
    location: {
      name: 'Manhattan Glory, Vinhomes Grand Park Q9',
      approximate: true,
      point: { lat: 10.8405, lng: 106.8312 },
    },
    speciesTags: ['dog', 'cat'],
    breedTags: [],
    topicTags: ['grooming'],
    visibility: 'public',
    isExpertContent: false,
    expertVerified: true,
    hasHealthDisclaimer: false,
    isSponsored: true,
    sponsorPartnerId: 'partner-1',
    sponsorCtaText: 'Đặt lịch ngay (-20%)',
    sponsorDiscountBadge: '-20% Boss mới',
    feedSource: 'partner',
    engagement: {
      pawCount: 34,
      commentCount: 0,
      shareCount: 6,
      saveCount: 18,
      reactionBreakdown: {
        paw: 24,
        heart_eyes: 8,
        laughing: 0,
        worried: 0,
        helpful: 2,
      },
    },
    moderationStatus: 'approved',
    createdAt: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
    comments: [],
  },
];

export const INITIAL_GROUPS: CommunityGroup[] = [
  {
    id: 'grp-1',
    name: 'Pet Lovers Vinhomes Grand Park Q9',
    description: 'Cộng đồng cư dân nuôi chó mèo tại Vinhomes Q9 — giao lưu dắt dạo, hỗ trợ trông hộ khi bận.',
    type: 'area',
    avatarUrl:
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=300&q=80',
    coverUrl:
      'https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&w=800&q=80',
    area: 'TP. Thủ Đức (Quận 9)',
    isPrivate: false,
    rules: [
      'Luôn đeo dây dắt và mang túi dọn vệ sinh khi offline công viên',
      'Không đăng bài mua bán, phối giống thương mại',
      'Tôn trọng quy định chung cư',
    ],
    memberCount: 412,
    isJoined: true,
    moderatorNames: ['Mai Nguyễn', 'BS. Nguyễn Văn An'],
  },
  {
    id: 'grp-2',
    name: 'Hội Golden & Corgi Sài Gòn',
    description: 'Chia sẻ kinh nghiệm dinh dưỡng, chăm lông và offline bơi lội cuối tuần cho các bé Golden, Corgi.',
    type: 'breed',
    avatarUrl:
      'https://images.unsplash.com/photo-1633722715463-d30f4f325e24?auto=format&fit=crop&w=300&q=80',
    coverUrl:
      'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80',
    area: 'TP.HCM',
    isPrivate: false,
    rules: ['Chia sẻ văn minh, ưu tiên kinh nghiệm thực tế', 'Cấm spam quảng cáo'],
    memberCount: 890,
    isJoined: true,
    moderatorNames: ['Hòa Trần', 'Trainer Quốc Bảo'],
  },
  {
    id: 'grp-3',
    name: 'Hỏi Đáp Sức Khỏe Boss (Có Bác Sĩ Kiểm Duyệt)',
    description: 'Nơi đặt câu hỏi về tiêm phòng, dinh dưỡng, hành vi có đội ngũ Bác sĩ thú y xác minh phản hồi.',
    type: 'interest',
    avatarUrl:
      'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=300&q=80',
    coverUrl:
      'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=800&q=80',
    area: 'Toàn quốc',
    isPrivate: false,
    rules: ['Không tự ý kê đơn kháng sinh', 'Mô tả rõ tuổi, cân nặng và triệu chứng của Boss'],
    memberCount: 1540,
    isJoined: false,
    moderatorNames: ['BS. Nguyễn Văn An', 'BS. Trần Minh Thảo'],
  },
  {
    id: 'grp-4',
    name: 'Nhóm Dắt Dạo Sáng 6h30 — Phú Mỹ Hưng Q7',
    description: 'Hẹn nhau dắt cún đi bộ quanh Hồ Bán Nguyệt & Công viên Cầu Ánh Sao mỗi sáng.',
    type: 'activity',
    avatarUrl:
      'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=300&q=80',
    coverUrl:
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=800&q=80',
    area: 'Quận 7',
    isPrivate: false,
    rules: ['Chỉ nhận các bé đã tiêm đủ vắc-xin 7 bệnh và phòng dại'],
    memberCount: 235,
    isJoined: false,
    moderatorNames: ['Minh Khôi'],
  },
];

export const INITIAL_PLACES: PetFriendlyPlace[] = [
  {
    id: 'place-1',
    name: 'Công viên Ánh Sáng Vinhomes Grand Park',
    category: 'park',
    district: 'TP. Thủ Đức (Quận 9)',
    address: 'Khu đô thị Vinhomes Grand Park, Phường Long Thạnh Mỹ',
    location: { lat: 10.8428, lng: 106.8315 },
    distanceMeters: 420,
    rating: 4.8,
    reviewCount: 64,
    isVerifiedPetFriendly: true,
    features: ['Bãi cỏ rộng', 'Trạm túi vệ sinh', 'Khu vực cho chó chạy bộ sáng sớm'],
    imageUrl:
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'place-2',
    name: 'Paws & Beans Garden Café',
    category: 'cafe',
    district: 'TP. Thủ Đức (Quận 9)',
    address: 'Số 18 Đường T12, Khu Manhattan, Vinhomes Q9',
    location: { lat: 10.8396, lng: 106.8264 },
    distanceMeters: 680,
    rating: 4.7,
    reviewCount: 41,
    isVerifiedPetFriendly: true,
    features: ['Menu nước & bánh thưởng cho Boss', 'Sân vườn rào kín an toàn', 'Miễn phí khay nước'],
    imageUrl:
      'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'place-3',
    name: 'Công viên Gia Định (Khu C Pet Zone)',
    category: 'park',
    district: 'Phú Nhuận / Gò Vấp',
    address: 'Đường Hoàng Minh Giám, Phường 3',
    location: { lat: 10.8125, lng: 106.6761 },
    distanceMeters: 1200,
    rating: 4.6,
    reviewCount: 112,
    isVerifiedPetFriendly: true,
    features: ['Nhiều bóng cây cổ thụ', 'Đông hội Golden & Corgi cuối tuần'],
    imageUrl:
      'https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&w=700&q=80',
  },
  {
    id: 'place-4',
    name: 'Hồ Bán Nguyệt — Outdoor Pet Walk',
    category: 'park',
    district: 'Quận 7',
    address: 'Khu đô thị Phú Mỹ Hưng, Quận 7',
    location: { lat: 10.7292, lng: 106.7195 },
    distanceMeters: 1500,
    rating: 4.9,
    reviewCount: 95,
    isVerifiedPetFriendly: true,
    features: ['Đường dạo bộ ven hồ thoáng mát', 'Nhiều quán cafe outdoor cho mang thú cưng'],
    imageUrl:
      'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=700&q=80',
  },
];

export const INITIAL_RADAR_CANDIDATES: RadarCandidate[] = [
  {
    id: 'rad-1',
    userId: 'user-hoa',
    ownerName: 'Hòa Trần',
    ownerAvatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    ownerIsVip: true,
    neighborhood: 'Vinhomes Grand Park - Khu Origami',
    distanceMeters: 320,
    location: { lat: 10.8435, lng: 106.8271 },
    compatibilityScore: 96,
    matchReason:
      'Cùng khu Vinhomes Q9 (320m) · Đã tiêm đủ vắc-xin 7 bệnh & Dại · Cực kỳ hợp chơi bóng cùng Lu!',
    pet: {
      id: 'pet-miu-corgi',
      householdId: 'hh-hoa',
      ownerId: 'user-hoa',
      name: 'Miu',
      species: 'dog',
      breed: 'Pembroke Welsh Corgi',
      gender: 'female',
      dateOfBirth: '2024-11-02',
      ageDisplay: '1 năm 11 tháng',
      weightKg: 11.5,
      sizeCategory: 'medium',
      energyLevel: 'high',
      avatarUrl:
        'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?auto=format&fit=crop&w=600&q=80',
      coverPhotoUrl:
        'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?auto=format&fit=crop&w=900&q=80',
      isNeutered: true,
      allergies: 'Không có',
      medicalNotes: 'Chân ngắn chạy nhanh, rất thân thiện với chó lớn.',
      vetName: 'BS. Nguyễn Văn An — PetCare Q9',
      vetContact: '0909 112 233',
      vaccinationStatus: 'full',
      lastVaccineDate: '2026-09-10',
      isPublic: true,
      followerCount: 310,
      behaviors: [
        { id: 'mb-1', petId: 'pet-miu-corgi', category: 'personality', label: 'Thân thiện' },
        { id: 'mb-2', petId: 'pet-miu-corgi', category: 'good_habit', label: 'Thích chơi bóng' },
        { id: 'mb-3', petId: 'pet-miu-corgi', category: 'good_habit', label: 'Không sủa bậy' },
        { id: 'mb-4', petId: 'pet-miu-corgi', category: 'caution', label: 'Hơi ham ăn bánh thưởng' },
      ],
      vaccinations: [
        {
          id: 'mv-1',
          petId: 'pet-miu-corgi',
          vaccineName: 'Vắc-xin 7 bệnh & Phòng dại',
          dateGiven: '2026-09-10',
          nextDueDate: '2027-09-10',
          vetName: 'PetCare Q9',
          verified: true,
        },
      ],
      weightHistory: [{ date: '10/2026', weightKg: 11.5 }],
    },
  },
  {
    id: 'rad-2',
    userId: 'user-khoi',
    ownerName: 'Minh Khôi',
    ownerAvatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    ownerIsVip: false,
    neighborhood: 'Vinhomes Grand Park - Khu Beverly',
    distanceMeters: 540,
    location: { lat: 10.8442, lng: 106.8325 },
    compatibilityScore: 91,
    matchReason:
      'Cách bạn 540m · Cùng khung giờ dắt dạo 6h30 sáng · Tính cách điềm tĩnh, đã triệt sản.',
    pet: {
      id: 'pet-bobi',
      householdId: 'hh-khoi',
      ownerId: 'user-khoi',
      name: 'Bobi',
      species: 'dog',
      breed: 'Standard Poodle',
      gender: 'male',
      dateOfBirth: '2023-05-20',
      ageDisplay: '3 năm 5 tháng',
      weightKg: 18.0,
      sizeCategory: 'medium',
      energyLevel: 'medium',
      avatarUrl:
        'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80',
      coverPhotoUrl:
        'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=900&q=80',
      isNeutered: true,
      allergies: 'Không',
      medicalNotes: 'Đã huấn luyện cơ bản',
      vetName: 'PetCare Q9',
      vetContact: '0909 112 233',
      vaccinationStatus: 'full',
      lastVaccineDate: '2026-07-01',
      isPublic: true,
      followerCount: 142,
      behaviors: [
        { id: 'bb-1', petId: 'pet-bobi', category: 'personality', label: 'Điềm tĩnh' },
        { id: 'bb-2', petId: 'pet-bobi', category: 'good_habit', label: 'Biết bắt tay & ngồi chờ' },
        { id: 'bb-3', petId: 'pet-bobi', category: 'caution', label: 'Sợ tiếng còi xe tải lớn' },
      ],
      vaccinations: [],
      weightHistory: [{ date: '10/2026', weightKg: 18.0 }],
    },
  },
  {
    id: 'rad-3',
    userId: 'user-thao',
    ownerName: 'Phương Thảo',
    ownerAvatar:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=300&q=80',
    ownerIsVip: true,
    neighborhood: 'Masteri Centre Point - Q9',
    distanceMeters: 780,
    location: { lat: 10.8389, lng: 106.8245 },
    compatibilityScore: 89,
    matchReason: 'Cùng nuôi Mèo Anh Lông Ngắn · Có thể hỗ trợ trông chéo cuối tuần!',
    pet: {
      id: 'pet-mochi',
      householdId: 'hh-thao',
      ownerId: 'user-thao',
      name: 'Mochi',
      species: 'cat',
      breed: 'Scottish Fold',
      gender: 'female',
      dateOfBirth: '2025-01-10',
      ageDisplay: '1 năm 9 tháng',
      weightKg: 3.9,
      sizeCategory: 'tiny',
      energyLevel: 'low',
      avatarUrl:
        'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80',
      coverPhotoUrl:
        'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=900&q=80',
      isNeutered: true,
      allergies: 'Không',
      medicalNotes: 'Ngoan hiền, thích nằm sưởi nắng ban công',
      vetName: 'VetClinic Q9',
      vetContact: '0908 665 544',
      vaccinationStatus: 'full',
      lastVaccineDate: '2026-09-05',
      isPublic: true,
      followerCount: 198,
      behaviors: [
        { id: 'mc-1', petId: 'pet-mochi', category: 'personality', label: 'Ngọt ngào' },
        { id: 'mc-2', petId: 'pet-mochi', category: 'good_habit', label: 'Không kêu đêm' },
        { id: 'mc-3', petId: 'pet-mochi', category: 'caution', label: 'Nhút nhát với người lạ 10 phút đầu' },
      ],
      vaccinations: [],
      weightHistory: [{ date: '10/2026', weightKg: 3.9 }],
    },
  },
];

export const INITIAL_MATCHES: MatchRecord[] = [
  {
    id: 'match-1',
    userAId: 'user-mai',
    userBId: 'user-hoa',
    petAId: 'pet-lu',
    petBId: 'pet-miu-corgi',
    partnerOwnerName: 'Hòa Trần',
    partnerOwnerAvatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    partnerPetName: 'Miu',
    partnerPetBreed: 'Corgi',
    partnerPetAvatar:
      'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?auto=format&fit=crop&w=300&q=80',
    neighborhood: 'Vinhomes Grand Park - Origami',
    distanceMeters: 320,
    matchReason: 'Cùng thích dắt dạo sáng Chủ nhật & Đã tiêm phòng đầy đủ',
    matchedAt: 'Hôm qua',
  },
];

export const INITIAL_WALK_APPOINTMENTS: WalkAppointment[] = [
  {
    id: 'walk-1',
    conversationId: 'conv-1',
    initiatorId: 'user-hoa',
    inviteeId: 'user-mai',
    partnerName: 'Hòa Trần (Miu Corgi)',
    petNames: ['Lu', 'Miu'],
    scheduledDate: 'Chủ nhật, 03/11/2026',
    scheduledTime: '07:00 AM',
    locationName: 'Công viên Ánh Sáng Vinhomes Grand Park',
    locationAddress: 'Điểm hẹn trung điểm (Cách bạn 420m)',
    distanceFromMidpointMeters: 420,
    locationPoint: { lat: 10.8428, lng: 106.8315 },
    note: 'Mình mang bóng tennis và bình nước cho 2 bé nha!',
    status: 'pending',
    createdAt: '10 phút trước',
  },
];

export const INITIAL_CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-1',
    type: 'direct',
    title: 'Hòa Trần · Bé Miu',
    subtitle: '@hoa_corgi · Cách 320m',
    avatarUrl:
      'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?auto=format&fit=crop&w=300&q=80',
    partnerUserId: 'user-hoa',
    partnerLocation: { lat: 10.8435, lng: 106.8271 },
    isOnline: true,
    unreadCount: 1,
    lastMessageText: 'Đã gửi lời hẹn đi dạo tại Công viên Ánh Sáng',
    lastMessageAt: '10 phút',
  },
  {
    id: 'conv-circle',
    type: 'circle',
    title: 'Nhóm chăm sóc nhà Lu & Bơ',
    subtitle: 'Mai, Cô Lan, Chú Hùng',
    avatarUrl:
      'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=300&q=80',
    isOnline: true,
    unreadCount: 0,
    lastMessageText: 'Chú Hùng: Lu ăn hết bữa sáng rồi nha.',
    lastMessageAt: '55 phút',
  },
  {
    id: 'conv-partner',
    type: 'direct',
    title: 'PetSpa Bubble & Paws',
    subtitle: 'Cắt tỉa & Tắm thảo dược · Quận 9',
    avatarUrl:
      'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=300&q=80',
    isOnline: true,
    unreadCount: 0,
    lastMessageText: 'Lịch hẹn Thứ 7 lúc 10:00 của Lu đã được xác nhận.',
    lastMessageAt: '2 giờ',
  },
];

export const INITIAL_MESSAGES: Record<string, ChatMessage[]> = {
  'conv-1': [
    {
      id: 'm-1',
      conversationId: 'conv-1',
      senderId: 'user-hoa',
      senderName: 'Hòa Trần',
      senderAvatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      messageType: 'text',
      textContent: 'Chào bạn, Lu thích chơi bóng không? Miu nhà mình mê chạy theo bóng lắm.',
      isRead: true,
      createdAt: '09:15',
    },
    {
      id: 'm-2',
      conversationId: 'conv-1',
      senderId: 'user-mai',
      senderName: 'Mai Nguyễn',
      senderAvatar:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
      messageType: 'text',
      textContent: 'Lu mê bóng lắm. Sổ tiêm của Lu cũng đầy đủ rồi nên yên tâm cho 2 bé chơi chung.',
      isRead: true,
      createdAt: '09:17',
    },
    {
      id: 'm-3',
      conversationId: 'conv-1',
      senderId: 'user-hoa',
      senderName: 'Hòa Trần',
      senderAvatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      messageType: 'walk_invite',
      textContent: 'Cuối tuần dắt dạo ở công viên trung điểm Q9 nha!',
      walkAppointmentId: 'walk-1',
      isRead: false,
      createdAt: '09:20',
    },
  ],
  'conv-circle': [
    {
      id: 'mc-1',
      conversationId: 'conv-circle',
      senderId: 'user-dad',
      senderName: 'Ba Mai',
      senderAvatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
      messageType: 'text',
      textContent: 'Ba vừa dắt Lu đi dạo 3 vòng công viên về, Lu ăn hết bát sáng rồi nha con gái!',
      isRead: true,
      createdAt: '06:50',
    },
    {
      id: 'mc-2',
      conversationId: 'conv-circle',
      senderId: 'user-mai',
      senderName: 'Mai Nguyễn',
      senderAvatar:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
      messageType: 'care_handover',
      textContent: 'Con gửi phiếu bàn giao chăm sóc cuối tuần cho Ba Mẹ xem trước ạ!',
      handoverNoteId: 'ho-1',
      isRead: true,
      createdAt: '07:10',
    },
  ],
  'conv-partner': [
    {
      id: 'mp-1',
      conversationId: 'conv-partner',
      senderId: 'partner-1',
      senderName: 'PetSpa Bubble & Paws',
      senderAvatar:
        'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=300&q=80',
      messageType: 'text',
      textContent:
        'Dạ PetSpa đã ghi nhận lưu ý "Bé Lu hơi sợ tiếng máy sấy lớn", kỹ thuật viên sẽ dùng lồng sấy tĩnh âm cho bé ạ!',
      isRead: true,
      createdAt: 'Hôm qua',
    },
  ],
};

export const INITIAL_PARTNERS: PartnerProfile[] = [
  {
    id: 'partner-1',
    name: 'PetSpa Bubble & Paws',
    type: 'grooming',
    description:
      'Spa chăm sóc thú cưng chuẩn Nhật Bản — Chuyên tắm sục thảo dược, cắt tỉa tạo kiểu không gây căng thẳng cho Boss.',
    address: 'T12-18 Khu Manhattan, Vinhomes Grand Park, TP. Thủ Đức (Q9)',
    district: 'TP. Thủ Đức (Quận 9)',
    location: { lat: 10.8405, lng: 106.8312 },
    distanceMeters: 480,
    phone: '0902 888 999',
    avatarUrl:
      'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=400&q=80',
    coverUrl:
      'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=900&q=80',
    operatingHours: '08:30 – 20:00 (Thứ 2 – Chủ nhật)',
    verificationStatus: 'verified',
    ratingAvg: 4.8,
    reviewCount: 156,
    commissionRatePercent: 12,
    availableSlots: ['09:00', '10:00', '14:00', '15:30', '17:00'],
    services: [
      {
        id: 'srv-1',
        name: 'Tắm thảo dược + Sấy chải phồng',
        priceVnd: 150000,
        durationMin: 60,
        description: 'Bao gồm vệ sinh tai, vắt tuyến hôi, cắt mài móng cơ bản.',
        riskLevel: 'low',
      },
      {
        id: 'srv-2',
        name: 'Cắt tỉa lông tạo kiểu chuyên sâu',
        priceVnd: 200000,
        durationMin: 90,
        description: 'Tạo kiểu theo form giống chuẩn bởi Groomer chứng chỉ quốc tế.',
        riskLevel: 'low',
      },
      {
        id: 'srv-3',
        name: 'Cắt móng & Vệ sinh tai/bàn chân',
        priceVnd: 50000,
        durationMin: 25,
        description: 'Chăm sóc nhanh giúp Boss sạch sẽ mỗi tuần.',
        riskLevel: 'low',
      },
      {
        id: 'srv-4',
        name: 'Combo Full Grooming + Spa Sục Ozone',
        priceVnd: 350000,
        durationMin: 120,
        description: 'Trọn gói 9 bước tắm sục khử mùi, dưỡng lông bóng mượt và cắt tỉa toàn diện.',
        riskLevel: 'low',
      },
    ],
    reviews: [
      {
        id: 'rev-1',
        bookingId: 'bk-past-1',
        userId: 'user-hoa',
        userName: 'Hòa Trần',
        userAvatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
        petName: 'Miu (Corgi)',
        rating: 5,
        textContent:
          'Các bạn nhân viên cực kỳ kiên nhẫn, Miu tắm xong thơm mùi yến mạch dễ chịu suốt cả tuần!',
        photos: [],
        partnerReply: 'Cảm ơn mẹ Hòa và bé Miu nhiều ạ! Hẹn gặp lại bé tháng sau nhé 🐾',
        createdAt: '5 ngày trước',
      },
    ],
  },
  {
    id: 'partner-2',
    name: 'Phòng Khám Thú Y PetCare Quốc Tế Q9',
    type: 'vet',
    description:
      'Khám sức khỏe định kỳ, tiêm phòng vắc-xin chính hãng, xét nghiệm máu & tư vấn dinh dưỡng bởi đội ngũ Bác sĩ thú y giàu kinh nghiệm.',
    address: 'Số 245 Nguyễn Xiển, Phường Long Thạnh Mỹ, TP. Thủ Đức (Q9)',
    district: 'TP. Thủ Đức (Quận 9)',
    location: { lat: 10.8385, lng: 106.8241 },
    distanceMeters: 750,
    phone: '0909 112 233',
    avatarUrl:
      'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=400&q=80',
    coverUrl:
      'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=900&q=80',
    operatingHours: '08:00 – 21:00 (Có trực cấp cứu)',
    verificationStatus: 'verified',
    ratingAvg: 4.9,
    reviewCount: 214,
    commissionRatePercent: 12,
    availableSlots: ['08:30', '09:30', '11:00', '15:00', '16:30'],
    services: [
      {
        id: 'srv-5',
        name: 'Khám sức khỏe tổng quát định kỳ',
        priceVnd: 180000,
        durationMin: 30,
        description: 'Kiểm tra tim phổi, răng miệng, da lông, cân nặng và tư vấn chế độ ăn.',
        riskLevel: 'low',
      },
      {
        id: 'srv-6',
        name: 'Tiêm phòng Vắc-xin 7 bệnh + Cập nhật Sổ tiêm điện tử',
        priceVnd: 280000,
        durationMin: 30,
        description: 'Khám sàng lọc nhiệt độ trước tiêm và đóng dấu xác nhận Verified trên Pawty.',
        riskLevel: 'low',
      },
      {
        id: 'srv-7',
        name: 'Lấy cao răng siêu âm an toàn',
        priceVnd: 450000,
        durationMin: 60,
        description: 'Vệ sinh mảng bám, khử mùi hôi miệng cho chó mèo.',
        riskLevel: 'low',
      },
    ],
    reviews: [
      {
        id: 'rev-2',
        bookingId: 'bk-past-2',
        userId: 'user-mai',
        userName: 'Mai Nguyễn',
        userAvatar:
          'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
        petName: 'Lu (Golden)',
        rating: 5,
        textContent: 'Bác sĩ An khám rất kỹ và giải thích nhẹ nhàng, cập nhật sổ tiêm lên app cực nhanh.',
        photos: [],
        createdAt: '2 tuần trước',
      },
    ],
  },
  {
    id: 'partner-3',
    name: 'PawWalkers — Dịch Vụ Dắt Dạo & Trông Giữ Ban Ngày',
    type: 'walker',
    description:
      'Đội ngũ Dog Walker & Pet Sitter đã xác minh lý lịch, có GPS tracking hành trình dắt dạo và gửi ảnh cập nhật mỗi 15 phút.',
    address: 'Khu vực Vinhomes Grand Park & Thảo Điền, TP. Thủ Đức',
    district: 'TP. Thủ Đức (Quận 9)',
    location: { lat: 10.8421, lng: 106.8298 },
    distanceMeters: 390,
    phone: '0933 445 566',
    avatarUrl:
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=400&q=80',
    coverUrl:
      'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80',
    operatingHours: '06:00 – 19:30',
    verificationStatus: 'verified',
    ratingAvg: 4.7,
    reviewCount: 78,
    commissionRatePercent: 15,
    availableSlots: ['06:30', '07:30', '16:30', '17:30'],
    services: [
      {
        id: 'srv-8',
        name: 'Dắt dạo 1-kèm-1 (45 phút + Báo cáo ảnh)',
        priceVnd: 120000,
        durationMin: 45,
        description: 'Dắt dạo riêng 1 Boss theo đúng thói quen và lưu ý hành vi trên hồ sơ.',
        riskLevel: 'medium',
      },
      {
        id: 'srv-9',
        name: 'Trông giữ ban ngày tại nhà (Pet Sitting 4 giờ)',
        priceVnd: 250000,
        durationMin: 240,
        description: 'Cho ăn, chơi cùng Boss và dọn vệ sinh khi chủ nuôi bận họp.',
        riskLevel: 'medium',
      },
    ],
    reviews: [],
  },
];

export const INITIAL_BOOKINGS: ServiceBooking[] = [
  {
    id: 'bk-1',
    userId: 'user-mai',
    userName: 'Mai Nguyễn',
    partnerId: 'partner-1',
    partnerName: 'PetSpa Bubble & Paws',
    partnerType: 'grooming',
    partnerAvatar:
      'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=300&q=80',
    petId: 'pet-lu',
    petName: 'Lu',
    serviceNames: ['Combo Full Grooming + Spa Sục Ozone'],
    totalPriceVnd: 350000,
    commissionVnd: 42000,
    scheduledDate: 'Thứ 7, 02/11/2026',
    scheduledTime: '10:00',
    note: 'Boss hơi sợ tiếng máy sấy lớn, nhờ spa sấy nhiệt ấm êm.',
    status: 'confirmed',
    hasReviewed: false,
    opsMinutesSpent: 8,
    createdAt: '2026-10-28T14:00:00Z',
  },
  {
    id: 'bk-2',
    userId: 'user-mai',
    userName: 'Mai Nguyễn',
    partnerId: 'partner-2',
    partnerName: 'Phòng Khám Thú Y PetCare Quốc Tế Q9',
    partnerType: 'vet',
    partnerAvatar:
      'https://images.unsplash.com/photo-1628009368231-7bb7cfcb0def?auto=format&fit=crop&w=300&q=80',
    petId: 'pet-lu',
    petName: 'Lu',
    serviceNames: ['Tiêm phòng Vắc-xin 7 bệnh + Cập nhật Sổ tiêm điện tử'],
    totalPriceVnd: 280000,
    commissionVnd: 33600,
    scheduledDate: '15/10/2026',
    scheduledTime: '09:30',
    note: 'Tái chủng định kỳ hằng năm',
    status: 'completed',
    hasReviewed: true,
    opsMinutesSpent: 6,
    createdAt: '2026-10-14T10:00:00Z',
  },
];

export const INITIAL_SOS_ALERTS: SosAlert[] = [];

export const INITIAL_REPORTS: ContentReport[] = [
  {
    id: 'rep-1',
    reporterId: 'user-hoa',
    reporterName: 'Hòa Trần',
    targetType: 'post',
    targetId: 'post-flagged-demo',
    targetPreview: 'Cần phối giống Poodle đực giống chuẩn tại Q9 giá rẻ...',
    reason: 'inappropriate',
    description: 'Bài viết vi phạm quy định cấm phối giống/mua bán thú cưng của Pawty.',
    status: 'pending',
    createdAt: '30 phút trước',
  },
];

export const INITIAL_DASHBOARD_METRICS: NorthStarDashboardMetrics = {
  activeHouseholdsMonthly: 127,
  northStarQualifiedHouseholds: 45,
  mrrVnd: 3080000,
  bookingCommissionRevenueVnd: 1500000,
  vipSubscriptionRevenueVnd: 980000,
  nativeAdsRevenueVnd: 600000,
  sosRevenueVnd: 0,
  onboardingCompletionRate: 78,
  activationRate7d: 64,
  circleInviteRate14d: 36,
  d1Retention: 54,
  d7Retention: 38,
  d28Retention: 24,
  w4ActiveRate: 42,
  bookingCompletionRate: 87,
  avgPartnerRating: 4.8,
  avgOpsMinutesPerBooking: 11,
  moderationFlagRate: 2.4,
};

export interface SearchableUserTag {
  id: string;
  tag: string;
  displayName: string;
  avatarUrl: string;
  area: string;
  petsSummary: string;
}

export const SEARCHABLE_USER_DIRECTORY: SearchableUserTag[] = [
  {
    id: 'user-dad',
    tag: '@hungle',
    displayName: 'Hùng Lê',
    avatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80',
    area: 'Vinhomes Grand Park',
    petsSummary: 'Chăm cùng bé Lu',
  },
  {
    id: 'user-mom',
    tag: '@lantran',
    displayName: 'Lan Trần',
    avatarUrl:
      'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=300&q=80',
    area: 'Vinhomes Grand Park',
    petsSummary: 'Chăm cùng bé Lu',
  },
  {
    id: 'user-minh',
    tag: '@minhpham',
    displayName: 'Minh Phạm',
    avatarUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=300&q=80',
    area: 'Origami - Vinhomes Q9',
    petsSummary: 'Nuôi bé Bơ (Corgi)',
  },
  {
    id: 'user-thao',
    tag: '@thaovy',
    displayName: 'Thảo Vy',
    avatarUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
    area: 'Thảo Điền, Quận 2',
    petsSummary: 'Nuôi bé Cam (Mèo Anh)',
  },
  {
    id: 'user-khanh',
    tag: '@khanhhoang',
    displayName: 'Khánh Hoàng',
    avatarUrl:
      'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=300&q=80',
    area: 'Beverly - Vinhomes Q9',
    petsSummary: 'Nuôi bé Sữa (Poodle)',
  },
];

export interface AppNotificationItem {
  id: string;
  type: 'care_invite' | 'walk_invite' | 'task_done' | 'system';
  title: string;
  body: string;
  createdAt: string;
  isRead: boolean;
  invitePayload?: {
    fromUserName: string;
    fromUserTag: string;
    petId: string;
    petName: string;
    petSpecies: 'dog' | 'cat';
    petBreed: string;
    petWeightKg: number;
    petAgeLabel: string;
    petAvatarUrl: string;
    status: 'pending' | 'accepted' | 'declined';
  };
}

export const INITIAL_NOTIFICATIONS: AppNotificationItem[] = [
  {
    id: 'notif-invite-1',
    type: 'care_invite',
    title: 'Lời mời chăm thú cưng chung',
    body: '@minhpham (Minh Phạm) mời bạn cùng chăm bé Cốm (Corgi · 11kg).',
    createdAt: '10 phút trước',
    isRead: false,
    invitePayload: {
      fromUserName: 'Minh Phạm',
      fromUserTag: '@minhpham',
      petId: 'pet-com-shared',
      petName: 'Cốm',
      petSpecies: 'dog',
      petBreed: 'Pembroke Welsh Corgi',
      petWeightKg: 11,
      petAgeLabel: '1.5 tuổi',
      petAvatarUrl:
        'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?auto=format&fit=crop&w=600&q=80',
      status: 'pending',
    },
  },
  {
    id: 'notif-2',
    type: 'task_done',
    title: 'Đã hoàn thành việc chăm sóc',
    body: 'Chú Hùng (@hungle) đã dắt Lu đi dạo sáng 35 phút.',
    createdAt: '1 giờ trước',
    isRead: false,
  },
];

export const SUGGESTED_HASHTAGS: string[] = [
  '#DiDaoChieu',
  '#ChamSocCho',
  '#ChamSocMeo',
  '#DinhDuong',
  '#TimBanDiDao',
  '#KinhNghiemNuoi',
  '#GocDangYeu',
  '#ThuY',
];

export const SAMPLE_POST_PHOTOS: { id: string; label: string; url: string }[] = [
  {
    id: 'sample-1',
    label: 'Chó đi dạo công viên',
    url: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'sample-2',
    label: 'Corgi chạy trên cỏ',
    url: 'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'sample-3',
    label: 'Mèo nằm sưởi nắng',
    url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'sample-4',
    label: 'Tắm & chải lông',
    url: 'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=900&q=80',
  },
];

export type WebThemeId = 'coral' | 'mint' | 'mocha' | 'dark';

export interface WebThemePalette {
  id: WebThemeId;
  name: string;
  description: string;
  primary: string;
  primarySoft: string;
  bg: string;
  surface: string;
  text: string;
  textSoft: string;
  border: string;
}

export const WEB_THEMES: Record<WebThemeId, WebThemePalette> = {
  coral: {
    id: 'coral',
    name: 'San Hô Ấm',
    description: 'Tông cam san hô nhẹ nhàng, nền kem ấm áp',
    primary: '#E86A58',
    primarySoft: '#FDECE9',
    bg: '#FAF8F5',
    surface: '#FFFFFF',
    text: '#23201E',
    textSoft: '#605A55',
    border: '#EAE4DC',
  },
  mint: {
    id: 'mint',
    name: 'Xanh Lá Dịu',
    description: 'Tông xanh lá tự nhiên, mát mắt và thư giãn',
    primary: '#2F8F78',
    primarySoft: '#E3F4EF',
    bg: '#F6FAF8',
    surface: '#FFFFFF',
    text: '#1D2825',
    textSoft: '#52635E',
    border: '#DCE8E3',
  },
  mocha: {
    id: 'mocha',
    name: 'Nâu Latte',
    description: 'Tông nâu cà phê sữa tối giản, sang trọng',
    primary: '#9C6B4E',
    primarySoft: '#F5EBE4',
    bg: '#FAF7F4',
    surface: '#FFFFFF',
    text: '#29221E',
    textSoft: '#695C54',
    border: '#E8DFD8',
  },
  dark: {
    id: 'dark',
    name: 'Tối Dịu Mắt',
    description: 'Nền tối ấm áp, giảm mỏi mắt khi dùng ban đêm',
    primary: '#F07B6B',
    primarySoft: '#362523',
    bg: '#161514',
    surface: '#211F1D',
    text: '#F5F2EE',
    textSoft: '#B8B0A8',
    border: '#332F2C',
  },
};


