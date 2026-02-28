import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@recently_viewed';
const MAX_ITEMS = 20;

export async function getRecentlyViewed(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function addToRecentlyViewed(productId: string): Promise<void> {
  try {
    const current = await getRecentlyViewed();
    const filtered = current.filter((id) => id !== productId);
    const updated = [productId, ...filtered].slice(0, MAX_ITEMS);
    await AsyncStorage.setItem(KEY, JSON.stringify(updated));
  } catch {}
}

export async function clearRecentlyViewed(): Promise<void> {
  try {
    await AsyncStorage.removeItem(KEY);
  } catch {}
}
