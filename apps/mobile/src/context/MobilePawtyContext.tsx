import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  MobilePet,
  MobilePost,
  MobileAppointment,
  MobileService,
  MobileChatRoom,
  MobileSosAlert,
  MobileNotificationItem,
  PublicUserProfile,
  TinderCandidate,
  TinderIntent,
  UserTinderSetupProfile,
  SuggestedPersonCard,
  VipPlanOption,
  INITIAL_MOBILE_PETS,
  INITIAL_MOBILE_POSTS,
  INITIAL_MOBILE_APPOINTMENTS,
  INITIAL_MOBILE_SERVICES,
  INITIAL_MOBILE_CHATS,
  INITIAL_MOBILE_SOS,
  INITIAL_MOBILE_NOTIFICATIONS,
  INITIAL_SEARCH_HISTORY,
  TRENDING_SEARCH_SUGGESTIONS,
  PUBLIC_USER_PROFILES,
  INITIAL_TINDER_CANDIDATES,
  INITIAL_USER_TINDER_SETUP,
  INITIAL_SUGGESTED_PEOPLE,
  VIP_PLAN_OPTIONS,
} from '../data/mobileSeedData';

export const MAX_FREE_PETS = 3;

export type MobileMainTab =
  | 'explore'
  | 'tinder'
  | 'services'
  | 'appointments'
  | 'chat'
  | 'profile'
  | 'sos';

export type MobileModalType =
  | null
  | 'new_moment'
  | 'book_service'
  | 'vip_upgrade'
  | 'notifications'
  | 'edit_profile'
  | 'my_settings'
  | 'tinder_setup';

export type ThemePresetId = 'warm_cream' | 'calm_sage' | 'cozy_blush' | 'minimal_slate';

export interface ThemePalette {
  id: ThemePresetId;
  name: string;
  description: string;
  bg: string;
  surface: string;
  surfaceMuted: string;
  primary: string;
  primarySoft: string;
  secondary: string;
  secondarySoft: string;
  text: string;
  textMuted: string;
  border: string;
}

export const THEME_PALETTES: Record<ThemePresetId, ThemePalette> = {
  warm_cream: {
    id: 'warm_cream',
    name: 'Kem Ấm Áp',
    description: 'Nhẹ nhàng, thân thiện và gần gũi mỗi ngày',
    bg: '#FAF7F2',
    surface: '#FFFFFF',
    surfaceMuted: '#F3EFEA',
    primary: '#E06D53',
    primarySoft: '#FBECE8',
    secondary: '#529471',
    secondarySoft: '#E8F3EE',
    text: '#2A2522',
    textMuted: '#78706A',
    border: '#EAE4DC',
  },
  calm_sage: {
    id: 'calm_sage',
    name: 'Xanh Thảo Mộc',
    description: 'Thư thái, dịu mắt và mát lành',
    bg: '#F4F7F5',
    surface: '#FFFFFF',
    surfaceMuted: '#EBF0ED',
    primary: '#3F7D5E',
    primarySoft: '#E4F0EA',
    secondary: '#D4804D',
    secondarySoft: '#F9EDE5',
    text: '#1F2924',
    textMuted: '#65736B',
    border: '#DFE7E2',
  },
  cozy_blush: {
    id: 'cozy_blush',
    name: 'Hồng Đào Dịu',
    description: 'Ngọt ngào, ấm cúng nhưng không chói mắt',
    bg: '#FBF7F7',
    surface: '#FFFFFF',
    surfaceMuted: '#F5EDED',
    primary: '#C96A6A',
    primarySoft: '#F9EBEB',
    secondary: '#5B8C7A',
    secondarySoft: '#E8F2EE',
    text: '#2D2424',
    textMuted: '#7D6E6E',
    border: '#EFE4E4',
  },
  minimal_slate: {
    id: 'minimal_slate',
    name: 'Xám Tối Giản',
    description: 'Hiện đại, tinh gọn và tập trung vào nội dung',
    bg: '#F6F7F8',
    surface: '#FFFFFF',
    surfaceMuted: '#EDEFF2',
    primary: '#3B5978',
    primarySoft: '#E8EEF4',
    secondary: '#4C8577',
    secondarySoft: '#E6F1EE',
    text: '#1E2328',
    textMuted: '#68707A',
    border: '#E3E6EA',
  },
};

export interface LightboxMediaState {
  postId: string;
  mediaUrls: string[];
  mediaType: 'image' | 'video';
  videoDuration?: string;
  initialIndex: number;
  authorName: string;
  caption: string;
}

interface MobilePawtyContextType {
  // Auth, Single-Device Session & Onboarding
  isAuthLoaded: boolean;
  isAuthenticated: boolean;
  activeDeviceSessionId: string;
  activeDeviceName: string;
  ownerName: string;
  ownerHandle: string;
  ownerNickname: string;
  ownerPhone: string;
  ownerBio: string;
  ownerArea: string;
  ownerNoteBubble: string;
  setOwnerNoteBubble: (note: string) => void;
  isPrivateProfile: boolean;
  loginOrRegister: (params: {
    name: string;
    phone: string;
    petName?: string;
    petSpecies?: 'Chó' | 'Mèo';
    petBreed?: string;
  }) => Promise<void>;
  logoutUser: () => Promise<void>;
  forceRevokeOtherDevices: () => void;
  updateOwnerAndPetProfile: (params: {
    ownerName: string;
    ownerNickname: string;
    ownerBio: string;
    ownerArea: string;
    isPrivateProfile: boolean;
    petId: string;
    petName: string;
    petSpecies: 'Chó' | 'Mèo';
    petBreed: string;
    petGender: 'Đực' | 'Cái';
    petBirthDate: string;
    petAgeLabel: string;
    petWeightKg: number;
    petFurColor: string;
    petMicrochipOrMark: string;
    petFavoriteFood: string;
    petAllergies: string;
    petIsVaccinatedAndRabies: boolean;
    petGoodHabits: string[];
    petCautionHabits: string[];
  }) => void;
  togglePrivateProfile: () => void;
  togglePetVaccinationAndRabies: (petId: string) => void;
  addNewPetProfile: (params: {
    name: string;
    species: 'Chó' | 'Mèo';
    breed: string;
    weightKg: number;
    ageLabel: string;
  }) => void;
  deletePetProfile: (petId: string) => void;

