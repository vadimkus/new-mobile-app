import React, { type ReactNode } from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { BlurView } from 'expo-blur';
import { colors, radius, spacing } from '../../constants/theme';

interface GlassCardProps {
  children: ReactNode;
  style?: ViewStyle;
  intensity?: 'light' | 'medium' | 'strong';
  padding?: keyof typeof spacing;
  borderRadius?: keyof typeof radius;
  noBorder?: boolean;
}

export default function GlassCard({
  children,
  style,
  intensity = 'light',
  padding = 'lg',
  borderRadius = 'xl',
  noBorder = false,
}: GlassCardProps) {
  const bgColor = colors.glass[intensity];
  const r = radius[borderRadius];
  const p = spacing[padding];

  return (
    <View
      style={[
        styles.container,
        {
          borderRadius: r,
          borderColor: noBorder ? 'transparent' : colors.glass.border,
        },
        style,
      ]}
    >
      <BlurView intensity={40} tint="dark" style={[styles.blur, { borderRadius: r }]}>
        <View style={[styles.content, { padding: p, backgroundColor: bgColor }]}>
          {children}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderWidth: 1,
  },
  blur: {
    overflow: 'hidden',
  },
  content: {
    flex: 1,
  },
});
