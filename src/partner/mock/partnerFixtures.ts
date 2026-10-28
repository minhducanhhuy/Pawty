import { daysFromNowIso } from '../../shared/lib/format';
import type { PartnerAd, PartnerProfile } from '../api/partnerTypes';

export function buildAdBannerSvg(title: string, discountPercent: number, themeColor = '#FF6F61'): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="720" height="540" viewBox="0 0 720 540">
<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#FFE8E5"/>
    <stop offset="55%" stop-color="#FDFBF7"/>
    <stop offset="100%" stop-color="#EBF9F6"/>
  </linearGradient>
</defs>
<rect width="720" height="540" fill="url(#bg)"/>
<circle cx="600" cy="110" r="85" fill="${themeColor}" opacity="0.18"/>
<circle cx="120" cy="430" r="110" fill="#48C4B0" opacity="0.22"/>
<rect x="48" y="64" width="624" height="412" rx="32" fill="#FFFFFF" stroke="#A3E4D7" stroke-width="4"/>
<text x="360" y="190" font-family="Arial" font-size="34" font-weight="800" text-anchor="middle" fill="#1E293B">${title}</text>
<text x="360" y="265" font-family="Arial" font-size="56" font-weight="900" text-anchor="middle" fill="${themeColor}">VOUCHER -${discountPercent}%</text>
<text x="360" y="335" font-family="Arial" font-size="22" font-weight="600" text-anchor="middle" fill="#475569">Dành riêng cho cư dân cộng đồng Pawty 🐾</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function buildVietQrSvg(paymentCode: string, amountVnd: number): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="360" viewBox="0 0 360 360">
<rect width="360" height="360" rx="24" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="4"/>
<rect x="36" y="36" width="84" height="84" rx="12" fill="none" stroke="#0F172A" stroke-width="10"/>
<rect x="58" y="58" width="40" height="40" rx="6" fill="#FF6F61"/>
<rect x="240" y="36" width="84" height="84" rx="12" fill="none" stroke="#0F172A" stroke-width="10"/>
<rect x="262" y="58" width="40" height="40" rx="6" fill="#0F172A"/>
<rect x="36" y="240" width="84" height="84" rx="12" fill="none" stroke="#0F172A" stroke-width="10"/>
<rect x="58" y="262" width="40" height="40" rx="6" fill="#48C4B0"/>
<rect x="148" y="148" width="64" height="64" rx="12" fill="#0F172A"/>
<text x="180" y="344" font-family="monospace" font-size="13" font-weight="700" text-anchor="middle" fill="#334155">${paymentCode} (${amountVnd.toLocaleString('vi-VN')}đ)</text>
</svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export function buildInitialPartnerProfile(): PartnerProfile {
  return {
    id: 'ptn_1',
    businessName: 'Pawty Spa & Hotel',
    category: 'spa',
    contactEmail: 'partner@pawtyspa.vn',
    phone: '0281234567',
    address: '12 Nguyễn Hữu Cảnh, P.22, Bình Thạnh, TP.HCM',
    lat: 10.7942,
    lng: 106.7215,
    status: 'approved',
    plan: 'cpc',
    balanceVnd: 420_000,
    createdAt: daysFromNowIso(-60),
  };
}

export function buildInitialPartnerAds(): PartnerAd[] {
  return [
    {
      id: 'ad_1',
      partnerId: 'ptn_1',
      partnerName: 'Pawty Spa & Hotel',
      title: 'Combo Spa Tắm Gội Thảo Dược & Cắt Tỉa Lông Boss',
      description: 'Tặng kèm massage chân & khử mùi sinh học cho các Boss cư dân Vinhomes & Thảo Điền.',
      imageUrl: buildAdBannerSvg('Pawty Spa & Hotel', 35, '#FF6F61'),
      discountPercent: 35,
      voucherQuota: 100,
      vouchersIssued: 37,
      vouchersRedeemed: 18,
      radiusMeters: 1500,
      startsAt: daysFromNowIso(-10),
      endsAt: daysFromNowIso(20),
      status: 'active',
      impressions: 5230,
      clicks: 412,
      spendVnd: 1_236_000,
    },
    {
      id: 'ad_2',
      partnerId: 'ptn_1',
      partnerName: 'Pawty Spa & Hotel',
      title: 'Khách Sạn Thú Cưng Cuối Tuần - Phòng VIP Có Camera 24/7',
      description: 'Giảm ngay 30% phí lưu trú cuối tuần, kèm 2 buổi dắt dạo công viên nội khu mỗi ngày.',
      imageUrl: buildAdBannerSvg('Khách Sạn Boss VIP', 30, '#48C4B0'),
      discountPercent: 30,
      voucherQuota: 50,
      vouchersIssued: 14,
      vouchersRedeemed: 6,
      radiusMeters: 2000,
      startsAt: daysFromNowIso(-5),
      endsAt: daysFromNowIso(25),
      status: 'paused',
      impressions: 1840,
      clicks: 128,
      spendVnd: 384_000,
    },
  ];
}
