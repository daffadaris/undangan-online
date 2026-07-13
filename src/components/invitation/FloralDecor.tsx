import React from "react";

export const FloralCornerTopLeft = ({ className = "" }: { className?: string }) => (
  <svg
    width="150"
    height="150"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ opacity: 0.15, pointerEvents: "none" }}
  >
    <path
      d="M0 0C30 5 60 25 70 50C75 60 70 75 60 80C50 85 35 75 30 60C20 40 5 20 0 0Z"
      fill="var(--primary-sage)"
    />
    <path
      d="M10 0C25 15 40 35 45 50C48 58 45 68 38 70C31 72 22 65 20 55C15 40 5 20 10 0Z"
      fill="var(--secondary-olive)"
      opacity="0.7"
    />
    <path
      d="M0 10C15 25 30 40 32 55C33 60 30 65 25 66C20 67 15 62 13 55C10 45 2 25 0 10Z"
      fill="var(--accent-gold)"
      opacity="0.5"
    />
    <circle cx="50" cy="20" r="3" fill="var(--accent-gold)" opacity="0.6" />
    <circle cx="25" cy="45" r="2" fill="var(--secondary-olive)" opacity="0.6" />
  </svg>
);

export const FloralCornerBottomRight = ({ className = "" }: { className?: string }) => (
  <svg
    width="150"
    height="150"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ opacity: 0.15, pointerEvents: "none", transform: "rotate(180deg)" }}
  >
    <path
      d="M0 0C30 5 60 25 70 50C75 60 70 75 60 80C50 85 35 75 30 60C20 40 5 20 0 0Z"
      fill="var(--primary-sage)"
    />
    <path
      d="M10 0C25 15 40 35 45 50C48 58 45 68 38 70C31 72 22 65 20 55C15 40 5 20 10 0Z"
      fill="var(--secondary-olive)"
      opacity="0.7"
    />
    <path
      d="M0 10C15 25 30 40 32 55C33 60 30 65 25 66C20 67 15 62 13 55C10 45 2 25 0 10Z"
      fill="var(--accent-gold)"
      opacity="0.5"
    />
    <circle cx="50" cy="20" r="3" fill="var(--accent-gold)" opacity="0.6" />
  </svg>
);

export const FloralDivider = ({ className = "" }: { className?: string }) => (
  <div className={`flex-center ${className}`} style={{ gap: "12px", margin: "20px 0" }}>
    <svg width="60" height="2" viewBox="0 0 60 2" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="0" y1="1" x2="60" y2="1" stroke="var(--primary-sage)" strokeWidth="1" strokeDasharray="3 3" />
    </svg>
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ transform: "rotate(45deg)" }}
    >
      <rect x="6" y="6" width="12" height="12" rx="1" stroke="var(--accent-gold)" strokeWidth="1.5" />
      <circle cx="12" cy="12" r="3" fill="var(--secondary-olive)" />
    </svg>
    <svg width="60" height="2" viewBox="0 0 60 2" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="0" y1="1" x2="60" y2="1" stroke="var(--primary-sage)" strokeWidth="1" strokeDasharray="3 3" />
    </svg>
  </div>
);

export const FloralHeaderDecor = ({ className = "" }: { className?: string }) => (
  <svg
    width="120"
    height="60"
    viewBox="0 0 120 60"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ opacity: 0.8 }}
  >
    <path
      d="M60 45C60 45 45 30 35 30C25 30 20 38 25 45C30 52 45 50 60 45Z"
      fill="var(--primary-sage)"
      opacity="0.6"
    />
    <path
      d="M60 45C60 45 75 30 85 30C95 30 100 38 95 45C90 52 75 50 60 45Z"
      fill="var(--primary-sage)"
      opacity="0.6"
    />
    <path
      d="M60 10C60 10 52 25 45 30C38 35 40 45 48 40C56 35 58 20 60 10Z"
      fill="var(--secondary-olive)"
      opacity="0.8"
    />
    <path
      d="M60 10C60 10 68 25 75 30C82 35 80 45 72 40C64 35 62 20 60 10Z"
      fill="var(--secondary-olive)"
      opacity="0.8"
    />
    <circle cx="60" cy="45" r="4" fill="var(--accent-gold)" />
  </svg>
);
