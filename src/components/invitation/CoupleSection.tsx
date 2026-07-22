import React from "react";
import { FloralHeaderDecor, SectionCorners, FloralPhotoFrame } from "./FloralDecor";

interface CoupleSectionProps {
  config: any;
}

export default function CoupleSection({ config }: CoupleSectionProps) {
  return (
    <section className="invitation-section">
      <SectionCorners />
      <FloralHeaderDecor />
      <h2 className="section-title">Mempelai</h2>
      <p className="couple-quote">
        "Maha Suci Allah yang telah menciptakan makhluk-makhluk-Nya berpasang-pasangan. Ya Allah, perkenankanlah kami merangkai kasih sayang yang Kau ciptakan dalam pernikahan kami."
      </p>

      <div className="couple-grid">
        
        {/* Groom Card */}
        <div className="couple-card">
          <div className="couple-photo-container">
            <FloralPhotoFrame className="couple-photo-wreath" />
            <div className="couple-photo-frame">
              <div
                className="couple-photo-inner"
                style={{
                  backgroundImage: config?.groomImage ? `url("${config.groomImage}")` : undefined,
                  backgroundPosition: config?.groomImagePosition || "center",
                }}
              />
            </div>
          </div>
          <h3 className="couple-name">{config?.groomName || "Mempelai Pria"}</h3>
          {config?.groomParents && <p className="couple-parents">{config.groomParents}</p>}
        </div>

        {/* Separator / Ampersand */}
        <div className="flex-center couple-separator">
          &amp;
        </div>

        {/* Bride Card */}
        <div className="couple-card">
          <div className="couple-photo-container">
            <FloralPhotoFrame className="couple-photo-wreath" />
            <div className="couple-photo-frame">
              <div
                className="couple-photo-inner"
                style={{
                  backgroundImage: config?.brideImage ? `url("${config.brideImage}")` : undefined,
                  backgroundPosition: config?.brideImagePosition || "center",
                }}
              />
            </div>
          </div>
          <h3 className="couple-name">{config?.brideName || "Mempelai Wanita"}</h3>
          {config?.brideParents && <p className="couple-parents">{config.brideParents}</p>}
        </div>

      </div>
    </section>
  );
}

