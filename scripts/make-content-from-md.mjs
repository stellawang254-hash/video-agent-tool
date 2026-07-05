#!/usr/bin/env node

/**
 * make-content-from-md.mjs
 *
 * Takes a Markdown article and generates a content JSON for video production.
 * This is a semi-automated tool — it extracts key content from the MD file
 * and structures it into the JSON format expected by the video templates.
 *
 * Usage:
 *   node scripts/make-content-from-md.mjs <article.md> [style] [output.json]
 *
 * Styles: explainer (default), tutorial, quote
 *
 * The script reads the Markdown, extracts title and sections,
 * then prompts/hints for the remaining fields. Manual editing of the
 * output JSON is expected for best results.
 */

import path from "path";
import fs from "fs";

const [,, mdPath, styleArg, outputArg] = process.argv;

if (!mdPath) {
  console.error("Usage: node scripts/make-content-from-md.mjs <article.md> [style] [output.json]");
  console.error("  style: explainer (default), tutorial, quote");
  process.exit(1);
}

const mdFull = path.resolve(process.cwd(), mdPath);
if (!fs.existsSync(mdFull)) {
  console.error(`❌ Not found: ${mdFull}`);
  process.exit(1);
}

const md = fs.readFileSync(mdFull, "utf-8");
const style = (styleArg || "explainer").toLowerCase();

if (!["explainer", "tutorial", "quote"].includes(style)) {
  console.error(`❌ Invalid style: "${style}". Choose explainer, tutorial, or quote.`);
  process.exit(1);
}

// ─── Simple Markdown parser ─────────────────────────────────────
const lines = md.split("\n");
const title = lines.find((l) => l.startsWith("# "))?.replace(/^# /, "").trim() || path.basename(mdPath, ".md");
const paragraphs = md
  .split(/\n\n+/)
  .map((p) => p.replace(/#{1,6}\s+/g, "").replace(/\*\*/g, "").replace(/[*_]/g, "").trim())
  .filter((p) => p.length > 10);

// ─── Build content based on style ───────────────────────────────
let content = {};

switch (style) {
  case "explainer": {
    const hook = paragraphs[0]?.slice(0, 40) || title;
    const items3 = paragraphs.slice(1, 4).map((p) => p.slice(0, 30));
    const methodItems = paragraphs.slice(4, 7).map((p) => {
      const parts = p.split(/[：:]/);
      return { title: parts[0]?.slice(0, 15) || "步骤", desc: parts[1]?.slice(0, 30) || p.slice(0, 30) };
    });
    content = {
      style: "explainer",
      title,
      subtitle: "",
      hook,
      problemItems: items3.length >= 3 ? items3 : ["痛点1：需要人工补充", "痛点2：效率有待提升", "痛点3：效果难以量化"],
      methodTitle: "核心方法",
      methodItems: methodItems.length >= 2 ? methodItems : [
        { title: "第一步", desc: "明确目标和范围" },
        { title: "第二步", desc: "执行并记录过程" },
        { title: "第三步", desc: "复盘并优化迭代" },
      ],
      caseIntro: "实践案例",
      caseSteps: paragraphs.slice(7, 12).map((p) => p.slice(0, 40)),
      summary: paragraphs[paragraphs.length - 2]?.slice(0, 40) || "少即是多，小即是快",
      cta: paragraphs[paragraphs.length - 1]?.slice(0, 40) || "关注我，获取更多干货",
    };
    break;
  }
  case "tutorial": {
    content = {
      style: "tutorial",
      title,
      subtitle: "一步步教你操作",
      hook: paragraphs[0]?.slice(0, 40) || `学会${title}`,
      problemText: paragraphs[1]?.slice(0, 60) || "传统方法效率低，费时费力",
      toolName: title,
      steps: paragraphs.slice(2, 5).map((p) => {
        const parts = p.split(/[：:]/);
        return { title: parts[0]?.slice(0, 15) || "步骤", desc: parts[1]?.slice(0, 30) || p.slice(0, 30) };
      }),
      tipTitle: "注意事项",
      tipItems: paragraphs.slice(5, 8).map((p) => p.slice(0, 30)),
      cta: "收藏转发，需要的时候随时看",
    };
    break;
  }
  case "quote": {
    const quoteLines = paragraphs.filter((p) => p.includes('\u201c') || p.includes("「") || p.length < 40);
    content = {
      style: "quote",
      title,
      quotes: quoteLines.slice(0, 3).map((q) => ({
        text: q.replace(/["""「」]/g, "").slice(0, 60),
        author: "",
      })),
      insightTitle: "核心洞察",
      insightItems: paragraphs.slice(1, 4).map((p) => p.slice(0, 30)),
      reflection: paragraphs[paragraphs.length - 1]?.slice(0, 50) || "这句话对你有什么启发？",
      source: "",
    };
    break;
  }
}

// ─── Write output ───────────────────────────────────────────────
const today = new Date().toISOString().split("T")[0];
const outName = outputArg || `content/${today}-${path.basename(mdPath, ".md")}.json`;
const outPath = path.resolve(process.cwd(), outName);

fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, JSON.stringify(content, null, 2), "utf-8");

console.log(`✅ Generated ${style} content from: ${path.basename(mdPath)}`);
console.log(`   Output: ${outPath}`);
console.log();
console.log("📝 Next steps:");
console.log(`   1. Open ${outPath} and edit the fields to match your article`);
console.log(`   2. Add 'captions' array for subtitle burn-in if needed`);
console.log(`   3. Run: node scripts/render-daily.mjs ${outName}`);
