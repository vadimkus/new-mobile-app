import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, typography, spacing, radius } from '../../../constants/theme';
import { useAuth } from '../../../contexts/AuthContext';
import { fetchUserOrders } from '../../../services/api';
import GlassCard from '../../../components/ui/GlassCard';

const STATUS_COLORS: Record<string, string> = {
  delivered: colors.status.success,
  shipped: '#5AC8FA',
  paid: colors.status.success,
  pending: colors.status.warning,
  processing: '#5AC8FA',
};

export default function OrdersScreen() {
  const { token } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) { setLoading(false); return; }
    (async () => {
      try {
        const data = await fetchUserOrders(token);
        setOrders(data);
      } catch (e: any) {
        setError(e?.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    })();
  }, [token]);

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
        {loading && (
          <View style={styles.center}><ActivityIndicator size="large" color={colors.gold[500]} /></View>
        )}

        {!loading && error !== '' && (
          <View style={styles.center}><Text style={styles.errorText}>{error}</Text></View>
        )}

        {!loading && orders.length === 0 && !error && (
          <View style={styles.center}>
            <Ionicons name="receipt-outline" size={48} color={colors.text.muted} />
            <Text style={styles.emptyText}>No orders yet</Text>
          </View>
        )}

        {orders.map((order, i) => {
          const status = String(order.status || 'pending').toLowerCase();
          const statusColor = STATUS_COLORS[status] || colors.text.secondary;
          return (
            <Animated.View key={order.id || order.orderNumber || i} entering={FadeInDown.duration(400).delay(i * 100)}>
              <TouchableOpacity onPress={() => router.push(`/profile/orders/${order.id || order.orderNumber}`)} activeOpacity={0.8}>
                <GlassCard>
                  <View style={styles.orderHeader}>
                    <Text style={styles.orderId}>#{order.orderNumber || order.id}</Text>
                    <View style={[styles.statusBadge, { backgroundColor: `${statusColor}20` }]}>
                      <Text style={[styles.statusText, { color: statusColor }]}>{order.status || 'Pending'}</Text>
                    </View>
                  </View>
                  <View style={styles.orderDetails}>
                    <Text style={styles.orderDate}>{order.createdAt ? new Date(order.createdAt).toLocaleDateString() : ''}</Text>
                    <Text style={styles.orderDot}>·</Text>
                    <Text style={styles.orderDate}>{order.items?.length || 0} items</Text>
                  </View>
                  <View style={styles.orderFooter}>
                    <Text style={styles.orderTotal}>{order.total || order.totalAmount || 0} AED</Text>
                    <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
                  </View>
                </GlassCard>
              </TouchableOpacity>
            </Animated.View>
          );
        })}
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
  errorText: { ...typography.bodySmall, color: colors.status.error, textAlign: 'center' },
  emptyText: { ...typography.headline, color: colors.text.secondary },

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
