import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AnalyticsEventRecord,
  CareHandoverNote,
  CareTask,
  CareTaskCategory,
  ChatMessage,
  CircleActivityItem,
  CircleMember,
  CircleRole,
  CommunityGroup,
  ContentReport,
  Conversation,
  MatchRecord,
  NorthStarDashboardMetrics,
  PetFriendlyPlace,
  PetProfile,
  PostContentType,
  PostVisibility,
  PrimaryNeed,
  RadarCandidate,
  ReactionType,
  SocialPost,
  SosAlert,
  UserProfile,
  WalkAppointment,
} from "@pawty/types";
import { classifyPetSizeByWeight } from "@pawty/utils";
import { moderatePetContent } from "@pawty/validators";
import {
  EMPTY_WEB_PET,
  type AppNotificationItem,
  type SearchableUserTag,
  type WebThemeId,
} from "../config/themes";

const API_BASE =
  ((import.meta as unknown as { env?: Record<string, string> }).env
    ?.VITE_API_URL as string) || "http://localhost:3000/api";

let currentWebAuthToken: string | null = null;

export function setWebAuthToken(token: string | null) {
  currentWebAuthToken = token;
}

export function getWebAuthToken(): string | null {
  return currentWebAuthToken;
}

async function requestBackendApi(path: string, options?: RequestInit): Promise<any> {
  let response: Response;
  const token = currentWebAuthToken;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...(options?.headers || {}),
      },
      ...options,
    });
  } catch {
    throw new Error(
      "Không thể kết nối tới máy chủ hoặc Cơ sở dữ liệu PostgreSQL. Vui lòng bật Backend & PostgreSQL Server."
    );
  }

  let data: any = null;
  try {
    data = await response.json();
  } catch {
    throw new Error(
      "Phản hồi không hợp lệ từ máy chủ. Vui lòng kiểm tra kết nối cơ sở dữ liệu PostgreSQL."
    );
  }

  if (!response.ok || data?.success === false) {
    throw new Error(
      data?.error ||
        data?.message ||
        "Không thể xác thực hoặc truy vấn cơ sở dữ liệu PostgreSQL."
    );
  }

  return data;
}

const EMPTY_USER: UserProfile = {
  id: "",
  phone: "",
  displayName: "",
  username: "",
  avatarUrl: "",
  bio: "",
  district: "",
  neighborhood: "",
  location: { lat: 10.8412, lng: 106.8295 },
  isVip: true,
  vipPlan: "free",
  role: "user",
  status: "active",
  primaryNeeds: [],
  noShowCount: 0,
  dailySwipeCount: 0,
  privacy: {
    showLocation: true,
    showPhone: false,
    allowMessages: "circle_and_matches",
    consents: {
      dataCollection: true,
      location: true,
      notifications: true,
      marketing: false,
      updatedAt: "",
    },
  },
  createdAt: "",
};

const EMPTY_HANDOVER_NOTE: CareHandoverNote = {
  id: "",
  householdId: "",
  petId: "",
  createdBy: "",
  caretakerName: "",
  startDate: "",
  endDate: "",
  feedingInstructions: "",
  medicationInstructions: "",
  emergencyVetContact: "",
  checklist: [],
  isActive: false,
};

const EMPTY_METRICS: NorthStarDashboardMetrics = {
  activeHouseholdsMonthly: 0,
  northStarQualifiedHouseholds: 0,
  mrrVnd: 0,
  bookingCommissionRevenueVnd: 0,
  vipSubscriptionRevenueVnd: 0,
  nativeAdsRevenueVnd: 0,
  sosRevenueVnd: 0,
  onboardingCompletionRate: 0,
  activationRate7d: 0,
  circleInviteRate14d: 0,
  d1Retention: 0,
  d7Retention: 0,
  d28Retention: 0,
  w4ActiveRate: 0,
  bookingCompletionRate: 0,
  avgPartnerRating: 0,
  avgOpsMinutesPerBooking: 0,
  moderationFlagRate: 0,
};

export type BottomTabId = "explore" | "tinder" | "chat" | "profile";
export type ExploreSubTabId =
  | "feed"
  | "discover"
  | "groups"
  | "places"
  | "qa"
  | "radar";
export type ActiveModalType =
  | null
  | "create_sheet"
  | "new_moment"
  | "new_question"
  | "new_task"
  | "invite_circle"
  | "handover_note"
  | "walk_scheduler"
  | "vip_upgrade"
  | "sos_alert"
  | "privacy_center"
  | "public_pet_profile"
  | "add_pet_wizard"
  | "kiosk_lock"
  | "notifications"
  | "edit_profile"
  | "settings";

interface ToastBanner {
  id: string;
  title: string;
  message: string;
  tone: "success" | "warning" | "danger" | "info";
}

interface PawtyAppState {
  // Navigation & Viewport
  hasCompletedOnboarding: boolean;
  hasSavedSession: boolean;
  savedSessionUserId: string;
  authToken: string | null;
  bootAuthError: string | null;
  setAuthToken: (token: string | null) => void;
  themeId: WebThemeId;
  activeTab: BottomTabId;
  exploreSubTab: ExploreSubTabId;
  activeModal: ActiveModalType;
  selectedPublicPet: PetProfile | null;
  activeConversationId: string | null;
  desktopFrameMode: "iphone" | "pro_portal";
  toast: ToastBanner | null;

  // Core Entities (100% Database-Driven)
  user: UserProfile;
  pets: PetProfile[];
  activePetId: string;
  circleMembers: CircleMember[];
  careTasks: CareTask[];
  circleActivities: CircleActivityItem[];
  handoverNote: CareHandoverNote;
  posts: SocialPost[];
  groups: CommunityGroup[];
  places: PetFriendlyPlace[];
  radarCandidates: RadarCandidate[];
  matches: MatchRecord[];
  latestMatchCelebration: MatchRecord | null;
  conversations: Conversation[];
  messagesByConversation: Record<string, ChatMessage[]>;
  sosAlerts: SosAlert[];
  reports: ContentReport[];
  analyticsEvents: AnalyticsEventRecord[];
  metrics: NorthStarDashboardMetrics;
  notifications: AppNotificationItem[];
  searchableUsers: SearchableUserTag[];

  // Actions
  setThemeId: (themeId: WebThemeId) => void;
  setActiveTab: (tab: BottomTabId) => void;
  setExploreSubTab: (subTab: ExploreSubTabId) => void;
  setActiveModal: (modal: ActiveModalType) => void;
  openPublicPetProfile: (pet: PetProfile) => void;
  setActiveConversationId: (conversationId: string | null) => void;
  setDesktopFrameMode: (mode: "iphone" | "pro_portal") => void;
  showToast: (
    title: string,
    message: string,
    tone?: ToastBanner["tone"]
  ) => void;
  clearToast: () => void;
  hydrateFromServer: (userId?: string, throwOnError?: boolean) => Promise<void>;
  verifySavedSessionOnBoot: () => Promise<void>;
  trackEvent: (
    eventType: string,
    eventData?: Record<string, string | number | boolean>
  ) => void;

  // Onboarding & Pet Actions
  completeOnboardingWizard: (payload: {
    phone: string;
    username?: string;
    password?: string;
    displayName: string;
    district: string;
    neighborhood: string;
    petName: string;
    species: "dog" | "cat";
    breed: string;
    gender: "male" | "female";
    weightKg: number;
    vaccinationStatus: "full" | "partial" | "none";
    isNeutered: boolean;
    allergies: string;
    energyLevel: "low" | "medium" | "high";
    personalities: string[];
    goodHabits: string[];
    cautions: string[];
    primaryNeeds: PrimaryNeed[];
  }) => Promise<void>;
  restartOnboardingDemo: () => void;
  loginWithSavedSession: () => Promise<void>;
  loginWithPhone: (phone: string) => Promise<void>;
  loginWithCredentials: (
    identifier: string,
    password?: string
  ) => Promise<void>;
  logoutSession: () => void;
  setActivePetId: (petId: string) => void;
  updateOwnerAndPetProfile: (payload: {
    ownerName: string;
    ownerBio: string;
    neighborhood: string;
    petId: string;
    petName: string;
    species: "dog" | "cat";
    breed: string;
    weightKg: number;
    ageDisplay: string;
  }) => void;
  addNewPetObject: (payload: {
    name: string;
    species: "dog" | "cat";
    breed: string;
    weightKg: number;
    ageDisplay: string;
  }) => void;
  sendCareInviteByTag: (userTag: string, petId: string) => void;
  respondToCareInvite: (notificationId: string, accept: boolean) => void;
  markAllNotificationsRead: () => void;
  startChatWithUserTag: (userTag: string) => void;
  addVaccinationRecord: (
    petId: string,
    vaccineName: string,
    dateGiven: string,
    vetName: string
  ) => void;
  addPetBehaviorChip: (
    petId: string,
    category: "good_habit" | "caution",
    label: string
  ) => void;

