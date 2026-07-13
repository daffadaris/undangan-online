---
name: admin-dashboard
description: Admin dashboard patterns for the Undangan Online app — authentication flow, CRUD patterns, API route conventions, and admin UI component patterns.
---

# Admin Dashboard Patterns

## Authentication Flow

### How Auth Works
1. **Login**: POST `/api/auth` with `{ password }` → compares against `process.env.ADMIN_PASSWORD` → sets `admin_session` HTTP-only cookie.
2. **Protection**: `src/proxy.ts` checks the cookie on all `/admin/*` routes (except `/admin/login`). Redirects to `/admin/login` if missing.
3. **Logout**: DELETE `/api/auth` → clears the cookie → redirect to `/admin/login`.

### Cookie Details
- Name: `admin_session`
- Value: `"authenticated_wedding_admin"` (static string)
- HTTP-only, 7-day expiry, secure in production

### Auth Helpers (`src/lib/auth.ts`)
```typescript
loginAdmin(password: string): Promise<boolean>  // Sets cookie if password matches
logoutAdmin(): Promise<void>                     // Deletes cookie
checkAuth(): Promise<boolean>                    // Reads cookie value
```

> **Note**: `checkAuth()` uses `cookies()` from `next/headers` which is async in Next.js 15+.

## API Route Patterns

All API routes follow this pattern:
- Import `prisma` from `@/lib/prisma`
- Dynamic routes use `export const dynamic = "force-dynamic"` for GET endpoints
- Error handling wraps body in try/catch, returns `NextResponse.json()`
- Route params are accessed via `{ params }: { params: Promise<{ id: string }> }` (async in Next.js 15+)

### Guests API
| Endpoint | Method | Purpose |
|---|---|---|
| `/api/guests` | GET | List all guests, ordered by `createdAt` desc |
| `/api/guests` | POST | Create guest with auto-generated slug (collision-safe) |
| `/api/guests/[id]` | PUT | Update guest fields |
| `/api/guests/[id]` | DELETE | Delete guest by ID |

### Other APIs
| Endpoint | Method | Purpose |
|---|---|---|
| `/api/auth` | POST/DELETE | Login / Logout |
| `/api/rsvp` | POST | Public: submit RSVP + wishes |
| `/api/wishes` | GET | Public: list wishes (last 50) |
| `/api/settings` | GET/PUT | Read / update WeddingConfig |

## Admin UI Conventions

### Layout
- Admin layout (`src/app/admin/layout.tsx`) is a **client component** (`"use client"`)
- Contains sidebar navigation and logout button
- Skips sidebar rendering when `pathname === "/admin/login"`

### Page Patterns
- **Dashboard** (`/admin`): Server component — queries Prisma directly for stats
- **Guests** (`/admin/guests`): Client component — fetches via `/api/guests`, manages modals/search/filters in state
- **Wishes** (`/admin/wishes`): Client component — fetches via `/api/wishes`, supports delete
- **Settings** (`/admin/settings`): Client component — fetches via `/api/settings`, nested dynamic lists for timeline items and bank accounts

### CSS Classes (from `admin.css`)
- Layout: `.admin-body`, `.admin-sidebar`, `.admin-main`
- Cards: `.admin-card`, `.stat-card`, `.stats-grid`
- Tables: `.data-table` (th/td auto-styled)
- Badges: `.badge-pending`, `.badge-confirmed`, `.badge-declined`
- Modals: `.modal-overlay`, `.modal-content`, `.modal-close`
- Forms: `.admin-input-group`, `.admin-input-label`, `.admin-input`
- Buttons: `.admin-btn`, `.admin-btn-outline`, `.admin-btn-danger`

### CSV Export
Implemented **client-side** (no API needed):
- Builds CSV string from current guest state
- Uses BOM prefix (`\uFEFF`) for Excel compatibility
- Creates temporary `<a>` element with data URI for download
- Values are wrapped with `String(val)` to handle mixed types
