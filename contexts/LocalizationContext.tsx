import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';

const STORAGE_KEY = '@language';
const SUPPORTED = ['en', 'ru', 'ar'] as const;
type Locale = (typeof SUPPORTED)[number];
type Direction = 'ltr' | 'rtl';

const en = require('../i18n/messages/en.json');
const ru = require('../i18n/messages/ru.json');
const ar = require('../i18n/messages/ar.json');

interface LocalizationState {
  locale: Locale;
  dir: Direction;
  isRTL: boolean;
  t: (key: string, params?: Record<string, string | number>) => string;
  setLocale: (locale: string) => Promise<void>;
}

const LocalizationContext = createContext<LocalizationState>({
  locale: 'en',
  dir: 'ltr',
  isRTL: false,
  t: (key) => key,
  setLocale: async () => {},
});

function getMessages(locale: Locale): Record<string, any> {
  if (locale === 'ar') return ar;
  if (locale === 'ru') return ru;
  return en;
}

function translate(
  messages: Record<string, any>,
  key: string,
  params?: Record<string, string | number>,
): string {
  const keys = String(key || '').split('.');
  let value: any = messages;
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k];
    } else {
      value = undefined;
      break;
    }
  }
  if (typeof value !== 'string') {
    // Fallback to English
    let fallback: any = en;
    for (const k of keys) {
      if (fallback && typeof fallback === 'object' && k in fallback) {
        fallback = fallback[k];
      } else {
        fallback = undefined;
        break;
      }
    }
    if (typeof fallback === 'string') value = fallback;
    else return String(key || '');
  }
  if (!params) return value;
  return Object.entries(params).reduce(
    (str, [pk, pv]) => str.replace(new RegExp(`\\{${pk}\\}`, 'g'), String(pv)),
    value as string,
  );
}

export function LocalizationProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const didHydrateRef = useRef(false);

  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        const next = stored && SUPPORTED.includes(stored as Locale) ? (stored as Locale) : 'en';
        setLocaleState(next);
      } catch {
        setLocaleState('en');
      }
    })();
  }, []);

  const reloadApp = useCallback(async () => {
    try {
      // @ts-ignore - expo-updates only available in production builds
      const Updates = await import('expo-updates');
      if (Updates?.reloadAsync) {
        await Updates.reloadAsync();
      }
    } catch {}
  }, []);

  const applyRTLIfNeeded = useCallback(
    async (nextLocale: Locale) => {
      const shouldRTL = nextLocale === 'ar';
      const currentRTL = !!I18nManager.isRTL;
      if (currentRTL === shouldRTL) return false;
      try {
        I18nManager.allowRTL(shouldRTL);
        I18nManager.forceRTL(shouldRTL);
      } catch {}
      await reloadApp();
      return true;
    },
    [reloadApp],
  );

  const setLocale = useCallback(
    async (nextLocale: string) => {
      const next = String(nextLocale || '').toLowerCase();
      const safe: Locale = SUPPORTED.includes(next as Locale) ? (next as Locale) : 'en';
      await applyRTLIfNeeded(safe);
      setLocaleState(safe);
      try {
        await AsyncStorage.setItem(STORAGE_KEY, safe);
      } catch {}
    },
    [applyRTLIfNeeded],
  );

  useEffect(() => {
    if (didHydrateRef.current) return;
    didHydrateRef.current = true;
    applyRTLIfNeeded(locale);
  }, [locale, applyRTLIfNeeded]);

  const messages = useMemo(() => getMessages(locale), [locale]);
  const dir: Direction = locale === 'ar' ? 'rtl' : 'ltr';
  const isRTL = dir === 'rtl';
  const t = useCallback(
    (key: string, params?: Record<string, string | number>) => translate(messages, key, params),
    [messages],
  );

  const value = useMemo(() => ({ locale, dir, isRTL, t, setLocale }), [locale, dir, isRTL, t, setLocale]);

  return <LocalizationContext.Provider value={value}>{children}</LocalizationContext.Provider>;
}

export function useLocalization() {
  return useContext(LocalizationContext);
}
