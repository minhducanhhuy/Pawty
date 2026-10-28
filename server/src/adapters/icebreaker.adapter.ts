import { HttpStatus, Injectable } from '@nestjs/common';
import { PetRecord } from '../database/types';
import { DomainException } from '../common/errors';

export interface IcebreakerProvider {
  generateIcebreakers(petA: PetRecord, petB: PetRecord): Promise<string[]>;
}

export class SandboxIcebreakerProvider implements IcebreakerProvider {
  async generateIcebreakers(petA: PetRecord, petB: PetRecord): Promise<string[]> {
    const sharedTags = petA.tags.filter((t) => petB.tags.includes(t));
    const tagMention =
      sharedTags.length > 0
        ? `cùng đam mê "${sharedTags[0]}"`
        : `hệ "${petB.tags[0] || 'Thân thiện'}"`;

    const suggestion1 = `Gâu chào ${petB.name} (${petB.breed})! Nghe đồn đằng ấy cũng ${tagMention} giống ${petA.name} nhà mình, chiều nay ra bãi cỏ giao lưu không? 🐾`;
    const suggestion2 = `Sen của ${petA.name} thấy ${petB.name} ở ${petB.condoComplex} dễ thương quá! Hai bé đều đã tiêm phòng chuẩn chỉnh, hẹn nhau 15 phút dạo mát nhé? 🌿`;
    const suggestion3 = `${petA.name} (${petA.breed}) gửi lời chào tới ${petB.name}! Nếu đi dạo chung, Sen mình hứa mang sẵn bánh thưởng chia đôi cho hai đứa luôn nha 🦴✨`;

    return [suggestion1, suggestion2, suggestion3];
  }
}

export class GeminiIcebreakerProvider implements IcebreakerProvider {
  async generateIcebreakers(_petA: PetRecord, _petB: PetRecord): Promise<string[]> {
    if (!process.env.GEMINI_API_KEY) {
      throw new DomainException(
        'NOT_CONFIGURED',
        'Gemini AI Icebreaker chưa được cấu hình khoá thật (GEMINI_API_KEY).',
        HttpStatus.NOT_IMPLEMENTED,
      );
    }
    throw new DomainException(
      'NOT_CONFIGURED',
      'Gemini AI Icebreaker chưa được cấu hình.',
      HttpStatus.NOT_IMPLEMENTED,
    );
  }
}

@Injectable()
export class IcebreakerAdapterService implements IcebreakerProvider {
  private readonly sandbox = new SandboxIcebreakerProvider();
  private readonly gemini = new GeminiIcebreakerProvider();

  private getProvider(): IcebreakerProvider {
    const mode = (process.env.AI_PROVIDER || 'sandbox').toLowerCase();
    return mode === 'gemini' ? this.gemini : this.sandbox;
  }

  async generateIcebreakers(petA: PetRecord, petB: PetRecord): Promise<string[]> {
    return this.getProvider().generateIcebreakers(petA, petB);
  }
}
