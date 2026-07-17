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

  let giftItems: GiftItem[] = [];
  try {
    if (config?.giftInfo) {
      giftItems = JSON.parse(config.giftInfo);
    }
  } catch (e) {
    console.error("Failed to parse gift config", e);
  }

  if (giftItems.length === 0) {
    giftItems = [
      {
        bankName: "Bank BCA",
        accountName: "Daffa' Daris M A",
        accountNumber: "1234567890",
      },
      {
        bankName: "Bank Mandiri",
        accountName: "Regina Pingkan S A",
        accountNumber: "0987654321",
      },
    ];
  }

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

  return (
    <section className="invitation-section">
      <SectionCorners />
      <FloralHeaderDecor />
      <h2 className="section-title">Kado Digital</h2>
      <p className="gift-intro">
        Doa restu Anda merupakan karunia terindah bagi kami. Namun apabila Anda ingin memberikan tanda kasih secara digital, Anda dapat menyalurkannya melalui rekening berikut:
      </p>

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
    </section>
  );
}
