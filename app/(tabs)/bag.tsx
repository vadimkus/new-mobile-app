import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, radius, layout } from '../../constants/theme';
import { useCart } from '../../contexts/CartContext';
import GlassCard from '../../components/ui/GlassCard';
import GoldButton from '../../components/ui/GoldButton';

export default function BagScreen() {
  const { items, updateQuantity, removeItem, subtotal, itemCount, clearCart } = useCart();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Animated.View entering={FadeInDown.duration(600)}>
          <Text style={styles.pageTitle}>My Bag</Text>
          <Text style={styles.itemCount}>
            {itemCount === 0 ? 'Your bag is empty' : `${itemCount} item${itemCount > 1 ? 's' : ''}`}
          </Text>
        </Animated.View>

        {items.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="bag-outline" size={64} color={colors.text.muted} />
            <Text style={styles.emptyText}>Add products to your bag</Text>
            <Text style={styles.emptySubtext}>Browse our collection and find your perfect routine</Text>
          </View>
        )}

        {items.map((item, index) => (
          <Animated.View
            key={`${item.id}_${item.variant || 'default'}`}
            entering={FadeInDown.duration(500).delay(150 + index * 100)}
          >
            <View style={styles.cartItem}>
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.cartImage} resizeMode="contain" />
              ) : (
                <View style={[styles.cartImage, styles.cartImagePlaceholder]} />
              )}
              <View style={styles.cartInfo}>
                <Text style={styles.cartName} numberOfLines={2}>{item.name}</Text>
                {item.variant && <Text style={styles.cartVariant}>{item.variant}</Text>}
                <Text style={styles.cartPrice}>{item.salePrice ?? item.price} {item.currency}</Text>
              </View>

              <View style={styles.rightCol}>
                <TouchableOpacity
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    removeItem(item.id, item.variant);
                  }}
                  hitSlop={8}
                >
                  <Ionicons name="trash-outline" size={16} color={colors.status.error} />
                </TouchableOpacity>
                <View style={styles.quantityRow}>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => {
                      Haptics.selectionAsync();
                      updateQuantity(item.id, item.quantity - 1, item.variant);
                    }}
                  >
                    <Ionicons name="remove" size={16} color={colors.text.primary} />
                  </TouchableOpacity>
                  <Text style={styles.qtyText}>{item.quantity}</Text>
                  <TouchableOpacity
                    style={styles.qtyBtn}
                    onPress={() => {
                      Haptics.selectionAsync();
                      updateQuantity(item.id, item.quantity + 1, item.variant);
                    }}
                  >
                    <Ionicons name="add" size={16} color={colors.text.primary} />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Animated.View>
        ))}

        {items.length > 0 && (
          <>
            <Animated.View entering={FadeInDown.duration(500).delay(400)} style={styles.summarySection}>
              <GlassCard>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Subtotal</Text>
                  <Text style={styles.summaryValue}>{subtotal} AED</Text>
                </View>
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>Delivery</Text>
                  <Text style={[styles.summaryValue, { color: colors.status.success }]}>
                    {subtotal >= 1000 ? 'FREE' : 'Calculated at checkout'}
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
                onPress={() => router.push('/checkout')}
                fullWidth
                size="lg"
              />
            </Animated.View>
          </>
        )}

        <View style={{ height: layout.tabBarHeight + 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg.primary },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: layout.screenPadding },
  pageTitle: { ...typography.display, marginTop: spacing.md },
  itemCount: { ...typography.bodySmall, color: colors.text.secondary, marginTop: spacing.xs, marginBottom: spacing.xxl },

  emptyState: { alignItems: 'center', paddingVertical: 60, gap: spacing.md },
  emptyText: { ...typography.headline, color: colors.text.secondary },
  emptySubtext: { ...typography.caption1, color: colors.text.tertiary, textAlign: 'center' },

  cartItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bg.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.glass.border },
  cartImage: { width: 60, height: 60, borderRadius: radius.sm, marginRight: spacing.lg },
  cartImagePlaceholder: { backgroundColor: colors.bg.elevated },
  cartInfo: { flex: 1 },
  cartName: { ...typography.headline, fontSize: 15, marginBottom: 2 },
  cartVariant: { ...typography.caption2, color: colors.text.tertiary, marginBottom: 2 },
  cartPrice: { ...typography.priceSmall },

  rightCol: { alignItems: 'flex-end', gap: spacing.md },
  quantityRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  qtyBtn: { width: 32, height: 32, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.glass.borderStrong, alignItems: 'center', justifyContent: 'center' },
  qtyText: { ...typography.headline, color: colors.text.primary, fontVariant: ['tabular-nums'] },

  summarySection: { marginTop: spacing.xl },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.md },
  summaryLabel: { ...typography.bodySmall, color: colors.text.secondary },
  summaryValue: { ...typography.bodySmall, color: colors.text.primary },
  divider: { height: 1, backgroundColor: colors.glass.border, marginVertical: spacing.md },
  totalLabel: { ...typography.headline, color: colors.text.primary },
  totalValue: { ...typography.price, fontSize: 20 },
  vatNote: { ...typography.caption2, color: colors.text.tertiary, textAlign: 'right', marginTop: -4 },

  checkoutSection: { marginTop: spacing.xl },
});
