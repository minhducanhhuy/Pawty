import React, { useRef, useState } from 'react';
import {
  AlertTriangle,
  ArrowLeft,
  Calendar,
  Check,
  FileText,
  MapPin,
  Mic,
  Paperclip,
  Send,
  Volume2,
} from 'lucide-react';
import { usePawtyStore } from '../../stores/usePawtyStore';

export const ChatScreen: React.FC = () => {
  const {
    user,
    conversations,
    activeConversationId,
    setActiveConversationId,
    messagesByConversation,
    sendChatMessage,
    walkAppointments,
    updateWalkAppointmentStatus,
    handoverNote,
    setActiveModal,
    showToast,
  } = usePawtyStore();

  const [draftText, setDraftText] = useState('');
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  const handleToggleVoiceRecord = async () => {
    if (!activeConversationId) return;

    if (isRecordingVoice) {
      setIsRecordingVoice(false);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stop();
      } else {
        sendChatMessage(
          activeConversationId,
          '🎤 Ghi âm giọng nói dặn dò chăm Boss (0:06s)',
          'voice',
          { voiceDurationSec: 6 }
        );
      }
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      audioChunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioUrl = URL.createObjectURL(audioBlob);
        sendChatMessage(
          activeConversationId,
          '🎤 Tin nhắn thoại ghi âm trực tiếp',
          'voice',
          { mediaUrl: audioUrl, voiceDurationSec: 5 }
        );
        stream.getTracks().forEach((track) => track.stop());
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecordingVoice(true);
      showToast('Đang thu âm giọng nói 🎤', 'Nhấn lại nút Micro để dừng và gửi.');
    } catch {
      // Fallback mock if browser microphone permission is denied in automated headless browsers
      setIsRecordingVoice(true);
      showToast('Đang thu âm giả lập 🎤', 'Nhấn lại nút Micro để hoàn tất gửi.');
    }
  };

  if (!activeConversation) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-xl font-bold text-[#2D3436]">Tin nhắn & Phối hợp</h1>
            <p className="text-xs text-stone-500">
              Vòng chăm sóc (Circle), bạn dắt dạo & đối tác xác minh
            </p>
          </div>
          <button
            onClick={() => setActiveModal('handover_note')}
            className="px-3 py-1.5 rounded-xl bg-[#A3E4D7]/40 text-teal-950 text-xs font-bold flex items-center gap-1"
          >
            <FileText className="w-3.5 h-3.5" /> Phiếu bàn giao
          </button>
        </div>

        <div className="space-y-2.5">
          {conversations.map((conv) => (
            <button
              key={conv.id}
              onClick={() => setActiveConversationId(conv.id)}
              className="w-full p-3.5 rounded-3xl bg-white border border-stone-200/80 hover:border-[#FF6F61] transition-all flex items-center justify-between gap-3 text-left shadow-2xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="relative shrink-0">
                  <img
                    src={conv.avatarUrl}
                    alt={conv.title}
                    className="w-12 h-12 rounded-2xl object-cover"
                  />
                  {conv.isOnline && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-teal-500 border-2 border-white" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-extrabold text-[#2D3436] truncate">{conv.title}</p>
                    {conv.type === 'circle' && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#A3E4D7]/50 text-teal-950">
                        Circle
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-stone-400 truncate">{conv.subtitle}</p>
                  <p className="text-xs text-stone-600 truncate mt-0.5 font-medium">
                    {conv.lastMessageText}
                  </p>
                </div>
              </div>

              <div className="flex flex-col items-end gap-1 shrink-0">
                <span className="text-[10px] text-stone-400">{conv.lastMessageAt}</span>
                {conv.unreadCount > 0 && (
                  <span className="w-5 h-5 rounded-full bg-[#FF6F61] text-white text-[10px] font-bold flex items-center justify-center">
                    {conv.unreadCount}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  const messages = messagesByConversation[activeConversation.id] || [];

  return (
    <div className="flex flex-col h-full min-h-[700px] justify-between">
      {/* Chat Header */}
      <div className="px-4 py-3 bg-white border-b border-stone-200/80 flex items-center justify-between gap-2 sticky top-0 z-20">
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={() => setActiveConversationId(null)}
            className="p-1.5 rounded-xl hover:bg-stone-100 text-stone-600"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <img
            src={activeConversation.avatarUrl}
            alt={activeConversation.title}
            className="w-9 h-9 rounded-full object-cover"
          />
          <div className="min-w-0">
            <p className="text-xs font-extrabold text-[#2D3436] truncate">
              {activeConversation.title}
            </p>
            <p className="text-[10px] text-teal-700 font-semibold">
              🐕 Online · {activeConversation.subtitle}
            </p>
          </div>
        </div>

        <button
          onClick={() => setActiveModal('walk_scheduler')}
          className="px-3 py-1.5 rounded-xl bg-[#FF6F61] text-white text-xs font-bold flex items-center gap-1 shrink-0 shadow-xs"
        >
          <Calendar className="w-3.5 h-3.5" /> Hẹn dạo
        </button>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {messages.map((msg) => {
          const isMe = msg.senderId === user.id;

          if (msg.messageType === 'walk_invite') {
            const apt =
              walkAppointments.find((w) => w.id === msg.walkAppointmentId) ?? walkAppointments[0];
            return (
              <div
                key={msg.id}
                className="p-4 rounded-3xl bg-gradient-to-br from-[#A3E4D7]/35 to-white border-2 border-[#A3E4D7] shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-teal-950 uppercase tracking-wide">
                    📅 HẸN DẮT DẠO TRUNG ĐIỂM
                  </span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white text-teal-900">
                    {apt?.status === 'confirmed'
                      ? '✓ Đã xác nhận'
                      : apt?.status === 'no_show'
                      ? '⚠️ Đã báo bùng kèo'
                      : '⏳ Chờ xác nhận'}
                  </span>
                </div>
                <p className="text-xs font-bold text-[#2D3436] flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#FF6F61]" />
                  {apt?.locationName || 'Công viên Gia Định'}
                </p>
                <p className="text-[11px] text-stone-600">
                  📅 {apt?.scheduledDate} · {apt?.scheduledTime} · 🐕 {apt?.petNames.join(' + ')}
                </p>
                {apt?.note && (
                  <p className="text-[11px] italic text-stone-500">"{apt.note}"</p>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={() => apt && updateWalkAppointmentStatus(apt.id, 'confirmed')}
                    className="flex-1 py-2 rounded-xl bg-[#FF6F61] text-white text-xs font-bold flex items-center justify-center gap-1"
                  >
                    <Check className="w-3.5 h-3.5" /> Chấp nhận
                  </button>
                  <button
                    onClick={() => setActiveModal('walk_scheduler')}
                    className="px-3 py-2 rounded-xl bg-white border border-stone-200 text-xs font-bold text-stone-700"
                  >
                    Đổi giờ
                  </button>
                  <button
                    onClick={() => apt && updateWalkAppointmentStatus(apt.id, 'no_show')}
                    title="Báo cáo đối phương không đến điểm hẹn (Anti-Flake)"
                    className="p-2 rounded-xl bg-red-50 text-red-600 border border-red-200"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          }

          if (msg.messageType === 'care_handover') {
            return (
              <div
                key={msg.id}
                className="p-3.5 rounded-3xl bg-amber-50 border border-amber-200 space-y-1.5"
              >
                <p className="text-xs font-extrabold text-amber-950">
                  📋 PHIẾU BÀN GIAO CHĂM SÓC ({handoverNote.startDate} – {handoverNote.endDate})
                </p>
                <p className="text-[11px] text-amber-900">
                  <strong>Khẩu phần ăn:</strong> {handoverNote.feedingInstructions}
                </p>
                <p className="text-[11px] text-amber-900">
                  <strong>Thú y khẩn cấp:</strong> {handoverNote.emergencyVetContact}
                </p>
                <button
                  onClick={() => setActiveModal('handover_note')}
                  className="text-[11px] font-bold text-[#FF6F61] underline"
                >
                  Mở Checklist bàn giao chi tiết →
                </button>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl text-xs leading-relaxed ${
                  isMe
                    ? 'bg-[#FF6F61] text-white rounded-br-xs shadow-xs'
                    : 'bg-white text-[#2D3436] border border-stone-200/80 rounded-bl-xs'
                }`}
              >
                {msg.messageType === 'voice' ? (
                  <div className="flex items-center gap-2">
                    <Volume2 className="w-4 h-4 shrink-0" />
                    <span>{msg.textContent}</span>
                    {msg.mediaUrl && (
                      <audio controls src={msg.mediaUrl} className="h-6 max-w-[140px]" />
                    )}
                  </div>
                ) : (
                  <p>{msg.textContent}</p>
                )}
              </div>
              <span className="text-[10px] text-stone-400 mt-0.5 px-1">{msg.createdAt}</span>
            </div>
          );
        })}
      </div>

      {/* Chat Composer */}
      <div className="p-3 bg-white border-t border-stone-200/80 flex items-center gap-2 sticky bottom-0">
        <button
          onClick={() => setActiveModal('handover_note')}
          title="Đính kèm phiếu bàn giao chăm sóc"
          className="p-2 rounded-xl bg-stone-100 text-stone-600 hover:bg-stone-200"
        >
          <Paperclip className="w-4 h-4" />
        </button>

        <button
          onClick={handleToggleVoiceRecord}
          title="Thu âm tin nhắn thoại"
          className={`p-2 rounded-xl transition-colors ${
            isRecordingVoice
              ? 'bg-red-600 text-white animate-pulse'
              : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          }`}
        >
          <Mic className="w-4 h-4" />
        </button>

        <input
          type="text"
          value={draftText}
          onChange={(e) => setDraftText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && draftText.trim()) {
              sendChatMessage(activeConversation.id, draftText);
              setDraftText('');
            }
          }}
          placeholder="Nhập tin nhắn..."
          className="flex-1 px-3.5 py-2.5 rounded-2xl bg-stone-100 text-xs font-medium focus:outline-none"
        />

        <button
          onClick={() => {
            if (draftText.trim()) {
              sendChatMessage(activeConversation.id, draftText);
              setDraftText('');
            }
          }}
          className="px-3.5 py-2.5 rounded-2xl bg-[#FF6F61] text-white text-xs font-bold flex items-center gap-1 shadow-xs"
        >
          <Send className="w-3.5 h-3.5" /> Gửi
        </button>
      </div>
    </div>
  );
};

