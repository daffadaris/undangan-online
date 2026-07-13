"use client";

import React, { useState, useEffect } from "react";

interface CountdownTimerProps {
  targetDate: string; // e.g., "2026-08-08"
}

export default function CountdownTimer({ targetDate }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    const calculateTime = () => {
      const difference = +new Date(targetDate) - +new Date();
      let timeLeftTemp = { days: 0, hours: 0, minutes: 0, seconds: 0 };

      if (difference > 0) {
        timeLeftTemp = {
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        };
      }
      setTimeLeft(timeLeftTemp);
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);

    return () => clearInterval(interval);
  }, [targetDate]);

  if (!isClient) {
    return (
      <section className="invitation-section">
        <h2 className="section-title">Menuju Hari Bahagia</h2>
        <div className="countdown-grid">
          <div className="countdown-box"><span className="countdown-val">0</span><span className="countdown-lbl">Hari</span></div>
          <div className="countdown-box"><span className="countdown-val">0</span><span className="countdown-lbl">Jam</span></div>
          <div className="countdown-box"><span className="countdown-val">0</span><span className="countdown-lbl">Menit</span></div>
          <div className="countdown-box"><span className="countdown-val">0</span><span className="countdown-lbl">Detik</span></div>
        </div>
      </section>
    );
  }

  return (
    <section className="invitation-section">
      <h2 className="section-title">Menuju Hari Bahagia</h2>
      <p className="countdown-intro">
        Waktu yang tersisa menuju akad nikah dan resepsi pernikahan kami:
      </p>
      
      <div className="countdown-grid">
        <div className="countdown-box">
          <span className="countdown-val">{timeLeft.days}</span>
          <span className="countdown-lbl">Hari</span>
        </div>
        <div className="countdown-box">
          <span className="countdown-val">{timeLeft.hours}</span>
          <span className="countdown-lbl">Jam</span>
        </div>
        <div className="countdown-box">
          <span className="countdown-val">{timeLeft.minutes}</span>
          <span className="countdown-lbl">Menit</span>
        </div>
        <div className="countdown-box">
          <span className="countdown-val">{timeLeft.seconds}</span>
          <span className="countdown-lbl">Detik</span>
        </div>
      </div>
    </section>
  );
}
