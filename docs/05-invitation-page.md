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
  what satisfies browser autoplay policy.

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

## RSVP flow

[RsvpForm.tsx](../src/components/invitation/RsvpForm.tsx):

1. Local state seeds from the DB row: `rsvpStatus`, `numberOfGuests`, `wishes`.
2. Two big buttons set `confirmed` / `declined`. The "Jumlah Orang" `<select>` (1–5) renders only
   when `confirmed`.
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
