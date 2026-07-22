# Architecture

## Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 16.2.10 (App Router) | Route protection in `src/proxy.ts`, not `middleware.ts` |
| UI | React 19.2.4 | Server Components by default; `"use client"` where interactive |
| Language | TypeScript 5 | `@/*` path alias → `src/*` |
| ORM | Prisma 7.8 | Driver adapter mandatory |
| DB (dev) | SQLite via `@prisma/adapter-better-sqlite3` | `dev.db` at repo root |
| DB (prod) | Turso / libSQL via `@prisma/adapter-libsql` | Selected at runtime by env |
| Auth | `bcryptjs` + httpOnly cookie | 8-hour session |
| Styling | Vanilla CSS | 3 stylesheets, CSS custom properties |
| Fonts | `next/font` Google Fonts | Playfair Display (headings), Lora (body) |

`next.config.ts` is empty — no custom webpack, images, or headers config.

## Route map

```
/                              → client redirect to /admin/login
/{username}/{slug}             → guest invitation (owner-scoped)   [src/app/[username]/[slug]/page.tsx]
/pingkan-daffa/{slug}          → legacy single-tenant invitation    [src/app/pingkan-daffa/[slug]/page.tsx]
/admin/login                   → login form (public)
/admin                         → dashboard stats
/admin/guests                  → guest CRUD, import/export, WhatsApp links
/admin/wishes                  → guestbook viewer
/admin/settings                → wedding config editor
/admin/users                   → owner management (super admin only)
/api/*                         → see 03-api-reference.md
```

`/admin/**` (except `/admin/login`) is gated in [src/proxy.ts](../src/proxy.ts), which only checks
that the `admin_session` cookie **exists**. Real authorisation happens per-request inside each API
route via `getCurrentUser()`.

## Multi-tenancy

```
User (role: super_admin | owner)
 ├── guests: Guest[]        (Guest.userId → User.id, nullable)
 └── weddingConfig: WeddingConfig?  (unique userId)
```

- An **owner** sees only rows where `userId === session.userId`.
- A **super admin** sees everything and may pass `?userId=` to scope queries, or `userId` in a
  POST/PUT body to act on behalf of an owner.
- Public invitation pages resolve the owner from the URL segment `{username}`, then look up the
  guest with `findFirst({ where: { slug, userId: owner.id } })`.

Guest slugs are globally unique (`@unique` in the schema), so slug collisions across owners are
resolved with a numeric suffix at creation time (`nama`, `nama-1`, `nama-2`, …) — see
`slugify()` in [src/lib/utils.ts](../src/lib/utils.ts) and the loop in
[src/app/api/guests/route.ts](../src/app/api/guests/route.ts).

## Request flow — guest invitation

1. `page.tsx` (Server Component, `export const dynamic = "force-dynamic"`).
2. Resolve owner by `username`; 404 if unknown.
3. Resolve guest by `slug` scoped to owner; 404 if unknown.
4. First view stamps `openedAt` (open tracking — one write, only when null).
5. Load that owner's `WeddingConfig`.
6. Render `<OpeningCoverClient>` with all sections pre-rendered as `ReactNode` props. The client
   component holds only the "has the envelope been opened" state, then reveals sections wrapped in
   `<ScrollReveal>` and starts the music player.
7. RSVP submission is a client `fetch` to `/api/rsvp` — no server action, no revalidation.

## Auth model

[src/lib/auth.ts](../src/lib/auth.ts):

- `loginUser(username, password)` — looks up `User`, `bcrypt.compare`, then writes cookie
  `admin_session` = `JSON.stringify({ userId, username, role })`, `httpOnly`, `sameSite=lax`,
  `secure` in production, `maxAge` 8 h.
- `getCurrentUser()` — reads and `JSON.parse`s that cookie. **No signature/HMAC verification** —
  the cookie contents are trusted as-is (see [08-gotchas.md](08-gotchas.md)).
- `checkAuth()` — boolean convenience wrapper.

Client pages get the session by calling `GET /api/auth`, which returns the parsed `SessionUser`.
