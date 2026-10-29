import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
import Constants from 'expo-constants';
import * as Haptics from 'expo-haptics';
import {
  INITIAL_MOBILE_BOOKINGS,
  INITIAL_MOBILE_CIRCLE_ACTIVITIES,
  INITIAL_MOBILE_CIRCLE_MEMBERS,
  INITIAL_MOBILE_CONVERSATIONS,
  INITIAL_MOBILE_GROUPS,
  INITIAL_MOBILE_PARTNERS,
  INITIAL_MOBILE_PETS,
  INITIAL_MOBILE_PLACES,
  INITIAL_MOBILE_POSTS,
  INITIAL_MOBILE_RADAR,
  INITIAL_MOBILE_SOS,
  INITIAL_MOBILE_TASKS,
  INITIAL_MOBILE_WALK_APPOINTMENTS,
  MobileBooking,
  MobileCareTask,
  MobileCircleActivity,
  MobileCircleMember,
  MobileConversation,
  MobileGroup,
  MobilePartner,
  MobilePet,
  MobilePlace,
  MobilePost,
  MobileRadarCandidate,
  MobileReactionKey,
  MobileSosAlert,
  MobileWalkAppointment,
  moderateMobileContent,
} from '../data/mobileSeedData';

export type MobileMainTab = 'today' | 'explore' | 'chat' | 'profile';
export type MobileExploreSubTab = 'feed' | 'trending' | 'groups' | 'qa' | 'services' | 'places' | 'radar';
export type MobileModalType =
  | null
  | 'create_sheet'
  | 'new_moment'
  | 'new_task'
  | 'new_question'
  | 'invite_circle'
  | 'book_service'
  | 'walk_scheduler'
  | 'vip_upgrade'
  | 'sos_alert'
  | 'pro_dashboard'
  | 'privacy_center';

interface MobileToast {
  title: string;
  message: string;
  tone: 'success' | 'warning' | 'danger' | 'info';
}

interface MobilePawtyContextValue {
  apiBaseUrl: string;
  isApiOnline: boolean;
  hasCompletedOnboarding: boolean;
  activeTab: MobileMainTab;
  exploreSubTab: MobileExploreSubTab;
  activeModal: MobileModalType;
  selectedPartnerId: string | null;
  activeConversationId: string | null;
  toast: MobileToast | null;

  ownerName: string;
  ownerPhone: string;
  ownerNeighborhood: string;
  isVip: boolean;
  vipPlanName: string;

  pets: MobilePet[];
  activePetId: string;
  activePet: MobilePet;
  tasks: MobileCareTask[];
  circleMembers: MobileCircleMember[];
  circleActivities: MobileCircleActivity[];
  posts: MobilePost[];
  groups: MobileGroup[];
  radarCandidates: MobileRadarCandidate[];
  matchedIds: string[];
  latestMatchPetName: string | null;
  partners: MobilePartner[];
  places: MobilePlace[];
  bookings: MobileBooking[];
  walkAppointments: MobileWalkAppointment[];
  conversations: MobileConversation[];
  sosAlerts: MobileSosAlert[];

  setActiveTab: (tab: MobileMainTab) => void;
  setExploreSubTab: (subTab: MobileExploreSubTab) => void;
  setActiveModal: (modal: MobileModalType, partnerId?: string | null) => void;
  setActiveConversationId: (convId: string | null) => void;
  setActivePetId: (petId: string) => void;
  showToast: (title: string, message: string, tone?: MobileToast['tone']) => void;
  syncWithLanBackend: () => Promise<void>;

  completeOnboarding: (payload: {
    phone: string;
    ownerName: string;
    neighborhood: string;
    petName: string;
    species: 'dog' | 'cat';
    breed: string;
    weightKg: number;
    vaccinatedFull: boolean;
    goodHabits: string[];
    cautions: string[];
  }) => void;
  restartOnboarding: () => void;

  toggleTaskStatus: (taskId: string) => void;
  createCareTask: (title: string, category: MobileCareTask['category'], dueTime: string, assignedToName: string) => void;
  inviteCircleMember: (displayName: string, relationshipLabel: string, role: MobileCircleMember['role']) => void;
  addVaccination: (vaccineName: string, clinicName: string) => void;

