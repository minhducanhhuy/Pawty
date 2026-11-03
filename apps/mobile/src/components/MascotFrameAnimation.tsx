import React, { useEffect, useRef, useState } from 'react';
import { View, StyleSheet, Animated, Easing } from 'react-native';

const FRAME_1 = require('../../assets/pawty-mascot-frame-1.png');
const FRAME_2 = require('../../assets/pawty-mascot-frame-2.png');
const FRAME_3 = require('../../assets/pawty-mascot-frame-3.png');
const FRAME_4 = require('../../assets/pawty-mascot-frame-4.png');

const FRAMES = [FRAME_1, FRAME_2, FRAME_3, FRAME_4];
const FRAME_DURATIONS = [450, 380, 650, 380]; // Paced storytelling timing

interface MascotFrameAnimationProps {
  width?: number;
}

export const MascotFrameAnimation: React.FC<MascotFrameAnimationProps> = ({
  width = 145,
}) => {
  const height = Math.round((width * 800) / 1000); // 1000x800 aspect ratio
  const [activeFrame, setActiveFrame] = useState(0);

  // Separate opacity animated values for crossfading
  const opacities = useRef(FRAMES.map((_, i) => new Animated.Value(i === 0 ? 1 : 0))).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;

  // Gentle cartoon idle bounce
  useEffect(() => {
    const bounceLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -5,
          duration: 380,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 380,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    bounceLoop.start();
    return () => bounceLoop.stop();
  }, [bounceAnim]);

  // Frame sequencing with smooth crossfading
  useEffect(() => {
    let isMounted = true;
    let timer: ReturnType<typeof setTimeout>;

    const transitionToNextFrame = (currIdx: number) => {
      const nextIdx = (currIdx + 1) % FRAMES.length;
      const stayDuration = FRAME_DURATIONS[currIdx];

      timer = setTimeout(() => {
        if (!isMounted) return;

        // Crossfade: fade in next frame while fading out current frame
        Animated.parallel([
          Animated.timing(opacities[nextIdx], {
            toValue: 1,
            duration: 120,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
          Animated.timing(opacities[currIdx], {
            toValue: 0,
            duration: 120,
            easing: Easing.linear,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (isMounted) {
            setActiveFrame(nextIdx);
            transitionToNextFrame(nextIdx);
          }
        });
      }, stayDuration);
    };

    transitionToNextFrame(activeFrame);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [activeFrame, opacities]);

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width,
          height,
          transform: [{ translateY: bounceAnim }],
        },
      ]}
    >
      {FRAMES.map((src, index) => (
        <Animated.Image
          key={`frame-${index}`}
          source={src}
          style={[
            styles.frameImage,
            {
              width,
              height,
              opacity: opacities[index],
            },
          ]}
          resizeMode="contain"
        />
      ))}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  frameImage: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
