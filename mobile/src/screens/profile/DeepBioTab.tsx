import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../../theme';
import { Card, Badge, Button } from '../../components';
import { Pet } from '../../types';
import { useTranslation } from '../../i18n';

interface DeepBioTabProps {
  pet: Pet;
  isOwner?: boolean;
  onUploadVaccine?: () => void;
  onOpenReminders?: () => void;
}

export const DeepBioTab: React.FC<DeepBioTabProps> = ({
  pet,
  isOwner = false,
  onUploadVaccine,
  onOpenReminders,
}) => {
  const { t } = useTranslation();

  const statusTone =
    pet.vaccineStatus === 'verified'
      ? 'success'
      : pet.vaccineStatus === 'pending'
      ? 'gold'
      : 'danger';
  const statusLabel =
    pet.vaccineStatus === 'verified'
      ? t('profile.safePet.verified')
      : pet.vaccineStatus === 'pending'
      ? t('profile.safePet.pending')
      : pet.vaccineStatus === 'rejected'
      ? t('profile.safePet.rejected')
      : t('profile.safePet.none');

  const sizeLabel =
    pet.size === 'small' ? 'Nhỏ (<5kg)' : pet.size === 'medium' ? 'Vừa (5-15kg)' : 'Lớn (>15kg)';

  return (
    <View style={styles.list}>
      <Card variant="mint" style={styles.mintCard}>
        <Text style={styles.cardHeader}>⚖️ 1. CÂN NẶNG & PHÂN KHÚC KÍCH CỠ</Text>
        <Text style={styles.cardMain}>
          {pet.weightKg} kg • Phân loại: {sizeLabel}
        </Text>
        <Text style={styles.cardSub}>
          Giới tính: {pet.gender === 'male' ? 'Đực ♂️' : 'Cái ♀️'} •{' '}
          {pet.isNeutered ? 'Đã triệt sản an toàn ✓' : 'Chưa triệt sản'}
        </Text>
      </Card>

      <Card variant="mint" style={styles.mintCard}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardHeader}>🛡️ 2. SỔ TIÊM CHỦNG ĐIỆN TỬ SAFE PET</Text>
          <Badge text={statusLabel} tone={statusTone} />
        </View>
        <Text style={styles.cardMain}>{pet.vaccineDetails || 'Vắc-xin 7 bệnh & Phòng dại'}</Text>
        <Text style={styles.cardSub}>
          • Mũi tiêm gần nhất: {pet.lastVaccineDate || '15/01/2026'}
        </Text>
        <Text style={styles.cardSub}>
          • Hạn tái chủng kế tiếp: {pet.vaccineNextDueDate || '15/01/2027'}
        </Text>
        {pet.vaccineRejectReason && (
          <Text style={styles.rejectText}>Lý do từ chối: {pet.vaccineRejectReason}</Text>
        )}
        {isOwner && (
          <View style={styles.btnRow}>
            {onUploadVaccine && (
              <Button title="📤 Upload sổ tiêm" size="sm" variant="mint" onPress={onUploadVaccine} />
            )}
            {onOpenReminders && (
              <Button title="⏰ Lịch nhắc tiêm" size="sm" variant="outline" onPress={onOpenReminders} />
            )}
          </View>
        )}
      </Card>

      <Card variant="mint" style={styles.mintCard}>
        <Text style={styles.cardHeader}>✅ 3. THÓI QUEN TỐT KHI RA ĐƯỜNG</Text>
        {(pet.habitsGood?.length ? pet.habitsGood : ['Đi vệ sinh đúng bãi cỏ', 'Thân thiện với cún khác']).map(
          (h, idx) => (
            <Text key={idx} style={styles.goodItem}>
              • {h}
            </Text>
          ),
        )}
      </Card>

      <Card variant="mint" style={styles.mintCard}>
        <Text style={styles.cardHeader}>⚠️ 4. THÓI QUEN CẦN LƯU Ý (PHÒNG TRÁNH CẮN NHAU)</Text>
        {(pet.habitsBad?.length ? pet.habitsBad : ['Không có thói quen hung dữ']).map((h, idx) => (
          <Text key={idx} style={styles.badItem}>
            • {h}
          </Text>
        ))}
      </Card>

      <Card variant="mint" style={styles.mintCard}>
        <View style={styles.rowBetween}>
          <Text style={styles.cardHeader}>📱 5. ĐỊNH DANH CHỦ NUÔI (CHỐNG BÙNG KÈO)</Text>
          <Badge text="✓ Đã xác thực OTP" tone="success" />
        </View>
        <Text style={styles.cardMain}>Sen: {pet.ownerName || 'Cư dân Vinhomes'}</Text>
        <Text style={styles.cardSub}>
          SĐT KYC: {pet.ownerPhone || '0908***456'} • Khu: {pet.condoComplex || 'Vinhomes Central Park'}
        </Text>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  list: { gap: SPACING.sm + 2 },
  mintCard: { gap: 4 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 4 },
  cardHeader: { ...TYPOGRAPHY.caption, color: '#0F766E', fontWeight: '800' },
  cardMain: { ...TYPOGRAPHY.bodyBold, color: COLORS.textDark },
  cardSub: { ...TYPOGRAPHY.caption, color: COLORS.textBody },
  goodItem: { ...TYPOGRAPHY.body, color: '#065F46', fontWeight: '600' },
  badItem: { ...TYPOGRAPHY.body, color: '#B45309', fontWeight: '600' },
  rejectText: { ...TYPOGRAPHY.caption, color: COLORS.danger, fontWeight: '700' },
  btnRow: { flexDirection: 'row', gap: SPACING.sm, marginTop: 6 },
});
