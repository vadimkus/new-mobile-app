import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, typography, spacing, radius } from '../../constants/theme';
import GoldButton from '../ui/GoldButton';

interface RitualStepProps {
  stepNumber: number;
  type: string;
  productName: string;
  productImageUrl: string;
  instruction: string;
  duration: number;
  waitTime?: number;
  completed: boolean;
  isActive: boolean;
  isLast: boolean;
  onApply?: () => void;
}

export default function RitualStep({
  stepNumber,
  type,
  productName,
  productImageUrl,
  instruction,
  duration,
  waitTime,
  completed,
  isActive,
  isLast,
  onApply,
}: RitualStepProps) {
  const isUpcoming = !completed && !isActive;

  return (
    <View style={styles.container}>
      {/* Timeline connector */}
      <View style={styles.timeline}>
        <View
          style={[
            styles.dot,
            completed && styles.dotCompleted,
            isActive && styles.dotActive,
            isUpcoming && styles.dotUpcoming,
          ]}
        >
          {completed && (
            <Ionicons name="checkmark" size={10} color={colors.bg.primary} />
          )}
        </View>
        {!isLast && (
          <View
            style={[
              styles.line,
              completed && styles.lineCompleted,
            ]}
          />
        )}
      </View>

      {/* Step content */}
      <View style={[styles.content, isUpcoming && styles.contentDimmed]}>
        {/* Step label + duration */}
        <View style={styles.stepHeader}>
          <Text style={[styles.stepLabel, isActive && styles.stepLabelActive]}>
            Step {stepNumber} · {type}
          </Text>
          {duration > 0 && (
            <View style={styles.durationBadge}>
              <Ionicons name="time-outline" size={12} color={colors.text.secondary} />
              <Text style={styles.durationText}>{duration}s</Text>
            </View>
          )}
        </View>

        {/* Card */}
        <View style={[
          styles.card,
          isActive && styles.cardActive,
          isUpcoming && styles.cardUpcoming,
        ]}>
          <Image
            source={{ uri: productImageUrl }}
            style={styles.productImage}
            contentFit="contain"
          />

          <View style={styles.cardInfo}>
            <Text
              style={[styles.productName, isUpcoming && styles.textDimmed]}
              numberOfLines={1}
            >
              {productName}
            </Text>
            <Text
              style={[styles.instruction, isUpcoming && styles.textDimmed]}
              numberOfLines={1}
            >
              {instruction}
            </Text>

            {isActive && (
              <View style={styles.activeActions}>
                <GoldButton title="Apply Now" onPress={onApply || (() => {})} size="sm" />
                {waitTime && (
                  <Text style={styles.timerText}>
                    {Math.floor(waitTime / 60)}:{String(waitTime % 60).padStart(2, '0')}
                  </Text>
                )}
              </View>
            )}
          </View>

          {completed && (
            <View style={styles.checkContainer}>
              <Ionicons name="checkmark-circle" size={24} color={colors.status.success} />
            </View>
          )}

          {isUpcoming && (
            <View style={styles.lockContainer}>
              <Ionicons name="lock-closed-outline" size={18} color={colors.text.muted} />
            </View>
          )}

          {waitTime && completed && (
            <View style={styles.waitBadge}>
              <Text style={styles.waitText}>Wait {waitTime}s before next step</Text>
            </View>
          )}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    marginBottom: spacing.md,
  },

  // Timeline
  timeline: {
    width: 24,
    alignItems: 'center',
    marginRight: spacing.md,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.bg.elevated,
    borderWidth: 2,
    borderColor: colors.glass.borderStrong,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  dotCompleted: {
    backgroundColor: colors.gold[500],
    borderColor: colors.gold[500],
  },
  dotActive: {
    backgroundColor: colors.gold[500],
    borderColor: colors.gold[300],
    shadowColor: colors.gold[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
  },
  dotUpcoming: {
    backgroundColor: colors.bg.elevated,
    borderColor: colors.text.muted,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: colors.glass.border,
    marginVertical: 2,
  },
  lineCompleted: {
    backgroundColor: colors.gold[500],
    opacity: 0.5,
  },

  // Content
  content: {
    flex: 1,
  },
  contentDimmed: {
    opacity: 0.5,
  },
  stepHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  stepLabel: {
    ...typography.label,
    color: colors.gold[500],
    fontSize: 12,
  },
  stepLabelActive: {
    color: colors.gold[400],
    fontWeight: '700',
  },
  durationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  durationText: {
    ...typography.caption2,
    color: colors.text.secondary,
  },

  // Card
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.glass.border,
    position: 'relative',
  },
  cardActive: {
    borderColor: colors.gold[500],
    backgroundColor: colors.bg.elevated,
    shadowColor: colors.gold[500],
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  cardUpcoming: {
    borderColor: 'transparent',
    backgroundColor: colors.bg.surface,
  },
  productImage: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    marginRight: spacing.md,
  },
  cardInfo: {
    flex: 1,
  },
  productName: {
    ...typography.headline,
    fontSize: 15,
    marginBottom: 2,
  },
  instruction: {
    ...typography.caption1,
    color: colors.text.secondary,
  },
  textDimmed: {
    color: colors.text.muted,
  },
  activeActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  timerText: {
    ...typography.title2,
    color: colors.text.primary,
    fontVariant: ['tabular-nums'],
  },
  checkContainer: {
    marginLeft: spacing.sm,
  },
  lockContainer: {
    marginLeft: spacing.sm,
  },
  waitBadge: {
    position: 'absolute',
    bottom: -8,
    left: spacing.xl,
    backgroundColor: colors.bg.elevated,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.pill,
  },
  waitText: {
    ...typography.caption2,
    color: colors.gold[500],
    fontSize: 10,
  },
});
