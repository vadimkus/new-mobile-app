import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, typography, spacing, radius } from '../../constants/theme';
import { useLocalization } from '../../contexts/LocalizationContext';
import { requestPasswordReset } from '../../services/api';
import GlassCard from '../../components/ui/GlassCard';
import GoldButton from '../../components/ui/GoldButton';

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

export default function ForgotPasswordScreen() {
  const { t } = useLocalization();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const canSubmit = useMemo(() => isValidEmail(email) && !loading, [email, loading]);

  const handleSend = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!isValidEmail(email)) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(t('common.error'), t('authScreen.invalidEmail'));
      return;
    }

    try {
      setLoading(true);
      const result = await requestPasswordReset(email.trim());

      if (!result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert(t('common.error'), result.error || t('authScreen.genericError'));
        return;
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        t('authScreen.resetEmailSentTitle'),
        t('authScreen.resetEmailSentMessage'),
        [
          {
            text: t('common.ok'),
            onPress: () => router.push({ pathname: '/auth/reset-password', params: { email: email.trim() } }),
          },
        ],
      );
    } catch {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(t('common.error'), t('authScreen.genericError'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
            <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{t('authScreen.forgotPasswordTitle')}</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.content}>
          <Animated.View entering={FadeInDown.duration(500)}>
            <Text style={styles.subtitle}>{t('authScreen.forgotPasswordSubtitle')}</Text>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(500).delay(100)}>
            <GlassCard>
              <Text style={styles.label}>{t('authScreen.emailLabel')}</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder={t('authScreen.emailPlaceholder')}
                placeholderTextColor={colors.text.tertiary}
                autoCapitalize="none"
                keyboardType="email-address"
                autoCorrect={false}
                style={styles.input}
              />
            </GlassCard>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(500).delay(200)} style={styles.btnWrap}>
            <GoldButton
              title={loading ? '' : t('authScreen.sendResetCode')}
              onPress={handleSend}
              disabled={!canSubmit}
              fullWidth
              size="lg"
            />
            {loading && (
              <View style={styles.loaderOverlay}>
                <ActivityIndicator color={colors.bg.primary} size="small" />
              </View>
            )}
          </Animated.View>

          <TouchableOpacity onPress={() => router.back()} style={styles.backLink}>
            <Text style={styles.backLinkText}>{t('authScreen.backToLogin')}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg.primary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: spacing.sm },
  navBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...typography.title3, letterSpacing: 0.5 },
  content: { flex: 1, paddingHorizontal: 20, paddingTop: spacing.xl },
  subtitle: { ...typography.bodySmall, color: colors.text.secondary, lineHeight: 22, marginBottom: spacing.xl },
  label: { ...typography.caption1, color: colors.text.secondary, marginBottom: spacing.xs, fontWeight: '600' },
  input: {
    ...typography.body,
    color: colors.text.primary,
    height: 48,
    borderWidth: 1,
    borderColor: colors.glass.border,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
    backgroundColor: 'rgba(255,255,255,0.03)',
    marginTop: spacing.xs,
  },
  btnWrap: { marginTop: spacing.xl, position: 'relative' },
  loaderOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
  backLink: { alignSelf: 'center', marginTop: spacing.lg, paddingVertical: spacing.sm },
  backLinkText: { ...typography.bodySmall, color: colors.gold[500] },
});
