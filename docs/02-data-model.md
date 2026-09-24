# Data Model

Source of truth: [prisma/schema.prisma](../prisma/schema.prisma). Provider `sqlite`, no
`url` in the datasource block — the connection is supplied by the driver adapter at runtime
(`prisma.config.ts` supplies `DATABASE_URL` for the CLI).

## User

| Field | Type | Notes |
|---|---|---|
| `id` | String @id @default(uuid()) | |
| `username` | String @unique | Also the first URL segment of invitations: `/{username}/{slug}` |
| `passwordHash` | String | bcrypt, cost 10 |
| `role` | String @default("owner") | `"super_admin"` \| `"owner"` |
| `createdAt` | DateTime | |
| `guests` | Guest[] | |
| `weddingConfig` | WeddingConfig? | 1:1 |

## Guest

| Field | Type | Notes |
|---|---|---|
| `id` | String @id uuid | |
| `name` | String | Displayed on the cover and RSVP card |
| `slug` | String @unique | **Globally** unique, not per-owner. New guests get `{slugify(name)}-{4 random chars}` so links can't be guessed; older rows keep name-only slugs |
| `phone` | String? | Free-form; normalised to `62…` when building WhatsApp links |
| `group` | String? | e.g. "Keluarga", "Teman", "Kantor" |
| `rsvpStatus` | String @default("pending") | `pending` \| `confirmed` \| `declined` |
| `numberOfGuests` | Int @default(1) | Pax. Forced to `0` whenever status ≠ `confirmed` |
| `wishes` | String? | Guestbook message |
| `wishSentAt` | DateTime? | Set on every RSVP submit that includes a wish |
| `openedAt` | DateTime? | Set once, on first page view |
| `deviceIds` | String @default("[]") | JSON array of `inv_dev` browser ids that claimed this link (Mode Privat). Parse with `parseDeviceIds()` from [src/lib/privacy.ts](../src/lib/privacy.ts) |
| `maxDevices` | Int @default(2) | Mode Privat slot limit for this link, clamped to 1–10 by `PUT /api/guests/[id]` |
| `createdAt` / `updatedAt` | DateTime | `updatedAt` drives the dashboard "recent RSVP" list |
| `userId` | String? | Owner FK, indexed. Null = legacy row |

### `numberOfGuests` semantics (pax)

- Default is **1**, from the schema — nothing in the codebase ever defaults it to 2 or above.
- The guest picks 1–5 from the "Jumlah Orang" picker in
  [RsvpForm.tsx](../src/components/invitation/RsvpForm.tsx); the picker always shows an explicitly
  highlighted value, so whatever appears in the admin "Pax" column is exactly what the guest
  (or an admin) selected.
- Both [/api/rsvp](../src/app/api/rsvp/route.ts) and
  [/api/guests/[id]](../src/app/api/guests/[id]/route.ts) write
  `numberOfGuests: status === "confirmed" ? clamp(pax, 1, 5) : 0` — declining or reverting to
  pending zeroes the pax, and a confirmed guest can never be stored below 1.
- Dashboard "Total Pax Kehadiran" is `SUM(numberOfGuests) WHERE rsvpStatus = 'confirmed'`, so it is
  ≥ "Konfirmasi Hadir" whenever any guest brings a companion.

## WeddingConfig

One row per owner (`userId @unique`); upserted by `PUT /api/settings`. Groups of fields:

- **Couple**: `groomName`, `groomNickname`, `groomParents`, `brideName`, `brideNickname`, `brideParents`
- **Akad**: `akadDate`, `akadTime`, `akadVenue`, `akadAddress`, `akadMapsUrl`, `akadTitle`
- **Resepsi**: `resepsiDate`, `resepsiTime`, `resepsiVenue`, `resepsiAddress`, `resepsiMapsUrl`, `resepsiTitle`
- **Content (JSON-in-String)**: `loveStory`, `giftInfo`, `galleryImages` — all `@default("[]")`
- **Media**: `heroImage`, `groomImage`, `brideImage`, `coupleImage`, `musicUrl` — stored as
  **base64 data URLs**, not file paths (see [07-operations.md](07-operations.md))
- **Image framing**: `groomImagePosition`, `brideImagePosition`, `heroImagePosition` — CSS
  `object-position` values, default `"center"`
- **Presentation**: `theme` (default `"sage"`), `whatsappTemplate`
- **Section toggles**: `showLoveStory`, `showGiftInfo`, `showRsvp`, `showGallery`, `showAkad`,
  `showResepsi` — all `Boolean @default(true)`; the invitation checks `!== false`
- **Privacy**: `privateMode` — `Boolean @default(false)`. When on, each guest link only opens on
  `Guest.maxDevices` browsers (see [05-invitation-page.md](05-invitation-page.md#mode-privat))

All date/time fields are **strings**, not `DateTime` — they are rendered verbatim, except
`akadDate`, which `CountdownTimer` parses as the countdown target.

### JSON-in-String rule

`loveStory`, `giftInfo`, `galleryImages` are TEXT columns holding JSON arrays. Always parse
defensively:

```ts
let items = [];
try { items = JSON.parse(config?.loveStory || "[]"); } catch { items = []; }
```

## Database selection

[src/lib/prisma.ts](../src/lib/prisma.ts) picks the adapter at first use:

```
TURSO_DATABASE_URL set  → PrismaLibSql({ url, authToken })      (production / Turso)
otherwise               → PrismaBetterSqlite3({ url: DATABASE_URL without "file:" })
```

The client is memoised on `globalThis` outside production to survive HMR.

⚠️ Because `.env` in this repo defines `TURSO_DATABASE_URL`, `npm run dev` talks to the **live
Turso database**, not `dev.db`. Unset/comment that variable to work against local SQLite.

## Migrations

Only one Prisma migration exists —
[prisma/migrations/20260713084653_init](../prisma/migrations/20260713084653_init/migration.sql) —
and it predates the `User` model and the multi-tenant columns. Later schema changes were pushed to
Turso with `npm run db:push-turso`, which copies the **local `dev.db` schema** to Turso rather than
running migrations. Treat `schema.prisma` as authoritative and the migration folder as stale.

Additive column changes on a database that already holds data go through small `ALTER TABLE … ADD
COLUMN` scripts that touch both local `dev.db` and Turso and skip columns that already exist —
e.g. [scripts/add-open-tracking-columns.js](../scripts/add-open-tracking-columns.js) and
[scripts/add-private-mode-columns.js](../scripts/add-private-mode-columns.js).
