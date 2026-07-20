"use client";

import React, { useEffect, useRef } from "react";

interface RsvpFloatingPillProps {
  visible: boolean;
}

export default function RsvpFloatingPill({ visible }: RsvpFloatingPillProps) {
  const pillRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!visible) return;

    // Pulse animation on first appearance, then stop
    const el = pillRef.current;
    if (!el) return;

    el.classList.add("rsvp-pill-enter");
    const timer = setTimeout(() => {
      el.classList.remove("rsvp-pill-enter");
    }, 2500);

    return () => clearTimeout(timer);
  }, [visible]);

  if (!visible) return null;

  const handleClick = () => {
    const rsvpSection = document.getElementById("rsvp-section");
    if (rsvpSection) {
      rsvpSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <button
      ref={pillRef}
      className="rsvp-floating-pill"
      onClick={handleClick}
      aria-label="Konfirmasi Kehadiran"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M9 12l2 2 4-4" />
        <rect x="3" y="3" width="18" height="18" rx="3" />
      </svg>
      <span>Konfirmasi Kehadiran</span>
      <svg
        width="12"
        height="12"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="pill-arrow"
      >
        <path d="M5 12h14M12 5l7 7-7 7" />
      </svg>
    </button>
  );
}
