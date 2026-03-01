# UI Components

Reusable UI components in `components/ui/` and `components/product/`.

## Glass Design System

The app uses a consistent glassmorphism design language.

### GlassCard

```typescript
<GlassCard
  intensity="light" | "medium" | "strong"
  padding="sm" | "md" | "lg" | "xl"
  borderRadius="sm" | "md" | "lg" | "xl" | "xxl"
  noBorder={false}
>
  {children}
</GlassCard>
```

- `BlurView` with dark tint
- Subtle border (`colors.glass.border`)
- Semi-transparent background

### GlassTabBar

Custom tab bar replacing default Expo Router tabs:

- Floating design with rounded corners
- `BlurView` glassmorphism
- Gold accent for active tab
- Animated bag badge (shows item count)
- **Add-to-bag toast** integration:
  - Listens to `CartContext.lastAdded`
  - Bag icon bounce + golden halo ripple
  - Floating toast pill with product info

### GoldShimmerText

Luxury text effect with periodic gold shimmer sweep:

```typescript
import GoldShimmerText from '../components/ui/GoldShimmerText';

<GoldShimmerText
  text="GENOSYS"
  style={{ fontSize: 24, fontWeight: '700', letterSpacing: 4 }}
  shimmerInterval={7000}  // 7 seconds idle between shimmers
  shimmerDuration={2000}  // 2 seconds for shimmer to sweep
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `text` | string | — | Text to render |
| `style` | TextStyle | — | Font size, weight, letter spacing |
| `shimmerInterval` | number | 7000 | ms to wait between shimmer sweeps |
| `shimmerDuration` | number | 2000 | ms for shimmer to travel across |

**Technical details**:
- Uses `@react-native-masked-view/masked-view` to mask a gradient through text
- White base fill (`#FFFFFF`) with 160px gold gradient (`#C9A96E`) sweep
- Gradient: 7-stop with transparent edges → gold peak at center
- Animation: Reanimated `withRepeat(withSequence(withDelay(...), withTiming(...)))`
- Works in Expo Go — no native pixel extraction

### GoldButton

Primary action button:

```typescript
<GoldButton
  title="Add to Bag"
  onPress={handlePress}
  loading={false}
  disabled={false}
  variant="solid" | "outline"
/>
```

## Product Components

### InteractivePodium

The orbital constellation component (see `PRODUCT_PAGE.md` for full details):

```typescript
<InteractivePodium
  imageSource={require('./image.png') | { uri: 'https://...' }}
  benefits={['Hydrating - Deep moisture', 'Anti-aging - Reduces wrinkles']}
/>
```

#### Orbiting Pills: Icons and Sizing

Pills use **LuxuryIcon** (Phosphor duotone) instead of emoji — see `docs/LUXURY_ICONS.md`. Each pill shows an icon (e.g. Drop, Flask, Diamond) and the first word of the benefit. The detail card uses the same icon in a 48px circular container.

Orbit sizing:

```typescript
const PILL_R = 36;                  // Pill circle radius (72px diameter)
const ORB_RX = CX - PILL_R + 10;    // Horizontal radius
const ORB_RY = SW * 0.34;           // Vertical radius
```

- Pills are 72×72px dark circles with gold border/glow when selected
- `pillIconWrap` holds the icon; `pillLabel` shows the short text
- Detail card uses `detailIconWrap` (48px circle, gold-tinted bg) for the selected benefit icon

### ProductHeroCard

Featured product card with gradient background:

```typescript
<ProductHeroCard
  id="123"
  name="Eye Contour Serum"
  tagline="Advanced eye care"
  price={370}
  currency="AED"
  imageUrl="https://..."
  localImageSource={require('./local.png')} // optional override
  badge="BESTSELLER"
  rating={5}
  gradientColors={['#1a1a2e', '#16213e']}
  onPress={handlePress}
  onFavorite={handleFavorite}
  onAddToBag={handleAddToBag}
  isFavorite={false}
/>
```

### ProductMiniCard

Compact product card for grids/lists:

```typescript
<ProductMiniCard
  id="123"
  name="Eye Contour Serum"
  price={370}
  currency="AED"
  imageUrl="https://..."
  localImageSource={require('./local.png')} // optional override
  onPress={handlePress}
  onFavorite={handleFavorite}
  onAddToBag={handleAddToBag}
  isFavorite={false}
/>
```

### ProductReviews

Product reviews section:

```typescript
<ProductReviews productId="123" />
```

- Fetches reviews from API
- Star rating display
- Write/edit/delete own review (when logged in)
- Review list with user avatars

## Luxury Icons

### LuxuryIcon

