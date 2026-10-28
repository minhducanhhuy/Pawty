import { HttpStatus, Injectable } from '@nestjs/common';
import { DomainException } from '../common/errors';

export interface OtpProvider {
  sendOtp(phone: string): Promise<{ sessionInfo: string }>;
  verifyOtp(phone: string, otpCode: string): Promise<boolean>;
}

export class SandboxOtpProvider implements OtpProvider {
  async sendOtp(phone: string): Promise<{ sessionInfo: string }> {
    return {
      sessionInfo: `firebase_mock_token_${phone}_${Date.now()}`,
    };
  }

  async verifyOtp(_phone: string, otpCode: string): Promise<boolean> {
    return otpCode === '888888';
  }
}

export class FirebaseOtpProvider implements OtpProvider {
  private ensureConfigured() {
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY) {
      throw new DomainException(
        'NOT_CONFIGURED',
        'Firebase Auth OTP chưa được cấu hình khoá thật (FIREBASE_PROJECT_ID).',
        HttpStatus.NOT_IMPLEMENTED,
      );
    }
  }

  async sendOtp(_phone: string): Promise<{ sessionInfo: string }> {
    this.ensureConfigured();
    throw new DomainException(
      'NOT_CONFIGURED',
      'Firebase Auth OTP chưa được cấu hình.',
      HttpStatus.NOT_IMPLEMENTED,
    );
  }

  async verifyOtp(_phone: string, _otpCode: string): Promise<boolean> {
    this.ensureConfigured();
    throw new DomainException(
      'NOT_CONFIGURED',
      'Firebase Auth OTP chưa được cấu hình.',
      HttpStatus.NOT_IMPLEMENTED,
    );
  }
}

@Injectable()
export class OtpAdapterService implements OtpProvider {
  private readonly sandbox = new SandboxOtpProvider();
  private readonly firebase = new FirebaseOtpProvider();

  private getProvider(): OtpProvider {
    const mode = (process.env.OTP_PROVIDER || 'sandbox').toLowerCase();
    return mode === 'firebase' ? this.firebase : this.sandbox;
  }

  async sendOtp(phone: string): Promise<{ sessionInfo: string }> {
    return this.getProvider().sendOtp(phone);
  }

  async verifyOtp(phone: string, otpCode: string): Promise<boolean> {
    return this.getProvider().verifyOtp(phone, otpCode);
  }
}
