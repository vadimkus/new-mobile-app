import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
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

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [pushNotifs, setPushNotifs] = useState(true);

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <Animated.View entering={FadeInDown.duration(500)} style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Profile</Text>
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
                <Text style={styles.userName}>{user?.name || 'Guest'}</Text>
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

        {/* Account & Settings */}
        <Animated.View entering={FadeInDown.duration(500).delay(300)}>
          <Text style={styles.sectionTitle}>Account & Settings</Text>
          <GlassCard padding="xs" noBorder>
            <MenuRow icon="person-outline" label="Personal Information" subtitle="Name, email, phone" onPress={() => router.push('/profile/edit')} />
            <MenuRow icon="location-outline" label="Addresses" subtitle="Shipping addresses" onPress={() => router.push('/profile/addresses')} />
            <MenuRow icon="card-outline" label="Payment & Billing" subtitle="Payment methods, billing info" onPress={() => router.push('/profile/payment')} />
          </GlassCard>
        </Animated.View>

        {/* Privacy & Security */}
        <Animated.View entering={FadeInDown.duration(500).delay(400)}>
          <Text style={styles.sectionTitle}>Privacy & Security</Text>
          <GlassCard padding="xs" noBorder>
            <MenuRow icon="finger-print-outline" label="Biometric Login" isSwitch switchValue={biometricEnabled} onSwitchChange={setBiometricEnabled} />
            <MenuRow icon="mail-outline" label="Email Notifications" isSwitch switchValue={emailNotifs} onSwitchChange={setEmailNotifs} />
            <MenuRow icon="notifications-outline" label="Push Notifications" isSwitch switchValue={pushNotifs} onSwitchChange={setPushNotifs} />
            <MenuRow icon="shield-checkmark-outline" label="Privacy Policy" onPress={() => router.push('/profile/privacy')} />
            <MenuRow icon="document-text-outline" label="Terms & Conditions" onPress={() => router.push('/profile/terms')} />
          </GlassCard>
        </Animated.View>

        {/* General */}
        <Animated.View entering={FadeInDown.duration(500).delay(500)}>
          <Text style={styles.sectionTitle}>General</Text>
          <GlassCard padding="xs" noBorder>
            <MenuRow icon="language-outline" label="Language" rightText="English" onPress={() => router.push('/profile/language')} />
            <MenuRow icon="help-circle-outline" label="Help & Support" onPress={() => router.push('/profile/help')} />
            <MenuRow icon="chatbubbles-outline" label="Contact Us" onPress={() => router.push('/profile/contact')} />
            <MenuRow icon="gift-outline" label="Promotions" subtitle="Special offers & deals" onPress={() => router.push('/profile/promo')} />
            <MenuRow icon="school-outline" label="Training Materials" onPress={() => router.push('/profile/training')} />
            <MenuRow icon="information-circle-outline" label="About GENOSYS" onPress={() => router.push('/profile/about')} />
          </GlassCard>
        </Animated.View>

        {/* Sign Out */}
        <Animated.View entering={FadeInDown.duration(500).delay(600)} style={styles.signOutSection}>
          <GlassCard padding="xs" noBorder>
            <MenuRow
              icon="log-out-outline"
              label="Sign Out"
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
  userName: { ...typography.headline, fontSize: 17 },
  userEmail: { ...typography.caption1, color: colors.text.secondary, marginTop: 2 },
  discountBadge: { alignSelf: 'flex-start', backgroundColor: 'rgba(201,169,110,0.15)', paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.pill, marginTop: spacing.xs },
  discountText: { ...typography.caption2, color: colors.gold[500], fontWeight: '700', fontSize: 10 },
  editBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.glass.light, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: colors.glass.border },

  quickActions: { flexDirection: 'row', gap: spacing.md, marginVertical: spacing.xl },
  quickCard: { flex: 1, backgroundColor: colors.bg.surface, borderRadius: radius.lg, borderWidth: 1, borderColor: colors.glass.border, paddingVertical: spacing.lg, alignItems: 'center', gap: spacing.sm },
  quickLabel: { ...typography.label, color: colors.text.primary, fontSize: 12 },

  sectionTitle: { ...typography.label, color: colors.text.secondary, marginTop: spacing.xxl, marginBottom: spacing.md, marginLeft: spacing.xs, letterSpacing: 0.5, textTransform: 'uppercase', fontSize: 11 },

  signOutSection: { marginTop: spacing.xl },
  version: { ...typography.caption2, color: colors.text.muted, textAlign: 'center', marginTop: spacing.xxl },
});
