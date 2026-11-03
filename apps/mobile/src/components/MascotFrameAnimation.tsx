import React, { useEffect, useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';

const FRAME_1 = require('../../assets/pawty-mascot-frame-1.png');
const FRAME_2 = require('../../assets/pawty-mascot-frame-2.png');
const FRAME_3 = require('../../assets/pawty-mascot-frame-3.png');
const FRAME_4 = require('../../assets/pawty-mascot-frame-4.png');

const FRAMES = [FRAME_1, FRAME_2, FRAME_3, FRAME_4];

interface MascotFrameAnimationProps {
  width?: number;
  frameDuration?: number;
}

export const MascotFrameAnimation: React.FC<MascotFrameAnimationProps> = ({
  width = 140,
  frameDuration = 320,
}) => {
  const height = Math.round((width * 800) / 1000); // 1000x800 aspect ratio
  const [currentFrame, setCurrentFrame] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentFrame((prev) => (prev + 1) % FRAMES.length);
    }, frameDuration);

    return () => clearInterval(timer);
  }, [frameDuration]);

  return (
    <View style={[styles.container, { width, height }]}>
      {FRAMES.map((src, index) => (
        <Image
          key={`frame-${index}`}
          source={src}
          style={[
            styles.frameImage,
            {
              width,
              height,
              opacity: currentFrame === index ? 1 : 0,
            },
          ]}
          resizeMode="contain"
        />
      ))}
    </View>
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
