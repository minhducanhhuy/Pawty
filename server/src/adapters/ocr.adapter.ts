import { HttpStatus, Injectable } from '@nestjs/common';
import { DomainException } from '../common/errors';

export interface OcrVaccineResult {
  status: 'manual_review' | 'extracted';
  note: string;
  suggestedLastDate?: string;
  suggestedNextDueDate?: string;
}

export interface OcrProvider {
  extractVaccineInfo(proofUrls: string[]): Promise<OcrVaccineResult>;
}

export class SandboxOcrProvider implements OcrProvider {
  async extractVaccineInfo(_proofUrls: string[]): Promise<OcrVaccineResult> {
    return {
      status: 'manual_review',
      note: 'Cần duyệt thủ công',
    };
  }
}

export class VisionOcrProvider implements OcrProvider {
  async extractVaccineInfo(_proofUrls: string[]): Promise<OcrVaccineResult> {
    if (!process.env.GOOGLE_VISION_API_KEY) {
      throw new DomainException(
        'NOT_CONFIGURED',
        'Google Vision OCR chưa được cấu hình khoá thật (GOOGLE_VISION_API_KEY).',
        HttpStatus.NOT_IMPLEMENTED,
      );
    }
    throw new DomainException(
      'NOT_CONFIGURED',
      'Google Vision OCR chưa được cấu hình.',
      HttpStatus.NOT_IMPLEMENTED,
    );
  }
}

@Injectable()
export class OcrAdapterService implements OcrProvider {
  private readonly sandbox = new SandboxOcrProvider();
  private readonly vision = new VisionOcrProvider();

  private getProvider(): OcrProvider {
    const mode = (process.env.OCR_PROVIDER || 'sandbox').toLowerCase();
    return mode === 'vision' ? this.vision : this.sandbox;
  }

  async extractVaccineInfo(proofUrls: string[]): Promise<OcrVaccineResult> {
    return this.getProvider().extractVaccineInfo(proofUrls);
  }
}
