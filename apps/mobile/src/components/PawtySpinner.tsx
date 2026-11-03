import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, StyleProp, ViewStyle, ImageStyle } from 'react-native';

const SPINNER_IMG = require('../../assets/pawty-spinner.png');

interface PawtySpinnerProps {
  size?: number;
  duration?: number;
  style?: StyleProp<ViewStyle>;
}

export const PawtySpinner: React.FC<PawtySpinnerProps> = ({
  size = 56,
  duration = 2000,
  style,
}) => {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [duration, rotateAnim]);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <Animated.Image
      source={SPINNER_IMG}
      style={[
        styles.spinner,
        {
          width: size,
          height: size,
          transform: [{ rotate: spin }],
        },
        style as ImageStyle,
      ]}
      resizeMode="contain"
    />
  );
};

const styles = StyleSheet.create({
  spinner: {
    alignSelf: 'center',
  },
});
