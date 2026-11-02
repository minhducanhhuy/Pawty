import React, { useEffect, useRef } from 'react';
import {
  View,
  Image,
  Animated,
  Easing,
  StyleSheet,
  Platform,
} from 'react-native';

const PAWTY_BODY = require('../../assets/pawty-logo-body.png');
const PAWTY_TAIL = require('../../assets/pawty-logo-tail.png');
const PAWTY_WAVES_LEFT = require('../../assets/pawty-logo-waves-left.png');
const PAWTY_WAVES_RIGHT = require('../../assets/pawty-logo-waves-right.png');

interface MobileAnimatedLogoProps {
  width?: number;
  withReveal?: boolean;
}

export const MobileAnimatedLogo: React.FC<MobileAnimatedLogoProps> = ({
  width = 210,
  withReveal = false,
}) => {
  const height = Math.round(width / 1.34);

  // Wag animation value: 0 -> 1 -> 0
  const wagAnim = useRef(new Animated.Value(0)).current;

  // Calligraphy brush reveal animation (0 to 1)
  const brushAnim = useRef(new Animated.Value(withReveal ? 0 : 1)).current;
  const containerScale = useRef(new Animated.Value(withReveal ? 0.94 : 1)).current;
  const containerOpacity = useRef(new Animated.Value(withReveal ? 0 : 1)).current;

  useEffect(() => {
    // 1. Calligraphy Brush Stroke Reveal Animation
    if (withReveal) {
      Animated.parallel([
        Animated.timing(brushAnim, {
          toValue: 1,
          duration: 1100,
          easing: Easing.bezier(0.22, 1, 0.36, 1), // smooth calligraphy brush sweep
          useNativeDriver: false, // width animation requires false for native driver
        }),
        Animated.timing(containerScale, {
          toValue: 1,
          duration: 1000,
          easing: Easing.out(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(containerOpacity, {
          toValue: 1,
          duration: 400,
          easing: Easing.ease,
          useNativeDriver: false,
        }),
      ]).start();
    }

    // 2. Playful Dog Tail Wagging Loop (0.76s per cycle, matching SSOT)
    const wagLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(wagAnim, {
          toValue: 0.5,
          duration: 190,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(wagAnim, {
          toValue: 1,
          duration: 190,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(wagAnim, {
          toValue: 0.5,
          duration: 190,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
        Animated.timing(wagAnim, {
          toValue: 0,
          duration: 190,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: false,
        }),
      ])
    );

    // Start wagging after brush begins reaching the 'y' stem
    const wagTimer = setTimeout(() => {
      wagLoop.start();
    }, withReveal ? 650 : 0);

    return () => {
      clearTimeout(wagTimer);
      wagLoop.stop();
    };
  }, [wagAnim, brushAnim, containerScale, containerOpacity, withReveal]);

  // Tail rotation: -8deg to +11deg
  const tailRotation = wagAnim.interpolate({
    inputRange: [0, 0.24, 0.5, 0.74, 1],
    outputRange: ['-8deg', '2deg', '11deg', '2deg', '-8deg'],
  });

  // Left waves opacity (peaks when tail is left)
  const leftWavesOpacity = wagAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 0.15, 0.05],
  });

  // Right waves opacity (peaks when tail is right)
  const rightWavesOpacity = wagAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0.05, 0.15, 1],
  });

  // Reveal width for the calligraphy brush stroke (expanding left to right)
  const revealClipWidth = brushAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, width],
  });

  // Moving glowing brush head position along the text
  const brushTipLeft = brushAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-8, width - 8],
  });

  // Brush tip glow visibility (fades out as brush finishes the stroke)
  const brushTipOpacity = brushAnim.interpolate({
    inputRange: [0, 0.08, 0.85, 1],
    outputRange: [0, 0.55, 0.4, 0],
  });

  // Tail appearance: appears once brush reaches letter 'y'
  const tailRevealOpacity = brushAnim.interpolate({
    inputRange: [0, 0.65, 0.85, 1],
    outputRange: [0, 0, 0.9, 1],
  });

  const tailRevealScale = brushAnim.interpolate({
    inputRange: [0, 0.65, 0.85, 1],
    outputRange: [0.6, 0.6, 1.05, 1],
  });

  // Waves appearance: follows the tail
  const wavesRevealOpacity = brushAnim.interpolate({
    inputRange: [0, 0.8, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width,
          height,
          transform: [{ scale: containerScale }],
          opacity: containerOpacity,
        },
      ]}
    >
      {/* Web-only CSS keyframes injection for ultra-crisp CSS brush rendering */}
      {Platform.OS === 'web' && (
        <style
          // @ts-ignore Web-only element
          dangerouslySetInnerHTML={{
            __html: `
              @keyframes pawtyTailWag {
                0% { transform: rotate(-8deg); }
                24% { transform: rotate(2deg) scale(1.018); }
                50% { transform: rotate(11deg); }
                74% { transform: rotate(2deg) scale(0.988); }
                100% { transform: rotate(-8deg); }
              }
              .pawty-tail-wag-joint {
                transform-origin: 66.4% 67.4% 0px !important;
              }
            `,
          }}
        />
      )}

      {/* Warm Ambient Radial Aura */}
      <View
        style={[
          styles.ambientAura,
          {
            width: width * 1.15,
            height: height * 1.15,
            borderRadius: (width * 1.15) / 2,
          },
        ]}
      />

      {/* Layer 1: Body with Calligraphy Brush Reveal (Left to Right Sweep) */}
      <Animated.View
        style={[
          styles.brushClipWindow,
          {
            width: revealClipWidth,
            height,
          },
        ]}
      >
        <Image
          source={PAWTY_BODY}
          style={{ width, height }}
          resizeMode="contain"
        />

        {/* Dynamic Wet Paint / Brush Tip Glow leading the stroke */}
        {withReveal && (
          <Animated.View
            style={[
              styles.brushTipGlow,
              {
                left: brushTipLeft,
                top: height * 0.12,
                height: height * 0.76,
                opacity: brushTipOpacity,
              },
            ]}
          />
        )}
      </Animated.View>

      {/* Layer 2: Wagging Tail with Exact Pivot Anchor (66.4% X, 67.4% Y) */}
      <Animated.View
        // @ts-ignore className for web
        className="pawty-tail-wag-joint"
        style={[
          styles.layer,
          {
            width,
            height,
            opacity: tailRevealOpacity,
            // transformOrigin anchored at joint (66.4%, 67.4%)
            transformOrigin: ['66.4%', '67.4%', 0],
            transform: [
              { scale: tailRevealScale },
              { rotate: tailRotation },
            ],
          },
        ]}
      >
        <Image
          source={PAWTY_TAIL}
          style={{ width, height }}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Layer 3: Left Mint Sound Waves */}
      <Animated.View
        style={[
          styles.layer,
          {
            width,
            height,
            opacity: Animated.multiply(leftWavesOpacity, wavesRevealOpacity),
          },
        ]}
      >
        <Image
          source={PAWTY_WAVES_LEFT}
          style={{ width, height }}
          resizeMode="contain"
        />
      </Animated.View>

      {/* Layer 4: Right Mint Sound Waves */}
      <Animated.View
        style={[
          styles.layer,
          {
            width,
            height,
            opacity: Animated.multiply(rightWavesOpacity, wavesRevealOpacity),
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
  brushClipWindow: {
    position: 'absolute',
    top: 0,
    left: 0,
    overflow: 'hidden',
  },
  brushTipGlow: {
    position: 'absolute',
    width: 22,
    borderRadius: 11,
    backgroundColor: '#FF6F61',
    shadowColor: '#FF6F61',
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 12,
    shadowOpacity: 0.7,
  },
  ambientAura: {
    position: 'absolute',
    backgroundColor: 'rgba(255, 111, 97, 0.05)',
  },
});
