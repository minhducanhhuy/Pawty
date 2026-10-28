import { HttpStatus, Injectable } from '@nestjs/common';
import { DataStoreService } from '../../database/data-store.service';
import {
  computeWebhookHmac,
  PaymentAdapterService,
} from '../../adapters/payment.adapter';
import { PushAdapterService } from '../../adapters/push.adapter';
import { ReferralsService } from '../referrals/referrals.service';
import { BUSINESS_RULES } from '../../config/business-rules';
import { DomainException } from '../../common/errors';
import {
  TransactionRecord,
  TransactionType,
  UserRecord,
} from '../../database/types';

export type PaymentServiceType =
  | 'sos_emergency'
  | 'vip_subscription'
  | 'vip_plus_subscription'
  | 'boost'
  | 'boost_pack'
  | 'super_like_pack';

@Injectable()
export class PaymentsService {
  constructor(
    private readonly dataStore: DataStoreService,
    private readonly paymentAdapter: PaymentAdapterService,
    private readonly pushAdapter: PushAdapterService,
    private readonly referralsService: ReferralsService,
  ) {}

  private resolveTypeAndAmount(
    serviceType: PaymentServiceType,
    plan?: 'month' | 'year',
  ): { type: TransactionType; amount: number } {
    switch (serviceType) {
      case 'sos_emergency':
        return { type: 'sos', amount: BUSINESS_RULES.sos.priceVnd };
      case 'vip_subscription':
        return plan === 'year'
          ? {
              type: 'vip_year',
              amount: BUSINESS_RULES.tiers.vip.priceYearVnd || 399000,
            }
          : {
              type: 'vip_month',
              amount: BUSINESS_RULES.tiers.vip.priceMonthVnd,
            };
      case 'vip_plus_subscription':
        return {
          type: 'vip_plus_month',
          amount:
            plan === 'year'
              ? BUSINESS_RULES.tiers.vip_plus.priceYearVnd || 799000
              : BUSINESS_RULES.tiers.vip_plus.priceMonthVnd,
        };
      case 'boost':
        return {
          type: 'boost',
          amount: BUSINESS_RULES.products.boost.priceVnd,
        };
      case 'boost_pack':
        return {
          type: 'boost_pack',
          amount: BUSINESS_RULES.products.boostPack.priceVnd,
        };
      case 'super_like_pack':
        return {
          type: 'super_like_pack',
          amount: BUSINESS_RULES.products.superLikePack.priceVnd,
        };
      default:
        throw new DomainException(
          'BAD_REQUEST',
          `Loại dịch vụ thanh toán không hợp lệ: ${serviceType}`,
          HttpStatus.BAD_REQUEST,
        );
    }
  }

