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

export async function registerForPushNotificationsAsync(): Promise<{
  success: boolean;
  token?: string;
  error?: string;
}> {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.DEFAULT,
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    return { success: false, error: 'Push permission not granted' };
  }

  try {
    const projectId = Constants.expoConfig?.extra?.eas?.projectId ?? Constants.easConfig?.projectId;
    const pushToken = await Notifications.getExpoPushTokenAsync({ projectId });
    log.info('Push token obtained', { token: pushToken.data.slice(0, 20) + '...' });
    return { success: true, token: pushToken.data };
  } catch (e: any) {
    log.error('Failed to get push token', e?.message);
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
