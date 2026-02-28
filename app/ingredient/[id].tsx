import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInUp,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
  Easing,
} from 'react-native-reanimated';
import Svg, { Circle, Line } from 'react-native-svg';
import { colors, typography, spacing, radius, layout } from '../../constants/theme';
import { DEMO_PRODUCTS } from '../../constants/mockData';
import GlassCard from '../../components/ui/GlassCard';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const MAP_SIZE = SCREEN_WIDTH - layout.screenPadding * 2;
const CENTER = MAP_SIZE / 2;
const ORBIT_RADIUS = MAP_SIZE * 0.34;

function getNodePosition(index: number, total: number) {
  const angle = (2 * Math.PI * index) / total - Math.PI / 2;
  return {
    x: CENTER + ORBIT_RADIUS * Math.cos(angle),
    y: CENTER + ORBIT_RADIUS * Math.sin(angle),
  };
}

interface IngredientNodeProps {
  name: string;
  color: string;
  x: number;
  y: number;
  size: number;
  index: number;
  isSelected: boolean;
  onPress: () => void;
}

function IngredientNode({ name, color, x, y, size, index, isSelected, onPress }: IngredientNodeProps) {
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: withDelay(
          index * 200,
          withRepeat(
            withSequence(
              withTiming(1.15, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
              withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
            ),
            -1,
            true,
          ),
        ),
      },
    ],
  }));

  return (
    <Animated.View
      entering={FadeIn.duration(500).delay(300 + index * 100)}
      style={[
        styles.nodeContainer,
        {
          left: x - size / 2,
          top: y - size / 2,
          width: size,
          height: size,
        },
      ]}
    >
      <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
        <Animated.View style={pulseStyle}>
          {/* Outer glow */}
          <View
            style={[
              styles.nodeGlow,
              {
                width: size,
                height: size,
                borderRadius: size / 2,
                backgroundColor: color,
                opacity: isSelected ? 0.35 : 0.2,
              },
            ]}
          />
          {/* Inner solid */}
          <View
            style={[
              styles.nodeInner,
              {
                width: size * 0.6,
                height: size * 0.6,
                borderRadius: size * 0.3,
                backgroundColor: color,
                borderWidth: isSelected ? 2 : 0,
                borderColor: '#fff',
              },
            ]}
          />
        </Animated.View>
      </TouchableOpacity>
      <Text
        style={[
          styles.nodeLabel,
          isSelected && { color: colors.text.primary, fontWeight: '700' },
        ]}
        numberOfLines={2}
      >
        {name}
      </Text>
    </Animated.View>
  );
}

