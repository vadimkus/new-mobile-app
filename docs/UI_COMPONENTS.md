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

#### Orbit Sizing

The orbit is dynamically sized to fit within the screen bounds:

```typescript
const PODIUM_W = SW - 40;           // 20px padding each side
const CX = PODIUM_W / 2;            // Center X
const PILL_HALF_W = 55;             // Half of average pill width (~110px)
const ORB_RX = CX - PILL_HALF_W + 10;  // Horizontal radius
const ORB_RY = SW * 0.34;           // Vertical radius
```

- Pills are sized `minWidth: 80`, `maxWidth: 120`
- Left and right pills stay within screen bounds
- Orbit radius scales with screen width

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
