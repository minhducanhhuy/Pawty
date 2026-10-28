import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../theme';
import { Card, Avatar, Badge, EmptyState } from '../components';
import { ChatRoom } from '../types';
import { api } from '../api/endpoints';
import { useNavigation } from '../navigation/NavigationContext';
import { useTranslation } from '../i18n';

export const ChatListScreen: React.FC = () => {
  const { navigate } = useNavigation();
  const { t } = useTranslation();
  const [rooms, setRooms] = useState<ChatRoom[]>([]);

  useEffect(() => {
    api.getChatRooms().then(setRooms).catch(() => {});
  }, []);

  return (
    <View style={styles.screen}>
      <View style={styles.topHeader}>
        <Text style={styles.title}>💬 {t('chat.title')}</Text>
        <TouchableOpacity style={styles.placesBtn} onPress={() => navigate('Places')}>
          <Text style={styles.placesBtnText}>📍 Địa điểm Pet-Friendly</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {rooms.length === 0 ? (
          <EmptyState
            icon="💬"
            title="Chưa có cuộc trò chuyện nào"
            subtitle="Hãy quẹt thích Boss trên Radar để bắt đầu nhắn tin hẹn dạo!"
          />
        ) : (
          rooms.map((room) => (
            <TouchableOpacity
              key={room.id}
              activeOpacity={0.85}
              onPress={() => navigate('ChatRoom', { roomId: room.id })}
            >
              <Card style={styles.roomCard}>
                <View style={styles.row}>
                  <Avatar
                    uri={room.partnerPet.avatarUrl}
                    size={56}
                    isVip={room.partnerPet.ownerIsVip}
                    isWalkingNow
                  />
                  <View style={{ flex: 1, gap: 2 }}>
                    <View style={styles.rowBetween}>
                      <Text style={styles.partnerName}>
                        {room.partnerPet.name} ({room.partnerPet.breed})
                      </Text>
                      <Text style={styles.time}>{room.lastMessageAt}</Text>
                    </View>
                    <Text style={styles.lastMsg} numberOfLines={1}>
                      {room.lastMessageText}
                    </Text>
                    {room.activeAppointment && (
                      <View style={styles.aptBanner}>
                        <Text style={styles.aptText} numberOfLines={1}>
                          🗓️ Kèo hẹn: {room.activeAppointment.displayTime} @ {room.activeAppointment.placeName}
                        </Text>
                      </View>
                    )}
                  </View>
                  {room.unreadCount > 0 && <Badge text={`${room.unreadCount}`} tone="coral" />}
                </View>
              </Card>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.cream },
  topHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm + 2,
    backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  title: { ...TYPOGRAPHY.h3, color: COLORS.textDark },
  placesBtn: { backgroundColor: COLORS.mintLight, paddingHorizontal: 10, paddingVertical: 5, borderRadius: RADIUS.pill },
  placesBtnText: { ...TYPOGRAPHY.caption, color: '#0F766E', fontWeight: '800' },
  content: { padding: SPACING.md, gap: SPACING.sm + 2 },
  roomCard: { padding: SPACING.md },
  row: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  partnerName: { ...TYPOGRAPHY.bodyBold, color: COLORS.textDark },
  time: { ...TYPOGRAPHY.caption, color: COLORS.textMuted },
  lastMsg: { ...TYPOGRAPHY.body, color: COLORS.textMuted },
  aptBanner: {
    backgroundColor: COLORS.mintLight, paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: RADIUS.sm, marginTop: 4, borderLeftWidth: 3, borderLeftColor: COLORS.mintDark,
  },
  aptText: { ...TYPOGRAPHY.caption, fontSize: 11, color: '#0F766E', fontWeight: '700' },
});
