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
| [HOME_SCREEN.md](./HOME_SCREEN.md) | Discover tab: header (favorites icon), categories, search, product cards, toast |
| [PRODUCT_PAGE.md](./PRODUCT_PAGE.md) | Product detail: top nav (GoldShimmerText + heart + share), orbital podium (luxury icons, marquee labels), bottom bar (Add to Bag / In Bag, bag icon), expandable sections, lightbox |
| [UI_COMPONENTS.md](./UI_COMPONENTS.md) | Reusable components, GlassCard, LuxuryIcon, glass design system, animations |
| [LUXURY_ICONS.md](./LUXURY_ICONS.md) | Phosphor-based icon library, benefit keyword mapping, LuxuryIcon usage |
| [CHECKOUT.md](./CHECKOUT.md) | Checkout flow, order summary, shipping, payment, order notes, totals |
| [FAVORITES.md](./FAVORITES.md) | Wishlist screen, home favorites icon, luxury card design, Add All to Bag |
| [SKIN_ANALYSIS.md](./SKIN_ANALYSIS.md) | Skin AI tab, quiz flow, recommendations |
| [TRAINING.md](./TRAINING.md) | Training content: PDFs, videos |
| [ADAPTIVE_COLORS.md](./ADAPTIVE_COLORS.md) | Automatic color derivation from product images |

## Quick Reference

### Key Files

```
app/(tabs)/discover.tsx     — Home screen (favorites icon in header)
app/(tabs)/bag.tsx          — Bag / cart (route: /(tabs)/bag)
app/(tabs)/skin-ai.tsx      — Skin AI tab
app/product/[id].tsx        — Product detail (top nav: heart + share; bottom: Add to Bag / In Bag, bag icon)
app/checkout.tsx            — Checkout (order notes in GlassCard, no overlap with total)
app/profile/favorites.tsx   — Wishlist (luxury card list, Add All to Bag)
app/skin-analysis.tsx       — Skin quiz flow
app/profile/training.tsx    — Training content

components/product/InteractivePodium.tsx  — Orbital constellation (LuxuryIcon pills, marquee labels)
components/ui/GlassTabBar.tsx             — Custom tab bar + toast
components/ui/GoldShimmerText.tsx         — Luxury text with gold shimmer effect
components/product/ProductMiniCard.tsx    — Compact product card
components/product/ProductHeroCard.tsx    — Featured product card

constants/luxuryIcons.tsx   — Phosphor icon map, matchBenefitIcon, LuxuryIcon
hooks/useImageColors.ts     — Adaptive color derivation
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
