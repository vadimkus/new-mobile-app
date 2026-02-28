import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { colors, typography, spacing, radius, layout } from '../../constants/theme';
import { DEMO_PRODUCTS, DEMO_SKIN_CONCERNS } from '../../constants/mockData';
import { useLocalization } from '../../contexts/LocalizationContext';
import GlassCard from '../../components/ui/GlassCard';
import GoldButton from '../../components/ui/GoldButton';
import SectionHeader from '../../components/ui/SectionHeader';
import SkinScoreRing from '../../components/skin/SkinScoreRing';
import FaceMap from '../../components/skin/FaceMap';

const PROGRESS_HISTORY = [
  { month: 'Dec 2025', score: 66 },
  { month: 'Jan 2026', score: 72 },
  { month: 'Feb 2026', score: 78 },
];

const RECOMMENDED = [
  { id: '2', name: 'Intensive Peptide Serum', match: 94, imageUrl: DEMO_PRODUCTS[1].imageUrl },
  { id: '3', name: 'Micro Retinol Cream', match: 87, imageUrl: DEMO_PRODUCTS[2].imageUrl },
];

export default function SkinAIScreen() {
  const { t } = useLocalization();
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(600)}>
          <Text style={styles.pageTitle}>{t('skinAi.title')}</Text>
          <Text style={styles.pageSubtitle}>{t('skinAi.subtitle')}</Text>
        </Animated.View>

        {/* Score Card */}
        <Animated.View entering={FadeInDown.duration(600).delay(150)}>
          <GlassCard intensity="medium" padding="xl">
            <View style={styles.scoreContainer}>
              <SkinScoreRing score={78} />
            </View>
            <View style={styles.scoreChange}>
              <Ionicons name="arrow-up" size={14} color={colors.status.success} />
              <Text style={styles.scoreChangeText}>{t('skinAi.scoreImprovement', { points: 12 })}</Text>
            </View>
            <Text style={styles.scoreMessage}>
              {t('skinAi.keepUpRoutine')}
            </Text>
          </GlassCard>
        </Animated.View>

        {/* Face Map */}
        <Animated.View entering={FadeInDown.duration(600).delay(300)} style={styles.section}>
          <SectionHeader title={t('skinAi.concernMap')} />
          <GlassCard padding="md">
            <FaceMap concerns={DEMO_SKIN_CONCERNS} />
          </GlassCard>
        </Animated.View>

        {/* Progress History */}
        <Animated.View entering={FadeInDown.duration(600).delay(450)} style={styles.section}>
          <SectionHeader title={t('skinAi.progress')} actionLabel={t('skinAi.seeAll')} onAction={() => {}} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.historyRow}>
              {PROGRESS_HISTORY.map((item, index) => {
                const isCurrent = index === PROGRESS_HISTORY.length - 1;
                return (
                  <Animated.View
                    key={item.month}
                    entering={FadeInRight.duration(400).delay(500 + index * 100)}
                  >
                    <View
                      style={[
                        styles.historyCard,
                        isCurrent && styles.historyCardActive,
                      ]}
                    >
                      <Text style={styles.historyMonth}>{item.month}</Text>
                      <Text style={[styles.historyScore, isCurrent && styles.historyScoreActive]}>
                        {item.score}
                      </Text>
                    </View>
                  </Animated.View>
                );
              })}
            </View>
          </ScrollView>
        </Animated.View>

        {/* Recommended Products */}
        <Animated.View entering={FadeInDown.duration(600).delay(600)} style={styles.section}>
          <SectionHeader title={t('skinAi.recommendedForYou')} />
          {RECOMMENDED.map((product) => (
            <TouchableOpacity key={product.id} activeOpacity={0.8}>
              <View style={styles.recommendCard}>
                <Image
                  source={{ uri: product.imageUrl }}
                  style={styles.recommendImage}
                  contentFit="contain"
                />
                <View style={styles.recommendInfo}>
                  <Text style={styles.recommendName}>{product.name}</Text>
                  <Text style={styles.recommendSub}>{t('skinAi.basedOnProfile')}</Text>
                </View>
                <View style={styles.matchBadge}>
                  <Text style={styles.matchText}>{t('skinAi.matchPercent', { match: product.match })}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </Animated.View>

        {/* Scan button */}
        <Animated.View entering={FadeInDown.duration(500).delay(750)} style={styles.section}>
          <GoldButton
            title={t('skinAi.takeNewScan')}
            onPress={() => {}}
            fullWidth
            size="lg"
            icon={<Ionicons name="camera-outline" size={20} color={colors.text.inverse} />}
          />
        </Animated.View>

        <View style={{ height: layout.tabBarHeight + 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: layout.screenPadding,
  },

  pageTitle: {
    ...typography.display,
    marginTop: spacing.md,
  },
  pageSubtitle: {
    ...typography.bodySmall,
    color: colors.gold[500],
    marginTop: spacing.xs,
    marginBottom: spacing.xl,
  },

  section: {
    marginTop: spacing.xxl,
  },

  scoreContainer: {
    alignItems: 'center',
    paddingVertical: spacing.lg,
  },
  scoreChange: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    marginTop: spacing.md,
  },
  scoreChangeText: {
    ...typography.label,
    color: colors.status.success,
  },
  scoreMessage: {
    ...typography.caption1,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },

  historyRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  historyCard: {
    width: 100,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.md,
    backgroundColor: colors.bg.surface,
    borderRadius: radius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  historyCardActive: {
    borderColor: colors.gold[500],
    shadowColor: colors.gold[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  historyMonth: {
    ...typography.caption2,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  historyScore: {
    ...typography.title1,
    color: colors.text.primary,
  },
  historyScoreActive: {
    color: colors.gold[500],
  },

  recommendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  recommendImage: {
    width: 44,
    height: 44,
    borderRadius: radius.sm,
    marginRight: spacing.md,
  },
  recommendInfo: {
    flex: 1,
  },
  recommendName: {
    ...typography.headline,
    fontSize: 15,
  },
  recommendSub: {
    ...typography.caption1,
    color: colors.text.secondary,
    marginTop: 2,
  },
  matchBadge: {
    backgroundColor: colors.gold[500],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
  },
  matchText: {
    ...typography.caption2,
    color: colors.text.inverse,
    fontWeight: '700',
    fontSize: 11,
  },
});
