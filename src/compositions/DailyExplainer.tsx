import React from "react";
import {
  AbsoluteFill,
  useCurrentFrame,
  interpolate,
  Audio,
  OffthreadVideo,
  staticFile,
} from "remotion";
import {
  BASE,
  FONT_FAMILY,
  EXPLAINER_THEME,
  sceneOpacity,
  fadeEnter,
  audioVolume,
  FADE_IN,
} from "../styles/theme";
import type { StyleTheme } from "../styles/theme";
import { Caption } from "../components/Caption";
import { TitleCard } from "../components/TitleCard";
import { ProgressBar } from "../components/ProgressBar";
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
//  Timing: 观点解释型 — 60s @ 30fps = 1800f
//   3s hook → 8s problem → 20s method → 20s case → 9s summary+cta
//   3s hook → 8s problem → 20s method → 20s case → 9s summary+cta

const S = { TITLE: 0, PROBLEM: 90, METHOD: 330, CASE: 930, SUMMARY: 1530 };
const TOTAL = 1800;
const theme: StyleTheme = EXPLAINER_THEME;

// ══════════════════════════════════════════════════════════════════
//  VideoBackground — full-frame background video clip
// ══════════════════════════════════════════════════════════════════

const VideoBackground: React.FC = () => (
  <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
    <OffthreadVideo
      src={staticFile("/background.mp4")}
      volume={0}
      style={{ width: "100%", height: "100%", objectFit: "cover" }}
    />
  </div>
);

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
          fontSize: 16, fontWeight: 600, color: BASE.subtext,
          letterSpacing: 3,
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
//  1. Title — 3s
// ══════════════════════════════════════════════════════════════════

const TitleScene: React.FC<{ f: number; data: ExplainerContent }> = ({ f, data }) => (
  <Scene f={f} start={S.TITLE} dur={120} badge="01">
    <TitleCard local={f - S.TITLE} title={data.title} subtitle={data.subtitle} theme={theme} />
    <div style={{ ...fadeEnter(f - S.TITLE, 18),
      fontSize: 28, color: BASE.subtext, textAlign: "center",
      maxWidth: 700, lineHeight: 1.6,
    }}>
      {data.hook}
    </div>
  </Scene>
);

// ══════════════════════════════════════════════════════════════════
//  2. Problem — 8s
// ══════════════════════════════════════════════════════════════════

const ProblemScene: React.FC<{ f: number; data: ExplainerContent }> = ({ f, data }) => {
  const local = f - S.PROBLEM;
  return (
    <Scene f={f} start={S.PROBLEM} dur={240} badge="02">
      <div style={{ ...fadeEnter(local, 0), fontSize: 40, fontWeight: 700, color: "#fff", marginBottom: 40, letterSpacing: 2 }}>
        常见误区
      </div>
      {data.problemItems.map((item, i) => (
        <SceneCard key={i} local={local} delay={12 + i * 20} theme={theme}>
          <div style={{ fontSize: 28, color: BASE.subtext, lineHeight: 1.5 }}>{item}</div>
        </SceneCard>
      ))}
    </Scene>
  );
};

// ══════════════════════════════════════════════════════════════════
//  3. Method — 20s
// ══════════════════════════════════════════════════════════════════

const MethodScene: React.FC<{ f: number; data: ExplainerContent }> = ({ f, data }) => {
  const local = f - S.METHOD;
  return (
    <Scene f={f} start={S.METHOD} dur={600} badge="03">
      <div style={{ ...fadeEnter(local, 0), fontSize: 44, fontWeight: 700, color: theme.accent, marginBottom: 40, letterSpacing: 2 }}>
        {data.methodTitle}
      </div>
      {data.methodItems.map((item, i) => (
        <SceneCard key={i} local={local} delay={12 + i * 28} theme={theme}
          accent={i === data.methodItems.length - 1}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, fontWeight: 700, color: "#fff",
              background: theme.badgeGrad,
            }}>
              {i + 1}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 28, fontWeight: 600, color: "#fff", marginBottom: 4 }}>{item.title}</div>
              <div style={{ fontSize: 22, color: BASE.subtext }}>{item.desc}</div>
            </div>
          </div>
        </SceneCard>
      ))}
    </Scene>
  );
};

// ══════════════════════════════════════════════════════════════════
//  4. Case — 20s
// ══════════════════════════════════════════════════════════════════

const CaseScene: React.FC<{ f: number; data: ExplainerContent }> = ({ f, data }) => {
  const local = f - S.CASE;
  return (
    <Scene f={f} start={S.CASE} dur={600} badge="04">
      <div style={{ ...fadeEnter(local, 0), fontSize: 38, fontWeight: 700, color: "#fff", marginBottom: 10, letterSpacing: 2 }}>
        {data.caseIntro}
      </div>
      <div style={{ ...fadeEnter(local, 10), marginBottom: 28,
        height: 3, width: 50, borderRadius: 2, background: theme.accent,
      }} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, width: "92%", maxWidth: 740 }}>
        {data.caseSteps.map((step, i) => (
          <SceneCard key={i} local={local} delay={20 + i * 14} theme={theme} style={{ minHeight: 85, justifyContent: "center" }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <span style={{ color: theme.accent, fontSize: 24, fontWeight: 700, flexShrink: 0 }}>{i + 1}.</span>
              <span style={{ fontSize: 24, color: BASE.subtext, lineHeight: 1.5 }}>{step}</span>
            </div>
          </SceneCard>
        ))}
      </div>
    </Scene>
  );
};

// ══════════════════════════════════════════════════════════════════
//  5. Summary + CTA — 9s
// ══════════════════════════════════════════════════════════════════

const SummaryScene: React.FC<{ f: number; data: ExplainerContent }> = ({ f, data }) => {
  const local = f - S.SUMMARY;
  return (
    <Scene f={f} start={S.SUMMARY} dur={270} hold>
      <div style={{ ...fadeEnter(local, 0),
        fontSize: 48, fontWeight: 800, color: "#fff",
        textAlign: "center", lineHeight: 1.5, marginBottom: 20,
      }}>
        {data.summary}
      </div>
      <div style={{ width: 60, height: 3, borderRadius: 2, background: theme.accent,
        marginTop: 0, marginBottom: 24,
        opacity: fadeEnter(local, 10).opacity,
      }} />
      <div style={{ ...fadeEnter(local, 15),
        fontSize: 44, fontWeight: 700, color: theme.accent,
        textAlign: "center", letterSpacing: 4, lineHeight: 1.4,
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

  // Build caption entries from scene data
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
      <VideoBackground />

      {data.audioFiles?.map((a, i) => (
        <Audio key={i} src={staticFile(a.src)} volume={(f) => audioVolume(f, a.start, a.end - a.start)} />
      ))}

      {frame >= S.TITLE && frame < S.TITLE + 120 && <TitleScene f={frame} data={data} />}
      {frame >= S.PROBLEM && frame < S.PROBLEM + 240 && <ProblemScene f={frame} data={data} />}
      {frame >= S.METHOD && frame < S.METHOD + 600 && <MethodScene f={frame} data={data} />}
      {frame >= S.CASE && frame < S.CASE + 600 && <CaseScene f={frame} data={data} />}
      {frame >= S.SUMMARY && frame < S.SUMMARY + 270 && <SummaryScene f={frame} data={data} />}

      <Caption text={activeCaption?.text} />
      <ProgressBar frame={frame} style="explainer" theme={theme} />
      <BrandMark local={frame} label={data.brandLabel} />
    </AbsoluteFill>
  );
};
