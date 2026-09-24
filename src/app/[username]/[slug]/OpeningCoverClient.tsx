"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import OpeningCover from "@/components/invitation/OpeningCover";
import MusicPlayer from "@/components/invitation/MusicPlayer";
import RsvpFloatingButton from "@/components/invitation/RsvpFloatingButton";
import {
  FloralHeaderDecor,
  FloralSwirl,
  GoldSeparator,
  FloatingPetals,
  SectionCorners,
  SideLeafDecorLeft,
  SideLeafDecorRight,
} from "@/components/invitation/FloralDecor";
import ScrollReveal from "@/components/invitation/ScrollReveal";
import GallerySection from "@/components/invitation/GallerySection";
import DressCodeSection from "@/components/invitation/DressCodeSection";
import ScreenshotGuard from "@/components/invitation/ScreenshotGuard";

// "open": content is rendered. "locked": Mode Privat, this browser hasn't
// claimed the link yet — only the cover is sent. "blocked": every slot for
// this link is taken by other browsers.
export type InvitationAccess = "open" | "locked" | "blocked";

interface OpeningCoverClientProps {
  access: InvitationAccess;
  guest: { id: string; name: string };
  config: any;
  heroSection?: React.ReactNode;
  coupleSection?: React.ReactNode;
  countdownSection?: React.ReactNode;
  eventDetailsSection?: React.ReactNode;
  loveStorySection?: React.ReactNode;
  giftInfoSection?: React.ReactNode;
  rsvpFormSection?: React.ReactNode;
}

export default function OpeningCoverClient({
  access,
  guest,
  config,
  heroSection,
  coupleSection,
  countdownSection,
  eventDetailsSection,
  loveStorySection,
  giftInfoSection,
  rsvpFormSection,
}: OpeningCoverClientProps) {
  const router = useRouter();
  const [clickedOpen, setClickedOpen] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimBlocked, setClaimBlocked] = useState(false);
  const blocked = access === "blocked" || claimBlocked;
  // After a successful claim the server re-renders with access "open"; reveal
  // only once the content has actually arrived.
  const isOpened = clickedOpen && access === "open";
  // "locked"/"blocked" only happen in Mode Privat (and get a trimmed config),
  // so guard those too — the cover as well as the opened invitation.
  const guarded = access !== "open" || config?.privateMode === true;

  React.useEffect(() => {
    if (!isOpened) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpened]);

  const handleOpen = async () => {
    if (access === "locked") {
      setIsClaiming(true);
      try {
        const res = await fetch("/api/guests/open", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ guestId: guest.id }),
        });
        if (res.ok) {
          setClickedOpen(true);
          router.refresh();
          return;
        }
        if (res.status === 403) setClaimBlocked(true);
      } catch {}
      setIsClaiming(false);
      return;
    }

    setClickedOpen(true);
    // Mark opened only on a real guest click — fire-and-forget so a slow or
    // failed request never blocks the reveal animation.
    fetch("/api/guests/open", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ guestId: guest.id }),
    }).catch(() => {});
  };

  return (
    <>
      <OpeningCover
        guestName={guest.name}
        isOpened={isOpened}
        onOpen={handleOpen}
        config={config}
        status={blocked ? "blocked" : isClaiming && !isOpened ? "opening" : "idle"}
      />

      {isOpened && (
        <div className="animate-fade-in">
          <FloatingPetals count={8} />
          <SideLeafDecorLeft />
          <SideLeafDecorRight />

          {heroSection}

          <ScrollReveal animation="blur-in">
            <section className="invitation-section">
              <SectionCorners />
              <FloralHeaderDecor />
              <p className="ayat-text">
                &quot;Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang. Sungguh, pada yang demikian itu benar-benar terdapat tanda-tanda (kebesaran Allah) bagi kaum yang berpikir.&quot;
              </p>
              <p className="ayat-reference">
                - QS. Ar-Rum: 21 -
              </p>
              <GoldSeparator />
            </section>
          </ScrollReveal>

          <FloralSwirl />
          <ScrollReveal animation="zoom-in">{coupleSection}</ScrollReveal>
          <FloralSwirl />
          <ScrollReveal animation="fade-up">{countdownSection}</ScrollReveal>

          {(config?.showAkad !== false || config?.showResepsi !== false) && (
            <>
              <FloralSwirl />
              <ScrollReveal animation="fade-left">{eventDetailsSection}</ScrollReveal>
            </>
          )}

          {config?.showDressCode !== false && (
            <>
              <FloralSwirl />
              <ScrollReveal animation="fade-right">
                <DressCodeSection config={config} />
              </ScrollReveal>
            </>
          )}

          {config?.showLoveStory !== false && (
            <>
              <FloralSwirl />
              <ScrollReveal animation="fade-up">{loveStorySection}</ScrollReveal>
            </>
          )}

          {config?.showGallery !== false && (
            <>
              <FloralSwirl />
              <ScrollReveal animation="zoom-in">
                <GallerySection config={config} />
              </ScrollReveal>
            </>
          )}

          {config?.showGiftInfo !== false && (
            <>
              <FloralSwirl />
              <ScrollReveal animation="fade-right">{giftInfoSection}</ScrollReveal>
            </>
          )}

          {config?.showRsvp !== false && (
            <>
              <FloralSwirl />
              <ScrollReveal animation="fade-up">{rsvpFormSection}</ScrollReveal>
            </>
          )}

          <ScrollReveal animation="blur-in">
            <section className="invitation-section footer-section">
              <SectionCorners />
              <p className="footer-text">
                Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu kepada kedua mempelai.
              </p>
              <p className="footer-text">
                Atas kehadiran dan doa restunya, kami ucapkan terima kasih.
              </p>
              <GoldSeparator />
              <h3 className="footer-happy-couple">Kami yang berbahagia,</h3>
              <p className="footer-names">
                {config?.groomNickname || ""} &amp; {config?.brideNickname || ""}
              </p>
            </section>
          </ScrollReveal>

          <RsvpFloatingButton visible={config?.showRsvp !== false} />
        </div>
      )}

      {guarded && <ScreenshotGuard />}
      <MusicPlayer playTrigger={isOpened} musicUrl={config?.musicUrl} />
    </>
  );
}
