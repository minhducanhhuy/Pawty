import React, { useState } from 'react';
import { View, Text, TextInput, Image, StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../theme';
import { ModalSheet, Button, Badge } from '../../components';
import { MomentItem } from '../../types';
import { api } from '../../api/endpoints';

interface UploadMomentModalProps {
  visible: boolean;
  myPhotosCount: number;
  maxFreePhotos: number;
  isVip: boolean;
  onClose: () => void;
  onUploaded: (m: MomentItem) => void;
  onLimitReached: () => void;
}

export const UploadMomentModal: React.FC<UploadMomentModalProps> = ({
  visible,
  myPhotosCount,
  maxFreePhotos,
  isVip,
  onClose,
  onUploaded,
  onLimitReached,
}) => {
  const [mediaUrl, setMediaUrl] = useState(
    'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=600&q=80',
  );
  const [caption, setCaption] = useState('');
  const [loading, setLoading] = useState(false);

  const pickPhoto = async () => {
    try {
      const res = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.85,
      });
      if (!res.canceled && res.assets?.[0]?.uri) {
        setMediaUrl(res.assets[0].uri);
      }
    } catch {
      // Keep sample image
    }
  };

  const handleSubmit = async () => {
    if (!isVip && myPhotosCount >= maxFreePhotos) {
      onClose();
      onLimitReached();
      return;
    }
    setLoading(true);
    try {
      const created = await api.createMoment(
        mediaUrl,
        caption.trim() || 'Khoảnh khắc tấu hài siêu cấp tại chung cư 🐾😂',
      );
      setCaption('');
      onUploaded(created);
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalSheet visible={visible} title="📸 Đăng Khoảnh Khắc Bựa Mới" onClose={onClose}>
      <View style={styles.container}>
        <Badge
          text={
            isVip
              ? '👑 Kho ảnh VIP: Không giới hạn dung lượng'
              : `Gói Free: Đã dùng ${myPhotosCount}/${maxFreePhotos} ảnh`
          }
          tone={isVip ? 'gold' : 'mint'}
        />
        <Image source={{ uri: mediaUrl }} style={styles.preview} />
        <Button title="📷 Chọn ảnh từ thư viện" variant="outline" size="sm" onPress={pickPhoto} />

        <Text style={styles.label}>Caption tấu hài cho Boss</Text>
        <TextInput
          style={styles.input}
          multiline
          placeholder="Kể câu chuyện hài hước đằng sau bức ảnh này..."
          value={caption}
          onChangeText={setCaption}
        />

        <Button title="Đăng Lên Bảng Tin Khu Vực 🎉" loading={loading} onPress={handleSubmit} />
      </View>
    </ModalSheet>
  );
};

const styles = StyleSheet.create({
  container: { gap: SPACING.sm + 2 },
  preview: { width: '100%', height: 200, borderRadius: RADIUS.xl },
  label: { ...TYPOGRAPHY.caption, color: COLORS.textDark, fontWeight: '700' },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: RADIUS.md,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    height: 76,
    ...TYPOGRAPHY.body,
    color: COLORS.textDark,
  },
});
