import React, { useState } from 'react';
import {
  Bookmark,
  Calendar,
  CheckCircle2,
  Crown,
  Download,
  Lock,
  MapPin,
  Plus,
  Share2,
  ShieldCheck,
  Star,
  Syringe,
  Users,
} from 'lucide-react';
import { formatSizeCategoryLabel, formatVndCurrency } from '@pawty/utils';
import { usePawtyStore } from '../../stores/usePawtyStore';

export const ProfileScreen: React.FC = () => {
  const {
    user,
    pets,
    activePetId,
    setActivePetId,
    posts,
    bookings,
    submitPartnerReview,
    addVaccinationRecord,
    addPetBehaviorChip,
    setActiveModal,
    showToast,
  } = usePawtyStore();

  const [activeProfileTab, setActiveProfileTab] = useState<'moments' | 'bio'>('bio');
  const [subPanel, setSubPanel] = useState<'none' | 'calendar' | 'history' | 'bookmarks'>('none');
  const [newVaccineName, setNewVaccineName] = useState('');
  const [newCautionChip, setNewCautionChip] = useState('');
  const [reviewBookingId, setReviewBookingId] = useState<string | null>(null);
  const [reviewText, setReviewText] = useState('');

  const activePet = pets.find((p) => p.id === activePetId) ?? pets[0];
  const petPosts = posts.filter(
    (p) => p.petIds.includes(activePet.id) || p.authorId === user.id
  );
  const bookmarkedPosts = posts.filter((p) => p.isBookmarked);

  const momentPhotos = [
    activePet.avatarUrl,
    activePet.coverPhotoUrl,
    'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1534361960057-19889db9621e?auto=format&fit=crop&w=500&q=80',
    'https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?auto=format&fit=crop&w=500&q=80',
  ];

  const goodHabits = activePet.behaviors.filter(
    (b) => b.category === 'good_habit' || b.category === 'personality'
  );
  const cautions = activePet.behaviors.filter((b) => b.category === 'caution');

  return (
    <div className="pb-8">
      {/* Cover Photo & Pet Switcher Header */}
      <div className="relative h-44 bg-stone-200">
        <img
          src={activePet.coverPhotoUrl}
          alt={activePet.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        <div className="absolute top-3 right-3 flex items-center gap-1.5">
          <button
            onClick={() => setActiveModal('vip_upgrade')}
            className="px-2.5 py-1 rounded-full bg-amber-400 text-[#2D3436] text-[11px] font-extrabold flex items-center gap-1 shadow-sm"
          >
            <Crown className="w-3.5 h-3.5" />
            {user.isVip ? 'Sen VIP' : 'Nâng cấp VIP'}
          </button>
          <button
            onClick={() => setActiveModal('privacy_center')}
            className="p-2 rounded-full bg-black/50 text-white"
            title="Quyền riêng tư & Dữ liệu"
          >
            <Lock className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Pet Switcher Pills on Cover */}
        <div className="absolute bottom-3 right-3 flex items-center gap-1.5">
          {pets.map((p) => (
            <button
              key={p.id}
              onClick={() => setActivePetId(p.id)}
              className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                p.id === activePet.id
                  ? 'bg-[#FF6F61] text-white shadow'
                  : 'bg-white/85 text-[#2D3436]'
              }`}
            >
              {p.species === 'dog' ? '🐕' : '🐈'} {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Profile Header Card */}
      <div className="px-4 -mt-10 relative z-10">
        <div className="bg-white rounded-3xl p-4 border border-stone-200/80 shadow-sm space-y-3">
          <div className="flex items-end justify-between gap-3">
            <div className="flex items-center gap-3">
              <img
                src={activePet.avatarUrl}
                alt={activePet.name}
                className="w-18 h-18 rounded-3xl object-cover border-4 border-white shadow-md -mt-8"
              />
              <div>
                <h1 className="font-display text-lg font-bold text-[#2D3436]">
                  {activePet.name} — {activePet.breed}
                </h1>
                <p className="text-xs text-stone-500 flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-[#FF6F61]" /> {user.neighborhood}
                </p>
                <p className="text-xs font-extrabold text-[#FF6F61] mt-0.5">
                  🐾 {activePet.followerCount} followers · Quản lý bởi {user.displayName}
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              onClick={() => setActiveModal('invite_circle')}
              className="py-2 rounded-xl bg-[#FF6F61] text-white text-xs font-bold flex items-center justify-center gap-1 shadow-2xs"
            >
              <Users className="w-3.5 h-3.5" /> Vòng Circle
            </button>
            <button
              onClick={() => {
                if (!user.isVip) {
                  setActiveModal('vip_upgrade');
                  showToast(
                    'Tính năng Sen VIP 👑',
                    'Nâng cấp Sen VIP để xuất file PDF Sổ tiêm chủng có mã QR xác thực.',
                    'warning'
                  );
                } else {
                  showToast(
                    'Đã xuất PDF Sổ tiêm chủng 📄',
                    `Sổ tiêm điện tử của ${activePet.name} đã sẵn sàng tải xuống.`
                  );
                }
              }}
              className="py-2 rounded-xl bg-[#A3E4D7]/45 text-teal-950 text-xs font-bold flex items-center justify-center gap-1"
            >
              <Download className="w-3.5 h-3.5" /> Xuất Sổ tiêm
            </button>
            <button
              onClick={() =>
                showToast('Đã sao chép hồ sơ công khai 🔗', `pawty.vn/pet/${activePet.name.toLowerCase()}`)
              }
              className="py-2 rounded-xl bg-stone-100 text-stone-700 text-xs font-bold flex items-center justify-center gap-1"
            >
              <Share2 className="w-3.5 h-3.5" /> Chia sẻ
            </button>
          </div>

          {/* Quick Utility Sub-Navigation (Calendar, Service History, Saved Bookmarks, Privacy) */}
          <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-stone-100">
            <button
              onClick={() => setSubPanel(subPanel === 'calendar' ? 'none' : 'calendar')}
              className={`py-1.5 rounded-xl text-[11px] font-bold flex flex-col items-center gap-0.5 ${
                subPanel === 'calendar' ? 'bg-[#2D3436] text-white' : 'bg-stone-50 text-stone-600'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Lịch tháng</span>
            </button>
            <button
              onClick={() => setSubPanel(subPanel === 'history' ? 'none' : 'history')}
              className={`py-1.5 rounded-xl text-[11px] font-bold flex flex-col items-center gap-0.5 ${
                subPanel === 'history' ? 'bg-[#2D3436] text-white' : 'bg-stone-50 text-stone-600'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Đơn dịch vụ</span>
            </button>
            <button
              onClick={() => setSubPanel(subPanel === 'bookmarks' ? 'none' : 'bookmarks')}
              className={`py-1.5 rounded-xl text-[11px] font-bold flex flex-col items-center gap-0.5 ${
                subPanel === 'bookmarks' ? 'bg-[#2D3436] text-white' : 'bg-stone-50 text-stone-600'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Đã lưu ({bookmarkedPosts.length})</span>
            </button>
            <button
              onClick={() => setActiveModal('privacy_center')}
              className="py-1.5 rounded-xl text-[11px] font-bold flex flex-col items-center gap-0.5 bg-stone-50 text-stone-600"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-teal-700" />
              <span>BVDLCN</span>
            </button>
          </div>
        </div>
      </div>

      {/* Expandable Sub-Panels (Calendar / Service History / Bookmarks) */}
      {subPanel === 'calendar' && (
        <div className="px-4 mt-3">
          <div className="p-4 rounded-3xl bg-white border border-stone-200 space-y-2">
            <h3 className="font-display text-sm font-bold">📅 Lịch Chăm Sóc Tháng 11/2026</h3>
            <div className="grid grid-cols-7 gap-1 text-center text-[11px]">
              {['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d) => (
                <span key={d} className="font-bold text-stone-400">
                  {d}
                </span>
              ))}
              {Array.from({ length: 14 }, (_, idx) => idx + 1).map((day) => {
                const hasEvent = day === 2 || day === 3 || day === 15;
                return (
                  <div
                    key={day}
                    className={`py-1.5 rounded-xl font-bold ${
                      hasEvent ? 'bg-[#FF6F61] text-white' : 'bg-stone-50 text-stone-700'
                    }`}
                  >
                    {day}
                  </div>
                );
              })}
            </div>
            <p className="text-[11px] text-stone-500">
              • 02/11: Grooming @ PetSpa Bubble & Paws · 03/11: Hẹn dắt dạo trung điểm Q9
            </p>
          </div>
        </div>
      )}

      {subPanel === 'history' && (
        <div className="px-4 mt-3 space-y-2.5">
          <div className="p-4 rounded-3xl bg-white border border-stone-200 space-y-2.5">
            <h3 className="font-display text-sm font-bold">
              💼 Lịch sử Dịch vụ gắn với Hồ sơ {activePet.name}
            </h3>
            {bookings.map((bk) => (
              <div
                key={bk.id}
                className="p-3 rounded-2xl bg-[#FDFBF7] border border-stone-200 space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold">{bk.partnerName}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#A3E4D7]/50 text-teal-950 uppercase">
                    {bk.status}
                  </span>
                </div>
                <p className="text-xs text-stone-600">
                  {bk.serviceNames.join(', ')} ·{' '}
                  <strong className="text-[#FF6F61]">
                    {formatVndCurrency(bk.totalPriceVnd)}
                  </strong>
                </p>
                {!bk.hasReviewed && (
                  <button
                    onClick={() => setReviewBookingId(bk.id)}
                    className="text-[11px] font-bold text-[#FF6F61] underline flex items-center gap-1"
                  >
                    <Star className="w-3 h-3" /> Đánh giá giao dịch thật
                  </button>
                )}
              </div>
            ))}

            {reviewBookingId && (
              <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 space-y-2">
                <p className="text-xs font-bold">Viết đánh giá xác thực cho Đối tác:</p>
                <input
                  type="text"
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Chia sẻ trải nghiệm của Boss..."
                  className="w-full px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-xs"
                />
                <button
                  onClick={() => {
                    submitPartnerReview(
                      reviewBookingId,
                      5,
                      reviewText || 'Dịch vụ rất chu đáo, Boss về nhà vui vẻ!'
                    );
                    setReviewBookingId(null);
                    setReviewText('');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#FF6F61] text-white text-xs font-bold"
                >
                  Gửi đánh giá 5 ⭐
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {subPanel === 'bookmarks' && (
        <div className="px-4 mt-3">
          <div className="p-4 rounded-3xl bg-white border border-stone-200 space-y-2">
            <h3 className="font-display text-sm font-bold">
              📌 Bộ sưu tập đã lưu (Thư mục: Mẹo chăm sóc)
            </h3>
            {bookmarkedPosts.length === 0 ? (
              <p className="text-xs text-stone-500">Chưa có bài viết nào được lưu.</p>
            ) : (
              bookmarkedPosts.map((bp) => (
                <div key={bp.id} className="p-2.5 rounded-xl bg-[#FDFBF7] border border-stone-100">
                  <p className="text-xs font-bold">{bp.authorName}</p>
                  <p className="text-[11px] text-stone-600 line-clamp-2">{bp.textContent}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* 2-TAB PUBLIC PET PROFILE SWITCHER (Tầng 2 Section 5) */}
      <div className="px-4 mt-4">
        <div className="grid grid-cols-2 bg-stone-200/70 p-1 rounded-2xl">
          <button
            onClick={() => setActiveProfileTab('moments')}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              activeProfileTab === 'moments'
                ? 'bg-white text-[#2D3436] shadow-xs'
                : 'text-stone-600'
            }`}
          >
            📸 Khoảnh khắc ({petPosts.length + momentPhotos.length})
          </button>
          <button
            onClick={() => setActiveProfileTab('bio')}
            className={`py-2 rounded-xl text-xs font-bold transition-all ${
              activeProfileTab === 'bio'
                ? 'bg-white text-[#2D3436] shadow-xs'
                : 'text-stone-600'
            }`}
          >
            🟢 Hồ sơ & Sổ tiêm
          </button>
        </div>
      </div>

      {/* TAB 1: KHOẢNH KHẮC (3-COLUMN INSTAGRAM GRID) */}
      {activeProfileTab === 'moments' ? (
        <div className="px-4 mt-3 space-y-3">
          <div className="grid grid-cols-3 gap-1.5">
            {momentPhotos.map((imgUrl, idx) => (
              <div
                key={idx}
                className="aspect-square rounded-2xl overflow-hidden bg-stone-100 relative group"
              >
                <img
                  src={imgUrl}
                  alt={`${activePet.name} moment ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
                <span className="absolute bottom-1.5 right-1.5 px-1.5 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-bold">
                  🐾 {18 + idx * 7}
                </span>
              </div>
            ))}
          </div>
          <button
            onClick={() => setActiveModal('new_moment')}
            className="w-full py-2.5 rounded-2xl border-2 border-dashed border-[#FF6F61] text-[#FF6F61] text-xs font-bold"
          >
            + Đăng thêm khoảnh khắc của {activePet.name}
          </button>
        </div>
      ) : (
        /* TAB 2: HỒ SƠ CHUYÊN SÂU & CARD XANH MINT SỔ TIÊM (Tầng 2 Section 5.1) */
        <div className="px-4 mt-3 space-y-4">
          {/* Mint Green Vaccination Certificate Card */}
          <div className="p-4 rounded-3xl bg-[#A3E4D7]/45 border-2 border-[#A3E4D7] space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-teal-600" />
                <h3 className="font-display text-sm font-bold text-teal-950">
                  🟢 Đã tiêm phòng đầy đủ (Safe Pet Verified)
                </h3>
              </div>
              <Syringe className="w-4 h-4 text-teal-800" />
            </div>

            <div className="space-y-1.5">
              {activePet.vaccinations.map((v) => (
                <div
                  key={v.id}
                  className="p-2.5 rounded-2xl bg-white/85 flex items-center justify-between text-xs"
                >
                  <div>
                    <p className="font-bold text-teal-950">{v.vaccineName} ✓</p>
                    <p className="text-[11px] text-stone-500">
                      Ngày tiêm: {v.dateGiven} · Tái chủng: {v.nextDueDate || 'Hằng năm'}
                    </p>
                  </div>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#A3E4D7] text-teal-950">
                    Vet Verified
                  </span>
                </div>
              ))}
            </div>

            {/* Quick Add Vaccination Record */}
            <div className="flex gap-1.5 pt-1">
              <input
                type="text"
                value={newVaccineName}
                onChange={(e) => setNewVaccineName(e.target.value)}
                placeholder="Thêm mũi tiêm mới (VD: Tẩy giun / Dại)..."
                className="flex-1 px-3 py-1.5 rounded-xl bg-white text-xs"
              />
              <button
                onClick={() => {
                  if (newVaccineName.trim()) {
                    addVaccinationRecord(
                      activePet.id,
                      newVaccineName.trim(),
                      '2026-10-29',
                      activePet.vetName
                    );
                    setNewVaccineName('');
                  }
                }}
                className="px-3 py-1.5 rounded-xl bg-teal-800 text-white text-xs font-bold"
              >
                + Lưu sổ
              </button>
            </div>
          </div>

          {/* Basic Bio Details */}
          <div className="p-4 rounded-3xl bg-white border border-stone-200/80 space-y-2.5">
            <h3 className="font-display text-sm font-bold text-[#2D3436]">
              📋 Thông tin cơ bản & Theo dõi cân nặng
            </h3>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-2.5 rounded-2xl bg-[#FDFBF7]">
                <span className="text-stone-400 block text-[10px]">Giống</span>
                <strong>{activePet.breed}</strong>
              </div>
              <div className="p-2.5 rounded-2xl bg-[#FDFBF7]">
                <span className="text-stone-400 block text-[10px]">Tuổi</span>
                <strong>{activePet.ageDisplay}</strong>
              </div>
              <div className="p-2.5 rounded-2xl bg-[#FDFBF7]">
                <span className="text-stone-400 block text-[10px]">Cân nặng</span>
                <strong>
                  {activePet.weightKg}kg ({formatSizeCategoryLabel(activePet.sizeCategory)})
                </strong>
              </div>
              <div className="p-2.5 rounded-2xl bg-[#FDFBF7]">
                <span className="text-stone-400 block text-[10px]">Mức năng lượng & Triệt sản</span>
                <strong>
                  {activePet.energyLevel.toUpperCase()} ⚡ ·{' '}
                  {activePet.isNeutered ? 'Đã triệt sản' : 'Chưa'}
                </strong>
              </div>
            </div>

            {/* Weight Progression Mini Chart */}
            <div className="pt-2">
              <p className="text-[11px] font-bold text-stone-500 mb-2">
                📈 Biểu đồ cân nặng theo tháng:
              </p>
              <div className="flex items-end gap-2 h-16 px-2">
                {activePet.weightHistory.map((w) => (
                  <div key={w.date} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-[10px] font-mono font-bold text-[#FF6F61]">
                      {w.weightKg}kg
                    </span>
                    <div
                      style={{ height: `${Math.min(44, Math.max(16, w.weightKg * 1.4))}px` }}
                      className="w-full rounded-t-lg bg-[#FF6F61]/80"
                    />
                    <span className="text-[9px] text-stone-400">{w.date}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Good Habits & Fight Prevention Cautions */}
          <div className="p-4 rounded-3xl bg-white border border-stone-200/80 space-y-3">
            <div>
              <h4 className="text-xs font-extrabold text-teal-800 mb-1.5">✅ Thói quen tốt</h4>
              <div className="flex flex-wrap gap-1.5">
                {goodHabits.map((g) => (
                  <span
                    key={g.id}
                    className="px-3 py-1 rounded-full bg-[#A3E4D7]/40 text-teal-950 text-xs font-bold"
                  >
                    {g.label}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-stone-100">
              <h4 className="text-xs font-extrabold text-amber-800 mb-1.5">
                ⚠️ Cần lưu ý (Minh bạch hành vi tránh cắn nhau)
              </h4>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {cautions.map((c) => (
                  <span
                    key={c.id}
                    className="px-3 py-1 rounded-full bg-amber-100 text-amber-950 text-xs font-bold"
                  >
                    {c.label}
                  </span>
                ))}
              </div>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={newCautionChip}
                  onChange={(e) => setNewCautionChip(e.target.value)}
                  placeholder="Thêm lưu ý hành vi (VD: Sợ người lạ)..."
                  className="flex-1 px-3 py-1.5 rounded-xl bg-stone-50 border border-stone-200 text-xs"
                />
                <button
                  onClick={() => {
                    if (newCautionChip.trim()) {
                      addPetBehaviorChip(activePet.id, 'caution', newCautionChip);
                      setNewCautionChip('');
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-stone-100 text-xs">
              <p className="font-bold text-[#2D3436]">🏥 Bác sĩ thú y phụ trách</p>
              <p className="text-stone-600 mt-0.5">
                {activePet.vetName} ({activePet.vetContact})
              </p>
              <p className="text-[11px] text-red-600 font-semibold mt-1">
                Lưu ý dị ứng: {activePet.allergies}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

