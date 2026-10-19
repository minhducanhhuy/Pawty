import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PetMoment } from '../../types';
import { UploadMomentModal } from '../profile/UploadMomentModal';
import { Heart, Plus, Camera, Sparkles, MapPin, MessageCircle, X } from 'lucide-react';

export const MomentsFeedScreen: React.FC = () => {
  const {
    moments,
    currentPet,
    toggleLikeMoment,
    user,
    setIsVipModalOpen,
  } = useApp();

  const [filterMode, setFilterMode] = useState<'all' | 'mine'>('all');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedMoment, setSelectedMoment] = useState<PetMoment | null>(null);

  const displayedMoments =
    filterMode === 'mine'
      ? moments.filter((m) => m.petId === currentPet.id)
      : moments;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#FDFBF7]">
      {/* Header */}
      <header className="shrink-0 px-4 py-3 bg-white/80 backdrop-blur border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="font-fredoka text-lg font-bold text-slate-900 flex items-center gap-1.5">
            <span>Nhật Ký Khoảnh Khắc</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#FF6F61]/15 text-[#FF6F61] font-mono">
              {displayedMoments.length}
            </span>
          </h2>
          <p className="text-[11px] text-slate-500">Flex ảnh bựa & kết nối cộng đồng Boss</p>
        </div>

        <button
          onClick={() => setIsUploadOpen(true)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-2xl bg-gradient-to-r from-[#FF6F61] to-[#E85B4E] text-white text-xs font-fredoka font-bold shadow-md shadow-[#FF6F61]/25 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Đăng Ảnh</span>
        </button>
      </header>

      {/* Filter Segment */}
      <div className="px-4 py-2 bg-slate-50/80 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setFilterMode('all')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              filterMode === 'all'
                ? 'bg-[#FF6F61] text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            Cộng Đồng Nội Khu
          </button>
          <button
            onClick={() => setFilterMode('mine')}
            className={`px-3 py-1 rounded-xl text-xs font-bold transition-all ${
              filterMode === 'mine'
                ? 'bg-[#A3E4D7] text-emerald-950 shadow-2xs'
                : 'text-slate-600 hover:bg-slate-200/60'
            }`}
          >
            Boss {currentPet.name}
          </button>
        </div>

        {!user.isVip && (
          <button
            onClick={() => setIsVipModalOpen(true)}
            className="text-[10px] text-amber-700 font-bold bg-amber-50 px-2 py-1 rounded-lg border border-amber-200 hover:bg-amber-100 transition-colors"
          >
            👑 Mở kho VIP
          </button>
        )}
      </div>

      {/* 3-Column Grid */}
      <div className="flex-1 overflow-y-auto p-3">
        {displayedMoments.length > 0 ? (
          <div className="grid grid-cols-3 gap-2">
            {displayedMoments.map((moment) => (
              <div
                key={moment.id}
                onClick={() => setSelectedMoment(moment)}
                className="relative aspect-square rounded-2xl overflow-hidden cursor-pointer group shadow-2xs border border-slate-100 bg-slate-200"
              >
                <img
                  src={moment.mediaUrl}
                  alt={moment.caption}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />

                {/* Heart counter badge */}
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
          <div className="py-16 text-center text-slate-400 space-y-3">
            <Camera className="w-12 h-12 mx-auto text-slate-300" />
            <p className="text-xs font-semibold">Chưa có khoảnh khắc nào</p>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="text-xs text-[#FF6F61] font-bold hover:underline font-fredoka"
            >
              + Đăng ảnh bựa đầu tiên ngay
            </button>
          </div>
        )}
      </div>

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
