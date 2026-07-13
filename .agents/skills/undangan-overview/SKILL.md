---
name: undangan-online-overview
description: Project overview for the Undangan Online (wedding invitation) application — architecture, tech stack, file conventions, database schema, and key design decisions.
---

# Undangan Online — Project Overview

## Tech Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 16 (App Router) | Uses `proxy.ts` NOT `middleware.ts` (deprecated) |
| Language | TypeScript | Strict mode |
| Database | SQLite via Prisma 7 | Requires `@prisma/adapter-better-sqlite3` driver adapter |
| Styling | Vanilla CSS | Three files: `globals.css`, `invitation.css`, `admin.css` |
| Auth | Cookie-based session | Simple password auth via `.env` `ADMIN_PASSWORD` |
| Fonts | Google Fonts (next/font) | Playfair Display (headings) + Lora (body) |

## Directory Structure

```
src/
├── app/
│   ├── layout.tsx              # Root layout, fonts, metadata, viewport
│   ├── page.tsx                # Landing/welcome page
│   ├── proxy.ts                # Route protection (replaces middleware.ts)
│   ├── [slug]/                 # Dynamic guest invitation page
│   │   ├── page.tsx            # Server component: fetches guest + config
│   │   └── OpeningCoverClient.tsx  # Client wrapper: manages open state + music
│   ├── admin/
│   │   ├── layout.tsx          # Client: sidebar nav + logout (skips on /admin/login)
│   │   ├── page.tsx            # Server: dashboard stats from Prisma
│   │   ├── login/page.tsx      # Client: password login form
│   │   ├── guests/page.tsx     # Client: CRUD table, search, filters, CSV export
│   │   ├── wishes/page.tsx     # Client: guestbook viewer with delete
│   │   └── settings/page.tsx   # Client: wedding config editor
│   └── api/
│       ├── auth/route.ts       # POST login, DELETE logout
│       ├── guests/route.ts     # GET list, POST create
│       ├── guests/[id]/route.ts # PUT update, DELETE remove
│       ├── rsvp/route.ts       # POST submit RSVP
│       ├── settings/route.ts   # GET config, PUT update config
│       └── wishes/route.ts     # GET wishes list
├── components/invitation/      # Guest-facing UI components
├── lib/
│   ├── prisma.ts               # Prisma client singleton with adapter
│   ├── auth.ts                 # Cookie auth helpers
│   └── utils.ts                # slugify(), buildWhatsappMessage()
└── styles/
    ├── globals.css              # Design tokens, animations, utilities
    ├── invitation.css           # Guest invitation page styles
    └── admin.css                # Admin dashboard styles
```

## Database Models

### Guest
- `id` (UUID), `name`, `slug` (unique), `phone?`, `group?`
- `rsvpStatus` (pending | confirmed | declined), `numberOfGuests`
- `wishes?`, `wishSentAt?`, `openedAt?`
- `createdAt`, `updatedAt`

### WeddingConfig (singleton, id="config")
- Couple info: `groomName`, `groomNickname`, `groomParents`, `brideName`, `brideNickname`, `brideParents`
- Akad: `akadDate`, `akadTime`, `akadVenue`, `akadAddress`, `akadMapsUrl`
- Resepsi: `resepsiDate`, `resepsiTime`, `resepsiVenue`, `resepsiAddress`, `resepsiMapsUrl`
- Content: `loveStory` (JSON string), `giftInfo` (JSON string), `galleryImages` (JSON string)
- Media: `heroImage?`, `groomImage?`, `brideImage?`, `coupleImage?`, `musicUrl?`

## Key Design Decisions

1. **Slug-based routing**: Each guest gets a unique URL slug auto-generated from their name. Collisions are resolved by appending a counter suffix.
2. **Single WeddingConfig row**: All wedding details live in one database row (id="config"), editable from admin settings.
3. **JSON-in-string storage**: Love story timeline and gift bank accounts are stored as JSON strings in SQLite text columns, parsed client-side.
4. **Client-side CSV export**: No server API for CSV — the guest list is exported directly from client state for instant downloads.
5. **Cookie auth**: Admin uses a simple `admin_session` cookie with a static value, verified in `proxy.ts`.

## Design Theme

- **Palette**: Sage Green (`#A8BBA0`) + Cream (`#FFF8DC`)
- **Accents**: Olive (`#4E5C47`), Gold (`#C9A96E`)
- **Typography**: Playfair Display (serif headings), Lora (body text)
- **Language**: Bahasa Indonesia
