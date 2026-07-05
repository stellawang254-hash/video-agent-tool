import React from "react";
import { fadeEnter } from "../styles/theme";
import type { StyleTheme } from "../styles/theme";

interface TitleCardProps {
  local: number;
  title: string;
  subtitle?: string;
  theme: StyleTheme;
}

/**
 * Scene title card — bigger, with decorative accent glow and line.
 */
export const TitleCard: React.FC<TitleCardProps> = ({
  local,
  title,
  subtitle,
  theme,
}) => {
  return (
    <>
      {/* Title */}
      <div
        style={{
          ...fadeEnter(local, 0),
          fontSize: 72,
          fontWeight: 800,
          color: "#ffffff",
          textAlign: "center",
          lineHeight: 1.3,
          letterSpacing: 3,
          textShadow: `0 4px 30px ${theme.glow}`,
        }}
      >
        {title}
      </div>

      {/* Decorative accent glow line */}
      <div
        style={{
          width: 80,
          height: 4,
          borderRadius: 2,
          background: `linear-gradient(90deg, transparent, ${theme.accent}, transparent)`,
          marginTop: 24,
          marginBottom: subtitle ? 20 : 28,
          opacity: fadeEnter(local, 6).opacity,
          boxShadow: `0 0 20px ${theme.glow}`,
        }}
      />

      {/* Subtitle */}
      {subtitle && (
        <div
          style={{
            ...fadeEnter(local, 12),
            fontSize: 44,
            fontWeight: 700,
            color: theme.accent,
            textAlign: "center",
            letterSpacing: 4,
            lineHeight: 1.4,
            marginTop: 0,
            textShadow: `0 2px 12px ${theme.glow}`,
          }}
        >
          {subtitle}
        </div>
      )}
    </>
  );
};
