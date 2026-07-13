import React from "react";
import { FloralHeaderDecor } from "./FloralDecor";

interface GallerySectionProps {
  config: any;
}

export default function GallerySection({ config }: GallerySectionProps) {
  let images: string[] = [];
  try {
    images = JSON.parse(config?.galleryImages || "[]");
  } catch (e) {
    images = [];
  }

  // Use beautiful default wedding placeholders if no images are uploaded
  if (images.length === 0) {
    images = [
      "https://images.unsplash.com/photo-1519225495810-7512c696505a?q=80&w=600",
      "https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=600",
      "https://images.unsplash.com/photo-1465495976277-4387d4b0b4c6?q=80&w=600",
      "https://images.unsplash.com/photo-1520854221256-17451cc35953?q=80&w=600",
      "https://images.unsplash.com/photo-1583939003579-730e3918a45a?q=80&w=600",
      "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600",
    ];
  }

  return (
    <section className="invitation-section">
      <FloralHeaderDecor />
      <h2 className="section-title">Galeri Foto</h2>
      <p className="section-subtitle" style={{ marginBottom: "2rem" }}>Momen Bahagia Kami</p>

      <div className="gallery-grid">
        {images.map((url, index) => (
          <div key={index} className="gallery-item">
            <img
              src={url}
              alt={`Wedding Gallery ${index + 1}`}
              className="gallery-image"
              loading="lazy"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
