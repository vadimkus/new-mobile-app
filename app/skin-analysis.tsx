import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, typography, spacing, radius, shadows, layout } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useLocalization } from '../contexts/LocalizationContext';
import { fetchSkinRecommendations } from '../services/api';
import AUTH_CONFIG from '../config/auth';

const ASSET_ORIGIN = AUTH_CONFIG.ASSET_ORIGIN || 'https://genosys.ae';
const TOTAL_STEPS = 4;

const SKIN_TYPES = ['Normal', 'Dry', 'Oily', 'Combination', 'Sensitive'] as const;
const AGE_GROUPS = ['Under 25', '25-35', '35-45', '45-55', '55+'] as const;
const CONCERNS = ['Acne', 'Wrinkles', 'Dark Spots', 'Dryness', 'Sensitivity', 'Pores', 'Redness', 'Dullness'] as const;
const USAGE_OPTIONS = ['Professional', 'At-Home', 'Both'] as const;

const SKIN_TYPE_ICONS: Record<string, any> = {
  Normal: 'happy-outline', Dry: 'water-outline', Oily: 'sunny-outline',
  Combination: 'contrast-outline', Sensitive: 'heart-outline',
};
const CONCERN_ICONS: Record<string, any> = {
  Acne: 'alert-circle-outline', Wrinkles: 'resize-outline', 'Dark Spots': 'ellipse-outline',
  Dryness: 'water-outline', Sensitivity: 'shield-outline', Pores: 'scan-outline',
  Redness: 'flame-outline', Dullness: 'moon-outline',
};
const USAGE_ICONS: Record<string, any> = {
  Professional: 'medkit-outline', 'At-Home': 'home-outline', Both: 'layers-outline',
};

