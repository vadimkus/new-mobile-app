import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { colors, typography, radius, spacing, shadows, layout } from '../../constants/theme';

interface ProductMiniCardProps {
  id: string;
  name: string;
  price: number;
  currency?: string;
  imageUrl: string;
  localImageSource?: any;
  onPress: (id: string) => void;
  onFavorite?: (id: string) => void;
  onAddToBag?: (id: string) => void;
  isFavorite?: boolean;
}

function formatPrice(price: number): string {
  return Number(price).toFixed(2);
}

export default function ProductMiniCard({
  id,
  name,
  price,
  currency = 'AED',
  imageUrl,
  localImageSource,
  onPress,
  onFavorite,
  onAddToBag,
  isFavorite = false,
}: ProductMiniCardProps) {
  const cardWidth = layout.cardWidth;

  return (
    <TouchableOpacity
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress(id);
      }}
      activeOpacity={0.8}
      style={[styles.container, { width: cardWidth }]}
    >
      <View style={styles.borderGlow}>
        <View style={styles.inner}>
          <TouchableOpacity
            style={styles.favoriteBtn}
            onPress={(e) => {
              e.stopPropagation();
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              onFavorite?.(id);
            }}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={16}
              color={isFavorite ? colors.status.error : colors.text.secondary}
            />
          </TouchableOpacity>

          <Image
            source={localImageSource || { uri: imageUrl }}
            style={styles.image}
            contentFit="contain"
            transition={200}
          />

          <Text style={styles.name} numberOfLines={2}>{name}</Text>
          <Text style={styles.price}>{formatPrice(price)} {currency}</Text>

          {onAddToBag && (
            <TouchableOpacity
              style={styles.addToBagBtn}
              onPress={(e) => {
                e.stopPropagation();
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                onAddToBag(id);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="bag-add-outline" size={14} color={colors.text.inverse} />
              <Text style={styles.addToBagText}>Add</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radius.xl,
    overflow: 'hidden',
  },
  borderGlow: {
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.glass.borderStrong,
    backgroundColor: colors.bg.surface,
    overflow: 'hidden',
  },
  inner: {
    padding: spacing.md,
    alignItems: 'center',
  },
  favoriteBtn: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    zIndex: 1,
    width: 30,
    height: 30,
    borderRadius: radius.circle,
    backgroundColor: colors.glass.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    width: '80%',
    height: 120,
    marginBottom: spacing.md,
    marginTop: spacing.sm,
  },
  name: {
    ...typography.label,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.xs,
    fontSize: 12,
  },
  price: {
    ...typography.priceSmall,
    marginBottom: spacing.sm,
  },
  addToBagBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: colors.gold[500],
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    width: '100%',
  },
  addToBagText: {
    ...typography.caption2,
    color: colors.text.inverse,
    fontWeight: '700',
    fontSize: 11,
  },
});
