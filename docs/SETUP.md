# Setup & Getting Started

## Prerequisites

- Node.js 18+
- npm or yarn
- Expo Go (App Store / Play Store) for development, or Xcode/Android Studio for simulators
- For biometric / native features: physical device or dev client

## Install

```bash
cd genosys-new-app
npm install
```

## Environment

Create `.env` or set environment variables (see `config/auth.ts`):

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_API_BASE_URL` | Mobile API base (default: `https://genosys.ae/api/mobile`) |
| `EXPO_PUBLIC_WEB_ORIGIN` | Web origin for reviews etc. (default: `https://genosys.ae`) |
| `EXPO_PUBLIC_API_KEY` | API key for mobile endpoints |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Google OAuth client ID (optional) |
| `EXPO_PUBLIC_APPLE_SERVICE_ID` | Apple Sign In (optional) |

## Run

```bash
# Start Metro
npm start
# or
npx expo start

# With cache clear (if you see stale/version errors)
npx expo start --clear

# iOS simulator
npm run ios

# Android
npm run android

# Web (limited support)
npm run web
```

## SDK version

Project uses **Expo SDK 54**. All native modules (`expo-crypto`, `expo-auth-session`, `expo-secure-store`, etc.) must match SDK 54. If you see “no module ExpoCryptoAES” or similar, run:

```bash
npx expo install --fix
```

Then fix any remaining packages with `npm install <pkg>@<expected-version> --legacy-peer-deps` if needed.

## Build (production)

- **EAS Build**: Configure `eas.json` and run `eas build --platform ios` / `--platform android`.
- **Expo Go**: Use only for development; some features (e.g. biometrics, push) work best in a development build.