  createPost: (contentType: MobilePost['contentType'], textContent: string, hashtags: string[]) => boolean;
  reactToPost: (postId: string, reaction: MobileReactionKey) => void;
  addCommentToPost: (postId: string, content: string) => void;
  toggleBookmarkPost: (postId: string) => void;
  toggleJoinGroup: (groupId: string) => void;

  swipeRadarCandidate: (candidateId: string, direction: 'left' | 'right') => void;
  clearMatchCelebration: () => void;
  createWalkAppointment: (partnerName: string, partnerPetName: string, proposedTime: string, midpointLocationName: string) => void;
  updateWalkStatus: (walkId: string, status: MobileWalkAppointment['status']) => void;

  sendMessage: (convId: string, text: string, type?: 'text' | 'voice' | 'walk_invite') => void;
  createServiceBooking: (partnerId: string, serviceId: string, bookingDate: string, bookingTime: string, notes: string) => void;
  updateBookingStatus: (bookingId: string, status: MobileBooking['status']) => void;

  upgradeVip: (planName: string) => void;
  createSosAlert: (lastSeenAddress: string, rewardText: string) => void;
  reportSosSighting: (sosId: string) => void;
}

function resolveLanApiBaseUrl(): string {
  try {
    const hostUri = Constants.expoConfig?.hostUri;
    if (hostUri) {
      const host = hostUri.split(':')[0];
      if (host && host !== 'localhost' && host !== '127.0.0.1') {
        return `http://${host}:3000/api`;
      }
    }
  } catch {
    // Fallback to LAN IP if expo-constants is unavailable
  }
  return 'http://192.168.100.176:3000/api';
}

const MobilePawtyContext = createContext<MobilePawtyContextValue | null>(null);

