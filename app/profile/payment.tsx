import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, radius } from '../../constants/theme';
import GlassCard from '../../components/ui/GlassCard';
import MenuRow from '../../components/ui/MenuRow';

export default function PaymentScreen() {
  const [method, setMethod] = useState<'cod' | 'card'>('cod');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}><Ionicons name="arrow-back" size={22} color={colors.text.primary} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Payment & Billing</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(500)}>
          <Text style={styles.sectionLabel}>Default Payment Method</Text>
          <GlassCard>
            <TouchableOpacity style={styles.methodRow} onPress={() => { Haptics.selectionAsync(); setMethod('cod'); }}>
              <View style={[styles.radio, method === 'cod' && styles.radioActive]} />
              <View style={styles.methodInfo}>
                <Text style={styles.methodTitle}>Cash on Delivery</Text>
                <Text style={styles.methodSub}>Pay when you receive your order</Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.methodRow, { borderTopWidth: 1, borderTopColor: colors.glass.border }]} onPress={() => { Haptics.selectionAsync(); setMethod('card'); }}>
              <View style={[styles.radio, method === 'card' && styles.radioActive]} />
              <View style={styles.methodInfo}>
                <Text style={styles.methodTitle}>Credit / Debit Card</Text>
                <Text style={styles.methodSub}>Pay securely with Stripe</Text>
              </View>
            </TouchableOpacity>
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(150)}>
          <Text style={styles.sectionLabel}>Security</Text>
          <GlassCard padding="xs" noBorder>
            <MenuRow icon="lock-closed-outline" label="Secure Payments" subtitle="256-bit SSL encryption" showChevron={false} />
            <MenuRow icon="shield-outline" label="Data Protection" subtitle="GDPR & UAE PDPL compliant" showChevron={false} />
            <MenuRow icon="checkmark-circle-outline" label="PCI Compliant" subtitle="Card data never stored on device" showChevron={false} />
          </GlassCard>
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
  sectionLabel: { ...typography.label, color: colors.text.secondary, textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5, marginTop: spacing.xl, marginBottom: spacing.md },

  methodRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.lg },
  radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.glass.borderStrong, marginRight: spacing.md },
  radioActive: { borderColor: colors.gold[500], backgroundColor: colors.gold[500] },
  methodInfo: { flex: 1 },
  methodTitle: { ...typography.headline, fontSize: 15 },
  methodSub: { ...typography.caption1, color: colors.text.secondary, marginTop: 2 },
});
