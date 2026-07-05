import React from "react";
import {
  AbsoluteFill, useCurrentFrame, interpolate,
  Audio, OffthreadVideo, staticFile,
} from "remotion";
import {
  BASE, FONT_FAMILY, QUOTE_THEME,
  sceneOpacity, fadeEnter, audioVolume,
} from "../styles/theme";
import type { StyleTheme } from "../styles/theme";
import { Caption } from "../components/Caption";
import { TitleCard } from "../components/TitleCard";
import { ProgressBar } from "../components/ProgressBar";
import { SceneCard } from "../components/SceneCard";
import { BrandMark } from "../components/BrandMark";

// ══════════════════════════════════════════════════════════════════
//  Content type — 金句卡片型
// ══════════════════════════════════════════════════════════════════

export interface QuoteContent {
  style: "quote";
  title: string;
  quotes: { text: string; author?: string }[];
  insightTitle?: string;
  insightItems: string[];
  reflection: string;
  source?: string;
  captions?: { from: number; to: number; text: string }[];
  audioFiles?: { start: number; end: number; src: string }[];
  brandLabel?: string;
}

// ══════════════════════════════════════════════════════════════════
//  Timing: 金句卡片型 — 60s @ 30fps
//   5s title → 25s quote → 15s insight → 10s reflection → 5s attr
// ══════════════════════════════════════════════════════════════════

const S = { TITLE: 0, QUOTE: 150, INSIGHT: 900, REFLECT: 1350, ATTR: 1650 };
const TOTAL = 1800;
const theme: StyleTheme = QUOTE_THEME;


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
//  1. Title — 5s
// ══════════════════════════════════════════════════════════════════

const TitleScene: React.FC<{ f: number; data: QuoteContent }> = ({ f, data }) => (
  <Scene f={f} start={S.TITLE} dur={150} badge="01">
    <TitleCard local={f - S.TITLE} title={data.title} theme={theme} />
    <div style={{ ...fadeEnter(f - S.TITLE, 18),
      fontSize: 30, color: BASE.subtext, textAlign: "center", maxWidth: 700,
      lineHeight: 1.6, fontStyle: "italic",
    }}>
      — 值得反复思考的观点
    </div>
  </Scene>
);

// ══════════════════════════════════════════════════════════════════
//  2. Quote — 25s (cycle through quotes with timer per quote)
// ══════════════════════════════════════════════════════════════════

const QuoteScene: React.FC<{ f: number; data: QuoteContent }> = ({ f, data }) => {
  const local = f - S.QUOTE;
  const perQuote = Math.floor(750 / Math.max(data.quotes.length, 1));
  const qi = Math.min(Math.floor(local / perQuote), data.quotes.length - 1);
  const quote = data.quotes[qi];
  const qLocal = local - qi * perQuote;

  if (!quote) return null;
  return (
    <Scene f={f} start={S.QUOTE} dur={750} badge="02">
      <div style={{ position: "absolute", top: 80, fontSize: 80, color: theme.accent, opacity: 0.15, fontFamily: "serif", lineHeight: 1 }}>
        &ldquo;
      </div>
      <SceneCard local={qLocal} delay={0} theme={theme} accent
        style={{ maxWidth: 750, padding: "40px 44px", borderLeft: `4px solid ${theme.accent}` }}
      >
        <div style={{ fontSize: 34, color: "#fff", lineHeight: 1.7, textAlign: "center", letterSpacing: 1 }}>
          {quote.text}
        </div>
      </SceneCard>
      {quote.author && (
        <div style={{ ...fadeEnter(qLocal, 18), marginTop: 20,
          fontSize: 24, color: theme.accent, letterSpacing: 2,
        }}>
          — {quote.author}
        </div>
      )}
      {data.quotes.length > 1 && (
        <div style={{ position: "absolute", bottom: 100, display: "flex", gap: 8 }}>
          {data.quotes.map((_, i) => (
            <div key={i} style={{ width: 8, height: 8, borderRadius: "50%",
              background: i === qi ? theme.accent : BASE.cardBorder,
              transition: "none",
            }} />
          ))}
        </div>
      )}
    </Scene>
  );
};

// ══════════════════════════════════════════════════════════════════
//  3. Insight — 15s
// ══════════════════════════════════════════════════════════════════

