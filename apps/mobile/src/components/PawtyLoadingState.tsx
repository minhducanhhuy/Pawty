import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import { PawtySpinner } from './PawtySpinner';

interface PawtyLoadingStateProps {
  text?: string;
  subtext?: string;
  spinnerSize?: number;
  compact?: boolean;
  style?: StyleProp<ViewStyle>;
}

export const PawtyLoadingState: React.FC<PawtyLoadingStateProps> = ({
  text = 'Đợi Pawty xíu nha',
  subtext,
  spinnerSize = 64,
  compact = false,
  style,
}) => {
  const [dotCount, setDotCount] = useState(1);

  // Sequential 3 dots animation ("" -> "." -> ".." -> "..." -> loop)
  useEffect(() => {
    const timer = setInterval(() => {
      setDotCount((prev) => (prev + 1) % 4);
    }, 380);

    return () => clearInterval(timer);
  }, []);

  const activeDots = '.'.repeat(dotCount);
  const ghostDots = '.'.repeat(3 - dotCount);

  return (
    <View style={[styles.container, compact && styles.containerCompact, style]}>
      <PawtySpinner size={spinnerSize} />
      
      <View style={styles.textContainer}>
        <Text style={[styles.loadingTitle, compact && styles.loadingTitleCompact]}>
          {text}
          <Text style={styles.activeDots}>{activeDots}</Text>
          <Text style={styles.ghostDots}>{ghostDots}</Text>
        </Text>

        {Boolean(subtext) && (
          <Text style={styles.subtext}>{subtext}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    gap: 12,
  },
  containerCompact: {
    paddingVertical: 12,
    gap: 8,
  },
  textContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#FF6F61', // Pawty signature coral
    letterSpacing: 0.3,
  },
  loadingTitleCompact: {
    fontSize: 13,
  },
  activeDots: {
    color: '#FF6F61',
    fontWeight: '900',
  },
  ghostDots: {
    opacity: 0, // Keeps text width perfectly stable without shifting
  },
  subtext: {
    fontSize: 12,
    color: '#8C7E72',
    marginTop: 4,
    textAlign: 'center',
  },
});
