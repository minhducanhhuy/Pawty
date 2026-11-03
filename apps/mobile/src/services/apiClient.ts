import { Platform } from 'react-native';
import Constants from 'expo-constants';

function getDevApiHost(): string {
  // 1. Khi chay tren Web / Browser, ket noi truc tiep localhost:3000
  if (Platform.OS === 'web') {
    return 'http://localhost:3000';
  }

  // 2. Khi chay voi Expo Metro bundler tren thiet bi that (Expo Go)
  // hostUri la dia chi IP may chu Metro ma dien thoai quet QR ket noi toi (vd: 192.168.1.5)
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest2?.extra?.expoClient?.hostUri ||
    (Constants as any).manifest?.debuggerHost;

  if (hostUri) {
    const host = hostUri.split(':')[0];
    if (host && host !== 'localhost' && host !== '127.0.0.1') {
      return `http://${host}:3000`;
    }
  }

  // 3. Fallback bien moi truong hoac localhost
  if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  return 'http://localhost:3000';
}

export const API_BASE_URL = getDevApiHost();

console.log('[Pawty API] Connected Gateway URL:', API_BASE_URL);

export class ApiRequestError extends Error {
  public readonly status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const controller = new AbortController();
  // Tăng timeout lên 20s để đảm bảo tải lên nhiều ảnh Base64 không bị ngắt kết nối sớm
  const timeoutId = setTimeout(() => controller.abort(), 20000);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));
      const msg = errorBody.error || errorBody.message || `Lỗi máy chủ (${res.status})`;
      throw new ApiRequestError(msg, res.status);
    }

    return await res.json();
  } catch (error: any) {
    if (error instanceof ApiRequestError) {
      throw error;
    }
    if (
      error.name === 'AbortError' ||
      String(error?.message || '').includes('Fetch request has been canceled') ||
      String(error?.message || '').includes('canceled')
    ) {
      console.warn(`[Pawty API] Timeout / Canceled requesting ${endpoint}`);
      throw new Error(
        'Kết nối tới máy chủ bị gián đoạn hoặc quá hạn (Timeout). Vui lòng thử lại.'
      );
    }
    if (
      error instanceof TypeError ||
      String(error?.message || '').includes('Network request failed') ||
      String(error?.message || '').includes('Failed to fetch')
    ) {
      throw new Error(
        'Không thể kết nối tới máy chủ hoặc Cơ sở dữ liệu PostgreSQL. Vui lòng kiểm tra kết nối Backend & Database.'
      );
    }
    console.warn(`[Pawty API] Error requesting ${endpoint}:`, error);
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

export const apiClient = {
  // 0. Authentication (Phone / Username + Password)
  async login(identifier: string, password?: string) {
    return request<{ success: boolean; token: string; user: any; message: string }>(
      '/api/auth/login',
      {
        method: 'POST',
        body: JSON.stringify({ identifier, password }),
      }
    );
  },

  async register(data: {
    phone: string;
    username?: string;
    password?: string;
    displayName?: string;
    petName?: string;
    petSpecies?: string;
    petBreed?: string;
    petGender?: string;
    petBirthDate?: string;
    petWeightKg?: number;
    petAvatarUrl?: string;
    petVaccinated?: boolean;
  }) {
    return request<{ success: boolean; token: string; user: any; message: string }>(
      '/api/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  },

  // 1. Bootstrap (Full PostgreSQL state)
  async getBootstrapData(userId?: string) {
    const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    return request<any>(`/api/bootstrap${query}`);
  },

  // Media Upload (Cloudinary)
  async uploadImage(image: string, folder = 'pawty/media') {
    const res = await request<{ success: boolean; url: string }>('/api/upload', {
      method: 'POST',
      body: JSON.stringify({ image, folder }),
    });
    return res?.url || image;
  },

  // 2. User & Profile
  async getMyProfile(userId?: string) {
    const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    return request<{ user: any }>(`/api/users/me${query}`);
  },

  async updateMyProfile(data: Record<string, any>) {
    return request<{ success?: boolean; user: any }>('/api/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async getUserProfile(handle: string, currentUserId = 'user-test1') {
    const cleanHandle = encodeURIComponent(handle);
    const query = currentUserId ? `?currentUserId=${encodeURIComponent(currentUserId)}` : '';
    const res = await request<{ success: boolean; profile: any }>(
      `/api/users/profile/${cleanHandle}${query}`
    );
    return res?.profile || null;
  },

  // 3. Pets CRUD
  async getPets(userId?: string) {
    const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    return request<{ pets: any[] }>(`/api/pets${query}`);
  },

  async createPet(petData: Record<string, any>) {
    return request<{ success: boolean; pet: any }>('/api/pets', {
      method: 'POST',
      body: JSON.stringify(petData),
    });
  },

  async updatePet(petId: string, petData: Record<string, any>) {
    return request<{ success: boolean; pet: any }>(`/api/pets/${encodeURIComponent(petId)}`, {
      method: 'PUT',
      body: JSON.stringify(petData),
    });
  },

  async deletePet(petId: string) {
    return request<{ success: boolean }>(`/api/pets/${encodeURIComponent(petId)}`, {
      method: 'DELETE',
    });
  },

  // 4. Feed Posts, Reactions & Comments
  async getFeedPosts() {
    return request<{ posts: any[] }>('/api/posts/feed');
  },

  async createPost(postData: {
    authorId: string;
    content: string;
    contentType?: 'moment' | 'question' | 'tip';
    mediaUrls?: string[];
    tags?: string[];
    locationDistrict?: string;
  }) {
    return request<{ success: boolean; post: any }>('/api/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  },

  async deletePost(postId: string, userId?: string) {
    const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    return request<{ success: boolean }>(`/api/posts/${encodeURIComponent(postId)}${query}`, {
      method: 'DELETE',
    });
  },

  async togglePostReaction(postId: string, userId: string) {
    return request<{ success: boolean; isLiked: boolean; likes: number }>(
      `/api/posts/${encodeURIComponent(postId)}/reactions`,
      {
        method: 'POST',
        body: JSON.stringify({ userId }),
      }
    );
  },

  async addPostComment(postId: string, authorId: string, text: string, parentId?: string) {
    return request<{ success: boolean; comment: any }>(
      `/api/posts/${encodeURIComponent(postId)}/comments`,
      {
        method: 'POST',
        body: JSON.stringify({ authorId, text, parentId }),
      }
    );
  },

  // 5. Social Graph (Friend Request, Respond, Unfriend, Follow)
  async sendFriendRequest(fromUserId: string, targetHandle: string) {
    return request<{
      success: boolean;
      friendStatus: 'pending_outgoing' | 'accepted';
      isFriend: boolean;
      conversationId?: string;
    }>('/api/social/friend-request', {
      method: 'POST',
      body: JSON.stringify({ fromUserId, targetHandle }),
    });
  },

  async respondFriendRequest(
    userId: string,
    requesterHandleOrId: string,
    action: 'accept' | 'decline',
    notificationId?: string
  ) {
    return request<{
      success: boolean;
      friendStatus: 'accepted' | 'none';
      isFriend: boolean;
      conversationId?: string;
    }>('/api/social/friend-respond', {
      method: 'POST',
      body: JSON.stringify({
        userId,
        requesterHandle: requesterHandleOrId,
        requesterId: requesterHandleOrId,
        action,
        notificationId,
      }),
    });
  },

  async unfriendUser(userId: string, targetHandle: string) {
    return request<{
      success: boolean;
      friendStatus: 'none';
      isFriend: boolean;
      conversationId?: string;
    }>('/api/social/unfriend', {
      method: 'POST',
      body: JSON.stringify({ userId, targetHandle }),
    });
  },

  async unmatchCandidate(userId: string, targetIdentifier: string) {
    return request<{
      success: boolean;
      message: string;
      targetId: string;
      targetHandle: string;
    }>('/api/matches/unmatch', {
      method: 'POST',
      body: JSON.stringify({ userId, targetIdentifier }),
    });
  },

  async toggleFollow(userId: string, targetHandle: string) {
    return request<{
      success: boolean;
      isFollowing: boolean;
      followersCount: number;
    }>('/api/social/follow', {
      method: 'POST',
      body: JSON.stringify({ userId, targetHandle }),
    });
  },

  // 6. Tinder / Radar Candidates, Likes You & Matches
  async getTinderCandidates(userId = 'user-test1', intent?: string, gender?: string) {
    let query = intent && intent !== 'all' ? `&intent=${encodeURIComponent(intent)}` : '';
    if (gender && gender !== 'all' && gender !== 'Mọi người') {
      query += `&gender=${encodeURIComponent(gender)}`;
    }
    return request<{ candidates: any[] }>(
      `/api/tinder/candidates?userId=${encodeURIComponent(userId)}${query}`
    );
  },

  async getLikesYouCandidates(userId = 'user-test1') {
    return request<{ likesYou: any[] }>(
      `/api/tinder/likes-you?userId=${encodeURIComponent(userId)}`
    );
  },

  async recordSwipe(candidateId: string, direction: 'left' | 'right', userId = 'user-test1') {
    return request<{ isMatch: boolean; match?: any; conversationId?: string }>(
      '/api/matches/swipe',
      {
        method: 'POST',
        body: JSON.stringify({ userId, candidateId, direction }),
      }
    );
  },

  async rewindSwipe(candidateId: string, userId = 'user-test1') {
    return request<{ success: boolean; message?: string }>('/api/matches/rewind', {
      method: 'POST',
      body: JSON.stringify({ userId, candidateId }),
    });
  },

  // 7. Chats & Messages
  async getChats(userId = 'user-test1') {
    return request<{ chats: any[] }>(`/api/chats?userId=${encodeURIComponent(userId)}`);
  },

  async openDirectChat(
    userId: string,
    partnerHandle: string,
    chatType: 'social' | 'dating' = 'social'
  ) {
    return request<{
      success: boolean;
      conversationId: string;
      canMessage: boolean;
      isFriend: boolean;
    }>('/api/chats/open', {
      method: 'POST',
      body: JSON.stringify({ userId, partnerHandle, chatType }),
    });
  },

  async getChatMessages(conversationId: string) {
    return request<{ messages: any[] }>(
      `/api/chats/${encodeURIComponent(conversationId)}/messages`
    );
  },

  async sendChatMessage(
    conversationId: string,
    text: string,
    mediaUrl?: string,
    senderId = 'user-test1'
  ) {
    return request<{ success: boolean; message: any }>(
      `/api/chats/${encodeURIComponent(conversationId)}/messages`,
      {
        method: 'POST',
        body: JSON.stringify({ senderId, text, mediaUrl }),
      }
    );
  },

  async markChatAsRead(conversationId: string, userId = 'user-test1') {
    return request<{ success: boolean }>(
      `/api/chats/${encodeURIComponent(conversationId)}/read`,
      {
        method: 'POST',
        body: JSON.stringify({ userId }),
      }
    );
  },

  async clearChatMessages(conversationId: string, userId = 'user-test1') {
    return request<{ success: boolean }>(
      `/api/chats/${encodeURIComponent(conversationId)}/messages?userId=${encodeURIComponent(
        userId
      )}`,
      {
        method: 'DELETE',
      }
    );
  },

  // 8. SOS Alerts (100% Free) & Single AI Photo-to-Description Endpoint
  async getSosAlerts() {
    return request<{ sosAlerts: any[] }>('/api/sos');
  },

  async createSosAlert(sosData: Record<string, any>) {
    return request<{ success: boolean; sos: any }>('/api/sos', {
      method: 'POST',
      body: JSON.stringify(sosData),
    });
  },

  async reportSosSighting(
    sosId: string,
    payload: {
      reporterName: string;
      phone: string;
      note: string;
      reporterId?: string;
    }
  ) {
    return request<{ success: boolean; sighting: any }>(
      `/api/sos/${encodeURIComponent(sosId)}/sighting`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
  },

  async markSosFound(sosId: string) {
    return request<{ success: boolean; sos: any }>(
      `/api/sos/${encodeURIComponent(sosId)}/found`,
      {
        method: 'POST',
      }
    );
  },

  async describePetWithAi(payload: {
    imageBase64?: string;
    imageUrl?: string;
    mimeType?: string;
  }) {
    return request<{
      success: boolean;
      species?: string;
      breed?: string;
      primaryColor?: string;
      description?: string;
      error?: string;
    }>('/api/ai/describe-pet', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },

  // 9. Notifications Management
  async getNotifications(userId = 'user-test1') {
    return request<{ notifications: any[] }>(
      `/api/notifications?userId=${encodeURIComponent(userId)}`
    );
  },

  async markNotificationRead(notifId: string) {
    return request<{ success: boolean }>(
      `/api/notifications/${encodeURIComponent(notifId)}/read`,
      {
        method: 'POST',
      }
    );
  },

  async markAllNotificationsRead(userId: string) {
    return request<{ success: boolean }>('/api/notifications/read-all', {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  },

  async deleteNotification(notifId: string) {
    return request<{ success: boolean }>(
      `/api/notifications/${encodeURIComponent(notifId)}`,
      {
        method: 'DELETE',
      }
    );
  },

  async clearAllNotifications(userId: string) {
    return request<{ success: boolean }>(
      `/api/notifications?userId=${encodeURIComponent(userId)}`,
      {
        method: 'DELETE',
      }
    );
  },
};
