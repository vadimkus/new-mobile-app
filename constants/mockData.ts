import { colors } from './theme';

export interface Product {
  id: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  currency: string;
  imageUrl: string;
  category: string;
  rating: number;
  badge?: string;
  gradientColors: readonly [string, string];
  benefits: { label: string; emoji: string; glowColor: string }[];
  ingredients: {
    name: string;
    concentration: number;
    origin: string;
    description: string;
    color: string;
    efficacy: number;
  }[];
}

export interface RitualStep {
  id: string;
  stepNumber: number;
  type: string;
  product: {
    id: string;
    name: string;
    imageUrl: string;
  };
  instruction: string;
  duration: number;
  waitTime?: number;
  completed: boolean;
}

export interface SkinConcern {
  zone: string;
  label: string;
  severity: 'Mild' | 'Moderate' | 'Good' | 'Minimal' | 'Improving';
  color: string;
  x: number;
  y: number;
}

export const DEMO_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'MICRO NEEDLE PDRN MASK',
    tagline: 'Revolutionary micro-needle technology',
    description: 'Advanced PDRN delivery system with dissolving micro-needles for deep skin rejuvenation.',
    price: 185,
    currency: 'AED',
    imageUrl: 'https://genosys.ae/images/products/micro-needle-pdrn-mask.webp',
    category: 'Masks',
    rating: 5,
    badge: 'NEW',
    gradientColors: colors.category.masks,
    benefits: [
      { label: 'Deep Repair', emoji: '🧬', glowColor: '#AF52DE' },
      { label: 'Hydration', emoji: '💧', glowColor: '#5AC8FA' },
      { label: 'Rejuvenation', emoji: '✨', glowColor: '#C9A96E' },
      { label: 'Firming', emoji: '🛡️', glowColor: '#34C759' },
    ],
    ingredients: [
      { name: 'PDRN', concentration: 20, origin: 'Bio-synthesized, Korea', description: 'Polydeoxyribonucleotide stimulates tissue repair and collagen synthesis at the cellular level.', color: colors.ingredient.peptide, efficacy: 5 },
      { name: 'Hyaluronic Acid', concentration: 15, origin: 'Bio-fermented, Korea', description: 'Multi-weight hyaluronic acid provides deep hydration across all skin layers.', color: colors.ingredient.hydration, efficacy: 5 },
      { name: 'Niacinamide', concentration: 10, origin: 'Pharmaceutical Grade', description: 'Strengthens skin barrier and reduces hyperpigmentation.', color: colors.ingredient.botanical, efficacy: 4 },
    ],
  },
  {
    id: '2',
    name: 'INTENSIVE PEPTIDE SERUM',
    tagline: '47% wrinkle reduction in 4 weeks',
    description: 'Award-winning peptide complex serum that targets multiple signs of aging simultaneously.',
    price: 289,
    currency: 'AED',
    imageUrl: 'https://genosys.ae/images/products/intensive-peptide-serum.webp',
    category: 'Serums',
    rating: 5,
    gradientColors: colors.category.serums,
    benefits: [
      { label: 'Anti-Aging', emoji: '✨', glowColor: '#C9A96E' },
      { label: 'Deep Hydration', emoji: '💧', glowColor: '#5AC8FA' },
      { label: 'Collagen Boost', emoji: '🧬', glowColor: '#AF52DE' },
      { label: 'Brightening', emoji: '☀️', glowColor: '#FFD60A' },
      { label: 'Barrier Repair', emoji: '🛡️', glowColor: '#34C759' },
    ],
    ingredients: [
      { name: 'Peptide Complex', concentration: 15, origin: 'Bio-fermented, Seoul, Korea', description: 'Stimulates collagen production and accelerates cell turnover. Clinical trials show 47% reduction in fine lines within 8 weeks.', color: colors.ingredient.peptide, efficacy: 5 },
      { name: 'Hyaluronic Acid', concentration: 12, origin: 'Bio-fermented, Korea', description: 'Triple-weight HA penetrates multiple skin layers for sustained hydration.', color: colors.ingredient.hydration, efficacy: 5 },
      { name: 'Niacinamide', concentration: 8, origin: 'Pharmaceutical Grade', description: 'Visibly reduces pores and evens skin tone while strengthening the moisture barrier.', color: colors.ingredient.botanical, efficacy: 4 },
      { name: 'Retinol', concentration: 2, origin: 'Stabilized, Switzerland', description: 'Encapsulated retinol promotes cell renewal without irritation.', color: colors.ingredient.retinoid, efficacy: 4 },
      { name: 'Vitamin C', concentration: 10, origin: 'Ascorbyl Glucoside, Japan', description: 'Stable vitamin C derivative provides antioxidant protection and brightening.', color: colors.ingredient.vitamin, efficacy: 4 },
      { name: 'Ceramides', concentration: 5, origin: 'Plant-derived, Korea', description: 'Restores and maintains the skin\'s natural lipid barrier.', color: colors.ingredient.ceramide, efficacy: 3 },
      { name: 'Adenosine', concentration: 3, origin: 'Yeast-derived, Korea', description: 'Natural anti-wrinkle compound that smooths fine lines.', color: colors.ingredient.adenosine, efficacy: 4 },
    ],
  },
  {
    id: '3',
    name: 'MICRO RETINOL CREAM',
    tagline: 'Encapsulated retinol for gentle renewal',
    description: 'Next-generation retinol cream with micro-encapsulation technology for effective yet gentle skin renewal.',
    price: 245,
    currency: 'AED',
    imageUrl: 'https://genosys.ae/images/products/micro-retinol-cream.webp',
    category: 'Creams',
    rating: 4.8,
    gradientColors: colors.category.creams,
    benefits: [
      { label: 'Cell Renewal', emoji: '🔄', glowColor: '#AF52DE' },
      { label: 'Anti-Wrinkle', emoji: '✨', glowColor: '#C9A96E' },
      { label: 'Smoothing', emoji: '🪷', glowColor: '#E8B4B8' },
      { label: 'Nourishing', emoji: '🌿', glowColor: '#34C759' },
    ],
    ingredients: [
      { name: 'Micro-Retinol', concentration: 5, origin: 'Encapsulated, Switzerland', description: 'Time-release retinol microspheres deliver consistent active to skin without irritation.', color: colors.ingredient.retinoid, efficacy: 5 },
      { name: 'Ceramide Complex', concentration: 10, origin: 'Bio-identical, Korea', description: 'Triple ceramide complex mirrors skin\'s natural barrier lipids.', color: colors.ingredient.ceramide, efficacy: 4 },
      { name: 'Squalane', concentration: 8, origin: 'Olive-derived, Spain', description: 'Lightweight emollient that deeply nourishes without clogging pores.', color: colors.ingredient.botanical, efficacy: 4 },
    ],
  },
  {
    id: '4',
    name: 'PURIFYING GEL CLEANSER',
    tagline: 'Deep clean without stripping',
    description: 'pH-balanced gel cleanser that removes impurities while preserving the skin\'s natural moisture barrier.',
    price: 135,
    currency: 'AED',
    imageUrl: 'https://genosys.ae/images/products/purifying-gel-cleanser.webp',
    category: 'Cleansers',
    rating: 4.9,
    gradientColors: colors.category.cleanser,
    benefits: [
      { label: 'Deep Cleanse', emoji: '🫧', glowColor: '#5AC8FA' },
      { label: 'pH Balanced', emoji: '⚖️', glowColor: '#34C759' },
      { label: 'Gentle', emoji: '🌸', glowColor: '#E8B4B8' },
    ],
    ingredients: [
      { name: 'Green Tea Extract', concentration: 12, origin: 'Jeju Island, Korea', description: 'Rich in catechins, provides antioxidant protection while cleansing.', color: colors.ingredient.botanical, efficacy: 4 },
      { name: 'Salicylic Acid', concentration: 2, origin: 'Pharmaceutical Grade', description: 'Gentle BHA that unclogs pores and prevents breakouts.', color: colors.ingredient.retinoid, efficacy: 4 },
    ],
  },
  {
    id: '5',
    name: 'UV SHIELD SPF 50+',
    tagline: 'Invisible protection, zero white cast',
    description: 'Lightweight, invisible sunscreen with broad-spectrum SPF 50+ protection and skincare benefits.',
    price: 165,
    currency: 'AED',
    imageUrl: 'https://genosys.ae/images/products/uv-shield-spf50.webp',
    category: 'Sun',
    rating: 4.7,
    gradientColors: colors.category.sun,
    benefits: [
      { label: 'SPF 50+', emoji: '☀️', glowColor: '#FFD60A' },
      { label: 'No White Cast', emoji: '👻', glowColor: '#FFFFFF' },
      { label: 'Hydrating', emoji: '💧', glowColor: '#5AC8FA' },
    ],
    ingredients: [
      { name: 'Zinc Oxide', concentration: 18, origin: 'Nano-free, Australia', description: 'Mineral UV filter providing broad-spectrum protection without white cast.', color: colors.ingredient.ceramide, efficacy: 5 },
      { name: 'Niacinamide', concentration: 5, origin: 'Pharmaceutical Grade', description: 'Prevents UV-induced hyperpigmentation while protecting barrier.', color: colors.ingredient.botanical, efficacy: 4 },
    ],
  },
];

