# Training

The Training screen (`app/profile/training.tsx`) provides educational content for users.

## Content Types

### Training Documents (PDFs)

Professional training materials:
- Document title
- PDF icon
- Opens in external PDF viewer via `Linking.openURL`

### Product Documentation

Product-specific documentation with images:
- Product thumbnail
- Document title
- PDF link
- Tap to open PDF

### Video Lessons

YouTube-hosted training videos:
- Video thumbnail (YouTube thumbnail URL)
- Lesson title
- Duration badge
- Tap to open YouTube link

## API

```typescript
const training = await fetchTraining(token);
// Returns: { documents: [], productDocs: [], videos: [] }
```

## UI Design

- **Login required** — shows prompt if not authenticated
- **Empty state** — graceful handling when no content
- **Error state** — retry button on failure
- **Luxury styling**:
  - Gradient backgrounds on cards
  - Gold accent icons
  - Animated entrance (`FadeInDown`)
  - Section headers with icons
