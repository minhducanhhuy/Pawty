import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ScrollView, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../theme';
import { HeaderBar, Button, Chip, ModalSheet } from '../components';
import { AppointmentBubble } from './chat/AppointmentBubble';
import { ChatMessage, ChatRoom } from '../types';
import { api } from '../api/endpoints';
import { useAuth, useActivePet, useAppConfig, useNotifications } from '../context';
import { useNavigation } from '../navigation/NavigationContext';
import { useTranslation } from '../i18n';

export const ChatRoomScreen: React.FC<{ roomId: string }> = ({ roomId }) => {
  const { user } = useAuth();
  const { activePet } = useActivePet();
  const { showToast } = useAppConfig();
  const { socket, emitSocket } = useNotifications();
  const { navigate, goBack } = useNavigation();
  const { t } = useTranslation();

  const [room, setRoom] = useState<ChatRoom | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [icebreakers, setIcebreakers] = useState<string[]>([]);
  const [inputText, setInputText] = useState('');
  const [partnerTyping, setPartnerTyping] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const typingTimeoutRef = useRef<any>(null);

  const loadRoom = useCallback(async () => {
    try {
      const rooms = await api.getChatRooms();
      const currentRoom = rooms.find((r) => r.id === roomId) || rooms[0];
      setRoom(currentRoom);
      const msgs = await api.getMessages(roomId);
      setMessages(msgs.items || []);
      const ice = await api.getIcebreakers(roomId);
      setIcebreakers(ice.suggestions || []);
      emitSocket('join_room', { roomId });
      emitSocket('mark_read', { roomId });
    } catch (err) {
      console.error('Load chat room error:', err);
    }
  }, [roomId, emitSocket]);

  useEffect(() => {
    loadRoom();
  }, [loadRoom]);

  // Real Socket.io Event Listeners
  useEffect(() => {
    if (!socket) return;

    const handleReceiveMessage = (incoming: any) => {
      if (incoming.roomId === roomId) {
        setMessages((prev) => {
          // Avoid duplicate insertion
          if (prev.some((m) => m.id === incoming.id)) return prev;
          const newMsg: ChatMessage = {
            id: incoming.id,
            roomId: incoming.roomId,
            senderPetId: incoming.senderPetId,
            text: incoming.text,
            status: incoming.status || 'delivered',
            createdAt: incoming.timestamp || 'Vừa xong',
            appointmentId: incoming.appointmentId,
          };
          return [...prev, newMsg];
        });
      }
    };

    const handleTyping = (data: { roomId: string; userId: string; isTyping: boolean }) => {
      if (data.roomId === roomId) {
        setPartnerTyping(Boolean(data.isTyping));
      }
    };

    const handleMessagesRead = (data: { roomId: string }) => {
      if (data.roomId === roomId) {
        setMessages((prev) => prev.map((m) => ({ ...m, status: 'read' })));
      }
    };

    socket.on('receive_message', handleReceiveMessage);
    socket.on('typing', handleTyping);
    socket.on('messages_read', handleMessagesRead);

    return () => {
      socket.off('receive_message', handleReceiveMessage);
      socket.off('typing', handleTyping);
      socket.off('messages_read', handleMessagesRead);
    };
  }, [socket, roomId]);

  const handleInputChange = (text: string) => {
    setInputText(text);
    emitSocket('typing', { roomId, isTyping: text.length > 0 });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    typingTimeoutRef.current = setTimeout(() => {
      emitSocket('typing', { roomId, isTyping: false });
    }, 2000);
  };

  const sendMessage = (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed) return;

    const senderPetId = activePet?.id || (user?.id ? `pet_${user.id}` : 'pet_me');
    const myMsg: ChatMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      roomId,
      senderPetId,
      text: trimmed,
      status: 'delivered',
      createdAt: 'Vừa xong',
    };

    setMessages((prev) => [...prev, myMsg]);
    setInputText('');

    // Emit real duplex Socket message to server
    emitSocket('send_message', {
      roomId,
      text: trimmed,
      senderPetId,
    });
    emitSocket('typing', { roomId, isTyping: false });
  };

  const handleStatusUpdate = async (status: 'confirmed' | 'rejected' | 'reported_flake') => {
    if (!room?.activeAppointment) return;
    try {
      const updated = await api.updateAppointmentStatus(room.activeAppointment.id, status);
      setRoom({ ...room, activeAppointment: updated });
      showToast(
        status === 'confirmed'
          ? '✅ Đã chốt kèo đi dạo!'
          : status === 'reported_flake'
          ? '⚠️ Đã gửi báo cáo bùng kèo!'
          : 'Đã từ chối lời mời.',
        'info'
      );
    } catch (err) {
      console.error('Update appointment status error:', err);
    }
  };

  const myPetId = activePet?.id || (user?.id ? `pet_${user.id}` : 'pet_me');
  const partnerName = room?.partnerPet?.name || 'Bạn mới';
  const myPetName = activePet?.name || 'Boss';

  return (
    <View style={styles.screen}>
      <HeaderBar
        title={`${partnerName} & ${myPetName}`}
        subtitle={
          partnerTyping
            ? `${partnerName} ${t('chat.typing')}`
            : room?.partnerPet?.condoComplex || 'Khu dân cư'
        }
        rightElement={
          <View style={styles.headerBtns}>
            <Button
              title={t('chat.scheduleBtn')}
              size="sm"
              variant="mint"
              onPress={() =>
                navigate('WalkScheduler', {
                  roomId,
                  receiverPetId: room?.partnerPet?.id || 'pet_receiver',
                })
              }
            />
            <TouchableOpacity style={styles.moreBtn} onPress={() => setMenuOpen(true)}>
              <Text style={styles.moreText}>⋯</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <ScrollView contentContainerStyle={styles.messagesList}>
        {room?.activeAppointment && (
          <AppointmentBubble
            appointment={room.activeAppointment}
            onUpdateStatus={handleStatusUpdate}
            onCheckIn={() =>
              room.activeAppointment &&
              navigate('CheckIn', { appointment: room.activeAppointment })
            }
            onLiveLocation={() =>
              room.activeAppointment &&
              navigate('LiveLocation', { roomId, appointment: room.activeAppointment })
            }
          />
        )}

        {icebreakers.length > 0 && (
          <View style={styles.icebreakerBox}>
            <Text style={styles.iceTitle}>{t('chat.icebreakerTitle')}</Text>
            {icebreakers.map((ic, idx) => (
              <Chip key={idx} label={ic} tone="mint" onPress={() => sendMessage(ic)} />
            ))}
          </View>
        )}

        {messages.map((m) => {
          const isMe = m.senderPetId === myPetId;
          return (
            <View
              key={m.id}
              style={[styles.bubble, isMe ? styles.bubbleMe : styles.bubblePartner]}
            >
              {m.text && (
                <Text style={[styles.msgText, isMe && { color: COLORS.white }]}>
                  {m.text}
                </Text>
              )}
              <Text style={[styles.metaText, isMe && { color: '#FFE4E1' }]}>
                {m.createdAt} {isMe ? (m.status === 'read' ? '• ✓✓ Đã xem' : '• ✓ Đã gửi') : ''}
              </Text>
            </View>
          );
        })}
      </ScrollView>

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={handleInputChange}
          placeholder="Nhập tin nhắn hẹn dạo..."
          placeholderTextColor={COLORS.textMuted}
        />
        <Button title="Gửi" size="sm" onPress={() => sendMessage(inputText)} />
      </View>

      <ModalSheet
        visible={menuOpen}
        title="🛡️ An Toàn & Bảo Mật Phòng Chat"
        onClose={() => setMenuOpen(false)}
      >
        <View style={{ gap: SPACING.sm }}>
          <Button
            title="🐾 Xem hồ sơ chi tiết Boss"
            variant="outline"
            onPress={() => {
              setMenuOpen(false);
              navigate('PetDetail', { petId: room?.partnerPet?.id || 'pet_receiver' });
            }}
          />
          <Button
            title="⚠️ Báo cáo vi phạm (Spam / Quấy rối)"
            variant="gold"
            onPress={async () => {
              if (room?.partnerPet?.userId) {
                await api.createReport('user', room.partnerPet.userId, 'harassment');
              }
              setMenuOpen(false);
              showToast('🛡️ Đã gửi báo cáo cho Admin!', 'success');
            }}
          />
          <Button
            title="🚫 Chặn người dùng này (2 chiều)"
            variant="danger"
            onPress={async () => {
              if (room?.partnerPet?.userId) {
                await api.blockUser(room.partnerPet.userId);
              }
              setMenuOpen(false);
              showToast('🚫 Đã chặn người dùng 2 chiều.', 'info');
              goBack();
            }}
          />
        </View>
      </ModalSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.creamWarm },
  headerBtns: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  moreBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.creamWarm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreText: { fontSize: 18, fontWeight: '800', color: COLORS.textDark },
  messagesList: { padding: SPACING.md, gap: SPACING.sm, paddingBottom: 24 },
  icebreakerBox: {
    backgroundColor: COLORS.white,
    padding: SPACING.sm + 2,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 4,
  },
  iceTitle: {
    ...TYPOGRAPHY.caption,
    color: COLORS.coralDark,
    fontWeight: '800',
    marginBottom: 6,
  },
  bubble: { maxWidth: '82%', padding: SPACING.sm + 4, borderRadius: RADIUS.lg },
  bubbleMe: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.coral,
    borderBottomRightRadius: 4,
  },
  bubblePartner: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.white,
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  msgText: { ...TYPOGRAPHY.body, color: COLORS.textDark },
  metaText: {
    ...TYPOGRAPHY.caption,
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 3,
    textAlign: 'right',
  },
  inputBar: {
    flexDirection: 'row',
    padding: SPACING.sm + 2,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.sm,
    alignItems: 'center',
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.cream,
    borderRadius: RADIUS.pill,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 4,
    borderWidth: 1,
    borderColor: COLORS.border,
    ...TYPOGRAPHY.body,
    color: COLORS.textDark,
  },
});
