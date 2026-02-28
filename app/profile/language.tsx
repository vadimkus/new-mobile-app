import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, radius } from '../../constants/theme';
import GlassCard from '../../components/ui/GlassCard';

const LANGUAGES = [
  { code: 'en', name: 'English', native: 'English' },
  { code: 'ru', name: 'Russian', native: 'Русский' },
  { code: 'ar', name: 'Arabic', native: 'العربية' },
];

export default function LanguageScreen() {
  const [selected, setSelected] = useState('en');

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}><Ionicons name="arrow-back" size={22} color={colors.text.primary} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Language</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(500)}>
          <GlassCard>
            {LANGUAGES.map((lang, i) => (
              <TouchableOpacity
                key={lang.code}
                style={[styles.langRow, i > 0 && styles.langBorder, selected === lang.code && styles.langActive]}
                onPress={() => { Haptics.selectionAsync(); setSelected(lang.code); }}
              >
                <View>
                  <Text style={styles.langName}>{lang.name}</Text>
                  <Text style={styles.langNative}>{lang.native}</Text>
                </View>
                {selected === lang.code && <Ionicons name="checkmark-circle" size={22} color={colors.gold[500]} />}
              </TouchableOpacity>
            ))}
          </GlassCard>
        </Animated.View>
        <Text style={styles.tip}>Switching to Arabic will enable right-to-left layout. The app may restart.</Text>
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
  langActive: {},
  langName: { ...typography.headline, fontSize: 16 },
  langNative: { ...typography.caption1, color: colors.text.secondary, marginTop: 2 },
  tip: { ...typography.caption1, color: colors.text.tertiary, textAlign: 'center', marginTop: spacing.xl, paddingHorizontal: spacing.xl },
});
