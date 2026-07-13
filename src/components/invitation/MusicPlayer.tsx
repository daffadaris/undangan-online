"use client";

import React, { useEffect, useRef, useState } from "react";

interface MusicPlayerProps {
  playTrigger: boolean;
  musicUrl?: string | null;
}

export default function MusicPlayer({ playTrigger, musicUrl }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const defaultMusic = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"; // standard royalty-free instrumental fallback
  const sourceUrl = musicUrl || defaultMusic;

  useEffect(() => {
    // Instantiate audio client-side
    audioRef.current = new Audio(sourceUrl);
    audioRef.current.loop = true;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [sourceUrl]);

  useEffect(() => {
    if (playTrigger && audioRef.current && !isPlaying) {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.warn("Autoplay was blocked by browser. User needs to interact.", err);
        });
    }
  }, [playTrigger]);

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch((err) => {
          console.error(err);
        });
    }
  };

  return (
    <button
      onClick={togglePlay}
      className={`music-player-btn ${isPlaying ? "music-playing" : ""}`}
      title={isPlaying ? "Mute Music" : "Play Music"}
    >
      {isPlaying ? (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--secondary-olive)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      ) : (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="var(--text-light)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="1" y1="1" x2="23" y2="23" />
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" stroke="var(--text-light)" />
          <circle cx="18" cy="16" r="3" stroke="var(--text-light)" />
        </svg>
      )}
    </button>
  );
}
