import React, { useState, useEffect, useCallback } from 'react';
import { ScrollView, View, Text, Image, TouchableOpacity, Share, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../theme';
import { Card, Avatar, Button, Badge } from '../components';
import { CommentsSheet } from './feed/CommentsSheet';
import { UploadMomentModal } from './feed/UploadMomentModal';
import { MomentItem } from '../types';
import { api } from '../api/endpoints';
import { useAuth, useAppConfig } from '../context';
import { useNavigation } from '../navigation/NavigationContext';
import { useTranslation } from '../i18n';

export const FeedScreen: React.FC = () => {
  const { user } = useAuth();
  const { config, showToast } = useAppConfig();
  const { navigate } = useNavigation();
  const { t } = useTranslation();

  const [tab, setTab] = useState<'area' | 'mine'>('area');
  const [moments, setMoments] = useState<MomentItem[]>([]);
  const [activeCommentMomentId, setActiveCommentMomentId] = useState<string | null>(null);
  const [uploadVisible, setUploadVisible] = useState(false);

  const loadFeed = useCallback(async () => {
    try {
      const res = await api.getFeed(tab);
      setMoments(res.items);
    } catch (err) {
      console.error('Load feed error:', err);
    }
  }, [tab]);

  useEffect(() => { loadFeed(); }, [loadFeed]);

  const handleToggleLike = async (item: MomentItem) => {
    const res = await api.toggleLikeMoment(item.id);
    setMoments((prev) => prev.map((m) => (m.id === item.id ? { ...m, isLiked: res.liked, likesCount: res.likesCount } : m)));
  };

  const handleShareMoment = async (item: MomentItem) => {
    const shareData = await api.getShareMoment(item.id);
    await Share.share({
      message: `🐾 [${shareData.watermark}] ${item.petName}: "${shareData.caption}"\nXem tại: ${shareData.shareUrl}`,
      url: shareData.imageUrl,
    });
  };

  return (
    <View style={styles.screen}>
      <View style={styles.topBar}>
        <View style={styles.tabSwitch}>
          <TouchableOpacity style={[styles.tabBtn, tab === 'area' && styles.tabBtnActive]} onPress={() => setTab('area')}>
            <Text style={[styles.tabText, tab === 'area' && styles.tabTextActive]}>{t('feed.tab.area')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.tabBtn, tab === 'mine' && styles.tabBtnActive]} onPress={() => setTab('mine')}>
            <Text style={[styles.tabText, tab === 'mine' && styles.tabTextActive]}>{t('feed.tab.mine')}</Text>
          </TouchableOpacity>
        </View>
        <Button title={t('feed.upload.cta')} size="sm" onPress={() => setUploadVisible(true)} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {moments.map((item) => (
          <Card key={item.id} style={styles.momentCard}>
            <View style={styles.authorRow}>
              <Avatar uri={item.petAvatarUrl} size={42} />
              <View style={{ flex: 1 }}>
                <Text style={styles.petName}>{item.petName}</Text>
                <Text style={styles.meta}>📍 {item.condoComplex || 'Vinhomes'} • {item.createdAt}</Text>
              </View>
              <Badge text="🐾 Pawty" tone="mint" />
            </View>
            <View style={styles.imgWrap}>
              <Image source={{ uri: item.mediaUrl }} style={styles.momentImg} />
              <View style={styles.watermarkPill}><Text style={styles.watermarkText}>🐾 Pawty</Text></View>
            </View>
            <Text style={styles.caption}>{item.caption}</Text>
            <View style={styles.actionsRow}>
              <TouchableOpacity style={styles.actionBtn} onPress={() => handleToggleLike(item)}>
                <Text style={styles.actionText}>{item.isLiked ? '❤️' : '🤍'} {item.likesCount}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={() => setActiveCommentMomentId(item.id)}>
                <Text style={styles.actionText}>💬 {item.commentsCount} Bình luận</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={() => handleShareMoment(item)}>
                <Text style={styles.actionText}>📤 Chia sẻ</Text>
              </TouchableOpacity>
            </View>
          </Card>
        ))}
      </ScrollView>

      <CommentsSheet
        momentId={activeCommentMomentId}
        onClose={() => setActiveCommentMomentId(null)}
        onCommentAdded={(mId) => setMoments((prev) => prev.map((m) => (m.id === mId ? { ...m, commentsCount: m.commentsCount + 1 } : m)))}
      />

      <UploadMomentModal
        visible={uploadVisible} myPhotosCount={moments.length} maxFreePhotos={config.tiers.free.maxPhotos} isVip={Boolean(user?.isVip)}
        onClose={() => setUploadVisible(false)}
        onUploaded={(m) => { setMoments((prev) => [m, ...prev]); showToast('📸 Đã đăng khoảnh khắc bựa lên Bảng tin!', 'success'); }}
        onLimitReached={() => { showToast('VIP_STORAGE_LIMIT_REACHED: Gói Free tối đa 5 ảnh! Hãy nâng VIP.', 'error'); navigate('Paywall', { highlight: 'vip' }); }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: COLORS.cream },
  topBar: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, gap: SPACING.sm, backgroundColor: COLORS.white, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  tabSwitch: { flexDirection: 'row', backgroundColor: COLORS.creamWarm, borderRadius: RADIUS.pill, padding: 3, flex: 1 },
  tabBtn: { flex: 1, paddingVertical: 6, borderRadius: RADIUS.pill, alignItems: 'center' },
  tabBtnActive: { backgroundColor: COLORS.coral },
  tabText: { ...TYPOGRAPHY.caption, color: COLORS.textMuted, fontWeight: '700' },
  tabTextActive: { color: COLORS.white },
  content: { padding: SPACING.md, gap: SPACING.md, paddingBottom: 32 },
  momentCard: { padding: SPACING.md, gap: SPACING.sm },
  authorRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  petName: { ...TYPOGRAPHY.bodyBold, color: COLORS.textDark },
  meta: { ...TYPOGRAPHY.caption, color: COLORS.textMuted },
  imgWrap: { position: 'relative' },
  momentImg: { width: '100%', height: 240, borderRadius: RADIUS.lg },
  watermarkPill: { position: 'absolute', bottom: 8, right: 8, backgroundColor: 'rgba(26,29,36,0.7)', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  watermarkText: { ...TYPOGRAPHY.caption, fontSize: 10, color: COLORS.white },
  caption: { ...TYPOGRAPHY.body, color: COLORS.textBody },
  actionsRow: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: COLORS.border, paddingTop: SPACING.sm },
  actionBtn: { paddingVertical: 4, paddingHorizontal: 8 },
  actionText: { ...TYPOGRAPHY.caption, color: COLORS.textDark, fontWeight: '700' },
});
