import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, radius } from '../../constants/theme';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { fetchProducts, type Product } from '../../services/api';
import GlassCard from '../../components/ui/GlassCard';

export default function FavoritesScreen() {
  const { favoriteIds, toggleFavorite } = useFavorites();
  const { user, token } = useAuth();
  const { addItem } = useCart();
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

  const handleAddToCart = (product: Product) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addItem({
      id: String(product.id),
      name: product.name,
      price: product.salePrice ?? product.price,
      currency: product.currency || 'AED',
      imageUrl: product.imageUrl || product.images?.[0],
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Favorites</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {loading && (
          <View style={styles.center}><ActivityIndicator size="large" color={colors.gold[500]} /></View>
        )}

        {!loading && favorites.length === 0 && (
          <View style={styles.center}>
            <Ionicons name="heart-outline" size={48} color={colors.text.muted} />
            <Text style={styles.emptyText}>No favorites yet</Text>
            <Text style={styles.emptySubtext}>Tap the heart on products you love</Text>
          </View>
        )}

        {favorites.map((product, i) => (
          <Animated.View key={String(product.id)} entering={FadeInDown.duration(400).delay(i * 80)}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push(`/product/${product.id}`)}
            >
              <GlassCard>
                <View style={styles.row}>
                  {(product.imageUrl || product.images?.[0]) && (
                    <Image
                      source={{ uri: product.imageUrl || product.images?.[0] }}
                      style={styles.image}
                      contentFit="contain"
                    />
                  )}
                  <View style={styles.info}>
                    <Text style={styles.name} numberOfLines={2}>{product.name}</Text>
                    <Text style={styles.category}>{product.category}</Text>
                    <Text style={styles.price}>{Number(product.salePrice ?? product.price).toFixed(2)} {product.currency || 'AED'}</Text>
                  </View>
                  <View style={styles.actions}>
                    <TouchableOpacity
                      onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); toggleFavorite(String(product.id)); }}
                      hitSlop={8}
                    >
                      <Ionicons name="heart" size={22} color="#FF3B30" />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleAddToCart(product)}
                      hitSlop={8}
                    >
                      <Ionicons name="bag-add-outline" size={20} color={colors.gold[500]} />
                    </TouchableOpacity>
                  </View>
                </View>
              </GlassCard>
            </TouchableOpacity>
          </Animated.View>
        ))}

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg.primary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: spacing.sm },
  navBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...typography.title3, letterSpacing: 0.5 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, gap: spacing.md },

  center: { alignItems: 'center', paddingVertical: 60, gap: spacing.md },
  emptyText: { ...typography.headline, color: colors.text.secondary },
  emptySubtext: { ...typography.caption1, color: colors.text.tertiary },

  row: { flexDirection: 'row', alignItems: 'center' },
  image: { width: 56, height: 56, borderRadius: radius.sm, marginRight: spacing.lg },
  info: { flex: 1 },
  name: { ...typography.headline, fontSize: 15, marginBottom: 2 },
  category: { ...typography.caption2, color: colors.text.secondary, marginBottom: 2 },
  price: { ...typography.priceSmall },
  actions: { gap: spacing.lg, alignItems: 'center' },
});
