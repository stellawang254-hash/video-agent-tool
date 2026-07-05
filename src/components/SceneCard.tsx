import React from "react";
import { fadeEnter } from "../styles/theme";
import { BASE } from "../styles/theme";
import type { StyleTheme } from "../styles/theme";

interface SceneCardProps {
  local: number;
  delay?: number;
  children: React.ReactNode;
  theme: StyleTheme;
  accent?: boolean;
  /** CSS style overrides */
  style?: React.CSSProperties;
}

/** Reusable content card with style-adaptive border/background */
export const SceneCard: React.FC<SceneCardProps> = ({
  local,
  delay = 0,
  children,
  theme,
  accent = false,
  style = {},
}) => {
  return (
    <div
      style={{
        ...fadeEnter(local, delay),
        display: "flex",
        flexDirection: "column",
        padding: "24px 36px",
        borderRadius: 14,
        marginBottom: 8,
        width: "90%",
        maxWidth: 860,
        background: accent ? theme.accentDim : BASE.card,
        border: `1px solid ${accent ? theme.accentBorder : BASE.cardBorder}`,
        ...style,
      }}
    >
      {children}
    </div>
  );
};
