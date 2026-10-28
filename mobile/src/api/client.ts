import { LocaleCode } from '../types';
import { resolveMockRequest } from './mockRouter';

export const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000/api';
export const USE_MOCK_ENV = process.env.EXPO_PUBLIC_USE_MOCK === 'true';

let authToken: string | null = null;
let activePetId: string | null = null;
let currentLocale: LocaleCode = 'vi';

export const setClientToken = (token: string | null) => {
  authToken = token;
};

export const setClientPetId = (petId: string | null) => {
  activePetId = petId;
};

export const setClientLocale = (locale: LocaleCode) => {
  currentLocale = locale;
};

export class ApiError extends Error {
  code: string;
  statusCode: number;
  constructor(code: string, message: string, statusCode = 400) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
  }
}

export async function apiRequest<T>(
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE',
  path: string,
  body?: unknown,
): Promise<T> {
  if (USE_MOCK_ENV) {
    return resolveMockRequest<T>(method, path, body);
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept-Language': currentLocale,
  };
  if (authToken) headers['Authorization'] = `Bearer ${authToken}`;
  if (activePetId) headers['X-Pet-Id'] = activePetId;

  const controller = new AbortController();
  // Timeout 2500ms so offline fallback is snappy on mobile devices
  const timer = setTimeout(() => controller.abort(), 2500);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });
    clearTimeout(timer);

    const json = await response.json();
    if (!response.ok || json.success === false) {
      const code = json?.error?.code || 'API_ERROR';
      const msg = json?.error?.message || json?.message || 'Đã xảy ra lỗi kết nối máy chủ.';
      throw new ApiError(code, msg, response.status);
    }

    return (json.data !== undefined ? json.data : json) as T;
  } catch (err) {
    clearTimeout(timer);
    if (err instanceof ApiError) {
      throw err;
    }
    // Network error or server unreachable -> fallback to rich local mock store
    return resolveMockRequest<T>(method, path, body);
  }
}
