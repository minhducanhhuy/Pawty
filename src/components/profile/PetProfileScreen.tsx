import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PetProfile, PetMoment } from '../../types';
import { UploadMomentModal } from './UploadMomentModal';
import {
  ShieldCheck,
  Heart,
  Calendar,
  Weight,
  Sparkles,
  Camera,
  Plus,
  AlertTriangle,
  Smile,
  Frown,
  MapPin,
  X,
  MessageCircle,
  Crown
} from 'lucide-react';

interface PetProfileScreenProps {
  overridePet?: PetProfile | null;
  onCloseOverride?: () => void;
}

export const PetProfileScreen: React.FC<PetProfileScreenProps> = ({
  overridePet,
  onCloseOverride,
}) => {
  const {
    currentPet,
    user,
    moments,
    toggleLikeMoment,
    setIsVipModalOpen,
    setActiveTab,
    setSelectedChatRoomId,
    chatRooms,
  } = useApp();

  const [activeTab, setLocalActiveTab] = useState<'moments' | 'deep_bio'>('moments');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedMoment, setSelectedMoment] = useState<PetMoment | null>(null);

  const targetPet = overridePet || currentPet;
  const isOwnPet = targetPet.id === currentPet.id;

  // Filter moments for this pet
  const petMoments = moments.filter((m) => m.petId === targetPet.id);

  const handleStartChatWithPet = () => {
    const existingRoom = chatRooms.find((r) => r.matchPet.id === targetPet.id);
    if (existingRoom) {
      setSelectedChatRoomId(existingRoom.id);
    }
    setActiveTab('chat');
    if (onCloseOverride) onCloseOverride();
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#FDFBF7] relative overflow-y-auto">
      {/* Top Floating Close Button if modal */}
      {overridePet && onCloseOverride && (
        <button
          onClick={onCloseOverride}
          className="absolute top-3 right-3 z-30 p-2 rounded-full bg-black/50 text-white hover:bg-black/70 backdrop-blur-md transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      )}

      {/* Profile Header Card */}
      <div className="relative shrink-0 bg-white border-b border-slate-100 pb-4 shadow-2xs">
        {/* Cover Photo */}
        <div className="h-40 w-full relative overflow-hidden bg-slate-900">
          <img
            src={targetPet.photos[1] || targetPet.avatarUrl}
            alt="Cover"
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/40 backdrop-blur text-white text-[10px] font-bold flex items-center gap-1 border border-white/20">
            <MapPin className="w-3 h-3 text-[#FF6F61]" />
            <span>{targetPet.condoComplex}</span>
          </div>
        </div>

        {/* Avatar & Badges */}
        <div className="px-4 -mt-12 relative flex items-end justify-between">
          <div className="relative">
            <div className="w-22 h-22 rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-white">
              <img src={targetPet.avatarUrl} alt={targetPet.name} className="w-full h-full object-cover" />
            </div>
            {isOwnPet && user.isVip && (
              <div className="absolute -top-2 -right-1 w-6 h-6 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center shadow">
                <Crown className="w-3.5 h-3.5 fill-current" />
              </div>
            )}
          </div>

          {/* Action buttons if not own */}
          {!isOwnPet && (
            <button
              onClick={handleStartChatWithPet}
              className="py-2 px-4 rounded-2xl bg-gradient-to-r from-[#FF6F61] to-[#E85B4E] text-white font-fredoka font-bold text-xs shadow-md shadow-[#FF6F61]/25 flex items-center gap-1.5 active:scale-95 transition-transform"
            >
              <MessageCircle className="w-4 h-4" />
              <span>Nhắn Tin Ngay</span>
            </button>
          )}

          {isOwnPet && (
            <button
              onClick={() => setIsUploadOpen(true)}
              className="py-2 px-3 rounded-2xl bg-gradient-to-r from-[#FF6F61] to-[#E85B4E] text-white font-fredoka font-bold text-xs shadow-md shadow-[#FF6F61]/20 flex items-center gap-1.5 active:scale-95 transition-transform"
            >
              <Plus className="w-4 h-4" />
              <span>Đăng Khoảnh Khắc</span>
            </button>
          )}
        </div>

        {/* Name & Basic Info */}
        <div className="px-4 mt-2">
          <div className="flex items-center gap-2">
            <h1 className="font-fredoka text-xl font-black text-slate-900">{targetPet.name}</h1>
            <span className="px-2 py-0.5 rounded-full bg-[#FF6F61]/15 text-[#FF6F61] text-[10px] font-bold">
              {targetPet.breed}
            </span>
          </div>

          <p className="text-xs text-slate-500 font-medium mt-0.5">
            {targetPet.gender === 'male' ? 'Đực' : 'Cái'} •{' '}
            {targetPet.ageYears > 0 ? `${targetPet.ageYears} tuổi` : ''} {targetPet.ageMonths} tháng •{' '}
            {targetPet.weightKg} kg
          </p>

          <p className="text-xs text-slate-700 mt-2 leading-relaxed italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
            "{targetPet.bio}"
          </p>

          {/* Chips */}
          <div className="flex flex-wrap gap-1.5 mt-2.5">
            {targetPet.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-0.5 rounded-full bg-[#A3E4D7]/30 text-emerald-900 text-[10px] font-bold border border-[#A3E4D7]/50"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>

        {/* 2 Tabs Segment Control */}
        <div className="px-4 mt-4">
          <div className="grid grid-cols-2 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80">
            <button
              onClick={() => setLocalActiveTab('moments')}
              className={`py-2 text-xs font-bold font-fredoka rounded-xl transition-all ${
                activeTab === 'moments'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              📸 Khoảnh Khắc ({petMoments.length})
            </button>
            <button
              onClick={() => setLocalActiveTab('deep_bio')}
              className={`py-2 text-xs font-bold font-fredoka rounded-xl transition-all ${
                activeTab === 'deep_bio'
                  ? 'bg-[#A3E4D7] text-emerald-950 shadow-xs'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              📋 Tiểu Sử Chuyên Sâu
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1 Content: Khoảnh Khắc (3-Column Grid) */}
      {activeTab === 'moments' && (
        <div className="p-3">
          {petMoments.length > 0 ? (
            <div className="grid grid-cols-3 gap-2">
              {petMoments.map((moment) => (
                <div
                  key={moment.id}
                  onClick={() => setSelectedMoment(moment)}
                  className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group shadow-2xs border border-slate-100 bg-slate-100"
                >
                  <img
                    src={moment.mediaUrl}
                    alt={moment.caption}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  {/* Heart like counter badge */}
                  <div className="absolute bottom-1.5 right-1.5 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur text-white text-[10px] font-bold flex items-center gap-1">
                    <Heart
                      className={`w-3 h-3 ${moment.isLikedByCurrentUser ? 'text-red-400 fill-current' : 'text-white'}`}
                    />
                    <span>{moment.likesCount}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Camera className="w-10 h-10 mx-auto text-slate-300" />
              <p className="text-xs font-semibold">Chưa có khoảnh khắc nào</p>
              {isOwnPet && (
                <button
                  onClick={() => setIsUploadOpen(true)}
                  className="text-xs text-[#FF6F61] font-bold hover:underline font-fredoka"
                >
                  + Đăng ảnh bựa đầu tiên ngay
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 2 Content: Tiểu Sử Chuyên Sâu (Mint Green Cards) */}
      {activeTab === 'deep_bio' && (
        <div className="p-4 space-y-3">
          {/* Card 1: Cân Nặng & Thể Hình */}
          <div className="p-3.5 rounded-2xl bg-[#E8F8F5] border border-[#A3E4D7] text-slate-800 space-y-1.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 font-fredoka">
                <Weight className="w-4 h-4 text-emerald-600" />
                <span>Cân Nặng & Kích Thước Chuẩn</span>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[10px] font-bold font-mono">
                {targetPet.weightKg} KG
              </span>
            </div>
            <p className="text-[11px] text-slate-600">
              Phân khúc: <strong>Size {targetPet.size === 'small' ? 'Nhỏ (<5kg)' : targetPet.size === 'medium' ? 'Vừa (5-15kg)' : 'Lớn (>15kg)'}</strong>. Thể trạng săn chắc, chạy nhanh.
            </p>
          </div>

          {/* Card 2: Sổ Tiêm Chủng Điện Tử */}
          <div className="p-3.5 rounded-2xl bg-[#E8F8F5] border border-[#A3E4D7] text-slate-800 space-y-2 shadow-2xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 font-fredoka">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Sổ Tiêm Chủng Điện Tử (Safe Pet)</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                Đã xác thực
              </span>
            </div>
            <div className="text-[11px] text-slate-700 space-y-1 bg-white/70 p-2.5 rounded-xl border border-[#A3E4D7]/60">
              <p>
                💉 <strong>Vaccine phòng bệnh:</strong> {targetPet.vaccineDetails || '7 bệnh Vanguard Plus & Dại'}
              </p>
              <p>
                📅 <strong>Mũi nhắc gần nhất:</strong> {targetPet.lastVaccineDate || '15/01/2026'}
              </p>
              <p>
                🛡️ <strong>Triệt sản:</strong> {targetPet.isNeutered ? 'Đã triệt sản an toàn' : 'Chưa triệt sản'}
              </p>
            </div>
          </div>

          {/* Card 3: Thói Quen Tốt */}
          <div className="p-3.5 rounded-2xl bg-[#E8F8F5] border border-[#A3E4D7] text-slate-800 space-y-2 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-900 font-fredoka">
              <Smile className="w-4 h-4 text-emerald-600" />
              <span>Thói Quen Tốt Khi Ra Đường</span>
            </div>
            <ul className="text-[11px] text-slate-700 space-y-1">
              {targetPet.habits.good.map((h, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  <span className="text-emerald-600">✓</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Card 4: Thói Quen Cần Lưu Ý (Phòng Tránh Xung Đột) */}
          <div className="p-3.5 rounded-2xl bg-amber-50/90 border border-amber-200 text-slate-800 space-y-2 shadow-2xs">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900 font-fredoka">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Thói Quen Cần Lưu Ý (Chủ Động Phòng Ngừa)</span>
            </div>
            <p className="text-[10px] text-amber-800 italic">
              *Thông tin do Sen ghi chú giúp các bạn dạo cùng tránh các pha giật mình, xung đột.
            </p>
            <ul className="text-[11px] text-slate-700 space-y-1">
              {targetPet.habits.bad.map((h, i) => (
                <li key={i} className="flex items-center gap-1.5">
                  <span className="text-amber-600 font-bold">!</span>
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Card 5: Chủ Nuôi (Sen) */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200 text-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <img
                src={targetPet.ownerAvatar}
                alt={targetPet.ownerName}
                className="w-10 h-10 rounded-full object-cover border border-slate-200"
              />
              <div>
                <p className="text-xs font-bold text-slate-900">{targetPet.ownerName}</p>
                <p className="text-[10px] text-slate-500">Cư dân {targetPet.condoComplex}</p>
              </div>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold">
              Đã KYC SĐT
            </span>
          </div>
        </div>
      )}

      {/* Moment Viewer Modal */}
      {selectedMoment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white rounded-[32px] overflow-hidden shadow-2xl border border-slate-200 flex flex-col">
            <div className="relative aspect-square bg-slate-900">
              <img
                src={selectedMoment.mediaUrl}
                alt="Moment"
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedMoment(null)}
                className="absolute top-3 right-3 p-1.5 rounded-full bg-black/50 text-white hover:bg-black/70"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <img
                    src={selectedMoment.petAvatar}
                    alt={selectedMoment.petName}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-900 font-fredoka">
                      {selectedMoment.petName}
                    </p>
                    <p className="text-[10px] text-slate-400">{selectedMoment.createdAt}</p>
                  </div>
                </div>

                {/* Heart Button */}
                <button
                  onClick={() => toggleLikeMoment(selectedMoment.id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border transition-all active:scale-95 ${
                    selectedMoment.isLikedByCurrentUser
                      ? 'bg-rose-50 border-rose-200 text-rose-500'
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <Heart
                    className={`w-4 h-4 ${
                      selectedMoment.isLikedByCurrentUser ? 'fill-current' : ''
                    }`}
                  />
                  <span className="text-xs font-bold">{selectedMoment.likesCount}</span>
                </button>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                "{selectedMoment.caption}"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      <UploadMomentModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
      />
    </div>
  );
};
