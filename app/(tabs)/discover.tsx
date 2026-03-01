import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, radius, layout } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { useFavorites } from '../../contexts/FavoritesContext';
import { useLocalization } from '../../contexts/LocalizationContext';
import { fetchProducts, fetchCategories, type Product, type CategoryItem } from '../../services/api';
import { getCachedProducts, setCachedProducts } from '../../services/productCache';
import { getRecentlyViewed } from '../../services/recentlyViewed';
import ProductHeroCard from '../../components/product/ProductHeroCard';
import ProductMiniCard from '../../components/product/ProductMiniCard';
import CategoryIcon from '../../components/ui/CategoryIcon';
import SectionHeader from '../../components/ui/SectionHeader';

const LOCAL_IMAGE_OVERRIDES: Record<string, any> = {
  'eye contour': require('../../assets/images/serum_cut.png'),
};

function getLocalImage(name: string): any | undefined {
  const key = Object.keys(LOCAL_IMAGE_OVERRIDES).find(
    (k) => name.toLowerCase().includes(k),
  );
  return key ? LOCAL_IMAGE_OVERRIDES[key] : undefined;
}

export default function DiscoverScreen() {
  const { user, token } = useAuth();
  const { addItem } = useCart();
  const { count: favCount } = useFavorites();
  const { t } = useLocalization();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([
    { id: 'all', label: 'All', icon: 'apps-outline' },
  ]);
  const [apiLoaded, setApiLoaded] = useState(false);
  const [loadingApi, setLoadingApi] = useState(true);
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const cached = await getCachedProducts();
      if (!cancelled && cached && cached.length > 0) {
        setProducts(cached);
        setApiLoaded(true);
      }

      try {
        const userCtx = user ? { id: user.id, token: token ?? undefined } : undefined;
        const [data, cats] = await Promise.all([
          fetchProducts(userCtx),
          fetchCategories(),
        ]);
        if (!cancelled && data.length > 0) {
          setProducts(data);
          setApiLoaded(true);
          setCachedProducts(data);
        }
        if (!cancelled && cats.length > 0) {
          setCategories(cats);
        }
      } catch {
      } finally {
        if (!cancelled) setLoadingApi(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user, token]);

  // Load recently viewed on mount/focus
  useEffect(() => {
    getRecentlyViewed().then(setRecentlyViewedIds);
  }, []);

  const recentlyViewedProducts = recentlyViewedIds
    .map((rid) => products.find((p) => String(p.id) === rid))
    .filter(Boolean)
    .slice(0, 6);

  const filteredProducts = products.filter((p) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      const words = q.split(/\s+/);
      const haystack = [
        p.name,
        p.description,
        p.category,
        p.keyBenefits,
        p.skinType,
        p.formulation,
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return words.every((w) => haystack.includes(w));
    }
    if (activeCategory !== 'all') {
      const cat = (p.category || '').toLowerCase();
      if (!cat.includes(activeCategory) && activeCategory !== cat) return false;
    }
    return true;
  });

  const heroProduct = filteredProducts[0];
  const gridProducts = filteredProducts.slice(1);

  const handleProductPress = useCallback((id: string) => {
    router.push(`/product/${id}`);
  }, []);

  const handleAddToBag = useCallback((id: string) => {
    const p = products.find((pr) => String(pr.id) === id);
    if (!p) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addItem({
      id: String(p.id),
      name: p.name,
      price: p.salePrice ?? p.price,
      salePrice: p.salePrice && p.salePrice !== p.price ? p.salePrice : undefined,
      currency: p.currency || 'AED',
      imageUrl: p.imageUrl || p.images?.[0],
    });
  }, [products, addItem]);

  const avatarInitial = user?.name?.[0]?.toUpperCase() || 'G';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => router.push('/profile/favorites')}
            activeOpacity={0.7}
          >
            <Ionicons
              name={favCount > 0 ? 'heart' : 'heart-outline'}
              size={22}
              color={favCount > 0 ? '#FF3B30' : colors.text.secondary}
            />
            {favCount > 0 && (
              <View style={styles.favBadge}>
                <Text style={styles.favBadgeText}>{favCount > 9 ? '9+' : favCount}</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.brandName}>GENOSYS</Text>
            <Text style={styles.brandTagline}>{t('common.premiumSkincare')}</Text>
          </View>

          <TouchableOpacity style={styles.avatarBtn} onPress={() => router.push('/profile')}>
            <Text style={styles.avatarText}>{avatarInitial}</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Search */}
        <Animated.View entering={FadeInDown.duration(600).delay(100)} style={styles.searchContainer}>
          <Ionicons name="search-outline" size={18} color={colors.text.tertiary} />
          <TextInput
            style={styles.searchInput}
            placeholder={t('discover.searchPlaceholder')}
            placeholderTextColor={colors.text.tertiary}
            value={searchQuery}
            onChangeText={setSearchQuery}
            selectionColor={colors.gold[500]}
          />
          <Ionicons name="mic-outline" size={20} color={colors.gold[500]} />
        </Animated.View>

        {/* Categories */}
        <Animated.View entering={FadeInDown.duration(600).delay(200)}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesScroll}
          >
            {categories.map((cat) => (
              <CategoryIcon
                key={cat.id}
                label={cat.label}
                icon={cat.icon as any}
                isActive={activeCategory === cat.id}
                onPress={() => setActiveCategory(cat.id)}
              />
            ))}
          </ScrollView>
        </Animated.View>

        {/* Loading state */}
        {loadingApi && !apiLoaded && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.gold[500]} />
            <Text style={styles.loadingText}>{t('discover.loadingProducts')}</Text>
          </View>
        )}

        {/* Empty state after load */}
        {!loadingApi && filteredProducts.length === 0 && (
          <View style={styles.emptyContainer}>
            <Ionicons name="cube-outline" size={48} color={colors.text.muted} />
            <Text style={styles.emptyTitle}>{t('discover.noProductsFound')}</Text>
            <Text style={styles.emptySubtitle}>
              {searchQuery ? t('discover.tryDifferentSearch') : t('discover.checkBackSoon')}
            </Text>
          </View>
        )}

        {/* Hero Product */}
        {heroProduct && (
          <Animated.View
            entering={FadeInDown.duration(700).delay(300)}
            style={styles.heroSection}
          >
            <ProductHeroCard
              id={String(heroProduct.id)}
              name={heroProduct.name}
              tagline={heroProduct.tagline || heroProduct.description?.slice(0, 60)}
              price={heroProduct.salePrice ?? heroProduct.price}
              imageUrl={heroProduct.imageUrl || heroProduct.images?.[0]}
              localImageSource={getLocalImage(heroProduct.name)}
              badge={heroProduct.badge}
              rating={heroProduct.rating}
              gradientColors={heroProduct.gradientColors}
              onPress={handleProductPress}
              onAddToBag={handleAddToBag}
            />
          </Animated.View>
        )}

        {/* Product Grid */}
        {gridProducts.length > 0 && (
          <Animated.View entering={FadeInDown.duration(700).delay(450)}>
            <SectionHeader title={t('discover.popular')} actionLabel={t('discover.seeAll')} onAction={() => setActiveCategory('all')} />
            <View style={styles.grid}>
              {gridProducts.map((product, index) => (
                <Animated.View
                  key={String(product.id)}
                  entering={FadeInRight.duration(500).delay(500 + index * 100)}
                >
                  <ProductMiniCard
                    id={String(product.id)}
                    name={product.name}
                    price={product.salePrice ?? product.price}
                    imageUrl={product.imageUrl || product.images?.[0]}
                    localImageSource={getLocalImage(product.name)}
                    onPress={handleProductPress}
                    onAddToBag={handleAddToBag}
                  />
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Recently Viewed */}
        {recentlyViewedProducts.length > 0 && (
          <Animated.View entering={FadeInDown.duration(700).delay(600)}>
            <SectionHeader title={t('common.recentlyViewed')} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.md, paddingBottom: spacing.md }}>
              {recentlyViewedProducts.map((product: any) => (
                <ProductMiniCard
                  key={String(product.id)}
                  id={String(product.id)}
                  name={product.name}
                  price={product.salePrice ?? product.price}
                  imageUrl={product.imageUrl || product.images?.[0]}
                  localImageSource={getLocalImage(product.name)}
                  onPress={handleProductPress}
                  onAddToBag={handleAddToBag}
                />
              ))}
            </ScrollView>
          </Animated.View>
        )}

        <View style={{ height: layout.tabBarHeight + 20 }} />
      </ScrollView>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg.primary },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: layout.screenPadding },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.md },
  headerCenter: { alignItems: 'center' },
  brandName: { ...typography.title2, letterSpacing: 4, fontSize: 24 },
  brandTagline: { ...typography.caption1, color: colors.gold[500], marginTop: 2, letterSpacing: 0.5 },
  headerIconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  favBadge: {
    position: 'absolute',
    top: 2,
    right: 0,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.gold[500],
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  favBadgeText: { fontSize: 9, fontWeight: '800' as const, color: '#000' },
  avatarBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: colors.gold[500], alignItems: 'center', justifyContent: 'center' },
  avatarText: { ...typography.label, color: colors.gold[500], fontSize: 14 },

  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.glass.light, borderRadius: radius.lg, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.glass.border, zIndex: 1 },
  searchInput: { flex: 1, ...typography.bodySmall, color: colors.text.primary, marginLeft: spacing.sm, marginRight: spacing.sm },

  categoriesScroll: { paddingBottom: spacing.lg, paddingTop: spacing.sm },

  loadingContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.section * 2 },
  loadingText: { ...typography.bodySmall, color: colors.text.secondary, marginTop: spacing.lg },
  emptyContainer: { alignItems: 'center', justifyContent: 'center', paddingVertical: spacing.section * 2 },
  emptyTitle: { ...typography.headline, color: colors.text.primary, marginTop: spacing.lg },
  emptySubtitle: { ...typography.caption1, color: colors.text.secondary, marginTop: spacing.xs },

  heroSection: { marginBottom: spacing.xxl },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: layout.cardGutter },
});
