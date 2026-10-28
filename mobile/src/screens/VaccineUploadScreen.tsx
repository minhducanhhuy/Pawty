import React, { useState } from 'react';
import { ScrollView, View, Text, TextInput, Image, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../theme';
import { HeaderBar, Card, Button, Badge } from '../components';
import { api } from '../api/endpoints';
import { useActivePet, useAppConfig } from '../context';
import { useNavigation } from '../navigation/NavigationContext';

export const VaccineUploadScreen: React.FC = () => {
  const { activePet, reloadPets } = useActivePet();
  const { showToast } = useAppConfig();
  const { goBack } = useNavigation();

  const [proofUrls, setProofUrls] = useState<string[]>(
    activePet?.vaccineProofUrls?.length
      ? activePet.vaccineProofUrls
      : ['https://images.unsplash.com/photo-1583337130417-3346a1be7dee?auto=format&fit=crop&w=400&q=80'],
  );
  const [vaccineDetails, setVaccineDetails] = useState(
    activePet?.vaccineDetails || 'Vắc-xin 7 bệnh Vanguard Plus & Phòng Dại',
  );
  const [lastVaccineDate, setLastVaccineDate] = useState(activePet?.lastVaccineDate || '15/01/2026');
  const [nextDueDate, setNextDueDate] = useState(activePet?.vaccineNextDueDate || '15/01/2027');
  const [submitting, setSubmitting] = useState(false);

  const pickImage = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      });
      const pickedUri = res.assets?.[0]?.uri;
      if (!res.canceled && pickedUri) {
        setProofUrls((prev) => [...prev.slice(0, 3), pickedUri]);
      }
    } catch {
      showToast('Đã thêm ảnh mẫu sổ tiêm chủng!', 'info');
    }
  };

  const handleSubmit = async () => {
    if (!activePet) return;
    setSubmitting(true);
    try {
      await api.uploadVaccineProof(activePet.id, {
        proofUrls,
        vaccineDetails,
        lastVaccineDate,
        nextDueDate,
      });
      await reloadPets();
      showToast('📤 Đã gửi sổ tiêm! Trạng thái chuyển sang Chờ Admin duyệt ⏳', 'success');
      goBack();
    } catch {
      showToast('Không thể tải lên sổ tiêm.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.screen}>
      <HeaderBar title="🛡️ Xác Minh Sổ Tiêm Safe Pet" subtitle={`Boss: ${activePet?.name || 'Bơ Lùn'}`} />
      <ScrollView contentContainerStyle={styles.content}>
        <Card variant="mint" style={styles.card}>
          <Badge text="💡 OCR Sandbox: Tự động trích xuất ngày tiêm & chuyển Admin duyệt" tone="mint" />
          <Text style={styles.label}>Ảnh chụp sổ tiêm có mộc đỏ phòng khám (Tối đa 4 ảnh)</Text>
          <View style={styles.photosRow}>
            {proofUrls.map((uri, i) => (
              <Image key={i} source={{ uri }} style={styles.thumb} />
            ))}
          </View>
          <Button title="📷 Chọn / Chụp ảnh sổ tiêm" variant="outline" size="sm" onPress={pickImage} />

          <Text style={styles.label}>Tên mũi tiêm & Phòng khám thú y</Text>
          <TextInput style={styles.input} value={vaccineDetails} onChangeText={setVaccineDetails} />

          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Ngày tiêm gần nhất</Text>
              <TextInput style={styles.input} value={lastVaccineDate} onChangeText={setLastVaccineDate} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.label}>Hạn tái chủng kế tiếp</Text>
              <TextInput style={styles.input} value={nextDueDate} onChangeText={setNextDueDate} />
            </View>
          </View>

          <Button title="Gửi Xác Minh Safe Pet ⏳" loading={submitting} onPress={handleSubmit} />
        </Card>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.cream },
  content: { padding: SPACING.md },
  card: { gap: SPACING.sm + 2 },
  label: { ...TYPOGRAPHY.caption, color: COLORS.textDark, fontWeight: '700' },
  photosRow: { flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap' },
  thumb: { width: 78, height: 78, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.mintDark },
  row: { flexDirection: 'row', gap: SPACING.sm },
  input: {
    backgroundColor: COLORS.white, borderWidth: 1, borderColor: COLORS.border,
    borderRadius: RADIUS.md, paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm,
    ...TYPOGRAPHY.body, color: COLORS.textDark,
  },
});
