import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Audio,
  staticFile,
} from "remotion";
import {
  BASE, FONT_FAMILY, EXPLAINER_THEME, sceneOpacity, fadeEnter, audioVolume,
} from "../styles/theme";
import type { StyleTheme } from "../styles/theme";
import { Caption } from "../components/Caption";
import { TitleCard } from "../components/TitleCard";
import { ProgressBar } from "../components/ProgressBar";
import { SolidBackground } from "../components/BgDecorations";
import { SceneCard } from "../components/SceneCard";
import { BrandMark } from "../components/BrandMark";

// ══════════════════════════════════════════════════════════════════
//  Content type
// ══════════════════════════════════════════════════════════════════

export interface ExplainerContent {
  style: "explainer";
  title: string;
  subtitle?: string;
  hook: string;
  problemItems: string[];
  methodTitle: string;
  methodItems: { title: string; desc: string }[];
  caseIntro: string;
  caseSteps: string[];
  summary: string;
  cta: string;
  captions?: { from: number; to: number; text: string }[];
  audioFiles?: { start: number; end: number; src: string }[];
  brandLabel?: string;
}

// ══════════════════════════════════════════════════════════════════
//  Timing — matches the audio durations
// ══════════════════════════════════════════════════════════════════

const theme: StyleTheme = EXPLAINER_THEME;

// ══════════════════════════════════════════════════════════════════
//  Background — pure gradient (no video)
// ══════════════════════════════════════════════════════════════════



// ══════════════════════════════════════════════════════════════════
//  Scene wrapper
// ══════════════════════════════════════════════════════════════════

const Container: React.CSSProperties = {
  width: "100%", height: "100%",
  display: "flex", flexDirection: "column",
  alignItems: "center", justifyContent: "center",
  fontFamily: FONT_FAMILY,
  position: "relative", overflow: "hidden", padding: 40,
};

const Scene: React.FC<React.PropsWithChildren<{
  f: number; start: number; dur: number; badge?: string; hold?: boolean
}>> = ({ f, start, dur, badge, children, hold = false }) => {
  const local = f - start;
  if (local < 0 || local > dur) return null;
  return (
    <div style={{ ...Container, opacity: hold ? 1 : sceneOpacity(f, start, dur) }}>
      {badge && (
        <div style={{ position: "absolute", top: 40, right: 40,
          fontSize: 14, fontWeight: 700, color: BASE.subtext,
          letterSpacing: 4, textTransform: "uppercase",
          padding: "6px 16px", borderRadius: 20,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.06)",
          opacity: interpolate(Math.max(0, local), [0, 10], [0, 0.5], { extrapolateLeft: "clamp" }),
        }}>
          {badge}
        </div>
      )}
      {children}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════
//  1. Title
// ══════════════════════════════════════════════════════════════════

const TitleScene: React.FC<{ f: number; data: ExplainerContent; start: number; dur: number }> = ({ f, data, start, dur }) => (
  <Scene f={f} start={start} dur={dur} badge="01">
    <TitleCard local={f - start} title={data.title} subtitle={data.subtitle} theme={theme} />
    {/* Hook with decorative brackets */}
    <div style={{ ...fadeEnter(f - start, 14),
      fontSize: 34, color: BASE.subtext, textAlign: "center",
      maxWidth: 820, lineHeight: 1.7, fontStyle: "italic",
      wordBreak: "keep-all", overflowWrap: "break-word",
    }}>
      <span style={{ opacity: 0.25, fontSize: 50, color: theme.accent, lineHeight: 1 }}>「</span>
      {data.hook}
      <span style={{ opacity: 0.25, fontSize: 50, color: theme.accent, lineHeight: 1 }}>」</span>
    </div>
  </Scene>
);

// ══════════════════════════════════════════════════════════════════
//  2. Problem
// ══════════════════════════════════════════════════════════════════

const ProblemScene: React.FC<{ f: number; data: ExplainerContent; start: number; dur: number }> = ({ f, data, start, dur }) => {
  const local = f - start;
  return (
    <Scene f={f} start={start} dur={dur} badge="02">
      <div style={{ ...fadeEnter(local, 0), fontSize: 48, fontWeight: 700, color: "#fff", marginBottom: 32, letterSpacing: 3 }}>
        常见误区
      </div>
      {data.problemItems.map((item, i) => (
        <SceneCard key={i} local={local} delay={12 + i * 20} theme={theme}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
            <div style={{
              width: 44, height: 44, borderRadius: "50%", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(249,115,22,0.15)",
              fontSize: 24, fontWeight: 800, color: theme.accent, wordBreak: "keep-all",
            }}>!</div>
            <div style={{ flex: 1, fontSize: 32, color: BASE.subtext, lineHeight: 1.6, wordBreak: "keep-all", overflowWrap: "break-word" }}>{item}</div>
          </div>
        </SceneCard>
      ))}
    </Scene>
  );
};

// ══════════════════════════════════════════════════════════════════
//  3. Method
// ══════════════════════════════════════════════════════════════════

const MethodScene: React.FC<{ f: number; data: ExplainerContent; start: number; dur: number }> = ({ f, data, start, dur }) => {
  const local = f - start;
  return (
    <Scene f={f} start={start} dur={dur} badge="03">
      <div style={{ ...fadeEnter(local, 0), fontSize: 48, fontWeight: 700, color: theme.accent, marginBottom: 32, letterSpacing: 3 }}>
        {data.methodTitle}
      </div>
      {data.methodItems.map((item, i) => (
        <SceneCard key={i} local={local} delay={12 + i * 28} theme={theme}
          accent={i === data.methodItems.length - 1}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 52, height: 52, borderRadius: "50%", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 24, fontWeight: 700, color: "#fff",
              background: theme.badgeGrad,
              boxShadow: "0 0 24px " + theme.glow,
            }}>
              {i + 1}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 34, fontWeight: 600, color: "#fff", marginBottom: 6, wordBreak: "keep-all", overflowWrap: "break-word" }}>{item.title}</div>
              <div style={{ fontSize: 26, color: BASE.subtext, lineHeight: 1.5, wordBreak: "keep-all", overflowWrap: "break-word" }}>{item.desc}</div>
            </div>
          </div>
        </SceneCard>
      ))}
    </Scene>
  );
};

