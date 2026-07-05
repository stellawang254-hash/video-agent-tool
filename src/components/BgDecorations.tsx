import React from "react";
import { BASE } from "../styles/theme";
import type { StyleTheme } from "../styles/theme";

/**
 * Decorative solid background with rich line/pattern textures.
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

    {/* Large decorative ring — top-right quadrant */}
    <div
      style={{
        position: "absolute",
        top: "6%",
        right: "-8%",
        width: "40%",
        paddingBottom: "40%",
        borderRadius: "50%",
        border: "1px solid",
        borderColor: theme.accent,
        opacity: 0.06,
        pointerEvents: "none",
      }}
    />

    {/* Small decorative ring — bottom-left */}
    <div
      style={{
        position: "absolute",
        bottom: "10%",
        left: "-5%",
        width: "20%",
        paddingBottom: "20%",
        borderRadius: "50%",
        border: "1px solid",
        borderColor: theme.accent,
        opacity: 0.05,
        pointerEvents: "none",
      }}
    />

    {/* Accent glow spot — top center */}
    <div
      style={{
        position: "absolute",
        top: "12%",
        left: "50%",
        transform: "translateX(-50%)",
        width: "50%",
        height: 2,
        background: `linear-gradient(90deg, transparent, ${theme.accent}, transparent)`,
        opacity: 0.12,
        pointerEvents: "none",
      }}
    />

    {/* Accent line — top quadrant */}
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

    {/* Accent line — bottom */}
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

    {/* Subtle vertical mark — right side */}
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

    {/* Horizontal mark — upper section */}
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

    {/* Small decorative diamond — right side */}
    <div
      style={{
        position: "absolute",
        top: "38%",
        right: "12%",
        width: 6,
        height: 6,
        transform: "rotate(45deg)",
        background: theme.accent,
        opacity: 0.1,
        pointerEvents: "none",
      }}
    />

    {/* Small decorative dot — left side */}
    <div
      style={{
        position: "absolute",
        top: "65%",
        left: "10%",
        width: 4,
        height: 4,
        borderRadius: "50%",
        background: theme.accent,
        opacity: 0.08,
        pointerEvents: "none",
      }}
    />
  </div>
);
