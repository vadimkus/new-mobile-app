import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Ellipse, Defs, RadialGradient, Stop } from 'react-native-svg';
import { colors, spacing } from '../../constants/theme';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PODIUM_WIDTH = SCREEN_WIDTH * 0.65;
const PODIUM_HEIGHT = 40;

interface ProductPodiumProps {
  children: React.ReactNode;
}

export default function ProductPodium({ children }: ProductPodiumProps) {
  const floatStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: withRepeat(
          withSequence(
            withTiming(-8, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
            withTiming(0, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
          ),
          -1,
          true,
        ),
      },
    ],
  }));

  const glowPulse = useAnimatedStyle(() => ({
    opacity: withRepeat(
      withSequence(
        withTiming(0.8, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.4, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1,
      true,
    ),
  }));

  return (
    <View style={styles.container}>
      {/* Background glow */}
      <Animated.View style={[styles.backgroundGlow, glowPulse]}>
        <View style={styles.glowCircle} />
      </Animated.View>

      {/* Floating product */}
      <Animated.View style={[styles.productContainer, floatStyle]}>
        {children}
      </Animated.View>

      {/* Podium base */}
      <View style={styles.podiumContainer}>
        <Svg width={PODIUM_WIDTH} height={PODIUM_HEIGHT} viewBox={`0 0 ${PODIUM_WIDTH} ${PODIUM_HEIGHT}`}>
          <Defs>
            <RadialGradient id="podiumGlow" cx="50%" cy="50%" rx="50%" ry="50%">
              <Stop offset="0%" stopColor={colors.gold[500]} stopOpacity={0.6} />
              <Stop offset="70%" stopColor={colors.gold[700]} stopOpacity={0.2} />
              <Stop offset="100%" stopColor={colors.gold[900]} stopOpacity={0} />
            </RadialGradient>
          </Defs>
          <Ellipse
            cx={PODIUM_WIDTH / 2}
            cy={PODIUM_HEIGHT / 2}
            rx={PODIUM_WIDTH / 2}
            ry={PODIUM_HEIGHT / 2}
            fill="url(#podiumGlow)"
          />
        </Svg>

        {/* Light rays */}
        <View style={styles.lightRays}>
          {Array.from({ length: 5 }).map((_, i) => (
            <View
              key={i}
              style={[
                styles.lightRay,
                {
                  transform: [{ rotate: `${-30 + i * 15}deg` }],
                  opacity: 0.08 + i * 0.02,
                },
              ]}
            />
          ))}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: spacing.xxxl,
  },
  backgroundGlow: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  glowCircle: {
    width: SCREEN_WIDTH * 0.6,
    height: SCREEN_WIDTH * 0.6,
    borderRadius: SCREEN_WIDTH * 0.3,
    backgroundColor: colors.gold[500],
    opacity: 0.06,
  },
  productContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
    zIndex: 2,
  },
  podiumContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  lightRays: {
    position: 'absolute',
    bottom: PODIUM_HEIGHT / 2,
    alignItems: 'center',
    justifyContent: 'flex-end',
    width: PODIUM_WIDTH,
    height: 200,
    overflow: 'hidden',
  },
  lightRay: {
    position: 'absolute',
    bottom: 0,
    width: 2,
    height: 180,
    backgroundColor: colors.gold[300],
  },
});
