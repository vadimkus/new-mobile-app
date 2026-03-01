import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../constants/theme';
import { useLocalization } from '../../contexts/LocalizationContext';

export default function PrivacyScreen() {
  const { t } = useLocalization();
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}><Ionicons name="arrow-back" size={22} color={colors.text.primary} /></TouchableOpacity>
        <Text style={styles.headerTitle}>{t('privacyPage.privacyPolicy')}</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.updated}>Last Updated: February 2026</Text>
        {[
          { title: '1. Information We Collect', body: 'We collect personal information you provide directly, including name, email, phone number, shipping addresses, and payment information. We also collect usage data, device information, and browsing behavior within the app.' },
          { title: '2. How We Use Your Information', body: 'Your information is used to process orders, provide customer support, personalize your shopping experience, send order updates and promotional communications (with your consent), and improve our services.' },
          { title: '3. Data Storage & Security', body: 'All data is stored on secure AWS servers in the ME-Central-1 (UAE) region. We employ 256-bit SSL encryption, and our systems are regularly audited for security compliance.' },
          { title: '4. Third-Party Sharing', body: 'We share your information only with payment processors (Stripe), delivery partners, and analytics services. We never sell your personal data to third parties.' },
          { title: '5. Your Rights', body: 'You have the right to access, correct, delete your personal data, opt out of marketing communications, and request data portability. Contact us at privacy@genosys.ae.' },
          { title: '6. UAE Compliance', body: 'This policy complies with UAE Federal Decree-Law No. 45/2021 on the Protection of Personal Data (PDPL) and TDRA regulations.' },
        ].map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionBody}>{section.body}</Text>
          </View>
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
  updated: { ...typography.caption1, color: colors.gold[500], marginBottom: spacing.xxl },
  section: { marginBottom: spacing.xxl },
  sectionTitle: { ...typography.headline, marginBottom: spacing.sm },
  sectionBody: { ...typography.bodySmall, color: colors.text.secondary, lineHeight: 22 },
});
