import React, { useState } from 'react';
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useMobilePawty } from '../context/MobilePawtyContext';
import { PAWTY_COLORS } from '../theme/colors';

export const MobileChatScreen: React.FC = () => {
  const {
    conversations,
    activeConversationId,
    setActiveConversationId,
    sendMessage,
    walkAppointments,
    updateWalkStatus,
    setActiveModal,
  } = useMobilePawty();

  const [messageDraft, setMessageDraft] = useState('');

  const activeConversation = conversations.find((c) => c.id === activeConversationId);

  if (!activeConversation) {
    return (
      <ScrollView style={styles.container} contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <Text style={styles.screenTitle}>💬 Tin nhắn & Hẹn Dạo Trung Điểm</Text>
          <TouchableOpacity
            style={styles.midpointQuickBtn}
            onPress={() => setActiveModal('walk_scheduler')}
          >
            <Text style={styles.midpointQuickBtnText}>📍 Hẹn Dạo Trung Điểm</Text>
          </TouchableOpacity>
        </View>

        {conversations.map((conv) => (
          <TouchableOpacity
            key={conv.id}
            style={styles.convCard}
            onPress={() => setActiveConversationId(conv.id)}
          >
            <Image source={{ uri: conv.avatarUrl }} style={styles.convAvatar} />
            <View style={{ flex: 1 }}>
              <View style={styles.convTitleRow}>
                <Text style={styles.convTitle}>{conv.title}</Text>
                {conv.unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadText}>{conv.unreadCount}</Text>
                  </View>
                )}
              </View>
              <Text style={styles.convCategory}>
                {conv.category === 'circle'
                  ? '👨‍👩‍👧 Vòng chăm sóc (Circle)'
                  : conv.category === 'match'
                  ? '🐾 Bạn dắt dạo (Radar Match)'
                  : '✨ Đối tác dịch vụ'}
              </Text>
              <Text style={styles.convSub} numberOfLines={1}>
                {conv.subtitle}
              </Text>
            </View>
          </TouchableOpacity>
        ))}

        {/* Active Midpoint Walk Appointments Overview */}
        <Text style={[styles.screenTitle, { marginTop: 14, marginBottom: 10 }]}>
          📍 Kèo Hẹn Dắt Dạo Trung Điểm (Chống Bùng Kèo)
        </Text>
        {walkAppointments.map((walk) => (
          <View key={walk.id} style={styles.walkBubbleCard}>
            <Text style={styles.walkBadge}>
              🟢 TRUNG ĐIỂM POSTGIS ST_CENTROID · {walk.status.toUpperCase()}
            </Text>
            <Text style={styles.walkTitle}>
              Cùng {walk.partnerPetName} (Sen: {walk.partnerName})
            </Text>
            <Text style={styles.walkMeta}>⏰ {walk.proposedTime}</Text>
            <Text style={styles.walkMeta}>📌 {walk.midpointLocationName}</Text>
            <View style={styles.walkActions}>
              <TouchableOpacity
                style={styles.walkConfirmBtn}
                onPress={() => updateWalkStatus(walk.id, 'completed')}
              >
                <Text style={styles.walkConfirmText}>✓ Xác nhận Đã đi dạo</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.walkFlakeBtn}
                onPress={() => updateWalkStatus(walk.id, 'no_show')}
              >
                <Text style={styles.walkFlakeText}>⚠️ Báo Bùng Kèo</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      {/* Chat Room Top Bar */}
      <View style={styles.roomTopBar}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => setActiveConversationId(null)}
        >
          <Text style={styles.backBtnText}>← Danh sách</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={styles.roomTitle} numberOfLines={1}>
            {activeConversation.title}
          </Text>
          <Text style={styles.roomSub}>Đang hoạt động · Đồng bộ thời gian thực</Text>
        </View>
        <TouchableOpacity
          style={styles.roomWalkBtn}
          onPress={() => setActiveModal('walk_scheduler')}
        >
          <Text style={styles.roomWalkBtnText}>📍 Hẹn Dạo</Text>
        </TouchableOpacity>
      </View>

      {/* Messages Scroll */}
      <ScrollView style={styles.messagesArea} contentContainerStyle={{ padding: 14, paddingBottom: 30 }}>
        {activeConversation.messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.msgBubble,
              msg.isMe ? styles.msgBubbleMe : styles.msgBubbleOther,
              msg.type === 'walk_invite' && styles.msgBubbleWalk,
            ]}
          >
            <Text style={[styles.msgSender, msg.isMe && { color: '#FFE4E1' }]}>
              {msg.senderName} · {msg.createdAt}
            </Text>
            <Text style={[styles.msgText, msg.isMe && { color: '#FFF' }]}>
              {msg.text}
            </Text>
          </View>
        ))}
      </ScrollView>

      {/* Input Composer */}
      <View style={styles.composerRow}>
        <TouchableOpacity
          style={styles.voiceBtn}
          onPress={() =>
            sendMessage(
              activeConversation.id,
              '🎤 [Tin nhắn thoại 0:08 — "Mình đang dắt Boss xuống sảnh chung cư nha!"]',
              'voice'
            )
          }
        >
          <Text style={{ fontSize: 16 }}>🎤</Text>
        </TouchableOpacity>
        <TextInput
          style={styles.chatInput}
          placeholder="Nhập tin nhắn..."
          value={messageDraft}
          onChangeText={setMessageDraft}
        />
        <TouchableOpacity
          style={styles.sendBtn}
          onPress={() => {
            if (messageDraft.trim()) {
              sendMessage(activeConversation.id, messageDraft);
              setMessageDraft('');
            }
          }}
        >
          <Text style={styles.sendBtnText}>Gửi</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: PAWTY_COLORS.cream },
  content: { padding: 16, paddingBottom: 110 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    flexWrap: 'wrap',
    gap: 8,
  },
  screenTitle: { fontSize: 16, fontWeight: '800', color: PAWTY_COLORS.charcoal },
  midpointQuickBtn: {
    backgroundColor: PAWTY_COLORS.mintSoft,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: PAWTY_COLORS.mintDark,
  },
  midpointQuickBtnText: { fontSize: 12, fontWeight: '800', color: PAWTY_COLORS.mintDark },

  convCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: PAWTY_COLORS.border,
    minHeight: 74,
  },
  convAvatar: { width: 50, height: 50, borderRadius: 25 },
  convTitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  convTitle: { fontSize: 14, fontWeight: '800', color: PAWTY_COLORS.charcoal, flex: 1 },
  unreadBadge: {
    backgroundColor: PAWTY_COLORS.coral,
    borderRadius: 10,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  unreadText: { color: '#FFF', fontSize: 11, fontWeight: '800' },
  convCategory: { fontSize: 11, fontWeight: '700', color: PAWTY_COLORS.coral, marginTop: 2 },
  convSub: { fontSize: 12, color: PAWTY_COLORS.slate, marginTop: 3 },

  walkBubbleCard: {
    backgroundColor: '#FFF',
    borderRadius: 18,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: PAWTY_COLORS.mintDark,
  },
  walkBadge: { fontSize: 10, fontWeight: '900', color: PAWTY_COLORS.mintDark, marginBottom: 4 },
  walkTitle: { fontSize: 14, fontWeight: '800', color: PAWTY_COLORS.charcoal },
  walkMeta: { fontSize: 12, color: PAWTY_COLORS.slate, marginTop: 3 },
  walkActions: { flexDirection: 'row', gap: 8, marginTop: 12 },
  walkConfirmBtn: {
    flex: 1,
    minHeight: 44,
    backgroundColor: PAWTY_COLORS.mintSoft,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walkConfirmText: { color: PAWTY_COLORS.mintDark, fontSize: 12, fontWeight: '800' },
  walkFlakeBtn: {
    paddingHorizontal: 14,
    minHeight: 44,
    backgroundColor: PAWTY_COLORS.amberSoft,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  walkFlakeText: { color: '#B45309', fontSize: 12, fontWeight: '800' },

  roomTopBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFF',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: PAWTY_COLORS.border,
  },
  backBtn: {
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: PAWTY_COLORS.cream,
  },
  backBtnText: { fontSize: 12, fontWeight: '800', color: PAWTY_COLORS.charcoal },
  roomTitle: { fontSize: 14, fontWeight: '800', color: PAWTY_COLORS.charcoal },
  roomSub: { fontSize: 11, color: PAWTY_COLORS.mintDark, fontWeight: '600' },
  roomWalkBtn: {
    backgroundColor: PAWTY_COLORS.mintSoft,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  roomWalkBtnText: { fontSize: 11, fontWeight: '800', color: PAWTY_COLORS.mintDark },

  messagesArea: { flex: 1 },
  msgBubble: {
    maxWidth: '84%',
    padding: 12,
    borderRadius: 18,
    marginBottom: 10,
  },
  msgBubbleMe: {
    alignSelf: 'flex-end',
    backgroundColor: PAWTY_COLORS.coral,
  },
  msgBubbleOther: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF',
    borderWidth: 1,
    borderColor: PAWTY_COLORS.border,
  },
  msgBubbleWalk: {
    borderWidth: 2,
    borderColor: PAWTY_COLORS.mint,
  },
  msgSender: { fontSize: 10, fontWeight: '700', color: PAWTY_COLORS.slate, marginBottom: 4 },
  msgText: { fontSize: 13, color: PAWTY_COLORS.charcoal, lineHeight: 19 },

  composerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    paddingBottom: 95,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: PAWTY_COLORS.border,
  },
  voiceBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: PAWTY_COLORS.cream,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: PAWTY_COLORS.border,
  },
  chatInput: {
    flex: 1,
    minHeight: 44,
    backgroundColor: PAWTY_COLORS.cream,
    borderRadius: 14,
    paddingHorizontal: 14,
    fontSize: 13,
    borderWidth: 1,
    borderColor: PAWTY_COLORS.border,
  },
  sendBtn: {
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: 14,
    backgroundColor: PAWTY_COLORS.coral,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnText: { color: '#FFF', fontSize: 13, fontWeight: '800' },
});