  public createQrForUser(
    user: UserRecord,
    body: {
      serviceType: PaymentServiceType;
      plan?: 'month' | 'year';
    },
  ) {
    if (!body?.serviceType) {
      throw new DomainException(
        'BAD_REQUEST',
        'Thiếu thông tin serviceType.',
        HttpStatus.BAD_REQUEST,
      );
    }

    const { type, amount } = this.resolveTypeAndAmount(
      body.serviceType,
      body.plan,
    );
    const transactionId = `tx_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const paymentCode = `PAWTY_${type.toUpperCase()}_${Math.floor(100000 + Math.random() * 900000)}`;

    const tx: TransactionRecord = {
      id: transactionId,
      userId: user.id,
      type,
      amountVnd: amount,
      paymentGateway: process.env.PAYMENT_GATEWAY || 'sandbox',
      paymentCode,
      status: 'pending',
      paidAt: null,
      createdAt: new Date().toISOString(),
    };

    this.dataStore.transactions.unshift(tx);
    this.dataStore.save();

    const qrResult = this.paymentAdapter.createQr(
      {
        transactionId,
        amount,
        paymentCode,
      },
      (autoCode) => {
        void this.fulfilByPaymentCode(autoCode).catch(() => {});
      },
    );

    return qrResult;
  }

  public getTransactionStatus(user: UserRecord, transactionId: string) {
    const tx = this.dataStore.transactions.find(
      (t) => t.id === transactionId || t.paymentCode === transactionId,
    );
    if (!tx) {
      throw new DomainException(
        'NOT_FOUND',
        'Không tìm thấy giao dịch.',
        HttpStatus.NOT_FOUND,
      );
    }
    if (
      tx.userId !== user.id &&
      user.role !== 'admin' &&
      user.role !== 'moderator'
    ) {
      throw new DomainException(
        'FORBIDDEN',
        'Bạn không có quyền xem giao dịch này.',
        HttpStatus.FORBIDDEN,
      );
    }

    return {
      transactionId: tx.id,
      paymentCode: tx.paymentCode,
      type: tx.type,
      amountVnd: tx.amountVnd,
      status: tx.status,
      paidAt: tx.paidAt || null,
    };
  }

  public async fulfilTransaction(tx: TransactionRecord): Promise<{
    transaction: TransactionRecord;
    idempotent: boolean;
  }> {
    if (tx.status === 'paid') {
      return { transaction: tx, idempotent: true };
    }

    tx.status = 'paid';
    tx.paidAt = new Date().toISOString();

    const user = this.dataStore.users.find((u) => u.id === tx.userId);
    if (user) {
      switch (tx.type) {
        case 'vip_month': {
          this.referralsService.extendVipDays(user, 30);
          if (user.vipTier === 'free') user.vipTier = 'vip';
          user.isVip = true;
          break;
        }
        case 'vip_year': {
          this.referralsService.extendVipDays(user, 365);
          if (user.vipTier === 'free') user.vipTier = 'vip';
          user.isVip = true;
          break;
        }
        case 'vip_plus_month': {
          const days = tx.amountVnd >= 700000 ? 365 : 30;
          this.referralsService.extendVipDays(user, days);
          user.vipTier = 'vip_plus';
          user.isVip = true;
          break;
        }
        case 'boost': {
          user.boostBalance += BUSINESS_RULES.products.boost.count;
          break;
        }
        case 'boost_pack': {
          user.boostBalance += BUSINESS_RULES.products.boostPack.count;
          break;
        }
        case 'super_like_pack': {
          user.superLikeBalance += BUSINESS_RULES.products.superLikePack.count;
          break;
        }
        case 'sos': {
          // Marked paid so user can invoke POST /sos
          break;
        }
        case 'partner_topup': {
          if (tx.partnerId) {
            const partner = this.dataStore.partners.find(
              (p) => p.id === tx.partnerId,
            );
            if (partner) {
              partner.balanceVnd += tx.amountVnd;
            }
          }
          break;
        }
      }

      await this.pushAdapter.sendPush(user.id, {
        type: 'system',
        title: '✅ Thanh toán thành công!',
        body: `Giao dịch ${tx.paymentCode} (${tx.amountVnd.toLocaleString('vi-VN')}đ) đã được kích hoạt.`,
        payload: { transactionId: tx.id, type: tx.type },
      });
    }

    this.dataStore.save();
    return { transaction: tx, idempotent: false };
  }

  public async fulfilByPaymentCode(paymentCode: string) {
    const tx = this.dataStore.transactions.find(
      (t) => t.paymentCode === paymentCode || t.id === paymentCode,
    );
    if (!tx) {
      throw new DomainException(
        'NOT_FOUND',
        `Không tìm thấy giao dịch với mã ${paymentCode}.`,
        HttpStatus.NOT_FOUND,
      );
    }
    return this.fulfilTransaction(tx);
  }

  public async handleWebhook(
    body: {
      paymentCode?: string;
      orderCode?: string;
      transactionId?: string;
      amount?: number;
    },
    signature?: string,
  ) {
    const code = body?.paymentCode || body?.orderCode || body?.transactionId;
    if (!code) {
      throw new DomainException(
        'BAD_REQUEST',
        'Thiếu mã giao dịch (paymentCode).',
        HttpStatus.BAD_REQUEST,
      );
    }

    const rawJson = JSON.stringify(body);
    const isValidJsonSig = this.paymentAdapter.verifyWebhookSignature(
      rawJson,
      signature,
    );
    const isValidCodeSig =
      signature !== undefined && signature === computeWebhookHmac(code);

    if (!isValidJsonSig && !isValidCodeSig) {
      throw new DomainException(
        'INVALID_SIGNATURE',
        'Chữ ký X-Pawty-Signature không hợp lệ.',
        HttpStatus.UNAUTHORIZED,
      );
    }

    const result = await this.fulfilByPaymentCode(code);
    return {
      status: result.transaction.status,
      transactionId: result.transaction.id,
      paymentCode: result.transaction.paymentCode,
      idempotent: result.idempotent,
    };
  }

  public async confirmSandboxPayment(
    user: UserRecord,
    body: { transactionId?: string; paymentCode?: string },
  ) {
    if (!this.paymentAdapter.isSandboxMode()) {
      throw new DomainException(
        'FORBIDDEN',
        'Endpoint xác nhận nhanh chỉ khả dụng khi PAYMENT_GATEWAY=sandbox.',
        HttpStatus.FORBIDDEN,
      );
    }

    const key = body?.transactionId || body?.paymentCode;
    const tx = key
      ? this.dataStore.transactions.find(
          (t) => t.id === key || t.paymentCode === key,
        )
      : this.dataStore.transactions.find(
          (t) => t.userId === user.id && t.status === 'pending',
        );

    if (!tx) {
      throw new DomainException(
        'NOT_FOUND',
        'Không tìm thấy giao dịch cần xác nhận.',
        HttpStatus.NOT_FOUND,
      );
    }

    const result = await this.fulfilTransaction(tx);
    return {
      transactionId: result.transaction.id,
      paymentCode: result.transaction.paymentCode,
      status: result.transaction.status,
      idempotent: result.idempotent,
      vipTier: user.vipTier,
      isVip: user.isVip,
      vipExpiresAt: user.vipExpiresAt,
      boostBalance: user.boostBalance,
      superLikeBalance: user.superLikeBalance,
    };
  }
}
