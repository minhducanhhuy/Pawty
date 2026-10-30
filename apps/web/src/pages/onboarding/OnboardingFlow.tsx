import React, { useState } from 'react';
import {
  ArrowRight,
  Cat,
  Check,
  Dog,
  MapPin,
  PawPrint,
  Phone,
  ShieldCheck,
  User,
} from 'lucide-react';
import { usePawtyStore } from '../../stores/usePawtyStore';
import { PawtyAnimatedLogo } from '../../components/common/PawtyAnimatedLogo';
import { WEB_THEMES } from '../../mocks/seedData';

export const OnboardingFlow: React.FC = () => {
  const {
    user,
    pets,
    hasSavedSession,
    loginWithSavedSession,
    loginWithPhone,
    completeOnboardingWizard,
    themeId,
  } = usePawtyStore();

  const theme = WEB_THEMES[themeId] ?? WEB_THEMES.coral;

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [phone, setPhone] = useState(user.phone || '0912345678');
  const [otp, setOtp] = useState('6868');
  const [otpSent, setOtpSent] = useState(false);

  const [ownerName, setOwnerName] = useState('Mai Nguyễn');
  const [neighborhood, setNeighborhood] = useState('Vinhomes Grand Park - Quận 9');
  const [petName, setPetName] = useState('Lu');
  const [species, setSpecies] = useState<'dog' | 'cat'>('dog');
  const [breed, setBreed] = useState('Golden Retriever');
  const [weightKg, setWeightKg] = useState<number>(28);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'login') {
      loginWithPhone(phone);
    } else {
      completeOnboardingWizard({
        phone,
        displayName: ownerName,
        district: 'TP. Thủ Đức (Quận 9)',
        neighborhood,
        petName,
        species,
        breed,
        gender: 'male',
        weightKg: Number(weightKg) || 10,
        vaccinationStatus: 'full',
        isNeutered: true,
        allergies: 'Không có',
        energyLevel: 'medium',
        personalities: ['Thân thiện'],
        goodHabits: ['Ngoan ngoãn'],
        cautions: [],
        primaryNeeds: ['care_management', 'family_circle', 'walk_buddy'],
      });
    }
  };

  return (
    <div
      style={{ backgroundColor: theme.bg, color: theme.text }}
      className="min-h-full p-5 flex flex-col justify-between"
    >
      <div>
        {/* Official Brand Logo Header */}
        <div className="flex flex-col items-center text-center pt-4 pb-5">
          <div
            style={{ backgroundColor: theme.surface, borderColor: theme.border }}
            className="w-full py-5 px-4 rounded-3xl border shadow-xs flex flex-col items-center"
          >
            <PawtyAnimatedLogo size="lg" withFloat />
            <p
              style={{ color: theme.primary }}
              className="text-sm font-extrabold mt-2"
            >
              Những bàn chân nhỏ đang tới
            </p>
            <p
              style={{ color: theme.textSoft }}
              className="text-xs font-medium mt-1 max-w-[260px]"
            >
              Mạng xã hội khoảnh khắc, hẹn hò thú cưng và đặt lịch dịch vụ uy tín quanh bạn
            </p>
          </div>
        </div>

        {/* Saved Session Fast Entry */}
        {hasSavedSession && (
          <div
            style={{
              backgroundColor: theme.primarySoft,
              borderColor: theme.primary,
            }}
            className="p-4 rounded-2xl border mb-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <img
                src="/assets/pawty-icon.png"
                alt="Pawty Icon"
                className="w-11 h-11 rounded-xl object-cover bg-white"
              />
              <div className="flex-1 min-w-0">
                <p
                  style={{ color: theme.primary }}
                  className="text-[11px] font-bold uppercase tracking-wide"
                >
                  Tài khoản đã lưu trên thiết bị
                </p>
                <p style={{ color: theme.text }} className="text-sm font-bold truncate">
                  {user.displayName} ({user.phone})
                </p>
                <p style={{ color: theme.textSoft }} className="text-xs truncate">
                  Hồ sơ thú cưng: {pets.map((p) => p.name).join(', ')}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={loginWithSavedSession}
              style={{ backgroundColor: theme.primary }}
              className="w-full py-2.5 px-4 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-2 hover:opacity-95 transition-opacity"
            >
              <span>Vào thẳng ứng dụng</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Mode Switcher: Login vs Register */}
        <div
          style={{ backgroundColor: theme.surface, borderColor: theme.border }}
          className="grid grid-cols-2 p-1 rounded-2xl border mb-4"
        >
          <button
            type="button"
            onClick={() => setMode('login')}
            style={{
              backgroundColor: mode === 'login' ? theme.primary : 'transparent',
              color: mode === 'login' ? '#FFFFFF' : theme.textSoft,
            }}
            className="py-2.5 rounded-xl text-xs font-bold transition-colors"
          >
            Đăng nhập
          </button>
          <button
            type="button"
            onClick={() => setMode('register')}
            style={{
              backgroundColor: mode === 'register' ? theme.primary : 'transparent',
              color: mode === 'register' ? '#FFFFFF' : theme.textSoft,
            }}
            className="py-2.5 rounded-xl text-xs font-bold transition-colors"
          >
            Tạo tài khoản mới
          </button>
        </div>

        {/* Auth Form Card */}
        <form
          onSubmit={handleSubmit}
          style={{ backgroundColor: theme.surface, borderColor: theme.border }}
          className="p-4 rounded-2xl border space-y-3.5"
        >
          <div>
            <label
              style={{ color: theme.textSoft }}
              className="block text-xs font-semibold mb-1.5"
            >
              Số điện thoại
            </label>
            <div
              style={{ backgroundColor: theme.bg, borderColor: theme.border }}
              className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border"
            >
              <Phone style={{ color: theme.textSoft }} className="w-4 h-4 shrink-0" />
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Nhập số điện thoại"
                style={{ color: theme.text }}
                className="w-full bg-transparent text-sm font-medium focus:outline-none"
              />
            </div>
          </div>

          {mode === 'login' ? (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  style={{ color: theme.textSoft }}
                  className="block text-xs font-semibold"
                >
                  Mã xác thực (OTP)
                </label>
                <button
                  type="button"
                  onClick={() => setOtpSent(true)}
                  style={{ color: theme.primary }}
                  className="text-xs font-bold"
                >
                  {otpSent ? 'Đã gửi mã' : 'Nhận mã xác thực'}
                </button>
              </div>
              <div
                style={{ backgroundColor: theme.bg, borderColor: theme.border }}
                className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border"
              >
                <ShieldCheck
                  style={{ color: theme.textSoft }}
                  className="w-4 h-4 shrink-0"
                />
                <input
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  placeholder="Nhập 4 chữ số"
                  style={{ color: theme.text }}
                  className="w-full bg-transparent text-sm font-medium focus:outline-none"
                />
              </div>
            </div>
          ) : (
            <>
              <div>
                <label
                  style={{ color: theme.textSoft }}
                  className="block text-xs font-semibold mb-1.5"
                >
                  Tên của bạn
                </label>
                <div
                  style={{ backgroundColor: theme.bg, borderColor: theme.border }}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border"
                >
                  <User style={{ color: theme.textSoft }} className="w-4 h-4 shrink-0" />
                  <input
                    type="text"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    placeholder="VD: Mai Nguyễn"
                    style={{ color: theme.text }}
                    className="w-full bg-transparent text-sm font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label
                  style={{ color: theme.textSoft }}
                  className="block text-xs font-semibold mb-1.5"
                >
                  Khu vực sinh sống
                </label>
                <div
                  style={{ backgroundColor: theme.bg, borderColor: theme.border }}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border"
                >
                  <MapPin style={{ color: theme.textSoft }} className="w-4 h-4 shrink-0" />
                  <input
                    type="text"
                    value={neighborhood}
                    onChange={(e) => setNeighborhood(e.target.value)}
                    placeholder="VD: Vinhomes Grand Park"
                    style={{ color: theme.text }}
                    className="w-full bg-transparent text-sm font-medium focus:outline-none"
                  />
                </div>
              </div>

              <div style={{ borderColor: theme.border }} className="pt-2 border-t">
                <p style={{ color: theme.text }} className="text-xs font-bold mb-2">
                  Hồ sơ thú cưng đầu tiên
                </p>

                <label
                  style={{ color: theme.textSoft }}
                  className="block text-xs font-semibold mb-1.5"
                >
                  Phân loại thú cưng
                </label>
                <div className="grid grid-cols-2 gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => {
                      setSpecies('dog');
                      setBreed('Golden Retriever');
                    }}
                    style={{
                      backgroundColor:
                        species === 'dog' ? theme.primary : theme.bg,
                      borderColor:
                        species === 'dog' ? theme.primary : theme.border,
                      color: species === 'dog' ? '#FFFFFF' : theme.text,
                    }}
                    className="py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <Dog className="w-4 h-4" />
                    <span>Loài Chó</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSpecies('cat');
                      setBreed('Mèo Anh Lông Ngắn');
                    }}
                    style={{
                      backgroundColor:
                        species === 'cat' ? theme.primary : theme.bg,
                      borderColor:
                        species === 'cat' ? theme.primary : theme.border,
                      color: species === 'cat' ? '#FFFFFF' : theme.text,
                    }}
                    className="py-2.5 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5"
                  >
                    <Cat className="w-4 h-4" />
                    <span>Loài Mèo</span>
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label
                      style={{ color: theme.textSoft }}
                      className="block text-xs font-semibold mb-1"
                    >
                      Tên thú cưng
                    </label>
                    <div
                      style={{ backgroundColor: theme.bg, borderColor: theme.border }}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl border"
                    >
                      <PawPrint style={{ color: theme.textSoft }} className="w-3.5 h-3.5" />
                      <input
                        type="text"
                        value={petName}
                        onChange={(e) => setPetName(e.target.value)}
                        style={{ color: theme.text }}
                        className="w-full bg-transparent text-xs font-medium focus:outline-none"
                      />
                    </div>
                  </div>
                  <div>
                    <label
                      style={{ color: theme.textSoft }}
                      className="block text-xs font-semibold mb-1"
                    >
                      Cân nặng (kg)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={weightKg}
                      onChange={(e) => setWeightKg(Number(e.target.value))}
                      style={{
                        backgroundColor: theme.bg,
                        borderColor: theme.border,
                        color: theme.text,
                      }}
                      className="w-full px-3 py-2 rounded-xl border text-xs font-medium focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            style={{ backgroundColor: theme.primary }}
            className="w-full py-3 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-2 hover:opacity-95 transition-opacity mt-2"
          >
            <Check className="w-4 h-4" />
            <span>
              {mode === 'login' ? 'Đăng nhập vào Pawty' : 'Hoàn tất & Vào ứng dụng'}
            </span>
          </button>
        </form>
      </div>

      <p
        style={{ color: theme.textSoft }}
        className="text-[11px] text-center pt-4 pb-1"
      >
        Thông tin số điện thoại và địa chỉ được bảo mật riêng tư.
      </p>
    </div>
  );
};
