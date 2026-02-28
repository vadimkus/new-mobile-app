import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, typography, spacing, radius, layout } from '../../constants/theme';
import { DEMO_PRODUCTS } from '../../constants/mockData';
import GlassCard from '../../components/ui/GlassCard';
import GoldButton from '../../components/ui/GoldButton';

const CART_ITEMS = [
  { product: DEMO_PRODUCTS[1], quantity: 1 },
  { product: DEMO_PRODUCTS[2], quantity: 2 },
];

export default function BagScreen() {
  const subtotal = CART_ITEMS.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0,
  );

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(600)}>
          <Text style={styles.pageTitle}>My Bag</Text>
          <Text style={styles.itemCount}>{CART_ITEMS.length} items</Text>
        </Animated.View>

        {/* Cart items */}
        {CART_ITEMS.map((item, index) => (
          <Animated.View
            key={item.product.id}
            entering={FadeInDown.duration(500).delay(150 + index * 100)}
          >
            <View style={styles.cartItem}>
              <Image
                source={{ uri: item.product.imageUrl }}
                style={styles.cartImage}
                contentFit="contain"
              />
              <View style={styles.cartInfo}>
                <Text style={styles.cartName} numberOfLines={2}>
                  {item.product.name}
                </Text>
                <Text style={styles.cartCategory}>{item.product.category}</Text>
                <Text style={styles.cartPrice}>
                  {item.product.price} {item.product.currency}
                </Text>
              </View>

              <View style={styles.quantityRow}>
                <TouchableOpacity style={styles.qtyBtn}>
                  <Ionicons name="remove" size={16} color={colors.text.primary} />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{item.quantity}</Text>
                <TouchableOpacity style={styles.qtyBtn}>
                  <Ionicons name="add" size={16} color={colors.text.primary} />
                </TouchableOpacity>
              </View>
            </View>
          </Animated.View>
        ))}

        {/* Summary */}
        <Animated.View entering={FadeInDown.duration(500).delay(400)} style={styles.summarySection}>
          <GlassCard>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{subtotal} AED</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Delivery</Text>
              <Text style={[styles.summaryValue, { color: colors.status.success }]}>
                FREE
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{subtotal} AED</Text>
            </View>
            <Text style={styles.vatNote}>VAT included</Text>
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(500)} style={styles.checkoutSection}>
          <GoldButton
            title="Proceed to Checkout"
            onPress={() => {}}
            fullWidth
            size="lg"
          />
        </Animated.View>

        <View style={{ height: layout.tabBarHeight + 40 }} />
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
  pageTitle: {
    ...typography.display,
    marginTop: spacing.md,
  },
  itemCount: {
    ...typography.bodySmall,
    color: colors.text.secondary,
    marginTop: spacing.xs,
    marginBottom: spacing.xxl,
  },

  // Cart item
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  cartImage: {
    width: 60,
    height: 60,
    borderRadius: radius.sm,
    marginRight: spacing.lg,
  },
  cartInfo: {
    flex: 1,
  },
  cartName: {
    ...typography.headline,
    fontSize: 15,
    marginBottom: 2,
  },
  cartCategory: {
    ...typography.caption1,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  cartPrice: {
    ...typography.priceSmall,
  },

  // Quantity
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.glass.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyText: {
    ...typography.headline,
    color: colors.text.primary,
    fontVariant: ['tabular-nums'],
  },

  // Summary
  summarySection: {
    marginTop: spacing.xl,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  summaryLabel: {
    ...typography.bodySmall,
    color: colors.text.secondary,
  },
  summaryValue: {
    ...typography.bodySmall,
    color: colors.text.primary,
  },
  divider: {
    height: 1,
    backgroundColor: colors.glass.border,
    marginVertical: spacing.md,
  },
  totalLabel: {
    ...typography.headline,
    color: colors.text.primary,
  },
  totalValue: {
    ...typography.price,
    fontSize: 20,
  },
  vatNote: {
    ...typography.caption2,
    color: colors.text.tertiary,
    textAlign: 'right',
    marginTop: -4,
  },

  // Checkout
  checkoutSection: {
    marginTop: spacing.xl,
  },
});
