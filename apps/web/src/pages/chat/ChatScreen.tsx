import React, { useMemo, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Check,
  FileText,
  MapPin,
  MessageSquarePlus,
  Search,
  Send,
  X,
} from "lucide-react";
import { usePawtyStore } from "../../stores/usePawtyStore";
import { WEB_THEMES } from "../../mocks/seedData";

type ChatCategoryFilter = "all" | "unread" | "circle" | "friends" | "services";

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
    searchableUsers,
    startChatWithUserTag,
    themeId,
  } = usePawtyStore();

  const theme = WEB_THEMES[themeId] ?? WEB_THEMES.coral;

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] =
    useState<ChatCategoryFilter>("all");
  const [draftText, setDraftText] = useState("");

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId,
  );

  const filteredConversations = useMemo(() => {
    return conversations.filter((conv) => {
      if (categoryFilter === "unread" && conv.unreadCount === 0) return false;
      if (categoryFilter === "circle" && conv.type !== "circle") return false;
      if (
        categoryFilter === "services" &&
        !conv.id.includes("partner") &&
        !conv.title.toLowerCase().includes("spa")
      )
        return false;
      if (
        categoryFilter === "friends" &&
        (conv.type === "circle" || conv.id.includes("partner"))
      )
        return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          conv.title.toLowerCase().includes(q) ||
          conv.subtitle.toLowerCase().includes(q) ||
          conv.lastMessageText.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [conversations, categoryFilter, searchQuery]);

  const matchingFriends = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return searchableUsers.filter(
      (u) =>
        u.displayName.toLowerCase().includes(q) ||
        u.tag.toLowerCase().includes(q) ||
        u.petsSummary.toLowerCase().includes(q),
    );
  }, [searchableUsers, searchQuery]);

  if (!activeConversation) {
    const unreadTotal = conversations.reduce(
      (sum, c) => sum + c.unreadCount,
      0,
    );

    return (
      <div className="p-4 pb-6 space-y-3.5">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 style={{ color: theme.text }} className="text-base font-bold">
              Tin nhắn & Trò chuyện
            </h1>
            <p style={{ color: theme.textSoft }} className="text-xs">
              Tìm theo tên bạn bè, @tag hoặc lọc tin nhắn chưa đọc
            </p>
          </div>
          <button
            onClick={() => usePawtyStore.getState().setActiveTab("tinder")}
            style={{
              backgroundColor: theme.primarySoft,
              color: theme.primary,
            }}
            className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1"
          >
            <span>Qua mục Hẹn hò</span>
          </button>
        </div>

        {/* Friend & Message Search Bar */}
        <div
          style={{ backgroundColor: theme.surface, borderColor: theme.border }}
          className="flex items-center px-3.5 py-2.5 rounded-2xl border"
        >
          <Search
            style={{ color: theme.textSoft }}
            className="w-4 h-4 shrink-0 mr-2"
          />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm bạn bè theo tên, @tag hoặc nội dung..."
            style={{ color: theme.text }}
            className="w-full bg-transparent text-xs font-medium focus:outline-none"
          />
          {searchQuery.length > 0 && (
            <button
              onClick={() => setSearchQuery("")}
              style={{ color: theme.textSoft }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Single-Row 5-Category Filter Bar (Fits 100% in 1 row) */}
        <div
          style={{ backgroundColor: theme.surface, borderColor: theme.border }}
          className="grid grid-cols-5 gap-1 p-1 rounded-2xl border"
        >
          {[
            { id: "all", label: "Tất cả" },
            {
              id: "unread",
              label: unreadTotal > 0 ? `Chưa đọc (${unreadTotal})` : "Chưa đọc",
            },
            { id: "circle", label: "Cùng chăm" },
            { id: "friends", label: "Bạn bè" },
            { id: "services", label: "Dịch vụ" },
          ].map((tab) => {
            const active = categoryFilter === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setCategoryFilter(tab.id as ChatCategoryFilter)}
                style={{
                  backgroundColor: active ? theme.primary : "transparent",
                  color: active ? "#FFFFFF" : theme.textSoft,
                }}
                className="py-1.5 px-1 rounded-xl text-[11px] font-bold text-center truncate transition-colors"
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Matching Friends from @tag User Directory */}
        {matchingFriends.length > 0 && (
          <div
            style={{
              backgroundColor: theme.surface,
              borderColor: theme.border,
            }}
            className="p-3 rounded-2xl border space-y-2"
          >
            <p
              style={{ color: theme.textSoft }}
              className="text-[11px] font-bold uppercase tracking-wider"
            >
              Bạn bè tìm thấy trong danh bạ Pawty
            </p>
            {matchingFriends.map((friend) => (
              <div
                key={friend.id}
                style={{ backgroundColor: theme.bg, borderColor: theme.border }}
                className="p-2.5 rounded-xl border flex items-center justify-between gap-2"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={friend.avatarUrl}
                    alt={friend.displayName}
                    className="w-9 h-9 rounded-full object-cover shrink-0"
                  />
                  <div className="min-w-0">
                    <p
                      style={{ color: theme.text }}
                      className="text-xs font-bold truncate"
                    >
                      {friend.displayName}{" "}
                      <span style={{ color: theme.primary }}>{friend.tag}</span>
                    </p>
                    <p
                      style={{ color: theme.textSoft }}
                      className="text-[11px] truncate"
                    >
                      {friend.petsSummary} · {friend.area}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    startChatWithUserTag(friend.tag);
                    setSearchQuery("");
                  }}
                  style={{ backgroundColor: theme.primary }}
                  className="px-2.5 py-1.5 rounded-lg text-white text-xs font-bold flex items-center gap-1 shrink-0"
                >
                  <MessageSquarePlus className="w-3.5 h-3.5" />
                  <span>Nhắn tin</span>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Conversations List */}
        {filteredConversations.length === 0 ? (
          <div
            style={{
              backgroundColor: theme.surface,
              borderColor: theme.border,
            }}
            className="p-6 rounded-2xl border text-center space-y-2"
          >
            <p style={{ color: theme.text }} className="text-xs font-bold">
              Không có cuộc trò chuyện phù hợp
            </p>
            <p style={{ color: theme.textSoft }} className="text-xs">
              Thử chọn mục "Tất cả" hoặc tìm theo @tag bạn bè.
            </p>
            {categoryFilter !== "all" && (
              <button
                onClick={() => setCategoryFilter("all")}
                style={{ backgroundColor: theme.primary }}
                className="px-3.5 py-1.5 rounded-xl text-white text-xs font-bold mt-1"
              >
                Hiện tất cả tin nhắn
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredConversations.map((conv) => (
              <button
                key={conv.id}
                onClick={() => setActiveConversationId(conv.id)}
                style={{
                  backgroundColor: theme.surface,
                  borderColor:
                    conv.unreadCount > 0 ? theme.primary : theme.border,
                }}
                className="w-full p-3.5 rounded-2xl border flex items-center justify-between gap-3 text-left transition-all hover:opacity-95"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={conv.avatarUrl}
                      alt={conv.title}
                      className="w-11 h-11 rounded-full object-cover"
                    />
                    {conv.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-white" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p
                        style={{ color: theme.text }}
                        className="text-xs font-bold truncate"
                      >
                        {conv.title}
                      </p>
                      {conv.type === "circle" && (
                        <span
                          style={{
                            backgroundColor: theme.primarySoft,
                            color: theme.primary,
                          }}
                          className="text-[10px] font-bold px-1.5 py-0.5 rounded-md"
                        >
                          Cùng chăm
                        </span>
                      )}
                    </div>
                    <p
                      style={{ color: theme.textSoft }}
                      className="text-[11px] truncate"
                    >
                      {conv.subtitle}
                    </p>
                    <p
                      style={{
                        color:
                          conv.unreadCount > 0 ? theme.text : theme.textSoft,
                      }}
                      className={`text-xs truncate mt-0.5 ${
                        conv.unreadCount > 0 ? "font-bold" : "font-normal"
                      }`}
                    >
                      {conv.lastMessageText}
                    </p>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span
                    style={{ color: theme.textSoft }}
                    className="text-[10px]"
                  >
                    {conv.lastMessageAt}
                  </span>
                  {conv.unreadCount > 0 && (
                    <span
                      style={{ backgroundColor: theme.primary }}
                      className="min-w-[18px] h-[18px] px-1 rounded-full text-white text-[10px] font-bold flex items-center justify-center"
                    >
                      {conv.unreadCount}
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    );
  }

  const messages = messagesByConversation[activeConversation.id] || [];

  return (
    <div className="flex flex-col h-full min-h-[680px] justify-between">
      {/* Conversation Header */}
      <div
        style={{ backgroundColor: theme.surface, borderColor: theme.border }}
        className="px-4 py-3 border-b flex items-center justify-between gap-2 sticky top-0 z-20"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <button
            onClick={() => setActiveConversationId(null)}
            style={{ color: theme.text }}
            className="p-1.5 rounded-xl hover:opacity-75"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <img
            src={activeConversation.avatarUrl}
            alt={activeConversation.title}
            className="w-9 h-9 rounded-full object-cover"
          />
          <div className="min-w-0">
            <p
              style={{ color: theme.text }}
              className="text-xs font-bold truncate"
            >
              {activeConversation.title}
            </p>
            <p
              style={{ color: theme.textSoft }}
              className="text-[10px] truncate"
            >
              {activeConversation.subtitle}
            </p>
          </div>
        </div>

        <span
          style={{ backgroundColor: theme.primarySoft, color: theme.primary }}
          className="px-2.5 py-1 rounded-xl text-[11px] font-bold shrink-0"
        >
          Bạn bè & Tương hợp
        </span>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-4 space-y-3 overflow-y-auto">
        {messages.map((msg) => {
          const isMe = msg.senderId === user.id;

          if (msg.messageType === "walk_invite") {
            const apt =
              walkAppointments.find((w) => w.id === msg.walkAppointmentId) ??
              walkAppointments[0];
            return (
              <div
                key={msg.id}
                style={{
                  backgroundColor: theme.surface,
                  borderColor: theme.primary,
                }}
                className="p-3.5 rounded-2xl border space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span
                    style={{ color: theme.primary }}
                    className="text-xs font-bold uppercase"
                  >
                    Lời hẹn đi dạo chung
                  </span>
                  <span
                    style={{
                      backgroundColor: theme.primarySoft,
                      color: theme.primary,
                    }}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                  >
                    {apt?.status === "confirmed"
                      ? "Đã xác nhận"
                      : "Chờ xác nhận"}
                  </span>
                </div>
                <p
                  style={{ color: theme.text }}
                  className="text-xs font-bold flex items-center gap-1"
                >
                  <MapPin
                    style={{ color: theme.primary }}
                    className="w-3.5 h-3.5"
                  />
                  <span>{apt?.locationName || "Công viên nội khu"}</span>
                </p>
                <p style={{ color: theme.textSoft }} className="text-[11px]">
                  {apt?.scheduledDate} · {apt?.scheduledTime}
                </p>

                {apt?.status !== "confirmed" && (
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() =>
                        apt && updateWalkAppointmentStatus(apt.id, "confirmed")
                      }
                      style={{ backgroundColor: theme.primary }}
                      className="flex-1 py-2 rounded-xl text-white text-xs font-bold flex items-center justify-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Đồng ý lịch hẹn</span>
                    </button>
                  </div>
                )}
              </div>
            );
          }

          if (msg.messageType === "care_handover") {
            return (
              <div
                key={msg.id}
                style={{
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                }}
                className="p-3.5 rounded-2xl border space-y-1.5"
              >
                <p
                  style={{ color: theme.primary }}
                  className="text-xs font-bold"
                >
                  Phiếu bàn giao chăm sóc ({handoverNote.startDate} –{" "}
                  {handoverNote.endDate})
                </p>
                <p style={{ color: theme.text }} className="text-[11px]">
                  <strong>Khẩu phần ăn:</strong>{" "}
                  {handoverNote.feedingInstructions}
                </p>
                <button
                  onClick={() => setActiveModal("handover_note")}
                  style={{ color: theme.primary }}
                  className="text-[11px] font-bold underline"
                >
                  Xem chi tiết phiếu bàn giao
                </button>
              </div>
            );
          }

          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
            >
              <div
                style={{
                  backgroundColor: isMe ? theme.primary : theme.surface,
                  color: isMe ? "#FFFFFF" : theme.text,
                  borderColor: isMe ? theme.primary : theme.border,
                }}
                className="max-w-[82%] px-3.5 py-2.5 rounded-2xl border text-xs leading-relaxed"
              >
                <p>{msg.textContent}</p>
              </div>
              <span
                style={{ color: theme.textSoft }}
                className="text-[10px] mt-0.5 px-1"
              >
                {msg.createdAt}
              </span>
            </div>
          );
        })}
      </div>

      {/* Chat Composer */}
      <div
        style={{ backgroundColor: theme.surface, borderColor: theme.border }}
        className="p-3 border-t flex items-center gap-2 sticky bottom-0"
      >
        <input
          type="text"
          value={draftText}
          onChange={(e) => setDraftText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && draftText.trim()) {
              sendChatMessage(activeConversation.id, draftText);
              setDraftText("");
            }
          }}
          placeholder="Nhập tin nhắn..."
          style={{
            backgroundColor: theme.bg,
            borderColor: theme.border,
            color: theme.text,
          }}
          className="flex-1 px-3.5 py-2.5 rounded-xl border text-xs font-medium focus:outline-none"
        />

        <button
          onClick={() => {
            if (draftText.trim()) {
              sendChatMessage(activeConversation.id, draftText);
              setDraftText("");
            }
          }}
          style={{ backgroundColor: theme.primary }}
          className="px-3.5 py-2.5 rounded-xl text-white text-xs font-bold flex items-center gap-1"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Gửi</span>
        </button>
      </div>
    </div>
  );
};