Reusable icon component backed by Phosphor Icons; used for benefit pills and detail cards on the product page.

```typescript
import { LuxuryIcon } from '../constants/luxuryIcons';

<LuxuryIcon name="hydration" size={20} color={colors.gold[500]} weight="duotone" />
```

- **name**: One of the keys in `constants/luxuryIcons.tsx` (e.g. `sparkle`, `hydration`, `science`, `premium`).
- **size**, **color**, **weight**: Pass-through to Phosphor; default weight is `duotone` for a premium look.
- **Keyword matching**: `matchBenefitIcon(text)` and `getCycleIcon(index)` map benefit copy to icon names.

See `docs/LUXURY_ICONS.md` for the full icon set and keyword map.

## Utility Components

### SectionHeader

```typescript
<SectionHeader title="Recently Viewed" />
```

### CategoryIcon

```typescript
<CategoryIcon
  label="Serum"
  icon="flask-outline"
  isActive={activeCategory === 'serum'}
  onPress={() => setActiveCategory('serum')}
/>
```

- Circle icon button (52x52px) with label below
- Dynamic width via `minWidth: 56` — grows for long labels like "Sun Protection"
- Active state: gold border, 1.05 scale, glow shadow
- Haptic feedback on tap

### ErrorBoundary

Wraps app to catch crashes:

```typescript
<ErrorBoundary>
  <App />
</ErrorBoundary>
```

Shows "Something went wrong" + "Try again" button.

### ForceUpdateScreen

Full-screen overlay when app update is required:

```typescript
<ForceUpdateScreen storeUrl="https://..." />
```

## Adaptive Image Colors

The `useImageColors` hook (`hooks/useImageColors.ts`) provides automatic color derivation for product backgrounds.

### How It Works

```typescript
import { useImageColors } from '../hooks/useImageColors';

const pc = useImageColors(imageUrl);
// pc.dominant    — dark tinted background color
// pc.darkMuted   — even darker variant for gradients
// pc.vibrant     — bright accent for glow effects
// pc.gradient    — [dominant, darkMuted] tuple
// pc.glowColor   — same as vibrant
// pc.isExtracted — true when colors are ready
```

### Technology

**URL-based deterministic color derivation** — zero native dependencies, works in Expo Go.

1. Hashes the product image URL to generate a hue (0-360)
2. Derives colors using HSL color space:
   - **Dominant**: lightness 6%, saturation 50% (very dark tinted)
   - **Dark muted**: lightness 3.5% (even darker)
   - **Vibrant**: lightness 50% (bright accent)
3. Results cached in memory — same URL = instant lookup

### Integration

| Component | What Adapts |
|-----------|-------------|
| `InteractivePodium` | Ambient glow, edge fades, podium reflection |
| `ProductMiniCard` | Card background color |
| `ProductHeroCard` | Gradient background |

### Example

```typescript
// ProductMiniCard.tsx
const pc = useImageColors(imageUrl);
const cardBg = pc.isExtracted ? pc.dominant : '#000000';

<View style={[styles.borderGlow, { backgroundColor: cardBg }]}>
```

Every product gets a unique dark color palette based on its image URL, creating visual variety while maintaining the luxury dark theme.

## Theme Constants

All design tokens in `constants/theme.ts`:

```typescript
import { colors, typography, spacing, radius, shadows, layout } from '../constants/theme';

colors.gold[500]      // #C9A96E (primary gold)
colors.bg.primary     // #0A0A0A (near-black)
colors.text.primary   // #FFFFFF
colors.glass.border   // rgba(255,255,255,0.08)

typography.headline   // { fontSize: 18, fontWeight: '600', ... }
typography.body       // { fontSize: 15, ... }
typography.price      // { fontSize: 20, fontWeight: '700', color: gold }

spacing.sm            // 8
spacing.md            // 12
spacing.lg            // 16
spacing.xl            // 20

radius.pill           // 100 (fully rounded)
radius.circle         // 9999
```

## Animation Patterns

### Reanimated

```typescript
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  withRepeat,
  withSequence,
  withDecay,
  FadeIn,
  SlideInUp,
} from 'react-native-reanimated';
```

### Layout Animation (expand/collapse)

```typescript
import { LayoutAnimation, UIManager, Platform } from 'react-native';

// Enable on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// Use before state change
LayoutAnimation.configureNext(LayoutAnimation.create(280, 'easeInEaseOut', 'opacity'));
setExpanded(!expanded);
```

### Haptic Feedback

```typescript
import * as Haptics from 'expo-haptics';

Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);   // subtle tap
Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);  // selection
Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success); // add to cart
```
