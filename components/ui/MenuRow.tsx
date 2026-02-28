import React from 'react';
import { TouchableOpacity, View, Text, Switch, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, radius } from '../../constants/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface MenuRowProps {
  icon: IconName;
  iconColor?: string;
  label: string;
  subtitle?: string;
  onPress?: () => void;
  rightText?: string;
  showChevron?: boolean;
  isSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (value: boolean) => void;
  destructive?: boolean;
}

export default function MenuRow({
  icon,
  iconColor,
  label,
  subtitle,
  onPress,
  rightText,
  showChevron = true,
  isSwitch = false,
  switchValue = false,
  onSwitchChange,
  destructive = false,
}: MenuRowProps) {
  const textColor = destructive ? colors.status.error : colors.text.primary;
  const iColor = iconColor ?? (destructive ? colors.status.error : colors.gold[500]);

  const content = (
    <View style={styles.row}>
      <View style={[styles.iconCircle, { backgroundColor: destructive ? 'rgba(255,69,58,0.1)' : colors.glass.light }]}>
        <Ionicons name={icon} size={18} color={iColor} />
      </View>
      <View style={styles.labelContainer}>
        <Text style={[styles.label, { color: textColor }]}>{label}</Text>
        {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
      {rightText && <Text style={styles.rightText}>{rightText}</Text>}
      {isSwitch && (
        <Switch
          value={switchValue}
          onValueChange={(val) => {
            Haptics.selectionAsync();
            onSwitchChange?.(val);
          }}
          trackColor={{ false: colors.bg.elevated, true: colors.gold[500] }}
          thumbColor="#fff"
        />
      )}
      {!isSwitch && showChevron && (
        <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
      )}
    </View>
  );

  if (isSwitch) return <View style={styles.container}>{content}</View>;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress?.();
      }}
      activeOpacity={0.7}
    >
      {content}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 2,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: spacing.lg,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  labelContainer: {
    flex: 1,
  },
  label: {
    ...typography.headline,
    fontSize: 15,
  },
  subtitle: {
    ...typography.caption2,
    color: colors.text.tertiary,
    marginTop: 1,
  },
  rightText: {
    ...typography.caption1,
    color: colors.text.secondary,
    marginRight: spacing.sm,
  },
});
