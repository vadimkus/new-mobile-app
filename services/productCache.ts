import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Product } from './api';

const CACHE_KEY = '@product_cache';
const CACHE_TIMESTAMP_KEY = '@product_cache_ts';
const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour

export async function getCachedProducts(): Promise<Product[] | null> {
  try {
    const [raw, tsRaw] = await Promise.all([
      AsyncStorage.getItem(CACHE_KEY),
      AsyncStorage.getItem(CACHE_TIMESTAMP_KEY),
    ]);
    if (!raw || !tsRaw) return null;

    const ts = parseInt(tsRaw, 10);
    if (Date.now() - ts > CACHE_TTL_MS) return null;

    return JSON.parse(raw) as Product[];
  } catch {
    return null;
  }
}

export async function setCachedProducts(products: Product[]): Promise<void> {
  try {
    await Promise.all([
      AsyncStorage.setItem(CACHE_KEY, JSON.stringify(products)),
      AsyncStorage.setItem(CACHE_TIMESTAMP_KEY, String(Date.now())),
    ]);
  } catch {}
}

export async function clearProductCache(): Promise<void> {
  try {
    await Promise.all([
      AsyncStorage.removeItem(CACHE_KEY),
      AsyncStorage.removeItem(CACHE_TIMESTAMP_KEY),
    ]);
  } catch {}
}
