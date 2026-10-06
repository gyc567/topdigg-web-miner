---
title: "PhotoCraft: A Pure-Rust Open-Source Photoshop Alternative — Architecture & Agent-Driven Design"
slug: photocraft-rust-photoshop-alternative
date: 2026-10-07
description: "An in-depth analysis of PhotoCraft: a clean-room reimplementation of Adobe Photoshop in pure Rust, covering architecture philosophy, command systems, PSD compatibility, agent-driven capabilities, and detailed installation guides."
source: https://github.com/storytold/photocraft
author: 瑞哥观势
---

# PhotoCraft: A Pure-Rust Open-Source Photoshop Alternative — Architecture & Agent-Driven Design

## 1. Project Overview

PhotoCraft is an open-source project on GitHub: a complete, clean-room reimplementation of Adobe Photoshop, written entirely in Rust. It follows a strict clean-room methodology—no Adobe proprietary code is used. All implementation is based on public specifications and observed behavior.

Core positioning:
- **Native application**: No Electron or WebView dependency; Rust compiles directly to native binaries for each platform
- **Fully controllable**: Open source, offline-capable, no network dependency
- **Agent-ready**: All features exposed through a unified command system; AI agents can drive it directly

Key metrics:
- 100% Rust, 24 crates
- Supports macOS, Windows, Linux, FreeBSD, and Web
- 1700+ test cases
- 500+ commands, 34 tools

---

## 2. Design Philosophy

### 2.1 Clean-Room Principle

The project explicitly forbids:
- Copying any proprietary code (Rust, WGSL, C++, JS)
- Using proprietary shaders or asset files
- Any form of imitation beyond "behavior and appearance"

Sources are limited to:
- Adobe's public PSD format specification
- Public standards: ICC, ISO 32000
- Academic papers (PatchMatch, Poisson blending)
- Pure behavioral observation

This principle ensures legal safety and cultivates a development culture that prioritizes architectural correctness.

### 2.2 Engine-First: Everything is a Command

PhotoCraft's core design philosophy: **Everything is a Command**.

Every user-visible action has a stable `CommandId` (e.g., `filter.blur.gaussian`) with typed, serializable parameters. Menus, command palette, shortcuts, recorded actions, CLI, MCP, and plugins all dispatch through the same command system.

Implications:
- Anything the UI can do, scripts can do
- Anything the UI can do, AI agents can do
- All operations are inherently reproducible, recordable, and automatable

### 2.3 Avoiding GIMP's Historical Traps

The architecture docs analyze GIMP's failure path in detail:

| Issue | GIMP's Consequence | PhotoCraft's Rule |
|-------|-------------------|-------------------|
| Hardcoded bit depth | GEGL rewrite took 18 years | PixelFormat as runtime data |
| No non-destructive editing | Implemented 30 years later in GIMP 3.0 | Adjustment layers are non-destructive by design |
| CMYK assumed RGB internally | Still a pure RGB editor today | ColorMode designed from Day 1 |
| Poor PSD support | Lossy import, text often needs retyping | Independent psd crate with Oracle validation |

Design principle: **Adding 64-bit float, a new color model, or a new file format should modify only a leaf crate, never the foundation**.

---

## 3. Architecture Design

### 3.1 Layered Architecture (24 Crates)

```
L0  Foundation (no upper-layer dependencies)
    geom     — Geometry: points, rects, affine/perspective, bezier curves
    cms      — ICC color management: profiles, transforms, intents, BPC
    color    — Pixel formats, color spaces, blend-mode math
    raster   — COW tiles, masks, MIP pyramids, damage regions
    psd      — PSD/PSB read/write (standalone crate, no workspace deps)
    codecs   — PNG/JPEG/TIFF/WebP/GIF/AVIF codec

L1  Document Model
    doc      — Pure data: layer tree, masks, effects, channels, paths

L2  Algorithm Layer
    ops      — Reversible ops, history, undo
    algo     — Adjustments, filters, selection, inpaint, warp/transform
    paint    — Brush engine: dynamics, smoothing, pressure/tilt/twist
    text     — Font DB, shaping, text layer rasterization
    vector   — Shapes, paths, strokes → coverage

L3  Rendering Layer
    compose  — Layer tree → DrawOp plan; CPU compositor (Oracle)
    gpu      — wgpu backend (Metal/Vulkan/DX12/WebGPU)

L4  I/O & Extensions
    io       — Import/export, doc ↔ PSD mapping
    plugins  — WebAssembly sandboxed filter plugins

L5  Engine
    engine   — Session, command registry, jobs, events, view models

L6  Frontends
    ui-egui  — Thin egui shell
    automation — MCP server + JSON-RPC over command registry
```

