export const API_BASE_URL: string = (import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api').replace(/\/+$/, '');

// Chế độ fixture: cho phép duyệt UX khi server chưa chạy.
export const IS_MOCK_MODE: boolean = import.meta.env.VITE_USE_MOCK === 'true';
