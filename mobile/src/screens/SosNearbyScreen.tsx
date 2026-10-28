import React, { useEffect, useState, useCallback } from 'react';
import { ScrollView, View, Text, Image, Linking, Share, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../theme';
import { HeaderBar, Card, Button, Badge, EmptyState } from '../components';
import { SosAlert } from '../types';
import { api } from '../api/endpoints';
import { useAppConfig } from '../context';
import { useNavigation } from '../navigation/NavigationContext';
import { useTranslation } from '../i18n';

export const SosNearbyScreen: React.FC = () => {
  const { showToast } = useAppConfig();
  const { navigate } = useNavigation();
  const { t } = useTranslation();
  const [alerts, setAlerts] = useState<SosAlert[]>([]);

  const loadSos = useCallback(async () => {
    try {
      const list = await api.getNearbySos();
      setAlerts(list);
    } catch (err) {
      console.error('Load nearby SOS error:', err);
    }
  }, []);

  useEffect(() => {
    loadSos();
  }, [loadSos]);

  const handleResolve = async (id: string) => {
    await api.resolveSos(id);
    showToast('🎉 Đã đánh dấu tìm thấy Boss thành công! (+Huy hiệu SOS Hero)', 'success');
    loadSos();
  };

  const handleShare = async (item: SosAlert) => {
    await Share.share({
      message: `🚨 KHẨN CẤP PAWTY SOS: Tìm bé ${item.petName} (${item.breed}) lạc tại ${item.lastSeenAddress}. Hậu tạ: ${item.rewardAmountVnd}. Liên hệ: ${item.contactPhone}`,
    });
  };

  return (
    <View style={styles.screen}>
      <HeaderBar
        title={t('sos.nearbyTitle')}
        rightElement={<Button title="+ Phát SOS" size="sm" variant="danger" onPress={() => navigate('SosCreate')} />}
      />
      <ScrollView contentContainerStyle={styles.content}>
        {alerts.length === 0 ? (
          <EmptyState
            icon="🛡️"
            title="Khu vực 3km quanh bạn đang an toàn!"
            subtitle="Không có tin báo Boss thất lạc nào đang hoạt động."
          />
        ) : (
          alerts.map((item) => (
            <Card key={item.id} style={styles.alertCard}>
              <View style={styles.topRow}>
                <Badge text={`🚨 CÁCH BẠN ${item.distanceMeters || 350}M • ${item.createdAt}`} tone="danger" />
                <Badge text={`Hậu tạ: ${item.rewardAmountVnd}`} tone="gold" />
              </View>
              <View style={styles.bodyRow}>
                <Image source={{ uri: item.petPhotoUrl }} style={styles.photo} />
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={styles.petName}>{item.petName} ({item.breed})</Text>
                  <Text style={styles.address}>📍 {item.lastSeenAddress}</Text>
                  <Text style={styles.notes}>"{item.notes}"</Text>
                </View>
              </View>
              <View style={styles.actionsRow}>
                <Button
                  title={`📞 Gọi ${item.contactPhone}`}
                  size="sm"
                  onPress={() => Linking.openURL(`tel:${item.contactPhone}`).catch(() => {})}
                />
                <Button title="Chia sẻ" size="sm" variant="outline" onPress={() => handleShare(item)} />
                <Button title="✓ Đã tìm thấy" size="sm" variant="mint" onPress={() => handleResolve(item.id)} />
              </View>
            </Card>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.cream },
  content: { padding: SPACING.md, gap: SPACING.md },
  alertCard: { borderColor: COLORS.danger, borderWidth: 1.5, gap: SPACING.sm },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 },
  bodyRow: { flexDirection: 'row', gap: SPACING.md, alignItems: 'center' },
  photo: { width: 84, height: 84, borderRadius: RADIUS.lg },
  petName: { ...TYPOGRAPHY.h3, color: COLORS.textDark },
  address: { ...TYPOGRAPHY.caption, color: COLORS.danger, fontWeight: '700' },
  notes: { ...TYPOGRAPHY.caption, color: COLORS.textBody },
  actionsRow: { flexDirection: 'row', gap: SPACING.sm, flexWrap: 'wrap', marginTop: 4 },
});
