# Gotchas & Known Issues

Verified against the code on 2026-07-22. Nothing here is fixed yet — these are traps to know about.

## Pax ("Jumlah Orang") behaviour

**There is no code path that defaults pax to 2.** `Guest.numberOfGuests` is
`Int @default(1)`, guest creation and CSV import never set it, and the dropdown's first option is
`1 Orang`. A `2` in the admin Pax column means the guest (or an admin) chose "2 Orang" — i.e. they
are bringing a companion. The dashboard's **Total Pax Kehadiran** sums those values, so it exceeds
**Konfirmasi Hadir** whenever anyone brings a plus-one (2 confirmed guests × 2 pax → 4).

### Pax silently becomes 0

Two write paths force `numberOfGuests: rsvpStatus === "confirmed" ? numberOfGuests : 0`
([rsvp/route.ts:15](../src/app/api/rsvp/route.ts#L15),
[guests/[id]/route.ts:35](../src/app/api/guests/[id]/route.ts#L35)). Consequences:

1. A guest who declines gets pax `0` — correct. But if they later reopen the invitation and switch
   to "Saya Akan Hadir", `numberOfGuests` state is still `0`, which matches **no** `<option>`
   (the list is 1–5). The `<select>` renders with nothing selected, and submitting without touching
   it stores a `confirmed` guest with **0 pax** — invisible in the "Total Pax" stat.
   The same applies to the admin edit modal's `editPax`.
   *Fix direction*: clamp on read (`initialNumberOfGuests || 1`) or add a `0` option/normalise
   server-side.
2. See the wish-delete bug below for the other route to `confirmed` + `0`.

## Deleting a wish wipes phone, group, and pax

[admin/wishes/page.tsx:57](../src/app/admin/wishes/page.tsx#L57) sends
`PUT /api/guests/{id}` with only `{ wishes: null }`. The handler destructures the full field set,
so for that request:

```ts
phone: phone || null            // undefined → null   → phone number erased
group: group || null            // undefined → null   → group erased
rsvpStatus                      // undefined          → unchanged (stays "confirmed")
numberOfGuests: rsvpStatus === "confirmed" ? … : 0   // rsvpStatus is undefined → 0
```

Result: the guest keeps `rsvpStatus: "confirmed"` but loses their phone, group, and pax count —
despite the confirm dialog promising *"Tamu tetap ada, hanya ucapannya yang dihapus"*.
*Fix direction*: build the `data` object from defined keys only, or add a dedicated
`PATCH`/clear-wish endpoint.

## Public guestbook leaks across owners

`RsvpForm` scopes the guestbook with its optional `ownerId` prop, but **neither invitation route
passes it** ([[username]/[slug]/page.tsx:67-74](../src/app/[username]/[slug]/page.tsx#L67-L74),
[pingkan-daffa/[slug]/page.tsx:56-63](../src/app/pingkan-daffa/[slug]/page.tsx#L56-L63)) — even
though the multi-tenant page already resolves `owner.id` and hands it to `OpeningCoverClient`.
So the form calls `GET /api/wishes` with no `userId`, and the anonymous branch of that handler
applies no `userId` filter — every couple's guests see **every other couple's** wishes.
*Fix direction*: pass `ownerId={owner.id}` to `RsvpForm`, and make `/api/wishes` require a
`userId` for anonymous callers.

## Session cookie is unsigned

`admin_session` is plain `JSON.stringify({ userId, username, role })` and `getCurrentUser()` trusts
whatever parses ([src/lib/auth.ts:46-57](../src/lib/auth.ts#L46-L57)). `proxy.ts` only checks that
the cookie is non-empty. Anyone who can set a request cookie can mint
`{"role":"super_admin"}` and reach every admin API. `httpOnly` stops page JS from writing it, but
not curl, an extension, or devtools.
*Fix direction*: sign the payload (HMAC) or store an opaque session id server-side.

## Other unauthenticated surfaces

- `POST /api/upload` has **no auth check** — any caller can push 5 MB through the base64 encoder.
- `POST /api/rsvp` is public by design (guests aren't logged in), but it takes a raw `guestId` with
  no owner check, so a known/guessed id lets anyone overwrite that guest's RSVP and wish.

## Data & schema traps

- **Slugs are globally unique**, not per-owner. Two couples inviting "Budi" produce `budi` and
  `budi-1`; the second couple's URL therefore looks odd. The legacy `/pingkan-daffa/[slug]` route
  looks guests up by slug with **no owner scoping** at all.
- **The migration folder is stale.** `prisma/migrations/20260713084653_init` predates the `User`
  model. Schema changes reach Turso via `npm run db:push-turso`, which copies the local `dev.db`
  schema — so the local file must be up to date first.
- **`.env` sets `TURSO_DATABASE_URL`**, so `npm run dev` reads and writes the *production* database.
  Comment it out before experimenting.
- **Dates are strings.** Only `akadDate` is parsed (by `CountdownTimer`); everything else is
  rendered verbatim, so format consistency is a manual concern.
- **JSON-in-String columns** (`loveStory`, `giftInfo`, `galleryImages`) must always be parsed inside
  a `try/catch` with a `[]` fallback — a malformed value would otherwise crash the invitation.

## Framework traps (Next.js 16 / Prisma 7)

- Route params are promises: `const { slug } = await params;`.
- `cookies()` is async: `await cookies()`.
- Use `src/proxy.ts`; `middleware.ts` is deprecated in this version and will not run.
- `new PrismaClient()` without `{ adapter }` throws in Prisma 7.
- Consult `node_modules/next/dist/docs/` before assuming any Next.js API behaves as in older
  versions.

## Cosmetic

- `redirect` is imported but unused in [[username]/[slug]/page.tsx](../src/app/[username]/[slug]/page.tsx#L2).
- `package.json` still carries the scaffold name `"temp-app"`.
- `ADMIN_PASSWORD` remains in `.env` but nothing reads it since the move to per-user bcrypt auth.
