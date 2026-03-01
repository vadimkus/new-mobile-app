import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, TextInput, Alert, Modal, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors, typography, spacing, radius } from '../../constants/theme';
import { useAuth } from '../../contexts/AuthContext';
import { useLocalization } from '../../contexts/LocalizationContext';
import GlassCard from '../../components/ui/GlassCard';
import GoldButton from '../../components/ui/GoldButton';

const ADDRESSES_KEY = '@genosys_addresses';
const UAE_EMIRATES = ['Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman', 'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain'];

interface Address {
  id: string;
  type: string;
  name: string;
  address: string;
  emirate: string;
  phone: string;
  isDefault: boolean;
}

export default function AddressesScreen() {
  const { user } = useAuth();
  const { t } = useLocalization();
  const [addresses, setAddresses] = useState<Address[]>(() => {
    const defaultAddr: Address = {
      id: '1',
      type: 'Home',
      name: user?.name || 'Guest',
      address: user?.address || '',
      emirate: user?.emirate || 'Dubai',
      phone: user?.phone || '',
      isDefault: true,
    };
    return defaultAddr.address ? [defaultAddr] : [];
  });

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [formType, setFormType] = useState('Home');
  const [formName, setFormName] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formEmirate, setFormEmirate] = useState('Dubai');
  const [formPhone, setFormPhone] = useState('');

  const openAddForm = () => {
    setEditId(null);
    setFormType('Home');
    setFormName(user?.name || '');
    setFormAddress('');
    setFormEmirate('Dubai');
    setFormPhone(user?.phone || '');
    setShowForm(true);
  };

  const openEditForm = (addr: Address) => {
    setEditId(addr.id);
    setFormType(addr.type);
    setFormName(addr.name);
    setFormAddress(addr.address);
    setFormEmirate(addr.emirate);
    setFormPhone(addr.phone);
    setShowForm(true);
  };

  const saveAddress = () => {
    if (!formAddress.trim() || !formPhone.trim()) {
      Alert.alert(t('alerts.error'), t('alerts.fillAddressAndPhone'));
      return;
    }
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    if (editId) {
      setAddresses((prev) => prev.map((a) =>
        a.id === editId ? { ...a, type: formType, name: formName, address: formAddress, emirate: formEmirate, phone: formPhone } : a,
      ));
    } else {
      const newAddr: Address = {
        id: String(Date.now()),
        type: formType,
        name: formName.trim() || user?.name || 'Guest',
        address: formAddress.trim(),
        emirate: formEmirate,
        phone: formPhone.trim(),
        isDefault: addresses.length === 0,
      };
      setAddresses((prev) => [...prev, newAddr]);
    }
    setShowForm(false);
  };

  const deleteAddress = (addrId: string) => {
    Alert.alert(t('alerts.deleteAddress'), t('alerts.removeThisAddress'), [
      { text: t('addressesPage.cancel'), style: 'cancel' },
      {
        text: t('common.delete'),
        style: 'destructive',
        onPress: () => setAddresses((prev) => prev.filter((a) => a.id !== addrId)),
      },
    ]);
  };

  const setDefault = (addrId: string) => {
    Haptics.selectionAsync();
    setAddresses((prev) => prev.map((a) => ({ ...a, isDefault: a.id === addrId })));
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.navBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('addressesPage.addresses')}</Text>
        <TouchableOpacity style={styles.navBtn} onPress={openAddForm}>
          <Ionicons name="add" size={24} color={colors.gold[500]} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scroll} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {addresses.length === 0 && (
          <View style={styles.emptyState}>
            <Ionicons name="location-outline" size={48} color={colors.text.muted} />
            <Text style={styles.emptyText}>{t('addressesPage.noAddressesYet')}</Text>
            <Text style={styles.emptySubtext}>{t('addressesPage.addDeliveryAddress')}</Text>
          </View>
        )}

        {addresses.map((addr, i) => (
          <Animated.View key={addr.id} entering={FadeInDown.duration(400).delay(i * 100)}>
            <GlassCard>
              <View style={styles.addrHeader}>
                <View style={styles.typeRow}>
                  <Ionicons name={addr.type === 'Home' ? 'home-outline' : 'business-outline'} size={16} color={colors.gold[500]} />
                  <Text style={styles.typeLabel}>{addr.type}</Text>
                  {addr.isDefault && (
                    <View style={styles.defaultBadge}><Text style={styles.defaultText}>{t('addressesPage.default')}</Text></View>
                  )}
                </View>
                <View style={styles.addrActions}>
                  {!addr.isDefault && (
                    <TouchableOpacity onPress={() => setDefault(addr.id)} hitSlop={8}>
                      <Text style={styles.setDefaultText}>{t('addressesPage.setDefault')}</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity onPress={() => openEditForm(addr)} hitSlop={8}>
                    <Ionicons name="create-outline" size={18} color={colors.text.secondary} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => deleteAddress(addr.id)} hitSlop={8}>
                    <Ionicons name="trash-outline" size={16} color={colors.status.error} />
                  </TouchableOpacity>
                </View>
              </View>
              <Text style={styles.addrName}>{addr.name}</Text>
              <Text style={styles.addrLine}>{addr.address}</Text>
              <Text style={styles.addrLine}>{addr.emirate}, UAE</Text>
              <Text style={styles.addrLine}>{addr.phone}</Text>
            </GlassCard>
          </Animated.View>
        ))}

        <Animated.View entering={FadeInDown.duration(400).delay(250)}>
          <GoldButton title="Add New Address +" onPress={openAddForm} variant="outline" fullWidth />
        </Animated.View>

        <View style={{ height: 40 }} />
      </ScrollView>

      <Modal visible={showForm} transparent animationType="fade" onRequestClose={() => setShowForm(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowForm(false)}>
          <Pressable style={styles.modalContent} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.modalTitle}>{editId ? 'Edit Address' : 'New Address'}</Text>

            <View style={styles.typeToggle}>
              {['Home', 'Work', 'Other'].map((t) => (
                <TouchableOpacity
                  key={t}
                  style={[styles.typeOption, formType === t && styles.typeOptionActive]}
                  onPress={() => { Haptics.selectionAsync(); setFormType(t); }}
                >
                  <Text style={[styles.typeOptionText, formType === t && styles.typeOptionTextActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TextInput style={styles.formInput} placeholder={t('placeholders.fullName')} placeholderTextColor={colors.text.muted} value={formName} onChangeText={setFormName} selectionColor={colors.gold[500]} />
            <TextInput style={styles.formInput} placeholder={t('placeholders.addressRequired')} placeholderTextColor={colors.text.muted} value={formAddress} onChangeText={setFormAddress} selectionColor={colors.gold[500]} />
            <TextInput style={styles.formInput} placeholder={t('placeholders.emirate')} placeholderTextColor={colors.text.muted} value={formEmirate} onChangeText={setFormEmirate} selectionColor={colors.gold[500]} />
            <TextInput style={styles.formInput} placeholder={t('placeholders.phoneRequired')} placeholderTextColor={colors.text.muted} value={formPhone} onChangeText={setFormPhone} keyboardType="phone-pad" selectionColor={colors.gold[500]} />

            <View style={styles.formButtons}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setShowForm(false)}>
                <Text style={styles.cancelText}>{t('addressesPage.cancel')}</Text>
              </TouchableOpacity>
              <GoldButton title={t('common.save')} onPress={saveAddress} size="sm" style={{ flex: 1 }} />
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: colors.bg.primary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: spacing.sm },
  navBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  headerTitle: { ...typography.title3, letterSpacing: 0.5 },
  scroll: { flex: 1 },
  content: { paddingHorizontal: 20, gap: spacing.md },

  emptyState: { alignItems: 'center', paddingVertical: 60, gap: spacing.md },
  emptyText: { ...typography.headline, color: colors.text.secondary },
  emptySubtext: { ...typography.caption1, color: colors.text.tertiary },

  addrHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.md },
  typeRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  typeLabel: { ...typography.label, color: colors.gold[500] },
  defaultBadge: { backgroundColor: 'rgba(52,199,89,0.15)', paddingHorizontal: spacing.sm, paddingVertical: 2, borderRadius: radius.pill },
  defaultText: { ...typography.caption2, color: colors.status.success, fontWeight: '700', fontSize: 10 },
  addrActions: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  setDefaultText: { ...typography.caption2, color: colors.gold[500], fontSize: 11 },
  addrName: { ...typography.headline, marginBottom: spacing.xs, fontSize: 15 },
  addrLine: { ...typography.caption1, color: colors.text.secondary, marginBottom: 2 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', paddingHorizontal: 24 },
  modalContent: { backgroundColor: colors.bg.elevated, borderRadius: radius.xl, padding: 24, borderWidth: 1, borderColor: colors.glass.border },
  modalTitle: { ...typography.title3, textAlign: 'center', marginBottom: spacing.xl },
  typeToggle: { flexDirection: 'row', gap: spacing.sm, marginBottom: spacing.xl },
  typeOption: { flex: 1, paddingVertical: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.glass.border, alignItems: 'center' },
  typeOptionActive: { borderColor: colors.gold[500], backgroundColor: 'rgba(201,169,110,0.1)' },
  typeOptionText: { ...typography.label, color: colors.text.secondary },
  typeOptionTextActive: { color: colors.gold[500] },
  formInput: { ...typography.body, color: colors.text.primary, backgroundColor: colors.bg.surface, borderWidth: 1, borderColor: colors.glass.border, borderRadius: radius.md, paddingVertical: 12, paddingHorizontal: 16, marginBottom: spacing.md },
  formButtons: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.md },
  cancelBtn: { flex: 0.6, paddingVertical: 14, alignItems: 'center', justifyContent: 'center' },
  cancelText: { ...typography.headline, color: colors.text.secondary, fontSize: 15 },
});
