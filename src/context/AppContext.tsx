import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  UserProfile,
  PetProfile,
  PetMoment,
  ChatRoom,
  SosAlert,
  RadarFilterOptions,
} from '../types';
import { StorageService } from '../services/storageService';
import confetti from 'canvas-confetti';

export interface PushNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  type: 'match' | 'chat' | 'appointment' | 'sos' | 'system';
}

interface AppContextType {
  user: UserProfile;
  currentPet: PetProfile;
  nearbyPets: PetProfile[];
  moments: PetMoment[];
  chatRooms: ChatRoom[];
  sosAlerts: SosAlert[];
  activeTab: 'radar' | 'moments' | 'chat' | 'profile';
  setActiveTab: (tab: 'radar' | 'moments' | 'chat' | 'profile') => void;
  selectedChatRoomId: string | null;
  setSelectedChatRoomId: (id: string | null) => void;
  viewingPetProfile: PetProfile | null;
  setViewingPetProfile: (pet: PetProfile | null) => void;

  // Filter state
  radarFilter: RadarFilterOptions;
  setRadarFilter: React.Dispatch<React.SetStateAction<RadarFilterOptions>>;

  // Modals
  isVipModalOpen: boolean;
  setIsVipModalOpen: (open: boolean) => void;
  isSosModalOpen: boolean;
  setIsSosModalOpen: (open: boolean) => void;
  isOnboardingOpen: boolean;
  setIsOnboardingOpen: (open: boolean) => void;
  matchedPet: PetProfile | null;
  setMatchedPet: (pet: PetProfile | null) => void;

  // Notification Toast
  activePushNotice: PushNotification | null;
  triggerPushNotice: (notice: Omit<PushNotification, 'id' | 'time'>) => void;
  dismissPushNotice: () => void;

  // Actions
  handleSwipe: (pet: PetProfile, action: 'like' | 'dislike') => void;
  toggleLikeMoment: (momentId: string) => void;
  addNewMoment: (momentData: Omit<PetMoment, 'id' | 'likesCount' | 'isLikedByCurrentUser' | 'createdAt'>) => boolean;
  sendMessage: (roomId: string, text: string) => void;
  createWalkAppointment: (roomId: string, appointment: any) => void;
  respondAppointment: (roomId: string, appointmentId: string, status: 'confirmed' | 'rejected' | 'reported_flake') => void;
  upgradeToVip: () => void;
  publishSosAlert: (alertData: Omit<SosAlert, 'id' | 'createdAt' | 'status'>) => void;
  updateUserLocation: (condoName: string, lat: number, lng: number) => void;
  updateCurrentPet: (pet: PetProfile) => void;
  resetAllDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile>(StorageService.getUser);
  const [currentPet, setCurrentPet] = useState<PetProfile>(StorageService.getCurrentPet);
  const [nearbyPets, setNearbyPets] = useState<PetProfile[]>(StorageService.getNearbyPets);
  const [moments, setMoments] = useState<PetMoment[]>(StorageService.getMoments);
  const [chatRooms, setChatRooms] = useState<ChatRoom[]>(StorageService.getChatRooms);
  const [sosAlerts, setSosAlerts] = useState<SosAlert[]>(StorageService.getSosAlerts);

  const [activeTab, setActiveTab] = useState<'radar' | 'moments' | 'chat' | 'profile'>('radar');
  const [selectedChatRoomId, setSelectedChatRoomId] = useState<string | null>(null);
  const [viewingPetProfile, setViewingPetProfile] = useState<PetProfile | null>(null);

  const [radarFilter, setRadarFilter] = useState<RadarFilterOptions>({
    radiusMeters: 1500,
    species: 'all',
    size: 'all',
    verifiedOnly: false,
  });

  const [isVipModalOpen, setIsVipModalOpen] = useState(false);
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  const [matchedPet, setMatchedPet] = useState<PetProfile | null>(null);

  const [activePushNotice, setActivePushNotice] = useState<PushNotification | null>(null);

  // Trigger simulated FCM Push Notification
  const triggerPushNotice = (notice: Omit<PushNotification, 'id' | 'time'>) => {
    const newNotice: PushNotification = {
      ...notice,
      id: `push_${Date.now()}`,
      time: 'Vừa xong',
    };
    setActivePushNotice(newNotice);

    // Auto dismiss after 6 seconds
    setTimeout(() => {
      setActivePushNotice((curr) => (curr?.id === newNotice.id ? null : curr));
    }, 6000);
  };

  const dismissPushNotice = () => {
    setActivePushNotice(null);
  };

