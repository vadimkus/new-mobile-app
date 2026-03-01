import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Alert, ActivityIndicator, Modal, Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, radius } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useLocalization } from '../contexts/LocalizationContext';
import { createOrder, fetchShippingRates, type ShippingRates } from '../services/api';
import GlassCard from '../components/ui/GlassCard';
import GoldButton from '../components/ui/GoldButton';

const UAE_EMIRATES = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'];

export default function CheckoutScreen() {
  const { user, token } = useAuth();
  const { items, subtotal, clearCart } = useCart();
  const { t } = useLocalization();
  const [shippingRates, setShippingRates] = useState<ShippingRates | null>(null);

  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [emirate, setEmirate] = useState(user?.emirate || 'Dubai');
  const [showEmiratePicker, setShowEmiratePicker] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'card'>('cod');
  const [promoCode, setPromoCode] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    (async () => {
      const rates = await fetchShippingRates();
      setShippingRates(rates);
    })();
  }, []);

  const shippingCost = (() => {
    if (!shippingRates) return 0;
    if (subtotal >= shippingRates.freeShippingThreshold) return 0;
    const rate = shippingRates.emirates.find((e) => e.name === emirate);
    return rate?.shippingCost ?? 45;
  })();

  const vatRate = shippingRates?.vatRate ?? 0.05;
  const total = subtotal + shippingCost;

  const handlePlaceOrder = async () => {
    if (!name.trim() || !phone.trim() || !address.trim()) {
      Alert.alert(t('alerts.missingInfo'), t('alerts.fillShippingDetails'));
      return;
    }
    if (!token) {
      Alert.alert(t('alerts.signInRequired'), t('alerts.signInToPlaceOrder'), [
        { text: t('addressesPage.cancel') },
        { text: t('auth.signIn'), onPress: () => router.push('/auth/login') },
      ]);
      return;
    }

    setSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const result = await createOrder(token, {
        items: items.map((item) => ({
          productId: item.id,
          quantity: item.quantity,
          variant: item.variant,
          price: item.salePrice ?? item.price,
        })),
        shippingAddress: {
          name: name.trim(),
          address: address.trim(),
          emirate,
          phone: phone.trim(),
        },
        paymentMethod,
        promoCode: promoCode.trim() || undefined,
        notes: notes.trim() || undefined,
      });

      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        clearCart();
        Alert.alert(
          t('checkout.orderPlaced'),
          `${t('checkout.orderPlacedMessage')}${paymentMethod === 'cod' ? ` ${t('checkout.payOnDelivery')}` : ''}`,
          [{ text: t('checkout.viewOrders'), onPress: () => router.replace('/profile/orders') }],
        );
      } else {
        Alert.alert(t('alerts.error'), result.error || t('alerts.failedToPlaceOrder'));
      }
    } catch (e: any) {
      Alert.alert(t('alerts.error'), e?.message || t('alerts.somethingWentWrong'));
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.emptyState}>
          <Ionicons name="bag-outline" size={48} color={colors.text.muted} />
          <Text style={styles.emptyText}>{t('bag.emptyTitle')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Checkout</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Order Summary */}
        <Animated.View entering={FadeInDown.duration(500)}>
          <Text style={styles.sectionTitle}>{t('checkout.orderSummary')}</Text>
          <GlassCard>
            {items.map((item) => (
              <View key={`${item.id}_${item.variant || ''}`} style={styles.itemRow}>
                <Text style={styles.itemName} numberOfLines={1}>{item.name} × {item.quantity}</Text>
                <Text style={styles.itemPrice}>{((item.salePrice ?? item.price) * item.quantity).toFixed(2)} AED</Text>
              </View>
            ))}
          </GlassCard>
        </Animated.View>

        {/* Shipping Address */}
        <Animated.View entering={FadeInDown.duration(500).delay(100)}>
          <Text style={styles.sectionTitle}>{t('checkout.shippingAddress')}</Text>
          <GlassCard>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('checkout.fullName')} *</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} placeholder={t('placeholders.yourName')} placeholderTextColor={colors.text.muted} selectionColor={colors.gold[500]} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('checkout.phone')} *</Text>
              <TextInput style={styles.input} value={phone} onChangeText={setPhone} placeholder="+971 XX XXX XXXX" placeholderTextColor={colors.text.muted} keyboardType="phone-pad" selectionColor={colors.gold[500]} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('checkout.address')} *</Text>
              <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder={t('placeholders.streetBuildingApartment')} placeholderTextColor={colors.text.muted} selectionColor={colors.gold[500]} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('placeholders.emirate')}</Text>
              <TouchableOpacity style={styles.selectButton} onPress={() => setShowEmiratePicker(true)}>
                <Text style={styles.selectText}>{emirate}</Text>
                <Ionicons name="chevron-down" size={18} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Payment Method */}
        <Animated.View entering={FadeInDown.duration(500).delay(200)}>
          <Text style={styles.sectionTitle}>{t('checkout.paymentMethod')}</Text>
          <GlassCard>
            <TouchableOpacity style={styles.paymentOption} onPress={() => { Haptics.selectionAsync(); setPaymentMethod('cod'); }}>
              <Ionicons name={paymentMethod === 'cod' ? 'radio-button-on' : 'radio-button-off'} size={22} color={paymentMethod === 'cod' ? colors.gold[500] : colors.text.muted} />
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentLabel}>{t('paymentPage.cashOnDelivery')}</Text>
                <Text style={styles.paymentDesc}>{t('checkout.payWhenOrderArrives')}</Text>
              </View>
              <Ionicons name="cash-outline" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
            <View style={styles.paymentDivider} />
            <TouchableOpacity style={styles.paymentOption} onPress={() => { Haptics.selectionAsync(); setPaymentMethod('card'); }}>
              <Ionicons name={paymentMethod === 'card' ? 'radio-button-on' : 'radio-button-off'} size={22} color={paymentMethod === 'card' ? colors.gold[500] : colors.text.muted} />
              <View style={styles.paymentInfo}>
                <Text style={styles.paymentLabel}>{t('checkout.creditDebitCard')}</Text>
                <Text style={styles.paymentDesc}>Visa, Mastercard, AMEX</Text>
              </View>
              <Ionicons name="card-outline" size={20} color={colors.text.secondary} />
            </TouchableOpacity>
          </GlassCard>
        </Animated.View>

        {/* Promo Code */}
        <Animated.View entering={FadeInDown.duration(500).delay(300)}>
          <Text style={styles.sectionTitle}>{t('checkout.promoCode')}</Text>
          <View style={styles.promoRow}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={promoCode}
              onChangeText={setPromoCode}
              placeholder={t('placeholders.enterPromoCode')}
              placeholderTextColor={colors.text.muted}
              autoCapitalize="characters"
              selectionColor={colors.gold[500]}
            />
          </View>
        </Animated.View>

        {/* Notes */}
        <Animated.View entering={FadeInDown.duration(500).delay(350)} style={styles.notesSection}>
          <Text style={styles.sectionTitle}>{t('checkout.orderNotes')}</Text>
          <GlassCard>
            <TextInput
              style={[styles.notesInner]}
              value={notes}
              onChangeText={setNotes}
              placeholder={t('placeholders.anySpecialInstructions')}
              placeholderTextColor={colors.text.muted}
              multiline
              numberOfLines={3}
              selectionColor={colors.gold[500]}
            />
          </GlassCard>
        </Animated.View>

        {/* Total */}
        <Animated.View entering={FadeInDown.duration(500).delay(400)}>
          <GlassCard intensity="medium">
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('checkout.subtotal')}</Text>
              <Text style={styles.summaryValue}>{Number(subtotal).toFixed(2)} AED</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('checkout.shipping')} ({emirate})</Text>
              <Text style={[styles.summaryValue, shippingCost === 0 && { color: colors.status.success }]}>
                {shippingCost === 0 ? t('checkout.free') : `${Number(shippingCost).toFixed(2)} AED`}
              </Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.summaryRow}>
              <Text style={styles.totalLabel}>{t('checkout.total')}</Text>
              <Text style={styles.totalValue}>{Number(total).toFixed(2)} AED</Text>
            </View>
            <Text style={styles.vatNote}>{t('productPage.vatIncluded')} ({Math.round(vatRate * 100)}%)</Text>
          </GlassCard>
        </Animated.View>

        {/* Place Order */}
        <Animated.View entering={FadeInDown.duration(500).delay(500)} style={{ marginTop: spacing.xl }}>
          <GoldButton
            title={submitting ? '' : t('checkout.placeOrder')}
            onPress={handlePlaceOrder}
            fullWidth
            size="lg"
            disabled={submitting}
            icon={submitting ? <ActivityIndicator color={colors.text.inverse} size="small" /> : undefined}
          />
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Emirate Picker */}
      <Modal visible={showEmiratePicker} transparent animationType="fade" onRequestClose={() => setShowEmiratePicker(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowEmiratePicker(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('checkout.selectEmirate')}</Text>
            {UAE_EMIRATES.map((em) => (
              <TouchableOpacity
                key={em}
                style={[styles.emirateItem, emirate === em && styles.emirateItemActive]}
                onPress={() => { Haptics.selectionAsync(); setEmirate(em); setShowEmiratePicker(false); }}
              >
                <Text style={[styles.emirateText, emirate === em && styles.emirateTextActive]}>{em}</Text>
                {emirate === em && <Ionicons name="checkmark" size={18} color={colors.gold[500]} />}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
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

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  emptyText: { ...typography.headline, color: colors.text.secondary },

  sectionTitle: { ...typography.label, color: colors.text.secondary, textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5, marginTop: spacing.xl, marginBottom: spacing.md },

  itemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: spacing.sm },
  itemName: { ...typography.bodySmall, color: colors.text.primary, flex: 1, marginRight: spacing.md },
  itemPrice: { ...typography.priceSmall },

  inputGroup: { marginBottom: spacing.lg },
  inputLabel: { ...typography.label, color: colors.text.secondary, marginBottom: spacing.sm, fontSize: 13 },
  input: { ...typography.body, color: colors.text.primary, backgroundColor: colors.bg.surface, borderWidth: 1, borderColor: colors.glass.border, borderRadius: radius.md, paddingVertical: 14, paddingHorizontal: 16 },
  notesSection: { marginBottom: spacing.md },
  notesInner: { ...typography.body, color: colors.text.primary, minHeight: 72, textAlignVertical: 'top' },
  selectButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: colors.bg.surface, borderWidth: 1, borderColor: colors.glass.border, borderRadius: radius.md, paddingVertical: 14, paddingHorizontal: 16 },
  selectText: { ...typography.body, color: colors.text.primary },

  paymentOption: { flexDirection: 'row', alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
  paymentInfo: { flex: 1 },
  paymentLabel: { ...typography.headline, fontSize: 15 },
  paymentDesc: { ...typography.caption2, color: colors.text.secondary, marginTop: 2 },
  paymentDivider: { height: 1, backgroundColor: colors.glass.border },

  promoRow: { flexDirection: 'row', gap: spacing.md },

  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  summaryLabel: { ...typography.bodySmall, color: colors.text.secondary },
  summaryValue: { ...typography.bodySmall, color: colors.text.primary },
  divider: { height: 1, backgroundColor: colors.glass.border, marginVertical: spacing.md },
  totalLabel: { ...typography.headline },
  totalValue: { ...typography.price },
  vatNote: { ...typography.caption2, color: colors.text.tertiary, textAlign: 'right', marginTop: -4 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', paddingHorizontal: 32 },
  modalContent: { backgroundColor: colors.bg.elevated, borderRadius: radius.xl, overflow: 'hidden', borderWidth: 1, borderColor: colors.glass.border },
  modalTitle: { ...typography.headline, textAlign: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.glass.border },
  emirateItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.glass.border },
  emirateItemActive: { backgroundColor: 'rgba(201,169,110,0.08)' },
  emirateText: { ...typography.body, color: colors.text.primary },
  emirateTextActive: { color: colors.gold[500], fontWeight: '700' },
});
