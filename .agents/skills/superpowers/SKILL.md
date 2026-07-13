---
name: superpowers
description: Advanced patterns, shortcuts, and power-user techniques for rapid development on the Undangan Online project — bulk operations, debugging tips, testing strategies, and feature extension patterns.
---

# Superpowers — Advanced Development Patterns

## Quick Guest Operations

### Bulk Import Guests via Script
Create a `prisma/bulk-import.ts` file:
```typescript
import { PrismaClient } from '@prisma/client';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { slugify } from '../src/lib/utils';

const adapter = new PrismaBetterSqlite3({ url: 'file:./dev.db' });
const prisma = new PrismaClient({ adapter });

const guests = [
  { name: "Ahmad Yusuf", phone: "08123456789", group: "Keluarga" },
  { name: "Siti Nurhaliza", phone: "08234567890", group: "Teman" },
  // ... add more
];

async function main() {
  for (const g of guests) {
    let slug = slugify(g.name);
    let counter = 1;
    while (await prisma.guest.findUnique({ where: { slug } })) {
      slug = `${slugify(g.name)}-${counter++}`;
    }
    await prisma.guest.create({ data: { ...g, slug } });
    console.log(`Created: ${g.name} -> /${slug}`);
  }
}
main().finally(() => prisma.$disconnect());
```
Run: `npx tsx prisma/bulk-import.ts`

### Quick Database Inspection
```bash
npx prisma studio          # Visual DB browser at localhost:5555
```

## Adding New Invitation Sections

Pattern for adding a new section to the invitation:

1. **Create component** in `src/components/invitation/NewSection.tsx`
2. If it needs browser APIs → add `"use client"` directive
3. **Add CSS** in `src/styles/invitation.css` following the naming convention (`.new-section-*`)
4. **Wire it up** in `src/app/[slug]/page.tsx` (pass as prop to OpeningCoverClient)
5. **Render it** in `src/app/[slug]/OpeningCoverClient.tsx` in the correct position

### Server vs Client Decision Tree
```
Does it use useState/useEffect/onClick/fetch/DOM APIs?
  YES → "use client" component
  NO  → Server component (default, can query Prisma directly)
```

## Adding New Admin Pages

1. Create `src/app/admin/<page-name>/page.tsx`
2. Add navigation link in `src/app/admin/layout.tsx` sidebar
3. If it needs an API → create `src/app/api/<resource>/route.ts`
4. Pattern: Client component that fetches from API on mount, manages state locally

## Extending the Database

1. Edit `prisma/schema.prisma`
2. Run `npx prisma migrate dev --name <descriptive-name>`
3. Run `npx prisma generate`
4. Update seed script if needed
5. Restart dev server

## WhatsApp Integration Tips

The `buildWhatsappMessage()` in `src/lib/utils.ts` generates formatted messages. To customize:
- WhatsApp supports `*bold*` and `_italic_` formatting
- Phone numbers: strip non-digits, convert leading `0` to `62` (Indonesia)
- Link: `https://api.whatsapp.com/send?phone=<number>&text=<encoded-message>`

## Debugging Checklist

| Problem | Solution |
|---|---|
| `PrismaClientInitializationError` | Ensure adapter is passed to `new PrismaClient({ adapter })` |
| `Cannot find module '.prisma/client/default'` | Run `npx prisma generate` |
| Middleware deprecated warning | Rename `middleware.ts` → `proxy.ts`, export `default async function proxy()` |
| Viewport metadata warning | Move viewport from `metadata` export to separate `viewport` export |
| `justifycontent` style error | React inline styles use camelCase: `justifyContent` |
| Route params type error | Use `{ params }: { params: Promise<{ id: string }> }` and `await params` |
| CSS variables not applied | Ensure font variables are set on `<html>` className in layout.tsx |

## Performance Quick Wins

1. **Images**: Use `next/image` with `priority` for above-fold images
2. **Fonts**: Already optimized via `next/font/google` (auto self-hosted)
3. **Dynamic imports**: Use `next/dynamic` for heavy client components (e.g., photo gallery lightbox)
4. **Caching**: Admin pages use `force-dynamic`, but guest invitation could benefit from `revalidate` ISR

## Testing Guest Experience Locally

```bash
# 1. Start dev server
npm run dev

# 2. The seed script created a test guest "budi-santoso"
# Visit: http://localhost:3000/budi-santoso

# 3. To add more test guests:
# Go to http://localhost:3000/admin/login (password: admin123)
# Navigate to Daftar Tamu → Tambah Tamu
```
