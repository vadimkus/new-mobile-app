import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown, FadeIn, useSharedValue, useAnimatedStyle, withRepeat,
  withTiming, withSequence, Easing, useAnimatedSensor, SensorType,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, radius } from '../../constants/theme';
import GlassCard from '../../components/ui/GlassCard';
import { useAuth } from '../../contexts/AuthContext';
import { useLocalization } from '../../contexts/LocalizationContext';
import { fetchMembership, type MembershipData } from '../../services/api';

const { width: SW } = Dimensions.get('window');
const CARD_W = SW - 40;
const CARD_H = CARD_W * 0.62;

const TIER_COLORS: Record<string, { primary: string; secondary: string; accent: string }> = {
  MEMBER:   { primary: '#1A1A1A', secondary: '#2A2A2A', accent: '#888888' },
  SILVER:   { primary: '#1A1D22', secondary: '#2A2D32', accent: '#C0C0C0' },
  GOLD:     { primary: '#1A1710', secondary: '#2A2518', accent: '#C9A96E' },
  PLATINUM: { primary: '#14141A', secondary: '#20202A', accent: '#E8E8F0' },
};

const TIER_BENEFITS: Record<string, { icon: string; key: string; params?: any }[]> = {
  MEMBER: [
    { icon: 'gift-outline', key: 'membership.benefitBirthdayGift' },
  ],
  SILVER: [
    { icon: 'pricetag-outline', key: 'membership.benefitDiscount', params: { percent: '10' } },
    { icon: 'gift-outline', key: 'membership.benefitBirthdayGift' },
    { icon: 'flash-outline', key: 'membership.benefitEarlyAccess' },
  ],
  GOLD: [
    { icon: 'pricetag-outline', key: 'membership.benefitDiscount', params: { percent: '15' } },
    { icon: 'gift-outline', key: 'membership.benefitBirthdayGift' },
    { icon: 'flash-outline', key: 'membership.benefitEarlyAccess' },
    { icon: 'airplane-outline', key: 'membership.benefitFreeShipping' },
  ],
  PLATINUM: [
    { icon: 'pricetag-outline', key: 'membership.benefitDiscount', params: { percent: '20' } },
    { icon: 'gift-outline', key: 'membership.benefitBirthdayGift' },
    { icon: 'flash-outline', key: 'membership.benefitEarlyAccess' },
    { icon: 'airplane-outline', key: 'membership.benefitFreeShipping' },
    { icon: 'person-outline', key: 'membership.benefitPersonalConsultant' },
    { icon: 'diamond-outline', key: 'membership.benefitExclusiveProducts' },
  ],
};

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function tierLabel(tier: string, t: (k: string) => string): string {
  const map: Record<string, string> = {
    MEMBER: t('membership.tierMember'),
    SILVER: t('membership.tierSilver'),
    GOLD: t('membership.tierGold'),
    PLATINUM: t('membership.tierPlatinum'),
  };
  return map[tier] || tier;
}

// ─── Shimmer Effect ──────────────────────────────────────────────────────────

function CardShimmer({ accent }: { accent: string }) {
  const shimmer = useSharedValue(0);

  useEffect(() => {
    shimmer.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2500, easing: Easing.inOut(Easing.ease) }),
      ),
      -1, true,
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 0.5, 1], [0, 0.12, 0]),
    transform: [{ translateX: interpolate(shimmer.value, [0, 1], [-CARD_W, CARD_W]) }],
  }));

  return (
    <Animated.View style={[StyleSheet.absoluteFill, style, { overflow: 'hidden' }]} pointerEvents="none">
      <LinearGradient
        colors={['transparent', accent, 'transparent']}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={{ width: CARD_W * 0.6, height: CARD_H, opacity: 0.5 }}
      />
    </Animated.View>
  );
}

// ─── Main Screen ─────────────────────────────────────────────────────────────

