# Admin Panel

Everything under `/admin` except `/admin/login` requires the `admin_session` cookie
([src/proxy.ts](../src/proxy.ts)). The shell is
[src/app/admin/layout.tsx](../src/app/admin/layout.tsx) — a client component that fetches
`GET /api/auth`, renders the collapsible sidebar, and hides itself on the login route.
Nav items: Dashboard, Tamu, Ucapan, Pengaturan, and **Pengguna** (super admin only).

## Pages

### `/admin/login` — [login/page.tsx](../src/app/admin/login/page.tsx)
Username + password → `POST /api/auth` → `router.push("/admin")`. 105 lines, no frills.

### `/admin` — [page.tsx](../src/app/admin/page.tsx)
**Server component.** Runs the aggregate queries directly through Prisma:

| Card | Query |
|---|---|
| Total Undangan | `guest.count(where)` |
| Telah Dibuka | `count({ openedAt: { not: null } })` |
| Konfirmasi Hadir | `count({ rsvpStatus: "confirmed" })` |
| Total Pax Kehadiran | `aggregate(_sum.numberOfGuests)` over confirmed guests |

Plus a 5-row "recent RSVP" table ordered by `updatedAt desc` where status ≠ `pending`.
Super admins get a `GET`-form owner filter that round-trips through `?userId=`.

### `/admin/guests` — [guests/page.tsx](../src/app/admin/guests/page.tsx) (898 lines, client)
The workhorse. Features:

- **Table** with search (name/phone), group filter, RSVP-status filter.
- **Add / Edit / Delete** modals. The edit modal exposes RSVP status and, only when status is
  `confirmed`, the 1–5 "Jumlah Pax Kehadiran" dropdown (`editPax`).
- **CSV import** — parsed *client-side* (`handleCSVFileSelect`), previewed in a modal with
  per-row checkboxes, plus a "paste names" mode (`handleProcessPastedText`) and a default group.
  Confirmed rows are POSTed to `/api/guests/import`.
- **CSV export** — `exportToCSV()` builds the file from client state (no server round-trip),
  BOM-prefixed for Excel, filename `daftar_tamu_wedding_YYYY-MM-DD.csv`.
  Columns: Nama, Grup, No HP, Status RSVP, Pax Kehadiran, Sudah Dibuka, Ucapan.
- **Invitation link + WhatsApp** — `getWhatsAppLink()` builds
  `${origin}/${guest.owner.username}/${guest.slug}` and fills the owner's `whatsappTemplate`
  (placeholders `{{nama}} {{name}} {{pria}} {{groom}} {{wanita}} {{bride}} {{link}} {{tautan}}`),
  then normalises the phone to `62…`. Copy-to-clipboard falls back to `execCommand` on
  non-secure contexts.
- Super admins get an owner selector that scopes both the list and new-guest creation.

### `/admin/wishes` — [wishes/page.tsx](../src/app/admin/wishes/page.tsx)
Guestbook viewer over `GET /api/wishes`. "Delete wish" does **not** delete the guest — it sends
`PUT /api/guests/{id}` with `{ wishes: null }`. That partial payload has damaging side effects;
see [08-gotchas.md](08-gotchas.md#deleting-a-wish-wipes-phone-group-and-pax).

### `/admin/settings` — [settings/page.tsx](../src/app/admin/settings/page.tsx) (1121 lines, client)
One giant controlled form mirroring every `WeddingConfig` column: couple, akad, resepsi,
love story repeater, gift accounts repeater, gallery, media uploads with crop-position selectors,
theme picker, section visibility toggles, and the WhatsApp template. `handleSave` PUTs the whole
object to `/api/settings`. Image inputs go through `POST /api/upload` and store the returned
base64 data URL in the field.

### `/admin/users` — [users/page.tsx](../src/app/admin/users/page.tsx)
Super admin only. Create owners, rename, reset password, delete (cascades guests + config), and
see each owner's guest count.

## Role behaviour cheat-sheet

| Capability | owner | super_admin |
|---|---|---|
| See own guests/wishes/config | ✅ | ✅ |
| See other owners' data | ❌ | ✅ via `?userId=` |
| Create guests for another owner | ❌ | ✅ (`userId` in body) |
| Manage users | ❌ | ✅ |
| Be deleted via `/api/users` | ✅ | ❌ (explicitly blocked) |
