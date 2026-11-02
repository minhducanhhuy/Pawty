import React, { useState, useRef, useEffect, useMemo } from 'react';
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
  StatusBar,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '../components/FeatherIcon';
import { useMobilePawty, cleanName } from '../context/MobilePawtyContext';
import { ConfirmActionModal } from '../components/SelectorFieldModal';
import { TinderProfileDetailModal } from './tinder/TinderProfileDetailModal';
import { TinderCandidate } from '../types/mobileTypes';

const DAYS_OF_WEEK = ['CN', 'T.2', 'T.3', 'T.4', 'T.5', 'T.6', 'T.7'];

function getMessageDate(msg: any): Date {
  if (msg.createdAt) {
    const d = new Date(msg.createdAt);
    if (!isNaN(d.getTime())) return d;
  }
  const now = new Date();
  if (msg.time && typeof msg.time === 'string' && msg.time.includes(':')) {
    const parts = msg.time.split(':').map((x: string) => parseInt(x, 10));
    if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
      const d = new Date(now);
      d.setHours(parts[0], parts[1], 0, 0);
      return d;
    }
  }
  return now;
}

function shouldShowSessionHeader(currentMsg: any, prevMsg: any | null): boolean {
  if (!prevMsg) return true;

  const dateCurr = getMessageDate(currentMsg);
  const datePrev = getMessageDate(prevMsg);

  if (
    dateCurr.getFullYear() !== datePrev.getFullYear() ||
    dateCurr.getMonth() !== datePrev.getMonth() ||
    dateCurr.getDate() !== datePrev.getDate()
  ) {
    return true;
  }

  const diffMinutes = Math.abs(dateCurr.getTime() - datePrev.getTime()) / (1000 * 60);
  return diffMinutes >= 5;
}

