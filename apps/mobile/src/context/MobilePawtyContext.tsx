import { apiClient, ApiRequestError } from '../services/apiClient';
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  setupNativeNotifications,
  sendNativePushNotification,
} from '../services/notificationService';
import {
  MobilePet,
  PetVaccineRecord,
  MobilePost,
  MobileChatRoom,
  MobileSosAlert,
  MobileNotificationItem,
  NotificationCategory,
  NotificationType,
  PublicUserProfile,
  TinderCandidate,
  TinderIntent,
  UserTinderSetupProfile,
  SuggestedPersonCard,
  EMPTY_USER_TINDER_SETUP,
  resolveTinderIntentFromLabel,
  getTinderPurposeLabel,
  calculatePetAgeFromBirthDate,
} from '../types/mobileTypes';

export const cleanName = (name?: string | null): string => {
  if (!name) return 'Cư dân Pawty';
  return (
    name
      .replace(/\s*\(@[^)]*\)?/g, '')
      .replace(/@\w+/g, '')
      .replace(/\s*@.*$/, '')
      .replace(/\s*\([^)]*\)$/g, '')
      .trim() || 'Cư dân Pawty'
  );
};

const EMPTY_PET_PLACEHOLDER: MobilePet = {
  id: '',
  name: '',
  species: 'Chó',
  breed: '',
  gender: 'Đực',
  birthDate: '',
  ageLabel: '',
  weightKg: 0,
  furColor: '',
  microchipOrMark: '',
  favoriteFood: '',
  allergies: '',
  avatarUrl: '',
  coverUrl: '',
  bio: '',
  isVaccinatedAndRabies: false,
  goodHabits: [],
  cautionHabits: [],
};

export type MobileMainTab = 'explore' | 'tinder' | 'chat' | 'profile' | 'sos';

export type MobileModalType =
  | null
  | 'new_moment'
  | 'notifications'
  | 'edit_profile'
  | 'my_settings'
  | 'tinder_setup'
  | 'tinder_filter'
  | 'tinder_menu';

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

function normalizeSpeciesLabel(raw?: string): 'Chó' | 'Mèo' | 'Khác' {
  if (!raw) return 'Chó';
  const s = raw.trim().toLowerCase();
  if (s === 'mèo' || s === 'cat') return 'Mèo';
  if (s === 'khác' || s === 'other') return 'Khác';
  return 'Chó';
}

function normalizePetFromServer(p: any): MobilePet {
  if (!p) return EMPTY_PET_PLACEHOLDER;

  const vaccineRecords: PetVaccineRecord[] = Array.isArray(p.vaccineRecords)
    ? p.vaccineRecords.map((v: any, idx: number) => ({
        id: v.id || `vac-${idx}`,
        vaccineName: v.vaccineName || v.name || 'Vắc-xin phòng bệnh',
        name: v.name || v.vaccineName || 'Vắc-xin phòng bệnh',
        date: v.date || '',
        doseNumber: v.doseNumber || `Mũi ${idx + 1}`,
        clinicName: v.clinicName || v.clinic || 'Phòng khám Thú Y',
        clinic: v.clinic || v.clinicName || 'Phòng khám Thú Y',
        isSafeVerified: v.isSafeVerified ?? true,
      }))
    : Array.isArray(p.vaccinations)
    ? p.vaccinations.map((v: any, idx: number) => ({
        id: v.id || `vac-${idx}`,
        vaccineName: v.vaccineName || 'Vắc-xin phòng bệnh',
        name: v.vaccineName || 'Vắc-xin phòng bệnh',
        date: v.dateGiven ? new Date(v.dateGiven).toLocaleDateString('vi-VN') : '',
        doseNumber: `Mũi ${idx + 1}`,
        clinicName: v.vetName || 'Phòng khám Thú Y',
        clinic: v.vetName || 'Phòng khám Thú Y',
        isSafeVerified: Boolean(v.verified ?? true),
      }))
    : [];

  const galleryUrls: string[] =
    Array.isArray(p.galleryUrls) && p.galleryUrls.length > 0
      ? p.galleryUrls.filter(Boolean)
      : [p.avatarUrl, p.coverPhotoUrl || p.coverUrl].filter(Boolean);

  const primaryPhoto = p.avatarUrl || galleryUrls[0] || '';

  return {
    id: String(p.id || ''),
    ownerId: p.ownerId ? String(p.ownerId) : undefined,
    name: p.name || 'Boss',
    species: normalizeSpeciesLabel(p.species),
    customSpecies: p.customSpecies || undefined,
    breed: p.breed || 'Chưa rõ',
    gender: p.gender === 'female' || p.gender === 'Cái' ? 'Cái' : (p.gender || 'Đực'),
    birthDate: p.birthDate || '',
    ageLabel: p.ageLabel || (p.birthDate ? calculatePetAgeFromBirthDate(p.birthDate) : 'Chưa rõ'),
    weightKg: p.weightKg ? Number(p.weightKg) : 0,
    furColor: p.furColor || '',
    microchipOrMark: p.microchipOrMark || '',
    favoriteFood: p.favoriteFood || '',
    allergies: p.allergies || p.medicalHistory || '',
    avatarUrl: primaryPhoto,
    coverUrl: p.coverPhotoUrl || p.coverUrl || primaryPhoto,
    bio: p.bio || '',
    isSterilized: Boolean(p.isSterilized ?? p.isNeutered ?? false),
    isVaccinatedAndRabies: Boolean(
      p.isVaccinatedAndRabies ?? (p.vaccinationStatus === 'verified' || vaccineRecords.length > 0)
    ),
    goodHabits: Array.isArray(p.goodHabits) ? p.goodHabits : [],
    cautionHabits: Array.isArray(p.cautionHabits) ? p.cautionHabits : [],
    galleryUrls,
    weightHistory: Array.isArray(p.weightHistory) ? p.weightHistory : [],
    vaccineRecords,
    dewormingHistory: p.dewormingHistory || '',
    medicalHistory: p.medicalHistory || '',
    likesCount: Number(p.likesCount ?? 0),
    isLiked: Boolean(p.isLiked ?? false),
  };
}

function normalizePostFromServer(post: any, currentUserId: string): MobilePost {
  const authorHandle =
    post.authorHandle ||
    (post.author?.username
      ? `@${post.author.username}`
      : `@${(post.author?.displayName || 'cudan').toLowerCase().replace(/\s+/g, '')}`);

  const mediaUrls: string[] = Array.isArray(post.mediaUrls)
    ? post.mediaUrls.filter(Boolean)
    : Array.isArray(post.media)
    ? post.media.map((m: any) => (typeof m === 'string' ? m : m?.url)).filter(Boolean)
    : [];

  const isLikedByMe =
    post.userReaction === 'paws' ||
    Boolean(post.isLiked) ||
    (Array.isArray(post.reactions) &&
      post.reactions.some((r: any) => r.userId === currentUserId));

  const pawCount =
    typeof post.reactions?.paws === 'number'
      ? post.reactions.paws
      : Array.isArray(post.reactions)
      ? post.reactions.length
      : Number(post.pawCount ?? post.likes ?? 0);

  return {
    id: String(post.id),
    authorId: post.authorId || post.author?.id,
    authorName: cleanName(post.authorName || post.author?.displayName),
    authorHandle,
    authorAvatar: post.authorAvatar || post.author?.avatarUrl || '',
    authorNickname:
      cleanName(post.authorNickname || (post.author?.role === 'expert' ? 'Bác sĩ Thú Y' : post.author?.displayName || 'Cư dân')),
    category: (post.contentType === 'tip'
      ? 'health_tip'
      : post.contentType === 'question'
      ? 'qa_vet'
      : post.category || 'moment') as MobilePost['category'],
    categoryLabel:
      post.categoryLabel ||
      (post.contentType === 'tip'
        ? 'Góc Thú Y'
        : post.contentType === 'question'
        ? 'Hỏi đáp'
        : 'Khoảnh khắc'),
    content: post.content ?? post.textContent ?? post.text ?? '',
    tags: Array.isArray(post.tags)
      ? post.tags
      : Array.isArray(post.hashtags)
      ? post.hashtags
      : [],
    mediaUrls,
    mediaType:
      post.mediaType === 'video' ||
      (Array.isArray(post.media) && post.media[0]?.type === 'video')
        ? 'video'
        : 'image',
    reactions: {
      paws: pawCount,
      love: 0,
      haha: 0,
      wow: 0,
      helpful: 0,
    },
    userReaction: isLikedByMe ? 'paws' : null,
    shareCount: Number(post.shareCount || 0),
    isSaved: Boolean(post.isSaved),
    comments: Array.isArray(post.comments)
      ? post.comments.map((c: any) => ({
          id: String(c.id),
          authorName: cleanName(c.authorName || c.author?.displayName || 'Cư dân'),
          authorHandle:
            c.authorHandle || (c.author?.username ? `@${c.author.username}` : '@cudan'),
          authorAvatar: c.authorAvatar || c.author?.avatarUrl || '',
          content: c.content ?? c.textContent ?? c.text ?? '',
          createdAt:
            typeof c.createdAt === 'string' && !c.createdAt.includes('T')
              ? c.createdAt
              : c.createdAt
              ? new Date(c.createdAt).toLocaleTimeString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Vừa xong',
          likesCount: Number(c.likesCount ?? c.reactionCount ?? 0),
          isLiked: Boolean(c.isLiked),
          replies: Array.isArray(c.replies) ? c.replies : [],
        }))
      : [],
    createdAt:
      typeof post.createdAt === 'string' && !post.createdAt.includes('T')
        ? post.createdAt
        : post.createdAt
        ? new Date(post.createdAt).toLocaleDateString('vi-VN')
        : 'Hôm nay',
  };
}

function normalizeNotificationCategory(
  rawType?: string,
  rawCat?: string
): NotificationCategory {
  if (rawCat === 'friend' || rawCat === 'follow' || rawCat === 'sos' || rawCat === 'system') {
    return rawCat;
  }
  if (rawType === 'friend_request' || rawType === 'friend_accepted' || rawType === 'match' || rawType === 'tinder') {
    return 'friend';
  }
  if (rawType === 'sos_alert' || rawType === 'sos_sighting' || rawType === 'sos') {
    return 'sos';
  }
  if (rawType === 'follow' || rawType === 'post_reaction' || rawType === 'post_comment' || rawType === 'new_post' || rawType === 'social') {
    return 'follow';
  }
  return 'system';
}

interface MobilePawtyContextType {
  // Auth & Session
  isAuthLoaded: boolean;
  isAuthenticated: boolean;
  hasSavedSession: boolean;
  savedSessionIdentifier: string;
  bootAuthError: string | null;
  activeDeviceSessionId: string;
  activeDeviceName: string;
  currentUserId: string;

