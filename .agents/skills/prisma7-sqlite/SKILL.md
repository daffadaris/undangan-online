---
name: prisma7-sqlite
description: Prisma 7 with SQLite setup — driver adapter pattern, migration commands, seeding, and the PrismaClient singleton pattern required by Prisma 7.
---

# Prisma 7 + SQLite Setup

## Critical: Prisma 7 Breaking Changes

Prisma 7 removed the Rust-based query engine. You **MUST** use a driver adapter. `new PrismaClient()` without arguments will throw:

```
PrismaClientInitializationError: PrismaClient needs to be constructed with a non-empty, valid PrismaClientOptions
```

## Required Dependencies

```bash
npm install @prisma/client @prisma/adapter-better-sqlite3 better-sqlite3
npm install -D prisma tsx
```

## Schema Configuration

In `prisma/schema.prisma`, do **NOT** include `url` in the datasource block — Prisma 7 moved connection config to `prisma.config.ts`:

```prisma
datasource db {
  provider = "sqlite"
  // NO url here — it goes in prisma.config.ts
}
```

The connection URL lives in `prisma.config.ts`:
```typescript
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations" },
  datasource: { url: process.env["DATABASE_URL"] },
});
```

## PrismaClient Initialization (Singleton)

Every file that uses PrismaClient must pass the adapter:

```typescript
// src/lib/prisma.ts
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db',
});

export const prisma =
  globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

> **Important**: The `PrismaBetterSqlite3` constructor takes `{ url: string }`, NOT a `better-sqlite3` Database instance.

## Seed Scripts

Seed scripts also need the adapter. Use `npx tsx prisma/seed.ts` to run them:

```typescript
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL || 'file:./dev.db',
});
const prisma = new PrismaClient({ adapter });
```

## Common Commands

```bash
npx prisma generate          # Generate client after schema changes
npx prisma migrate dev --name <name>  # Create and apply migration
npx prisma studio            # Open database browser UI
npx tsx prisma/seed.ts       # Run seed script
```

## Gotchas

1. Always run `npx prisma generate` after `prisma migrate dev` — the client types need regenerating.
2. The SQLite `dev.db` file is created in the project root (where `prisma.config.ts` resolves `file:./dev.db`).
3. JSON data (arrays, objects) must be stored as `String` columns and parsed/stringified manually — SQLite has no native JSON column type in Prisma.