  // Handle Swipe (Core 2)
  const handleSwipe = (pet: PetProfile, action: 'like' | 'dislike') => {
    // Check daily swipe limit for non-VIP
    if (!user.isVip && user.dailySwipesCount >= user.maxFreeSwipesPerDay) {
      setIsVipModalOpen(true);
      return;
    }

    if (user.isBannedFromSwiping) {
      triggerPushNotice({
        title: '⚠️ Bạn đang bị tạm khóa quẹt thẻ',
        body: 'Do tích lũy 2 lần bị báo cáo bùng kèo hẹn dắt cún. Vui lòng quay lại sau.',
        type: 'system',
      });
      return;
    }

    const { isMatch, updatedUser } = StorageService.handleSwipePet(pet, action);
    setUser(updatedUser);

    if (action === 'like' && isMatch) {
      // Trigger Confetti!
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FF6F61', '#A3E4D7', '#FFD166', '#FF9A8B'],
        });
      } catch (e) {
        console.log('Confetti triggered', e);
      }

      setMatchedPet(pet);
      // Reload chat rooms to include the new match
      setChatRooms(StorageService.getChatRooms());

      // Trigger Push Notification simulation
      triggerPushNotice({
        title: `Hú hồn! ${pet.name} và ${currentPet.name} đã match! 🐾`,
        body: `Sen ơi! Mau vào phòng chat để chào hỏi và set lịch hẹn dắt Boss đi dạo nào!`,
        type: 'match',
      });
    }
  };

  // Like Moment (Core 3)
  const toggleLikeMoment = (momentId: string) => {
    const updated = StorageService.toggleLikeMoment(momentId);
    setMoments(updated);
  };

  // Add Moment (Core 3)
  const addNewMoment = (momentData: Omit<PetMoment, 'id' | 'likesCount' | 'isLikedByCurrentUser' | 'createdAt'>): boolean => {
    const result = StorageService.addMoment(momentData);
    if (!result.success) {
      if (result.error === 'LIMIT_REACHED') {
        setIsVipModalOpen(true);
      }
      return false;
    }
    setMoments(StorageService.getMoments());
    triggerPushNotice({
      title: 'Đăng khoảnh khắc thành công! 📸',
      body: 'Khoảnh khắc bựa của Boss đã được chia sẻ lên cộng đồng Pawty.',
      type: 'system',
    });
    return true;
  };

  // Chat message & auto-reply (Core 4)
  const sendMessage = (roomId: string, text: string) => {
    const updated = StorageService.sendMessage(roomId, text);
    setChatRooms(updated);

    // Simulate auto-reply from match after 1.5s
    const targetRoom = updated.find((r) => r.id === roomId);
    if (targetRoom) {
      const matchPet = targetRoom.matchPet;
      setTimeout(() => {
        const replyPool = [
          `Gâu gâu! ${matchPet.name} đồng ý liền nha Sen ơi! 🐶✨`,
          `Meo meo! Tối nay trời mát dắt đi dạo ven sông Landmark là chuẩn bài luôn đó! 🐾`,
          `Ok chốt nè! Nhớ mang theo xúc xích thưởng nha, Boss nhà mình háu ăn lắm á 🌭`,
          `Hihi ${matchPet.name} đang vẫy đuôi mừng rơn khi nghe rủ đi chơi nè! Hẹn bạn nha! 🐾`,
        ];
        const randomReply = replyPool[Math.floor(Math.random() * replyPool.length)];

        // Append reply
        const currentRooms = StorageService.getChatRooms();
        const roomIdx = currentRooms.findIndex((r) => r.id === roomId);
        if (roomIdx !== -1) {
          const autoMsg = {
            id: `msg_auto_${Date.now()}`,
            roomId,
            senderPetId: matchPet.id,
            senderName: `${matchPet.name} (${matchPet.ownerName})`,
            text: randomReply,
            timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
            isOwn: false,
          };
          currentRooms[roomIdx].messages.push(autoMsg);
          currentRooms[roomIdx].lastMessage = randomReply;
          currentRooms[roomIdx].lastMessageTime = autoMsg.timestamp;
          StorageService.saveChatRooms(currentRooms);
          setChatRooms([...currentRooms]);

          triggerPushNotice({
            title: `Tin nhắn mới từ ${matchPet.name}`,
            body: randomReply,
            type: 'chat',
          });
        }
      }, 1500);
    }
  };

  // Walk Appointment (Core 4)
  const createWalkAppointment = (roomId: string, appointment: any) => {
    const updated = StorageService.addAppointment(roomId, appointment);
    setChatRooms(updated);

    triggerPushNotice({
      title: 'Đã gửi lời mời hẹn dắt Boss! 📅',
      body: `Hẹn tại ${appointment.place.name} • ${appointment.displayTime}. Đang chờ đối phương xác nhận.`,
      type: 'appointment',
    });
  };

  const respondAppointment = (roomId: string, appointmentId: string, status: 'confirmed' | 'rejected' | 'reported_flake') => {
    if (status === 'reported_flake') {
      const { user: updatedUser, isBanned } = StorageService.reportFlake(roomId);
      setUser(updatedUser);
      const updated = StorageService.updateAppointmentStatus(roomId, appointmentId, status);
      setChatRooms(updated);

      triggerPushNotice({
        title: '⚠️ Đã ghi nhận báo cáo bùng kèo',
        body: isBanned
          ? 'Tài khoản vi phạm quy tắc cộng đồng và đã bị tạm khóa quẹt thẻ trong 3 ngày.'
          : 'Hệ thống đã lưu log báo cáo. Lần vi phạm thứ 2 sẽ khóa quyền quẹt thẻ.',
        type: 'system',
      });
      return;
    }

    const updated = StorageService.updateAppointmentStatus(roomId, appointmentId, status);
    setChatRooms(updated);

    if (status === 'confirmed') {
      try {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.5 },
          colors: ['#A3E4D7', '#FF6F61'],
        });
      } catch (e) {
        console.log(e);
      }

      triggerPushNotice({
        title: '🎉 Kèo dạo phố đã được chốt!',
        body: 'Pawty sẽ gửi thông báo đẩy nhắc nhở trước 15 phút giờ ra đường ⏰',
        type: 'appointment',
      });
    }
  };

  // VIP Upgrade
  const upgradeToVip = () => {
    const updatedUser: UserProfile = {
      ...user,
      isVip: true,
      dailySwipesCount: 0,
      maxFreeSwipesPerDay: 9999,
    };
    StorageService.saveUser(updatedUser);
    setUser(updatedUser);
    setIsVipModalOpen(false);

    try {
      confetti({
        particleCount: 120,
        spread: 90,
        origin: { y: 0.5 },
        colors: ['#FFD700', '#FF6F61', '#A3E4D7'],
      });
    } catch (e) {
      console.log(e);
    }

    triggerPushNotice({
      title: '👑 Chúc mừng Sen & Boss đã lên VIP!',
      body: 'Quẹt thẻ không giới hạn, mở khóa kho ảnh không giới hạn và nhận huy hiệu Vương Miện Vàng!',
      type: 'system',
    });
  };

  // Publish SOS Alert
  const publishSosAlert = (alertData: Omit<SosAlert, 'id' | 'createdAt' | 'status'>) => {
    const newAlert: SosAlert = {
      ...alertData,
      id: `sos_${Date.now()}`,
      createdAt: 'Vừa xong',
      status: 'active',
    };
    const currentAlerts = StorageService.getSosAlerts();
    const updated = [newAlert, ...currentAlerts];
    StorageService.saveSosAlerts(updated);
    setSosAlerts(updated);
    setIsSosModalOpen(false);

    triggerPushNotice({
      title: `🚨 BÁO ĐỘNG SOS: Tìm ${alertData.petName} lạc!`,
      body: `Đã phát thông báo khẩn cấp tới tất cả cư dân Pawty trong bán kính ${alertData.radiusKm}km tại ${alertData.lastSeenAddress}!`,
      type: 'sos',
    });
  };

  // Update Location
  const updateUserLocation = (condoName: string, lat: number, lng: number) => {
    const updatedUser = {
      ...user,
      location: {
        ...user.location,
        condoComplex: condoName,
        addressName: condoName,
        latitude: lat,
        longitude: lng,
      },
    };
    StorageService.saveUser(updatedUser);
    setUser(updatedUser);

    triggerPushNotice({
      title: '📍 Đã cập nhật tọa độ GPS PostGIS',
      body: `Đang quét radar các Boss xung quanh ${condoName}...`,
      type: 'system',
    });
  };

  const updateCurrentPet = (pet: PetProfile) => {
    StorageService.saveCurrentPet(pet);
    setCurrentPet(pet);
  };

  const resetAllDemoData = () => {
    StorageService.resetDemo();
    setUser(StorageService.getUser());
    setCurrentPet(StorageService.getCurrentPet());
    setMoments(StorageService.getMoments());
    setChatRooms(StorageService.getChatRooms());
    setSosAlerts(StorageService.getSosAlerts());
    setNearbyPets(StorageService.getNearbyPets());
    setMatchedPet(null);
    setSelectedChatRoomId(null);
    setViewingPetProfile(null);
    setActiveTab('radar');

    triggerPushNotice({
      title: '🔄 Đã khôi phục dữ liệu Demo gốc',
      body: 'Tất cả trạng thái quẹt thẻ, chat và hồ sơ đã được làm mới.',
      type: 'system',
    });
  };

  return (
    <AppContext.Provider
      value={{
        user,
        currentPet,
        nearbyPets,
        moments,
        chatRooms,
        sosAlerts,
        activeTab,
        setActiveTab,
        selectedChatRoomId,
        setSelectedChatRoomId,
        viewingPetProfile,
        setViewingPetProfile,
        radarFilter,
        setRadarFilter,
        isVipModalOpen,
        setIsVipModalOpen,
        isSosModalOpen,
        setIsSosModalOpen,
        isOnboardingOpen,
        setIsOnboardingOpen,
        matchedPet,
        setMatchedPet,
        activePushNotice,
        triggerPushNotice,
        dismissPushNotice,
        handleSwipe,
        toggleLikeMoment,
        addNewMoment,
        sendMessage,
        createWalkAppointment,
        respondAppointment,
        upgradeToVip,
        publishSosAlert,
        updateUserLocation,
        updateCurrentPet,
        resetAllDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
