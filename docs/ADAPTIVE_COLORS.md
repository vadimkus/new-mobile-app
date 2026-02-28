# Adaptive Image Colors

The app automatically derives unique color palettes from product images, creating visual variety while maintaining the luxury dark theme.

## Overview

Every product image URL generates a unique, deterministic dark color palette. This happens instantly with zero native dependencies — works in Expo Go without a dev build.

## The Hook

```typescript
import { useImageColors } from '../hooks/useImageColors';

function MyComponent({ imageUrl }) {
  const pc = useImageColors(imageUrl);

  return (
    <View style={{ backgroundColor: pc.dominant }}>
      {/* pc.dominant    — dark tinted background (#0a0a12 etc) */}
      {/* pc.darkMuted   — even darker (#050508 etc) */}
      {/* pc.vibrant     — bright accent (#7a6b8a etc) */}
      {/* pc.gradient    — [dominant, darkMuted] tuple */}
      {/* pc.glowColor   — same as vibrant */}
      {/* pc.isExtracted — true when ready */}
    </View>
  );
}
```

## How It Works

### 1. URL Hashing

The image URL is hashed to produce a deterministic seed:

```typescript
function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) & 0x7FFFFFFF;
  }
  return hash;
}
```

### 2. HSL Color Derivation

From the hash, a hue (0-360) is derived, then colors are generated using HSL:

| Color | Hue | Saturation | Lightness | Purpose |
|-------|-----|------------|-----------|---------|
| `dominant` | hash % 360 | 50% | 6% | Card/page background |
| `darkMuted` | hash % 360 | 40% | 3.5% | Gradient endpoint |
| `vibrant` | hash % 360 | 55% | 50% | Glow, accents |

### 3. Caching

Results are cached in memory:

```typescript
const cache = new Map<string, ProductColors>();
```

Same URL = instant lookup on subsequent renders.

## Where It's Used

### InteractivePodium (Product Page)

```typescript
const pc = useImageColors(imageUri);
const dynBG = pc.isExtracted ? pc.dominant : BG;
const dynGlow = pc.isExtracted ? pc.glowColor : GOLD;
```

Adapts:
- Ambient radial glow color
- Edge fade gradient colors
- Podium reflection color

### ProductMiniCard (Home Screen)

```typescript
const pc = useImageColors(imageUrl);
const cardBg = pc.isExtracted ? pc.dominant : '#000000';
```

Card background tints uniquely per product.

### ProductHeroCard (Home Screen)

```typescript
const pc = useImageColors(imageUrl);
const dynamicGradient = pc.isExtracted ? pc.gradient : gradientColors;
```

Hero card gradient adapts per product.

## Local Image Overrides

When using `localImageSource` for testing (e.g., serum cutout), the hook still receives the API's `imageUrl`:

```typescript
// Even with local override displayed, colors come from API URL
const pc = useImageColors(imageUrl);
```

This ensures products with local test images still get their adaptive colors.

## Fallbacks

When `imageUrl` is undefined or empty:
- Returns `DEFAULT_COLORS` (hardcoded black/gold theme)
- `pc.isExtracted` is `false`

Components check `pc.isExtracted` to use fallback values:

```typescript
const cardBg = pc.isExtracted ? pc.dominant : '#000000';
```

## Why URL-Based?

**Pros:**
- Zero native dependencies — works in Expo Go
- Instant (no image loading/processing delay)
- Deterministic — same URL always gives same colors
- Cached — zero cost on re-renders

**Trade-off:**
- Colors are derived from URL hash, not actual image pixels
- Each product still gets a unique palette, just not pixel-accurate

For true pixel-based extraction, a dev build with `react-native-image-colors` would be needed.

## File Location

`hooks/useImageColors.ts`

## Dependencies

None — pure TypeScript/JavaScript using only React hooks.
