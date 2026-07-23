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

export const FloralCornerTopRight = ({ className = "" }: { className?: string }) => (
  <svg
    width="150"
    height="150"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ opacity: 0.15, pointerEvents: "none", transform: "scaleX(-1)" }}
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

export const FloralCornerBottomLeft = ({ className = "" }: { className?: string }) => (
  <svg
    width="150"
    height="150"
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ opacity: 0.15, pointerEvents: "none", transform: "scaleX(-1) rotate(180deg)" }}
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
  <div className={`flex-center floral-divider ${className}`} style={{ gap: "12px", margin: "20px 0" }}>
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
    className={`floral-header-decor ${className}`}
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

/* Elegant vine swirl ornament for between sections */
export const FloralSwirl = ({ className = "" }: { className?: string }) => (
  <div className={`floral-swirl ${className}`} style={{ margin: "10px 0", display: "flex", justifyContent: "center" }}>
    <svg
      width="200"
      height="40"
      viewBox="0 0 200 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ opacity: 0.35 }}
    >
      {/* Left vine */}
      <path
        d="M10 20C30 20 40 8 55 8C65 8 70 15 65 22C60 29 50 25 48 18C46 11 55 5 70 10"
        stroke="var(--primary-sage)"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* Left small leaves */}
      <path d="M30 18C32 12 38 10 36 16" fill="var(--primary-sage)" opacity="0.6" />
      <path d="M45 10C48 6 52 8 48 12" fill="var(--secondary-olive)" opacity="0.5" />

      {/* Center ornament */}
      <circle cx="100" cy="20" r="5" fill="var(--accent-gold)" opacity="0.6" />
      <circle cx="100" cy="20" r="8" stroke="var(--accent-gold)" strokeWidth="0.8" fill="none" opacity="0.4" />
      <path d="M88 20C92 14 96 12 100 15" stroke="var(--primary-sage)" strokeWidth="1" fill="none" opacity="0.5" />
      <path d="M112 20C108 14 104 12 100 15" stroke="var(--primary-sage)" strokeWidth="1" fill="none" opacity="0.5" />

      {/* Right vine (mirrored) */}
      <path
        d="M190 20C170 20 160 8 145 8C135 8 130 15 135 22C140 29 150 25 152 18C154 11 145 5 130 10"
        stroke="var(--primary-sage)"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
      {/* Right small leaves */}
      <path d="M170 18C168 12 162 10 164 16" fill="var(--primary-sage)" opacity="0.6" />
      <path d="M155 10C152 6 148 8 152 12" fill="var(--secondary-olive)" opacity="0.5" />
    </svg>
  </div>
);

/* Ornate gold separator with leaf motifs */
export const GoldSeparator = ({ className = "" }: { className?: string }) => (
  <div className={`gold-separator ${className}`} style={{ margin: "30px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
    <svg width="80" height="12" viewBox="0 0 80 12" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.5 }}>
      <line x1="0" y1="6" x2="25" y2="6" stroke="var(--accent-gold)" strokeWidth="1" />
      <path d="M28 6C32 2 38 2 42 6C38 10 32 10 28 6Z" fill="var(--accent-gold)" opacity="0.6" />
      <line x1="45" y1="6" x2="60" y2="6" stroke="var(--accent-gold)" strokeWidth="1" />
      <circle cx="65" cy="6" r="2" fill="var(--accent-gold)" opacity="0.4" />
      <line x1="70" y1="6" x2="80" y2="6" stroke="var(--accent-gold)" strokeWidth="0.5" />
    </svg>
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 0L10 6L16 8L10 10L8 16L6 10L0 8L6 6Z" fill="var(--accent-gold)" opacity="0.5" />
    </svg>
    <svg width="80" height="12" viewBox="0 0 80 12" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ opacity: 0.5, transform: "scaleX(-1)" }}>
      <line x1="0" y1="6" x2="25" y2="6" stroke="var(--accent-gold)" strokeWidth="1" />
      <path d="M28 6C32 2 38 2 42 6C38 10 32 10 28 6Z" fill="var(--accent-gold)" opacity="0.6" />
      <line x1="45" y1="6" x2="60" y2="6" stroke="var(--accent-gold)" strokeWidth="1" />
      <circle cx="65" cy="6" r="2" fill="var(--accent-gold)" opacity="0.4" />
      <line x1="70" y1="6" x2="80" y2="6" stroke="var(--accent-gold)" strokeWidth="0.5" />
    </svg>
  </div>
);

