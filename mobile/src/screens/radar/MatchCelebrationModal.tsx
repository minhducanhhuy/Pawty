import React from 'react';
import { Modal, View, Text, Image, StyleSheet } from 'react-native';
import { COLORS, RADIUS, SPACING, TYPOGRAPHY } from '../../theme';
import { Pet } from '../../types';
import { Button, ConfettiOverlay } from '../../components';
import { useTranslation } from '../../i18n';

interface MatchCelebrationModalProps {
  visible: boolean;
  myPet: Pet | null;
  matchedPet: Pet | null;
  onChatNow: () => void;
  onClose: () => void;
}

export const MatchCelebrationModal: React.FC<MatchCelebrationModalProps> = ({
  visible,
  myPet,
  matchedPet,
  onChatNow,
  onClose,
}) => {
  const { t } = useTranslation();

  if (!matchedPet) return null;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <ConfettiOverlay visible={visible} />
        <View style={styles.card}>
          <Image
            source={require('../../../assets/pawty-logo-full.png')}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.title}>{t('radar.match.title')}</Text>
          <Text style={styles.subtitle}>{t('radar.match.subtitle')}</Text>

          <View style={styles.avatarsRow}>
            <Image
              source={{
                uri:
                  myPet?.avatarUrl ||
                  'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?auto=format&fit=crop&w=300&q=80',
              }}
              style={[styles.avatar, { transform: [{ rotate: '-8deg' }] }]}
            />
            <View style={styles.pawBumpCircle}>
              <Text style={styles.pawBumpEmoji}>🐾💖</Text>
            </View>
            <Image
              source={{ uri: matchedPet.avatarUrl }}
              style={[styles.avatar, { transform: [{ rotate: '8deg' }] }]}
            />
          </View>

          <Text style={styles.pairNames}>
            {myPet?.ownerName || 'Bạn'} & {matchedPet.ownerName || 'Người bạn mới'}
          </Text>
          <Text style={styles.subPairNames}>
            🐾 Cùng Boss: {myPet?.name || 'Bé cưng'} × {matchedPet.name}
          </Text>

          <Button
            title={t('radar.match.chatNow')}
            onPress={onChatNow}
            size="lg"
            style={{ width: '100%', marginBottom: SPACING.sm }}
          />
          <Button title="Tiếp tục quẹt Radar" variant="outline" onPress={onClose} style={{ width: '100%' }} />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: COLORS.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.lg,
  },
  card: {
    width: '100%',
    backgroundColor: COLORS.cream,
    borderRadius: RADIUS.xxl,
    padding: SPACING.xl,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.coral,
  },
  logo: { width: 130, height: 48, marginBottom: SPACING.xs },
  title: { ...TYPOGRAPHY.h2, color: COLORS.coral, textAlign: 'center' },
  subtitle: { ...TYPOGRAPHY.body, color: COLORS.textMuted, textAlign: 'center', marginTop: 4 },
  avatarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.lg,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: COLORS.coral,
  },
  pawBumpCircle: {
    backgroundColor: COLORS.mintLight,
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: -12,
    zIndex: 2,
    borderWidth: 2,
    borderColor: COLORS.mintDark,
  },
  pawBumpEmoji: { fontSize: 18 },
  pairNames: { ...TYPOGRAPHY.h3, color: COLORS.textDark, textAlign: 'center', marginTop: 4 },
  subPairNames: { ...TYPOGRAPHY.bodyBold, color: COLORS.coral, textAlign: 'center', marginBottom: SPACING.md, fontSize: 13 },
});
