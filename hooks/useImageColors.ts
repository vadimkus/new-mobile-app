import { useState, useEffect } from 'react';
import { colors as theme } from '../constants/theme';

export interface ProductColors {
  dominant: string;
  darkMuted: string;
  vibrant: string;
  gradient: [string, string];
  glowColor: string;
  isExtracted: boolean;
}

const DEFAULT_COLORS: ProductColors = {
  dominant: theme.bg.primary,
  darkMuted: theme.bg.primary,
  vibrant: theme.gold[500],
  gradient: [theme.bg.primary, theme.bg.secondary] as [string, string],
  glowColor: theme.gold[500],
  isExtracted: false,
};

const cache = new Map<string, ProductColors>();

function clamp(v: number): number {
  return Math.max(0, Math.min(255, Math.round(v)));
}

function rgbToHex(r: number, g: number, b: number): string {
  return `#${clamp(r).toString(16).padStart(2, '0')}${clamp(g).toString(16).padStart(2, '0')}${clamp(b).toString(16).padStart(2, '0')}`;
}

function hexToRgb(hex: string): [number, number, number] {
  const c = hex.replace('#', '');
  return [
    parseInt(c.substring(0, 2), 16),
    parseInt(c.substring(2, 4), 16),
    parseInt(c.substring(4, 6), 16),
  ];
}

function darken(hex: string, factor: number): string {
  const [r, g, b] = hexToRgb(hex);
  return rgbToHex(r * factor, g * factor, b * factor);
}

function hslToRgb(h: number, s: number, l: number): [number, number, number] {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs((h / 60) % 2 - 1));
  const m = l - c / 2;

  let r = 0, g = 0, b = 0;
  if (h < 60) { r = c; g = x; }
  else if (h < 120) { r = x; g = c; }
  else if (h < 180) { g = c; b = x; }
  else if (h < 240) { g = x; b = c; }
  else if (h < 300) { r = x; b = c; }
  else { r = c; b = x; }

  return [
    Math.round((r + m) * 255),
    Math.round((g + m) * 255),
    Math.round((b + m) * 255),
  ];
}

function hashString(str: string): number {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash + str.charCodeAt(i)) & 0x7FFFFFFF;
  }
  return hash;
}

/**
 * Generates a unique, deterministic dark color palette from an image URL.
 * Each unique product image gets its own tinted dark background and matching
 * glow color, creating visual variety while maintaining the luxury dark theme.
 *
 * Works in Expo Go with zero native dependencies.
 */
function deriveColorsFromUrl(url: string): ProductColors {
  const seed = hashString(url);

  // Derive a hue (0-360) — distributed across the spectrum
  const hue = seed % 360;

  // Dark background: very low lightness, moderate saturation for tint
  const [dr, dg, db] = hslToRgb(hue, 0.5, 0.06);
  const dominant = rgbToHex(dr, dg, db);

  // Even darker variant
  const [mr, mg, mb] = hslToRgb(hue, 0.4, 0.035);
  const darkMuted = rgbToHex(mr, mg, mb);

  // Vibrant/glow: same hue, higher saturation and lightness
  const [vr, vg, vb] = hslToRgb(hue, 0.55, 0.5);
  const vibrant = rgbToHex(vr, vg, vb);

  return {
    dominant,
    darkMuted,
    vibrant,
    gradient: [dominant, darkMuted],
    glowColor: vibrant,
    isExtracted: true,
  };
}

export function useImageColors(imageUri: string | undefined): ProductColors {
  const [productColors, setProductColors] = useState<ProductColors>(() => {
    if (imageUri) {
      const cached = cache.get(imageUri);
      if (cached) return cached;
    }
    return DEFAULT_COLORS;
  });

  useEffect(() => {
    if (!imageUri) return;

    const cached = cache.get(imageUri);
    if (cached) {
      setProductColors(cached);
      return;
    }

    const extracted = deriveColorsFromUrl(imageUri);
    cache.set(imageUri, extracted);
    setProductColors(extracted);
  }, [imageUri]);

  return productColors;
}

export function getImageColorsSync(imageUri: string): ProductColors | null {
  return cache.get(imageUri) || null;
}

export { DEFAULT_COLORS };
