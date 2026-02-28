import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, typography, spacing, radius } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { useLocalization } from '../../contexts/LocalizationContext';
import {
  fetchProductReviews,
  submitReview,
  deleteReview,
  type Review,
} from '../../services/api';
import GlassCard from '../ui/GlassCard';

function Stars({ rating, size = 14, interactive, onChange }: {
  rating: number;
  size?: number;
  interactive?: boolean;
  onChange?: (r: number) => void;
}) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <TouchableOpacity
          key={i}
          disabled={!interactive}
          onPress={() => onChange?.(i)}
          hitSlop={8}
        >
          <Ionicons
            name={i <= Math.round(rating) ? 'star' : 'star-outline'}
            size={size}
            color={colors.gold[500]}
          />
        </TouchableOpacity>
      ))}
    </View>
  );
}

interface Props {
  productId: string;
}

export default function ProductReviews({ productId }: Props) {
  const { user, token } = useAuth();
  const { t } = useLocalization();

  const [reviews, setReviews] = useState<Review[]>([]);
  const [average, setAverage] = useState(0);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const [showForm, setShowForm] = useState(false);
  const [formRating, setFormRating] = useState(5);
  const [formTitle, setFormTitle] = useState('');
  const [formComment, setFormComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const loadReviews = useCallback(async () => {
    setLoading(true);
    const data = await fetchProductReviews(productId);
    setReviews(data.reviews);
    setAverage(data.average);
    setCount(data.count);
    setLoading(false);
  }, [productId]);

  useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const userReview = reviews.find(
    (r) => r.userId && user?.id && String(r.userId) === String(user.id),
  );

  const handleSubmit = async () => {
    if (!token) {
      Alert.alert(t('reviews.loginRequired'), t('reviews.loginToReview'));
      return;
    }
    if (formComment.trim().length < 10) {
      Alert.alert(t('reviews.tooShort'), t('reviews.minimumCharacters'));
      return;
    }
    setSubmitting(true);
    const result = await submitReview(token, productId, {
      rating: formRating,
      title: formTitle.trim() || undefined,
      comment: formComment.trim(),
    });
    setSubmitting(false);
    if (result.success) {
      setShowForm(false);
      setFormRating(5);
      setFormTitle('');
      setFormComment('');
      loadReviews();
    } else {
      Alert.alert(t('common.error'), result.error || t('reviews.submitFailed'));
    }
  };

  const handleDelete = (reviewId: string) => {
    Alert.alert(t('reviews.deleteTitle'), t('reviews.deleteConfirm'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: async () => {
          if (token) {
            await deleteReview(token, productId, reviewId);
            loadReviews();
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator color={colors.gold[500]} size="small" />
      </View>
    );
  }

  return (
    <Animated.View entering={FadeInDown.duration(500)} style={styles.container}>
      <Text style={styles.sectionTitle}>{t('reviews.title')}</Text>

      {/* Summary */}
      <View style={styles.summaryRow}>
        <View style={styles.summaryLeft}>
          <Text style={styles.avgText}>{average.toFixed(1)}</Text>
          <Stars rating={average} size={18} />
          <Text style={styles.countText}>
            {count} {count === 1 ? t('reviews.review') : t('reviews.reviewsPlural')}
          </Text>
        </View>
        {!userReview && (
          <TouchableOpacity
            style={styles.writeBtn}
            onPress={() => {
              if (!user) {
                Alert.alert(t('reviews.loginRequired'), t('reviews.loginToReview'));
                return;
              }
              setShowForm(!showForm);
            }}
            activeOpacity={0.7}
          >
            <Ionicons name="create-outline" size={16} color={colors.gold[500]} />
            <Text style={styles.writeBtnText}>{t('reviews.writeReview')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Write/Edit Form */}
      {showForm && (
        <GlassCard style={styles.formCard}>
          <Text style={styles.formLabel}>{t('reviews.rating')}</Text>
          <Stars rating={formRating} size={28} interactive onChange={setFormRating} />

          <Text style={[styles.formLabel, { marginTop: spacing.md }]}>{t('reviews.reviewTitle')}</Text>
          <TextInput
            style={styles.formInput}
            value={formTitle}
            onChangeText={setFormTitle}
            placeholder={t('reviews.titlePlaceholder')}
            placeholderTextColor={colors.text.tertiary}
            maxLength={100}
          />

          <Text style={[styles.formLabel, { marginTop: spacing.md }]}>{t('reviews.yourReview')}</Text>
          <TextInput
            style={[styles.formInput, styles.formTextArea]}
            value={formComment}
            onChangeText={setFormComment}
            placeholder={t('reviews.reviewPlaceholder')}
            placeholderTextColor={colors.text.tertiary}
            multiline
            maxLength={1000}
          />
          <Text style={styles.charCount}>{t('reviews.minimumLabel')}</Text>

          <TouchableOpacity
            style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
            onPress={handleSubmit}
            disabled={submitting}
            activeOpacity={0.8}
          >
            {submitting ? (
              <ActivityIndicator color={colors.bg.primary} size="small" />
            ) : (
              <Text style={styles.submitBtnText}>{t('reviews.submitReview')}</Text>
            )}
          </TouchableOpacity>
        </GlassCard>
      )}

      {/* Review List */}
      {reviews.length === 0 && !showForm && (
        <Text style={styles.emptyText}>{t('reviews.noReviews')}</Text>
      )}

      {reviews.map((review, index) => (
        <Animated.View
          key={String(review.id)}
          entering={FadeInDown.duration(400).delay(index * 80)}
        >
          <GlassCard style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View style={{ flex: 1 }}>
                <Stars rating={review.rating} size={14} />
                {review.title ? <Text style={styles.reviewTitle}>{review.title}</Text> : null}
              </View>
              {userReview && String(review.id) === String(userReview.id) && (
                <TouchableOpacity onPress={() => handleDelete(String(review.id))} hitSlop={12}>
                  <Ionicons name="trash-outline" size={16} color={colors.status.error} />
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.reviewComment}>{review.comment}</Text>
            <View style={styles.reviewFooter}>
              <Text style={styles.reviewAuthor}>{review.userName || 'Customer'}</Text>
              {review.createdAt && (
                <Text style={styles.reviewDate}>
                  {new Date(review.createdAt).toLocaleDateString()}
                </Text>
              )}
            </View>
          </GlassCard>
        </Animated.View>
      ))}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: spacing.xl },
  loadingWrap: { paddingVertical: spacing.xxl, alignItems: 'center' },
  sectionTitle: { ...typography.title3, marginBottom: spacing.lg },
  summaryRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.lg },
  summaryLeft: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  avgText: { ...typography.title2, fontSize: 28, color: colors.gold[500] },
  countText: { ...typography.caption1, color: colors.text.secondary },
  writeBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingVertical: spacing.xs, paddingHorizontal: spacing.md, borderWidth: 1, borderColor: colors.gold[500] + '40', borderRadius: radius.md },
  writeBtnText: { ...typography.caption1, color: colors.gold[500], fontWeight: '600' },
  formCard: { marginBottom: spacing.lg },
  formLabel: { ...typography.caption1, color: colors.text.secondary, fontWeight: '600', marginBottom: spacing.xs },
  formInput: {
    ...typography.bodySmall,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.glass.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.03)',
  },
  formTextArea: { minHeight: 100, textAlignVertical: 'top' },
  charCount: { ...typography.caption2, color: colors.text.tertiary, marginTop: 4 },
  submitBtn: {
    marginTop: spacing.md,
    paddingVertical: spacing.md,
    backgroundColor: colors.gold[500],
    borderRadius: radius.md,
    alignItems: 'center',
  },
  submitBtnText: { ...typography.label, color: colors.bg.primary, fontWeight: '700' },
  emptyText: { ...typography.bodySmall, color: colors.text.tertiary, textAlign: 'center', paddingVertical: spacing.xl },
  reviewCard: { marginBottom: spacing.md },
  reviewHeader: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between' },
  reviewTitle: { ...typography.label, marginTop: spacing.xs },
  reviewComment: { ...typography.bodySmall, color: colors.text.secondary, marginTop: spacing.sm, lineHeight: 20 },
  reviewFooter: { flexDirection: 'row', justifyContent: 'space-between', marginTop: spacing.sm },
  reviewAuthor: { ...typography.caption2, color: colors.text.tertiary },
  reviewDate: { ...typography.caption2, color: colors.text.tertiary },
});
