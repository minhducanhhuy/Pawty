import React, { useEffect, useRef } from 'react';
import { Animated, View, Text, StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const PARTICLES = ['🎉', '🐾', '💖', '✨', '👑', '🎊', '🦴', '🌟'];

export const ConfettiOverlay: React.FC<{ visible: boolean }> = ({ visible }) => {
  const animValues = useRef(PARTICLES.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    if (!visible) return;
    animValues.forEach((v) => v.setValue(0));
    Animated.stagger(
      60,
      animValues.map((v) =>
        Animated.timing(v, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
      ),
    ).start();
  }, [visible, animValues]);

  if (!visible) return null;

  return (
    <View style={styles.overlay} pointerEvents="none">
      {PARTICLES.map((emoji, idx) => {
        const translateY = animValues[idx].interpolate({
          inputRange: [0, 1],
          outputRange: [-40, height * 0.65],
        });
        const opacity = animValues[idx].interpolate({
          inputRange: [0, 0.8, 1],
          outputRange: [1, 1, 0],
        });
        const left = ((idx + 1) * (width / (PARTICLES.length + 1)));

        return (
          <Animated.View
            key={idx}
            style={[styles.particle, { left, opacity, transform: [{ translateY }] }]}
          >
            <Text style={styles.emoji}>{emoji}</Text>
          </Animated.View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  particle: {
    position: 'absolute',
    top: 20,
  },
  emoji: {
    fontSize: 28,
  },
});
