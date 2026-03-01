/**
 * Genosys Mobile API Service
 * Pure data fetcher — server is single source of truth.
 */
import { createLogger } from '../utils/logger';
import AUTH_CONFIG from '../config/auth';
import { authenticatedFetch } from './authFetch';

const log = createLogger('api');
const API = AUTH_CONFIG.API_BASE_URL;
const API_KEY = AUTH_CONFIG.API_KEY;

const baseHeaders = (): Record<string, string> => ({
  'Content-Type': 'application/json',
  Accept: 'application/json',
  'x-api-key': API_KEY,
});

// ─── Products ────────────────────────────────────────────────────────────────

export interface Product {
  id: number | string;
  name: string;
  description?: string;
  price: number;
  salePrice?: number;
  currency: string;
  category: string;
  imageUrl?: string;
  images?: string[];
  variants?: any[];
  rating?: number;
  reviewCount?: number;
  benefits?: string[];
  ingredients?: string[];
  badge?: string;
  discount?: number;
  [key: string]: any;
}

export const fetchProducts = async (
  user?: { id?: string; token?: string } | null,
  options?: { locale?: string },
): Promise<Product[]> => {
  log.debug('Fetching products');
  const headers = baseHeaders();
  if (options?.locale) headers['x-locale'] = options.locale;
  if (user?.id) headers['x-user-id'] = user.id;
  if (user?.token) headers['Authorization'] = `Bearer ${user.token}`;

  const res = await fetch(`${API}/products`, { method: 'GET', headers });

  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    log.error('Products API error', { status: res.status });
    throw new Error(`Products request failed: ${res.status} ${txt.slice(0, 200)}`);
  }

  const data = await res.json();
  const products: Product[] = Array.isArray(data) ? data : data.data || data.products || [];
  log.debug('Products received', { count: products.length });
  return products;
};

export const fetchProductById = async (
  productId: string | number,
  user?: { id?: string; token?: string } | null,
  options?: { locale?: string },
): Promise<Product | null> => {
  log.debug('Fetching product', { productId });
  const headers = baseHeaders();
  if (options?.locale) headers['x-locale'] = String(options.locale);
  if (user?.id) headers['x-user-id'] = user.id;
  if (user?.token) headers['Authorization'] = `Bearer ${user.token}`;

  try {
    const res = await fetch(`${API}/products/${productId}`, { method: 'GET', headers });
    if (res.ok) {
      const body = await res.json();
      return body?.data || body?.product || body;
    }
  } catch {
    log.debug('Direct product endpoint not available, searching in all');
  }

  const all = await fetchProducts(user, options);
  const id = String(productId);
  return all.find((p) => String(p.id) === id || String(p.productNumber) === id) ?? null;
};

// ─── Categories ──────────────────────────────────────────────────────────────

export interface CategoryItem {
  id: string;
  label: string;
  icon: string;
  badge?: string | null;
}

const CATEGORY_ICON_MAP: Record<string, string> = {
  'all':           'apps-outline',
  'serum':         'water-outline',
  'mask':          'happy-outline',
  'cream':         'ellipse-outline',
  'peeling':       'sparkles-outline',
  'sun':           'sunny-outline',
  'cleanser':      'water-outline',
  'toner/mist':    'flask-outline',
  'eye care':      'eye-outline',
  'device':        'hardware-chip-outline',
  'microneedling': 'medical-outline',
  'pro solution':  'medkit-outline',
  'scalp/hair':    'leaf-outline',
  'cushion bb':    'color-palette-outline',
  'beauty boxes':  'gift-outline',
  'bio meso':      'pulse-outline',
  'kits':          'grid-outline',
};

const iconForCategory = (name: string): string =>
  CATEGORY_ICON_MAP[name.toLowerCase()] || 'pricetag-outline';

