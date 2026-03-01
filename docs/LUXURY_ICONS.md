# Luxury Icons

The app uses **Phosphor Icons** (`phosphor-react-native`) for a consistent, premium icon set. A custom mapping layer in `constants/luxuryIcons.tsx` maps skincare benefit keywords to specific Phosphor icons and exposes a reusable `LuxuryIcon` component.

## Why Phosphor

- **SVG-based** — crisp at any size, no pixelation
- **Six weights** — thin, light, regular, bold, fill, **duotone** (used for luxury feel)
- **MIT licensed** — safe for commercial use
- **Expo-compatible** — works in Expo Go (no native modules beyond react-native-svg)
- **Tree-shakeable** — only imported icons are bundled

## Installation

```bash
npm install phosphor-react-native
```

Requires `react-native-svg` (already present in Expo projects).

## File: `constants/luxuryIcons.tsx`

### ICON_MAP

Maps semantic names to Phosphor components:

| Name | Phosphor Icon | Use case |
|------|---------------|----------|
| `sparkle` | Sparkle | Default / shimmer |
| `hydration` | Drop | Moisture, water, plump |
| `natural` | Leaf | Natural ingredients |
| `science` | Flask | Anti-aging, science |
| `premium` | Diamond | Premium / luxury |
| `dna` | Dna | Collagen, regeneration |
| `brightening` | Sun | Glow, radiance, lighten |
| `protection` | ShieldCheck | Barrier, SPF, defense |
| `eye` | Eye | Eye contour, dark circles |
| `botanical` | FlowerLotus | Botanical, vitamins |
| `cooling` | Snowflake | Cooling, refresh |
| `energy` | Lightning | Firming, lift, elasticity |
| `texture` | Fingerprint | Pore, texture, refine |
| `luxury` | Crown | Exclusive, gold |
| `gentle` | Feather | Soothing, sensitive |
| ... | ... | (see file for full list) |

### BENEFIT_KEYWORD_MAP

Object whose **keys are substrings** (for `matchBenefitIcon`) and **values are `LuxuryIconName`**. Multi-word keys must be quoted in JS (e.g. `'fine line'`, `'dark circle'`, `'under-eye'`).

Examples:

- `hydrat`, `moistur`, `water`, `plump`, `hyaluron` → `hydration`
- `bright`, `glow`, `lumin`, `radian`, `lighten` → `brightening`
- `anti`, `aging`, `wrinkle`, `'fine line'` → `science`
- `collagen` → `dna`
- `protect`, `shield`, `barrier`, `spf`, `uv` → `protection`
- `eye`, `'dark circle'`, `'under-eye'`, `contour` → `eye`

### Functions

- **`matchBenefitIcon(benefitText: string): LuxuryIconName`**  
  Scans `BENEFIT_KEYWORD_MAP`; returns the first matching icon name, or `'sparkle'` if none match.

- **`getCycleIcon(index: number): LuxuryIconName`**  
  Fallback when no keyword matches. Cycles through: `sparkle`, `hydration`, `botanical`, `science`, `premium`, `dna`, `brightening`.

### Component: LuxuryIcon

```tsx
import { LuxuryIcon } from '../constants/luxuryIcons';

<LuxuryIcon
  name="hydration"
  size={20}
  color="rgba(201, 169, 110, 0.75)"
  weight="duotone"
/>
```

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `name` | `LuxuryIconName` | — | Key from `ICON_MAP` |
| `size` | number | `20` | Icon size in px |
| `color` | string | gold 75% | Tint color |
| `weight` | IconWeight | `'duotone'` | Phosphor weight (thin, light, regular, bold, fill, duotone) |

## Usage in InteractivePodium

Orbiting benefit pills and the detail card use luxury icons instead of text emojis:

1. **Parse benefit** — `parseBenefit(raw, i)` returns `{ short, detail, iconName }`.
   - `iconName = matchBenefitIcon(raw)` if the benefit text matches a keyword.
   - Otherwise `iconName = getCycleIcon(i)`.

2. **Pill** — Each pill shows:
   - `<LuxuryIcon name={benefit.iconName} size={20} color="rgba(201, 169, 110, 0.7)" weight="duotone" />`
   - First word of benefit below (`benefit.short`).

3. **Detail card** — When a pill is selected:
   - Icon in a 48px circular container with gold-tinted background.
   - `<LuxuryIcon name={benefit.iconName} size={28} color={GOLD} weight="duotone" />`

## Adding New Icons

1. Import the Phosphor component in `luxuryIcons.tsx`.
2. Add an entry to `ICON_MAP` (e.g. `newConcept: NewIcon`).
3. Optionally add keyword mappings in `BENEFIT_KEYWORD_MAP` (e.g. `'new keyword': 'newConcept'`).
4. Use `<LuxuryIcon name="newConcept" ... />` or rely on `matchBenefitIcon` for new copy.

## Syntax Note for Object Keys

Object keys that contain spaces or hyphens must be quoted in JavaScript/TypeScript:

- `'fine line': 'science'`
- `'dark circle': 'eye'`
- `'under-eye': 'eye'`

Otherwise Metro/Babel can report "Unexpected token" when parsing the file.
