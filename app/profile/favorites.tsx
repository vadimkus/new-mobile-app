import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, radius, layout } from '../../constants/theme';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { fetchProducts, type Product } from '../../services/api';

const { width: SCREEN_W } = Dimensions.get('window');
const CARD_H = 140;

export default function FavoritesScreen() {
  const { favoriteIds, toggleFavorite } = useFavorites();
  const { user, token } = useAuth();
  const { addItem, items: cartItems } = useCart();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const userCtx = user ? { id: user.id, token: token ?? undefined } : undefined;
        const data = await fetchProducts(userCtx);
        setAllProducts(data);
      } catch {}
      setLoading(false);
    })();
  }, [user, token]);

  const favorites = allProducts.filter((p) => favoriteIds.includes(String(p.id)));

  const handleAddToCart = useCallback((product: Product) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addItem({
      id: String(product.id),
      name: product.name,
      price: product.salePrice ?? product.price,
      currency: product.currency || 'AED',
      imageUrl: product.imageUrl || product.images?.[0],
    });
  }, [addItem]);

  const isInCart = useCallback((productId: string) => {
    return cartItems.some(i => i.id === productId);
  }, [cartItems]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Header */}
      <Animated.View entering={FadeIn.duration(400)} style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>Wishlist</Text>
          {favorites.length > 0 && (
            <View style={styles.countPill}>
              <Text style={styles.countText}>{favorites.length}</Text>
            </View>
          )}
        </View>
        <View style={styles.navBtn} />
      </Animated.View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {loading && (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={colors.gold[500]} />
          </View>
        )}

        {/* Empty State */}
        {!loading && favorites.length === 0 && (
          <Animated.View entering={FadeInDown.duration(600)} style={styles.emptyWrap}>
            <View style={styles.emptyIconRing}>
              <Ionicons name="heart-outline" size={40} color={colors.gold[500]} />
            </View>
            <Text style={styles.emptyTitle}>Your wishlist is empty</Text>
            <Text style={styles.emptySubtext}>
              Save the products you love by tapping the heart icon
            </Text>
            <TouchableOpacity
              style={styles.emptyBtn}
              onPress={() => router.push('/(tabs)/discover')}
              activeOpacity={0.7}
            >
              <Text style={styles.emptyBtnText}>Explore Products</Text>
              <Ionicons name="arrow-forward" size={16} color={colors.gold[500]} />
            </TouchableOpacity>
          </Animated.View>
        )}

        {/* Favorites list */}
        {favorites.map((product, i) => {
          const pid = String(product.id);
          const inCart = isInCart(pid);
          const imgUri = product.imageUrl || product.images?.[0];
          const price = product.salePrice ?? product.price;
          const hasDiscount = product.salePrice && product.salePrice < product.price;

          return (
            <Animated.View
              key={pid}
              entering={FadeInDown.duration(400).delay(i * 60)}
              exiting={FadeOut.duration(250)}
            >
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => router.push(`/product/${pid}`)}
                style={styles.card}
              >
                {/* Product image with dark background */}
                <View style={styles.imageWrap}>
                  {imgUri ? (
                    <Image
                      source={{ uri: imgUri }}
                      style={styles.image}
                      contentFit="contain"
                      transition={300}
                    />
                  ) : (
                    <Ionicons name="cube-outline" size={28} color={colors.text.muted} />
                  )}
                </View>

                {/* Info */}
                <View style={styles.info}>
                  <Text style={styles.productCategory}>{product.category}</Text>
                  <Text style={styles.productName} numberOfLines={2}>{product.name}</Text>

                  <View style={styles.priceRow}>
                    <Text style={styles.price}>
                      {Number(price).toFixed(2)} {product.currency || 'AED'}
                    </Text>
                    {hasDiscount && (
                      <Text style={styles.originalPrice}>
                        {Number(product.price).toFixed(2)}
                      </Text>
                    )}
                  </View>

                  {/* Action row */}
                  <View style={styles.actionRow}>
                    <TouchableOpacity
                      style={[styles.addBtn, inCart && styles.addBtnActive]}
                      onPress={() => handleAddToCart(product)}
                      activeOpacity={0.7}
                    >
                      <Ionicons
                        name={inCart ? 'checkmark' : 'bag-add-outline'}
                        size={14}
                        color={inCart ? colors.gold[500] : colors.text.secondary}
                      />
                      <Text style={[styles.addBtnText, inCart && styles.addBtnTextActive]}>
                        {inCart ? 'In Bag' : 'Add'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Remove heart */}
                <TouchableOpacity
                  style={styles.heartBtn}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                    toggleFavorite(pid);
                  }}
                  hitSlop={10}
                >
                  <Ionicons name="heart" size={20} color="#FF3B30" />
                </TouchableOpacity>

                {/* Subtle gold top-border accent */}
                <LinearGradient
                  colors={['rgba(201, 169, 110, 0.25)', 'transparent']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.cardAccent}
                />
              </TouchableOpacity>
            </Animated.View>
          );
        })}

        {/* Add all to bag */}
        {favorites.length > 1 && (
          <Animated.View entering={FadeInDown.duration(400).delay(favorites.length * 60 + 100)}>
            <TouchableOpacity
              style={styles.addAllBtn}
              activeOpacity={0.7}
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                favorites.forEach(p => handleAddToCart(p));
              }}
            >
              <Ionicons name="bag-check-outline" size={18} color={colors.gold[500]} />
              <Text style={styles.addAllText}>Add All to Bag</Text>
            </TouchableOpacity>
          </Animated.View>
        )}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg.primary },

  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.sm,
  },
  navBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { ...typography.title3, letterSpacing: 1.5, fontSize: 17 },
  countPill: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(201, 169, 110, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  countText: { fontSize: 11, fontWeight: '700', color: colors.gold[500] },

  scroll: { flex: 1 },
  content: { paddingHorizontal: layout.screenPadding },

  center: { alignItems: 'center', paddingVertical: 80 },

  // Empty state
  emptyWrap: { alignItems: 'center', paddingVertical: 80, gap: spacing.lg },
  emptyIconRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 1.5,
    borderColor: 'rgba(201, 169, 110, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  emptyTitle: { ...typography.headline, color: colors.text.primary, letterSpacing: 0.5 },
  emptySubtext: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
    textAlign: 'center',
    maxWidth: 260,
    lineHeight: 20,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.gold[500],
    marginTop: spacing.md,
  },
  emptyBtnText: { ...typography.label, color: colors.gold[500], letterSpacing: 0.5 },

  // Card
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.surface,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.glass.border,
    overflow: 'hidden',
  },
  cardAccent: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 1,
  },

  imageWrap: {
    width: 90,
    height: CARD_H - 2 * 12,
    borderRadius: radius.md,
    backgroundColor: '#000',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.lg,
  },
  image: { width: '85%', height: '85%' },

  info: { flex: 1, paddingVertical: 2 },
  productCategory: {
    ...typography.caption2,
    color: colors.gold[500],
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 3,
  },
  productName: {
    ...typography.headline,
    fontSize: 15,
    lineHeight: 20,
    marginBottom: 6,
  },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginBottom: 8 },
  price: { ...typography.priceSmall },
  originalPrice: {
    ...typography.caption2,
    color: colors.text.muted,
    textDecorationLine: 'line-through',
    fontSize: 12,
  },

  actionRow: { flexDirection: 'row', alignItems: 'center' },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.glass.borderStrong,
  },
  addBtnActive: {
    borderColor: 'rgba(201, 169, 110, 0.3)',
    backgroundColor: 'rgba(201, 169, 110, 0.08)',
  },
  addBtnText: { ...typography.caption2, color: colors.text.secondary, fontWeight: '600' },
  addBtnTextActive: { color: colors.gold[500] },

  heartBtn: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 59, 48, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },

  // Add all
  addAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    marginTop: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(201, 169, 110, 0.25)',
    backgroundColor: 'rgba(201, 169, 110, 0.05)',
  },
  addAllText: {
    ...typography.label,
    color: colors.gold[500],
    letterSpacing: 0.5,
  },
});
