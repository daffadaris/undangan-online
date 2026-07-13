"use client";

import React, { useState } from "react";
import OpeningCover from "@/components/invitation/OpeningCover";
import MusicPlayer from "@/components/invitation/MusicPlayer";
import { FloralHeaderDecor } from "@/components/invitation/FloralDecor";
import ScrollReveal from "@/components/invitation/ScrollReveal";
import GallerySection from "@/components/invitation/GallerySection";

interface OpeningCoverClientProps {
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
          {heroSection}
          
          {/* Islamic Verse / Ayat Section */}
          <ScrollReveal>
            <section className="invitation-section">
              <FloralHeaderDecor />
              <p className="ayat-text">
                "Dan di antara tanda-tanda (kebesaran)-Nya ialah Dia menciptakan pasangan-pasangan untukmu dari jenismu sendiri, agar kamu cenderung dan merasa tenteram kepadanya, dan Dia menjadikan di antaramu rasa kasih dan sayang. Sungguh, pada yang demikian itu benar-benar terdapat tanda-tanda (kebesaran Allah) bagi kaum yang berpikir."
              </p>
              <p className="ayat-reference">
                - QS. Ar-Rum: 21 -
              </p>
            </section>
          </ScrollReveal>

          <ScrollReveal>{coupleSection}</ScrollReveal>
          <ScrollReveal>{countdownSection}</ScrollReveal>
          {(config?.showAkad !== false || config?.showResepsi !== false) && (
            <ScrollReveal>{eventDetailsSection}</ScrollReveal>
          )}
          {config?.showLoveStory !== false && <ScrollReveal>{loveStorySection}</ScrollReveal>}
          {config?.showGallery !== false && (
            <ScrollReveal>
              <GallerySection config={config} />
            </ScrollReveal>
          )}
          {config?.showGiftInfo !== false && <ScrollReveal>{giftInfoSection}</ScrollReveal>}
          {config?.showRsvp !== false && <ScrollReveal>{rsvpFormSection}</ScrollReveal>}

          {/* Footer Closing Section */}
          <ScrollReveal>
            <section className="invitation-section footer-section">
              <p className="footer-text">
                Merupakan suatu kehormatan dan kebahagiaan bagi kami apabila Bapak/Ibu/Saudara/i berkenan hadir untuk memberikan doa restu kepada kedua mempelai.
              </p>
              <p className="footer-text">
                Atas kehadiran dan doa restunya, kami ucapkan terima kasih.
              </p>
              <h3 className="footer-happy-couple">
                Kami yang berbahagia,
              </h3>
              <p className="footer-names">
                Daffa &amp; Regina
              </p>
            </section>
          </ScrollReveal>

          {/* Background Music Player */}
          <MusicPlayer playTrigger={isOpened} musicUrl={config?.musicUrl} />
        </div>
      )}
    </>
  );
}
