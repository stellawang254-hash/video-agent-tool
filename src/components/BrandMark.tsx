import React from "react";
import { fadeEnter } from "../styles/theme";
import { BASE } from "../styles/theme";

interface BrandMarkProps {
  local: number;
  /** Brand text to display, defaults to empty */
  label?: string;
}

/** Small brand watermark — bottom right corner */
export const BrandMark: React.FC<BrandMarkProps> = ({ local, label }) => {
  if (!label) return null;
  return (
    <div
      style={{
        ...fadeEnter(local, 0),
        position: "absolute",
        bottom: 24,
        right: 32,
        fontSize: 16,
        fontWeight: 500,
        color: BASE.subtext,
        letterSpacing: 1,
        opacity: 0.4,
        zIndex: 40,
      }}
    >
      {label}
    </div>
  );
};