  // Layer 1 & 2: Care & Circle Actions
  toggleCareTaskComplete: (
    taskId: string,
    note?: string,
    photoUrl?: string
  ) => void;
  createCareTask: (payload: {
    petId: string;
    title: string;
    description: string;
    category: CareTaskCategory;
    assignedTo: string;
    dueDate: string;
    dueTime: string;
    isRecurring: boolean;
  }) => void;
  inviteCircleMember: (
    displayName: string,
    relationLabel: string,
    role: CircleRole
  ) => void;
  revokeCircleMember: (memberId: string) => void;
  toggleHandoverChecklistItem: (itemId: string) => void;

  // Layer 3: Social & Community Actions
  createSocialPost: (payload: {
    contentType: PostContentType;
    textContent: string;
    imageUrl?: string;
    hashtags: string[];
    visibility: PostVisibility;
  }) => { ok: boolean; error?: string };
  reactToPost: (postId: string, reaction: ReactionType) => void;
  addCommentToPost: (postId: string, textContent: string) => void;
  toggleBookmarkPost: (postId: string, folderName?: string) => void;
  toggleJoinGroup: (groupId: string) => void;

  // Radar, Matching & Walk Appointment Actions
  swipeRadarCandidate: (
    candidateId: string,
    direction: "left" | "right"
  ) => void;
  dismissMatchCelebration: () => void;
  createWalkAppointment: (payload: {
    conversationId: string;
    partnerName: string;
    scheduledDate: string;
    scheduledTime: string;
    locationName: string;
    locationAddress: string;
    distanceFromMidpointMeters: number;
    note: string;
  }) => void;

  // Messaging Actions
  sendChatMessage: (
    conversationId: string,
    textContent: string,
    messageType?: ChatMessage["messageType"],
    extra?: { mediaUrl?: string; voiceDurationSec?: number }
  ) => void;

  // Monetization, SOS, Privacy & Moderation
  upgradeToVipPlan: (plan: "basic" | "sen_vip" | "sen_vip_yearly") => void;
  activateSosAlert: (payload: {
    petId: string;
    lastSeenLocation: string;
    description: string;
    rewardText: string;
  }) => void;
  reportSosSighting: (
    alertId: string,
    reporterName: string,
    locationName: string,
    note: string
  ) => void;
  markSosFound: (alertId: string) => void;
  confirmSosMatchDecision: (
    alertId: string,
    matchId: string,
    decision: "verified" | "dismissed"
  ) => void;
  submitContentReport: (
    targetType: ContentReport["targetType"],
    targetId: string,
    targetPreview: string,
    reason: ContentReport["reason"],
    description: string
  ) => void;
  resolveContentReport: (reportId: string, actionTaken: string) => void;
  updatePrivacySettings: (partial: Partial<UserProfile["privacy"]>) => void;
  resetAllDemoData: () => void;
}

function mapDbPetToWebPet(raw: any): PetProfile {
  const species =
    raw.species === "cat" || raw.species === "Mèo" ? "cat" : "dog";
  const weightKg = Number(raw.weightKg || 5);
  return {
    id: raw.id,
    householdId: raw.householdId || "",
    ownerId: raw.ownerId || "",
    name: raw.name || "Thú cưng",
    species,
    breed: raw.breed || "Chưa rõ",
    gender: raw.gender === "female" ? "female" : "male",
    dateOfBirth: raw.dateOfBirth
      ? new Date(raw.dateOfBirth).toISOString().split("T")[0]
      : "",
    ageDisplay: raw.ageDisplay || "2 tuổi",
    weightKg,
    sizeCategory: classifyPetSizeByWeight(weightKg),
    energyLevel:
      raw.energyLevel === "high" || raw.energyLevel === "low"
        ? raw.energyLevel
        : "medium",
    avatarUrl: raw.avatarUrl || "/assets/pawty-icon.png",
    coverPhotoUrl: raw.coverUrl || raw.avatarUrl || "/assets/pawty-logo-full.png",
    isNeutered: Boolean(raw.isNeutered),
    allergies: raw.allergies || "Không có",
    medicalNotes: raw.medicalNotes || "",
    vetName: raw.vetName || "",
    vetContact: raw.vetContact || "",
    vaccinationStatus:
      raw.vaccinationStatus === "verified" || raw.vaccinationStatus === "full"
        ? "full"
        : raw.vaccinationStatus === "partial"
        ? "partial"
        : "none",
    lastVaccineDate: raw.vaccinations?.[0]?.dateGiven
      ? new Date(raw.vaccinations[0].dateGiven).toISOString().split("T")[0]
      : undefined,
    isPublic: true,
    followerCount: Number(raw.likesCount || 0),
    behaviors: Array.isArray(raw.behaviors)
      ? raw.behaviors.map((b: any) => ({
          id: b.id,
          petId: raw.id,
          category:
            b.category === "caution"
              ? "caution"
              : b.category === "personality"
              ? "personality"
              : "good_habit",
          label: b.label,
          description: b.description || undefined,
        }))
      : [],
    vaccinations: Array.isArray(raw.vaccinations)
      ? raw.vaccinations.map((v: any) => ({
          id: v.id,
          petId: raw.id,
          vaccineName: v.vaccineName,
          dateGiven: v.dateGiven
            ? new Date(v.dateGiven).toISOString().split("T")[0]
            : "",
          nextDueDate: v.nextDueDate
            ? new Date(v.nextDueDate).toISOString().split("T")[0]
            : undefined,
          vetName: v.clinicName || v.vetName || "",
          verified: Boolean(v.isVerified ?? v.verified ?? true),
        }))
      : [],
    weightHistory: [],
  };
}

