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
import { colors, typography, spacing, radius, layout } from '../../constants/theme';
import { DEMO_PRODUCTS, CATEGORIES } from '../../constants/mockData';
import { useAuth } from '../../contexts/AuthContext';
import { fetchProducts, type Product } from '../../services/api';
import ProductHeroCard from '../../components/product/ProductHeroCard';
import ProductMiniCard from '../../components/product/ProductMiniCard';
import CategoryIcon from '../../components/ui/CategoryIcon';
import SectionHeader from '../../components/ui/SectionHeader';

export default function DiscoverScreen() {
  const { user, token } = useAuth();
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [products, setProducts] = useState<any[]>(DEMO_PRODUCTS);
  const [apiLoaded, setApiLoaded] = useState(false);
  const [loadingApi, setLoadingApi] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const userCtx = user ? { id: user.id, token: token ?? undefined } : undefined;
        const data = await fetchProducts(userCtx);
        if (!cancelled && data.length > 0) {
          setProducts(data);
          setApiLoaded(true);
        }
      } catch {
        // Keep demo data on failure
      } finally {
        if (!cancelled) setLoadingApi(false);
      }
    })();
    return () => { cancelled = true; };
  }, [user, token]);

  const filteredProducts = products.filter((p) => {
    if (activeCategory !== 'all') {
      if (p.category?.toLowerCase() !== activeCategory) return false;
    }
    if (searchQuery) {
      return p.name?.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const heroProduct = filteredProducts[0];
  const gridProducts = filteredProducts.slice(1);

  const handleProductPress = useCallback((id: string) => {
    router.push(`/product/${id}`);
  }, []);

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
          <TouchableOpacity style={styles.headerBtn} onPress={() => router.push('/profile')}>
            <Ionicons name="menu-outline" size={24} color={colors.text.primary} />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={styles.brandName}>GENOSYS</Text>
            <Text style={styles.brandTagline}>Premium Skincare & Beauty</Text>
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
            placeholder="Search products..."
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
            {CATEGORIES.map((cat) => (
              <CategoryIcon
                key={cat.id}
                label={cat.label}
                icon={cat.icon}
                isActive={activeCategory === cat.id}
                onPress={() => setActiveCategory(cat.id)}
              />
            ))}
          </ScrollView>
        </Animated.View>

        {/* Loading indicator */}
        {loadingApi && !apiLoaded && (
          <View style={styles.loadingRow}>
            <ActivityIndicator size="small" color={colors.gold[500]} />
            <Text style={styles.loadingText}>Loading products...</Text>
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
              badge={heroProduct.badge}
              rating={heroProduct.rating}
              gradientColors={heroProduct.gradientColors}
              onPress={handleProductPress}
            />
          </Animated.View>
        )}

        {/* Product Grid */}
        {gridProducts.length > 0 && (
          <Animated.View entering={FadeInDown.duration(700).delay(450)}>
            <SectionHeader title="Popular" actionLabel="See All" onAction={() => setActiveCategory('all')} />
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
                    onPress={handleProductPress}
                  />
                </Animated.View>
              ))}
            </View>
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
  headerBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerCenter: { alignItems: 'center' },
  brandName: { ...typography.title2, letterSpacing: 4, fontSize: 24 },
  brandTagline: { ...typography.caption1, color: colors.gold[500], marginTop: 2, letterSpacing: 0.5 },
  avatarBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, borderColor: colors.gold[500], alignItems: 'center', justifyContent: 'center' },
  avatarText: { ...typography.label, color: colors.gold[500], fontSize: 14 },

  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.glass.light, borderRadius: radius.lg, paddingHorizontal: spacing.lg, paddingVertical: spacing.md, marginBottom: spacing.xl, borderWidth: 1, borderColor: colors.glass.border },
  searchInput: { flex: 1, ...typography.bodySmall, color: colors.text.primary, marginLeft: spacing.sm, marginRight: spacing.sm },

  categoriesScroll: { paddingBottom: spacing.xl },

  loadingRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, marginBottom: spacing.xl },
  loadingText: { ...typography.caption1, color: colors.text.secondary },

  heroSection: { marginBottom: spacing.xxl },

  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: layout.cardGutter },
});
