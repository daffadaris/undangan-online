"use client";

import React, { useEffect, useState } from "react";

// Mode Privat screenshot deterrents. A web page cannot actually block OS
// screenshots (phones never tell the page), so this does what is possible:
// - desktop only: covers the page when the window loses focus (snipping tools
//   such as Win+Shift+S / macOS Cmd+Shift+4 steal focus) or a screenshot/print
//   shortcut is pressed;
// - blocks text selection, long-press/right-click image saving, and printing.

const SHORTCUT_KEYS = new Set(["3", "4", "5", "s", "S"]);

export default function ScreenshotGuard() {
  const [shielded, setShielded] = useState(false);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const shieldFor = (ms: number) => {
      setShielded(true);
      clearTimeout(timer);
      timer = setTimeout(() => setShielded(false), ms);
    };
    const shield = () => {
      clearTimeout(timer);
      setShielded(true);
    };
    const unshield = () => {
      clearTimeout(timer);
      setShielded(false);
    };

    const onKey = (e: KeyboardEvent) => {
      const isPrintScreen = e.key === "PrintScreen";
      // macOS Cmd+Shift+3/4/5, Windows Win+Shift+S
      const isSnipShortcut = e.shiftKey && e.metaKey && SHORTCUT_KEYS.has(e.key);
      const isPrint = (e.ctrlKey || e.metaKey) && (e.key === "p" || e.key === "P");
      if (isPrint) e.preventDefault();
      if (isPrintScreen || isSnipShortcut || isPrint) {
        shieldFor(3000);
        // PrintScreen copies to the clipboard on Windows — overwrite it.
        if (isPrintScreen) navigator.clipboard?.writeText("").catch(() => {});
      }
    };
    const block = (e: Event) => e.preventDefault();

    // Mobile first: on phones a screenshot never blurs the page, so the focus
    // shield would only fire when the guest switches apps (Maps, WhatsApp) and
    // greet them with a cover on return. Keep it to mouse/keyboard devices.
    const isDesktop = window.matchMedia("(hover: hover) and (pointer: fine)").matches;

    document.body.classList.add("ss-guard");
    if (isDesktop) {
      window.addEventListener("keydown", onKey);
      window.addEventListener("keyup", onKey);
      window.addEventListener("blur", shield);
      window.addEventListener("focus", unshield);
    }
    document.addEventListener("contextmenu", block);
    document.addEventListener("dragstart", block);

    return () => {
      clearTimeout(timer);
      document.body.classList.remove("ss-guard");
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey);
      window.removeEventListener("blur", shield);
      window.removeEventListener("focus", unshield);
      document.removeEventListener("contextmenu", block);
      document.removeEventListener("dragstart", block);
    };
  }, []);

  return (
    <>
      {shielded && (
        <div className="ss-shield" onClick={() => setShielded(false)}>
          <p className="ss-shield-title">Undangan Bersifat Pribadi</p>
          <p className="ss-shield-text">Ketuk untuk melanjutkan</p>
        </div>
      )}
    </>
  );
}
