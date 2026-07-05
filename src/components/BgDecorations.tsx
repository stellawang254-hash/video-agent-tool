import React from "react";
import { BASE } from "../styles/theme";
import type { StyleTheme } from "../styles/theme";

/**
 * Decorative solid background with subtle line pattern.
 * - Solid dark base (#0a0a1a)
 * - Subgrid dot texture for depth
 * - Style-adaptive accent-color horizontal lines
 */
export const SolidBackground: React.FC<{ theme: StyleTheme }> = ({ theme }) => (
  <div style={{ position: "absolute", inset: 0 }}>
    {/* Base solid color */}
    <div style={{ position: "absolute", inset: 0, background: BASE.bg }} />

    {/* Subtle dot grid texture */}
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundImage: `radial-gradient(circle, rgba(255,255,255,0.025) 1px, transparent 1px)`,
        backgroundSize: "48px 48px",
      }}
    />

    {/* Decorative accent line — top quadrant */}
    <div
      style={{
        position: "absolute",
        top: "18%",
        left: 0,
        width: "30%",
        height: 1,
        background: `linear-gradient(90deg, ${theme.accent}, transparent)`,
        opacity: 0.3,
      }}
    />

    {/* Decorative accent line — bottom quadrant */}
    <div
      style={{
        position: "absolute",
        bottom: "20%",
        right: 0,
        width: "35%",
        height: 1,
        background: `linear-gradient(270deg, ${theme.accent}, transparent)`,
        opacity: 0.2,
      }}
    />

    {/* Subtle vertical accent mark — right side */}
    <div
      style={{
        position: "absolute",
        top: "14%",
        right: "8%",
        width: 1,
        height: "10%",
        background: `linear-gradient(180deg, ${theme.accent}, transparent)`,
        opacity: 0.18,
      }}
    />

    {/* Subtle horizontal mark — upper section framing */}
    <div
      style={{
        position: "absolute",
        top: "30%",
        left: "8%",
        width: "12%",
        height: 1,
        background: `linear-gradient(90deg, ${theme.accent}, transparent)`,
        opacity: 0.15,
      }}
    />
  </div>
);
