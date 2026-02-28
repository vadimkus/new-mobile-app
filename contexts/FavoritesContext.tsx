import React, { createContext, useContext, useState, useCallback, useEffect, useRef, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { fetchWishlist, addToWishlist, removeFromWishlist } from '../services/api';
import { useAuth } from './AuthContext';

const FAV_KEY = '@genosys_favorites';

interface FavoritesState {
  favoriteIds: string[];
  isFavorite: (id: string) => boolean;
  toggleFavorite: (id: string) => void;
  count: number;
}

const FavoritesContext = createContext<FavoritesState>({
  favoriteIds: [],
  isFavorite: () => false,
  toggleFavorite: () => {},
  count: 0,
});

export const useFavorites = () => useContext(FavoritesContext);

export function FavoritesProvider({ children }: { children: ReactNode }) {
  const { user, token } = useAuth();
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const syncedRef = useRef(false);

  // Load from local storage first (instant)
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(FAV_KEY);
        if (raw) setFavoriteIds(JSON.parse(raw));
      } catch {}
    })();
  }, []);

  // Sync with server when user logs in
  useEffect(() => {
    if (!token || syncedRef.current) return;
    syncedRef.current = true;
    (async () => {
      try {
        const serverIds = await fetchWishlist(token);
        if (serverIds.length > 0) {
          setFavoriteIds((local) => {
            const merged = Array.from(new Set([...local, ...serverIds]));
            return merged;
          });
        }
      } catch {}
    })();
  }, [token]);

  // Reset sync flag on logout
  useEffect(() => {
    if (!user) syncedRef.current = false;
  }, [user]);

  // Persist locally whenever favorites change
  useEffect(() => {
    AsyncStorage.setItem(FAV_KEY, JSON.stringify(favoriteIds)).catch(() => {});
  }, [favoriteIds]);

  const isFavorite = useCallback((id: string) => favoriteIds.includes(String(id)), [favoriteIds]);

  const toggleFavorite = useCallback(
    (id: string) => {
      const sid = String(id);
      setFavoriteIds((prev) => {
        const removing = prev.includes(sid);
        // Fire-and-forget server sync
        if (token) {
          if (removing) removeFromWishlist(token, sid);
          else addToWishlist(token, sid);
        }
        return removing ? prev.filter((fid) => fid !== sid) : [...prev, sid];
      });
    },
    [token],
  );

  return (
    <FavoritesContext.Provider value={{ favoriteIds, isFavorite, toggleFavorite, count: favoriteIds.length }}>
      {children}
    </FavoritesContext.Provider>
  );
}