/* Floating petals — CSS-animated falling petals (client component) */
export const FloatingPetals = ({ count = 8 }: { count?: number }) => {
  interface Petal {
    id: number;
    left: string;
    delay: string;
    duration: string;
    size: number;
    opacity: number;
    swayDuration: string;
  }

  const [petals, setPetals] = React.useState<Petal[]>([]);

  React.useEffect(() => {
    const generated = Array.from({ length: count }, (_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      delay: `${Math.random() * 8}s`,
      duration: `${8 + Math.random() * 6}s`,
      size: 8 + Math.random() * 10,
      opacity: 0.15 + Math.random() * 0.2,
      swayDuration: `${3 + Math.random() * 4}s`,
    }));
    setPetals(generated);
  }, [count]);

  return (
    <div className="floating-petals-container">
      {petals.map((p) => (
        <div
          key={p.id}
          className="floating-petal"
          style={{
            left: p.left,
            animationDelay: p.delay,
            animationDuration: p.duration,
          }}
        >
          <svg
            width={p.size}
            height={p.size * 1.4}
            viewBox="0 0 10 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="petal-svg"
            style={{
              opacity: p.opacity,
              animationDuration: p.swayDuration,
            }}
          >
            <path
              d="M5 0C5 0 10 4 10 8C10 12 7.5 14 5 14C2.5 14 0 12 0 8C0 4 5 0 5 0Z"
              fill="var(--primary-sage)"
            />
            <path
              d="M5 2C5 2 8 5 8 8C8 10.5 6.5 12 5 12"
              stroke="var(--accent-gold)"
              strokeWidth="0.5"
              opacity="0.5"
              fill="none"
            />
          </svg>
        </div>
      ))}
    </div>
  );
};

/* Section corner frame — positions corners at all 4 edges of a section */
export const SectionCorners = () => (
  <>
    <div className="section-corner section-corner-tl">
      <FloralCornerTopLeft />
    </div>
    <div className="section-corner section-corner-tr">
      <FloralCornerTopRight />
    </div>
    <div className="section-corner section-corner-bl">
      <FloralCornerBottomLeft />
    </div>
    <div className="section-corner section-corner-br">
      <FloralCornerBottomRight />
    </div>
  </>
);

/* Leaf branches extending from the sides of the viewport */
export const SideLeafDecorLeft = ({ className = "" }: { className?: string }) => (
  <div className={`side-leaf-decor side-leaf-left ${className}`}>
    <svg width="80" height="260" viewBox="0 0 80 260" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 -10 Q35 60 15 130 T10 270" stroke="var(--primary-sage)" strokeWidth="1.5" opacity="0.6" fill="none" />
      <path d="M22 30 C35 30 45 40 40 50 C30 50 25 40 22 30 Z" fill="var(--primary-sage)" opacity="0.3" />
      <path d="M18 75 C32 70 40 85 35 95 C25 95 20 85 18 75 Z" fill="var(--primary-sage)" opacity="0.35" />
      <path d="M14 120 C30 115 35 130 30 140 C20 140 15 130 14 120 Z" fill="var(--primary-sage)" opacity="0.3" />
      <path d="M11 170 C25 165 30 180 25 190 C15 190 12 180 11 170 Z" fill="var(--primary-sage)" opacity="0.35" />
      <path d="M10 220 C22 215 25 230 20 240 C12 240 10 230 10 220 Z" fill="var(--primary-sage)" opacity="0.3" />
      <path d="M15 15 C5 15 0 5 5 0 C12 0 15 10 15 15 Z" fill="var(--primary-sage)" opacity="0.25" />
      <path d="M13 55 C3 55 -2 45 3 40 C10 40 13 50 13 55 Z" fill="var(--primary-sage)" opacity="0.2" />
      <path d="M11 100 C1 100 -4 90 1 85 C8 85 11 95 11 100 Z" fill="var(--primary-sage)" opacity="0.25" />
      <path d="M9 145 C-1 145 -6 135 -1 130 C6 130 9 140 9 145 Z" fill="var(--primary-sage)" opacity="0.2" />
    </svg>
  </div>
);

