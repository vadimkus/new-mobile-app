import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, typography, spacing, radius } from '../../constants/theme';
import GlassCard from '../../components/ui/GlassCard';

export default function PromoScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}><Ionicons name="arrow-back" size={22} color={colors.text.primary} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Promotions</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(500)}>
          <GlassCard intensity="medium">
            <View style={styles.promoIcon}>
              <Ionicons name="megaphone-outline" size={28} color={colors.gold[500]} />
            </View>
            <Text style={styles.promoTitle}>Current Promotions</Text>
            <Text style={styles.promoSub}>Special offers and exclusive deals</Text>
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(150)}>
          <GlassCard>
            <View style={styles.dealHeader}>
              <Text style={styles.dealTag}>RAMADAN SPECIAL</Text>
            </View>
            <Text style={styles.dealTitle}>Buy 3 Get 1 Free</Text>
            <Text style={styles.dealBody}>Purchase any 3 GENOSYS products and receive a complimentary Micro Retinol Cream (30ml). Valid during Ramadan 2026.</Text>
            <Text style={styles.dealExpiry}>Expires: March 31, 2026</Text>
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(250)}>
          <GlassCard>
            <View style={styles.dealHeader}>
              <Text style={styles.dealTag}>VIP EXCLUSIVE</Text>
            </View>
            <Text style={styles.dealTitle}>15% VIP Discount</Text>
            <Text style={styles.dealBody}>As a valued VIP member, enjoy 15% off all orders automatically applied at checkout. Stack with bundle discounts!</Text>
            <Text style={styles.dealExpiry}>No expiry</Text>
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
  content: { paddingHorizontal: 20, gap: spacing.lg },

  promoIcon: { alignSelf: 'center', marginBottom: spacing.md },
  promoTitle: { ...typography.title2, textAlign: 'center' },
  promoSub: { ...typography.caption1, color: colors.text.secondary, textAlign: 'center', marginTop: spacing.xs },

  dealHeader: { marginBottom: spacing.md },
  dealTag: { ...typography.caption2, color: colors.gold[500], fontWeight: '800', letterSpacing: 1, fontSize: 10 },
  dealTitle: { ...typography.headline, fontSize: 18, marginBottom: spacing.sm },
  dealBody: { ...typography.bodySmall, color: colors.text.secondary, lineHeight: 22 },
  dealExpiry: { ...typography.caption2, color: colors.text.tertiary, marginTop: spacing.md },
});
