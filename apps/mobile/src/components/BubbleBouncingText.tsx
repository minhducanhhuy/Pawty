import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet, Platform, Easing } from 'react-native';

interface BubbleBouncingTextProps {
  text?: string;
  fontSize?: number;
  color?: string;
}

export const BubbleBouncingText: React.FC<BubbleBouncingTextProps> = ({
  text = 'Những bàn chân nhỏ đang tới',
  fontSize = 15.5,
  color = '#FF6F61',
}) => {
  const characters = text.split('');

  // Create an animated value for each character
  const animValues = useRef(characters.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    let isMounted = true;

    const runWave = () => {
      if (!isMounted) return;

      // Create staggered bubble animations for non-space characters
      const animations = characters.map((char, index) => {
        if (char === ' ') return null;

        return Animated.sequence([
          Animated.delay(index * 55), // Staggered delay for wave effect
          Animated.timing(animValues[index], {
            toValue: 1,
            duration: 320,
            easing: Easing.bezier(0.34, 1.56, 0.64, 1), // Bouncy spring pop
            useNativeDriver: true,
          }),
          Animated.timing(animValues[index], {
            toValue: 0,
            duration: 280,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ]);
      }).filter(Boolean) as Animated.CompositeAnimation[];

      Animated.parallel(animations).start(() => {
        // Pause gently then loop the bubble wave
        if (isMounted) {
          setTimeout(runWave, 1600);
        }
      });
    };

    runWave();

    return () => {
      isMounted = false;
    };
  }, [animValues, characters]);

  return (
    <View style={styles.container}>
      {characters.map((char, index) => {
        if (char === ' ') {
          return (
            <Text key={`space-${index}`} style={[styles.charText, { fontSize }]}>
              {' '}
            </Text>
          );
        }

        const translateY = animValues[index].interpolate({
          inputRange: [0, 1],
          outputRange: [0, -6],
        });

        const scale = animValues[index].interpolate({
          inputRange: [0, 1],
          outputRange: [1, 1.18],
        });

        return (
          <Animated.View
            key={`char-${index}`}
            style={{
              transform: [{ translateY }, { scale }],
            }}
          >
            <Text
              style={[
                styles.charText,
                {
                  fontSize,
                  color,
                },
              ]}
            >
              {char}
            </Text>
          </Animated.View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  charText: {
    fontWeight: '900',
    fontFamily: Platform.select({
      ios: 'Arial Rounded MT Bold',
      android: 'sans-serif-rounded',
      default: 'system-ui',
    }),
    letterSpacing: 0.3,
    // Blur glow effect
    textShadowColor: 'rgba(255, 111, 97, 0.42)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 8,
  },
});
