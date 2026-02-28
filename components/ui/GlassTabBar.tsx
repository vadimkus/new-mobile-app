import React, { useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, Platform, Text } from 'react-native';
import { BlurView } from 'expo-blur';
import { Image } from 'expo-image';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withDelay,
  withSequence,
  interpolate,
  runOnJS,
  Easing,
} from 'react-native-reanimated';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, radius, layout } from '../../constants/theme';
import { useLocalization } from '../../contexts/LocalizationContext';
import { useCart, type LastAddedInfo } from '../../contexts/CartContext';

type IconName = React.ComponentProps<typeof Ionicons>['name'];

interface TabConfig {
  name: string;
  labelKey: string;
  icon: IconName;
  iconActive: IconName;
}

const TABS: TabConfig[] = [
  { name: 'discover', labelKey: 'tabs.discover', icon: 'compass-outline', iconActive: 'compass' },
  { name: 'ritual', labelKey: 'tabs.ritual', icon: 'sunny-outline', iconActive: 'sunny' },
  { name: 'skin-ai', labelKey: 'tabs.skinAi', icon: 'scan-outline', iconActive: 'scan' },
  { name: 'bag', labelKey: 'tabs.bag', icon: 'bag-outline', iconActive: 'bag' },
];

const TOAST_DURATION = 3200;
const SPRING_BOUNCY = { damping: 8, stiffness: 280, mass: 0.6 };
const SPRING_SMOOTH = { damping: 18, stiffness: 160 };

interface GlassTabBarProps {
  state: any;
  descriptors: any;
  navigation: any;
}

function TabItem({
  tab,
  isActive,
  onPress,
  label,
  isBag,
  bagCount,
  bagBounce,
  haloProgress,
}: {
  tab: TabConfig;
  isActive: boolean;
  onPress: () => void;
  label: string;
  isBag?: boolean;
  bagCount?: number;
  bagBounce: Animated.SharedValue<number>;
  haloProgress: Animated.SharedValue<number>;
}) {
  const baseStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: withSpring(isActive ? 1 : 0.9, { damping: 15, stiffness: 200 }) },
    ],
  }));

  const bagIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: bagBounce.value }],
  }));

  const haloStyle = useAnimatedStyle(() => {
    const scale = interpolate(haloProgress.value, [0, 1], [0.5, 2.8]);
    const opacity = interpolate(haloProgress.value, [0, 0.3, 1], [0.6, 0.4, 0]);
    return {
      transform: [{ scale }],
      opacity,
    };
  });

  const badgeScaleStyle = useAnimatedStyle(() => {
    const s = interpolate(bagBounce.value, [1, 1.35, 1], [1, 1.3, 1]);
    return { transform: [{ scale: s }] };
  });

  const iconColor = isActive ? colors.gold[500] : colors.text.tertiary;
  const hasBadge = isBag && bagCount !== undefined && bagCount > 0;

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7} style={styles.tabItem}>
      <Animated.View style={[styles.tabIconContainer, baseStyle]}>
        {isBag && (
          <Animated.View style={[styles.haloRing, haloStyle]} pointerEvents="none" />
        )}
        <Animated.View style={isBag ? bagIconStyle : undefined}>
          <Ionicons
            name={isActive ? tab.iconActive : tab.icon}
            size={24}
            color={iconColor}
          />
        </Animated.View>
        {hasBadge && (
          <Animated.View style={[styles.badge, badgeScaleStyle]}>
            <Text style={styles.badgeText}>
              {bagCount! > 9 ? '9+' : bagCount}
            </Text>
          </Animated.View>
        )}
      </Animated.View>
      <Animated.Text style={[styles.tabLabel, { color: isActive ? colors.gold[500] : colors.text.tertiary }]}>
        {label}
      </Animated.Text>
    </TouchableOpacity>
  );
}

