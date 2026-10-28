import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, TYPOGRAPHY } from '../theme';
import { MainTab } from '../types';
import { useNavigation } from './NavigationContext';
import { useTranslation } from '../i18n';

export const BottomTabBar: React.FC = () => {
  const { currentTab, switchTab } = useNavigation();
  const { t } = useTranslation();

  const tabs: { key: MainTab; icon: string; label: string }[] = [
    { key: 'Radar', icon: '🧭', label: t('tabs.radar') },
    { key: 'Feed', icon: '📸', label: t('tabs.feed') },
    { key: 'Chat', icon: '💬', label: t('tabs.chat') },
    { key: 'Profile', icon: '🐾', label: t('tabs.profile') },
  ];

  return (
    <View style={styles.tabBar}>
      {tabs.map((tab) => {
        const isActive = currentTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabItem}
            onPress={() => switchTab(tab.key)}
            activeOpacity={0.75}
          >
            <View style={[styles.iconWrap, isActive && styles.iconWrapActive]}>
              <Text style={styles.icon}>{tab.icon}</Text>
            </View>
            <Text style={[styles.label, isActive && styles.labelActive]}>{tab.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingVertical: SPACING.xs + 2,
    paddingBottom: SPACING.sm,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrap: {
    paddingHorizontal: 14,
    paddingVertical: 3,
    borderRadius: 16,
  },
  iconWrapActive: {
    backgroundColor: COLORS.coralLight,
  },
  icon: { fontSize: 20 },
  label: {
    ...TYPOGRAPHY.caption,
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  labelActive: {
    color: COLORS.coral,
    fontWeight: '800',
  },
});
