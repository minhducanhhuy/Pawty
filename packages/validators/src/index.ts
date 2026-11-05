import type { PostContentType } from '@pawty/types';

// Forbidden patterns per Tầng 2 Section 6.2 (No breeding, trading, abuse, self-medication prescriptions)
const BLOCKED_PATTERNS: { pattern: RegExp; reason: string }[] = [
  {
    pattern: /\b(bán chó|bán mèo|mua bán thú cưng|cần bán gấp bé|giá sinh viên inbox)\b/i,
    reason: 'Pawty không cho phép mua bán thú cưng thương mại trên nền tảng.',
  },
  {
    pattern: /\b(phối giống|nhận phối|tìm bạn phối giống|bao đậu|đực giống)\b/i,
    reason: 'Pawty không cho phép đăng tin phối giống chưa kiểm định.',
  },
  {
    pattern: /\b(kê đơn thuốc|uống kháng sinh liều cao|tiêm thuốc người cho chó|tự tiêm tại nhà)\b/i,
    reason: 'Cấm tự kê đơn thuốc hoặc hướng dẫn điều trị nguy hiểm khi chưa có chỉ định của bác sĩ thú y.',
  },
  {
    pattern: /\b(đánh đập|hành hạ|bỏ đói|ngược đãi)\b/i,
    reason: 'Vi phạm nghiêm trọng chính sách chống bạo lực & ngược đãi thú cưng.',
  },
];

// Health keywords that automatically trigger the Health Disclaimer protocol (Tầng 2 Section 6.3)
const HEALTH_KEYWORDS = [
  'tiêm phòng',
  'vắc-xin',
  'vaccine',
  'bỏ ăn',
  'nôn',
  'tiêu chảy',
  'rụng lông',
  'nấm da',
  've rận',
  'thuốc giun',
  'triệt sản',
  'khám bệnh',
  'dị ứng',
  'ho cũi',
  'parvo',
  'care',
  'sốt',
];

const SEVERE_SYMPTOM_KEYWORDS = [
  'nôn ra máu',
  'co giật',
  'khó thở',
  'nuốt dị vật',
  'trúng độc',
  'bất tỉnh',
  'đi ngoài ra máu',
];

export interface ContentModerationResult {
  allowed: boolean;
  blockedReason?: string;
  hasHealthDisclaimer: boolean;
  isSevereHealthAlert: boolean;
  petRelevanceScore: number;
  suggestedHashtags: string[];
}

export function moderatePetContent(
  text: string,
  contentType: PostContentType = 'moment'
): ContentModerationResult {
  const normalized = text.trim();

  if (!normalized || normalized.length < 3) {
    return {
      allowed: false,
      blockedReason: 'Nội dung bài viết quá ngắn. Hãy chia sẻ thêm về Boss nhé!',
      hasHealthDisclaimer: false,
      isSevereHealthAlert: false,
      petRelevanceScore: 0,
      suggestedHashtags: [],
    };
  }

  for (const rule of BLOCKED_PATTERNS) {
    if (rule.pattern.test(normalized)) {
      return {
        allowed: false,
        blockedReason: rule.reason,
        hasHealthDisclaimer: false,
        isSevereHealthAlert: false,
        petRelevanceScore: 0,
        suggestedHashtags: [],
      };
    }
  }

  const lower = normalized.toLowerCase();
  const hasHealthDisclaimer =
    contentType === 'question' ||
    contentType === 'care_log' ||
    HEALTH_KEYWORDS.some((kw) => lower.includes(kw));

  const isSevereHealthAlert = SEVERE_SYMPTOM_KEYWORDS.some((kw) => lower.includes(kw));

  const suggestedHashtags: string[] = [];
  if (lower.includes('golden')) suggestedHashtags.push('#GoldenRetriever');
  if (lower.includes('corgi')) suggestedHashtags.push('#Corgi');
  if (lower.includes('mèo anh') || lower.includes('aln')) suggestedHashtags.push('#MèoAnh');
  if (lower.includes('poodle')) suggestedHashtags.push('#Poodle');
  if (lower.includes('dắt dạo') || lower.includes('công viên')) suggestedHashtags.push('#DắtDạo');
  if (lower.includes('tắm') || lower.includes('spa') || lower.includes('grooming')) {
    suggestedHashtags.push('#Grooming');
  }
  if (hasHealthDisclaimer) suggestedHashtags.push('#SứcKhỏeBoss');
  if (suggestedHashtags.length === 0) suggestedHashtags.push('#KhoảnhKhắcBoss');

  return {
    allowed: true,
    hasHealthDisclaimer,
    isSevereHealthAlert,
    petRelevanceScore: 0.95,
    suggestedHashtags,
  };
}

export function validateVietnamesePhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  let cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('84') && cleaned.length === 11) {
    cleaned = '0' + cleaned.slice(2);
  }
  return /^(0[35789])[0-9]{8}$/.test(cleaned);
}

export function isValidPassword(password?: string | null): boolean {
  return typeof password === 'string' && password.trim().length >= 6 && password.length <= 50;
}

export function isValidUsername(username?: string | null): boolean {
  if (!username) return true;
  return /^[a-z0-9_]{3,25}$/.test(username.trim().toLowerCase());
}

export function isValidPetWeight(rawWeight?: string | number | null): boolean {
  if (rawWeight === undefined || rawWeight === null || rawWeight === '') return true;
  const parsed = typeof rawWeight === 'number' ? rawWeight : parseFloat(String(rawWeight).replace(',', '.'));
  return !isNaN(parsed) && parsed >= 0.1 && parsed <= 120.0;
}

export interface SosAlertValidationResult {
  valid: boolean;
  errors: string[];
}

export function validateSosAlertPayload(payload: {
  petName?: string;
  species?: string;
  lastSeenLocation?: string;
  description?: string;
}): SosAlertValidationResult {
  const errors: string[] = [];
  if (!payload.petName || payload.petName.trim().length < 1) {
    errors.push('Tên thú cưng không được để trống.');
  }
  if (!payload.lastSeenLocation || payload.lastSeenLocation.trim().length < 3) {
    errors.push('Vui lòng cung cấp vị trí nhìn thấy gần nhất để hàng xóm nhận diện.');
  }
  if (!payload.description || payload.description.trim().length < 10) {
    errors.push('Vui lòng mô tả đặc điểm nhận dạng (màu lông, vòng cổ...) ít nhất 10 ký tự.');
  }
  return { valid: errors.length === 0, errors };
}

export function validateMatchDecisionPayload(payload: {
  matchId?: string;
  decision?: string;
}): boolean {
  if (!payload.matchId) return false;
  return payload.decision === 'verified' || payload.decision === 'dismissed';
}

export function isNotFutureDate(dateStr?: string | null): boolean {
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

export function getDaysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate();
}

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
