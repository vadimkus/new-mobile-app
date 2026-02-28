import { Dimensions, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// ─── Color Palette ───────────────────────────────────────────────────────────

export const colors = {
  // Backgrounds
  bg: {
    primary: '#0A0A0A',
    secondary: '#111111',
    surface: '#1A1A1A',
    elevated: '#222222',
    overlay: 'rgba(0, 0, 0, 0.6)',
  },

  // Glass effects
  glass: {
    light: 'rgba(255, 255, 255, 0.08)',
    medium: 'rgba(255, 255, 255, 0.12)',
    strong: 'rgba(255, 255, 255, 0.18)',
    border: 'rgba(255, 255, 255, 0.10)',
    borderStrong: 'rgba(255, 255, 255, 0.20)',
  },

  // Gold (brand primary)
  gold: {
    50: '#FBF7EF',
    100: '#F5EBD5',
    200: '#EDDCB5',
    300: '#E8D5A3',
    400: '#D4BC82',
    500: '#C9A96E',
    600: '#B8944F',
    700: '#9A7A3E',
    800: '#7C6232',
    900: '#5E4A26',
    gradient: ['#C9A96E', '#E8D5A3'] as const,
    gradientWarm: ['#C9A96E', '#D4A853'] as const,
  },

  // Rose accent
  rose: {
    300: '#F0C4C8',
    400: '#E8B4B8',
    500: '#D4949A',
    gradient: ['#E8B4B8', '#D4949A'] as const,
  },

  // Text
  text: {
    primary: '#FFFFFF',
    secondary: '#8E8E93',
    tertiary: '#636366',
    muted: '#48484A',
    gold: '#C9A96E',
    inverse: '#0A0A0A',
  },

  // Status
  status: {
    success: '#34C759',
    warning: '#FF9F0A',
    error: '#FF453A',
    info: '#5AC8FA',
  },

  // Category accent colors (for gradients on discovery cards)
  category: {
    serums: ['#2D1B4E', '#4A1528'] as const,
    masks: ['#1B2E4E', '#15384A'] as const,
    creams: ['#3E2D1B', '#4A3415'] as const,
    peeling: ['#1B4E3E', '#154A2D'] as const,
    sun: ['#4E451B', '#4A3815'] as const,
    cleanser: ['#1B2D4E', '#15284A'] as const,
    default: ['#2A1A3E', '#3E1A2A'] as const,
  },

  // Ingredient node colors
  ingredient: {
    peptide: '#C9A96E',
    hydration: '#5AC8FA',
    botanical: '#34C759',
    retinoid: '#AF52DE',
    vitamin: '#FF6B8A',
    ceramide: '#64D2FF',
    adenosine: '#FFB340',
  },
} as const;

// ─── Typography ──────────────────────────────────────────────────────────────

const fontFamily = Platform.select({
  ios: 'System',
  android: 'Roboto',
  default: 'System',
});

export const typography = {
  display: {
    fontFamily,
    fontSize: 34,
    fontWeight: '700' as const,
    lineHeight: 41,
    letterSpacing: 0.4,
    color: colors.text.primary,
  },
  title1: {
    fontFamily,
    fontSize: 28,
    fontWeight: '700' as const,
    lineHeight: 34,
    letterSpacing: 0.36,
    color: colors.text.primary,
  },
  title2: {
    fontFamily,
    fontSize: 22,
    fontWeight: '700' as const,
    lineHeight: 28,
    letterSpacing: 0.35,
    color: colors.text.primary,
  },
  title3: {
    fontFamily,
    fontSize: 20,
    fontWeight: '600' as const,
    lineHeight: 25,
    letterSpacing: 0.38,
    color: colors.text.primary,
  },
  headline: {
    fontFamily,
    fontSize: 17,
    fontWeight: '600' as const,
    lineHeight: 22,
    letterSpacing: -0.41,
    color: colors.text.primary,
  },
  body: {
    fontFamily,
    fontSize: 17,
    fontWeight: '400' as const,
    lineHeight: 22,
    letterSpacing: -0.41,
    color: colors.text.primary,
  },
  bodySmall: {
    fontFamily,
    fontSize: 15,
    fontWeight: '400' as const,
    lineHeight: 20,
    letterSpacing: -0.24,
    color: colors.text.primary,
  },
  caption1: {
    fontFamily,
    fontSize: 12,
    fontWeight: '400' as const,
    lineHeight: 16,
    color: colors.text.secondary,
  },
  caption2: {
    fontFamily,
    fontSize: 11,
    fontWeight: '400' as const,
    lineHeight: 13,
    letterSpacing: 0.07,
    color: colors.text.secondary,
  },
  label: {
    fontFamily,
    fontSize: 13,
    fontWeight: '600' as const,
    lineHeight: 18,
    letterSpacing: -0.08,
    color: colors.text.primary,
  },
  price: {
    fontFamily,
    fontSize: 20,
    fontWeight: '700' as const,
    lineHeight: 25,
    color: colors.gold[500],
  },
  priceSmall: {
    fontFamily,
    fontSize: 15,
    fontWeight: '700' as const,
    lineHeight: 20,
    color: colors.gold[500],
  },
  button: {
    fontFamily,
    fontSize: 17,
    fontWeight: '600' as const,
    lineHeight: 22,
    letterSpacing: -0.41,
  },
  tabLabel: {
    fontFamily,
    fontSize: 10,
    fontWeight: '500' as const,
    lineHeight: 12,
  },
} as const;

// ─── Spacing ─────────────────────────────────────────────────────────────────

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  section: 40,
} as const;

// ─── Border Radius ───────────────────────────────────────────────────────────

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  pill: 100,
  circle: 9999,
} as const;

// ─── Shadows ─────────────────────────────────────────────────────────────────

export const shadows = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  glow: (color: string) => ({
    shadowColor: color,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  }),
  goldGlow: {
    shadowColor: '#C9A96E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

// ─── Layout ──────────────────────────────────────────────────────────────────

export const layout = {
  screenWidth: SCREEN_WIDTH,
  screenHeight: SCREEN_HEIGHT,
  screenPadding: 20,
  cardGutter: 12,
  tabBarHeight: 80,
  headerHeight: 56,
  touchTarget: 44,
  get cardWidth() {
    return Math.floor((SCREEN_WIDTH - this.screenPadding * 2 - this.cardGutter) / 2);
  },
} as const;

// ─── Animation ───────────────────────────────────────────────────────────────

export const animation = {
  fast: 150,
  normal: 300,
  slow: 500,
  spring: {
    damping: 15,
    stiffness: 150,
    mass: 1,
  },
  springBouncy: {
    damping: 12,
    stiffness: 200,
    mass: 0.8,
  },
  springGentle: {
    damping: 20,
    stiffness: 100,
    mass: 1,
  },
} as const;
