import React from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../theme';
import { Chip } from '../../components';

const CONDOS = [
  'Vinhomes Central Park',
  'Masteri Thảo Điền',
  'Sala Thủ Thiêm',
  'The Manor',
  'Times City',
  'Eco Green Saigon',
];

interface OwnerProfileStepProps {
  fullName: string;
  setFullName: (v: string) => void;
  age: string;
  setAge: (v: string) => void;
  gender: 'male' | 'female' | 'other';
  setGender: (v: 'male' | 'female' | 'other') => void;
  occupation: string;
  setOccupation: (v: string) => void;
  condoComplex: string;
  setCondoComplex: (v: string) => void;
  bio: string;
  setBio: (v: string) => void;
  onContinue: () => void;
}

export const OwnerProfileStep: React.FC<OwnerProfileStepProps> = ({
  fullName,
  setFullName,
  age,
  setAge,
  gender,
  setGender,
  occupation,
  setOccupation,
  condoComplex,
  setCondoComplex,
  bio,
  setBio,
  onContinue,
}) => {
  const canContinue = fullName.trim().length > 0 && occupation.trim().length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.eyebrow}>HỒ SƠ CHỦ NUÔI</Text>
        <Text style={styles.title}>Bạn là người như thế nào?</Text>
        <Text style={styles.subtitle}>
          Thông tin của bạn giúp nửa kia hoặc bạn dắt cún hiểu rõ về bạn trước khi quẹt thẻ.
        </Text>
      </View>

      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.label}>Họ và tên / Biệt danh *</Text>
          <TextInput
            style={styles.input}
            value={fullName}
            onChangeText={setFullName}
            placeholder="VD: Hải Đăng / Miu Miu"
            placeholderTextColor={COLORS.textMuted}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.field, { flex: 1 }]}>
            <Text style={styles.label}>Tuổi *</Text>
            <TextInput
              style={styles.input}
              value={age}
              onChangeText={setAge}
              keyboardType="number-pad"
              maxLength={2}
              placeholder="25"
              placeholderTextColor={COLORS.textMuted}
            />
          </View>
          <View style={[styles.field, { flex: 2 }]}>
            <Text style={styles.label}>Giới tính</Text>
            <View style={styles.genderRow}>
              <TouchableOpacity
                style={[styles.genderBtn, gender === 'male' && styles.genderBtnActive]}
                onPress={() => setGender('male')}
              >
                <Text style={[styles.genderText, gender === 'male' && styles.genderTextActive]}>♂️ Nam</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.genderBtn, gender === 'female' && styles.genderBtnActive]}
                onPress={() => setGender('female')}
              >
                <Text style={[styles.genderText, gender === 'female' && styles.genderTextActive]}>♀️ Nữ</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.genderBtn, gender === 'other' && styles.genderBtnActive]}
                onPress={() => setGender('other')}
              >
                <Text style={[styles.genderText, gender === 'other' && styles.genderTextActive]}>🌈 Khác</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Nghề nghiệp / Lĩnh vực làm việc *</Text>
          <TextInput
            style={styles.input}
            value={occupation}
            onChangeText={setOccupation}
            placeholder="VD: UI/UX Designer, Kỹ sư phần mềm, Bác sĩ..."
            placeholderTextColor={COLORS.textMuted}
          />
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Cụm toà nhà / Chung cư sinh sống</Text>
          <View style={styles.chipsWrap}>
            {CONDOS.map((c) => (
              <Chip
                key={c}
                label={c}
                selected={condoComplex === c}
                onPress={() => setCondoComplex(c)}
              />
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>Giới thiệu ngắn về bạn & tình yêu Boss</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={bio}
            onChangeText={setBio}
            multiline
            numberOfLines={3}
            placeholder="VD: Thích dắt cún đi dạo công viên Landmark lúc 18h. Tìm bạn đi dạo chung hoặc ai đó yêu động vật để cùng cà phê cuối tuần!"
            placeholderTextColor={COLORS.textMuted}
          />
        </View>

        <TouchableOpacity
          style={[styles.continueBtn, !canContinue && styles.continueBtnDisabled]}
          disabled={!canContinue}
          onPress={onContinue}
          activeOpacity={0.85}
        >
          <Text style={styles.continueBtnText}>Tiếp tục tạo hồ sơ Boss đồng hành →</Text>
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
  textArea: { height: 75, textAlignVertical: 'top' },
  row: { flexDirection: 'row', gap: SPACING.sm },
  genderRow: { flexDirection: 'row', gap: 6 },
  genderBtn: {
    flex: 1,
    paddingVertical: SPACING.sm + 2,
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
  },
  genderBtnActive: { backgroundColor: COLORS.coralLight, borderColor: COLORS.coral },
  genderText: { ...TYPOGRAPHY.caption, color: COLORS.textMuted, fontWeight: '700' },
  genderTextActive: { color: COLORS.coral },
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
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
