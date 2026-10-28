import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../theme';
import { ModalSheet, Avatar, Button, Chip, Badge } from '../../components';
import { Pet, Species } from '../../types';

interface BossSwitcherModalProps {
  visible: boolean;
  pets: Pet[];
  activePetId?: string;
  maxPets: number;
  onSelectPet: (petId: string) => void;
  onAddBoss: (data: Partial<Pet>) => Promise<void>;
  onOpenPaywall: () => void;
  onClose: () => void;
}

export const BossSwitcherModal: React.FC<BossSwitcherModalProps> = ({
  visible,
  pets,
  activePetId,
  maxPets,
  onSelectPet,
  onAddBoss,
  onOpenPaywall,
  onClose,
}) => {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState('');
  const [species, setSpecies] = useState<Species>('dog');
  const [breed, setBreed] = useState('Poodle');
  const [weight, setWeight] = useState('4.5');

  const canAddMore = pets.length < maxPets;

  const handleCreate = async () => {
    if (!name.trim()) return;
    await onAddBoss({
      name: name.trim(),
      species,
      breed,
      weightKg: parseFloat(weight) || 4.5,
      isVaccinated: true,
    });
    setName('');
    setAdding(false);
    onClose();
  };

  return (
    <ModalSheet visible={visible} title="🐾 Chuyển Đổi & Quản Lý Boss" onClose={onClose}>
      <View style={styles.container}>
        <Text style={styles.quotaText}>
          Số lượng Boss hiện tại: {pets.length}/{maxPets} (Theo hạng thành viên)
        </Text>
        {pets.map((p) => {
          const isCurrent = p.id === activePetId;
          return (
            <TouchableOpacity
              key={p.id}
              style={[styles.petRow, isCurrent && styles.petRowActive]}
              onPress={() => {
                onSelectPet(p.id);
                onClose();
              }}
            >
              <Avatar uri={p.avatarUrl} size={46} isVip={p.isSafePet} />
              <View style={{ flex: 1 }}>
                <Text style={styles.petName}>{p.name} ({p.breed})</Text>
                <Text style={styles.petSub}>{p.weightKg}kg • {p.isSafePet ? 'Safe Pet ✓' : 'Chưa xác minh'}</Text>
              </View>
              {isCurrent && <Badge text="Đang chọn" tone="coral" />}
            </TouchableOpacity>
          );
        })}

        {!adding ? (
          canAddMore ? (
            <Button title="+ Thêm Hồ Sơ Boss Mới" variant="mint" onPress={() => setAdding(true)} />
          ) : (
            <Button
              title="👑 Nâng VIP/VIP+ để thêm nhiều Boss (Tối đa 5)"
              variant="gold"
              onPress={onOpenPaywall}
            />
          )
        ) : (
          <View style={styles.formBox}>
            <Text style={styles.formTitle}>Tạo nhanh Boss mới</Text>
            <View style={styles.row}>
              <Chip label="🐶 Chó" selected={species === 'dog'} onPress={() => setSpecies('dog')} />
              <Chip label="🐱 Mèo" selected={species === 'cat'} onPress={() => setSpecies('cat')} />
            </View>
            <TextInput style={styles.input} placeholder="Tên Boss mới" value={name} onChangeText={setName} />
            <View style={styles.row}>
              <TextInput style={[styles.input, { flex: 2 }]} placeholder="Giống loài" value={breed} onChangeText={setBreed} />
              <TextInput style={[styles.input, { flex: 1 }]} placeholder="Cân nặng (kg)" value={weight} onChangeText={setWeight} keyboardType="decimal-pad" />
            </View>
            <View style={styles.row}>
              <Button title="Lưu Boss" onPress={handleCreate} style={{ flex: 1 }} />
              <Button title="Huỷ" variant="outline" onPress={() => setAdding(false)} />
            </View>
          </View>
        )}
      </View>
    </ModalSheet>
  );
};

const styles = StyleSheet.create({
  container: { gap: SPACING.sm + 2 },
  quotaText: { ...TYPOGRAPHY.caption, color: COLORS.textMuted },
  petRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.md,
    padding: SPACING.md, borderRadius: RADIUS.lg, backgroundColor: COLORS.white,
    borderWidth: 1, borderColor: COLORS.border,
  },
  petRowActive: { borderColor: COLORS.coral, backgroundColor: COLORS.coralLight },
  petName: { ...TYPOGRAPHY.bodyBold, color: COLORS.textDark },
  petSub: { ...TYPOGRAPHY.caption, color: COLORS.textMuted },
  formBox: { gap: SPACING.sm, padding: SPACING.md, backgroundColor: COLORS.white, borderRadius: RADIUS.lg, borderWidth: 1, borderColor: COLORS.border },
  formTitle: { ...TYPOGRAPHY.bodyBold, color: COLORS.coral },
  row: { flexDirection: 'row', gap: SPACING.sm, alignItems: 'center' },
  input: {
    backgroundColor: COLORS.cream, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    ...TYPOGRAPHY.body, color: COLORS.textDark,
  },
});
