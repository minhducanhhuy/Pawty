import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, TextInput, Image, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../theme';
import { HeaderBar, Card, Button, Chip, Badge } from '../components';
import { PetFriendlyPlace } from '../types';
import { api } from '../api/endpoints';
import { useAppConfig } from '../context';
import { useNavigation } from '../navigation/NavigationContext';

export const PlaceDetailScreen: React.FC<{
  placeId: string;
  returnToRoomId?: string;
  receiverPetId?: string;
}> = ({ placeId, returnToRoomId, receiverPetId }) => {
  const { showToast } = useAppConfig();
  const { navigate } = useNavigation();

  const [place, setPlace] = useState<PetFriendlyPlace | null>(null);
  const [rating, setRating] = useState(5);
  const [reviewText, setReviewText] = useState('');

  useEffect(() => {
    api.getPlaceById(placeId).then(setPlace).catch(() => {});
  }, [placeId]);

  if (!place) return null;

  const handleAddReview = async () => {
    if (!reviewText.trim()) return;
    const rv = await api.addPlaceReview(place.id, rating, reviewText.trim());
    setPlace({
      ...place,
      reviewsCount: place.reviewsCount + 1,
      reviews: [rv, ...(place.reviews || [])],
    });
    setReviewText('');
    showToast('⭐ Cảm ơn bạn đã đánh giá địa điểm Pet-Friendly!', 'success');
  };

  return (
    <View style={styles.screen}>
      <HeaderBar title={place.name} subtitle={`⭐ ${place.ratingAvg} (${place.reviewsCount} đánh giá)`} />
      <ScrollView contentContainerStyle={styles.content}>
        <Card style={styles.heroCard}>
          <Image source={{ uri: place.thumbnailUrl }} style={styles.cover} />
          <View style={styles.rowBetween}>
            <Badge text={`Danh mục: ${place.category.toUpperCase()}`} tone="mint" />
            <Badge text={`Cách bạn ${place.distanceMeters || 210}m`} tone="coral" />
          </View>
          <Text style={styles.title}>{place.name}</Text>
          <Text style={styles.addr}>📍 {place.address}</Text>
          <Button
            title="📅 Chọn Làm Điểm Hẹn Dắt Dạo Ngay"
            onPress={() =>
              navigate('WalkScheduler', {
                roomId: returnToRoomId || 'room_mochi_01',
                receiverPetId: receiverPetId || 'pet_mochi_02',
                preselectedPlace: place,
              })
            }
          />
        </Card>

        <Card style={styles.reviewForm}>
          <Text style={styles.sectionTitle}>✍️ Viết Đánh Giá Của Bạn</Text>
          <View style={styles.starsRow}>
            {[1, 2, 3, 4, 5].map((s) => (
              <Chip key={s} label={`${s} ⭐`} selected={rating === s} onPress={() => setRating(s)} tone="gold" />
            ))}
          </View>
          <TextInput
            style={styles.input}
            placeholder="Không gian có rộng rãi, thân thiện với Boss không?..."
            value={reviewText}
            onChangeText={setReviewText}
          />
          <Button title="Gửi Đánh Giá" size="sm" variant="mint" onPress={handleAddReview} />
        </Card>

        <Text style={styles.sectionTitle}>💬 Đánh Giá Mới Nhất ({place.reviews?.length || 0})</Text>
        {(place.reviews || []).map((rv) => (
          <Card key={rv.id} style={styles.rvCard}>
            <View style={styles.rowBetween}>
              <Text style={styles.rvUser}>{rv.userName}</Text>
              <Badge text={`${rv.rating} ⭐`} tone="gold" />
            </View>
            <Text style={styles.rvText}>{rv.text}</Text>
          </Card>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.cream },
  content: { padding: SPACING.md, gap: SPACING.md, paddingBottom: 32 },
  heroCard: { gap: SPACING.sm },
  cover: { width: '100%', height: 180, borderRadius: RADIUS.lg },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { ...TYPOGRAPHY.h3, color: COLORS.textDark },
  addr: { ...TYPOGRAPHY.body, color: COLORS.textMuted },
  reviewForm: { gap: SPACING.sm },
  sectionTitle: { ...TYPOGRAPHY.bodyBold, color: COLORS.textDark },
  starsRow: { flexDirection: 'row', flexWrap: 'wrap' },
  input: {
    backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    ...TYPOGRAPHY.body, color: COLORS.textDark,
  },
  rvCard: { gap: 4, padding: SPACING.md },
  rvUser: { ...TYPOGRAPHY.bodyBold, color: COLORS.textDark },
  rvText: { ...TYPOGRAPHY.body, color: COLORS.textBody },
});
