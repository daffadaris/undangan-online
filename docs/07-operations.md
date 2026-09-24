# Operations

> All project commands must go through the RTK proxy per the user-level `CLAUDE.md`
> (`C:\Users\Daffa\RTK.md`). The npm invocations below are the underlying commands.

## Environment variables (`.env`)

| Var | Purpose |
|---|---|
| `DATABASE_URL` | Local SQLite path for the Prisma CLI and the better-sqlite3 adapter (`file:./dev.db`) |
| `TURSO_DATABASE_URL` | If **set**, the app talks to Turso instead of local SQLite — at runtime, in dev too |
| `TURSO_AUTH_TOKEN` | Turso credential |
| `ADMIN_PASSWORD` | Legacy single-password auth; no longer read by `src/lib/auth.ts` |
| `SUPER_ADMIN_USERNAME` / `SUPER_ADMIN_PASSWORD` | Consumed by `prisma/seed.ts` |
| `OWNER_PASSWORD` | Optional; seed password for the first owner (`daffa-regina`) |

`prisma.config.ts` does `import "dotenv/config"` — Prisma 7 does not read `.env` on its own.

## npm scripts

| Script | Command | Notes |
|---|---|---|
| `dev` | `next dev` | Hits Turso if `TURSO_DATABASE_URL` is set |
| `build` | `prisma generate && next build` | |
| `start` | `next start` | |
| `lint` | `eslint` | flat config in `eslint.config.mjs` |
| `db:push-turso` | `node scripts/sync-schema-turso.js` | Copies the **local `dev.db` schema** to Turso |
| `postinstall` | `prisma generate` | |

There is no `test` script and no test suite — verify changes by running the app.

## Maintenance scripts

Run with `npx tsx <file>` (TypeScript) or `node <file>` (JS); all load `.env` first.

| Script | Purpose |
|---|---|
| [prisma/seed.ts](../prisma/seed.ts) | Creates the super admin from env, plus the first owner `daffa-regina`. Idempotent |
| [scripts/backup-turso.js](../scripts/backup-turso.js) | Dumps `Guest` + `WeddingConfig` from Turso to `turso-backup.json` |
| [scripts/restore-backup.ts](../scripts/restore-backup.ts) | Restores `turso-backup.json` into the `daffa-regina` owner, skipping existing slugs |
| [scripts/sync-schema-turso.js](../scripts/sync-schema-turso.js) | Reads the local SQLite schema and applies it to Turso (falls back from `dev.db` to `prisma/dev.db`) |
| [scripts/rename-admin.ts](../scripts/rename-admin.ts) | One-shot rename `admin` → `admindaffa` |
| [scripts/update-password.ts](../scripts/update-password.ts) | `npx tsx scripts/update-password.ts <username> <new-password>` |

`turso-backup.json` at the repo root is a committed snapshot — treat it as data, not config, and
remember it contains real guest names and phone numbers.

## Database workflow

1. Edit [prisma/schema.prisma](../prisma/schema.prisma).
2. Apply locally: `npx prisma db push` (this project pushes rather than migrates; the single
   migration folder is stale).
3. `npx prisma generate`.
4. Push the same schema to Turso: `npm run db:push-turso`.
5. Back up before anything destructive: `node scripts/backup-turso.js`.

To develop against local SQLite instead of production, comment out `TURSO_DATABASE_URL` in `.env`.

## Media handling

`POST /api/upload` returns a **base64 data URL** (≤ 5 MB) that is stored directly in
`WeddingConfig`. Nothing is written to `public/uploads` any more — that directory and
`/api/upload/[filename]` only serve pre-existing files, and neither works on a serverless host.

Keeping images small and off the page:

- **Compressed on upload** — the settings page runs every photo through
  [compressImage](../src/lib/compressImage.ts) in the browser first: long edge ≤ 1600 px (hero,
  gallery) / 1200 px (portraits), WebP q0.8 (JPEG where the browser can't encode WebP), and only if
  smaller. **QRIS is uploaded untouched** — lossy re-encoding can make a QR unscannable.
- **Served, not inlined** — the invitation page passes the config through `withMediaUrls()`
  ([src/lib/media.ts](../src/lib/media.ts)), which swaps each data URL for
  `/api/media/{userId}/{field|gallery-N}?v={sha1}`. That route decodes and serves the bytes with
  `Cache-Control: …, max-age=31536000, immutable` (the hash changes when the image does). Inlining
  made a 5-photo invitation ~2.7 MB of HTML (images sent twice, never cached); now it is ~60 KB and
  gallery photos really lazy-load. With Mode Privat on, the route only serves browsers that claimed
  one of the owner's guest links, and uses `private` caching. SVGs are served with a sandboxing CSP.
- **Existing images** — `node scripts/compress-images.js` (dry run) / `--apply` recompresses what is
  already stored the same way (sharp), skipping QRIS and anything that wouldn't shrink. It writes the
  originals to `image-backup-<timestamp>.json` (gitignored — real photos) *before* updating.

## Deploy notes

- Serverless-friendly: no filesystem writes, `force-dynamic` on data pages, Turso over HTTP.
- Required env in the host: `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN`, and the seed vars if you
  intend to run the seed there.
- `next.config.ts` is empty — nothing host-specific is configured in code.
