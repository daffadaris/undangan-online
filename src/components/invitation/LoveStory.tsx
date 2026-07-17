import React from "react";
import { FloralHeaderDecor, SectionCorners, FloralTimelineNode } from "./FloralDecor";

interface StoryItem {
  year: string;
  title: string;
  description: string;
}

interface LoveStoryProps {
  config: any;
}

export default function LoveStory({ config }: LoveStoryProps) {
  let storyItems: StoryItem[] = [];
  try {
    if (config?.loveStory) {
      storyItems = JSON.parse(config.loveStory);
    }
  } catch (e) {
    console.error("Failed to parse love story config", e);
  }

  if (storyItems.length === 0) {
    storyItems = [
      {
        year: "2020",
        title: "Awal Pertemuan",
        description: "Kami pertama kali diperkenalkan melalui seorang teman dekat di lingkungan kampus.",
      },
      {
        year: "2022",
        title: "Menjalin Komitmen",
        description: "Merasa memiliki banyak kecocokan, kami berkomitmen untuk melangkah bersama.",
      },
      {
        year: "2025",
        title: "Pertunangan Resmi",
        description: "Di hadapan keluarga besar kedua belah pihak, kami melangsungkan lamaran.",
      },
    ];
  }

  return (
    <section className="invitation-section">
      <SectionCorners />
      <FloralHeaderDecor />
      <h2 className="section-title">Kisah Cinta Kami</h2>
      <p className="timeline-intro">
        Bagaimana awal mula perjalanan cinta kami hingga sampai di titik ini.
      </p>

      <div className="timeline">
        {storyItems.map((item, idx) => (
          <div
            key={idx}
            className={`timeline-item ${idx % 2 === 0 ? "left-item" : "right-item"}`}
          >
            <FloralTimelineNode className="timeline-flower-node" />
            <div className="timeline-content">
              <span className="timeline-year">{item.year}</span>
              <h3 className="timeline-title">
                {item.title}
              </h3>
              <p className="timeline-desc">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

