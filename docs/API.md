# Backend API Integration

The app uses the same backend as the existing GENOSYS mobile app. Base URL and key come from `config/auth.ts` (e.g. `EXPO_PUBLIC_API_BASE_URL`, `EXPO_PUBLIC_API_KEY`).

## Auth

| Method | Endpoint | Notes |
|--------|----------|--------|
| POST | `/auth/login` | `{ email, password }` → `{ user, token }` |
| POST | `/auth/register` | `{ name, email, password, phone?, address?, emirate?, birthday? }` |
| POST | `/auth/forgot-password` | `{ email }` |
| POST | `/auth/reset-password` | `{ token, newPassword }` |
| POST | `/auth/google` | `{ idToken }` |
| POST | `/auth/apple` | `{ identityToken, fullName? }` |
| PUT | `/auth/profile` | Updates (name, phone, address, emirate, birthday); auth required |
| DELETE | `/auth/delete-account` | Auth required |

## Products & catalog

| Method | Endpoint | Notes |
|--------|----------|--------|
| GET | Products list | Via `fetchProducts(ctx?)` — category, search, etc. |
| GET | Product by ID | Via `fetchProductById(id, ctx?)` |
| GET | Categories | Via `fetchCategories()` |
| GET | Search | Via `searchProducts(query, ctx?)` |

## User

| Method | Endpoint | Notes |
|--------|----------|--------|
| GET | `/user/wishlist` | Returns list of product IDs |
| POST | `/user/wishlist` | `{ productId }` |
| DELETE | `/user/wishlist/:productId` | |

## Orders

| Method | Endpoint | Notes |
|--------|----------|--------|
| GET | User orders | Via `fetchUserOrders(token)` |
| GET | Order by ID | Via `fetchUserOrderById(token, id)` |
| POST | Create order | Via `createOrder(token, payload)` — cart items, shipping, payment method |

## Shipping & promo

| Method | Endpoint | Notes |
|--------|----------|--------|
| GET | Shipping rates | Via `fetchShippingRates()` |
| GET | Promo | Via `fetchPromo()` |

## Reviews (web origin)

Reviews use the **web origin** (e.g. `https://genosys.ae`), not the mobile API base:

| Method | Endpoint | Notes |
|--------|----------|--------|
| GET | `/api/products/:productId/reviews` | List + average |
| POST | `/api/products/:productId/reviews` | Auth; `{ rating, title?, comment }` |
| DELETE | `/api/products/:productId/reviews/:reviewId` | Auth |

## Other

| Method | Endpoint | Notes |
|--------|----------|--------|
| POST | Register push token | Via `registerPushToken(token, pushToken)` |
| GET | `/mobile/app-version` | Returns `{ updateRequired?, minimumVersion? }` for force-update check |

## Auth header

Authenticated requests use `authenticatedFetch(url, options, token)` from `services/authFetch.ts`, which adds `Authorization: Bearer <token>` and the API key header.
