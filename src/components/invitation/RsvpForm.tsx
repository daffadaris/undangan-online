"use client";

import React, { useState, useEffect } from "react";

interface Wish {
  id: string;
  name: string;
  wishes: string | null;
  rsvpStatus: string;
  wishSentAt: string | null;
}

interface RsvpFormProps {
  guestId: string;
  guestName: string;
  guestSlug: string;
  initialRsvpStatus: string;
  initialNumberOfGuests: number;
  initialWishes: string | null;
}

export default function RsvpForm({
  guestId,
  guestName,
  guestSlug,
  initialRsvpStatus,
  initialNumberOfGuests,
  initialWishes,
}: RsvpFormProps) {
  const [rsvpStatus, setRsvpStatus] = useState(initialRsvpStatus);
  const [numberOfGuests, setNumberOfGuests] = useState(initialNumberOfGuests);
  const [wishes, setWishes] = useState(initialWishes || "");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<string | null>(null);
  
  const [wishesList, setWishesList] = useState<Wish[]>([]);
  const [isLoadingWishes, setIsLoadingWishes] = useState(true);

  // Fetch recent wishes
  const fetchWishes = async () => {
    try {
      const res = await fetch("/api/wishes");
      if (res.ok) {
        const data = await res.json();
        setWishesList(data.wishes || []);
      }
    } catch (e) {
      console.error("Failed to load wishes", e);
    } finally {
      setIsLoadingWishes(false);
    }
  };

  useEffect(() => {
    fetchWishes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitMessage(null);

    try {
      const res = await fetch("/api/rsvp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          guestId,
          rsvpStatus,
          numberOfGuests,
          wishes: wishes.trim() || null,
        }),
      });

      if (res.ok) {
        setSubmitMessage("Terima kasih! RSVP dan ucapan Anda telah berhasil dikirim.");
        fetchWishes();
      } else {
        setSubmitMessage("Gagal mengirim RSVP. Silakan coba beberapa saat lagi.");
      }
    } catch (e) {
      console.error(e);
      setSubmitMessage("Terjadi kesalahan. Silakan periksa koneksi Anda.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="invitation-section">
      <h2 className="section-title">Konfirmasi Kehadiran</h2>
      <p className="rsvp-intro">
        Bantu kami mempersiapkan kenyamanan acara dengan mengisi konfirmasi kehadiran di bawah ini:
      </p>

      <div className="rsvp-layout">
        <form onSubmit={handleSubmit} className="form-container">
          <div className="rsvp-guest-card">
            <div className="rsvp-guest-salutation">Kepada Yth. Bapak/Ibu/Saudara/i:</div>
            <div className="rsvp-guest-name">{guestName}</div>
          </div>

          <div className="form-group">
            <label className="form-label">Konfirmasi Kehadiran</label>
            <div className="rsvp-attendance-selector">
              <button
                type="button"
                className={`rsvp-selector-btn ${rsvpStatus === "confirmed" ? "active" : ""}`}
                onClick={() => setRsvpStatus("confirmed")}
              >
                <span className="rsvp-selector-btn-icon">🌸</span>
                <span>Saya Akan Hadir</span>
              </button>
              <button
                type="button"
                className={`rsvp-selector-btn ${rsvpStatus === "declined" ? "active" : ""}`}
                onClick={() => setRsvpStatus("declined")}
              >
                <span className="rsvp-selector-btn-icon">✉️</span>
                <span>Berhalangan Hadir</span>
              </button>
            </div>
          </div>

          {rsvpStatus === "confirmed" && (
            <div className="form-group animate-fade-in">
              <label className="form-label">Jumlah Orang</label>
              <select
                className="form-select"
                value={numberOfGuests}
                onChange={(e) => setNumberOfGuests(Number(e.target.value))}
              >
                <option value="1">1 Orang</option>
                <option value="2">2 Orang</option>
                <option value="3">3 Orang</option>
                <option value="4">4 Orang</option>
                <option value="5">5 Orang</option>
              </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Kirim Ucapan &amp; Doa</label>
            <textarea
              className="rsvp-textarea"
              rows={4}
              value={wishes}
              onChange={(e) => setWishes(e.target.value)}
              placeholder="Tulis ucapan selamat dan doa restu Anda di sini..."
              required
            />
          </div>

          <button type="submit" className="btn-primary form-submit-btn" disabled={isSubmitting}>
            {isSubmitting ? "Mengirim..." : "Kirim Konfirmasi"}
          </button>

          {submitMessage && (
            <p className={`rsvp-submit-msg ${submitMessage.includes("berhasil") ? "success" : "error"}`}>
              {submitMessage}
            </p>
          )}
        </form>

        {/* Wishes/Guestbook list */}
        <div className="wishes-wrapper">
          <h3 className="wishes-section-title">
            Ucapan dari Teman &amp; Keluarga
          </h3>
          
          {isLoadingWishes ? (
            <p className="wishes-empty">Memuat ucapan...</p>
          ) : wishesList.length === 0 ? (
            <p className="wishes-empty">Belum ada ucapan. Jadilah yang pertama memberikan doa!</p>
          ) : (
            <div className="wishes-board">
              {wishesList.map((wish) => (
                <div key={wish.id} className="wish-item">
                  <div className="wish-header">
                    <span className="wish-name">{wish.name}</span>
                  </div>
                  <p className="wish-text">{wish.wishes}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
