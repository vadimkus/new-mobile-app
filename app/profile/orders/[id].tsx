import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, typography, spacing, radius } from '../../../constants/theme';
import GlassCard from '../../../components/ui/GlassCard';
import GoldButton from '../../../components/ui/GoldButton';

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order #{id}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(500)}>
          <GlassCard intensity="medium">
            <Text style={styles.orderNum}>Order #{id}</Text>
            <Text style={styles.orderDate}>Feb 25, 2026 · 14:32</Text>
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(100)}>
          <Text style={styles.sectionTitle}>Status</Text>
          <GlassCard>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: colors.status.success }]} />
              <Text style={styles.statusLabel}>Delivered</Text>
            </View>
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(200)}>
          <Text style={styles.sectionTitle}>Items</Text>
          <GlassCard>
            {['Intensive Peptide Serum', 'Micro Retinol Cream', 'UV Shield SPF 50+'].map((item, i) => (
              <View key={i} style={[styles.itemRow, i > 0 && styles.itemBorder]}>
                <View style={styles.itemThumb} />
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item}</Text>
                  <Text style={styles.itemQty}>Qty: 1</Text>
                </View>
                <Text style={styles.itemPrice}>{[289, 245, 165][i]} AED</Text>
              </View>
            ))}
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(300)}>
          <Text style={styles.sectionTitle}>Shipping</Text>
          <GlassCard>
            <Text style={styles.shippingName}>Vadim Kus</Text>
            <Text style={styles.shippingDetail}>+971 50 123 4567</Text>
            <Text style={styles.shippingDetail}>Dubai, UAE</Text>
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(400)}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <GlassCard>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Subtotal</Text><Text style={styles.summaryValue}>699 AED</Text></View>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>VIP Discount (15%)</Text><Text style={[styles.summaryValue, { color: colors.status.success }]}>-105 AED</Text></View>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Shipping</Text><Text style={[styles.summaryValue, { color: colors.status.success }]}>FREE</Text></View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}><Text style={styles.totalLabel}>Total</Text><Text style={styles.totalValue}>534 AED</Text></View>
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(500)} style={{ marginTop: spacing.xl, gap: spacing.md }}>
          <GoldButton title="Reorder" onPress={() => {}} fullWidth size="lg" />
          <TouchableOpacity style={styles.supportBtn}>
            <Ionicons name="logo-whatsapp" size={18} color="#25D366" />
            <Text style={styles.supportText}>WhatsApp Support</Text>
          </TouchableOpacity>
        </Animated.View>

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
  content: { paddingHorizontal: 20 },

  orderNum: { ...typography.title2, marginBottom: spacing.xs },
  orderDate: { ...typography.caption1, color: colors.text.secondary },

  sectionTitle: { ...typography.label, color: colors.text.secondary, textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5, marginTop: spacing.xl, marginBottom: spacing.md },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusLabel: { ...typography.headline },

  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md },
  itemBorder: { borderTopWidth: 1, borderTopColor: colors.glass.border },
  itemThumb: { width: 44, height: 44, borderRadius: radius.sm, backgroundColor: colors.bg.elevated, marginRight: spacing.md },
  itemInfo: { flex: 1 },
  itemName: { ...typography.headline, fontSize: 14 },
  itemQty: { ...typography.caption2, color: colors.text.secondary, marginTop: 2 },
  itemPrice: { ...typography.priceSmall },

  shippingName: { ...typography.headline, marginBottom: spacing.xs },
  shippingDetail: { ...typography.caption1, color: colors.text.secondary, marginBottom: 2 },

  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  summaryLabel: { ...typography.bodySmall, color: colors.text.secondary },
  summaryValue: { ...typography.bodySmall, color: colors.text.primary },
  divider: { height: 1, backgroundColor: colors.glass.border, marginVertical: spacing.md },
  totalLabel: { ...typography.headline },
  totalValue: { ...typography.price },

  supportBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: spacing.sm, paddingVertical: 14, borderRadius: radius.md, borderWidth: 1, borderColor: '#25D366' },
  supportText: { ...typography.headline, color: '#25D366', fontSize: 15 },
});
