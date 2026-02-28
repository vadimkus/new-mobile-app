import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { colors, typography, spacing, radius, shadows } from '../../constants/theme';
import GoldButton from '../../components/ui/GoldButton';
import GlassCard from '../../components/ui/GlassCard';

const UAE_EMIRATES = [
  'Dubai', 'Abu Dhabi', 'Sharjah', 'Ajman',
  'Ras Al Khaimah', 'Fujairah', 'Umm Al Quwain',
];

const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

export default function LoginScreen() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [emirate, setEmirate] = useState('');
  const [birthday, setBirthday] = useState('');
  const [showEmiratePicker, setShowEmiratePicker] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [privacyConsent, setPrivacyConsent] = useState(false);

  const handleEmailAuth = async () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    if (!email || !password || (!isLogin && !name)) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    if (!isValidEmail(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    if (!isLogin) {
      if (!phone.trim()) {
        Alert.alert('Error', 'Phone number is required');
        return;
      }
      if (!address.trim()) {
        Alert.alert('Error', 'Delivery address is required');
        return;
      }
      if (!emirate) {
        Alert.alert('Error', 'Please select your emirate');
        return;
      }
    }

    if (!privacyConsent) {
      Alert.alert('Privacy Policy', 'Please accept the Privacy Policy to continue');
      return;
    }

    setLoading(true);
    // TODO: Connect to real API
    setTimeout(() => {
      setLoading(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      if (!isLogin) {
        Alert.alert('Account Created', 'Your account has been created successfully!');
      }
      router.replace('/(tabs)/discover');
    }, 1500);
  };

  const handleSocialLogin = (provider: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    if (!privacyConsent) {
      Alert.alert('Privacy Policy', 'Please accept the Privacy Policy to continue');
      return;
    }
    // TODO: Connect to real OAuth
    Alert.alert('Coming Soon', `${provider} login will be connected in Phase 2`);
  };

  const toggleMode = () => {
    Haptics.selectionAsync();
    setIsLogin(!isLogin);
    setEmail('');
    setPassword('');
    setName('');
    setPhone('');
    setAddress('');
    setEmirate('');
    setBirthday('');
    setShowPassword(false);
    setPrivacyConsent(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <Animated.View entering={FadeInDown.duration(600)} style={styles.header}>
            <Image
              source={require('../../assets/images/logo_black.png')}
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={styles.brandTagline}>Premium Skincare & Beauty</Text>
            <View style={styles.uaeRow}>
              <Text style={styles.uaeFlag}>🇦🇪</Text>
              <Text style={styles.uaeText}>UAE Exclusive</Text>
              <Ionicons name="heart" size={12} color={colors.gold[500]} style={{ marginLeft: 6 }} />
            </View>
          </Animated.View>

          {/* Social login buttons */}
          <Animated.View entering={FadeInDown.duration(600).delay(150)} style={styles.socialSection}>
            <View style={styles.socialRow}>
              {/* Google */}
              <TouchableOpacity
                style={styles.socialButton}
                onPress={() => handleSocialLogin('Google')}
                activeOpacity={0.8}
              >
                <View style={styles.googleIcon}>
                  <Text style={styles.googleText}>G</Text>
                </View>
                <Text style={styles.socialButtonText}>Google</Text>
              </TouchableOpacity>

              {/* Apple */}
              {Platform.OS === 'ios' && (
                <TouchableOpacity
                  style={[styles.socialButton, styles.appleButton]}
                  onPress={() => handleSocialLogin('Apple')}
                  activeOpacity={0.8}
                >
                  <Ionicons name="logo-apple" size={18} color="#000000" />
                  <Text style={[styles.socialButtonText, { color: '#000000' }]}>
                    Apple
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </Animated.View>

          {/* Divider */}
          <Animated.View entering={FadeInDown.duration(600).delay(250)} style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </Animated.View>

          {/* Form */}
          <Animated.View entering={FadeInDown.duration(600).delay(350)}>
            {!isLogin && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Your name"
                  placeholderTextColor={colors.text.muted}
                  value={name}
                  onChangeText={setName}
                  autoCapitalize="words"
                  selectionColor={colors.gold[500]}
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Email</Text>
              <TextInput
                style={styles.input}
                placeholder="your@email.com"
                placeholderTextColor={colors.text.muted}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                selectionColor={colors.gold[500]}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Password</Text>
              <View style={styles.passwordRow}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="••••••••"
                  placeholderTextColor={colors.text.muted}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  selectionColor={colors.gold[500]}
                />
                <TouchableOpacity
                  style={styles.passwordToggle}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.text.secondary}
                  />
                </TouchableOpacity>
              </View>
            </View>

            {!isLogin && (
              <>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Phone <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="+971 XX XXX XXXX"
                    placeholderTextColor={colors.text.muted}
                    value={phone}
                    onChangeText={setPhone}
                    keyboardType="phone-pad"
                    autoComplete="tel"
                    selectionColor={colors.gold[500]}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Delivery Address <Text style={styles.required}>*</Text>
                  </Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Street, building, apartment"
                    placeholderTextColor={colors.text.muted}
                    value={address}
                    onChangeText={setAddress}
                    autoComplete="street-address"
                    selectionColor={colors.gold[500]}
                  />
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>
                    Emirate <Text style={styles.required}>*</Text>
                  </Text>
                  <TouchableOpacity
                    style={styles.selectButton}
                    onPress={() => setShowEmiratePicker(true)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.selectText, !emirate && styles.selectPlaceholder]}>
                      {emirate || 'Select Emirate'}
                    </Text>
                    <Ionicons name="chevron-down" size={18} color={colors.text.secondary} />
                  </TouchableOpacity>
                </View>

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Birthday</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="DD/MM/YYYY"
                    placeholderTextColor={colors.text.muted}
                    value={birthday}
                    onChangeText={setBirthday}
                    keyboardType="numbers-and-punctuation"
                    selectionColor={colors.gold[500]}
                  />
                  <Text style={styles.birthdayHint}>Optional — we'll send you a special gift!</Text>
                </View>
              </>
            )}
          </Animated.View>

          {/* Privacy consent */}
          <Animated.View entering={FadeInDown.duration(600).delay(450)} style={styles.privacySection}>
            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => {
                Haptics.selectionAsync();
                setPrivacyConsent(!privacyConsent);
              }}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, privacyConsent && styles.checkboxChecked]}>
                {privacyConsent && (
                  <Ionicons name="checkmark" size={14} color={colors.text.inverse} />
                )}
              </View>
              <Text style={styles.privacyText}>
                I agree to the{' '}
                <Text style={styles.privacyLink}>Privacy Policy</Text>
                {' '}and{' '}
                <Text style={styles.privacyLink}>Terms of Service</Text>
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Submit button */}
          <Animated.View entering={FadeInDown.duration(600).delay(550)}>
            <GoldButton
              title={loading ? '' : (isLogin ? 'Sign In' : 'Create Account')}
              onPress={handleEmailAuth}
              fullWidth
              size="lg"
              disabled={loading || !privacyConsent}
              icon={loading ? <ActivityIndicator color={colors.text.inverse} size="small" /> : undefined}
            />
          </Animated.View>

          {/* Forgot password */}
          {isLogin && (
            <Animated.View entering={FadeIn.duration(400).delay(600)}>
              <TouchableOpacity style={styles.forgotBtn} activeOpacity={0.7}>
                <Text style={styles.forgotText}>Forgot Password?</Text>
              </TouchableOpacity>
            </Animated.View>
          )}

          {/* Switch mode */}
          <Animated.View entering={FadeIn.duration(400).delay(650)} style={styles.switchSection}>
            <Text style={styles.switchText}>
              {isLogin ? "Don't have an account?" : 'Already have an account?'}
            </Text>
            <TouchableOpacity onPress={toggleMode} activeOpacity={0.7}>
              <Text style={styles.switchLink}>
                {isLogin ? 'Sign Up' : 'Sign In'}
              </Text>
            </TouchableOpacity>
          </Animated.View>

          {/* Skip for now */}
          <Animated.View entering={FadeIn.duration(400).delay(700)}>
            <TouchableOpacity
              style={styles.skipBtn}
              onPress={() => {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                router.replace('/(tabs)/discover');
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.skipText}>Browse as Guest →</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Emirate Picker Modal */}
      <Modal
        visible={showEmiratePicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEmiratePicker(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowEmiratePicker(false)}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Emirate</Text>
            {UAE_EMIRATES.map((em) => (
              <TouchableOpacity
                key={em}
                style={[styles.emirateItem, emirate === em && styles.emirateItemActive]}
                onPress={() => {
                  Haptics.selectionAsync();
                  setEmirate(em);
                  setShowEmiratePicker(false);
                }}
                activeOpacity={0.8}
              >
                <Text style={[styles.emirateText, emirate === em && styles.emirateTextActive]}>
                  {em}
                </Text>
                {emirate === em && <Ionicons name="checkmark" size={18} color={colors.gold[500]} />}
              </TouchableOpacity>
            ))}
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 28,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.xl,
  },

  // Header
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  logo: {
    width: 225,
    height: 75,
    marginBottom: spacing.xs,
  },
  brandTagline: {
    ...typography.caption1,
    color: colors.gold[500],
    marginTop: spacing.xs,
    letterSpacing: 1,
  },
  uaeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
  },
  uaeFlag: {
    fontSize: 14,
    marginRight: 6,
  },
  uaeText: {
    ...typography.caption1,
    color: colors.text.secondary,
  },

  // Social
  socialSection: {
    marginBottom: spacing.lg,
  },
  socialRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: '#FFFFFF',
    borderRadius: radius.md,
    paddingVertical: 14,
  },
  appleButton: {
    backgroundColor: '#FFFFFF',
  },
  googleIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#EA4335',
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  socialButtonText: {
    ...typography.headline,
    color: '#000000',
    fontSize: 15,
  },

  // Divider
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'stretch',
    marginVertical: spacing.xxl,
  },
  dividerLine: {
    flex: 1,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.glass.border,
  },
  dividerText: {
    ...typography.caption1,
    color: colors.text.tertiary,
    marginHorizontal: spacing.lg,
    textAlign: 'center',
  },

  // Form
  inputGroup: {
    marginBottom: spacing.xl,
  },
  inputLabel: {
    ...typography.label,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  input: {
    ...typography.body,
    color: colors.text.primary,
    backgroundColor: colors.bg.surface,
    borderWidth: 1,
    borderColor: colors.glass.border,
    borderRadius: radius.md,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  passwordRow: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  passwordToggle: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center',
  },
  required: {
    color: colors.gold[500],
    fontWeight: '700',
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.bg.surface,
    borderWidth: 1,
    borderColor: colors.glass.border,
    borderRadius: radius.md,
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  selectText: {
    ...typography.body,
    color: colors.text.primary,
  },
  selectPlaceholder: {
    color: colors.text.muted,
  },
  birthdayHint: {
    ...typography.caption2,
    color: colors.text.tertiary,
    marginTop: spacing.xs,
  },

  // Privacy
  privacySection: {
    marginBottom: spacing.xxl,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: colors.glass.borderStrong,
    backgroundColor: colors.bg.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
    marginTop: 1,
  },
  checkboxChecked: {
    backgroundColor: colors.gold[500],
    borderColor: colors.gold[500],
  },
  privacyText: {
    ...typography.caption1,
    color: colors.text.secondary,
    lineHeight: 20,
    flex: 1,
  },
  privacyLink: {
    color: colors.gold[500],
    textDecorationLine: 'underline',
  },

  // Forgot
  forgotBtn: {
    alignItems: 'center',
    marginTop: spacing.lg,
  },
  forgotText: {
    ...typography.label,
    color: colors.gold[500],
  },

  // Switch
  switchSection: {
    alignItems: 'center',
    marginTop: spacing.xxl,
  },
  switchText: {
    ...typography.caption1,
    color: colors.text.secondary,
  },
  switchLink: {
    ...typography.headline,
    color: colors.gold[500],
    marginTop: spacing.xs,
    fontSize: 15,
  },

  // Skip
  skipBtn: {
    alignItems: 'center',
    marginTop: spacing.xl,
    paddingVertical: spacing.sm,
  },
  skipText: {
    ...typography.bodySmall,
    color: colors.text.tertiary,
  },

  // Emirate modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  modalContent: {
    backgroundColor: colors.bg.elevated,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.glass.border,
  },
  modalTitle: {
    ...typography.headline,
    textAlign: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: colors.glass.border,
  },
  emirateItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.glass.border,
  },
  emirateItemActive: {
    backgroundColor: 'rgba(201,169,110,0.08)',
  },
  emirateText: {
    ...typography.body,
    color: colors.text.primary,
  },
  emirateTextActive: {
    color: colors.gold[500],
    fontWeight: '700',
  },
});
