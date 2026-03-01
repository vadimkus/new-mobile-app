import React, { useState, useEffect, useCallback } from 'react';
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
  withSpring,
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
import GoldShimmerText from '../../components/ui/GoldShimmerText';
import { useLocalization } from '../../contexts/LocalizationContext';

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
  const cart = useCart();
  const { addItem } = cart;
  const { isFavorite, toggleFavorite } = useFavorites();
  const { t } = useLocalization();

  const insets = useSafeAreaInsets();
  const [apiProduct, setApiProduct] = useState<ApiProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [aboutOpen, setAboutOpen] = useState(false);
  const [appMethodOpen, setAppMethodOpen] = useState(false);

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
    origin: (apiProduct as any).origin || '',
  } : null;

  const productId = id || '';
  const favorited = isFavorite(productId);
  const { items, itemCount } = cart;
  const qtyInBag = items.filter(i => i.id === productId).reduce((s, i) => s + i.quantity, 0);
  const isInBag = qtyInBag > 0;

  const shimmer = useSharedValue(0);
  const badgeScale = useSharedValue(itemCount > 0 ? 1 : 0);
  const qtyScale = useSharedValue(1);

  useEffect(() => {
    badgeScale.value = itemCount > 0
      ? withSpring(1, { damping: 12, stiffness: 200 })
      : withTiming(0, { duration: 200 });
  }, [itemCount]);

  const shimmerStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: shimmer.value }],
  }));

  const qtyAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: qtyScale.value }],
  }));

  const badgeAnimStyle = useAnimatedStyle(() => ({
    transform: [{ scale: badgeScale.value }],
  }));

  const morphLayout = useCallback(() => {
    LayoutAnimation.configureNext(
      LayoutAnimation.create(250, 'easeInEaseOut', 'opacity'),
    );
  }, []);

  const cartPayload = useCallback(() => {
    if (!product) return null;
    return {
      id: productId,
      name: product.name,
      price: product.price,
      salePrice: product.originalPrice !== product.price ? product.price : undefined,
      currency: product.currency,
      imageUrl: product.imageUrl,
    };
  }, [product, productId]);

  const handleAddToCart = useCallback(() => {
    const payload = cartPayload();
    if (!payload) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    morphLayout();
    addItem(payload);
    shimmer.value = -250;
    shimmer.value = withTiming(250, { duration: 600, easing: Easing.out(Easing.cubic) });
    badgeScale.value = withSequence(
      withTiming(1.35, { duration: 120 }),
      withSpring(1, { damping: 10, stiffness: 250 }),
    );
  }, [cartPayload, addItem, morphLayout]);

  const handleIncrement = useCallback(() => {
    const payload = cartPayload();
    if (!payload) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    addItem(payload);
    qtyScale.value = withSequence(
      withTiming(1.3, { duration: 100 }),
      withSpring(1, { damping: 12, stiffness: 300 }),
    );
    badgeScale.value = withSequence(
      withTiming(1.35, { duration: 120 }),
      withSpring(1, { damping: 10, stiffness: 250 }),
    );
  }, [cartPayload, addItem]);

  const handleDecrement = useCallback(() => {
    if (qtyInBag <= 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (qtyInBag === 1) {
      morphLayout();
      cart.removeItem(productId);
    } else {
      cart.updateQuantity(productId, qtyInBag - 1);
      qtyScale.value = withSequence(
        withTiming(0.7, { duration: 100 }),
        withSpring(1, { damping: 12, stiffness: 300 }),
      );
    }
  }, [qtyInBag, productId, cart, morphLayout]);

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
            <Text style={{ ...typography.headline, color: colors.text.secondary, marginTop: spacing.lg }}>{t('productPage.productNotFound')}</Text>
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

          {/* Centered title — absolute so it ignores left/right widths */}
          <View style={styles.navTitleWrap} pointerEvents="none">
            <GoldShimmerText text="GENOSYS" style={styles.navTitle} shimmerInterval={7000} />
          </View>

          <View style={styles.navRight}>
            <TouchableOpacity style={styles.navBtn} onPress={handleToggleFavorite}>
              <Ionicons
                name={favorited ? 'heart' : 'heart-outline'}
                size={21}
                color={favorited ? '#FF3B30' : colors.text.secondary}
              />
            </TouchableOpacity>
            <TouchableOpacity style={styles.navBtn} onPress={handleShare}>
              <Ionicons name="share-outline" size={21} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
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
              imageUri={product.imageUrl}
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
            <Text style={styles.vatNote}>{t('productPage.vatIncluded')}</Text>
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
                <Text style={styles.descriptionTitle}>{t('productPage.about')}</Text>
                <Ionicons
                  name={aboutOpen ? 'chevron-up' : 'chevron-down'}
                  size={18}
                  color={colors.gold[500]}
                />
              </TouchableOpacity>
              {aboutOpen && (
                <>
                  {/* Luxury formatted description */}
                  {(() => {
                    const sentences = product.description
                      .split(/(?<=[.!])\s+/)
                      .map((s: string) => s.trim())
                      .filter((s: string) => s.length > 5);
                    if (sentences.length === 0) return null;
                    const lead = sentences[0];
                    const rest = sentences.slice(1).join(' ');
                    return (
                      <View style={styles.descBody}>
                        <View style={styles.descLeadRow}>
                          <View style={styles.descAccent} />
                          <Text style={styles.descLead}>{lead}</Text>
                        </View>
                        {rest ? <Text style={styles.descRest}>{rest}</Text> : null}
                      </View>
                    );
                  })()}

                  {/* Product specs */}
                  <View style={styles.specsGrid}>
                    {product.size ? (
                      <View style={styles.specItem}>
                        <Ionicons name="resize-outline" size={14} color={colors.gold[500]} />
                        <Text style={styles.specLabel}>{t('productPage.size')}</Text>
                        <Text style={styles.specValue}>{product.size}</Text>
                      </View>
                    ) : null}
                    {product.skinType ? (
                      <View style={styles.specItem}>
                        <Ionicons name="water-outline" size={14} color={colors.gold[500]} />
                        <Text style={styles.specLabel}>{t('productPage.skinType')}</Text>
                        <Text style={styles.specValue}>{product.skinType}</Text>
                      </View>
                    ) : null}
                    {product.usage ? (
                      <View style={styles.specItem}>
                        <Ionicons name="time-outline" size={14} color={colors.gold[500]} />
                        <Text style={styles.specLabel}>{t('productPage.usage')}</Text>
                        <Text style={styles.specValue}>{product.usage.replace(/-/g, ' ')}</Text>
                      </View>
                    ) : null}
                    <View style={styles.specItem}>
                      <Text style={styles.specFlag}>🇰🇷</Text>
                      <Text style={styles.specLabel}>{t('productPage.origin')}</Text>
                      <Text style={styles.specValue}>{product.origin || 'South Korea'}</Text>
                    </View>
                  </View>
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
                  <Text style={styles.appTitle}>{t('productPage.applicationMethod')}</Text>
                  <Ionicons
                    name={appMethodOpen ? 'chevron-up' : 'chevron-down'}
                    size={18}
                    color={colors.gold[500]}
                    style={{ marginLeft: 'auto' }}
                  />
                </TouchableOpacity>
                {appMethodOpen && (
                  <>
                    {product.howToUse ? (
                      <View style={styles.appTimeline}>
                        {parseApplicationSteps(product.howToUse).map((step, i, arr) => (
                          <View key={i} style={styles.appStep}>
                            {/* Timeline rail */}
                            <View style={styles.appRail}>
                              <View style={styles.appDot}>
                                <Text style={styles.appDotText}>{i + 1}</Text>
                              </View>
                              {i < arr.length - 1 && <View style={styles.appLine} />}
                            </View>
                            {/* Step content */}
                            <View style={styles.appStepBody}>
                              <Text style={styles.appStepLabel}>Step {i + 1}</Text>
                              <Text style={styles.appStepText}>{step}</Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    ) : null}
                    {product.directions && !product.howToUse ? (
                      <View style={styles.appDirWrap}>
                        <View style={styles.descAccent} />
                        <Text style={styles.appDirections}>{product.directions}</Text>
                      </View>
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
                      <Text style={styles.ingredientTitle}>{t('productPage.ingredientDna')}</Text>
                      <Text style={styles.ingredientSubtitle}>
                        {product.ingredients.length} {t('productPage.activeIngredients')}
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

            {/* Morphing: Add to Bag ↔ Stepper */}
            {isInBag ? (
              <View style={styles.stepperRow}>
                {/* Minus / Trash */}
                <TouchableOpacity
                  style={styles.stepperBtn}
                  activeOpacity={0.6}
                  onPress={handleDecrement}
                >
                  <Ionicons name="remove" size={17} color={colors.gold[500]} />
                </TouchableOpacity>

                {/* Quantity */}
                <Animated.View style={[styles.qtyWrap, qtyAnimStyle]}>
                  <Text style={styles.qtyNum}>{qtyInBag}</Text>
                </Animated.View>

                {/* Plus */}
                <TouchableOpacity
                  style={styles.stepperBtn}
                  activeOpacity={0.6}
                  onPress={handleIncrement}
                >
                  <Ionicons name="add" size={17} color={colors.gold[500]} />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.addBtnTouch}
                activeOpacity={0.7}
                onPress={handleAddToCart}
              >
                <Ionicons name="bag-add-outline" size={18} color={colors.gold[500]} />
                <Text style={styles.addBtnText}>{t('productPage.addToBag')}</Text>
              </TouchableOpacity>
            )}

            {/* Divider */}
            <View style={styles.bottomDivider} />

            {/* Bag icon with count — navigates to cart */}
            <TouchableOpacity
              style={styles.bottomCartBtn}
              activeOpacity={0.7}
              onPress={() => router.push('/(tabs)/bag')}
            >
              <Ionicons name="bag-handle-outline" size={20} color={colors.text.secondary} />
              {itemCount > 0 && (
                <Animated.View style={[styles.cartBadge, badgeAnimStyle]}>
                  <Text style={styles.cartBadgeText}>{itemCount > 99 ? '99+' : itemCount}</Text>
                </Animated.View>
              )}
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

  topNav: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: layout.screenPadding, paddingVertical: spacing.sm, position: 'relative' },
  navBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center', zIndex: 2 },
  navTitleWrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center', zIndex: 1 },
  navTitle: { letterSpacing: 4, fontSize: 24, fontWeight: '700' },
  navRight: { flexDirection: 'row', alignItems: 'center', zIndex: 2 },


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
  descBody: { marginTop: spacing.md },
  descLeadRow: { flexDirection: 'row', gap: 10 },
  descAccent: {
    width: 2.5,
    marginTop: 3,
    borderRadius: 1.5,
    backgroundColor: colors.gold[500],
    opacity: 0.5,
  },
  descLead: {
    ...typography.body,
    color: colors.text.primary,
    lineHeight: 24,
    flex: 1,
    fontWeight: '500',
    letterSpacing: 0.2,
  },
  descRest: {
    ...typography.body,
    color: colors.text.tertiary,
    lineHeight: 22,
    marginTop: spacing.md,
    fontSize: 14,
    letterSpacing: 0.15,
  },
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
  specFlag: { fontSize: 13 },
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
  appTimeline: { marginTop: spacing.lg },
  appStep: { flexDirection: 'row' },
  appRail: { alignItems: 'center', width: 28, marginRight: spacing.md },
  appDot: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(201, 169, 110, 0.10)',
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 110, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  appDotText: { fontSize: 11, fontWeight: '700', color: colors.gold[500] },
  appLine: {
    width: 1.5,
    flex: 1,
    backgroundColor: 'rgba(201, 169, 110, 0.12)',
    marginVertical: 4,
    borderRadius: 1,
  },
  appStepBody: { flex: 1, paddingBottom: spacing.xl },
  appStepLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.gold[500],
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    marginBottom: 4,
    opacity: 0.7,
  },
  appStepText: {
    ...typography.body,
    color: colors.text.secondary,
    lineHeight: 22,
    fontSize: 14,
    letterSpacing: 0.15,
  },
  appDirWrap: { flexDirection: 'row', gap: 10, marginTop: spacing.md },
  appDirections: { ...typography.body, color: colors.text.secondary, lineHeight: 22, flex: 1 },
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
  addBtnTouch: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  addBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.gold[500],
    letterSpacing: 0.5,
  },
  stepperRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  stepperBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 110, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnDanger: {
    borderColor: 'rgba(255, 69, 58, 0.25)',
  },
  qtyWrap: {
    width: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyNum: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.gold[500],
    fontVariant: ['tabular-nums'] as any,
    letterSpacing: 0.5,
  },
  bottomCartBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: 2,
    right: 0,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.gold[500],
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#000',
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
