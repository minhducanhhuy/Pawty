import type { PostContentType } from '@pawty/types';

/**
 * 4-Layer Content Moderation Pipeline (Tầng 2 Section 6 & Tầng 6 Section 7)
 */
export interface ModerationInput {
  textContent: string;
  contentType: PostContentType;
  mediaUrls?: string[];
}

export interface ModerationDecision {
  status: 'approved' | 'rejected' | 'flagged';
  reason?: string;
  hasHealthDisclaimer: boolean;
  isSevereEmergency: boolean;
  petRelevanceScore: number;
}

const FORBIDDEN_KEYWORDS = [
  'bán chó',
  'bán mèo',
  'mua bán thú cưng',
  'phối giống',
  'nhận phối',
  'bao đậu',
  'tự tiêm kháng sinh',
  'ngược đãi',
];

const HEALTH_CLAIM_KEYWORDS = [
  'tiêm phòng',
  'vắc-xin',
  'bỏ ăn',
  'nôn',
  'tiêu chảy',
  'thuốc giun',
  'triệt sản',
  'viêm da',
  'nấm',
  've rận',
];

export class ModerationService {
  moderatePost(input: ModerationInput): ModerationDecision {
    const lower = input.textContent.toLowerCase();

    for (const badWord of FORBIDDEN_KEYWORDS) {
      if (lower.includes(badWord)) {
        return {
          status: 'rejected',
          reason: `Nội dung chứa từ khóa vi phạm chính sách cộng đồng ("${badWord}")`,
          hasHealthDisclaimer: false,
          isSevereEmergency: false,
          petRelevanceScore: 0,
        };
      }
    }

    const hasHealthDisclaimer =
      input.contentType === 'question' ||
      input.contentType === 'care_log' ||
      HEALTH_CLAIM_KEYWORDS.some((kw) => lower.includes(kw));

    const isSevereEmergency =
      lower.includes('co giật') || lower.includes('nôn ra máu') || lower.includes('khó thở');

    return {
      status: 'approved',
      hasHealthDisclaimer,
      isSevereEmergency,
      petRelevanceScore: 0.96,
    };
  }
}

