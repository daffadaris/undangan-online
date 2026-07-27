"use client";

import React from "react";
import { FloralHeaderDecor, SectionCorners } from "./FloralDecor";

interface EventDetailsProps {
  config: any;
}

function formatGoogleCalendarDate(dateStr?: string, timeStr?: string): { startIso: string; endIso: string } {
  if (!dateStr) return { startIso: "", endIso: "" };
  const cleanDate = dateStr.replace(/-/g, "");

  let startHour = "080000";
  let endHour = "110000";

  if (timeStr) {
    const times = timeStr.match(/(\d{1,2})[:.](\d{2})/g);
    if (times && times.length > 0) {
      const [h1, m1] = times[0].split(/[:.]/);
      startHour = `${h1.padStart(2, "0")}${m1}00`;

      if (times.length > 1) {
        const [h2, m2] = times[1].split(/[:.]/);
        endHour = `${h2.padStart(2, "0")}${m2}00`;
      } else {
        const endH = (parseInt(h1, 10) + 2).toString().padStart(2, "0");
        endHour = `${endH}${m1}00`;
      }
    }
  }

  return {
    startIso: `${cleanDate}T${startHour}`,
    endIso: `${cleanDate}T${endHour}`,
  };
}

function getGoogleCalendarUrl(
  title: string,
  dateStr?: string,
  timeStr?: string,
  venue?: string,
  address?: string
): string {
  const { startIso, endIso } = formatGoogleCalendarDate(dateStr, timeStr);
  const location = [venue, address].filter(Boolean).join(", ");
  const details = `Undangan Pernikahan - ${title}`;

  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    title
  )}&dates=${startIso}/${endIso}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
}

function downloadICalFile(
  title: string,
  dateStr?: string,
  timeStr?: string,
  venue?: string,
  address?: string
) {
  const { startIso, endIso } = formatGoogleCalendarDate(dateStr, timeStr);
  const location = [venue, address].filter(Boolean).join(", ");

  const icsContent = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Undangan Online//ID",
    "BEGIN:VEVENT",
    `SUMMARY:${title}`,
    `DESCRIPTION:Undangan Pernikahan - ${title}`,
    `LOCATION:${location}`,
    `DTSTART:${startIso}`,
    `DTEND:${endIso}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");

  const blob = new Blob([icsContent], { type: "text/calendar;charset=utf-8" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${title.toLowerCase().replace(/\s+/g, "-")}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
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
    const dateObj = new Date(dateStr.includes("T") ? dateStr : `${dateStr}T00:00:00`);
    return isNaN(dateObj.getTime()) ? "" : dateObj.toLocaleDateString("id-ID", options);
  };

  const akadTitle = config?.akadTitle || "Akad Nikah";
  const akadDate = config?.akadDate || "2026-08-08";
  const akadTime = config?.akadTime || "08:00 - 10:00 WIB";
  const akadVenue = config?.akadVenue || "Masjid Agung Al-Hikmah";
  const akadAddress = config?.akadAddress || "Jl. Pemuda No. 12, Jakarta";

  const resepsiTitle = config?.resepsiTitle || "Resepsi Pernikahan";
  const resepsiDate = config?.resepsiDate || "2026-08-08";
  const resepsiTime = config?.resepsiTime || "11:00 - 14:00 WIB";
  const resepsiVenue = config?.resepsiVenue || "Gedung Pertemuan Sasana Kriya";
  const resepsiAddress = config?.resepsiAddress || "Jl. Indah No. 34, Jakarta";

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
            <h3 className="event-title">{akadTitle}</h3>
            
            <div className="event-detail-item">
              <span className="event-label">Hari / Tanggal</span>
              <p className="event-value">{formatDate(akadDate)}</p>
            </div>

            <div className="event-detail-item">
              <span className="event-label">Waktu</span>
              <p className="event-value">{akadTime}</p>
            </div>

            <div className="event-detail-item">
              <span className="event-label">Tempat</span>
              <p className="event-value">{akadVenue}</p>
              <p className="event-address">{akadAddress}</p>
            </div>

            <div className="event-action-buttons">
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
                  Google Maps
                </a>
              )}

              <a
                href={getGoogleCalendarUrl(akadTitle, akadDate, akadTime, akadVenue, akadAddress)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary calendar-btn"
                title="Simpan ke Google Calendar"
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
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Google Calendar
              </a>

              <button
                type="button"
                onClick={() => downloadICalFile(akadTitle, akadDate, akadTime, akadVenue, akadAddress)}
                className="btn-secondary calendar-btn"
                title="Unduh berkas iCal (.ics)"
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
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                iCal (.ics)
              </button>
            </div>
          </div>
        )}

        {/* Resepsi Pernikahan */}
        {config?.showResepsi !== false && (
          <div className="event-card">
            <h3 className="event-title">{resepsiTitle}</h3>
            
            <div className="event-detail-item">
              <span className="event-label">Hari / Tanggal</span>
              <p className="event-value">{formatDate(resepsiDate)}</p>
            </div>

            <div className="event-detail-item">
              <span className="event-label">Waktu</span>
              <p className="event-value">{resepsiTime}</p>
            </div>

            <div className="event-detail-item">
              <span className="event-label">Tempat</span>
              <p className="event-value">{resepsiVenue}</p>
              <p className="event-address">{resepsiAddress}</p>
            </div>

            <div className="event-action-buttons">
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
                  Google Maps
                </a>
              )}

              <a
                href={getGoogleCalendarUrl(resepsiTitle, resepsiDate, resepsiTime, resepsiVenue, resepsiAddress)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary calendar-btn"
                title="Simpan ke Google Calendar"
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
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Google Calendar
              </a>

              <button
                type="button"
                onClick={() => downloadICalFile(resepsiTitle, resepsiDate, resepsiTime, resepsiVenue, resepsiAddress)}
                className="btn-secondary calendar-btn"
                title="Unduh berkas iCal (.ics)"
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
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                iCal (.ics)
              </button>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