**Layering is enforced** by `cargo xtask layers` in CI; reverse dependencies are prohibited.

### 3.2 Dual-Compositor Design

PhotoCraft maintains two independent compositors simultaneously:
- **CPU compositor**: Reference Oracle for testing and validation
- **GPU compositor**: Based on wgpu, handles actual rendering

They test against each other pixel-by-pixel, solving the common open-source issue of "preview looks different from export."

### 3.3 Copy-on-Write Tile Mechanism

Pixel data is stored in `Arc`-shared 256×256 sparse tiles:
- Undo is extremely cheap (O(number of layers))
- Huge canvases are memory-light
- Effect maps are cached per layer state

```
┌─────┬─────┬─────┬─────┐
│  0  │  0  │  1  │  0  │
├─────┼─────┼─────┼─────┤
│  0  │  1  │  1  │  1  │
├─────┼─────┼─────┼─────┤
│  0  │  1  │  0  │  0  │
├─────┼─────┼─────┼─────┤
│  0  │  0  │  0  │  0  │
└─────┴─────┴─────┴─────┘
        Sparse tile diagram (1=allocated)
```

### 3.4 UI-Engine Boundary

The most critical architectural decision: **UI layer is thin and data-driven**.

A frontend needs only 5 interfaces:

```rust
// 1. Session: commands in, events out
pub fn dispatch(&self, doc: Option<DocId>, cmd: CommandInvocation) -> Result<JobHandle>

// 2. CommandRegistry: menu, palette, shortcut data catalog
// GUI builds menu bar and ⌘K command palette from this

// 3. Tool: pointer events in, ops and overlays out
// Overlays are pure data (paths, marching ants, handles); UI draws them

// 4. Viewport: document → screen pixels
// Any UI framework supporting wgpu TextureView can embed the canvas

// 5. ViewModels: panel data (pure structs, UI reads and renders)
```

**Litmus test**: CLI and automation server must be able to do everything the GUI can do.

---

## 4. Feature Implementation

### 4.1 Tool Set (34 tools)

Move · Rectangular/Elliptical Marquee · Lasso · Polygonal Lasso · Magic Wand · Quick Selection · Object Selection · Crop · Eyedropper · Brush · Pencil · Mixer Brush · Color Replacement · Eraser · Clone Stamp · Healing Brush · Spot Healing · History Brush · Gradient · Paint Bucket · Blur · Sharpen · Smudge · Dodge · Burn · Sponge · Pen · Path Selection · Type · 5 Shape tools · Hand · Zoom

### 4.2 Adjustment Layers

16 adjustment layers, live preview, original pixels never change:
- Curves (per-channel editing)
- Levels (with live histogram)
- Black & White · Channel Mixer · Gradient Map · Photo Filter · Selective Color · Color Lookup (.cube/.3dl/.look)
- Shadows/Highlights · Replace Color · Match Color · HDR Toning · Desaturate · Equalize

### 4.3 Layer Styles

Drop Shadow · Inner Shadow · Outer/Inner Glow · Bevel & Emboss · Satin · Stroke · Color/Gradient/Pattern Overlay

Supports reading layer styles directly from PSD files, pixel-matching Photoshop.

### 4.4 Selections & Masks

Marquee, Lasso, Magic Wand for precision; Quick Selection, Object Selection, Select Subject driven by machine learning (runs locally, no cloud).

Selections can convert to: layer masks, vector paths, shapes.

### 4.5 Brush Engine

Complete Photoshop brush parameter implementation:
- Shape Dynamics · Scattering · Texture · Dual Brush · Color Dynamics · Transfer · Brush Pose · Wet Edges · Build-up · Smoothing (including Pulled String)
- Driven by pressure, tilt, rotation, direction
- Brush presets · Define Brush from Selection · Deterministic replayable strokes

### 4.6 Color Management

Pure Rust ICC color management:
- Embedded profiles
- Assign and Convert to Profile (4 rendering intents + black point compensation)
- Soft proofing (⌘Y)
- Gamut Warning (⇧⌘Y)
- Runs on GPU

Supports RGB, Grayscale, CMYK, Lab at 8/16/32 bits per channel. Bit depth and color model are runtime data.

---

## 5. PSD Compatibility Implementation

### 5.1 Standalone PSD Crate

`photocraft-psd` is a fully standalone publishable crate, written from Adobe's public specification, with zero workspace dependencies.

### 5.2 Compatibility Data

| Test Set | Pass Rate |
|----------|-----------|
| psd-tools test set (309 files) | 307/309 |
| ag-psd + psd-tools mixed set (170 files) | 169/170 |

### 5.3 Composite Oracle Validation

