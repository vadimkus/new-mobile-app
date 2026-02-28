import React, { useState, useRef, useCallback } from 'react';
import { View, StyleSheet, StatusBar, Pressable } from 'react-native';
import { Video, ResizeMode, type AVPlaybackStatus } from 'expo-av';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';

const SPLASH_VIDEO = require('../../assets/video/ramadan2.mp4');

interface VideoSplashProps {
  duration?: number;
  onDone: () => void;
}

export default function VideoSplash({ duration = 5000, onDone }: VideoSplashProps) {
  const videoRef = useRef<Video>(null);
  const dismissedRef = useRef(false);
  const opacity = useSharedValue(1);

  const dismiss = useCallback(() => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;
    opacity.value = withTiming(0, { duration: 400 }, () => {
      runOnJS(onDone)();
    });
  }, [onDone, opacity]);

  React.useEffect(() => {
    const timer = setTimeout(dismiss, duration + 500);
    return () => clearTimeout(timer);
  }, [duration, dismiss]);

  const handlePlaybackStatus = useCallback(
    (status: AVPlaybackStatus) => {
      if (status.isLoaded && status.didJustFinish) {
        dismiss();
      }
    },
    [dismiss],
  );

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
  }));

  return (
    <Animated.View style={[styles.container, animatedStyle]}>
      <StatusBar hidden />
      <Pressable style={StyleSheet.absoluteFill} onPress={dismiss}>
        <Video
          ref={videoRef}
          source={SPLASH_VIDEO}
          style={StyleSheet.absoluteFill}
          resizeMode={ResizeMode.COVER}
          shouldPlay
          isMuted
          isLooping={false}
          onPlaybackStatusUpdate={handlePlaybackStatus}
          onError={dismiss}
        />
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#000',
    zIndex: 999,
  },
});
