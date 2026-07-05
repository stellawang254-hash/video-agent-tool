<h1 align="center">video-agent-tool</h1>

<p align="center">
  <strong>Remotion 短视频生产流水线</strong><br>
  Markdown 文章 → 竖屏 9:16 短视频（含配音、字幕、动效背景）
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Remotion-4.x-000?logo=remotion" alt="Remotion">
  <img src="https://img.shields.io/badge/Node-%3E%3D18-339933?logo=node.js" alt="Node.js">
  <img src="https://img.shields.io/badge/BaiLian-TTS-FF6A00?logo=alibabacloud" alt="BaiLian TTS">
  <img src="https://img.shields.io/badge/license-MIT-blue" alt="License">
</p>

---

## 概述

**video-agent-tool** 是一个基于 [Remotion](https://remotion.dev) 的短视频生产工具，将一篇 Markdown 文章自动转化为抖音/小红书风格的竖屏短视频。

核心特色：**按场景分段 TTS 配音 + 句级字幕对齐**，而非常见的全程单轨配音。

## 三种视频风格

| 风格 | Composition | 主题色 | 场景编排 | 适用场景 |
|------|------------|--------|---------|---------|
| **观点解释型** | `DailyExplainer` | 🟠 橙色 #f97316 | 标题(3s) → 问题(8s) → 方法(20s) → 案例(20s) → 总结(9s) | 解释概念/理论，配案例说明 |
| **工具教程型** | `ToolTutorial` | 🔵 蓝色 #60a5fa | 钩子(3s) → 问题(5s) → 方案(15s) → 步骤(20s) → 技巧(8s) → CTA(9s) | 教学工具/方法，分步演示 |
| **金句卡片型** | `QuoteCard` | 🟢 绿色 #34d399 | 金句展示 → 洞察提炼 → 反思引导 | 展示引文/洞察，配反思 |

所有风格使用深色背景 (`#0a0a1a`) + 全屏背景视频循环。

## 快速开始

### 环境要求

- Node.js >= 18
- npm 或 pnpm

### 安装

```bash
cd video-agent-tool
npm install
```

### 渲染第一个视频

```bash
# 生成 content JSON
node scripts/make-content-from-md.mjs content/sample-explainer.json explainer

# 渲染视频
node scripts/render-daily.mjs content/sample-explainer.json
```

输出的 MP4 在 `outputs/` 目录下。

## 完整工作流

```
Markdown 文章
  │
  ▼
node scripts/make-content-from-md.mjs <file.md> <style>
  │ 自动提取标题、段落、金句，生成 content JSON 框架
  ▼
编辑 content JSON
  │ 补充/调整每个场景的文字、字幕、音频映射
  ▼
生成 TTS 配音（每场景独立 MP3）
  │ bl speech synthesize
  ▼
node scripts/render-daily.mjs content/<file>.json
  │ Remotion 合成视频
  ▼
outputs/YYYY-MM-DD-topic.mp4
```

## 配音工作流（核心特色）

每段配音对应一个独立场景，而非整段合成：

| 文件 | 帧范围 | 目标时长 | 对应场景 |
|------|--------|---------|---------|
| `01_title.mp3` | 0–90f | ~3s | 标题/钩子 |
| `02_problem.mp3` | 90–330f | ~8s | 问题/误区 |
| `03_method.mp3` | 330–930f | ~20s | 方法论 |
| `04_case.mp3` | 930–1530f | ~20s | 案例/实战 |
| `05_summary.mp3` | 1530–1800f | ~9s | 总结/CTA |

### 生成配音

使用阿里云 BaiLian TTS（推荐语音：`longxiaochun_v3`（龙小淳 — 知性积极女））：

```bash
bl speech synthesize \
  --text-file scripts/script_01.txt \
  --voice longxiaochun_v3 \
  --out public/audio/01_title.mp3

bl speech synthesize \
  --text-file scripts/script_02.txt \
  --voice longxiaochun_v3 \
  --out public/audio/02_problem.mp3

# ... 以此类推 03_method, 04_case, 05_summary
```

### 在 JSON 中引用

```json
"audioFiles": [
  { "start": 0, "end": 90, "src": "/audio/01_title.mp3" },
  { "start": 90, "end": 330, "src": "/audio/02_problem.mp3" },
  { "start": 330, "end": 930, "src": "/audio/03_method.mp3" },
  { "start": 930, "end": 1530, "src": "/audio/04_case.mp3" },
  { "start": 1530, "end": 1800, "src": "/audio/05_summary.mp3" }
]
```

每段音频自动处理 fade-in (10 帧) 和 fade-out（15 帧或 15% 时长）。

### 帧时长换算

30fps 下：`帧数 = 秒数 × 30`。检查音频时长：

```bash
for f in public/audio/*.mp3; do
  dur=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$f")
  printf "%-30s %5.2fs = %3df\n" "$(basename $f)" "$dur" "$(echo "$dur * 30" | bc)"
done
```

## 字幕规则

- 内置 burn-in 字幕，在 content JSON 的 `captions` 数组中定义
- 格式：`{ "from": 帧起始, "to": 帧结束, "text": "..." }`
- 自动折行，每行最多 ~14 个中文字符，最多 2 行
- 位于安全区域底部（1920px 画布 bottom: 160px）
- 黑色半透明背景 (`rgba(0,0,0,0.65)`) 确保可读性
- 如 `captions` 数组为空，自动从场景文本生成

## 渲染前检查清单

- [ ] 检查第 30 帧的布局
- [ ] 所有文字在安全区域内
- [ ] 主题色与风格匹配
- [ ] 总时长 ≤ 75s
- [ ] 每个 `audioFiles` 条目对应的音频文件存在
- [ ] 音频段不超过场景帧范围（留 fade 余量）
- [ ] 字幕时间轴覆盖音频时长
- [ ] 段首无静音（audioVolume 处理 fade-in）

## 平台默认要求

| 参数 | 值 |
|------|-----|
| 分辨率 | 1080 × 1920 portrait |
| 帧率 | 30fps |
| 目标时长 | ~60s（1800f），允许 45–75s |
| 动画 | 纯透明度动画（无 transform/scale 过渡） |
| 输出 | `outputs/YYYY-MM-DD-topic.mp4` |

## 项目结构

```
video-agent-tool/
├── content/                      # 视频内容 JSON（驱动渲染）
│   ├── 2026-06-14-agent-tool-selection.json
│   ├── sample-explainer.json
│   ├── sample-tutorial.json
│   └── sample-quote.json
├── public/
│   ├── audio/                    # 场景分段配音 MP3
│   │   ├── 01_title.mp3
│   │   ├── 02_problem.mp3
│   │   ├── 03_method.mp3
│   │   ├── 04_case.mp3
│   │   └── 05_summary.mp3
│   ├── background.mp4            # 背景视频（不再使用，保留兼容）
│   └── assets/
├── scripts/
│   ├── render-daily.mjs          # 主渲染脚本
│   └── make-content-from-md.mjs  # Markdown → JSON 转换
├── src/
│   ├── Root.tsx                  # 注册所有 Composition
│   ├── compositions/
│   │   ├── DailyExplainer.tsx    # 观点解释型
│   │   ├── ToolTutorial.tsx      # 工具教程型
│   │   └── QuoteCard.tsx         # 金句卡片型
│   ├── components/
│   │   ├── Caption.tsx           # 字幕组件
│   │   ├── SceneCard.tsx         # 场景卡片
│   │   ├── TitleCard.tsx
│   │   ├── ProgressBar.tsx
│   │   └── BrandMark.tsx
│   └── styles/
│       └── theme.ts              # 主题色 + 动画工具函数
├── AGENTS.md                     # Codex 项目 Agent 指南
├── outputs/                      # 渲染输出 MP4
└── package.json
```

## 技术栈

- **[Remotion](https://remotion.dev)** — 用 React 代码生成视频
- **[BaiLian TTS](https://www.aliyun.com/product/bailian)** — 阿里云语音合成（TTS）
- **TypeScript + React** — 声明式视频组件
- **FFmpeg** — 音频时长检查等辅助工具

## License

MIT
