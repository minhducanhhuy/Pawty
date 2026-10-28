import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, TextInput, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../theme';
import { HeaderBar, Card, Chip, Badge, Button } from '../components';
import { PetFriendlyPlace, PlaceCategory } from '../types';
import { api } from '../api/endpoints';
import { useNavigation } from '../navigation/NavigationContext';

const CATEGORIES: { key: 'all' | PlaceCategory; label: string }[] = [
  { key: 'all', label: '🌟 Tất cả' },
  { key: 'park', label: '🌳 Công viên' },
  { key: 'cafe', label: '☕ Pet Cafe' },
  { key: 'spa', label: '🛁 Pet Spa' },
  { key: 'vet', label: '🏥 Thú y' },
  { key: 'shop', label: '🦴 Pet Shop' },
  { key: 'hotel', label: '🏨 Khách sạn' },
];

export const PlacesScreen: React.FC<{
  returnToRoomId?: string;
  receiverPetId?: string;
}> = ({ returnToRoomId, receiverPetId }) => {
  const { navigate } = useNavigation();
  const [places, setPlaces] = useState<PetFriendlyPlace[]>([]);
  const [category, setCategory] = useState<'all' | PlaceCategory>('all');
  const [query, setQuery] = useState('');

  useEffect(() => {
    api.getPlaces().then((res) => setPlaces(res.items)).catch(() => {});
  }, []);

  const filtered = places.filter((p) => {
    const matchCat = category === 'all' || p.category === category;
    const matchQ = !query.trim() || p.name.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQ;
  });

  return (
    <View style={styles.screen}>
      <HeaderBar title="📍 Địa Điểm Pet-Friendly" subtitle="Công viên, Cafe, Spa thân thiện thú cưng" />
      <View style={styles.filterBox}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 Tìm tên địa điểm hoặc khu vực..."
          placeholderTextColor={COLORS.textMuted}
          value={query}
          onChangeText={setQuery}
        />
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {CATEGORIES.map((c) => (
            <Chip
              key={c.key}
              label={c.label}
              selected={category === c.key}
              onPress={() => setCategory(c.key)}
            />
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {filtered.map((pl) => (
          <TouchableOpacity
            key={pl.id}
            activeOpacity={0.88}
            onPress={() => navigate('PlaceDetail', { placeId: pl.id, returnToRoomId, receiverPetId })}
          >
            <Card style={styles.placeCard}>
              <Image source={{ uri: pl.thumbnailUrl }} style={styles.thumb} />
              <View style={{ flex: 1, gap: 4 }}>
                <View style={styles.rowBetween}>
                  <Badge text={pl.category.toUpperCase()} tone="mint" />
                  <Text style={styles.rating}>⭐ {pl.ratingAvg} ({pl.reviewsCount})</Text>
                </View>
                <Text style={styles.name}>{pl.name}</Text>
                <Text style={styles.addr}>📍 {pl.address}</Text>
                <Button
                  title="Chọn làm điểm hẹn →"
                  size="sm"
                  variant="mint"
                  onPress={() =>
                    navigate('WalkScheduler', {
                      roomId: returnToRoomId || 'room_mochi_01',
                      receiverPetId: receiverPetId || 'pet_mochi_02',
                      preselectedPlace: pl,
                    })
                  }
                />
              </View>
            </Card>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.cream },
  filterBox: { padding: SPACING.md, gap: SPACING.sm, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  searchInput: {
    backgroundColor: COLORS.cream, borderRadius: RADIUS.pill, paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs + 3, borderWidth: 1, borderColor: COLORS.border, ...TYPOGRAPHY.body, color: COLORS.textDark,
  },
  content: { padding: SPACING.md, gap: SPACING.md },
  placeCard: { flexDirection: 'row', gap: SPACING.md, padding: SPACING.md, alignItems: 'center' },
  thumb: { width: 88, height: 88, borderRadius: RADIUS.lg },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rating: { ...TYPOGRAPHY.caption, color: COLORS.goldDark, fontWeight: '800' },
  name: { ...TYPOGRAPHY.bodyBold, color: COLORS.textDark },
  addr: { ...TYPOGRAPHY.caption, color: COLORS.textMuted },
});