function formatMessengerSessionHeader(msg: any): string {
  const d = getMessageDate(msg);
  const now = new Date();
  const timeStr = `${d.getHours().toString().padStart(2, '0')}:${d
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;

  const isToday =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate();

  const isYesterday =
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate() - 1;

  if (isToday) {
    const dayLabel = DAYS_OF_WEEK[d.getDay()];
    return `${dayLabel} LÚC ${timeStr}`;
  }

  if (isYesterday) {
    return `HÔM QUA LÚC ${timeStr}`;
  }

  const diffDays = Math.floor(Math.abs(now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 7) {
    const dayLabel = DAYS_OF_WEEK[d.getDay()];
    return `${dayLabel} LÚC ${timeStr}`;
  }

  return `${d.getDate()} THG ${d.getMonth() + 1} LÚC ${timeStr}`;
}

export const MobileChatScreen: React.FC = () => {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<any>(null);

  const {
    theme,
    chats,
    activeChatId,
    setActiveChatId,
    sendChatMessage,
    clearChatMessages,
    unfriendUser,
    unmatchCandidate,
    sendFriendRequest,
    markChatRead,
    openPublicUserProfile,
  } = useMobilePawty();

  const [messageDraft, setMessageDraft] = useState('');
  const [searchFriend, setSearchFriend] = useState('');
  const [chatSection, setChatSection] = useState<'social' | 'dating'>('social');
  const [chatFilter, setChatFilter] = useState<'all' | 'unread'>('all');
  const [tappedMessageId, setTappedMessageId] = useState<string | null>(null);
  const [showRoomMenu, setShowRoomMenu] = useState(false);
  const [showDatingDetail, setShowDatingDetail] = useState(false);
  const [confirmType, setConfirmType] = useState<null | 'clear_messages' | 'unfriend' | 'unmatch'>(null);

  const handleToggleMessageTimestamp = (messageId: string) => {
    setTappedMessageId((prev) => (prev === messageId ? null : messageId));
  };

  const activeChat = chats.find((c) => c.id === activeChatId) || null;
  const isDatingChat = activeChat
    ? activeChat.chatType === 'dating' || activeChat.matchSource === 'tinder_match'
    : false;

  const lastSeenMyMessageId = useMemo(() => {
    if (!activeChat?.messages) return null;
    for (let i = activeChat.messages.length - 1; i >= 0; i--) {
      const m = activeChat.messages[i];
      if (m.sender === 'me' && m.isRead) {
        return m.id;
      }
    }
    return null;
  }, [activeChat?.messages]);

  const lastMyMessageId = useMemo(() => {
    if (!activeChat?.messages) return null;
    for (let i = activeChat.messages.length - 1; i >= 0; i--) {
      const m = activeChat.messages[i];
      if (m.sender === 'me') {
        return m.id;
      }
    }
    return null;
  }, [activeChat?.messages]);

  // Với Mạng xã hội: nhắn tin tự do chuẩn Facebook/Pinterest, không chặn vì kết bạn
  // Với Hẹn hò: nhắn tin khi còn tương hợp
  const canSendInRoom = activeChat
    ? isDatingChat
      ? activeChat.canMessage !== false
      : true
    : false;

  const datingCandidate: TinderCandidate | null =
    isDatingChat && activeChat
      ? activeChat.candidateProfile || {
          id: activeChat.id,
          ownerName: activeChat.partnerName,
          ownerHandle: activeChat.partnerHandle,
          ownerAge: 24,
          gender: 'Nữ',
          ownerNickname: activeChat.partnerName,
          avatarUrl:
            activeChat.partnerAvatar ||
            'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80',
          photoUrls: activeChat.partnerAvatar
            ? [activeChat.partnerAvatar]
            : ['https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=900&q=80'],
          distanceKm: 1.2,
          area: activeChat.distanceLabel || 'Khu đô thị',
          intent: 'dating',
          intentLabel: 'Hẹn hò cho người yêu thú',
          lookingFor: 'Tìm bạn cùng nuôi Boss và đi dạo',
          bio: 'Hồ sơ người yêu thú cưng trên Pawty.',
          lifestyle: {
            smoking: 'Không hút thuốc',
            workout: 'Đi bộ cùng cún',
            drinking: 'Thỉnh thoảng',
            petSummary: activeChat.petSummary || 'Nuôi cún',
            zodiac: 'Kim Ngưu',
            chatStyle: 'Nhiệt tình, thân thiện',
          },
          pets: [],
          tags: ['Yêu thú cưng', 'Dắt cún mỗi ngày'],
          hasLikedMe: true,
        }
      : null;

  useEffect(() => {
    if (activeChatId) {
      markChatRead(activeChatId);
    }
  }, [activeChatId, markChatRead]);

  useEffect(() => {
    if (activeChat) {
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: false });
      }, 80);
    }
  }, [activeChatId]);

  const [isKeyboardVisible, setIsKeyboardVisible] = useState(false);

  useEffect(() => {
    const showSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      () => {
        setIsKeyboardVisible(true);
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 60);
      }
    );
    const hideSub = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        setIsKeyboardVisible(false);
      }
    );
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  const handleSendMessage = () => {
    const text = messageDraft.trim();
    if (!text || !activeChat || !canSendInRoom) return;
    sendChatMessage(activeChat.id, text);
    setMessageDraft('');
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 60);
  };

  const socialChats = chats.filter(
    (c) => c.chatType !== 'dating' && c.matchSource !== 'tinder_match'
  );
  const datingChats = chats.filter(
    (c) => c.chatType === 'dating' || c.matchSource === 'tinder_match'
  );

  const currentSectionChats = chatSection === 'social' ? socialChats : datingChats;

  const filteredChats = currentSectionChats.filter((room) => {
    const q = searchFriend.trim().toLowerCase();
    const matchName =
      !q ||
      room.partnerName.toLowerCase().includes(q) ||
      room.partnerHandle.toLowerCase().includes(q) ||
      room.petSummary.toLowerCase().includes(q);
    if (chatFilter === 'unread') {
      return matchName && room.unreadCount > 0;
    }
    return matchName;
  });

  if (activeChat) {
    return (
      <KeyboardAvoidingView
        style={[styles.chatDetailContainer, { backgroundColor: theme.bg }]}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={
          Platform.OS === 'ios' ? insets.top : (StatusBar.currentHeight || 28) + 14
        }
      >
        <View
          style={[
            styles.chatHeader,
            { backgroundColor: theme.surface, borderBottomColor: theme.border },
          ]}
        >
          <TouchableOpacity
            onPress={() => setActiveChatId(null)}
            style={[styles.backBtn, { backgroundColor: theme.bg }]}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Feather name="arrow-left" size={18} color={theme.text} />
          </TouchableOpacity>

          {isDatingChat ? (
            /* DATING CHAT HEADER: CHỈ XEM ĐƯỢC HỒ SƠ HẸN HÒ */
            <TouchableOpacity
              style={styles.partnerTouchRow}
              onPress={() => setShowDatingDetail(true)}
              activeOpacity={0.78}
            >
              {activeChat.partnerAvatar ? (
                <Image source={{ uri: activeChat.partnerAvatar }} style={styles.headerAvatar} />
              ) : (
                <View style={[styles.headerAvatar, styles.avatarPlaceholder]}>
                  <Feather name="heart" size={16} color="#E11D48" />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <View style={styles.partnerTitleRow}>
                  <Text style={[styles.headerName, { color: theme.text }]} numberOfLines={1}>
                    {cleanName(activeChat.partnerName)}
                  </Text>
                  <View style={[styles.matchTag, { backgroundColor: '#FFE4E6' }]}>
                    <Feather name="heart" size={10} color="#E11D48" />
                    <Text style={[styles.matchTagText, { color: '#E11D48' }]}>Tương hợp</Text>
                  </View>
                </View>
                <Text style={[styles.headerSub, { color: theme.textMuted }]} numberOfLines={1}>
                  {activeChat.petSummary} · {activeChat.distanceLabel}
                </Text>
              </View>
            </TouchableOpacity>
          ) : (
            /* SOCIAL CHAT HEADER: XEM HỒ SƠ MẠNG XÃ HỘI */
            <TouchableOpacity
              style={styles.partnerTouchRow}
              onPress={() => openPublicUserProfile(activeChat.partnerHandle)}
              activeOpacity={0.78}
            >
              {activeChat.partnerAvatar ? (
                <Image source={{ uri: activeChat.partnerAvatar }} style={styles.headerAvatar} />
              ) : (
                <View style={[styles.headerAvatar, styles.avatarPlaceholder]}>
                  <Feather name="user" size={16} color="#8E8074" />
                </View>
              )}
              <View style={{ flex: 1 }}>
                <View style={styles.partnerTitleRow}>
                  <Text style={[styles.headerName, { color: theme.text }]} numberOfLines={1}>
                    {activeChat.partnerName}
                  </Text>

                </View>
                <Text style={[styles.headerSub, { color: theme.textMuted }]} numberOfLines={1}>
                  {activeChat.petSummary} · {activeChat.distanceLabel}
                </Text>
              </View>
            </TouchableOpacity>
          )}

          {isDatingChat ? (
            <TouchableOpacity
              onPress={() => setShowDatingDetail(true)}
              style={[styles.profileQuickBtn, { backgroundColor: '#FFF1F2' }]}
            >
              <Feather name="heart" size={13} color="#E11D48" />
              <Text style={[styles.profileQuickBtnText, { color: '#E11D48' }]}>Hồ sơ hẹn hò</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => openPublicUserProfile(activeChat.partnerHandle)}
              style={[styles.profileQuickBtn, { backgroundColor: theme.surfaceMuted }]}
            >
              <Feather name="user" size={13} color={theme.text} />
              <Text style={[styles.profileQuickBtnText, { color: theme.text }]}>Trang cá nhân</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            onPress={() => setShowRoomMenu(true)}
            style={[styles.moreMenuBtn, { backgroundColor: theme.surfaceMuted }]}
            accessibilityLabel="Tùy chọn trò chuyện"
          >
            <Feather name="more-vertical" size={17} color={theme.text} />
          </TouchableOpacity>
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
          {activeChat.messages.length === 0 ? (
            <View style={styles.emptyConversationHint}>
              <Feather
                name={isDatingChat ? 'heart' : 'message-circle'}
                size={26}
                color={isDatingChat ? '#FDA4AF' : '#B8ACA0'}
              />
              <Text style={styles.emptyConversationText}>
                {isDatingChat
                  ? 'Hai bạn đã tương hợp! Hãy gửi tin nhắn chào mừng và hẹn cùng dắt thú cưng đi dạo nhé.'
                  : 'Chưa có tin nhắn nào trong cuộc trò chuyện này. Hãy gửi lời chào đầu tiên!'}
              </Text>
            </View>
          ) : (
            activeChat.messages.map((msg, index) => {
              const isMe = msg.sender === 'me';
              const prevMsg = index > 0 ? activeChat.messages[index - 1] : null;
              const nextMsg =
                index < activeChat.messages.length - 1 ? activeChat.messages[index + 1] : null;
              const showHeader = shouldShowSessionHeader(msg, prevMsg);
              const isTapped = tappedMessageId === msg.id;
              const displayHeader = showHeader || isTapped;
              const isNextSameSender =
                nextMsg && nextMsg.sender === msg.sender && !shouldShowSessionHeader(nextMsg, msg);
              const isLastSeenMessage = isMe && msg.id === lastSeenMyMessageId;
              const isUnreadLastMessage = isMe && msg.id === lastMyMessageId && !msg.isRead;
              const showSeenOrSentReceipt = isLastSeenMessage || isUnreadLastMessage || (isTapped && isMe);





              return (
                <React.Fragment key={msg.id}>
                  {displayHeader && (
                    <View style={styles.sessionHeaderWrap}>
                      <Text style={[styles.sessionHeaderText, { color: theme.textMuted }]}>
                        {formatMessengerSessionHeader(msg)}
                      </Text>
                    </View>
                  )}

                  <View
                    style={[
                      styles.msgRow,
                      isMe ? styles.msgRowMe : styles.msgRowThem,
                      { marginBottom: isNextSameSender ? 2.5 : 8 },
                    ]}
                  >
                    <TouchableOpacity
                      activeOpacity={0.82}
                      onPress={() => handleToggleMessageTimestamp(msg.id)}
                      style={[
                        styles.msgBubble,
                        isMe
                          ? { backgroundColor: isDatingChat ? '#E11D48' : theme.primary }
                          : {
                              backgroundColor: theme.surface,
                              borderColor: theme.border,
                              borderWidth: 1,
                            },
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
                    </TouchableOpacity>

                    {showSeenOrSentReceipt && (
                      <View style={styles.seenReceiptRow}>
                        {msg.isRead ? (
                          <View style={styles.seenStatusWrap}>
                            <Text style={[styles.seenStatusText, { color: theme.textMuted }]}>
                              Đã xem
                            </Text>
                            {activeChat.partnerAvatar ? (
                              <Image
                                source={{ uri: activeChat.partnerAvatar }}
                                style={styles.seenAvatar}
                              />
                            ) : null}
                          </View>
                        ) : (
                          <View style={styles.seenStatusWrap}>
                            <Text style={[styles.seenStatusText, { color: theme.textMuted }]}>
                              Đã gửi
                            </Text>
                            <Feather name="check" size={11} color={theme.textMuted} />
                          </View>
                        )}
                      </View>
                    )}
                  </View>
                </React.Fragment>
              );
            })
          )}
        </ScrollView>

        {/* Ô nhập tin nhắn */}
        {canSendInRoom ? (
          <View
            style={[
              styles.inputBar,
              {
                backgroundColor: theme.surface,
                borderTopColor: theme.border,
                paddingBottom: isKeyboardVisible
                  ? 8
                  : Platform.OS === 'ios'
                  ? Math.max(insets.bottom, 10)
                  : Math.max(insets.bottom, 10),
              },
            ]}
          >
            <TextInput
              value={messageDraft}
              onChangeText={setMessageDraft}
              placeholder={isDatingChat ? "Nhắn tin hẹn hò & dắt cún..." : "Nhập tin nhắn..."}
              placeholderTextColor={theme.textMuted}
              style={[
                styles.msgInput,
                { maxHeight: 100 },
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
                {
                  backgroundColor: messageDraft.trim()
                    ? isDatingChat
                      ? '#E11D48'
                      : theme.primary
                    : theme.border,
                },
              ]}
              disabled={!messageDraft.trim()}
            >
              <Feather name="send" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        ) : (
          <View
            style={[
              styles.blockedComposerCard,
              {
                paddingBottom: Math.max(insets.bottom, 14),
              },
            ]}
          >
            <View style={styles.blockedComposerInfoRow}>
              <Feather name="lock" size={15} color="#B85D43" />
              <Text style={styles.blockedComposerText}>
                Cuộc trò chuyện này đã kết thúc do một bên đã bỏ tương hợp.
              </Text>
            </View>
            <TouchableOpacity
              style={styles.blockedSecondaryBtn}
              onPress={() => setConfirmType('clear_messages')}
            >
              <Feather name="trash-2" size={14} color="#B85D43" />
              <Text style={styles.blockedSecondaryText}>Xóa hết tin nhắn</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Menu Tùy chọn Phòng Chat */}
        <Modal
          visible={showRoomMenu}
          transparent
          animationType="slide"
          onRequestClose={() => setShowRoomMenu(false)}
        >
          <TouchableOpacity
            style={styles.menuBackdrop}
            activeOpacity={1}
            onPress={() => setShowRoomMenu(false)}
          >
            <View style={styles.menuSheet} onStartShouldSetResponder={() => true}>
              <View style={styles.menuHeader}>
                <Text style={styles.menuTitle}>Tùy chọn cuộc trò chuyện</Text>
                <TouchableOpacity onPress={() => setShowRoomMenu(false)}>
                  <Feather name="x" size={18} color="#5C5046" />
                </TouchableOpacity>
              </View>

              {isDatingChat ? (
                /* MENU BÊN HẸN HÒ: TUYỆT ĐỐI CHỈ XEM HỒ SƠ HẸN HÒ & BỎ TƯƠNG HỢP */
                <>
                  <TouchableOpacity
                    style={styles.menuRow}
                    onPress={() => {
                      setShowRoomMenu(false);
                      setShowDatingDetail(true);
                    }}
                  >
                    <View style={[styles.menuIconCircle, { backgroundColor: '#FFE4E6' }]}>
                      <Feather name="heart" size={17} color="#E11D48" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.menuRowTitle}>Xem Hồ sơ Hẹn hò của {activeChat.partnerName}</Text>
                      <Text style={styles.menuRowSub}>Xem album ảnh, mục đích kết nối và thói quen thú cưng</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.menuRow}
                    onPress={() => {
                      setShowRoomMenu(false);
                      setConfirmType('clear_messages');
                    }}
                  >
                    <View style={[styles.menuIconCircle, { backgroundColor: '#FEF3C7' }]}>
                      <Feather name="trash-2" size={17} color="#D97706" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.menuRowTitle}>Xóa toàn bộ tin nhắn</Text>
                      <Text style={styles.menuRowSub}>
                        Dọn sạch lịch sử tin nhắn trong cuộc trò chuyện này
                      </Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.menuRow}
                    onPress={() => {
                      setShowRoomMenu(false);
                      setConfirmType('unmatch');
                    }}
                  >
                    <View style={[styles.menuIconCircle, { backgroundColor: '#FEE2E2' }]}>
                      <Feather name="user-x" size={17} color="#DC2626" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.menuRowTitle, { color: '#DC2626' }]}>
                        Bỏ tương hợp & Xóa cuộc trò chuyện
                      </Text>
                      <Text style={styles.menuRowSub}>
                        Xóa sạch tin nhắn và vĩnh viễn không gặp lại trên quẹt thẻ
                      </Text>
                    </View>
                  </TouchableOpacity>
                </>
              ) : (
                /* MENU BÊN MẠNG XÃ HỘI: XEM TRANG CÁ NHÂN & XÓA TIN NHẮN */
                <>
                  <TouchableOpacity
                    style={styles.menuRow}
                    onPress={() => {
                      setShowRoomMenu(false);
                      openPublicUserProfile(activeChat.partnerHandle);
                    }}
                  >
                    <View style={[styles.menuIconCircle, { backgroundColor: '#EAF7F1' }]}>
                      <Feather name="user" size={17} color="#2E7D5B" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.menuRowTitle}>Xem Trang cá nhân của {activeChat.partnerName}</Text>
                      <Text style={styles.menuRowSub}>Xem bài viết khoảnh khắc, follower và các bé thú cưng</Text>
                    </View>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.menuRow}
                    onPress={() => {
                      setShowRoomMenu(false);
                      setConfirmType('clear_messages');
                    }}
                  >
                    <View style={[styles.menuIconCircle, { backgroundColor: '#FEF3C7' }]}>
                      <Feather name="trash-2" size={17} color="#D97706" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.menuRowTitle}>Xóa toàn bộ tin nhắn</Text>
                      <Text style={styles.menuRowSub}>
                        Dọn sạch lịch sử tin nhắn trong cuộc trò chuyện này
                      </Text>
                    </View>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </TouchableOpacity>
        </Modal>

        {/* Modal chi tiết Hồ sơ Hẹn Hò (Độc lập 100%, không chuyển sang mạng xã hội) */}
        {datingCandidate && (
          <TinderProfileDetailModal
            visible={showDatingDetail}
            candidate={datingCandidate}
            activePhotoIdx={0}
            onClose={() => setShowDatingDetail(false)}
            onPass={() => setShowDatingDetail(false)}
            onLike={() => setShowDatingDetail(false)}
            onShare={() => {}}
          />
        )}

        {/* Confirm Modal chống ấn nhầm khi Xóa hết tin nhắn hoặc Bỏ tương hợp */}
        <ConfirmActionModal
          visible={confirmType !== null}
          title={
            confirmType === 'unmatch'
              ? `Bỏ tương hợp với ${activeChat.partnerName}?`
              : confirmType === 'unfriend'
              ? `Hủy kết bạn với ${activeChat.partnerName}?`
              : 'Xóa toàn bộ tin nhắn?'
          }
          message={
            confirmType === 'unmatch'
              ? 'Sau khi bỏ tương hợp, toàn bộ tin nhắn sẽ bị xóa vĩnh viễn và hai bạn sẽ không còn xuất hiện trong danh sách quẹt thẻ hay tìm kiếm của nhau nữa.'
              : confirmType === 'unfriend'
              ? 'Sau khi hủy kết bạn, hai bạn sẽ chuyển sang nhắn tin tự do như người dùng thông thường.'
              : 'Toàn bộ lịch sử tin nhắn trong cuộc trò chuyện này sẽ bị xóa vĩnh viễn khỏi cơ sở dữ liệu.'
          }
          confirmLabel={
            confirmType === 'unmatch'
              ? 'Xác nhận Bỏ Tương Hợp'
              : confirmType === 'unfriend'
              ? 'Xác nhận hủy kết bạn'
              : 'Xóa hết tin nhắn'
          }
          cancelLabel="Giữ lại"
          danger
          onCancel={() => setConfirmType(null)}
          onConfirm={async () => {
            const action = confirmType;
            setConfirmType(null);
            if (action === 'clear_messages') {
              await clearChatMessages(activeChat.id);
            } else if (action === 'unmatch') {
              await unmatchCandidate(activeChat.partnerHandle);
            } else if (action === 'unfriend') {
              await unfriendUser(activeChat.partnerHandle);
            }
          }}
        />
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
      <View
        style={[
          styles.topToolCard,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        {/* THANH TAB PHÂN TÁCH 2 PHẦN: MẠNG XÃ HỘI vs HẸN HÒ & KẾT NỐI */}
        <View style={styles.segmentContainer}>
          <TouchableOpacity
            style={[
              styles.segmentBtn,
              chatSection === 'social' && [
                styles.segmentBtnActive,
                { backgroundColor: theme.primary, borderColor: theme.primary },
              ],
            ]}
            onPress={() => setChatSection('social')}
            activeOpacity={0.8}
          >
            <Feather
              name="message-circle"
              size={14}
              color={chatSection === 'social' ? '#FFFFFF' : theme.textMuted}
            />
            <Text
              style={[
                styles.segmentBtnText,
                { color: chatSection === 'social' ? '#FFFFFF' : theme.textMuted },
                chatSection === 'social' && styles.segmentBtnTextActive,
              ]}
            >
              Mạng xã hội ({socialChats.length})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.segmentBtn,
              chatSection === 'dating' && [
                styles.segmentBtnActive,
                { backgroundColor: '#E11D48', borderColor: '#E11D48' },
              ],
            ]}
            onPress={() => setChatSection('dating')}
            activeOpacity={0.8}
          >
            <Feather
              name="heart"
              size={14}
              color={chatSection === 'dating' ? '#FFFFFF' : theme.textMuted}
            />
            <Text
              style={[
                styles.segmentBtnText,
                { color: chatSection === 'dating' ? '#FFFFFF' : theme.textMuted },
                chatSection === 'dating' && styles.segmentBtnTextActive,
              ]}
            >
              Hẹn hò ({datingChats.length})
            </Text>
          </TouchableOpacity>
        </View>

        <View style={[styles.searchBox, { backgroundColor: theme.bg, borderColor: theme.border }]}>
          <Feather name="search" size={15} color={theme.textMuted} />
          <TextInput
            value={searchFriend}
            onChangeText={setSearchFriend}
            placeholder={
              chatSection === 'social'
                ? "Tìm cuộc trò chuyện..."
                : "Tìm bạn hẹn hò..."
            }
            placeholderTextColor={theme.textMuted}
            style={[styles.searchInput, { color: theme.text }]}
          />
          {searchFriend.length > 0 && (
            <TouchableOpacity onPress={() => setSearchFriend('')}>
              <Feather name="x-circle" size={15} color={theme.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <View style={[styles.filterBar, { backgroundColor: theme.surfaceMuted }]}>
          {(
            [
              { id: 'all', label: `Tất cả (${currentSectionChats.length})` },
              {
                id: 'unread',
                label: `Chưa đọc (${currentSectionChats.filter((c) => c.unreadCount > 0).length})`,
              },
            ] as const
          ).map((f) => {
            const active = chatFilter === f.id;
            return (
              <TouchableOpacity
                key={f.id}
                onPress={() => setChatFilter(f.id)}
                style={[styles.filterTab, active && { backgroundColor: theme.surface }]}
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

      {filteredChats.length === 0 ? (
        <View
          style={[
            styles.emptyBox,
            { backgroundColor: theme.surface, borderColor: theme.border },
          ]}
        >
          <Feather
            name={chatSection === 'social' ? 'message-circle' : 'heart'}
            size={34}
            color={chatSection === 'social' ? theme.primary : '#E11D48'}
          />
          <Text style={[styles.emptyTitle, { color: theme.text }]}>
            {chatSection === 'social'
              ? 'Không có tin nhắn mạng xã hội'
              : 'Chưa có tương hợp hẹn hò nào'}
          </Text>
          <Text style={[styles.emptySub, { color: theme.textMuted }]}>
            {searchFriend
              ? 'Không tìm thấy kết quả phù hợp với từ khóa.'
              : chatSection === 'social'
              ? 'Bạn có thể nhắn tin trực tiếp cho bất kỳ ai trên Pawty qua Khám phá hoặc Trang cá nhân mà không cần kết bạn trước.'
              : 'Hãy quẹt thẻ ở mục Kết nối để tìm Boss và Sen phù hợp cùng dắt cún đi dạo!'}
          </Text>
        </View>
      ) : (
        filteredChats.map((room) => {
          const lastMsg = room.messages[room.messages.length - 1];
          const isDatingRoom =
            room.chatType === 'dating' || room.matchSource === 'tinder_match';
          const roomLocked = isDatingRoom && room.canMessage === false;

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
                {room.partnerAvatar ? (
                  <Image source={{ uri: room.partnerAvatar }} style={styles.chatAvatar} />
                ) : (
                  <View style={[styles.chatAvatar, styles.avatarPlaceholder]}>
                    <Feather
                      name={isDatingRoom ? 'heart' : 'user'}
                      size={20}
                      color={isDatingRoom ? '#E11D48' : '#8E8074'}
                    />
                  </View>
                )}
                {room.isOnline && !roomLocked && <View style={styles.onlineDot} />}
              </View>

              <View style={{ flex: 1 }}>
                <View style={styles.chatRowTop}>
                  <View style={styles.partnerNameRow}>
                    <Text style={[styles.chatName, { color: theme.text }]} numberOfLines={1}>
                      {cleanName(room.partnerName)}
                    </Text>
                    {roomLocked ? (
                      <View style={styles.unfriendedTag}>
                        <Text style={styles.unfriendedTagText}>Đã bỏ tương hợp</Text>
                      </View>
                    ) : isDatingRoom ? (
                      <View
                        style={[styles.tinderMiniBadge, { backgroundColor: '#FFE4E6' }]}
                      >
                        <Text style={[styles.tinderMiniText, { color: '#E11D48' }]}>
                          Tương hợp
                        </Text>
                      </View>
                    ) : null}
                  </View>
                  <Text style={[styles.chatTime, { color: theme.textMuted }]}>
                    {lastMsg?.time || ''}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.chatPetSub,
                    { color: isDatingRoom ? '#E11D48' : theme.primary },
                  ]}
                  numberOfLines={1}
                >
                  {room.petSummary} · {room.distanceLabel}
                </Text>

                <Text
                  style={[
                    styles.chatPreview,
                    {
                      color: roomLocked
                        ? '#B85D43'
                        : room.unreadCount > 0
                        ? theme.text
                        : theme.textMuted,
                      fontWeight: room.unreadCount > 0 ? '700' : '400',
                    },
                  ]}
                  numberOfLines={1}
                >
                  {roomLocked
                    ? 'Cuộc trò chuyện đã kết thúc do đã bỏ tương hợp'
                    : lastMsg?.text || 'Bắt đầu cuộc trò chuyện...'}
                </Text>
              </View>

              {room.unreadCount > 0 && (
                <View
                  style={[
                    styles.unreadBadge,
                    { backgroundColor: isDatingRoom ? '#E11D48' : theme.primary },
                  ]}
                >
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
    gap: 10,
  },
  segmentContainer: {
    flexDirection: 'row',
    borderRadius: 12,
    backgroundColor: '#F3EFEA',
    padding: 3,
    gap: 4,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
  },
  segmentBtnActive: {
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  segmentBtnText: {
    fontSize: 12,
    fontWeight: '600',
  },
  segmentBtnTextActive: {
    fontWeight: '800',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    height: 40,
    borderRadius: 12,
    borderWidth: 1,
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
    gap: 8,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  emptySub: {
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
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
  avatarPlaceholder: {
    backgroundColor: '#F3EFEA',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5DDD3',
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
    flex: 1,
    marginRight: 6,
  },
  chatName: {
    fontSize: 14,
    fontWeight: '700',
    flexShrink: 1,
  },
  handleText: {
    fontSize: 11,
  },
  chatHandleText: {
    fontSize: 11,
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
  unfriendedTag: {
    backgroundColor: '#FDF2F2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#F5C6C6',
  },
  unfriendedTagText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#C9302C',
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
    gap: 8,
    paddingHorizontal: 12,
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
    gap: 9,
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
    flexShrink: 1,
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
    paddingVertical: 7,
    borderRadius: 10,
  },
  profileQuickBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  moreMenuBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messagesList: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 16,
  },
  emptyConversationHint: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 8,
  },
  emptyConversationText: {
    fontSize: 13,
    color: '#8E8074',
    textAlign: 'center',
    lineHeight: 19,
    paddingHorizontal: 24,
  },
  msgRow: {
    marginBottom: 6,
  },
  msgRowMe: {
    alignItems: 'flex-end',
  },
  msgRowThem: {
    alignItems: 'flex-start',
  },
  sessionHeaderWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  sessionHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  seenReceiptRow: {
    marginTop: 3,
    marginRight: 4,
  },
  seenStatusWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  seenStatusText: {
    fontSize: 10.5,
    fontWeight: '500',
  },
  seenAvatar: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1,
    borderColor: '#FFFFFF',
  },
  msgBubble: {
    maxWidth: '78%',
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 18,
  },
  msgText: {
    fontSize: 13,
    lineHeight: 19,
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
  blockedComposerCard: {
    backgroundColor: '#FFF8F6',
    borderTopWidth: 1,
    borderTopColor: '#F3D6D3',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
  },
  blockedComposerInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  blockedComposerText: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '600',
    color: '#8C3823',
    lineHeight: 18,
  },
  blockedSecondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3D6D3',
  },
  blockedSecondaryText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#B85D43',
  },
  menuBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(20, 16, 14, 0.45)',
    justifyContent: 'flex-end',
  },
  menuSheet: {
    backgroundColor: '#FAF7F2',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 18,
    paddingTop: 16,
    paddingBottom: 28,
    gap: 10,
  },
  menuHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ECE5DB',
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2C2520',
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFFFFF',
    padding: 13,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ECE5DB',
  },
  menuIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuRowTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#2C2520',
  },
  menuRowSub: {
    fontSize: 11.5,
    color: '#7A6E63',
    marginTop: 2,
  },
});


