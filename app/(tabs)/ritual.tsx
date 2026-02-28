import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, typography, spacing, radius, layout } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { fetchProducts, type Product } from '../../services/api';

interface RitualStepType {
  id: string;
  stepNumber: number;
  type: string;
  product: { id: string; name: string; imageUrl: string };
  instruction: string;
  duration: number;
  waitTime?: number;
  completed: boolean;
}

const STEP_TEMPLATES = [
  { type: 'Cleanse', category: 'cleanser', instruction: 'Massage gently for 60 seconds', duration: 60 },
  { type: 'Tone', category: 'toner', instruction: 'Pat gently into skin', duration: 30, waitTime: 30 },
  { type: 'Treat', category: 'serum', instruction: 'Apply 2-3 drops, press into skin', duration: 120, waitTime: 120 },
  { type: 'Moisturize', category: 'cream', instruction: 'Apply 2-3 dots, massage upward', duration: 45 },
  { type: 'Protect', category: 'sun', instruction: 'Apply evenly as final step', duration: 30 },
];

function buildStepsFromProducts(products: Product[]): RitualStepType[] {
  return STEP_TEMPLATES.map((tmpl, i) => {
    const match = products.find((p) =>
      (p.category || '').toLowerCase().includes(tmpl.category),
    );
    return {
      id: `r${i + 1}`,
      stepNumber: i + 1,
      type: tmpl.type,
      product: {
        id: match ? String(match.id) : '',
        name: match?.name || `${tmpl.type} product`,
        imageUrl: match?.imageUrl || match?.images?.[0] || '',
      },
      instruction: tmpl.instruction,
      duration: tmpl.duration,
      waitTime: tmpl.waitTime,
      completed: false,
    };
  });
}
import GlassCard from '../../components/ui/GlassCard';
import GoldButton from '../../components/ui/GoldButton';
import RitualStep from '../../components/ritual/RitualStep';

const STREAK_KEY = '@genosys_ritual_streak';
const STEPS_KEY = '@genosys_ritual_steps';
type TimeOfDay = 'morning' | 'evening';