export const DEMO_RITUAL_STEPS: RitualStep[] = [
  {
    id: 'r1',
    stepNumber: 1,
    type: 'Cleanse',
    product: { id: '4', name: 'Purifying Gel Cleanser', imageUrl: 'https://genosys.ae/images/products/purifying-gel-cleanser.webp' },
    instruction: 'Massage gently for 60 seconds',
    duration: 60,
    completed: true,
  },
  {
    id: 'r2',
    stepNumber: 2,
    type: 'Tone',
    product: { id: '6', name: 'Micro Essence Toner', imageUrl: 'https://genosys.ae/images/products/micro-essence-toner.webp' },
    instruction: 'Pat gently into skin',
    duration: 30,
    waitTime: 30,
    completed: true,
  },
  {
    id: 'r3',
    stepNumber: 3,
    type: 'Treat',
    product: { id: '2', name: 'Intensive Peptide Serum', imageUrl: 'https://genosys.ae/images/products/intensive-peptide-serum.webp' },
    instruction: 'Apply 2-3 drops, press into skin',
    duration: 120,
    waitTime: 120,
    completed: false,
  },
  {
    id: 'r4',
    stepNumber: 4,
    type: 'Moisturize',
    product: { id: '3', name: 'Micro Retinol Cream', imageUrl: 'https://genosys.ae/images/products/micro-retinol-cream.webp' },
    instruction: 'Apply 2-3 dots, massage upward',
    duration: 45,
    completed: false,
  },
  {
    id: 'r5',
    stepNumber: 5,
    type: 'Protect',
    product: { id: '5', name: 'UV Shield SPF 50+', imageUrl: 'https://genosys.ae/images/products/uv-shield-spf50.webp' },
    instruction: 'Apply evenly as final step',
    duration: 30,
    completed: false,
  },
];

