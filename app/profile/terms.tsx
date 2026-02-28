import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing } from '../../constants/theme';

export default function TermsScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}><Ionicons name="arrow-back" size={22} color={colors.text.primary} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Terms & Conditions</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.updated}>Last Updated: February 2026</Text>
        {[
          { title: '1. Agreement to Terms', body: 'By accessing and using the GENOSYS mobile application, you agree to be bound by these Terms and Conditions. If you disagree with any part of these terms, you may not access the application.' },
          { title: '2. Use License', body: 'Permission is granted to temporarily use the GENOSYS app for personal, non-commercial purposes. This license does not include modifying, copying, or distributing the app content.' },
          { title: '3. Account Terms', body: 'You must provide accurate and complete information when creating an account. You are responsible for safeguarding your password and for all activities that occur under your account.' },
          { title: '4. Products & Pricing', body: 'All prices are listed in AED and include VAT. We reserve the right to modify prices at any time. Product availability is subject to stock levels.' },
          { title: '5. Orders & Payment', body: 'Orders are confirmed upon payment receipt. We accept Cash on Delivery, credit/debit cards, and Apple Pay. Card payments are processed securely through Stripe.' },
          { title: '6. Shipping & Delivery', body: 'Free delivery within Dubai for orders above 200 AED. Delivery within 1-2 business days in Dubai, 2-4 business days for other emirates.' },
          { title: '7. Returns & Refunds', body: 'Returns accepted within 14 days for unopened products in original packaging. Refunds processed within 5-7 business days to the original payment method.' },
          { title: '8. Governing Law', body: 'These terms shall be governed by the laws of the United Arab Emirates. Any disputes shall be subject to the exclusive jurisdiction of the courts of Dubai.' },
        ].map((section) => (
          <View key={section.title} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionBody}>{section.body}</Text>
          </View>
        ))}
        <Text style={styles.contact}>For questions about these terms, contact us at legal@genosys.ae</Text>
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
  contact: { ...typography.caption1, color: colors.gold[500], textAlign: 'center', marginTop: spacing.xl },
});
