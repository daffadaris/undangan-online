"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";

interface CheckinQrProps {
  code: string;
  pax: number;
}

// The guest's one-time door pass. The QR encodes the admin check-in URL so an
// usher can scan it with the in-app scanner or a phone's normal camera app.
export default function CheckinQr({ code, pax }: CheckinQrProps) {
  const [src, setSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const url = `${window.location.origin}/admin/checkin?code=${encodeURIComponent(code)}`;
    QRCode.toDataURL(url, { width: 480, margin: 1, errorCorrectionLevel: "M" })
      .then((dataUrl) => {
        if (!cancelled) setSrc(dataUrl);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [code]);

  return (
    <div className="checkin-card">
      <p className="checkin-card-title">Kode Masuk Acara</p>
      <p className="checkin-card-hint">Tunjukkan QR ini kepada penerima tamu saat tiba.</p>
      <div className="checkin-qr">
        {src ? <img src={src} alt={`QR check-in ${code}`} /> : <div className="checkin-qr-placeholder" />}
      </div>
      <p className="checkin-code">{code}</p>
      <p className="checkin-pax">Berlaku untuk {pax} orang · sekali pakai</p>
    </div>
  );
}
