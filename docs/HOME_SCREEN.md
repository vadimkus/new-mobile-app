# Home Screen (Discover)

The Discover tab (`app/(tabs)/discover.tsx`) is the main product browsing experience.

## Layout

```
┌─────────────────────────────────┐
│  GENOSYS (header)               │
├─────────────────────────────────┤
│  [Search bar]                   │
├─────────────────────────────────┤
│  ALL | Cream | Serum | ... (categories) │
├─────────────────────────────────┤
│  ┌─────────────────────────┐    │
│  │   Hero Product Card     │    │
│  │   (featured product)    │    │
│  └─────────────────────────┘    │
├─────────────────────────────────┤
│  Discover                       │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐       │
│  │   │ │   │ │   │ │   │ ...   │ ← Mini cards (scrollable)
│  └───┘ └───┘ └───┘ └───┘       │
├─────────────────────────────────┤
│  Recently Viewed                │
│  ┌───┐ ┌───┐ ┌───┐ ...         │ ← Mini cards (scrollable)
│  └───┘ └───┘ └───┘             │
└─────────────────────────────────┘
│  [Glass Tab Bar]                │
```

## Categories

Categories are fetched from API (`fetchCategories`) and dynamically rendered:

- **ALL** shows all products
- Individual categories filter the grid
- Combo categories (e.g., "Cream, Sun, Cushion BB") are split into primary categories
- Icons mapped via `CATEGORY_ICON_MAP` in `api.ts`

## Product Cards

### ProductHeroCard

Large featured card with:
- **Near-black gradient background** — category-specific dark gradients (e.g., `#0D0818` → `#180812`)
- Product image (supports local override)
- Badge (e.g., "BESTSELLER")
- Star rating
- Price
- Side action buttons: favorite + add to bag

The dark gradients ensure cutout PNG images blend seamlessly.

### ProductMiniCard

Compact grid card with:
- **Pure black background** (`#000000`) — cutout images blend perfectly
- Product image (supports local override)
- Favorite button (top-right)
- Product name (2 lines max)
- Price
- "Add" button (gold, triggers toast)

## Image Blending

Both card types use dark/black backgrounds for seamless transparent PNG integration:

| Card Type | Background |
|-----------|------------|
| ProductMiniCard | `#000000` (pure black) |
| ProductHeroCard | Near-black gradient with subtle color tint |

This ensures cutout product images with transparent backgrounds appear to float naturally without visible edges.

## Local Image Overrides

```typescript
const LOCAL_IMAGE_OVERRIDES: Record<string, any> = {
  'eye contour': require('../../assets/images/serum_cut.png'),
};

function getLocalImage(name: string): any | undefined {
  const key = Object.keys(LOCAL_IMAGE_OVERRIDES).find(
    (k) => name.toLowerCase().includes(k),
  );
  return key ? LOCAL_IMAGE_OVERRIDES[key] : undefined;
}
```

Pass `localImageSource={getLocalImage(product.name)}` to cards.

## Search

- **Word-by-word matching** across: name, description, category, keyBenefits, skinType, formulation
- **Global search** — bypasses active category filter when query is entered
- Search bar with magnifying glass icon

## Add to Bag Toast

When adding a product to bag from home screen:

1. **Bag icon bounce** — spring animation on the tab bar bag icon
2. **Golden halo ripple** — expands from bag icon
3. **Floating glass pill toast** — slides up above tab bar with:
   - Product thumbnail
   - Product name
   - "Added to Bag" text
   - Checkmark icon
   - Shimmer animation
4. **Auto-dismiss** — slides back down after ~2.5s

Implemented in `GlassTabBar.tsx` via `lastAdded` tracking in `CartContext`.

## Recently Viewed

- Stored in AsyncStorage (last 20 products)
- Horizontal scrollable section
- Recorded when visiting product detail page (`addToRecentlyViewed`)

## Data Caching

- Products cached via `productCache.ts` (1h TTL)
- Cache-first loading for fast/offline experience
- Background refresh when cache is stale
