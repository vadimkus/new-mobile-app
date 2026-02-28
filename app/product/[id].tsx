import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Share,
  ActivityIndicator,
  Platform,
  LayoutAnimation,
  UIManager,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import Animated, {
  FadeIn,
  FadeInDown,
  SlideInUp,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors, typography, spacing, radius, layout } from '../../constants/theme';
import { fetchProductById, type Product as ApiProduct } from '../../services/api';
import { addToRecentlyViewed } from '../../services/recentlyViewed';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import InteractivePodium from '../../components/product/InteractivePodium';
import GlassCard from '../../components/ui/GlassCard';
import ProductReviews from '../../components/product/ProductReviews';

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const LOCAL_IMAGE_OVERRIDES: Record<string, any> = {
  'eye contour': require('../../assets/images/serum_cut.png'),
};

function parseApplicationSteps(text: string): string[] {
  if (!text) return [];
  const numbered = text.match(/(?:^|\n)\s*\d+[.)]\s*.+/g);
  if (numbered && numbered.length > 1) {
    return numbered.map(s => s.replace(/^\s*\d+[.)]\s*/, '').trim()).filter(Boolean);
  }
  const bullets = text.split(/[•\-\n]+/).map(s => s.trim()).filter(s => s.length > 5);
  if (bullets.length > 1) return bullets;
  const sentences = text.split(/(?<=[.!])\s+/).map(s => s.trim()).filter(s => s.length > 10);
  if (sentences.length > 1) return sentences;
  return [text.trim()];
}

function parseSafeArray(val: unknown): any[] {
  if (Array.isArray(val)) return val;
  if (typeof val === 'string' && val.trim().startsWith('[')) {
    try { const parsed = JSON.parse(val); if (Array.isArray(parsed)) return parsed; } catch {}
  }
  return [];
}


