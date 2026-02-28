import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { colors, typography, spacing, radius } from '../../constants/theme';

const MODULES = [
  { title: 'Product Knowledge', subtitle: 'Learn about GENOSYS products', icon: 'flask-outline' as const, lessons: 12 },
  { title: 'Skin Analysis', subtitle: 'Professional skin assessment', icon: 'scan-outline' as const, lessons: 8 },
  { title: 'Treatment Protocols', subtitle: 'Step-by-step guides', icon: 'list-outline' as const, lessons: 15 },
  { title: 'Ingredient Science', subtitle: 'Active ingredients deep dive', icon: 'leaf-outline' as const, lessons: 10 },
];

export default function TrainingScreen() {
  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}><Ionicons name="arrow-back" size={22} color={colors.text.primary} /></TouchableOpacity>
        <Text style={styles.headerTitle}>Training</Text>
        <View style={{ width: 40 }} />
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(500)}>
          <Text style={styles.pageTitle}>Training Materials</Text>
          <Text style={styles.pageSub}>Professional education for skincare experts</Text>
        </Animated.View>

        {MODULES.map((m, i) => (
          <Animated.View key={m.title} entering={FadeInDown.duration(400).delay(100 + i * 80)}>
            <TouchableOpacity style={styles.moduleCard} activeOpacity={0.8}>
              <View style={styles.moduleIcon}>
                <Ionicons name={m.icon} size={22} color={colors.gold[500]} />
              </View>
              <View style={styles.moduleInfo}>
                <Text style={styles.moduleTitle}>{m.title}</Text>
                <Text style={styles.moduleSub}>{m.subtitle}</Text>
                <Text style={styles.moduleLessons}>{m.lessons} lessons</Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.text.muted} />
            </TouchableOpacity>
          </Animated.View>
        ))}
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

  pageTitle: { ...typography.title1, marginTop: spacing.md },
  pageSub: { ...typography.caption1, color: colors.text.secondary, marginTop: spacing.xs, marginBottom: spacing.xxl },

  moduleCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.bg.surface, borderRadius: radius.lg, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.glass.border },
  moduleIcon: { width: 48, height: 48, borderRadius: 14, backgroundColor: colors.glass.light, alignItems: 'center', justifyContent: 'center', marginRight: spacing.lg },
  moduleInfo: { flex: 1 },
  moduleTitle: { ...typography.headline, fontSize: 15 },
  moduleSub: { ...typography.caption1, color: colors.text.secondary, marginTop: 2 },
  moduleLessons: { ...typography.caption2, color: colors.gold[500], marginTop: spacing.xs },
});