export const SideLeafDecorRight = ({ className = "" }: { className?: string }) => (
  <div className={`side-leaf-decor side-leaf-right ${className}`}>
    <svg width="80" height="260" viewBox="0 0 80 260" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ transform: "scaleX(-1)" }}>
      <path d="M10 -10 Q35 60 15 130 T10 270" stroke="var(--primary-sage)" strokeWidth="1.5" opacity="0.6" fill="none" />
      <path d="M22 30 C35 30 45 40 40 50 C30 50 25 40 22 30 Z" fill="var(--primary-sage)" opacity="0.3" />
      <path d="M18 75 C32 70 40 85 35 95 C25 95 20 85 18 75 Z" fill="var(--primary-sage)" opacity="0.35" />
      <path d="M14 120 C30 115 35 130 30 140 C20 140 15 130 14 120 Z" fill="var(--primary-sage)" opacity="0.3" />
      <path d="M11 170 C25 165 30 180 25 190 C15 190 12 180 11 170 Z" fill="var(--primary-sage)" opacity="0.35" />
      <path d="M10 220 C22 215 25 230 20 240 C12 240 10 230 10 220 Z" fill="var(--primary-sage)" opacity="0.3" />
      <path d="M15 15 C5 15 0 5 5 0 C12 0 15 10 15 15 Z" fill="var(--primary-sage)" opacity="0.25" />
      <path d="M13 55 C3 55 -2 45 3 40 C10 40 13 50 13 55 Z" fill="var(--primary-sage)" opacity="0.2" />
      <path d="M11 100 C1 100 -4 90 1 85 C8 85 11 95 11 100 Z" fill="var(--primary-sage)" opacity="0.25" />
      <path d="M9 145 C-1 145 -6 135 -1 130 C6 130 9 140 9 145 Z" fill="var(--primary-sage)" opacity="0.2" />
    </svg>
  </div>
);

