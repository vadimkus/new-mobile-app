# Product Page

The product detail page (`app/product/[id].tsx`) is a premium, interactive experience with multiple luxury features.

## Interactive Orbital Podium

The `InteractivePodium` component (`components/product/InteractivePodium.tsx`) is the centerpiece of the product page.

### Features

| Feature | Description |
|---------|-------------|
| **Orbital Constellation** | Benefit pills orbit the product image on an elliptical path using trigonometry |
| **Swipe to Spin** | Pan gesture rotates the entire constellation clockwise/counter-clockwise |
| **Inertia Physics** | On release, `withDecay()` applies momentum — fast flicks spin with realistic deceleration |
| **Auto-Rotate** | When idle, constellation slowly rotates (45s per revolution) |
| **Depth Simulation** | Pills at "back" (top) are smaller/dimmer; pills at "front" (bottom) are full-size |
| **Gyroscope Parallax** | Product image shifts subtly with device tilt via `useAnimatedSensor` |
| **Ambient Effects** | Gold glow pulse, sparkle particles, orbit ring hint |
| **Edge Fade Blending** | LinearGradient overlays on all four edges fade image into black background |
| **SVG Radial Glow** | Smooth radial gradient behind product for ambient lighting effect |
| **Z-Index Layering** | Pills always render on top of product image (zIndex 10-30 vs image zIndex 1) |

### Pill Interaction

When tapping a benefit pill:

1. **Gold border breathing** — border transitions from transparent → dim gold → bright gold in a 1.2s cycle
2. **Outer aura** — soft gold blur expands behind the selected pill (1.25x scale)
3. **Connection line** — dashed SVG line draws from product center to selected pill
4. **Dimming** — non-selected pills fade to 15% opacity
5. **Detail card** — glassmorphic card slides up with full benefit text
6. **Haptic feedback** — medium impact on select, light on deselect

Tap pill again or background to deselect.

### Image Tap to Expand

Tapping the product image opens a fullscreen lightbox:

- **Spring zoom** — physics-based `ZoomIn.springify()` animation
- **Dark overlay** — 95% black background fades in
- **Gold accent ring** — decorative ring behind expanded image
- **Close hint** — "Tap anywhere to close" blur pill at bottom
- **Exit animation** — `ZoomOut` + `FadeOut` on dismiss

A subtle gold ring on the product image hints it's tappable.

### Technical Details

```
Dependencies:
- react-native-reanimated (animations, gestures, sensors)
- react-native-gesture-handler (Pan, Tap gestures)
- react-native-svg (connection lines, shadows)
- expo-blur (glassmorphism)
- expo-haptics (feedback)
```

## Cutout Image Blending

For transparent PNG cutout images on black backgrounds:

### Edge Fade Gradients

Four `LinearGradient` overlays on the product image, one per edge:

```typescript
<LinearGradient
  colors={[BG, 'transparent']}  // BG = colors.bg.primary (#0A0A0A)
  start={{ x: 0.5, y: 0 }}
  end={{ x: 0.5, y: 0.18 }}
  style={styles.edgeFade}
/>
```

- **Top edge**: fades from black to transparent (18% of height)
- **Bottom edge**: fades from transparent to black
- **Left/Right edges**: 15% fade width

This creates a soft vignette that dissolves hard edges seamlessly.

### SVG Ambient Glow

```typescript
<RadialGradient id="ambientGlow" cx="50%" cy="50%" rx="50%" ry="50%">
  <Stop offset="0%" stopColor={gold} stopOpacity={0.18} />
  <Stop offset="35%" stopColor={gold} stopOpacity={0.08} />
  <Stop offset="70%" stopColor={gold} stopOpacity={0.02} />
  <Stop offset="100%" stopColor="#000" stopOpacity={0} />
</RadialGradient>
```

Creates realistic ambient lighting behind the floating product.

## Expandable Sections

Three collapsible accordion sections: About, Application Method, and Customer Reviews.

### About Section

- **Collapsed**: Shows info-circle icon + "About" title + chevron-down
- **Expanded**: Reveals product description text
- **Animation**: `LayoutAnimation` for smooth expand/collapse

### Application Method Section

- **Collapsed**: Shows hand icon + "Application Method" title + chevron-down
- **Expanded**: Reveals numbered steps (parsed from `howToUse` API field) + optional directions note
- **Step parsing**: Auto-detects numbered lists, bullet points, or sentences and renders as numbered steps
- **Animation**: `LayoutAnimation` for smooth expand/collapse

### Customer Reviews Section

- **Collapsed**: Shows chatbubbles icon + "Customer Reviews" title + review count badge + average rating + chevron-down
- **Expanded**: Reveals summary stats, review list, and write-review form
- **Write Review**: Star rating picker, title input, comment textarea (login required)
- **Delete**: Users can delete their own reviews
- **Animation**: `LayoutAnimation` for smooth expand/collapse

## Local Image Overrides

For testing with custom product images:

```typescript
// app/product/[id].tsx
const LOCAL_IMAGE_OVERRIDES: Record<string, any> = {
  'eye contour': require('../../assets/images/serum_cut.png'),
};
```

Any product name containing the key (case-insensitive) uses the local image instead of API URL.

## Data Flow

```
1. fetchProductById(id) → API response
2. Parse benefits/ingredients (handle JSON strings via parseSafeArray)
3. Extract howToUse/directions for Application Method
4. Check LOCAL_IMAGE_OVERRIDES for image source
5. Render InteractivePodium + expandable sections + reviews
```

## Bottom Action Bar

Floating glass pill design matching the home screen tab bar:

- **Price** — left section
- **Add to Bag** — center (gold icon + text), triggers bag bounce + toast
- **Favorite** — right (heart icon, red when favorited)
- **Shimmer** — gold line sweeps across on add to bag
- **Glassmorphism** — `BlurView` with rounded corners and subtle border
