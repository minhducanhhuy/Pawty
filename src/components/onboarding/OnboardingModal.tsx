import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PetProfile, PetSpecies, PetGender, PetSize } from '../../types';
import {
  Smartphone,
  ShieldCheck,
  PawPrint,
  Check,
  ArrowRight,
  ArrowLeft,
  X,
  Sparkles,
  Camera,
  Heart
} from 'lucide-react';

interface OnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onClose }) => {
  const { user, updateCurrentPet, triggerPushNotice } = useApp();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Phone
  const [phoneNumber, setPhoneNumber] = useState('0908 123 456');

  // Step 2: OTP
  const [otpCode, setOtpCode] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);

  // Step 3: Owner Details
  const [ownerName, setOwnerName] = useState('Minh Anh & Tuấn Kiệt');
  const [condoComplex, setCondoComplex] = useState('Vinhomes Central Park');

  // Step 4: Pet Details (Chips Component & Safe Filter)
  const [petName, setPetName] = useState('Bơ Lùn');
  const [species, setSpecies] = useState<PetSpecies>('dog');
  const [breed, setBreed] = useState('Corgi Pembroke');
  const [gender, setGender] = useState<PetGender>('male');
  const [isNeutered, setIsNeutered] = useState(true);
  const [ageYears, setAgeYears] = useState(1);
  const [ageMonths, setAgeMonths] = useState(6);
  const [weightKg, setWeightKg] = useState(11.2);
  const [size, setSize] = useState<PetSize>('medium');
  const [isVaccinated, setIsVaccinated] = useState(true);
  const [lastVaccineDate, setLastVaccineDate] = useState('15/01/2026');
  const [bio, setBio] = useState('Mông trái tim, chân ngắn 1 khúc nhưng chạy nhanh hơn bồ cũ lật mặt.');
  const [selectedTags, setSelectedTags] = useState<string[]>([
    'Tăng động',
    'Thân thiện',
    'Mê xúc xích',
  ]);
  const [avatarUrl, setAvatarUrl] = useState(
    'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?auto=format&fit=crop&w=600&q=80'
  );

  if (!isOpen) return null;

  const POPULAR_BREEDS: Record<PetSpecies, string[]> = {
    dog: ['Corgi Pembroke', 'Poodle', 'Shiba Inu', 'Golden Retriever', 'Pomeranian', 'Husky', 'Chó cỏ ta'],
    cat: ['Mèo Anh Lông Ngắn', 'Mèo Anh Lông Dài', 'Mèo Mướp', 'Ragdoll', 'Ba Tư (Persian)', 'Xiêm lai'],
  };

  const AVAILABLE_TAGS = [
    'Tăng động',
    'Thân thiện',
    'Ham ăn',
    'Sợ người lạ',
    'Thích ôm',
    'Trùm nghịch nước',
    'Mõm nhôm',
    'Quý tộc',
    'Ngoan ngoãn',
    'Chảnh mèo',
  ];

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber.trim()) return;

    triggerPushNotice({
      title: 'Firebase Auth OTP: Mã xác thực 888888',
      body: `Mã OTP xác thực số điện thoại ${phoneNumber} đã được gửi. Hiệu lực trong 2 phút.`,
      type: 'system',
    });
    setStep(2);
  };

  const handleVerifyOtp = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      triggerPushNotice({
        title: 'Đăng ký SĐT thành công!',
        body: 'JWT Token session đã được cấp bởi NestJS Auth. Tiếp tục thiết lập hồ sơ Boss.',
        type: 'system',
      });
      setStep(3);
    }, 600);
  };

  const handleCompletePet = () => {
    const updatedPet: PetProfile = {
      id: 'pet_bo_01',
      ownerId: user.id,
      name: petName.trim(),
      species,
      breed,
      gender,
      isNeutered,
      ageYears,
      ageMonths,
      weightKg,
      size,
      isVaccinated,
      lastVaccineDate,
      vaccineDetails: '7 bệnh Vanguard Plus & Dại',
      bio: bio.trim(),
      tags: selectedTags,
      habits: {
        good: ['Đi vệ sinh đúng bãi cỏ', 'Biết ngồi chờ hiệu lệnh', 'Thân thiện với người lạ'],
        bad: ['Hay sủa xe máy nẹt pô', 'Thấy bồ câu là rượt bất chấp', 'Mê đồ ăn dặm của bạn khác'],
      },
      avatarUrl,
      photos: [avatarUrl],
      ownerName,
      ownerAvatar: user.avatarUrl,
      condoComplex,
      location: user.location,
    };

    updateCurrentPet(updatedPet);

    triggerPushNotice({
      title: `🎉 Chào mừng Boss ${petName} gia nhập Pawty!`,
      body: 'Hồ sơ đã hoàn tất. Bạn đã có thể bắt đầu quẹt radar tìm bạn đi dạo chung!',
      type: 'system',
    });

    onClose();
  };

  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      if (selectedTags.length < 4) {
        setSelectedTags([...selectedTags, tag]);
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-[32px] p-5 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <img
              src="/assets/pawty-icon.png"
              alt="Pawty Icon"
              className="w-8 h-8 rounded-xl object-cover shadow-sm border border-slate-100"
            />
            <div>
              <h3 className="font-fredoka text-base font-bold text-slate-900">
                Core 1: Onboarding & Hồ Sơ Boss
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">Bước {step} / 4</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1 bg-slate-100 rounded-full my-3 overflow-hidden">
          <div
            className="h-full bg-[#FF6F61] transition-all duration-300"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>

        {/* STEP 1: Phone Auth */}
        {step === 1 && (
          <form onSubmit={handleSendOtp} className="space-y-4 py-2">
            <div className="text-center py-2 space-y-1.5">
              <img
                src="/assets/pawty-logo-full.png"
                alt="Pawty"
                className="h-13 w-auto mx-auto object-contain drop-shadow-xs"
              />
              <h4 className="font-fredoka text-base font-bold text-slate-900">
                Đăng Ký Bằng SĐT Thật
              </h4>
              <p className="text-xs text-slate-500">
                Pawty định danh số điện thoại thật để chống lừa đảo và bùng kèo đi dạo.
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Số điện thoại di động</label>
              <div className="flex items-center gap-2">
                <span className="px-3 py-2.5 rounded-xl bg-slate-100 text-xs font-bold text-slate-700 border border-slate-200">
                  🇻🇳 +84
                </span>
                <input
                  type="tel"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="0908 123 456"
                  required
                  className="flex-1 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF6F61]/30 focus:border-[#FF6F61]"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#FF6F61] to-[#E85B4E] text-white font-fredoka font-bold text-xs shadow-md shadow-[#FF6F61]/25 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
            >
              <span>Gửi Mã Xác Thực OTP (Firebase)</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* STEP 2: OTP Verification */}
        {step === 2 && (
          <div className="space-y-4 py-2">
            <div className="text-center py-2">
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center text-2xl mx-auto mb-2">
                🔐
              </div>
              <h4 className="font-fredoka text-base font-bold text-slate-900">
                Nhập Mã OTP Xác Nhận
              </h4>
              <p className="text-xs text-slate-500 mt-1">
                Mã 6 số gửi tới <strong>{phoneNumber}</strong>
              </p>
            </div>

            {/* Quick Fill Button */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setOtpCode(['8', '8', '8', '8', '8', '8'])}
                className="px-3 py-1 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-[11px] font-mono font-bold transition-colors"
              >
                Nhập nhanh mã test: 888888 ⚡
              </button>
            </div>

            <div className="flex justify-center gap-2">
              {otpCode.map((digit, idx) => (
                <input
                  key={idx}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => {
                    const newOtp = [...otpCode];
                    newOtp[idx] = e.target.value;
                    setOtpCode(newOtp);
                  }}
                  className="w-10 h-12 text-center text-base font-bold rounded-xl border-2 border-slate-200 bg-slate-50 focus:border-[#FF6F61] focus:outline-none"
                />
              ))}
            </div>

            <button
              type="button"
              onClick={handleVerifyOtp}
              disabled={isVerifying}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#FF6F61] to-[#E85B4E] text-white font-fredoka font-bold text-xs shadow-md shadow-[#FF6F61]/25 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
            >
              {isVerifying ? <span>Đang xác thực Firebase...</span> : <span>Xác Nhận & Cấp JWT Token</span>}
            </button>
          </div>
        )}

        {/* STEP 3: Owner info */}
        {step === 3 && (
          <div className="space-y-4 py-2">
            <h4 className="font-fredoka text-base font-bold text-slate-900">
              Thông Tin Chủ Nuôi (Sen)
            </h4>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Tên hiển thị / Biệt danh</label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Khu chung cư / Khu đô thị</label>
              <select
                value={condoComplex}
                onChange={(e) => setCondoComplex(e.target.value)}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
              >
                <option value="Vinhomes Central Park">Vinhomes Central Park (Bình Thạnh)</option>
                <option value="Masteri Thảo Điền">Masteri Thảo Điền (Thủ Đức)</option>
                <option value="Khu Đô Thị Sala">Khu Đô Thị Sala (Thủ Thiêm)</option>
                <option value="Times City">Times City (Hai Bà Trưng, HN)</option>
              </select>
            </div>

            <button
              type="button"
              onClick={() => setStep(4)}
              className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#FF6F61] to-[#E85B4E] text-white font-fredoka font-bold text-xs shadow-md shadow-[#FF6F61]/25 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
            >
              <span>Tiếp Tục Tạo Hồ Sơ Cho Boss</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 4: Pet Profiling (Chips & Safe Filter) */}
        {step === 4 && (
          <div className="space-y-4 py-2">
            <div className="flex items-center justify-between">
              <h4 className="font-fredoka text-base font-bold text-slate-900">
                Hồ Sơ Của Boss
              </h4>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="text-slate-400 hover:text-slate-600 text-xs flex items-center gap-1"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Quay lại</span>
              </button>
            </div>

            {/* Species Toggle */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setSpecies('dog');
                  setBreed(POPULAR_BREEDS.dog[0]);
                }}
                className={`py-2 px-3 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                  species === 'dog'
                    ? 'bg-[#FF6F61] border-[#FF6F61] text-white shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <span>🐶 Cún Cưng</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSpecies('cat');
                  setBreed(POPULAR_BREEDS.cat[0]);
                }}
                className={`py-2 px-3 rounded-2xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
                  species === 'cat'
                    ? 'bg-[#FF6F61] border-[#FF6F61] text-white shadow-xs'
                    : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}
              >
                <span>🐱 Hoàng Thượng</span>
              </button>
            </div>

            {/* Pet Name */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Tên Boss</label>
              <input
                type="text"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                placeholder="VD: Bơ Lùn, Mochi, Đậu Đậu..."
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
              />
            </div>

            {/* Breed Chips Selection */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Giống loài (Chọn nhanh)
              </label>
              <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1 bg-slate-50 rounded-xl border border-slate-200">
                {POPULAR_BREEDS[species].map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setBreed(b)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors ${
                      breed === b
                        ? 'bg-[#A3E4D7] text-emerald-950 border-[#48C4B0]'
                        : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {b}
                  </button>
                ))}
              </div>
            </div>

            {/* Weight & Size */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Cân nặng (KG)</label>
                <input
                  type="number"
                  step="0.1"
                  value={weightKg}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setWeightKg(val);
                    if (val < 5) setSize('small');
                    else if (val <= 15) setSize('medium');
                    else setSize('large');
                  }}
                  className="w-full p-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Kích cỡ</label>
                <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-900 text-center">
                  Size {size === 'small' ? 'Nhỏ (<5kg)' : size === 'medium' ? 'Vừa (5-15kg)' : 'Lớn (>15kg)'}
                </div>
              </div>
            </div>

            {/* Vaccine Verification */}
            <div
              onClick={() => setIsVaccinated(!isVaccinated)}
              className={`p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                isVaccinated ? 'bg-emerald-50 border-emerald-300' : 'bg-slate-50 border-slate-200'
              }`}
            >
              <div className="flex items-center gap-2">
                <ShieldCheck className={`w-5 h-5 ${isVaccinated ? 'text-emerald-600' : 'text-slate-400'}`} />
                <div>
                  <p className="text-xs font-bold text-slate-900">Đã tiêm phòng đầy đủ</p>
                  <p className="text-[10px] text-slate-500">Mũi nhắc 7 bệnh & Dại</p>
                </div>
              </div>
              <div
                className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                  isVaccinated ? 'bg-emerald-600 text-white border-emerald-600' : 'border-slate-300'
                }`}
              >
                {isVaccinated && <Check className="w-3.5 h-3.5" />}
              </div>
            </div>

            {/* 3 Personality Tags (Chips Selection) */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">
                Chọn 3 Tag Tính Cách (Đã chọn {selectedTags.length}/4)
              </label>
              <div className="flex flex-wrap gap-1.5">
                {AVAILABLE_TAGS.map((tag) => {
                  const isSelected = selectedTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleTag(tag)}
                      className={`px-2.5 py-1 rounded-xl text-[10px] font-bold border transition-colors ${
                        isSelected
                          ? 'bg-[#FF6F61] border-[#FF6F61] text-white shadow-2xs'
                          : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      #{tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Bio */}
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Bio tự giới thiệu</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={2}
                className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800"
              />
            </div>

            {/* Complete Button */}
            <button
              type="button"
              onClick={handleCompletePet}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FF6F61] to-[#E85B4E] text-white font-fredoka font-bold text-xs shadow-lg shadow-[#FF6F61]/25 flex items-center justify-center gap-1.5 cursor-pointer active:scale-95 transition-transform"
            >
              <Sparkles className="w-4 h-4" />
              <span>Hoàn Tất & Vào Màn Hình Chính</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
