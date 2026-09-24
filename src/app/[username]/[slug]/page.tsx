import React from "react";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import OpeningCoverClient, { type InvitationAccess } from "./OpeningCoverClient";
import HeroSection from "@/components/invitation/HeroSection";
import CoupleSection from "@/components/invitation/CoupleSection";
import CountdownTimer from "@/components/invitation/CountdownTimer";
import EventDetails from "@/components/invitation/EventDetails";
import LoveStory from "@/components/invitation/LoveStory";
import GiftInfo from "@/components/invitation/GiftInfo";
import RsvpForm from "@/components/invitation/RsvpForm";
import { DEVICE_COOKIE, deviceAccess } from "@/lib/privacy";
import "@/styles/invitation.css";

export const dynamic = "force-dynamic";

interface InvitationPageProps {
  params: Promise<{ username: string; slug: string }>;
}

export async function generateMetadata({ params }: InvitationPageProps) {
  const { username } = await params;
  const owner = await prisma.user.findUnique({ where: { username } });
  const config = owner ? await prisma.weddingConfig.findUnique({ where: { userId: owner.id } }) : null;

  const groom = config?.groomNickname || "Mempelai Pria";
  const bride = config?.brideNickname || "Mempelai Wanita";

  return {
    title: `Undangan Pernikahan ${groom} & ${bride}`,
    description: `Undangan pernikahan online ${config?.groomName || groom} & ${config?.brideName || bride}`,
  };
}

export default async function InvitationPage({ params }: InvitationPageProps) {
  const { username, slug } = await params;

  // 1. Find the owner by username
  const owner = await prisma.user.findUnique({
    where: { username },
  });

  if (!owner) {
    return notFound();
  }

  // 2. Find the guest by slug, scoped to this owner
  const guest = await prisma.guest.findFirst({
    where: { slug, userId: owner.id },
  });

  if (!guest) {
    return notFound();
  }

  // Note: "opened" is tracked client-side when the guest clicks "Buka
  // Undangan" (see OpeningCoverClient), NOT on page load — otherwise
  // link-preview crawlers and test loads would falsely mark it opened.

  // 3. Fetch wedding config for this owner
  const config = await prisma.weddingConfig.findUnique({
    where: { userId: owner.id },
  });

  // Mode Privat: a browser that hasn't claimed this guest's link only gets the
  // cover — none of the invitation content (venue, gifts, QRIS…) is sent until
  // POST /api/guests/open registers it and the client refreshes.
  let access: InvitationAccess = "open";
  if (config?.privateMode) {
    const deviceId = (await cookies()).get(DEVICE_COOKIE)?.value;
    const result = deviceAccess(guest, deviceId);
    access = result === "registered" ? "open" : result === "available" ? "locked" : "blocked";
  }

  const clientGuest = { id: guest.id, name: guest.name };
  const coverConfig = {
    groomNickname: config?.groomNickname,
    brideNickname: config?.brideNickname,
    musicUrl: config?.musicUrl,
  };

  return (
    <div
      className={[
        "invitation-body",
        // "auto" means: follow the design's own bundled palette, so no theme
        // class is emitted. Any other value overrides the design's colours.
        config?.theme && config.theme !== "auto" ? `theme-${config.theme}` : "",
        `design-${config?.design || "classic"}`,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {access === "open" ? (
        <OpeningCoverClient
          access={access}
          guest={clientGuest}
          config={config}
          heroSection={<HeroSection config={config} />}
          coupleSection={<CoupleSection config={config} />}
          countdownSection={<CountdownTimer targetDate={config?.akadDate || "2026-08-08"} />}
          eventDetailsSection={<EventDetails config={config} />}
          loveStorySection={<LoveStory config={config} />}
          giftInfoSection={<GiftInfo config={config} />}
          rsvpFormSection={
            <RsvpForm
              guestId={guest.id}
              guestName={guest.name}
              guestSlug={guest.slug}
              initialRsvpStatus={guest.rsvpStatus}
              initialNumberOfGuests={guest.numberOfGuests}
              initialWishes={guest.wishes}
              ownerId={owner.id}
              qrCheckin={config?.qrCheckin === true}
              initialCheckinCode={guest.checkinCode}
            />
          }
        />
      ) : (
        <OpeningCoverClient access={access} guest={clientGuest} config={coverConfig} />
      )}
    </div>
  );
}
