import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '../../components/FeatherIcon';

interface TinderActionBarProps {
  onPass: () => void;
  onLike: () => void;
  onRewind: () => void;
  canRewind: boolean;
  isCardActive?: boolean;
  disabled?: boolean;
}

export const TinderActionBar: React.FC<TinderActionBarProps> = ({
  onPass,
  onLike,
  onRewind,
  canRewind,
  isCardActive = true,
  disabled = false,
}) => {
  const isRewindActive = canRewind && !disabled;
  const isActionDisabled = disabled || !isCardActive;

  return (
    <View style={styles.container}>
      {/* 1. Nút Hoàn tác (⟲) — Mờ khi ở người đầu tiên, Sáng lên khi đã quẹt ít nhất 1 hồ sơ */}
      <TouchableOpacity
        style={[
          styles.rewindBtn,
          isRewindActive ? styles.rewindBtnActive : styles.rewindBtnDisabled,
        ]}
        onPress={onRewind}
        disabled={!isRewindActive}
        activeOpacity={0.7}
        accessibilityLabel="Hoàn tác lượt quẹt trước"
      >
        <Feather
          name="rotate-ccw"
          size={21}
          color={isRewindActive ? '#E5A93C' : '#C5BDB3'}
        />
      </TouchableOpacity>

      {/* 2. Nút Bỏ qua (✕) */}
      <TouchableOpacity
        style={[styles.actionBtn, styles.passBtn, isActionDisabled && styles.disabledBtn]}
        onPress={onPass}
        disabled={isActionDisabled}
        activeOpacity={0.8}
        accessibilityLabel="Bỏ qua hồ sơ"
      >
        <Feather name="x" size={28} color="#C9302C" />
      </TouchableOpacity>

      {/* 3. Nút Thích (❤️) */}
      <TouchableOpacity
        style={[styles.actionBtn, styles.likeBtn, isActionDisabled && styles.disabledBtn]}
        onPress={onLike}
        disabled={isActionDisabled}
        activeOpacity={0.8}
        accessibilityLabel="Thích hồ sơ"
      >
        <Feather name="heart" size={26} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 24,
    paddingVertical: 12,
  },
  rewindBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rewindBtnDisabled: {
    backgroundColor: '#F3EFEA',
    borderWidth: 1.5,
    borderColor: '#E8E2D8',
    opacity: 0.45,
    elevation: 0,
  },
  rewindBtnActive: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#F5DCA8',
    opacity: 1,
    shadowColor: '#E5A93C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  actionBtn: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  passBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#EFE8DE',
  },
  likeBtn: {
    backgroundColor: '#FF6F61',
  },
  disabledBtn: {
    opacity: 0.4,
  },
});
