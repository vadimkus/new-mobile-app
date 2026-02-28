# GENOSYS New App

Premium skincare mobile app for GENOSYS (React Native / Expo, TypeScript).

## Tech Stack

- **Expo SDK 54** — React Native 0.81, Expo Router 6
- **TypeScript**
- **Expo Router** — file-based routing
- **React Native Reanimated** — animations, gestures, sensors
- **Backend** — same API as existing GENOSYS mobile app (genosys.ae)

## Quick Start

```bash
npm install
npm start
```

Then open in Expo Go (or run `npm run ios` / `npm run android`).

## Key Features

### Interactive Product Experience

- **Orbital Constellation** — benefit pills orbit the product image, swipe to spin with inertia physics
- **Gyroscope Parallax** — product image responds to device tilt
- **Image Lightbox** — tap product to expand fullscreen with zoom animation
- **Expandable Sections** — About and Application Method collapse/expand with chevron

### Home Screen

- **Dynamic Categories** — fetched from API, filter products
- **Hero + Grid Layout** — featured product card + mini cards
- **Luxury Add-to-Bag Toast** — animated bag icon + floating glass pill notification
- **Search** — word-by-word matching across multiple fields

### Premium UI

- **Glassmorphism** — blur effects, subtle borders, dark theme
- **Gold Accents** — #C9A96E primary accent color
- **Haptic Feedback** — tactile response on interactions
- **Smooth Animations** — Reanimated springs, LayoutAnimation accordions

### Full Feature Set

- Multi-language (EN/AR/RU) with RTL support
- Email/Google/Apple authentication + biometric login
- Cart with checkout flow
- Favorites (local + server sync)
- Push notifications with deep linking
- Skin AI quiz with personalized recommendations
- Training content (PDFs, videos)
- Force update mechanism

## Documentation

All documentation in **`docs/`**:

| Doc | Description |
|-----|-------------|
| [docs/README.md](./docs/README.md) | Documentation index |
| [docs/SETUP.md](./docs/SETUP.md) | Setup, env, SDK version |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | Structure, contexts, routes |
| [docs/FEATURES.md](./docs/FEATURES.md) | i18n, auth, cart, push, deep links |
| [docs/HOME_SCREEN.md](./docs/HOME_SCREEN.md) | Discover tab, categories, search, toast |
| [docs/PRODUCT_PAGE.md](./docs/PRODUCT_PAGE.md) | Orbital podium, lightbox, expandable sections |
| [docs/UI_COMPONENTS.md](./docs/UI_COMPONENTS.md) | Glass design system, components, animations |
| [docs/SKIN_ANALYSIS.md](./docs/SKIN_ANALYSIS.md) | Skin AI, quiz flow |
| [docs/TRAINING.md](./docs/TRAINING.md) | Training content |
| [docs/API.md](./docs/API.md) | Backend API endpoints |

## Local Image Testing

To test with local product images:

```typescript
// In app/(tabs)/discover.tsx and app/product/[id].tsx
const LOCAL_IMAGE_OVERRIDES: Record<string, any> = {
  'eye contour': require('../../assets/images/serum_cut.png'),
};
```

Drop images in `assets/images/` and add entries to the map.

## Repository

[https://github.com/vadimkus/new-mobile-app](https://github.com/vadimkus/new-mobile-app)
