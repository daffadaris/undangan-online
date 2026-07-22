import React from "react";
import { FloralCornerTopLeft, FloralCornerBottomRight } from "./FloralDecor";

interface OpeningCoverProps {
  guestName?: string;
  isOpened: boolean;
  onOpen: () => void;
  config: any;
}

export default function OpeningCover({
  guestName = "Tamu Undangan",
  isOpened,
  onOpen,
  config,
}: OpeningCoverProps) {
  return (
    <div className={`cover-container ${isOpened ? "opened" : ""}`}>
      <FloralCornerTopLeft className="cover-decor-top" />
      <FloralCornerBottomRight className="cover-decor-bottom" />

      <div className="animate-fade-in-up cover-inner">
        <p className="cover-subtitle">The Wedding of</p>
        
        <h1 className="cover-title">
          {config?.groomNickname || "Mempelai Pria"} &amp; {config?.brideNickname || "Mempelai Wanita"}
        </h1>
        
        <div className="cover-recipient-card">
          <p className="cover-recipient-title">Kepada Yth. Bapak/Ibu/Saudara/i</p>
          <h2 className="cover-recipient-name">{guestName}</h2>
          <p className="cover-note">
            *Mohon maaf apabila ada kesalahan penulisan nama/gelar
          </p>
        </div>

        <button className="btn-primary animate-float" onClick={onOpen}>
          <svg
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="btn-icon"
          >
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          Buka Undangan
        </button>
      </div>
    </div>
  );
}
