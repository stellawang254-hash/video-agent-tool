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
 * Scene title card with subtitle and accent line.
 * Title max 2 lines, subtitle below.
 */
export const TitleCard: React.FC<TitleCardProps> = ({
  local,
  title,
  subtitle,
  theme,
}) => {
  return (
    <>
      <div
        style={{
          ...fadeEnter(local, 0),
          fontSize: 56,
          fontWeight: 800,
          color: "#ffffff",
          textAlign: "center",
          lineHeight: 1.3,
          letterSpacing: 2,
        }}
      >
        {title}
      </div>
      {subtitle && (
        <div
          style={{
            ...fadeEnter(local, 12),
            fontSize: 36,
            fontWeight: 700,
            color: theme.accent,
            textAlign: "center",
            letterSpacing: 4,
            lineHeight: 1.4,
            marginTop: 16,
          }}
        >
          {subtitle}
        </div>
      )}
      <div
        style={{
          width: 60,
          height: 3,
          borderRadius: 2,
          background: theme.accent,
          marginTop: subtitle ? 24 : 20,
          marginBottom: 24,
          opacity: fadeEnter(local, subtitle ? 18 : 12).opacity,
        }}
      />
    </>
  );
};