export default function IngredientExplorerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [selectedIndex, setSelectedIndex] = useState(0);

  const product = useMemo(
    () => DEMO_PRODUCTS.find((p) => p.id === id) ?? DEMO_PRODUCTS[1],
    [id],
  );

  const ingredients = product.ingredients;
  const selected = ingredients[selectedIndex];
  const nodePositions = ingredients.map((_, i) => getNodePosition(i, ingredients.length));

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Header */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Ingredient DNA</Text>
            <Text style={styles.headerSubtitle}>{product.name}</Text>
          </View>
          <Image
            source={{ uri: product.imageUrl }}
            style={styles.headerThumb}
            contentFit="contain"
          />
        </Animated.View>

        <Animated.View entering={FadeInDown.delay(100)} style={styles.countBadge}>
          <Text style={styles.countText}>
            {ingredients.length} Active Ingredients
          </Text>
        </Animated.View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Constellation Map */}
          <Animated.View entering={FadeIn.duration(800).delay(200)} style={styles.mapContainer}>
            {/* Connection lines (SVG) */}
            <Svg width={MAP_SIZE} height={MAP_SIZE} style={StyleSheet.absoluteFill}>
              {nodePositions.map((pos, i) => (
                <Line
                  key={`line-${i}`}
                  x1={CENTER}
                  y1={CENTER}
                  x2={pos.x}
                  y2={pos.y}
                  stroke={ingredients[i].color}
                  strokeWidth={selectedIndex === i ? 1.5 : 0.8}
                  strokeOpacity={selectedIndex === i ? 0.5 : 0.15}
                />
              ))}
              {/* Cross-links between adjacent nodes */}
              {nodePositions.map((pos, i) => {
                const next = nodePositions[(i + 1) % nodePositions.length];
                return (
                  <Line
                    key={`cross-${i}`}
                    x1={pos.x}
                    y1={pos.y}
                    x2={next.x}
                    y2={next.y}
                    stroke="rgba(255,255,255,0.06)"
                    strokeWidth={0.5}
                  />
                );
              })}
              {/* Center node glow */}
              <Circle
                cx={CENTER}
                cy={CENTER}
                r={22}
                fill={ingredients[selectedIndex]?.color ?? colors.gold[500]}
                opacity={0.15}
              />
              <Circle
                cx={CENTER}
                cy={CENTER}
                r={12}
                fill={ingredients[selectedIndex]?.color ?? colors.gold[500]}
                opacity={0.4}
              />
            </Svg>

            {/* Center label */}
            <View style={[styles.centerLabel, { left: CENTER - 30, top: CENTER - 8 }]}>
              <Text style={styles.centerText}>Formula</Text>
            </View>

            {/* Ingredient nodes */}
            {ingredients.map((ing, i) => (
              <IngredientNode
                key={ing.name}
                name={ing.name}
                color={ing.color}
                x={nodePositions[i].x}
                y={nodePositions[i].y}
                size={selectedIndex === i ? 48 : 38}
                index={i}
                isSelected={selectedIndex === i}
                onPress={() => setSelectedIndex(i)}
              />
            ))}
          </Animated.View>

          {/* Selected ingredient detail */}
          {selected && (
            <Animated.View entering={FadeInUp.duration(500).delay(600)}>
              <GlassCard intensity="medium" padding="xl">
                <Text style={styles.detailName}>{selected.name}</Text>

                <View style={styles.keyBadge}>
                  <Text style={styles.keyBadgeText}>Key Active</Text>
                </View>

                {/* Concentration bar */}
                <View style={styles.concRow}>
                  <View style={styles.concBarBg}>
                    <View
                      style={[
                        styles.concBarFill,
                        {
                          width: `${Math.min(selected.concentration * 4, 100)}%`,
                          backgroundColor: selected.color,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.concValue}>{selected.concentration}%</Text>
                </View>

                {/* Origin */}
                <View style={styles.originRow}>
                  <Ionicons name="globe-outline" size={14} color={colors.text.secondary} />
                  <Text style={styles.originText}>{selected.origin}</Text>
                </View>

                {/* Description */}
                <Text style={styles.detailDescription}>{selected.description}</Text>

                {/* Efficacy */}
                <View style={styles.efficacyRow}>
                  <Text style={styles.efficacyLabel}>Efficacy Rating</Text>
                  <View style={styles.diamonds}>
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Ionicons
                        key={i}
                        name={i < selected.efficacy ? 'diamond' : 'diamond-outline'}
                        size={16}
                        color={i < selected.efficacy ? colors.gold[500] : colors.text.muted}
                        style={{ marginRight: 3 }}
                      />
                    ))}
                  </View>
                </View>

                {/* Cross-sell link */}
                <TouchableOpacity style={styles.crossSell}>
                  <Text style={styles.crossSellText}>
                    Found in 12 GENOSYS products →
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.clinicalLink}>
                  <Text style={styles.clinicalLinkText}>See Clinical Studies</Text>
                </TouchableOpacity>
              </GlassCard>
            </Animated.View>
          )}

          <View style={{ height: 60 }} />
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  safeArea: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: layout.screenPadding,
  },

  // Header
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.sm,
  },
  navBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  headerTitle: {
    ...typography.headline,
    fontSize: 18,
  },
  headerSubtitle: {
    ...typography.caption1,
    color: colors.text.secondary,
    marginTop: 1,
  },
  headerThumb: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
  },
  countBadge: {
    paddingHorizontal: layout.screenPadding,
    marginBottom: spacing.md,
  },
  countText: {
    ...typography.caption1,
    color: colors.gold[500],
    marginLeft: 52,
  },

  // Constellation map
  mapContainer: {
    width: MAP_SIZE,
    height: MAP_SIZE,
    position: 'relative',
    marginBottom: spacing.xxl,
    alignSelf: 'center',
  },
  nodeContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 5,
  },
  nodeGlow: {
    position: 'absolute',
  },
  nodeInner: {
    position: 'absolute',
    alignSelf: 'center',
    top: '20%',
    left: '20%',
  },
  nodeLabel: {
    ...typography.caption2,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: 48,
    width: 80,
    fontSize: 11,
  },
  centerLabel: {
    position: 'absolute',
    zIndex: 3,
  },
  centerText: {
    ...typography.caption2,
    color: colors.text.tertiary,
    textAlign: 'center',
    fontSize: 10,
  },

  // Detail card
  detailName: {
    ...typography.title2,
    marginBottom: spacing.sm,
  },
  keyBadge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.gold[500],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    marginBottom: spacing.lg,
  },
  keyBadgeText: {
    ...typography.caption2,
    color: colors.text.inverse,
    fontWeight: '700',
    fontSize: 11,
  },
  concRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    gap: spacing.md,
  },
  concBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: colors.bg.elevated,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  concBarFill: {
    height: '100%',
    borderRadius: radius.pill,
  },
  concValue: {
    ...typography.label,
    color: colors.gold[500],
    width: 36,
    textAlign: 'right',
  },
  originRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  originText: {
    ...typography.caption1,
    color: colors.text.secondary,
  },
  detailDescription: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 24,
    marginBottom: spacing.lg,
  },
  efficacyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  efficacyLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  diamonds: {
    flexDirection: 'row',
  },
  crossSell: {
    marginBottom: spacing.md,
  },
  crossSellText: {
    ...typography.headline,
    color: colors.gold[500],
    fontSize: 15,
  },
  clinicalLink: {
    alignItems: 'center',
    paddingVertical: spacing.sm,
  },
  clinicalLinkText: {
    ...typography.bodySmall,
    color: colors.gold[500],
    textDecorationLine: 'underline',
  },
});
