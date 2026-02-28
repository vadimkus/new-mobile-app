import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withDelay,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { colors, typography, radius, spacing } from '../../constants/theme';

interface BenefitPillProps {
  label: string;
  emoji?: string;
  delay?: number;
  glowColor?: string;
}

export default function BenefitPill({
  label,
  emoji,
  delay = 0,
  glowColor,
}: BenefitPillProps) {
  const floatStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: withDelay(
          delay,
          withRepeat(
            withSequence(
              withTiming(-6, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
              withTiming(6, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
            ),
            -1,
            true,
          ),
        ),
      },
    ],
  }));

  return (
    <Animated.View style={[styles.container, floatStyle]}>
      <BlurView intensity={30} tint="dark" style={styles.blur}>
        <View
          style={[
            styles.pill,
            glowColor
              ? { shadowColor: glowColor, shadowOpacity: 0.4, shadowRadius: 12 }
              : undefined,
          ]}
        >
          {emoji && <Text style={styles.emoji}>{emoji}</Text>}
          <Text style={styles.label}>{label}</Text>
        </View>
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.pill,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  blur: {
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  pill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.glass.medium,
    shadowOffset: { width: 0, height: 0 },
  },
  emoji: {
    fontSize: 14,
    marginRight: spacing.xs,
  },
  label: {
    ...typography.label,
    color: colors.text.primary,
    fontSize: 13,
  },
});