/* Leaf wreath floral frame overlay for couple photos */
export const FloralPhotoFrame = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ pointerEvents: "none" }}
  >
    {/* Wreath circle outlines */}
    <circle cx="50" cy="50" r="46" stroke="var(--primary-sage)" strokeWidth="1" strokeDasharray="3 3" opacity="0.6" />
    <circle cx="50" cy="50" r="43" stroke="var(--accent-gold)" strokeWidth="0.75" opacity="0.4" />
    
    {/* Leaf pairs rotated around the circle */}
    <g transform="rotate(0 50 50)">
      <path d="M50 4 C43 4 38 9 38 16 C43 16 48 11 50 4Z" fill="var(--primary-sage)" opacity="0.55" />
      <path d="M50 4 C57 4 62 9 62 16 C57 16 52 11 50 4Z" fill="var(--primary-sage)" opacity="0.55" />
    </g>
    <g transform="rotate(30 50 50)">
      <path d="M50 4 C45 6 42 12 44 17 C49 15 52 10 50 4Z" fill="var(--secondary-olive)" opacity="0.5" />
    </g>
    <g transform="rotate(60 50 50)">
      <path d="M50 4 C45 6 42 12 44 17 C49 15 52 10 50 4Z" fill="var(--primary-sage)" opacity="0.5" />
    </g>
    <g transform="rotate(90 50 50)">
      <path d="M50 4 C43 4 38 9 38 16 C43 16 48 11 50 4Z" fill="var(--primary-sage)" opacity="0.55" />
      <path d="M50 4 C57 4 62 9 62 16 C57 16 52 11 50 4Z" fill="var(--primary-sage)" opacity="0.55" />
    </g>
    <g transform="rotate(120 50 50)">
      <path d="M50 4 C45 6 42 12 44 17 C49 15 52 10 50 4Z" fill="var(--secondary-olive)" opacity="0.5" />
    </g>
    <g transform="rotate(150 50 50)">
      <path d="M50 4 C45 6 42 12 44 17 C49 15 52 10 50 4Z" fill="var(--primary-sage)" opacity="0.5" />
    </g>
    <g transform="rotate(180 50 50)">
      <path d="M50 4 C43 4 38 9 38 16 C43 16 48 11 50 4Z" fill="var(--primary-sage)" opacity="0.55" />
      <path d="M50 4 C57 4 62 9 62 16 C57 16 52 11 50 4Z" fill="var(--primary-sage)" opacity="0.55" />
    </g>
    <g transform="rotate(210 50 50)">
      <path d="M50 4 C45 6 42 12 44 17 C49 15 52 10 50 4Z" fill="var(--secondary-olive)" opacity="0.5" />
    </g>
    <g transform="rotate(240 50 50)">
      <path d="M50 4 C45 6 42 12 44 17 C49 15 52 10 50 4Z" fill="var(--primary-sage)" opacity="0.5" />
    </g>
    <g transform="rotate(270 50 50)">
      <path d="M50 4 C43 4 38 9 38 16 C43 16 48 11 50 4Z" fill="var(--primary-sage)" opacity="0.55" />
      <path d="M50 4 C57 4 62 9 62 16 C57 16 52 11 50 4Z" fill="var(--primary-sage)" opacity="0.55" />
    </g>
    <g transform="rotate(300 50 50)">
      <path d="M50 4 C45 6 42 12 44 17 C49 15 52 10 50 4Z" fill="var(--secondary-olive)" opacity="0.5" />
    </g>
    <g transform="rotate(330 50 50)">
      <path d="M50 4 C45 6 42 12 44 17 C49 15 52 10 50 4Z" fill="var(--primary-sage)" opacity="0.5" />
    </g>
    
    {/* Small gold berries */}
    <circle cx="50" cy="11" r="2.5" fill="var(--accent-gold)" />
    <circle cx="89" cy="50" r="2.5" fill="var(--accent-gold)" />
    <circle cx="50" cy="89" r="2.5" fill="var(--accent-gold)" />
    <circle cx="11" cy="50" r="2.5" fill="var(--accent-gold)" />
  </svg>
);

/* Elegant floral timeline node replacing plain circles */
export const FloralTimelineNode = ({ className = "" }: { className?: string }) => (
  <svg
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    style={{ pointerEvents: "none" }}
  >
    {/* Outer container leaf shapes */}
    <path
      d="M12 2C12 2 15 5 15 8C15 11 12 12 12 12C12 12 9 11 9 8C9 5 12 2 12 2Z"
      fill="var(--primary-sage)"
      opacity="0.75"
    />
    <path
      d="M12 22C12 22 9 19 9 16C9 13 12 12 12 12C12 12 15 13 15 16C15 19 12 22 12 22Z"
      fill="var(--primary-sage)"
      opacity="0.75"
    />
    <circle cx="12" cy="12" r="6" fill="var(--bg-cream-light)" stroke="var(--accent-gold)" strokeWidth="1.5" />
    <circle cx="12" cy="12" r="3.5" fill="var(--secondary-olive)" />
    <circle cx="12" cy="12" r="1.5" fill="var(--accent-gold)" />
  </svg>
);

