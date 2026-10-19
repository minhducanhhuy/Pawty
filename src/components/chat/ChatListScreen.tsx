import React from 'react';
import { useApp } from '../../context/AppContext';
import { ChatRoomScreen } from './ChatRoomScreen';
import { MessageSquare, Calendar, Flame, ChevronRight, Sparkles } from 'lucide-react';

export const ChatListScreen: React.FC = () => {
  const {
    chatRooms,
    selectedChatRoomId,
    setSelectedChatRoomId,
    setActiveTab,
  } = useApp();

  // If a chat room is selected, render the chat room screen
  if (selectedChatRoomId) {
    return (
      <ChatRoomScreen
        roomId={selectedChatRoomId}
        onBack={() => setSelectedChatRoomId(null)}
      />
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-[#FDFBF7]">
      {/* Header */}
      <header className="shrink-0 px-4 py-3 bg-white/80 backdrop-blur border-b border-slate-100 flex items-center justify-between">
        <div>
          <h2 className="font-fredoka text-lg font-bold text-slate-900 flex items-center gap-1.5">
            <span>Tin Nhắn & Hẹn Dạo</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#A3E4D7]/30 text-emerald-900 font-mono">
              {chatRooms.length}
            </span>
          </h2>
          <p className="text-[11px] text-slate-500">Chốt lịch dắt Boss đi dạo nội khu</p>
        </div>
      </header>

      {/* Chat Room List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {chatRooms.length > 0 ? (
          chatRooms.map((room) => {
            const pet = room.matchPet;
            return (
              <div
                key={room.id}
                onClick={() => setSelectedChatRoomId(room.id)}
                className="p-3 rounded-2xl bg-white hover:bg-slate-50 border border-slate-200/80 shadow-2xs cursor-pointer transition-all flex items-center gap-3 group active:scale-[0.99]"
              >
                {/* Pet Avatar with online indicator */}
                <div className="relative shrink-0">
                  <div className="w-13 h-13 rounded-2xl overflow-hidden border-2 border-white shadow-xs">
                    <img src={pet.avatarUrl} alt={pet.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 ring-2 ring-white" />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900 truncate font-fredoka flex items-center gap-1.5">
                      <span>{pet.name}</span>
                      <span className="text-[10px] text-slate-400 font-normal">
                        ({pet.breed})
                      </span>
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono shrink-0">
                      {room.lastMessageTime || 'Hôm nay'}
                    </span>
                  </div>

                  <p className="text-[10px] text-slate-500 truncate mt-0.5">
                    Sen: {pet.ownerName} • {pet.condoComplex}
                  </p>

                  <div className="flex items-center justify-between mt-1">
                    <p className="text-[11px] text-slate-600 truncate max-w-[190px]">
                      {room.lastMessage || 'Bắt đầu cuộc trò chuyện...'}
                    </p>

                    {/* Appointment badge or Unread count */}
                    <div className="flex items-center gap-1 shrink-0">
                      {room.hasAppointment && (
                        <span className="px-1.5 py-0.5 rounded-md bg-[#A3E4D7]/30 text-emerald-900 text-[9px] font-bold flex items-center gap-0.5 border border-[#A3E4D7]/50">
                          <Calendar className="w-2.5 h-2.5 text-emerald-700" />
                          <span>Kèo dạo</span>
                        </span>
                      )}
                      {room.unreadCount > 0 && (
                        <span className="w-4 h-4 rounded-full bg-[#FF6F61] text-white text-[9px] font-bold flex items-center justify-center">
                          {room.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 shrink-0" />
              </div>
            );
          })
        ) : (
          <div className="py-16 text-center text-slate-400 space-y-3">
            <div className="w-14 h-14 rounded-full bg-[#FF6F61]/10 text-2xl flex items-center justify-center mx-auto text-[#FF6F61]">
              💬
            </div>
            <div>
              <h3 className="font-fredoka text-sm font-bold text-slate-800">
                Chưa có cuộc trò chuyện nào
              </h3>
              <p className="text-xs text-slate-500 mt-1 max-w-[200px] mx-auto">
                Hãy mở tab Radar quẹt thẻ để tìm bạn dắt Boss đi dạo nhé!
              </p>
            </div>
            <button
              onClick={() => setActiveTab('radar')}
              className="px-4 py-2 rounded-2xl bg-[#FF6F61] text-white font-fredoka font-bold text-xs shadow-md shadow-[#FF6F61]/25"
            >
              Mở Radar Quẹt Ngay 🐾
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
