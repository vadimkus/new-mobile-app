import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { createLogger } from '../utils/logger';

const log = createLogger('Push');

try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
} catch (e: any) {
  log.warn('Could not set notification handler', e?.message);
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const isExpoGo =
  Constants.appOwnership === 'expo' ||
  !Constants.expoConfig?.extra?.eas?.projectId ||
  !UUID_RE.test(Constants.expoConfig?.extra?.eas?.projectId ?? '');

export async function registerForPushNotificationsAsync(): Promise<{
  success: boolean;
  token?: string;
  error?: string;
}> {
  if (isExpoGo) {
    log.debug('Push registration skipped (Expo Go or no valid EAS projectId)');
    return { success: false, error: 'Push tokens unavailable in dev' };
  }

  if (Platform.OS === 'android') {
    try {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'default',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    } catch {}
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      return { success: false, error: 'Push permission not granted' };
    }

    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ??
      Constants.easConfig?.projectId;

    if (!projectId || !UUID_RE.test(projectId)) {
      log.debug('No valid EAS projectId — push tokens require eas build');
      return { success: false, error: 'No valid EAS projectId' };
    }

    const pushToken = await Notifications.getExpoPushTokenAsync({ projectId });
    log.info('Push token obtained', { token: pushToken.data.slice(0, 20) + '...' });
    return { success: true, token: pushToken.data };
  } catch (e: any) {
    log.debug('Push token registration skipped', e?.message);
    return { success: false, error: e?.message || 'Failed to get push token' };
  }
}

export function addNotificationReceivedListener(
  callback: (notification: Notifications.Notification) => void,
) {
  return Notifications.addNotificationReceivedListener(callback);
}

export function addNotificationResponseListener(
  callback: (response: Notifications.NotificationResponse) => void,
) {
  return Notifications.addNotificationResponseReceivedListener(callback);
}
