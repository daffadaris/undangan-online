"use client";

import React, { useState } from "react";
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

interface OpeningCoverClientProps {
  ownerId: string;
  guest: any;
  config: any;
  heroSection: React.ReactNode;
  coupleSection: React.ReactNode;
  countdownSection: React.ReactNode;
  eventDetailsSection: React.ReactNode;
  loveStorySection: React.ReactNode;
  giftInfoSection: React.ReactNode;
  rsvpFormSection: React.ReactNode;
}

export default function OpeningCoverClient({
  ownerId,
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
  const [isOpened, setIsOpened] = useState(false);

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

  const handleOpen = () => {
    setIsOpened(true);
  };

  return (
    <>
      <OpeningCover
        guestName={guest.name}
        isOpened={isOpened}
        onOpen={handleOpen}
        config={config}
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
          <MusicPlayer playTrigger={isOpened} musicUrl={config?.musicUrl} />
        </div>
      )}
    </>
  );
}
