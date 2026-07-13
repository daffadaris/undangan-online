---
name: invitation-components
description: Wedding invitation component architecture — section structure, styling conventions, client vs server component patterns, and the opening cover interaction flow.
---

# Wedding Invitation Components

## Component Architecture

The guest invitation page uses a **server → client** split:

```
src/app/[slug]/page.tsx          (Server Component)
  ├── Fetches guest + config from Prisma
  ├── Tracks openedAt timestamp
  └── Renders OpeningCoverClient with pre-rendered sections as props

src/app/[slug]/OpeningCoverClient.tsx  (Client Component)
  ├── Manages isOpened state
  ├── Renders OpeningCover overlay
  ├── Conditionally renders all sections after open
  └── Triggers MusicPlayer on open
```

### Why This Pattern?
- Server component does DB queries (no API round-trip)
- Client wrapper manages interactive state (cover animation, music)
- Section components are passed as `React.ReactNode` props to avoid making them all client components

## Section Order (when opened)

1. **HeroSection** — Couple nicknames, formatted date, floral divider
2. **Ayat Section** — QS. Ar-Rum: 21 (inline in OpeningCoverClient, not a separate component)
3. **CoupleSection** — Groom/bride cards with photo frames and parent info
4. **CountdownTimer** — Live countdown (client component with `"use client"`)
5. **EventDetails** — Akad + Resepsi cards with maps links
6. **LoveStory** — Alternating timeline from JSON config
7. **GiftInfo** — Bank account cards with copy-to-clipboard (client component)
8. **RsvpForm** — RSVP + wishes submission + guestbook display (client component)
9. **Footer** — Closing message
10. **MusicPlayer** — Floating bottom-right button (client component)

## Client Components (`"use client"`)

These components require browser APIs and must be client components:
- `CountdownTimer` — uses `setInterval`
- `GiftInfo` — uses `navigator.clipboard`
- `RsvpForm` — uses `fetch` for API calls + manages form state
- `MusicPlayer` — uses `HTMLAudioElement`
- `OpeningCover` — animation state (though could be server, parent is client)

## Styling Conventions

### CSS Classes (from `invitation.css`)

| Element | Key Classes |
|---|---|
| Page wrapper | `.invitation-body` |
| Sections | `.invitation-section` (even children get darker bg) |
| Section titles | `.section-title`, `.section-subtitle` |
| Cover | `.cover-container`, `.cover-container.opened`, `.cover-recipient-card` |
| Hero | `.hero-sec`, `.hero-names`, `.hero-date` |
| Couple | `.couple-card`, `.couple-photo-frame`, `.couple-name` |
| Countdown | `.countdown-grid`, `.countdown-box`, `.countdown-val`, `.countdown-lbl` |
| Events | `.event-card`, `.event-title`, `.event-detail-item` |
| Timeline | `.timeline`, `.timeline-item`, `.left-item`, `.right-item`, `.timeline-content` |
| Forms | `.form-container`, `.form-group`, `.form-input`, `.form-textarea` |
| Wishes | `.wishes-board`, `.wish-item`, `.wish-name`, `.wish-status` |
| Bank cards | `.bank-card`, `.bank-number`, `.bank-holder` |
| Music | `.music-player-btn`, `.music-playing` |

### Floral Decorations (`FloralDecor.tsx`)

SVG-based decorative components — no external image files needed:
- `FloralCornerTopLeft` — opacity 0.15, sage/olive/gold leaf shapes
- `FloralCornerBottomRight` — rotated 180° version
- `FloralDivider` — dashed lines with diamond center ornament
- `FloralHeaderDecor` — symmetrical leaf arrangement above section titles

### Animation Classes (from `globals.css`)
- `.animate-fade-in` — 1s opacity fade
- `.animate-fade-in-up` — 1.2s slide up + fade
- `.animate-scale-in` — 1s scale from 0.95
- `.animate-float` — 6s infinite floating effect

## Config Data Flow

Components receive `config: any` prop (the WeddingConfig row). JSON fields need parsing:
```typescript
// In component
let items = [];
try {
  items = JSON.parse(config?.loveStory || "[]");
} catch (e) { items = []; }
```

Fallback data is provided if parsing fails or the array is empty.