export default function SkinAnalysisScreen() {
  const { user } = useAuth();
  const { addItem } = useCart();
  const { t } = useLocalization();

  const [step, setStep] = useState(0); // 0 = landing, 1-4 = quiz, 5 = results
  const [skinType, setSkinType] = useState('');
  const [ageGroup, setAgeGroup] = useState('');
  const [selectedConcerns, setSelectedConcerns] = useState<string[]>([]);
  const [usage, setUsage] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [addedProducts, setAddedProducts] = useState<Set<string>>(new Set());

  const progress = step > 0 && step <= TOTAL_STEPS ? step / TOTAL_STEPS : 0;

  const canProceed = () => {
    if (step === 1) return !!skinType;
    if (step === 2) return !!ageGroup;
    if (step === 3) return selectedConcerns.length > 0;
    if (step === 4) return !!usage;
    return false;
  };

  const handleNext = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
    } else if (step === TOTAL_STEPS) {
      setLoading(true);
      setApiError(null);
      setStep(5);
      try {
        const data = await fetchSkinRecommendations({
          skinType,
          ageGroup,
          targetConcerns: selectedConcerns.join(','),
        });
        const mapped = (Array.isArray(data) ? data : []).map((p: any) => ({
          product: p,
          score: p.score || 0,
        }));
        setResults(mapped);
      } catch (err: any) {
        setApiError(err?.message || 'Unknown error');
        setResults([]);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else if (step === 1) setStep(0);
    else router.back();
  };

  const handleReset = () => {
    setSkinType('');
    setAgeGroup('');
    setSelectedConcerns([]);
    setUsage('');
    setResults([]);
    setApiError(null);
    setStep(0);
  };

  const toggleConcern = (c: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedConcerns((prev) =>
      prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c],
    );
  };

  const handleAddToBag = (product: any) => {
    if (!product || addedProducts.has(String(product.id)) || product.isPriceOnRequest) return;
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addItem({
      id: String(product.id),
      name: product.name || '',
      price: product.displayPrice ?? product.price ?? 0,
      currency: 'AED',
      imageUrl: product.image || product.imageUrl || '',
    });
    setAddedProducts((prev) => new Set([...prev, String(product.id)]));
    setTimeout(() => {
      setAddedProducts((prev) => { const n = new Set(prev); n.delete(String(product.id)); return n; });
    }, 2000);
  };

  // ─── Landing ──────────────────────────────────────────────────────────────────
  if (step === 0) {
    return (
      <SafeAreaView style={s.safeArea} edges={['top']}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => router.back()} style={s.navBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>{t('skinAnalysis.title')}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView contentContainerStyle={s.landingContent} showsVerticalScrollIndicator={false}>
          <Animated.View entering={FadeInDown.duration(600)} style={s.landingCenter}>
            <LinearGradient
              colors={['rgba(201,169,110,0.18)', 'rgba(201,169,110,0.04)']}
              style={s.landingIconBg}
            >
              <Ionicons name="sparkles" size={48} color={colors.gold[500]} />
            </LinearGradient>
            <Text style={s.landingTitle}>{t('skinAnalysis.title')}</Text>
            <Text style={s.landingSub}>
              {t('skinAnalysis.subtitle')}
            </Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(500).delay(150)} style={{ width: '100%' }}>
            <TouchableOpacity
              style={s.primaryBtn}
              onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); setStep(1); }}
              activeOpacity={0.85}
            >
              <LinearGradient
                colors={[colors.gold[500], colors.gold[400]]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={s.primaryBtnGradient}
              >
                <Ionicons name="clipboard-outline" size={20} color={colors.text.inverse} />
                <Text style={s.primaryBtnText}>{t('skinAnalysis.startQuiz')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(500).delay(250)} style={{ width: '100%' }}>
            <TouchableOpacity
              style={s.secondaryBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                // Camera analysis will be available in a future update
              }}
              activeOpacity={0.85}
            >
              <Ionicons name="camera-outline" size={20} color={colors.gold[500]} />
              <Text style={s.secondaryBtnText}>{t('skinAnalysis.startCamera')}</Text>
              <View style={s.comingSoonBadge}>
                <Text style={s.comingSoonText}>{t('skinAi.soon')}</Text>
              </View>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── Results ──────────────────────────────────────────────────────────────────
  if (step === 5) {
    return (
      <SafeAreaView style={s.safeArea} edges={['top']}>
        <View style={s.header}>
          <TouchableOpacity onPress={handleReset} style={s.navBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={s.headerTitle}>{t('skinAnalysis.yourResults')}</Text>
          <View style={{ width: 40 }} />
        </View>

        {loading ? (
          <View style={s.loadingContainer}>
            <ActivityIndicator size="large" color={colors.gold[500]} />
            <Text style={s.loadingText}>{t('skinAnalysis.analyzing')}</Text>
          </View>
        ) : (
          <ScrollView contentContainerStyle={s.resultsContent} showsVerticalScrollIndicator={false}>
            {/* Profile Summary */}
            <Animated.View entering={FadeInDown.duration(500)}>
              <LinearGradient
                colors={['rgba(201,169,110,0.12)', 'rgba(201,169,110,0.03)']}
                style={s.profileSummary}
              >
                <View style={s.profileRow}>
                  <Text style={s.profileLabel}>{t('skinAnalysis.skinType')}</Text>
                  <Text style={s.profileValue}>{skinType}</Text>
                </View>
                <View style={s.profileRow}>
                  <Text style={s.profileLabel}>{t('skinAnalysis.ageGroup')}</Text>
                  <Text style={s.profileValue}>{ageGroup}</Text>
                </View>
                <View style={s.profileRow}>
                  <Text style={s.profileLabel}>{t('skinAnalysis.concerns')}</Text>
                  <Text style={s.profileValue}>{selectedConcerns.join(', ')}</Text>
                </View>
                <View style={s.profileRow}>
                  <Text style={s.profileLabel}>{t('skinAnalysis.usage')}</Text>
                  <Text style={s.profileValue}>{usage}</Text>
                </View>
              </LinearGradient>
            </Animated.View>

            {/* Recommendations */}
            <Animated.View entering={FadeInDown.duration(500).delay(150)}>
              <Text style={s.resultsSection}>{t('skinAnalysis.recommendedProducts')}</Text>
            </Animated.View>

            {apiError ? (
              <Animated.View entering={FadeInDown.duration(400).delay(200)} style={s.errorBox}>
                <Ionicons name="cloud-offline-outline" size={28} color={colors.status.error} />
                <Text style={s.errorText}>{t('skinAnalysis.noResults')}</Text>
                <TouchableOpacity style={s.retryBtn} onPress={handleReset} activeOpacity={0.85}>
                  <Ionicons name="refresh" size={16} color={colors.text.inverse} />
                  <Text style={s.retryBtnText}>{t('skinAnalysis.tryAgain')}</Text>
                </TouchableOpacity>
              </Animated.View>
            ) : results.length === 0 ? (
              <Text style={s.noResults}>{t('skinAnalysis.noResults')}</Text>
            ) : (
              results.map(({ product }: any, idx: number) => {
                const name = product.name || '';
                const price = product.displayPrice ?? product.price ?? 0;
                const rawImg = product.image || '';
                const imageUri = rawImg
                  ? rawImg.startsWith('http') ? rawImg : `${ASSET_ORIGIN}${rawImg}`
                  : null;
                const isAdded = addedProducts.has(String(product.id));

                return (
                  <Animated.View
                    key={`rec-${product.id || idx}`}
                    entering={FadeInDown.duration(400).delay(250 + idx * 60)}
                  >
                    <TouchableOpacity
                      style={s.recCard}
                      onPress={() => router.push(`/product/${product.id}`)}
                      activeOpacity={0.8}
                    >
                      {imageUri ? (
                        <Image source={{ uri: imageUri }} style={s.recImage} contentFit="cover" />
                      ) : (
                        <View style={[s.recImage, { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg.elevated }]}>
                          <Ionicons name="leaf-outline" size={22} color={colors.text.muted} />
                        </View>
                      )}
                      <View style={s.recInfo}>
                        <Text style={s.recName} numberOfLines={2}>{name}</Text>
                        {product.isPriceOnRequest ? (
                          <Text style={s.recPriceOnRequest}>{t('product.priceOnRequest')}</Text>
                        ) : (
                          <Text style={s.recPrice}>{Number(price).toFixed(2)} AED</Text>
                        )}
                        <View style={s.recActions}>
                          {!product.isPriceOnRequest && (
                            <TouchableOpacity
                              style={[s.recAddBtn, isAdded && s.recAddBtnDone]}
                              onPress={(e) => { e.stopPropagation(); handleAddToBag(product); }}
                              disabled={isAdded}
                              activeOpacity={0.8}
                            >
                              <Ionicons
                                name={isAdded ? 'checkmark' : 'bag-add-outline'}
                                size={14}
                                color={colors.text.inverse}
                              />
                              <Text style={s.recAddText}>{isAdded ? t('favorites.added') : t('common.addToBag')}</Text>
                            </TouchableOpacity>
                          )}
                          <TouchableOpacity style={s.recViewBtn} onPress={() => router.push(`/product/${product.id}`)} activeOpacity={0.8}>
                            <Text style={s.recViewText}>{t('discover.view')}</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </Animated.View>
                );
              })
            )}

            {/* Reset */}
            <Animated.View entering={FadeInDown.duration(400).delay(500)}>
              <TouchableOpacity style={s.resetBtn} onPress={handleReset} activeOpacity={0.85}>
                <Ionicons name="refresh" size={18} color={colors.gold[500]} />
                <Text style={s.resetBtnText}>{t('skinAnalysis.tryAgain')}</Text>
              </TouchableOpacity>
            </Animated.View>

            <View style={{ height: 40 }} />
          </ScrollView>
        )}
      </SafeAreaView>
    );
  }

  // ─── Quiz Steps 1-4 ──────────────────────────────────────────────────────────
  const stepTitles = [
    '',
    t('skinAnalysis.selectSkinType'),
    t('skinAnalysis.selectAgeGroup'),
    t('skinAnalysis.selectConcerns'),
    t('skinAnalysis.selectUsage'),
  ];

  return (
    <SafeAreaView style={s.safeArea} edges={['top']}>
      <View style={s.header}>
        <TouchableOpacity onPress={handleBack} style={s.navBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={s.headerTitle}>{t('skinAnalysis.step', { current: step, total: TOTAL_STEPS })}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Progress bar */}
      <View style={s.progressBar}>
        <Animated.View style={[s.progressFill, { width: `${progress * 100}%` }]} />
      </View>

      <ScrollView contentContainerStyle={s.stepContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(400)}>
          <Text style={s.stepTitle}>{stepTitles[step]}</Text>
        </Animated.View>

        {/* Step 1: Skin Type */}
        {step === 1 && (
          <View style={s.optionsGrid}>
            {SKIN_TYPES.map((type) => (
              <Animated.View key={type} entering={FadeInUp.duration(300)}>
                <TouchableOpacity
                  style={[s.optionCard, skinType === type && s.optionCardActive]}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setSkinType(type); }}
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name={SKIN_TYPE_ICONS[type] || 'ellipse-outline'}
                    size={26}
                    color={skinType === type ? colors.gold[500] : colors.text.muted}
                  />
                  <Text style={[s.optionLabel, skinType === type && s.optionLabelActive]}>{type}</Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        )}

        {/* Step 2: Age Group */}
        {step === 2 && (
          <View style={s.optionsGrid}>
            {AGE_GROUPS.map((age) => (
              <Animated.View key={age} entering={FadeInUp.duration(300)}>
                <TouchableOpacity
                  style={[s.optionCard, ageGroup === age && s.optionCardActive]}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setAgeGroup(age); }}
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name="person-outline"
                    size={26}
                    color={ageGroup === age ? colors.gold[500] : colors.text.muted}
                  />
                  <Text style={[s.optionLabel, ageGroup === age && s.optionLabelActive]}>{age}</Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        )}

        {/* Step 3: Concerns (multi-select) */}
        {step === 3 && (
          <View style={s.chipsWrap}>
            {CONCERNS.map((concern) => {
              const sel = selectedConcerns.includes(concern);
              return (
                <TouchableOpacity
                  key={concern}
                  style={[s.chip, sel && s.chipActive]}
                  onPress={() => toggleConcern(concern)}
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name={CONCERN_ICONS[concern] || 'ellipse-outline'}
                    size={16}
                    color={sel ? colors.text.inverse : colors.text.muted}
                  />
                  <Text style={[s.chipText, sel && s.chipTextActive]}>{concern}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* Step 4: Usage */}
        {step === 4 && (
          <View style={s.optionsGrid}>
            {USAGE_OPTIONS.map((opt) => (
              <Animated.View key={opt} entering={FadeInUp.duration(300)}>
                <TouchableOpacity
                  style={[s.optionCard, usage === opt && s.optionCardActive]}
                  onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); setUsage(opt); }}
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name={USAGE_ICONS[opt] || 'ellipse-outline'}
                    size={26}
                    color={usage === opt ? colors.gold[500] : colors.text.muted}
                  />
                  <Text style={[s.optionLabel, usage === opt && s.optionLabelActive]}>{opt}</Text>
                </TouchableOpacity>
              </Animated.View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Footer */}
      <View style={s.stepFooter}>
        <TouchableOpacity
          style={[s.nextBtn, !canProceed() && s.nextBtnDisabled]}
          onPress={handleNext}
          disabled={!canProceed()}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={canProceed() ? [colors.gold[500], colors.gold[400]] : [colors.glass.medium, colors.glass.medium]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={s.nextBtnGradient}
          >
            <Text style={[s.nextBtnText, !canProceed() && { color: colors.text.muted }]}>
              {step === TOTAL_STEPS ? t('skinAnalysis.getResults') : t('skinAnalysis.next')}
            </Text>
            <Ionicons
              name="arrow-forward"
              size={18}
              color={canProceed() ? colors.text.inverse : colors.text.muted}
            />
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg.primary },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: spacing.sm,
  },
  navBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...typography.title3, letterSpacing: 0.5 },

  progressBar: { height: 3, backgroundColor: colors.glass.light, marginHorizontal: 20 },
  progressFill: { height: 3, backgroundColor: colors.gold[500], borderRadius: 2 },

  // Landing
  landingContent: { alignItems: 'center', paddingHorizontal: 32, paddingTop: 40 },
  landingCenter: { alignItems: 'center', marginBottom: spacing.xxl },
  landingIconBg: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.xl,
  },
  landingTitle: { ...typography.title1, marginBottom: spacing.sm },
  landingSub: { ...typography.bodySmall, color: colors.text.secondary, textAlign: 'center', lineHeight: 22 },

  primaryBtn: { width: '100%', marginBottom: spacing.md, borderRadius: radius.lg, overflow: 'hidden' },
  primaryBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  primaryBtnText: { ...typography.headline, color: colors.text.inverse, fontWeight: '700' },

  secondaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    borderWidth: 1.5,
    borderColor: colors.gold[500] + '50',
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.lg,
    width: '100%',
  },
  secondaryBtnText: { ...typography.headline, color: colors.gold[500] },
  comingSoonBadge: {
    backgroundColor: colors.glass.light,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
    marginLeft: spacing.xs,
  },
  comingSoonText: { ...typography.caption2, color: colors.text.muted, fontSize: 10, fontWeight: '600' },

  // Quiz steps
  stepContent: { padding: 24 },
  stepTitle: { ...typography.title2, marginBottom: spacing.xxl },

  optionsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  optionCard: {
    width: '47%',
    flexGrow: 1,
    minWidth: 140,
    backgroundColor: colors.bg.surface,
    borderRadius: radius.lg,
    padding: spacing.lg,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: colors.glass.border,
  },
  optionCardActive: {
    borderColor: colors.gold[500],
    backgroundColor: colors.gold[500] + '10',
  },
  optionLabel: { ...typography.headline, color: colors.text.secondary, marginTop: spacing.sm, textAlign: 'center', fontSize: 14 },
  optionLabelActive: { color: colors.gold[500] },

  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.bg.surface,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1.5,
    borderColor: colors.glass.border,
  },
  chipActive: { backgroundColor: colors.gold[500], borderColor: colors.gold[500] },
  chipText: { ...typography.label, color: colors.text.secondary },
  chipTextActive: { color: colors.text.inverse },

  stepFooter: { padding: 16, borderTopWidth: 1, borderTopColor: colors.glass.border },
  nextBtn: { borderRadius: radius.lg, overflow: 'hidden' },
  nextBtnDisabled: { opacity: 0.5 },
  nextBtnGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.lg,
  },
  nextBtnText: { ...typography.headline, color: colors.text.inverse, fontWeight: '700' },

  // Loading
  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.lg },
  loadingText: { ...typography.caption1, color: colors.text.secondary },

  // Results
  resultsContent: { padding: 20, paddingBottom: 40 },
  profileSummary: {
    borderRadius: radius.xl,
    padding: spacing.lg,
    marginBottom: spacing.xxl,
    borderWidth: 1,
    borderColor: colors.gold[500] + '20',
  },
  profileRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  profileLabel: { ...typography.caption1, color: colors.text.muted },
  profileValue: { ...typography.label, color: colors.text.primary, fontWeight: '600', maxWidth: '60%', textAlign: 'right' },
  resultsSection: { ...typography.title3, marginBottom: spacing.lg },
  noResults: { ...typography.caption1, color: colors.text.muted, textAlign: 'center', marginTop: spacing.xl },

  recCard: {
    flexDirection: 'row',
    backgroundColor: colors.bg.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  recImage: { width: 72, height: 72, borderRadius: radius.sm, backgroundColor: colors.bg.elevated },
  recInfo: { flex: 1, marginLeft: spacing.md },
  recName: { ...typography.headline, fontSize: 14, lineHeight: 20 },
  recPrice: { ...typography.label, color: colors.gold[500], fontWeight: '700', marginTop: 4 },
  recPriceOnRequest: { ...typography.caption1, color: colors.text.muted, marginTop: 4 },
  recActions: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.sm },
  recAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.gold[500],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.sm,
  },
  recAddBtnDone: { backgroundColor: colors.status.success },
  recAddText: { ...typography.caption2, fontWeight: '700', color: colors.text.inverse, fontSize: 11 },
  recViewBtn: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.glass.borderStrong,
  },
  recViewText: { ...typography.caption2, fontWeight: '600', color: colors.text.secondary, fontSize: 11 },

  errorBox: {
    backgroundColor: colors.status.error + '10',
    borderRadius: radius.lg,
    padding: spacing.xl,
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.lg,
    borderWidth: 1,
    borderColor: colors.status.error + '20',
  },
  errorText: { ...typography.caption1, color: colors.status.error, textAlign: 'center' },
  retryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.gold[500],
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.sm,
    borderRadius: radius.sm,
    marginTop: spacing.xs,
  },
  retryBtnText: { ...typography.label, fontWeight: '700', color: colors.text.inverse, fontSize: 13 },

  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1.5,
    borderColor: colors.gold[500] + '50',
  },
  resetBtnText: { ...typography.headline, color: colors.gold[500], fontSize: 15 },
});
