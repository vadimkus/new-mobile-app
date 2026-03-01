import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, radius } from '../../constants/theme';
import GlassCard from '../../components/ui/GlassCard';
import MenuRow from '../../components/ui/MenuRow';
import SectionHeader from '../../components/ui/SectionHeader';
import { useAuth } from '../../contexts/AuthContext';
import { useLocalization } from '../../contexts/LocalizationContext';
import { isBiometricEnabled, enableBiometricAuth, disableBiometricAuth, checkBiometricSupport } from '../../services/biometricService';

export default function ProfileScreen() {
  const { user, token, logout } = useAuth();
  const { locale, t } = useLocalization();
  const langLabel = locale === 'ar' ? 'العربية' : locale === 'ru' ? 'Русский' : 'English';
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);

  useEffect(() => {
    (async () => {
      const support = await checkBiometricSupport();
      setBiometricAvailable(support.isAvailable && support.isEnrolled);
      const enabled = await isBiometricEnabled();
      setBiometricEnabled(enabled);
    })();
  }, []);

  const handleBiometricToggle = useCallback(async (value: boolean) => {
    if (value) {
      if (!user?.email || !token) {
        Alert.alert(t('alerts.loginRequired'), t('alerts.loginForBiometric'));
        return;
      }
      const result = await enableBiometricAuth({ email: user.email, token });
      setBiometricEnabled(result.success);
    } else {
      await disableBiometricAuth();
      setBiometricEnabled(false);
    }
  }, [user, token, t]);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('navigation.profile')}</Text>
          <View style={{ width: 40 }} />
        </Animated.View>

        {/* Avatar card */}
        <Animated.View entering={FadeInDown.duration(500).delay(100)}>
          <GlassCard intensity="medium" padding="xl">
            <View style={styles.avatarSection}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{user?.name?.[0]?.toUpperCase() || 'G'}</Text>
                <View style={styles.onlineDot} />
              </View>
              <View style={styles.userInfo}>
                <View style={styles.nameRow}>
                  <Text style={styles.userName}>{user?.name || 'Guest'}</Text>
                  {(user as any)?.memberTier && (user as any).memberTier !== 'MEMBER' && (
                    <View style={styles.tierPill}>
                      <Ionicons name="diamond" size={8} color={colors.gold[500]} />
                      <Text style={styles.tierPillText}>{(user as any).memberTier}</Text>
                    </View>
                  )}
                </View>
                <Text style={styles.userEmail}>{user?.email || 'Not signed in'}</Text>
                {(user?.discount ?? 0) > 0 && (
                <View style={styles.discountBadge}>
                  <Text style={styles.discountText}>{user!.discount}% VIP Discount</Text>
                </View>
                )}
              </View>
              <TouchableOpacity
                onPress={() => router.push('/profile/edit')}
                style={styles.editBtn}
              >
                <Ionicons name="pencil-outline" size={16} color={colors.gold[500]} />
              </TouchableOpacity>
            </View>
          </GlassCard>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View entering={FadeInDown.duration(500).delay(200)} style={styles.quickActions}>
          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => router.push('/profile/orders')}
            activeOpacity={0.8}
          >
            <Ionicons name="receipt-outline" size={22} color={colors.gold[500]} />
            <Text style={styles.quickLabel}>Orders</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => router.push('/(tabs)/bag')}
            activeOpacity={0.8}
          >
            <Ionicons name="bag-outline" size={22} color={colors.gold[500]} />
            <Text style={styles.quickLabel}>Bag</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.quickCard}
            onPress={() => router.push('/profile/favorites')}
            activeOpacity={0.8}
          >
            <Ionicons name="heart-outline" size={22} color={colors.gold[500]} />
            <Text style={styles.quickLabel}>Favorites</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Membership Card */}
        <Animated.View entering={FadeInDown.duration(500).delay(300)}>
          <TouchableOpacity
            style={styles.membershipBanner}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push('/profile/membership');
            }}
            activeOpacity={0.85}
          >
            <View style={styles.membershipLeft}>
              <Ionicons name="diamond" size={18} color={colors.gold[500]} />
              <View>
                <Text style={styles.membershipLabel}>{t('membership.title')}</Text>
                <Text style={styles.membershipTier}>
                  {(user as any)?.memberNumber || ''}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.text.tertiary} />
          </TouchableOpacity>
        </Animated.View>

        {/* Account & Settings */}
        <Animated.View entering={FadeInDown.duration(500).delay(350)}>
          <Text style={styles.sectionTitle}>{t('profile.accountSection')}</Text>
          <GlassCard padding="xs" noBorder>
            <MenuRow icon="person-outline" label={t('profile.personalInformation')} onPress={() => router.push('/profile/edit')} />
            <MenuRow icon="location-outline" label={t('profile.addresses')} onPress={() => router.push('/profile/addresses')} />
            <MenuRow icon="card-outline" label={t('profile.paymentAndBilling')} onPress={() => router.push('/profile/payment')} />
          </GlassCard>
        </Animated.View>

        {/* Privacy & Security */}
        <Animated.View entering={FadeInDown.duration(500).delay(400)}>
          <Text style={styles.sectionTitle}>{t('profile.privacyAndSecurity')}</Text>
          <GlassCard padding="xs" noBorder>
            {biometricAvailable && (
              <MenuRow icon="finger-print-outline" label={t('profile.biometricAuthentication')} isSwitch switchValue={biometricEnabled} onSwitchChange={handleBiometricToggle} />
            )}
            <MenuRow icon="mail-outline" label={t('profile.emailNotifications')} isSwitch switchValue={emailNotifs} onSwitchChange={setEmailNotifs} />
            <MenuRow icon="notifications-outline" label={t('profile.pushNotifications')} isSwitch switchValue={pushNotifs} onSwitchChange={setPushNotifs} />
            <MenuRow icon="shield-checkmark-outline" label={t('profile.privacyPolicy')} onPress={() => router.push('/profile/privacy')} />
            <MenuRow icon="document-text-outline" label={t('profile.termsAndConditions')} onPress={() => router.push('/profile/terms')} />
          </GlassCard>
        </Animated.View>

        {/* General */}
        <Animated.View entering={FadeInDown.duration(500).delay(500)}>
          <Text style={styles.sectionTitle}>{t('profile.general')}</Text>
          <GlassCard padding="xs" noBorder>
            <MenuRow icon="language-outline" label={t('profile.language')} rightText={langLabel} onPress={() => router.push('/profile/language')} />
            <MenuRow icon="help-circle-outline" label={t('profile.helpAndSupport')} onPress={() => router.push('/profile/help')} />
            <MenuRow icon="chatbubbles-outline" label={t('profile.contactUs')} onPress={() => router.push('/profile/contact')} />
            <MenuRow icon="gift-outline" label={t('promo.infoTitle')} onPress={() => router.push('/profile/promo')} />
            <MenuRow icon="school-outline" label={t('navigation.training')} onPress={() => router.push('/profile/training')} />
            <MenuRow icon="information-circle-outline" label={t('profile.aboutGenosys')} onPress={() => router.push('/profile/about')} />
          </GlassCard>
        </Animated.View>

        {/* Sign Out */}
        <Animated.View entering={FadeInDown.duration(500).delay(600)} style={styles.signOutSection}>
          <GlassCard padding="xs" noBorder>
            <MenuRow
              icon="log-out-outline"
              label={t('common.logout')}
              destructive
              showChevron={false}
              onPress={() => {
                Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                logout();
              }}
            />
          </GlassCard>
        </Animated.View>

        {/* Version */}
        <Text style={styles.version}>GENOSYS v2.0.0</Text>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg.primary },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20 },

  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.xl, paddingVertical: spacing.sm },
  backBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...typography.title2, letterSpacing: 1 },

  avatarSection: { flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: colors.gold[500], alignItems: 'center', justifyContent: 'center', marginRight: spacing.lg },
  avatarText: { ...typography.title2, color: colors.text.inverse, fontSize: 22 },
  onlineDot: { position: 'absolute', bottom: 2, right: 2, width: 12, height: 12, borderRadius: 6, backgroundColor: colors.status.success, borderWidth: 2, borderColor: colors.bg.surface },
  userInfo: { flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  userName: { ...typography.headline, fontSize: 17 },
  tierPill: { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(201,169,110,0.12)', paddingHorizontal: 8, paddingVertical: 2, borderRadius: radius.pill },
  tierPillText: { fontSize: 9, fontWeight: '700', color: colors.gold[500], letterSpacing: 0.8 },
  userEmail: { ...typography.caption1, color: colors.text.secondary, marginTop: 2 },
  discountBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(201,169,110,0.15)', paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.pill, marginTop: spacing.xs },
  discountText: { ...typography.caption2, color: colors.gold[500], fontWeight: '700', fontSize: 10 },
  editBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.glass.light, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.glass.border },

  quickActions: { flexDirection: 'row', gap: spacing.md, marginVertical: spacing.xl },
  quickCard: { flex: 1, backgroundColor: colors.bg.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.glass.border, paddingVertical: spacing.lg, alignItems: 'center', gap: spacing.sm },
  quickLabel: { ...typography.label, color: colors.text.primary, fontSize: 12 },

  sectionTitle: { ...typography.label, color: colors.text.secondary, marginTop: spacing.xxl, marginBottom: spacing.md, marginLeft: spacing.xs, letterSpacing: 0.5, textTransform: 'uppercase', fontSize: 11 },

  membershipBanner: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: colors.bg.surface, borderRadius: radius.lg,
    borderWidth: 1, borderColor: 'rgba(201,169,110,0.15)',
    paddingHorizontal: spacing.lg, paddingVertical: spacing.lg,
    marginBottom: spacing.md,
  },
  membershipLeft: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  membershipLabel: { ...typography.headline, fontSize: 14, color: colors.text.primary },
  membershipTier: { ...typography.caption2, color: colors.gold[500], marginTop: 1, letterSpacing: 1.5, fontSize: 10 },

  signOutSection: { marginTop: spacing.xl },
  version: { ...typography.caption2, color: colors.text.muted, textAlign: 'center', marginTop: spacing.xxl },
});
