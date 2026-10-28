export type ApiErrorCode = string;

export class ApiError extends Error {
  readonly statusCode: number;
  readonly code: ApiErrorCode;

  constructor(message: string, statusCode: number, code: ApiErrorCode) {
    super(message);
    this.name = 'ApiError';
    this.statusCode = statusCode;
    this.code = code;
  }
}

const FALLBACK_MESSAGE_BY_STATUS: Record<number, string> = {
  400: 'Dữ liệu gửi lên chưa hợp lệ. Vui lòng kiểm tra lại.',
  401: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  403: 'Bạn không có quyền thực hiện thao tác này.',
  404: 'Không tìm thấy dữ liệu yêu cầu.',
  409: 'Dữ liệu bị trùng hoặc xung đột. Vui lòng thử lại.',
  429: 'Bạn thao tác quá nhanh. Vui lòng thử lại sau ít phút.',
  500: 'Máy chủ đang gặp sự cố. Vui lòng thử lại sau.',
};

export const NETWORK_ERROR_MESSAGE =
  'Không kết nối được máy chủ. Vui lòng kiểm tra mạng hoặc bật chế độ mock (VITE_USE_MOCK=true).';

export function getFallbackMessageForStatus(statusCode: number): string {
  return (
    FALLBACK_MESSAGE_BY_STATUS[statusCode] ??
    (statusCode >= 500 ? FALLBACK_MESSAGE_BY_STATUS[500] : 'Đã có lỗi xảy ra. Vui lòng thử lại.')
  );
}

export function getFriendlyErrorMessage(error: unknown): string {
  if (error instanceof ApiError) return error.message;
  if (error instanceof Error && error.message) return error.message;
  return 'Đã có lỗi xảy ra. Vui lòng thử lại.';
}
