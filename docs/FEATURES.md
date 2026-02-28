# Features

## Internationalization (i18n)

- **Languages**: English (default), Arabic, Russian.
- **Location**: `i18n/messages/{en,ar,ru}.json` (reused from previous GENOSYS app).
- **Context**: `LocalizationContext` — `locale`, `dir` (ltr/rtl), `t(key, params)`, `setLocale()`.
- **RTL**: Arabic uses `I18nManager.forceRTL(true)`; app may restart when switching to/from Arabic.
- **Profile**: Profile → Language to switch; current language shown next to “Language”.
- **Usage**: Use `useLocalization()` and `t('section.key')` (e.g. `t('tabs.bag')`, `t('profile.language')`).

## Authentication

- **Email/password**: Login and sign up (with address, emirate, birthday for sign up).
- **Google**: `expo-auth-session` + backend `auth/google`.
- **Apple**: `expo-apple-authentication` + backend `auth/apple`.
- **Biometric**: Face ID / Touch ID — enable in Profile; “Login with Face ID” on login when enabled. Token stored in SecureStore.
- **Forgot password**: `/auth/forgot-password` → email → reset code → `/auth/reset-password` → new password.

## Cart & Checkout

- **Cart**: In-memory + AsyncStorage fallback; badge on Discover header.
- **Checkout**: `/checkout` — order summary, shipping form, payment (COD/card), `createOrder` API, then clear cart.

## Favorites (wishlist)

- **Local**: Stored in AsyncStorage.
- **Server sync**: When user is logged in, favorites sync with `/user/wishlist` (GET/POST/DELETE); merge on load, fire-and-forget on toggle.

## Product catalog

- **Discover**: Products from `fetchProducts`; cache-first via `productCache` (1h TTL) for fast/offline.
- **Product detail**: `fetchProductById`, add to bag, favorite, share; “Recently viewed” recorded.
- **Recently viewed**: Stored in AsyncStorage (last 20); horizontal section on Discover.

## Product reviews

- **Component**: `ProductReviews` on product page.
- **API**: Web origin `/api/products/:id/reviews` (GET). Submit (POST) and delete (DELETE) when logged in.
- **UI**: Star rating, title, comment, list of reviews; write/edit/delete own review.

## Push notifications

- **Registration**: After login, push token sent via `registerPushToken(token, pushToken)`.
- **Handling**: `addNotificationResponseListener` — if payload has `data.screen`, navigate with `router.push(data.screen)`.

## Deep linking

- **Setup**: `utils/deepLinking.ts` + `setupDeepLinkListener()` in root layout.
- **Schemes**: `genosys://` and `https://genosys.ae/...` (allowed hosts).
- **Mapping**: e.g. `products`, `product/:id`, `cart`, `bag`, `orders`, `profile`, `favorites`, `checkout`, `skin-ai`, `ritual`, `about`, `contact`, `help`, `training`.

## Force update

- **Check**: On launch, `checkAppVersion()` calls `/mobile/app-version`; if `updateRequired`, show full-screen `ForceUpdateScreen` with “Update now” (store link).

## Error handling

- **ErrorBoundary**: Wraps app; on error shows “Something went wrong” + “Try again” to reset state.