export default function ProductPodiumScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user, token } = useAuth();
  const { addItem } = useCart();
  const { isFavorite, toggleFavorite } = useFavorites();

  const insets = useSafeAreaInsets();
  const [apiProduct, setApiProduct] = useState<ApiProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [appMethodOpen, setAppMethodOpen] = useState(false);
  const shimmer = useSharedValue(0);

  useEffect(() => {
    let cancelled = false;
    if (id) addToRecentlyViewed(id);
    (async () => {
      try {
        const userCtx = user ? { id: user.id, token: token ?? undefined } : undefined;
        const p = await fetchProductById(id!, userCtx);
        if (!cancelled && p) setApiProduct(p);
      } catch {}
      if (!cancelled) setLoading(false);
    })();
    return () => { cancelled = true; };
  }, [id, user, token]);

  const product = apiProduct ? {
    id: String(apiProduct.id),
    name: apiProduct.name || '',
    description: apiProduct.description || '',
    price: apiProduct.salePrice ?? apiProduct.price ?? 0,
    originalPrice: apiProduct.price,
    currency: apiProduct.currency || 'AED',
    category: apiProduct.category || '',
    imageUrl: apiProduct.imageUrl || apiProduct.images?.[0] || '',
    rating: apiProduct.rating ?? 0,
    badge: apiProduct.badge || '',
    discount: apiProduct.discount,
    variants: apiProduct.variants || [],
    benefits: parseSafeArray((apiProduct as any).benefits),
    ingredients: parseSafeArray((apiProduct as any).ingredients),
    howToUse: (apiProduct as any).howToUse || '',
    directions: (apiProduct as any).directions || '',
    size: (apiProduct as any).size || '',
    skinType: (apiProduct as any).skinType || '',
    usage: (apiProduct as any).usage || '',
  } : null;

  const productId = id || '';
  const favorited = isFavorite(productId);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmer.value }],
  }));

  const handleAddToCart = () => {
    if (!product) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addItem({
      id: productId,
      name: product.name,
      price: product.price,
      salePrice: product.originalPrice !== product.price ? product.price : undefined,
      currency: product.currency,
      imageUrl: product.imageUrl,
    });
    shimmer.value = -250;
    shimmer.value = withTiming(250, { duration: 600, easing: Easing.out(Easing.cubic) });
  };

  const handleToggleFavorite = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toggleFavorite(productId);
  };

  const handleShare = async () => {
    if (!product) return;
    try {
      await Share.share({
        message: `Check out ${product.name} by GENOSYS - ${product.price} ${product.currency}\nhttps://genosys.ae`,
      });
    } catch {}
  };

  if (loading) {
    return (
      <View style={styles.screen}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <Animated.View entering={FadeIn.duration(400)} style={styles.topNav}>
            <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
              <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.navTitle}>GENOSYS</Text>
            <View style={styles.navBtn} />
          </Animated.View>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <ActivityIndicator size="large" color={colors.gold[500]} />
          </View>
        </SafeAreaView>
      </View>
    );
  }

  if (!product) {
    return (
      <View style={styles.screen}>
        <SafeAreaView style={styles.safeArea} edges={['top']}>
          <Animated.View entering={FadeIn.duration(400)} style={styles.topNav}>
            <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
              <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
            </TouchableOpacity>
            <Text style={styles.navTitle}>GENOSYS</Text>
            <View style={styles.navBtn} />
          </Animated.View>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <Ionicons name="alert-circle-outline" size={48} color={colors.text.muted} />
            <Text style={{ ...typography.headline, color: colors.text.secondary, marginTop: spacing.lg }}>Product not found</Text>
          </View>
        </SafeAreaView>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <Animated.View entering={FadeIn.duration(400)} style={styles.topNav}>
          <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.navTitle}>GENOSYS</Text>
          <TouchableOpacity style={styles.navBtn} onPress={handleShare}>
            <Ionicons name="share-outline" size={22} color={colors.text.primary} />
          </TouchableOpacity>
        </Animated.View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Interactive Podium — gyroscope parallax + draggable benefits */}
          <Animated.View entering={FadeInDown.duration(800).delay(200)}>
            <InteractivePodium
              imageSource={
                (() => {
                  const overrideKey = Object.keys(LOCAL_IMAGE_OVERRIDES).find(
                    (k) => product.name.toLowerCase().includes(k),
                  );
                  return overrideKey
                    ? LOCAL_IMAGE_OVERRIDES[overrideKey]
                    : { uri: product.imageUrl };
                })()
              }
              benefits={product.benefits}
            />
          </Animated.View>

          {/* Product Info */}
          <Animated.View entering={SlideInUp.duration(600).delay(400)} style={styles.infoSection}>
            {(product.badge || (product as any).discount) && (
              <View style={styles.badgeRow}>
                {product.badge && (
                  <View style={styles.badge}>
                    <Text style={styles.badgeText}>{product.badge}</Text>
                  </View>
                )}
                {(product as any).discount > 0 && (
                  <View style={[styles.badge, styles.discountBadge]}>
                    <Text style={styles.badgeText}>-{(product as any).discount}%</Text>
                  </View>
                )}
              </View>
            )}
            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productCategory}>
              {product.category} · {product.rating ? `★ ${product.rating}` : ''}
            </Text>
            <View style={styles.priceRow}>
              <Text style={styles.productPrice}>
                {Number(product.price).toFixed(2)} {product.currency}
              </Text>
              {(product as any).originalPrice && (product as any).originalPrice > product.price && (
                <Text style={styles.originalPrice}>
                  {Number((product as any).originalPrice).toFixed(2)} {product.currency}
                </Text>
              )}
            </View>
            <Text style={styles.vatNote}>VAT included</Text>
          </Animated.View>

          {/* Description card — expandable */}
          <Animated.View entering={FadeInDown.duration(600).delay(600)} style={styles.descriptionSection}>
            <GlassCard>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  LayoutAnimation.configureNext(LayoutAnimation.create(280, 'easeInEaseOut', 'opacity'));
                  setAboutOpen((v) => !v);
                }}
                style={styles.expandHeader}
              >
                <View style={styles.appIconWrap}>
                  <Ionicons name="information-circle-outline" size={18} color={colors.gold[500]} />
                </View>
                <Text style={styles.descriptionTitle}>About</Text>
                <Ionicons
                  name={aboutOpen ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={colors.text.tertiary}
                />
              </TouchableOpacity>
              {aboutOpen && (
                <>
                  <Text style={styles.descriptionText}>{product.description}</Text>

                  {/* Product specs */}
                  {(product.size || product.skinType || product.usage) && (
                    <View style={styles.specsGrid}>
                      {product.size ? (
                        <View style={styles.specItem}>
                          <Ionicons name="resize-outline" size={14} color={colors.gold[500]} />
                          <Text style={styles.specLabel}>Size</Text>
                          <Text style={styles.specValue}>{product.size}</Text>
                        </View>
                      ) : null}
                      {product.skinType ? (
                        <View style={styles.specItem}>
                          <Ionicons name="water-outline" size={14} color={colors.gold[500]} />
                          <Text style={styles.specLabel}>Skin Type</Text>
                          <Text style={styles.specValue}>{product.skinType}</Text>
                        </View>
                      ) : null}
                      {product.usage ? (
                        <View style={styles.specItem}>
                          <Ionicons name="time-outline" size={14} color={colors.gold[500]} />
                          <Text style={styles.specLabel}>Usage</Text>
                          <Text style={styles.specValue}>{product.usage.replace(/-/g, ' ')}</Text>
                        </View>
                      ) : null}
                    </View>
                  )}
                </>
              )}
            </GlassCard>
          </Animated.View>

          {/* Application Method — expandable */}
          {(product.howToUse || product.directions) ? (
            <Animated.View entering={FadeInDown.duration(600).delay(650)} style={styles.applicationSection}>
              <GlassCard>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.create(280, 'easeInEaseOut', 'opacity'));
                    setAppMethodOpen((v) => !v);
                  }}
                  style={styles.appHeader}
                >
                  <View style={styles.appIconWrap}>
                    <Ionicons name="hand-left-outline" size={18} color={colors.gold[500]} />
                  </View>
                  <Text style={styles.appTitle}>Application Method</Text>
                  <Ionicons
                    name={appMethodOpen ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={colors.text.tertiary}
                    style={{ marginLeft: 'auto' }}
                  />
                </TouchableOpacity>
                {appMethodOpen && (
                  <>
                    {product.howToUse ? (
                      <View style={styles.appSteps}>
                        {parseApplicationSteps(product.howToUse).map((step, i) => (
                          <View key={i} style={styles.appStep}>
                            <View style={styles.appStepNum}>
                              <Text style={styles.appStepNumText}>{i + 1}</Text>
                            </View>
                            <Text style={styles.appStepText}>{step}</Text>
                          </View>
                        ))}
                      </View>
                    ) : null}
                    {product.directions && !product.howToUse ? (
                      <Text style={styles.appDirections}>{product.directions}</Text>
                    ) : null}
                    {product.directions && product.howToUse ? (
                      <View style={styles.appNote}>
                        <Ionicons name="information-circle-outline" size={14} color={colors.gold[500]} style={{ marginRight: 6 }} />
                        <Text style={styles.appNoteText}>{product.directions}</Text>
                      </View>
                    ) : null}
                  </>
                )}
              </GlassCard>
            </Animated.View>
          ) : null}

          {/* Ingredients preview */}
          {product.ingredients && product.ingredients.length > 0 && (
            <Animated.View entering={FadeInDown.duration(600).delay(700)} style={styles.ingredientPreview}>
              <TouchableOpacity
                onPress={() => router.push(`/ingredient/${productId}`)}
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
                    {product.ingredients.slice(0, 5).map((raw, i) => {
                      const ing = typeof raw === 'string' ? { name: raw } : raw;
                      const COLORS = ['#C9A96E', '#7B68EE', '#20B2AA', '#FF6B6B', '#4ECDC4'];
                      return (
                        <View
                          key={ing.name || `ing-${i}`}
                          style={[
                            styles.ingredientDot,
                            {
                              backgroundColor: ing.color || COLORS[i % COLORS.length],
                              width: 28 - i * 3,
                              height: 28 - i * 3,
                            },
                          ]}
                        />
                      );
                    })}
                    <Text style={styles.ingredientExplore}>Explore →</Text>
                  </View>
                </GlassCard>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Reviews */}
          <ProductReviews productId={productId} />

          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>

      {/* Floating glass action bar */}
      <Animated.View
        entering={SlideInUp.duration(500).delay(800)}
        style={[styles.bottomBar, { paddingBottom: Math.max(insets.bottom, 8) }]}
      >
        <BlurView
          intensity={Platform.OS === 'ios' ? 80 : 100}
          tint="dark"
          style={styles.bottomBlur}
        >
          <View style={styles.bottomInner}>
            {/* Price */}
            <View style={styles.bottomPriceWrap}>
              <Text style={styles.bottomPrice}>
                {Number(product.price).toFixed(2)}
              </Text>
              <Text style={styles.bottomCurrency}>{product.currency}</Text>
            </View>

            {/* Divider */}
            <View style={styles.bottomDivider} />

            {/* Add to Bag */}
            <TouchableOpacity
              style={styles.bottomBagBtn}
              activeOpacity={0.7}
              onPress={handleAddToCart}
            >
              <Ionicons name="bag-add-outline" size={18} color={colors.gold[500]} />
              <Text style={styles.bottomBagText}>Add to Bag</Text>
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.bottomDivider} />

            {/* Favorite */}
            <TouchableOpacity
              style={styles.bottomFavBtn}
              activeOpacity={0.7}
              onPress={handleToggleFavorite}
            >
              <Ionicons
                name={favorited ? 'heart' : 'heart-outline'}
                size={20}
                color={favorited ? '#FF3B30' : colors.text.secondary}
              />
            </TouchableOpacity>
          </View>

          {/* Gold shimmer line */}
          <View style={styles.shimmerTrack}>
            <Animated.View style={[styles.shimmerLine, shimmerStyle]} />
          </View>
        </BlurView>
      </Animated.View>

    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg.primary },
  safeArea: { flex: 1 },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: layout.screenPadding },

  topNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: layout.screenPadding, paddingVertical: spacing.sm },
  navBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  navTitle: { ...typography.headline, letterSpacing: 3, fontSize: 15 },


  infoSection: { alignItems: 'center', marginTop: spacing.lg, marginBottom: spacing.xxl },
  badgeRow: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.sm },
  badge: { backgroundColor: colors.gold[500], paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill },
  discountBadge: { backgroundColor: colors.status.error },
  badgeText: { ...typography.caption2, color: colors.text.inverse, fontWeight: '700', fontSize: 11 },
  productName: { ...typography.title1, textAlign: 'center', letterSpacing: 1 },
  productCategory: { ...typography.bodySmall, color: colors.gold[500], marginTop: spacing.xs },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, marginTop: spacing.md },
  productPrice: { ...typography.price, fontSize: 26 },
  originalPrice: { ...typography.bodySmall, color: colors.text.muted, textDecorationLine: 'line-through', fontSize: 16 },
  vatNote: { ...typography.caption1, color: colors.text.tertiary, marginTop: 2 },

  descriptionSection: { marginBottom: spacing.lg },
  expandHeader: { flexDirection: 'row', alignItems: 'center' },
  descriptionTitle: { ...typography.headline, flex: 1 },
  descriptionText: { ...typography.body, color: colors.text.secondary, lineHeight: 24, marginTop: spacing.sm },
  specsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginTop: spacing.lg,
    paddingTop: spacing.lg,
    borderTopWidth: 0.5,
    borderTopColor: colors.glass.border,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(201, 169, 110, 0.06)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    gap: 6,
  },
  specLabel: {
    ...typography.caption2,
    color: colors.text.tertiary,
    letterSpacing: 0.3,
  },
  specValue: {
    ...typography.caption2,
    color: colors.text.primary,
    fontWeight: '600',
    textTransform: 'capitalize',
  },

  applicationSection: { marginBottom: spacing.lg },
  appHeader: { flexDirection: 'row', alignItems: 'center' },
  appIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(201, 169, 110, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
  },
  appTitle: { ...typography.headline, letterSpacing: 0.5 },
  appSteps: { gap: spacing.md, marginTop: spacing.md },
  appStep: { flexDirection: 'row', alignItems: 'flex-start' },
  appStepNum: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 1,
    borderColor: colors.gold[500],
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.sm,
    marginTop: 1,
  },
  appStepNumText: { fontSize: 11, fontWeight: '700', color: colors.gold[500] },
  appStepText: { ...typography.body, color: colors.text.secondary, lineHeight: 22, flex: 1 },
  appDirections: { ...typography.body, color: colors.text.secondary, lineHeight: 22, marginTop: spacing.md },
  appNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 0.5,
    borderTopColor: colors.glass.border,
  },
  appNoteText: { ...typography.caption1, color: colors.text.tertiary, flex: 1, lineHeight: 18 },

  ingredientPreview: { marginBottom: spacing.xl },
  ingredientHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  ingredientTitle: { ...typography.headline },
  ingredientSubtitle: { ...typography.caption1, color: colors.gold[500], marginTop: 2 },
  ingredientDots: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  ingredientDot: { borderRadius: radius.circle, opacity: 0.8 },
  ingredientExplore: { ...typography.label, color: colors.gold[500], marginLeft: 'auto' },

  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
  },
  bottomBlur: {
    width: '100%',
    borderRadius: radius.xxl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  bottomInner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
  },
  bottomPriceWrap: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 4,
  },
  bottomPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text.primary,
    letterSpacing: 0.3,
  },
  bottomCurrency: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.text.tertiary,
    letterSpacing: 0.5,
  },
  bottomDivider: {
    width: 1,
    height: 22,
    backgroundColor: colors.glass.border,
    marginHorizontal: spacing.lg,
  },
  bottomBagBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  bottomBagText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gold[500],
    letterSpacing: 0.5,
  },
  bottomFavBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shimmerTrack: {
    height: 1.5,
    overflow: 'hidden',
    backgroundColor: 'rgba(201, 169, 110, 0.06)',
  },
  shimmerLine: {
    width: 100,
    height: '100%',
    backgroundColor: colors.gold[500],
    opacity: 0.4,
    borderRadius: 1,
  },
});
