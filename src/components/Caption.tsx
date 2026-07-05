import React from "react";
import { FONT_FAMILY, splitSubtitle } from "../styles/theme";

interface CaptionProps {
  /** The subtitle text to display */
  text?: string;
  /** Optional fade opacity override (0-1) */
  opacity?: number;
}

/**
 * Burn-in subtitle overlay.
 * Positioned in safe zone (bottom ~1/4 of 1920px canvas).
 * Max 2 lines, ~14 Chinese chars per line.
 * White text + black pill for readability.
 */
export const Caption: React.FC<CaptionProps> = ({ text, opacity = 1 }) => {
  if (!text) return null;

  const lines = splitSubtitle(text, 14);

  return (
    <div
      style={{
        position: "absolute",
        bottom: 160,
        left: "50%",
        transform: "translateX(-50%)",
        opacity,
        zIndex: 50,
        pointerEvents: "none",
      }}
    >
      <div
        style={{
          background: "rgba(0,0,0,0.65)",
          borderRadius: 14,
          padding: "18px 40px",
          maxWidth: 920,
          color: "#ffffff",
          fontSize: 36,
          fontWeight: 600,
          fontFamily: FONT_FAMILY,
          textAlign: "center",
          lineHeight: 1.5,
          textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
          letterSpacing: 1,
        }}
      >
        {lines.map((line, i) => (
          <div key={i}>{line}</div>
        ))}
      </div>
    </div>
  );
};
