#!/usr/bin/env node

/**
 * render-daily.mjs
 *
 * Renders a video from a content JSON file.
 * Usage:
 *   node scripts/render-daily.mjs content/2026-07-01-codex-remotion.json
 *   node scripts/render-daily.mjs content/xxx.json outputs/custom.mp4
 *
 * The content JSON's `style` field determines which composition to render:
 *   "explainer" → Explainer (观点解释型)
 *   "tutorial"  → Tutorial (工具教程型)
 *   "quote"     → Quote    (金句卡片型)
 */

import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { bundle } from "@remotion/bundler";
import { renderMedia, selectComposition } from "@remotion/renderer";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");

// ─── Parse args ────────────────────────────────────────────────
const [contentPathArg, outputPathArg] = process.argv.slice(2);

if (!contentPathArg) {
  console.error("Usage: node render-daily.mjs <content.json> [output.mp4]");
  console.error("  content.json must have a `style` field: 'explainer', 'tutorial', or 'quote'");
  process.exit(1);
}

const contentPath = path.resolve(PROJECT_ROOT, contentPathArg);
if (!fs.existsSync(contentPath)) {
  console.error(`❌ Content file not found: ${contentPath}`);
  process.exit(1);
}

const content = JSON.parse(fs.readFileSync(contentPath, "utf-8"));

// ─── Style → composition ID ────────────────────────────────────
const COMPOSITION_MAP = {
  explainer: "Explainer",
  tutorial: "Tutorial",
  quote: "Quote",
};

const compositionId = COMPOSITION_MAP[content.style];
if (!compositionId) {
  console.error(`❌ Unknown style: "${content.style}". Must be one of: ${Object.keys(COMPOSITION_MAP).join(", ")}`);
  process.exit(1);
}

// ─── Output path ────────────────────────────────────────────────
const outPath = outputPathArg
  ? path.resolve(PROJECT_ROOT, outputPathArg)
  : path.resolve(PROJECT_ROOT, "outputs", `${path.basename(contentPath, ".json")}.mp4`);

fs.mkdirSync(path.dirname(outPath), { recursive: true });

// ─── Render ─────────────────────────────────────────────────────
console.log(`📦 Bundling Remotion project...`);
console.log(`   Entry: src/Root.tsx`);
console.log(`   Style: ${content.style} → ${compositionId}`);
console.log(`   Output: ${outPath}`);

try {
  const serveUrl = await bundle({
    entryPoint: path.resolve(PROJECT_ROOT, "src", "Root.tsx"),
    webpackOverride: (cfg) => cfg,
  });

  const composition = await selectComposition({
    serveUrl,
    id: compositionId,
    inputProps: { content },
  });

  // ─── Auto-detect duration from audioFiles ─────────────────────
  if (content.audioFiles && content.audioFiles.length > 0) {
    const lastEnd = Math.max(...content.audioFiles.map((a) => a.end));
    const safeEnd = Math.ceil(lastEnd / 30) * 30 + 30; // round up to next 1s + 1s padding
    composition.durationInFrames = safeEnd;
    console.log(`   Audio end: ${lastEnd}f → auto duration: ${safeEnd}f`);
  }

  console.log(`   Duration: ${composition.durationInFrames}f @ ${composition.fps}fps`);

  await renderMedia({
    composition,
    serveUrl,
    codec: "h264",
    outputLocation: outPath,
    inputProps: { content },
    chromiumOptions: {
      gl: "angle",
    },
  });

  const size = fs.statSync(outPath).size;
  const sizeMB = (size / 1024 / 1024).toFixed(1);
  console.log(`✅ Rendered: ${outPath} (${sizeMB} MB)`);
} catch (err) {
  console.error("❌ Render failed:", err);
  process.exit(1);
}
