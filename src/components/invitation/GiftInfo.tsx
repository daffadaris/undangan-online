"use client";

import React, { useState } from "react";
import { FloralHeaderDecor, SectionCorners } from "./FloralDecor";

interface GiftItem {
  bankName: string;
  accountName: string;
  accountNumber: string;
}

interface GiftInfoProps {
  config: any;
}

export default function GiftInfo({ config }: GiftInfoProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [showQrisModal, setShowQrisModal] = useState(false);

  let giftItems: GiftItem[] = [];
  try {
    if (config?.giftInfo) {
      giftItems = JSON.parse(config.giftInfo);
    }
  } catch (e) {
    console.error("Failed to parse gift config", e);
  }

  const qrisImage = config?.qrisImage;

  const handleCopy = async (number: string, idx: number) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(number);
        setCopiedIndex(idx);
      } else {
        const textArea = document.createElement("textarea");
        textArea.value = number;
        textArea.style.position = "fixed";
        textArea.style.opacity = "0";
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        const successful = document.execCommand("copy");
        document.body.removeChild(textArea);
        if (successful) {
          setCopiedIndex(idx);
        }
      }
      setTimeout(() => {
        setCopiedIndex(null);
      }, 2000);
    } catch (err) {
      console.error("Gagal menyalin: ", err);
    }
  };

  if (giftItems.length === 0 && !qrisImage) {
    return null;
  }

  return (
    <section className="invitation-section">
      <SectionCorners />
      <FloralHeaderDecor />
      <h2 className="section-title">Kado Digital</h2>
      <p className="gift-intro">
        Doa restu Anda merupakan karunia terindah bagi kami. Namun apabila Anda ingin memberikan tanda kasih secara digital, Anda dapat menyalurkannya melalui QRIS atau rekening berikut:
      </p>

      {/* QRIS Code Section */}
      {qrisImage && (
        <div className="qris-card-wrapper" style={{ marginBottom: "25px", textAlign: "center" }}>
          <div
            className="qris-card"
            onClick={() => setShowQrisModal(true)}
            style={{
              cursor: "pointer",
              display: "inline-block",
              padding: "16px",
              background: "var(--card-bg, #FFFFFF)",
              borderRadius: "16px",
              boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
              border: "1px solid var(--gold-border, rgba(201,169,110,0.3))",
              maxWidth: "280px",
              width: "100%",
            }}
          >
            <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "var(--title-color)", marginBottom: "8px" }}>
              QRIS / E-Wallet Instant
            </div>
            <img
              src={qrisImage}
              alt="QRIS Pembayaran Digital"
              style={{
                width: "100%",
                height: "auto",
                borderRadius: "8px",
                objectFit: "contain",
              }}
            />
            <p style={{ fontSize: "0.75rem", color: "var(--text-color)", marginTop: "8px", opacity: 0.8 }}>
              🔍 Klik untuk memperbesar QRIS
            </p>
          </div>
        </div>
      )}

      {/* Bank Accounts Grid */}
      {giftItems.length > 0 && (
        <div className="gift-grid">
          {giftItems.map((item, idx) => (
            <div key={idx} className="bank-card">
              <div className="bank-card-header">
                <div className="bank-logo">{item.bankName}</div>
                <button
                  onClick={() => handleCopy(item.accountNumber, idx)}
                  className="bank-copy-btn"
                >
                  {copiedIndex === idx ? "Tersalin!" : "Salin"}
                </button>
              </div>
              
              <div className="bank-number">{item.accountNumber}</div>
              <div className="bank-holder">a.n. {item.accountName}</div>
            </div>
          ))}
        </div>
      )}

      {/* QRIS Enlarged Modal */}
      {showQrisModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowQrisModal(false)}
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.85)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: "relative",
              maxWidth: "420px",
              width: "100%",
              background: "#FFF",
              borderRadius: "16px",
              padding: "24px",
              textAlign: "center",
            }}
          >
            <button
              onClick={() => setShowQrisModal(false)}
              style={{
                position: "absolute",
                top: "12px",
                right: "16px",
                background: "none",
                border: "none",
                fontSize: "1.5rem",
                cursor: "pointer",
                color: "#666",
              }}
            >
              &times;
            </button>
            <h3 style={{ fontSize: "1.1rem", marginBottom: "16px", color: "#333" }}>
              Scan QRIS Pembayaran
            </h3>
            <img
              src={qrisImage}
              alt="QRIS Large"
              style={{ width: "100%", borderRadius: "12px" }}
            />
            <p style={{ fontSize: "0.8rem", color: "#666", marginTop: "12px" }}>
              Mendukung ShopeePay, GoPay, OVO, DANA, LinkAja, &amp; Mobile Banking.
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
