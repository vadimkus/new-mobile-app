# Favorites (Wishlist)

Favorites are stored locally (AsyncStorage) and synced with the backend wishlist when the user is logged in. The app provides a dedicated luxury wishlist screen and a quick-access icon on the home screen.

## Access Points

| Location | Action |
|----------|--------|
| **Home screen header (left)** | Heart icon — tap to open wishlist. Shows filled red heart + gold count badge when the user has favorites. |
| **Profile** | Link to "Favorites" / Wishlist (if present in profile menu). |
| **Product page** | Heart in top nav (next to Share) toggles favorite for current product. |
| **Deep link** | `genosys://favorites` (or equivalent) can route to wishlist. |

## Home Screen Icon

- **Position**: Top-left of Discover header (replaces the previous empty spacer).
- **Icon**: `heart-outline` when count is 0, `heart` (red) when count &gt; 0.
- **Badge**: Small gold pill with favorite count (e.g. "3" or "9+") when count &gt; 0.
- **Navigation**: Tap → `router.push('/profile/favorites')`.

## Wishlist Screen: `app/profile/favorites.tsx`

### Header

- Back button, title "Wishlist", optional count pill (number of favorites).

### Empty State

- Large heart icon in a gold-bordered circle.
- "Your wishlist is empty"
- "Save the products you love by tapping the heart icon"
- "Explore Products" button (gold outline) → `/(tabs)/discover`.

### Favorites List

Each favorite is a **card** with:

- **Left**: Product image on black background (rounded), 90×116px area.
- **Center**: Category (gold uppercase), product name (2 lines), price (with strikethrough if discounted), then "Add" / "In Bag" pill button.
- **Top-right**: Red heart button to remove from favorites (toggleFavorite).
- **Top edge**: Subtle gold gradient accent line.

Tapping the card opens the product detail page (`/product/:id`).

### Add to Bag

- **Per product**: "Add" pill shows bag icon; after add, shows checkmark + "In Bag" (gold styling). Uses `useCart().addItem` and `isInCart(productId)`.
- **Add All to Bag**: When there are at least 2 favorites, a gold-outline button "Add All to Bag" appears below the list; adds all listed products to the cart.

### Data

- Favorites IDs from `useFavorites().favoriteIds`.
- Full product list from `fetchProducts()`; displayed favorites = `allProducts.filter(p => favoriteIds.includes(String(p.id)))`.
- Loading state shows ActivityIndicator until products are loaded.

## Styling Summary

- **Cards**: Dark surface background, glass border, rounded corners, gold accent line on top.
- **Images**: Black background container so cutout images blend.
- **Pills**: Add/In Bag use gold tint when active; heart remove uses red icon on subtle red background.
- **Animations**: Staggered `FadeInDown` for cards and empty state; list re-renders when favorites change.
