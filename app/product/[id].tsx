import React, { useMemo } from 'react';
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
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeInLeft,
  FadeInRight,
  SlideInUp,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, radius, layout, shadows } from '../../constants/theme';
import { DEMO_PRODUCTS } from '../../constants/mockData';
import ProductPodium from '../../components/product/ProductPodium';
import BenefitPill from '../../components/ui/BenefitPill';
import GoldButton from '../../components/ui/GoldButton';
import GlassCard from '../../components/ui/GlassCard';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const BENEFIT_POSITIONS = [
  { top: '5%', left: '5%' },
  { top: '8%', right: '3%' },
  { top: '30%', left: '0%' },
  { top: '28%', right: '-2%' },
  { top: '52%', left: '15%' },
] as const;

export default function ProductPodiumScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const product = useMemo(
    () => DEMO_PRODUCTS.find((p) => p.id === id) ?? DEMO_PRODUCTS[0],
    [id],
  );

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        {/* Top navigation */}
        <Animated.View entering={FadeIn.duration(400)} style={styles.topNav}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.navBtn}
          >
            <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
          </TouchableOpacity>

          <Text style={styles.navTitle}>GENOSYS</Text>

          <TouchableOpacity style={styles.navBtn}>
            <Ionicons name="share-outline" size={22} color={colors.text.primary} />
          </TouchableOpacity>
        </Animated.View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Podium with product */}
          <View style={styles.podiumSection}>
            {/* Floating benefit pills around the podium */}
            {product.benefits.map((benefit, index) => {
              const pos = BENEFIT_POSITIONS[index % BENEFIT_POSITIONS.length];
              return (
                <Animated.View
                  key={benefit.label}
                  entering={FadeIn.duration(600).delay(600 + index * 150)}
                  style={[
                    styles.benefitPosition,
                    {
                      top: pos.top,
                      ...(('left' in pos) ? { left: pos.left } : { right: pos.right }),
                    },
                  ]}
                >
                  <BenefitPill
                    label={benefit.label}
                    emoji={benefit.emoji}
                    delay={index * 400}
                    glowColor={benefit.glowColor}
                  />
                </Animated.View>
              );
            })}

            <Animated.View entering={FadeInDown.duration(800).delay(200)}>
              <ProductPodium>
                <Image
                  source={{ uri: product.imageUrl }}
                  style={styles.productImage}
                  contentFit="contain"
                  transition={400}
                />
              </ProductPodium>
            </Animated.View>
          </View>

          {/* Product Info */}
          <Animated.View
            entering={SlideInUp.duration(600).delay(400)}
            style={styles.infoSection}
          >
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productCategory}>
              {product.category} · 30ml
            </Text>
            <Text style={styles.productPrice}>
              {product.price} {product.currency}
            </Text>
            <Text style={styles.vatNote}>VAT included</Text>
          </Animated.View>

          {/* Description card */}
          <Animated.View
            entering={FadeInDown.duration(600).delay(600)}
            style={styles.descriptionSection}
          >
            <GlassCard>
              <Text style={styles.descriptionTitle}>About</Text>
              <Text style={styles.descriptionText}>{product.description}</Text>
            </GlassCard>
          </Animated.View>

          {/* Ingredients preview */}
          <Animated.View
            entering={FadeInDown.duration(600).delay(700)}
            style={styles.ingredientPreview}
          >
            <TouchableOpacity
              onPress={() => router.push(`/ingredient/${product.id}`)}
              activeOpacity={0.8}
            >
              <GlassCard>
                <View style={styles.ingredientHeader}>
                  <View>
                    <Text style={styles.ingredientTitle}>Ingredient DNA</Text>
                    <Text style={styles.ingredientSubtitle}>
                      {product.ingredients.length} Active Ingredients
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={colors.gold[500]} />
                </View>

                <View style={styles.ingredientDots}>
                  {product.ingredients.slice(0, 5).map((ing, i) => (
                    <View
                      key={ing.name}
                      style={[
                        styles.ingredientDot,
                        {
                          backgroundColor: ing.color,
                          width: 28 - i * 3,
                          height: 28 - i * 3,
                        },
                      ]}
                    />
                  ))}
                  <Text style={styles.ingredientExplore}>
                    Explore →
                  </Text>
                </View>
              </GlassCard>
            </TouchableOpacity>
          </Animated.View>

          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>

      {/* Fixed bottom action bar */}
      <Animated.View entering={SlideInUp.duration(500).delay(800)} style={styles.bottomBar}>
        <View style={styles.bottomBarInner}>
          <TouchableOpacity
            style={styles.bottomAction}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <Ionicons name="heart-outline" size={24} color={colors.text.primary} />
          </TouchableOpacity>

          <GoldButton
            title="Add to Ritual"
            onPress={() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)}
            size="lg"
            style={{ flex: 1, marginHorizontal: spacing.md }}
          />

          <TouchableOpacity
            style={styles.bottomAction}
            onPress={() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)}
          >
            <Ionicons name="bag-add-outline" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
      </Animated.View>
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

  // Navigation
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.sm,
  },
  navBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navTitle: {
    ...typography.headline,
    letterSpacing: 3,
    fontSize: 15,
  },

  // Podium section
  podiumSection: {
    position: 'relative',
    minHeight: SCREEN_HEIGHT * 0.45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  benefitPosition: {
    position: 'absolute',
    zIndex: 10,
  },
  productImage: {
    width: SCREEN_WIDTH * 0.45,
    height: SCREEN_WIDTH * 0.55,
  },

  // Info
  infoSection: {
    alignItems: 'center',
    marginTop: spacing.lg,
    marginBottom: spacing.xxl,
  },
  productName: {
    ...typography.title1,
    textAlign: 'center',
    letterSpacing: 1,
  },
  productCategory: {
    ...typography.bodySmall,
    color: colors.gold[500],
    marginTop: spacing.xs,
  },
  productPrice: {
    ...typography.price,
    fontSize: 26,
    marginTop: spacing.md,
  },
  vatNote: {
    ...typography.caption1,
    color: colors.text.tertiary,
    marginTop: 2,
  },

  // Description
  descriptionSection: {
    marginBottom: spacing.lg,
  },
  descriptionTitle: {
    ...typography.headline,
    marginBottom: spacing.sm,
  },
  descriptionText: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 24,
  },

  // Ingredients preview
  ingredientPreview: {
    marginBottom: spacing.xl,
  },
  ingredientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  ingredientTitle: {
    ...typography.headline,
  },
  ingredientSubtitle: {
    ...typography.caption1,
    color: colors.gold[500],
    marginTop: 2,
  },
  ingredientDots: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  ingredientDot: {
    borderRadius: radius.circle,
    opacity: 0.8,
  },
  ingredientExplore: {
    ...typography.label,
    color: colors.gold[500],
    marginLeft: 'auto',
  },

  // Bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.bg.secondary,
    borderTopWidth: 1,
    borderTopColor: colors.glass.border,
    paddingBottom: 34,
    paddingTop: spacing.md,
    paddingHorizontal: layout.screenPadding,
  },
  bottomBarInner: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  bottomAction: {
    width: 48,
    height: 48,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.glass.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
