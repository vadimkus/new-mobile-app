import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, typography, spacing, radius } from '../../constants/theme';
import { useLocalization } from '../../contexts/LocalizationContext';
import GlassCard from '../../components/ui/GlassCard';

const INFO_ROWS = [
  { label: 'Company', value: 'Genosys Middle East FZ-LLC' },
  { label: 'Established', value: '2024' },
  { label: 'License', value: 'DMCC Free Zone' },
  { label: 'TRN', value: '104420519300003' },
  { label: 'Main Office', value: 'DMCC, JLT, Dubai' },
  { label: 'Distributor', value: 'Official GENOSYS Distributor' },
  { label: 'Certification', value: 'KFDA Approved' },
  { label: 'Products', value: '60+ Professional SKUs' },
];

export default function AboutScreen() {
  const { t } = useLocalization();
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}><Ionicons name="arrow-back" size={22} color={colors.text.primary} /></TouchableOpacity>
        <Text style={styles.headerTitle}>{t('aboutPage.aboutGenosys')}</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(500)} style={styles.heroSection}>
          <Text style={styles.heroName}>GENOSYS</Text>
          <Text style={styles.heroTagline}>Premium Skincare & Beauty</Text>
          <Text style={styles.heroFlag}>🇦🇪 United Arab Emirates</Text>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(150)}>
          <Text style={styles.sectionLabel}>{t('aboutPage.aboutUs')}</Text>
          <GlassCard>
            <Text style={styles.bodyText}>{t('aboutPage.aboutUsText')}</Text>
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(250)}>
          <Text style={styles.sectionLabel}>{t('aboutPage.ourMission')}</Text>
          <GlassCard>
            <Text style={styles.bodyText}>{t('aboutPage.ourMissionText')}</Text>
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(350)}>
          <Text style={styles.sectionLabel}>{t('aboutPage.companyInformation')}</Text>
          <GlassCard>
            {INFO_ROWS.map((row, i) => (
              <View key={row.label} style={[styles.infoRow, i > 0 && styles.infoBorder]}>
                <Text style={styles.infoLabel}>{row.label}</Text>
                <Text style={styles.infoValue}>{row.value}</Text>
              </View>
            ))}
          </GlassCard>
        </Animated.View>

        <Text style={styles.version}>© 2024-2026 Genosys Middle East FZ-LLC{'\n'}App Version 2.0.0</Text>
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

  heroSection: { alignItems: 'center', marginVertical: spacing.xxxl },
  heroName: { ...typography.display, letterSpacing: 6, fontSize: 30 },
  heroTagline: { ...typography.caption1, color: colors.gold[500], marginTop: spacing.xs },
  heroFlag: { ...typography.bodySmall, color: colors.text.secondary, marginTop: spacing.md },

  sectionLabel: { ...typography.label, color: colors.text.secondary, textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5, marginTop: spacing.xl, marginBottom: spacing.md },
  bodyText: { ...typography.body, color: colors.text.secondary, lineHeight: 24 },

  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing.md },
  infoBorder: { borderTopWidth: 1, borderTopColor: colors.glass.border },
  infoLabel: { ...typography.caption1, color: colors.text.secondary },
  infoValue: { ...typography.label, color: colors.text.primary, textAlign: 'right', flex: 1, marginLeft: spacing.lg },

  version: { ...typography.caption2, color: colors.text.muted, textAlign: 'center', marginTop: spacing.xxxl, lineHeight: 18 },
});