  // Owner Profile
  ownerName: string;
  ownerHandle: string;
  ownerAvatar: string;
  setOwnerHandle: (handle: string) => void;
  ownerNickname: string;
  ownerPhone: string;
  ownerBio: string;
  ownerArea: string;
  ownerGender: string;
  ownerAge: number;
  ownerBirthDate: string;
  ownerZodiac: string;
  ownerMbti: string;
  ownerEducation: string;
  ownerMajor: string;
  ownerOccupation: string;
  ownerFollowersCount: number;
  ownerFollowingCount: number;
  ownerCoverUrl: string;
  setOwnerCoverUrl: (url: string) => void;
  ownerAvatarUrl: string;
  setOwnerAvatarUrl: (url: string) => void;
  ownerNoteBubble: string;
  setOwnerNoteBubble: (note: string) => void;
  isPrivateProfile: boolean;
  ownerPrivacySettings: Record<string, boolean>;
  updateOwnerProfile: (params: {
    name?: string;
    gender?: string;
    area?: string;
    age?: number;
    birthDate?: string;
    zodiac?: string;
    mbti?: string;
    education?: string;
    major?: string;
    occupation?: string;
    bio?: string;
    coverUrl?: string;
    avatarUrl?: string;
    privacySettings?: Record<string, boolean>;
  }) => Promise<void>;
  togglePrivateProfile: () => void;
  updateOwnerAndPetProfile: (params: {
    ownerName: string;
    ownerNickname: string;
    ownerBio: string;
    ownerArea: string;
    isPrivateProfile: boolean;
    petId: string;
    petName: string;
    petSpecies: 'Chó' | 'Mèo' | 'Khác';
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

  // Auth Actions
  loginOrRegister: (params: {
    isRegister?: boolean;
    name?: string;
    phone?: string;
    username?: string;
    password?: string;
    identifier?: string;
    petName?: string;
    petSpecies?: 'Chó' | 'Mèo';
    petBreed?: string;
  }) => Promise<void>;
  logoutUser: () => Promise<void>;
  forceRevokeOtherDevices: () => void;

  // Pets (Unlimited Free)
  pets: MobilePet[];
  activePetId: string;
  activePet: MobilePet;
  setActivePetId: (id: string) => void;
  addNewPetProfile: (params: {
    name: string;
    species: 'Chó' | 'Mèo' | 'Khác';
    customSpecies?: string;
    breed: string;
    gender?: 'Đực' | 'Cái';
    weightKg?: number;
    ageLabel: string;
    birthDate?: string;
    furColor?: string;
    bio?: string;
    avatarUrl?: string;
    galleryUrls?: string[];
    isSterilized?: boolean;
    isVaccinatedAndRabies?: boolean;
    favoriteFood?: string;
    dewormingHistory?: string;
    medicalHistory?: string;
    goodHabits?: string[];
    cautionHabits?: string[];
    weightHistory?: { month: string; weightKg: number }[];
    vaccineRecords?: PetVaccineRecord[];
  }) => Promise<MobilePet | null>;
  updatePetProfile: (petId: string, updates: Partial<MobilePet>) => Promise<void>;
  deletePetProfile: (petId: string) => Promise<void>;
  togglePetLike: (petId: string) => void;
  togglePetVaccinationAndRabies: (petId: string) => void;

  // Tinder Setup Profile (Mapped 1-to-1 with Tinder Purpose)
  userTinderSetup: UserTinderSetupProfile;
  updateUserTinderSetup: (nextSetup: UserTinderSetupProfile) => Promise<void>;

  // Suggested People
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
  isLoadingData: boolean;
  refreshData: (userId?: string, throwOnError?: boolean, silent?: boolean) => Promise<void>;
  pullToRefreshExplore: () => Promise<void>;
  activeModal: MobileModalType;
  setActiveModal: (modal: MobileModalType) => void;
  handleHardwareBack: () => boolean;

  // Explore Social Feed & Search
  posts: MobilePost[];
  searchHistory: string[];
  trendingSuggestions: string[];
  isSearchPanelOpen: boolean;
  setIsSearchPanelOpen: (open: boolean) => void;
  recordSearchQuery: (query: string) => void;
  removeSearchHistoryItem: (query: string) => void;
  clearSearchHistory: () => void;
  toggleReaction: (postId: string, type?: keyof MobilePost['reactions']) => Promise<void>;
  toggleSavePost: (postId: string) => void;
  sharePost: (postId: string) => void;
  addComment: (postId: string, content: string) => Promise<void>;
  toggleCommentLike: (postId: string, commentId: string) => void;
  addCommentReply: (postId: string, commentId: string, content: string) => void;
  createPost: (params: {
    content: string;
    tags: string[];
    mediaUrls: string[];
    mediaType: 'image' | 'video';
    category?: 'moment' | 'health_tip' | 'qa_vet';
  }) => Promise<boolean>;
  deletePost: (postId: string) => Promise<void>;

  // Fullscreen Media Lightbox
  lightboxMedia: LightboxMediaState | null;
  openLightboxMedia: (state: LightboxMediaState) => void;
  closeLightboxMedia: () => void;

  // Unified Public User Profile (Viewed in MobileProfileScreen)
  publicProfiles: Record<string, PublicUserProfile>;
  viewedUserHandle: string | null;
  selectedProfileHandle: string | null;
  setSelectedProfileHandle: (handle: string | null) => void;
  openUserProfileInTab: (handle: string) => void;
  openPublicUserProfile: (handle: string) => void;
  closePublicUserProfile: () => void;
  goBackFromOtherProfile: () => void;
  resolvePublicProfile: (handle: string) => PublicUserProfile;
  toggleFriendStatus: (handle: string) => void;
  sendFriendRequest: (handle: string) => Promise<void>;
  acceptFriendRequest: (handle: string, notifId?: string) => Promise<void>;
  declineFriendRequest: (handle: string, notifId?: string) => Promise<void>;
  unfriendUser: (handle: string) => Promise<void>;
  unmatchCandidate: (partnerHandleOrId: string) => Promise<void>;
  toggleFollowUser: (handle: string) => Promise<void>;
  startDirectChatWithUser: (handle: string, chatType?: 'social' | 'dating') => Promise<void>;

  // Kết nối (Tinder) Tab — 100% Free & Unlimited Distance
  tinderIntent: TinderIntent;
  setTinderIntent: (intent: TinderIntent) => void;
  tinderFilterGoal: TinderIntent | 'all';
  setTinderFilterGoal: (goal: TinderIntent | 'all') => void;
  tinderGenderFilter: 'all' | 'female' | 'male';
  setTinderGenderFilter: (gender: 'all' | 'female' | 'male') => void;
  setPassportArea: (area: string) => void;
  tinderCandidates: TinderCandidate[];
  likesYouCandidates: TinderCandidate[];
  swipedCandidateHistory: TinderCandidate[];
  canRewind: boolean;
  matchedCandidateModal: TinderCandidate | null;
  closeMatchedCandidateModal: () => void;
  swipeTinderCandidate: (candidateId: string, direction: 'left' | 'right') => Promise<void>;
  reloadTinderDeck: (silent?: boolean, overrideGender?: 'all' | 'female' | 'male') => Promise<void>;
  likeBackCandidate: (candidate: TinderCandidate) => Promise<void>;
  passLikesYouCandidate: (candidate: TinderCandidate) => Promise<void>;
  rewindLastSwipe: () => Promise<void>;
  openChatWithMatchedCandidate: (candidate: TinderCandidate) => Promise<void>;
  showLikesYouDrawer: boolean;
  setShowLikesYouDrawer: (open: boolean) => void;
  tinderDistanceLimit: number | 'all';
  setTinderDistanceLimit: (dist: number | 'all') => void;
  activePassportArea: string;
  cyclePassportArea: () => void;

  // Chat
  chats: MobileChatRoom[];
  activeChatId: string | null;
  setActiveChatId: (id: string | null) => void;
  sendChatMessage: (chatId: string, text: string) => Promise<void>;
  clearChatMessages: (chatId: string) => Promise<void>;
  markChatRead: (chatId: string) => Promise<void>;

  // SOS Fullscreen Tab (100% Free)
  sosAlerts: MobileSosAlert[];
  createSosAlert: (params: {
    petName: string;
    species: 'Chó' | 'Mèo' | 'Khác';
    customSpecies?: string;
    breed: string;
    lastSeenLocation: string;
    rewardAmount: string;
    contactPhone?: string;
    description: string;
    imageUrl?: string;
  }) => Promise<boolean>;
  createSosAlertWithFee: (params: {
    petName: string;
    species: 'Chó' | 'Mèo' | 'Khác';
    customSpecies?: string;
    breed: string;
    lastSeenLocation: string;
    rewardAmount: string;
    contactPhone?: string;
    description: string;
    imageUrl?: string;
  }) => Promise<boolean>;
  reportSosSighting: (
    sosId: string,
    locationText: string,
    noteText?: string,
    reporterPhone?: string
  ) => Promise<void>;
  confirmSosPetFound: (sosId: string) => Promise<void>;

  // Notifications & Toast
  notifications: MobileNotificationItem[];
  unreadNotificationCount: number;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAllNotifications: () => Promise<void>;
  toastMessage: string | null;
  showToast: (msg: string) => void;
}

const STORAGE_KEY_AUTH = '@pawty_auth_single_device_v4';
const STORAGE_KEY_THEME = '@pawty_theme_v4';

const MobilePawtyContext = createContext<MobilePawtyContextType | null>(null);

export const MobilePawtyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthLoaded, setIsAuthLoaded] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasSavedSession, setHasSavedSession] = useState(false);
  const [savedSessionIdentifier, setSavedSessionIdentifier] = useState('');
  const [bootAuthError, setBootAuthError] = useState<string | null>(null);
  const [activeDeviceSessionId, setActiveDeviceSessionId] = useState(
    `DEV-${Platform.OS.toUpperCase()}-0001`
  );
  const [activeDeviceName] = useState(
    Platform.OS === 'ios'
      ? 'iPhone chính chủ (Phiên duy nhất)'
      : 'Điện thoại Android chính chủ (Phiên duy nhất)'
  );

  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [ownerName, setOwnerName] = useState('');
  const [ownerHandle, setOwnerHandle] = useState('');
  const [ownerAvatar, setOwnerAvatar] = useState('');
  const [ownerNickname, setOwnerNickname] = useState('');
  const [ownerPhone, setOwnerPhone] = useState('');
  const [ownerBio, setOwnerBio] = useState('');
  const [ownerArea, setOwnerArea] = useState('');
  const [ownerNoteBubble, setOwnerNoteBubbleState] = useState('');
  const [isPrivateProfile, setIsPrivateProfile] = useState(false);
  const [ownerGender, setOwnerGender] = useState('');
  const [ownerAge, setOwnerAge] = useState(0);
  const [ownerBirthDate, setOwnerBirthDate] = useState('');
  const [ownerZodiac, setOwnerZodiac] = useState('');
  const [ownerMbti, setOwnerMbti] = useState('');
  const [ownerEducation, setOwnerEducation] = useState('');
  const [ownerMajor, setOwnerMajor] = useState('');
  const [ownerOccupation, setOwnerOccupation] = useState('');
  const [ownerFollowersCount, setOwnerFollowersCount] = useState(0);
  const [ownerFollowingCount, setOwnerFollowingCount] = useState(0);
  const [ownerAvatarUrl, setOwnerAvatarUrlState] = useState('');
  const [ownerCoverUrl, setOwnerCoverUrlState] = useState('');
  const [ownerPrivacySettings, setOwnerPrivacySettings] = useState<Record<string, boolean>>({
    gender: true,
    age: true,
    birthDate: true,
    zodiac: true,
    mbti: true,
    education: true,
    major: true,
    occupation: true,
    bio: true,
    area: true,
  });

  const [userTinderSetup, setUserTinderSetup] = useState<UserTinderSetupProfile>(
    EMPTY_USER_TINDER_SETUP
  );
  const [suggestedPeople, setSuggestedPeople] = useState<SuggestedPersonCard[]>([]);
  const [trendingSuggestions, setTrendingSuggestions] = useState<string[]>([]);

  const [themeId, setThemeIdState] = useState<ThemePresetId>('warm_cream');

  // Navigation & Return State for Unified Profile
  const [activeTab, setActiveTabState] = useState<MobileMainTab>('explore');
  const [tabHistory, setTabHistory] = useState<MobileMainTab[]>(['explore']);
  const [activeModal, setActiveModal] = useState<MobileModalType>(null);
  const [returnTabAfterProfile, setReturnTabAfterProfile] = useState<MobileMainTab>('explore');
  const [returnChatIdAfterProfile, setReturnChatIdAfterProfile] = useState<string | null>(null);

  const [pets, setPets] = useState<MobilePet[]>([]);
  const [activePetId, setActivePetId] = useState<string>('');

  // Explore Social Feed & Search
  const [posts, setPosts] = useState<MobilePost[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false);

  // Lightbox & Public Profile
  const [lightboxMedia, setLightboxMedia] = useState<LightboxMediaState | null>(null);
  const [publicProfiles, setPublicProfiles] = useState<Record<string, PublicUserProfile>>({});
  const [viewedUserHandle, setViewedUserHandle] = useState<string | null>(null);
  const [selectedProfileHandle, setSelectedProfileHandle] = useState<string | null>(null);

  // Kết nối (Tinder) — Mặc định không giới hạn khoảng cách ('all')
  const [tinderIntent, setTinderIntentState] = useState<TinderIntent>('playdate');
  const [tinderFilterGoal, setTinderFilterGoal] = useState<TinderIntent | 'all'>('all');
  const [tinderGenderFilter, setTinderGenderFilter] = useState<'all' | 'female' | 'male'>('all');
  const [tinderCandidates, setTinderCandidates] = useState<TinderCandidate[]>([]);
  const [likesYouCandidates, setLikesYouCandidates] = useState<TinderCandidate[]>([]);
  const [swipedCandidateHistory, setSwipedCandidateHistory] = useState<TinderCandidate[]>([]);
  const [matchedCandidateModal, setMatchedCandidateModal] = useState<TinderCandidate | null>(null);
  const [showLikesYouDrawer, setShowLikesYouDrawer] = useState(false);
  const [tinderDistanceLimit, setTinderDistanceLimit] = useState<number | 'all'>('all');
  const [activePassportArea, setActivePassportArea] = useState('Mọi khoảng cách');

  // Chat
  const [chats, setChats] = useState<MobileChatRoom[]>([]);
  const [activeChatId, setActiveChatIdState] = useState<string | null>(null);

  // SOS & Notifications
  const [sosAlerts, setSosAlerts] = useState<MobileSosAlert[]>([]);
  const [notifications, setNotifications] = useState<MobileNotificationItem[]>([]);
  const seenNotificationIdsRef = useRef<Set<string>>(new Set());
  const isInitialNotifSyncDone = useRef<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isLoadingData, setIsLoadingData] = useState<boolean>(false);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  }, []);

  const markChatRead = useCallback(
    async (chatId: string) => {
      setChats((prev) =>
        prev.map((room) => {
          if (room.id !== chatId) return room;
          return {
            ...room,
            unreadCount: 0,
            messages: room.messages.map((m) =>
              m.sender === 'them' ? { ...m, isRead: true } : m
            ),
          };
        })
      );

      try {
        if (currentUserId) {
          await apiClient.markChatAsRead(chatId, currentUserId);
        }
      } catch (err) {
        console.warn('[Pawty Chat] Lỗi đồng bộ trạng thái đã đọc:', err);
      }
    },
    [currentUserId]
  );

  const setActiveChatId = useCallback(
    (id: string | null) => {
      setActiveChatIdState(id);
      if (id) {
        markChatRead(id);
      }
    },
    [markChatRead]
  );

  const refreshData = useCallback(
    async (userId?: string, throwOnError = false, silent = false) => {
      const targetUserId = userId || currentUserId;
      if (!targetUserId) {
        if (throwOnError) {
          throw new Error('Không xác định được phiên tài khoản người dùng.');
        }
        return;
      }

      try {
        if (!silent) {
          setIsLoadingData(true);
        }
        const bootstrap = await apiClient.getBootstrapData(targetUserId);
        if (!bootstrap || !bootstrap.user) {
          throw new Error(
            'Tài khoản không tồn tại hoặc không thể truy vấn từ cơ sở dữ liệu PostgreSQL.'
          );
        }

        const u = bootstrap.user;
        setCurrentUserId(u.id);
        setOwnerName(cleanName(u.displayName));
        const resolvedHandle =
          u.handle ||
          (u.username
            ? `@${u.username}`
            : `@${(u.displayName || 'user').toLowerCase().replace(/\s+/g, '')}`);
        setOwnerHandle(resolvedHandle);
        setOwnerNickname(cleanName(u.displayName));
        setOwnerPhone(u.phone || '');
        setOwnerBio(u.bio || '');
        setOwnerArea(u.neighborhood || u.district || '');
        setOwnerAvatar(u.avatarUrl || '');
        setOwnerAvatarUrlState(u.avatarUrl || '');
        setOwnerCoverUrlState(u.coverUrl || '');
        setOwnerGender(u.gender || '');
        setOwnerAge(u.age ? Number(u.age) : 0);
        setOwnerBirthDate(u.birthDate || '');
        setOwnerZodiac(u.zodiac || '');
        setOwnerMbti(u.mbti || '');
        setOwnerOccupation(u.occupation || '');
        setOwnerEducation(u.education || '');
        setOwnerNoteBubbleState(u.noteBubble || '');
        setOwnerFollowersCount(Number(u.followersCount || 0));
        setOwnerFollowingCount(Number(u.followingCount || 0));
        setIsPrivateProfile(u.allowMessages === 'friends_only');
        if (u.privacySettings && typeof u.privacySettings === 'object') {
          setOwnerPrivacySettings((prev) => ({ ...prev, ...u.privacySettings }));
        }

        // Đồng bộ thiết lập kết nối (Tinder Setup) 1-1 với mục đích tìm kiếm
        const resolvedIntent = resolveTinderIntentFromLabel(
          u.tinderSetup?.intent || u.tinderSetup?.lookingFor || u.primaryNeed
        );
        const resolvedPurposeLabel = getTinderPurposeLabel(resolvedIntent);
        setTinderIntentState(resolvedIntent);
        const tinderPhotos = Array.isArray(u.tinderSetup?.photos) && u.tinderSetup.photos.length > 0
          ? u.tinderSetup.photos
          : Array.isArray(u.tinderSetup?.photoUrls) && u.tinderSetup.photoUrls.length > 0
          ? u.tinderSetup.photoUrls
          : [];
        setUserTinderSetup({
          displayName: u.tinderSetup?.displayName || u.displayName || 'Bạn mới',
          bio: u.tinderSetup?.bio || '',
          datingPetId: u.tinderSetup?.datingPetId || '',
          age: Number(u.tinderSetup?.age || u.age || 24),
          gender: u.tinderSetup?.gender === 'Nam' || u.gender === 'Nam' ? 'Nam' : 'Nữ',
          intent: resolvedIntent,
          lookingFor: resolvedPurposeLabel,
          smoking: u.tinderSetup?.smoking || 'Không hút thuốc',
          workout: u.tinderSetup?.workout || 'Dắt thú đi bộ mỗi chiều',
          drinking: u.tinderSetup?.drinking || 'Không uống rượu bia',
          zodiac: u.tinderSetup?.zodiac || u.zodiac || 'Sư Tử',
          chatStyle: u.tinderSetup?.chatStyle || 'Thân thiện, phản hồi nhanh',
          promptQuote: u.tinderSetup?.promptQuote ?? '',
          photoUrls: tinderPhotos,
          photos: tinderPhotos,
        });

        // Pets
        if (Array.isArray(bootstrap.pets)) {
          const mappedPets: MobilePet[] = bootstrap.pets.map((p: any) =>
            normalizePetFromServer(p)
          );
          setPets(mappedPets);
          setActivePetId((prev) =>
            mappedPets.some((pet) => pet.id === prev) ? prev : mappedPets[0]?.id || ''
          );
        } else {
          setPets([]);
          setActivePetId('');
        }

        // Posts
        if (Array.isArray(bootstrap.posts)) {
          const mappedPosts: MobilePost[] = bootstrap.posts.map((post: any) =>
            normalizePostFromServer(post, u.id)
          );
          setPosts(mappedPosts);
        } else {
          setPosts([]);
        }

        // SOS Alerts (100% Free)
        if (Array.isArray(bootstrap.sosAlerts)) {
          const mappedAlerts: MobileSosAlert[] = bootstrap.sosAlerts.map((row: any) => {
            const rawSightings = Array.isArray(row.sightings) ? row.sightings : [];
            const vSig =
              row.visualSignatures && typeof row.visualSignatures === 'object'
                ? row.visualSignatures
                : {};
            const rowOwnerHandle = row.user?.username
              ? `@${row.user.username}`
              : `@${(row.user?.displayName || 'user').toLowerCase().replace(/\s+/g, '')}`;

            return {
              id: row.id,
              petName: vSig.petName || row.pet?.name || 'Thú cưng',
              species: normalizeSpeciesLabel(vSig.species || row.pet?.species),
              customSpecies: vSig.customSpecies || undefined,
              breed: vSig.breed || row.pet?.breed || 'Chưa rõ',
              lastSeenLocation: (row.lastSeenLocation || '').trim(),
              lastSeenTime: row.createdAt
                ? new Date(row.createdAt).toLocaleTimeString('vi-VN', {
                    hour: '2-digit',
                    minute: '2-digit',
                  })
                : 'Hôm nay',
              distanceKm: Number(row.radiusKm || 3),
              rewardAmount: row.rewardText || 'Hậu tạ từ gia đình',
              contactPhone: vSig.ownerPhone || row.user?.phone || '',
              ownerName: vSig.ownerName || row.user?.displayName || 'Chủ nuôi',
              ownerHandle: rowOwnerHandle,
              status: row.status === 'resolved' || row.status === 'found' ? 'found' : 'searching',
              sightingsCount: rawSightings.length,
              priorityScore: row.status === 'active' ? 160 : 10,
              imageUrl: vSig.imageUrl || row.pet?.avatarUrl || '',
              description: row.description || '',
              sightingReports: rawSightings.map((s: any, idx: number) => ({
                id: s.id || `sr-${idx}`,
                reporterName: s.reporterName || 'Cư dân hỗ trợ',
                reporterPhone: s.phone || s.reporterPhone || '',
                locationNote: s.note || s.locationName || '',
                timeLabel: s.time || s.createdAt || 'Vừa xong',
              })),
            };
          });
          setSosAlerts(mappedAlerts);
        } else {
          setSosAlerts([]);
        }

        // Tinder Candidates & Likes You
        const mappedCandidates = (Array.isArray(bootstrap.candidates) ? bootstrap.candidates : []).map((c: any) => ({
          ...c,
          ownerName: cleanName(c.ownerName),
          ownerNickname: cleanName(c.ownerNickname).toLowerCase() === cleanName(c.ownerName).toLowerCase() ? '' : cleanName(c.ownerNickname),
        }));
        setTinderCandidates(mappedCandidates);

        const mappedLikesYou = (Array.isArray(bootstrap.likesYou) ? bootstrap.likesYou : []).map((c: any) => ({
          ...c,
          ownerName: cleanName(c.ownerName),
          ownerNickname: cleanName(c.ownerNickname).toLowerCase() === cleanName(c.ownerName).toLowerCase() ? '' : cleanName(c.ownerNickname),
        }));
        setLikesYouCandidates(mappedLikesYou);

        // Chats (with canMessage & isFriend)
        const mappedChats = (Array.isArray(bootstrap.chats) ? bootstrap.chats : []).map((room: any) => ({
          ...room,
          partnerName: cleanName(room.partnerName),
          partnerNickname: cleanName(room.partnerNickname),
        }));
        setChats(mappedChats);

        // Notifications
        if (Array.isArray(bootstrap.notifications)) {
          const freshNotifs: MobileNotificationItem[] = bootstrap.notifications.map((n: any) => ({
            id: String(n.id),
            title: n.title || 'Thông báo mới',
            body: n.body || '',
            timeLabel: n.timeLabel || n.time || 'Vừa xong',
            type: (n.type || 'system') as NotificationType,
            category: normalizeNotificationCategory(
              n.type,
              n.category || n.actionPayload?.category
            ),
            isRead: Boolean(n.isRead),
            actionPayload: n.actionPayload || undefined,
          }));
          setNotifications(freshNotifs);

          if (!isInitialNotifSyncDone.current) {
            freshNotifs.forEach((n) => seenNotificationIdsRef.current.add(n.id));
            isInitialNotifSyncDone.current = true;
          } else {
            freshNotifs.forEach((n) => {
              if (!seenNotificationIdsRef.current.has(n.id)) {
                seenNotificationIdsRef.current.add(n.id);
                if (!n.isRead) {
                  sendNativePushNotification(n.title, n.body, n.actionPayload);
                }
              }
            });
          }
        } else {
          setNotifications([]);
        }

        // Public Profiles (normalize nested pets & posts for unified layout)
        if (bootstrap.publicProfiles && typeof bootstrap.publicProfiles === 'object') {
          const normalizedMap: Record<string, PublicUserProfile> = {};
          for (const [k, rawProf] of Object.entries(bootstrap.publicProfiles)) {
            const prof = rawProf as any;
            if (!prof) continue;
            normalizedMap[k] = {
              ...prof,
              name: cleanName(prof.name),
              nickname: cleanName(prof.nickname),
              pets: Array.isArray(prof.pets)
                ? prof.pets.map((pt: any) => normalizePetFromServer(pt))
                : [],
              posts: Array.isArray(prof.posts)
                ? prof.posts.map((po: any) => normalizePostFromServer(po, u.id))
                : [],
            };
          }
          setPublicProfiles(normalizedMap);
        } else {
          setPublicProfiles({});
        }

        setSuggestedPeople(
          Array.isArray(bootstrap.suggestedPeople)
            ? bootstrap.suggestedPeople.map((sp: any) => ({
                id: sp.id,
                name: sp.name,
                handle: sp.handle,
                avatarUrl: sp.avatarUrl || '',
                mutualText: sp.mutualText || 'Gợi ý từ cộng đồng',
                isFollowing: Boolean(sp.isFollowing),
              }))
            : []
        );
        setTrendingSuggestions(
          Array.isArray(bootstrap.trendingSuggestions) ? bootstrap.trendingSuggestions : []
        );
      } catch (err) {
        console.warn('[Pawty] Hydration from PostgreSQL failed:', err);
        if (throwOnError) {
          throw err;
        }
      } finally {
        if (!silent) {
          setIsLoadingData(false);
        }
      }
    },
    [currentUserId]
  );

  const pullToRefreshExplore = useCallback(async () => {
    await refreshData(currentUserId, false, true);
  }, [currentUserId, refreshData]);

  useEffect(() => {
    const loadSession = async () => {
      try {
        setupNativeNotifications();
        const savedAuth = await AsyncStorage.getItem(STORAGE_KEY_AUTH);
        setThemeIdState('warm_cream');
        if (savedAuth) {
          const parsed = JSON.parse(savedAuth);
          if (parsed && parsed.isAuthenticated && parsed.userId) {
            setHasSavedSession(true);
            setSavedSessionIdentifier(
              parsed.identifier ||
                (parsed.ownerHandle ? String(parsed.ownerHandle).replace(/^@/, '') : '') ||
                parsed.ownerPhone ||
                ''
            );
            if (parsed.ownerName) setOwnerName(parsed.ownerName);
            if (parsed.ownerHandle) setOwnerHandle(parsed.ownerHandle);
            if (parsed.ownerBio) setOwnerBio(parsed.ownerBio);

            try {
              await refreshData(parsed.userId, true);
              setActiveDeviceSessionId(
                parsed.deviceSessionId ||
                  `DEV-${Platform.OS.toUpperCase()}-${Date.now().toString().slice(-6)}`
              );
              setBootAuthError(null);
              setIsAuthenticated(true);
            } catch (dbErr: any) {
              console.warn('[Pawty Auth] Không thể kết nối DB khi khôi phục phiên:', dbErr);
              setIsAuthenticated(false);
              setBootAuthError(
                dbErr?.message ||
                  'Không thể kết nối Cơ sở dữ liệu PostgreSQL. Vui lòng kiểm tra kết nối và đăng nhập lại.'
              );
            }
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

  // REAL-TIME NATIVE PUSH NOTIFICATION POLLING (Kiểm tra và bắn thông báo điện thoại tức thì)
  useEffect(() => {
    if (!currentUserId || !isAuthenticated) return;

    const notifPoller = setInterval(async () => {
      try {
        const [res, chatsRes, likesRes] = await Promise.all([
          apiClient.getNotifications(currentUserId),
          apiClient.getChats(currentUserId),
          apiClient.getLikesYouCandidates(currentUserId),
        ]);

        if (chatsRes && Array.isArray(chatsRes.chats)) {
          const sanitizedPollChats = chatsRes.chats.map((c: any) => ({
            ...c,
            partnerName: cleanName(c.partnerName),
            partnerNickname: cleanName(c.partnerNickname),
          }));
          setChats((prev) => {
            if (prev.length !== sanitizedPollChats.length) return sanitizedPollChats;
            const hasChange = sanitizedPollChats.some((nc: any, idx: number) => {
              const pc = prev[idx];
              if (!pc || pc.id !== nc.id) return true;
              if (pc.messages.length !== (nc.messages?.length || 0)) return true;
              if (pc.unreadCount !== nc.unreadCount) return true;
              return false;
            });
            return hasChange ? sanitizedPollChats : prev;
          });
        }

        if (likesRes && Array.isArray(likesRes.likesYou)) {
          setLikesYouCandidates((prev) => {
            if (prev.length !== likesRes.likesYou.length) return likesRes.likesYou;
            const hasChange = likesRes.likesYou.some(
              (nl: any, idx: number) => prev[idx]?.id !== nl.id
            );
            return hasChange ? likesRes.likesYou : prev;
          });
        }
        if (res && Array.isArray(res.notifications)) {
          const freshNotifs: MobileNotificationItem[] = res.notifications.map((n: any) => ({
            id: String(n.id),
            title: n.title || 'Thông báo mới',
            body: n.body || '',
            timeLabel: n.timeLabel || n.time || 'Vừa xong',
            type: (n.type || 'system') as NotificationType,
            category: normalizeNotificationCategory(
              n.type,
              n.category || n.actionPayload?.category
            ),
            isRead: Boolean(n.isRead),
            actionPayload: n.actionPayload || undefined,
          }));

          setNotifications(freshNotifs);

          freshNotifs.forEach((n) => {
            if (!seenNotificationIdsRef.current.has(n.id)) {
              seenNotificationIdsRef.current.add(n.id);
              if (!n.isRead) {
                sendNativePushNotification(n.title, n.body, n.actionPayload);
              }
            }
          });
        }
      } catch {
        // Im lặng bắt lỗi khi background poll
      }
    }, 3500);

    return () => clearInterval(notifPoller);
  }, [currentUserId, isAuthenticated]);

  const setActiveTab = useCallback(
    (nextTab: MobileMainTab) => {
      setActiveChatId(null);
      setIsSearchPanelOpen(false);
      // Khi nhấn trực tiếp vào Tab "Tôi" dưới thanh điều hướng -> mở hồ sơ bản thân
      if (nextTab === 'tinder' && currentUserId) {
        apiClient
          .getLikesYouCandidates(currentUserId)
          .then((res) => {
            if (res && Array.isArray(res.likesYou)) {
              setLikesYouCandidates(res.likesYou);
            }
          })
          .catch(() => {});
        apiClient
          .getTinderCandidates(
            currentUserId,
            tinderFilterGoal !== 'all' ? tinderFilterGoal : undefined,
            tinderGenderFilter !== 'all' ? tinderGenderFilter : undefined
          )
          .then((res) => {
            if (res && Array.isArray(res.candidates)) {
              setTinderCandidates(res.candidates);
            }
          })
          .catch(() => {});
      }
      if (nextTab === 'chat' && currentUserId) {
        apiClient
          .getChats(currentUserId)
          .then((res) => {
            if (res && Array.isArray(res.chats)) {
              setChats(res.chats.map((c: any) => ({
                ...c,
                partnerName: cleanName(c.partnerName),
                partnerNickname: cleanName(c.partnerNickname),
              })));
            }
          })
          .catch(() => {});
      }
      if (nextTab === 'profile') {
        setSelectedProfileHandle(null);
        setViewedUserHandle(null);
      }
      setActiveTabState((prev) => {
        if (prev !== nextTab) {
          setTabHistory((history) => [...history.slice(-8), nextTab]);
        }
        return nextTab;
      });
    },
    [setActiveChatId, currentUserId, tinderFilterGoal, tinderGenderFilter]
  );

  const goBackFromOtherProfile = useCallback(() => {
    setSelectedProfileHandle(null);
    setViewedUserHandle(null);
    const targetTab = returnTabAfterProfile || 'explore';
    setActiveTabState(targetTab);
    if (targetTab === 'chat' && returnChatIdAfterProfile) {
      setActiveChatIdState(returnChatIdAfterProfile);
    }
    setReturnChatIdAfterProfile(null);
  }, [returnTabAfterProfile, returnChatIdAfterProfile]);

  const handleHardwareBack = useCallback((): boolean => {
    if (lightboxMedia) {
      setLightboxMedia(null);
      return true;
    }
    if (matchedCandidateModal) {
      setMatchedCandidateModal(null);
      return true;
    }
    if (showLikesYouDrawer) {
      setShowLikesYouDrawer(false);
      return true;
    }
    if (activeModal) {
      setActiveModal(null);
      return true;
    }
    if (activeTab === 'profile' && selectedProfileHandle) {
      goBackFromOtherProfile();
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
    if (activeTab === 'chat' && activeChatId) {
      setActiveChatId(null);
      return true;
    }
    if (tabHistory.length > 1) {
      const nextHistory = [...tabHistory];
      nextHistory.pop();
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
    showLikesYouDrawer,
    activeModal,
    activeTab,
    selectedProfileHandle,
    goBackFromOtherProfile,
    viewedUserHandle,
    isSearchPanelOpen,
    activeChatId,
    setActiveChatId,
    tabHistory,
  ]);

  const setThemeId = useCallback(
    async (id: ThemePresetId) => {
      setThemeIdState(id);
      try {
        await AsyncStorage.setItem(STORAGE_KEY_THEME, id);
        showToast(`Đã áp dụng chủ đề "${THEME_PALETTES[id].name}"`);
      } catch (err) {
        console.warn(err);
      }
    },
    [showToast]
  );

  // =========================================================================
  // AUTHENTICATION
  // =========================================================================
  const loginOrRegister = useCallback(
    async (params: {
      isRegister?: boolean;
      name?: string;
      phone?: string;
      username?: string;
      password?: string;
      identifier?: string;
      petName?: string;
      petSpecies?: 'Chó' | 'Mèo';
      petBreed?: string;
    }) => {
      let authRes: { success: boolean; token: string; user: any; message: string };
      if (params.isRegister) {
        authRes = await apiClient.register({
          phone: params.phone || '',
          username: params.username,
          password: params.password,
          displayName: params.name,
          petName: params.petName,
          petSpecies: params.petSpecies,
          petBreed: params.petBreed,
        });
      } else {
        authRes = await apiClient.login(
          params.identifier || params.username || params.phone || '',
          params.password
        );
      }

      const dbUser = authRes?.user;
      if (!dbUser || !dbUser.id) {
        throw new Error('Không thể xác thực tài khoản từ Cơ sở dữ liệu PostgreSQL.');
      }

      const nextSessionId = `DEV-${Platform.OS.toUpperCase()}-${Date.now().toString().slice(-6)}`;
      const resolvedHandle = dbUser.username
        ? `@${dbUser.username}`
        : `@${(dbUser.displayName || 'user').toLowerCase().replace(/\s+/g, '')}`;

      await refreshData(dbUser.id, true);

      setBootAuthError(null);
      setActiveDeviceSessionId(nextSessionId);
      setHasSavedSession(true);
      setSavedSessionIdentifier(dbUser.username || dbUser.phone || '');
      setIsAuthenticated(true);
      setSelectedProfileHandle(null);
      setActiveTabState('explore');
      setTabHistory(['explore']);

      try {
        await AsyncStorage.setItem(
          STORAGE_KEY_AUTH,
          JSON.stringify({
            isAuthenticated: true,
            userId: dbUser.id,
            identifier: dbUser.username || dbUser.phone || '',
            deviceSessionId: nextSessionId,
            ownerName: dbUser.displayName,
            ownerHandle: resolvedHandle,
            ownerPhone: dbUser.phone,
            ownerBio: dbUser.bio || '',
          })
        );
      } catch (storageErr) {
        console.warn('[Pawty Auth] Không thể lưu phiên vào bộ nhớ máy:', storageErr);
      }

      showToast(authRes.message || `Chào mừng ${dbUser.displayName} quay lại Pawty!`);
    },
    [refreshData, showToast]
  );

  const logoutUser = useCallback(async () => {
    setIsAuthenticated(false);
    setHasSavedSession(false);
    setSavedSessionIdentifier('');
    setBootAuthError(null);
    setCurrentUserId('');
    setPets([]);
    setPosts([]);
    setChats([]);
    setSosAlerts([]);
    setTinderCandidates([]);
    setLikesYouCandidates([]);
    setNotifications([]);
    setPublicProfiles({});
    setSelectedProfileHandle(null);
    setActiveModal(null);
    setActiveChatId(null);
    try {
      await AsyncStorage.removeItem(STORAGE_KEY_AUTH);
    } catch (err) {
      console.warn(err);
    }
    showToast('Đã đăng xuất tài khoản an toàn.');
  }, [setActiveChatId, showToast]);

  const forceRevokeOtherDevices = useCallback(() => {
    const rotated = `DEV-${Platform.OS.toUpperCase()}-${Date.now().toString().slice(-6)}`;
    setActiveDeviceSessionId(rotated);
    showToast('Đã thu hồi toàn bộ phiên lạ — Chỉ giữ lại thiết bị hiện tại.');
  }, [showToast]);

  // =========================================================================
  // OWNER & PET PROFILE PERSISTENCE (PostgreSQL)
  // =========================================================================
  const setOwnerCoverUrl = useCallback(
    (url: string) => {
      setOwnerCoverUrlState(url);
      if (currentUserId) {
        apiClient
          .updateMyProfile({ userId: currentUserId, coverUrl: url })
          .catch((err) => console.warn('[Pawty Profile] Lỗi lưu ảnh bìa:', err));
      }
    },
    [currentUserId]
  );

  const setOwnerAvatarUrl = useCallback(
    (url: string) => {
      setOwnerAvatarUrlState(url);
      setOwnerAvatar(url);
      if (currentUserId) {
        apiClient
          .updateMyProfile({ userId: currentUserId, avatarUrl: url })
          .catch((err) => console.warn('[Pawty Profile] Lỗi lưu ảnh đại diện:', err));
      }
    },
    [currentUserId]
  );

  const setOwnerNoteBubble = useCallback(
    (note: string) => {
      const trimmed = note.slice(0, 60);
      setOwnerNoteBubbleState(trimmed);
      if (currentUserId) {
        apiClient
          .updateMyProfile({ userId: currentUserId, noteBubble: trimmed })
          .catch((err) => console.warn('[Pawty Profile] Lỗi lưu ghi chú:', err));
      }
    },
    [currentUserId]
  );

  const updateOwnerProfile = useCallback(
    async (params: {
      name?: string;
      gender?: string;
      area?: string;
      age?: number;
      birthDate?: string;
      zodiac?: string;
      mbti?: string;
      education?: string;
      major?: string;
      occupation?: string;
      bio?: string;
      coverUrl?: string;
      avatarUrl?: string;
      privacySettings?: Record<string, boolean>;
    }) => {
      if (params.name !== undefined) {
        setOwnerName(params.name);
        setOwnerNickname(params.name);
      }
      if (params.gender !== undefined) setOwnerGender(params.gender);
      if (params.area !== undefined) setOwnerArea(params.area);
      if (params.age !== undefined) setOwnerAge(params.age);
      if (params.birthDate !== undefined) setOwnerBirthDate(params.birthDate);
      if (params.zodiac !== undefined) setOwnerZodiac(params.zodiac);
      if (params.mbti !== undefined) setOwnerMbti(params.mbti);
      if (params.education !== undefined) setOwnerEducation(params.education);
      if (params.major !== undefined) setOwnerMajor(params.major);
      if (params.occupation !== undefined) setOwnerOccupation(params.occupation);
      if (params.bio !== undefined) setOwnerBio(params.bio);
      if (params.coverUrl !== undefined) setOwnerCoverUrlState(params.coverUrl);
      if (params.avatarUrl !== undefined) {
        setOwnerAvatarUrlState(params.avatarUrl);
        setOwnerAvatar(params.avatarUrl);
      }
      if (params.privacySettings !== undefined) {
        setOwnerPrivacySettings(params.privacySettings);
      }

      if (!currentUserId) return;

      try {
        await apiClient.updateMyProfile({
          userId: currentUserId,
          displayName: params.name,
          gender: params.gender,
          neighborhood: params.area,
          age: params.age,
          birthDate: params.birthDate,
          zodiac: params.zodiac,
          mbti: params.mbti,
          education: params.education,
          occupation: params.occupation,
          bio: params.bio,
          coverUrl: params.coverUrl,
          avatarUrl: params.avatarUrl,
          privacySettings: params.privacySettings,
        });
        showToast('Đã lưu hồ sơ cá nhân lên cơ sở dữ liệu.');
      } catch (err: any) {
        console.warn('[Pawty Profile] Lỗi cập nhật hồ sơ chủ nuôi:', err);
        showToast(err?.message || 'Không thể lưu hồ sơ lên máy chủ.');
      }
    },
    [currentUserId, showToast]
  );

  const togglePrivateProfile = useCallback(() => {
    setIsPrivateProfile((prev) => {
      const next = !prev;
      if (currentUserId) {
        apiClient
          .updateMyProfile({
            userId: currentUserId,
            allowMessages: next ? 'friends_only' : 'everyone',
          })
          .catch((err) => console.warn('[Pawty Privacy] Lỗi cập nhật quyền riêng tư:', err));
      }
      showToast(
        next
          ? 'Đã bật chế độ Tài khoản Riêng tư.'
          : 'Đã chuyển sang chế độ Tài khoản Công khai.'
      );
      return next;
    });
  }, [currentUserId, showToast]);

  const addNewPetProfile = useCallback(
    async (params: {
      name: string;
      species: 'Chó' | 'Mèo' | 'Khác';
      customSpecies?: string;
      breed: string;
      gender?: 'Đực' | 'Cái';
      weightKg?: number;
      ageLabel: string;
      birthDate?: string;
      furColor?: string;
      bio?: string;
      avatarUrl?: string;
      galleryUrls?: string[];
      isSterilized?: boolean;
      isVaccinatedAndRabies?: boolean;
      favoriteFood?: string;
      dewormingHistory?: string;
      medicalHistory?: string;
      goodHabits?: string[];
      cautionHabits?: string[];
      weightHistory?: { month: string; weightKg: number }[];
      vaccineRecords?: PetVaccineRecord[];
    }): Promise<MobilePet | null> => {
      if (!currentUserId) {
        showToast('Vui lòng đăng nhập trước khi tạo hồ sơ thú cưng.');
        return null;
      }
      if (!params.name.trim()) {
        showToast('Vui lòng nhập tên thú cưng.');
        return null;
      }

      try {
        const defaultPhoto =
          params.species === 'Mèo'
            ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=800&q=80'
            : 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=800&q=80';
        const avatarUrl =
          params.avatarUrl ||
          (params.galleryUrls && params.galleryUrls[0]) ||
          defaultPhoto;

        const res = await apiClient.createPet({
          ownerId: currentUserId,
          name: params.name.trim(),
          species: params.species,
          customSpecies: params.species === 'Khác' ? params.customSpecies : undefined,
          breed: params.breed || 'Chưa rõ',
          gender: params.gender || 'Đực',
          weightKg: Number(params.weightKg || 4.5),
          ageLabel: params.ageLabel || '1 tuổi',
          birthDate: params.birthDate || '01/01/2024',
          furColor: params.furColor || 'Vàng kem',
          bio: (params.bio || '').slice(0, 160),
          avatarUrl,
          galleryUrls:
            params.galleryUrls && params.galleryUrls.length > 0
              ? params.galleryUrls
              : [avatarUrl],
          isSterilized: Boolean(params.isSterilized ?? false),
          isVaccinatedAndRabies: Boolean(params.isVaccinatedAndRabies ?? true),
          favoriteFood: params.favoriteFood || 'Hạt dinh dưỡng & Ức gà',
          dewormingHistory: params.dewormingHistory || 'Định kỳ 3 tháng/lần',
          medicalHistory: params.medicalHistory || 'Khỏe mạnh, không có bệnh nền',
          goodHabits: params.goodHabits || [],
          cautionHabits: params.cautionHabits || [],
          weightHistory:
            params.weightHistory && params.weightHistory.length > 0
              ? params.weightHistory
              : [{ month: 'Hiện tại', weightKg: Number(params.weightKg || 4.5) }],
          vaccineRecords: params.vaccineRecords || [],
        });

        const createdPet = normalizePetFromServer(res.pet);
        setPets((prev) => [...prev, createdPet]);
        setActivePetId(createdPet.id);
        showToast(`Đã tạo hồ sơ bé ${createdPet.name} thành công!`);
        return createdPet;
      } catch (err: any) {
        console.warn('[Pawty Pets] Lỗi tạo hồ sơ thú cưng:', err);
        showToast(err?.message || 'Không thể tạo hồ sơ thú cưng. Vui lòng thử lại.');
        return null;
      }
    },
    [currentUserId, showToast]
  );

  const updatePetProfile = useCallback(
    async (petId: string, updates: Partial<MobilePet>) => {
      if (!petId) return;
      setPets((prev) => prev.map((p) => (p.id === petId ? { ...p, ...updates } : p)));
      try {
        const res = await apiClient.updatePet(petId, updates as Record<string, any>);
        if (res?.pet) {
          const normalized = normalizePetFromServer(res.pet);
          setPets((prev) => prev.map((p) => (p.id === petId ? normalized : p)));
        }
      } catch (err: any) {
        console.warn('[Pawty Pets] Lỗi cập nhật hồ sơ thú cưng:', err);
        showToast(err?.message || 'Không thể lưu thay đổi hồ sơ thú cưng.');
      }
    },
    [showToast]
  );

  const deletePetProfile = useCallback(
    async (petId: string) => {
      if (!petId) return;
      const target = pets.find((p) => p.id === petId);
      try {
        await apiClient.deletePet(petId);
        const remaining = pets.filter((p) => p.id !== petId);
        setPets(remaining);
        if (activePetId === petId) {
          setActivePetId(remaining[0]?.id || '');
        }
        showToast(`Đã xóa hồ sơ bé ${target?.name || ''}.`);
      } catch (err: any) {
        console.warn('[Pawty Pets] Lỗi xóa hồ sơ thú cưng:', err);
        showToast(err?.message || 'Không thể xóa hồ sơ thú cưng.');
      }
    },
    [pets, activePetId, showToast]
  );

  const togglePetLike = useCallback(
    (petId: string) => {
      setPets((prev) =>
        prev.map((p) => {
          if (p.id !== petId) return p;
          const nextLiked = !p.isLiked;
          const baseCount = p.likesCount ?? 0;
          const nextCount = nextLiked ? baseCount + 1 : Math.max(0, baseCount - 1);
          apiClient
            .updatePet(petId, { likesCount: nextCount })
            .catch((e) => console.warn('[Pawty Pet Like] Lỗi lưu lượt thích:', e));
          return {
            ...p,
            isLiked: nextLiked,
            likesCount: nextCount,
          };
        })
      );
    },
    []
  );

  const togglePetVaccinationAndRabies = useCallback(
    (petId: string) => {
      const found = pets.find((p) => p.id === petId);
      if (!found) return;
      const nextStatus = !found.isVaccinatedAndRabies;
      updatePetProfile(petId, { isVaccinatedAndRabies: nextStatus });
      showToast(
        nextStatus
          ? 'Đã bật trạng thái Tiêm chủng đầy đủ & Phòng dại.'
          : 'Đã cập nhật trạng thái Sổ tiêm chủng.'
      );
    },
    [pets, updatePetProfile, showToast]
  );

  const updateOwnerAndPetProfile = useCallback(
    (params: {
      ownerName: string;
      ownerNickname: string;
      ownerBio: string;
      ownerArea: string;
      isPrivateProfile: boolean;
      petId: string;
      petName: string;
      petSpecies: 'Chó' | 'Mèo' | 'Khác';
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
      updateOwnerProfile({
        name: params.ownerName,
        bio: params.ownerBio,
        area: params.ownerArea,
      });
      if (params.petId) {
        updatePetProfile(params.petId, {
          name: params.petName,
          species: params.petSpecies,
          breed: params.petBreed,
          gender: params.petGender,
          birthDate: params.petBirthDate,
          ageLabel: params.petAgeLabel,
          weightKg: params.petWeightKg,
          furColor: params.petFurColor,
          microchipOrMark: params.petMicrochipOrMark,
          favoriteFood: params.petFavoriteFood,
          allergies: params.petAllergies,
          isVaccinatedAndRabies: params.petIsVaccinatedAndRabies,
          goodHabits: params.petGoodHabits,
          cautionHabits: params.petCautionHabits,
        });
      }
      setActiveModal(null);
    },
    [updateOwnerProfile, updatePetProfile]
  );

  // =========================================================================
  // TINDER SETUP (1-TO-1 PURPOSE MAPPING)
  // =========================================================================
  const setTinderIntent = useCallback(
    (intent: TinderIntent) => {
      setTinderIntentState(intent);
      const label = getTinderPurposeLabel(intent);
      setUserTinderSetup((prev) => ({
        ...prev,
        intent,
        lookingFor: label,
      }));
    },
    []
  );

  const updateUserTinderSetup = useCallback(
    async (nextSetup: UserTinderSetupProfile) => {
      const normalizedIntent = resolveTinderIntentFromLabel(
        nextSetup.intent || nextSetup.lookingFor
      );
      const tPhotos = Array.isArray(nextSetup.photos) && nextSetup.photos.length > 0
        ? nextSetup.photos
        : Array.isArray(nextSetup.photoUrls) && nextSetup.photoUrls.length > 0
        ? nextSetup.photoUrls
        : [];
      const normalizedPayload: UserTinderSetupProfile = {
        ...nextSetup,
        displayName: (nextSetup.displayName || '').trim(),
        bio: (nextSetup.bio || '').trim(),
        datingPetId: nextSetup.datingPetId || '',
        photos: tPhotos,
        photoUrls: tPhotos,
        intent: normalizedIntent,
        lookingFor: getTinderPurposeLabel(normalizedIntent),
        promptQuote: (nextSetup.promptQuote || '').slice(0, 140),
      };

      setUserTinderSetup(normalizedPayload);
      setTinderIntentState(normalizedIntent);

      if (!currentUserId) return;
      try {
        await apiClient.updateMyProfile({
          userId: currentUserId,
          primaryNeed: normalizedIntent,
          age: normalizedPayload.age,
          gender: normalizedPayload.gender,
          zodiac: normalizedPayload.zodiac,
          tinderSetup: normalizedPayload,
        });
        showToast('Đã đồng bộ Hồ sơ Kết nối & Mục đích tìm kiếm!');
      } catch (err: any) {
        console.warn('[Pawty Tinder Setup] Lỗi lưu thiết lập:', err);
        showToast(err?.message || 'Không thể lưu thiết lập kết nối.');
      }
    },
    [currentUserId, showToast]
  );

  // =========================================================================
  // SUGGESTED PEOPLE & SEARCH
  // =========================================================================
  const toggleFollowSuggestedPerson = useCallback(
    async (personId: string) => {
      const target = suggestedPeople.find((p) => p.id === personId);
      if (!target || !currentUserId) return;
      try {
        const res = await apiClient.toggleFollow(currentUserId, target.handle);
        setSuggestedPeople((prev) =>
          prev.map((item) =>
            item.id === personId ? { ...item, isFollowing: res.isFollowing } : item
          )
        );
        await refreshData(currentUserId, false, true);
        showToast(
          res.isFollowing
            ? `Đã theo dõi ${target.name}.`
            : `Đã bỏ theo dõi ${target.name}.`
        );
      } catch (err: any) {
        showToast(err?.message || 'Không thể cập nhật theo dõi.');
      }
    },
    [suggestedPeople, currentUserId, refreshData, showToast]
  );

  const dismissSuggestedPerson = useCallback((personId: string) => {
    setSuggestedPeople((prev) => prev.filter((item) => item.id !== personId));
  }, []);

  const recordSearchQuery = useCallback((query: string) => {
    const clean = query.trim();
    if (!clean) return;
    setSearchHistory((prev) => [
      clean,
      ...prev.filter((item) => item.toLowerCase() !== clean.toLowerCase()),
    ].slice(0, 8));
  }, []);

  const removeSearchHistoryItem = useCallback((query: string) => {
    setSearchHistory((prev) => prev.filter((item) => item !== query));
  }, []);

  const clearSearchHistory = useCallback(() => {
    setSearchHistory([]);
  }, []);

  // =========================================================================
  // EXPLORE POSTS, REACTIONS & COMMENTS (PostgreSQL)
  // =========================================================================
  const toggleReaction = useCallback(
    async (postId: string, _type: keyof MobilePost['reactions'] = 'paws') => {
      if (!currentUserId) return;

      // Optimistic UI update
      setPosts((prev) =>
        prev.map((post) => {
          if (post.id !== postId) return post;
          const isUnreacting = post.userReaction === 'paws';
          return {
            ...post,
            userReaction: isUnreacting ? null : 'paws',
            reactions: {
              ...post.reactions,
              paws: isUnreacting
                ? Math.max(0, post.reactions.paws - 1)
                : post.reactions.paws + 1,
            },
          };
        })
      );

      try {
        const res = await apiClient.togglePostReaction(postId, currentUserId);
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  userReaction: res.isLiked ? 'paws' : null,
                  reactions: { ...post.reactions, paws: res.likes },
                }
              : post
          )
        );
      } catch (err) {
        console.warn('[Pawty Post Reaction] Lỗi thả Paw:', err);
      }
    },
    [currentUserId]
  );

  const toggleSavePost = useCallback(
    (postId: string) => {
      setPosts((prev) =>
        prev.map((post) => {
          if (post.id !== postId) return post;
          const nextSaved = !post.isSaved;
          showToast(nextSaved ? 'Đã lưu bài viết vào bộ sưu tập.' : 'Đã bỏ lưu bài viết.');
          return { ...post, isSaved: nextSaved };
        })
      );
    },
    [showToast]
  );

  const sharePost = useCallback(
    (postId: string) => {
      setPosts((prev) =>
        prev.map((post) =>
          post.id === postId ? { ...post, shareCount: post.shareCount + 1 } : post
        )
      );
      showToast('Đã sao chép liên kết bài viết để chia sẻ.');
    },
    [showToast]
  );

  const addComment = useCallback(
    async (postId: string, content: string) => {
      const clean = content.trim();
      if (!clean || !currentUserId) return;

      try {
        const res = await apiClient.addPostComment(postId, currentUserId, clean);
        const createdComment = res.comment;
        setPosts((prev) =>
          prev.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  comments: [
                    ...post.comments,
                    {
                      id: createdComment?.id || `cm-${Date.now()}`,
                      authorName: createdComment?.authorName || ownerName,
                      authorHandle: createdComment?.authorHandle || ownerHandle,
                      authorAvatar: createdComment?.authorAvatar || ownerAvatarUrl,
                      content: createdComment?.text || clean,
                      createdAt: createdComment?.createdAt || 'Vừa xong',
                      likesCount: 0,
                      isLiked: false,
                      replies: [],
                    },
                  ],
                }
              : post
          )
        );
      } catch (err: any) {
        showToast(err?.message || 'Không thể gửi bình luận.');
      }
    },
    [currentUserId, ownerName, ownerHandle, ownerAvatarUrl, showToast]
  );

  const toggleCommentLike = useCallback((postId: string, commentId: string) => {
    setPosts((prev) =>
      prev.map((post) => {
        if (post.id !== postId) return post;
        return {
          ...post,
          comments: post.comments.map((cm) => {
            if (cm.id !== commentId) return cm;
            const nextLiked = !cm.isLiked;
            const baseCount = cm.likesCount ?? 0;
            return {
              ...cm,
              isLiked: nextLiked,
              likesCount: nextLiked ? baseCount + 1 : Math.max(0, baseCount - 1),
            };
          }),
        };
      })
    );
  }, []);

  const addCommentReply = useCallback(
    (postId: string, commentId: string, content: string) => {
      if (!content.trim()) return;
      setPosts((prev) =>
        prev.map((post) => {
          if (post.id !== postId) return post;
          return {
            ...post,
            comments: post.comments.map((cm) => {
              if (cm.id !== commentId) return cm;
              const prevReplies = cm.replies || [];
              return {
                ...cm,
                replies: [
                  ...prevReplies,
                  {
                    id: `rp-${Date.now()}`,
                    authorName: ownerName,
                    authorHandle: ownerHandle,
                    authorAvatar: ownerAvatarUrl || ownerAvatar,
                    content: content.trim(),
                    createdAt: 'Vừa xong',
                    likesCount: 0,
                    isLiked: false,
                  },
                ],
              };
            }),
          };
        })
      );
    },
    [ownerName, ownerHandle, ownerAvatarUrl, ownerAvatar]
  );

  const createPost = useCallback(
    async (params: {
      content: string;
      tags: string[];
      mediaUrls: string[];
      mediaType: 'image' | 'video';
      category?: 'moment' | 'health_tip' | 'qa_vet';
    }): Promise<boolean> => {
      const cleanContent = params.content.trim();
      const validMedia = Array.isArray(params.mediaUrls)
        ? params.mediaUrls.filter(Boolean)
        : [];

      if (!cleanContent && validMedia.length === 0) {
        showToast('Vui lòng nhập nội dung chia sẻ hoặc chọn ít nhất 1 ảnh.');
        return false;
      }
      if (!currentUserId) {
        showToast('Vui lòng đăng nhập lại để đăng bài viết.');
        return false;
      }

      const contentType: 'moment' | 'tip' | 'question' =
        params.category === 'health_tip'
          ? 'tip'
          : params.category === 'qa_vet'
          ? 'question'
          : 'moment';

      try {
        const res = await apiClient.createPost({
          authorId: currentUserId,
          content: cleanContent,
          contentType,
          mediaUrls: validMedia,
          tags: params.tags,
          locationDistrict: ownerArea,
        });

        if (res?.post) {
          const newPost = normalizePostFromServer(res.post, currentUserId);
          setPosts((prev) => [newPost, ...prev]);
        } else {
          await refreshData(currentUserId, false, true);
        }

        setActiveModal(null);
        showToast('Đã đăng bài viết mới lên bảng tin Khám phá!');
        return true;
      } catch (err: any) {
        console.warn('[Pawty CreatePost] Lỗi đăng bài:', err);
        showToast(err?.message || 'Không thể đăng bài viết. Vui lòng thử lại.');
        return false;
      }
    },
    [currentUserId, ownerArea, refreshData, showToast]
  );

  const deletePost = useCallback(
    async (postId: string) => {
      try {
        await apiClient.deletePost(postId, currentUserId);
        setPosts((prev) => prev.filter((p) => p.id !== postId));
        showToast('Đã xóa bài viết khỏi hồ sơ và bảng tin.');
      } catch (err: any) {
        showToast(err?.message || 'Không thể xóa bài viết.');
      }
    },
    [currentUserId, showToast]
  );

  // =========================================================================
  // LIGHTBOX & UNIFIED PUBLIC PROFILE NAVIGATION
  // =========================================================================
  const openLightboxMedia = useCallback((state: LightboxMediaState) => {
    setLightboxMedia(state);
  }, []);

  const closeLightboxMedia = useCallback(() => {
    setLightboxMedia(null);
  }, []);

  const resolvePublicProfile = useCallback(
    (handle: string): PublicUserProfile => {
      const normalized = handle.startsWith('@') ? handle : `@${handle}`;
      const rawKey = normalized.replace(/^@/, '');
      const existing =
        publicProfiles[normalized] ||
        publicProfiles[rawKey] ||
        Object.values(publicProfiles).find(
          (p) => p.handle.toLowerCase() === normalized.toLowerCase()
        );

      if (existing) return existing;

      return {
        handle: normalized,
        name: normalized.replace('@', ''),
        nickname: 'Thành viên Pawty',
        avatarUrl: '',
        coverUrl: '',
        bio: 'Chưa cập nhật lời giới thiệu.',
        area: 'Cộng đồng Pawty',
        isPrivate: false,
        isFriend: false,
        friendStatus: 'none',
        isFollowing: false,
        isMatchedOnTinder: false,
        followersCount: 0,
        followingCount: 0,
        friendsCount: 0,
        likesCount: 0,
        pets: [],
        posts: [],
        galleryUrls: [],
      };
    },
    [publicProfiles]
  );

  const openUnifiedProfile = useCallback(
    async (handle: string) => {
      if (!handle) return;
      const normalized = handle.startsWith('@') ? handle : `@${handle}`;

      // Đóng mọi modal đang mở để chuyển mượt sang giao diện Hồ sơ thống nhất
      setActiveModal(null);
      setViewedUserHandle(null);
      setShowLikesYouDrawer(false);

      // Nếu người dùng bấm vào chính mình -> Mở thẳng tab Hồ sơ bản thân
      if (normalized.toLowerCase() === ownerHandle.toLowerCase()) {
        setSelectedProfileHandle(null);
        setActiveTabState('profile');
        return;
      }

      if (!selectedProfileHandle) {
        setReturnTabAfterProfile(activeTab);
        setReturnChatIdAfterProfile(activeTab === 'chat' ? activeChatId : null);
      }

      setSelectedProfileHandle(normalized);
      setActiveTabState('profile');

      if (currentUserId) {
        try {
          const freshProfile = await apiClient.getUserProfile(normalized, currentUserId);
          if (freshProfile) {
            const formattedProfile: PublicUserProfile = {
              ...freshProfile,
              pets: Array.isArray(freshProfile.pets)
                ? freshProfile.pets.map((pt: any) => normalizePetFromServer(pt))
                : [],
              posts: Array.isArray(freshProfile.posts)
                ? freshProfile.posts.map((po: any) =>
                    normalizePostFromServer(po, currentUserId)
                  )
                : [],
            };
            const cleanKey = formattedProfile.handle.replace(/^@/, '');
            setPublicProfiles((prev) => ({
              ...prev,
              [normalized]: formattedProfile,
              [formattedProfile.handle]: formattedProfile,
              [cleanKey]: formattedProfile,
            }));
          }
        } catch (err) {
          console.warn('[Pawty Profile] Không tải được hồ sơ mới nhất:', err);
        }
      }
    },
    [ownerHandle, selectedProfileHandle, activeTab, activeChatId, currentUserId]
  );

  const openPublicUserProfile = useCallback(
    (handle: string) => {
      openUnifiedProfile(handle);
    },
    [openUnifiedProfile]
  );

  const openUserProfileInTab = useCallback(
    (handle: string) => {
      openUnifiedProfile(handle);
    },
    [openUnifiedProfile]
  );

  const closePublicUserProfile = useCallback(() => {
    goBackFromOtherProfile();
  }, [goBackFromOtherProfile]);

  // =========================================================================
  // SOCIAL GRAPH: FRIEND REQUEST, ACCEPT, DECLINE, UNFRIEND, FOLLOW
  // =========================================================================
  const sendFriendRequest = useCallback(
    async (handle: string) => {
      if (!currentUserId) return;
      const normalized = handle.startsWith('@') ? handle : `@${handle}`;
      try {
        const res = await apiClient.sendFriendRequest(currentUserId, normalized);
        await refreshData(currentUserId, false, true);
        if (res.isFriend) {
          showToast(`Hai bạn đã trở thành bạn bè trên Pawty!`);
          sendNativePushNotification(
            'Pawty - Kết bạn thành công! 🎉',
            `Bạn và ${normalized} đã trở thành bạn bè. Hãy bắt đầu trò chuyện ngay!`
          );
        } else {
          showToast(`Đã gửi lời mời kết bạn tới ${normalized}.`);
          sendNativePushNotification(
            'Pawty - Lời mời kết bạn 🐾',
            `Đã gửi lời mời kết bạn tới ${normalized}. Chờ đối phương phản hồi.`
          );
        }
      } catch (err: any) {
        showToast(err?.message || 'Không thể gửi lời mời kết bạn.');
      }
    },
    [currentUserId, refreshData, showToast]
  );

  const acceptFriendRequest = useCallback(
    async (handle: string, notifId?: string) => {
      if (!currentUserId) return;
      const normalized = handle.startsWith('@') ? handle : `@${handle}`;
      try {
        await apiClient.respondFriendRequest(currentUserId, normalized, 'accept', notifId);
        await refreshData(currentUserId, false, true);
        showToast(`Đã chấp nhận lời mời kết bạn từ ${normalized}!`);
        sendNativePushNotification(
          'Pawty - Bạn bè mới! 🐾',
          `Bạn đã chấp nhận lời mời kết bạn từ ${normalized}. Giờ hai bạn có thể nhắn tin cho nhau!`
        );
      } catch (err: any) {
        showToast(err?.message || 'Không thể chấp nhận lời mời kết bạn.');
      }
    },
    [currentUserId, refreshData, showToast]
  );

  const declineFriendRequest = useCallback(
    async (handle: string, notifId?: string) => {
      if (!currentUserId) return;
      const normalized = handle.startsWith('@') ? handle : `@${handle}`;
      try {
        await apiClient.respondFriendRequest(currentUserId, normalized, 'decline', notifId);
        await refreshData(currentUserId, false, true);
        showToast('Đã từ chối lời mời kết bạn.');
      } catch (err: any) {
        showToast(err?.message || 'Không thể từ chối lời mời kết bạn.');
      }
    },
    [currentUserId, refreshData, showToast]
  );

  const unfriendUser = useCallback(
    async (handle: string) => {
      if (!currentUserId) return;
      const normalized = handle.startsWith('@') ? handle : `@${handle}`;
      try {
        await apiClient.unfriendUser(currentUserId, normalized);
        // Khóa nhắn tin ngay lập tức ở client và đồng bộ lại từ DB
        setChats((prev) =>
          prev.map((room) =>
            room.partnerHandle.toLowerCase() === normalized.toLowerCase()
              ? { ...room, canMessage: false, isFriend: false }
              : room
          )
        );
        await refreshData(currentUserId, false, true);
        showToast(`Đã hủy kết bạn với ${normalized}. Hai bên không thể tiếp tục nhắn tin.`);
      } catch (err: any) {
        showToast(err?.message || 'Không thể hủy kết bạn.');
      }
    },
    [currentUserId, refreshData, showToast]
  );

  const unmatchCandidate = useCallback(
    async (partnerHandleOrId: string) => {
      if (!currentUserId) return;
      const normalized = partnerHandleOrId.startsWith('@')
        ? partnerHandleOrId
        : `@${partnerHandleOrId}`;
      try {
        await apiClient.unmatchCandidate(currentUserId, normalized);
        // Xóa ngay lập tức phòng chat khỏi state
        setChats((prev) =>
          prev.filter(
            (c) =>
              c.partnerHandle.toLowerCase() !== normalized.toLowerCase() &&
              c.partnerId !== partnerHandleOrId
          )
        );
        setActiveChatIdState(null);
        await refreshData(currentUserId, false, true);
        showToast(`Đã hủy tương hợp và xóa toàn bộ tin nhắn.`);
      } catch (err: any) {
        showToast(err?.message || 'Không thể hủy tương hợp.');
      }
    },
    [currentUserId, refreshData, showToast]
  );

  const toggleFriendStatus = useCallback(
    (handle: string) => {
      const current = resolvePublicProfile(handle);
      if (current.friendStatus === 'none') {
        sendFriendRequest(handle);
      } else if (current.friendStatus === 'pending_incoming') {
        acceptFriendRequest(handle);
      } else if (current.friendStatus === 'pending_outgoing') {
        showToast('Lời mời kết bạn đang chờ đối phương xác nhận.');
      }
    },
    [resolvePublicProfile, sendFriendRequest, acceptFriendRequest, showToast]
  );

  const toggleFollowUser = useCallback(
    async (handle: string) => {
      if (!currentUserId) return;
      const normalized = handle.startsWith('@') ? handle : `@${handle}`;
      try {
        const res = await apiClient.toggleFollow(currentUserId, normalized);
        await refreshData(currentUserId, false, true);
        showToast(
          res.isFollowing
            ? `Đang theo dõi ${normalized}`
            : `Đã bỏ theo dõi ${normalized}`
        );
      } catch (err: any) {
        showToast(err?.message || 'Không thể cập nhật theo dõi.');
      }
    },
    [currentUserId, refreshData, showToast]
  );

  const startDirectChatWithUser = useCallback(
    async (handle: string, chatType: 'social' | 'dating' = 'social') => {
      if (!currentUserId) return;
      const normalized = handle.startsWith('@') ? handle : `@${handle}`;

      const existingRoom = chats.find(
        (c) =>
          c.partnerHandle.toLowerCase() === normalized.toLowerCase() &&
          c.chatType === chatType
      );

      try {
        const opened = await apiClient.openDirectChat(currentUserId, normalized, chatType);
        await refreshData(currentUserId, false, true);
        setSelectedProfileHandle(null);
        setViewedUserHandle(null);
        setActiveModal(null);
        setActiveTabState('chat');
        setActiveChatId(opened.conversationId);
      } catch (err: any) {
        if (existingRoom) {
          setSelectedProfileHandle(null);
          setViewedUserHandle(null);
          setActiveModal(null);
          setActiveTabState('chat');
          setActiveChatId(existingRoom.id);
        } else {
          showToast(err?.message || 'Không thể mở cuộc trò chuyện.');
        }
      }
    },
    [currentUserId, chats, refreshData, setActiveChatId, showToast]
  );

  // =========================================================================
  // TINDER SWIPE, LIKES YOU & MATCHES (100% Free & Unlimited Distance)
  // =========================================================================
  const reloadTinderDeck = useCallback(
    async (silent = false, overrideGender?: 'all' | 'female' | 'male') => {
      if (!currentUserId) return;
      try {
        const res = await apiClient.getTinderCandidates(
          currentUserId,
          tinderFilterGoal !== 'all' ? tinderFilterGoal : undefined,
          (overrideGender ?? tinderGenderFilter) !== 'all' ? (overrideGender ?? tinderGenderFilter) : undefined
        );
        const fresh = res?.candidates;
        if (Array.isArray(fresh) && fresh.length > 0) {
          setTinderCandidates(fresh);
          setSwipedCandidateHistory([]);

          if (!silent) {
            showToast(`Đã làm mới ${fresh.length} hồ sơ kết nối!`);
          }
        } else {
          setSwipedCandidateHistory((prevHistory) => {
            if (prevHistory.length > 0) {
              setTinderCandidates(prevHistory);
              if (!silent) {
                showToast('Đã làm mới lại hồ sơ phù hợp!');
              }
            }
            return [];
          });


          if (!silent) {
            showToast('Đã làm mới lại hồ sơ phù hợp!');
          }
        }
      } catch (err) {
        console.warn('[Pawty Tinder] Lỗi làm mới cọc thẻ:', err);
      }
    },
    [currentUserId, tinderFilterGoal, tinderGenderFilter, showToast]
  );

  // Định kỳ tự động làm mới cọc thẻ hẹn hò sau mỗi 2 phút (chỉ lấy người chưa match)
  useEffect(() => {
    if (!isAuthenticated || !currentUserId) return;
    const timer = setInterval(() => {
      reloadTinderDeck(true);
    }, 120000);
    return () => clearInterval(timer);
  }, [isAuthenticated, currentUserId, reloadTinderDeck]);

  const swipeTinderCandidate = useCallback(
    async (candidateId: string, direction: 'left' | 'right') => {
      const target =
        tinderCandidates.find((c) => c.id === candidateId) ||
        likesYouCandidates.find((c) => c.id === candidateId);

      setTinderCandidates((prev) => {
        const next = prev.filter((c) => c.id !== candidateId);
        // Khi cọc thẻ chạm đáy hoặc chỉ còn 1 thẻ: Tự động nạp lại ứng viên chưa match
        if (next.length <= 1) {
          setTimeout(() => {
            reloadTinderDeck(true);
          }, 350);
        }
        return next;
      });
      setLikesYouCandidates((prev) => prev.filter((c) => c.id !== candidateId));

      if (!target) return;
      setSwipedCandidateHistory((prev) => [...prev, target]);

      try {
        const res = await apiClient.recordSwipe(
          candidateId,
          direction,
          currentUserId || 'user-test1'
        );

        if (direction === 'right') {
          if (res?.isMatch) {
            setMatchedCandidateModal(target);
            await refreshData(currentUserId, false, true);
          } else {
            showToast(`Đã thả tim làm quen với ${target.ownerName}!`);
          }
        }
      } catch (err: any) {
        console.warn('[Pawty Tinder] Lỗi lưu lượt quẹt thẻ:', err);
        showToast(err?.message || 'Không thể ghi nhận lượt quẹt thẻ.');
      }
    },
    [tinderCandidates, likesYouCandidates, currentUserId, refreshData, showToast, reloadTinderDeck]
  );

  const likeBackCandidate = useCallback(
    async (candidate: TinderCandidate) => {
      setShowLikesYouDrawer(false);
      await swipeTinderCandidate(candidate.id, 'right');
    },
    [swipeTinderCandidate]
  );

  const passLikesYouCandidate = useCallback(
    async (candidate: TinderCandidate) => {
      await swipeTinderCandidate(candidate.id, 'left');
      showToast(`Đã bỏ qua ${candidate.ownerName}.`);
    },
    [swipeTinderCandidate, showToast]
  );

  const rewindLastSwipe = useCallback(async () => {
    if (swipedCandidateHistory.length === 0) {
      showToast('Chưa có lượt quẹt nào trước đó để hoàn tác.');
      return;
    }

    const lastCandidate = swipedCandidateHistory[swipedCandidateHistory.length - 1];
    setSwipedCandidateHistory((prev) => prev.slice(0, -1));
    setTinderCandidates((prev) => [
      lastCandidate,
      ...prev.filter((c) => c.id !== lastCandidate.id),
    ]);

    try {
      await apiClient.rewindSwipe(lastCandidate.id, currentUserId || 'user-test1');
      showToast(`Đã khôi phục thẻ của ${lastCandidate.ownerName}`);
    } catch (err) {
      console.warn('[Pawty Rewind] Lỗi hoàn tác quẹt thẻ:', err);
    }
  }, [swipedCandidateHistory, currentUserId, showToast]);

  const setPassportArea = useCallback(
    (area: string) => {
      setActivePassportArea(area);
      showToast(`Đang khám phá khu vực: ${area}`);
    },
    [showToast]
  );

  const cyclePassportArea = useCallback(() => {
    const areas = [
      'Mọi khoảng cách',
      'Vinhomes Grand Park, TP. Thủ Đức',
      'Thảo Điền, TP. Thủ Đức (Quận 2)',
      'Phú Mỹ Hưng, Quận 7',
      'Vinhomes Ocean Park, Hà Nội',
    ];
    setActivePassportArea((prev) => {
      const next = areas[(areas.indexOf(prev) + 1) % areas.length];
      showToast(`Đã chuyển vị trí sang: ${next}`);
      return next;
    });
  }, [showToast]);

  const closeMatchedCandidateModal = useCallback(() => {
    setMatchedCandidateModal(null);
  }, []);

  const openChatWithMatchedCandidate = useCallback(
    async (candidate: TinderCandidate) => {
      setMatchedCandidateModal(null);
      await startDirectChatWithUser(candidate.ownerHandle, 'dating');
    },
    [startDirectChatWithUser]
  );

  // =========================================================================
  // CHAT MESSAGES & CLEAR CONVERSATION (PostgreSQL)
  // =========================================================================
  const sendChatMessage = useCallback(
    async (chatId: string, text: string) => {
      const clean = text.trim();
      if (!clean || !currentUserId) return;

      const room = chats.find((r) => r.id === chatId);
      if (room && room.canMessage === false) {
        showToast('Hai bạn đã hủy kết bạn nên không thể tiếp tục nhắn tin cho nhau.');
        return;
      }

      const now = new Date();
      const timeStr = `${String(now.getHours()).padStart(2, '0')}:${String(
        now.getMinutes()
      ).padStart(2, '0')}`;
      const tempId = `temp-msg-${Date.now()}`;

      setChats((prev) =>
        prev.map((r) =>
          r.id === chatId
            ? {
                ...r,
                messages: [
                  ...r.messages,
                  { id: tempId, sender: 'me', text: clean, time: timeStr, isRead: false },
                ],
              }
            : r
        )
      );

      try {
        const res = await apiClient.sendChatMessage(chatId, clean, undefined, currentUserId);
        if (res?.message) {
          setChats((prev) =>
            prev.map((r) =>
              r.id === chatId
                ? {
                    ...r,
                    messages: r.messages.map((m) =>
                      m.id === tempId
                        ? {
                            id: res.message.id,
                            sender: 'me',
                            text: res.message.text || clean,
                            time: res.message.time || timeStr,
                            isRead: false,
                          }
                        : m
                    ),
                  }
                : r
            )
          );
        }
      } catch (err: any) {
        // Rollback tin nhắn tạm khi bị chặn do hủy kết bạn (HTTP 403) hoặc lỗi mạng
        setChats((prev) =>
          prev.map((r) =>
            r.id === chatId
              ? {
                  ...r,
                  canMessage:
                    err instanceof ApiRequestError && err.status === 403
                      ? false
                      : r.canMessage,
                  messages: r.messages.filter((m) => m.id !== tempId),
                }
              : r
          )
        );
        showToast(err?.message || 'Không thể gửi tin nhắn.');
      }
    },
    [chats, currentUserId, showToast]
  );

  const clearChatMessages = useCallback(
    async (chatId: string) => {
      if (!chatId || !currentUserId) return;
      try {
        await apiClient.clearChatMessages(chatId, currentUserId);
        setChats((prev) =>
          prev.map((room) => (room.id === chatId ? { ...room, messages: [] } : room))
        );
        showToast('Đã xóa toàn bộ tin nhắn trong cuộc trò chuyện.');
      } catch (err: any) {
        showToast(err?.message || 'Không thể xóa tin nhắn.');
      }
    },
    [currentUserId, showToast]
  );

  // =========================================================================
  // SOS ALERTS (100% FREE)
  // =========================================================================
  const createSosAlert = useCallback(
    async (params: {
      petName: string;
      species: 'Chó' | 'Mèo' | 'Khác';
      customSpecies?: string;
      breed: string;
      lastSeenLocation: string;
      rewardAmount: string;
      contactPhone?: string;
      description: string;
      imageUrl?: string;
    }): Promise<boolean> => {
      if (!currentUserId) {
        showToast('Vui lòng đăng nhập để đăng tin SOS khẩn cấp.');
        return false;
      }

      try {
        await apiClient.createSosAlert({
          userId: currentUserId,
          petName: params.petName.trim(),
          species: params.species,
          customSpecies: params.customSpecies,
          breed: params.breed,
          lastSeenLocation: params.lastSeenLocation,
          rewardText: params.rewardAmount || 'Gia đình xin hậu tạ',
          ownerPhone: params.contactPhone || ownerPhone,
          ownerName,
          description: params.description,
          imageUrl: params.imageUrl,
          radiusKm: 3,
        });

        await refreshData(currentUserId, false, true);
        showToast('Đã phát tín hiệu SOS khẩn cấp miễn phí tới cộng đồng!');
        return true;
      } catch (err: any) {
        console.warn('[Pawty SOS] Lỗi đăng tin SOS:', err);
        showToast(err?.message || 'Không thể phát tin SOS. Vui lòng thử lại.');
        return false;
      }
    },
    [currentUserId, ownerPhone, ownerName, refreshData, showToast]
  );

  const reportSosSighting = useCallback(
    async (
      sosId: string,
      locationText: string,
      noteText?: string,
      reporterPhone?: string
    ) => {
      const cleanLoc = locationText.trim();
      if (!cleanLoc) return;

      const combinedNote = noteText?.trim()
        ? `${cleanLoc} — ${noteText.trim()}`
        : cleanLoc;

      try {
        await apiClient.reportSosSighting(sosId, {
          reporterName: ownerName || 'Cư dân hỗ trợ',
          phone: reporterPhone || ownerPhone,
          note: combinedNote,
          reporterId: currentUserId || undefined,
        });
        await refreshData(currentUserId, false, true);
        showToast('Cảm ơn bạn! Manh mối nhìn thấy đã được gửi ngay tới chủ nuôi.');
      } catch (err: any) {
        showToast(err?.message || 'Không thể gửi báo tin nhìn thấy.');
      }
    },
    [ownerName, ownerPhone, currentUserId, refreshData, showToast]
  );

  const confirmSosPetFound = useCallback(
    async (sosId: string) => {
      try {
        await apiClient.markSosFound(sosId);
        setSosAlerts((prev) =>
          prev.map((a) => (a.id === sosId ? { ...a, status: 'found', priorityScore: 10 } : a))
        );
        showToast('Chúc mừng gia đình đã tìm thấy bé an toàn!');
      } catch (err: any) {
        showToast(err?.message || 'Không thể cập nhật trạng thái SOS.');
      }
    },
    [showToast]
  );

  // =========================================================================
  // NOTIFICATIONS MANAGEMENT (PostgreSQL)
  // =========================================================================
  const markNotificationRead = useCallback(async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    try {
      await apiClient.markNotificationRead(id);
    } catch (err) {
      console.warn('[Pawty Notifications] Lỗi đánh dấu đã đọc:', err);
    }
  }, []);

  const markAllNotificationsRead = useCallback(async () => {
    if (!currentUserId) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await apiClient.markAllNotificationsRead(currentUserId);
      showToast('Đã đánh dấu đọc tất cả thông báo.');
    } catch (err) {
      console.warn('[Pawty Notifications] Lỗi đọc tất cả:', err);
    }
  }, [currentUserId, showToast]);

  const deleteNotification = useCallback(async (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    try {
      await apiClient.deleteNotification(id);
    } catch (err) {
      console.warn('[Pawty Notifications] Lỗi xóa thông báo:', err);
    }
  }, []);

  const clearAllNotifications = useCallback(async () => {
    if (!currentUserId) return;
    setNotifications([]);
    try {
      await apiClient.clearAllNotifications(currentUserId);
      showToast('Đã xóa toàn bộ danh sách thông báo.');
    } catch (err) {
      console.warn('[Pawty Notifications] Lỗi xóa toàn bộ thông báo:', err);
    }
  }, [currentUserId, showToast]);

  // =========================================================================
  // FILTERED TINDER CANDIDATES (Purpose + Unlimited Distance)
  // =========================================================================
  const activePet = pets.find((p) => p.id === activePetId) || pets[0] || EMPTY_PET_PLACEHOLDER;
  const unreadNotificationCount = notifications.filter((n) => !n.isRead).length;
  const theme = THEME_PALETTES[themeId];

  const filteredTinderCandidates = tinderCandidates.filter((c) => {
    const passDistance =
      tinderDistanceLimit === 'all' ? true : c.distanceKm <= tinderDistanceLimit;
    const candidateIntent = resolveTinderIntentFromLabel(c.intent || c.lookingFor);
    const passGoal =
      tinderFilterGoal === 'all' ? true : candidateIntent === tinderFilterGoal;
    const passGender =
      tinderGenderFilter === 'all'
        ? true
        : tinderGenderFilter === 'female'
        ? (c.gender === 'Nữ' || (c.gender as any) === 'female' || (c.gender as any) === 'nu')
        : (c.gender === 'Nam' || (c.gender as any) === 'male' || (c.gender as any) === 'nam');
    return passDistance && passGoal && passGender;
  });

  return (
    <MobilePawtyContext.Provider
      value={{
        isAuthLoaded,
        isAuthenticated,
        hasSavedSession,
        savedSessionIdentifier,
        bootAuthError,
        activeDeviceSessionId,
        activeDeviceName,
        currentUserId,
        ownerName,
        ownerHandle,
        ownerAvatar,
        setOwnerHandle,
        ownerNickname,
        ownerPhone,
        ownerBio,
        ownerArea,
        ownerGender,
        ownerAge,
        ownerBirthDate,
        ownerZodiac,
        ownerMbti,
        ownerEducation,
        ownerMajor,
        ownerOccupation,
        ownerFollowersCount,
        ownerFollowingCount,
        ownerCoverUrl,
        setOwnerCoverUrl,
        ownerAvatarUrl,
        setOwnerAvatarUrl,
        ownerNoteBubble,
        setOwnerNoteBubble,
        isPrivateProfile,
        ownerPrivacySettings,
        updateOwnerProfile,
        togglePrivateProfile,
        updateOwnerAndPetProfile,
        loginOrRegister,
        logoutUser,
        forceRevokeOtherDevices,
        pets,
        activePetId,
        activePet,
        setActivePetId,
        addNewPetProfile,
        updatePetProfile,
        deletePetProfile,
        togglePetLike,
        togglePetVaccinationAndRabies,
        userTinderSetup,
        updateUserTinderSetup,
        suggestedPeople,
        toggleFollowSuggestedPerson,
        dismissSuggestedPerson,
        themeId,
        theme,
        setThemeId,
        activeTab,
        setActiveTab,
        isLoadingData,
        refreshData,
        pullToRefreshExplore,
        activeModal,
        setActiveModal,
        handleHardwareBack,
        posts,
        searchHistory,
        trendingSuggestions,
        isSearchPanelOpen,
        setIsSearchPanelOpen,
        recordSearchQuery,
        removeSearchHistoryItem,
        clearSearchHistory,
        toggleReaction,
        toggleSavePost,
        sharePost,
        addComment,
        toggleCommentLike,
        addCommentReply,
        createPost,
        deletePost,
        lightboxMedia,
        openLightboxMedia,
        closeLightboxMedia,
        publicProfiles,
        viewedUserHandle,
        selectedProfileHandle,
        setSelectedProfileHandle,
        openUserProfileInTab,
        openPublicUserProfile,
        closePublicUserProfile,
        goBackFromOtherProfile,
        resolvePublicProfile,
        toggleFriendStatus,
        sendFriendRequest,
        acceptFriendRequest,
        declineFriendRequest,
        unfriendUser,
        unmatchCandidate,
        toggleFollowUser,
        startDirectChatWithUser,
        tinderIntent,
        setTinderIntent,
        tinderFilterGoal,
        setTinderFilterGoal,
        tinderGenderFilter,
        setTinderGenderFilter,
        setPassportArea,
        tinderCandidates: filteredTinderCandidates,
        likesYouCandidates,
        swipedCandidateHistory,
        canRewind: swipedCandidateHistory.length > 0,
        matchedCandidateModal,
        closeMatchedCandidateModal,
        swipeTinderCandidate,
        reloadTinderDeck,
        likeBackCandidate,
        passLikesYouCandidate,
        rewindLastSwipe,
        openChatWithMatchedCandidate,
        showLikesYouDrawer,
        setShowLikesYouDrawer,
        tinderDistanceLimit,
        setTinderDistanceLimit,
        activePassportArea,
        cyclePassportArea,
        chats,
        activeChatId,
        setActiveChatId,
        sendChatMessage,
        clearChatMessages,
        markChatRead,
        sosAlerts,
        createSosAlert,
        createSosAlertWithFee: createSosAlert,
        reportSosSighting,
        confirmSosPetFound,
        notifications,
        unreadNotificationCount,
        markNotificationRead,
        markAllNotificationsRead,
        deleteNotification,
        clearAllNotifications,
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
