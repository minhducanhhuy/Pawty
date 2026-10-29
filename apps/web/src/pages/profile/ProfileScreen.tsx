import React, { useState } from 'react';
import {
  AlertTriangle,
  Award,
  Cat,
  Check,
  Dog,
  Edit3,
  Globe,
  Grid,
  Lock,
  MapPin,
  Plus,
  Settings,
  ShieldCheck,
} from 'lucide-react';
import { formatSizeCategoryLabel } from '@pawty/utils';
import { usePawtyStore } from '../../stores/usePawtyStore';
import { WEB_THEMES } from '../../mocks/seedData';

export const ProfileScreen: React.FC = () => {
  const {
    user,
    pets,
    activePetId,
    setActivePetId,
    posts,
    addPetBehaviorChip,
    setActiveModal,
    showToast,
    themeId,
  } = usePawtyStore();

  const theme = WEB_THEMES[themeId] ?? WEB_THEMES.coral;
  const [activeProfileTab, setActiveProfileTab] = useState<'moments' | 'bio'>('moments');
  const [isPrivateMode, setIsPrivateMode] = useState(false);
  const [isVaccinatedAndRabies, setIsVaccinatedAndRabies] = useState(true);
  const [newCautionChip, setNewCautionChip] = useState('');

  const activePet = pets.find((p) => p.id === activePetId) ?? pets[0];
  const petPosts = posts.filter(
    (p) => p.petIds.includes(activePet.id) || p.authorId === user.id
  );

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
    <div className="p-4 pb-6 space-y-3.5">
      {/* Instagram-Style Owner & Pet Header Card */}
      <div
        style={{ backgroundColor: theme.surface, borderColor: theme.border }}
        className="p-4 rounded-2xl border space-y-3"
      >
        <div className="flex items-center gap-4">
          <img
            src={user.avatarUrl}
            alt={user.displayName}
            className="w-16 h-16 rounded-full object-cover shrink-0"
          />
          <div className="flex-1 grid grid-cols-3 text-center">
            <div>
              <p style={{ color: theme.text }} className="text-base font-extrabold">
                {petPosts.length + momentPhotos.length}
              </p>
              <p style={{ color: theme.textSoft }} className="text-[11px]">
                Bài viết
              </p>
            </div>
            <div>
              <p style={{ color: theme.text }} className="text-base font-extrabold">
                148
              </p>
              <p style={{ color: theme.textSoft }} className="text-[11px]">
                Bạn bè
              </p>
            </div>
            <div>
              <p style={{ color: theme.text }} className="text-base font-extrabold">
                1.2k
              </p>
              <p style={{ color: theme.textSoft }} className="text-[11px]">
                Lượt thích
              </p>
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 style={{ color: theme.text }} className="text-sm font-extrabold">
              {user.displayName}
            </h1>
            <span
              style={{ backgroundColor: theme.primarySoft, color: theme.primary }}
              className="px-2 py-0.5 rounded-lg text-[10px] font-bold"
            >
              Bạn thân của cún
            </span>
          </div>
          <p
            style={{ color: theme.textSoft }}
            className="text-xs flex items-center gap-1 mt-0.5 truncate"
          >
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{user.neighborhood}</span>
          </p>
          <p style={{ color: theme.text }} className="text-xs mt-1 leading-relaxed">
            {user.bio}
          </p>
        </div>

        {/* Private Profile Toggle (Only Friends or Tinder Matches can view) */}
        <button
          onClick={() => {
            const next = !isPrivateMode;
            setIsPrivateMode(next);
            showToast(
              next ? 'Đã bật Chế độ Riêng tư' : 'Đã chuyển sang Chế độ Công khai',
              next
                ? 'Chỉ bạn bè hoặc người đã Match trên Hẹn hò mới xem được bài viết và hồ sơ.'
                : 'Mọi người trên Pawty có thể xem bài viết của bạn.'
            );
          }}
          style={{
            backgroundColor: isPrivateMode ? theme.primarySoft : theme.bg,
            borderColor: isPrivateMode ? theme.primary : theme.border,
          }}
          className="w-full p-2.5 rounded-xl border flex items-center justify-between gap-2 text-left"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              style={{ backgroundColor: theme.surface }}
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
            >
              {isPrivateMode ? (
                <Lock style={{ color: theme.primary }} className="w-4 h-4" />
              ) : (
                <Globe style={{ color: theme.primary }} className="w-4 h-4" />
              )}
            </div>
            <div className="min-w-0">
              <p style={{ color: theme.text }} className="text-xs font-bold">
                {isPrivateMode ? 'Chế độ Riêng tư: Đang Bật' : 'Chế độ Công khai'}
              </p>
              <p style={{ color: theme.textSoft }} className="text-[11px] truncate">
                Chỉ bạn bè hoặc người đã Match Tinder mới xem được hồ sơ
              </p>
            </div>
          </div>
          <span
            style={{ backgroundColor: isPrivateMode ? theme.primary : theme.border }}
            className="px-2 py-0.5 rounded-md text-white text-[10px] font-extrabold shrink-0"
          >
            {isPrivateMode ? 'BẬT' : 'TẮT'}
          </span>
        </button>

        {/* Profile Edit, VIP Plans & Settings Action Row */}
        <div className="grid grid-cols-3 gap-1.5 pt-1">
          <button
            onClick={() => setActiveModal('edit_profile')}
            style={{
              backgroundColor: theme.primary,
              color: '#FFFFFF',
            }}
            className="py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 hover:opacity-90"
          >
            <Edit3 className="w-3.5 h-3.5" />
            <span>Sửa hồ sơ</span>
          </button>

          <button
            onClick={() => setActiveModal('vip_upgrade')}
            style={{
              backgroundColor: theme.bg,
              borderColor: theme.border,
              color: theme.text,
            }}
            className="py-2 px-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1 hover:opacity-90"
          >
            <Award style={{ color: theme.primary }} className="w-3.5 h-3.5" />
            <span>Gói Plus</span>
          </button>

          <button
            onClick={() => setActiveModal('settings')}
            style={{
              backgroundColor: theme.primarySoft,
              color: theme.primary,
            }}
            className="py-2 px-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 hover:opacity-90"
          >
            <Settings className="w-3.5 h-3.5" />
            <span>Giao diện</span>
          </button>
        </div>
      </div>

      {/* Unified Pet Profile Object Card (Species: Chó / Mèo) */}
      <div
        style={{ backgroundColor: theme.surface, borderColor: theme.border }}
        className="p-4 rounded-2xl border space-y-3"
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 style={{ color: theme.text }} className="text-sm font-bold">
              Hồ sơ thú cưng ({pets.length})
            </h2>
          </div>

          <button
            onClick={() => setActiveModal('add_pet_wizard')}
            style={{ backgroundColor: theme.primary }}
            className="px-3 py-1.5 rounded-xl text-white text-xs font-bold flex items-center gap-1"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Thêm hồ sơ thú</span>
          </button>
        </div>

        {/* Pet Object List */}
        <div className="grid grid-cols-2 gap-2">
          {pets.map((pet) => {
            const isSelected = pet.id === activePet.id;
            return (
              <button
                key={pet.id}
                onClick={() => setActivePetId(pet.id)}
                style={{
                  backgroundColor: isSelected ? theme.primarySoft : theme.bg,
                  borderColor: isSelected ? theme.primary : theme.border,
                }}
                className="p-2.5 rounded-xl border text-left flex items-center gap-2.5 transition-all"
              >
                <img
                  src={pet.avatarUrl}
                  alt={pet.name}
                  className="w-10 h-10 rounded-xl object-cover shrink-0"
                />
                <div className="min-w-0">
                  <p style={{ color: theme.text }} className="text-xs font-bold truncate">
                    {pet.name}
                  </p>
                  <span
                    style={{ color: theme.primary }}
                    className="inline-flex items-center gap-1 text-[10px] font-bold"
                  >
                    {pet.species === 'dog' ? (
                      <Dog className="w-3 h-3" />
                    ) : (
                      <Cat className="w-3 h-3" />
                    )}
                    <span>{pet.species === 'dog' ? 'Chó' : 'Mèo'} · {pet.breed}</span>
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 2-Tab Switcher: Khoảnh khắc (Instagram Grid) vs Hồ sơ chi tiết & Tiêm chủng */}
      <div
        style={{ backgroundColor: theme.surface, borderColor: theme.border }}
        className="grid grid-cols-2 p-1 rounded-2xl border"
      >
        <button
          onClick={() => setActiveProfileTab('moments')}
          style={{
            backgroundColor: activeProfileTab === 'moments' ? theme.primary : 'transparent',
            color: activeProfileTab === 'moments' ? '#FFFFFF' : theme.textSoft,
          }}
          className="py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
        >
          <Grid className="w-3.5 h-3.5" />
          <span>Khoảnh khắc ({petPosts.length + momentPhotos.length})</span>
        </button>

        <button
          onClick={() => setActiveProfileTab('bio')}
          style={{
            backgroundColor: activeProfileTab === 'bio' ? theme.primary : 'transparent',
            color: activeProfileTab === 'bio' ? '#FFFFFF' : theme.textSoft,
          }}
          className="py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
        >
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Hồ sơ {activePet.name}</span>
        </button>
      </div>

      {/* TAB 1: KHOẢNH KHẮC (INSTAGRAM 3-COL GRID) */}
      {activeProfileTab === 'moments' ? (
        <div className="space-y-3">
          <div className="grid grid-cols-3 gap-1.5">
            {momentPhotos.map((imgUrl, idx) => (
              <div
                key={idx}
                className="aspect-square rounded-xl overflow-hidden bg-stone-100"
              >
                <img
                  src={imgUrl}
                  alt={`${activePet.name} ${idx + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
          <button
            onClick={() => setActiveModal('new_moment')}
            style={{
              borderColor: theme.primary,
              color: theme.primary,
              backgroundColor: theme.surface,
            }}
            className="w-full py-2.5 rounded-xl border text-xs font-bold"
          >
            Đăng ảnh / video mới của {activePet.name}
          </button>
        </div>
      ) : (
        /* TAB 2: HỒ SƠ CHI TIẾT & 1 DẤU TÍCH TIÊM CHỦNG + PHÒNG DẠI */
        <div className="space-y-3">
          {/* Simplified 1-Tick Vaccination & Rabies Card */}
          <button
            onClick={() => {
              const next = !isVaccinatedAndRabies;
              setIsVaccinatedAndRabies(next);
              showToast(
                next
                  ? `Đã đánh dấu ${activePet.name} tiêm chủng & phòng dại đầy đủ`
                  : `Đã bỏ đánh dấu tiêm chủng của ${activePet.name}`,
                'Trạng thái đã được cập nhật ngay trên hồ sơ.'
              );
            }}
            style={{
              backgroundColor: isVaccinatedAndRabies ? theme.primarySoft : theme.surface,
              borderColor: isVaccinatedAndRabies ? theme.primary : theme.border,
            }}
            className="w-full p-3.5 rounded-2xl border flex items-center gap-3 text-left"
          >
            <div
              style={{
                backgroundColor: isVaccinatedAndRabies ? theme.primary : theme.bg,
                borderColor: isVaccinatedAndRabies ? theme.primary : theme.border,
              }}
              className="w-6 h-6 rounded-lg border flex items-center justify-center shrink-0"
            >
              {isVaccinatedAndRabies && <Check className="w-4 h-4 text-white stroke-[3]" />}
            </div>
            <div className="flex-1">
              <p
                style={{ color: isVaccinatedAndRabies ? theme.primary : theme.text }}
                className="text-xs font-extrabold"
              >
                Đã tiêm chủng & Phòng bệnh dại đầy đủ
              </p>
              <p style={{ color: theme.textSoft }} className="text-[11px] mt-0.5">
                Chạm vào dấu tích để xác nhận trạng thái tiêm chủng và phòng dại của {activePet.name}
              </p>
            </div>
          </button>

          {/* Detailed Pet Attributes */}
          <div
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
            className="p-4 rounded-2xl border space-y-2.5 text-xs"
          >
            <div className="flex items-center justify-between pb-1">
              <h3 style={{ color: theme.text }} className="text-sm font-bold">
                Thông tin chi tiết của {activePet.name}
              </h3>
              <button
                onClick={() => setActiveModal('edit_profile')}
                style={{ color: theme.primary }}
                className="text-xs font-bold underline"
              >
                Chỉnh sửa
              </button>
            </div>
            {[
              { label: 'Loài thú cưng', val: activePet.species === 'dog' ? 'Chó' : 'Mèo' },
              { label: 'Giống loài', val: activePet.breed },
              { label: 'Giới tính', val: activePet.gender === 'male' ? 'Đực' : 'Cái' },
              { label: 'Ngày sinh / Độ tuổi', val: `${activePet.dateOfBirth} (${activePet.ageDisplay})` },
              {
                label: 'Cân nặng & Phân nhóm',
                val: `${activePet.weightKg}kg (${formatSizeCategoryLabel(activePet.sizeCategory)})`,
              },
              { label: 'Lưu ý dị ứng', val: activePet.allergies || 'Không có' },
            ].map((row) => (
              <div
                key={row.label}
                style={{ borderColor: theme.border }}
                className="flex items-center justify-between py-1.5 border-b last:border-b-0"
              >
                <span style={{ color: theme.textSoft }} className="font-medium">
                  {row.label}
                </span>
                <span style={{ color: theme.text }} className="font-bold">
                  {row.val}
                </span>
              </div>
            ))}
          </div>

          {/* Habits & Cautions Card */}
          <div
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
            className="p-4 rounded-2xl border space-y-3"
          >
            <div>
              <h4 style={{ color: theme.text }} className="text-xs font-bold mb-2">
                Tính cách & Thói quen tốt
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {goodHabits.map((g) => (
                  <span
                    key={g.id}
                    style={{
                      backgroundColor: theme.primarySoft,
                      color: theme.primary,
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                  >
                    {g.label}
                  </span>
                ))}
              </div>
            </div>

            <div style={{ borderColor: theme.border }} className="pt-3 border-t">
              <h4
                style={{ color: '#C88A2E' }}
                className="text-xs font-bold mb-2 flex items-center gap-1"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>Lưu ý khi tiếp xúc</span>
              </h4>
              <div className="flex flex-wrap gap-1.5 mb-2.5">
                {cautions.map((c) => (
                  <span
                    key={c.id}
                    style={{
                      backgroundColor: '#FDF5E6',
                      color: '#9A6519',
                    }}
                    className="px-2.5 py-1 rounded-lg text-xs font-semibold"
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
                  placeholder="Thêm lưu ý (VD: Sợ tiếng máy sấy lớn)..."
                  style={{
                    backgroundColor: theme.bg,
                    borderColor: theme.border,
                    color: theme.text,
                  }}
                  className="flex-1 px-3 py-2 rounded-xl border text-xs focus:outline-none"
                />
                <button
                  onClick={() => {
                    if (newCautionChip.trim()) {
                      addPetBehaviorChip(activePet.id, 'caution', newCautionChip);
                      setNewCautionChip('');
                    }
                  }}
                  style={{ backgroundColor: theme.primary }}
                  className="px-3.5 py-2 rounded-xl text-white text-xs font-bold"
                >
                  Thêm
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
