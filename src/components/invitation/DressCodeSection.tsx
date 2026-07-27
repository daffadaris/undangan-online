import React from "react";
import { FloralHeaderDecor, SectionCorners } from "./FloralDecor";

interface DressCodeSectionProps {
  config: any;
}

export default function DressCodeSection({ config }: DressCodeSectionProps) {
  const title = config?.dressCodeTitle || "Panduan Busana / Dress Code";
  const description =
    config?.dressCodeDescription ||
    "Tanpa mengurangi rasa hormat, kami memohon Bapak/Ibu/Saudara/i untuk berkenan mengenakan busana bertema warna berikut:";

  let colors: string[] = ["#A8BBA0", "#FFF8DC", "#C9A96E", "#2F362E"];
  try {
    if (config?.dressCodeColors) {
      const parsed = JSON.parse(config.dressCodeColors);
      if (Array.isArray(parsed) && parsed.length > 0) {
        colors = parsed;
      }
    }
  } catch (e) {
    // fallback
  }

  return (
    <section className="invitation-section">
      <SectionCorners />
      <FloralHeaderDecor />
      <h2 className="section-title">{title}</h2>
      <p className="dresscode-intro">{description}</p>

      <div className="dresscode-swatches-wrapper">
        <div className="dresscode-swatches">
          {colors.map((color, idx) => (
            <div key={idx} className="swatch-item">
              <div
                className="swatch-circle"
                style={{ backgroundColor: color }}
                title={color}
              />
              <span className="swatch-hex">{color}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