// ══════════════════════════════════════════════════════════════════
//  4. Case
// ══════════════════════════════════════════════════════════════════

const CaseScene: React.FC<{ f: number; data: ExplainerContent; start: number; dur: number }> = ({ f, data, start, dur }) => {
  const local = f - start;
  return (
    <Scene f={f} start={start} dur={dur} badge="04">
      <div style={{ ...fadeEnter(local, 0), fontSize: 44, fontWeight: 700, color: "#fff", marginBottom: 10, letterSpacing: 3 }}>
        {data.caseIntro}
      </div>
      <div style={{ ...fadeEnter(local, 10), marginBottom: 28,
        height: 3, width: 50, borderRadius: 2, background: theme.accent,
      }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, width: "92%", maxWidth: 860 }}>
        {data.caseSteps.map((step, i) => (
          <SceneCard key={i} local={local} delay={20 + i * 14} theme={theme} style={{ minHeight: 85, justifyContent: "center" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <div style={{
                width: 42, height: 42, borderRadius: 10, flexShrink: 0,
                background: theme.accentDim, border: "1px solid " + theme.accentBorder,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: theme.accent, fontSize: 22, fontWeight: 700,
              }}>{i + 1}</div>
              <span style={{ fontSize: 30, color: BASE.subtext, lineHeight: 1.5, flex: 1 }}>{step}</span>
            </div>
          </SceneCard>
        ))}
      </div>
    </Scene>
  );
};

// ══════════════════════════════════════════════════════════════════
//  5. Summary + CTA
// ══════════════════════════════════════════════════════════════════

const SummaryScene: React.FC<{ f: number; data: ExplainerContent; start: number; dur: number }> = ({ f, data, start, dur }) => {
  const local = f - start;
  return (
    <Scene f={f} start={start} dur={dur} hold>
      <div style={{ ...fadeEnter(local, 0),
        fontSize: 60, fontWeight: 800, color: "#fff",
        textAlign: "center", lineHeight: 1.5, marginBottom: 16,
        wordBreak: "keep-all", overflowWrap: "break-word",
        textShadow: "0 4px 30px rgba(0,0,0,0.5)",
      }}>
        <span style={{ opacity: 0.2, fontSize: 72, color: theme.accent }}>「</span>
        {data.summary}
        <span style={{ opacity: 0.2, fontSize: 72, color: theme.accent }}>」</span>
      </div>
      <div style={{ width: 80, height: 4, borderRadius: 2,
        background: "linear-gradient(90deg, transparent, " + theme.accent + ", transparent)",
        marginTop: 0, marginBottom: 28,
        opacity: fadeEnter(local, 10).opacity,
        boxShadow: "0 0 20px " + theme.glow,
      }} />
      <div style={{ ...fadeEnter(local, 15),
        fontSize: 52, fontWeight: 700, color: theme.accent,
        textAlign: "center", letterSpacing: 5, lineHeight: 1.4, wordBreak: "keep-all",
      }}>
        {data.cta}
      </div>
    </Scene>
  );
};

// ══════════════════════════════════════════════════════════════════
//  Main composition
// ══════════════════════════════════════════════════════════════════


export const DailyExplainer: React.FC<{ content?: ExplainerContent }> = ({ content }) => {
  const frame = useCurrentFrame();
  const data = content!;

  // Derive scene timing from audioFiles so visuals sync with dubbing
  const afs = data.audioFiles ?? [];
  const S = {
    TITLE:   afs[0]?.start ?? 0,
    PROBLEM: afs[1]?.start ?? 375,
    METHOD:  afs[2]?.start ?? 840,
    CASE:    afs[3]?.start ?? 1290,
    SUMMARY: afs[4]?.start ?? 1950,
  };
  const D = {
    TITLE:   (afs[0]?.end ?? 375)   - S.TITLE,
    PROBLEM: (afs[1]?.end ?? 840)   - S.PROBLEM,
    METHOD:  (afs[2]?.end ?? 1290)  - S.METHOD,
    CASE:    (afs[3]?.end ?? 1950)  - S.CASE,
    SUMMARY: (afs[4]?.end ?? 2340)  - S.SUMMARY,
  };
  const TOTAL = afs.length > 0 ? afs[afs.length - 1].end : 2340;

  // Use captions from content JSON; fallback to auto-generated
  const captions = data.captions || [
    { from: S.TITLE, to: S.PROBLEM, text: data.hook },
    { from: S.PROBLEM, to: S.METHOD, text: data.problemItems.join("；") },
    { from: S.METHOD, to: S.CASE, text: data.methodItems.map((m) => m.title).join(" → ") },
    { from: S.CASE, to: S.SUMMARY, text: data.caseSteps[0] },
    { from: S.SUMMARY, to: TOTAL, text: data.summary },
  ];
  const activeCaption = captions.find((c) => frame >= c.from && frame < c.to);

  return (
    <AbsoluteFill style={{ ...Container, padding: 0 }}>
      <SolidBackground theme={theme} />

      {/* Single continuous dubbing track — avoids multi-audio mixing attenuation */}
      <Audio src={staticFile("/audio/voiceover.mp3")} />

      {frame >= S.TITLE   && frame < S.TITLE   + D.TITLE   && <TitleScene   f={frame} data={data} start={S.TITLE}   dur={D.TITLE} />}
      {frame >= S.PROBLEM && frame < S.PROBLEM + D.PROBLEM && <ProblemScene f={frame} data={data} start={S.PROBLEM} dur={D.PROBLEM} />}
      {frame >= S.METHOD  && frame < S.METHOD  + D.METHOD  && <MethodScene  f={frame} data={data} start={S.METHOD}  dur={D.METHOD} />}
      {frame >= S.CASE    && frame < S.CASE    + D.CASE    && <CaseScene    f={frame} data={data} start={S.CASE}    dur={D.CASE} />}
      {frame >= S.SUMMARY && frame < S.SUMMARY + D.SUMMARY && <SummaryScene f={frame} data={data} start={S.SUMMARY} dur={D.SUMMARY} />}

      <Caption text={activeCaption?.text} />
      <ProgressBar frame={frame} totalFrames={TOTAL} style="explainer" theme={theme} />
      <BrandMark local={frame} label={data.brandLabel} />
    </AbsoluteFill>
  );
};
