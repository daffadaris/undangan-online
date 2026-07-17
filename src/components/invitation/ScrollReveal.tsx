"use client";

import React, { useEffect, useRef, useState } from "react";

type AnimationType = "fade-up" | "fade-left" | "fade-right" | "zoom-in" | "blur-in";

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  delay?: number;
  animation?: AnimationType;
}

const ANIMATION_CLASS_MAP: Record<AnimationType, string> = {
  "fade-up": "reveal-item",
  "fade-left": "reveal-fade-left",
  "fade-right": "reveal-fade-right",
  "zoom-in": "reveal-zoom-in",
  "blur-in": "reveal-blur-in",
};

export default function ScrollReveal({
  children,
  className = "",
  delay = 0,
  animation = "fade-up",
}: ScrollRevealProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsRevealed(true);
          observer.unobserve(entry.target);
        }
      },
      {
        threshold: 0.15,
        rootMargin: "0px 0px -50px 0px",
      }
    );

    const currentElement = elementRef.current;
    if (currentElement) {
      observer.observe(currentElement);
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement);
      }
    };
  }, []);

  const baseClass = ANIMATION_CLASS_MAP[animation];

  return (
    <div
      ref={elementRef}
      className={`${baseClass} ${isRevealed ? "revealed" : ""} ${className}`}
      style={{
        transitionDelay: `${delay}ms`,
        width: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      {children}
    </div>
  );
}
