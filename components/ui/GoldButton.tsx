import React from 'react';
import { TouchableOpacity, Text, StyleSheet, type ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { colors, typography, radius, spacing } from '../../constants/theme';

interface GoldButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'filled' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  disabled?: boolean;
  style?: ViewStyle;
  fullWidth?: boolean;
}

export default function GoldButton({
  title,
  onPress,
  variant = 'filled',
  size = 'md',
  icon,
  disabled = false,
  style,
  fullWidth = false,
}: GoldButtonProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };

  const height = size === 'sm' ? 36 : size === 'md' ? 48 : 56;
  const fontSize = size === 'sm' ? 13 : size === 'md' ? 15 : 17;

  if (variant === 'outline') {
    return (
      <TouchableOpacity
        onPress={handlePress}
        disabled={disabled}
        activeOpacity={0.7}
        style={[
          styles.base,
          styles.outline,
          { height },
          fullWidth && styles.fullWidth,
          disabled && styles.disabled,
          style,
        ]}
      >
        {icon}
        <Text
          style={[
            styles.outlineText,
            { fontSize },
            icon ? { marginLeft: spacing.sm } : undefined,
          ]}
        >
          {title}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[
        styles.base,
        { height },
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        style,
      ]}
    >
      <LinearGradient
        colors={disabled ? ['#555', '#444'] : [...colors.gold.gradient]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={[styles.gradient, { borderRadius: radius.md }]}
      >
        {icon}
        <Text
          style={[
            styles.filledText,
            { fontSize },
            icon ? { marginLeft: spacing.sm } : undefined,
          ]}
        >
          {title}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  fullWidth: {
    width: '100%',
  },
  gradient: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
  },
  outline: {
    borderWidth: 1,
    borderColor: colors.gold[500],
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xl,
    backgroundColor: 'transparent',
  },
  filledText: {
    ...typography.button,
    color: colors.text.inverse,
    fontWeight: '700',
  },
  outlineText: {
    ...typography.button,
    color: colors.gold[500],
    fontWeight: '600',
  },
  disabled: {
    opacity: 0.5,
  },
});
