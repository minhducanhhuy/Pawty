import React from 'react';
import { View, Image, Text, StyleSheet } from 'react-native';
import { COLORS } from '../theme';

interface AvatarProps {
  uri?: string;
  size?: number;
  isVip?: boolean;
  isWalkingNow?: boolean;
}

export const Avatar: React.FC<AvatarProps> = ({
  uri,
  size = 48,
  isVip = false,
  isWalkingNow = false,
}) => {
  const fallbackUri =
    uri || 'https://images.unsplash.com/photo-1612536057832-2ff7ead58194?auto=format&fit=crop&w=300&q=80';

  return (
    <View style={{ width: size, height: size, position: 'relative' }}>
      <Image
        source={{ uri: fallbackUri }}
        style={[
          styles.img,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: isVip ? 2.5 : 1.5,
            borderColor: isVip ? COLORS.goldVip : COLORS.coral,
          },
        ]}
      />
      {isVip && (
        <View style={styles.crownBadge}>
          <Text style={styles.crownText}>👑</Text>
        </View>
      )}
      {isWalkingNow && <View style={styles.walkDot} />}
    </View>
  );
};

const styles = StyleSheet.create({
  img: { backgroundColor: COLORS.creamWarm },
  crownBadge: {
    position: 'absolute',
    top: -6,
    right: -4,
    backgroundColor: COLORS.goldVip,
    borderRadius: 10,
    paddingHorizontal: 3,
    paddingVertical: 1,
  },
  crownText: { fontSize: 10 },
  walkDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: COLORS.success,
    borderWidth: 2,
    borderColor: COLORS.white,
  },
});