  // User Tinder Setup Profile (for `Kết nối`)
  userTinderSetup: UserTinderSetupProfile;
  updateUserTinderSetup: (nextSetup: UserTinderSetupProfile) => void;

  // Instagram Suggested People (`Khám phá mọi người`)
  suggestedPeople: SuggestedPersonCard[];
  toggleFollowSuggestedPerson: (id: string) => void;
  dismissSuggestedPerson: (id: string) => void;

  // Theme
  themeId: ThemePresetId;
  theme: ThemePalette;
  setThemeId: (id: ThemePresetId) => void;

  // Navigation & Hardware Back Stack
  activeTab: MobileMainTab;
  setActiveTab: (tab: MobileMainTab) => void;
  activeModal: MobileModalType;
  setActiveModal: (modal: MobileModalType) => void;
  handleHardwareBack: () => boolean;

  // Pets (Max 3 Free)
  pets: MobilePet[];
  activePetId: string;
  activePet: MobilePet;
  setActivePetId: (id: string) => void;

  // Explore Social Feed & Search History
  posts: MobilePost[];
  searchHistory: string[];
  trendingSuggestions: string[];
  isSearchPanelOpen: boolean;
  setIsSearchPanelOpen: (open: boolean) => void;
  recordSearchQuery: (query: string) => void;
  removeSearchHistoryItem: (query: string) => void;
  clearSearchHistory: () => void;
  toggleReaction: (postId: string, type?: keyof MobilePost['reactions']) => void;
  toggleSavePost: (postId: string) => void;
  sharePost: (postId: string) => void;
  addComment: (postId: string, content: string) => void;
  createPost: (params: {
    content: string;
    tags: string[];
    mediaUrls: string[];
    mediaType: 'image' | 'video';
  }) => void;

  // Fullscreen Media Lightbox
  lightboxMedia: LightboxMediaState | null;
  openLightboxMedia: (state: LightboxMediaState) => void;
  closeLightboxMedia: () => void;

  // Public User Profile (Instagram Style)
  publicProfiles: Record<string, PublicUserProfile>;
  viewedUserHandle: string | null;
  openPublicUserProfile: (handle: string) => void;
  closePublicUserProfile: () => void;
  toggleFriendStatus: (handle: string) => void;
  startDirectChatWithUser: (handle: string) => void;

  // Services & Appointments
  appointments: MobileAppointment[];
  services: MobileService[];
  selectedServiceForBooking: MobileService | null;
  openBookingForService: (service: MobileService) => void;
  bookAppointment: (params: {
    serviceId: string;
    dateLabel: string;
    timeSlot: string;
    notes: string;
  }) => void;
  cancelAppointment: (appointmentId: string) => void;

  // Kết nối (Tinder) Tab
  tinderIntent: TinderIntent;
  setTinderIntent: (intent: TinderIntent) => void;
  tinderCandidates: TinderCandidate[];
  swipedCandidateHistory: TinderCandidate[];
  matchedCandidateModal: TinderCandidate | null;
  closeMatchedCandidateModal: () => void;
  swipeTinderCandidate: (candidateId: string, direction: 'left' | 'right') => void;
  rewindLastSwipe: () => void;
  openChatWithMatchedCandidate: (candidate: TinderCandidate) => void;
  showLikesYouDrawer: boolean;
  setShowLikesYouDrawer: (open: boolean) => void;
  activePassportArea: string;
  cyclePassportArea: () => void;

  // Chat
  chats: MobileChatRoom[];
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;
  sendChatMessage: (chatId: string, text: string) => void;

  // SOS Fullscreen Tab
  sosAlerts: MobileSosAlert[];
  createSosAlertWithFee: (params: {
    petName: string;
    species: 'Chó' | 'Mèo';
    breed: string;
    lastSeenLocation: string;
    rewardAmount: string;
    description: string;
    imageUrl?: string;
  }) => void;
  reportSosSighting: (sosId: string, locationText: string, noteText?: string) => void;
  confirmSosPetFound: (sosId: string) => void;

  // VIP / Plus Plans
  isVip: boolean;
  activeVipPlanId: string;
  vipPlans: VipPlanOption[];
  selectAndActivateVipPlan: (planId: string) => void;