export const usePawtyStore = create<PawtyAppState>()(
  persist(
    (set, get) => ({
      hasCompletedOnboarding: false,
      hasSavedSession: false,
      savedSessionUserId: "",
      authToken: null,
      bootAuthError: null,
      setAuthToken: (token: string | null) => {
        setWebAuthToken(token);
        set({ authToken: token });
      },
      themeId: "coral",
      activeTab: "explore",
      exploreSubTab: "feed",
      activeModal: null,
      selectedPublicPet: null,
      activeConversationId: null,
      desktopFrameMode: "iphone",
      toast: null,

      user: EMPTY_USER,
      pets: [],
      activePetId: "",
      circleMembers: [],
      careTasks: [],
      circleActivities: [],
      handoverNote: EMPTY_HANDOVER_NOTE,
      posts: [],
      groups: [],
      places: [],
      radarCandidates: [],
      matches: [],
      latestMatchCelebration: null,
      conversations: [],
      messagesByConversation: {},
      sosAlerts: [],
      reports: [],
      analyticsEvents: [],
      metrics: EMPTY_METRICS,
      notifications: [],
      searchableUsers: [],

      setThemeId: (themeId) => {
        set({ themeId });
        get().showToast(
          "Đã đổi giao diện",
          "Màu sắc ứng dụng đã được cập nhật."
        );
      },
      setActiveTab: (tab) =>
        set({ activeTab: tab, activeConversationId: null }),
      setExploreSubTab: (subTab) => set({ exploreSubTab: subTab }),
      setActiveModal: (modal) => set({ activeModal: modal }),
      openPublicPetProfile: (pet) =>
        set({ selectedPublicPet: pet, activeModal: "public_pet_profile" }),
      setActiveConversationId: (conversationId) =>
        set({ activeConversationId: conversationId }),
      setDesktopFrameMode: (mode) => set({ desktopFrameMode: mode }),

      showToast: (title, message, tone = "success") => {
        const id = `toast-${Date.now()}`;
        set({ toast: { id, title, message, tone } });
        setTimeout(() => {
          if (get().toast?.id === id) {
            set({ toast: null });
          }
        }, 3800);
      },
      clearToast: () => set({ toast: null }),

      verifySavedSessionOnBoot: async () => {
        try {
          localStorage.removeItem("pawty-super-app-storage-v2");
        } catch {
          // Ignore storage cleanup failure in restricted contexts
        }

        const { savedSessionUserId, hasSavedSession, authToken } = get();
        if (!hasSavedSession || !savedSessionUserId) {
          return;
        }

        // Nếu thiết bị cũ chỉ lưu userId hoặc token demo -> yêu cầu đăng nhập lại
        if (!authToken || authToken === 'jwt-pawty-access-token') {
          setWebAuthToken(null);
          set({
            hasCompletedOnboarding: false,
            hasSavedSession: false,
            savedSessionUserId: "",
            authToken: null,
            bootAuthError: "Phiên đăng nhập cũ đã hết hiệu lực. Vui lòng đăng nhập lại.",
          });
          return;
        }

        setWebAuthToken(authToken);

        try {
          await get().hydrateFromServer(savedSessionUserId, true);
          set({
            hasCompletedOnboarding: true,
            hasSavedSession: true,
            bootAuthError: null,
          });
        } catch (err: any) {
          const errMsg = String(err?.message || '');
          const isNetworkError =
            errMsg.includes("Không thể kết nối") ||
            errMsg.includes("Failed to fetch") ||
            errMsg.includes("NetworkError");

          if (!isNetworkError) {
            setWebAuthToken(null);
            set({
              hasCompletedOnboarding: false,
              hasSavedSession: false,
              savedSessionUserId: "",
              authToken: null,
              bootAuthError: errMsg || "Phiên đăng nhập không hợp lệ.",
            });
          } else {
            // Lỗi mạng tạm thời không được làm mất phiên hợp lệ
            set({
              bootAuthError: errMsg,
            });
          }
        }
      },

      hydrateFromServer: async (userId?: string, throwOnError = false) => {
        const targetId = userId || get().user.id || get().savedSessionUserId;
        if (!targetId) {
          if (throwOnError) {
            throw new Error("Chưa xác định tài khoản đăng nhập.");
          }
          return;
        }

        try {
          const data = await requestBackendApi(
            `/bootstrap?userId=${encodeURIComponent(targetId)}`
          );

          if (!data?.user) {
            throw new Error(
              "Tài khoản không tồn tại trong cơ sở dữ liệu PostgreSQL."
            );
          }

          const rawUser = data.user;
          const mappedUser: UserProfile = {
            ...EMPTY_USER,
            id: rawUser.id,
            phone: rawUser.phone || "",
            displayName: rawUser.displayName || "",
            username:
              rawUser.username ||
              (rawUser.displayName || "user").toLowerCase().replace(/\s+/g, "_"),
            avatarUrl: rawUser.avatarUrl || "/assets/pawty-icon.png",
            bio: rawUser.bio || "",
            district: rawUser.district || "",
            neighborhood: rawUser.neighborhood || "",
            location: {
              lat: Number(rawUser.lat || 10.8412),
              lng: Number(rawUser.lng || 106.8295),
            },
            isVip: Boolean(rawUser.isVip),
            vipPlan: rawUser.vipPlan || (rawUser.isVip ? "sen_vip" : "free"),
            role:
              rawUser.role === "admin" ||
              rawUser.role === "moderator" ||
              rawUser.role === "partner"
                ? rawUser.role
                : "user",
            isExpert: rawUser.role === "expert",
            createdAt: rawUser.createdAt
              ? new Date(rawUser.createdAt).toISOString()
              : "",
          };

          const mappedPets: PetProfile[] = Array.isArray(data.pets)
            ? data.pets.map(mapDbPetToWebPet)
            : [];

          const mappedWebPosts: SocialPost[] = Array.isArray(data.posts)
            ? data.posts.map((p: any) => {
                const pawCount = Number(p.pawCount || 0);
                const mappedComments = Array.isArray(p.comments)
                  ? p.comments.map((c: any) => ({
                      id: c.id,
                      postId: p.id,
                      authorId: c.authorId || c.author?.id || "",
                      authorName: c.author?.displayName || "Cư dân Pawty",
                      authorAvatar:
                        c.author?.avatarUrl || "/assets/pawty-icon.png",
                      textContent: c.textContent || "",
                      mentions: [],
                      isExpert: c.author?.role === "expert",
                      hasHealthDisclaimer: false,
                      reactions: { paw: Number(c.likesCount || 0), helpful: 0 },
                      createdAt: c.createdAt
                        ? new Date(c.createdAt).toLocaleDateString("vi-VN")
                        : "Vừa xong",
                    }))
                  : [];

                return {
                  id: p.id,
                  authorId: p.authorId || p.author?.id || "",
                  authorName: p.author?.displayName || "Cư dân Pawty",
                  authorUsername:
                    p.author?.username ||
                    (p.author?.displayName || "user")
                      .toLowerCase()
                      .replace(/\s+/g, "_"),
                  authorAvatar:
                    p.author?.avatarUrl || "/assets/pawty-icon.png",
                  authorIsVip: Boolean(p.author?.isVip),
                  petIds: mappedPets[0]?.id ? [mappedPets[0].id] : [],
                  petName: p.petName || mappedPets[0]?.name || "Thú cưng",
                  petBreed: p.petBreed || mappedPets[0]?.breed || "",
                  petAvatar:
                    p.author?.avatarUrl ||
                    mappedPets[0]?.avatarUrl ||
                    "/assets/pawty-icon.png",
                  contentType: p.contentType || "moment",
                  textContent: p.textContent || "",
                  media: Array.isArray(p.media)
                    ? p.media.map((m: any) =>
                        typeof m === "string"
                          ? { type: "image" as const, url: m, aspectRatio: "4:5" as const }
                          : {
                              type: (m.type === "video" ? "video" : "image") as "image" | "video",
                              url: m.url,
                              aspectRatio: "4:5" as const,
                            }
                      )
                    : [],
                  hashtags: Array.isArray(p.hashtags) ? p.hashtags : [],
                  location: {
                    name: p.locationName || mappedUser.neighborhood || "Pawty",
                    approximate: true,
                  },
                  speciesTags: ["dog"],
                  breedTags: [],
                  topicTags: [],
                  visibility: "public",
                  isExpertContent: p.author?.role === "expert",
                  expertVerified: p.author?.role === "expert",
                  hasHealthDisclaimer: false,
                  isSponsored: Boolean(p.isSponsored),
                  engagement: {
                    pawCount,
                    commentCount: Number(
                      p.commentCount ?? mappedComments.length
                    ),
                    shareCount: Number(p.shareCount || 0),
                    saveCount: Number(p.saveCount || 0),
                    reactionBreakdown: {
                      paw: pawCount,
                      heart_eyes: 0,
                      laughing: 0,
                      worried: 0,
                      helpful: 0,
                    },
                  },
                  userReaction: null,
                  isBookmarked: false,
                  moderationStatus: "approved",
                  createdAt: p.createdAt
                    ? new Date(p.createdAt).toLocaleDateString("vi-VN")
                    : "Vừa xong",
                  comments: mappedComments,
                };
              })
            : [];

          const mappedCandidates: RadarCandidate[] = Array.isArray(
            data.candidates
          )
            ? data.candidates.map((c: any) => ({
                id: c.id,
                userId: c.userId || c.id,
                ownerName: c.ownerName || "Cư dân Pawty",
                ownerAvatar: c.ownerAvatar || c.photoUrl || "/assets/pawty-icon.png",
                ownerIsVip: Boolean(c.isVip),
                neighborhood: c.neighborhood || c.area || "",
                distanceMeters: Math.round(Number(c.distanceKm || 1) * 1000),
                location: { lat: 10.842, lng: 106.828 },
                pet: {
                  ...EMPTY_WEB_PET,
                  id: c.petId || c.id,
                  ownerId: c.userId || c.id,
                  name: c.petName || "Thú cưng",
                  species: c.species === "Mèo" || c.species === "cat" ? "cat" : "dog",
                  breed: c.breed || "Chưa rõ",
                  ageDisplay: c.ageLabel || "2 tuổi",
                  weightKg: Number(c.weightKg || 8),
                  sizeCategory: classifyPetSizeByWeight(Number(c.weightKg || 8)),
                  avatarUrl: c.photoUrl || "/assets/pawty-icon.png",
                  coverPhotoUrl: c.photoUrl || "/assets/pawty-icon.png",
                  vaccinationStatus: c.isSafePet ? "full" : "partial",
                },
                compatibilityScore: Number(c.compatibilityPercent || 92),
                matchReason:
                  c.bio || "Cùng khu vực sinh sống và lịch dắt dạo phù hợp",
              }))
            : [];

          const mappedConversations: Conversation[] = [];
          const mappedMessagesByConv: Record<string, ChatMessage[]> = {};

          if (Array.isArray(data.chats)) {
            for (const ch of data.chats) {
              const msgs: ChatMessage[] = Array.isArray(ch.messages)
                ? ch.messages.map((m: any) => ({
                    id: m.id,
                    conversationId: ch.id,
                    senderId: m.sender === "me" ? mappedUser.id : ch.id,
                    senderName:
                      m.sender === "me"
                        ? mappedUser.displayName
                        : ch.partnerName,
                    senderAvatar:
                      m.sender === "me"
                        ? mappedUser.avatarUrl
                        : ch.partnerAvatar,
                    messageType: "text",
                    textContent: m.text || "",
                    isRead: Boolean(m.isRead),
                    createdAt: m.time || "Vừa xong",
                  }))
                : [];

              mappedMessagesByConv[ch.id] = msgs;
              mappedConversations.push({
                id: ch.id,
                type: "direct",
                title: ch.partnerName || "Bạn mới",
                subtitle: `${ch.partnerHandle || ""} · ${ch.petSummary || ""}`,
                avatarUrl: ch.partnerAvatar || "/assets/pawty-icon.png",
                partnerUserId: ch.id,
                partnerLocation: mappedUser.location,
                isOnline: Boolean(ch.isOnline),
                unreadCount: Number(ch.unreadCount || 0),
                lastMessageText:
                  msgs[msgs.length - 1]?.textContent ||
                  "Bắt đầu cuộc trò chuyện",
                lastMessageAt:
                  msgs[msgs.length - 1]?.createdAt || "Vừa xong",
              });
            }
          }

          const mappedSearchableUsers: SearchableUserTag[] = Array.isArray(
            data.suggestedPeople
          )
            ? data.suggestedPeople.map((sp: any) => ({
                id: sp.id,
                tag: sp.handle || `@${sp.id}`,
                displayName: sp.name || "Cư dân Pawty",
                avatarUrl: sp.avatarUrl || "/assets/pawty-icon.png",
                area: sp.mutualText || "",
                petsSummary: sp.petSummary || "",
              }))
            : [];

          const mappedTasks: CareTask[] = Array.isArray(data.tasks)
            ? data.tasks.map((t: any) => ({
                id: t.id,
                householdId: t.householdId || "",
                petId: t.petId || mappedPets[0]?.id || "",
                createdBy: t.createdBy || mappedUser.id,
                assignedTo: t.assignedTo || mappedUser.id,
                assignedToName: t.assignedToName || mappedUser.displayName,
                title: t.title || "",
                description: t.description || "",
                category: t.category || "feeding",
                isRecurring: Boolean(t.isRecurring),
                dueDate: t.dueDate || "",
                dueTime: t.dueTime || "08:00",
                status: t.status === "done" ? "done" : "pending",
                reminderEnabled: true,
              }))
            : [];

          const mappedCircle: CircleMember[] = Array.isArray(data.circleMembers)
            ? data.circleMembers.map((cm: any) => ({
                id: cm.id,
                householdId: cm.householdId || "",
                userId: cm.userId,
                displayName: cm.user?.displayName || cm.displayName || "Thành viên",
                avatarUrl: cm.user?.avatarUrl || "/assets/pawty-icon.png",
                relationLabel: cm.relationLabel || "Thành viên",
                role: cm.role || "caretaker",
                inviteCode: cm.inviteCode || "",
                status: cm.status || "active",
                joinedAt: cm.joinedAt
                  ? new Date(cm.joinedAt).toLocaleDateString("vi-VN")
                  : "Hôm nay",
              }))
            : [];

          const mappedNotifications: AppNotificationItem[] = Array.isArray(
            data.notifications
          )
            ? data.notifications.map((n: any) => ({
                id: n.id,
                type: "system",
                title: n.title || "Thông báo",
                body: n.body || "",
                createdAt: n.timeLabel || "Vừa xong",
                isRead: Boolean(n.isRead),
              }))
            : [];

          set({
            user: mappedUser,
            pets: mappedPets,
            activePetId: mappedPets[0]?.id || "",
            posts: mappedWebPosts,
            sosAlerts: Array.isArray(data.sosAlerts) ? data.sosAlerts : [],
            radarCandidates: mappedCandidates,
            conversations: mappedConversations,
            messagesByConversation: mappedMessagesByConv,
            searchableUsers: mappedSearchableUsers,
            careTasks: mappedTasks,
            circleMembers: mappedCircle,
            notifications: mappedNotifications,
            metrics: {
              ...EMPTY_METRICS,
              activeHouseholdsMonthly: Number(data.metrics?.totalUsers || 0),
              northStarQualifiedHouseholds: Number(data.metrics?.totalPets || 0),
            },
          });
        } catch (err) {
          console.error("[Web] Hydration from PostgreSQL failed:", err);
          if (throwOnError) {
            throw err;
          }
        }
      },

      trackEvent: (eventType, eventData = {}) => {
        const newEvent: AnalyticsEventRecord = {
          id: `evt-${Date.now()}`,
          eventType,
          eventData,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          analyticsEvents: [newEvent, ...state.analyticsEvents.slice(0, 99)],
        }));
      },

      completeOnboardingWizard: async (payload) => {
        const res = await requestBackendApi("/auth/register", {
          method: "POST",
          body: JSON.stringify({
            phone: payload.phone.trim(),
            username: payload.username?.trim(),
            password: payload.password || "",
            displayName: payload.displayName.trim(),
            neighborhood: payload.neighborhood.trim(),
            petName: payload.petName.trim(),
            species: payload.species,
            breed: payload.breed.trim(),
            weightKg: payload.weightKg,
          }),
        });

        const registeredUser = res?.user;
        const authToken = res?.token;
        if (!registeredUser?.id || !authToken) {
          throw new Error(
            "Không thể khởi tạo tài khoản trên cơ sở dữ liệu PostgreSQL."
          );
        }

        // Gắn phiên hợp lệ TRƯỚC LẦN TẢI ĐẦU TIÊN (bootstrap)
        setWebAuthToken(authToken);
        set({
          authToken,
          savedSessionUserId: registeredUser.id,
        });

        await get().hydrateFromServer(registeredUser.id, true);

        set({
          hasCompletedOnboarding: true,
          hasSavedSession: true,
          savedSessionUserId: registeredUser.id,
          authToken,
          bootAuthError: null,
          activeTab: "explore",
          activeModal: null,
        });

        get().trackEvent("signup_completed", { has_pet: true });
        get().showToast(
          `Chào mừng ${registeredUser.displayName} đến Pawty`,
          "Tài khoản và hồ sơ thú cưng đã được lưu vào PostgreSQL.",
          "success"
        );
      },

      restartOnboardingDemo: () => {
        setWebAuthToken(null);
        set({
          hasCompletedOnboarding: false,
          hasSavedSession: false,
          savedSessionUserId: "",
          authToken: null,
        });
      },

      loginWithSavedSession: async () => {
        const { savedSessionUserId } = get();
        if (!savedSessionUserId) {
          throw new Error("Không tìm thấy phiên đăng nhập đã lưu.");
        }
        await get().hydrateFromServer(savedSessionUserId, true);
        set({
          hasCompletedOnboarding: true,
          hasSavedSession: true,
          bootAuthError: null,
          activeTab: "explore",
        });
        get().showToast(
          "Chào mừng trở lại",
          `Đang mở phiên của ${get().user.displayName}.`
        );
      },

      loginWithCredentials: async (identifier, password) => {
        const clean = identifier.trim();
        if (!clean) {
          throw new Error("Vui lòng nhập Số điện thoại hoặc Username.");
        }
        const res = await requestBackendApi("/auth/login", {
          method: "POST",
          body: JSON.stringify({
            identifier: clean,
            password: password || "",
          }),
        });

        const authUser = res?.user;
        const authToken = res?.token;
        if (!authUser?.id || !authToken) {
          throw new Error("Thông tin đăng nhập không hợp lệ.");
        }

        // Gắn phiên hợp lệ TRƯỚC LẦN TẢI ĐẦU TIÊN (bootstrap)
        setWebAuthToken(authToken);
        set({
          authToken,
          savedSessionUserId: authUser.id,
        });

        await get().hydrateFromServer(authUser.id, true);

        set({
          hasCompletedOnboarding: true,
          hasSavedSession: true,
          savedSessionUserId: authUser.id,
          authToken,
          bootAuthError: null,
          activeTab: "explore",
        });
        get().showToast("Đăng nhập thành công", "Chào mừng quay lại Pawty!");
      },

      loginWithPhone: async (phone) => {
        await get().loginWithCredentials(phone, "");
      },

      logoutSession: () => {
        set({
          hasCompletedOnboarding: false,
          hasSavedSession: false,
          savedSessionUserId: "",
          bootAuthError: null,
          activeModal: null,
          user: EMPTY_USER,
          pets: [],
          activePetId: "",
          posts: [],
          radarCandidates: [],
          conversations: [],
          messagesByConversation: {},
          sosAlerts: [],
        });
        get().showToast(
          "Đã đăng xuất",
          "Phiên làm việc đã được đóng an toàn.",
          "info"
        );
      },

      setActivePetId: (petId) => set({ activePetId: petId }),

      updateOwnerAndPetProfile: (payload) => {
        set((state) => ({
          user: {
            ...state.user,
            displayName: payload.ownerName.trim() || state.user.displayName,
            bio: payload.ownerBio.trim() || state.user.bio,
            neighborhood:
              payload.neighborhood.trim() || state.user.neighborhood,
          },
          pets: state.pets.map((p) =>
            p.id === payload.petId
              ? {
                  ...p,
                  name: payload.petName.trim() || p.name,
                  species: payload.species,
                  breed: payload.breed.trim() || p.breed,
                  weightKg: payload.weightKg || p.weightKg,
                  ageDisplay: payload.ageDisplay.trim() || p.ageDisplay,
                }
              : p
          ),
          activeModal: null,
        }));
        get().showToast(
          "Đã lưu hồ sơ",
          "Thông tin cá nhân và thú cưng đã được cập nhật."
        );
      },

      addNewPetObject: (payload) => {
        const newId = `pet-${Date.now()}`;
        const newPet: PetProfile = {
          ...EMPTY_WEB_PET,
          id: newId,
          ownerId: get().user.id,
          name: payload.name.trim() || "Bé mới",
          species: payload.species,
          breed: payload.breed.trim() || "Chưa rõ",
          gender: "female",
          ageDisplay: payload.ageDisplay.trim() || "1 tuổi",
          weightKg: payload.weightKg || 5,
          sizeCategory: classifyPetSizeByWeight(payload.weightKg || 5),
          vaccinationStatus: "full",
        };
        set((state) => ({
          pets: [...state.pets, newPet],
          activePetId: newId,
          activeModal: null,
        }));
        get().showToast(
          `Đã thêm hồ sơ ${newPet.name}`,
          `Phân loại: ${newPet.species === "dog" ? "Chó" : "Mèo"} · ${newPet.breed}`
        );
      },

      sendCareInviteByTag: (userTag, petId) => {
        const state = get();
        const normalized = userTag.trim().startsWith("@")
          ? userTag.trim().toLowerCase()
          : `@${userTag.trim().toLowerCase()}`;
        const found = state.searchableUsers.find(
          (u) => u.tag.toLowerCase() === normalized
        );
        const pet =
          state.pets.find((p) => p.id === petId) ??
          state.pets[0] ??
          EMPTY_WEB_PET;
        if (!found) {
          get().showToast(
            "Không tìm thấy tài khoản",
            "Hãy chọn một tài khoản trong danh sách gợi ý bên dưới.",
            "warning"
          );
          return;
        }
        const already = state.circleMembers.some(
          (m) =>
            m.relationLabel.toLowerCase() === found.tag.toLowerCase() ||
            m.displayName.toLowerCase().includes(found.displayName.toLowerCase())
        );
        if (already) {
          get().showToast(
            "Đã gửi lời mời trước đó",
            `${found.displayName} (${found.tag}) đã có trong danh sách chăm cùng.`,
            "info"
          );
          return;
        }
        const newMember: CircleMember = {
          id: `cm-${Date.now()}`,
          householdId: state.user.id,
          userId: found.id,
          displayName: found.displayName,
          avatarUrl: found.avatarUrl,
          relationLabel: found.tag,
          role: "caretaker",
          inviteCode: `TAG-${found.tag.replace("@", "").toUpperCase()}`,
          status: "pending",
          joinedAt: "Đã gửi lời mời",
        };
        set((prev) => ({
          circleMembers: [...prev.circleMembers, newMember],
          circleActivities: [
            {
              id: `act-${Date.now()}`,
              householdId: prev.user.id,
              actorId: prev.user.id,
              actorName: prev.user.displayName,
              actorAvatar: prev.user.avatarUrl,
              actionText: `đã gửi lời mời chăm cùng bé ${pet.name} tới ${found.displayName} (${found.tag})`,
              detailText: "Đang chờ người nhận bấm Chấp nhận trong thông báo.",
              createdAt: "Vừa xong",
            },
            ...prev.circleActivities,
          ],
          activeModal: null,
        }));
        get().showToast(
          "Đã gửi lời mời chăm cùng",
          `${found.displayName} (${found.tag}) sẽ nhận được thông báo để xác nhận chăm bé ${pet.name}.`
        );
      },

      respondToCareInvite: (notificationId, accept) => {
        const state = get();
        const target = state.notifications.find((n) => n.id === notificationId);
        if (!target || !target.invitePayload) return;
        const payload = target.invitePayload;

        set((prev) => ({
          notifications: prev.notifications.map((n) =>
            n.id === notificationId && n.invitePayload
              ? {
                  ...n,
                  isRead: true,
                  invitePayload: {
                    ...n.invitePayload,
                    status: accept ? "accepted" : "declined",
                  },
                }
              : n
          ),
        }));

        if (accept) {
          get().showToast(
            `Đã nhận chăm cùng bé ${payload.petName}`,
            `Hồ sơ của ${payload.petName} đã được đồng bộ.`
          );
        } else {
          get().showToast(
            "Đã từ chối lời mời",
            `Bạn đã bỏ qua lời mời từ ${payload.fromUserTag}.`,
            "info"
          );
        }
      },

      markAllNotificationsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({
            ...n,
            isRead: true,
          })),
        }));
      },

      startChatWithUserTag: (userTag) => {
        const state = get();
        const found = state.searchableUsers.find(
          (u) => u.tag.toLowerCase() === userTag.toLowerCase()
        );
        if (!found) return;
        const existing = state.conversations.find((c) =>
          c.subtitle.toLowerCase().includes(found.tag.toLowerCase())
        );
        if (existing) {
          set({ activeConversationId: existing.id, activeTab: "chat" });
          return;
        }
        const newConvId = `conv-tag-${Date.now()}`;
        const newConv: Conversation = {
          id: newConvId,
          type: "direct",
          title: found.displayName,
          subtitle: `${found.tag} · ${found.area}`,
          avatarUrl: found.avatarUrl,
          partnerUserId: found.id,
          partnerLocation: state.user.location,
          isOnline: true,
          unreadCount: 0,
          lastMessageText: "Bắt đầu cuộc trò chuyện mới",
          lastMessageAt: "Vừa xong",
        };
        set((prev) => ({
          conversations: [newConv, ...prev.conversations],
          messagesByConversation: {
            ...prev.messagesByConversation,
            [newConvId]: [
              {
                id: `msg-${Date.now()}`,
                conversationId: newConvId,
                senderId: prev.user.id,
                senderName: prev.user.displayName,
                senderAvatar: prev.user.avatarUrl,
                messageType: "text",
                textContent: `Chào ${found.displayName}, mình kết nối qua Pawty nhé.`,
                isRead: true,
                createdAt: "Vừa xong",
              },
            ],
          },
          activeConversationId: newConvId,
          activeTab: "chat",
        }));
      },

      addVaccinationRecord: (petId, vaccineName, dateGiven, vetName) => {
        set((state) => ({
          pets: state.pets.map((pet) =>
            pet.id === petId
              ? {
                  ...pet,
                  vaccinationStatus: "full",
                  lastVaccineDate: dateGiven,
                  vaccinations: [
                    {
                      id: `vac-${Date.now()}`,
                      petId,
                      vaccineName,
                      dateGiven,
                      vetName,
                      verified: true,
                    },
                    ...pet.vaccinations,
                  ],
                }
              : pet
          ),
        }));
        get().showToast(
          "Đã cập nhật sổ tiêm điện tử",
          `Mũi tiêm "${vaccineName}" đã được lưu.`
        );
      },

      addPetBehaviorChip: (petId, category, label) => {
        if (!label.trim()) return;
        set((state) => ({
          pets: state.pets.map((pet) =>
            pet.id === petId
              ? {
                  ...pet,
                  behaviors: [
                    ...pet.behaviors,
                    {
                      id: `bh-${Date.now()}`,
                      petId,
                      category,
                      label: label.trim(),
                    },
                  ],
                }
              : pet
          ),
        }));
        get().showToast(
          "Đã cập nhật hành vi Boss",
          `Đã thêm "${label.trim()}" vào hồ sơ.`
        );
      },

      toggleCareTaskComplete: (taskId, note, photoUrl) => {
        const target = get().careTasks.find((t) => t.id === taskId);
        if (!target) return;
        const willBeDone = target.status !== "done";

        set((state) => ({
          careTasks: state.careTasks.map((task) =>
            task.id === taskId
              ? {
                  ...task,
                  status: willBeDone ? "done" : "pending",
                  completedAt: willBeDone
                    ? new Date().toISOString()
                    : undefined,
                  completedBy: willBeDone ? state.user.id : undefined,
                  completedByName: willBeDone
                    ? state.user.displayName
                    : undefined,
                  completionNote: note ?? task.completionNote,
                  completionPhoto: photoUrl ?? task.completionPhoto,
                }
              : task
          ),
        }));

        if (willBeDone) {
          get().showToast(
            "Đã hoàn thành công việc",
            `Các thành viên chăm cùng đã nhận cập nhật "${target.title}".`
          );
        }
      },

      createCareTask: (payload) => {
        const assignee = get().circleMembers.find(
          (m) => m.userId === payload.assignedTo
        );
        const newTask: CareTask = {
          id: `task-${Date.now()}`,
          householdId: get().user.id,
          petId: payload.petId,
          createdBy: get().user.id,
          assignedTo: payload.assignedTo,
          assignedToName: assignee
            ? assignee.displayName
            : get().user.displayName,
          title: payload.title,
          description: payload.description,
          category: payload.category,
          isRecurring: payload.isRecurring,
          dueDate: payload.dueDate,
          dueTime: payload.dueTime,
          status: "pending",
          reminderEnabled: true,
        };

        set((state) => ({
          careTasks: [newTask, ...state.careTasks],
          activeModal: null,
        }));
        get().showToast(
          "Đã tạo việc chăm sóc",
          `Đã giao cho ${newTask.assignedToName} lúc ${newTask.dueTime}.`
        );
      },

      inviteCircleMember: (displayName, relationLabel, role) => {
        const state = get();
        const code = `PAWTY-${Math.random()
          .toString(36)
          .substring(2, 7)
          .toUpperCase()}`;
        const newMember: CircleMember = {
          id: `cm-${Date.now()}`,
          householdId: state.user.id,
          userId: `user-${Date.now()}`,
          displayName,
          avatarUrl: "/assets/pawty-icon.png",
          relationLabel,
          role,
          inviteCode: code,
          status: "active",
          joinedAt: "Hôm nay",
        };

        set((prev) => ({
          circleMembers: [...prev.circleMembers, newMember],
        }));
        get().showToast(
          "Đã thêm vào Vòng chăm sóc",
          `${displayName} đã có thể nhận việc chăm Boss.`
        );
      },

      revokeCircleMember: (memberId) => {
        set((state) => ({
          circleMembers: state.circleMembers.filter(
            (m) => m.id !== memberId || m.role === "owner"
          ),
        }));
        get().showToast(
          "Đã thu hồi quyền Circle",
          "Thành viên đã được gỡ khỏi hộ chăm sóc.",
          "info"
        );
      },

      toggleHandoverChecklistItem: (itemId) => {
        set((state) => ({
          handoverNote: {
            ...state.handoverNote,
            checklist: state.handoverNote.checklist.map((item) =>
              item.id === itemId ? { ...item, checked: !item.checked } : item
            ),
          },
        }));
      },

      createSocialPost: (payload) => {
        const moderation = moderatePetContent(
          payload.textContent,
          payload.contentType
        );
        if (!moderation.allowed) {
          get().showToast(
            "Bài viết bị chặn bởi Hệ thống Kiểm duyệt",
            moderation.blockedReason ||
              "Nội dung vi phạm chính sách cộng đồng Pawty.",
            "danger"
          );
          return { ok: false, error: moderation.blockedReason };
        }

        const state = get();
        const activePet =
          state.pets.find((p) => p.id === state.activePetId) ??
          state.pets[0] ??
          EMPTY_WEB_PET;

        const mergedHashtags = Array.from(
          new Set([...payload.hashtags, ...moderation.suggestedHashtags])
        );

        const newPost: SocialPost = {
          id: `post-${Date.now()}`,
          authorId: state.user.id,
          authorName: state.user.displayName,
          authorUsername: state.user.username,
          authorAvatar: state.user.avatarUrl,
          authorIsVip: state.user.isVip,
          petIds: activePet.id ? [activePet.id] : [],
          petName: activePet.name,
          petBreed: activePet.breed,
          petAvatar: activePet.avatarUrl,
          contentType: payload.contentType,
          textContent: payload.textContent,
          media: payload.imageUrl
            ? [
                {
                  type: "image",
                  url: payload.imageUrl,
                  aspectRatio: "4:5",
                },
              ]
            : [],
          hashtags: mergedHashtags,
          location: {
            name: state.user.neighborhood,
            approximate: true,
            point: state.user.location,
          },
          speciesTags: [activePet.species],
          breedTags: [activePet.breed.toLowerCase().replace(/\s+/g, "_")],
          topicTags: [payload.contentType],
          visibility: payload.visibility,
          isExpertContent: false,
          expertVerified: false,
          hasHealthDisclaimer: moderation.hasHealthDisclaimer,
          isSevereHealthAlert: moderation.isSevereHealthAlert,
          isSponsored: false,
          feedSource: "circle_following",
          engagement: {
            pawCount: 1,
            commentCount: 0,
            shareCount: 0,
            saveCount: 0,
            reactionBreakdown: {
              paw: 1,
              heart_eyes: 0,
              laughing: 0,
              worried: 0,
              helpful: 0,
            },
          },
          userReaction: "paw",
          isBookmarked: false,
          moderationStatus: "approved",
          createdAt: new Date().toISOString(),
          comments: [],
        };

        void requestBackendApi("/posts", {
          method: "POST",
          body: JSON.stringify({
            authorId: state.user.id,
            contentType: payload.contentType,
            textContent: payload.textContent,
            media: newPost.media,
            hashtags: mergedHashtags,
            locationName: state.user.neighborhood,
          }),
        }).catch((err) => {
          console.error("[Web] Failed to persist post to DB:", err);
        });

        set((prev) => ({
          posts: [newPost, ...prev.posts],
          activeModal: null,
          activeTab: "explore",
          exploreSubTab: payload.contentType === "question" ? "qa" : "feed",
        }));

        get().showToast(
          "Đã đăng bài viết mới",
          `Bài viết của ${activePet.name} đã hiển thị trên bảng tin.`
        );

        return { ok: true };
      },

      reactToPost: (postId, reaction) => {
        set((state) => ({
          posts: state.posts.map((post) => {
            if (post.id !== postId) return post;
            const prevReaction = post.userReaction;
            const isRemoving = prevReaction === reaction;
            const breakdown = { ...post.engagement.reactionBreakdown };

            if (prevReaction) {
              breakdown[prevReaction] = Math.max(
                0,
                breakdown[prevReaction] - 1
              );
            }
            if (!isRemoving) {
              breakdown[reaction] = (breakdown[reaction] || 0) + 1;
            }

            const totalPaws = Object.values(breakdown).reduce(
              (sum, val) => sum + val,
              0
            );

            return {
              ...post,
              userReaction: isRemoving ? null : reaction,
              engagement: {
                ...post.engagement,
                pawCount: totalPaws,
                reactionBreakdown: breakdown,
              },
            };
          }),
        }));

        void requestBackendApi(`/posts/${postId}/paw`, {
          method: "POST",
        }).catch((err) => {
          console.error("[Web] Failed to toggle paw reaction:", err);
        });
      },

      addCommentToPost: (postId, textContent) => {
        if (!textContent.trim()) return;
        const moderation = moderatePetContent(textContent, "moment");
        if (!moderation.allowed) {
          get().showToast(
            "Bình luận bị từ chối",
            moderation.blockedReason || "Vi phạm quy tắc.",
            "danger"
          );
          return;
        }

        const state = get();
        set((prev) => ({
          posts: prev.posts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  engagement: {
                    ...post.engagement,
                    commentCount: post.engagement.commentCount + 1,
                  },
                  comments: [
                    ...post.comments,
                    {
                      id: `cmt-${Date.now()}`,
                      postId,
                      authorId: state.user.id,
                      authorName: state.user.displayName,
                      authorAvatar: state.user.avatarUrl,
                      textContent: textContent.trim(),
                      mentions: [],
                      isExpert: Boolean(state.user.isExpert),
                      expertTitle: state.user.expertTitle,
                      hasHealthDisclaimer: moderation.hasHealthDisclaimer,
                      reactions: { paw: 1, helpful: 0 },
                      createdAt: "Vừa xong",
                    },
                  ],
                }
              : post
          ),
        }));

        void requestBackendApi(`/posts/${postId}/comments`, {
          method: "POST",
          body: JSON.stringify({
            authorId: state.user.id,
            textContent: textContent.trim(),
          }),
        }).catch((err) => {
          console.error("[Web] Failed to persist comment:", err);
        });
      },

      toggleBookmarkPost: (postId, folderName = "Mẹo chăm sóc") => {
        set((state) => ({
          posts: state.posts.map((post) => {
            if (post.id !== postId) return post;
            const nextSaved = !post.isBookmarked;
            return {
              ...post,
              isBookmarked: nextSaved,
              bookmarkFolder: nextSaved ? folderName : undefined,
              engagement: {
                ...post.engagement,
                saveCount: Math.max(
                  0,
                  post.engagement.saveCount + (nextSaved ? 1 : -1)
                ),
              },
            };
          }),
        }));
        get().showToast(
          "Đã lưu bài viết",
          `Đã lưu vào mục "${folderName}".`,
          "info"
        );
      },

      toggleJoinGroup: (groupId) => {
        set((state) => ({
          groups: state.groups.map((grp) =>
            grp.id === groupId
              ? {
                  ...grp,
                  isJoined: !grp.isJoined,
                  memberCount: grp.memberCount + (grp.isJoined ? -1 : 1),
                }
              : grp
          ),
        }));
      },

      swipeRadarCandidate: (candidateId, direction) => {
        const state = get();
        if (state.user.radarLockedUntil) {
          get().showToast(
            "Radar đang tạm khóa 3 ngày",
            "Tài khoản bị báo cáo bùng kèo hẹn dạo 2 lần/tuần (Chính sách Anti-Flake).",
            "danger"
          );
          return;
        }

        const candidate = state.radarCandidates.find(
          (c) => c.id === candidateId
        );
        if (!candidate) return;

        const activePet =
          state.pets.find((p) => p.id === state.activePetId) ??
          state.pets[0] ??
          EMPTY_WEB_PET;

        void requestBackendApi("/tinder/swipe", {
          method: "POST",
          body: JSON.stringify({
            userId: state.user.id,
            targetUserId: candidate.userId,
            direction,
          }),
        }).catch((err) => {
          console.error("[Web] Failed to record swipe:", err);
        });

        if (direction === "right") {
          const newMatch: MatchRecord = {
            id: `match-${Date.now()}`,
            userAId: state.user.id,
            userBId: candidate.userId,
            petAId: activePet.id,
            petBId: candidate.pet.id,
            partnerOwnerName: candidate.ownerName,
            partnerOwnerAvatar: candidate.ownerAvatar,
            partnerPetName: candidate.pet.name,
            partnerPetBreed: candidate.pet.breed,
            partnerPetAvatar: candidate.pet.avatarUrl,
            neighborhood: candidate.neighborhood,
            distanceMeters: candidate.distanceMeters,
            matchReason: candidate.matchReason,
            matchedAt: "Vừa xong",
          };

          const newConvId = `conv-${candidate.userId}`;
          const existingConv = state.conversations.find(
            (c) => c.id === newConvId
          );

          set((prev) => ({
            radarCandidates: prev.radarCandidates.filter(
              (c) => c.id !== candidateId
            ),
            matches: [newMatch, ...prev.matches],
            latestMatchCelebration: newMatch,
            user: {
              ...prev.user,
              dailySwipeCount: prev.user.dailySwipeCount + 1,
            },
            conversations: existingConv
              ? prev.conversations
              : [
                  {
                    id: newConvId,
                    type: "direct",
                    title: `${candidate.pet.name} (${candidate.pet.breed}) · ${candidate.ownerName}`,
                    subtitle: `${candidate.neighborhood} · Cách ${candidate.distanceMeters}m`,
                    avatarUrl: candidate.pet.avatarUrl,
                    partnerUserId: candidate.userId,
                    partnerLocation: candidate.location,
                    isOnline: true,
                    unreadCount: 1,
                    lastMessageText: `Đã ghép đôi! Hãy rủ ${candidate.pet.name} đi dạo nhé.`,
                    lastMessageAt: "Vừa xong",
                  },
                  ...prev.conversations,
                ],
          }));
        } else {
          set((prev) => ({
            radarCandidates: prev.radarCandidates.filter(
              (c) => c.id !== candidateId
            ),
            user: {
              ...prev.user,
              dailySwipeCount: prev.user.dailySwipeCount + 1,
            },
          }));
        }
      },

      dismissMatchCelebration: () => set({ latestMatchCelebration: null }),

      createWalkAppointment: (payload) => {
        const state = get();
        const activePet =
          state.pets.find((p) => p.id === state.activePetId) ??
          state.pets[0] ??
          EMPTY_WEB_PET;
        const newWalkId = `walk-${Date.now()}`;
        const newAppointment: WalkAppointment = {
          id: newWalkId,
          conversationId: payload.conversationId,
          initiatorId: state.user.id,
          inviteeId: "user-partner",
          partnerName: payload.partnerName,
          petNames: [activePet.name, payload.partnerName.split(" ")[0]],
          scheduledDate: payload.scheduledDate,
          scheduledTime: payload.scheduledTime,
          locationName: payload.locationName,
          locationAddress: payload.locationAddress,
          distanceFromMidpointMeters: payload.distanceFromMidpointMeters,
          locationPoint: state.user.location,
          note: payload.note,
          status: "pending",
          createdAt: "Vừa xong",
        };

        const inviteMsg: ChatMessage = {
          id: `msg-${Date.now()}`,
          conversationId: payload.conversationId,
          senderId: state.user.id,
          senderName: state.user.displayName,
          senderAvatar: state.user.avatarUrl,
          messageType: "walk_invite",
          textContent: `Lời hẹn dắt dạo tại ${newAppointment.locationName} (${payload.scheduledDate} · ${payload.scheduledTime})`,
          walkAppointmentId: newWalkId,
          isRead: true,
          createdAt: "Vừa xong",
        };

        set((prev) => ({
          activeModal: null,
          messagesByConversation: {
            ...prev.messagesByConversation,
            [payload.conversationId]: [
              ...(prev.messagesByConversation[payload.conversationId] || []),
              inviteMsg,
            ],
          },
          conversations: prev.conversations.map((c) =>
            c.id === payload.conversationId
              ? {
                  ...c,
                  lastMessageText: `Hẹn dắt dạo: ${payload.locationName}`,
                  lastMessageAt: "Vừa xong",
                }
              : c
          ),
        }));

        get().showToast(
          "Đã gửi lời hẹn đi dạo",
          `Địa điểm: ${payload.locationName}`
        );
      },

      sendChatMessage: (
        conversationId,
        textContent,
        messageType = "text",
        extra = {}
      ) => {
        if (!textContent.trim() && messageType === "text") return;
        const state = get();
        const newMsg: ChatMessage = {
          id: `msg-${Date.now()}`,
          conversationId,
          senderId: state.user.id,
          senderName: state.user.displayName,
          senderAvatar: state.user.avatarUrl,
          messageType,
          textContent: textContent.trim(),
          mediaUrl: extra.mediaUrl,
          voiceDurationSec: extra.voiceDurationSec,
          isRead: true,
          createdAt: new Date().toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };

        void requestBackendApi(`/chats/${conversationId}/messages`, {
          method: "POST",
          body: JSON.stringify({
            senderId: state.user.id,
            text: textContent.trim(),
          }),
        }).catch((err) => {
          console.error("[Web] Failed to persist chat message:", err);
        });

        set((prev) => ({
          messagesByConversation: {
            ...prev.messagesByConversation,
            [conversationId]: [
              ...(prev.messagesByConversation[conversationId] || []),
              newMsg,
            ],
          },
          conversations: prev.conversations.map((c) =>
            c.id === conversationId
              ? {
                  ...c,
                  lastMessageText:
                    messageType === "voice"
                      ? "Tin nhắn thoại"
                      : newMsg.textContent,
                  lastMessageAt: "Vừa xong",
                }
              : c
          ),
        }));
      },

      upgradeToVipPlan: (plan) => {
        const priceMap = {
          basic: 29000,
          sen_vip: 49000,
          sen_vip_yearly: 399000,
        };
        set((state) => ({
          user: {
            ...state.user,
            isVip: true,
            vipPlan: plan,
          },
          activeModal: null,
          metrics: {
            ...state.metrics,
            vipSubscriptionRevenueVnd:
              state.metrics.vipSubscriptionRevenueVnd + priceMap[plan],
            mrrVnd: state.metrics.mrrVnd + priceMap[plan],
          },
        }));
        get().showToast(
          "Đã nâng cấp gói VIP",
          "Đã mở khóa toàn bộ tính năng nâng cao cho tài khoản của bạn."
        );
      },

      activateSosAlert: (payload) => {
        const state = get();
        const pet =
          state.pets.find((p) => p.id === payload.petId) ??
          state.pets[0] ??
          EMPTY_WEB_PET;
        const newSos: SosAlert = {
          id: `sos-${Date.now()}`,
          userId: state.user.id,
          ownerName: state.user.displayName,
          ownerPhone: state.user.phone,
          petId: pet.id,
          petName: pet.name,
          petBreed: pet.breed,
          petAvatar: pet.avatarUrl,
          lastSeenLocation: payload.lastSeenLocation,
          radiusKm: 3,
          description: payload.description,
          rewardText:
            payload.rewardText || "Hậu tạ 1.000.000đ cho người tìm thấy",
          feePaidVnd: 39000,
          status: "active",
          sightings: [],
          createdAt: "Vừa phát tín hiệu",
        };

        void requestBackendApi("/sos", {
          method: "POST",
          body: JSON.stringify({
            userId: state.user.id,
            petId: pet.id,
            lastSeenLocation: payload.lastSeenLocation,
            description: payload.description,
            rewardText: newSos.rewardText,
          }),
        }).catch((err) => {
          console.error("[Web] Failed to persist SOS alert:", err);
        });

        set((prev) => ({
          sosAlerts: [newSos, ...prev.sosAlerts],
          activeModal: null,
          activeTab: "explore",
          exploreSubTab: "feed",
        }));

        get().showToast(
          "Đã phát thông báo tìm thú lạc 3km",
          `Các chủ nuôi quanh ${payload.lastSeenLocation} đã nhận được thông báo hỗ trợ.`,
          "danger"
        );
      },

      reportSosSighting: (alertId, reporterName, locationName, note) => {
        set((state) => ({
          sosAlerts: state.sosAlerts.map((alert) =>
            alert.id === alertId
              ? {
                  ...alert,
                  sightings: [
                    {
                      id: `s-${Date.now()}`,
                      reporterId: state.user.id,
                      reporterName,
                      reporterPhone: state.user.phone,
                      locationName,
                      note,
                      createdAt: "Vừa xong",
                    },
                    ...alert.sightings,
                  ],
                }
              : alert
          ),
        }));
        get().showToast(
          "Đã gửi vị trí nhìn thấy Boss!",
          "Chủ nuôi đã nhận được thông báo real-time."
        );
      },

      markSosFound: (alertId) => {
        set((state) => ({
          sosAlerts: state.sosAlerts.map((alert) =>
            alert.id === alertId ? { ...alert, status: "found" } : alert
          ),
        }));
        get().showToast(
          "Mừng Boss đã về nhà an toàn!",
          "Đã đóng cảnh báo SOS và cảm ơn cộng đồng."
        );
      },

      confirmSosMatchDecision: (alertId, matchId, decision) => {
        set((state) => ({
          sosAlerts: state.sosAlerts.map((alert) => {
            if (alert.id !== alertId) return alert;
            const updatedMatchedPosts = (alert.matchedPosts || []).map(
              (m: any) =>
                m.id === matchId
                  ? {
                      ...m,
                      status:
                        decision === "verified"
                          ? ("verified_by_owner" as const)
                          : ("dismissed" as const),
                    }
                  : m
            );
            return {
              ...alert,
              matchedPosts: updatedMatchedPosts,
            };
          }),
        }));
      },

      submitContentReport: (
        targetType,
        targetId,
        targetPreview,
        reason,
        description
      ) => {
        const state = get();
        const newReport: ContentReport = {
          id: `rep-${Date.now()}`,
          reporterId: state.user.id,
          reporterName: state.user.displayName,
          targetType,
          targetId,
          targetPreview,
          reason,
          description,
          status: "pending",
          createdAt: "Vừa xong",
        };
        set((prev) => ({
          reports: [newReport, ...prev.reports],
        }));
        get().showToast(
          "Đã gửi báo cáo kiểm duyệt",
          "Đội ngũ Moderator sẽ xử lý trong vòng 24 giờ."
        );
      },

      resolveContentReport: (reportId, actionTaken) => {
        set((state) => ({
          reports: state.reports.map((r) =>
            r.id === reportId ? { ...r, status: "resolved", actionTaken } : r
          ),
        }));
      },

      updatePrivacySettings: (partial) => {
        set((state) => ({
          user: {
            ...state.user,
            privacy: {
              ...state.user.privacy,
              ...partial,
            },
          },
        }));
        get().showToast(
          "Đã lưu cài đặt Quyền riêng tư",
          "Tuân thủ Luật BVDLCN 91/2025/QH15."
        );
      },

      resetAllDemoData: () => {
        localStorage.removeItem("pawty-super-app-storage-v2");
        localStorage.removeItem("pawty-web-prefs-v3");
        window.location.reload();
      },
    }),
    {
      name: "pawty-web-prefs-v3",
      partialize: (state) => ({
        themeId: state.themeId,
        hasSavedSession: state.hasSavedSession,
        savedSessionUserId: state.savedSessionUserId,
        authToken: state.authToken,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.authToken) {
          setWebAuthToken(state.authToken);
        }
      },
    }
  )
);
