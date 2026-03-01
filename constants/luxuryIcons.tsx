import React from 'react';
import {
  Sparkle,
  Drop,
  Leaf,
  Flask,
  Diamond,
  Dna,
  Sun,
  ShieldCheck,
  Eye,
  FlowerLotus,
  Snowflake,
  Lightning,
  Fingerprint,
  Crown,
  Feather,
  Fire,
  Atom,
  TestTube,
  Moon,
  Wind,
  Heart,
  Star,
  Plant,
  Waves,
  Syringe,
  Target,
  SealCheck,
  FirstAid,
  Pill,
  Heartbeat,
  Lightbulb,
} from 'phosphor-react-native';
import type { IconWeight } from 'phosphor-react-native';

export type LuxuryIconName = keyof typeof ICON_MAP;

const ICON_MAP = {
  sparkle: Sparkle,
  hydration: Drop,
  natural: Leaf,
  science: Flask,
  premium: Diamond,
  dna: Dna,
  brightening: Sun,
  protection: ShieldCheck,
  eye: Eye,
  botanical: FlowerLotus,
  cooling: Snowflake,
  energy: Lightning,
  texture: Fingerprint,
  luxury: Crown,
  gentle: Feather,
  warming: Fire,
  molecular: Atom,
  clinical: TestTube,
  night: Moon,
  fresh: Wind,
  care: Heart,
  rating: Star,
  organic: Plant,
  marine: Waves,
  treatment: Syringe,
  precision: Target,
  certified: SealCheck,
  healing: FirstAid,
  supplement: Pill,
  vitality: Heartbeat,
  innovation: Lightbulb,
} as const;

const BENEFIT_KEYWORD_MAP: Record<string, LuxuryIconName> = {
  hydrat: 'hydration',
  moistur: 'hydration',
  water: 'hydration',
  plump: 'hydration',
  hyaluron: 'hydration',

  bright: 'brightening',
  glow: 'brightening',
  lumin: 'brightening',
  radian: 'brightening',
  lighten: 'brightening',

  anti: 'science',
  aging: 'science',
  wrinkle: 'science',
  'fine line': 'science',
  collagen: 'dna',

  firm: 'energy',
  lift: 'energy',
  elastic: 'energy',
  tighten: 'energy',

  protect: 'protection',
  shield: 'protection',
  barrier: 'protection',
  defense: 'protection',
  spf: 'protection',
  uv: 'protection',

  repair: 'healing',
  heal: 'healing',
  restor: 'healing',
  recover: 'healing',
  renew: 'healing',
  regenerat: 'dna',

  sooth: 'gentle',
  calm: 'gentle',
  sensitive: 'gentle',
  gentle: 'gentle',
  comfort: 'gentle',

  smooth: 'texture',
  texture: 'texture',
  pore: 'texture',
  refine: 'texture',
  exfoli: 'texture',

  nourish: 'botanical',
  vitamin: 'botanical',
  nutrient: 'botanical',
  botanical: 'botanical',
  herbal: 'botanical',
  extract: 'botanical',

  natural: 'natural',
  organic: 'organic',
  plant: 'organic',
  green: 'organic',
  vegan: 'natural',

  eye: 'eye',
  'dark circle': 'eye',
  puff: 'eye',
  'under-eye': 'eye',
  contour: 'eye',

  cool: 'cooling',
  refresh: 'cooling',
  crisp: 'cooling',
  menthol: 'cooling',

  night: 'night',
  sleep: 'night',
  overnight: 'night',

  peptide: 'molecular',
  serum: 'molecular',
  retinol: 'clinical',
  acid: 'clinical',
  niacinamide: 'clinical',
  ceramide: 'molecular',

  premium: 'premium',
  luxury: 'luxury',
  exclusive: 'luxury',
  gold: 'luxury',

  detox: 'fresh',
  purif: 'fresh',
  cleans: 'fresh',
  clear: 'fresh',

  marine: 'marine',
  sea: 'marine',
  ocean: 'marine',
  aqua: 'marine',
};

const CYCLE_ICONS: LuxuryIconName[] = [
  'sparkle', 'hydration', 'botanical', 'science',
  'premium', 'dna', 'brightening',
];

export function matchBenefitIcon(benefitText: string): LuxuryIconName {
  const lower = benefitText.toLowerCase();
  for (const [keyword, iconName] of Object.entries(BENEFIT_KEYWORD_MAP)) {
    if (lower.includes(keyword)) return iconName;
  }
  return 'sparkle';
}

export function getCycleIcon(index: number): LuxuryIconName {
  return CYCLE_ICONS[index % CYCLE_ICONS.length];
}

interface LuxuryIconProps {
  name: LuxuryIconName;
  size?: number;
  color?: string;
  weight?: IconWeight;
}

export function LuxuryIcon({
  name,
  size = 20,
  color = 'rgba(201, 169, 110, 0.75)',
  weight = 'duotone',
}: LuxuryIconProps) {
  const IconComponent = ICON_MAP[name];
  if (!IconComponent) return null;
  return <IconComponent size={size} color={color} weight={weight} />;
}

export { ICON_MAP };
export default LuxuryIcon;
