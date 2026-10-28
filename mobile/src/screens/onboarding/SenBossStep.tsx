import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, Switch } from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../theme';
import { Button, Card, Chip } from '../../components';
import { Species } from '../../types';
import { useTranslation } from '../../i18n';

const CONDOS = ['Vinhomes Central Park - Park 3', 'Masteri Thảo Điền', 'Sala Thủ Thiêm', 'Times City'];
const DOG_BREEDS = ['Corgi Pembroke', 'Shiba Inu', 'Poodle', 'Golden Retriever', 'Pug'];
const CAT_BREEDS = ['Mèo Anh Lông Ngắn', 'Ragdoll', 'Munchkin', 'Scottish Fold'];
const ALL_TAGS = ['Tăng động', 'Thân thiện', 'Mê xúc xích', 'Quý tộc', 'Ngoan ngoãn', 'Bám đuôi', 'Lười vận động'];

interface SenBossStepProps {
  step: 3 | 4;
  onNextSen: (fullName: string, condo: string, referralCode: string) => void;
  onFinishBoss: (bossData: {
    name: string;
    species: Species;
    breed: string;
    weightKg: number;
    isVaccinated: boolean;
    tags: string[];
    habitsGood: string[];
    habitsBad: string[];
    bio: string;
  }) => void;
  loading: boolean;
}

export const SenBossStep: React.FC<SenBossStepProps> = ({ step, onNextSen, onFinishBoss, loading }) => {
  const { t } = useTranslation();
  const [fullName, setFullName] = useState('');
  const [condo, setCondo] = useState(CONDOS[0]);
  const [referralCode, setReferralCode] = useState('');

  const [species, setSpecies] = useState<Species>('dog');
  const [petName, setPetName] = useState('');
  const [breed, setBreed] = useState(DOG_BREEDS[0]);
  const [weightStr, setWeightStr] = useState('');
  const [isVaccinated, setIsVaccinated] = useState(true);
  const [tags, setTags] = useState<string[]>(['Thân thiện']);
  const [goodHabit, setGoodHabit] = useState('');
  const [badHabit, setBadHabit] = useState('');
  const [bio, setBio] = useState('');

  const weightNum = parseFloat(weightStr) || 5;
  const sizeLabel = weightNum < 5 ? 'Size Nhỏ (<5kg)' : weightNum <= 15 ? 'Size Vừa (5-15kg)' : 'Size Lớn (>15kg)';

  const toggleTag = (tag: string) => {
    if (tags.includes(tag)) setTags(tags.filter((x) => x !== tag));
    else if (tags.length < 4) setTags([...tags, tag]);
  };

  if (step === 3) {
    return (
      <Card style={styles.card}>
        <Text style={styles.title}>{t('onboarding.sen.title')}</Text>
        <Text style={styles.label}>Tên / Biệt danh Chủ nuôi</Text>
        <TextInput style={styles.input} value={fullName} onChangeText={setFullName} placeholder={t('onboarding.sen.namePlaceholder')} />
        <Text style={styles.label}>Cụm chung cư sinh sống (Ẩn số tầng/phòng)</Text>
        <View style={styles.chipsWrap}>
          {CONDOS.map((c) => (
            <Chip key={c} label={c} selected={condo === c} onPress={() => setCondo(c)} />
          ))}
        </View>
        <Text style={styles.label}>Mã giới thiệu (Tùy chọn - Nhận 7 ngày VIP)</Text>
        <TextInput style={styles.input} value={referralCode} onChangeText={setReferralCode} placeholder={t('onboarding.sen.referralPlaceholder')} autoCapitalize="characters" />
        <Button title="Tiếp tục tạo hồ sơ Boss →" onPress={() => onNextSen(fullName, condo, referralCode)} />
      </Card>
    );
  }

  const breeds = species === 'dog' ? DOG_BREEDS : CAT_BREEDS;

  return (
    <Card style={styles.card}>
      <Text style={styles.title}>{t('onboarding.boss.title')}</Text>
      <View style={styles.row}>
        <Chip label={t('onboarding.boss.dog')} selected={species === 'dog'} onPress={() => { setSpecies('dog'); setBreed(DOG_BREEDS[0]); }} />
        <Chip label={t('onboarding.boss.cat')} selected={species === 'cat'} onPress={() => { setSpecies('cat'); setBreed(CAT_BREEDS[0]); }} />
      </View>
      <Text style={styles.label}>Tên của Boss & Cân nặng (kg) → {sizeLabel}</Text>
      <View style={styles.row}>
        <TextInput style={[styles.input, { flex: 2 }]} value={petName} onChangeText={setPetName} placeholder="Tên Boss" />
        <TextInput style={[styles.input, { flex: 1 }]} value={weightStr} onChangeText={setWeightStr} keyboardType="decimal-pad" placeholder="Kg" />
      </View>
      <Text style={styles.label}>Giống loài</Text>
      <View style={styles.chipsWrap}>
        {breeds.map((b) => (
          <Chip key={b} label={b} selected={breed === b} onPress={() => setBreed(b)} tone="mint" />
        ))}
      </View>
      <View style={styles.switchRow}>
        <Text style={styles.label}>🛡️ Đã tiêm đủ mũi 7 bệnh & Phòng dại</Text>
        <Switch value={isVaccinated} onValueChange={setIsVaccinated} trackColor={{ true: COLORS.mintDark, false: COLORS.border }} />
      </View>
      <Text style={styles.label}>Tính cách nổi bật (Chọn tối đa 4 tag - {tags.length}/4)</Text>
      <View style={styles.chipsWrap}>
        {ALL_TAGS.map((tg) => (
          <Chip key={tg} label={`#${tg}`} selected={tags.includes(tg)} onPress={() => toggleTag(tg)} />
        ))}
      </View>
      <Text style={styles.label}>Giới thiệu ngắn về Boss (Tùy chọn)</Text>
      <TextInput style={styles.input} value={bio} onChangeText={setBio} placeholder="VD: Rất ngoan, thích chạy nhảy công viên..." />
      <Button
        title="Hoàn tất & Khám phá bạn dắt dạo 🐾"
        loading={loading}
        onPress={() => {
          if (!petName.trim()) {
            return;
          }
          onFinishBoss({
            name: petName.trim(),
            species,
            breed,
            weightKg: weightNum,
            isVaccinated,
            tags,
            habitsGood: goodHabit ? [goodHabit] : ['Thân thiện', 'Ngoan ngoãn'],
            habitsBad: badHabit ? [badHabit] : [],
            bio: bio.trim() || 'Boss đáng yêu tìm bạn đi dạo chung quanh toà nhà!',
          });
        }}
      />
    </Card>
  );
};

const styles = StyleSheet.create({
  card: { gap: SPACING.sm + 2 },
  title: { ...TYPOGRAPHY.h2, color: COLORS.coral, marginBottom: 4 },
  label: { ...TYPOGRAPHY.caption, color: COLORS.textDark, fontWeight: '700' },
  input: {
    backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    ...TYPOGRAPHY.body, color: COLORS.textDark,
  },
  row: { flexDirection: 'row', gap: SPACING.sm, alignItems: 'center' },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
});
