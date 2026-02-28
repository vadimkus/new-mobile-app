import * as LocalAuthentication from 'expo-local-authentication';
import * as SecureStore from 'expo-secure-store';
import { Alert, Platform } from 'react-native';

const BIOMETRIC_CREDENTIALS_KEY = 'biometric_credentials';
const BIOMETRIC_ENABLED_KEY = 'biometric_enabled';

interface BiometricSupport {
  isAvailable: boolean;
  isEnrolled: boolean;
  supportedTypes: string[];
  primaryType: string | null;
}

interface BiometricResult {
  success: boolean;
  error?: string;
  message?: string;
}

interface BiometricCredentials {
  v?: number;
  email: string;
  token?: string;
  password?: string;
}

export const checkBiometricSupport = async (): Promise<BiometricSupport> => {
  try {
    const isAvailable = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    const supportedTypes = await LocalAuthentication.supportedAuthenticationTypesAsync();

    const biometricTypes = supportedTypes.map((type) => {
      switch (type) {
        case LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION:
          return 'Face ID';
        case LocalAuthentication.AuthenticationType.FINGERPRINT:
          return 'Touch ID';
        case LocalAuthentication.AuthenticationType.IRIS:
          return 'Iris';
        default:
          return 'Biometric';
      }
    });

    return {
      isAvailable,
      isEnrolled,
      supportedTypes: biometricTypes,
      primaryType: biometricTypes[0] || null,
    };
  } catch {
    return { isAvailable: false, isEnrolled: false, supportedTypes: [], primaryType: null };
  }
};

export const getBiometricTypeName = async (): Promise<string> => {
  const support = await checkBiometricSupport();
  return support.primaryType || 'Biometric Login';
};

export const isBiometricEnabled = async (): Promise<boolean> => {
  try {
    if (Platform.OS === 'web') return false;
    const enabled = await SecureStore.getItemAsync(BIOMETRIC_ENABLED_KEY);
    return enabled === 'true';
  } catch {
    return false;
  }
};

export const enableBiometricAuth = async (payload: {
  email: string;
  token?: string;
}): Promise<BiometricResult> => {
  try {
    if (!payload.email) return { success: false, error: 'Email is required' };

    const support = await checkBiometricSupport();
    if (!support.isAvailable) return { success: false, error: 'Biometric not available on this device' };
    if (!support.isEnrolled) return { success: false, error: `No biometric enrolled. Set up ${support.primaryType} in Settings.` };

    const authResult = await LocalAuthentication.authenticateAsync({
      promptMessage: `Enable ${support.primaryType}`,
      fallbackLabel: 'Use Password',
      cancelLabel: 'Cancel',
    });

    if (!authResult.success) return { success: false, error: authResult.error || 'Authentication failed' };

    const credentials: BiometricCredentials = { v: 2, email: payload.email, token: payload.token };
    await SecureStore.setItemAsync(BIOMETRIC_CREDENTIALS_KEY, JSON.stringify(credentials));
    await SecureStore.setItemAsync(BIOMETRIC_ENABLED_KEY, 'true');

    return { success: true, message: `${support.primaryType} enabled` };
  } catch {
    return { success: false, error: 'Failed to enable biometric authentication' };
  }
};

export const disableBiometricAuth = async (): Promise<BiometricResult> => {
  try {
    if (Platform.OS !== 'web') {
      await SecureStore.deleteItemAsync(BIOMETRIC_CREDENTIALS_KEY);
      await SecureStore.deleteItemAsync(BIOMETRIC_ENABLED_KEY);
    }
    return { success: true, message: 'Biometric authentication disabled' };
  } catch {
    return { success: false, error: 'Failed to disable' };
  }
};

export const authenticateWithBiometrics = async (): Promise<{
  success: boolean;
  credentials?: BiometricCredentials;
  error?: string;
}> => {
  try {
    const support = await checkBiometricSupport();
    if (!support.isAvailable || !support.isEnrolled) return { success: false, error: 'Biometric not available' };

    const isEnabled = await isBiometricEnabled();
    if (!isEnabled) return { success: false, error: 'Biometric not enabled' };

    const authResult = await LocalAuthentication.authenticateAsync({
      promptMessage: `Login with ${support.primaryType}`,
      fallbackLabel: 'Use Password',
      cancelLabel: 'Cancel',
    });

    if (!authResult.success) return { success: false, error: authResult.error || 'Cancelled' };

    const raw = await SecureStore.getItemAsync(BIOMETRIC_CREDENTIALS_KEY);
    if (!raw) return { success: false, error: 'No stored credentials' };

    const credentials: BiometricCredentials = JSON.parse(raw);
    return { success: true, credentials };
  } catch {
    return { success: false, error: 'Biometric authentication failed' };
  }
};

export const setupBiometricAuth = async (payload: {
  email: string;
  token?: string;
}): Promise<BiometricResult> => {
  const support = await checkBiometricSupport();
  if (!support.isAvailable) {
    Alert.alert('Not Available', 'Biometric authentication is not available on this device.');
    return { success: false };
  }
  if (!support.isEnrolled) {
    Alert.alert('Setup Required', `Please set up ${support.primaryType} in your device Settings first.`);
    return { success: false };
  }

  return new Promise((resolve) => {
    Alert.alert(
      `Enable ${support.primaryType}?`,
      `Quick and secure login with ${support.primaryType}`,
      [
        { text: 'Not Now', style: 'cancel', onPress: () => resolve({ success: false }) },
        {
          text: 'Enable',
          onPress: async () => {
            const result = await enableBiometricAuth(payload);
            if (result.success) {
              Alert.alert('Success', `${support.primaryType} enabled for your account.`);
            } else {
              Alert.alert('Error', result.error || 'Failed');
            }
            resolve(result);
          },
        },
      ],
    );
  });
};
