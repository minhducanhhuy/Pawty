import { HttpStatus, Injectable } from '@nestjs/common';
import * as crypto from 'crypto';
import { DomainException } from '../common/errors';

export interface CreateQrInput {
  transactionId: string;
  amount: number;
  paymentCode: string;
}

export interface CreateQrResult {
  transactionId: string;
  qrCodeUrl: string;
  bankName: string;
  accountNo: string;
  amount: number;
  paymentCode: string;
  expiresAt: string;
}

export interface PaymentGateway {
  createQr(
    input: CreateQrInput,
    onSandboxAutoConfirm?: (paymentCode: string) => void,
  ): CreateQrResult;
  verifyWebhookSignature(payloadString: string, signature?: string): boolean;
}

export function getWebhookSecret(): string {
  return process.env.PAYMENT_WEBHOOK_SECRET || 'pawty-webhook-secret-2026';
}

export function computeWebhookHmac(payloadString: string): string {
  return crypto
    .createHmac('sha256', getWebhookSecret())
    .update(payloadString)
    .digest('hex');
}

export class SandboxPaymentGateway implements PaymentGateway {
  createQr(
    input: CreateQrInput,
    onSandboxAutoConfirm?: (paymentCode: string) => void,
  ): CreateQrResult {
    const bankName = process.env.VIETQR_BANK_NAME || 'MBBank';
    const accountNo = process.env.VIETQR_ACCOUNT_NO || '999988887777';
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();
    const encodedDes = encodeURIComponent(input.paymentCode);
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https://qr.sepay.vn/img?acc=${accountNo}&bank=${bankName}&amount=${input.amount}&des=${encodedDes}`;

    if (onSandboxAutoConfirm) {
      const timer = setTimeout(() => {
        onSandboxAutoConfirm(input.paymentCode);
      }, 5000);
      if (typeof timer.unref === 'function') {
        timer.unref();
      }
    }

    return {
      transactionId: input.transactionId,
      qrCodeUrl,
      bankName,
      accountNo,
      amount: input.amount,
      paymentCode: input.paymentCode,
      expiresAt,
    };
  }

  verifyWebhookSignature(payloadString: string, signature?: string): boolean {
    if (!signature) return false;
    const expected = computeWebhookHmac(payloadString);
    return signature === expected;
  }
}

export class RealPaymentGateway implements PaymentGateway {
  constructor(private readonly providerName: string) {}

  private ensureConfigured() {
    if (this.providerName === 'payos' && !process.env.PAYOS_API_KEY) {
      throw new DomainException(
        'NOT_CONFIGURED',
        'PayOS Payment Gateway chưa được cấu hình khoá thật (PAYOS_API_KEY).',
        HttpStatus.NOT_IMPLEMENTED,
      );
    }
    if (this.providerName === 'vietqr' && !process.env.VIETQR_API_KEY) {
      throw new DomainException(
        'NOT_CONFIGURED',
        'VietQR Payment Gateway chưa được cấu hình khoá thật (VIETQR_API_KEY).',
        HttpStatus.NOT_IMPLEMENTED,
      );
    }
  }

  createQr(_input: CreateQrInput): CreateQrResult {
    this.ensureConfigured();
    throw new DomainException(
      'NOT_CONFIGURED',
      `Cổng thanh toán ${this.providerName} chưa được cấu hình.`,
      HttpStatus.NOT_IMPLEMENTED,
    );
  }

  verifyWebhookSignature(payloadString: string, signature?: string): boolean {
    if (!signature) return false;
    const expected = computeWebhookHmac(payloadString);
    return signature === expected;
  }
}

@Injectable()
export class PaymentAdapterService implements PaymentGateway {
  private readonly sandbox = new SandboxPaymentGateway();
  private readonly vietqr = new RealPaymentGateway('vietqr');
  private readonly payos = new RealPaymentGateway('payos');

  public isSandboxMode(): boolean {
    const mode = (process.env.PAYMENT_GATEWAY || 'sandbox').toLowerCase();
    return mode === 'sandbox';
  }

  private getGateway(): PaymentGateway {
    const mode = (process.env.PAYMENT_GATEWAY || 'sandbox').toLowerCase();
    if (mode === 'vietqr') return this.vietqr;
    if (mode === 'payos') return this.payos;
    return this.sandbox;
  }

  createQr(
    input: CreateQrInput,
    onSandboxAutoConfirm?: (paymentCode: string) => void,
  ): CreateQrResult {
    return this.getGateway().createQr(input, onSandboxAutoConfirm);
  }

  verifyWebhookSignature(payloadString: string, signature?: string): boolean {
    return this.getGateway().verifyWebhookSignature(payloadString, signature);
  }
}
