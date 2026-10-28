import { apiRequest } from './client';
import {
  User, Pet, RadarItem, MomentItem, MomentComment, ChatRoom, ChatMessage,
  WalkAppointment, PetFriendlyPlace, PlaceReview, Club, EventItem,
  NotificationItem, ReminderItem, BadgeItem, VoucherItem, SosAlert, PublicConfig,
} from '../types';

export const api = {
  getConfig: () => apiRequest<PublicConfig>('GET', '/config/public'),
  register: (body: { username: string; password: string; fullName: string; condoComplex?: string; referralCode?: string }) =>
    apiRequest<{ token: string; user: User; isNewUser: boolean }>('POST', '/auth/register', body),
  login: (body: { username: string; password: string }) =>
    apiRequest<{ token: string; user: User }>('POST', '/auth/login', body),
  googleLogin: (body: { email: string; fullName?: string; avatarUrl?: string; idToken?: string; referralCode?: string }) =>
    apiRequest<{ token: string; user: User; isNewUser: boolean }>('POST', '/auth/google', body),
  sendOtp: (phone: string) => apiRequest<{ sessionInfo: string }>('POST', '/auth/send-otp', { phone }),
  verifyOtp: (phone: string, otpCode: string, referralCode?: string) =>
    apiRequest<{ token: string; user: User; isNewUser: boolean }>('POST', '/auth/verify-otp', { phone, otpCode, referralCode }),
  socialLogin: (provider: 'google' | 'apple', phone: string) =>
    apiRequest<{ token: string; user: User; isNewUser: boolean }>('POST', '/auth/social', { provider, idToken: 'sandbox_token', phone }),
  getMe: () => apiRequest<User>('GET', '/users/me'),
  updateMe: (data: Partial<User>) => apiRequest<User>('PATCH', '/users/me', data),
  deleteMe: () => apiRequest<{ scheduledHardDeleteAt: string }>('DELETE', '/users/me'),
  exportMe: () => apiRequest<Record<string, unknown>>('GET', '/users/me/export'),
  getBlocks: () => apiRequest<{ id: string; fullName: string; avatarUrl: string; phone: string }[]>('GET', '/users/blocks'),
  blockUser: (blockedUserId: string) => apiRequest<{ blocked: boolean }>('POST', '/users/blocks', { blockedUserId }),
  unblockUser: (userId: string) => apiRequest<{ blocked: boolean }>('DELETE', `/users/blocks/${userId}`),
  createReport: (targetType: string, targetId: string, reason: string, detail?: string) =>
    apiRequest<{ reportId: string }>('POST', '/reports', { targetType, targetId, reason, detail }),

  getMyPets: () => apiRequest<Pet[]>('GET', '/pets/me'),
  getPetById: (id: string) => apiRequest<Pet>('GET', `/pets/${id}`),
  createPet: (data: Partial<Pet>) => apiRequest<Pet>('POST', '/pets', data),
  setPrimaryPet: (id: string) => apiRequest<{ success: boolean }>('POST', `/pets/${id}/primary`),
  uploadVaccineProof: (petId: string, body: { proofUrls: string[]; vaccineDetails?: string; lastVaccineDate?: string; nextDueDate?: string }) =>
    apiRequest<Pet>('POST', `/pets/${petId}/vaccine-proof`, body),

  getRadar: (params: { lat: number; lng: number; radius?: number; species?: string; size?: string; verifiedOnly?: boolean; walkingNow?: boolean }) => {
    const q = new URLSearchParams({
      lat: String(params.lat), lng: String(params.lng), radius: String(params.radius || 1500),
      ...(params.species && params.species !== 'all' ? { species: params.species } : {}),
      ...(params.size && params.size !== 'all' ? { size: params.size } : {}),
      ...(params.verifiedOnly ? { verifiedOnly: 'true' } : {}),
      ...(params.walkingNow ? { walkingNow: 'true' } : {}),
    });
    return apiRequest<{ items: RadarItem[]; radiusMeters: number; totalFound: number }>('GET', `/radar?${q.toString()}`);
  },
  swipePet: (targetPetId: string, action: 'like' | 'dislike' | 'superlike') =>
    apiRequest<{ isMatch: boolean; status: string; roomId?: string; quota: { swipesLeft: number; superLikesLeft: number } }>('POST', '/matches', { targetPetId, action }),
  rewindSwipe: () => apiRequest<{ restoredPet: Pet; quota: { swipesLeft: number; superLikesLeft: number } }>('POST', '/matches/rewind'),
  getLikesMe: () => apiRequest<{ count: number; items: Pet[] }>('GET', '/matches/likes-me'),
  activateBoost: () => apiRequest<{ boostExpiresAt: string }>('POST', '/boosts/activate'),

  getLiveWalkers: (lat: number, lng: number) =>
    apiRequest<{ pet: Pet; distanceGridMeters: number; condoComplex?: string; walkingMinutesLeft: number }[]>('GET', `/walks/live?lat=${lat}&lng=${lng}&radius=1500`),
  startWalk: (lat: number, lng: number, petId?: string) => apiRequest<{ walkingUntil: string }>('POST', '/walks/start', { lat, lng, petId }),
  heartbeatWalk: (lat: number, lng: number) => apiRequest<{ walkingUntil: string }>('POST', '/walks/heartbeat', { lat, lng }),
  stopWalk: () => apiRequest<{ distanceMeters: number; streakDays: number; newBadges: string[] }>('POST', '/walks/stop', {}),

  getFeed: (filter: 'area' | 'mine') =>
    apiRequest<{ items: MomentItem[] }>('GET', filter === 'area' ? '/feed?lat=10.7951&lng=106.7218&radius=3000' : '/moments?filter=mine'),
  createMoment: (mediaUrl: string, caption: string) => apiRequest<MomentItem>('POST', '/moments', { mediaUrl, caption }),
  toggleLikeMoment: (id: string) => apiRequest<{ liked: boolean; likesCount: number }>('POST', `/moments/${id}/like`),
  getComments: (momentId: string) => apiRequest<{ items: MomentComment[] }>('GET', `/moments/${momentId}/comments`),
  postComment: (momentId: string, text: string) => apiRequest<MomentComment>('POST', `/moments/${momentId}/comments`, { text }),
  getShareMoment: (momentId: string) => apiRequest<{ shareUrl: string; imageUrl: string; caption: string; watermark: string }>('GET', `/moments/${momentId}/share`),

  getChatRooms: () => apiRequest<ChatRoom[]>('GET', '/chat/rooms'),
  getMessages: (roomId: string) => apiRequest<{ items: ChatMessage[] }>('GET', `/chat/rooms/${roomId}/messages`),
  getIcebreakers: (roomId: string) => apiRequest<{ suggestions: string[] }>('GET', `/chat/rooms/${roomId}/icebreakers`),
  createAppointment: (body: Partial<WalkAppointment>) => apiRequest<WalkAppointment>('POST', '/appointments', body),
  updateAppointmentStatus: (id: string, status: 'confirmed' | 'rejected' | 'reported_flake') =>
    apiRequest<WalkAppointment>('PATCH', `/appointments/${id}/status`, { status }),
  checkInAppointment: (id: string, lat: number, lng: number) =>
    apiRequest<{ checkedIn: boolean; isCompleted: boolean; newBadges: string[] }>('POST', `/appointments/${id}/check-in`, { lat, lng }),

  getPlaceSuggestions: (petAId: string, petBId: string) =>
    apiRequest<{ midpoint: { lat: number; lng: number }; places: PetFriendlyPlace[] }>('GET', `/places/suggestions?petAId=${petAId}&petBId=${petBId}`),
  getPlaces: (category?: string, q?: string) =>
    apiRequest<{ items: PetFriendlyPlace[] }>('GET', `/places?category=${category || ''}&q=${q || ''}`),
  getPlaceById: (id: string) => apiRequest<PetFriendlyPlace>('GET', `/places/${id}`),
  addPlaceReview: (placeId: string, rating: number, text: string) =>
    apiRequest<PlaceReview>('POST', `/places/${placeId}/reviews`, { rating, text }),

  getClubs: () => apiRequest<{ items: Club[] }>('GET', '/clubs'),
  getClubById: (id: string) => apiRequest<Club & { upcomingEvents?: EventItem[] }>('GET', `/clubs/${id}`),
  createClub: (body: Partial<Club>) => apiRequest<Club>('POST', '/clubs', body),
  joinLeaveClub: (id: string, join: boolean) => apiRequest<Club>('POST', `/clubs/${id}/${join ? 'join' : 'leave'}`),
  getEvents: () => apiRequest<{ items: EventItem[] }>('GET', '/events?upcoming=true'),
  createEvent: (body: Partial<EventItem>) => apiRequest<EventItem>('POST', '/events', body),
  rsvpEvent: (id: string, status: 'going' | 'maybe' | 'none') => apiRequest<{ rsvpCount: number }>('POST', `/events/${id}/rsvp`, { status }),

  getReminders: () => apiRequest<ReminderItem[]>('GET', '/reminders'),
  createReminder: (body: { petId: string; kind: 'vaccine' | 'deworm' | 'custom'; title: string; dueDate: string }) =>
    apiRequest<ReminderItem>('POST', '/reminders', body),
  toggleReminder: (id: string, isDone: boolean) => apiRequest<ReminderItem>('PATCH', `/reminders/${id}`, { isDone }),
  getNotifications: () => apiRequest<{ items: NotificationItem[]; unreadCount: number }>('GET', '/notifications'),
  markNotificationsRead: (ids?: string[]) => apiRequest<{ success: boolean }>('POST', '/notifications/read', { ids }),
  getBadges: () => apiRequest<{ earned: BadgeItem[]; locked: BadgeItem[] }>('GET', '/badges/me'),
  getReferrals: () => apiRequest<{ code: string; invitedCount: number; rewardDaysGranted: number; shareUrl: string }>('GET', '/referrals/me'),
  getStreak: () => apiRequest<{ streakDays: number; lastWalkDate?: string; totalWalkMeters: number; recentWalks: { id: string; date: string; distanceMeters: number; durationMinutes: number; source: string }[] }>('GET', '/streak/me'),

  createQrPayment: (serviceType: string, plan?: 'month' | 'year') =>
    apiRequest<{ transactionId: string; qrCodeUrl: string; bankName: string; accountNo: string; amount: number; paymentCode: string; expiresAt: string }>('POST', '/payments/create-qr', { serviceType, plan }),
  getPaymentStatus: (txId: string) => apiRequest<{ status: string }>('GET', `/payments/${txId}`),
  confirmSandboxPayment: (transactionId: string, serviceType: string) =>
    apiRequest<{ status: string; user: User }>('POST', '/payments/sandbox/confirm', { transactionId, serviceType }),
  createSos: (body: Partial<SosAlert>) => apiRequest<SosAlert>('POST', '/sos', body),
  getNearbySos: () => apiRequest<SosAlert[]>('GET', '/sos/nearby?lat=10.7951&lng=106.7218'),
  resolveSos: (id: string) => apiRequest<SosAlert>('POST', `/sos/${id}/resolve`),
  trackAdImpression: (adId: string) => apiRequest<{ ok: boolean }>('POST', `/ads/${adId}/impression`),
  trackAdClick: (adId: string) => apiRequest<{ ok: boolean }>('POST', `/ads/${adId}/click`),
  saveAdVoucher: (adId: string) => apiRequest<VoucherItem>('POST', `/ads/${adId}/save-voucher`),
  getMyVouchers: () => apiRequest<VoucherItem[]>('GET', '/vouchers/me'),
};
