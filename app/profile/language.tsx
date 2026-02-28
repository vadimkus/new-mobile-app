import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, radius } from '../../constants/theme';
import { useLocalization } from '../../contexts/LocalizationContext';
import GlassCard from '../../components/ui/GlassCard';

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
  { code: 'ru', name: 'Russian', native: 'Русский', flag: '🇷🇺' },
  { code: 'ar', name: 'Arabic', native: 'العربية', flag: '🇦🇪' },
];

export default function LanguageScreen() {
  const { locale, setLocale, t } = useLocalization();

  const handleSelect = async (code: string) => {
    if (code === locale) return;
    Haptics.selectionAsync();

    if (code === 'ar' && locale !== 'ar') {
      Alert.alert(
        t('profile.language'),
        'Switching to Arabic will enable right-to-left layout. The app may restart.',
        [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('common.continue'), onPress: () => setLocale(code) },
        ],
      );
      return;
    }

    if (locale === 'ar' && code !== 'ar') {
      Alert.alert(
        t('profile.language'),
        'Switching from Arabic will disable right-to-left layout. The app may restart.',
        [
          { text: t('common.cancel'), style: 'cancel' },
          { text: t('common.continue'), onPress: () => setLocale(code) },
        ],
      );
      return;
    }

    await setLocale(code);
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('profile.language')}</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(500)}>
          <GlassCard>
            {LANGUAGES.map((lang, i) => (
              <TouchableOpacity
                key={lang.code}
                style={[styles.langRow, i > 0 && styles.langBorder]}
                onPress={() => handleSelect(lang.code)}
                activeOpacity={0.7}
              >
                <View style={styles.langInfo}>
                  <Text style={styles.langFlag}>{lang.flag}</Text>
                  <View>
                    <Text style={[styles.langName, locale === lang.code && styles.langNameActive]}>
                      {lang.name}
                    </Text>
                    <Text style={styles.langNative}>{lang.native}</Text>
                  </View>
                </View>
                {locale === lang.code && (
                  <Ionicons name="checkmark-circle" size={22} color={colors.gold[500]} />
                )}
              </TouchableOpacity>
            ))}
          </GlassCard>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(150)}>
          <Text style={styles.tip}>
            {locale === 'ar'
              ? 'العربية تدعم الكتابة من اليمين إلى اليسار'
              : locale === 'ru'
              ? 'Смена языка на арабский потребует перезагрузки для поддержки RTL'
              : 'Switching to Arabic will enable right-to-left layout. The app may restart.'}
          </Text>
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg.primary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: spacing.sm },
  navBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...typography.title3, letterSpacing: 0.5 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20 },

  langRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.lg },
  langBorder: { borderTopWidth: 1, borderTopColor: colors.glass.border },
  langInfo: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  langFlag: { fontSize: 24 },
  langName: { ...typography.headline, fontSize: 16 },
  langNameActive: { color: colors.gold[500] },
  langNative: { ...typography.caption1, color: colors.text.secondary, marginTop: 2 },
  tip: { ...typography.caption1, color: colors.text.tertiary, textAlign: 'center', marginTop: spacing.xl, paddingHorizontal: spacing.xl, lineHeight: 20 },
});
