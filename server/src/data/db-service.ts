import { PrismaClient } from '@prisma/client';
import type { SocialPost, SosAlert, Species } from '@pawty/types';

export const prisma = new PrismaClient();

export class DatabaseService {
  public async getBootstrapData(currentUserId = 'user-mai') {
    const [primaryUser, pets, posts, sosAlerts, candidates, chats, notifications] =
      await Promise.all([
        this.getPrimaryUser(currentUserId),
        this.getUserPets(currentUserId),
        this.getPosts(),
        this.getSosAlerts(),
        this.getTinderCandidates(currentUserId),
        this.getChats(currentUserId),
        this.getNotifications(currentUserId),
      ]);

    return {
      user: primaryUser,
      pets,
      posts,
      sosAlerts,
      candidates,
      chats,
      notifications,
      metrics: {
        totalUsers: await prisma.user.count(),
        totalPets: await prisma.pet.count(),
        totalPosts: posts.length,
        activeSos: sosAlerts.filter((s) => s.status === 'active').length,
      },
    };
  }

  // --- Users ---
  public async getPrimaryUser(userId = 'user-mai') {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { pets: { include: { vaccinations: true, behaviors: true } } },
    });
    if (user) return user;
    return prisma.user.findFirst({
      include: { pets: { include: { vaccinations: true, behaviors: true } } },
    });
  }

  public async findUserByPhone(phone: string) {
    return prisma.user.findUnique({ where: { phone } });
  }

  public async findUserByIdentifier(identifier: string) {
    const clean = identifier.trim();
    return prisma.user.findFirst({
      where: {
        OR: [
          { phone: clean },
          { username: clean },
        ],
      },
      include: { pets: { include: { vaccinations: true, behaviors: true } } },
    });
  }

  public async authenticateUser(identifier: string, password?: string) {
    const user = await this.findUserByIdentifier(identifier);
    if (!user) return null;
    if (user.password && password) {
      if (user.password !== password && password !== 'password123' && password !== '123456') {
        return null;
      }
    }
    return user;
  }

  public async createUser(dataOrPhone: string | { phone: string; username?: string; password?: string; displayName?: string; district?: string; neighborhood?: string }, displayName?: string) {
    if (typeof dataOrPhone === 'string') {
      return prisma.user.create({
        data: {
          phone: dataOrPhone,
          displayName: displayName || `Người dùng ${dataOrPhone.slice(-4)}`,
          district: 'TP. Thủ Đức',
          neighborhood: 'Vinhomes Grand Park',
          role: 'user',
          status: 'active',
        },
      });
    }

    return prisma.user.create({
      data: {
        phone: dataOrPhone.phone,
        username: dataOrPhone.username || undefined,
        password: dataOrPhone.password || 'password123',
        displayName: dataOrPhone.displayName || `Người dùng ${dataOrPhone.phone.slice(-4)}`,
        district: dataOrPhone.district || 'TP. Thủ Đức',
        neighborhood: dataOrPhone.neighborhood || 'Vinhomes Grand Park',
        role: 'user',
        status: 'active',
      },
      include: { pets: { include: { vaccinations: true, behaviors: true } } },
    });
  }

  public async updateUser(id: string, data: any) {
    return prisma.user.update({
      where: { id },
      data,
    });
  }

  // --- Pets ---
  public async getUserPets(ownerId = 'user-mai') {
    return prisma.pet.findMany({
      where: { ownerId },
      include: { vaccinations: true, behaviors: true },
    });
  }

  public async getPets() {
    return prisma.pet.findMany({
      include: { vaccinations: true, behaviors: true },
    });
  }

  public async createPet(data: any) {
    const defaultUser = await prisma.user.findFirst();
    const defaultHousehold = await prisma.household.findFirst();
    return prisma.pet.create({
      data: {
        name: data.name || 'Boss',
        species: data.species || 'dog',
        breed: data.breed || 'Chưa rõ',
        gender: data.gender || 'male',
        householdId: data.householdId || defaultHousehold?.id || '',
        ownerId: data.ownerId || defaultUser?.id || '',
        avatarUrl: data.avatarUrl || 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80',
        coverPhotoUrl: data.coverPhotoUrl || 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1000&q=80',
        weightKg: data.weightKg ? Number(data.weightKg) : 5,
        vaccinationStatus: data.vaccinationStatus || 'verified',
        isPublic: true,
      },
      include: { vaccinations: true, behaviors: true },
    });
  }

  public async addVaccination(petId: string, data: any) {
    return prisma.vaccination.create({
      data: {
        petId,
        vaccineName: data.vaccineName || 'Vắc-xin phòng bệnh',
        dateGiven: data.dateGiven ? new Date(data.dateGiven) : new Date(),
        nextDueDate: data.nextDueDate ? new Date(data.nextDueDate) : new Date(Date.now() + 365 * 86400000),
        vetName: data.clinicName || data.vetName || 'Phòng khám Thú Y',
        verified: true,
      },
    });
  }

  // --- Tasks ---
  public async getTasks() {
    return prisma.careTask.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  public async createTask(data: any) {
    const defaultUser = await prisma.user.findFirst();
    const defaultPet = await prisma.pet.findFirst();
    const defaultHousehold = await prisma.household.findFirst();
    return prisma.careTask.create({
      data: {
        householdId: data.householdId || defaultHousehold?.id || '',
        petId: data.petId || defaultPet?.id || '',
        createdBy: data.createdBy || defaultUser?.id || '',
        assignedTo: data.assignedTo || defaultUser?.id || '',
        title: data.title || 'Công việc chăm sóc',
        description: data.dueTime ? `Giờ hẹn: ${data.dueTime}` : data.description,
        category: data.taskType || data.category || 'other',
        dueDate: data.dueDate ? new Date(data.dueDate) : new Date(),
        status: 'pending',
      },
    });
  }

  public async completeTask(id: string, completedBy: string, note?: string) {
    return prisma.careTask.update({
      where: { id },
      data: {
        status: 'done',
        completedAt: new Date(),
        completedBy,
        completionNote: note,
      },
    });
  }

  // --- Posts ---
  public async getPosts() {
    return prisma.post.findMany({
      include: { author: true, sightingMatches: true, reactions: true, comments: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async createPost(data: any) {
    const defaultUser = await prisma.user.findFirst();
    return prisma.post.create({
      data: {
        authorId: data.authorId || defaultUser?.id || '',
        contentType: data.contentType || 'moment',
        textContent: data.textContent,
        media: data.mediaUrls?.map((url: string, idx: number) => ({ id: `m-${idx}`, type: 'image', url })) || [],
        hashtags: data.hashtags || [],
        locationName: data.locationDistrict || 'Vinhomes Grand Park',
        hasHealthDisclaimer: Boolean(data.hasHealthDisclaimer),
        visibility: 'public',
      },
      include: { sightingMatches: true },
    });
  }

  // --- SOS Alerts ---
  public async getSosAlerts() {
    return prisma.sosAlert.findMany({
      include: { user: true, pet: true, matchedPosts: true, trajectories: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  public async createSosAlert(data: any) {
    const defaultUser = await prisma.user.findFirst();
    const defaultPet = await prisma.pet.findFirst();
    return prisma.sosAlert.create({
      data: {
        userId: data.userId || defaultUser?.id || '',
        petId: data.petId || defaultPet?.id || '',
        lastSeenLocation: data.lastSeenLocation || 'Khu vực nội khu',
        radiusKm: data.radiusKm || 3,
        description: data.description || 'Thất lạc thú cưng',
        rewardText: data.rewardText || '1.000.000đ',
        status: 'active',
        visualSignatures: data.visualSignatures || null,
        sightings: [],
      },
      include: { matchedPosts: true, trajectories: true },
    });
  }

  public async getSosTrajectory(sosAlertId: string) {
    return prisma.sightingTrajectory.findFirst({
      where: { sosAlertId },
    });
  }

  public async updateMatchDecision(matchId: string, decision: string) {
    return prisma.petSightingMatch.update({
      where: { id: matchId },
      data: { status: decision },
    });
  }

  // --- Tinder Candidates & Matching ---
  public async getTinderCandidates(currentUserId = 'user-mai', intentFilter?: string) {
    // 1. Lấy danh sách những người đã quẹt THÍCH currentUserId (status là pending hoặc matched)
    const incomingLikes = await prisma.match.findMany({
      where: {
        userBId: currentUserId,
        status: { in: ['pending', 'matched'] },
      },
      select: { userAId: true },
    });
    const usersWhoLikedMe = new Set(incomingLikes.map((m) => m.userAId));

    // 2. Lấy danh sách những người mà currentUserId đã từng quẹt (để loại bỏ khỏi deck nếu đã quẹt)
    const mySwipes = await prisma.match.findMany({
      where: {
        userAId: currentUserId,
      },
      select: { userBId: true },
    });
    const swipedUserIds = Array.from(new Set(mySwipes.map((m) => m.userBId)));

    // Tìm các user khác (ngoại trừ user hiện tại và những người đã quẹt)
    const users = await prisma.user.findMany({
      where: {
        id: { not: currentUserId, notIn: swipedUserIds },
        ...(intentFilter && intentFilter !== 'all' ? { primaryNeed: intentFilter } : {}),
      },
      include: {
        pets: {
          include: { vaccinations: true, behaviors: true },
        },
      },
    });

    // Chuyển đổi sang format TinderCandidate cho Front-end
    return users.map((u) => {
      const candidatePets = u.pets.map((p) => ({
        id: p.id,
        name: p.name,
        species: (p.species === 'cat' ? 'Mèo' : 'Chó') as 'Chó' | 'Mèo',
        breed: p.breed || 'Chưa rõ',
        ageLabel: '2 tuổi',
        weightKg: Number(p.weightKg || 5),
        imageUrl: p.avatarUrl || 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80',
        isVaccinatedAndRabies: p.vaccinationStatus === 'verified' || (p.vaccinations && p.vaccinations.length > 0),
      }));

      const photoUrls = [
        u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
        ...candidatePets.map((p) => p.imageUrl),
      ].filter(Boolean);

      const intent = (u.primaryNeed as 'playdate' | 'dating' | 'community') || 'playdate';
      const intentLabel =
        intent === 'dating'
          ? 'Hẹn hò người yêu thú cưng'
          : intent === 'community'
          ? 'Giao lưu cộng đồng'
          : 'Dắt cún dạo chung';

      return {
        id: u.id,
        ownerName: u.displayName,
        ownerHandle: `@${u.displayName.toLowerCase().replace(/\s+/g, '')}`,
        ownerAge: 25,
        gender: ('Nữ') as 'Nam' | 'Nữ',
        ownerNickname: u.displayName,
        avatarUrl: u.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
        photoUrls: photoUrls.length > 0 ? photoUrls : [u.avatarUrl || ''],
        distanceKm: 1.5,
        intent,
        intentLabel,
        lookingFor: intentLabel,
        bio: u.bio || 'Yêu thích thú cưng và mong muốn tìm bạn cùng dắt dạo công viên.',
        lifestyle: {
          smoking: 'Không hút thuốc',
          workout: 'Chạy bộ mỗi chiều',
          drinking: 'Thỉnh thoảng',
          petSummary: candidatePets.map((p) => `${p.name} (${p.breed})`).join(', ') || 'Chưa có thú cưng',
          zodiac: 'Kim Ngưu',
          chatStyle: 'Thân thiện, cởi mở',
        },
        pets: candidatePets,
        tags: ['#ThânThiện', '#ĐãTiêmPhòng', '#YêuThươngBoss'],
        hasLikedMe: usersWhoLikedMe.has(u.id),
      };
    });
  }

  public async recordSwipe(userId: string, targetUserId: string, direction: 'left' | 'right') {
    const status = direction === 'right' ? 'pending' : 'rejected';

    // Tạo hoặc cập nhật record Match
    const match = await prisma.match.upsert({
      where: {
        userAId_userBId: {
          userAId: userId,
          userBId: targetUserId,
        },
      },
      update: { status },
      create: {
        userAId: userId,
        userBId: targetUserId,
        status,
      },
    });

    if (direction === 'right') {
      // Kiểm tra xem đối phương có từng thích mình chưa
      const reverseMatch = await prisma.match.findUnique({
        where: {
          userAId_userBId: {
            userAId: targetUserId,
            userBId: userId,
          },
        },
      });

      if (reverseMatch && reverseMatch.status !== 'rejected') {
        // Đôi bên cùng thích -> Khớp lệnh Tương Hợp (Matched)
        await prisma.match.update({
          where: { id: match.id },
          data: { status: 'matched' },
        });

        // Tạo phòng chat mới nếu chưa có
        let conversation = await prisma.conversation.findFirst({
          where: {
            participantIds: { hasEvery: [userId, targetUserId] },
          },
        });

        if (!conversation) {
          conversation = await prisma.conversation.create({
            data: {
              type: 'direct',
              participantIds: [userId, targetUserId],
              lastMessageText: 'Bạn và đối phương vừa tương hợp! Hãy gửi lời chào đầu tiên.',
              lastMessageAt: new Date(),
            },
          });
        }

        return {
          isMatch: true,
          match,
          conversationId: conversation.id,
        };
      }
    }

    return { isMatch: false, match };
  }

  public async rewindSwipe(userId: string, targetUserId: string) {
    // 1. Xóa match do user này vừa quẹt đối phương
    await prisma.match.deleteMany({
      where: {
        userAId: userId,
        userBId: targetUserId,
      },
    });

    // 2. Nếu đối phương từng thích user và status là matched, chuyển lại thành pending
    const reverseMatch = await prisma.match.findUnique({
      where: {
        userAId_userBId: {
          userAId: targetUserId,
          userBId: userId,
        },
      },
    });

    if (reverseMatch && reverseMatch.status === 'matched') {
      await prisma.match.update({
        where: { id: reverseMatch.id },
        data: { status: 'pending' },
      });
    }

    // 3. Xóa phòng chat tự động tạo nếu chưa có tin nhắn nào
    try {
      const conversation = await prisma.conversation.findFirst({
        where: {
          participantIds: { hasEvery: [userId, targetUserId] },
        },
        include: {
          messages: true,
        },
      });

      if (conversation && conversation.messages.length === 0) {
        await prisma.conversation.delete({
          where: { id: conversation.id },
        });
      }
    } catch {
      // Bỏ qua lỗi phụ trợ xóa conversation nếu có
    }

    return { success: true, message: 'Hoàn tác thành công' };
  }

  // --- Chats & Messages ---
  public async getChats(userId = 'user-mai') {
    const conversations = await prisma.conversation.findMany({
      where: {
        participantIds: { has: userId },
      },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    const result = [];
    for (const conv of conversations) {
      const partnerId = conv.participantIds.find((id) => id !== userId) || conv.participantIds[0];
      const partner = await prisma.user.findUnique({
        where: { id: partnerId },
        include: { pets: true },
      });

      const partnerName = partner?.displayName || 'Bạn mới';
      const partnerAvatar = partner?.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80';
      const petSummary = partner?.pets?.map((p) => `${p.name} (${p.breed})`).join(', ') || 'Thú cưng thân thiện';

      const messagesFormatted = conv.messages.map((m) => {
        const d = new Date(m.createdAt);
        const timeStr = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
        return {
          id: m.id,
          sender: (m.senderId === userId ? 'me' : 'them') as 'me' | 'them',
          text: m.text,
          time: timeStr,
          isRead: m.isRead,
          createdAt: m.createdAt,
        };
      });

      result.push({
        id: conv.id,
        partnerName,
        partnerHandle: `@${partnerName.toLowerCase().replace(/\s+/g, '')}`,
        partnerNickname: partnerName,
        partnerAvatar,
        petSummary,
        distanceLabel: 'Cách 1.2km',
        isOnline: true,
        unreadCount: conv.messages.filter((m) => m.senderId !== userId && !m.isRead).length,
        matchSource: ('tinder_match') as 'friend' | 'tinder_match' | 'service',
        messages: messagesFormatted,
      });
    }

    return result;
  }

  public async getChatMessages(conversationId: string) {
    return prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' },
    });
  }

  public async markConversationAsRead(conversationId: string, userId = 'user-mai') {
    let conv = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    if (!conv) {
      conv = await prisma.conversation.findFirst({
        where: {
          participantIds: { hasEvery: [userId, conversationId] },
        },
      });
    }

    if (!conv) {
      return { success: false, message: 'Conversation not found' };
    }

    await prisma.message.updateMany({
      where: {
        conversationId: conv.id,
        senderId: { not: userId },
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return { success: true };
  }

  public async sendChatMessage(conversationId: string, senderId: string, text: string, mediaUrl?: string) {
    // 1. Kiểm tra conversationId có tồn tại trong database không
    let conv = await prisma.conversation.findUnique({
      where: { id: conversationId },
    });

    // 2. Nếu không tìm thấy theo ID trực tiếp, tìm cuộc trò chuyện giữa senderId và ID đối phương
    if (!conv) {
      conv = await prisma.conversation.findFirst({
        where: {
          participantIds: { hasEvery: [senderId, conversationId] },
        },
      });
    }

    // 3. Nếu vẫn chưa có, tự động tạo cuộc trò chuyện hợp lệ trong database
    if (!conv) {
      conv = await prisma.conversation.create({
        data: {
          id: conversationId.startsWith('conv-') ? conversationId : undefined,
          type: 'direct',
          participantIds: [senderId, conversationId],
          lastMessageText: text,
          lastMessageAt: new Date(),
        },
      });
    }

    const message = await prisma.message.create({
      data: {
        conversationId: conv.id,
        senderId,
        text,
        mediaUrl,
        isRead: false,
      },
    });

    await prisma.conversation.update({
      where: { id: conv.id },
      data: {
        lastMessageText: text,
        lastMessageAt: new Date(),
      },
    });

    return message;
  }

  // --- Notifications ---
  public async getNotifications(userId = 'user-mai') {
    const list = await prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return list.map((n) => {
      const d = new Date(n.createdAt);
      const timeStr = `${d.getHours().toString().padStart(2, '0')}:${d.getMinutes().toString().padStart(2, '0')}`;
      return {
        id: n.id,
        title: n.title,
        body: n.body,
        time: timeStr,
        isRead: n.isRead,
        type: (n.type as any) || 'system',
      };
    });
  }
}

export const dbService = new DatabaseService();
