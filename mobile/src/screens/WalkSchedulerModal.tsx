import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, TextInput, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../theme';
import { HeaderBar, Card, Button, Chip, Badge } from '../components';
import { PetFriendlyPlace } from '../types';
import { api } from '../api/endpoints';
import { useActivePet, useAppConfig } from '../context';
import { useNavigation } from '../navigation/NavigationContext';

const TIME_SLOTS = ['Chiều nay • 17:30', 'Tối nay • 19:30', 'Sáng mai • 07:00', 'Cuối tuần • 16:30'];

export const WalkSchedulerModal: React.FC<{
  roomId: string;
  receiverPetId: string;
  preselectedPlace?: PetFriendlyPlace;
}> = ({ roomId, receiverPetId, preselectedPlace }) => {
  const { activePet } = useActivePet();
  const { showToast } = useAppConfig();
  const { goBack, navigate } = useNavigation();

  const [places, setPlaces] = useState<PetFriendlyPlace[]>([]);
  const [selectedPlace, setSelectedPlace] = useState<PetFriendlyPlace | null>(preselectedPlace || null);
  const [displayTime, setDisplayTime] = useState(TIME_SLOTS[1]);
  const [note, setNote] = useState('Nhớ mang dây dắt và túi nhặt vệ sinh nha Sen!');

  useEffect(() => {
    api
      .getPlaceSuggestions(activePet?.id || 'pet_bo_01', receiverPetId)
      .then((res) => {
        setPlaces(res.places);
        if (!preselectedPlace && res.places[0]) setSelectedPlace(res.places[0]);
      })
      .catch(() => {});
  }, [activePet?.id, receiverPetId, preselectedPlace]);

  const handleCreate = async () => {
    if (!selectedPlace) return;
    await api.createAppointment({
      roomId,
      receiverPetId,
      scheduledTime: new Date(Date.now() + 30 * 60000).toISOString(),
      displayTime,
      placeId: selectedPlace.id,
      placeName: selectedPlace.name,
      placeAddress: selectedPlace.address,
      placeThumbnail: selectedPlace.thumbnailUrl,
      placeLat: selectedPlace.lat,
      placeLng: selectedPlace.lng,
      note,
    });
    showToast('📅 Đã gửi lời mời hẹn dắt Boss dạo chung!', 'success');
    goBack();
  };

  return (
    <View style={styles.screen}>
      <HeaderBar
        title="📅 Lên Kèo Hẹn Đi Dạo Trung Điểm"
        subtitle="PostGIS tự động tính trung điểm giữa 2 Boss"
        rightElement={<Button title="Tìm thêm" size="sm" variant="outline" onPress={() => navigate('Places', { returnToRoomId: roomId, receiverPetId })} />}
      />
      <ScrollView contentContainerStyle={styles.content}>
        <Badge text="🧭 ST_Centroid: 3 Địa điểm Pet-Friendly gần trung điểm nhất" tone="mint" />

        {places.map((pl) => {
          const isSelected = selectedPlace?.id === pl.id;
          return (
            <TouchableOpacity key={pl.id} onPress={() => setSelectedPlace(pl)} activeOpacity={0.85}>
              <Card variant={isSelected ? 'mint' : 'white'} style={styles.placeCard}>
                <Image source={{ uri: pl.thumbnailUrl }} style={styles.thumb} />
                <View style={{ flex: 1 }}>
                  <Text style={styles.placeName}>{pl.name}</Text>
                  <Text style={styles.placeAddr}>{pl.address}</Text>
                  <Text style={styles.rating}>⭐ {pl.ratingAvg} ({pl.reviewsCount} đánh giá) • Cách trung điểm {pl.distanceMeters || 210}m</Text>
                </View>
                {isSelected && <Badge text="Đã chọn" tone="coral" />}
              </Card>
            </TouchableOpacity>
          );
        })}

        <Card style={styles.formCard}>
          <Text style={styles.label}>Chọn khung giờ hẹn dắt dạo</Text>
          <View style={styles.chipsRow}>
            {TIME_SLOTS.map((slot) => (
              <Chip key={slot} label={slot} selected={displayTime === slot} onPress={() => setDisplayTime(slot)} />
            ))}
          </View>
          <Text style={styles.label}>Lời nhắn / Lưu ý cho buổi hẹn</Text>
          <TextInput style={styles.input} value={note} onChangeText={setNote} />
          <Button title="🐾 Gửi Lời Mời Vào Phòng Chat" onPress={handleCreate} />
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.cream },
  content: { padding: SPACING.md, gap: SPACING.sm + 2 },
  placeCard: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, padding: SPACING.md },
  thumb: { width: 64, height: 64, borderRadius: RADIUS.md },
  placeName: { ...TYPOGRAPHY.bodyBold, color: COLORS.textDark },
  placeAddr: { ...TYPOGRAPHY.caption, color: COLORS.textMuted },
  rating: { ...TYPOGRAPHY.caption, color: COLORS.coralDark, fontWeight: '700', marginTop: 2 },
  formCard: { gap: SPACING.sm },
  label: { ...TYPOGRAPHY.bodyBold, color: COLORS.textDark },
  chipsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  input: {
    backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    ...TYPOGRAPHY.body, color: COLORS.textDark,
  },
});
