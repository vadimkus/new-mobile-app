# Skin Analysis

The Skin AI tab and Skin Analysis feature provide personalized product recommendations.

## Skin AI Tab

Located at `app/(tabs)/skin-ai.tsx`, the main Skin AI screen shows:

1. **Skin Score Ring** — visual score indicator
2. **Face Map** — skin concern visualization
3. **Progress History** — historical skin scores
4. **Recommended Products** — personalized suggestions from `fetchSkinRecommendations`
5. **Take New Scan** button

### Skin Analysis Section

Below the main content, two entry points:

| Card | Action |
|------|--------|
| **Personalized Quiz** | Navigates to `/skin-analysis` quiz flow |
| **AI Camera Scan** | Coming soon placeholder |

## Skin Analysis Quiz

Full quiz flow at `app/skin-analysis.tsx`:

### Steps

1. **Landing** — "Start Skin Quiz" + "AI Camera Scan (Soon)"
2. **Skin Type** — Oily / Dry / Combination / Normal / Sensitive
3. **Age Group** — 18-24 / 25-34 / 35-44 / 45-54 / 55+
4. **Concerns** — Multi-select: Acne, Wrinkles, Dark Spots, Dryness, Redness, Pores, Dark Circles
5. **Usage** — Daily routine preference
6. **Results** — Personalized product recommendations

### API Integration

```typescript
const recommendations = await fetchSkinRecommendations({
  skinType: 'combination',
  ageGroup: '25-34',
  concerns: ['wrinkles', 'dark_spots'],
});
```

Returns array of recommended products with match scores.

### UI Features

- Progress indicator (step dots)
- Animated transitions between steps
- Haptic feedback on selections
- Glassmorphic cards
- Gold accent colors
- Loading state while fetching recommendations
