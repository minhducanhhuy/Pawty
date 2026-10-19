import {
  UserProfile,
  PetProfile,
  PetMoment,
  ChatRoom,
  ChatMessage,
  WalkAppointment,
  SosAlert,
  MatchRecord,
  NativeAd
} from '../types';
import {
  INITIAL_USER,
  INITIAL_CURRENT_PET,
  NEARBY_PETS,
  MOCK_MOMENTS,
  NATIVE_ADS,
  SOS_ACTIVE_MOCK,
  PET_FRIENDLY_PLACES
} from '../data/mockData';

const STORAGE_KEYS = {
  USER: 'pawty_user',
  PET: 'pawty_current_pet',
  NEARBY: 'pawty_nearby_pets',
  MATCHES: 'pawty_matches',
  MOMENTS: 'pawty_moments',
  CHATS: 'pawty_chat_rooms',
  SOS_LIST: 'pawty_sos_alerts',
  NOTIFICATIONS: 'pawty_notifications',
};

// Seed initial chat with Mochi for instant testability
const INITIAL_CHAT_ROOMS: ChatRoom[] = [
  {
    id: 'room_mochi_01',
    matchPet: NEARBY_PETS[0], // Mochi
    lastMessage: 'Sen ơi, tối nay 19:30 dắt Bơ ra Landmark chơi không?',
    lastMessageTime: '17:40',
    unreadCount: 1,
    hasAppointment: true,
    messages: [
      {
        id: 'msg_01',
        roomId: 'room_mochi_01',
        senderPetId: 'pet_mochi_02',
        senderName: 'Mochi (Thanh Hằng)',
        text: 'Chào Bơ Lùn nè! Nhìn mông quả đào cưng xỉu luôn á 🍑🐾',
        timestamp: '17:35',
        isOwn: false,
      },
      {
        id: 'msg_02',
        roomId: 'room_mochi_01',
        senderPetId: 'pet_bo_01',
        senderName: 'Bơ Lùn (Minh Anh)',
        text: 'Dạ hú hú! Bơ cũng mê mặt cười của Mochi lắm, tối nào cũng hóng dạo công viên á!',
        timestamp: '17:37',
        isOwn: true,
      },
      {
        id: 'msg_03',
        roomId: 'room_mochi_01',
        senderPetId: 'pet_mochi_02',
        senderName: 'Mochi (Thanh Hằng)',
        text: 'Tuyệt vời! Hay tối nay mình hẹn ra bãi cỏ ven sông Landmark 81 chạy đua nha?',
        timestamp: '17:39',
        isOwn: false,
      },
      {
        id: 'msg_04',
        roomId: 'room_mochi_01',
        senderPetId: 'pet_mochi_02',
        senderName: 'Mochi (Thanh Hằng)',
        timestamp: '17:40',
        isOwn: false,
        appointment: {
          id: 'apt_mochi_01',
          matchId: 'room_mochi_01',
          senderPetId: 'pet_mochi_02',
          senderPetName: 'Mochi',
          receiverPetId: 'pet_bo_01',
          receiverPetName: 'Bơ Lùn',
          scheduledTime: '2026-10-19T19:30:00',
          displayTime: 'Tối nay • 19:30',
          place: PET_FRIENDLY_PLACES[0],
          note: 'Mang theo bóng tennis và túi rác nhé Sen!',
          status: 'pending',
          createdAt: '17:40',
        },
      },
    ],
  },
];

