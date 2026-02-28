import React, { useState, useEffect, useRef } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet } from 'react-native';
import { colors } from '../constants/theme';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { CartProvider } from '../contexts/CartContext';
import { FavoritesProvider } from '../contexts/FavoritesContext';
import { LocalizationProvider } from '../contexts/LocalizationContext';
import { registerForPushNotificationsAsync, addNotificationResponseListener } from '../services/pushNotifications';
import { registerPushToken } from '../services/api';
import { setupDeepLinkListener } from '../utils/deepLinking';
import { router } from 'expo-router';
import VideoSplash from '../components/ui/VideoSplash';
import ErrorBoundary from '../components/ErrorBoundary';
import ForceUpdateScreen from '../components/ForceUpdateScreen';
import { checkAppVersion } from '../services/api';

function PushRegistration() {
  const { token } = useAuth();
  const registered = useRef(false);

  useEffect(() => {
    if (registered.current) return;
    registered.current = true;

    (async () => {
      const result = await registerForPushNotificationsAsync();
      if (result.success && result.token && token) {
        await registerPushToken(token, result.token);
      }
    })();

    const sub = addNotificationResponseListener((response) => {
      const data = response.notification.request.content.data as any;
      if (data?.screen) {
        router.push(data.screen);
      }
    });

    const removeDeepLink = setupDeepLinkListener();
    return () => {
      sub.remove();
      removeDeepLink();
    };
  }, [token]);

  return null;
}

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);
  const [forceUpdate, setForceUpdate] = useState(false);

  useEffect(() => {
    checkAppVersion().then((result) => {
      if (result.updateRequired) setForceUpdate(true);
    });
  }, []);

  return (
    <GestureHandlerRootView style={styles.root}>
      <ErrorBoundary>
      <LocalizationProvider>
      <AuthProvider>
        <CartProvider>
          <FavoritesProvider>
            <PushRegistration />
            <StatusBar style="light" />
            <Stack
              screenOptions={{
                headerShown: false,
                contentStyle: { backgroundColor: colors.bg.primary },
                animation: 'slide_from_right',
              }}
            >
              <Stack.Screen name="index" />
              <Stack.Screen name="auth/login" options={{ animation: 'fade' }} />
              <Stack.Screen name="auth/forgot-password" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="auth/reset-password" options={{ animation: 'slide_from_right' }} />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="profile" />
              <Stack.Screen
                name="product/[id]"
                options={{ animation: 'fade_from_bottom' }}
              />
              <Stack.Screen
                name="ingredient/[id]"
                options={{ animation: 'fade_from_bottom', presentation: 'modal' }}
              />
              <Stack.Screen
                name="checkout"
                options={{ animation: 'slide_from_right' }}
              />
            </Stack>

            {showSplash && (
              <VideoSplash
                duration={5000}
                onDone={() => setShowSplash(false)}
              />
            )}
            {forceUpdate && <ForceUpdateScreen />}
          </FavoritesProvider>
        </CartProvider>
      </AuthProvider>
      </LocalizationProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.bg.primary,
  },
});
