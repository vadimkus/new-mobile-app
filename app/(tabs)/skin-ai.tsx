import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, typography, spacing, radius, layout } from '../../constants/theme';
import { DEMO_SKIN_CONCERNS } from '../../constants/mockData';
import { useAuth } from '../../contexts/AuthContext';
import { useCart } from '../../contexts/CartContext';
import { fetchProducts, type Product } from '../../services/api';
import GlassCard from '../../components/ui/GlassCard';
import GoldButton from '../../components/ui/GoldButton';
import SectionHeader from '../../components/ui/SectionHeader';
import SkinScoreRing from '../../components/skin/SkinScoreRing';
import FaceMap from '../../components/skin/FaceMap';

const SCORE_KEY = '@genosys_skin_scores';

export default function SkinAIScreen() {
  const { user, token } = useAuth();
  const { addItem } = useCart();
  const [score, setScore] = useState(78);
  const [history, setHistory] = useState([
    { month: 'Dec 2025', score: 66 },
    { month: 'Jan 2026', score: 72 },
    { month: 'Feb 2026', score: 78 },
  ]);
  const [recommended, setRecommended] = useState<{ id: string; name: string; match: number; imageUrl: string; price: number; currency: string }[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const saved = await AsyncStorage.getItem(SCORE_KEY);
        if (saved) {
          const data = JSON.parse(saved);
          if (data.score) setScore(data.score);
          if (data.history) setHistory(data.history);
        }
      } catch {}
    })();
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const userCtx = user ? { id: user.id, token: token ?? undefined } : undefined;
        const products = await fetchProducts(userCtx);
        setAllProducts(products);
        const recs = products.slice(0, 4).map((p, i) => ({
          id: String(p.id),
          name: p.name,
          match: 94 - i * 5,
          imageUrl: p.imageUrl || p.images?.[0] || '',
          price: p.salePrice ?? p.price,
          currency: p.currency || 'AED',
        }));
        setRecommended(recs);
      } catch {}
    })();
  }, [user, token]);

  const lastScore = history.length >= 2 ? history[history.length - 2].score : 0;
  const scoreChange = score - lastScore;

  const handleTakeScan = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert(
      'Skin Analysis',
      'This feature uses your camera to analyze skin conditions. It will be available in a future update with AI-powered analysis.',
      [{ text: 'OK' }],
    );
  };

  const handleAddToCart = (product: { id: string; name: string; price: number; currency: string; imageUrl: string }) => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      currency: product.currency,
      imageUrl: product.imageUrl,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(600)}>
          <Text style={styles.pageTitle}>Skin AI</Text>
          <Text style={styles.pageSubtitle}>Your personalized skin journey</Text>
        </Animated.View>

        {/* Score Card */}
        <Animated.View entering={FadeInDown.duration(600).delay(150)}>
          <GlassCard intensity="medium" padding="xl">
            <View style={styles.scoreContainer}>
              <SkinScoreRing score={score} />
            </View>
            <View style={styles.scoreChange}>
              <Ionicons
                name={scoreChange >= 0 ? 'arrow-up' : 'arrow-down'}
                size={14}
                color={scoreChange >= 0 ? colors.status.success : colors.status.error}
              />
              <Text style={[styles.scoreChangeText, scoreChange < 0 && { color: colors.status.error }]}>
                {scoreChange >= 0 ? '+' : ''}{scoreChange} from last month
              </Text>
            </View>
            <Text style={styles.scoreMessage}>
              {score >= 80 ? 'Excellent! Your skin is in great shape' :
               score >= 60 ? 'Great progress! Keep up your routine' :
               'Getting started — consistency is key!'}
            </Text>
          </GlassCard>
        </Animated.View>

        {/* Face Map */}
        <Animated.View entering={FadeInDown.duration(600).delay(300)} style={styles.section}>
          <SectionHeader title="Concern Map" />
          <GlassCard padding="md">
            <FaceMap concerns={DEMO_SKIN_CONCERNS} />
          </GlassCard>
        </Animated.View>

        {/* Progress History */}
        <Animated.View entering={FadeInDown.duration(600).delay(450)} style={styles.section}>
          <SectionHeader title="Progress" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.historyRow}>
              {history.map((item, index) => {
                const isCurrent = index === history.length - 1;
                return (
                  <Animated.View key={item.month} entering={FadeInRight.duration(400).delay(500 + index * 100)}>
                    <View style={[styles.historyCard, isCurrent && styles.historyCardActive]}>
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
        {recommended.length > 0 && (
          <Animated.View entering={FadeInDown.duration(600).delay(600)} style={styles.section}>
            <SectionHeader title="Recommended for You" />
            {recommended.map((product) => (
              <TouchableOpacity
                key={product.id}
                activeOpacity={0.8}
                onPress={() => router.push(`/product/${product.id}`)}
              >
                <View style={styles.recommendCard}>
                  {product.imageUrl ? (
                    <Image source={{ uri: product.imageUrl }} style={styles.recommendImage} contentFit="contain" />
                  ) : (
                    <View style={[styles.recommendImage, { backgroundColor: colors.bg.elevated }]} />
                  )}
                  <View style={styles.recommendInfo}>
                    <Text style={styles.recommendName} numberOfLines={1}>{product.name}</Text>
                    <Text style={styles.recommendPrice}>{product.price} {product.currency}</Text>
                  </View>
                  <View style={styles.matchBadge}>
                    <Text style={styles.matchText}>{product.match}%</Text>
                  </View>
                  <TouchableOpacity
                    onPress={(e) => { e.stopPropagation(); handleAddToCart(product); }}
                    style={styles.addBtn}
                    hitSlop={8}
                  >
                    <Ionicons name="bag-add-outline" size={18} color={colors.gold[500]} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </Animated.View>
        )}

        {/* Scan button */}
        <Animated.View entering={FadeInDown.duration(500).delay(750)} style={styles.section}>
          <GoldButton
            title="Take New Scan"
            onPress={handleTakeScan}
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
  safeArea: { flex: 1, backgroundColor: colors.bg.primary },
  scroll: { flex: 1 },
  scrollContent: { paddingHorizontal: layout.screenPadding },

  pageTitle: { ...typography.display, marginTop: spacing.md },
  pageSubtitle: { ...typography.bodySmall, color: colors.gold[500], marginTop: spacing.xs, marginBottom: spacing.xl },

  section: { marginTop: spacing.xxl },

  scoreContainer: { alignItems: 'center', paddingVertical: spacing.lg },
  scoreChange: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginTop: spacing.md },
  scoreChangeText: { ...typography.label, color: colors.status.success },
  scoreMessage: { ...typography.caption1, color: colors.text.secondary, textAlign: 'center', marginTop: spacing.xs },

  historyRow: { flexDirection: 'row', gap: spacing.md },
  historyCard: { width: 100, paddingVertical: spacing.lg, paddingHorizontal: spacing.md, backgroundColor: colors.bg.surface, borderRadius: radius.lg, alignItems: 'center', borderWidth: 1, borderColor: colors.glass.border },
  historyCardActive: { borderColor: colors.gold[500], shadowColor: colors.gold[500], shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.2, shadowRadius: 8 },
  historyMonth: { ...typography.caption2, color: colors.text.secondary, marginBottom: spacing.sm },
  historyScore: { ...typography.title1, color: colors.text.primary },
  historyScoreActive: { color: colors.gold[500] },

  recommendCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bg.surface, borderRadius: radius.lg, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.glass.border },
  recommendImage: { width: 44, height: 44, borderRadius: radius.sm, marginRight: spacing.md },
  recommendInfo: { flex: 1 },
  recommendName: { ...typography.headline, fontSize: 15 },
  recommendPrice: { ...typography.caption1, color: colors.text.secondary, marginTop: 2 },
  matchBadge: { backgroundColor: colors.gold[500], paddingHorizontal: spacing.sm, paddingVertical: spacing.xs, borderRadius: radius.pill, marginRight: spacing.sm },
  matchText: { ...typography.caption2, color: colors.text.inverse, fontWeight: '700', fontSize: 11 },
  addBtn: { padding: spacing.xs },
});
