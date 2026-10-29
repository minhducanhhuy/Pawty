import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  ChevronRight,
  PartyPopper,
  Phone,
  Plus,
  ShieldCheck,
  Sparkles,
} from 'lucide-react';
import type { PrimaryNeed } from '@pawty/types';
import { classifyPetSizeByWeight, formatSizeCategoryLabel } from '@pawty/utils';
import { usePawtyStore } from '../../stores/usePawtyStore';

const WELCOME_SLIDES = [
  {
    emoji: '🐕 🐈',
    title: 'Tạo hồ sơ cho Boss',
    desc: 'Sổ tiêm điện tử, lịch chăm sóc, thói quen — tất cả lưu trữ khoa học trong một ứng dụng duy nhất.',
    badge: 'Layer 1 · Pawty Care',
  },
  {
    emoji: '👨‍👩‍👧 🐕',
    title: 'Mời người thân cùng chăm sóc',
    desc: 'Giao việc cho Ba Mẹ hoặc bạn bè trong Vòng chăm sóc (Circle), theo dõi real-time, an tâm khi đi vắng.',
    badge: 'Layer 2 · Pawty Circle',
  },
  {
    emoji: '📋 🔔',
    title: 'Nhẹ đầu hơn mỗi ngày',
    desc: 'Nhắc việc thông minh, đặt dịch vụ Grooming/Vet xác minh, và kết nối cộng đồng yêu Boss văn minh.',
    badge: 'Layer 3 & 4 · Local & Services',
  },
];

const BREED_SUGGESTIONS: Record<'dog' | 'cat', string[]> = {
  dog: [
    'Golden Retriever',
    'Pembroke Welsh Corgi',
    'Poodle (Toy / Standard)',
    'Pomeranian (Phốc Sóc)',
    'Shiba Inu',
    'Cỏ / Phú Quốc',
  ],
  cat: [
    'Mèo Anh Lông Ngắn (British Shorthair)',
    'Scottish Fold (Mèo Tai Cụp)',
    'Mèo Anh Lông Dài',
    'Ragdoll',
    'Mèo Mướp / Mèo Vàng Việt Nam',
  ],
};

const PERSONALITY_OPTIONS = [
  'Thân thiện',
  'Nhút nhát',
  'Hiếu động',
  'Bình tĩnh',
  'Tò mò',
  'Độc lập',
];

const PRIMARY_NEEDS_LIST: { id: PrimaryNeed; icon: string; label: string }[] = [
  { id: 'care_management', icon: '📋', label: 'Quản lý chăm sóc' },
  { id: 'family_circle', icon: '👥', label: 'Phối hợp gia đình' },
  { id: 'walk_buddy', icon: '🐕', label: 'Tìm bạn dắt dạo' },
  { id: 'grooming_service', icon: '💇', label: 'Tìm dịch vụ grooming' },
  { id: 'vet_care', icon: '🏥', label: 'Tìm bác sĩ thú y' },
  { id: 'community_join', icon: '💬', label: 'Tham gia cộng đồng' },
  { id: 'share_moments', icon: '📸', label: 'Chia sẻ khoảnh khắc' },
  { id: 'pet_sitting', icon: '🏠', label: 'Nhờ trông khi đi vắng' },
];