export default function GlassTabBar({ state, descriptors, navigation }: GlassTabBarProps) {
  const insets = useSafeAreaInsets();
  const { t } = useLocalization();
  const { itemCount, lastAdded } = useCart();
  const bottomPadding = Math.max(insets.bottom, 8);

  const bagBounce = useSharedValue(1);
  const haloProgress = useSharedValue(0);
  const toastTranslateY = useSharedValue(80);
  const toastOpacity = useSharedValue(0);
  const toastShimmer = useSharedValue(0);

  const lastAddedRef = useRef<number>(0);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const toastInfo = useRef<LastAddedInfo | null>(null);
  const [toastData, setToastData] = React.useState<LastAddedInfo | null>(null);

  useEffect(() => {
    if (!lastAdded || lastAdded.addedAt === lastAddedRef.current) return;
    lastAddedRef.current = lastAdded.addedAt;
    toastInfo.current = lastAdded;

    runOnJS(setToastData)(lastAdded);

    bagBounce.value = withSequence(
      withSpring(1.35, SPRING_BOUNCY),
      withSpring(0.85, { damping: 12, stiffness: 300 }),
      withSpring(1, SPRING_SMOOTH),
    );

    haloProgress.value = 0;
    haloProgress.value = withTiming(1, { duration: 700, easing: Easing.out(Easing.cubic) });

    toastTranslateY.value = 60;
    toastOpacity.value = 0;
    toastShimmer.value = 0;

    toastTranslateY.value = withSpring(-8, { damping: 14, stiffness: 180, mass: 0.7 });
    toastOpacity.value = withTiming(1, { duration: 250 });
    toastShimmer.value = withDelay(300, withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) }));

    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => {
      toastTranslateY.value = withTiming(60, { duration: 350, easing: Easing.in(Easing.cubic) });
      toastOpacity.value = withTiming(0, { duration: 300 });
    }, TOAST_DURATION);
  }, [lastAdded]);

  const toastAnimStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: toastTranslateY.value }],
    opacity: toastOpacity.value,
  }));

  const shimmerStyle = useAnimatedStyle(() => {
    const x = interpolate(toastShimmer.value, [0, 1], [-200, 200]);
    return { transform: [{ translateX: x }] };
  });

  return (
    <View style={[styles.container, { paddingBottom: bottomPadding }]}>
      {/* Floating toast — glass pill above tab bar */}
      <Animated.View style={[styles.toastContainer, toastAnimStyle]} pointerEvents="none">
        <BlurView
          intensity={Platform.OS === 'ios' ? 60 : 80}
          tint="dark"
          style={styles.toastBlur}
        >
          <View style={styles.toastInner}>
            {/* Product thumbnail */}
            {toastData?.imageUrl ? (
              <View style={styles.toastThumbWrap}>
                <Image
                  source={{ uri: toastData.imageUrl }}
                  style={styles.toastThumb}
                  contentFit="contain"
                  transition={200}
                />
              </View>
            ) : (
              <View style={[styles.toastThumbWrap, styles.toastThumbPlaceholder]}>
                <Ionicons name="bag-check" size={14} color={colors.gold[500]} />
              </View>
            )}

            {/* Text content */}
            <View style={styles.toastTextWrap}>
              <Text style={styles.toastProductName} numberOfLines={1}>
                {toastData?.name || ''}
              </Text>
              <View style={styles.toastConfirmRow}>
                <Ionicons name="checkmark" size={12} color={colors.gold[500]} />
                <Text style={styles.toastConfirmText}>Added to Bag</Text>
              </View>
            </View>

            {/* Item count pill */}
            <View style={styles.toastCountPill}>
              <Text style={styles.toastCountText}>{itemCount}</Text>
            </View>
          </View>

          {/* Gold shimmer line at bottom */}
          <View style={styles.shimmerTrack}>
            <Animated.View style={[styles.shimmerLine, shimmerStyle]} />
          </View>
        </BlurView>
      </Animated.View>

      {/* Tab bar */}
      <BlurView
        intensity={Platform.OS === 'ios' ? 80 : 100}
        tint="dark"
        style={styles.blurContainer}
      >
        <View style={styles.tabRow}>
          {TABS.map((tab, index) => {
            const isActive = state.index === index;
            const route = state.routes[index];
            const isBag = tab.name === 'bag';

            return (
              <TabItem
                key={tab.name}
                tab={tab}
                isActive={isActive}
                label={t(tab.labelKey)}
                isBag={isBag}
                bagCount={isBag ? itemCount : undefined}
                bagBounce={bagBounce}
                haloProgress={haloProgress}
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

  // Badge
  badge: {
    position: 'absolute',
    top: -6,
    right: -12,
    backgroundColor: colors.gold[500],
    borderRadius: radius.circle,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: colors.bg.primary,
  },
  badgeText: {
    color: colors.text.inverse,
    fontSize: 10,
    fontWeight: '800',
  },

  // Golden halo ring around bag icon
  haloRing: {
    position: 'absolute',
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: colors.gold[500],
    top: -2,
    left: -2,
  },

  // Floating toast
  toastContainer: {
    position: 'absolute',
    bottom: '100%',
    right: 0,
    left: 0,
    alignItems: 'flex-end',
    paddingRight: 4,
    zIndex: 100,
  },
  toastBlur: {
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 110, 0.25)',
    minWidth: 200,
    maxWidth: 260,
  },
  toastInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },

  // Product thumbnail
  toastThumbWrap: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 110, 0.2)',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastThumb: {
    width: 28,
    height: 28,
    borderRadius: 14,
  },
  toastThumbPlaceholder: {
    backgroundColor: 'rgba(201, 169, 110, 0.1)',
  },

  // Text
  toastTextWrap: {
    flex: 1,
    gap: 2,
  },
  toastProductName: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.text.primary,
    letterSpacing: 0.2,
  },
  toastConfirmRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  toastConfirmText: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.gold[500],
    letterSpacing: 0.3,
  },

  // Count pill
  toastCountPill: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.gold[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  toastCountText: {
    fontSize: 11,
    fontWeight: '800',
    color: colors.text.inverse,
  },

  // Gold shimmer line
  shimmerTrack: {
    height: 1.5,
    overflow: 'hidden',
    backgroundColor: 'rgba(201, 169, 110, 0.08)',
  },
  shimmerLine: {
    width: 120,
    height: '100%',
    backgroundColor: colors.gold[500],
    opacity: 0.5,
    borderRadius: 1,
  },
});
