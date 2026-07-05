import React from "react";
import {
  AbsoluteFill, useCurrentFrame, interpolate,
  Audio, OffthreadVideo, staticFile,
} from "remotion";
import {
  BASE, FONT_FAMILY, TUTORIAL_THEME,
  sceneOpacity, fadeEnter, audioVolume,
} from "../styles/theme";
import type { StyleTheme } from "../styles/theme";
import { Caption } from "../components/Caption";
import { TitleCard } from "../components/TitleCard";
import { ProgressBar } from "../components/ProgressBar";
import { SceneCard } from "../components/SceneCard";
import { BrandMark } from "../components/BrandMark";

// ══════════════════════════════════════════════════════════════════
//  Content type — 工具教程型
// ══════════════════════════════════════════════════════════════════

export interface TutorialContent {
  style: "tutorial";
  title: string;
  subtitle?: string;
  hook: string;
  problemText: string;
  toolName: string;
  steps: { title: string; desc: string }[];
  tipTitle?: string;
  tipItems: string[];
  cta: string;
  captions?: { from: number; to: number; text: string }[];
  audioFiles?: { start: number; end: number; src: string }[];
  brandLabel?: string;
}

// ══════════════════════════════════════════════════════════════════
//  Timing: 工具教程型 — 60s @ 30fps
//   3s hook → 5s problem → 15s method → 20s steps → 8s tips → 9s cta
// ══════════════════════════════════════════════════════════════════

const S = { HOOK: 0, PROBLEM: 90, METHOD: 240, STEPS: 690, TIPS: 1290, CTA: 1530 };
const TOTAL = 1800;
const theme: StyleTheme = TUTORIAL_THEME;

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
  f: number; start: number; dur: number; badge?: string
}>> = ({ f, start, dur, badge, children }) => {
  const local = f - start;
  if (local < 0 || local > dur) return null;
  return (
    <div style={{ ...Container, opacity: sceneOpacity(f, start, dur) }}>
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
//  1. Hook — 3s
// ══════════════════════════════════════════════════════════════════

const HookScene: React.FC<{ f: number; data: TutorialContent }> = ({ f, data }) => (
  <Scene f={f} start={S.HOOK} dur={90} badge="01">
    <TitleCard local={f - S.HOOK} title={data.title} subtitle={data.subtitle} theme={theme} />
    <div style={{ ...fadeEnter(f - S.HOOK, 18),
      fontSize: 30, color: BASE.subtext, textAlign: "center",
      maxWidth: 700, lineHeight: 1.6,
    }}>
      {data.hook}
    </div>
  </Scene>
);

// ══════════════════════════════════════════════════════════════════
//  2. Problem — 5s
// ══════════════════════════════════════════════════════════════════

const ProblemScene: React.FC<{ f: number; data: TutorialContent }> = ({ f, data }) => {
  const local = f - S.PROBLEM;
  return (
    <Scene f={f} start={S.PROBLEM} dur={150} badge="02">
      <div style={{ ...fadeEnter(local, 0), fontSize: 36, color: BASE.subtext, marginBottom: 20 }}>
        你遇到过这个问题吗？
      </div>
      <SceneCard local={local} delay={12} theme={theme} accent style={{ maxWidth: 650, padding: "28px 36px" }}>
        <div style={{ fontSize: 30, color: "#fff", textAlign: "center", lineHeight: 1.6 }}>
          {data.problemText}
        </div>
      </SceneCard>
    </Scene>
  );
};

// ══════════════════════════════════════════════════════════════════
//  3. Method — 15s
// ══════════════════════════════════════════════════════════════════

const MethodScene: React.FC<{ f: number; data: TutorialContent }> = ({ f, data }) => {
  const local = f - S.METHOD;
  return (
    <Scene f={f} start={S.METHOD} dur={450} badge="03">
      <div style={{ ...fadeEnter(local, 0), fontSize: 40, fontWeight: 700, color: theme.accent, marginBottom: 40, letterSpacing: 1 }}>
        解决方案：{data.toolName}
      </div>
      {data.steps.map((step, i) => (
        <SceneCard key={i} local={local} delay={12 + i * 30} theme={theme}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, flexShrink: 0,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 18, fontWeight: 700, color: "#fff",
              background: theme.badgeGrad,
            }}>
              {i + 1}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 26, fontWeight: 600, color: theme.accent, marginBottom: 2 }}>{step.title}</div>
              <div style={{ fontSize: 22, color: BASE.subtext }}>{step.desc}</div>
            </div>
          </div>
        </SceneCard>
      ))}
    </Scene>
  );
};

// ══════════════════════════════════════════════════════════════════
//  4. Steps — 20s (reuse method steps with more detail)
// ══════════════════════════════════════════════════════════════════

