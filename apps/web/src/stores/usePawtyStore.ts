import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  AnalyticsEventRecord,
  BookingStatus,
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
  PartnerProfile,
  PetFriendlyPlace,
  PetProfile,
  PostContentType,
  PostVisibility,
  PrimaryNeed,
  RadarCandidate,
  ReactionType,
  ServiceBooking,
  SocialPost,
  SosAlert,
  UserProfile,
  WalkAppointment,
} from "@pawty/types";
import { classifyPetSizeByWeight } from "@pawty/utils";
import { moderatePetContent } from "@pawty/validators";
import {
  INITIAL_BOOKINGS,
  INITIAL_CARE_TASKS,
  INITIAL_CIRCLE_ACTIVITIES,
  INITIAL_CIRCLE_MEMBERS,
  INITIAL_CONVERSATIONS,
  INITIAL_DASHBOARD_METRICS,
  INITIAL_GROUPS,
  INITIAL_HANDOVER_NOTE,
  INITIAL_MATCHES,
  INITIAL_MESSAGES,
  INITIAL_NOTIFICATIONS,
  INITIAL_PARTNERS,
  INITIAL_PETS,
  INITIAL_PLACES,
  INITIAL_POSTS,
  INITIAL_RADAR_CANDIDATES,
  INITIAL_REPORTS,
  INITIAL_SOS_ALERTS,
  INITIAL_USER,
  INITIAL_WALK_APPOINTMENTS,
  SEARCHABLE_USER_DIRECTORY,
  type AppNotificationItem,
  type SearchableUserTag,
  type WebThemeId,
} from "../mocks/seedData";

export type BottomTabId =
  | "today"
  | "explore"
  | "tinder"
  | "services"
  | "appointments"
  | "chat"
  | "profile";
export type ExploreSubTabId =
  | "feed"
  | "discover"
  | "groups"
  | "places"
  | "qa"
  | "radar"
  | "services";
export type ActiveModalType =
  | null
  | "create_sheet"
  | "new_moment"
  | "new_task"
  | "new_question"
  | "invite_circle"
  | "handover_note"
  | "book_service"
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
  themeId: WebThemeId;
  activeTab: BottomTabId;
  exploreSubTab: ExploreSubTabId;
  activeModal: ActiveModalType;
  selectedPartnerIdForBooking: string | null;
  selectedPublicPet: PetProfile | null;
  activeConversationId: string | null;
  desktopFrameMode: "iphone" | "pro_portal";
  toast: ToastBanner | null;

  // Core Entities
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
  walkAppointments: WalkAppointment[];
  conversations: Conversation[];
  messagesByConversation: Record<string, ChatMessage[]>;
  partners: PartnerProfile[];
  bookings: ServiceBooking[];
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
  setActiveModal: (modal: ActiveModalType, partnerId?: string | null) => void;
  openPublicPetProfile: (pet: PetProfile) => void;
  setActiveConversationId: (conversationId: string | null) => void;
  setDesktopFrameMode: (mode: "iphone" | "pro_portal") => void;
  showToast: (
    title: string,
    message: string,
    tone?: ToastBanner["tone"],
  ) => void;
  clearToast: () => void;
  trackEvent: (
    eventType: string,
    eventData?: Record<string, string | number | boolean>,
  ) => void;

  // Onboarding & Pet Actions
  completeOnboardingWizard: (payload: {
    phone: string;
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
  }) => void;
  restartOnboardingDemo: () => void;
  loginWithSavedSession: () => void;
  loginWithPhone: (phone: string) => void;
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
    vetName: string,
  ) => void;
  addPetBehaviorChip: (
    petId: string,
    category: "good_habit" | "caution",
    label: string,
  ) => void;

  // Layer 1 & 2: Care & Circle Actions
  toggleCareTaskComplete: (
    taskId: string,
    note?: string,
    photoUrl?: string,
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
    role: CircleRole,
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
    direction: "left" | "right",
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
  updateWalkAppointmentStatus: (
    appointmentId: string,
    status: "confirmed" | "completed" | "cancelled" | "no_show",
  ) => void;

  // Messaging Actions
  sendChatMessage: (
    conversationId: string,
    textContent: string,
    messageType?: ChatMessage["messageType"],
    extra?: { mediaUrl?: string; voiceDurationSec?: number },
  ) => void;

  // Layer 4 & 5: Services, Bookings & Reviews
  createServiceBooking: (payload: {
    partnerId: string;
    petId: string;
    serviceIds: string[];
    scheduledDate: string;
    scheduledTime: string;
    note: string;
  }) => void;
  updateBookingStatus: (bookingId: string, status: BookingStatus) => void;
  submitPartnerReview: (
    bookingId: string,
    rating: number,
    textContent: string,
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
    note: string,
  ) => void;
  markSosFound: (alertId: string) => void;
  submitContentReport: (
    targetType: ContentReport["targetType"],
    targetId: string,
    targetPreview: string,
    reason: ContentReport["reason"],
    description: string,
  ) => void;
  resolveContentReport: (reportId: string, actionTaken: string) => void;
  updatePrivacySettings: (partial: Partial<UserProfile["privacy"]>) => void;
  resetAllDemoData: () => void;
}

