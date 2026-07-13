---
name: deployment-config
description: Deployment and configuration guide — environment variables, build commands, Node.js requirements, and common troubleshooting for the Undangan Online project.
---

# Deployment & Configuration

## Environment Variables (`.env`)

```env
DATABASE_URL="file:./dev.db"    # SQLite database path
ADMIN_PASSWORD="admin123"       # Admin login password (change in production!)
```

## Node.js Requirements

- **Minimum**: Node.js >= 20.9.0 (required by Next.js 16)
- **Tested on**: Node.js v22.21.1
- Use `nvm use 22` if you have nvm installed and the current version is too old

## Build & Run Commands

```bash
# Development
npm run dev                     # Start dev server (Turbopack)

# Production
npm run build                   # Create optimized production build
npm start                       # Serve production build

# Database
npx prisma generate             # Regenerate Prisma client
npx prisma migrate dev --name <name>  # Create migration
npx tsx prisma/seed.ts          # Seed initial data
npx prisma studio               # Database browser UI
```

## First-Time Setup

```bash
# 1. Install dependencies
npm install

# 2. Generate Prisma client
npx prisma generate

# 3. Run migration (creates dev.db)
npx prisma migrate dev --name init

# 4. Seed default data
npx tsx prisma/seed.ts

# 5. Start dev server
npm run dev
```

## Turbopack Root Warning

If you see:
```
⚠ Warning: Next.js inferred your workspace root, but it may not be correct.
```

Add to `next.config.ts`:
```typescript
const nextConfig = {
  turbopack: {
    root: './',
  },
};
```

## Next.js 16 Breaking Changes to Watch

1. **`proxy.ts` replaces `middleware.ts`**: The file must export `default async function proxy()` and live at `src/proxy.ts`.
2. **Route params are Promises**: Access via `const { slug } = await params;` not `params.slug`.
3. **`cookies()` is async**: Always `await cookies()` in auth helpers.
4. **Viewport in metadata is deprecated**: Use separate `export const viewport = { ... }` in layout.
5. **Prisma 7 adapter required**: See the `prisma7-sqlite` skill for details.

## Production Deployment Notes

### For Vercel
- SQLite won't persist on Vercel (ephemeral filesystem). Consider:
  - Switching to Turso (libSQL) or PostgreSQL
  - Using Vercel KV or an external database

### For VPS / Self-hosted
- SQLite works great for self-hosted deployments
- Ensure `dev.db` is in `.gitignore` and backed up separately
- Run `npx prisma migrate deploy` (not `dev`) in production
- Set `NODE_ENV=production` and change `ADMIN_PASSWORD`

### Image Storage
- Currently uses local `public/images/` directory
- For cloud hosting, consider Cloudinary or Uploadthing for image uploads
