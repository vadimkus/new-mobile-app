import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, radius } from '../../constants/theme';
import { useLocalization } from '../../contexts/LocalizationContext';
import GlassCard from '../../components/ui/GlassCard';

const FAQ = [
  { q: 'How long does delivery take?', a: 'Delivery within Dubai takes 1-2 business days. Other emirates 2-4 business days.' },
  { q: 'What is your return policy?', a: 'We accept returns within 14 days of delivery for unopened products in original packaging.' },
  { q: 'Do you ship internationally?', a: 'Currently we ship within the UAE only. International shipping coming soon.' },
  { q: 'Are products authentic?', a: 'Yes, we are the official authorized distributor of GENOSYS in the UAE. All products are 100% authentic.' },
  { q: 'How do I track my order?', a: 'Go to Orders in your profile to see real-time tracking for all your orders.' },
  { q: 'What payment methods do you accept?', a: 'We accept Credit/Debit cards (Visa, Mastercard), Apple Pay, and Cash on Delivery.' },
];

export default function HelpScreen() {
  const { t } = useLocalization();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}><Ionicons name="arrow-back" size={22} color={colors.text.primary} /></TouchableOpacity>
        <Text style={styles.headerTitle}>{t('profile.helpAndSupport')}</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(500)}>
          <Text style={styles.sectionLabel}>{t('helpPage.contactSupport')}</Text>
          <View style={styles.supportRow}>
            <TouchableOpacity style={styles.supportCard} onPress={() => Linking.openURL('mailto:info@genosys.ae')}>
              <Ionicons name="mail-outline" size={22} color={colors.gold[500]} />
              <Text style={styles.supportLabel}>{t('helpPage.email')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.supportCard} onPress={() => Linking.openURL('tel:+971501234567')}>
              <Ionicons name="call-outline" size={22} color={colors.gold[500]} />
              <Text style={styles.supportLabel}>{t('helpPage.phone')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.supportCard} onPress={() => Linking.openURL('https://wa.me/971501234567')}>
              <Ionicons name="logo-whatsapp" size={22} color="#25D366" />
              <Text style={styles.supportLabel}>{t('helpPage.whatsApp')}</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(150)}>
          <Text style={styles.sectionLabel}>{t('helpPage.faq')}</Text>
          {FAQ.map((faq, i) => (
            <TouchableOpacity
              key={i}
              style={styles.faqItem}
              onPress={() => { Haptics.selectionAsync(); setExpandedIndex(expandedIndex === i ? null : i); }}
              activeOpacity={0.8}
            >
              <View style={styles.faqHeader}>
                <Text style={styles.faqQuestion}>{faq.q}</Text>
                <Ionicons name={expandedIndex === i ? 'chevron-up' : 'chevron-down'} size={18} color={colors.text.secondary} />
              </View>
              {expandedIndex === i && <Text style={styles.faqAnswer}>{faq.a}</Text>}
            </TouchableOpacity>
          ))}
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(300)}>
          <Text style={styles.sectionLabel}>{t('helpPage.businessHours')}</Text>
          <GlassCard>
            <Text style={styles.hoursText}>Sunday - Thursday: 9:00 AM - 6:00 PM</Text>
            <Text style={styles.hoursText}>Friday - Saturday: Closed</Text>
            <Text style={[styles.hoursText, { color: colors.text.tertiary, marginTop: spacing.sm }]}>UAE Time (GMT+4)</Text>
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

  supportRow: { flexDirection: 'row', gap: spacing.md },
  supportCard: { flex: 1, backgroundColor: colors.bg.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.glass.border, paddingVertical: spacing.lg, alignItems: 'center', gap: spacing.sm },
  supportLabel: { ...typography.label, color: colors.text.primary, fontSize: 12 },

  faqItem: { backgroundColor: colors.bg.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.glass.border, padding: spacing.lg, marginBottom: spacing.sm },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQuestion: { ...typography.headline, fontSize: 14, flex: 1, marginRight: spacing.sm },
  faqAnswer: { ...typography.bodySmall, color: colors.text.secondary, marginTop: spacing.md, lineHeight: 22 },

  hoursText: { ...typography.bodySmall, color: colors.text.secondary, marginBottom: 4 },
});
