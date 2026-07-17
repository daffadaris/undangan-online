import React from "react";
import { FloralDivider } from "./FloralDecor";

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

  const heroBg = config?.heroImage || "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=1200";

  return (
    <section 
      className="invitation-section hero-sec"
      style={{ 
        backgroundImage: `url("${heroBg}")`,
        backgroundPosition: config?.heroImagePosition || "center",
      }}
    >
      <div className="animate-fade-in hero-wrapper">
        <p className="cover-subtitle">Walimatul 'Ursy</p>
        <h1 className="hero-names">
          {config?.groomNickname || "Daffa"}<br />
          <span className="hero-ampersand">&amp;</span><br />
          {config?.brideNickname || "Regina"}
        </h1>
        <FloralDivider />
        <p className="hero-date">{formatDate(config?.akadDate || "2026-08-08")}</p>
      </div>
      
      {/* Soft gradient background decoration */}
      <div className="hero-radial-bg" />
    </section>
  );
}
