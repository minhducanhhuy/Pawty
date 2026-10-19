import React from 'react';
import { useApp } from '../../context/AppContext';
import { PetProfile } from '../../types';
import { Sparkles, MessageCircle, Heart, Flame, ArrowRight, X } from 'lucide-react';

interface MatchModalProps {
  matchedPet: PetProfile | null;
  onClose: () => void;
}

export const MatchModal: React.FC<MatchModalProps> = ({ matchedPet, onClose }) => {
  const { currentPet, setActiveTab, setSelectedChatRoomId, chatRooms } = useApp();

  if (!matchedPet) return null;

  const handleOpenChat = () => {
    // Find room with this pet or default room
    const targetRoom = chatRooms.find((r) => r.matchPet.id === matchedPet.id);
    if (targetRoom) {
      setSelectedChatRoomId(targetRoom.id);
    }
    setActiveTab('chat');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-gradient-to-b from-[#FFF5F3] via-[#FDFBF7] to-white rounded-[36px] p-6 shadow-2xl border-4 border-[#FF6F61]/30 text-center overflow-hidden">
        {/* Decorative background paw prints */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-[#FF6F61]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-[#A3E4D7]/20 rounded-full blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Badge & Logo */}
        <div className="flex flex-col items-center justify-center gap-1.5 mb-2">
          <img
            src="/assets/pawty-logo-full.png"
            alt="Pawty"
            className="h-10 w-auto object-contain"
          />
          <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-[#FF6F61]/15 text-[#FF6F61] text-[11px] font-bold uppercase tracking-wider font-mono">
            <Sparkles className="w-3 h-3" />
            <span>Khớp Lệnh Tuyệt Đối!</span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-fredoka text-2xl font-black text-slate-900 leading-tight">
          Hú hồn! Boss Đã Match! 🎉🐾
        </h3>
        <p className="text-xs text-slate-600 mt-1 px-2 font-medium">
          Cả 2 Sen đều đã phải lòng nhau. Mau set lịch dắt Boss đi dạo công viên nào!
        </p>

        {/* Avatar Bump Animation */}
        <div className="relative flex items-center justify-center my-6">
          {/* Current Pet */}
          <div className="relative z-10 w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden -mr-4 transform -rotate-6 hover:rotate-0 transition-transform">
            <img
              src={currentPet.avatarUrl}
              alt={currentPet.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] font-bold py-0.5 truncate px-1">
              {currentPet.name}
            </div>
          </div>

          {/* Central Heart Badge */}
          <div className="relative z-20 w-11 h-11 rounded-full bg-gradient-to-tr from-[#FF6F61] to-[#FF9A8B] text-white flex items-center justify-center shadow-lg border-2 border-white animate-bounce">
            <Heart className="w-5 h-5 fill-current" />
          </div>

          {/* Matched Pet */}
          <div className="relative z-10 w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden -ml-4 transform rotate-6 hover:rotate-0 transition-transform">
            <img
              src={matchedPet.avatarUrl}
              alt={matchedPet.name}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[10px] font-bold py-0.5 truncate px-1">
              {matchedPet.name}
            </div>
          </div>
        </div>

        {/* Distance & Info */}
        <div className="bg-[#A3E4D7]/20 border border-[#A3E4D7]/50 rounded-2xl p-2.5 mb-5 text-xs text-slate-700 flex items-center justify-center gap-2">
          <span>📍</span>
          <span>
            <strong>{matchedPet.name}</strong> ({matchedPet.breed}) • Cách bạn {matchedPet.distanceMeters || 280}m ({matchedPet.condoComplex})
          </span>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2.5">
          <button
            onClick={handleOpenChat}
            className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-[#FF6F61] to-[#E85B4E] hover:from-[#E85B4E] hover:to-[#FF6F61] text-white font-fredoka font-bold text-sm shadow-lg shadow-[#FF6F61]/35 flex items-center justify-center gap-2 transition-all active:scale-95 cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-white/20" />
            <span>Nhắn Tin & Hẹn Dạo Ngay</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-semibold text-xs transition-colors"
          >
            Quẹt tiếp tìm thêm bạn
          </button>
        </div>
      </div>
    </div>
  );
};
