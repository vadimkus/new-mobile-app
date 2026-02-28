import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import { colors, typography, spacing, radius, layout } from '../../constants/theme';
import { DEMO_RITUAL_STEPS } from '../../constants/mockData';
import GlassCard from '../../components/ui/GlassCard';
import GoldButton from '../../components/ui/GoldButton';
import RitualStep from '../../components/ritual/RitualStep';

type TimeOfDay = 'morning' | 'evening';

export default function RitualScreen() {
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('morning');

  const completedCount = DEMO_RITUAL_STEPS.filter((s) => s.completed).length;
  const totalCount = DEMO_RITUAL_STEPS.length;
  const progress = completedCount / totalCount;
  const activeIndex = DEMO_RITUAL_STEPS.findIndex((s) => !s.completed);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Title */}
        <Animated.View entering={FadeInDown.duration(600)}>
          <Text style={styles.pageTitle}>My Beauty Ritual</Text>
        </Animated.View>

        {/* Time toggle */}
        <Animated.View entering={FadeInDown.duration(600).delay(100)} style={styles.toggleContainer}>
          <TouchableOpacity
            onPress={() => setTimeOfDay('morning')}
            style={[
              styles.toggleBtn,
              timeOfDay === 'morning' && styles.toggleBtnActive,
            ]}
          >
            <Text
              style={[
                styles.toggleText,
                timeOfDay === 'morning' && styles.toggleTextActive,
              ]}
            >
              Morning ☀️
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setTimeOfDay('evening')}
            style={[
              styles.toggleBtn,
              timeOfDay === 'evening' && styles.toggleBtnActive,
            ]}
          >
            <Text
              style={[
                styles.toggleText,
                timeOfDay === 'evening' && styles.toggleTextActive,
              ]}
            >
              Evening 🌙
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Streak Card */}
        <Animated.View entering={FadeInDown.duration(600).delay(200)}>
          <GlassCard intensity="medium">
            <View style={styles.streakRow}>
              <View style={styles.streakInfo}>
                <Text style={styles.streakTitle}>🔥 14 Day Streak!</Text>
                <Text style={styles.streakSubtitle}>
                  Keep going! You're building amazing skin habits
                </Text>
              </View>
              <View style={styles.streakRing}>
                <Text style={styles.streakNumber}>14</Text>
                <Text style={styles.streakDays}>/30{'\n'}days</Text>
              </View>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Ritual Steps */}
        <View style={styles.stepsContainer}>
          {DEMO_RITUAL_STEPS.map((step, index) => (
            <Animated.View
              key={step.id}
              entering={FadeInRight.duration(500).delay(350 + index * 100)}
            >
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
                isLast={index === DEMO_RITUAL_STEPS.length - 1}
              />
            </Animated.View>
          ))}
        </View>

        {/* Add product button */}
        <Animated.View entering={FadeInDown.duration(500).delay(800)}>
          <GoldButton
            title="Add Product +"
            onPress={() => {}}
            variant="outline"
            fullWidth
          />
        </Animated.View>

        {/* Progress footer */}
        <Animated.View entering={FadeInDown.duration(500).delay(900)} style={styles.progressFooter}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressText}>
              {completedCount} of {totalCount} steps complete
            </Text>
            <Text style={styles.progressPercent}>{Math.round(progress * 100)}%</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
          </View>

          <View style={{ marginTop: spacing.lg }}>
            <GoldButton
              title="Complete Ritual"
              onPress={() => {}}
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

  // Title
  pageTitle: {
    ...typography.display,
    marginBottom: spacing.xl,
    marginTop: spacing.md,
  },

  // Toggle
  toggleContainer: {
    flexDirection: 'row',
    backgroundColor: colors.bg.surface,
    borderRadius: radius.pill,
    padding: 4,
    marginBottom: spacing.xl,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  toggleBtn: {
    flex: 1,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
    alignItems: 'center',
  },
  toggleBtnActive: {
    backgroundColor: colors.gold[500],
  },
  toggleText: {
    ...typography.headline,
    color: colors.text.secondary,
    fontSize: 15,
  },
  toggleTextActive: {
    color: colors.text.inverse,
  },

  // Streak
  streakRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  streakInfo: {
    flex: 1,
    marginRight: spacing.md,
  },
  streakTitle: {
    ...typography.title3,
    marginBottom: spacing.xs,
  },
  streakSubtitle: {
    ...typography.caption1,
    color: colors.text.secondary,
    lineHeight: 18,
  },
  streakRing: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: colors.gold[500],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: colors.gold[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  streakNumber: {
    ...typography.title2,
    color: colors.gold[500],
    fontSize: 20,
    lineHeight: 22,
  },
  streakDays: {
    ...typography.caption2,
    color: colors.text.secondary,
    fontSize: 9,
    textAlign: 'center',
    lineHeight: 10,
  },

  // Steps
  stepsContainer: {
    marginTop: spacing.xxl,
    marginBottom: spacing.xl,
  },

  // Progress
  progressFooter: {
    marginTop: spacing.xl,
  },
  progressHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  progressText: {
    ...typography.bodySmall,
    color: colors.text.primary,
  },
  progressPercent: {
    ...typography.label,
    color: colors.gold[500],
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.bg.elevated,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.gold[500],
    borderRadius: radius.pill,
  },
});
