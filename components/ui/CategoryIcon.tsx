import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { useAnimatedStyle, withSpring } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, typography, radius, spacing } from '../../constants/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface CategoryIconProps {
  label: string;
  icon: IconName;
  isActive: boolean;
  onPress: () => void;
}

export default function CategoryIcon({ label, icon, isActive, onPress }: CategoryIconProps) {
  const ringStyle = useAnimatedStyle(() => ({
    borderColor: withSpring(isActive ? colors.gold[500] : colors.glass.border, {
      damping: 15,
      stiffness: 200,
    }),
    transform: [{ scale: withSpring(isActive ? 1.05 : 1, { damping: 15, stiffness: 200 }) }],
  }));

  return (
    <TouchableOpacity
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
      }}
      activeOpacity={0.7}
      style={styles.container}
    >
      <Animated.View
        style={[
          styles.iconCircle,
          ringStyle,
          isActive && styles.activeGlow,
        ]}
      >
        <Ionicons
          name={icon}
          size={22}
          color={isActive ? colors.gold[500] : colors.text.secondary}
        />
      </Animated.View>
      <Text
        style={[
          styles.label,
          isActive && styles.activeLabel,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginRight: spacing.lg,
    minWidth: 56,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: radius.circle,
    borderWidth: 1.5,
    backgroundColor: colors.glass.light,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  activeGlow: {
    shadowColor: colors.gold[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  label: {
    ...typography.caption2,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  activeLabel: {
    color: colors.gold[500],
    fontWeight: '600',
  },
});
