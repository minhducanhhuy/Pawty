import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Keyboard,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '../components/FeatherIcon';
import { useMobilePawty } from '../context/MobilePawtyContext';

export const MobileChatScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<any>(null);

  const {
    theme,
    chats,
    activeChatId,
    setActiveChatId,
    sendChatMessage,
    openPublicUserProfile,
    setActiveTab,
  } = useMobilePawty();

  const [messageDraft, setMessageDraft] = useState('');
  const [searchFriend, setSearchFriend] = useState('');
  const [chatFilter, setChatFilter] = useState<'all' | 'unread' | 'tinder' | 'service'>('all');

  const activeChat = chats.find((c) => c.id === activeChatId) || null;

  // Tự động cuộn xuống tin nhắn cuối cùng khi mở cuộc trò chuyện
  useEffect(() => {
    if (activeChat) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      }, 80);
    }
  }, [activeChatId]);

  // Tự động cuộn xuống khi bàn phím ảo xuất hiện
  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 60);
      }
    );
    return () => {
      showSub.remove();
    };
  }, []);

  const handleSendMessage = () => {
    const text = messageDraft.trim();
    if (!text || !activeChat) return;
    sendChatMessage(activeChat.id, text);
    setMessageDraft('');
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 60);
  };

  const filteredChats = chats.filter((room) => {
    const q = searchFriend.trim().toLowerCase();
    const matchName =
      !q ||
      room.partnerName.toLowerCase().includes(q) ||
      room.partnerHandle.toLowerCase().includes(q) ||
      room.petSummary.toLowerCase().includes(q);
    if (chatFilter === 'unread') {
      return matchName && room.unreadCount > 0;
    }
    if (chatFilter === 'tinder') {
      return matchName && room.matchSource === 'tinder_match';
    }
    if (chatFilter === 'service') {
      return matchName && room.matchSource === 'service';
    }
    return matchName;
  });

  if (activeChat) {
    return (
      <KeyboardAvoidingView
        style={[styles.chatDetailContainer, { backgroundColor: theme.bg }]}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
      >
        <View style={[styles.chatHeader, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <TouchableOpacity
            onPress={() => setActiveChatId(null)}
            style={[styles.backBtn, { backgroundColor: theme.bg }]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="arrow-left" size={18} color={theme.text} />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.partnerTouchRow}
            onPress={() => openPublicUserProfile(activeChat.partnerHandle)}
          >
            <Image source={{ uri: activeChat.partnerAvatar }} style={styles.headerAvatar} />
            <View style={{ flex: 1 }}>
              <View style={styles.partnerTitleRow}>
                <Text style={[styles.headerName, { color: theme.text }]}>
                  {activeChat.partnerName}
                </Text>
                {activeChat.matchSource === 'tinder_match' && (
                  <View style={[styles.matchTag, { backgroundColor: theme.primarySoft }]}>
                    <Feather name="heart" size={10} color={theme.primary} />
                    <Text style={[styles.matchTagText, { color: theme.primary }]}>Kết nối</Text>
                  </View>
                )}
                {activeChat.matchSource === 'service' && (
                  <View style={[styles.matchTag, { backgroundColor: '#EAF7F1' }]}>
                    <Feather name="briefcase" size={10} color="#2E7D5B" />
                    <Text style={[styles.matchTagText, { color: '#2E7D5B' }]}>Dịch vụ</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.headerSub, { color: theme.textMuted }]} numberOfLines={1}>
                {activeChat.petSummary} · {activeChat.distanceLabel}
              </Text>
            </View>
          </TouchableOpacity>

          {activeChat.matchSource === 'service' ? (
            <TouchableOpacity
              onPress={() => {
                setActiveChatId(null);
                setActiveTab('services');
              }}
              style={[styles.profileQuickBtn, { backgroundColor: '#EAF7F1' }]}
            >
              <Feather name="calendar" size={13} color="#2E7D5B" />
              <Text style={[styles.profileQuickBtnText, { color: '#2E7D5B' }]}>Đặt lịch</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => openPublicUserProfile(activeChat.partnerHandle)}
              style={[styles.profileQuickBtn, { backgroundColor: theme.surfaceMuted }]}
            >
              <Feather name="user" size={14} color={theme.text} />
              <Text style={[styles.profileQuickBtnText, { color: theme.text }]}>Trang cá nhân</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView
          ref={scrollViewRef}
          style={{ flex: 1 }}
          contentContainerStyle={[styles.messagesList, { paddingBottom: 16 }]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
          onLayout={() => scrollViewRef.current?.scrollToEnd({ animated: false })}
        >
          {activeChat.messages.map((msg) => {
            const isMe = msg.sender === 'me';
            return (
              <View
                key={msg.id}
                style={[styles.msgRow, isMe ? styles.msgRowMe : styles.msgRowThem]}
              >
                <View
                  style={[
                    styles.msgBubble,
                    isMe
                      ? { backgroundColor: theme.primary }
                      : { backgroundColor: theme.surface, borderColor: theme.border, borderWidth: 1 },
                  ]}
                >
                  <Text
                    style={[
                      styles.msgText,
                      { color: isMe ? '#FFFFFF' : theme.text },
                    ]}
                  >
                    {msg.text}
                  </Text>
                  <Text
                    style={[
                      styles.msgTime,
                      { color: isMe ? 'rgba(255,255,255,0.75)' : theme.textMuted },
                    ]}
                  >
                    {msg.time}
                  </Text>
                </View>
              </View>
            );
          })}
        </ScrollView>

        <View
          style={[
            styles.inputBar,
            {
              backgroundColor: theme.surface,
              borderTopColor: theme.border,
              paddingBottom: Platform.OS === 'ios' ? Math.max(insets.bottom, 10) : 10,
            },
          ]}
        >
          <TextInput
            value={messageDraft}
            onChangeText={setMessageDraft}
            placeholder="Nhập tin nhắn..."
            placeholderTextColor={theme.textMuted}
            style={[
              styles.msgInput, { maxHeight: 100 },
              { backgroundColor: theme.bg, borderColor: theme.border, color: theme.text },
            ]}
            multiline
            returnKeyType="send"
            blurOnSubmit={false}
            onSubmitEditing={handleSendMessage}
          />
          <TouchableOpacity
            onPress={handleSendMessage}
            style={[
              styles.sendBtn,
              { backgroundColor: messageDraft.trim() ? theme.primary : theme.border },
            ]}
            disabled={!messageDraft.trim()}
          >
            <Feather name="send" size={16} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.bg }]}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <View style={[styles.topToolCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
        {/* Search Input by Friend / User Name / Service */}
        <View style={[styles.searchBox, { backgroundColor: theme.bg, borderColor: theme.border }]}>
          <Feather name="search" size={15} color={theme.textMuted} />
          <TextInput
            value={searchFriend}
            onChangeText={setSearchFriend}
            placeholder="Tìm theo tên bạn bè, @tài_khoản, phòng khám, spa..."
            placeholderTextColor={theme.textMuted}
            style={[styles.searchInput, { color: theme.text }]}
          />
          {searchFriend.length > 0 && (
            <TouchableOpacity onPress={() => setSearchFriend('')}>
              <Feather name="x-circle" size={15} color={theme.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* 4 Filter Tabs: Tất cả | Chưa đọc | Kết nối | Dịch vụ */}
        <View style={[styles.filterBar, { backgroundColor: theme.surfaceMuted }]}>
          {(
            [
              { id: 'all', label: `Tất cả (${chats.length})` },
              {
                id: 'unread',
                label: `Chưa đọc (${chats.filter((c) => c.unreadCount > 0).length})`,
              },
              {
                id: 'tinder',
                label: `Kết nối (${chats.filter((c) => c.matchSource === 'tinder_match').length})`,
              },
              {
                id: 'service',
                label: `Dịch vụ (${chats.filter((c) => c.matchSource === 'service').length})`,
              },
            ] as const
          ).map((f) => {
            const active = chatFilter === f.id;
            return (
              <TouchableOpacity
                key={f.id}
                onPress={() => setChatFilter(f.id)}
                style={[
                  styles.filterTab,
                  active && { backgroundColor: theme.surface },
                ]}
              >
                <Text
                  style={[
                    styles.filterTabText,
                    { color: active ? theme.text : theme.textMuted },
                  ]}
                  numberOfLines={1}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Chat Rooms List */}
      {filteredChats.length === 0 ? (
        <View style={[styles.emptyBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Feather name="message-square" size={32} color={theme.textMuted} />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>Không có cuộc trò chuyện nào</Text>
          <Text style={[styles.emptySub, { color: theme.textMuted }]}>
            {searchFriend
              ? 'Không tìm thấy kết quả phù hợp với từ khóa.'
              : 'Hãy quẹt thẻ Kết nối hoặc đặt dịch vụ để bắt đầu trò chuyện.'}
          </Text>
        </View>
      ) : (
        filteredChats.map((room) => {
          const lastMsg = room.messages[room.messages.length - 1];
          return (
            <TouchableOpacity
              key={room.id}
              style={[
                styles.chatCard,
                { backgroundColor: theme.surface, borderColor: theme.border },
              ]}
              onPress={() => setActiveChatId(room.id)}
              activeOpacity={0.75}
            >
              <View style={styles.avatarWrap}>
                <Image source={{ uri: room.partnerAvatar }} style={styles.chatAvatar} />
                {room.isOnline && <View style={styles.onlineDot} />}
              </View>

              <View style={{ flex: 1 }}>
                <View style={styles.chatRowTop}>
                  <View style={styles.partnerNameRow}>
                    <Text style={[styles.chatName, { color: theme.text }]} numberOfLines={1}>
                      {room.partnerName}
                    </Text>
                    {room.matchSource === 'tinder_match' && (
                      <View style={[styles.tinderMiniBadge, { backgroundColor: theme.primarySoft }]}>
                        <Text style={[styles.tinderMiniText, { color: theme.primary }]}>Kết nối</Text>
                      </View>
                    )}
                    {room.matchSource === 'service' && (
                      <View style={[styles.tinderMiniBadge, { backgroundColor: '#EAF7F1' }]}>
                        <Text style={[styles.tinderMiniText, { color: '#2E7D5B' }]}>Dịch vụ</Text>
                      </View>
                    )}
                  </View>
                  <Text style={[styles.chatTime, { color: theme.textMuted }]}>
                    {lastMsg?.time || ''}
                  </Text>
                </View>

                <Text style={[styles.chatPetSub, { color: theme.primary }]} numberOfLines={1}>
                  {room.petSummary} · {room.distanceLabel}
                </Text>

                <Text
                  style={[
                    styles.chatPreview,
                    {
                      color: room.unreadCount > 0 ? theme.text : theme.textMuted,
                      fontWeight: room.unreadCount > 0 ? '700' : '400',
                    },
                  ]}
                  numberOfLines={1}
                >
                  {lastMsg?.text || 'Bắt đầu cuộc trò chuyện...'}
                </Text>
              </View>

              {room.unreadCount > 0 && (
                <View style={[styles.unreadBadge, { backgroundColor: theme.primary }]}>
                  <Text style={styles.unreadText}>{room.unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 28,
  },
  topToolCard: {
    padding: 12,
    borderRadius: 18,
    borderWidth: 1,
    marginBottom: 12,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 10,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
  },
  filterBar: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
    gap: 4,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filterTabText: {
    fontSize: 11,
    fontWeight: '700',
  },
  emptyBox: {
    padding: 32,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  emptySub: {
    fontSize: 12,
    textAlign: 'center',
  },
  chatCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 8,
  },
  avatarWrap: {
    position: 'relative',
  },
  chatAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2E9E6B',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  chatRowTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  partnerNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  chatName: {
    fontSize: 14,
    fontWeight: '700',
  },
  tinderMiniBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tinderMiniText: {
    fontSize: 10,
    fontWeight: '700',
  },
  chatTime: {
    fontSize: 11,
  },
  chatPetSub: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  chatPreview: {
    fontSize: 12,
    marginTop: 3,
  },
  unreadBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  unreadText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  chatDetailContainer: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
  },
  backBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  partnerTouchRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
  },
  partnerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  headerName: {
    fontSize: 14,
    fontWeight: '700',
  },
  matchTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  matchTagText: {
    fontSize: 9.5,
    fontWeight: '700',
  },
  headerSub: {
    fontSize: 11,
  },
  profileQuickBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 10,
  },
  profileQuickBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  messagesList: {
    padding: 14,
    gap: 10,
  },
  msgRow: {
    flexDirection: 'row',
  },
  msgRowMe: {
    justifyContent: 'flex-end',
  },
  msgRowThem: {
    justifyContent: 'flex-start',
  },
  msgBubble: {
    maxWidth: '78%',
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 16,
  },
  msgText: {
    fontSize: 13,
    lineHeight: 19,
  },
  msgTime: {
    fontSize: 10,
    marginTop: 4,
    alignSelf: 'flex-end',
  },
  inputBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderTopWidth: 1,
  },
  msgInput: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    fontSize: 13,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
