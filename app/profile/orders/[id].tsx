import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, ActivityIndicator, Linking, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, radius } from '../../../constants/theme';
import { useAuth } from '../../../contexts/AuthContext';
import { useCart } from '../../../contexts/CartContext';
import { fetchUserOrderById } from '../../../services/api';
import GlassCard from '../../../components/ui/GlassCard';
import GoldButton from '../../../components/ui/GoldButton';

const STATUS_COLORS: Record<string, string> = {
  delivered: colors.status.success,
  shipped: '#5AC8FA',
  paid: colors.status.success,
  pending: colors.status.warning,
  processing: '#5AC8FA',
  cancelled: colors.status.error,
};

export default function OrderDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { token } = useAuth();
  const { addItem } = useCart();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token || !id) { setLoading(false); return; }
    (async () => {
      try {
        const data = await fetchUserOrderById(token, id);
        setOrder(data);
      } catch (e: any) {
        setError(e?.message || 'Failed to load order');
      } finally {
        setLoading(false);
      }
    })();
  }, [token, id]);

  const handleReorder = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const items = order?.items || order?.orderItems || [];
    items.forEach((item: any) => {
      addItem({
        id: String(item.productId || item.id),
        name: item.name || item.productName || 'Product',
        price: item.price || 0,
        currency: 'AED',
        imageUrl: item.imageUrl || item.image,
        variant: item.variant,
      }, item.quantity || 1);
    });
    Alert.alert('Added to Bag', 'All items from this order have been added to your bag.');
    router.push('/(tabs)/bag');
  };

  const handleWhatsApp = () => {
    const orderNum = order?.orderNumber || order?.id || id;
    const msg = encodeURIComponent(`Hi, I need help with order #${orderNum}`);
    Linking.openURL(`https://wa.me/971501234567?text=${msg}`);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order #{id}</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.center}><ActivityIndicator size="large" color={colors.gold[500]} /></View>
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order #{id}</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.center}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.status.error} />
          <Text style={styles.errorText}>{error || 'Order not found'}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const status = String(order.status || 'pending').toLowerCase();
  const statusColor = STATUS_COLORS[status] || colors.text.secondary;
  const items = order.items || order.orderItems || [];
  const shipping = order.shippingAddress || order.shipping || {};

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Order #{order.orderNumber || id}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(500)}>
          <GlassCard intensity="medium">
            <Text style={styles.orderNum}>Order #{order.orderNumber || id}</Text>
            <Text style={styles.orderDate}>
              {order.createdAt ? new Date(order.createdAt).toLocaleString() : ''}
            </Text>
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(100)}>
          <Text style={styles.sectionTitle}>Status</Text>
          <GlassCard>
            <View style={styles.statusRow}>
              <View style={[styles.statusDot, { backgroundColor: statusColor }]} />
              <Text style={styles.statusLabel}>{order.status || 'Pending'}</Text>
            </View>
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(200)}>
          <Text style={styles.sectionTitle}>Items ({items.length})</Text>
          <GlassCard>
            {items.map((item: any, i: number) => (
              <View key={item.id || i} style={[styles.itemRow, i > 0 && styles.itemBorder]}>
                {(item.imageUrl || item.image) ? (
                  <Image source={{ uri: item.imageUrl || item.image }} style={styles.itemThumb} contentFit="contain" />
                ) : (
                  <View style={[styles.itemThumb, { backgroundColor: colors.bg.elevated }]} />
                )}
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>{item.name || item.productName || 'Product'}</Text>
                  <Text style={styles.itemQty}>Qty: {item.quantity || 1}</Text>
                </View>
                <Text style={styles.itemPrice}>{item.price || 0} AED</Text>
              </View>
            ))}
          </GlassCard>
        </Animated.View>

        {(shipping.name || shipping.address || shipping.emirate) && (
          <Animated.View entering={FadeInDown.duration(500).delay(300)}>
            <Text style={styles.sectionTitle}>Shipping</Text>
            <GlassCard>
              {shipping.name && <Text style={styles.shippingName}>{shipping.name}</Text>}
              {shipping.phone && <Text style={styles.shippingDetail}>{shipping.phone}</Text>}
              {shipping.address && <Text style={styles.shippingDetail}>{shipping.address}</Text>}
              {shipping.emirate && <Text style={styles.shippingDetail}>{shipping.emirate}, UAE</Text>}
            </GlassCard>
          </Animated.View>
        )}

        <Animated.View entering={FadeInDown.duration(500).delay(400)}>
          <Text style={styles.sectionTitle}>Summary</Text>
          <GlassCard>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Subtotal</Text>
              <Text style={styles.summaryValue}>{order.subtotal || order.total || 0} AED</Text>
            </View>
            {(order.discount || 0) > 0 && (
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Discount</Text>
                <Text style={[styles.summaryValue, { color: colors.status.success }]}>-{order.discount} AED</Text>
              </View>
            )}
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Shipping</Text>
              <Text style={[styles.summaryValue, { color: colors.status.success }]}>
                {order.shippingCost ? `${order.shippingCost} AED` : 'FREE'}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>Total</Text>
              <Text style={styles.totalValue}>{order.total || order.totalAmount || 0} AED</Text>
            </View>
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(500)} style={{ marginTop: spacing.xl, gap: spacing.md }}>
          <GoldButton title="Reorder" onPress={handleReorder} fullWidth size="lg" />
          <TouchableOpacity style={styles.supportBtn} onPress={handleWhatsApp}>
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
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  errorText: { ...typography.bodySmall, color: colors.status.error, textAlign: 'center' },

  orderNum: { ...typography.title2, marginBottom: spacing.xs },
  orderDate: { ...typography.caption1, color: colors.text.secondary },

  sectionTitle: { ...typography.label, color: colors.text.secondary, textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5, marginTop: spacing.xl, marginBottom: spacing.md },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  statusLabel: { ...typography.headline },

  itemRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.md },
  itemBorder: { borderTopWidth: 1, borderTopColor: colors.glass.border },
  itemThumb: { width: 44, height: 44, borderRadius: radius.sm, marginRight: spacing.md },
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