PhotoCraft maintains a set of Photoshop-authored Oracle PSD files, comparing its own render against Photoshop's merged image, covering:
- Gradient interpolation (Classic, Perceptual, Linear)
- Layer effects
- Shape strokes
- Clipping and fill opacity

### 5.4 Known Gaps

From the official Roadmap's honest assessment:
- AI/Generative features
- ~20 missing tools
- Typography and professional workflow depth
- Plugin compatibility

---

## 6. Agent-Driven Capabilities

### 6.1 Command System

PhotoCraft's command system is the core of its agent-readiness.

500+ commands, each with:
- Stable `CommandId`
- Typed parameter struct
- Menu path, shortcut, enabled state
- JSON Schema for parameters (auto-generates UI)

### 6.2 Four Invocation Methods

The same command triggers through:
1. **GUI**: menus, toolbar, shortcuts
2. **CLI**: `photocraft-cli run image.psd --cmd filter.sharpen.smartSharpen --params '{"amount":80}'`
3. **JSON control channel**: `photocraft --control 7878`, TCP JSON-RPC
4. **MCP server**: `photocraft-cli mcp`, AI agents drive via MCP protocol

### 6.3 Command Execution Examples

```sh
# Headless: open, edit, save
photocraft-cli run wave.psd \
  --cmd filter.sharpen.smartSharpen     --params '{"amount":80}' \
  --cmd layer.newAdjustmentLayer.curves  --params '{"points":[[0,0],[64,48],[192,212],[255,255]]}' \
  --out wave-final.png

# Batch process: apply action list to folder
photocraft-cli batch --actions grade.json --in ./raw --out ./graded

# MCP mode: agent-driven
photocraft-cli mcp
```

### 6.4 Control Protocol Methods

```json
{"id": 1, "method": "ui.inspect", "params": {}}
{"id": 2, "method": "ui.pointer", "params": {"events": [{"kind": "down", "x": 100, "y": 200, "pressure": 0.8}]}}
{"id": 3, "method": "engine.execute", "params": {"command": "filter.blur.gaussian", "params": {"radius": 10}}}
{"id": 4, "method": "ui.screenshot", "params": {}}
```

### 6.5 Preferences System

All preferences exposed through commands:

```json
prefs.get  {"path": "performance.historyStates"}
prefs.set  {"path": "cursors.painting", "value": "precise"}
edit.colorSettings {"workingRgb": "display-p3", "intent": "perceptual", "bpc": true}
```

Stored in platform config directory (macOS ~/Library/Application Support/Photocraft, Linux ~/.config/photocraft).

---

## 7. Installation & Usage Tutorial

### 7.1 Build from Source

```sh
# Clone
git clone https://github.com/storytold/photocraft
cd photocraft

# Build desktop app
cargo run --release -p photocraft -- image.psd

# Build test suite
cargo test --workspace
```

### 7.2 Pre-built Packages

Installers for macOS, Windows, Linux, FreeBSD: https://github.com/storytold/photocraft/releases

### 7.3 Linux Flatpak

```sh
flatpak install --user photocraft-<version>-linux-x86_64.flatpak
flatpak run ai.storyteller.photocraft
```

### 7.4 CLI Installation (macOS)

```sh
ditto -x -k photocraft-cli-<version>-macos-universal.zip .
spctl --assess --type install -vv photocraft-cli-<version>-macos-universal/photocraft-cli
# Should output: accepted, source=Notarized Developer ID
```

### 7.5 MCP Server Startup

```sh
# Direct start (generates temp token)
photocraft-cli mcp

# Bridge to existing desktop app
photocraft-cli mcp --bridge 127.0.0.1:7878

# Desktop app with token auth
photocraft --control 7878 --control-token-file /private/path/token \
  --automation-read-root /work/project \
  --automation-write-root /work/project
```

### 7.6 Automation Script Example (Python)

```python
import subprocess
import json

def run_photocraft_command(cmd_id, params=None):
    result = subprocess.run([
        'photocraft-cli', 'run', 'input.psd',
        '--cmd', cmd_id,
        '--params', json.dumps(params or {}),
        '--out', 'output.png'
    ], capture_output=True)
    return result.returncode == 0

# Example: add curves adjustment layer
run_photocraft_command(
    'layer.newAdjustmentLayer.curves',
    {'points': [[0,0], [64,48], [192,212], [255,255]]}
)

# Example: apply smart sharpen
run_photocraft_command(
    'filter.sharpen.smartSharpen',
    {'amount': 80, 'radius': 1.2, 'noise': 0.1}
)
```

### 7.7 Batch Processing Workflow

Create `grade.json` action file:

