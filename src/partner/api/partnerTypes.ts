import type { PageQuery, PagedResult } from '../../shared/api/paged';

export type PartnerCategory = 'spa' | 'cafe' | 'vet' | 'shop' | 'hotel' | 'park';
export type PartnerApprovalStatus = 'pending' | 'approved' | 'suspended';
export type PartnerBillingPlan = 'cpc' | 'monthly';
export type PartnerAdStatus = 'draft' | 'active' | 'paused' | 'ended';

export interface PartnerProfile {
  id: string;
  businessName: string;
  category: PartnerCategory;
  contactEmail: string;
  phone: string;
  address: string;
  lat: number;
  lng: number;
  status: PartnerApprovalStatus;
  plan: PartnerBillingPlan;
  balanceVnd: number;
  createdAt: string;
}

export interface PartnerSession {
  token: string;
  partner: PartnerProfile;
}

export interface PartnerRegisterPayload {
  businessName: string;
  category: PartnerCategory;
  contactEmail: string;
  password: string;
  phone: string;
  address: string;
  lat: number;
  lng: number;
}

export interface PartnerAd {
  id: string;
  partnerId: string;
  partnerName?: string;
  title: string;
  description: string;
  imageUrl: string;
  discountPercent: number;
  voucherQuota: number;
  vouchersIssued: number;
  vouchersRedeemed?: number;
  radiusMeters: number;
  startsAt: string;
  endsAt: string;
  status: PartnerAdStatus;
  impressions: number;
  clicks: number;
  spendVnd?: number;
}

export interface PartnerAdInput {
  title: string;
  description: string;
  imageUrl: string;
  discountPercent: number;
  voucherQuota: number;
  radiusMeters: number;
  startsAt: string;
  endsAt: string;
  status: PartnerAdStatus;
}

export interface PartnerAdStats {
  impressions: number;
  clicks: number;
  vouchersIssued: number;
  vouchersRedeemed: number;
  spendVnd: number;
}

export interface TopupResponse {
  transactionId?: string;
  qrCodeUrl: string;
  bankName: string;
  accountNo: string;
  amount: number;
  paymentCode: string;
  status: 'pending' | 'paid';
  newBalanceVnd?: number;
}

export interface RedeemVoucherResponse {
  redeemed: boolean;
  code: string;
  discountPercent: number;
  campaignTitle?: string;
  redeemedAt: string;
}

export interface PartnerApi {
  register(payload: PartnerRegisterPayload): Promise<PartnerProfile>;
  login(email: string, password: string): Promise<PartnerSession>;
  getMe(): Promise<PartnerProfile>;
  createTopup(amountVnd: number): Promise<TopupResponse>;
  confirmSandboxTopup(transactionId: string | undefined, amountVnd: number): Promise<PartnerProfile>;
  listAds(query: PageQuery): Promise<PagedResult<PartnerAd>>;
  createAd(input: PartnerAdInput): Promise<PartnerAd>;
  updateAd(adId: string, patch: Partial<PartnerAdInput>): Promise<PartnerAd>;
  getAdStats(adId: string): Promise<PartnerAdStats>;
  redeemVoucher(code: string): Promise<RedeemVoucherResponse>;
}
