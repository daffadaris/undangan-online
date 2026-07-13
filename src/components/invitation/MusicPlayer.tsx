"use client";

import React, { useEffect, useRef, useState } from "react";

interface MusicPlayerProps {
  playTrigger: boolean;
  musicUrl?: string | null;
}

function getYoutubeId(url: string): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
}

export default function MusicPlayer({ playTrigger, musicUrl }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const ytPlayerRef = useRef<any>(null);
  const [isYtReady, setIsYtReady] = useState(false);

  const defaultMusic = "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3";
  const sourceUrl = musicUrl || defaultMusic;
  const ytId = getYoutubeId(sourceUrl);
  const isYoutube = !!ytId;

  // 1. Handle Standard Audio Element Lifecycle
  useEffect(() => {
    if (isYoutube) {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      return;
    }

    audioRef.current = new Audio(sourceUrl);
    audioRef.current.loop = true;

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, [sourceUrl, isYoutube]);

  // 2. Handle YouTube Player API Lifecycle
  useEffect(() => {
    if (!isYoutube || !ytId) {
      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch (e) {
          // ignore
        }
        ytPlayerRef.current = null;
        setIsYtReady(false);
      }
      return;
    }

    const initPlayer = () => {
      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch (e) {
          // ignore
        }
      }

      ytPlayerRef.current = new (window as any).YT.Player("youtube-audio-player", {
        videoId: ytId,
        playerVars: {
          autoplay: 0,
          loop: 1,
          playlist: ytId, // Required for looping single videos
          controls: 0,
          showinfo: 0,
          rel: 0,
          enablejsapi: 1,
          mute: 0,
        },
        events: {
          onReady: () => {
            setIsYtReady(true);
            if (playTrigger) {
              ytPlayerRef.current.playVideo();
              setIsPlaying(true);
            }
          },
          onStateChange: (event: any) => {
            if (event.data === 1) {
              setIsPlaying(true);
            } else if (event.data === 2) {
              setIsPlaying(false);
            } else if (event.data === 0) {
              ytPlayerRef.current.playVideo();
            }
          },
        },
      });
    };

    if ((window as any).YT && (window as any).YT.Player) {
      initPlayer();
    } else {
      if (!document.getElementById("youtube-iframe-api-script")) {
        const tag = document.createElement("script");
        tag.id = "youtube-iframe-api-script";
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName("script")[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }

      const previousCallback = (window as any).onYouTubeIframeAPIReady;
      (window as any).onYouTubeIframeAPIReady = () => {
        if (previousCallback) previousCallback();
        initPlayer();
      };
    }

    return () => {
      // Keep references clean but defer full cleanup to component destroy to avoid sync issues
    };
  }, [ytId, isYoutube]);

  // 3. Handle Play Trigger (When Buka Undangan is clicked)
  useEffect(() => {
    if (!playTrigger) return;

    if (isYoutube) {
      if (ytPlayerRef.current && isYtReady) {
        ytPlayerRef.current.playVideo();
        setIsPlaying(true);
      }
    } else {
      if (audioRef.current && !isPlaying) {
        audioRef.current
          .play()
          .then(() => {
            setIsPlaying(true);
          })
          .catch((err) => {
            console.warn("Autoplay was blocked by browser. User needs to interact.", err);
          });
      }
    }
  }, [playTrigger, isYtReady, isYoutube]);

  // 4. Handle Mute/Play Toggle
  const togglePlay = () => {
    if (isYoutube) {
      if (!ytPlayerRef.current || !isYtReady) return;
      if (isPlaying) {
        ytPlayerRef.current.pauseVideo();
        setIsPlaying(false);
      } else {
        ytPlayerRef.current.playVideo();
        setIsPlaying(true);
      }
    } else {
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
    }
  };

  return (
    <>
      {/* Offscreen YouTube Iframe Container */}
      {isYoutube && (
        <div
          style={{
            position: "fixed",
            top: "-9999px",
            left: "-9999px",
            width: "1px",
            height: "1px",
            opacity: 0,
            pointerEvents: "none",
          }}
        >
          <div id="youtube-audio-player"></div>
        </div>
      )}

      {/* Control Button */}
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
    </>
  );
}
