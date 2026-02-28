import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, radius } from '../../constants/theme';

type IconName = React.ComponentProps<typeof Ionicons>['name'];
const CONTACTS: { icon: IconName; label: string; value: string; color: string; url: string }[] = [
  { icon: 'logo-whatsapp', label: 'WhatsApp', value: '+971 50 123 4567', color: '#25D366', url: 'https://wa.me/971501234567' },
  { icon: 'call-outline', label: 'Phone', value: '+971 50 123 4567', color: '#5AC8FA', url: 'tel:+971501234567' },
  { icon: 'mail-outline', label: 'Email', value: 'info@genosys.ae', color: colors.gold[500], url: 'mailto:info@genosys.ae' },
  { icon: 'globe-outline', label: 'Website', value: 'genosys.ae', color: colors.gold[400], url: 'https://genosys.ae' },
  { icon: 'logo-instagram', label: 'Instagram', value: '@genosys.ae', color: '#E4405F', url: 'https://instagram.com/genosys.ae' },
  { icon: 'location-outline', label: 'Visit Us', value: 'DMCC, JLT, Dubai', color: '#FF6B6B', url: 'https://maps.google.com' },
];

export default function ContactScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}><Ionicons name="arrow-back" size={22} color={colors.text.primary} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Contact Us</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(500)} style={styles.hero}>
          <Text style={styles.heroName}>GENOSYS</Text>
          <Text style={styles.heroSub}>🇦🇪 Premium Skincare & Beauty</Text>
        </Animated.View>

        {CONTACTS.map((c, i) => (
          <Animated.View key={c.label} entering={FadeInDown.duration(400).delay(100 + i * 80)}>
            <TouchableOpacity
              style={styles.contactCard}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); Linking.openURL(c.url); }}
              activeOpacity={0.8}
            >
              <View style={[styles.iconBox, { backgroundColor: `${c.color}15` }]}>
                <Ionicons name={c.icon} size={20} color={c.color} />
              </View>
              <View style={styles.contactInfo}>
                <Text style={styles.contactLabel}>{c.label}</Text>
                <Text style={styles.contactValue}>{c.value}</Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={colors.text.muted} />
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
  content: { paddingHorizontal: 20 },

  hero: { alignItems: 'center', marginVertical: spacing.xxl },
  heroName: { ...typography.title1, letterSpacing: 4 },
  heroSub: { ...typography.caption1, color: colors.text.secondary, marginTop: spacing.xs },

  contactCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bg.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.glass.border },
  iconBox: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginRight: spacing.md },
  contactInfo: { flex: 1 },
  contactLabel: { ...typography.headline, fontSize: 15 },
  contactValue: { ...typography.caption1, color: colors.text.secondary, marginTop: 2 },
});
