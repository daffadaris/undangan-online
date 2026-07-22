---
name: undangan-online-overview
description: Project overview for the Undangan Online (wedding invitation) application — architecture, tech stack, file conventions, database schema, and key design decisions.
---

# Undangan Online — Project Overview

The full knowledge base lives in [docs/](../../../docs/README.md). Read the relevant page there
before changing code; this file is only the map.

| Question | Doc |
|---|---|
| Stack, routes, auth model, multi-tenancy | `docs/01-architecture.md` |
| Schema, field semantics, local vs Turso DB | `docs/02-data-model.md` |
| Every `/api` endpoint | `docs/03-api-reference.md` |
| Admin pages, roles, CSV import/export | `docs/04-admin-panel.md` |
| Invitation render pipeline, components, themes | `docs/05-invitation-page.md` |
| Design tokens and CSS layout | `docs/06-styling.md` |
| Env vars, scripts, seeding, backup, deploy | `docs/07-operations.md` |
| Known bugs and footguns | `docs/08-gotchas.md` |

## Shape of the app

Multi-tenant digital wedding invitations. A **super admin** manages **owners** (couples); each
owner has one `WeddingConfig` and a guest list. Guests open `/{username}/{guest-slug}`, RSVP, and
leave a wish. `/` redirects to `/admin/login`; there is no public landing page.

## Stack

| Layer | Technology | Notes |
|---|---|---|
| Framework | Next.js 16 (App Router) | `src/proxy.ts`, NOT `middleware.ts` |
| UI | React 19 | Server Components fetch; client components hold interaction state |
| Database | SQLite via Prisma 7 | Driver adapter required: better-sqlite3 locally, libSQL/Turso in prod |
| Auth | bcrypt + `admin_session` cookie | 8-hour JSON session, unsigned |
| Styling | Vanilla CSS | `globals.css`, `invitation.css`, `admin.css` |
| Fonts | next/font | Playfair Display (headings) + Lora (body) |

## Directory structure

```
src/
├── app/
│   ├── layout.tsx                    # Fonts, metadata, viewport
│   ├── page.tsx                      # Redirects to /admin/login
│   ├── proxy.ts                      # Route protection (replaces middleware.ts)
│   ├── [username]/[slug]/            # Multi-tenant guest invitation
│   ├── pingkan-daffa/[slug]/         # Legacy single-tenant invitation
│   ├── admin/                        # login, dashboard, guests, wishes, settings, users
│   └── api/                          # auth, guests(+[id], import), rsvp, wishes, settings, users, upload
├── components/invitation/            # Guest-facing UI + FloralDecor SVG kit
├── lib/                              # prisma.ts (singleton+adapter), auth.ts, utils.ts
└── styles/                           # invitation.css, admin.css
```

## Non-negotiable conventions

1. `src/proxy.ts` for route protection — `middleware.ts` is deprecated.
2. `const { slug } = await params;` — route params are promises.
3. `await cookies()` — async in Next 16.
4. Import `prisma` from `@/lib/prisma`; never `new PrismaClient()` without `{ adapter }`.
5. Vanilla CSS only — no Tailwind, no CSS modules.
6. Guest-facing copy in Bahasa Indonesia.
7. Sage Green `#A8BBA0` + Cream `#FFF8DC`; tokens in `src/app/globals.css`.
8. JSON arrays (`loveStory`, `giftInfo`, `galleryImages`) are TEXT columns — parse with a fallback.

## Design theme

- **Palette**: Sage Green `#A8BBA0`, Cream `#FFF8DC`, Olive `#4E5C47`, Gold `#C9A96E`
- **Themes available**: sage (default), blue, pink, gold, purple, emerald, burgundy, dark, green-pink
- **Typography**: Playfair Display (serif headings), Lora (body)