export const usePawtyStore = create<PawtyAppState>()(
  persist(
    (set, get) => ({
      hasCompletedOnboarding: false,
      hasSavedSession: true,
      themeId: "coral",
      activeTab: "explore",
      exploreSubTab: "feed",
      activeModal: null,
      selectedPartnerIdForBooking: null,
      selectedPublicPet: null,
      activeConversationId: null,
      desktopFrameMode: "iphone",
      toast: null,

      user: INITIAL_USER,
      pets: INITIAL_PETS,
      activePetId: INITIAL_PETS[0].id,
      circleMembers: INITIAL_CIRCLE_MEMBERS,
      careTasks: INITIAL_CARE_TASKS,
      circleActivities: INITIAL_CIRCLE_ACTIVITIES,
      handoverNote: INITIAL_HANDOVER_NOTE,
      posts: INITIAL_POSTS,
      groups: INITIAL_GROUPS,
      places: INITIAL_PLACES,
      radarCandidates: INITIAL_RADAR_CANDIDATES,
      matches: INITIAL_MATCHES,
      latestMatchCelebration: null,
      walkAppointments: INITIAL_WALK_APPOINTMENTS,
      conversations: INITIAL_CONVERSATIONS,
      messagesByConversation: INITIAL_MESSAGES,
      partners: INITIAL_PARTNERS,
      bookings: INITIAL_BOOKINGS,
      sosAlerts: INITIAL_SOS_ALERTS,
      reports: INITIAL_REPORTS,
      analyticsEvents: [],
      metrics: INITIAL_DASHBOARD_METRICS,
      notifications: INITIAL_NOTIFICATIONS,
      searchableUsers: SEARCHABLE_USER_DIRECTORY,

      setThemeId: (themeId) => {
        set({ themeId });
        get().showToast("Đã đổi giao diện", "Màu sắc ứng dụng đã được cập nhật.");
      },
      setActiveTab: (tab) =>
        set({ activeTab: tab, activeConversationId: null }),
      setExploreSubTab: (subTab) => set({ exploreSubTab: subTab }),
      setActiveModal: (modal, partnerId = null) =>
        set({
          activeModal: modal,
          selectedPartnerIdForBooking:
            partnerId ?? get().selectedPartnerIdForBooking,
        }),
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

      completeOnboardingWizard: (payload) => {
        const newPetId = `pet-${Date.now()}`;
        const newPet: PetProfile = {
          id: newPetId,
          householdId: "hh-mai",
          ownerId: "user-mai",
          name: payload.petName || "Lu",
          species: payload.species,
          breed:
            payload.breed ||
            (payload.species === "dog"
              ? "Golden Retriever"
              : "Mèo Anh Lông Ngắn"),
          gender: payload.gender,
          dateOfBirth: "2025-01-15",
          ageDisplay: "1 năm 9 tháng",
          weightKg: payload.weightKg || 12,
          sizeCategory: classifyPetSizeByWeight(payload.weightKg || 12),
          energyLevel: payload.energyLevel,
          avatarUrl:
            payload.species === "dog"
              ? "https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=600&q=80"
              : "https://images.unsplash.com/photo-1573865526739-10659fec78a5?auto=format&fit=crop&w=600&q=80",
          coverPhotoUrl:
            "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80",
          isNeutered: payload.isNeutered,
          allergies: payload.allergies || "Không có",
          medicalNotes: "Hồ sơ khởi tạo từ Onboarding 4 bước",
          vetName: "BS. Nguyễn Văn An — PetCare Q9",
          vetContact: "0909 112 233",
          vaccinationStatus: payload.vaccinationStatus,
          lastVaccineDate: "2026-10-15",
          isPublic: true,
          followerCount: 1,
          behaviors: [
            ...payload.personalities.map((label, idx) => ({
              id: `ob-p-${idx}`,
              petId: newPetId,
              category: "personality" as const,
              label,
            })),
            ...payload.goodHabits.map((label, idx) => ({
              id: `ob-g-${idx}`,
              petId: newPetId,
              category: "good_habit" as const,
              label,
            })),
            ...payload.cautions.map((label, idx) => ({
              id: `ob-c-${idx}`,
              petId: newPetId,
              category: "caution" as const,
              label,
            })),
          ],
          vaccinations:
            payload.vaccinationStatus === "full"
              ? [
                  {
                    id: `vac-${Date.now()}`,
                    petId: newPetId,
                    vaccineName:
                      payload.species === "dog"
                        ? "Vắc-xin 7 bệnh & Phòng dại"
                        : "Vắc-xin 4 bệnh Mèo & Phòng dại",
                    dateGiven: "2026-10-15",
                    nextDueDate: "2027-10-15",
                    vetName: "Phòng khám PetCare",
                    verified: true,
                  },
                ]
              : [],
          weightHistory: [
            { date: "10/2026", weightKg: payload.weightKg || 12 },
          ],
        };

        set((state) => ({
          hasCompletedOnboarding: true,
          activeTab: "explore",
          activeModal: null,
          user: {
            ...state.user,
            phone: payload.phone || state.user.phone,
            displayName: payload.displayName || state.user.displayName,
            district: payload.district || state.user.district,
            neighborhood: payload.neighborhood || state.user.neighborhood,
            primaryNeeds: payload.primaryNeeds,
          },
          pets: [newPet, ...state.pets],
          activePetId: newPetId,
        }));

        get().trackEvent("signup_completed", { has_pet: true });
        get().trackEvent("pet_profile_created", { species: payload.species });
        get().showToast(
          `Chào mừng ${newPet.name} đến Pawty`,
          "Hồ sơ thú cưng và sổ tiêm điện tử đã sẵn sàng.",
          "success",
        );
      },

      restartOnboardingDemo: () => set({ hasCompletedOnboarding: false }),

      loginWithSavedSession: () => {
        set({ hasCompletedOnboarding: true, hasSavedSession: true, activeTab: "explore" });
        get().showToast("Chào mừng trở lại", `Đang mở phiên của ${get().user.displayName}.`);
      },

      loginWithPhone: (phone) => {
        set((state) => ({
          hasCompletedOnboarding: true,
          hasSavedSession: true,
          activeTab: "explore",
          user: {
            ...state.user,
            phone: phone.trim() || state.user.phone,
          },
        }));
        get().showToast("Đăng nhập thành công", `Chào mừng ${get().user.displayName} quay lại.`);
      },

      logoutSession: () => {
        set({ hasCompletedOnboarding: false, activeModal: null });
        get().showToast("Đã đăng xuất", "Bạn có thể vào lại nhanh bất cứ lúc nào.", "info");
      },

      setActivePetId: (petId) => set({ activePetId: petId }),

      updateOwnerAndPetProfile: (payload) => {
        set((state) => ({
          user: {
            ...state.user,
            displayName: payload.ownerName.trim() || state.user.displayName,
            bio: payload.ownerBio.trim() || state.user.bio,
            neighborhood: payload.neighborhood.trim() || state.user.neighborhood,
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
              : p,
          ),
          activeModal: null,
        }));
        get().showToast("Đã lưu hồ sơ", "Thông tin cá nhân và thú cưng đã được cập nhật.");
      },

      addNewPetObject: (payload) => {
        const newId = `pet-${Date.now()}`;
        const newPet: PetProfile = {
          id: newId,
          householdId: "hh-mai",
          ownerId: get().user.id,
          name: payload.name.trim() || "Bé mới",
          species: payload.species,
          breed:
            payload.breed.trim() ||
            (payload.species === "dog" ? "Corgi" : "Mèo Anh Lông Ngắn"),
          gender: "female",
          dateOfBirth: "2025-05-01",
          ageDisplay: payload.ageDisplay.trim() || "1 tuổi",
          weightKg: payload.weightKg || 5,
          sizeCategory: classifyPetSizeByWeight(payload.weightKg || 5),
          energyLevel: "medium",
          avatarUrl:
            payload.species === "dog"
              ? "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=600&q=80"
              : "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=600&q=80",
          coverPhotoUrl:
            "https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80",
          isNeutered: true,
          allergies: "Không có",
          medicalNotes: "Khoẻ mạnh",
          vetName: "Phòng khám PetCare Q9",
          vetContact: "0909 112 233",
          vaccinationStatus: "full",
          lastVaccineDate: "2026-10-15",
          isPublic: true,
          followerCount: 1,
          behaviors: [
            { id: `bh-${Date.now()}-1`, petId: newId, category: "personality", label: "Thân thiện" },
            { id: `bh-${Date.now()}-2`, petId: newId, category: "good_habit", label: "Ngoan ngoãn" },
          ],
          vaccinations: [
            {
              id: `vac-${Date.now()}`,
              petId: newId,
              vaccineName:
                payload.species === "dog"
                  ? "Vắc-xin 7 bệnh & Phòng dại"
                  : "Vắc-xin 4 bệnh Mèo",
              dateGiven: "2026-10-15",
              nextDueDate: "2027-10-15",
              vetName: "Phòng khám PetCare Q9",
              verified: true,
            },
          ],
          weightHistory: [{ date: "10/2026", weightKg: payload.weightKg || 5 }],
        };
        set((state) => ({
          pets: [...state.pets, newPet],
          activePetId: newId,
          activeModal: null,
        }));
        get().showToast(
          `Đã thêm hồ sơ ${newPet.name}`,
          `Phân loại: ${newPet.species === "dog" ? "Chó" : "Mèo"} · ${newPet.breed}`,
        );
      },

      sendCareInviteByTag: (userTag, petId) => {
        const state = get();
        const normalized = userTag.trim().startsWith("@")
          ? userTag.trim().toLowerCase()
          : `@${userTag.trim().toLowerCase()}`;
        const found = state.searchableUsers.find(
          (u) => u.tag.toLowerCase() === normalized,
        );
        const pet = state.pets.find((p) => p.id === petId) ?? state.pets[0];
        if (!found) {
          get().showToast(
            "Không tìm thấy tài khoản",
            "Hãy chọn một tài khoản trong danh sách gợi ý bên dưới.",
            "warning",
          );
          return;
        }
        const already = state.circleMembers.some(
          (m) =>
            m.relationLabel.toLowerCase() === found.tag.toLowerCase() ||
            m.displayName.toLowerCase().includes(found.displayName.toLowerCase()),
        );
        if (already) {
          get().showToast(
            "Đã gửi lời mời trước đó",
            `${found.displayName} (${found.tag}) đã có trong danh sách chăm cùng.`,
            "info",
          );
          return;
        }
        const newMember: CircleMember = {
          id: `cm-${Date.now()}`,
          householdId: "hh-mai",
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
              householdId: "hh-mai",
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
          `${found.displayName} (${found.tag}) sẽ nhận được thông báo để xác nhận chăm bé ${pet.name}.`,
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
              : n,
          ),
        }));

        if (accept) {
          const exists = state.pets.some((p) => p.id === payload.petId);
          if (!exists) {
            const sharedPet: PetProfile = {
              id: payload.petId,
              householdId: "hh-shared",
              ownerId: "user-minh",
              name: payload.petName,
              species: payload.petSpecies,
              breed: payload.petBreed,
              gender: "male",
              dateOfBirth: "2025-03-10",
              ageDisplay: payload.petAgeLabel,
              weightKg: payload.petWeightKg,
              sizeCategory: classifyPetSizeByWeight(payload.petWeightKg),
              energyLevel: "high",
              avatarUrl: payload.petAvatarUrl,
              coverPhotoUrl: payload.petAvatarUrl,
              isNeutered: true,
              allergies: "Không có",
              medicalNotes: `Thú cưng chăm cùng với ${payload.fromUserName} (${payload.fromUserTag})`,
              vetName: "Phòng khám PetCare Q9",
              vetContact: "0909 112 233",
              vaccinationStatus: "full",
              lastVaccineDate: "2026-09-10",
              isPublic: true,
              followerCount: 45,
              behaviors: [
                {
                  id: `sh-b-1`,
                  petId: payload.petId,
                  category: "personality",
                  label: "Hoạt bát",
                },
                {
                  id: `sh-b-2`,
                  petId: payload.petId,
                  category: "good_habit",
                  label: `Chăm cùng ${payload.fromUserTag}`,
                },
              ],
              vaccinations: [
                {
                  id: `sh-vac-1`,
                  petId: payload.petId,
                  vaccineName: "Vắc-xin 7 bệnh & Phòng dại",
                  dateGiven: "2026-09-10",
                  nextDueDate: "2027-09-10",
                  vetName: "Phòng khám PetCare Q9",
                  verified: true,
                },
              ],
              weightHistory: [{ date: "10/2026", weightKg: payload.petWeightKg }],
            };
            const sharedTask: CareTask = {
              id: `task-shared-${Date.now()}`,
              householdId: "hh-shared",
              petId: payload.petId,
              createdBy: "user-minh",
              assignedTo: state.user.id,
              assignedToName: state.user.displayName,
              title: `Cho bé ${payload.petName} ăn chiều & đi dạo 20 phút`,
              description: `Chăm cùng với ${payload.fromUserName} (${payload.fromUserTag})`,
              category: "walk",
              isRecurring: false,
              dueDate: "2026-10-29",
              dueTime: "17:30",
              status: "pending",
              reminderEnabled: true,
            };
            set((prev) => ({
              pets: [...prev.pets, sharedPet],
              activePetId: sharedPet.id,
              careTasks: [sharedTask, ...prev.careTasks],
            }));
          }
          get().showToast(
            `Đã nhận chăm cùng bé ${payload.petName}`,
            `Hồ sơ của ${payload.petName} đã được thêm vào danh sách thú cưng của bạn.`,
          );
        } else {
          get().showToast(
            "Đã từ chối lời mời",
            `Bạn đã bỏ qua lời mời từ ${payload.fromUserTag}.`,
            "info",
          );
        }
      },

      markAllNotificationsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
        }));
      },

      startChatWithUserTag: (userTag) => {
        const state = get();
        const found = state.searchableUsers.find(
          (u) => u.tag.toLowerCase() === userTag.toLowerCase(),
        );
        if (!found) return;
        const existing = state.conversations.find((c) =>
          c.subtitle.toLowerCase().includes(found.tag.toLowerCase()),
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
                      nextDueDate: "2027-10-29",
                      vetName,
                      verified: true,
                    },
                    ...pet.vaccinations,
                  ],
                }
              : pet,
          ),
        }));
        get().showToast(
          "Đã cập nhật sổ tiêm điện tử",
          `Mũi tiêm "${vaccineName}" đã được lưu.`,
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
              : pet,
          ),
        }));
        get().showToast(
          "Đã cập nhật hành vi Boss",
          `Đã thêm "${label.trim()}" vào hồ sơ.`,
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
              : task,
          ),
          circleActivities: willBeDone
            ? [
                {
                  id: `act-${Date.now()}`,
                  householdId: "hh-mai",
                  actorId: state.user.id,
                  actorName: state.user.displayName,
                  actorAvatar: state.user.avatarUrl,
                  actionText: `đã hoàn thành "${target.title}" vừa xong`,
                  detailText:
                    note || "Đã xác nhận hoàn tất trong Vòng chăm sóc.",
                  photoUrl,
                  createdAt: "Vừa xong",
                },
                ...state.circleActivities,
              ]
            : state.circleActivities,
          metrics: willBeDone
            ? {
                ...state.metrics,
                northStarQualifiedHouseholds:
                  state.metrics.northStarQualifiedHouseholds + 1,
              }
            : state.metrics,
        }));

        if (willBeDone) {
          get().trackEvent("care_task_completed", {
            assigned: target.assignedTo !== get().user.id,
          });
          get().showToast(
            "Đã hoàn thành công việc",
            `Các thành viên chăm cùng đã nhận cập nhật "${target.title}".`,
          );
        }
      },

      createCareTask: (payload) => {
        const assignee = get().circleMembers.find(
          (m) => m.userId === payload.assignedTo,
        );
        const newTask: CareTask = {
          id: `task-${Date.now()}`,
          householdId: "hh-mai",
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
        get().trackEvent("first_care_task_created", {});
        get().showToast(
          "Đã tạo việc chăm sóc",
          `Đã giao cho ${newTask.assignedToName} lúc ${newTask.dueTime}.`,
        );
      },

      inviteCircleMember: (displayName, relationLabel, role) => {
        const state = get();
        if (!state.user.isVip && state.circleMembers.length >= 3) {
          get().setActiveModal("vip_upgrade");
          get().showToast(
            "Giới hạn gói Free (3 thành viên Circle)",
            "Nâng cấp Sen VIP để mời không giới hạn người thân vào Vòng chăm sóc!",
            "warning",
          );
          return;
        }

        const code = `PAWTY-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
        const newMember: CircleMember = {
          id: `cm-${Date.now()}`,
          householdId: "hh-mai",
          userId: `user-${Date.now()}`,
          displayName,
          avatarUrl:
            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80",
          relationLabel,
          role,
          inviteCode: code,
          status: "active",
          joinedAt: "Hôm nay",
        };

        set((prev) => ({
          circleMembers: [...prev.circleMembers, newMember],
          circleActivities: [
            {
              id: `act-${Date.now()}`,
              householdId: "hh-mai",
              actorId: prev.user.id,
              actorName: prev.user.displayName,
              actorAvatar: prev.user.avatarUrl,
              actionText: `đã mời ${displayName} (${relationLabel}) vào Vòng chăm sóc`,
              detailText: `Mã mời: ${code} · Quyền: ${role}`,
              createdAt: "Vừa xong",
            },
            ...prev.circleActivities,
          ],
        }));

        get().trackEvent("first_circle_invite_sent", {});
        get().showToast(
          "Đã thêm vào Vòng chăm sóc 🤝",
          `${displayName} đã có thể nhận việc chăm Boss.`,
        );
      },

      revokeCircleMember: (memberId) => {
        set((state) => ({
          circleMembers: state.circleMembers.filter(
            (m) => m.id !== memberId || m.role === "owner",
          ),
        }));
        get().showToast(
          "Đã thu hồi quyền Circle",
          "Thành viên đã được gỡ khỏi hộ chăm sóc.",
          "info",
        );
      },

      toggleHandoverChecklistItem: (itemId) => {
        set((state) => ({
          handoverNote: {
            ...state.handoverNote,
            checklist: state.handoverNote.checklist.map((item) =>
              item.id === itemId ? { ...item, checked: !item.checked } : item,
            ),
          },
        }));
      },

      createSocialPost: (payload) => {
        const moderation = moderatePetContent(
          payload.textContent,
          payload.contentType,
        );
        if (!moderation.allowed) {
          get().showToast(
            "Bài viết bị chặn bởi Hệ thống Kiểm duyệt 🛡️",
            moderation.blockedReason ||
              "Nội dung vi phạm chính sách cộng đồng Pawty.",
            "danger",
          );
          return { ok: false, error: moderation.blockedReason };
        }

        const state = get();
        const activePet =
          state.pets.find((p) => p.id === state.activePetId) ?? state.pets[0];

        const mergedHashtags = Array.from(
          new Set([...payload.hashtags, ...moderation.suggestedHashtags]),
        );

        const newPost: SocialPost = {
          id: `post-${Date.now()}`,
          authorId: state.user.id,
          authorName: state.user.displayName,
          authorUsername: state.user.username,
          authorAvatar: state.user.avatarUrl,
          authorIsVip: state.user.isVip,
          petIds: [activePet.id],
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

        set((prev) => ({
          posts: [newPost, ...prev.posts],
          activeModal: null,
          activeTab: "explore",
          exploreSubTab: payload.contentType === "question" ? "qa" : "feed",
        }));

        get().trackEvent("post_created", {
          content_type: payload.contentType,
          has_media: Boolean(payload.imageUrl),
        });

        get().showToast(
          moderation.hasHealthDisclaimer
            ? "Đã đăng kèm lưu ý y khoa"
            : "Đã đăng bài viết mới",
          moderation.hasHealthDisclaimer
            ? "Đã đính kèm khuyến cáo tham khảo bác sĩ thú y."
            : `Bài viết của ${activePet.name} đã hiển thị trên bảng tin.`,
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
                breakdown[prevReaction] - 1,
              );
            }
            if (!isRemoving) {
              breakdown[reaction] = (breakdown[reaction] || 0) + 1;
            }

            const totalPaws = Object.values(breakdown).reduce(
              (sum, val) => sum + val,
              0,
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
        get().trackEvent("post_reacted", { reaction_type: reaction });
      },

      addCommentToPost: (postId, textContent) => {
        if (!textContent.trim()) return;
        const moderation = moderatePetContent(textContent, "moment");
        if (!moderation.allowed) {
          get().showToast(
            "Bình luận bị từ chối 🛡️",
            moderation.blockedReason || "Vi phạm quy tắc.",
            "danger",
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
              : post,
          ),
        }));
        get().trackEvent("comment_created", {});
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
                  post.engagement.saveCount + (nextSaved ? 1 : -1),
                ),
              },
            };
          }),
        }));
        get().showToast(
          "Đã lưu bài viết",
          `Đã lưu vào mục "${folderName}".`,
          "info",
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
              : grp,
          ),
        }));
      },

      swipeRadarCandidate: (candidateId, direction) => {
        const state = get();
        if (state.user.radarLockedUntil) {
          get().showToast(
            "Radar đang tạm khóa 3 ngày ⚠️",
            "Tài khoản bị báo cáo bùng kèo hẹn dạo 2 lần/tuần (Chính sách Anti-Flake).",
            "danger",
          );
          return;
        }

        if (!state.user.isVip && state.user.dailySwipeCount >= 10) {
          get().setActiveModal("vip_upgrade");
          get().showToast(
            "Hết 10 lượt quẹt miễn phí hôm nay 👑",
            "Nâng cấp Sen VIP (49k/tháng) để quẹt không giới hạn và ưu tiên hiển thị x3!",
            "warning",
          );
          return;
        }

        const candidate = state.radarCandidates.find(
          (c) => c.id === candidateId,
        );
        if (!candidate) return;

        const activePet =
          state.pets.find((p) => p.id === state.activePetId) ?? state.pets[0];

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
            (c) => c.id === newConvId,
          );

          set((prev) => ({
            radarCandidates: prev.radarCandidates.filter(
              (c) => c.id !== candidateId,
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
                    lastMessageText: `🎉 Đã ghép đôi! Hãy rủ ${candidate.pet.name} đi dạo nhé.`,
                    lastMessageAt: "Vừa xong",
                  },
                  ...prev.conversations,
                ],
            messagesByConversation: existingConv
              ? prev.messagesByConversation
              : {
                  ...prev.messagesByConversation,
                  [newConvId]: [
                    {
                      id: `msg-${Date.now()}`,
                      conversationId: newConvId,
                      senderId: candidate.userId,
                      senderName: candidate.ownerName,
                      senderAvatar: candidate.ownerAvatar,
                      messageType: "text",
                      textContent: `Chào ${prev.user.displayName}! Mình và bé ${candidate.pet.name} cũng ở gần ${candidate.neighborhood} nè, hôm nào hẹn dắt dạo chung nhé! 🐾`,
                      isRead: false,
                      createdAt: "Vừa xong",
                    },
                  ],
                },
          }));

          get().trackEvent("match_created", {});
        } else {
          set((prev) => ({
            radarCandidates: prev.radarCandidates.filter(
              (c) => c.id !== candidateId,
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
          state.pets.find((p) => p.id === state.activePetId) ?? state.pets[0];
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
          textContent: `📅 Lời hẹn dắt dạo tại ${payload.locationName} (${payload.scheduledDate} · ${payload.scheduledTime})`,
          walkAppointmentId: newWalkId,
          isRead: true,
          createdAt: "Vừa xong",
        };

        set((prev) => ({
          walkAppointments: [newAppointment, ...prev.walkAppointments],
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
                  lastMessageText: `📅 Hẹn dắt dạo: ${payload.locationName}`,
                  lastMessageAt: "Vừa xong",
                }
              : c,
          ),
        }));

        get().showToast(
          "Đã gửi lời hẹn đi dạo",
          `Địa điểm: ${payload.locationName}`,
        );
      },

      updateWalkAppointmentStatus: (appointmentId, status) => {
        const state = get();
        const nextNoShowCount =
          status === "no_show"
            ? state.user.noShowCount + 1
            : state.user.noShowCount;
        const lockedUntil =
          nextNoShowCount >= 2
            ? new Date(Date.now() + 3 * 24 * 3600 * 1000).toLocaleDateString(
                "vi-VN",
              )
            : state.user.radarLockedUntil;

        set((prev) => ({
          walkAppointments: prev.walkAppointments.map((apt) =>
            apt.id === appointmentId ? { ...apt, status } : apt,
          ),
          user: {
            ...prev.user,
            noShowCount: nextNoShowCount,
            radarLockedUntil: lockedUntil,
          },
        }));

        if (status === "confirmed") {
          get().trackEvent("appointment_confirmed", {});
          get().showToast(
            "Đã chấp nhận kèo hẹn dắt dạo! 🐕",
            "Hệ thống sẽ nhắc lịch trước 1 giờ.",
          );
        } else if (status === "no_show") {
          get().showToast(
            nextNoShowCount >= 2
              ? "Ghi nhận bùng kèo lần 2 — Khóa Radar 3 ngày! 🚨"
              : "Đã ghi nhận báo cáo bùng kèo (No-Show lần 1) ⚠️",
            nextNoShowCount >= 2
              ? "Theo cơ chế Anti-Flake (Tầng 5), tài khoản bùng hẹn 2 lần/tuần bị khóa Radar 3 ngày."
              : "Vi phạm lần 1: Cảnh báo và giảm ưu tiên hiển thị Radar 24h.",
            "warning",
          );
        }
      },

      sendChatMessage: (
        conversationId,
        textContent,
        messageType = "text",
        extra = {},
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
                      ? "🎤 Tin nhắn thoại"
                      : newMsg.textContent,
                  lastMessageAt: "Vừa xong",
                }
              : c,
          ),
        }));
      },

      createServiceBooking: (payload) => {
        const state = get();
        const partner =
          state.partners.find((p) => p.id === payload.partnerId) ??
          state.partners[0];
        const pet =
          state.pets.find((p) => p.id === payload.petId) ?? state.pets[0];
        const chosenServices = partner.services.filter((s) =>
          payload.serviceIds.includes(s.id),
        );
        const totalVnd =
          chosenServices.reduce((sum, s) => sum + s.priceVnd, 0) || 150000;
        const commissionVnd = Math.round(
          (totalVnd * partner.commissionRatePercent) / 100,
        );

        const newBooking: ServiceBooking = {
          id: `bk-${Date.now()}`,
          userId: state.user.id,
          userName: state.user.displayName,
          partnerId: partner.id,
          partnerName: partner.name,
          partnerType: partner.type,
          partnerAvatar: partner.avatarUrl,
          petId: pet.id,
          petName: pet.name,
          serviceNames: chosenServices.map((s) => s.name),
          totalPriceVnd: totalVnd,
          commissionVnd,
          scheduledDate: payload.scheduledDate,
          scheduledTime: payload.scheduledTime,
          note: payload.note,
          status: "pending",
          hasReviewed: false,
          opsMinutesSpent: 5,
          createdAt: new Date().toISOString(),
        };

        set((prev) => ({
          bookings: [newBooking, ...prev.bookings],
          activeModal: null,
        }));

        get().trackEvent("first_booking_made", { service_type: partner.type });
        get().showToast(
          "Đã gửi yêu cầu đặt lịch",
          `${partner.name} sẽ xác nhận lịch cho bé ${pet.name} sớm nhất.`,
        );
      },

      updateBookingStatus: (bookingId, status) => {
        const target = get().bookings.find((b) => b.id === bookingId);
        if (!target) return;

        set((state) => ({
          bookings: state.bookings.map((bk) =>
            bk.id === bookingId ? { ...bk, status } : bk,
          ),
          metrics:
            status === "completed"
              ? {
                  ...state.metrics,
                  bookingCommissionRevenueVnd:
                    state.metrics.bookingCommissionRevenueVnd +
                    target.commissionVnd,
                  mrrVnd: state.metrics.mrrVnd + target.commissionVnd,
                  northStarQualifiedHouseholds:
                    state.metrics.northStarQualifiedHouseholds + 1,
                }
              : state.metrics,
        }));

        if (status === "completed") {
          get().trackEvent("booking_completed", {});
          get().showToast(
            "Dịch vụ đã hoàn tất! 🌟",
            `Hoa hồng đối tác (+${target.commissionVnd.toLocaleString("vi-VN")}đ) đã được ghi nhận.`,
          );
        } else {
          get().showToast(
            "Đã cập nhật trạng thái Booking",
            `Trạng thái mới: ${status.toUpperCase()}`,
          );
        }
      },

      submitPartnerReview: (bookingId, rating, textContent) => {
        const state = get();
        const booking = state.bookings.find((b) => b.id === bookingId);
        if (!booking) return;

        set((prev) => ({
          bookings: prev.bookings.map((b) =>
            b.id === bookingId ? { ...b, hasReviewed: true } : b,
          ),
          partners: prev.partners.map((partner) =>
            partner.id === booking.partnerId
              ? {
                  ...partner,
                  reviewCount: partner.reviewCount + 1,
                  reviews: [
                    {
                      id: `rev-${Date.now()}`,
                      bookingId,
                      userId: prev.user.id,
                      userName: prev.user.displayName,
                      userAvatar: prev.user.avatarUrl,
                      petName: booking.petName,
                      rating,
                      textContent,
                      photos: [],
                      createdAt: "Vừa xong",
                    },
                    ...partner.reviews,
                  ],
                }
              : partner,
          ),
        }));
        get().showToast(
          "Cảm ơn đánh giá từ giao dịch thật! ⭐",
          "Đánh giá đã gắn vào hồ sơ Đối tác.",
        );
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
            vipExpiresAt:
              plan === "sen_vip_yearly" ? "29/10/2027" : "29/11/2026",
          },
          activeModal: null,
          metrics: {
            ...state.metrics,
            vipSubscriptionRevenueVnd:
              state.metrics.vipSubscriptionRevenueVnd + priceMap[plan],
            mrrVnd: state.metrics.mrrVnd + priceMap[plan],
          },
        }));
        get().trackEvent("vip_subscription_started", { plan });
        get().showToast(
          "Đã nâng cấp gói VIP",
          "Đã mở khóa toàn bộ tính năng nâng cao cho tài khoản của bạn.",
        );
      },

      activateSosAlert: (payload) => {
        const state = get();
        const pet =
          state.pets.find((p) => p.id === payload.petId) ?? state.pets[0];
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
          sightings: [
            {
              id: `sight-${Date.now()}`,
              reporterId: "user-hoa",
              reporterName: "Hòa Trần (Cư dân Origami)",
              reporterPhone: "0903 221 144",
              locationName: "Cổng phụ Công viên Ánh Sáng (Cách 350m)",
              note: "Mình vừa thấy bé giống hệt đang chạy gần bãi cỏ khu B!",
              createdAt: "Vừa xong",
            },
          ],
          createdAt: "Vừa phát tín hiệu",
        };

        set((prev) => ({
          sosAlerts: [newSos, ...prev.sosAlerts],
          activeModal: null,
          activeTab: "explore",
          exploreSubTab: "feed",
          metrics: {
            ...prev.metrics,
            sosRevenueVnd: prev.metrics.sosRevenueVnd + 39000,
            mrrVnd: prev.metrics.mrrVnd + 39000,
          },
        }));

        get().trackEvent("sos_activated", {});
        get().showToast(
          "Đã phát thông báo tìm thú lạc 3km",
          `Các chủ nuôi quanh ${payload.lastSeenLocation} đã nhận được thông báo hỗ trợ.`,
          "danger",
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
              : alert,
          ),
        }));
        get().showToast(
          "Đã gửi vị trí nhìn thấy Boss! 📍",
          "Chủ nuôi đã nhận được thông báo real-time.",
        );
      },

      markSosFound: (alertId) => {
        set((state) => ({
          sosAlerts: state.sosAlerts.map((alert) =>
            alert.id === alertId ? { ...alert, status: "found" } : alert,
          ),
        }));
        get().showToast(
          "Mừng Boss đã về nhà an toàn! 🎉",
          "Đã đóng cảnh báo SOS và cảm ơn cộng đồng.",
        );
      },

      submitContentReport: (
        targetType,
        targetId,
        targetPreview,
        reason,
        description,
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
        get().trackEvent("report_submitted", {
          target_type: targetType,
          reason,
        });
        get().showToast(
          "Đã gửi báo cáo kiểm duyệt 🛡️",
          "Đội ngũ Moderator sẽ xử lý trong vòng 24 giờ.",
        );
      },

      resolveContentReport: (reportId, actionTaken) => {
        set((state) => ({
          reports: state.reports.map((r) =>
            r.id === reportId ? { ...r, status: "resolved", actionTaken } : r,
          ),
        }));
        get().showToast(
          "Đã xử lý báo cáo vi phạm",
          `Hành động: ${actionTaken}`,
        );
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
          "Đã lưu cài đặt Quyền riêng tư 🔒",
          "Tuân thủ Luật BVDLCN 91/2025/QH15.",
        );
      },

      resetAllDemoData: () => {
        localStorage.removeItem("pawty-super-app-storage-v2");
        window.location.reload();
      },
    }),
    {
      name: "pawty-super-app-storage-v2",
    },
  ),
);
