import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Feather } from '../../components/FeatherIcon';

interface TinderActionBarProps {
  onPass: () => void;
  onLike: () => void;
  disabled?: boolean;
}

export const TinderActionBar: React.FC<TinderActionBarProps> = ({
  onPass,
  onLike,
  disabled = false,
}) => {
  return (
    <View style={styles.container}>
      {/* Nút Bỏ qua (✕) */}
      <TouchableOpacity
        style={[styles.actionBtn, styles.passBtn, disabled && styles.disabledBtn]}
        onPress={onPass}
        disabled={disabled}
        activeOpacity={0.8}
        accessibilityLabel="Bỏ qua hồ sơ"
      >
        <Feather name="x" size={28} color="#C9302C" />
      </TouchableOpacity>

      {/* Nút Thích (❤️) */}
      <TouchableOpacity
        style={[styles.actionBtn, styles.likeBtn, disabled && styles.disabledBtn]}
        onPress={onLike}
        disabled={disabled}
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
    gap: 36,
    paddingVertical: 12,
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
    opacity: 0.5,
  },
});

