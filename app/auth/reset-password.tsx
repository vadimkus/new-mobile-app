import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import * as Haptics from 'expo-haptics';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, typography, spacing, radius } from '../../constants/theme';
import { useLocalization } from '../../contexts/LocalizationContext';
import { resetPasswordWithToken } from '../../services/api';
import GlassCard from '../../components/ui/GlassCard';
import GoldButton from '../../components/ui/GoldButton';

export default function ResetPasswordScreen() {
  const { t } = useLocalization();
  const params = useLocalSearchParams();
  const email = typeof params?.email === 'string' ? params.email : '';

  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const canSubmit = useMemo(() => {
    if (loading) return false;
    if (!resetCode || resetCode.trim().length < 10) return false;
    if (!newPassword || newPassword.length < 8) return false;
    if (newPassword !== confirmPassword) return false;
    return true;
  }, [resetCode, newPassword, confirmPassword, loading]);

  const handleReset = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    if (!newPassword || newPassword.length < 8) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(t('common.error'), t('authScreen.passwordTooShort8'));
      return;
    }
    if (newPassword !== confirmPassword) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
      Alert.alert(t('common.error'), t('authScreen.passwordsDontMatch'));
      return;
    }

    try {
      setLoading(true);
      const result = await resetPasswordWithToken(resetCode.trim(), newPassword);

      if (!result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert(t('common.error'), result.error || t('authScreen.genericError'));
        return;
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      Alert.alert(
        t('authScreen.passwordResetSuccessTitle'),
        t('authScreen.passwordResetSuccessMessage'),
        [{ text: t('common.ok'), onPress: () => router.replace('/auth/login') }],
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
          <Text style={styles.headerTitle}>{t('authScreen.resetPasswordTitle')}</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          {!!email && (
            <Animated.View entering={FadeInDown.duration(500)}>
              <Text style={styles.emailHint}>
                {t('authScreen.resetForEmail', { email })}
              </Text>
            </Animated.View>
          )}

          <Animated.View entering={FadeInDown.duration(500).delay(100)}>
            <GlassCard>
              <Text style={styles.label}>{t('authScreen.resetCodeLabel')}</Text>
              <TextInput
                value={resetCode}
                onChangeText={setResetCode}
                placeholder={t('authScreen.resetCodePlaceholder')}
                placeholderTextColor={colors.text.tertiary}
                autoCapitalize="none"
                autoCorrect={false}
                style={styles.input}
              />

              <Text style={[styles.label, { marginTop: spacing.lg }]}>{t('authScreen.newPasswordLabel')}</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  value={newPassword}
                  onChangeText={setNewPassword}
                  placeholder={t('authScreen.newPasswordPlaceholder')}
                  placeholderTextColor={colors.text.tertiary}
                  secureTextEntry={!showPassword}
                  style={[styles.input, { flex: 1 }]}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.text.tertiary} />
                </TouchableOpacity>
              </View>

              <Text style={[styles.label, { marginTop: spacing.lg }]}>{t('authScreen.confirmPasswordLabel')}</Text>
              <TextInput
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder={t('authScreen.confirmPasswordPlaceholder')}
                placeholderTextColor={colors.text.tertiary}
                secureTextEntry={!showPassword}
                style={styles.input}
              />

              {newPassword.length > 0 && newPassword.length < 8 && (
                <Text style={styles.hint}>{t('authScreen.passwordTooShort8')}</Text>
              )}
              {confirmPassword.length > 0 && newPassword !== confirmPassword && (
                <Text style={styles.hint}>{t('authScreen.passwordsDontMatch')}</Text>
              )}
            </GlassCard>
          </Animated.View>

          <Animated.View entering={FadeInDown.duration(500).delay(200)} style={styles.btnWrap}>
            <GoldButton
              title={loading ? '' : t('authScreen.resetPasswordButton')}
              onPress={handleReset}
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

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg.primary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: spacing.sm },
  navBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...typography.title3, letterSpacing: 0.5 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, paddingTop: spacing.lg },
  emailHint: { ...typography.caption1, color: colors.text.secondary, marginBottom: spacing.md },
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
  passwordRow: { flexDirection: 'row', alignItems: 'center' },
  eyeBtn: { position: 'absolute', right: 12, top: 0, bottom: 0, justifyContent: 'center' },
  hint: { ...typography.caption2, color: colors.status.warning, marginTop: spacing.xs },
  btnWrap: { marginTop: spacing.xl, position: 'relative' },
  loaderOverlay: { ...StyleSheet.absoluteFillObject, alignItems: 'center', justifyContent: 'center' },
});
