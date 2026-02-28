import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Linking,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeInRight } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, radius, shadows, layout } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { useLocalization } from '../../contexts/LocalizationContext';
import { fetchTraining } from '../../services/api';
import GlassCard from '../../components/ui/GlassCard';

const DOC_ICON_MAP: Record<string, keyof typeof Ionicons.glyphMap> = {
  book: 'book',
  home: 'home',
  medical: 'medical',
  sparkles: 'sparkles',
  medkit: 'medkit',
  diamond: 'diamond',
  flask: 'flask',
};

export default function TrainingScreen() {
  const { user } = useAuth();
  const { t, locale } = useLocalization();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [trainingDocs, setTrainingDocs] = useState<any[]>([]);
  const [productDocs, setProductDocs] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);

  const loadTraining = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);
      setError(null);
      const data = await fetchTraining({ locale: locale || 'en' });
      setTrainingDocs(data.trainingDocuments || []);
      setProductDocs(data.productDocuments || []);
      setVideos(data.videos || []);
      setStats(data.stats || null);
    } catch {
      setError(t('training.failedToLoad'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [locale, t]);

  useEffect(() => {
    if (user) loadTraining();
  }, [user, loadTraining]);

  const openDocument = async (url: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    try {
      await Linking.openURL(url);
    } catch {
      // silently fail
    }
  };

  const openVideo = async (youtubeId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    try {
      const ytAppUrl = `youtube://watch?v=${youtubeId}`;
      const canOpen = await Linking.canOpenURL(ytAppUrl);
      if (canOpen) await Linking.openURL(ytAppUrl);
      else await Linking.openURL(`https://www.youtube.com/watch?v=${youtubeId}`);
    } catch {
      await Linking.openURL(`https://www.youtube.com/watch?v=${youtubeId}`);
    }
  };

  const getDocIcon = (iconName: string): any =>
    DOC_ICON_MAP[iconName] || 'document-text';

  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('training.title')}</Text>
          <View style={{ width: 40 }} />
        </View>
        <View style={styles.loginContainer}>
          <Ionicons name="lock-closed" size={48} color={colors.gold[500]} />
          <Text style={styles.loginTitle}>{t('training.loginRequired')}</Text>
          <Text style={styles.loginSub}>{t('training.loginRequiredMessage')}</Text>
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={() => router.push('/auth/login')}
            activeOpacity={0.8}
          >
            <Text style={styles.loginBtnText}>{t('training.logIn')}</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('training.title')}</Text>
        <View style={{ width: 40 }} />
      </View>

      {loading && (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.gold[500]} />
          <Text style={styles.loadingText}>{t('training.loadingMaterials')}</Text>
        </View>
      )}

      {error && !loading && (
        <View style={styles.loginContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.status.error} />
          <Text style={styles.loginTitle}>{error}</Text>
          <TouchableOpacity
            style={[styles.loginBtn, { marginTop: spacing.lg }]}
            onPress={() => loadTraining()}
            activeOpacity={0.8}
          >
            <Text style={styles.loginBtnText}>{t('training.tryAgain')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {!loading && !error && (
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => loadTraining(true)} tintColor={colors.gold[500]} />
          }
        >
          {/* Hero */}
          <Animated.View entering={FadeInDown.duration(600)}>
            <LinearGradient
              colors={['rgba(201,169,110,0.15)', 'rgba(201,169,110,0.03)']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.hero}
            >
              <Ionicons name="school" size={40} color={colors.gold[500]} />
              <Text style={styles.heroTitle}>{t('training.heroTitle')}</Text>
              <Text style={styles.heroSub}>{t('training.heroSubtitle')}</Text>
              {stats && (
                <View style={styles.statsRow}>
                  <View style={styles.statPill}>
                    <Ionicons name="document-text" size={13} color={colors.gold[500]} />
                    <Text style={styles.statText}>{t('training.guides', { count: stats.totalDocuments })}</Text>
                  </View>
                  <View style={styles.statPill}>
                    <Ionicons name="flask" size={13} color={colors.gold[500]} />
                    <Text style={styles.statText}>{t('training.products', { count: stats.totalProductDocs })}</Text>
                  </View>
                  <View style={styles.statPill}>
                    <Ionicons name="play-circle" size={13} color={colors.gold[500]} />
                    <Text style={styles.statText}>{t('training.videos', { count: stats.totalVideos })}</Text>
                  </View>
                </View>
              )}
            </LinearGradient>
          </Animated.View>

          {/* Training Documents */}
          {trainingDocs.length > 0 && (
            <Animated.View entering={FadeInDown.duration(500).delay(150)}>
              <View style={styles.sectionHeader}>
                <View style={styles.sectionIconBg}>
                  <Ionicons name="document-text" size={18} color={colors.gold[500]} />
                </View>
                <Text style={styles.sectionTitle}>{t('training.trainingDocuments')}</Text>
              </View>
              {trainingDocs.map((doc: any, i: number) => (
                <Animated.View key={doc.id} entering={FadeInRight.duration(400).delay(200 + i * 60)}>
                  <TouchableOpacity
                    style={styles.docCard}
                    onPress={() => openDocument(doc.downloadUrl)}
                    activeOpacity={0.75}
                  >
                    <View style={styles.docIconWrap}>
                      <Ionicons name={getDocIcon(doc.icon)} size={18} color={colors.gold[500]} />
                    </View>
                    <View style={styles.docInfo}>
                      <Text style={styles.docTitle} numberOfLines={2}>{doc.title}</Text>
                      <Text style={styles.docSize}>{doc.fileSize}</Text>
                    </View>
                    <View style={styles.pdfBadge}>
                      <Ionicons name="download-outline" size={14} color={colors.gold[500]} />
                      <Text style={styles.pdfBadgeText}>PDF</Text>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </Animated.View>
          )}

          {/* Product Documentation */}
          {productDocs.length > 0 && (
            <Animated.View entering={FadeInDown.duration(500).delay(300)} style={{ marginTop: spacing.xxl }}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIconBg, { backgroundColor: 'rgba(201,169,110,0.12)' }]}>
                  <Ionicons name="flask" size={18} color={colors.gold[500]} />
                </View>
                <Text style={styles.sectionTitle}>{t('training.productDocumentation')}</Text>
              </View>
              {productDocs.map((doc: any, i: number) => (
                <Animated.View key={doc.id} entering={FadeInRight.duration(400).delay(350 + i * 60)}>
                  <TouchableOpacity
                    style={styles.productDocCard}
                    onPress={() => openDocument(doc.downloadUrl)}
                    activeOpacity={0.75}
                  >
                    <View style={styles.productImageWrap}>
                      {doc.image ? (
                        <Image source={{ uri: doc.image }} style={styles.productImage} contentFit="cover" />
                      ) : (
                        <View style={[styles.productImage, { alignItems: 'center', justifyContent: 'center', backgroundColor: colors.bg.elevated }]}>
                          <Ionicons name="flask-outline" size={20} color={colors.text.muted} />
                        </View>
                      )}
                    </View>
                    <View style={styles.docInfo}>
                      <Text style={styles.docTitle} numberOfLines={2}>{doc.title}</Text>
                      <Text style={styles.docSize}>{doc.fileSize}</Text>
                    </View>
                    <View style={styles.pdfBadge}>
                      <Ionicons name="download-outline" size={14} color={colors.gold[500]} />
                      <Text style={styles.pdfBadgeText}>PDF</Text>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </Animated.View>
          )}

          {/* Video Lessons */}
          {videos.length > 0 && (
            <Animated.View entering={FadeInDown.duration(500).delay(450)} style={{ marginTop: spacing.xxl }}>
              <View style={styles.sectionHeader}>
                <View style={[styles.sectionIconBg, { backgroundColor: 'rgba(201,169,110,0.12)' }]}>
                  <Ionicons name="play-circle" size={18} color={colors.gold[500]} />
                </View>
                <Text style={styles.sectionTitle}>{t('training.videoLessons')}</Text>
              </View>
              {videos.map((video: any, i: number) => (
                <Animated.View key={video.id} entering={FadeInRight.duration(400).delay(500 + i * 80)}>
                  <TouchableOpacity
                    style={styles.videoCard}
                    onPress={() => openVideo(video.youtubeId)}
                    activeOpacity={0.8}
                  >
                    <View style={styles.videoThumb}>
                      {video.thumbnail ? (
                        <Image source={{ uri: video.thumbnail }} style={styles.videoThumbImage} contentFit="cover" />
                      ) : (
                        <View style={[styles.videoThumbImage, { backgroundColor: colors.bg.elevated }]} />
                      )}
                      <View style={styles.playOverlay}>
                        <Ionicons name="play" size={22} color="#fff" />
                      </View>
                      {video.duration && (
                        <View style={styles.durationBadge}>
                          <Text style={styles.durationText}>{video.duration}</Text>
                        </View>
                      )}
                    </View>
                    <View style={styles.videoInfo}>
                      <Text style={styles.videoTitle} numberOfLines={2}>{video.title}</Text>
                      <View style={styles.videoMeta}>
                        {video.level && (
                          <View style={styles.levelBadge}>
                            <Text style={styles.levelText}>{video.level}</Text>
                          </View>
                        )}
                        {video.category && (
                          <Text style={styles.videoCategory}>{video.category}</Text>
                        )}
                      </View>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </Animated.View>
          )}

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>{t('training.footerCompany')}</Text>
            <Text style={styles.footerSub}>{t('training.footerResources')}</Text>
            <TouchableOpacity onPress={() => Linking.openURL('https://www.genosys.ae')} activeOpacity={0.7}>
              <Text style={styles.footerLink}>www.genosys.ae</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
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
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20 },

  hero: {
    borderRadius: radius.xxl,
    padding: spacing.xl,
    alignItems: 'center',
    marginBottom: spacing.xxl,
    borderWidth: 1,
    borderColor: colors.gold[500] + '20',
  },
  heroTitle: { ...typography.title2, marginTop: spacing.md },
  heroSub: { ...typography.caption1, color: colors.text.secondary, textAlign: 'center', marginTop: spacing.xs },
  statsRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg, flexWrap: 'wrap', justifyContent: 'center' },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.bg.surface,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  statText: { ...typography.caption2, color: colors.text.secondary, fontWeight: '600' },

  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.lg, gap: spacing.md },
  sectionIconBg: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: colors.glass.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: { ...typography.headline, fontSize: 16 },

  docCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.surface,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  docIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.glass.light,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docInfo: { flex: 1, marginLeft: spacing.md },
  docTitle: { ...typography.headline, fontSize: 14 },
  docSize: { ...typography.caption2, color: colors.text.muted, marginTop: 2 },
  pdfBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.glass.light,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: radius.sm,
  },
  pdfBadgeText: { ...typography.caption2, color: colors.gold[500], fontWeight: '700' },

  productDocCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.bg.surface,
    borderRadius: radius.lg,
    padding: spacing.sm,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  productImageWrap: {
    width: 48,
    height: 48,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: colors.bg.elevated,
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  productImage: { width: '100%', height: '100%' },

  videoCard: {
    backgroundColor: colors.bg.surface,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glass.border,
    marginBottom: spacing.md,
  },
  videoThumb: {
    height: 180,
    backgroundColor: colors.bg.elevated,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  videoThumbImage: { width: '100%', height: '100%' },
  playOverlay: {
    position: 'absolute',
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.gold[500] + 'E6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  durationText: { ...typography.caption2, color: '#fff', fontWeight: '600', fontSize: 11 },
  videoInfo: { padding: spacing.md },
  videoTitle: { ...typography.headline, fontSize: 14, marginBottom: spacing.sm },
  videoMeta: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  levelBadge: {
    backgroundColor: colors.glass.light,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radius.sm,
  },
  levelText: { ...typography.caption2, fontWeight: '600', color: colors.gold[500] },
  videoCategory: { ...typography.caption2, color: colors.text.muted },

  footer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.glass.border,
    marginTop: spacing.xxl,
  },
  footerText: { ...typography.headline, fontSize: 14 },
  footerSub: { ...typography.caption2, color: colors.text.muted, marginTop: 4 },
  footerLink: { ...typography.caption1, color: colors.gold[500], marginTop: spacing.sm },

  loadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
  loadingText: { ...typography.caption1, color: colors.text.secondary },

  loginContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 40 },
  loginTitle: { ...typography.headline, marginTop: spacing.lg, marginBottom: spacing.xs },
  loginSub: { ...typography.caption1, color: colors.text.secondary, textAlign: 'center', marginBottom: spacing.xl },
  loginBtn: {
    backgroundColor: colors.gold[500],
    paddingHorizontal: spacing.xxl,
    paddingVertical: spacing.md,
    borderRadius: radius.pill,
  },
  loginBtnText: { ...typography.label, color: colors.text.inverse, fontWeight: '700' },
});
