import { interpolate } from "remotion";

// ══════════════════════════════════════════════════════════════════
//  Design Tokens — per-style accent palettes
// ══════════════════════════════════════════════════════════════════

/** Explainer (观点解释型) — orange accent */
export const EXPLAINER_THEME = {
  accent: "#f97316",
  accentDim: "rgba(249,115,22,0.08)",
  accentBorder: "rgba(249,115,22,0.25)",
  glow: "rgba(249,115,22,0.12)",
  badgeGrad: "linear-gradient(135deg, #f97316, #ea580c)",
  bgGrad1: "rgba(249,115,22,0.06)",
  bgGrad2: "rgba(96,165,250,0.04)",
};

/** Tutorial (工具教程型) — blue accent */
export const TUTORIAL_THEME = {
  accent: "#60a5fa",
  accentDim: "rgba(96,165,250,0.08)",
  accentBorder: "rgba(96,165,250,0.25)",
  glow: "rgba(96,165,250,0.12)",
  badgeGrad: "linear-gradient(135deg, #60a5fa, #3b82f6)",
  bgGrad1: "rgba(96,165,250,0.06)",
  bgGrad2: "rgba(52,211,153,0.04)",
};

/** Quote (金句卡片型) — green accent */
export const QUOTE_THEME = {
  accent: "#34d399",
  accentDim: "rgba(52,211,153,0.08)",
  accentBorder: "rgba(52,211,153,0.25)",
  glow: "rgba(52,211,153,0.12)",
  badgeGrad: "linear-gradient(135deg, #34d399, #10b981)",
  bgGrad1: "rgba(52,211,153,0.06)",
  bgGrad2: "rgba(96,165,250,0.04)",
};

export type StyleTheme = typeof EXPLAINER_THEME;

/** Shared base colors (same across all styles) */
export const BASE = {
  bg: "#0a0a1a",
  text: "#ffffff",
  subtext: "#94a3b8",
  card: "rgba(255,255,255,0.06)",
  cardBorder: "rgba(255,255,255,0.08)",
  muteBg: "rgba(148,163,184,0.06)",
} as const;

/** Total frame counts for each style (60s at 30fps = 1800f) */
export const STYLE_FRAMES = {
  explainer: 1800,
  tutorial: 1800,
  quote: 1800,
} as const;

export const FONT_FAMILY =
  '"PingFang SC", "Microsoft YaHei", "Noto Sans SC", system-ui, sans-serif';

export const FADE_IN = 10;
export const FADE_OUT = 20;

// ══════════════════════════════════════════════════════════════════
//  Animation helpers
// ══════════════════════════════════════════════════════════════════

/** Page-level fade in/out */
export const sceneOpacity = (f: number, start: number, dur: number) => {
  const local = f - start;
  if (local < 0 || local > dur) return 0;
  const fadeIn = interpolate(local, [0, FADE_IN], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOut = interpolate(local, [dur - FADE_OUT, dur], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return Math.min(fadeIn, fadeOut);
};

/** Safe entrance: pure opacity fade, no transform */
export const fadeEnter = (local: number, delay: number) => {
  const p = Math.max(0, local - delay);
  return {
    opacity: interpolate(p, [0, 14], [0, 1], { extrapolateLeft: "clamp" }),
  };
};

/** Audio volume with fade in/out */
export const audioVolume = (
  frame: number,
  sceneStart: number,
  dur: number
) => {
  const local = frame - sceneStart;
  if (local < 0 || local >= dur) return 0;
  const fadeIn = interpolate(local, [0, 10], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  const fadeOutFrames = Math.min(15, Math.floor(dur * 0.15));
  const outStart = dur - fadeOutFrames;
  const fadeOut = interpolate(local, [outStart, dur], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return Math.min(fadeIn, fadeOut);
};

/** Smooth looping offset for floating elements */
export const float = (
  frame: number,
  phase: number,
  amp: number,
  speed: number
) => 50 + Math.sin(frame * speed + phase) * amp;

/** Split subtitle text into max N-chars-per-line */
export const splitSubtitle = (text: string, maxLen = 14): string[] => {
  if (text.length <= maxLen) return [text];
  // Prefer to split on punctuation
  const punct = /[，。！？、；：""''（）—…·]/;
  for (let i = maxLen; i >= maxLen - 4 && i < text.length; i--) {
    if (punct.test(text[i]) && i + 1 < text.length) {
      return [text.slice(0, i + 1), text.slice(i + 1)];
    }
  }
  // Fallback: split at maxLen
  return [text.slice(0, maxLen), text.slice(maxLen)];
};

/** Build style-adaptive radial-gradient background */
export const buildBgStyle = (theme: StyleTheme): React.CSSProperties => ({
  position: "absolute",
  inset: 0,
  background: `
    radial-gradient(ellipse 70% 50% at 50% 30%, ${theme.bgGrad1} 0%, transparent 60%),
    radial-gradient(ellipse 50% 50% at 50% 80%, ${theme.bgGrad2} 0%, transparent 50%),
    linear-gradient(160deg, ${BASE.bg} 0%, #0f0f24 50%, #0d0d2b 100%)
  `,
});