function extractPrimaryCategories(
  rawNames: string[],
  badgeMap: Map<string, string | null>,
): CategoryItem[] {
  const seen = new Map<string, CategoryItem>();
  for (const raw of rawNames) {
    const parts = raw.includes(',') ? raw.split(',').map((s) => s.trim()) : [raw];
    for (const part of parts) {
      if (!part) continue;
      const key = part.toLowerCase();
      if (!seen.has(key)) {
        seen.set(key, {
          id: key,
          label: part,
          icon: iconForCategory(part),
          badge: badgeMap.get(part) ?? badgeMap.get(raw) ?? null,
        });
      }
    }
  }
  const sorted = [...seen.values()].sort((a, b) => a.label.localeCompare(b.label));
  return [{ id: 'all', label: 'All', icon: 'apps-outline' }, ...sorted];
}

export const fetchCategories = async (): Promise<CategoryItem[]> => {
  try {
    const res = await fetch(`${API}/categories`, { method: 'GET', headers: baseHeaders() });
    if (res.ok) {
      const data = await res.json();
      const names: string[] = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
      const badges: Array<{ name: string; badge: string | null }> = data?.categoriesWithBadges || [];
      const badgeMap = new Map(badges.map((b) => [b.name, b.badge]));
      return extractPrimaryCategories(names, badgeMap);
    }
  } catch (e: any) {
    log.debug('Categories endpoint unavailable, deriving from products', e?.message);
  }

  const products = await fetchProducts();
  const rawNames = [...new Set(products.map((p) => p.category).filter(Boolean))];
  return extractPrimaryCategories(rawNames, new Map());
};

// ─── Shipping ────────────────────────────────────────────────────────────────

export interface ShippingRates {
  currency: string;
  vatRate: number;
  freeShippingThreshold: number;
  emirates: { name: string; shippingCost: number }[];
}

const FALLBACK_SHIPPING: ShippingRates = {
  currency: 'AED',
  vatRate: 0.05,
  freeShippingThreshold: 1000,
  emirates: [
    { name: 'Dubai', shippingCost: 45 },
    { name: 'Abu Dhabi', shippingCost: 70 },
    { name: 'Sharjah', shippingCost: 70 },
    { name: 'Ajman', shippingCost: 70 },
    { name: 'Ras Al Khaimah', shippingCost: 70 },
    { name: 'Fujairah', shippingCost: 70 },
    { name: 'Umm Al Quwain', shippingCost: 70 },
  ],
};

export const fetchShippingRates = async (): Promise<ShippingRates> => {
  try {
    const res = await fetch(`${API}/shipping-rates`, { method: 'GET', headers: baseHeaders() });
    if (!res.ok) return FALLBACK_SHIPPING;
    const body = await res.json();
    const data = body?.data || body;
    return data?.emirates ? data : FALLBACK_SHIPPING;
  } catch {
    return FALLBACK_SHIPPING;
  }
};

// ─── User Profile ────────────────────────────────────────────────────────────

export const fetchUserProfile = async (token: string) => {
  try {
    const res = await authenticatedFetch(`${API}/auth/validate`, { method: 'GET' }, token);
    if (res.ok) {
      const result = await res.json();
      return result.user ?? result;
    }
    return null;
  } catch {
    return null;
  }
};

// ─── Orders ──────────────────────────────────────────────────────────────────