export const MobilePawtyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [apiBaseUrl] = useState<string>(() => resolveLanApiBaseUrl());
  const [isApiOnline, setIsApiOnline] = useState<boolean>(false);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(true);
  const [activeTab, setActiveTabState] = useState<MobileMainTab>('today');
  const [exploreSubTab, setExploreSubTab] = useState<MobileExploreSubTab>('feed');
  const [activeModal, setActiveModalState] = useState<MobileModalType>(null);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(null);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [toast, setToast] = useState<MobileToast | null>(null);

  const [ownerName, setOwnerName] = useState<string>('Mai Nguyễn');
  const [ownerPhone, setOwnerPhone] = useState<string>('0912 345 678');
  const [ownerNeighborhood, setOwnerNeighborhood] = useState<string>('Vinhomes Grand Park - Khu Rainbow');
  const [isVip, setIsVip] = useState<boolean>(true);
  const [vipPlanName, setVipPlanName] = useState<string>('Sen VIP Tháng (49k)');

  const [pets, setPets] = useState<MobilePet[]>(INITIAL_MOBILE_PETS);
  const [activePetId, setActivePetId] = useState<string>(INITIAL_MOBILE_PETS[0].id);
  const [tasks, setTasks] = useState<MobileCareTask[]>(INITIAL_MOBILE_TASKS);
  const [circleMembers, setCircleMembers] = useState<MobileCircleMember[]>(INITIAL_MOBILE_CIRCLE_MEMBERS);
  const [circleActivities, setCircleActivities] = useState<MobileCircleActivity[]>(INITIAL_MOBILE_CIRCLE_ACTIVITIES);
  const [posts, setPosts] = useState<MobilePost[]>(INITIAL_MOBILE_POSTS);
  const [groups, setGroups] = useState<MobileGroup[]>(INITIAL_MOBILE_GROUPS);
  const [radarCandidates] = useState<MobileRadarCandidate[]>(INITIAL_MOBILE_RADAR);
  const [matchedIds, setMatchedIds] = useState<string[]>(['radar-bo']);
  const [latestMatchPetName, setLatestMatchPetName] = useState<string | null>(null);
  const [partners] = useState<MobilePartner[]>(INITIAL_MOBILE_PARTNERS);
  const [places] = useState<MobilePlace[]>(INITIAL_MOBILE_PLACES);
  const [bookings, setBookings] = useState<MobileBooking[]>(INITIAL_MOBILE_BOOKINGS);
  const [walkAppointments, setWalkAppointments] = useState<MobileWalkAppointment[]>(INITIAL_MOBILE_WALK_APPOINTMENTS);
  const [conversations, setConversations] = useState<MobileConversation[]>(INITIAL_MOBILE_CONVERSATIONS);
  const [sosAlerts, setSosAlerts] = useState<MobileSosAlert[]>(INITIAL_MOBILE_SOS);

  const triggerHaptic = useCallback(() => {
    try {
      Haptics.selectionAsync().catch(() => {});
    } catch {
      // Ignore haptics errors on unsupported devices
    }
  }, []);

  const showToast = useCallback((title: string, message: string, tone: MobileToast['tone'] = 'success') => {
    setToast({ title, message, tone });
    setTimeout(() => {
      setToast((current) => (current?.title === title ? null : current));
    }, 3400);
  }, []);

  const callBackendApi = useCallback(
    async (endpoint: string, method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET', body?: Record<string, unknown>) => {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3500);
        const response = await fetch(`${apiBaseUrl}${endpoint}`, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: body ? JSON.stringify(body) : undefined,
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        if (response.ok) {
          setIsApiOnline(true);
          return await response.json();
        }
      } catch {
        setIsApiOnline(false);
      }
      return null;
    },
    [apiBaseUrl]
  );

  const syncWithLanBackend = useCallback(async () => {
    const health = await callBackendApi('/health', 'GET');
    if (health && health.status === 'ok') {
      setIsApiOnline(true);
      showToast('Đã đồng bộ LAN Server 🟢', `Kết nối thành công tới ${apiBaseUrl}`, 'success');
    } else {
      setIsApiOnline(false);
      showToast('Chế độ Offline / Local 🐾', 'Đang lưu trữ trực tiếp trên thiết bị của bạn.', 'info');
    }
  }, [apiBaseUrl, callBackendApi, showToast]);

  useEffect(() => {
    callBackendApi('/health', 'GET').catch(() => {});
  }, [callBackendApi]);

  const setActiveTab = useCallback(
    (tab: MobileMainTab) => {
      triggerHaptic();
      setActiveTabState(tab);
      setActiveConversationId(null);
    },
    [triggerHaptic]
  );

  const setActiveModal = useCallback(
    (modal: MobileModalType, partnerId: string | null = null) => {
      triggerHaptic();
      setActiveModalState(modal);
      if (partnerId !== null) {
        setSelectedPartnerId(partnerId);
      }
    },
    [triggerHaptic]
  );

  const activePet = pets.find((p) => p.id === activePetId) || pets[0];

  const completeOnboarding = useCallback(
    (payload: {
      phone: string;
      ownerName: string;
      neighborhood: string;
      petName: string;
      species: 'dog' | 'cat';
      breed: string;
      weightKg: number;
      vaccinatedFull: boolean;
      goodHabits: string[];
      cautions: string[];
    }) => {
      triggerHaptic();
      const newPetId = `pet-${Date.now()}`;
      const newPet: MobilePet = {
        id: newPetId,
        name: payload.petName || 'Lu',
        species: payload.species,
        breed: payload.breed || (payload.species === 'dog' ? 'Golden Retriever' : 'Mèo Anh Lông Ngắn'),
        gender: 'male',
        ageDisplay: '1 tuổi 6 tháng',
        weightKg: payload.weightKg || 12,
        sizeLabel: payload.weightKg < 10 ? 'Cỡ nhỏ (<10kg)' : 'Cỡ trung/lớn',
        isNeutered: true,
        avatarUrl:
          payload.species === 'dog'
            ? 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80'
            : 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=600&q=80',
        bio: `Hồ sơ của ${payload.petName || 'Boss'} tại ${payload.neighborhood || 'Vinhomes Grand Park'}.`,
        vaccinationStatus: payload.vaccinatedFull ? 'full' : 'partial',
        vetClinicName: 'Phòng Khám Thú Y Dr. Paw',
        vetDoctorName: 'BS. Trần Minh Khoa',
        vetPhone: '028 3899 1122',
        vaccinations: payload.vaccinatedFull
          ? [
              {
                id: `vac-${Date.now()}`,
                vaccineName: payload.species === 'dog' ? 'Vắc-xin 7 bệnh & Phòng dại' : 'Vắc-xin 4 bệnh Mèo & Dại',
                dateGiven: '15/10/2026',
                nextDueDate: '15/10/2027',
                clinicName: 'Dr. Paw Clinic',
                verified: true,
              },
            ]
          : [],
        behaviors: [
          ...payload.goodHabits.map((label, idx) => ({
            id: `gh-${idx}`,
            category: 'good_habit' as const,
            label,
          })),
          ...payload.cautions.map((label, idx) => ({
            id: `ct-${idx}`,
            category: 'caution' as const,
            label,
          })),
        ],
        weightHistory: [{ month: 'T10', weightKg: payload.weightKg || 12 }],
        momentPhotos: [
          payload.species === 'dog'
            ? 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=500&q=80'
            : 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=500&q=80',
        ],
      };

      setOwnerPhone(payload.phone || '0912 345 678');
      setOwnerName(payload.ownerName || 'Mai Nguyễn');
      setOwnerNeighborhood(payload.neighborhood || 'Vinhomes Grand Park');
      setPets((prev) => [newPet, ...prev]);
      setActivePetId(newPetId);
      setHasCompletedOnboarding(true);
      setActiveTabState('today');

      callBackendApi('/pets', 'POST', newPet as unknown as Record<string, unknown>).catch(() => {});
      showToast(`Chào mừng ${newPet.name} đến Pawty! 🐾`, 'Hồ sơ Boss & Sổ tiêm điện tử đã sẵn sàng.', 'success');
    },
    [callBackendApi, showToast, triggerHaptic]
  );

  const restartOnboarding = useCallback(() => {
    triggerHaptic();
    setHasCompletedOnboarding(false);
  }, [triggerHaptic]);

  const toggleTaskStatus = useCallback(
    (taskId: string) => {
      triggerHaptic();
      setTasks((prev) =>
        prev.map((task) => {
          if (task.id !== taskId) return task;
          const nextDone = task.status !== 'done';
          if (nextDone) {
            setCircleActivities((acts) => [
              {
                id: `act-${Date.now()}`,
                actorName: ownerName,
                actionText: `vừa hoàn thành "${task.title}"`,
                timestamp: 'Vừa xong',
              },
              ...acts,
            ]);
            showToast('Hoàn thành công việc! 🎉', `Đã báo cho cả Vòng chăm sóc (Circle) về "${task.title}".`, 'success');
          }
          return {
            ...task,
            status: nextDone ? 'done' : 'pending',
            completedByName: nextDone ? ownerName : undefined,
            completedAt: nextDone ? 'Vừa xong' : undefined,
          };
        })
      );
      callBackendApi(`/tasks/${taskId}/complete`, 'PUT', { note: 'Hoàn thành trên Expo Mobile' }).catch(() => {});
    },
    [callBackendApi, ownerName, showToast, triggerHaptic]
  );

  const createCareTask = useCallback(
    (title: string, category: MobileCareTask['category'], dueTime: string, assignedToName: string) => {
      if (!title.trim()) return;
      triggerHaptic();
      const newTask: MobileCareTask = {
        id: `task-${Date.now()}`,
        petId: activePet.id,
        petName: activePet.name,
        title: title.trim(),
        category,
        assignedToName: assignedToName || ownerName,
        dueTime: dueTime || '18:00',
        recurrence: 'Hàng ngày',
        status: 'pending',
      };
      setTasks((prev) => [newTask, ...prev]);
      setActiveModalState(null);
      callBackendApi('/tasks', 'POST', newTask as unknown as Record<string, unknown>).catch(() => {});
      showToast('Đã tạo việc chăm sóc 📋', `Đã giao cho ${newTask.assignedToName} lúc ${newTask.dueTime}.`, 'success');
    },
    [activePet.id, activePet.name, callBackendApi, ownerName, showToast, triggerHaptic]
  );

  const inviteCircleMember = useCallback(
    (displayName: string, relationshipLabel: string, role: MobileCircleMember['role']) => {
      if (!displayName.trim()) return;
      triggerHaptic();
      const inviteCode = `PAWTY-${Math.floor(1000 + Math.random() * 9000)}`;
      const newMember: MobileCircleMember = {
        id: `cm-${Date.now()}`,
        displayName: displayName.trim(),
        relationshipLabel: relationshipLabel.trim() || 'Thành viên gia đình',
        role,
        avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
        inviteCode,
      };
      setCircleMembers((prev) => [...prev, newMember]);
      setCircleActivities((prev) => [
        {
          id: `act-${Date.now()}`,
          actorName: ownerName,
          actionText: `đã mời ${newMember.displayName} (${newMember.relationshipLabel}) vào Vòng chăm sóc — Mã: ${inviteCode}`,
          timestamp: 'Vừa xong',
        },
        ...prev,
      ]);
      setActiveModalState(null);
      callBackendApi('/households/hh-mai/invite', 'POST', {
        displayName: newMember.displayName,
        relationshipLabel: newMember.relationshipLabel,
        role,
      }).catch(() => {});
      showToast('Đã mời vào Vòng chăm sóc 🤝', `Mã mời: ${inviteCode} cho ${newMember.displayName}`, 'success');
    },
    [callBackendApi, ownerName, showToast, triggerHaptic]
  );

  const addVaccination = useCallback(
    (vaccineName: string, clinicName: string) => {
      if (!vaccineName.trim()) return;
      triggerHaptic();
      const newVac = {
        id: `vac-${Date.now()}`,
        vaccineName: vaccineName.trim(),
        dateGiven: '29/10/2026',
        nextDueDate: '29/10/2027',
        clinicName: clinicName.trim() || 'Dr. Paw Clinic',
        verified: true,
      };
      setPets((prev) =>
        prev.map((pet) =>
          pet.id === activePet.id
            ? {
                ...pet,
                vaccinationStatus: 'full',
                vaccinations: [newVac, ...pet.vaccinations],
              }
            : pet
        )
      );
      callBackendApi(`/pets/${activePet.id}/vaccinations`, 'POST', newVac).catch(() => {});
      showToast('Đã cập nhật Sổ tiêm 🟢', `Mũi tiêm "${newVac.vaccineName}" đã được xác nhận.`, 'success');
    },
    [activePet.id, callBackendApi, showToast, triggerHaptic]
  );

  const createPost = useCallback(
    (contentType: MobilePost['contentType'], textContent: string, hashtags: string[]): boolean => {
      const check = moderateMobileContent(textContent);
      if (!check.allowed) {
        showToast('Bị chặn bởi Kiểm duyệt 4 lớp 🛡️', check.reason || 'Nội dung vi phạm chính sách.', 'danger');
        return false;
      }

      triggerHaptic();
      const newPost: MobilePost = {
        id: `post-${Date.now()}`,
        authorName: ownerName,
        authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
        authorRoleBadge: isVip ? 'vip' : undefined,
        petId: activePet.id,
        petName: activePet.name,
        petBreed: activePet.breed,
        petSpecies: activePet.species,
        contentType,
        textContent: textContent.trim(),
        imageUrl: activePet.avatarUrl,
        hashtags: hashtags.length > 0 ? hashtags : ['#PawtyLocal', `#${activePet.name}`],
        locationDistrict: ownerNeighborhood,
        distanceMeters: 50,
        hasHealthDisclaimer: check.hasHealthDisclaimer,
        isSponsored: false,
        pawRankScore: 98,
        createdAt: 'Vừa xong',
        reactions: { paw: 1, heart_eyes: 0, laughing: 0, worried: 0, helpful: 0 },
        userReaction: 'paw',
        isBookmarked: false,
        comments: [],
      };

      setPosts((prev) => [newPost, ...prev]);
      setActiveModalState(null);
      setActiveTabState('explore');
      setExploreSubTab(contentType === 'question' ? 'qa' : 'feed');

      callBackendApi('/posts', 'POST', {
        textContent: newPost.textContent,
        contentType: newPost.contentType,
        petId: activePet.id,
        petName: activePet.name,
      }).catch(() => {});

      showToast(
        check.hasHealthDisclaimer ? 'Đã đăng kèm Cảnh báo Y khoa ⚕️' : 'Đã đăng lên Bảng tin Pawty! 🐾',
        check.hasHealthDisclaimer
          ? 'Hệ thống tự động gắn khuyến cáo tham khảo Bác sĩ thú y.'
          : `Khoảnh khắc của ${activePet.name} đã hiển thị trên Feed.`,
        'success'
      );
      return true;
    },
    [activePet, callBackendApi, isVip, ownerName, ownerNeighborhood, showToast, triggerHaptic]
  );

  const reactToPost = useCallback(
    (postId: string, reaction: MobileReactionKey) => {
      triggerHaptic();
      setPosts((prev) =>
        prev.map((post) => {
          if (post.id !== postId) return post;
          const nextReactions = { ...post.reactions };
          nextReactions[reaction] = (nextReactions[reaction] || 0) + 1;
          return {
            ...post,
            reactions: nextReactions,
            userReaction: reaction,
          };
        })
      );
      callBackendApi(`/posts/${postId}/reactions`, 'POST', { reaction }).catch(() => {});
    },
    [callBackendApi, triggerHaptic]
  );

  const addCommentToPost = useCallback(
    (postId: string, content: string) => {
      if (!content.trim()) return;
      triggerHaptic();
      setPosts((prev) =>
        prev.map((post) => {
          if (post.id !== postId) return post;
          return {
            ...post,
            comments: [
              ...post.comments,
              {
                id: `cmt-${Date.now()}`,
                authorName: ownerName,
                authorBadge: isVip ? 'vip' : undefined,
                content: content.trim(),
                createdAt: 'Vừa xong',
              },
            ],
          };
        })
      );
      callBackendApi(`/posts/${postId}/comments`, 'POST', { content: content.trim() }).catch(() => {});
    },
    [callBackendApi, isVip, ownerName, triggerHaptic]
  );

  const toggleBookmarkPost = useCallback(
    (postId: string) => {
      triggerHaptic();
      setPosts((prev) =>
        prev.map((post) => (post.id === postId ? { ...post, isBookmarked: !post.isBookmarked } : post))
      );
      callBackendApi(`/posts/${postId}/bookmark`, 'POST').catch(() => {});
      showToast('Đã cập nhật Kho lưu trữ 🔖', 'Bạn có thể xem lại bài viết bất cứ lúc nào.', 'info');
    },
    [callBackendApi, showToast, triggerHaptic]
  );

  const toggleJoinGroup = useCallback(
    (groupId: string) => {
      triggerHaptic();
      setGroups((prev) =>
        prev.map((group) => {
          if (group.id !== groupId) return group;
          const nextJoined = !group.isJoined;
          showToast(
            nextJoined ? 'Đã tham gia Nhóm 🎉' : 'Đã rời Nhóm',
            group.name,
            nextJoined ? 'success' : 'info'
          );
          return {
            ...group,
            isJoined: nextJoined,
            memberCount: group.memberCount + (nextJoined ? 1 : -1),
          };
        })
      );
      callBackendApi(`/groups/${groupId}/join`, 'POST').catch(() => {});
    },
    [callBackendApi, showToast, triggerHaptic]
  );

  const swipeRadarCandidate = useCallback(
    (candidateId: string, direction: 'left' | 'right') => {
      triggerHaptic();
      const target = radarCandidates.find((c) => c.id === candidateId);
      if (direction === 'right' && target) {
        if (!matchedIds.includes(candidateId)) {
          setMatchedIds((prev) => [...prev, candidateId]);
        }
        setLatestMatchPetName(`${target.petName} (${target.petBreed})`);
        showToast(
          'Tương hợp Hẹn Dắt Dạo! 🎊',
          `${activePet.name} và ${target.petName} của ${target.ownerName} đã Match!`,
          'success'
        );
      }
      callBackendApi(`/matches/${candidateId}/swipe`, 'POST', { direction }).catch(() => {});
    },
    [activePet.name, callBackendApi, matchedIds, radarCandidates, showToast, triggerHaptic]
  );

  const clearMatchCelebration = useCallback(() => {
    setLatestMatchPetName(null);
  }, []);

  const createWalkAppointment = useCallback(
    (partnerName: string, partnerPetName: string, proposedTime: string, midpointLocationName: string) => {
      triggerHaptic();
      const newWalk: MobileWalkAppointment = {
        id: `walk-${Date.now()}`,
        partnerName,
        partnerPetName,
        proposedTime,
        midpointLocationName,
        distanceFromMidpointMeters: 180,
        status: 'confirmed',
        notes: 'Điểm hẹn trung điểm ST_Centroid an toàn cho 2 Boss.',
      };
      setWalkAppointments((prev) => [newWalk, ...prev]);
      setActiveModalState(null);
      callBackendApi('/appointments', 'POST', newWalk as unknown as Record<string, unknown>).catch(() => {});
      showToast('Đã gửi Lịch hẹn dắt dạo 📍', `Điểm hẹn trung điểm: ${midpointLocationName}`, 'success');
    },
    [callBackendApi, showToast, triggerHaptic]
  );

  const updateWalkStatus = useCallback(
    (walkId: string, status: MobileWalkAppointment['status']) => {
      triggerHaptic();
      setWalkAppointments((prev) => prev.map((w) => (w.id === walkId ? { ...w, status } : w)));
      callBackendApi(`/appointments/${walkId}`, 'PUT', { status }).catch(() => {});
      if (status === 'no_show') {
        showToast(
          'Đã ghi nhận Báo cáo Bùng kèo ⚠️',
          'Tài khoản vi phạm 2 lần/tuần sẽ bị khóa Radar 3 ngày.',
          'warning'
        );
      } else {
        showToast('Đã cập nhật Lịch hẹn dạo 🐾', `Trạng thái: ${status}`, 'success');
      }
    },
    [callBackendApi, showToast, triggerHaptic]
  );

  const sendMessage = useCallback(
    (convId: string, text: string, type: 'text' | 'voice' | 'walk_invite' = 'text') => {
      if (!text.trim()) return;
      triggerHaptic();
      setConversations((prev) =>
        prev.map((conv) => {
          if (conv.id !== convId) return conv;
          return {
            ...conv,
            subtitle: text.trim(),
            messages: [
              ...conv.messages,
              {
                id: `msg-${Date.now()}`,
                senderName: ownerName,
                isMe: true,
                text: text.trim(),
                createdAt: 'Vừa xong',
                type,
              },
            ],
          };
        })
      );
    },
    [ownerName, triggerHaptic]
  );

  const createServiceBooking = useCallback(
    (partnerId: string, serviceId: string, bookingDate: string, bookingTime: string, notes: string) => {
      triggerHaptic();
      const partner = partners.find((p) => p.id === partnerId) || partners[0];
      const service = partner.services.find((s) => s.id === serviceId) || partner.services[0];
      const newBooking: MobileBooking = {
        id: `bk-${Date.now()}`,
        partnerId: partner.id,
        partnerName: partner.businessName,
        serviceName: service.name,
        petName: `${activePet.name} (${activePet.breed})`,
        bookingDate: bookingDate || 'Thứ Bảy tuần này',
        bookingTime: bookingTime || '10:00',
        servicePrice: service.priceVnd,
        commissionVnd: Math.round(service.priceVnd * 0.12),
        status: 'confirmed',
        notes: notes || `Cần lưu ý: ${activePet.behaviors.filter((b) => b.category === 'caution').map((b) => b.label).join(', ')}`,
      };
      setBookings((prev) => [newBooking, ...prev]);
      setActiveModalState(null);
      callBackendApi('/bookings', 'POST', newBooking as unknown as Record<string, unknown>).catch(() => {});
      showToast('Đặt lịch dịch vụ thành công! 📅', `${partner.businessName} — ${newBooking.bookingTime} ${newBooking.bookingDate}`, 'success');
    },
    [activePet, callBackendApi, partners, showToast, triggerHaptic]
  );

  const updateBookingStatus = useCallback(
    (bookingId: string, status: MobileBooking['status']) => {
      triggerHaptic();
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status } : b)));
      callBackendApi(`/bookings/${bookingId}/status`, 'PUT', { status }).catch(() => {});
      showToast('Pawty Pro cập nhật lịch hẹn', `Trạng thái đơn #${bookingId}: ${status}`, 'info');
    },
    [callBackendApi, showToast, triggerHaptic]
  );

  const upgradeVip = useCallback(
    (planName: string) => {
      triggerHaptic();
      setIsVip(true);
      setVipPlanName(planName);
      setActiveModalState(null);
      callBackendApi('/vip/subscribe', 'POST', { plan: planName }).catch(() => {});
      showToast('Kích hoạt Gói Sen VIP thành công! 👑', `Bạn đã mở khóa toàn bộ đặc quyền ${planName}.`, 'success');
    },
    [callBackendApi, showToast, triggerHaptic]
  );

  const createSosAlert = useCallback(
    (lastSeenAddress: string, rewardText: string) => {
      triggerHaptic();
      const newSos: MobileSosAlert = {
        id: `sos-${Date.now()}`,
        ownerName,
        ownerPhone,
        petName: `${activePet.name} (${activePet.breed})`,
        petAvatar: activePet.avatarUrl,
        lastSeenAddress: lastSeenAddress.trim() || ownerNeighborhood,
        radiusKm: 3,
        rewardText: rewardText.trim() || 'Hậu tạ 2.000.000đ cho người tìm thấy',
        status: 'active',
        createdAt: 'Vừa phát tín hiệu',
        sightingCount: 0,
      };
      setSosAlerts((prev) => [newSos, ...prev]);
      setActiveModalState(null);
      callBackendApi('/sos', 'POST', newSos as unknown as Record<string, unknown>).catch(() => {});
      showToast('Đã phát Báo động SOS 3km! 🚨', `Đã gửi Push Notification tới toàn bộ Sen quanh ${newSos.lastSeenAddress}.`, 'danger');
    },
    [activePet, callBackendApi, ownerName, ownerNeighborhood, ownerPhone, showToast, triggerHaptic]
  );

  const reportSosSighting = useCallback(
    (sosId: string) => {
      triggerHaptic();
      setSosAlerts((prev) =>
        prev.map((s) => (s.id === sosId ? { ...s, sightingCount: s.sightingCount + 1 } : s))
      );
      callBackendApi(`/sos/${sosId}/sighting`, 'POST').catch(() => {});
      showToast('Đã gửi tọa độ nhìn thấy Boss! 📍', 'Chủ nuôi đã nhận được thông báo khẩn cấp từ bạn.', 'success');
    },
    [callBackendApi, showToast, triggerHaptic]
  );

  return (
    <MobilePawtyContext.Provider
      value={{
        apiBaseUrl,
        isApiOnline,
        hasCompletedOnboarding,
        activeTab,
        exploreSubTab,
        activeModal,
        selectedPartnerId,
        activeConversationId,
        toast,
        ownerName,
        ownerPhone,
        ownerNeighborhood,
        isVip,
        vipPlanName,
        pets,
        activePetId,
        activePet,
        tasks,
        circleMembers,
        circleActivities,
        posts,
        groups,
        radarCandidates,
        matchedIds,
        latestMatchPetName,
        partners,
        places,
        bookings,
        walkAppointments,
        conversations,
        sosAlerts,
        setActiveTab,
        setExploreSubTab,
        setActiveModal,
        setActiveConversationId,
        setActivePetId,
        showToast,
        syncWithLanBackend,
        completeOnboarding,
        restartOnboarding,
        toggleTaskStatus,
        createCareTask,
        inviteCircleMember,
        addVaccination,
        createPost,
        reactToPost,
        addCommentToPost,
        toggleBookmarkPost,
        toggleJoinGroup,
        swipeRadarCandidate,
        clearMatchCelebration,
        createWalkAppointment,
        updateWalkStatus,
        sendMessage,
        createServiceBooking,
        updateBookingStatus,
        upgradeVip,
        createSosAlert,
        reportSosSighting,
      }}
    >
      {children}
    </MobilePawtyContext.Provider>
  );
};

export function useMobilePawty(): MobilePawtyContextValue {
  const ctx = useContext(MobilePawtyContext);
  if (!ctx) {
    throw new Error('useMobilePawty must be used within MobilePawtyProvider');
  }
  return ctx;
}

