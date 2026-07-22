# Undangan Online — Knowledge Base

Digital wedding invitation platform. Multi-tenant: a **super admin** manages **owners** (couples),
each owner manages their own guest list and invitation content. Guests open a personalised
invitation at `/{username}/{guest-slug}` and confirm attendance (RSVP) + leave a wish.

UI language for guest-facing pages is **Bahasa Indonesia**.

## Index

| Doc | Contents |
|---|---|
| [01-architecture.md](01-architecture.md) | Stack, routing map, request/data flow, auth model |
| [02-data-model.md](02-data-model.md) | Prisma schema, field semantics, local vs Turso database |
| [03-api-reference.md](03-api-reference.md) | Every route under `/api`, auth requirements, payloads |
| [04-admin-panel.md](04-admin-panel.md) | Admin pages, roles, guest CRUD, CSV import/export |
| [05-invitation-page.md](05-invitation-page.md) | Guest page render pipeline, components, themes |
| [06-styling.md](06-styling.md) | Design tokens, CSS file split, conventions |
| [07-operations.md](07-operations.md) | Env vars, npm scripts, seeding, backup/restore, deploy |
| [08-gotchas.md](08-gotchas.md) | Known bugs, footguns, and non-obvious behaviour |

## 60-second orientation

- **Framework**: Next.js 16 App Router + React 19, TypeScript. Route protection lives in
  [src/proxy.ts](../src/proxy.ts) — `middleware.ts` is deprecated in this version.
- **Database**: SQLite through Prisma 7 with a **driver adapter** (required in Prisma 7).
  Local dev → `better-sqlite3` on [dev.db](../dev.db); production → Turso (libSQL) when
  `TURSO_DATABASE_URL` is set. See [src/lib/prisma.ts](../src/lib/prisma.ts).
- **Styling**: hand-written vanilla CSS only. No Tailwind, no CSS modules.
- **Auth**: cookie `admin_session` holding a JSON `SessionUser`. Login form at `/admin/login`.
- **Entry point**: `/` immediately redirects to `/admin/login`; there is no public landing page.

## Rules that override defaults

These come from [AGENTS.md](../AGENTS.md) and are non-negotiable in this repo:

1. Use `src/proxy.ts`, never `middleware.ts`.
2. Route params are promises — `const { slug } = await params;`.
3. `cookies()` from `next/headers` is async — `await cookies()`.
4. Never `new PrismaClient()` without `{ adapter }`.
5. Vanilla CSS only.
6. Guest-facing copy in Bahasa Indonesia.
7. Sage Green `#A8BBA0` + Cream `#FFF8DC` design theme.
