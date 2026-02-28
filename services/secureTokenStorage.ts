import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import { createLogger } from '../utils/logger';

const log = createLogger('TokenStorage');
const TOKEN_KEY = 'genosys_auth_token';
const USER_KEY = 'genosys_user_data';

const isSecureStoreAvailable = Platform.OS !== 'web';

export const saveToken = async (token: string): Promise<void> => {
  try {
    if (isSecureStoreAvailable) {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
    } else {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    }
  } catch (e: any) {
    log.error('Failed to save token', e?.message);
  }
};

export const getToken = async (): Promise<string | null> => {
  try {
    if (isSecureStoreAvailable) {
      return await SecureStore.getItemAsync(TOKEN_KEY);
    }
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch (e: any) {
    log.error('Failed to get token', e?.message);
    return null;
  }
};

export const removeToken = async (): Promise<void> => {
  try {
    if (isSecureStoreAvailable) {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
    } else {
      await AsyncStorage.removeItem(TOKEN_KEY);
    }
  } catch (e: any) {
    log.error('Failed to remove token', e?.message);
  }
};

export const saveUserData = async (user: any): Promise<void> => {
  try {
    await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch (e: any) {
    log.error('Failed to save user data', e?.message);
  }
};

export const getUserData = async (): Promise<any | null> => {
  try {
    const raw = await AsyncStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e: any) {
    log.error('Failed to get user data', e?.message);
    return null;
  }
};

export const clearUserData = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(USER_KEY);
  } catch (e: any) {
    log.error('Failed to clear user data', e?.message);
  }
};

export const clearAll = async (): Promise<void> => {
  await removeToken();
  await clearUserData();
};
