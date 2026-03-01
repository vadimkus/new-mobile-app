import React, { useState } from 'react';
import { View, Text, ScrollView, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, radius } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { useLocalization } from '../../contexts/LocalizationContext';
import { updateUserProfile, deleteAccount } from '../../services/api';
import GoldButton from '../../components/ui/GoldButton';

export default function EditProfileScreen() {
  const { user, token, logout, refreshProfile } = useAuth();
  const { t } = useLocalization();

  const nameParts = (user?.name || '').split(' ');
  const [firstName, setFirstName] = useState(nameParts[0] || '');
  const [lastName, setLastName] = useState(nameParts.slice(1).join(' ') || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [address, setAddress] = useState(user?.address || '');
  const [emirate, setEmirate] = useState(user?.emirate || '');
  const [birthday, setBirthday] = useState(user?.birthday || '');
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    if (!token) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setSaving(true);
    try {
      const fullName = `${firstName.trim()} ${lastName.trim()}`.trim();
      const result = await updateUserProfile(token, {
        name: fullName || undefined,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        emirate: emirate.trim() || undefined,
        birthday: birthday.trim() || undefined,
      });
      if (result.success) {
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await refreshProfile();
        Alert.alert(t('alerts.saved'), t('alerts.profileUpdated'));
        router.back();
      } else {
        Alert.alert(t('alerts.error'), result.error || t('alerts.failedToUpdateProfile'));
      }
    } catch (e: any) {
      Alert.alert(t('alerts.error'), e?.message || t('alerts.somethingWentWrong'));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      t('profile.deleteAccount'),
      t('profile.deleteAccountConfirm'),
      [
        { text: t('addressesPage.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            if (!token) return;
            try {
              const result = await deleteAccount(token);
              if (result.success) {
                Alert.alert(t('alerts.accountDeleted'), t('alerts.accountRemoved'));
                await logout();
              } else {
                Alert.alert(t('alerts.error'), result.error || t('alerts.failedToDeleteAccount'));
              }
            } catch (e: any) {
              Alert.alert(t('alerts.error'), e?.message || t('alerts.somethingWentWrong'));
            }
          },
        },
      ],
    );
  };

  const initial = `${firstName[0] || ''}${lastName[0] || ''}`.toUpperCase() || 'G';

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('profile.editProfile')}</Text>
        <TouchableOpacity onPress={handleSave} style={styles.navBtn} disabled={saving}>
          {saving ? (
            <ActivityIndicator size="small" color={colors.gold[500]} />
          ) : (
            <Text style={styles.saveText}>{t('common.save')}</Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Animated.View entering={FadeInDown.duration(500)} style={styles.avatarSection}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{initial}</Text>
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(150)}>
          <Text style={styles.sectionLabel}>{t('profile.personalInformation')}</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>First Name *</Text>
            <TextInput style={styles.input} value={firstName} onChangeText={setFirstName} placeholderTextColor={colors.text.muted} selectionColor={colors.gold[500]} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Last Name</Text>
            <TextInput style={styles.input} value={lastName} onChangeText={setLastName} placeholderTextColor={colors.text.muted} selectionColor={colors.gold[500]} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput style={[styles.input, styles.inputDisabled]} value={user?.email || ''} editable={false} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone</Text>
            <TextInput style={styles.input} value={phone} onChangeText={setPhone} keyboardType="phone-pad" placeholder="+971 XX XXX XXXX" placeholderTextColor={colors.text.muted} selectionColor={colors.gold[500]} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('checkout.deliveryAddress')}</Text>
            <TextInput style={styles.input} value={address} onChangeText={setAddress} placeholder={t('placeholders.streetBuildingApartment')} placeholderTextColor={colors.text.muted} selectionColor={colors.gold[500]} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('placeholders.emirate')}</Text>
            <TextInput style={styles.input} value={emirate} onChangeText={setEmirate} placeholder={t('placeholders.dubai')} placeholderTextColor={colors.text.muted} selectionColor={colors.gold[500]} />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>{t('profile.dateOfBirth')}</Text>
            <TextInput style={styles.input} value={birthday} onChangeText={setBirthday} placeholder={t('placeholders.dateFormat')} placeholderTextColor={colors.text.muted} keyboardType="numbers-and-punctuation" selectionColor={colors.gold[500]} />
          </View>
        </Animated.View>

        <Animated.View entering={FadeInDown.duration(500).delay(300)} style={styles.dangerZone}>
          <Text style={styles.sectionLabel}>{t('profile.dangerZone')}</Text>
          <TouchableOpacity style={styles.deleteBtn} onPress={handleDeleteAccount}>
            <Ionicons name="trash-outline" size={18} color={colors.status.error} />
            <Text style={styles.deleteText}>{t('profile.deleteAccount')}</Text>
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

  sectionLabel: { ...typography.label, color: colors.text.secondary, textTransform: 'uppercase', fontSize: 11, letterSpacing: 0.5, marginTop: spacing.xl, marginBottom: spacing.lg },
  inputGroup: { marginBottom: spacing.lg },
  inputLabel: { ...typography.label, color: colors.text.secondary, marginBottom: spacing.sm, fontSize: 13 },
  input: { ...typography.body, color: colors.text.primary, backgroundColor: colors.bg.surface, borderWidth: 1, borderColor: colors.glass.border, borderRadius: radius.md, paddingVertical: 14, paddingHorizontal: 16 },
  inputDisabled: { opacity: 0.5 },

  dangerZone: { marginTop: spacing.xxl },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, backgroundColor: 'rgba(255,69,58,0.08)', borderRadius: radius.md, paddingVertical: 14, paddingHorizontal: 16, borderWidth: 1, borderColor: 'rgba(255,69,58,0.2)' },
  deleteText: { ...typography.headline, color: colors.status.error, fontSize: 15 },
});
