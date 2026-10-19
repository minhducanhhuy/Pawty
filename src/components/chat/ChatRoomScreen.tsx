import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { WalkSchedulerModal } from './WalkSchedulerModal';
import { WalkAppointment } from '../../types';
import {
  ArrowLeft,
  Calendar,
  Send,
  MapPin,
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Sparkles
} from 'lucide-react';

interface ChatRoomScreenProps {
  roomId: string;
  onBack: () => void;
}

export const ChatRoomScreen: React.FC<ChatRoomScreenProps> = ({ roomId, onBack }) => {
  const {
    chatRooms,
    currentPet,
    sendMessage,
    respondAppointment,
    setViewingPetProfile,
  } = useApp();

  const [inputText, setInputText] = useState('');
  const [isSchedulerOpen, setIsSchedulerOpen] = useState(false);
  const [showFlakeConfirmId, setShowFlakeConfirmId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const room = chatRooms.find((r) => r.id === roomId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [room?.messages]);

  if (!room) {
    return (
      <div className="flex-1 flex items-center justify-center p-4 text-center">
        <p className="text-xs text-slate-500">Phòng chat không tồn tại hoặc đã bị xóa.</p>
      </div>
    );
  }

  const { matchPet } = room;

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    sendMessage(roomId, inputText.trim());
    setInputText('');
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#F7F5EE] relative">
      {/* Top Header */}
      <header className="shrink-0 px-3 py-2.5 bg-white/95 backdrop-blur border-b border-slate-200/80 flex items-center justify-between z-20 shadow-2xs">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-1.5 -ml-1 text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          {/* Target Pet Avatar & Name */}
          <div
            onClick={() => setViewingPetProfile(matchPet)}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <div className="relative w-9 h-9 rounded-2xl overflow-hidden border border-slate-200">
              <img src={matchPet.avatarUrl} alt={matchPet.name} className="w-full h-full object-cover" />
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
            </div>
            <div>
              <h3 className="font-fredoka text-sm font-bold text-slate-900 group-hover:text-[#FF6F61] transition-colors flex items-center gap-1">
                <span>{matchPet.name}</span>
                <span className="text-[10px] text-slate-400 font-mono">({matchPet.breed})</span>
              </h3>
              <p className="text-[10px] text-slate-500 truncate max-w-[130px]">
                Sen: {matchPet.ownerName} • {matchPet.condoComplex}
              </p>
            </div>
          </div>
        </div>

        {/* Action: Open Walk Scheduler */}
        <button
          onClick={() => setIsSchedulerOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#FF6F61] to-[#E85B4E] hover:from-[#E85B4E] hover:to-[#FF6F61] text-white text-xs font-fredoka font-bold shadow-sm shadow-[#FF6F61]/25 active:scale-95 transition-all cursor-pointer"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Hẹn Đi Dạo</span>
        </button>
      </header>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-0">
        {/* Safe Walk Disclaimer Notice */}
        <div className="text-center my-1">
          <span className="inline-block px-3 py-1 rounded-full bg-slate-200/70 text-slate-600 text-[10px] font-medium font-mono">
            🛡️ Cả 2 Boss đều đã xác minh SĐT & Sổ tiêm phòng
          </span>
        </div>

        {room.messages.map((msg) => {
          const isOwn = msg.isOwn;

          // Check if message is an Interactive Walk Appointment
          if (msg.appointment) {
            const apt: WalkAppointment = msg.appointment;
            const isSender = apt.senderPetId === currentPet.id;

            return (
              <div key={msg.id} className="flex justify-center my-2">
                <div className="w-full max-w-[320px] rounded-3xl bg-white border-2 border-[#A3E4D7] p-4 shadow-md text-slate-800 space-y-3">
                  {/* Appointment Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 font-fredoka">
                      <Calendar className="w-4 h-4 text-emerald-600" />
                      <span>LỜI MỜI HẸN DẮT BOSS DẠO PHỐ</span>
                    </div>
                    {apt.status === 'confirmed' ? (
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        <span>Đã chốt kèo!</span>
                      </span>
                    ) : apt.status === 'rejected' ? (
                      <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold flex items-center gap-1">
                        <XCircle className="w-3 h-3 text-rose-600" />
                        <span>Đã từ chối</span>
                      </span>
                    ) : apt.status === 'reported_flake' ? (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[10px] font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        <span>Báo bùng kèo</span>
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold font-mono">
                        Chờ phản hồi
                      </span>
                    )}
                  </div>

                  {/* Scheduled Place & Time */}
                  <div className="flex gap-3 bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                    <img
                      src={apt.place.thumbnailUrl}
                      alt={apt.place.name}
                      className="w-14 h-14 rounded-xl object-cover shrink-0 border border-slate-200"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-slate-900 truncate font-fredoka">
                        {apt.place.name}
                      </h4>
                      <p className="text-[10px] text-slate-500 truncate mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-[#FF6F61]" />
                        <span>{apt.place.address}</span>
                      </p>
                      <p className="text-[11px] font-bold text-[#FF6F61] mt-1 flex items-center gap-1 font-mono">
                        <Clock className="w-3 h-3" />
                        <span>{apt.displayTime}</span>
                      </p>
                    </div>
                  </div>

                  {/* Note */}
                  {apt.note && (
                    <p className="text-[11px] text-slate-600 italic bg-amber-50/60 p-2 rounded-xl border border-amber-100">
                      💬 "{apt.note}"
                    </p>
                  )}

                  {/* Action Buttons for Pending State */}
                  {apt.status === 'pending' && (
                    <div>
                      {!isSender ? (
                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            onClick={() => respondAppointment(roomId, apt.id, 'rejected')}
                            className="py-2 px-3 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-100 transition-colors"
                          >
                            Để dịp khác
                          </button>
                          <button
                            onClick={() => respondAppointment(roomId, apt.id, 'confirmed')}
                            className="py-2 px-3 rounded-xl bg-gradient-to-r from-[#A3E4D7] to-emerald-400 hover:from-emerald-400 hover:to-[#A3E4D7] text-emerald-950 text-xs font-bold font-fredoka shadow-sm transition-all active:scale-95"
                          >
                            Đồng Ý Kèo! 🐾
                          </button>
                        </div>
                      ) : (
                        <div className="pt-1 text-center">
                          <p className="text-[10px] text-slate-500 italic">
                            Bạn đã gửi lời mời. Đang chờ đối phương xác nhận...
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Confirmed State Actions (Reminder + Report Flake option) */}
                  {apt.status === 'confirmed' && (
                    <div className="pt-1 space-y-2">
                      <div className="p-2 rounded-xl bg-emerald-50 text-[10px] text-emerald-800 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>Pawty sẽ gửi Push Notification nhắc cả 2 trước 15 phút giờ ra đường ⏰</span>
                      </div>

                      {/* Flake Reporting */}
                      <div className="flex items-center justify-end">
                        <button
                          onClick={() => setShowFlakeConfirmId(apt.id)}
                          className="text-[10px] text-slate-400 hover:text-red-500 flex items-center gap-1 underline transition-colors"
                        >
                          <AlertTriangle className="w-3 h-3" />
                          <span>Báo cáo bùng kèo nếu đối phương không đến</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            );
          }

          // Regular Chat Bubble
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isOwn ? 'items-end' : 'items-start'} my-1`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs leading-relaxed shadow-2xs ${
                  isOwn
                    ? 'bg-gradient-to-tr from-[#FF6F61] to-[#FF8E82] text-white rounded-br-2xs'
                    : 'bg-white text-slate-800 border border-slate-200/80 rounded-bl-2xs'
                }`}
              >
                <p>{msg.text}</p>
              </div>
              <span className="text-[9px] text-slate-400 px-1 mt-0.5 font-mono">
                {msg.timestamp}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Flake Confirmation Dialog */}
      {showFlakeConfirmId && (
        <div className="absolute inset-0 z-40 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-[28px] p-5 shadow-2xl border border-red-200 max-w-xs text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h4 className="font-fredoka text-base font-bold text-slate-900">
              Báo Cáo Bùng Kèo?
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Bạn có chắc muốn báo cáo tài khoản này không đến điểm hẹn?
              Nếu bị báo cáo <strong>2 lần/tuần</strong>, tài khoản đó sẽ tự động bị khóa quyền quẹt thẻ trong <strong>3 ngày</strong>.
            </p>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <button
                onClick={() => setShowFlakeConfirmId(null)}
                className="py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  respondAppointment(roomId, showFlakeConfirmId, 'reported_flake');
                  setShowFlakeConfirmId(null);
                }}
                className="py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-xs font-bold font-fredoka shadow-sm shadow-red-500/25"
              >
                Xác Nhận Báo Cáo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Input Bar */}
      <form
        onSubmit={handleSendMessage}
        className="shrink-0 p-2.5 bg-white border-t border-slate-200/80 flex items-center gap-2 z-20"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={`Nhắn tin với Sen ${matchPet.name}...`}
          className="flex-1 px-3.5 py-2.5 rounded-full bg-slate-100 border border-slate-200 text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#FF6F61]/30 focus:border-[#FF6F61] transition-all"
        />
        <button
          type="submit"
          disabled={!inputText.trim()}
          className="w-9 h-9 rounded-full bg-[#FF6F61] hover:bg-[#E85B4E] disabled:opacity-40 text-white flex items-center justify-center shadow-sm shadow-[#FF6F61]/30 transition-transform active:scale-95 cursor-pointer shrink-0"
        >
          <Send className="w-4 h-4 ml-0.5" />
        </button>
      </form>

      {/* Scheduler Modal */}
      <WalkSchedulerModal
        isOpen={isSchedulerOpen}
        onClose={() => setIsSchedulerOpen(false)}
        roomId={roomId}
        matchPet={matchPet}
      />
    </div>
  );
};
