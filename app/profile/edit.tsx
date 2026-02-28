import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, radius } from '../../constants/theme';
import GoldButton from '../../components/ui/GoldButton';

export default function EditProfileScreen() {
  const [firstName, setFirstName] = useState('Vadim');
  const [lastName, setLastName] = useState('Kus');
  const [email] = useState('vadimkus@genosys.ae');
  const [phone, setPhone] = useState('+971 50 123 4567');
  const [birthday, setBirthday] = useState('');

  const handleSave = () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    Alert.alert('Saved', 'Your profile has been updated');
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity onPress={handleSave} style={styles.navBtn}>
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {/* Avatar */}
        <Animated.View entering={FadeInDown.duration(500)} style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>VK</Text>
          </View>
          <TouchableOpacity style={styles.changePhotoBtn}>
            <Ionicons name="camera-outline" size={16} color={colors.gold[500]} />
            <Text style={styles.changePhotoText}>Change Photo</Text>
          </TouchableOpacity>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(150)}>
          <Text style={styles.sectionLabel}>Personal Information</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>First Name *</Text>
            <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholderTextColor={colors.text.muted} selectionColor={colors.gold[500]} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Last Name *</Text>
            <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholderTextColor={colors.text.muted} selectionColor={colors.gold[500]} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput style={[styles.input, styles.inputDisabled]} value={email} editable={false} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone *</Text>
            <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholderTextColor={colors.text.muted} selectionColor={colors.gold[500]} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Date of Birth</Text>
            <TextInput style={styles.input} value={birthday} onChangeText={setBirthday} placeholder="DD/MM/YYYY" placeholderTextColor={colors.text.muted} selectionColor={colors.gold[500]} />
          </View>
        </Animated.View>

        {/* Danger zone */}
        <Animated.View entering={FadeInDown.duration(500).delay(300)} style={styles.dangerZone}>
          <Text style={styles.sectionLabel}>Danger Zone</Text>
          <TouchableOpacity style={styles.deleteBtn} onPress={() => Alert.alert('Delete Account', 'Are you sure? This action cannot be undone.', [{ text: 'Cancel' }, { text: 'Delete', style: 'destructive' }])}>
            <Ionicons name="trash-outline" size={18} color={colors.status.error} />
            <Text style={styles.deleteText}>Delete Account</Text>
          </TouchableOpacity>
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg.primary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: spacing.sm },
  navBtn: { width: 50, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...typography.headline, letterSpacing: 0.5 },
  saveText: { ...typography.headline, color: colors.gold[500], fontSize: 15 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20 },

  avatarSection: { alignItems: 'center', marginVertical: spacing.xxl },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.gold[500], alignItems: 'center', justifyContent: 'center', marginBottom: spacing.md },
  avatarText: { ...typography.title1, color: colors.text.inverse },
  changePhotoBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  changePhotoText: { ...typography.label, color: colors.gold[500] },

  sectionLabel: { ...typography.label, color: colors.text.secondary, textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5, marginTop: spacing.xl, marginBottom: spacing.lg },
  inputGroup: { marginBottom: spacing.lg },
  inputLabel: { ...typography.label, color: colors.text.secondary, marginBottom: spacing.sm, fontSize: 13 },
  input: { ...typography.body, color: colors.text.primary, backgroundColor: colors.bg.surface, borderWidth: 1, borderColor: colors.glass.border, borderRadius: radius.md, paddingVertical: 14, paddingHorizontal: 16 },
  inputDisabled: { opacity: 0.5 },

  dangerZone: { marginTop: spacing.xxl },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: 'rgba(255,69,58,0.08)', borderRadius: radius.md, paddingVertical: 14, paddingHorizontal: 16, borderWidth: 1, borderColor: 'rgba(255,69,58,0.2)' },
  deleteText: { ...typography.headline, color: colors.status.error, fontSize: 15 },
});
