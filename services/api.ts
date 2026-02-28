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

export const fetchCategories = async (): Promise<string[]> => {
  try {
    const res = await fetch(`${API}/categories`, { method: 'GET', headers: baseHeaders() });
    if (!res.ok) {
      const products = await fetchProducts();
      return [...new Set(products.map((p) => p.category).filter(Boolean))];
    }
    const data = await res.json();
    return Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
  } catch (e: any) {
    log.error('Categories failed', e?.message);
    throw e;
  }
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

export default {
  fetchProducts,
  fetchProductById,
  fetchCategories,
  fetchShippingRates,
  fetchUserProfile,
  fetchUserOrders,
  fetchUserOrderById,
  fetchPromo,
  searchProducts,
  fetchTraining,
  loginWithEmail,
  registerUser,
  loginWithGoogle,
  loginWithApple,
};