const StepsScene: React.FC<{ f: number; data: TutorialContent }> = ({ f, data }) => {
  const local = f - S.STEPS;
  return (
    <Scene f={f} start={S.STEPS} dur={600} badge="04">
      <div style={{ ...fadeEnter(local, 0), fontSize: 38, fontWeight: 700, color: "#fff", marginBottom: 36, letterSpacing: 2 }}>
        分步演示
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, width: "92%", maxWidth: 740 }}>
        {data.steps.map((step, i) => (
          <SceneCard key={i} local={local} delay={12 + i * 24} theme={theme} style={{ minHeight: 140 }}>
            <div style={{ position: "absolute", top: 12, right: 16, fontSize: 48, fontWeight: 800,
              color: theme.accent, opacity: 0.12,
            }}>
              {i + 1}
            </div>
            <div style={{ fontSize: 24, fontWeight: 600, color: theme.accent, marginBottom: 8 }}>{step.title}</div>
            <div style={{ fontSize: 22, color: BASE.subtext, lineHeight: 1.5 }}>{step.desc}</div>
          </SceneCard>
        ))}
      </div>
    </Scene>
  );
};

// ══════════════════════════════════════════════════════════════════
//  5. Tips — 8s
// ══════════════════════════════════════════════════════════════════

const TipsScene: React.FC<{ f: number; data: TutorialContent }> = ({ f, data }) => {
  const local = f - S.TIPS;
  return (
    <Scene f={f} start={S.TIPS} dur={240} badge="05">
      <div style={{ ...fadeEnter(local, 0), fontSize: 36, fontWeight: 700, color: theme.accent, marginBottom: 36, letterSpacing: 2 }}>
        {data.tipTitle || "使用技巧"}
      </div>
      {data.tipItems.map((item, i) => (
        <SceneCard key={i} local={local} delay={12 + i * 22} theme={theme} style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
          <span style={{ color: theme.accent, fontSize: 22 }}>✦</span>
          <span style={{ fontSize: 26, color: BASE.subtext }}>{item}</span>
        </SceneCard>
      ))}
    </Scene>
  );
};

// ══════════════════════════════════════════════════════════════════
//  6. CTA — 9s
// ══════════════════════════════════════════════════════════════════

const CTAScene: React.FC<{ f: number; data: TutorialContent }> = ({ f, data }) => {
  const local = f - S.CTA;
  return (
    <Scene f={f} start={S.CTA} dur={270}>
      <div style={{ fontSize: 52, fontWeight: 800, color: "#fff", textAlign: "center", lineHeight: 1.5, marginBottom: 20,
        ...fadeEnter(local, 0),
      }}>
        现在就试试
      </div>
      <div style={{ width: 60, height: 3, borderRadius: 2, background: theme.accent,
        marginBottom: 24, opacity: fadeEnter(local, 10).opacity,
      }} />
      <div style={{ ...fadeEnter(local, 15),
        fontSize: 40, fontWeight: 700, color: theme.accent,
        textAlign: "center", letterSpacing: 3, lineHeight: 1.4,
      }}>
        {data.cta}
      </div>
    </Scene>
  );
};

// ══════════════════════════════════════════════════════════════════
//  Main composition
// ══════════════════════════════════════════════════════════════════

export const ToolTutorial: React.FC<{ content?: TutorialContent }> = ({ content }) => {
  const frame = useCurrentFrame();
  const data = content!;

  const captions = data.captions || [
    { from: S.HOOK, to: S.PROBLEM, text: data.hook },
    { from: S.PROBLEM, to: S.METHOD, text: data.problemText },
    { from: S.METHOD, to: S.STEPS, text: data.steps.map((s) => s.title).join(" → ") },
    { from: S.STEPS, to: S.TIPS, text: data.steps[0]?.desc },
    { from: S.TIPS, to: S.CTA, text: data.tipItems.join("；") },
    { from: S.CTA, to: TOTAL, text: data.cta },
  ];
  const activeCaption = captions.find((c) => frame >= c.from && frame < c.to);

  return (
    <AbsoluteFill style={{ ...Container, padding: 0 }}>
      <VideoBackground />

      {data.audioFiles?.map((a, i) => (
        <Audio key={i} src={staticFile(a.src)} volume={(f) => audioVolume(f, a.start, a.end - a.start)} />
      ))}

      {frame >= S.HOOK && frame < S.HOOK + 90 && <HookScene f={frame} data={data} />}
      {frame >= S.PROBLEM && frame < S.PROBLEM + 150 && <ProblemScene f={frame} data={data} />}
      {frame >= S.METHOD && frame < S.METHOD + 450 && <MethodScene f={frame} data={data} />}
      {frame >= S.STEPS && frame < S.STEPS + 600 && <StepsScene f={frame} data={data} />}
      {frame >= S.TIPS && frame < S.TIPS + 240 && <TipsScene f={frame} data={data} />}
      {frame >= S.CTA && frame < S.CTA + 270 && <CTAScene f={frame} data={data} />}

      <Caption text={activeCaption?.text} />
      <ProgressBar frame={frame} style="tutorial" theme={theme} />
      <BrandMark local={frame} label={data.brandLabel} />
    </AbsoluteFill>
  );
};
