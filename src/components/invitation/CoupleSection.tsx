import React from "react";
import { FloralHeaderDecor } from "./FloralDecor";

interface CoupleSectionProps {
  config: any;
}

export default function CoupleSection({ config }: CoupleSectionProps) {
  return (
    <section className="invitation-section">
      <FloralHeaderDecor />
      <h2 className="section-title">Mempelai</h2>
      <p className="couple-quote">
        "Maha Suci Allah yang telah menciptakan makhluk-makhluk-Nya berpasang-pasangan. Ya Allah, perkenankanlah kami merangkai kasih sayang yang Kau ciptakan dalam pernikahan kami."
      </p>

      <div className="couple-grid">
        
        {/* Groom Card */}
        <div className="couple-card">
          <div className="couple-photo-frame">
            <div
              className="couple-photo-inner"
              style={{
                backgroundImage: `url(${config?.groomImage || "https://images.unsplash.com/photo-1594744803329-e58b31de215f?q=80&w=600"})`,
              }}
            />
          </div>
          <h3 className="couple-name">{config?.groomName || "Daffa' Daris Mahendra Ansori"}</h3>
          <p className="couple-parents">{config?.groomParents || "Putra Pertama dari Bpk. Ansori & Ibu Ansori"}</p>
        </div>

        {/* Separator / Ampersand */}
        <div className="flex-center couple-separator">
          &amp;
        </div>

        {/* Bride Card */}
        <div className="couple-card">
          <div className="couple-photo-frame">
            <div
              className="couple-photo-inner"
              style={{
                backgroundImage: `url(${config?.brideImage || "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=600"})`,
              }}
            />
          </div>
          <h3 className="couple-name">{config?.brideName || "Regina Pingkan Sayyidhina Arif"}</h3>
          <p className="couple-parents">{config?.brideParents || "Putri Kedua dari Bpk. Arif & Ibu Arif"}</p>
        </div>

      </div>
    </section>
  );
}
