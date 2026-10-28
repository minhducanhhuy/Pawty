import React from 'react';
import { View, Text, TextInput, StyleSheet, Switch, TouchableOpacity } from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../theme';
import { Chip } from '../../components';
import { Species } from '../../types';

const DOG_BREEDS = ['Corgi Pembroke', 'Poodle', 'Golden Retriever', 'Shiba Inu', 'Pug', 'Husky'];
const CAT_BREEDS = ['Mèo Anh Lông Ngắn', 'Mèo Mướp', 'Ragdoll', 'Munchkin', 'Scottish Fold'];
const ALL_TAGS = ['Tăng động', 'Thân thiện', 'Mê đồ ăn', 'Quý tộc', 'Ngoan ngoãn', 'Bám người', 'Ham ngủ'];

interface PetProfileStepProps {
  species: Species;
  setSpecies: (s: Species) => void;
  petName: string;
  setPetName: (v: string) => void;
  breed: string;
  setBreed: (v: string) => void;
  weightStr: string;
  setWeightStr: (v: string) => void;
  isVaccinated: boolean;
  setIsVaccinated: (v: boolean) => void;
  tags: string[];
  setTags: (tags: string[]) => void;
  petBio: string;
  setPetBio: (v: string) => void;
  onContinue: () => void;
}

export const PetProfileStep: React.FC<PetProfileStepProps> = ({
  species,
  setSpecies,
  petName,
  setPetName,
  breed,
  setBreed,
  weightStr,
  setWeightStr,
  isVaccinated,
  setIsVaccinated,
  tags,
  setTags,
  petBio,
  setPetBio,
  onContinue,
}) => {
  const breeds = species === 'dog' ? DOG_BREEDS : CAT_BREEDS;
  const weightNum = parseFloat(weightStr) || 5;
  const sizeLabel = weightNum < 5 ? 'Nhỏ (<5kg)' : weightNum <= 15 ? 'Vừa (5-15kg)' : 'Lớn (>15kg)';
  const canContinue = petName.trim().length > 0;

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) setTags(tags.filter((x) => x !== tag));
    else if (tags.length < 4) setTags([...tags, tag]);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>HỒ SƠ BOSS ĐỒNG HÀNH</Text>
        <Text style={styles.title}>Giới thiệu Boss của bạn</Text>
        <Text style={styles.subtitle}>Boss sẽ xuất hiện cùng bạn trên chiếc thẻ ghép đôi độc đáo của Pawty.</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.speciesRow}>
          <TouchableOpacity
            style={[styles.speciesBtn, species === 'dog' && styles.speciesBtnActive]}
            onPress={() => { setSpecies('dog'); setBreed(DOG_BREEDS[0]); }}
          >
            <Text style={styles.speciesIcon}>🐶</Text>
            <Text style={[styles.speciesText, species === 'dog' && styles.speciesTextActive]}>Cún cưng (Chó)</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.speciesBtn, species === 'cat' && styles.speciesBtnActive]}
            onPress={() => { setSpecies('cat'); setBreed(CAT_BREEDS[0]); }}
          >
            <Text style={styles.speciesIcon}>🐱</Text>
            <Text style={[styles.speciesText, species === 'cat' && styles.speciesTextActive]}>Hoàng thượng (Mèo)</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 2 }]}>
            <Text style={styles.label}>Tên của Boss *</Text>
            <TextInput
              style={styles.input}
              value={petName}
              onChangeText={setPetName}
              placeholder="VD: Bơ Lùn, Mochi, Milo..."
              placeholderTextColor={COLORS.textMuted}
            />
          </View>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Cân nặng ({sizeLabel})</Text>
            <TextInput
              style={styles.input}
              value={weightStr}
              onChangeText={setWeightStr}
              keyboardType="decimal-pad"
              placeholder="Kg"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Giống loài</Text>
          <View style={styles.chipsWrap}>
            {breeds.map((b) => (
              <Chip key={b} label={b} selected={breed === b} onPress={() => setBreed(b)} tone="mint" />
            ))}
          </View>
        </View>

        <View style={styles.switchBox}>
          <View style={{ flex: 1, paddingRight: 8 }}>
            <Text style={styles.switchTitle}>🛡️ Tiêm phòng 7 bệnh & Phòng dại</Text>
            <Text style={styles.switchSub}>Nhận huy hiệu Safe Pet để được ưu tiên ghép đôi an toàn.</Text>
          </View>
          <Switch
            value={isVaccinated}
            onValueChange={setIsVaccinated}
            trackColor={{ true: COLORS.mintDark, false: COLORS.border }}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Tính cách nổi bật (Chọn tối đa 4 tag - {tags.length}/4)</Text>
          <View style={styles.chipsWrap}>
            {ALL_TAGS.map((t) => (
              <Chip key={t} label={`#${t}`} selected={tags.includes(t)} onPress={() => toggleTag(t)} />
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Lời nhắn gửi từ Boss (Tùy chọn)</Text>
          <TextInput
            style={styles.input}
            value={petBio}
            onChangeText={setPetBio}
            placeholder="VD: Rất ngoan, thích giao lưu bạn mới, không cắn linh tinh..."
            placeholderTextColor={COLORS.textMuted}
          />
        </View>

        <TouchableOpacity
          style={[styles.continueBtn, !canContinue && styles.continueBtnDisabled]}
          disabled={!canContinue}
          onPress={onContinue}
          activeOpacity={0.85}
        >
          <Text style={styles.continueBtnText}>Xem trước hồ sơ thẻ ghép đôi →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { paddingVertical: SPACING.sm },
  header: { marginBottom: SPACING.md },
  eyebrow: { ...TYPOGRAPHY.caption, color: COLORS.coral, fontWeight: '800', letterSpacing: 1, marginBottom: 4 },
  title: { ...TYPOGRAPHY.h2, color: COLORS.textDark, marginBottom: 4 },
  subtitle: { ...TYPOGRAPHY.body, fontSize: 13, color: COLORS.textMuted, lineHeight: 18 },
  form: { gap: SPACING.md },
  speciesRow: { flexDirection: 'row', gap: SPACING.sm },
  speciesBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: SPACING.sm + 4,
    backgroundColor: COLORS.white,
    borderWidth: 1.5,
    borderColor: COLORS.border,
    borderRadius: RADIUS.lg,
  },
  speciesBtnActive: { borderColor: COLORS.coral, backgroundColor: '#FFF7F5' },
  speciesIcon: { fontSize: 20 },
  speciesText: { ...TYPOGRAPHY.bodyBold, color: COLORS.textMuted, fontSize: 13 },
  speciesTextActive: { color: COLORS.coral },
  field: { gap: 6 },
  label: { ...TYPOGRAPHY.caption, color: COLORS.textDark, fontWeight: '700' },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm + 2,
    ...TYPOGRAPHY.body,
    color: COLORS.textDark,
  },
  row: { flexDirection: 'row', gap: SPACING.sm },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  switchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.mintLight,
    padding: SPACING.md,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.mintDark,
  },
  switchTitle: { ...TYPOGRAPHY.bodyBold, color: '#0F766E', fontSize: 13 },
  switchSub: { ...TYPOGRAPHY.caption, color: '#115E59', fontSize: 11, marginTop: 2 },
  continueBtn: {
    backgroundColor: COLORS.coral,
    paddingVertical: SPACING.md,
    borderRadius: RADIUS.xl,
    alignItems: 'center',
    marginTop: SPACING.sm,
  },
  continueBtnDisabled: { backgroundColor: COLORS.border },
  continueBtnText: { ...TYPOGRAPHY.bodyBold, color: COLORS.white, fontSize: 15 },
});
