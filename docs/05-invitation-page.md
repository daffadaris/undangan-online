# Guest Invitation Page

Entry: [src/app/[username]/[slug]/page.tsx](../src/app/[username]/[slug]/page.tsx)
(`dynamic = "force-dynamic"`). Wrapper element is
`<div className={"invitation-body theme-" + (config?.theme || "sage")}>`, which is what activates
the theme palette.

## Render pipeline

The server component renders every section eagerly and hands them to the client wrapper as props,
so the client bundle stays free of Prisma and data logic:

```
page.tsx (server)
└── OpeningCoverClient (client, holds `isOpened`)
    ├── OpeningCover            — envelope screen, guest name, "Buka Undangan"
    └── when isOpened:
        FloatingPetals / SideLeafDecor{Left,Right}
        HeroSection
        Ayat section (QS. Ar-Rum: 21, hard-coded in the client wrapper)
        CoupleSection
        CountdownTimer          — targets config.akadDate, falls back to "2026-08-08"
        EventDetails            — if showAkad or showResepsi
        LoveStory               — if showLoveStory
        GallerySection          — if showGallery
        GiftInfo                — if showGiftInfo
        RsvpForm                — if showRsvp
        Footer (nicknames)
        RsvpFloatingButton + MusicPlayer
```

- While `isOpened` is false the wrapper sets `document.body.style.overflow = "hidden"` so the cover
  cannot be scrolled past; the effect cleans up on unmount.
- Every section is wrapped in `<ScrollReveal animation="…">` (`fade-up`, `fade-left`, `fade-right`,
  `zoom-in`, `blur-in`) — an IntersectionObserver-driven reveal.
- Section toggles are checked as `config?.showX !== false`, so a missing config still renders
  everything.
- Music autoplay is triggered by the same `isOpened` flag — the user gesture on "Buka Undangan" is
  what satisfies browser autoplay policy. In Mode Privat's `locked` state the reveal waits for the
  claim + refresh round-trip, so on a very slow connection the gesture can expire and the guest has
  to tap the music button.

## Components

| Component | Role |
|---|---|
| [OpeningCover](../src/components/invitation/OpeningCover.tsx) | Envelope/cover screen with the guest's name |
| [HeroSection](../src/components/invitation/HeroSection.tsx) | Names, date, hero image with `heroImagePosition` |
| [CoupleSection](../src/components/invitation/CoupleSection.tsx) | Groom/bride cards, parents, crop positions |
| [CountdownTimer](../src/components/invitation/CountdownTimer.tsx) | Live D-H-M-S to `akadDate` |
| [EventDetails](../src/components/invitation/EventDetails.tsx) | Akad + Resepsi cards, Maps links |
| [LoveStory](../src/components/invitation/LoveStory.tsx) | Timeline from `JSON.parse(config.loveStory)` |
| [GallerySection](../src/components/invitation/GallerySection.tsx) | Grid from `JSON.parse(config.galleryImages)` |
| [GiftInfo](../src/components/invitation/GiftInfo.tsx) | Bank/e-wallet cards from `JSON.parse(config.giftInfo)` |
| [RsvpForm](../src/components/invitation/RsvpForm.tsx) | Attendance + pax + wish, and the public guestbook list |
| [RsvpFloatingButton](../src/components/invitation/RsvpFloatingButton.tsx) | Pulsing jump-to-`#rsvp-section` button |
| [MusicPlayer](../src/components/invitation/MusicPlayer.tsx) | Background audio with play/pause control |
| [FloralDecor](../src/components/invitation/FloralDecor.tsx) | 452 lines of inline SVG ornaments: `FloralHeaderDecor`, `FloralSwirl`, `GoldSeparator`, `FloatingPetals`, `SectionCorners`, `SideLeafDecor{Left,Right}` |
| [ScrollReveal](../src/components/invitation/ScrollReveal.tsx) | IntersectionObserver reveal wrapper |

## Mode Privat

Opt-in per wedding (`WeddingConfig.privateMode`). It stops a guest's link from being passed
around by letting it open on only `Guest.maxDevices` browsers (default 2, since WhatsApp's in-app
browser and Chrome keep separate cookies and so count as two devices for one real guest).

1. [src/proxy.ts](../src/proxy.ts) gives every browser hitting `/{username}/{slug}` a random,
   httpOnly `inv_dev` cookie (1 year). Nothing else about the device is stored.
2. [page.tsx](../src/app/[username]/[slug]/page.tsx) calls `deviceAccess()` from
   [src/lib/privacy.ts](../src/lib/privacy.ts) and passes `access` to `OpeningCoverClient`:
   - `open` — browser already claimed the link (or Mode Privat is off): rendered as normal.
   - `locked` — a slot is free but this browser hasn't claimed it: **only the cover** is sent
     (nicknames + music URL). No sections, no full config, so nothing to scrape.
   - `blocked` — all slots are taken by other browsers: the cover shows
     "Undangan Bersifat Pribadi" instead of the button.
3. In `locked`, "Buka Undangan" awaits `POST /api/guests/open`, which claims the slot, then calls
   `router.refresh()`; the content reveals once the server re-renders with `access="open"`.
   A 403 flips the cover to the blocked notice.
4. `/api/rsvp` refuses browsers that aren't in the guest's `deviceIds`.
5. Once opened, [ScreenshotGuard](../src/components/invitation/ScreenshotGuard.tsx) adds
   screenshot *deterrents* (web pages can't truly block OS screenshots): a tiled
   "Undangan khusus {nama}" watermark so leaks are traceable, a cover screen when the window loses
   focus or a PrintScreen / Cmd+Shift+3/4/5 / Win+Shift+S / print shortcut fires, and no text
   selection, image long-press/right-click/drag, or printing. DRM-style black screenshots
   (Netflix) only apply to encrypted video, so they aren't an option here.

Owners manage slots from `/admin/guests` ("Perangkat" column, "Reset Perangkat", "Maks.
Perangkat"). The client only ever receives `{ id, name }` for the guest, never `deviceIds`.

## RSVP flow

[RsvpForm.tsx](../src/components/invitation/RsvpForm.tsx):

1. Local state seeds from the DB row: `rsvpStatus`, `numberOfGuests` (clamped to ≥ 1), `wishes`.
2. Two big buttons set `confirmed` / `declined`. The "Jumlah Orang" picker — five `.rsvp-pax-btn`
   pills sharing the attendance selector's styling, plus a hint line — renders only when
   `confirmed`.
3. The wish `<textarea>` is `required` — a guest cannot submit without writing something.
4. Submit → `POST /api/rsvp` → success message in Bahasa Indonesia, then `fetchWishes()` refreshes
   the guestbook.
5. The guestbook list comes from `GET /api/wishes?userId=<ownerId>` when the `ownerId` prop is
   supplied — currently neither invitation route passes it, see [08-gotchas.md](08-gotchas.md).

## Themes

`config.theme` maps to `.invitation-body.theme-<name>` in
[src/styles/invitation.css](../src/styles/invitation.css). Available:
`sage` (default), `blue`, `pink`, `gold`, `purple`, `emerald`, `burgundy`, `dark`, `green-pink`.
Each block re-declares the palette custom properties; no other file needs to change to add a theme.

## Legacy route

[/pingkan-daffa/[slug]](../src/app/pingkan-daffa/[slug]/page.tsx) is the pre-multi-tenant page. It
looks the guest up by slug **globally** (no owner scoping) and falls back to
`weddingConfig.findFirst()` when the guest has no `userId`. Keep it working for links already sent
out over WhatsApp; use `/{username}/{slug}` for anything new.
