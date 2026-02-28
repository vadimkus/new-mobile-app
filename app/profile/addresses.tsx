import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, typography, spacing, radius } from '../../constants/theme';
import GlassCard from '../../components/ui/GlassCard';
import GoldButton from '../../components/ui/GoldButton';

const DEMO_ADDRESSES = [
  { id: '1', type: 'Home', name: 'Vadim Kus', address: 'Dubai Marina, Tower 5, Apt 1204', emirate: 'Dubai', phone: '+971 50 123 4567', isDefault: true },
  { id: '2', type: 'Work', name: 'Vadim Kus', address: 'DIFC, Gate Building, Office 302', emirate: 'Dubai', phone: '+971 50 123 4567', isDefault: false },
];

export default function AddressesScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Addresses</Text>
        <TouchableOpacity style={styles.navBtn}>
          <Ionicons name="add" size={24} color={colors.gold[500]} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {DEMO_ADDRESSES.map((addr, i) => (
          <Animated.View key={addr.id} entering={FadeInDown.duration(400).delay(i * 100)}>
            <GlassCard>
              <View style={styles.addrHeader}>
                <View style={styles.typeRow}>
                  <Ionicons name={addr.type === 'Home' ? 'home-outline' : 'business-outline'} size={16} color={colors.gold[500]} />
                  <Text style={styles.typeLabel}>{addr.type}</Text>
                  {addr.isDefault && (
                    <View style={styles.defaultBadge}><Text style={styles.defaultText}>Default</Text></View>
                  )}
                </View>
                <TouchableOpacity><Ionicons name="ellipsis-horizontal" size={18} color={colors.text.secondary} /></TouchableOpacity>
              </View>
              <Text style={styles.addrName}>{addr.name}</Text>
              <Text style={styles.addrLine}>{addr.address}</Text>
              <Text style={styles.addrLine}>{addr.emirate}, UAE</Text>
              <Text style={styles.addrLine}>{addr.phone}</Text>
            </GlassCard>
          </Animated.View>
        ))}

        <Animated.View entering={FadeInDown.duration(400).delay(250)}>
          <GoldButton title="Add New Address +" onPress={() => {}} variant="outline" fullWidth />
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
  content: { paddingHorizontal: 20, gap: spacing.md },

  addrHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  typeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  typeLabel: { ...typography.label, color: colors.gold[500] },
  defaultBadge: { backgroundColor: 'rgba(52,199,89,0.15)', paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.pill },
  defaultText: { ...typography.caption2, color: colors.status.success, fontWeight: '700', fontSize: 10 },
  addrName: { ...typography.headline, marginBottom: spacing.xs, fontSize: 15 },
  addrLine: { ...typography.caption1, color: colors.text.secondary, marginBottom: 2 },
});