export class StorageService {
  public static getUser(): UserProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.USER);
      return data ? JSON.parse(data) : INITIAL_USER;
    } catch {
      return INITIAL_USER;
    }
  }

  public static saveUser(user: UserProfile): void {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  }

  public static getCurrentPet(): PetProfile {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PET);
      return data ? JSON.parse(data) : INITIAL_CURRENT_PET;
    } catch {
      return INITIAL_CURRENT_PET;
    }
  }

  public static saveCurrentPet(pet: PetProfile): void {
    localStorage.setItem(STORAGE_KEYS.PET, JSON.stringify(pet));
  }

  public static getNearbyPets(): PetProfile[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NEARBY);
      return data ? JSON.parse(data) : NEARBY_PETS;
    } catch {
      return NEARBY_PETS;
    }
  }

  public static getMatches(): MatchRecord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MATCHES);
      return data ? JSON.parse(data) : [
        { id: 'm_init_01', petId: 'pet_bo_01', targetPetId: 'pet_mochi_02', status: 'matched', matchedAt: '17:30' }
      ];
    } catch {
      return [];
    }
  }

  public static saveMatches(matches: MatchRecord[]): void {
    localStorage.setItem(STORAGE_KEYS.MATCHES, JSON.stringify(matches));
  }

  public static getMoments(): PetMoment[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MOMENTS);
      return data ? JSON.parse(data) : MOCK_MOMENTS;
    } catch {
      return MOCK_MOMENTS;
    }
  }

  public static saveMoments(moments: PetMoment[]): void {
    localStorage.setItem(STORAGE_KEYS.MOMENTS, JSON.stringify(moments));
  }

  public static getChatRooms(): ChatRoom[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.CHATS);
      return data ? JSON.parse(data) : INITIAL_CHAT_ROOMS;
    } catch {
      return INITIAL_CHAT_ROOMS;
    }
  }

  public static saveChatRooms(rooms: ChatRoom[]): void {
    localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(rooms));
  }

  public static getSosAlerts(): SosAlert[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SOS_LIST);
      return data ? JSON.parse(data) : [SOS_ACTIVE_MOCK];
    } catch {
      return [SOS_ACTIVE_MOCK];
    }
  }

  public static saveSosAlerts(alerts: SosAlert[]): void {
    localStorage.setItem(STORAGE_KEYS.SOS_LIST, JSON.stringify(alerts));
  }

  // Like or dislike a pet
  public static handleSwipePet(
    targetPet: PetProfile,
    action: 'like' | 'dislike'
  ): { isMatch: boolean; updatedUser: UserProfile } {
    const user = this.getUser();
    user.dailySwipesCount += 1;
    this.saveUser(user);

    const matches = this.getMatches();

    if (action === 'dislike') {
      matches.push({
        id: `match_${Date.now()}`,
        petId: 'pet_bo_01',
        targetPetId: targetPet.id,
        status: 'disliked',
      });
      this.saveMatches(matches);
      return { isMatch: false, updatedUser: user };
    }

    // It's a LIKE. In our high-affinity pet simulator,
    // Pets like Bun Bo, Banh Bao, Gau Nau have already liked us!
    const isMutualLike = ['pet_bunbo_03', 'pet_banhbao_04', 'pet_gaunau_05', 'pet_kemchuoi_06'].includes(targetPet.id) || Math.random() > 0.3;

    if (isMutualLike) {
      matches.push({
        id: `match_${Date.now()}`,
        petId: 'pet_bo_01',
        targetPetId: targetPet.id,
        status: 'matched',
        matchedAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      });
      this.saveMatches(matches);

      // Create new chat room if not exists
      const chatRooms = this.getChatRooms();
      const existingRoom = chatRooms.find((r) => r.matchPet.id === targetPet.id);
      if (!existingRoom) {
        const newRoom: ChatRoom = {
          id: `room_${targetPet.id}_${Date.now()}`,
          matchPet: targetPet,
          lastMessage: `Bạn và ${targetPet.name} đã match nhau! Hãy chào hỏi và set lịch dạo nào 🐾`,
          lastMessageTime: 'Vừa xong',
          unreadCount: 1,
          hasAppointment: false,
          messages: [
            {
              id: `msg_${Date.now()}`,
              roomId: `room_${targetPet.id}`,
              senderPetId: targetPet.id,
              senderName: `${targetPet.name} (${targetPet.ownerName})`,
              text: `Gâu gâu / Meo meo! Chào Bơ Lùn nha, Sen của mình thấy profile Bơ thích quá chừng 🥰 Hôm nào ra dạo chung không?`,
              timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
              isOwn: false,
            },
          ],
        };
        chatRooms.unshift(newRoom);
        this.saveChatRooms(chatRooms);
      }

      return { isMatch: true, updatedUser: user };
    } else {
      matches.push({
        id: `match_${Date.now()}`,
        petId: 'pet_bo_01',
        targetPetId: targetPet.id,
        status: 'liked',
      });
      this.saveMatches(matches);
      return { isMatch: false, updatedUser: user };
    }
  }

  // Toggle Like Moment
  public static toggleLikeMoment(momentId: string): PetMoment[] {
    const moments = this.getMoments();
    const updated = moments.map((m) => {
      if (m.id === momentId) {
        const isLiked = !m.isLikedByCurrentUser;
        return {
          ...m,
          isLikedByCurrentUser: isLiked,
          likesCount: isLiked ? m.likesCount + 1 : Math.max(0, m.likesCount - 1),
        };
      }
      return m;
    });
    this.saveMoments(updated);
    return updated;
  }

  // Add Moment
  public static addMoment(newMoment: Omit<PetMoment, 'id' | 'likesCount' | 'isLikedByCurrentUser' | 'createdAt'>): { success: boolean; error?: string; moment?: PetMoment } {
    const user = this.getUser();
    const moments = this.getMoments();
    const myMoments = moments.filter((m) => m.petId === 'pet_bo_01');

    if (!user.isVip && myMoments.length >= 5) {
      return {
        success: false,
        error: 'LIMIT_REACHED',
      };
    }

    const created: PetMoment = {
      ...newMoment,
      id: `moment_${Date.now()}`,
      likesCount: 1,
      isLikedByCurrentUser: true,
      createdAt: 'Vừa xong',
    };

    const updated = [created, ...moments];
    this.saveMoments(updated);
    return { success: true, moment: created };
  }

  // Send message & auto-reply
  public static sendMessage(roomId: string, text: string): ChatRoom[] {
    const rooms = this.getChatRooms();
    const currentPet = this.getCurrentPet();
    const user = this.getUser();

    const targetRoomIndex = rooms.findIndex((r) => r.id === roomId);
    if (targetRoomIndex === -1) return rooms;

    const room = rooms[targetRoomIndex];
    const newMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      roomId,
      senderPetId: currentPet.id,
      senderName: `${currentPet.name} (${user.nickname})`,
      text,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      isOwn: true,
    };

    room.messages.push(newMsg);
    room.lastMessage = text;
    room.lastMessageTime = newMsg.timestamp;

    // Put room to top
    rooms.splice(targetRoomIndex, 1);
    rooms.unshift(room);
    this.saveChatRooms(rooms);
    return [...rooms];
  }

  // Add Appointment to Chat
  public static addAppointment(roomId: string, appointment: WalkAppointment): ChatRoom[] {
    const rooms = this.getChatRooms();
    const targetRoomIndex = rooms.findIndex((r) => r.id === roomId);
    if (targetRoomIndex === -1) return rooms;

    const room = rooms[targetRoomIndex];
    const appointmentMsg: ChatMessage = {
      id: `apt_msg_${Date.now()}`,
      roomId,
      senderPetId: appointment.senderPetId,
      senderName: appointment.senderPetName,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
      isOwn: true,
      appointment,
    };

    room.messages.push(appointmentMsg);
    room.hasAppointment = true;
    room.lastMessage = `📅 Đã gửi lời mời hẹn dắt Boss: ${appointment.displayTime}`;
    room.lastMessageTime = appointmentMsg.timestamp;

    rooms.splice(targetRoomIndex, 1);
    rooms.unshift(room);
    this.saveChatRooms(rooms);
    return [...rooms];
  }

  // Update Appointment Status
  public static updateAppointmentStatus(
    roomId: string,
    appointmentId: string,
    newStatus: WalkAppointment['status']
  ): ChatRoom[] {
    const rooms = this.getChatRooms();
    const room = rooms.find((r) => r.id === roomId);
    if (!room) return rooms;

    room.messages.forEach((msg) => {
      if (msg.appointment && msg.appointment.id === appointmentId) {
        msg.appointment.status = newStatus;
      }
    });

    if (newStatus === 'confirmed') {
      room.lastMessage = '🎉 Kèo dạo phố đã được chốt! Hẹn gặp nhau nha!';
    } else if (newStatus === 'rejected') {
      room.lastMessage = 'Lịch hẹn đã bị từ chối hoặc cần đổi giờ.';
    } else if (newStatus === 'reported_flake') {
      room.lastMessage = '⚠️ Cuộc hẹn đã bị báo cáo bùng kèo.';
    }

    this.saveChatRooms(rooms);
    return [...rooms];
  }

  // Report Flake
  public static reportFlake(roomId: string): { user: UserProfile; isBanned: boolean } {
    const user = this.getUser();
    user.flakeReportsCount += 1;
    if (user.flakeReportsCount >= 2) {
      user.isBannedFromSwiping = true;
      user.banUntil = '3 ngày tới';
    }
    this.saveUser(user);
    return { user, isBanned: user.isBannedFromSwiping };
  }

  // Reset Demo to initial
  public static resetDemo(): void {
    localStorage.clear();
    this.saveUser(INITIAL_USER);
    this.saveCurrentPet(INITIAL_CURRENT_PET);
    this.saveMoments(MOCK_MOMENTS);
    this.saveChatRooms(INITIAL_CHAT_ROOMS);
    this.saveSosAlerts([SOS_ACTIVE_MOCK]);
  }
}
