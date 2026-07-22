# API Reference

All handlers live under [src/app/api](../src/app/api). Conventions:

- Errors return `{ error: string }` with a 4xx/5xx status; successes return `{ success: true, … }`.
- Error copy is Bahasa Indonesia where guests/admins may see it, English elsewhere.
- Ownership is enforced **inside the handler** via `getCurrentUser()`; `proxy.ts` only guards page routes.
- Read routes that must never be cached declare `export const dynamic = "force-dynamic"`.

## `/api/auth`

| Method | Auth | Behaviour |
|---|---|---|
| `GET` | cookie | Returns `{ user: SessionUser }`, or 401 if no/invalid cookie |
| `POST` | public | Body `{ username, password }` → sets `admin_session`, returns `{ success, role }`; 401 on bad credentials |
| `DELETE` | cookie | Clears the cookie |

## `/api/guests`

| Method | Auth | Behaviour |
|---|---|---|
| `GET` | any logged-in | Lists guests ordered by `createdAt desc`, `include: { owner: { username } }`. Owners are forced to their own `userId`; super admin may pass `?userId=` |
| `POST` | any logged-in | Body `{ name, phone?, group?, userId? }`. Generates a unique slug via `slugify` + counter. `userId` is honoured only for super admin, otherwise the session's user |

`numberOfGuests` is **not** accepted at creation — new guests always start at the schema default 1,
`rsvpStatus` `pending`.

## `/api/guests/[id]`

| Method | Auth | Behaviour |
|---|---|---|
| `PUT` | owner of the row, or super admin | Body `{ name, phone, group, rsvpStatus, numberOfGuests, wishes }`. Writes `numberOfGuests: rsvpStatus === "confirmed" ? numberOfGuests : 0`. Empty strings are normalised to `null` |
| `DELETE` | owner of the row, or super admin | Hard delete |

## `/api/guests/import`

`POST`, any logged-in user. Body `{ guests: [{ name, phone?, group? }], userId? }`.
Iterates sequentially, skipping blank names and rows that throw, and returns
`{ success, imported: number, skipped: string[], importedNames: string[] }`.
Slug generation is the same unique-suffix loop as single creation.

## `/api/rsvp`

`POST`, **public — no authentication, no ownership check**. Body
`{ guestId, rsvpStatus, numberOfGuests, wishes }`.

- Requires `guestId`; anyone who knows a guest id can overwrite that guest's RSVP.
- `wishes !== undefined` also stamps `wishSentAt = new Date()`.
- Pax is zeroed unless `rsvpStatus === "confirmed"`.

## `/api/wishes`

`GET`, dual-mode:

- **Logged-in owner** → own guests only. **Super admin** → all, or `?userId=` filtered.
- **Anonymous with `?userId=`** → that owner's wishes (used by the public guestbook).
- **Anonymous without `?userId=`** → *every* owner's wishes. See [08-gotchas.md](08-gotchas.md).

Always `wishes: { not: null }`, ordered by `wishSentAt desc`, `take: 50`.

## `/api/settings`

| Method | Auth | Behaviour |
|---|---|---|
| `GET` | any logged-in | Returns `{ config }` for the session user (super admin may pass `?userId=`); `null` if none exists yet |
| `PUT` | any logged-in | Upserts the whole `WeddingConfig` on `userId`. Every field is copied straight from the body; omitted keys become `undefined`, which Prisma ignores on **update** but drops to the schema default on first **create**. The settings page always sends the complete object |

## `/api/users`

Super admin only (403 otherwise) for all four verbs.

| Method | Behaviour |
|---|---|
| `GET` | All users with `_count.guests` |
| `POST` | `{ username, password }` → creates an `owner`; 409 on duplicate username |
| `PUT` | `{ id, username?, password? }` → renames and/or re-hashes; 409 on duplicate, 400 if nothing to change |
| `DELETE` | `?id=` → deletes the user's guests and config, then the user. Refuses to delete a `super_admin` |

## `/api/upload`

`POST` multipart form field `file`. **No authentication check.** Validates MIME/extension against
`jpg jpeg png gif webp svg` and a 5 MB cap, then returns
`{ success: true, url: "data:<mime>;base64,…" }`. Nothing is written to disk — the data URL is what
gets stored in `WeddingConfig`, which is why images survive on serverless hosts.

## `/api/upload/[filename]`

`GET` — legacy reader that streams `public/uploads/<filename>` with a one-year immutable
cache header. Only useful for files uploaded before the base64 switch; unwritable on serverless.
