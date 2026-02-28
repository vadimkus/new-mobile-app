# Documentation Index

## Setup & Configuration

| Document | Description |
|----------|-------------|
| [SETUP.md](./SETUP.md) | Environment setup, dependencies, running the app |
| [API.md](./API.md) | Backend API endpoints and authentication |

## Architecture

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Project structure, contexts, providers, routes |
| [FEATURES.md](./FEATURES.md) | i18n, auth, cart, favorites, push notifications, deep links |

## Screens & Components

| Document | Description |
|----------|-------------|
| [HOME_SCREEN.md](./HOME_SCREEN.md) | Discover tab: categories, search, product cards, toast |
| [PRODUCT_PAGE.md](./PRODUCT_PAGE.md) | Product detail: orbital podium, expandable sections, lightbox |
| [UI_COMPONENTS.md](./UI_COMPONENTS.md) | Reusable components, glass design system, animations |
| [SKIN_ANALYSIS.md](./SKIN_ANALYSIS.md) | Skin AI tab, quiz flow, recommendations |
| [TRAINING.md](./TRAINING.md) | Training content: PDFs, videos |
| [ADAPTIVE_COLORS.md](./ADAPTIVE_COLORS.md) | Automatic color derivation from product images |

## Quick Reference

### Key Files

```
app/(tabs)/discover.tsx     — Home screen
app/(tabs)/skin-ai.tsx      — Skin AI tab
app/product/[id].tsx        — Product detail
app/skin-analysis.tsx       — Skin quiz flow
app/profile/training.tsx    — Training content

components/product/InteractivePodium.tsx  — Orbital constellation
components/ui/GlassTabBar.tsx             — Custom tab bar + toast
components/product/ProductMiniCard.tsx    — Compact product card
components/product/ProductHeroCard.tsx    — Featured product card

hooks/useImageColors.ts                   — Adaptive color derivation
```

### Local Image Overrides

To test with local images instead of API URLs:

```typescript
// In discover.tsx and product/[id].tsx
const LOCAL_IMAGE_OVERRIDES: Record<string, any> = {
  'eye contour': require('../../assets/images/serum_cut.png'),
  // Add more: 'product name keyword': require('path/to/image.png'),
};
```

### Theme Colors

```typescript
colors.gold[500]      // #C9A96E — primary gold accent
colors.bg.primary     // #0A0A0A — near-black background
colors.text.primary   // #FFFFFF — white text
colors.glass.border   // rgba(255,255,255,0.08) — subtle borders
```

### Animation Imports

```typescript
// Reanimated
import Animated, {
  useSharedValue, useAnimatedStyle,
  withSpring, withTiming, withRepeat, withDecay,
  FadeIn, FadeInDown, SlideInUp,
} from 'react-native-reanimated';

// Gestures
import { Gesture, GestureDetector } from 'react-native-gesture-handler';

// Haptics
import * as Haptics from 'expo-haptics';
```
