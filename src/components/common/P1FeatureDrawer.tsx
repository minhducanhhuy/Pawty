import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { SavedVoucher, PetReminder } from '../../types';
import {
  X,
  Ticket,
  CalendarClock,
  Flame,
  Copy,
  Check,
  Plus,
  Globe,
  Share2,
  ShieldCheck,
  Navigation,
  Footprints,
} from 'lucide-react';

interface P1FeatureDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'walk_now' | 'vouchers' | 'reminders' | 'badges' | 'referral' | 'settings';
}

const BADGE_CATALOG = [
  { code: 'first_match', icon: '💞', name: 'Match Đầu Tiên', desc: 'Khớp lệnh với Boss đầu tiên', earned: true },
  { code: 'safe_pet', icon: '🛡️', name: 'Safe Pet Chuẩn Mực', desc: 'Xác minh sổ tiêm chủng điện tử', earned: true },
  { code: 'walk_7_streak', icon: '🔥', name: 'Chiến Thần Đi Dạo', desc: 'Chuỗi 7 ngày dắt Boss liên tiếp', earned: false, progress: '4/7 ngày' },
  { code: 'social_butterfly', icon: '🦋', name: 'Ngoại Giao Sân Cỏ', desc: 'Hoàn thành 5 kèo hẹn check-in', earned: false, progress: '2/5 kèo' },
  { code: 'moment_10', icon: '📸', name: 'Thánh Sống Ảo', desc: 'Đăng 10 khoảnh khắc bựa', earned: false, progress: '4/10 ảnh' },
  { code: 'referral_3', icon: '🎁', name: 'Đại Sứ Pawty', desc: 'Mời 3 Sen hàng xóm tham gia', earned: false, progress: '1/3 Sen' },
];

