import React from "react";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import OpeningCoverClient from "./OpeningCoverClient";
import HeroSection from "@/components/invitation/HeroSection";
import CoupleSection from "@/components/invitation/CoupleSection";
import CountdownTimer from "@/components/invitation/CountdownTimer";
import EventDetails from "@/components/invitation/EventDetails";
import LoveStory from "@/components/invitation/LoveStory";
import GiftInfo from "@/components/invitation/GiftInfo";
import RsvpForm from "@/components/invitation/RsvpForm";
import "@/styles/invitation.css";

export const dynamic = "force-dynamic";

interface InvitationPageProps {
  params: Promise<{ username: string; slug: string }>;
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

  // 3. Track invitation opened
  if (!guest.openedAt) {
    await prisma.guest.update({
      where: { id: guest.id },
      data: { openedAt: new Date() },
    });
  }

  // 4. Fetch wedding config for this owner
  const config = await prisma.weddingConfig.findUnique({
    where: { userId: owner.id },
  });

  return (
    <div className={`invitation-body theme-${config?.theme || "sage"}`}>
      <OpeningCoverClient
        ownerId={owner.id}
        guest={guest}
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
          />
        }
      />
    </div>
  );
}
