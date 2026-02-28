import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { colors, typography, spacing, radius, layout } from '../../constants/theme';
import { DEMO_PRODUCTS, CATEGORIES } from '../../constants/mockData';
import ProductHeroCard from '../../components/product/ProductHeroCard';
import ProductMiniCard from '../../components/product/ProductMiniCard';
import CategoryIcon from '../../components/ui/CategoryIcon';
import SectionHeader from '../../components/ui/SectionHeader';

export default function DiscoverScreen() {
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProducts = DEMO_PRODUCTS.filter((p) => {
    if (activeCategory !== 'all') {
      if (p.category.toLowerCase() !== activeCategory) return false;
    }
    if (searchQuery) {
      return p.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  const heroProduct = filteredProducts[0];
  const gridProducts = filteredProducts.slice(1);

  const handleProductPress = useCallback((id: string) => {
    router.push(`/product/${id}`);
  }, []);

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
            <Text style={styles.avatarText}>V</Text>
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
          <TouchableOpacity>
            <Ionicons name="mic-outline" size={20} color={colors.gold[500]} />
          </TouchableOpacity>
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

        {/* Hero Product */}
        {heroProduct && (
          <Animated.View
            entering={FadeInDown.duration(700).delay(300)}
            style={styles.heroSection}
          >
            <ProductHeroCard
              id={heroProduct.id}
              name={heroProduct.name}
              tagline={heroProduct.tagline}
              price={heroProduct.price}
              imageUrl={heroProduct.imageUrl}
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
            <SectionHeader title="Popular" actionLabel="See All" onAction={() => {}} />
            <View style={styles.grid}>
              {gridProducts.map((product, index) => (
                <Animated.View
                  key={product.id}
                  entering={FadeInRight.duration(500).delay(500 + index * 100)}
                >
                  <ProductMiniCard
                    id={product.id}
                    name={product.name}
                    price={product.price}
                    imageUrl={product.imageUrl}
                    onPress={handleProductPress}
                  />
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        )}

        {/* Bottom spacer for tab bar */}
        <View style={{ height: layout.tabBarHeight + 20 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg.primary,
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
    justifyContent: 'space-between',
    paddingVertical: spacing.md,
  },
  headerBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    alignItems: 'center',
  },
  brandName: {
    ...typography.title2,
    letterSpacing: 4,
    fontSize: 24,
  },
  brandTagline: {
    ...typography.caption1,
    color: colors.gold[500],
    marginTop: 2,
    letterSpacing: 0.5,
  },
  avatarBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: colors.gold[500],
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    ...typography.label,
    color: colors.gold[500],
    fontSize: 14,
  },

  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.glass.light,
    borderRadius: radius.lg,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  searchInput: {
    flex: 1,
    ...typography.bodySmall,
    color: colors.text.primary,
    marginLeft: spacing.sm,
    marginRight: spacing.sm,
  },

  // Categories
  categoriesScroll: {
    paddingBottom: spacing.xl,
  },

  // Hero
  heroSection: {
    marginBottom: spacing.xxl,
  },

  // Grid
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: layout.cardGutter,
  },
});
