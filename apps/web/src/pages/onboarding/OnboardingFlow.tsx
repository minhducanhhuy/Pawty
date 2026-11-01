import React, { useState } from 'react';
import {
  AlertTriangle,
  ArrowRight,
  Cat,
  Check,
  Dog,
  MapPin,
  PawPrint,
  Phone,
  User,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import { usePawtyStore } from '../../stores/usePawtyStore';
import { PawtyAnimatedLogo } from '../../components/common/PawtyAnimatedLogo';
import { WEB_THEMES } from '../../config/themes';

const POPULAR_DOG_BREEDS = [
  'Golden Retriever',
  'Corgi',
  'Poodle',
  'Phốc Sóc (Pomeranian)',
  'Husky Sibir',
  'Alaska Malamute',
  'Shiba Inu',
  'Chó Ta (Bản địa / Chó cỏ)',
  'Chó Phú Quốc',
  'Chó Bắc Hà',
  'Chó H\'Mông cộc đuôi',
  'Pug',
  'Bulldog Pháp',
  'Bulldog Anh',
  'Samoyed',
  'Chihuahua',
  'Dachshund (Lạp xưởng)',
  'Beagle',
  'Rottweiler',
  'Doberman',
  'Border Collie',
  'Labrador Retriever',
  'Bichon Frise',
  'Chó cỏ lai',
  'Chó Becgie (German Shepherd)',
  'Chó Akita',
  'Khác',
];

const POPULAR_CAT_BREEDS = [
  'Mèo Anh lông ngắn (BSH)',
  'Mèo Anh lông dài (BLH)',
  'Mèo Ba Tư (Persian)',
  'Mèo Mướp (Bản địa)',
  'Mèo Vàng (Bản địa)',
  'Mèo Munchkin',
  'Mèo Ragdoll',
  'Mèo Scottish Fold',
  'Mèo Xiêm (Siamese)',
  'Mèo Bengal',
  'Mèo Sphynx',
  'Mèo Maine Coon',
  'Mèo Nga mắt xanh',
  'Mèo Tam thể',
  'Mèo Mướp lai',
  'Khác',
];

export const OnboardingFlow: React.FC = () => {
  const {
    user,
    pets,
    hasSavedSession,
    bootAuthError,
    loginWithSavedSession,
    loginWithCredentials,
    completeOnboardingWizard,
    themeId,
  } = usePawtyStore();

  const theme = WEB_THEMES[themeId] ?? WEB_THEMES.coral;

  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [username, setUsername] = useState('');
  const [phone, setPhone] = useState('');

  const [ownerName, setOwnerName] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [petName, setPetName] = useState('');
  const [species, setSpecies] = useState<'dog' | 'cat'>('dog');
  const [breed, setBreed] = useState('');
  const [weightKg, setWeightKg] = useState<number>(8);

  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const displayedError = authError || bootAuthError;

  const handleSavedSessionLogin = async () => {
    setAuthError(null);
    setIsLoading(true);
    try {
      await loginWithSavedSession();
    } catch (err: any) {
      setAuthError(
        err?.message ||
          'Không thể kết nối cơ sở dữ liệu PostgreSQL để đăng nhập.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (mode === 'login') {
      if (!identifier.trim()) {
        setAuthError('Vui lòng nhập Số điện thoại hoặc Tên đăng nhập.');
        return;
      }
      if (!password.trim()) {
        setAuthError('Vui lòng nhập mật khẩu.');
        return;
      }

      setIsLoading(true);
      try {
        await loginWithCredentials(identifier, password);
      } catch (err: any) {
        setAuthError(
          err?.message ||
            'Đăng nhập thất bại: Không thể kết nối cơ sở dữ liệu PostgreSQL.'
        );
      } finally {
        setIsLoading(false);
      }
      return;
    }

    if (!phone.trim() || !ownerName.trim() || !password.trim()) {
      setAuthError('Vui lòng điền đầy đủ Số điện thoại, Mật khẩu và Họ tên.');
      return;
    }

    setIsLoading(true);
    try {
      await completeOnboardingWizard({
        phone,
        username,
        password,
        displayName: ownerName,
        district: '',
        neighborhood,
        petName: petName || 'Thú cưng',
        species,
        breed: breed || (species === 'dog' ? 'Chó cưng' : 'Mèo cưng'),
        gender: 'male',
        weightKg: Number(weightKg) || 8,
        vaccinationStatus: 'full',
        isNeutered: true,
        allergies: 'Không có',
        energyLevel: 'medium',
        personalities: ['Thân thiện'],
        goodHabits: ['Ngoan ngoãn'],
        cautions: [],
        primaryNeeds: ['care_management', 'family_circle', 'walk_buddy'],
      });
    } catch (err: any) {
      setAuthError(
        err?.message ||
          'Đăng ký thất bại: Không thể kết nối cơ sở dữ liệu PostgreSQL.'
      );
    } finally {
      setIsLoading(false);
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

        {/* Strict DB / Auth Error Banner */}
        {displayedError && (
          <div className="p-3.5 rounded-2xl border border-red-200 bg-red-50 text-red-700 text-xs font-semibold flex items-start gap-2.5 mb-4">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
            <span>{displayedError}</span>
          </div>
        )}

        {/* Saved Session Fast Entry */}
        {hasSavedSession && user.displayName && (
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
                {pets.length > 0 && (
                  <p style={{ color: theme.textSoft }} className="text-xs truncate">
                    Hồ sơ thú cưng: {pets.map((p) => p.name).join(', ')}
                  </p>
                )}
              </div>
            </div>
            <button
              type="button"
              disabled={isLoading}
              onClick={handleSavedSessionLogin}
              style={{ backgroundColor: theme.primary }}
              className="w-full py-2.5 px-4 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-2 hover:opacity-95 transition-opacity disabled:opacity-60"
            >
              <span>{isLoading ? 'Đang kết nối Database...' : 'Vào thẳng ứng dụng'}</span>
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
            onClick={() => {
              setMode('login');
              setAuthError(null);
            }}
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
            onClick={() => {
              setMode('register');
              setAuthError(null);
            }}
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
          {mode === 'login' ? (
            <>
              <div>
                <label
                  style={{ color: theme.textSoft }}
                  className="block text-xs font-semibold mb-1.5"
                >
                  Số điện thoại hoặc Tên đăng nhập (Username)
                </label>
                <div
                  style={{ backgroundColor: theme.bg, borderColor: theme.border }}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border"
                >
                  <User style={{ color: theme.textSoft }} className="w-4 h-4 shrink-0" />
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder="VD: 0900000001 hoặc test1..."
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
                  Mật khẩu
                </label>
                <div
                  style={{ backgroundColor: theme.bg, borderColor: theme.border }}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border"
                >
                  <Lock style={{ color: theme.textSoft }} className="w-4 h-4 shrink-0" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu..."
                    style={{ color: theme.text }}
                    className="w-full bg-transparent text-sm font-medium focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ color: theme.textSoft }}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <div>
                <label
                  style={{ color: theme.textSoft }}
                  className="block text-xs font-semibold mb-1.5"
                >
                  Số điện thoại đăng ký
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

              <div>
                <label
                  style={{ color: theme.textSoft }}
                  className="block text-xs font-semibold mb-1.5"
                >
                  Tên đăng nhập (Username)
                </label>
                <div
                  style={{ backgroundColor: theme.bg, borderColor: theme.border }}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border"
                >
                  <User style={{ color: theme.textSoft }} className="w-4 h-4 shrink-0" />
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Nhập username..."
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
                  Mật khẩu
                </label>
                <div
                  style={{ backgroundColor: theme.bg, borderColor: theme.border }}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl border"
                >
                  <Lock style={{ color: theme.textSoft }} className="w-4 h-4 shrink-0" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Nhập mật khẩu..."
                    style={{ color: theme.text }}
                    className="w-full bg-transparent text-sm font-medium focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ color: theme.textSoft }}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

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
                    placeholder="Nhập họ tên của bạn"
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
                    placeholder="Nhập khu chung cư / khu vực"
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
                      setBreed('Mèo Anh lông ngắn (BSH)');
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
                        placeholder="Tên bé..."
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
                  <div className="col-span-2 mt-1">
                    <label
                      style={{ color: theme.textSoft }}
                      className="block text-xs font-semibold mb-1"
                    >
                      Giống loài (Chọn từ danh sách)
                    </label>
                    <select
                      value={breed || (species === 'dog' ? 'Golden Retriever' : 'Mèo Anh lông ngắn (BSH)')}
                      onChange={(e) => setBreed(e.target.value)}
                      style={{
                        backgroundColor: theme.bg,
                        borderColor: theme.border,
                        color: theme.text,
                      }}
                      className="w-full px-3 py-2 rounded-xl border text-xs font-medium focus:outline-none"
                    >
                      {(species === 'dog' ? POPULAR_DOG_BREEDS : POPULAR_CAT_BREEDS).map((b) => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{ backgroundColor: theme.primary }}
            className="w-full py-3 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-2 hover:opacity-95 transition-opacity mt-2 disabled:opacity-60"
          >
            <Check className="w-4 h-4" />
            <span>
              {isLoading
                ? 'Đang kết nối Database...'
                : mode === 'login'
                ? 'Đăng nhập vào Pawty'
                : 'Hoàn tất & Vào ứng dụng'}
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
