import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../theme';
import { ModalSheet, Chip, Button, Card } from '../../components';
import { Pet } from '../../types';

export interface RadarFilters {
  radius: number;
  species: 'all' | 'dog' | 'cat';
  size: 'all' | 'small' | 'medium' | 'large';
  verifiedOnly: boolean;
  walkingNow: boolean;
}

interface RadarFilterModalProps {
  visible: boolean;
  filters: RadarFilters;
  setFilters: (f: RadarFilters) => void;
  likesMeCount: number;
  likesMePets: Pet[];
  isVip: boolean;
  onClose: () => void;
  onApply: () => void;
  onOpenPaywall: () => void;
}

export const RadarFilterModal: React.FC<RadarFilterModalProps> = ({
  visible,
  filters,
  setFilters,
  likesMeCount,
  likesMePets,
  isVip,
  onClose,
  onApply,
  onOpenPaywall,
}) => {
  const radii = [500, 1000, 1500, 3000];

  return (
    <ModalSheet visible={visible} title="🎯 Bộ Lọc Radar PostGIS" onClose={onClose}>
      <View style={styles.section}>
        <Text style={styles.label}>Bán kính quét xung quanh ({filters.radius}m)</Text>
        <View style={styles.row}>
          {radii.map((r) => (
            <Chip
              key={r}
              label={`${r}m`}
              selected={filters.radius === r}
              onPress={() => setFilters({ ...filters, radius: r })}
            />
          ))}
        </View>

        <Text style={styles.label}>Loài thú cưng</Text>
        <View style={styles.row}>
          <Chip label="Tất cả" selected={filters.species === 'all'} onPress={() => setFilters({ ...filters, species: 'all' })} />
          <Chip label="🐶 Chó" selected={filters.species === 'dog'} onPress={() => setFilters({ ...filters, species: 'dog' })} />
          <Chip label="🐱 Mèo" selected={filters.species === 'cat'} onPress={() => setFilters({ ...filters, species: 'cat' })} />
        </View>

        <Text style={styles.label}>Kích cỡ (Phân loại theo cân nặng)</Text>
        <View style={styles.row}>
          <Chip label="Tất cả" selected={filters.size === 'all'} onPress={() => setFilters({ ...filters, size: 'all' })} tone="mint" />
          <Chip label="Nhỏ (<5kg)" selected={filters.size === 'small'} onPress={() => setFilters({ ...filters, size: 'small' })} tone="mint" />
          <Chip label="Vừa (5-15kg)" selected={filters.size === 'medium'} onPress={() => setFilters({ ...filters, size: 'medium' })} tone="mint" />
          <Chip label="Lớn (>15kg)" selected={filters.size === 'large'} onPress={() => setFilters({ ...filters, size: 'large' })} tone="mint" />
        </View>

        <View style={styles.switchRow}>
          <Text style={styles.label}>🛡️ Chỉ ghép đôi Boss đã xác minh Safe Pet</Text>
          <Switch
            value={filters.verifiedOnly}
            onValueChange={(v) => setFilters({ ...filters, verifiedOnly: v })}
            trackColor={{ true: COLORS.mintDark, false: COLORS.border }}
          />
        </View>

        <Card variant="mint" style={styles.likesBox}>
          <Text style={styles.likesTitle}>💖 Đã thích Boss của bạn ({likesMeCount})</Text>
          {isVip && likesMePets.length > 0 ? (
            <Text style={styles.likesSub}>
              Gồm: {likesMePets.map((p) => `${p.name} (${p.breed})`).join(', ')}
            </Text>
          ) : (
            <View style={styles.rowBetween}>
              <Text style={styles.likesSub}>Có {likesMeCount} Boss đang chờ bạn quẹt lại (Đã làm mờ)</Text>
              <Button title="Mở khoá VIP 👑" size="sm" variant="gold" onPress={onOpenPaywall} />
            </View>
          )}
        </Card>

        <Button title="Áp dụng bộ lọc PostGIS" onPress={onApply} />
      </View>
    </ModalSheet>
  );
};

const styles = StyleSheet.create({
  section: { gap: SPACING.sm + 2 },
  label: { ...TYPOGRAPHY.bodyBold, color: COLORS.textDark },
  row: { flexDirection: 'row', flexWrap: 'wrap' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 4 },
  likesBox: { padding: SPACING.md, marginVertical: SPACING.xs },
  likesTitle: { ...TYPOGRAPHY.bodyBold, color: '#0F766E' },
  likesSub: { ...TYPOGRAPHY.caption, color: COLORS.textBody, flex: 1, marginRight: 8 },
  rowBetween: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 },
});
