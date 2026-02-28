import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, typography, spacing, radius } from '../constants/theme';

const STORE_URL = Platform.select({
  ios: 'https://apps.apple.com/app/id6738022898',
  android: 'https://play.google.com/store/apps/details?id=com.genosys.app',
  default: '',
});

export default function ForceUpdateScreen() {
  return (
    <View style={styles.container}>
      <Ionicons name="cloud-download-outline" size={56} color={colors.gold[500]} />
      <Text style={styles.title}>Update Required</Text>
      <Text style={styles.message}>
        A new version of GENOSYS is available. Please update to continue using the app.
      </Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => { if (STORE_URL) Linking.openURL(STORE_URL); }}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Update Now</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.bg.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
    zIndex: 9999,
  },
  title: {
    ...typography.title1,
    marginTop: spacing.xl,
    textAlign: 'center',
  },
  message: {
    ...typography.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginTop: spacing.md,
    lineHeight: 24,
  },
  button: {
    marginTop: spacing.xxl,
    paddingVertical: spacing.lg,
    paddingHorizontal: 48,
    backgroundColor: colors.gold[500],
    borderRadius: radius.lg,
  },
  buttonText: {
    ...typography.headline,
    color: colors.bg.primary,
    fontWeight: '700',
  },
});
