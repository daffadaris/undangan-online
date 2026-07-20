"use client";

import React from "react";

interface RsvpFloatingButtonProps {
  /** Whether the button should be visible */
  visible: boolean;
}

export default function RsvpFloatingButton({ visible }: RsvpFloatingButtonProps) {
  if (!visible) return null;

  const handleClick = () => {
    const rsvpSection = document.getElementById("rsvp-section");
    if (rsvpSection) {
      rsvpSection.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <button
      className="rsvp-floating-btn animate-fade-in-up"
      onClick={handleClick}
      aria-label="Konfirmasi Kehadiran"
    >
      <svg
        width="18"
        height="18"
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
    </button>
  );
}
