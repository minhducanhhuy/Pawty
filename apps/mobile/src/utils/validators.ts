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

/**
 * Tính tuổi chính xác từ chuỗi ngày sinh (hỗ trợ DD/MM/YYYY hoặc ISO)
 */
export function calculateAgeFromBirthDate(birthDateStr?: string | null): number {
  if (!birthDateStr || !birthDateStr.trim()) return 0;
  let birthDate: Date;
  if (birthDateStr.includes('/')) {
    const parts = birthDateStr.split('/').map(Number);
    if (parts.length === 3) {
      birthDate = new Date(parts[2], parts[1] - 1, parts[0]);
    } else {
      birthDate = new Date(birthDateStr);
    }
  } else {
    birthDate = new Date(birthDateStr);
  }
  if (isNaN(birthDate.getTime())) return 0;
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return Math.max(0, age);
}

/**
 * Kiểm tra độ tuổi người dùng hợp lệ
 */
export function validateOwnerAge(
  age?: number | string | null,
  minAge = 16,
  maxAge = 100
): { valid: boolean; age?: number; error?: string } {
  if (age === undefined || age === null || String(age).trim() === '') {
    return { valid: false, error: `Vui lòng chọn độ tuổi của bạn (từ ${minAge} đến ${maxAge} tuổi).` };
  }
  const parsed = typeof age === 'number' ? age : parseInt(String(age).trim(), 10);
  if (isNaN(parsed) || parsed < minAge || parsed > maxAge) {
    return {
      valid: false,
      error: `Độ tuổi của bạn phải từ ${minAge} đến ${maxAge} tuổi.`,
    };
  }
  return { valid: true, age: parsed };
}

/**
 * Kiểm tra ngày sinh người dùng hợp lệ và đạt độ tuổi tối thiểu
 */
export function validateOwnerBirthDate(
  birthDateStr?: string | null,
  minAge = 16,
  maxAge = 100
): { valid: boolean; age?: number; error?: string } {
  if (!birthDateStr || !birthDateStr.trim()) {
    return { valid: true };
  }
  if (!isNotFutureDate(birthDateStr)) {
    return { valid: false, error: 'Ngày sinh của bạn không được vượt quá ngày hiện tại!' };
  }
  const calculatedAge = calculateAgeFromBirthDate(birthDateStr);
  if (calculatedAge < minAge) {
    return {
      valid: false,
      age: calculatedAge,
      error: `Bạn phải từ ${minAge} tuổi trở lên để sử dụng Pawty.`,
    };
  }
  if (calculatedAge > maxAge) {
    return {
      valid: false,
      age: calculatedAge,
      error: 'Năm sinh không hợp lệ (không vượt quá 100 tuổi).',
    };
  }
  return { valid: true, age: calculatedAge };
}

/**
 * Kiểm tra ngày sinh thú cưng hợp lệ
 */
export function validatePetBirthDate(birthDateStr?: string | null): { valid: boolean; error?: string } {
  if (!birthDateStr || !birthDateStr.trim()) return { valid: true };
  if (!isNotFutureDate(birthDateStr)) {
    return { valid: false, error: 'Ngày sinh của bé không được vượt quá ngày hiện tại!' };
  }
  const age = calculateAgeFromBirthDate(birthDateStr);
  if (age > 35) {
    return { valid: false, error: 'Ngày sinh thú cưng không thể vượt quá 35 năm trước.' };
  }
  return { valid: true };
}

/**
 * Lấy số ngày tối đa của tháng theo năm (xử lý năm nhuận)
 */
export function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}

/**
 * Kiểm tra họ và tên hợp lệ (2 - 50 ký tự)
 */
export function validateDisplayName(
  name?: string | null,
  minLength = 2,
  maxLength = 50
): { valid: boolean; error?: string } {
  if (!name || typeof name !== 'string' || !name.trim()) {
    return { valid: false, error: 'Họ và tên không được để trống.' };
  }
  const trimmed = name.trim();
  if (trimmed.length < minLength) {
    return { valid: false, error: `Họ và tên phải có ít nhất ${minLength} ký tự.` };
  }
  if (trimmed.length > maxLength) {
    return { valid: false, error: `Họ và tên không được vượt quá ${maxLength} ký tự.` };
  }
  return { valid: true };
}

/**
 * Kiểm tra tên thú cưng hợp lệ (1 - 30 ký tự)
 */
export function validatePetName(
  name?: string | null,
  minLength = 1,
  maxLength = 30
): { valid: boolean; error?: string } {
  if (!name || typeof name !== 'string' || !name.trim()) {
    return { valid: false, error: 'Tên thú cưng không được để trống.' };
  }
  const trimmed = name.trim();
  if (trimmed.length < minLength) {
    return { valid: false, error: `Tên thú cưng phải có ít nhất ${minLength} ký tự.` };
  }
  if (trimmed.length > maxLength) {
    return { valid: false, error: `Tên thú cưng không được vượt quá ${maxLength} ký tự.` };
  }
  return { valid: true };
}