export const P1FeatureDrawer: React.FC<P1FeatureDrawerProps> = ({
  isOpen,
  onClose,
  initialTab = 'walk_now',
}) => {
  const { user, currentPet, triggerPushNotice } = useApp();
  const [tab, setTab] = useState(initialTab);
  const [isWalking, setIsWalking] = useState(Boolean(user.isWalkingNow));
  const [streakDays, setStreakDays] = useState(user.walkStreakDays || 4);
  const [locale, setLocale] = useState<'vi' | 'en'>(user.locale || 'vi');
  const [hideDistance, setHideDistance] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const [vouchers] = useState<SavedVoucher[]>([
    {
      id: 'v_01',
      code: 'PAW-SPA35A',
      title: 'Gói Tắm Sấy & Cắt Tỉa Siêu Cấp',
      brandName: 'PAW PARADISE SPA & HOTEL',
      discountBadge: '-35%',
      expiresAt: '11/11/2026',
      status: 'saved',
    },
    {
      id: 'v_02',
      code: 'PAW-CAFE30',
      title: 'Combo Cà Phê & Bánh Thưởng Cho Boss',
      brandName: 'MEOW & WOOF BAKERY',
      discountBadge: '-30%',
      expiresAt: '15/11/2026',
      status: 'saved',
    },
  ]);

  const [reminders, setReminders] = useState<PetReminder[]>([
    { id: 'r_01', petId: currentPet.id, kind: 'vaccine', title: 'Tái chủng mũi 7 bệnh Vanguard Plus', dueDate: '15/01/2027', isDone: false },
    { id: 'r_02', petId: currentPet.id, kind: 'deworm', title: 'Tẩy giun định kỳ NexGard Spectra', dueDate: '05/11/2026', isDone: false },
    { id: 'r_03', petId: currentPet.id, kind: 'custom', title: 'Cắt móng & vệ sinh tai tại Paw Paradise', dueDate: '01/11/2026', isDone: true },
  ]);
  const [newReminderTitle, setNewReminderTitle] = useState('');

  if (!isOpen) return null;

  const referralCode = user.referralCode || 'PAWTY-BO01';

  const handleToggleWalkNow = () => {
    const next = !isWalking;
    setIsWalking(next);
    if (!next) {
      setStreakDays((s) => s + 1);
      triggerPushNotice({
        title: '🐕 Đã hoàn thành buổi dạo phố (+620m)!',
        body: `Chuỗi Streak của ${currentPet.name} tăng lên ${streakDays + 1} ngày liên tiếp 🔥`,
        type: 'system',
      });
    } else {
      triggerPushNotice({
        title: '🟢 Đã bật chế độ Dắt Dạo Ngay (30 phút)',
        body: 'Vị trí của bạn được làm tròn lưới 100m để các Sen xung quanh rủ nhập hội!',
        type: 'system',
      });
    }
  };

  const handleAddReminder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReminderTitle.trim()) return;
    setReminders((prev) => [
      {
        id: `r_${Date.now()}`,
        petId: currentPet.id,
        kind: 'custom',
        title: newReminderTitle.trim(),
        dueDate: '20/11/2026',
        isDone: false,
      },
      ...prev,
    ]);
    setNewReminderTitle('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-xs">
      <div className="w-full max-w-sm bg-[#FDFBF7] rounded-[32px] overflow-hidden shadow-2xl border border-slate-200 flex flex-col max-h-[88vh]">
        <div className="px-4 py-3 bg-white border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="font-fredoka text-base font-bold text-slate-900">
              Tiện Ích Mở Rộng (Phase 1–2)
            </h3>
            <p className="text-[10px] text-slate-500">
              Walk Now • Ví Voucher • Sổ Nhắc Lịch • Huy Hiệu • Referral
            </p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 text-slate-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-3 py-2 bg-slate-100/80 border-b border-slate-200/70 flex gap-1 overflow-x-auto text-[11px] font-bold">
          {[
            { id: 'walk_now', label: '🐕 Dạo Ngay' },
            { id: 'vouchers', label: '🎁 Voucher' },
            { id: 'reminders', label: '💉 Nhắc Lịch' },
            { id: 'badges', label: '🏅 Huy Hiệu' },
            { id: 'referral', label: '🤝 Mời Bạn' },
            { id: 'settings', label: '⚙️ Cài Đặt' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setTab(item.id as typeof tab)}
              className={`px-2.5 py-1 rounded-xl shrink-0 transition-all ${
                tab === item.id ? 'bg-[#FF6F61] text-white shadow-2xs' : 'bg-white text-slate-600'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs text-slate-700">
          {tab === 'walk_now' && (
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white space-y-2 shadow-md">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold tracking-wider bg-white/20 px-2 py-0.5 rounded-full">
                    {isWalking ? '🟢 Đang phát sóng (Còn 29:40)' : 'Chế độ Live 30 phút'}
                  </span>
                  <span className="font-fredoka font-bold flex items-center gap-1 text-amber-200">
                    <Flame className="w-4 h-4 fill-current" /> Streak {streakDays} ngày
                  </span>
                </div>
                <h4 className="font-fredoka text-base font-black">
                  Dắt {currentPet.name} Ra Công Viên Ngay!
                </h4>
                <p className="text-[11px] text-emerald-50 leading-relaxed">
                  Bật trạng thái đang dắt dạo để xuất hiện đầu bảng Radar với chấm xanh và gặp gỡ các Boss đang ở gần (ẩn danh lưới 100m).
                </p>
                <button
                  onClick={handleToggleWalkNow}
                  className={`w-full py-2.5 rounded-xl font-fredoka font-bold text-xs shadow transition-transform active:scale-95 ${
                    isWalking ? 'bg-red-500 text-white' : 'bg-white text-emerald-900'
                  }`}
                >
                  {isWalking ? '⏹ Dừng Dắt Dạo & Lưu Quãng Đường' : '🐕 Bật Chế Độ Dắt Dạo Ngay'}
                </button>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-slate-200 space-y-2">
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Navigation className="w-3.5 h-3.5 text-[#FF6F61]" />
                  <span>Boss Đang Dạo Quanh Bạn (Bán kính 500m)</span>
                </p>
                <div className="space-y-2">
                  {[
                    { name: 'Mochi (Shiba Inu)', dist: '~200m • Công viên Landmark', time: 'Vừa ra đường' },
                    { name: 'Gấu Nâu (Golden)', dist: '~400m • Đường ven sông', time: '12 phút trước' },
                  ].map((w, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 border border-slate-100">
                      <div>
                        <p className="font-bold text-slate-800">{w.name}</p>
                        <p className="text-[10px] text-slate-500">{w.dist}</p>
                      </div>
                      <span className="text-[10px] text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded-full">
                        🟢 {w.time}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {tab === 'vouchers' && (
            <div className="space-y-2.5">
              {vouchers.map((v) => (
                <div key={v.id} className="p-3 rounded-2xl bg-white border border-amber-200 shadow-2xs space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded-md bg-[#FF6F61] text-white font-bold text-[10px]">
                      {v.discountBadge}
                    </span>
                    <span className="text-[10px] text-slate-400">HSD: {v.expiresAt}</span>
                  </div>
                  <p className="font-bold text-slate-900 font-fredoka">{v.title}</p>
                  <p className="text-[10px] text-slate-500">{v.brandName}</p>
                  <div className="pt-1 flex items-center justify-between border-t border-dashed border-slate-200">
                    <code className="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                      {v.code}
                    </code>
                    <span className="text-[10px] text-slate-500 flex items-center gap-1">
                      <Ticket className="w-3 h-3 text-amber-500" /> Xuất trình tại quầy
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === 'reminders' && (
            <div className="space-y-3">
              <form onSubmit={handleAddReminder} className="flex gap-1.5">
                <input
                  value={newReminderTitle}
                  onChange={(e) => setNewReminderTitle(e.target.value)}
                  placeholder="Thêm lịch tiêm / tẩy giun / spa..."
                  className="flex-1 px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs"
                />
                <button type="submit" className="px-3 py-2 rounded-xl bg-[#FF6F61] text-white font-bold">
                  <Plus className="w-4 h-4" />
                </button>
              </form>
              <div className="space-y-2">
                {reminders.map((r) => (
                  <div
                    key={r.id}
                    onClick={() =>
                      setReminders((prev) =>
                        prev.map((x) => (x.id === r.id ? { ...x, isDone: !x.isDone } : x))
                      )
                    }
                    className="p-3 rounded-2xl bg-white border border-slate-200 flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <p className={`font-bold ${r.isDone ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                        {r.title}
                      </p>
                      <p className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                        <CalendarClock className="w-3 h-3 text-[#FF6F61]" /> Hạn: {r.dueDate}
                      </p>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${r.isDone ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-800'}`}>
                      {r.isDone ? 'Đã xong ✓' : 'Sắp tới'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tab === 'badges' && (
            <div className="grid grid-cols-2 gap-2.5">
              {BADGE_CATALOG.map((b) => (
                <div
                  key={b.code}
                  className={`p-3 rounded-2xl border text-center space-y-1 ${
                    b.earned ? 'bg-[#E8F8F5] border-[#A3E4D7]' : 'bg-slate-100/70 border-slate-200 opacity-70'
                  }`}
                >
                  <div className="text-2xl">{b.icon}</div>
                  <p className="font-fredoka font-bold text-slate-900 text-xs">{b.name}</p>
                  <p className="text-[10px] text-slate-500 leading-snug">{b.desc}</p>
                  <span className="inline-block text-[9px] font-bold px-2 py-0.5 rounded-full bg-white text-emerald-800">
                    {b.earned ? '✓ Đã đạt' : b.progress}
                  </span>
                </div>
              ))}
            </div>
          )}

          {tab === 'referral' && (
            <div className="space-y-3 text-center p-3 bg-white rounded-2xl border border-slate-200">
              <div className="w-12 h-12 rounded-2xl bg-[#FF6F61]/15 text-[#FF6F61] flex items-center justify-center mx-auto">
                <Share2 className="w-6 h-6" />
              </div>
              <h4 className="font-fredoka text-base font-bold text-slate-900">
                Mời 1 Hàng Xóm → Cả Hai Nhận 7 Ngày VIP 👑
              </h4>
              <p className="text-[11px] text-slate-500">
                Chia sẻ mã giới thiệu của nhà {currentPet.name} cho hội nuôi cún mèo cùng chung cư:
              </p>
              <div className="flex items-center justify-between bg-slate-100 px-3 py-2.5 rounded-xl border border-slate-200 font-mono font-bold text-sm text-slate-900">
                <span>{referralCode}</span>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(referralCode);
                    setCopiedCode(true);
                    setTimeout(() => setCopiedCode(false), 1800);
                  }}
                  className="text-xs text-[#FF6F61] flex items-center gap-1 font-sans font-bold"
                >
                  {copiedCode ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedCode ? 'Đã chép' : 'Sao chép'}</span>
                </button>
              </div>
              <p className="text-[10px] text-emerald-700 font-semibold">
                Đã mời thành công: 1 Sen • Đã cộng +7 ngày Sen VIP
              </p>
            </div>
          )}

          {tab === 'settings' && (
            <div className="space-y-2.5">
              <div className="p-3 rounded-2xl bg-white border border-slate-200 flex items-center justify-between">
                <span className="font-bold flex items-center gap-2">
                  <Globe className="w-4 h-4 text-[#FF6F61]" /> Ngôn ngữ (Language)
                </span>
                <button
                  onClick={() => setLocale(locale === 'vi' ? 'en' : 'vi')}
                  className="px-3 py-1 rounded-xl bg-slate-100 font-bold text-slate-800"
                >
                  {locale === 'vi' ? '🇻🇳 Tiếng Việt' : '🇬🇧 English'}
                </button>
              </div>
              <div className="p-3 rounded-2xl bg-white border border-slate-200 flex items-center justify-between">
                <span className="font-bold flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" /> Ẩn khoảng cách chính xác
                </span>
                <input
                  type="checkbox"
                  checked={hideDistance}
                  onChange={(e) => setHideDistance(e.target.checked)}
                  className="w-4 h-4 accent-[#FF6F61]"
                />
              </div>
              <div className="p-3 rounded-2xl bg-white border border-slate-200 space-y-1">
                <p className="font-bold text-slate-900 flex items-center gap-1.5">
                  <Footprints className="w-4 h-4 text-[#FF6F61]" /> Cổng Quản Trị & Đối Tác B2B
                </p>
                <div className="flex gap-2 pt-1">
                  <a
                    href="/admin.html"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 text-center rounded-xl bg-slate-900 text-white font-bold text-[11px]"
                  >
                    🛡️ Mở Admin Portal
                  </a>
                  <a
                    href="/partner.html"
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 py-2 text-center rounded-xl bg-[#A3E4D7] text-emerald-950 font-bold text-[11px]"
                  >
                    🏪 Mở Partner Portal
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

