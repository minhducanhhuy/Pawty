import { Platform } from 'react-native';
import Constants from 'expo-constants';

function getDevApiHost(): string {
  if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  // 1. Khi chạy trên Web / Browser, luôn luôn kết nối trực tiếp localhost:3000
  if (Platform.OS === 'web') {
    return 'http://localhost:3000';
  }

  // 2. Khi chạy với Expo Metro bundler
  const hostUri =
    Constants.expoConfig?.hostUri ||
    (Constants as any).manifest2?.extra?.expoClient?.hostUri ||
    (Constants as any).manifest?.debuggerHost;

  if (hostUri) {
    const host = hostUri.split(':')[0];
    // Khi debug qua USB hoặc localhost -> adb reverse chuyển tiếp vào cổng 3000 máy tính
    if (host === 'localhost' || host === '127.0.0.1') {
      return 'http://localhost:3000';
    }
    // Khi chạy qua Wi-Fi LAN
    if (host) {
      return `http://${host}:3000`;
    }
  }

  // 3. Mặc định trên Android debug qua cáp USB: adb reverse tcp:3000 tcp:3000
  return 'http://localhost:3000';
}

export const API_BASE_URL = getDevApiHost();

console.log('[Pawty API] Connected Gateway URL:', API_BASE_URL);

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

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
      throw new Error(errorBody.error || `Lỗi máy chủ (${res.status})`);
    }

    return await res.json();
  } catch (error: any) {
    if (error.name === 'AbortError') {
      console.warn(`[Pawty API] Timeout 8s requesting ${endpoint}`);
      throw new Error('Kết nối máy chủ quá hạn (Timeout 8s). Vui lòng kiểm tra cáp USB và Backend.');
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
    return request<{ success: boolean; token: string; user: any; message: string }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    });
  },

  async register(data: {
    phone: string;
    username?: string;
    password?: string;
    displayName?: string;
    petName?: string;
    petSpecies?: string;
    petBreed?: string;
  }) {
    return request<{ success: boolean; token: string; user: any; message: string }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 1. Bootstrap
  async getBootstrapData(userId?: string) {
    const query = userId ? `?userId=${encodeURIComponent(userId)}` : '';
    return request<any>(`/api/bootstrap${query}`);
  },

  // 2. User & Profile
  async getMyProfile() {
    return request<{ user: any }>('/api/users/me');
  },

  async updateMyProfile(data: any) {
    return request<{ user: any }>('/api/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // 3. Pets
  async getPets() {
    return request<{ pets: any[] }>('/api/pets');
  },

  async createPet(petData: any) {
    return request<{ pet: any }>('/api/pets', {
      method: 'POST',
      body: JSON.stringify(petData),
    });
  },

  // 4. Feed Posts
  async getFeedPosts() {
    return request<{ posts: any[] }>('/api/posts/feed');
  },

  async createPost(postData: any) {
    return request<{ post: any }>('/api/posts', {
      method: 'POST',
      body: JSON.stringify(postData),
    });
  },

  // 5. Tinder / Radar Candidates & Matches
  async getTinderCandidates(userId = 'user-mai', intent?: string) {
    const query = intent && intent !== 'all' ? `&intent=${intent}` : '';
    return request<{ candidates: any[] }>(`/api/tinder/candidates?userId=${userId}${query}`);
  },

  async recordSwipe(candidateId: string, direction: 'left' | 'right', userId = 'user-mai') {
    return request<{ isMatch: boolean; match?: any; conversationId?: string }>('/api/matches/swipe', {
      method: 'POST',
      body: JSON.stringify({ userId, candidateId, direction }),
    });
  },

  async rewindSwipe(candidateId: string, userId = 'user-mai') {
    return request<{ success: boolean; message?: string }>('/api/matches/rewind', {
      method: 'POST',
      body: JSON.stringify({ userId, candidateId }),
    });
  },

  // 6. Chats & Messages
  async getChats(userId = 'user-mai') {
    return request<{ chats: any[] }>(`/api/chats?userId=${userId}`);
  },

  async getChatMessages(conversationId: string) {
    return request<{ messages: any[] }>(`/api/chats/${conversationId}/messages`);
  },

  async sendChatMessage(conversationId: string, text: string, mediaUrl?: string, senderId = 'user-mai') {
    return request<{ message: any }>(`/api/chats/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ senderId, text, mediaUrl }),
    });
  },

  async markChatAsRead(conversationId: string, userId = 'user-mai') {
    return request<{ success: boolean }>(`/api/chats/${conversationId}/read`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  },

  // 7. SOS Alerts
  async getSosAlerts() {
    return request<{ sosAlerts: any[] }>('/api/sos');
  },

  async createSosAlert(sosData: any) {
    return request<{ sos: any }>('/api/sos', {
      method: 'POST',
      body: JSON.stringify(sosData),
    });
  },

  // 8. Notifications
  async getNotifications(userId = 'user-mai') {
    return request<{ notifications: any[] }>(`/api/notifications?userId=${userId}`);
  },
};
