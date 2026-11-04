/**
 * MOBILE VALIDATION UTILITIES (PAWTY)
 * Các hàm kiểm tra & định dạng realtime cho giao diện ứng dụng Mobile.
 */

/**
 * Lọc sạch chuỗi số điện thoại chỉ nhận chữ số:
 * - Lọc bỏ mọi ký tự không phải chữ số
 * - Chuyển đổi đầu số 84 thành 0 nếu copy-paste
 * - Giới hạn tối đa 10 chữ số
 */
export function sanitizePhoneInput(raw: string): string {
  if (!raw) return '';
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('84') && digits.length >= 11) {
    digits = '0' + digits.slice(2);
  }
  return digits.slice(0, 10);
}

/**
 * Kiểm tra số điện thoại Việt Nam hợp lệ:
 * - Đúng 10 chữ số
 * - Đầu số thuộc các nhà mạng: 03, 05, 07, 08, 09
 */
export function isValidVietnamesePhone(phone: string): boolean {
  if (!phone) return false;
  const digits = sanitizePhoneInput(phone);
  return /^(0[35789])[0-9]{8}$/.test(digits);
}

/**
 * Định dạng hiển thị số điện thoại (VD: 0912 345 678)
 */
export function formatPhoneDisplay(phone: string): string {
  const digits = sanitizePhoneInput(phone);
  if (digits.length <= 4) return digits;
  if (digits.length <= 7) return `${digits.slice(0, 4)} ${digits.slice(4)}`;
  return `${digits.slice(0, 4)} ${digits.slice(4, 7)} ${digits.slice(7, 10)}`;
}

/**
 * Kiểm tra mật khẩu:
 * - Tối thiểu 6 ký tự, tối đa 50 ký tự
 */
export function validatePassword(password: string): { valid: boolean; error?: string } {
  if (!password) {
    return { valid: false, error: 'Mật khẩu không được để trống.' };
  }
  const trimmed = password.trim();
  if (trimmed.length < 6) {
    return { valid: false, error: 'Mật khẩu phải có tối thiểu 6 ký tự.' };
  }
  if (trimmed.length > 50) {
    return { valid: false, error: 'Mật khẩu không được vượt quá 50 ký tự.' };
  }
  return { valid: true };
}

/**
 * Lọc chuỗi cân nặng chỉ cho phép số và dấu chấm/phẩy thập phân
 */
export function sanitizeWeightInput(raw: string): string {
  if (!raw) return '';
  // Chỉ giữ số, dấu chấm, dấu phẩy
  let cleaned = raw.replace(/[^0-9.,]/g, '');
  // Đổi phẩy thành chấm
  cleaned = cleaned.replace(',', '.');
  // Chỉ giữ dấu chấm đầu tiên
  const parts = cleaned.split('.');
  if (parts.length > 2) {
    cleaned = parts[0] + '.' + parts.slice(1).join('');
  }
  return cleaned.slice(0, 5); // Tối đa 5 ký tự (VD: 119.5)
}

/**
 * Kiểm tra cân nặng hợp lệ (0.1 kg - 120.0 kg)
 */
export function validatePetWeight(rawWeight: string | number): {
  valid: boolean;
  weightKg?: number;
  error?: string;
} {
  if (rawWeight === '' || rawWeight === undefined || rawWeight === null) {
    return { valid: true };
  }
  const parsed =
    typeof rawWeight === 'number'
      ? rawWeight
      : parseFloat(String(rawWeight).replace(',', '.').trim());
  if (isNaN(parsed) || parsed < 0.1 || parsed > 120) {
    return {
      valid: false,
      error: 'Cân nặng thú cưng phải từ 0.1 kg đến 120.0 kg.',
    };
  }
  return { valid: true, weightKg: Math.round(parsed * 10) / 10 };
}

/**
 * Kiểm tra ngày không nằm ở tương lai (áp dụng cho ngày sinh)
 */
export function isNotFutureDate(dateStr: string): boolean {
  if (!dateStr || !dateStr.trim()) return true;
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

  if (isNaN(date.getTime())) return false;
  return date.getTime() <= Date.now();
}

/**
 * Lọc tên tài khoản username (chỉ chữ thường, số, gạch dưới)
 */
export function sanitizeUsername(raw: string): string {
  if (!raw) return '';
  return raw.toLowerCase().replace(/[^a-z0-9_]/g, '').slice(0, 25);
}

