import { MapPin, Sparkles } from 'lucide-react';
import { buildAdBannerSvg } from '../mock/partnerFixtures';

interface NativeAdPreviewCardProps {
  businessName: string;
  title: string;
  description: string;
  imageUrl?: string;
  discountPercent: number;
  radiusMeters: number;
}

/**
 * Mô phỏng chính xác thẻ Quảng Cáo Bản Địa (Native Ad Card) trên màn hình Radar (§2.3 Master Print):
 * - Huy hiệu "Được tài trợ • Native Ad"
 * - Nhãn "Voucher -35%"
 * - Nút CTA "Lưu Voucher Ngay 🎁"
 */
export function NativeAdPreviewCard({
  businessName,
  title,
  description,
  imageUrl,
  discountPercent,
  radiusMeters,
}: NativeAdPreviewCardProps) {
  const effectiveImage = imageUrl?.trim() ? imageUrl : buildAdBannerSvg(businessName || 'Pawty Partner', discountPercent);

  return (
    <div className="mx-auto w-full max-w-xs overflow-hidden rounded-[32px] border-2 border-coral/30 bg-white shadow-xl">
      <div className="relative h-56 w-full overflow-hidden bg-cream">
        <img
          src={effectiveImage}
          alt={title || 'Native Ad Preview'}
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-900/15 to-transparent" />

        <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-slate-900/80 px-3 py-1 text-[11px] font-extrabold text-amber-300 backdrop-blur-sm">
          <Sparkles className="h-3 w-3" />
          Được tài trợ • Native Ad
        </div>

        <div className="absolute right-3 top-3 rounded-full bg-coral px-3 py-1 text-xs font-extrabold text-white shadow-md">
          Voucher -{discountPercent}%
        </div>

        <div className="absolute bottom-3 left-3 right-3 text-white">
          <div className="inline-flex items-center gap-1 rounded-full bg-mint/95 px-2.5 py-0.5 text-[11px] font-extrabold text-slate-900">
            <MapPin className="h-3 w-3" />
            Trong bán kính {(radiusMeters / 1000).toFixed(1)}km • {businessName}
          </div>
          <h3 className="mt-1.5 font-fredoka text-lg font-bold leading-snug line-clamp-2">
            {title || 'Tiêu đề chiến dịch ưu đãi cho Boss'}
          </h3>
        </div>
      </div>

      <div className="space-y-3 p-4">
        <p className="text-xs leading-relaxed text-slate-600 line-clamp-2">
          {description || 'Mô tả chi tiết ưu đãi dành riêng cho cộng đồng cư dân nuôi thú cưng xung quanh cửa hàng.'}
        </p>

        <button
          type="button"
          className="w-full rounded-2xl bg-coral py-3 font-fredoka text-sm font-bold text-white shadow-md shadow-coral/30 transition-transform active:scale-98 cursor-pointer"
        >
          Lưu Voucher Ngay 🎁
        </button>
      </div>
    </div>
  );
}
