import React from "react";
import type { StyleTheme } from "../styles/theme";
import { STYLE_FRAMES } from "../styles/theme";

interface ProgressBarProps {
  frame: number;
  style: "explainer" | "tutorial" | "quote";
  theme: StyleTheme;
}

/** Bottom progress bar — shows video playback progress */
export const ProgressBar: React.FC<ProgressBarProps> = ({
  frame,
  style,
  theme,
}) => {
  const total = STYLE_FRAMES[style];
  return (
    <div
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        height: 3,
        width: `${(frame / total) * 100}%`,
        background: `linear-gradient(90deg, ${theme.accent}, ${
          style === "explainer"
            ? "#60a5fa"
            : style === "tutorial"
              ? "#34d399"
              : "#60a5fa"
        })`,
        transition: "none",
        zIndex: 60,
      }}
    />
  );
};
