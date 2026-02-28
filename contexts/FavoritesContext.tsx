import React, { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(FAV_KEY);
        if (raw) setFavoriteIds(JSON.parse(raw));
      } catch {}
    })();
  }, []);

  useEffect(() => {
    AsyncStorage.setItem(FAV_KEY, JSON.stringify(favoriteIds)).catch(() => {});
  }, [favoriteIds]);

  const isFavorite = useCallback((id: string) => favoriteIds.includes(id), [favoriteIds]);

  const toggleFavorite = useCallback((id: string) => {
    setFavoriteIds((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id],
    );
  }, []);

  return (
    <FavoritesContext.Provider value={{ favoriteIds, isFavorite, toggleFavorite, count: favoriteIds.length }}>
      {children}
    </FavoritesContext.Provider>
  );
}