export const DEMO_SKIN_CONCERNS: SkinConcern[] = [
  { zone: 'forehead', label: 'Fine Lines', severity: 'Mild', color: '#FFD60A', x: 0.5, y: 0.18 },
  { zone: 'leftCheek', label: 'Hydration', severity: 'Good', color: '#5AC8FA', x: 0.22, y: 0.48 },
  { zone: 'rightCheek', label: 'Pigmentation', severity: 'Improving', color: '#E8B4B8', x: 0.78, y: 0.42 },
  { zone: 'nose', label: 'Pores', severity: 'Minimal', color: '#34C759', x: 0.5, y: 0.52 },
  { zone: 'underEyes', label: 'Dark Circles', severity: 'Moderate', color: '#AF52DE', x: 0.5, y: 0.72 },
];

export const CATEGORIES = [
  { id: 'all', label: 'All', icon: 'apps-outline' as const },
  { id: 'serums', label: 'Serums', icon: 'water-outline' as const },
  { id: 'masks', label: 'Masks', icon: 'happy-outline' as const },
  { id: 'creams', label: 'Creams', icon: 'ellipse-outline' as const },
  { id: 'peeling', label: 'Peeling', icon: 'sparkles-outline' as const },
  { id: 'sun', label: 'Sun', icon: 'sunny-outline' as const },
  { id: 'cleanser', label: 'Cleanser', icon: 'water-outline' as const },
];
