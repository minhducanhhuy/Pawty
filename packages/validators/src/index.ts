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
  const cleaned = phone.replace(/\s+/g, '');
  return /^(0|\+84)(3|5|7|8|9)\d{8}$/.test(cleaned);
}

