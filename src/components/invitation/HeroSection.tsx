import React from "react";
import { FloralDivider, SectionCorners } from "./FloralDecor";

interface HeroSectionProps {
  config: any;
}

export default function HeroSection({ config }: HeroSectionProps) {
  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "";
    const options: Intl.DateTimeFormatOptions = {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    };
    return new Date(dateStr).toLocaleDateString("id-ID", options);
  };

  return (
    <section
      className="invitation-section hero-sec"
      style={{
        backgroundImage: config?.heroImage ? `url("${config.heroImage}")` : undefined,
        backgroundPosition: config?.heroImagePosition || "center",
      }}
    >
      <SectionCorners />
      <div className="animate-fade-in hero-wrapper">
        <p className="cover-subtitle">Walimatul 'Ursy</p>
        <h1 className="hero-names">
          {config?.groomNickname || "Mempelai Pria"}<br />
          <span className="hero-ampersand">&amp;</span><br />
          {config?.brideNickname || "Mempelai Wanita"}
        </h1>
        <FloralDivider />
        <p className="hero-date">{formatDate(config?.akadDate || "2026-08-08")}</p>
      </div>
      
      {/* Soft gradient background decoration */}
      <div className="hero-radial-bg" />
    </section>
  );
}

