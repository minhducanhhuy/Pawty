import React, { useEffect, useRef } from 'react';
import { View, Image, Animated, Easing, StyleSheet } from 'react-native';

const PAWTY_BODY = require('../../assets/pawty-logo-body.png');
const PAWTY_TAIL = require('../../assets/pawty-logo-tail.png');
const PAWTY_WAVES_LEFT = require('../../assets/pawty-logo-waves-left.png');
const PAWTY_WAVES_RIGHT = require('../../assets/pawty-logo-waves-right.png');

interface MobileAnimatedLogoProps {
  width?: number;
  withReveal?: boolean;
}

export const MobileAnimatedLogo: React.FC<MobileAnimatedLogoProps> = ({
  width = 160,
  withReveal = false,
}) => {
  const height = Math.round(width / 1.34);

  // Wag animation value: 0 (left) to 1 (right)
  const wagAnim = useRef(new Animated.Value(0)).current;
  const revealScale = useRef(new Animated.Value(withReveal ? 0.85 : 1)).current;
  const revealOpacity = useRef(new Animated.Value(withReveal ? 0 : 1)).current;

  useEffect(() => {
    // Reveal animation
    if (withReveal) {
      Animated.parallel([
        Animated.timing(revealScale, {
          toValue: 1,
          duration: 900,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
        Animated.timing(revealOpacity, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
      ]).start();
    }

    // Continuous wagging loop
    const wagLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(wagAnim, {
          toValue: 1,
          duration: 380,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(wagAnim, {
          toValue: 0,
          duration: 380,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    wagLoop.start();

    return () => {
      wagLoop.stop();
    };
  }, [wagAnim, revealScale, revealOpacity, withReveal]);

  // Interpolate rotation for tail: -8deg to 11deg
  const tailRotation = wagAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['-8deg', '11deg'],
  });

  // Interpolate opacity for left waves
  const leftWavesOpacity = wagAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.3, 0.05],
  });

  // Interpolate opacity for right waves
  const rightWavesOpacity = wagAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.05, 0.3, 1],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width,
          height,
          transform: [{ scale: revealScale }],
          opacity: revealOpacity,
        },
      ]}
    >
      {/* Layer 1: Body */}
      <Image
        source={PAWTY_BODY}
        style={[styles.layer, { width, height }]}
        resizeMode="contain"
      />

      {/* Layer 2: Wagging Tail */}
      <Animated.View
        style={[
          styles.layer,
          {
            width,
            height,
            transform: [{ rotate: tailRotation }],
          },
        ]}
      >
        <Image
          source={PAWTY_TAIL}
          style={{ width, height }}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Layer 3: Left Waves */}
      <Animated.View
        style={[
          styles.layer,
          {
            width,
            height,
            opacity: leftWavesOpacity,
          },
        ]}
      >
        <Image
          source={PAWTY_WAVES_LEFT}
          style={{ width, height }}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Layer 4: Right Waves */}
      <Animated.View
        style={[
          styles.layer,
          {
            width,
            height,
            opacity: rightWavesOpacity,
          },
        ]}
      >
        <Image
          source={PAWTY_WAVES_RIGHT}
          style={{ width, height }}
          resizeMode="contain"
        />
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  layer: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});

