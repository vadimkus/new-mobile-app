import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, typography, radius, spacing, shadows, layout } from '../../constants/theme';

interface ProductHeroCardProps {
  id: string;
  name: string;
  tagline: string;
  price: number;
  currency?: string;
  imageUrl: string;
  localImageSource?: any;
  badge?: string;
  rating?: number;
  gradientColors?: readonly [string, string];
  onPress: (id: string) => void;
  onFavorite?: (id: string) => void;
  onAddToBag?: (id: string) => void;
  isFavorite?: boolean;
}

export default function ProductHeroCard({
  id,
  name,
  tagline,
  price,
  currency = 'AED',
  imageUrl,
  localImageSource,
  badge,
  rating = 5,
  gradientColors = colors.category.default,
  onPress,
  onFavorite,
  onAddToBag,
  isFavorite = false,
}: ProductHeroCardProps) {
  return (
    <TouchableOpacity
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        onPress(id);
      }}
      activeOpacity={0.9}
      style={styles.container}
    >
      <LinearGradient
        colors={[...gradientColors]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gradient}
      >
        {badge && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{badge}</Text>
          </View>
        )}

        <Image
          source={localImageSource || { uri: imageUrl }}
          style={styles.productImage}
          contentFit="contain"
          transition={300}
        />

        <View style={styles.infoContainer}>
          <Text style={styles.name} numberOfLines={2}>{name}</Text>
          <Text style={styles.tagline} numberOfLines={1}>{tagline}</Text>

          <View style={styles.ratingRow}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Ionicons
                key={i}
                name={i < Math.floor(rating) ? 'star' : 'star-outline'}
                size={14}
                color={colors.gold[500]}
                style={{ marginRight: 2 }}
              />
            ))}
          </View>

          <Text style={styles.price}>{Number(price).toFixed(2)} {currency}</Text>
        </View>

        {/* Side action buttons */}
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onFavorite?.(id);
            }}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={20}
              color={isFavorite ? colors.status.error : colors.text.primary}
            />
          </TouchableOpacity>

          {onAddToBag && (
            <TouchableOpacity
              style={[styles.actionBtn, styles.actionBtnGold]}
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                onAddToBag(id);
              }}
            >
              <Ionicons name="bag-add-outline" size={20} color={colors.text.inverse} />
            </TouchableOpacity>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.xxl,
    overflow: 'hidden',
    ...shadows.lg,
  },
  gradient: {
    padding: spacing.xl,
    minHeight: 340,
    position: 'relative',
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: colors.gold[500],
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: radius.pill,
    marginBottom: spacing.md,
  },
  badgeText: {
    ...typography.label,
    color: colors.text.inverse,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  productImage: {
    width: '70%',
    height: 180,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  name: {
    ...typography.title2,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  tagline: {
    ...typography.bodySmall,
    color: 'rgba(255,255,255,0.7)',
    marginBottom: spacing.sm,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  price: {
    ...typography.price,
    fontSize: 22,
  },
  actions: {
    position: 'absolute',
    right: spacing.lg,
    top: '40%',
    gap: spacing.md,
  },
  actionBtn: {
    width: 40,
    height: 40,
    borderRadius: radius.circle,
    backgroundColor: colors.glass.medium,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  actionBtnGold: {
    backgroundColor: colors.gold[500],
    borderColor: colors.gold[400],
  },
});
