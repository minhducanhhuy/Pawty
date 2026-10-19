import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { PetFriendlyPlace, WalkAppointment, PetProfile } from '../../types';
import { PET_FRIENDLY_PLACES } from '../../data/mockData';
import { Calendar, Clock, MapPin, Sparkles, X, Check, Coffee, Trees, PawPrint } from 'lucide-react';

interface WalkSchedulerModalProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: string;
  matchPet: PetProfile;
}

export const WalkSchedulerModal: React.FC<WalkSchedulerModalProps> = ({
  isOpen,
  onClose,
  roomId,
  matchPet,
}) => {
  const { currentPet, createWalkAppointment } = useApp();

  const [selectedTime, setSelectedTime] = useState('Tối nay • 19:30');
  const [selectedPlace, setSelectedPlace] = useState<PetFriendlyPlace>(PET_FRIENDLY_PLACES[0]);
  const [note, setNote] = useState('Mang theo bóng tennis và túi dọn vệ sinh nhé Sen!');

  if (!isOpen) return null;

  const TIME_OPTIONS = [
    'Tối nay • 19:30',
    'Tối nay • 20:15',
    'Tối mai • 19:00',
    'Sáng Chủ Nhật • 07:45',
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newAppointment: WalkAppointment = {
      id: `apt_${Date.now()}`,
      matchId: roomId,
      senderPetId: currentPet.id,
      senderPetName: currentPet.name,
      receiverPetId: matchPet.id,
      receiverPetName: matchPet.name,
      scheduledTime: new Date().toISOString(),
      displayTime: selectedTime,
      place: selectedPlace,
      note: note.trim(),
      status: 'pending',
      createdAt: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
    };

    createWalkAppointment(roomId, newAppointment);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/65 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-t-[32px] sm:rounded-[32px] p-5 shadow-2xl border border-slate-200/80 animate-in slide-in-from-bottom duration-300 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#A3E4D7]/30 text-emerald-950">
              <Calendar className="w-4 h-4 text-emerald-700" />
            </div>
            <div>
              <h3 className="font-fredoka text-base font-bold text-slate-900">
                Lên Lịch Hẹn Dắt Boss
              </h3>
              <p className="text-[10px] text-slate-500">
                Hẹn bạn cùng dạo với <strong>{matchPet.name}</strong>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="py-3 space-y-4">
          {/* Time Selector */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5 flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-[#FF6F61]" />
              <span>Thời gian đi dạo</span>
            </label>
            <div className="grid grid-cols-2 gap-1.5">
              {TIME_OPTIONS.map((time) => {
                const isSelected = selectedTime === time;
                return (
                  <button
                    key={time}
                    type="button"
                    onClick={() => setSelectedTime(time)}
                    className={`p-2 rounded-xl text-[11px] font-bold transition-all border text-left flex items-center justify-between ${
                      isSelected
                        ? 'bg-[#FF6F61] border-[#FF6F61] text-white shadow-xs'
                        : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                    }`}
                  >
                    <span>{time}</span>
                    {isSelected && <Check className="w-3.5 h-3.5" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Place Selection (Gợi ý trung điểm tự động) */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#A3E4D7]" />
                <span>Địa điểm hẹn (Gợi ý tự động)</span>
              </label>
              <span className="text-[10px] text-emerald-700 font-bold bg-[#A3E4D7]/20 px-2 py-0.5 rounded-md">
                Trung điểm 2 Boss
              </span>
            </div>

            <div className="space-y-2">
              {PET_FRIENDLY_PLACES.map((place) => {
                const isSelected = selectedPlace.id === place.id;
                return (
                  <div
                    key={place.id}
                    onClick={() => setSelectedPlace(place)}
                    className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex items-center gap-3 ${
                      isSelected
                        ? 'bg-[#E8F8F5] border-[#48C4B0] ring-1 ring-[#48C4B0] shadow-2xs'
                        : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <img
                      src={place.thumbnailUrl}
                      alt={place.name}
                      className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-200"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 truncate">
                          {place.name}
                        </h4>
                        <span className="text-[10px] font-bold text-slate-500 font-mono">
                          ~{place.distanceMeters}m
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5">{place.address}</p>
                      <div className="flex items-center gap-1 mt-1">
                        {place.highlights.slice(0, 1).map((h, i) => (
                          <span
                            key={i}
                            className="text-[9px] text-emerald-800 bg-white/80 px-1.5 py-0.2 rounded border border-emerald-200 font-medium"
                          >
                            ✓ {h}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Note */}
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">
              Ghi chú cho bạn Sen
            </label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="VD: Mang theo dây dắt yếm, bánh thưởng..."
              className="w-full p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF6F61]/30 focus:border-[#FF6F61]"
            />
          </div>

          {/* Anti-flake pledge notice */}
          <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 text-[10px] text-slate-600 space-y-0.5">
            <p className="font-bold text-slate-700 flex items-center gap-1">
              <span>🛡️</span>
              <span>Cơ chế bảo vệ văn minh cộng đồng</span>
            </p>
            <p>
              Nếu bùng hẹn không lý do 2 lần trong tuần, tài khoản sẽ bị tạm khóa quẹt thẻ 3 ngày.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-3 rounded-2xl bg-gradient-to-r from-[#FF6F61] to-[#E85B4E] text-white font-fredoka font-bold text-xs shadow-md shadow-[#FF6F61]/25 active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <PawPrint className="w-4 h-4" />
            <span>Gửi Lời Mời Hẹn Dạo Phố</span>
          </button>
        </form>
      </div>
    </div>
  );
};
