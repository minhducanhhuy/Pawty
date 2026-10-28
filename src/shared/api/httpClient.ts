import { ApiError, NETWORK_ERROR_MESSAGE, getFallbackMessageForStatus } from './apiError';

export type QueryValue = string | number | boolean | undefined | null;
export type QueryParams = Record<string, QueryValue>;

export interface HttpClientOptions {
  baseUrl: string;
  getToken: () => string | null;
  onUnauthorized?: () => void;
}

interface RequestOptions {
  query?: QueryParams;
  body?: unknown;
  // Endpoint đăng nhập trả 401 khi sai thông tin: không được coi là hết phiên.
  isAuthEndpoint?: boolean;
}

export interface HttpClient {
  get<T>(path: string, options?: RequestOptions): Promise<T>;
  post<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T>;
  patch<T>(path: string, body?: unknown, options?: RequestOptions): Promise<T>;
  delete<T>(path: string, options?: RequestOptions): Promise<T>;
}

function buildUrl(baseUrl: string, path: string, query?: QueryParams): string {
  const searchParams = new URLSearchParams();
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') searchParams.set(key, String(value));
  });
  const queryString = searchParams.toString();
  return `${baseUrl}${path}${queryString ? `?${queryString}` : ''}`;
}

async function parseJsonSafely(response: Response): Promise<Record<string, unknown> | null> {
  try {
    return (await response.json()) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function toApiError(response: Response, payload: Record<string, unknown> | null): ApiError {
  const errorBody = (payload?.error ?? null) as { code?: string; message?: string } | null;
  return new ApiError(
    errorBody?.message ?? getFallbackMessageForStatus(response.status),
    response.status,
    errorBody?.code ?? 'UNKNOWN_ERROR',
  );
}

export function createHttpClient(options: HttpClientOptions): HttpClient {
  async function request<T>(method: string, path: string, requestOptions: RequestOptions = {}): Promise<T> {
    const token = options.getToken();
    const url = buildUrl(options.baseUrl, path, requestOptions.query);
    let response: Response;

    try {
      response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': 'vi',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: requestOptions.body === undefined ? undefined : JSON.stringify(requestOptions.body),
      });
    } catch (networkError) {
      console.error(`[API] ${method} ${path} - lỗi mạng`, networkError);
      throw new ApiError(NETWORK_ERROR_MESSAGE, 0, 'NETWORK_ERROR');
    }

    const payload = await parseJsonSafely(response);

    if (!response.ok || payload?.success === false) {
      const apiError = toApiError(response, payload);
      console.error(`[API] ${method} ${path} - ${apiError.statusCode} ${apiError.code}: ${apiError.message}`);
      if (apiError.statusCode === 401 && !requestOptions.isAuthEndpoint) options.onUnauthorized?.();
      throw apiError;
    }

    // Envelope chuẩn: { success, statusCode, data, message, timestamp } (master_print/03 §5.1).
    return (payload && 'data' in payload ? payload.data : payload) as T;
  }

  return {
    get: (path, requestOptions) => request('GET', path, requestOptions),
    post: (path, body, requestOptions) => request('POST', path, { ...requestOptions, body }),
    patch: (path, body, requestOptions) => request('PATCH', path, { ...requestOptions, body }),
    delete: (path, requestOptions) => request('DELETE', path, requestOptions),
  };
}
