/**
 * PAWTY CORE VALIDATION UTILITIES
 * Bộ quy tắc kiểm tra và chuẩn hóa dữ liệu đầu vào cho toàn bộ hệ sinh thái Pawty.
 */

/**
 * Chuẩn hóa số điện thoại Việt Nam:
 * - Lọc bỏ mọi ký tự không phải số
 * - Chuyển đầu số quốc tế 84xxxxxxxxx thành 0xxxxxxxxx
 */
export function normalizeVietnamesePhone(rawPhone?: string | null): string {
  if (!rawPhone || typeof rawPhone !== 'string') return '';
  let cleaned = rawPhone.replace(/\D/g, '');
  if (cleaned.startsWith('84') && cleaned.length === 11) {
    cleaned = '0' + cleaned.slice(2);
  }
  return cleaned;
}

/**
 * Kiểm tra số điện thoại Việt Nam hợp lệ:
 * - Đúng 10 chữ số
 * - Bắt đầu bằng 03, 05, 07, 08, 09
 */
export function isValidVietnamesePhone(phone?: string | null): boolean {
  if (!phone || typeof phone !== 'string') return false;
  const normalized = normalizeVietnamesePhone(phone);
  return /^(0[35789])[0-9]{8}$/.test(normalized);
}

/**
 * Kiểm tra mật khẩu:
 * - Tối thiểu 6 ký tự, tối đa 50 ký tự
 */
export function isValidPassword(password?: string | null): { valid: boolean; error?: string } {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Mật khẩu không được để trống.' };
  }
  const trimmed = password.trim();
  if (trimmed.length < 6) {
    return { valid: false, error: 'Mật khẩu phải có độ dài tối thiểu 6 ký tự.' };
  }
  if (trimmed.length > 50) {
    return { valid: false, error: 'Mật khẩu không được vượt quá 50 ký tự.' };
  }
  return { valid: true };
}

/**
 * Kiểm tra tên tài khoản (username):
 * - Tùy chọn, nếu có thì từ 3-25 ký tự
 * - Chỉ gồm chữ cái thường, số và dấu gạch dưới
 */
export function isValidUsername(username?: string | null): { valid: boolean; error?: string } {
  if (!username) return { valid: true };
  const cleaned = username.trim().toLowerCase();
  if (!/^[a-z0-9_]{3,25}$/.test(cleaned)) {
    return {
      valid: false,
      error: 'Tên tài khoản (username) phải từ 3 đến 25 ký tự, chỉ chứa chữ cái không dấu, số và dấu gạch dưới.',
    };
  }
  return { valid: true };
}

/**
 * Kiểm tra họ và tên / tên hiển thị:
 * - Từ 2 đến 40 ký tự
 * - Không chứa thẻ HTML
 */
export function isValidDisplayName(name?: string | null): { valid: boolean; error?: string } {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Tên hiển thị không được để trống.' };
  }
  const trimmed = name.trim();
  if (trimmed.length < 2 || trimmed.length > 40) {
    return { valid: false, error: 'Tên hiển thị phải từ 2 đến 40 ký tự.' };
  }
  if (/[<>{}]/.test(trimmed)) {
    return { valid: false, error: 'Tên hiển thị không được chứa ký tự đặc biệt lạ hoặc mã HTML.' };
  }
  return { valid: true };
}

/**
 * Kiểm tra tên bé thú cưng:
 * - Từ 1 đến 30 ký tự
 */
export function isValidPetName(name?: string | null): { valid: boolean; error?: string } {
  if (!name || typeof name !== 'string' || !name.trim()) {
    return { valid: false, error: 'Tên thú cưng không được để trống.' };
  }
  const trimmed = name.trim();
  if (trimmed.length > 30) {
    return { valid: false, error: 'Tên thú cưng tối đa 30 ký tự.' };
  }
  if (/[<>{}]/.test(trimmed)) {
    return { valid: false, error: 'Tên thú cưng không được chứa ký tự mã HTML.' };
  }
  return { valid: true };
}

/**
 * Kiểm tra cân nặng thú cưng:
 * - Số thực dương từ 0.1 đến 120.0 kg
 */
export function isValidPetWeight(rawWeight?: string | number | null): {
  valid: boolean;
  weightKg?: number;
  error?: string;
} {
  if (rawWeight === undefined || rawWeight === null || rawWeight === '') {
    return { valid: true }; // Tùy chọn
  }
  const parsed =
    typeof rawWeight === 'number'
      ? rawWeight
      : parseFloat(String(rawWeight).replace(',', '.').trim());
  if (isNaN(parsed) || parsed < 0.1 || parsed > 120) {
    return {
      valid: false,
      error: 'Cân nặng của thú cưng phải là số thực từ 0.1 kg đến 120.0 kg.',
    };
  }
  return { valid: true, weightKg: Math.round(parsed * 10) / 10 };
}

/**
 * Kiểm tra ngày sinh thú cưng:
 * - Không được ở tương lai
 */
export function isValidBirthDate(dateStr?: string | null): { valid: boolean; error?: string } {
  if (!dateStr || !dateStr.trim()) return { valid: true };
  let date: Date;
  if (dateStr.includes('/')) {
    const parts = dateStr.split('/').map(Number);
    if (parts.length === 3) {
      date = new Date(parts[2], parts[1] - 1, parts[0]);
    } else {
      date = new Date(dateStr);
    }
  } else {
    date = new Date(dateStr);
  }

  if (isNaN(date.getTime())) {
    return { valid: false, error: 'Ngày sinh không đúng định dạng.' };
  }

  const now = new Date();
  if (date.getTime() > now.getTime()) {
    return { valid: false, error: 'Ngày sinh của thú cưng không thể lớn hơn ngày hiện tại.' };
  }
  return { valid: true };
}

/**
 * Sanitize chuỗi văn bản thông thường (loại bỏ thẻ HTML và cắt ngắn)
 */
export function sanitizeInputText(text?: string | null, maxLength = 500): string {
  if (!text || typeof text !== 'string') return '';
  return text
    .replace(/<[^>]*>?/gm, '')
    .trim()
    .slice(0, maxLength);
}

