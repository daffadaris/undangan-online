"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import jsQR from "jsqr";
import "@/styles/admin.css";

// Door check-in for "Check-in QR". Built for the usher's phone: camera
// scanner first (jsQR decodes frames in JS, so it also works on iOS Safari,
// which lacks BarcodeDetector), manual code entry as a fallback. Opening
// /admin/checkin?code=… from a phone's normal camera app checks in directly.

interface CheckinGuest {
  id: string;
  name: string;
  group: string | null;
  rsvpStatus: string;
  numberOfGuests: number;
  checkedInAt: string | null;
  checkedInCount: number;
}

interface Result {
  status: "ok" | "already" | "not_found" | "error";
  code: string;
  message: string;
  guest?: CheckinGuest;
}

interface Stats {
  confirmedGuests: number;
  confirmedPax: number;
  arrivedGuests: number;
  arrivedPax: number;
}

// A scanned QR holds the check-in URL; a typed code is the bare 8 chars.
function extractCode(text: string): string {
  try {
    const code = new URL(text).searchParams.get("code");
    if (code) return code.trim().toUpperCase();
  } catch {}
  return text.trim().toUpperCase();
}

function fmtTime(iso: string | null) {
  if (!iso) return "";
  return new Date(iso).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" });
}

export default function AdminCheckinPage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);
  const busyRef = useRef(false);

  const [stats, setStats] = useState<Stats | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [cameraOn, setCameraOn] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [manualCode, setManualCode] = useState("");
  const [busy, setBusy] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      const res = await fetch("/api/checkin");
      if (res.ok) setStats(await res.json());
    } catch {}
  }, []);

  const stopCamera = useCallback(() => {
    if (frameRef.current) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraOn(false);
  }, []);

  const checkIn = useCallback(
    async (rawCode: string) => {
      const code = extractCode(rawCode);
      if (!code || busyRef.current) return;
      busyRef.current = true;
      setBusy(true);
      stopCamera();
      try {
        const res = await fetch("/api/checkin", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ code }),
        });
        const data = await res.json().catch(() => ({}));
        let next: Result;
        if (res.ok) next = { status: "ok", code, message: "Silakan masuk", guest: data.guest };
        else if (res.status === 409) next = { status: "already", code, message: "Sudah check-in", guest: data.guest };
        else if (res.status === 404) next = { status: "not_found", code, message: "Kode tidak ditemukan" };
        else next = { status: "error", code, message: data.error || "Gagal check-in" };
        setResult(next);
        navigator.vibrate?.(next.status === "ok" ? 120 : [80, 60, 80]);
        loadStats();
      } catch {
        setResult({ status: "error", code, message: "Tidak ada koneksi" });
      } finally {
        busyRef.current = false;
        setBusy(false);
      }
    },
    [loadStats, stopCamera]
  );

  const startCamera = useCallback(async () => {
    setCameraError(null);
    setResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraOn(true);
      frameRef.current = requestAnimationFrame(scanFrame);
    } catch {
      setCameraError("Kamera tidak bisa dibuka. Izinkan akses kamera, atau ketik kode di bawah.");
    }

    function scanFrame() {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || !streamRef.current) return;
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        // Downscale: phones' 1080p+ frames are slow to decode and don't help.
        const scale = Math.min(1, 640 / video.videoWidth);
        const w = Math.round(video.videoWidth * scale);
        const h = Math.round(video.videoHeight * scale);
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (ctx) {
          ctx.drawImage(video, 0, 0, w, h);
          const found = jsQR(ctx.getImageData(0, 0, w, h).data, w, h, { inversionAttempts: "dontInvert" });
          if (found?.data) {
            checkIn(found.data);
            return;
          }
        }
      }
      frameRef.current = requestAnimationFrame(scanFrame);
    }
  }, [checkIn]);

  const undo = async () => {
    if (!result?.code) return;
    if (!confirm(`Batalkan check-in ${result.guest?.name || result.code}?`)) return;
    const res = await fetch("/api/checkin", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: result.code }),
    });
    if (res.ok) {
      setResult(null);
      loadStats();
    }
  };

  useEffect(() => {
    // Opened from a phone camera app: /admin/checkin?code=XXXXXXXX
    const code = new URLSearchParams(window.location.search).get("code");
    if (code) window.history.replaceState(null, "", "/admin/checkin");
    // Async so no state is set synchronously inside the effect.
    Promise.resolve().then(() => (code ? checkIn(code) : loadStats()));
    return stopCamera;
  }, [loadStats, checkIn, stopCamera]);

  const submitManual = (e: React.FormEvent) => {
    e.preventDefault();
    checkIn(manualCode);
    setManualCode("");
  };

  return (
    <div className="checkin-page">
      <div className="admin-header">
        <h1 className="admin-title">Check-in Tamu</h1>
      </div>

      {stats && (
        <div className="checkin-stats">
          <div className="checkin-stat">
            <span className="checkin-stat-value">
              {stats.arrivedPax}
              <small>/{stats.confirmedPax}</small>
            </span>
            <span className="checkin-stat-label">Orang hadir</span>
          </div>
          <div className="checkin-stat">
            <span className="checkin-stat-value">
              {stats.arrivedGuests}
              <small>/{stats.confirmedGuests}</small>
            </span>
            <span className="checkin-stat-label">Undangan check-in</span>
          </div>
        </div>
      )}

      {result && (
        <div className={`checkin-result checkin-result-${result.status}`}>
          <p className="checkin-result-status">{result.message}</p>
          {result.guest ? (
            <>
              <p className="checkin-result-name">{result.guest.name}</p>
              <p className="checkin-result-meta">
                {Math.max(1, result.guest.checkedInCount || result.guest.numberOfGuests)} orang
                {result.guest.group ? ` · ${result.guest.group}` : ""}
                {result.status === "already" && result.guest.checkedInAt
                  ? ` · masuk ${fmtTime(result.guest.checkedInAt)}`
                  : ""}
              </p>
              {result.guest.rsvpStatus !== "confirmed" && (
                <p className="checkin-result-warn">Status RSVP tamu ini bukan &quot;Hadir&quot;.</p>
              )}
            </>
          ) : (
            <p className="checkin-result-meta">Kode {result.code}</p>
          )}
          <div className="checkin-actions">
            <button type="button" className="admin-btn checkin-big-btn" onClick={startCamera}>
              Scan berikutnya
            </button>
            {(result.status === "ok" || result.status === "already") && (
              <button type="button" className="admin-btn-outline checkin-big-btn" onClick={undo}>
                Batalkan check-in
              </button>
            )}
          </div>
        </div>
      )}

      {/* Stays mounted (just hidden) so the <video> exists when the camera restarts */}
      <div className="checkin-scanner" hidden={!!result}>
        <video ref={videoRef} className={`checkin-video ${cameraOn ? "" : "checkin-video-off"}`} playsInline muted />
        {!cameraOn && (
          <button type="button" className="admin-btn checkin-big-btn" onClick={startCamera} disabled={busy}>
            {busy ? "Memeriksa..." : "Buka Kamera & Scan QR"}
          </button>
        )}
        {cameraOn && <p className="admin-card-hint">Arahkan kamera ke QR tamu</p>}
        {cameraError && <p className="checkin-camera-error">{cameraError}</p>}
      </div>
      <canvas ref={canvasRef} hidden />

      <form className="checkin-manual" onSubmit={submitManual}>
        <label className="admin-input-label" htmlFor="checkin-code">
          Atau ketik kode
        </label>
        <div className="checkin-manual-row">
          <input
            id="checkin-code"
            className="admin-input"
            value={manualCode}
            onChange={(e) => setManualCode(e.target.value)}
            placeholder="Contoh: 3FA9C21B"
            autoCapitalize="characters"
            autoComplete="off"
            maxLength={8}
          />
          <button type="submit" className="admin-btn" disabled={busy || !manualCode.trim()}>
            Cek
          </button>
        </div>
      </form>
    </div>
  );
}