  // Notifications & Toast
  notifications: MobileNotificationItem[];
  unreadNotificationCount: number;
  markNotificationRead: (id: string) => void;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const STORAGE_KEY_AUTH = '@pawty_auth_single_device_v4';
const STORAGE_KEY_THEME = '@pawty_theme_v4';

const MobilePawtyContext = createContext<MobilePawtyContextType | null>(null);

export const MobilePawtyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeDeviceSessionId, setActiveDeviceSessionId] = useState(
    `DEV-${Platform.OS.toUpperCase()}-8829`
  );
  const [activeDeviceName] = useState(
    Platform.OS === 'ios'
      ? 'iPhone chính chủ (Phiên duy nhất)'
      : 'Điện thoại Android chính chủ (Phiên duy nhất)'
  );

  const [ownerName, setOwnerName] = useState('Mai Nguyễn');
  const [ownerHandle] = useState('@mainguyen');
  const [ownerNickname, setOwnerNickname] = useState('Bạn thân của cún');
  const [ownerPhone, setOwnerPhone] = useState('0909 123 456');
  const [ownerBio, setOwnerBio] = useState(
    'Yêu chó mèo, thích dạo bộ công viên mỗi chiều và chia sẻ khoảnh khắc thú cưng.'
  );
  const [ownerArea, setOwnerArea] = useState('Vinhomes Grand Park, TP. Thủ Đức');
  const [ownerNoteBubble, setOwnerNoteBubble] = useState('Chiều nay ai ra công viên không?');
  const [isPrivateProfile, setIsPrivateProfile] = useState(false);

  const [userTinderSetup, setUserTinderSetup] = useState<UserTinderSetupProfile>(
    INITIAL_USER_TINDER_SETUP
  );
  const [suggestedPeople, setSuggestedPeople] = useState<SuggestedPersonCard[]>(
    INITIAL_SUGGESTED_PEOPLE
  );

  const [themeId, setThemeIdState] = useState<ThemePresetId>('warm_cream');

  // Navigation & History Stack for Hardware Back Button
  const [activeTab, setActiveTabState] = useState<MobileMainTab>('explore');
  const [tabHistory, setTabHistory] = useState<MobileMainTab[]>(['explore']);
  const [activeModal, setActiveModal] = useState<MobileModalType>(null);

  const [pets, setPets] = useState<MobilePet[]>(INITIAL_MOBILE_PETS);
  const [activePetId, setActivePetId] = useState<string>(INITIAL_MOBILE_PETS[0].id);

  // Explore Social Feed & Search
  const [posts, setPosts] = useState<MobilePost[]>(INITIAL_MOBILE_POSTS);
  const [searchHistory, setSearchHistory] = useState<string[]>(INITIAL_SEARCH_HISTORY);
  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false);

  // Lightbox & Public Profile
  const [lightboxMedia, setLightboxMedia] = useState<LightboxMediaState | null>(null);
  const [publicProfiles, setPublicProfiles] =
    useState<Record<string, PublicUserProfile>>(PUBLIC_USER_PROFILES);
  const [viewedUserHandle, setViewedUserHandle] = useState<string | null>(null);

  // Services & Appointments
  const [appointments, setAppointments] = useState<MobileAppointment[]>(
    INITIAL_MOBILE_APPOINTMENTS
  );
  const [services] = useState<MobileService[]>(INITIAL_MOBILE_SERVICES);
  const [selectedServiceForBooking, setSelectedServiceForBooking] =
    useState<MobileService | null>(null);

  // Kết nối (Tinder)
  const [tinderIntent, setTinderIntent] = useState<TinderIntent>('dating');
  const [tinderCandidates, setTinderCandidates] = useState<TinderCandidate[]>(
    INITIAL_TINDER_CANDIDATES
  );
  const [swipedCandidateHistory, setSwipedCandidateHistory] = useState<TinderCandidate[]>([]);
  const [matchedCandidateModal, setMatchedCandidateModal] = useState<TinderCandidate | null>(null);
  const [showLikesYouDrawer, setShowLikesYouDrawer] = useState(false);
  const [activePassportArea, setActivePassportArea] = useState('Quanh bạn (Bán kính 3km)');

  // Chat
  const [chats, setChats] = useState<MobileChatRoom[]>(INITIAL_MOBILE_CHATS);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);

  // SOS & VIP
  const [sosAlerts, setSosAlerts] = useState<MobileSosAlert[]>(INITIAL_MOBILE_SOS);
  const [isVip, setIsVip] = useState<boolean>(false);
  const [activeVipPlanId, setActiveVipPlanId] = useState<string>('plus_monthly');

  // Notifications & Toast
  const [notifications, setNotifications] = useState<MobileNotificationItem[]>(
    INITIAL_MOBILE_NOTIFICATIONS
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const [savedAuth, savedTheme] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY_AUTH),
          AsyncStorage.getItem(STORAGE_KEY_THEME),
        ]);
        if (savedTheme && THEME_PALETTES[savedTheme as ThemePresetId]) {
          setThemeIdState(savedTheme as ThemePresetId);
        }
        if (savedAuth) {
          const parsed = JSON.parse(savedAuth);
          if (parsed && parsed.isAuthenticated && parsed.deviceSessionId) {
            setIsAuthenticated(true);
            setActiveDeviceSessionId(parsed.deviceSessionId);
            if (parsed.ownerName) setOwnerName(parsed.ownerName);
            if (parsed.ownerPhone) setOwnerPhone(parsed.ownerPhone);
            if (parsed.ownerNickname) setOwnerNickname(parsed.ownerNickname);
          }
        }
      } catch (err) {
        console.warn('Không thể đọc phiên đăng nhập:', err);
      } finally {
        setIsAuthLoaded(true);
      }
    };
    loadSession();
  }, []);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  }, []);

  const setActiveTab = useCallback((nextTab: MobileMainTab) => {
    setActiveChatId(null);
    setIsSearchPanelOpen(false);
    setActiveTabState((prev) => {
      if (prev !== nextTab) {
        setTabHistory((history) => [...history.slice(-8), nextTab]);
      }
      return nextTab;
    });
  }, []);

  // Hardware Back Handler
  const handleHardwareBack = useCallback((): boolean => {
    if (lightboxMedia) {
      setLightboxMedia(null);
      return true;
    }
    if (matchedCandidateModal) {
      setMatchedCandidateModal(null);
      return true;
    }
    if (activeModal) {
      setActiveModal(null);
      return true;
    }
    if (viewedUserHandle) {
      setViewedUserHandle(null);
      return true;
    }
    if (isSearchPanelOpen) {
      setIsSearchPanelOpen(false);
      return true;
    }
    if (activeChatId) {
      setActiveChatId(null);
      return true;
    }
    if (tabHistory.length > 1) {
      const nextHistory = tabHistory.slice(0, -1);
      const previousTab = nextHistory[nextHistory.length - 1] || 'explore';
      setTabHistory(nextHistory);
      setActiveTabState(previousTab);
      return true;
    }
    if (activeTab !== 'explore') {
      setActiveTabState('explore');
      setTabHistory(['explore']);
      return true;
    }
    return false;
  }, [
    lightboxMedia,
    matchedCandidateModal,
    activeModal,
    viewedUserHandle,
    isSearchPanelOpen,
    activeChatId,
    tabHistory,
    activeTab,
  ]);

  const setThemeId = async (id: ThemePresetId) => {
    setThemeIdState(id);
    try {
      await AsyncStorage.setItem(STORAGE_KEY_THEME, id);
      showToast(`Đã đổi giao diện: ${THEME_PALETTES[id].name}`);
    } catch (err) {
      console.warn('Không thể lưu giao diện:', err);
    }
  };

  // Single-Device Login Enforcement
  const loginOrRegister = async (params: {
    name: string;
    phone: string;
    petName?: string;
    petSpecies?: 'Chó' | 'Mèo';
    petBreed?: string;
  }) => {
    const cleanName = params.name.trim() || 'Mai Nguyễn';
    const cleanPhone = params.phone.trim() || '0909 123 456';
    const newDeviceSessionId = `DEV-${Platform.OS.toUpperCase()}-${Date.now().toString().slice(-6)}`;

    setOwnerName(cleanName);
    setOwnerPhone(cleanPhone);
    setActiveDeviceSessionId(newDeviceSessionId);

    if (params.petName && params.petName.trim()) {
      const species = params.petSpecies || 'Chó';
      const newPet: MobilePet = {
        id: `pet-${Date.now()}`,
        name: params.petName.trim(),
        species,
        breed: params.petBreed?.trim() || (species === 'Chó' ? 'Corgi' : 'Mèo Anh lông ngắn'),
        gender: 'Đực',
        birthDate: '10/08/2024',
        ageLabel: '1 tuổi',
        weightKg: species === 'Chó' ? 10 : 4,
        furColor: 'Vàng trắng',
        microchipOrMark: 'Đeo bảng tên số điện thoại ở cổ',
        favoriteFood: 'Ức gà luộc, súp thưởng',
        allergies: 'Không có',
        avatarUrl:
          species === 'Chó'
            ? 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80'
            : 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
        coverUrl:
          'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1000&q=80',
        bio: `${params.petName.trim()} rất ngoan và thích làm quen bạn mới.`,
        isVaccinatedAndRabies: true,
        goodHabits: ['Thân thiện', 'Nghe lời'],
        cautionHabits: [],
      };
      setPets((prev) => [newPet, ...prev].slice(0, MAX_FREE_PETS));
      setActivePetId(newPet.id);
    }

    setIsAuthenticated(true);
    setActiveTabState('explore');
    setTabHistory(['explore']);
    try {
      await AsyncStorage.setItem(
        STORAGE_KEY_AUTH,
        JSON.stringify({
          isAuthenticated: true,
          ownerName: cleanName,
          ownerPhone: cleanPhone,
          deviceSessionId: newDeviceSessionId,
          singleDeviceLock: true,
        })
      );
    } catch (err) {
      console.warn('Không thể lưu phiên đăng nhập:', err);
    }
    showToast(`Đăng nhập thành công trên 1 thiết bị duy nhất (${newDeviceSessionId})`);
  };

  const forceRevokeOtherDevices = () => {
    const refreshedId = `DEV-${Platform.OS.toUpperCase()}-${Date.now().toString().slice(-6)}`;
    setActiveDeviceSessionId(refreshedId);
    showToast('Đã thu hồi mọi phiên cũ. Chỉ thiết bị hiện tại được phép truy cập!');
  };

  const logoutUser = async () => {
    setIsAuthenticated(false);
    setActiveModal(null);
    try {
      await AsyncStorage.removeItem(STORAGE_KEY_AUTH);
    } catch (err) {
      console.warn('Không thể xóa phiên đăng nhập:', err);
    }
  };

  const activePet = pets.find((p) => p.id === activePetId) || pets[0];
  const unreadNotificationCount = notifications.filter((n) => !n.isRead).length;

  const updateOwnerAndPetProfile = (params: {
    ownerName: string;
    ownerNickname: string;
    ownerBio: string;
    ownerArea: string;
    isPrivateProfile: boolean;
    petId: string;
    petName: string;
    petSpecies: 'Chó' | 'Mèo';
    petBreed: string;
    petGender: 'Đực' | 'Cái';
    petBirthDate: string;
    petAgeLabel: string;
    petWeightKg: number;
    petFurColor: string;
    petMicrochipOrMark: string;
    petFavoriteFood: string;
    petAllergies: string;
    petIsVaccinatedAndRabies: boolean;
    petGoodHabits: string[];
    petCautionHabits: string[];
  }) => {
    setOwnerName(params.ownerName.trim() || ownerName);
    setOwnerNickname(params.ownerNickname.trim() || ownerNickname);
    setOwnerBio(params.ownerBio.trim() || ownerBio);
    setOwnerArea(params.ownerArea.trim() || ownerArea);
    setIsPrivateProfile(params.isPrivateProfile);

    setPets((prev) =>
      prev.map((p) =>
        p.id === params.petId
          ? {
              ...p,
              name: params.petName.trim() || p.name,
              species: params.petSpecies,
              breed: params.petBreed.trim() || p.breed,
              gender: params.petGender,
              birthDate: params.petBirthDate.trim() || p.birthDate,
              ageLabel: params.petAgeLabel.trim() || p.ageLabel,
              weightKg: Number(params.petWeightKg) || p.weightKg,
              furColor: params.petFurColor.trim() || p.furColor,
              microchipOrMark: params.petMicrochipOrMark.trim() || p.microchipOrMark,
              favoriteFood: params.petFavoriteFood.trim() || p.favoriteFood,
              allergies: params.petAllergies.trim() || p.allergies,
              isVaccinatedAndRabies: params.petIsVaccinatedAndRabies,
              goodHabits: params.petGoodHabits,
              cautionHabits: params.petCautionHabits,
            }
          : p
      )
    );
    setActiveModal(null);
    showToast('Đã lưu cập nhật hồ sơ thành công');
  };

  const togglePrivateProfile = () => {
    setIsPrivateProfile((prev) => {
      const next = !prev;
      showToast(
        next
          ? 'Đã bật Hồ sơ riêng tư (Chỉ bạn bè & người đã Match Kết nối xem được)'
          : 'Đã chuyển sang Hồ sơ công khai'
      );
      return next;
    });
  };

  const togglePetVaccinationAndRabies = (petId: string) => {
    setPets((prev) =>
      prev.map((p) => {
        if (p.id !== petId) return p;
        const nextVal = !p.isVaccinatedAndRabies;
        showToast(
          nextVal
            ? `Đã đánh dấu bé ${p.name} tiêm chủng & phòng dại đầy đủ`
            : `Đã bỏ đánh dấu tiêm chủng của bé ${p.name}`
        );
        return { ...p, isVaccinatedAndRabies: nextVal };
      })
    );
  };

  // Max 3 Pets Free for All Users (Not tied to Plus)
  const addNewPetProfile = (params: {
    name: string;
    species: 'Chó' | 'Mèo';
    breed: string;
    weightKg: number;
    ageLabel: string;
  }) => {
    if (pets.length >= MAX_FREE_PETS) {
      showToast(`Mỗi tài khoản được tạo tối đa ${MAX_FREE_PETS} hồ sơ thú cưng (Miễn phí)`);
      return;
    }
    const newPet: MobilePet = {
      id: `pet-${Date.now()}`,
      name: params.name.trim(),
      species: params.species,
      breed: params.breed.trim() || (params.species === 'Chó' ? 'Corgi' : 'Mèo Anh lông ngắn'),
      gender: 'Cái',
      birthDate: '01/06/2024',
      ageLabel: params.ageLabel.trim() || '1 tuổi',
      weightKg: params.weightKg || 5,
      furColor: 'Trắng kem',
      microchipOrMark: 'Có vòng cổ bảng tên',
      favoriteFood: 'Hạt dinh dưỡng, pate',
      allergies: 'Không có',
      avatarUrl:
        params.species === 'Chó'
          ? 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=800&q=80'
          : 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80',
      coverUrl:
        'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1000&q=80',
      bio: `${params.name.trim()} là thành viên đáng yêu trong gia đình.`,
      isVaccinatedAndRabies: true,
      goodHabits: ['Ngoan ngoãn', 'Quấn người'],
      cautionHabits: [],
    };
    setPets((prev) => [...prev, newPet]);
    setActivePetId(newPet.id);
    showToast(`Đã thêm hồ sơ thú cưng: ${newPet.name} (${pets.length + 1}/${MAX_FREE_PETS})`);
  };

  const deletePetProfile = (petId: string) => {
    if (pets.length <= 1) {
      showToast('Cần giữ lại ít nhất 1 hồ sơ thú cưng trong tài khoản');
      return;
    }
    const target = pets.find((p) => p.id === petId);
    const remaining = pets.filter((p) => p.id !== petId);
    setPets(remaining);
    if (activePetId === petId && remaining[0]) {
      setActivePetId(remaining[0].id);
    }
    showToast(`Đã xóa hồ sơ thú cưng ${target ? target.name : ''}`);
  };

  const updateUserTinderSetup = (nextSetup: UserTinderSetupProfile) => {
    setUserTinderSetup(nextSetup);
    setActiveModal(null);
    showToast('Đã cập nhật Hồ sơ Kết nối của bạn!');
  };

  const toggleFollowSuggestedPerson = (id: string) => {
    setSuggestedPeople((prev) =>
      prev.map((person) => {
        if (person.id !== id) return person;
        const nextFollow = !person.isFollowing;
        showToast(
          nextFollow ? `Đã theo dõi ${person.name}` : `Đã bỏ theo dõi ${person.name}`
        );
        return { ...person, isFollowing: nextFollow };
      })
    );
  };

  const dismissSuggestedPerson = (id: string) => {
    setSuggestedPeople((prev) => prev.filter((p) => p.id !== id));
  };

  // Search History
  const recordSearchQuery = (query: string) => {
    const clean = query.trim();
    if (!clean) return;
    setSearchHistory((prev) =>
      [clean, ...prev.filter((item) => item.toLowerCase() !== clean.toLowerCase())].slice(0, 10)
    );
  };

  const removeSearchHistoryItem = (query: string) => {
    setSearchHistory((prev) => prev.filter((item) => item !== query));
  };

  const clearSearchHistory = () => {
    setSearchHistory([]);
    showToast('Đã xóa lịch sử tìm kiếm');
  };

  // Social Feed Actions
  const toggleReaction = (postId: string, type: keyof MobilePost['reactions'] = 'paws') => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        const isSame = post.userReaction === type;
        const updatedReactions = { ...post.reactions };
        if (post.userReaction) {
          updatedReactions[post.userReaction] = Math.max(
            0,
            updatedReactions[post.userReaction] - 1
          );
        }
        if (!isSame) {
          updatedReactions[type] += 1;
        }
        return {
          ...post,
          reactions: updatedReactions,
          userReaction: isSame ? null : type,
        };
      })
    );
  };

  const toggleSavePost = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        const nextSaved = !post.isSaved;
        showToast(nextSaved ? 'Đã lưu bài viết vào mục yêu thích' : 'Đã bỏ lưu bài viết');
        return { ...post, isSaved: nextSaved };
      })
    );
  };

  const sharePost = (postId: string) => {
    setPosts((prev) =>
      prev.map((post) =>
        post.id === postId ? { ...post, shareCount: post.shareCount + 1 } : post
      )
    );
    showToast('Đã sao chép liên kết chia sẻ bài viết!');
  };

  const addComment = (postId: string, content: string) => {
    if (!content.trim()) return;
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        return {
          ...post,
          comments: [
            ...post.comments,
            {
              id: `c-${Date.now()}`,
              authorName: ownerName,
              authorHandle: ownerHandle,
              content: content.trim(),
              createdAt: 'Vừa xong',
            },
          ],
        };
      })
    );
    showToast('Đã gửi bình luận');
  };

  const createPost = (params: {
    content: string;
    tags: string[];
    mediaUrls: string[];
    mediaType: 'image' | 'video';
  }) => {
    if (!params.content.trim() && params.mediaUrls.length === 0) return;
    const fallbackImages = [activePet.avatarUrl];
    const finalMediaUrls = params.mediaUrls.length > 0 ? params.mediaUrls : fallbackImages;
    const newPost: MobilePost = {
      id: `post-${Date.now()}`,
      authorName: ownerName,
      authorHandle: ownerHandle,
      authorAvatar:
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80',
      authorNickname: ownerNickname,
      category: 'moment',
      categoryLabel: params.mediaType === 'video' ? 'Video' : 'Khoảnh khắc',
      content: params.content.trim() || `Khoảnh khắc mới cùng bé ${activePet.name}`,
      tags: params.tags.length > 0 ? params.tags : [`#${activePet.species}`, '#Pawty'],
      mediaUrls: finalMediaUrls,
      mediaType: params.mediaType,
      videoDuration: params.mediaType === 'video' ? '0:24' : undefined,
      reactions: { paws: 1, love: 0, haha: 0, wow: 0, helpful: 0 },
      userReaction: 'paws',
      shareCount: 0,
      isSaved: false,
      comments: [],
      createdAt: 'Vừa xong',
    };
    setPosts((prev) => [newPost, ...prev]);
    setActiveModal(null);
    showToast('Đã đăng bài mới lên Khám phá!');
  };

  // Lightbox & Public User Profile
  const openLightboxMedia = (state: LightboxMediaState) => {
    setLightboxMedia(state);
  };

  const closeLightboxMedia = () => {
    setLightboxMedia(null);
  };

  const openPublicUserProfile = (handle: string) => {
    if (handle === ownerHandle) {
      setActiveTab('profile');
      return;
    }
    setViewedUserHandle(handle);
  };

  const closePublicUserProfile = () => {
    setViewedUserHandle(null);
  };

  const toggleFriendStatus = (handle: string) => {
    setPublicProfiles((prev) => {
      const current = prev[handle];
      if (!current) return prev;
      const nextFriend = !current.isFriend;
      showToast(
        nextFriend
          ? `Đã kết bạn với ${current.name}! Giờ bạn có thể xem toàn bộ nhật ký và nhắn tin.`
          : `Đã hủy kết bạn với ${current.name}`
      );
      return {
        ...prev,
        [handle]: {
          ...current,
          isFriend: nextFriend,
          friendsCount: nextFriend
            ? current.friendsCount + 1
            : Math.max(0, current.friendsCount - 1),
        },
      };
    });
  };

  const startDirectChatWithUser = (handle: string) => {
    const profile = publicProfiles[handle];
    const existingChat = chats.find((c) => c.partnerHandle === handle);
    setViewedUserHandle(null);
    setActiveTab('chat');

    if (existingChat) {
      setActiveChatId(existingChat.id);
      return;
    }

    const newChatId = `chat-${Date.now()}`;
    const newChat: MobileChatRoom = {
      id: newChatId,
      partnerName: profile ? profile.name : handle,
      partnerHandle: handle,
      partnerNickname: profile ? profile.nickname : 'Bạn yêu thú cưng',
      partnerAvatar:
        profile?.avatarUrl ||
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80',
      petSummary:
        profile && profile.pets[0]
          ? `${profile.pets.map((p) => p.name).join(', ')}`
          : 'Yêu thú cưng',
      distanceLabel: profile?.area || 'Gần bạn',
      isOnline: true,
      unreadCount: 0,
      matchSource: 'friend',
      messages: [
        {
          id: `m-${Date.now()}`,
          sender: 'me',
          text: `Chào ${profile ? profile.name : 'bạn'}, mình vừa ghé thăm trang cá nhân của bạn trên Pawty!`,
          time: 'Vừa xong',
        },
      ],
    };
    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChatId);
  };

  // Services & Appointments
  const openBookingForService = (service: MobileService) => {
    setSelectedServiceForBooking(service);
    setActiveModal('book_service');
  };

  const bookAppointment = (params: {
    serviceId: string;
    dateLabel: string;
    timeSlot: string;
    notes: string;
  }) => {
    const service = services.find((s) => s.id === params.serviceId) || services[0];
    if (!service) return;
    const newApt: MobileAppointment = {
      id: `apt-${Date.now()}`,
      petId: activePet.id,
      petName: activePet.name,
      serviceName: service.Packages[0]?.name || service.name,
      providerName: service.name,
      category: service.category,
      dateLabel: params.dateLabel || 'Ngày mai',
      timeSlot: params.timeSlot || '10:00',
      status: 'confirmed',
      priceLabel: service.priceRange.split(' - ')[0] || '350.000đ',
      location: service.address,
      notes: params.notes || 'Đã đặt lịch qua ứng dụng Pawty',
    };
    setAppointments((prev) => [newApt, ...prev]);
    setActiveModal(null);
    setActiveTab('appointments');
    showToast(`Đã đặt lịch tại ${service.name}`);
  };

  const cancelAppointment = (appointmentId: string) => {
    setAppointments((prev) =>
      prev.map((apt) => (apt.id === appointmentId ? { ...apt, status: 'cancelled' } : apt))
    );
    showToast('Đã hủy lịch hẹn');
  };

  // Kết nối (Tinder) Swipe & Match Logic
  const swipeTinderCandidate = (candidateId: string, direction: 'left' | 'right') => {
    const target = tinderCandidates.find((c) => c.id === candidateId);
    if (!target) return;

    setSwipedCandidateHistory((prev) => [target, ...prev]);
    setTinderCandidates((prev) => prev.filter((c) => c.id !== candidateId));

    if (direction === 'right') {
      if (target.hasLikedMe) {
        setPublicProfiles((prev) => {
          const existing = prev[target.ownerHandle];
          if (!existing) return prev;
          return {
            ...prev,
            [target.ownerHandle]: {
              ...existing,
              isMatchedOnTinder: true,
            },
          };
        });
        setMatchedCandidateModal(target);
      } else {
        showToast(
          `Đã thả tim cho ${target.ownerName} (${target.pets.map((p) => p.name).join(', ')})`
        );
      }
    }
  };

  const rewindLastSwipe = () => {
    if (!isVip) {
      setActiveModal('vip_upgrade');
      showToast('Tính năng Hoàn tác lượt quẹt dành riêng cho gói Pawty Plus');
      return;
    }
    if (swipedCandidateHistory.length === 0) {
      showToast('Chưa có lượt quẹt nào để hoàn tác');
      return;
    }
    const [lastCandidate, ...rest] = swipedCandidateHistory;
    setSwipedCandidateHistory(rest);
    setTinderCandidates((prev) => [lastCandidate, ...prev]);
    showToast(`Đã hoàn tác thẻ của ${lastCandidate.ownerName}`);
  };

  const cyclePassportArea = () => {
    if (!isVip) {
      setActiveModal('vip_upgrade');
      showToast('Đổi khu vực tìm kiếm (Passport) là đặc quyền gói Pawty Plus');
      return;
    }
    const areas = [
      'Quanh bạn (Bán kính 3km)',
      'Thảo Điền · Quận 2',
      'Phú Mỹ Hưng · Quận 7',
      'Vinhomes Central Park · Bình Thạnh',
    ];
    const nextIdx = (areas.indexOf(activePassportArea) + 1) % areas.length;
    setActivePassportArea(areas[nextIdx]);
    showToast(`Đã chuyển khu vực Kết nối sang: ${areas[nextIdx]}`);
  };

  const closeMatchedCandidateModal = () => {
    setMatchedCandidateModal(null);
  };

  const openChatWithMatchedCandidate = (candidate: TinderCandidate) => {
    setMatchedCandidateModal(null);
    const existing = chats.find((c) => c.partnerHandle === candidate.ownerHandle);
    setActiveTab('chat');
    if (existing) {
      setActiveChatId(existing.id);
      return;
    }
    const petNames = candidate.pets.map((p) => p.name).join(' & ');
    const newChatId = `chat-match-${Date.now()}`;
    const newChat: MobileChatRoom = {
      id: newChatId,
      partnerName: candidate.ownerName,
      partnerHandle: candidate.ownerHandle,
      partnerNickname: candidate.ownerNickname,
      partnerAvatar: candidate.avatarUrl,
      petSummary: `Bé ${petNames}`,
      distanceLabel: `Cách ${candidate.distanceKm}km`,
      isOnline: true,
      unreadCount: 0,
      matchSource: 'tinder_match',
      messages: [
        {
          id: `m-${Date.now()}`,
          sender: 'them',
          text: `Chào ${ownerName}! Hai tụi mình vừa tương hợp trên mục Kết nối Pawty nè. Hôm nào rảnh cho ${petNames} và ${activePet.name} gặp nhau nhé!`,
          time: 'Vừa xong',
        },
      ],
    };
    setChats((prev) => [newChat, ...prev]);
    setActiveChatId(newChatId);
  };

  // Chat Messages
  const sendChatMessage = (chatId: string, text: string) => {
    if (!text.trim()) return;
    setChats((prev) =>
      prev.map((room) => {
        if (room.id !== chatId) return room;
        return {
          ...room,
          messages: [
            ...room.messages,
            {
              id: `m-${Date.now()}`,
              sender: 'me',
              text: text.trim(),
              time: new Date().toLocaleTimeString('vi-VN', {
                hour: '2-digit',
                minute: '2-digit',
              }),
            },
          ],
        };
      })
    );
  };

  // SOS Fullscreen Tab Actions (Author-Only Found Confirmation)
  const createSosAlertWithFee = (params: {
    petName: string;
    species: 'Chó' | 'Mèo';
    breed: string;
    lastSeenLocation: string;
    rewardAmount: string;
    description: string;
    imageUrl?: string;
  }) => {
    const newSos: MobileSosAlert = {
      id: `sos-${Date.now()}`,
      petName: params.petName.trim() || activePet.name,
      species: params.species || activePet.species,
      breed: params.breed.trim() || activePet.breed,
      lastSeenLocation: params.lastSeenLocation.trim() || ownerArea,
      lastSeenTime: 'Vừa xong',
      distanceKm: 0.1,
      rewardAmount: params.rewardAmount.trim() || '2.000.000đ',
      contactPhone: ownerPhone,
      ownerName,
      ownerHandle,
      status: 'searching',
      sightingsCount: 0,
      priorityScore: 160,
      imageUrl: params.imageUrl || activePet.avatarUrl,
      description:
        params.description.trim() || 'Bé có đeo vòng cổ ghi số điện thoại của gia đình.',
      sightingReports: [],
    };
    setSosAlerts((prev) => [newSos, ...prev]);
    showToast('Đã xác thực phí chống spam (19.000đ) & đẩy tin SOS lên đầu khu vực!');
  };

  const reportSosSighting = (sosId: string, locationText: string, noteText?: string) => {
    const cleanLoc = locationText.trim() || 'Gần công viên nội khu';
    setSosAlerts((prev) =>
      prev
        .map((s) => {
          if (s.id !== sosId) return s;
          const updatedReport = {
            id: `sr-${Date.now()}`,
            reporterName: ownerName,
            reporterPhone: ownerPhone,
            locationNote: `${cleanLoc}${noteText ? ` - ${noteText.trim()}` : ''}`,
            timeLabel: 'Vừa xong',
          };
          return {
            ...s,
            lastSeenLocation: cleanLoc,
            lastSeenTime: 'Vừa cập nhật vị trí mới',
            sightingsCount: s.sightingsCount + 1,
            priorityScore: s.priorityScore + 50,
            sightingReports: [updatedReport, ...s.sightingReports],
          };
        })
        .sort((a, b) => b.priorityScore - a.priorityScore)
    );

    const targetAlert = sosAlerts.find((s) => s.id === sosId);
    if (targetAlert) {
      const newNotif: MobileNotificationItem = {
        id: `notif-sos-${Date.now()}`,
        title: `Đã gửi manh mối tìm bé ${targetAlert.petName}`,
        body: `Chủ nuôi ${targetAlert.ownerName} đã nhận được tọa độ "${cleanLoc}" và số điện thoại của bạn ngay lập tức.`,
        timeLabel: 'Vừa xong',
        type: 'sos',
        isRead: false,
      };
      setNotifications((prev) => [newNotif, ...prev]);
    }
    showToast('Đã báo vị trí nhìn thấy! Tin đã được ưu tiên đẩy lên đầu khu vực.');
  };

  const confirmSosPetFound = (sosId: string) => {
    const targetAlert = sosAlerts.find((s) => s.id === sosId);
    if (!targetAlert) return;

    // Enforce: ONLY the post author can confirm "Đã đón về"
    if (targetAlert.ownerHandle !== ownerHandle) {
      showToast('Chỉ chính người đăng tin mới được phép xác nhận Đã đón về!');
      return;
    }

    setSosAlerts((prev) =>
      prev.map((s) => (s.id === sosId ? { ...s, status: 'found', priorityScore: 10 } : s))
    );
    const helperCount = targetAlert.sightingReports.length;
    const thankYouNotif: MobileNotificationItem = {
      id: `notif-found-${Date.now()}`,
      title: `Tin vui: Bé ${targetAlert.petName} đã về nhà an toàn!`,
      body: `Chủ nuôi ${targetAlert.ownerName} gửi lời cảm ơn chân thành tới ${helperCount} bạn hàng xóm đã gửi manh mối hỗ trợ tìm bé.`,
      timeLabel: 'Vừa xong',
      type: 'sos',
      isRead: false,
    };
    setNotifications((prev) => [thankYouNotif, ...prev]);
    showToast('Chúc mừng gia đình! Đã đóng tin SOS và gửi thông báo cảm ơn cộng đồng.');
  };

  const selectAndActivateVipPlan = (planId: string) => {
    const chosen = VIP_PLAN_OPTIONS.find((p) => p.id === planId);
    setIsVip(true);
    setActiveVipPlanId(planId);
    showToast(`Đã kích hoạt ${chosen ? chosen.name : 'gói Pawty Plus'} thành công!`);
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)));
  };

  return (
    <MobilePawtyContext.Provider
      value={{
        isAuthLoaded,
        isAuthenticated,
        activeDeviceSessionId,
        activeDeviceName,
        ownerName,
        ownerHandle,
        ownerNickname,
        ownerPhone,
        ownerBio,
        ownerArea,
        ownerNoteBubble,
        setOwnerNoteBubble,
        isPrivateProfile,
        loginOrRegister,
        logoutUser,
        forceRevokeOtherDevices,
        updateOwnerAndPetProfile,
        togglePrivateProfile,
        togglePetVaccinationAndRabies,
        addNewPetProfile,
        deletePetProfile,
        userTinderSetup,
        updateUserTinderSetup,
        suggestedPeople,
        toggleFollowSuggestedPerson,
        dismissSuggestedPerson,
        themeId,
        theme: THEME_PALETTES[themeId],
        setThemeId,
        activeTab,
        setActiveTab,
        activeModal,
        setActiveModal,
        handleHardwareBack,
        pets,
        activePetId,
        activePet,
        setActivePetId,
        posts,
        searchHistory,
        trendingSuggestions: TRENDING_SEARCH_SUGGESTIONS,
        isSearchPanelOpen,
        setIsSearchPanelOpen,
        recordSearchQuery,
        removeSearchHistoryItem,
        clearSearchHistory,
        toggleReaction,
        toggleSavePost,
        sharePost,
        addComment,
        createPost,
        lightboxMedia,
        openLightboxMedia,
        closeLightboxMedia,
        publicProfiles,
        viewedUserHandle,
        openPublicUserProfile,
        closePublicUserProfile,
        toggleFriendStatus,
        startDirectChatWithUser,
        appointments,
        services,
        selectedServiceForBooking,
        openBookingForService,
        bookAppointment,
        cancelAppointment,
        tinderIntent,
        setTinderIntent,
        tinderCandidates,
        swipedCandidateHistory,
        matchedCandidateModal,
        closeMatchedCandidateModal,
        swipeTinderCandidate,
        rewindLastSwipe,
        openChatWithMatchedCandidate,
        showLikesYouDrawer,
        setShowLikesYouDrawer,
        activePassportArea,
        cyclePassportArea,
        chats,
        activeChatId,
        setActiveChatId,
        sendChatMessage,
        sosAlerts,
        createSosAlertWithFee,
        reportSosSighting,
        confirmSosPetFound,
        isVip,
        activeVipPlanId,
        vipPlans: VIP_PLAN_OPTIONS,
        selectAndActivateVipPlan,
        notifications,
        unreadNotificationCount,
        markNotificationRead,
        toastMessage,
        showToast,
      }}
    >
      {children}
    </MobilePawtyContext.Provider>
  );
};

export const useMobilePawty = () => {
  const ctx = useContext(MobilePawtyContext);
  if (!ctx) throw new Error('useMobilePawty must be used inside MobilePawtyProvider');
  return ctx;
};
