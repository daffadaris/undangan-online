import React from "react";
import { FloralHeaderDecor, SectionCorners } from "./FloralDecor";

interface EventDetailsProps {
  config: any;
}

export default function EventDetails({ config }: EventDetailsProps) {
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
    <section className="invitation-section">
      <SectionCorners />
      <FloralHeaderDecor />
      <h2 className="section-title">Waktu &amp; Tempat Acara</h2>
      <p className="events-intro">
        Dengan memohon rahmat dan ridho Allah SWT, kami bermaksud menyelenggarakan acara pernikahan kami pada:
      </p>

      <div className="events-grid">
        
        {/* Akad Nikah */}
        {config?.showAkad !== false && (
          <div className="event-card">
            <h3 className="event-title">{config?.akadTitle || "Akad Nikah"}</h3>
            
            <div className="event-detail-item">
              <span className="event-label">Hari / Tanggal</span>
              <p className="event-value">{formatDate(config?.akadDate || "2026-08-08")}</p>
            </div>

            <div className="event-detail-item">
              <span className="event-label">Waktu</span>
              <p className="event-value">{config?.akadTime || "08:00 - 10:00 WIB"}</p>
            </div>

            <div className="event-detail-item">
              <span className="event-label">Tempat</span>
              <p className="event-value">{config?.akadVenue || "Masjid Agung Al-Hikmah"}</p>
              <p className="event-address">
                {config?.akadAddress || "Jl. Pemuda No. 12, Jakarta"}
              </p>
            </div>

            {config?.akadMapsUrl && (
              <a
                href={config.akadMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary event-map-btn"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="btn-icon"
                >
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Buka Google Maps
              </a>
            )}
          </div>
        )}

        {/* Resepsi Pernikahan */}
        {config?.showResepsi !== false && (
          <div className="event-card">
            <h3 className="event-title">{config?.resepsiTitle || "Resepsi Pernikahan"}</h3>
            
            <div className="event-detail-item">
              <span className="event-label">Hari / Tanggal</span>
              <p className="event-value">{formatDate(config?.resepsiDate || "2026-08-08")}</p>
            </div>

            <div className="event-detail-item">
              <span className="event-label">Waktu</span>
              <p className="event-value">{config?.resepsiTime || "11:00 - 14:00 WIB"}</p>
            </div>

            <div className="event-detail-item">
              <span className="event-label">Tempat</span>
              <p className="event-value">{config?.resepsiVenue || "Gedung Pertemuan Sasana Kriya"}</p>
              <p className="event-address">
                {config?.resepsiAddress || "Jl. Indah No. 34, Jakarta"}
              </p>
            </div>

            {config?.resepsiMapsUrl && (
              <a
                href={config.resepsiMapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-primary event-map-btn"
              >
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="btn-icon"
                >
                  <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                Buka Google Maps
              </a>
            )}
          </div>
        )}

      </div>
    </section>
  );
}
