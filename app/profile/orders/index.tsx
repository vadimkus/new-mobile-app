import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, typography, spacing, radius } from '../../../constants/theme';
import GlassCard from '../../../components/ui/GlassCard';

const DEMO_ORDERS = [
  { id: '1042', date: 'Feb 25, 2026', status: 'Delivered', statusColor: colors.status.success, total: 534, items: 3 },
  { id: '1038', date: 'Feb 18, 2026', status: 'Shipped', statusColor: '#5AC8FA', total: 289, items: 1 },
  { id: '1035', date: 'Feb 10, 2026', status: 'Pending', statusColor: colors.status.warning, total: 430, items: 2 },
];

export default function OrdersScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>My Orders</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {DEMO_ORDERS.map((order, i) => (
          <Animated.View key={order.id} entering={FadeInDown.duration(400).delay(i * 100)}>
            <TouchableOpacity onPress={() => router.push(`/profile/orders/${order.id}`)} activeOpacity={0.8}>
              <GlassCard>
                <View style={styles.orderHeader}>
                  <Text style={styles.orderId}>#{order.id}</Text>
                  <View style={[styles.statusBadge, { backgroundColor: `${order.statusColor}20` }]}>
                    <Text style={[styles.statusText, { color: order.statusColor }]}>{order.status}</Text>
                  </View>
                </View>
                <View style={styles.orderDetails}>
                  <Text style={styles.orderDate}>{order.date}</Text>
                  <Text style={styles.orderDot}>·</Text>
                  <Text style={styles.orderDate}>{order.items} items</Text>
                </View>
                <View style={styles.orderFooter}>
                  <Text style={styles.orderTotal}>{order.total} AED</Text>
                  <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
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

  orderHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  orderId: { ...typography.headline },
  statusBadge: { paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.pill },
  statusText: { ...typography.caption2, fontWeight: '700', fontSize: 11 },
  orderDetails: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginBottom: spacing.md },
  orderDate: { ...typography.caption1, color: colors.text.secondary },
  orderDot: { color: colors.text.muted },
  orderFooter: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  orderTotal: { ...typography.price },
});