export const fetchUserOrders = async (token: string): Promise<any[]> => {
  const res = await authenticatedFetch(`${API}/orders`, { method: 'GET' }, token);
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Orders request failed: ${res.status} ${txt.slice(0, 200)}`);
  }
  const body = await res.json();
  return Array.isArray(body) ? body : body.data || body.orders || [];
};

export const fetchUserOrderById = async (token: string, orderId: string) => {
  const res = await authenticatedFetch(`${API}/orders/${orderId}`, { method: 'GET' }, token);
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`Order request failed: ${res.status}`);
  }
  const body = await res.json();
  return body?.data || body?.order || body;
};

// ─── Promo ───────────────────────────────────────────────────────────────────

export const fetchPromo = async (locale = 'en') => {
  try {
    const res = await fetch(`${API}/promo?locale=${encodeURIComponent(locale)}`, {
      method: 'GET',
      headers: baseHeaders(),
    });
    if (!res.ok) return null;
    const body = await res.json();
    return body?.data ?? null;
  } catch {
    return null;
  }
};

// ─── Search ──────────────────────────────────────────────────────────────────

export const searchProducts = async (
  query: string,
  category = '',
  user?: { token?: string } | null,
): Promise<Product[]> => {
  const headers = baseHeaders();
  if (user?.token) headers['Authorization'] = `Bearer ${user.token}`;

  const params = new URLSearchParams();
  if (query) params.append('q', query);
  if (category) params.append('category', category);

  try {
    const res = await fetch(`${API}/products/search?${params}`, { method: 'GET', headers });
    if (res.ok) {
      const data = await res.json();
      return Array.isArray(data) ? data : data.products || [];
    }
  } catch {}

  const all = await fetchProducts(user);
  return all.filter((p) => {
    const q = query.toLowerCase();
    const matchQ = !query || p.name?.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q);
    const matchC = !category || p.category === category;
    return matchQ && matchC;
  });
};

// ─── Training ────────────────────────────────────────────────────────────────

export const fetchTraining = async (options?: { locale?: string }) => {
  try {
    const headers = baseHeaders();
    if (options?.locale) headers['x-locale'] = options.locale;
    const res = await fetch(`${API}/training`, { method: 'GET', headers });
    if (!res.ok) throw new Error(`Training failed: ${res.status}`);
    return await res.json();
  } catch (e: any) {
    log.error('Training fetch failed', e?.message);
    throw e;
  }
};

// ─── Skin Recommendations ─────────────────────────────────────────────────────

export const fetchSkinRecommendations = async (params: {
  skinType: string;
  ageGroup: string;
  targetConcerns: string;
}) => {
  try {
    const baseUrl = (API || '').replace('/api/mobile', '');
    const qs = new URLSearchParams({
      skinType: params.skinType,
      ageGroup: params.ageGroup,
      targetConcerns: params.targetConcerns,
    });
    const res = await fetch(`${baseUrl}/api/skin-recommendations?${qs.toString()}`, {
      method: 'GET',
      headers: { Accept: 'application/json', 'x-api-key': API_KEY },
    });
    if (!res.ok) throw new Error(`Skin recs failed: ${res.status}`);
    return await res.json();
  } catch (e: any) {
    log.error('Skin recommendation fetch failed', e?.message);
    throw e;
  }
};

// ─── Auth ────────────────────────────────────────────────────────────────────

export const loginWithEmail = async (email: string, password: string) => {
  const res = await fetch(`${API}/auth/login`, {
    method: 'POST',
    headers: baseHeaders(),
    body: JSON.stringify({ email, password }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) return { success: false, error: body?.error || body?.message || 'Login failed' };
  return { success: true, user: body.user, token: body.token };
};

export const registerUser = async (
  name: string,
  email: string,
  password: string,
  extra?: { phone?: string; address?: string; emirate?: string; birthday?: string },
) => {
  const res = await fetch(`${API}/auth/register`, {
    method: 'POST',
    headers: baseHeaders(),
    body: JSON.stringify({ name, email, password, ...extra }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) return { success: false, error: body?.error || body?.message || 'Registration failed' };
  return { success: true, user: body.user, token: body.token };
};

export const loginWithGoogle = async (idToken: string) => {
  const res = await fetch(`${API}/auth/google`, {
    method: 'POST',
    headers: baseHeaders(),
    body: JSON.stringify({ idToken }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) return { success: false, error: body?.error || 'Google login failed' };
  return { success: true, user: body.user, token: body.token };
};

// ─── App Version Check ───────────────────────────────────────────────────────

export const checkAppVersion = async (): Promise<{ updateRequired: boolean; minimumVersion?: string }> => {
  try {
    const res = await fetch(`${API}/mobile/app-version`, { headers: baseHeaders() });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) return { updateRequired: false };
    return {
      updateRequired: body.updateRequired === true,
      minimumVersion: body.minimumVersion,
    };
  } catch {
    return { updateRequired: false };
  }
};

// ─── Password Reset ──────────────────────────────────────────────────────────

export const requestPasswordReset = async (email: string) => {
  try {
    const res = await fetch(`${API}/auth/forgot-password`, {
      method: 'POST',
      headers: baseHeaders(),
      body: JSON.stringify({ email }),
    });
    const body = await res.json().catch(() => null);
    if (!res.ok) return { success: false, error: body?.error || body?.message || 'Could not request password reset' };
    return { success: true, message: body?.message || 'Reset email sent' };
  } catch {
    return { success: false, error: 'Network error. Please try again.' };
  }
};

export const resetPasswordWithToken = async (resetToken: string, newPassword: string) => {
  try {
    const res = await fetch(`${API}/auth/reset-password`, {
      method: 'POST',
      headers: baseHeaders(),
      body: JSON.stringify({ token: resetToken, newPassword }),
    });
    const body = await res.json().catch(() => null);
    if (!res.ok) return { success: false, error: body?.error || body?.message || 'Could not reset password' };
    return { success: true, message: body?.message || 'Password reset' };
  } catch {
    return { success: false, error: 'Network error. Please try again.' };
  }
};

// ─── Profile Update ─────────────────────────────────────────────────────────

export const updateUserProfile = async (
  token: string,
  updates: { name?: string; phone?: string; address?: string; emirate?: string; birthday?: string },
) => {
  const res = await authenticatedFetch(`${API}/auth/profile`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  }, token);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) return { success: false, error: body?.error || body?.message || 'Update failed' };
  return { success: true, user: body.user ?? body };
};

// ─── Order Creation ─────────────────────────────────────────────────────────

export interface CreateOrderPayload {
  items: { productId: string | number; quantity: number; variant?: string; price: number }[];
  shippingAddress: { name: string; address: string; emirate: string; phone: string };
  paymentMethod: 'cod' | 'card';
  promoCode?: string;
  notes?: string;
}

export const createOrder = async (token: string, payload: CreateOrderPayload) => {
  const res = await authenticatedFetch(`${API}/orders`, {
    method: 'POST',
    body: JSON.stringify(payload),
  }, token);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) return { success: false, error: body?.error || body?.message || 'Order creation failed' };
  return { success: true, order: body.order ?? body.data ?? body };
};

// ─── Push Token Registration ────────────────────────────────────────────────

export const registerPushToken = async (token: string, pushToken: string) => {
  try {
    await authenticatedFetch(`${API}/push-token`, {
      method: 'POST',
      body: JSON.stringify({ pushToken }),
    }, token);
    log.debug('Push token registered');
  } catch (e: any) {
    log.warn('Push token registration failed', e?.message);
  }
};

// ─── Delete Account ─────────────────────────────────────────────────────────

export const deleteAccount = async (token: string) => {
  const res = await authenticatedFetch(`${API}/auth/delete-account`, {
    method: 'DELETE',
  }, token);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) return { success: false, error: body?.error || 'Failed to delete account' };
  return { success: true };
};

export const loginWithApple = async (payload: { identityToken: string; fullName?: string }) => {
  const res = await fetch(`${API}/auth/apple`, {
    method: 'POST',
    headers: baseHeaders(),
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) return { success: false, error: body?.error || 'Apple login failed' };
  return { success: true, user: body.user, token: body.token };
};

// ─── Reviews ─────────────────────────────────────────────────────────────────

const WEB = AUTH_CONFIG.WEB_ORIGIN || 'https://genosys.ae';

export interface Review {
  id: string | number;
  userId?: string;
  userName?: string;
  rating: number;
  title?: string;
  comment: string;
  createdAt?: string;
}

export const fetchProductReviews = async (productId: string): Promise<{ reviews: Review[]; average: number; count: number }> => {
  try {
    const res = await fetch(`${WEB}/api/products/${productId}/reviews`);
    const body = await res.json().catch(() => ({}));
    if (!res.ok) return { reviews: [], average: 0, count: 0 };
    const reviews: Review[] = body.reviews || [];
    const average = body.averageRating ?? (reviews.length > 0 ? reviews.reduce((sum: number, r: Review) => sum + r.rating, 0) / reviews.length : 0);
    return { reviews, average, count: body.reviewCount ?? reviews.length };
  } catch {
    return { reviews: [], average: 0, count: 0 };
  }
};

export const submitReview = async (
  token: string,
  productId: string,
  data: { rating: number; title?: string; comment: string },
) => {
  try {
    const res = await authenticatedFetch(`${WEB}/api/products/${productId}/reviews`, {
      method: 'POST',
      body: JSON.stringify(data),
    }, token);
    const body = await res.json().catch(() => ({}));
    return { success: res.ok, review: body.review, error: body?.error };
  } catch {
    return { success: false, error: 'Network error' };
  }
};

export const deleteReview = async (token: string, productId: string, reviewId: string) => {
  try {
    const res = await authenticatedFetch(`${WEB}/api/products/${productId}/reviews/${reviewId}`, {
      method: 'DELETE',
    }, token);
    return { success: res.ok };
  } catch {
    return { success: false };
  }
};

// ─── Membership ──────────────────────────────────────────────────────────────

export interface MembershipData {
  memberNumber: string;
  memberSince: string;
  tier: 'MEMBER' | 'SILVER' | 'GOLD' | 'PLATINUM';
  tierProgress: {
    currentSpent: number;
    nextTierAt: number;
    nextTier: string | null;
    progressPercent: number;
  };
  stats: {
    totalOrders: number;
    totalSpent: number;
    loyaltyPoints: number;
  };
  user: {
    name: string;
    email: string;
  };
}

export const fetchMembership = async (token: string): Promise<MembershipData | null> => {
  try {
    const res = await authenticatedFetch(`${API}/membership`, { method: 'GET' }, token);
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body.success) return null;
    return body as MembershipData;
  } catch {
    return null;
  }
};

// ─── Wishlist (Server Sync) ──────────────────────────────────────────────────

export const fetchWishlist = async (token: string): Promise<string[]> => {
  try {
    const res = await authenticatedFetch(`${API}/user/wishlist`, { method: 'GET' }, token);
    const body = await res.json().catch(() => ({}));
    if (!res.ok) return [];
    const items = body.wishlist || body.items || body;
    if (Array.isArray(items)) return items.map((i: any) => String(i.productId || i.id || i));
    return [];
  } catch {
    return [];
  }
};

export const addToWishlist = async (token: string, productId: string) => {
  try {
    await authenticatedFetch(`${API}/user/wishlist`, {
      method: 'POST',
      body: JSON.stringify({ productId }),
    }, token);
  } catch {}
};

export const removeFromWishlist = async (token: string, productId: string) => {
  try {
    await authenticatedFetch(`${API}/user/wishlist/${productId}`, {
      method: 'DELETE',
    }, token);
  } catch {}
};

export default {
  fetchProducts,
  fetchProductById,
  fetchCategories,
  fetchShippingRates,
  fetchUserProfile,
  updateUserProfile,
  fetchUserOrders,
  fetchUserOrderById,
  createOrder,
  fetchPromo,
  searchProducts,
  fetchTraining,
  fetchSkinRecommendations,
  fetchMembership,
  loginWithEmail,
  registerUser,
  loginWithGoogle,
  loginWithApple,
  registerPushToken,
  deleteAccount,
};