export default function RitualScreen() {
  const { user, token } = useAuth();
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');
  const [steps, setSteps] = useState<RitualStepType[]>([]);
  const [streak, setStreak] = useState(0);
  const [lastDate, setLastDate] = useState('');
  const [loadingSteps, setLoadingSteps] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STREAK_KEY);
        if (raw) {
          const data = JSON.parse(raw);
          setStreak(data.streak || 0);
          setLastDate(data.lastDate || '');
        }
      } catch {}

      try {
        const saved = await AsyncStorage.getItem(STEPS_KEY);
        if (saved) {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setSteps(parsed);
            setLoadingSteps(false);
            return;
          }
        }
      } catch {}

      try {
        const userCtx = user ? { id: user.id, token: token ?? undefined } : undefined;
        const products = await fetchProducts(userCtx);
        if (products.length > 0) {
          const built = buildStepsFromProducts(products);
          setSteps(built);
          AsyncStorage.setItem(STEPS_KEY, JSON.stringify(built)).catch(() => {});
        }
      } catch {}
      setLoadingSteps(false);
    })();
  }, [user, token]);

  const toggleStep = useCallback((stepId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSteps((prev) => {
      const updated = prev.map((s) =>
        s.id === stepId ? { ...s, completed: !s.completed } : s,
      );
      AsyncStorage.setItem(STEPS_KEY, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
  }, []);

  const completedCount = steps.filter((s) => s.completed).length;
  const totalCount = steps.length;
  const progress = totalCount > 0 ? completedCount / totalCount : 0;
  const activeIndex = steps.findIndex((s) => !s.completed);

  const handleCompleteRitual = useCallback(async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const today = new Date().toDateString();
    const newStreak = lastDate === new Date(Date.now() - 86400000).toDateString()
      ? streak + 1
      : (lastDate === today ? streak : 1);
    setStreak(newStreak);
    setLastDate(today);
    await AsyncStorage.setItem(STREAK_KEY, JSON.stringify({ streak: newStreak, lastDate: today })).catch(() => {});

    setSteps((prev) => {
      const reset = prev.map((s) => ({ ...s, completed: false }));
      AsyncStorage.setItem(STEPS_KEY, JSON.stringify(reset)).catch(() => {});
      return reset;
    });

    Alert.alert('Ritual Complete! 🎉', `${newStreak} day streak! Your skin will thank you.`);
  }, [streak, lastDate]);

  const handleAddProduct = () => {
    router.push('/(tabs)/discover');
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(600)}>
          <Text style={styles.pageTitle}>My Beauty Ritual</Text>
        </Animated.View>

        {loadingSteps && steps.length === 0 && (
          <View style={{ alignItems: 'center', paddingVertical: spacing.section * 2 }}>
            <ActivityIndicator size="large" color={colors.gold[500]} />
            <Text style={{ ...typography.bodySmall, color: colors.text.secondary, marginTop: spacing.lg }}>
              Building your ritual...
            </Text>
          </View>
        )}

        {/* Time toggle */}
        <Animated.View entering={FadeInDown.duration(600).delay(100)} style={styles.toggleContainer}>
          <TouchableOpacity
            onPress={() => setTimeOfDay('morning')}
            style={[styles.toggleBtn, timeOfDay === 'morning' && styles.toggleBtnActive]}
          >
            <Text style={[styles.toggleText, timeOfDay === 'morning' && styles.toggleTextActive]}>
              Morning ☀️
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setTimeOfDay('evening')}
            style={[styles.toggleBtn, timeOfDay === 'evening' && styles.toggleBtnActive]}
          >
            <Text style={[styles.toggleText, timeOfDay === 'evening' && styles.toggleTextActive]}>
              Evening 🌙
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Streak Card */}
        <Animated.View entering={FadeInDown.duration(600).delay(200)}>
          <GlassCard intensity="medium">
            <View style={styles.streakRow}>
              <View style={styles.streakInfo}>
                <Text style={styles.streakTitle}>
                  {streak > 0 ? `🔥 ${streak} Day Streak!` : '🌟 Start Your Streak!'}
                </Text>
                <Text style={styles.streakSubtitle}>
                  {streak > 0 ? "Keep going! You're building amazing skin habits" : 'Complete your ritual daily to build a streak'}
                </Text>
              </View>
              <View style={styles.streakRing}>
                <Text style={styles.streakNumber}>{streak}</Text>
                <Text style={styles.streakDays}>/30{'\n'}days</Text>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Ritual Steps */}
        <View style={styles.stepsContainer}>
          {steps.map((step, index) => (
            <Animated.View key={step.id} entering={FadeInRight.duration(500).delay(350 + index * 100)}>
              <TouchableOpacity onPress={() => toggleStep(step.id)} activeOpacity={0.9}>
                <RitualStep
                  stepNumber={step.stepNumber}
                  type={step.type}
                  productName={step.product.name}
                  productImageUrl={step.product.imageUrl}
                  instruction={step.instruction}
                  duration={step.duration}
                  waitTime={step.waitTime}
                  completed={step.completed}
                  isActive={index === activeIndex}
                  isLast={index === steps.length - 1}
                />
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        <Animated.View entering={FadeInDown.duration(500).delay(800)}>
          <GoldButton title="Add Product +" onPress={handleAddProduct} variant="outline" fullWidth />
        </Animated.View>

        {/* Progress footer */}
        <Animated.View entering={FadeInDown.duration(500).delay(900)} style={styles.progressFooter}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>{completedCount} of {totalCount} steps complete</Text>
            <Text style={styles.progressPercent}>{Math.round(progress * 100)}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>
          <View style={{ marginTop: spacing.lg }}>
            <GoldButton
              title="Complete Ritual"
              onPress={handleCompleteRitual}
              fullWidth
              size="lg"
              disabled={progress < 1}
            />
          </View>
        </Animated.View>

        <View style={{ height: layout.tabBarHeight + 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg.primary },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: layout.screenPadding },
  pageTitle: { ...typography.display, marginBottom: spacing.xl, marginTop: spacing.md },

  toggleContainer: { flexDirection: 'row', backgroundColor: colors.bg.surface, borderRadius: radius.pill, padding: 4, marginBottom: spacing.xl, borderWidth: 1, borderColor: colors.glass.border },
  toggleBtn: { flex: 1, paddingVertical: spacing.md, borderRadius: radius.pill, alignItems: 'center' },
  toggleBtnActive: { backgroundColor: colors.gold[500] },
  toggleText: { ...typography.headline, color: colors.text.secondary, fontSize: 15 },
  toggleTextActive: { color: colors.text.inverse },

  streakRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  streakInfo: { flex: 1, marginRight: spacing.md },
  streakTitle: { ...typography.title3, marginBottom: spacing.xs },
  streakSubtitle: { ...typography.caption1, color: colors.text.secondary, lineHeight: 18 },
  streakRing: { width: 64, height: 64, borderRadius: 32, borderWidth: 3, borderColor: colors.gold[500], alignItems: 'center', justifyContent: 'center', shadowColor: colors.gold[500], shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.3, shadowRadius: 8 },
  streakNumber: { ...typography.title2, color: colors.gold[500], fontSize: 20, lineHeight: 22 },
  streakDays: { ...typography.caption2, color: colors.text.secondary, fontSize: 9, textAlign: 'center', lineHeight: 10 },

  stepsContainer: { marginTop: spacing.xxl, marginBottom: spacing.xl },

  progressFooter: { marginTop: spacing.xl },
  progressHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: spacing.sm },
  progressText: { ...typography.bodySmall, color: colors.text.primary },
  progressPercent: { ...typography.label, color: colors.gold[500] },
  progressBar: { height: 6, backgroundColor: colors.bg.elevated, borderRadius: radius.pill, overflow: 'hidden' },
  progressFill: { height: '100%', backgroundColor: colors.gold[500], borderRadius: radius.pill },
});
