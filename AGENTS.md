<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Undangan Online — Project Rules

## Critical Conventions
- Use `src/proxy.ts` (NOT `middleware.ts`) for route protection — Next.js 16 deprecated middleware
- Route params are `Promise`-based: always `const { slug } = await params;`
- `cookies()` from `next/headers` is async: always `await cookies()`
- Prisma 7 requires a driver adapter — never call `new PrismaClient()` without `{ adapter }`
- All CSS is vanilla — do NOT introduce Tailwind or CSS modules
- UI language is **Bahasa Indonesia** for guest-facing pages
- Design theme: Sage Green (#A8BBA0) + Cream (#FFF8DC) — maintain consistency

## Styling Rules
- Design tokens live in `src/app/globals.css`
- Invitation styles in `src/styles/invitation.css`
- Admin styles in `src/styles/admin.css`
- Use CSS classes, not inline styles (except for dynamic values like `backgroundImage`)

## Database Rules
- Always import `prisma` from `@/lib/prisma` (singleton with adapter)
- JSON arrays (love story, gifts, gallery) stored as `String`, parsed with `JSON.parse()` and fallback
- WeddingConfig is a singleton row with `id = "config"`