export const OnboardingFlow: React.FC = () => {
  const { completeOnboardingWizard, setActiveTab, setActiveModal } = usePawtyStore();

  // Stage: 'welcome' | 'phone' | 'otp' | 'owner' | 'pet_1' | 'pet_2' | 'pet_3' | 'pet_4' | 'success'
  const [stage, setStage] = useState<string>('welcome');
  const [slideIdx, setSlideIdx] = useState(0);

  // Form states
  const [phone, setPhone] = useState('0912345678');
  const [otpDigits, setOtpDigits] = useState(['6', '8', '6', '8']);
  const [displayName, setDisplayName] = useState('Mai Nguyễn');
  const [district, setDistrict] = useState('TP. Thủ Đức (Quận 9)');
  const [neighborhood, setNeighborhood] = useState('Vinhomes Grand Park - Khu Rainbow');

  // Pet Wizard states
  const [petName, setPetName] = useState('Lu');
  const [species, setSpecies] = useState<'dog' | 'cat'>('dog');
  const [breed, setBreed] = useState('Golden Retriever');
  const [gender, setGender] = useState<'male' | 'female'>('male');
  const [dob, setDob] = useState('15/07/2024');
  const [weightKg, setWeightKg] = useState<number>(28);
  const [vaccinationStatus, setVaccinationStatus] = useState<'full' | 'partial' | 'none'>('full');
  const [isNeutered, setIsNeutered] = useState<boolean>(true);
  const [allergies, setAllergies] = useState('Dị ứng nhẹ đạm hải sản có vỏ');
  const [energyLevel, setEnergyLevel] = useState<'low' | 'medium' | 'high'>('high');
  const [personalities, setPersonalities] = useState<string[]>(['Thân thiện', 'Hiếu động']);
  const [goodHabits, setGoodHabits] = useState<string[]>(['Nghe lệnh tốt', 'Thích chơi bóng']);
  const [newGoodHabit, setNewGoodHabit] = useState('');
  const [cautions, setCautions] = useState<string[]>(['Bảo vệ đồ ăn', 'Sợ tiếng pháo']);
  const [newCaution, setNewCaution] = useState('');
  const [selectedNeeds, setSelectedNeeds] = useState<PrimaryNeed[]>([
    'care_management',
    'family_circle',
    'walk_buddy',
  ]);

  const toggleItem = <T,>(list: T[], item: T, max?: number): T[] => {
    if (list.includes(item)) {
      return list.filter((x) => x !== item);
    }
    if (max && list.length >= max) return list;
    return [...list, item];
  };

  const handleFinishWizard = () => {
    setStage('success');
  };

  const commitAndNavigate = (target: 'explore' | 'circle' | 'today') => {
    completeOnboardingWizard({
      phone,
      displayName,
      district,
      neighborhood,
      petName,
      species,
      breed,
      gender,
      weightKg,
      vaccinationStatus,
      isNeutered,
      allergies,
      energyLevel,
      personalities,
      goodHabits,
      cautions,
      primaryNeeds: selectedNeeds,
    });
    if (target === 'explore') {
      setActiveTab('explore');
    } else if (target === 'circle') {
      setActiveTab('today');
      setActiveModal('invite_circle');
    } else {
      setActiveTab('today');
    }
  };

  if (stage === 'welcome') {
    const slide = WELCOME_SLIDES[slideIdx];
    return (
      <div className="min-h-full flex flex-col justify-between p-6 bg-gradient-to-b from-[#FDFBF7] via-[#FF6F61]/5 to-[#A3E4D7]/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img
              src="/assets/pawty-icon.png"
              alt="Pawty"
              className="w-9 h-9 rounded-xl object-cover"
            />
            <span className="font-display font-bold text-lg text-[#2D3436]">Pawty</span>
          </div>
          <button
            onClick={() => setStage('phone')}
            className="text-xs font-bold text-stone-500 hover:text-[#2D3436]"
          >
            Bỏ qua
          </button>
        </div>

        <div className="my-auto text-center px-2 py-8">
          <div className="w-32 h-32 mx-auto rounded-full bg-white shadow-md flex items-center justify-center text-5xl mb-6 border-4 border-[#A3E4D7]/50">
            {slide.emoji}
          </div>
          <span className="inline-block text-[11px] font-bold px-3 py-1 rounded-full bg-[#A3E4D7]/40 text-teal-950 mb-3">
            {slide.badge}
          </span>
          <h1 className="font-display text-2xl font-bold text-[#2D3436] mb-3">{slide.title}</h1>
          <p className="text-sm text-stone-600 leading-relaxed">{slide.desc}</p>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2">
            {WELCOME_SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => setSlideIdx(i)}
                className={`h-2 rounded-full transition-all ${
                  i === slideIdx ? 'w-7 bg-[#FF6F61]' : 'w-2 bg-stone-300'
                }`}
              />
            ))}
          </div>

          <button
            onClick={() => {
              if (slideIdx < WELCOME_SLIDES.length - 1) {
                setSlideIdx(slideIdx + 1);
              } else {
                setStage('phone');
              }
            }}
            className="w-full py-3.5 rounded-2xl bg-[#FF6F61] text-white font-bold text-sm shadow-md hover:opacity-95 flex items-center justify-center gap-2"
          >
            <span>{slideIdx < WELCOME_SLIDES.length - 1 ? 'Tiếp theo' : 'Bắt đầu ngay'}</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  if (stage === 'phone') {
    return (
      <div className="p-6 flex flex-col justify-between min-h-full">
        <div>
          <button
            onClick={() => setStage('welcome')}
            className="p-2 -ml-2 rounded-xl text-stone-600 hover:bg-stone-100 inline-flex items-center gap-1 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" /> Quay lại
          </button>
          <div className="mt-6 flex items-center gap-2.5">
            <img
              src="/assets/pawty-icon.png"
              alt="Pawty"
              className="w-12 h-12 rounded-2xl shadow-sm"
            />
            <div>
              <h1 className="font-display text-2xl font-bold">Pawty 🐾</h1>
              <p className="text-xs text-stone-500">Định danh SĐT chống nick ảo & bùng kèo</p>
            </div>
          </div>

          <h2 className="font-display text-lg font-bold mt-8 mb-2">
            Đăng nhập bằng số điện thoại
          </h2>
          <p className="text-xs text-stone-500 mb-5">
            Chúng tôi sẽ gửi mã xác thực OTP gồm 4 chữ số tới điện thoại của bạn.
          </p>

          <div className="flex gap-2 mb-4">
            <div className="px-3.5 py-3 rounded-2xl bg-stone-100 border border-stone-200 text-sm font-bold flex items-center gap-1.5 shrink-0">
              <span>🇻🇳</span>
              <span>+84</span>
            </div>
            <div className="relative flex-1">
              <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Số điện thoại của bạn"
                className="w-full pl-10 pr-4 py-3 rounded-2xl bg-white border border-stone-200 text-sm font-bold focus:outline-none focus:border-[#FF6F61]"
              />
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-[#A3E4D7]/25 border border-[#A3E4D7] flex items-start gap-2.5 text-xs text-teal-950">
            <ShieldCheck className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
            <span>
              <strong>Cam kết Bảo vệ Dữ liệu Cá nhân (Luật 91/2025/QH15):</strong> Số điện thoại
              được ẩn mặc định và không bao giờ chia sẻ cho bên thứ ba.
            </span>
          </div>
        </div>

        <div className="space-y-3 pt-6">
          <button
            onClick={() => setStage('otp')}
            className="w-full py-3.5 rounded-2xl bg-[#FF6F61] text-white font-bold text-sm shadow-md"
          >
            Gửi mã OTP
          </button>
          <p className="text-[11px] text-center text-stone-400">
            Bằng việc tiếp tục, bạn đồng ý với Điều khoản Sử dụng & Chính sách Quyền riêng tư của Pawty.
          </p>
        </div>
      </div>
    );
  }

  if (stage === 'otp') {
    return (
      <div className="p-6 flex flex-col justify-between min-h-full">
        <div>
          <button
            onClick={() => setStage('phone')}
            className="p-2 -ml-2 rounded-xl text-stone-600 hover:bg-stone-100 inline-flex items-center gap-1 text-xs font-bold"
          >
            <ArrowLeft className="w-4 h-4" /> Đổi số điện thoại
          </button>

          <h1 className="font-display text-2xl font-bold mt-6">Nhập mã xác thực</h1>
          <p className="text-xs text-stone-500 mt-1">
            Mã OTP gồm 4 số đã được gửi tới <strong className="text-[#2D3436]">{phone}</strong>
          </p>

          <div className="grid grid-cols-4 gap-3 my-8">
            {otpDigits.map((digit, index) => (
              <input
                key={index}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => {
                  const next = [...otpDigits];
                  next[index] = e.target.value;
                  setOtpDigits(next);
                }}
                className="h-14 text-center font-mono text-xl font-bold rounded-2xl bg-white border-2 border-[#FF6F61] focus:outline-none shadow-xs"
              />
            ))}
          </div>

          <p className="text-xs text-center text-stone-500">
            Gửi lại mã sau <span className="font-mono font-bold text-[#FF6F61]">45s</span>
          </p>
        </div>

        <button
          onClick={() => setStage('owner')}
          className="w-full py-3.5 rounded-2xl bg-[#FF6F61] text-white font-bold text-sm shadow-md"
        >
          Xác nhận & Tiếp tục
        </button>
      </div>
    );
  }

  if (stage === 'owner') {
    return (
      <div className="p-6 flex flex-col justify-between min-h-full">
        <div>
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => setStage('otp')}
              className="text-xs font-bold text-stone-600 flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Tạo hồ sơ Chủ nuôi
            </button>
            <span className="text-[11px] font-bold text-[#FF6F61]">Hồ sơ Sen</span>
          </div>

          <div className="flex flex-col items-center my-4">
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=300&q=80"
                alt="Owner avatar"
                className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
              />
              <span className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-[#FF6F61] text-white text-xs flex items-center justify-center shadow">
                📷
              </span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Tên hiển thị *
              </label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-stone-200 text-sm font-semibold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Khu vực Quận / Huyện *
              </label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-stone-200 text-sm font-semibold"
              >
                <option value="TP. Thủ Đức (Quận 9)">TP. Thủ Đức (Quận 9)</option>
                <option value="TP. Thủ Đức (Thảo Điền Q2)">TP. Thủ Đức (Thảo Điền Q2)</option>
                <option value="Quận 7 (Phú Mỹ Hưng)">Quận 7 (Phú Mỹ Hưng)</option>
                <option value="Quận Bình Thạnh">Quận Bình Thạnh</option>
                <option value="Hà Nội - Vinhomes Ocean Park">Hà Nội - Vinhomes Ocean Park</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Tên chung cư / Khu phố (Chỉ hiển thị gần đúng)
              </label>
              <input
                type="text"
                value={neighborhood}
                onChange={(e) => setNeighborhood(e.target.value)}
                placeholder="VD: Vinhomes Q9 - Khu Rainbow"
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-stone-200 text-sm font-semibold"
              />
              <p className="text-[11px] text-stone-400 mt-1">
                🔒 Không bao giờ hiển thị số tầng hay số căn hộ chính xác.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => setStage('pet_1')}
          className="w-full py-3.5 rounded-2xl bg-[#FF6F61] text-white font-bold text-sm shadow-md mt-6"
        >
          Tiếp theo: Thêm hồ sơ Boss (1/4)
        </button>
      </div>
    );
  }

  if (stage === 'pet_1') {
    return (
      <div className="p-6 flex flex-col justify-between min-h-full">
        <div>
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => setStage('owner')}
              className="text-xs font-bold text-stone-600 flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Thêm Boss (1/4)
            </button>
            <span className="text-xs font-bold text-[#FF6F61]">Thông tin cơ bản</span>
          </div>
          {/* 4-step progress bar */}
          <div className="grid grid-cols-4 gap-1.5 mb-5">
            <div className="h-1.5 rounded-full bg-[#FF6F61]" />
            <div className="h-1.5 rounded-full bg-stone-200" />
            <div className="h-1.5 rounded-full bg-stone-200" />
            <div className="h-1.5 rounded-full bg-stone-200" />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Tên Boss *</label>
              <input
                type="text"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                placeholder="VD: Lu, Bơ, Miu..."
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-stone-200 text-sm font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">Loài *</label>
              <div className="grid grid-cols-2 gap-2.5">
                {(['dog', 'cat'] as const).map((sp) => (
                  <button
                    key={sp}
                    type="button"
                    onClick={() => {
                      setSpecies(sp);
                      setBreed(BREED_SUGGESTIONS[sp][0]);
                    }}
                    className={`py-3 rounded-2xl font-bold text-sm border transition-all ${
                      species === sp
                        ? 'bg-[#FF6F61] text-white border-[#FF6F61] shadow-xs'
                        : 'bg-white text-stone-700 border-stone-200'
                    }`}
                  >
                    {sp === 'dog' ? '🐕 Chó' : '🐈 Mèo'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">Giống *</label>
              <select
                value={breed}
                onChange={(e) => setBreed(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-stone-200 text-sm font-semibold"
              >
                {BREED_SUGGESTIONS[species].map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">Giới tính *</label>
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setGender('male')}
                  className={`py-2.5 rounded-2xl font-bold text-sm border ${
                    gender === 'male'
                      ? 'bg-[#2D3436] text-white border-[#2D3436]'
                      : 'bg-white text-stone-700 border-stone-200'
                  }`}
                >
                  ♂ Đực
                </button>
                <button
                  type="button"
                  onClick={() => setGender('female')}
                  className={`py-2.5 rounded-2xl font-bold text-sm border ${
                    gender === 'female'
                      ? 'bg-[#2D3436] text-white border-[#2D3436]'
                      : 'bg-white text-stone-700 border-stone-200'
                  }`}
                >
                  ♀ Cái
                </button>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => setStage('pet_2')}
          className="w-full py-3.5 rounded-2xl bg-[#FF6F61] text-white font-bold text-sm shadow-md mt-6"
        >
          Tiếp theo (2/4): Sức khỏe & Sổ tiêm
        </button>
      </div>
    );
  }

  if (stage === 'pet_2') {
    const sizeCat = classifyPetSizeByWeight(weightKg);
    return (
      <div className="p-6 flex flex-col justify-between min-h-full">
        <div>
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => setStage('pet_1')}
              className="text-xs font-bold text-stone-600 flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Thêm Boss (2/4)
            </button>
            <span className="text-xs font-bold text-[#FF6F61]">Sức khỏe & Tiêm phòng</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5 mb-5">
            <div className="h-1.5 rounded-full bg-[#FF6F61]" />
            <div className="h-1.5 rounded-full bg-[#FF6F61]" />
            <div className="h-1.5 rounded-full bg-stone-200" />
            <div className="h-1.5 rounded-full bg-stone-200" />
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Ngày sinh / Tuổi
                </label>
                <input
                  type="text"
                  value={dob}
                  onChange={(e) => setDob(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-2xl bg-white border border-stone-200 text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-stone-700 mb-1">
                  Cân nặng (kg)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="w-full px-3 py-2.5 rounded-2xl bg-white border border-stone-200 text-xs font-bold"
                />
              </div>
            </div>

            <div className="px-3 py-2 rounded-xl bg-[#A3E4D7]/30 text-teal-950 text-xs font-semibold flex items-center justify-between">
              <span>Phân loại kích thước tự động:</span>
              <span className="font-bold">{formatSizeCategoryLabel(sizeCat)}</span>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Trạng thái tiêm phòng (Safe Pet Radar)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'full', label: '🟢 Đã tiêm đủ' },
                  { id: 'partial', label: '🟡 Chưa đủ' },
                  { id: 'none', label: '⚪ Chưa tiêm' },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setVaccinationStatus(opt.id as 'full' | 'partial' | 'none')}
                    className={`py-2.5 px-2 rounded-xl text-xs font-bold border ${
                      vaccinationStatus === opt.id
                        ? 'bg-[#A3E4D7] text-teal-950 border-teal-500'
                        : 'bg-white text-stone-600 border-stone-200'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Đã triệt sản?
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setIsNeutered(true)}
                  className={`py-2 rounded-xl text-xs font-bold border ${
                    isNeutered
                      ? 'bg-[#2D3436] text-white border-[#2D3436]'
                      : 'bg-white text-stone-600 border-stone-200'
                  }`}
                >
                  Đã triệt sản
                </button>
                <button
                  type="button"
                  onClick={() => setIsNeutered(false)}
                  className={`py-2 rounded-xl text-xs font-bold border ${
                    !isNeutered
                      ? 'bg-[#2D3436] text-white border-[#2D3436]'
                      : 'bg-white text-stone-600 border-stone-200'
                  }`}
                >
                  Chưa triệt sản
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1">
                Bệnh lý / Dị ứng cần lưu ý khi bàn giao hoặc đi Spa
              </label>
              <input
                type="text"
                value={allergies}
                onChange={(e) => setAllergies(e.target.value)}
                placeholder="VD: Dị ứng gà, sợ máy sấy..."
                className="w-full px-3.5 py-2.5 rounded-2xl bg-white border border-stone-200 text-xs font-semibold"
              />
            </div>
          </div>
        </div>

        <button
          onClick={() => setStage('pet_3')}
          className="w-full py-3.5 rounded-2xl bg-[#FF6F61] text-white font-bold text-sm shadow-md mt-6"
        >
          Tiếp theo (3/4): Tính cách & Hành vi
        </button>
      </div>
    );
  }

  if (stage === 'pet_3') {
    return (
      <div className="p-6 flex flex-col justify-between min-h-full">
        <div>
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => setStage('pet_2')}
              className="text-xs font-bold text-stone-600 flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Thêm Boss (3/4)
            </button>
            <span className="text-xs font-bold text-[#FF6F61]">Minh bạch Hành vi</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5 mb-4">
            <div className="h-1.5 rounded-full bg-[#FF6F61]" />
            <div className="h-1.5 rounded-full bg-[#FF6F61]" />
            <div className="h-1.5 rounded-full bg-[#FF6F61]" />
            <div className="h-1.5 rounded-full bg-stone-200" />
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                ⚡ Mức năng lượng
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'low', label: 'Thấp ⚡' },
                  { id: 'medium', label: 'Trung bình ⚡⚡' },
                  { id: 'high', label: 'Cao ⚡⚡⚡' },
                ].map((lv) => (
                  <button
                    key={lv.id}
                    type="button"
                    onClick={() => setEnergyLevel(lv.id as 'low' | 'medium' | 'high')}
                    className={`py-2 rounded-xl text-xs font-bold border ${
                      energyLevel === lv.id
                        ? 'bg-[#FF6F61] text-white border-[#FF6F61]'
                        : 'bg-white text-stone-600 border-stone-200'
                    }`}
                  >
                    {lv.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-stone-700 mb-1.5">
                Tính cách (Chọn nhiều)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {PERSONALITY_OPTIONS.map((p) => {
                  const active = personalities.includes(p);
                  return (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setPersonalities(toggleItem(personalities, p))}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border ${
                        active
                          ? 'bg-[#2D3436] text-white border-[#2D3436]'
                          : 'bg-white text-stone-600 border-stone-200'
                      }`}
                    >
                      {p}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Good habits */}
            <div>
              <label className="block text-xs font-bold text-teal-800 mb-1">
                ✅ Thói quen tốt
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {goodHabits.map((g) => (
                  <span
                    key={g}
                    className="px-2.5 py-1 rounded-full bg-[#A3E4D7]/40 text-teal-950 text-xs font-bold"
                  >
                    ✓ {g}
                  </span>
                ))}
              </div>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={newGoodHabit}
                  onChange={(e) => setNewGoodHabit(e.target.value)}
                  placeholder="Thêm thói quen tốt..."
                  className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newGoodHabit.trim()) {
                      setGoodHabits([...goodHabits, newGoodHabit.trim()]);
                      setNewGoodHabit('');
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-teal-600 text-white text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm
                </button>
              </div>
            </div>

            {/* Cautions for Fight Prevention */}
            <div>
              <label className="block text-xs font-bold text-amber-800 mb-1">
                ⚠️ Cần lưu ý (Hiển thị minh bạch để tránh xung đột ngoài công viên)
              </label>
              <div className="flex flex-wrap gap-1.5 mb-2">
                {cautions.map((c) => (
                  <span
                    key={c}
                    className="px-2.5 py-1 rounded-full bg-amber-100 text-amber-950 text-xs font-bold"
                  >
                    ⚠️ {c}
                  </span>
                ))}
              </div>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={newCaution}
                  onChange={(e) => setNewCaution(e.target.value)}
                  placeholder="VD: Hay nhảy lên người, bảo vệ đồ ăn..."
                  className="flex-1 px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newCaution.trim()) {
                      setCautions([...cautions, newCaution.trim()]);
                      setNewCaution('');
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-bold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Thêm
                </button>
              </div>
            </div>
          </div>
        </div>

        <button
          onClick={() => setStage('pet_4')}
          className="w-full py-3.5 rounded-2xl bg-[#FF6F61] text-white font-bold text-sm shadow-md mt-6"
        >
          Tiếp theo (4/4): Nhu cầu chính
        </button>
      </div>
    );
  }

  if (stage === 'pet_4') {
    return (
      <div className="p-6 flex flex-col justify-between min-h-full">
        <div>
          <div className="flex items-center justify-between mb-2">
            <button
              onClick={() => setStage('pet_3')}
              className="text-xs font-bold text-stone-600 flex items-center gap-1"
            >
              <ArrowLeft className="w-4 h-4" /> Thêm Boss (4/4)
            </button>
            <span className="text-xs font-bold text-[#FF6F61]">Cá nhân hóa Pawty</span>
          </div>
          <div className="grid grid-cols-4 gap-1.5 mb-5">
            <div className="h-1.5 rounded-full bg-[#FF6F61]" />
            <div className="h-1.5 rounded-full bg-[#FF6F61]" />
            <div className="h-1.5 rounded-full bg-[#FF6F61]" />
            <div className="h-1.5 rounded-full bg-[#FF6F61]" />
          </div>

          <h2 className="font-display text-xl font-bold mb-1">Bạn cần gì nhất lúc này? *</h2>
          <p className="text-xs text-stone-500 mb-4">
            Chọn từ 1–3 mục tiêu để Pawty ưu tiên sắp xếp màn hình Hôm nay & PawRank cho bạn.
          </p>

          <div className="grid grid-cols-2 gap-2.5">
            {PRIMARY_NEEDS_LIST.map((need) => {
              const selected = selectedNeeds.includes(need.id);
              return (
                <button
                  key={need.id}
                  type="button"
                  onClick={() => setSelectedNeeds(toggleItem(selectedNeeds, need.id, 3))}
                  className={`p-3 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    selected
                      ? 'border-[#FF6F61] bg-[#FF6F61]/10 shadow-xs'
                      : 'border-stone-200 bg-white hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xl">{need.icon}</span>
                    {selected && <CheckCircle2 className="w-4 h-4 text-[#FF6F61]" />}
                  </div>
                  <span className="text-xs font-bold text-[#2D3436]">{need.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={handleFinishWizard}
          className="w-full py-3.5 rounded-2xl bg-[#FF6F61] text-white font-bold text-sm shadow-md mt-6 flex items-center justify-center gap-2"
        >
          <Sparkles className="w-4 h-4" />
          <span>Hoàn tất 🎉</span>
        </button>
      </div>
    );
  }

  // Onboarding Success Screen
  return (
    <div className="p-6 flex flex-col justify-between min-h-full text-center bg-gradient-to-b from-[#FDFBF7] to-[#A3E4D7]/25">
      <div className="my-auto py-8">
        <div className="w-24 h-24 rounded-full bg-[#FF6F61]/15 text-[#FF6F61] flex items-center justify-center mx-auto mb-5 shadow-inner">
          <PartyPopper className="w-12 h-12" />
        </div>
        <span className="text-xs font-bold px-3 py-1 rounded-full bg-[#A3E4D7] text-teal-950">
          🐾 Hồ sơ Sổ tiêm & Hành vi đã kích hoạt
        </span>
        <h1 className="font-display text-2xl font-bold text-[#2D3436] mt-4">
          Chào mừng {petName} đến Pawty!
        </h1>
        <p className="text-xs text-stone-600 mt-2 max-w-xs mx-auto leading-relaxed">
          Hồ sơ Boss đã sẵn sàng. Bạn có thể bắt đầu giao việc cho người nhà trong Vòng chăm sóc
          hoặc khám phá cộng đồng gần {neighborhood}.
        </p>
      </div>

      <div className="space-y-2.5">
        <button
          onClick={() => commitAndNavigate('explore')}
          className="w-full py-3.5 rounded-2xl bg-[#FF6F61] text-white font-bold text-sm shadow-md"
        >
          Khám phá cộng đồng
        </button>
        <button
          onClick={() => commitAndNavigate('circle')}
          className="w-full py-3.5 rounded-2xl bg-white border-2 border-[#2D3436] text-[#2D3436] font-bold text-sm"
        >
          Mời người chăm sóc (Pawty Circle)
        </button>
        <button
          onClick={() => commitAndNavigate('today')}
          className="w-full py-2.5 text-xs font-bold text-stone-500 hover:text-[#2D3436]"
        >
          Về trang chính (Hôm nay)
        </button>
      </div>
    </div>
  );
};

