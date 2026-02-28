import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated, {
  useAnimatedProps,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { colors, typography } from '../../constants/theme';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface SkinScoreRingProps {
  score: number;
  maxScore?: number;
  size?: number;
  strokeWidth?: number;
}

export default function SkinScoreRing({
  score,
  maxScore = 100,
  size = 160,
  strokeWidth = 8,
}: SkinScoreRingProps) {
  const r = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * r;
  const progress = score / maxScore;

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: withTiming(
      circumference * (1 - progress),
      { duration: 1500, easing: Easing.out(Easing.cubic) },
    ),
  }));

  return (
    <View style={[styles.container, { width: size, height: size }]}>
      <Svg width={size} height={size}>
        {/* Background ring */}
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.bg.elevated}
          strokeWidth={strokeWidth}
          fill="none"
        />
        {/* Score ring */}
        <AnimatedCircle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.gold[500]}
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          animatedProps={animatedProps}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>

      {/* Center content */}
      <View style={styles.center}>
        <Text style={styles.score}>{score}</Text>
        <Text style={styles.label}>Skin Score</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  center: {
    position: 'absolute',
    alignItems: 'center',
  },
  score: {
    ...typography.display,
    fontSize: 48,
    color: colors.text.primary,
    lineHeight: 52,
  },
  label: {
    ...typography.caption1,
    color: colors.gold[500],
    marginTop: 2,
  },
});