export default function MembershipScreen() {
  const { user, token } = useAuth();
  const { t } = useLocalization();
  const [data, setData] = useState<MembershipData | null>(null);
  const [loading, setLoading] = useState(true);

  const sensor = useAnimatedSensor(SensorType.ROTATION, { interval: 40 });

  const tiltStyle = useAnimatedStyle(() => {
    const { pitch, roll } = sensor.sensor.value;
    return {
      transform: [
        { perspective: 800 },
        { rotateX: `${interpolate(pitch, [-0.15, 0.15], [4, -4])}deg` },
        { rotateY: `${interpolate(roll, [-0.15, 0.15], [-4, 4])}deg` },
      ],
    };
  });

  const loadData = useCallback(async () => {
    if (!token) { setLoading(false); return; }
    setLoading(true);
    const result = await fetchMembership(token);
    setData(result);
    setLoading(false);
  }, [token]);

  useEffect(() => { loadData(); }, [loadData]);

  const tier = data?.tier || 'MEMBER';
  const tc = TIER_COLORS[tier] || TIER_COLORS.MEMBER;
  const benefits = TIER_BENEFITS[tier] || TIER_BENEFITS.MEMBER;

  if (!user || !token) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <View style={s.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>{t('membership.title')}</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={s.center}>
          <Ionicons name="card-outline" size={48} color={colors.text.tertiary} />
          <Text style={s.emptyText}>{t('membership.loginRequired')}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <ScrollView style={s.scroll} contentContainerStyle={s.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(400)} style={s.headerRow}>
          <TouchableOpacity onPress={() => router.back()} style={s.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>{t('membership.title')}</Text>
          <View style={{ width: 40 }} />
        </Animated.View>

        {loading ? (
          <View style={s.center}>
            <ActivityIndicator size="large" color={colors.gold[500]} />
          </View>
        ) : (
          <>
            {/* ── The Card ──────────────────────────────────── */}
            <Animated.View entering={FadeInDown.duration(600).delay(100)} style={s.cardWrapper}>
              <Animated.View style={[s.card, tiltStyle]}>
                <LinearGradient
                  colors={[tc.primary, tc.secondary, tc.primary]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <CardShimmer accent={tc.accent} />

                {/* Top row: logo + tier */}
                <View style={s.cardTop}>
                  <Text style={s.logoText}>GENOSYS</Text>
                  <View style={[s.tierBadge, { borderColor: tc.accent }]}>
                    <Ionicons name="diamond" size={10} color={tc.accent} />
                    <Text style={[s.tierBadgeText, { color: tc.accent }]}>
                      {tierLabel(tier, t).toUpperCase()}
                    </Text>
                  </View>
                </View>

                {/* Member number */}
                <Text style={[s.memberNumber, { color: tc.accent }]}>
                  {data?.memberNumber || '—'}
                </Text>

                {/* Bottom row: name + since */}
                <View style={s.cardBottom}>
                  <View>
                    <Text style={s.cardLabel}>{t('membership.memberNumber')}</Text>
                    <Text style={s.cardName}>{data?.user?.name || user.name || '—'}</Text>
                  </View>
                  <View style={s.cardBottomRight}>
                    <Text style={s.cardLabel}>{t('membership.memberSince')}</Text>
                    <Text style={s.cardDate}>{formatDate(data?.memberSince)}</Text>
                  </View>
                </View>

                {/* Decorative lines */}
                <View style={[s.decorLine, { backgroundColor: tc.accent, top: CARD_H * 0.35 }]} />
              </Animated.View>
            </Animated.View>

            {/* ── Stats Row ──────────────────────────────────── */}
            <Animated.View entering={FadeInDown.duration(500).delay(250)} style={s.statsRow}>
              <StatBox label={t('membership.totalOrders')} value={String(data?.stats?.totalOrders || 0)} />
              <View style={s.statDivider} />
              <StatBox label={t('membership.totalSpent')} value={`${data?.stats?.totalSpent?.toLocaleString() || '0'} AED`} />
              <View style={s.statDivider} />
              <StatBox label={t('membership.loyaltyPoints')} value={String(data?.stats?.loyaltyPoints || 0)} />
            </Animated.View>

            {/* ── Tier Progress ──────────────────────────────── */}
            {data?.tierProgress?.nextTier && (
              <Animated.View entering={FadeInDown.duration(500).delay(350)}>
                <GlassCard intensity="light" padding="lg">
                  <Text style={s.sectionLabel}>{t('membership.tierProgress')}</Text>
                  <View style={s.progressRow}>
                    <Text style={s.progressTierCurrent}>{tierLabel(tier, t)}</Text>
                    <Text style={s.progressTierNext}>{tierLabel(data.tierProgress.nextTier, t)}</Text>
                  </View>
                  <View style={s.progressTrack}>
                    <Animated.View
                      entering={FadeIn.duration(800).delay(500)}
                      style={[s.progressFill, { width: `${data.tierProgress.progressPercent}%`, backgroundColor: tc.accent }]}
                    />
                  </View>
                  <Text style={s.progressPercent}>
                    {data.tierProgress.currentSpent.toLocaleString()} / {data.tierProgress.nextTierAt.toLocaleString()} AED
                  </Text>
                </GlassCard>
              </Animated.View>
            )}

            {tier === 'PLATINUM' && (
              <Animated.View entering={FadeInDown.duration(500).delay(350)}>
                <GlassCard intensity="light" padding="lg">
                  <View style={s.topTierRow}>
                    <Ionicons name="trophy" size={20} color={tc.accent} />
                    <Text style={[s.topTierText, { color: tc.accent }]}>{t('membership.topTier')}</Text>
                  </View>
                </GlassCard>
              </Animated.View>
            )}

            {/* ── Benefits ──────────────────────────────────── */}
            <Animated.View entering={FadeInDown.duration(500).delay(450)}>
              <Text style={s.benefitsTitle}>{t('membership.benefits')}</Text>
              <GlassCard intensity="light" padding="md" noBorder>
                {benefits.map((b, i) => (
                  <View key={i} style={[s.benefitRow, i < benefits.length - 1 && s.benefitBorder]}>
                    <View style={[s.benefitIcon, { backgroundColor: `${tc.accent}15` }]}>
                      <Ionicons name={b.icon as any} size={16} color={tc.accent} />
                    </View>
                    <Text style={s.benefitText}>
                      {b.params ? t(b.key).replace('{percent}', b.params.percent) : t(b.key)}
                    </Text>
                  </View>
                ))}
              </GlassCard>
            </Animated.View>

            <View style={{ height: 60 }} />
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <View style={s.statBox}>
      <Text style={s.statValue}>{value}</Text>
      <Text style={s.statLabel}>{label}</Text>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.bg.primary },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, paddingTop: 80 },
  emptyText: { ...typography.body, color: colors.text.secondary, textAlign: 'center' },

  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xl, paddingVertical: spacing.sm },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...typography.title2, letterSpacing: 1 },

  // Card
  cardWrapper: { alignItems: 'center', marginBottom: spacing.xxl },
  card: {
    width: CARD_W,
    height: CARD_H,
    borderRadius: 20,
    padding: 24,
    overflow: 'hidden',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.06)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.5,
    shadowRadius: 24,
    elevation: 16,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  logoText: { fontSize: 16, fontWeight: '300', letterSpacing: 6, color: 'rgba(255,255,255,0.6)' },
  tierBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderWidth: 1, borderRadius: radius.pill,
    paddingHorizontal: 10, paddingVertical: 3,
  },
  tierBadgeText: { fontSize: 9, fontWeight: '800', letterSpacing: 1.5 },

  memberNumber: { fontSize: 18, fontWeight: '300', letterSpacing: 4, textAlign: 'center', marginVertical: 4 },

  cardBottom: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  cardBottomRight: { alignItems: 'flex-end' },
  cardLabel: { fontSize: 8, fontWeight: '600', letterSpacing: 1.5, color: 'rgba(255,255,255,0.35)', textTransform: 'uppercase', marginBottom: 2 },
  cardName: { fontSize: 14, fontWeight: '500', letterSpacing: 1, color: 'rgba(255,255,255,0.85)' },
  cardDate: { fontSize: 12, fontWeight: '400', color: 'rgba(255,255,255,0.6)' },

  decorLine: { position: 'absolute', left: 24, right: 24, height: StyleSheet.hairlineWidth, opacity: 0.15 },

  // Stats
  statsRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: colors.bg.surface, borderRadius: radius.lg,
    borderWidth: 1, borderColor: colors.glass.border,
    paddingVertical: spacing.lg, marginBottom: spacing.xxl,
  },
  statBox: { flex: 1, alignItems: 'center' },
  statValue: { ...typography.headline, fontSize: 16, color: colors.text.primary },
  statLabel: { ...typography.caption2, color: colors.text.secondary, marginTop: 2, fontSize: 10, textTransform: 'uppercase', letterSpacing: 0.5 },
  statDivider: { width: 1, height: 32, backgroundColor: colors.glass.border },

  // Progress
  sectionLabel: { ...typography.label, color: colors.text.secondary, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', marginBottom: spacing.md },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  progressTierCurrent: { ...typography.caption1, color: colors.text.primary, fontWeight: '700' },
  progressTierNext: { ...typography.caption1, color: colors.text.secondary },
  progressTrack: { height: 4, backgroundColor: 'rgba(255,255,255,0.08)', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: 4, borderRadius: 2 },
  progressPercent: { ...typography.caption2, color: colors.text.tertiary, marginTop: 6, textAlign: 'right' },

  topTierRow: { flexDirection: 'row', alignItems: 'center', gap: 8, justifyContent: 'center' },
  topTierText: { ...typography.headline, fontSize: 14, letterSpacing: 1 },

  // Benefits
  benefitsTitle: { ...typography.label, color: colors.text.secondary, fontSize: 10, letterSpacing: 1, textTransform: 'uppercase', marginTop: spacing.xl, marginBottom: spacing.md, marginLeft: spacing.xs },
  benefitRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 12 },
  benefitBorder: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.glass.border },
  benefitIcon: { width: 32, height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  benefitText: { ...typography.body, color: colors.text.primary, flex: 1, fontSize: 14 },
});
