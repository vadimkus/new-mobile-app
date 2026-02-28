import React from 'react';
import { View, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  withSpring,
  interpolateColor,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, radius, layout } from '../../constants/theme';
import { useLocalization } from '../../contexts/LocalizationContext';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface TabConfig {
  name: string;
  labelKey: string;
  icon: IconName;
  iconActive: IconName;
  badge?: number;
}

const TABS: TabConfig[] = [
  { name: 'discover', labelKey: 'tabs.discover', icon: 'compass-outline', iconActive: 'compass' },
  { name: 'ritual', labelKey: 'tabs.ritual', icon: 'sunny-outline', iconActive: 'sunny' },
  { name: 'skin-ai', labelKey: 'tabs.skinAi', icon: 'scan-outline', iconActive: 'scan' },
  { name: 'bag', labelKey: 'tabs.bag', icon: 'bag-outline', iconActive: 'bag' },
];

interface GlassTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

function TabItem({
  tab,
  isActive,
  badge,
  onPress,
  label,
}: {
  tab: TabConfig;
  isActive: boolean;
  badge?: number;
  onPress: () => void;
  label: string;
}) {
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withSpring(isActive ? 1 : 0.9, {
          damping: 15,
          stiffness: 200,
        }),
      },
    ],
  }));

  const iconColor = isActive ? colors.gold[500] : colors.text.tertiary;
  const labelColor = isActive ? colors.gold[500] : colors.text.tertiary;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={styles.tabItem}
    >
      <Animated.View style={[styles.tabIconContainer, animatedStyle]}>
        <Ionicons
          name={isActive ? tab.iconActive : tab.icon}
          size={24}
          color={iconColor}
        />
        {badge !== undefined && badge > 0 && (
          <View style={styles.badge}>
            <Animated.Text style={styles.badgeText}>
              {badge > 9 ? '9+' : badge}
            </Animated.Text>
          </View>
        )}
      </Animated.View>
      <Animated.Text style={[styles.tabLabel, { color: labelColor }]}>
        {label}
      </Animated.Text>
    </TouchableOpacity>
  );
}

export default function GlassTabBar({ state, descriptors, navigation }: GlassTabBarProps) {
  const insets = useSafeAreaInsets();
  const { t } = useLocalization();
  const bottomPadding = Math.max(insets.bottom, 8);

  return (
    <View style={[styles.container, { paddingBottom: bottomPadding }]}>
      <BlurView
        intensity={Platform.OS === 'ios' ? 80 : 100}
        tint="dark"
        style={styles.blurContainer}
      >
        <View style={styles.tabRow}>
          {TABS.map((tab, index) => {
            const isActive = state.index === index;
            const route = state.routes[index];
            const descriptor = descriptors[route.key];

            const badge = tab.name === 'bag'
              ? descriptor?.options?.tabBarBadge
              : undefined;

            return (
              <TabItem
                key={tab.name}
                tab={tab}
                isActive={isActive}
                badge={badge}
                label={t(tab.labelKey)}
                onPress={() => {
                  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  const event = navigation.emit({
                    type: 'tabPress',
                    target: route.key,
                    canPreventDefault: true,
                  });
                  if (!isActive && !event.defaultPrevented) {
                    navigation.navigate(route.name);
                  }
                }}
              />
            );
          })}
        </View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  blurContainer: {
    width: '100%',
    borderRadius: radius.xxl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  tabRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    paddingVertical: spacing.xs,
    minHeight: layout.touchTarget,
  },
  tabIconContainer: {
    position: 'relative',
    marginBottom: 2,
  },
  tabLabel: {
    ...typography.tabLabel,
    marginTop: 2,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -10,
    backgroundColor: colors.status.error,
    borderRadius: radius.circle,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: colors.text.primary,
    fontSize: 10,
    fontWeight: '700',
  },
});
