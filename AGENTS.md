# Daily Video Production — Agent Rules

## Platform defaults
- 1080x1920 portrait, 30fps
- Each video: 45-75 seconds (target ~60s = 1800f)
- Captions in safe zone, do not overlap main visual
- Title max 2 lines, ≤14 Chinese characters per line
- Clean opacity animations only (no transform/scale transitions)
- Final output: `outputs/*.mp4`

## Three video styles

| Style | Composition ID | Accent | When to use |
|-------|---------------|--------|-------------|
| 观点解释型 | Explainer | Orange | Explaining a concept/theory with examples |
| 工具教程型 | Tutorial | Blue | Teaching a tool/method step by step |
| 金句卡片型 | Quote | Green | Displaying quotes/insights with reflection |

## Style detection
Content JSON `style` field auto-selects the correct composition:
- `"explainer"` → Explainer
- `"tutorial"` → Tutorial
- `"quote"` → Quote

## Workflow
1. Write/collect article Markdown
2. `node scripts/make-content-from-md.mjs <file.md> <style>` → content JSON
3. Edit JSON: verify fields, add `captions`, adjust timing, map audio segments
4. Generate TTS narration per scene → save to `public/audio/` (see Dubbing workflow below)
5. `node scripts/render-daily.mjs content/<file>.json` → MP4
6. Generate Douyin post → `outputs/YYYY-MM-DD-topic-post.md` (见下方 Publishing 章节)

## Caption rules
- Burn-in subtitles in content JSON `captions` array
- `{ "from": frameStart, "to": frameEnd, "text": "..." }`
- Text auto-splits to ≤2 lines, ~14 chars each
- Positioned bottom safe zone, never overlap main content
- If no captions array, auto-generated from scene text

## Before rendering
- Check frame 30 still to verify layout
- Verify all text fits within bounds
- Check accent colors match style
- Confirm total duration ≤75s

## Dubbing workflow (配音流程)

The video dubbing (配音) follows a segment-per-scene approach: each scene has its own narration MP3, named and timed to match the scene it belongs to.

### 1. Write dubbing scripts per scene

Derive the dubbing script from the content JSON. Each scene gets a short narration that matches the visual content:

| Scene | Typical frames | Target audio length |
|-------|---------------|---------------------|
| 01_title / hook | 0-90f (3s) | 2-3s |
| 02_problem | 90-330f (8s) | 6-8s |
| 03_method | 330-930f (20s) | 18-20s |
| 04_case | 930-1530f (20s) | 18-20s |
| 05_summary + CTA | 1530-1800f (9s) | 8-10s |

**Audio should be slightly shorter than the scene** to allow fade-in padding. The dubbing flows continuously across scenes without gaps.

### 2. Generate TTS audio

Use `bl speech synthesize` to generate narration from the dubbing script:

```
bl speech synthesize --text-file script_01_title.txt --voice longxiaochun_v3 --out public/audio/01_title.mp3
bl speech synthesize --text-file script_02_problem.txt --voice longxiaochun_v3 --out public/audio/02_problem.mp3
bl speech synthesize --text-file script_03_method.txt --voice longxiaochun_v3 --out public/audio/03_method.mp3
bl speech synthesize --text-file script_04_case.txt --voice longxiaochun_v3 --out public/audio/04_case.mp3
bl speech synthesize --text-file script_05_summary.txt --voice longxiaochun_v3 --out public/audio/05_summary.mp3
```

Recommended voice: `longxiaochun_v3` (龙小淳 — 知性积极女).

### 3. Audio file naming convention

Files go in `public/audio/`. Naming: `NN_scene-description.mp3`

```
public/audio/
├── 01_title.mp3       # Title/hook scene (3s)
├── 02_problem.mp3     # Problem/misconception scene (8s)
├── 03_method.mp3      # Method/framework scene (20s)
├── 04_case.mp3        # Case/example scene (20s)
├── 05_summary.mp3     # Summary/CTA scene (9s)
└── voiceover.mp3      # (Optional) combined full-length version
```

### 4. Reference audio in content JSON

Map each audio segment to its scene frame range:

```json
"audioFiles": [
  { "start": 0, "end": 90, "src": "/audio/01_title.mp3" },
  { "start": 90, "end": 330, "src": "/audio/02_problem.mp3" },
  { "start": 330, "end": 930, "src": "/audio/03_method.mp3" },
  { "start": 930, "end": 1530, "src": "/audio/04_case.mp3" },
  { "start": 1530, "end": 1800, "src": "/audio/05_summary.mp3" }
]
```

- `start` / `end`: frame range (at 30fps) where this audio plays
- `src`: path relative to `public/`, must start with `/audio/`
- Each audio file gets automatic fade-in (10f) only via `audioVolume()` in theme.ts (no fade-out between segments for continuous dubbing)

### 5. Calculate frame ranges from audio duration

To map audio segments to frame ranges (30fps): `frames = duration_seconds * 30`

Check audio durations with:
```
for f in public/audio/*.mp3; do
  dur=$(ffprobe -v quiet -show_entries format=duration -of csv=p=0 "$f")
  printf "%-30s %5.2fs = %3df\n" "$(basename $f)" "$dur" "$(echo "$dur * 30" | bc)"
done
```

### 6. Align captions with audio timing

Captions should be timed to match the narration, not just scene boundaries. Use the transcript timestamp mapping for precision:

| Sentence | Audio time | Scene | Frame range |
|----------|-----------|-------|-------------|
| "AI Agent怎么选择工具？" | 0.28-2.92s | Title | 0-90f |
| "Agent选工具要经过三个层级的决策…" | 3.24-10.12s | Problem | 90-330f |
| "第一层大类决策…" | 10.68-15.12s | Method (1) | 330-930f |
| "第2层工具决策…" | 15.48-21.00s | Method (2) | (cont.) |
| "第3层参数决策…" | 21.95-29.83s | Method (3) | (cont.) |
| "Agent它有四个防呆机制…" | 30.51-44.51s | Case | 930-1530f |
| "理解Agent的边界…" | 51.10-60.02s | Summary | 1530-1800f |

### 7. Two audio approaches

**A. Segmented per-scene (recommended):** One MP3 per scene, mapped to exact scene frame ranges. Easier to generate, edit, and re-render individual scenes. Used in the `2026-06-14-agent-tool-selection` video.

**B. Single combined file:** One long `voiceover.mp3` covering the full duration. Simpler file management but harder to iterate on individual sections.

Both approaches work with the same `audioFiles[]` structure in the content JSON — the difference is just how many entries you define.

### 8. Audio verification checklist

- [ ] Each audio segment fits within its scene frame range (audio should be ~1-2s shorter than scene for fade padding)
- [ ] Audio files are MP3 format (AAC in the final render, but source MP3s work fine)
- [ ] Captions overlap with audio timing (not just scene boundaries)
- [ ] No silence at the beginning of each segment (audioVolume handles fade-in)
- [ ] Total audio duration covers the full video duration


## After rendering
Output goes to `outputs/`. Filename convention: `YYYY-MM-DD-topic.mp4`.
Verify output plays correctly before publishing.
