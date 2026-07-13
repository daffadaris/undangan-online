import React from "react";
import { notFound } from "next/navigation";
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

// Force dynamic rendering since we are reading from SQLite DB dynamically
export const dynamic = "force-dynamic";

interface GuestPageProps {
  params: Promise<{ slug: string }>;
}

export default async function GuestPage({ params }: GuestPageProps) {
  const { slug } = await params;

  // 1. Fetch guest details
  const guest = await prisma.guest.findUnique({
    where: { slug },
  });

  // If no guest is found, return 404
  if (!guest) {
    return notFound();
  }

  // Track invitation opened (if it hasn't been tracked yet)
  if (!guest.openedAt) {
    await prisma.guest.update({
      where: { id: guest.id },
      data: { openedAt: new Date() },
    });
  }

  // 2. Fetch wedding config
  const config = await prisma.weddingConfig.findUnique({
    where: { id: "config" },
  });

  return (
    <div className={`invitation-body theme-${config?.theme || "sage"}`}>
      <OpeningCoverClient
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