```json
[
  {"command": "layer.newAdjustmentLayer.curves", "params": {"points": [[0,0],[48,48],[192,212],[255,255]]}},
  {"command": "layer.newAdjustmentLayer.vibrance", "params": {"vibrance": 15}},
  {"command": "filter.sharpen.smartSharpen", "params": {"amount": 50}}
]
```

Execute:
```sh
photocraft-cli batch --actions grade.json --in ./raw --out ./graded
```

---

## 8. Key Conclusions

### Conclusion 1: Architectural Correctness is the Source of Long-term Competitiveness

PhotoCraft treats bit depth, color model, and file formats as runtime data from Day 1. This means adding CMYK or 32-bit float support requires no upper-layer rewrites. The pit that took GIMP 18 years to climb out of was designed into PhotoCraft from the beginning.

**Insight**: The true cost of technical debt is not the当下的开发速度, but its constraint on future architectural choices.

### Conclusion 2: Command System is the Best Architecture for Agent-Enablement

PhotoCraft's "Everything is a Command" design makes Photoshop's full capability naturally available to agents. No extra wrapper, no API adaptation layer needed—CommandId is the agent's tool name, parameter Schema is the agent's call contract.

**Insight**: AI Native application design should shift from "how to expose features to users" to "how to expose features to AI"; commandization is the most direct path.

### Conclusion 3: Dual Oracle Validation is Key to Quality Assurance

CPU and GPU compositors test against each other pixel-by-pixel. This solves the common open-source problem of "preview looks different from export," and enables confident large-scale refactoring.

**Insight**: The return on investment of testing is extremely high in complex rendering systems. PhotoCraft's 1700+ tests cover PSD round-trips, compositor oracles, and multi-depth validation.

### Conclusion 4: Clean-Room is a Scalable Open-Source Strategy

By strictly distinguishing "observed behavior" from "copied code," PhotoCraft achieves complete legal safety while building solid technical foundations through public specifications and academic papers.

**Insight**: Open source does not mean compromising on quality. A clean implementation approach actually forces deeper understanding of principles, rather than simple copying.

### Conclusion 5: Engine-First Ensures Headless Capability

All features run without UI: tests, CLI, MCP, automation scripts. This is the fundamental difference from Photoshop—PhotoCraft is both a desktop application and an embeddable image processing engine.

**Insight**: The value of modern creative tools lies not just in UI, but in the programmability of the underlying engine.

---

## 9. Feature Comparison with Photoshop

| Category | PhotoCraft | Photoshop | Gap |
|----------|------------|-----------|-----|
| PSD Read | 307/309 round-trip correct | Baseline | Minimal |
| PSD Save | Pixel-matches Oracle | Baseline | Minimal |
| Adjustment Layers | 16 types, live preview | 17+ | Near |
| Layer Styles | 8 types, PSD round-trip | Complete | Near |
| Brush Engine | Full dynamics | Complete | Near |
| AI Features | None | Neuron/Generative Fill | Significant |
| Plugin System | Wasm sandbox (in dev) | 8BF/CC | Significant |
| CMYK Editing | Storage/import/export only | Complete | Moderate |

**Current status**: Early Alpha, ~70% feature coverage, core rendering engine quality is extremely high.

---

## 10. Related Ecosystem (Crafting Apps)

PhotoCraft is one of ArtCraft's "Crafting Apps" series:

| App | Purpose | Status |
|-----|---------|--------|
| PhotoCraft | Image editing | Early Alpha |
| VectorCraft | Vector illustration | In development |
| FilmCraft | Video editing, color, sound | In development |
| LightCraft | Photo library and RAW dev | In development |
| PrintCraft | PDF reading and organizing | In development |
| EffectCraft | Motion graphics and VFX | In development |
| DesignCraft | Page layout and publishing | In development |

Shared characteristics: Pure Rust, Clean-Room, Native + WebAssembly, Agent-drivable.

---

## 11. Summary

PhotoCraft represents a new paradigm in open-source image editing:

- **Architecture**: Strict layered design and data-driven approach ensure long-term maintainability
- **Engineering**: Dual Oracle validation, command-driven system, 1700+ tests establish a high quality baseline
- **Ecosystem**: Clean-Room implementation ensures legal safety; MCP support prepares for the AI era
- **Vision**: Not building "a tool like Photoshop," but "a correctly implemented image editing engine"

Currently in early Alpha with gaps in AI features and some professional tooling, but the core rendering engine, PSD compatibility, and agent-driven capabilities have reached extremely high standards. For developers needing a controllable image processing engine, or users with AI-driven image editing needs, PhotoCraft is a project worth watching.

---

*First published on WeChat Official Account: 瑞哥观势*
