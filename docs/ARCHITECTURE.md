# Architecture

## Project structure

```
genosys-new-app/
├── app/                    # Expo Router (file-based routes)
│   ├── _layout.tsx         # Root layout, providers, stack, splash, force-update
│   ├── index.tsx           # Entry: redirect to auth or (tabs)/discover
│   ├── auth/
│   │   ├── login.tsx
│   │   ├── forgot-password.tsx
│   │   └── reset-password.tsx
│   ├── (tabs)/             # Tab navigator
│   │   ├── _layout.tsx     # GlassTabBar
│   │   ├── discover.tsx
│   │   ├── ritual.tsx
│   │   ├── skin-ai.tsx
│   │   └── bag.tsx
│   ├── profile/            # Stack under /profile
│   │   ├── _layout.tsx
│   │   ├── index.tsx
│   │   ├── edit.tsx, addresses.tsx, language.tsx, favorites.tsx
│   │   ├── orders/index.tsx, orders/[id].tsx
│   │   ├── promo.tsx, payment.tsx, help.tsx, contact.tsx, about.tsx
│   │   ├── training.tsx, privacy.tsx, terms.tsx
│   ├── product/[id].tsx
│   ├── ingredient/[id].tsx
│   └── checkout.tsx
├── components/
│   ├── ui/                 # GlassCard, GoldButton, GlassTabBar, CategoryIcon, etc.
│   └── product/            # InteractivePodium, ProductMiniCard, ProductHeroCard, ProductReviews, etc.
├── constants/
│   ├── theme.ts            # colors, typography, spacing, radius
│   ├── luxuryIcons.tsx     # Phosphor icon map, LuxuryIcon, benefit keyword matching
│   └── mockData.ts         # fallback demo data
├── contexts/
│   ├── AuthContext.tsx
│   ├── CartContext.tsx
│   ├── FavoritesContext.tsx
│   └── LocalizationContext.tsx
├── services/
│   ├── api.ts              # All API calls (products, auth, orders, wishlist, reviews, etc.)
│   ├── authFetch.ts        # authenticatedFetch with token
│   ├── secureTokenStorage.ts
│   ├── pushNotifications.ts
│   ├── biometricService.ts
│   ├── productCache.ts
│   └── recentlyViewed.ts
├── utils/
│   └── deepLinking.ts
├── i18n/
│   └── messages/           # en.json, ar.json, ru.json
├── config/
│   └── auth.ts             # API_BASE_URL, API_KEY, OAuth IDs
└── docs/
```

## Provider order (root layout)

1. `GestureHandlerRootView`
2. `ErrorBoundary`
3. `LocalizationProvider` (locale, RTL, `t()`)
4. `AuthProvider`
5. `CartProvider`
6. `FavoritesProvider`
7. `PushRegistration` (push token + deep link listener)
8. Stack navigator + VideoSplash + ForceUpdateScreen overlay

## Key contexts

| Context | Role |
|--------|------|
| **AuthContext** | User, token, login/logout, Google/Apple/email, refresh profile |
| **CartContext** | Cart items, add/remove, subtotal, persist (AsyncStorage fallback) |
| **FavoritesContext** | Favorite IDs, toggle, persist locally + sync with server when logged in |
| **LocalizationContext** | Locale (en/ar/ru), RTL for Arabic, `t(key, params)` |

## Routes (summary)

| Path | Screen |
|------|--------|
| `/` | Redirect to `/auth/login` or `/(tabs)/discover` |
| `/auth/login` | Login / sign up |
| `/auth/forgot-password` | Request reset code |
| `/auth/reset-password` | Reset with code + new password |
| `/(tabs)/discover` | Discover (hero + grid + recently viewed) |
| `/(tabs)/ritual` | Beauty ritual + streak |
| `/(tabs)/skin-ai` | Skin AI + recommendations |
| `/(tabs)/bag` | Cart → checkout |
| `/profile/*` | Profile, edit, addresses, orders, language, favorites, etc. |
| `/product/[id]` | Product detail + reviews |
| `/ingredient/[id]` | Ingredient explorer |
| `/checkout` | Checkout flow |