const InsightScene: React.FC<{ f: number; data: QuoteContent }> = ({ f, data }) => {
  const local = f - S.INSIGHT;
  return (
    <Scene f={f} start={S.INSIGHT} dur={450} badge="03">
      <div style={{ ...fadeEnter(local, 0), fontSize: 38, fontWeight: 700, color: theme.accent, marginBottom: 36, letterSpacing: 2 }}>
        {data.insightTitle || "核心洞察"}
      </div>
      {data.insightItems.map((item, i) => (
        <SceneCard key={i} local={local} delay={12 + i * 30} theme={theme} style={{ flexDirection: "row", alignItems: "flex-start", gap: 14 }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", marginTop: 10,
            background: theme.accent, flexShrink: 0,
          }} />
          <span style={{ fontSize: 26, color: BASE.subtext, lineHeight: 1.6 }}>{item}</span>
        </SceneCard>
      ))}
    </Scene>
  );
};

// ══════════════════════════════════════════════════════════════════
//  4. Reflection — 10s
// ══════════════════════════════════════════════════════════════════

const ReflectScene: React.FC<{ f: number; data: QuoteContent }> = ({ f, data }) => {
  const local = f - S.REFLECT;
  return (
    <Scene f={f} start={S.REFLECT} dur={300}>
      <div style={{ ...fadeEnter(local, 0), fontSize: 32, color: BASE.subtext, marginBottom: 30, letterSpacing: 2 }}>
        想一想
      </div>
      <SceneCard local={local} delay={10} theme={theme} accent
        style={{ maxWidth: 700, padding: "36px 40px", borderRadius: 20,
          borderLeft: `4px solid ${theme.accent}`,
        }}
      >
        <div style={{ fontSize: 36, color: "#fff", lineHeight: 1.6, textAlign: "center", letterSpacing: 1 }}>
          {data.reflection}
        </div>
      </SceneCard>
    </Scene>
  );
};

// ══════════════════════════════════════════════════════════════════
//  5. Attribution — 5s
// ══════════════════════════════════════════════════════════════════

const AttrScene: React.FC<{ f: number; data: QuoteContent }> = ({ f, data }) => {
  const local = f - S.ATTR;
  return (
    <Scene f={f} start={S.ATTR} dur={150}>
      <div style={{ ...fadeEnter(local, 0), fontSize: 32, color: BASE.subtext, marginBottom: 12, letterSpacing: 2 }}>
        来源
      </div>
      <div style={{ ...fadeEnter(local, 12),
        fontSize: 36, fontWeight: 600, color: theme.accent, letterSpacing: 3,
      }}>
        {data.source || "出处"}
      </div>
    </Scene>
  );
};

// ══════════════════════════════════════════════════════════════════
//  Main composition
// ══════════════════════════════════════════════════════════════════

export const QuoteCard: React.FC<{ content?: QuoteContent }> = ({ content }) => {
  const frame = useCurrentFrame();
  const data = content!;

  const captions = data.captions || [
    { from: S.TITLE, to: S.QUOTE, text: data.title },
    { from: S.QUOTE, to: S.INSIGHT, text: data.quotes.map((q) => q.text).join("｜") },
    { from: S.INSIGHT, to: S.REFLECT, text: data.insightItems.join("；") },
    { from: S.REFLECT, to: S.ATTR, text: data.reflection },
    { from: S.ATTR, to: TOTAL, text: data.source || "" },
  ];
  const activeCaption = captions.find((c) => frame >= c.from && frame < c.to);

  return (
    <AbsoluteFill style={{ ...Container, padding: 0 }}>
      <VideoBackground />

      {data.audioFiles?.map((a, i) => (
        <Audio key={i} src={staticFile(a.src)} volume={(f) => audioVolume(f, a.start, a.end - a.start)} />
      ))}

      {frame >= S.TITLE && frame < S.TITLE + 150 && <TitleScene f={frame} data={data} />}
      {frame >= S.QUOTE && frame < S.QUOTE + 750 && <QuoteScene f={frame} data={data} />}
      {frame >= S.INSIGHT && frame < S.INSIGHT + 450 && <InsightScene f={frame} data={data} />}
      {frame >= S.REFLECT && frame < S.REFLECT + 300 && <ReflectScene f={frame} data={data} />}
      {frame >= S.ATTR && frame < S.ATTR + 150 && <AttrScene f={frame} data={data} />}

      <Caption text={activeCaption?.text} />
      <ProgressBar frame={frame} style="quote" theme={theme} />
      <BrandMark local={frame} label={data.brandLabel} />
    </AbsoluteFill>
  );
};
