import React, { useEffect } from 'react';
import { View, Text, StyleSheet, type TextStyle, Dimensions } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);
const SCREEN_W = Dimensions.get('window').width;

interface Props {
  text: string;
  style?: TextStyle;
  shimmerInterval?: number;
  shimmerDuration?: number;
}

export default function GoldShimmerText({
  text,
  style,
  shimmerInterval = 7000,
  shimmerDuration = 2000,
}: Props) {
  const shimmerX = useSharedValue(-SCREEN_W);

  useEffect(() => {
    shimmerX.value = withRepeat(
      withSequence(
        withDelay(
          shimmerInterval,
          withTiming(SCREEN_W, {
            duration: shimmerDuration,
            easing: Easing.out(Easing.quad),
          }),
        ),
        withTiming(-SCREEN_W, { duration: 0 }),
      ),
      -1,
    );
  }, []);

  const animStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmerX.value }],
  }));

  const merged: TextStyle = { ...styles.base, ...style };

  return (
    <MaskedView
      style={styles.mask}
      maskElement={
        <View style={styles.maskInner}>
          <Text style={merged}>{text}</Text>
        </View>
      }
    >
      {/* Base white fill */}
      <View style={[styles.fill, { backgroundColor: '#FFFFFF' }]} />

      {/* Animated gold shimmer highlight */}
      <AnimatedLinearGradient
        colors={[
          'transparent',
          'rgba(201,169,110,0.4)',
          'rgba(201,169,110,0.85)',
          '#C9A96E',
          'rgba(201,169,110,0.85)',
          'rgba(201,169,110,0.4)',
          'transparent',
        ]}
        locations={[0, 0.15, 0.35, 0.5, 0.65, 0.85, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[styles.shimmer, animStyle]}
      />
    </MaskedView>
  );
}

const styles = StyleSheet.create({
  mask: {
    height: 34,
    alignSelf: 'stretch',
  },
  maskInner: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  base: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 4,
    color: '#000',
  },
  fill: {
    ...StyleSheet.absoluteFillObject,
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 160,
  },
});
