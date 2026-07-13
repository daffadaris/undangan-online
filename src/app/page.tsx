import React from "react";
import Link from "next/link";
import { FloralDivider, FloralHeaderDecor } from "@/components/invitation/FloralDecor";
import "@/styles/invitation.css";

export default function HomePage() {
  return (
    <div className="invitation-body flex-center" style={{ minHeight: "100vh", padding: "24px" }}>
      <div style={{
        maxWidth: "600px",
        width: "100%",
        background: "rgba(255, 255, 255, 0.7)",
        borderRadius: "var(--radius-md)",
        padding: "50px 30px",
        boxShadow: "var(--shadow-lg)",
        border: "1px solid var(--border-color)",
        backdropFilter: "blur(10px)",
        textAlign: "center"
      }}>
        <FloralHeaderDecor />
        <p className="cover-subtitle" style={{ fontSize: "0.85rem" }}>The Wedding Celebration Of</p>
        
        <h1 style={{
          fontFamily: "var(--font-serif)",
          fontSize: "3rem",
          color: "var(--secondary-olive)",
          margin: "15px 0"
        }}>
          Daffa &amp; Regina
        </h1>
        
        <FloralDivider />
        
        <p style={{ color: "var(--text-medium)", fontSize: "0.95rem", lineHeight: "1.7", marginBottom: "35px" }}>
          Selamat datang di halaman resmi pernikahan Daffa' Daris Mahendra Ansori &amp; Regina Pingkan Sayyidhina Arif.<br />
          Silakan akses tautan undangan pribadi Anda untuk melihat informasi detail acara dan konfirmasi kehadiran.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
          <Link href="/admin" className="btn-outline" style={{ fontSize: "0.8rem", padding: "10px 24px" }}>
            Buka Halaman Admin
          </Link>
        </div>
      </div>
    </div>
  );
}
