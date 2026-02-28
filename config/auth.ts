const env = (key: string, fallback: string): string => {
  try {
    const v = process?.env?.[key];
    const s = typeof v === 'string' ? v.trim() : '';
    return s || fallback;
  } catch {
    return fallback;
  }
};

const normalizeUrl = (u: string): string => {
  let out = String(u || '').trim().replace(/\/+$/, '');
  out = out.replace(/\/api\/mobile\/mobile(\/|$)/, '/api/mobile');
  out = out.replace(/([^:])\/{2,}/g, '$1/');
  return out;
};

const DEFAULT_WEB_ORIGIN = 'https://genosys.ae';
const WEB_ORIGIN = normalizeUrl(env('EXPO_PUBLIC_WEB_ORIGIN', DEFAULT_WEB_ORIGIN));
const ASSET_ORIGIN = normalizeUrl(env('EXPO_PUBLIC_ASSET_ORIGIN', WEB_ORIGIN));

const apiBase = env('EXPO_PUBLIC_API_BASE_URL', `${WEB_ORIGIN}/api/mobile`);
const normalizedApiBase = (() => {
  const raw = normalizeUrl(apiBase);
  if (!raw) return normalizeUrl(`${WEB_ORIGIN}/api/mobile`);
  if (raw === normalizeUrl(WEB_ORIGIN)) return normalizeUrl(`${WEB_ORIGIN}/api/mobile`);
  if (raw.endsWith('/api')) return `${raw}/mobile`;
  if (raw.includes('/api/mobile')) return raw;
  return raw;
})();

export const AUTH_CONFIG = {
  API_BASE_URL: normalizedApiBase,
  API_KEY: env('EXPO_PUBLIC_API_KEY', 'genosys_secure_mobile_2025_v1'),

  WEB_ORIGIN,
  ASSET_ORIGIN,
  LOGO_URL: env(
    'EXPO_PUBLIC_LOGO_URL',
    `${WEB_ORIGIN}/_next/image?url=%2Fimages%2Fprd_logo.png&w=512&q=75`,
  ),

  GOOGLE_OAUTH: {
    clientId: env(
      'EXPO_PUBLIC_GOOGLE_CLIENT_ID',
      '998688135686-qmhvfcksth50r9ukk0pefqu1r7cqil73.apps.googleusercontent.com',
    ),
    iosClientId: env(
      'EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID',
      '998688135686-qmhvfcksth50r9ukk0pefqu1r7cqil73.apps.googleusercontent.com',
    ),
    androidClientId: env('EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID', ''),
    webClientId: env(
      'EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID',
      '998688135686-hguci501u33atkitfurgcitb7qiu0s86.apps.googleusercontent.com',
    ),
    redirectUri: 'genosys://oauth/google',
    iosUrlScheme: 'com.googleusercontent.apps.998688135686-qmhvfcksth50r9ukk0pefqu1r7cqil73',
  },

  TOKEN_STORAGE_KEY: '@user',
  SESSION_TIMEOUT: 30 * 24 * 60 * 60 * 1000,
};

export default AUTH_CONFIG;
