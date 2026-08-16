---
title: 'ttfx: Compiling Terminal Text Effects into a Single 3.3MB Static Binary with Rust'
date: "2026-08-16"
description: "An in-depth look at omacom-io/ttfx — a Rust port that reproduces TerminalTextEffects byte-for-byte. Explore how it packs 37 terminal effects into one zero-dependency static binary, how deterministic testing proves 'pixel-perfect' parity, and the design philosophy behind its 27.5× median speedup, complete with a full tutorial"
tags:
  - ttfx
  - TerminalTextEffects
  - Rust
  - CLI
  - Terminal
  - Terminal Effects
  - Command Line Tools
  - Performance Optimization
categories:
  - Developer Tools
  - Command Line Tools
  - Rust
  - Terminal
  - Open Source
---

# ttfx: Compiling Terminal Text Effects into a Single 3.3MB Static Binary with Rust

## Background and Project Overview

If you have ever run `fortune`, `cowsay`, or used `neofetch` to show off your system info, you already know the command-line world's craving for "a little magic." [TerminalTextEffects](https://github.com/ChrisBuilds/terminaltexteffects) (TTE for short) by ChrisBuilds pushes that magic to the extreme — it makes your text **decrypt, burn, explode, or rain down like meteors** right in the terminal, with 37 effects, all open source.

But TTE has a "blessing and a curse": it is a Python package. That is absolutely the right call for a library, but for a toy that lives in your shell pipeline, Python means an interpreter, an install step, and **roughly 65 ms of import time before the first frame**.

**ttfx** is the answer to that problem: a Rust port that compiles all 37 of TTE's effects, its animation engine, and its command-line interface into **one static binary with zero runtime dependencies** — starting in just **0.5 ms**, at about **3.3 MB**.

> ttfx: Terminal text effects as a single static binary. Pipe text in, pick an effect:
>
> ```sh
> ls -la | ttfx decrypt
> cat banner.txt | ttfx beams
> fortune | ttfx --random-effect
> git log --oneline -10 | ttfx matrix
> ```

This is not an ordinary "rewrite it in Rust" port. ttfx's ambition is **parity-exact**: given the same input, configuration, and random draws, every frame it produces is **byte-identical** to the Python original — and that consistency is proven not by eyeballing, but by mechanical verification in CI. The project itself is a textbook on how to port a project seriously.

## Project at a Glance

| Dimension | Details |
|-----------|---------|
| **Name** | ttfx (`ttx` was already taken by fonttools, hence `ttfx`) |
| **Author/Org** | omacom-io (born for the Omarchy distribution) |
| **Positioning** | A parity-exact Rust port of TerminalTextEffects |
| **Language** | Rust (edition 2021), roughly the same scale as ~22k lines of Python |
| **Dependencies** | Only 3: clap / clap_complete / terminal_size |
| **Artifact** | A single static binary (musl static linking, ~3.3 MB), zero runtime deps |
| **Effects** | 37, fully aligned with upstream |
| **License** | MIT (preserves the original TTE copyright) |
| **Target platforms** | Linux and macOS (originally Omarchy/Arch only) |
| **Upstream version** | Pinned to TTE v0.15.0 (commit `7a91dd9`) |
| **Verification** | CI byte-for-byte comparison + behavior tests + unit goldens |

## Core Design Philosophy

### Credit Where It's Due: The Port Adds Nothing

The very first sentence of the project README is "Credit where it's due":

> **This is a port of TerminalTextEffects (TTE) by ChrisBuilds.** Every effect, the animation engine, and the command-line interface are their design — this project translates that work to Rust and adds nothing of its own to the art. If you like what you see here, star the original.

This humility is not politeness; it is a hard principle. Effect ideas are even explicitly routed back upstream: "Please file *effect* ideas upstream, where they belong." A port project does not play product manager — it plays translator.

### Parity Port: Byte-Identical, Not "In Spirit"

Most port projects accept "close enough, looks similar" as the bar. ttfx sets the bar an order of magnitude higher:

> This is a *parity port*, not a reimplementation-in-spirit. Given the same input, config, and random draws, ttfx produces **byte-identical frames** to the Python original — verified mechanically in CI against a pinned upstream checkout (v0.15.0), not by eyeballing.

That verification system consists of 6 test suites:

| Suite | Checks | What it proves |
|-------|--------|----------------|
| `tools/parity/run_suite.sh` | 354 | every effect's frame stream, byte for byte, across configs and seeds |
| `tools/parity/tty_compare.sh` | 41 | the full terminal byte stream — canvas prep, cursor moves, teardown |
| `tools/tests/cli_corpus.sh` | 19 | exit codes and stdout/stderr routing |
| `tools/tests/*_behavior.py` | pty | what only a real terminal shows: resize restarts, signal teardown |
| `cargo test` | goldens + traces | easing/geometry/gradient values and engine state machines |

`./bin/test` runs the whole lot — and that is all CI does.

### Reproduce the Quirks Deliberately, Don't "Fix" Them

This is the most counterintuitive and deepest design decision in the whole project. To make output byte-identical, ttfx must **deliberately preserve** a series of "bugs" from the Python original:

- **Python's banker's rounding** (round-half-even): Rust's `f64::round` rounds half away from zero; the two behave differently at `.5` boundaries, so it must be reproduced;
- **Gradients built from integer floor division, not float interpolation**: `(end - start) // steps` — Python's `//` floors on negative deltas while Rust's `/` truncates toward zero; must be reproduced;
- **The bezier arc-length approximation drops its final segment**: the upstream 10-sample loop bug makes path lengths systematically short, and `max_steps` depends on it — **reproduce the bug**;
- **Looping scenes report themselves complete on every tick**: effects depend on this quirk to finish properly.

All of these traps are catalogued in the "fidelity traps" list in `plan.md` (20 items in total), while the places where Python's unordered iteration had to be pinned down live in `docs/ordering-inventory.md`.

**Only two deliberate differences are accepted**: the random number generator (ttfx uses xoshiro256++, incompatible with CPython's Mersenne Twister, so `--seed` is reproducible *within* ttfx but not interchangeable with Python), and the lack of Python plugin effects (there is no interpreter to load them).

### Transcription, Not Reimagination

The porting strategy itself is a philosophy:

> Each Python file maps to one Rust file; functions keep their names and internal structure; comments reference upstream line numbers for anything subtle. The two survey documents (engine architecture + effect catalog) serve as the map; the pinned checkout is the letter.

Translate rather than adapt, map line-for-line rather than "improve along the way" — the direct payoff is that **as long as the transcription is faithful, the RNG call order naturally matches**, which is exactly the precondition for byte-for-byte comparison. Any "I think this could be written better" impulse breaks equivalence.

### The Single Static Binary Philosophy

Why go this far for a terminal toy? Because "in a pipeline" and "as a library" are two completely different worlds:

```
Python TTE (as a library):   ttfx (as a pipeline toy):
  python3 interpreter    →    one binary file
  pip install            →    download and run
  ~65 ms import          →    0.5 ms startup
  a pile of runtime deps →    zero runtime dependencies
```

> TTE is a Python package. That's the right call for a library, but for a shell toy that lives in your prompt pipeline it means an interpreter, an install step, and ~65 ms of import before the first frame. ttfx is one dependency-free binary that starts in half a millisecond. **That difference is the whole reason this exists.**

### Deterministic Verification: Making "Pixel-Perfect" Checkable

Effects are random, so naive frame-diffing fails by construction. ttfx's solution is to turn randomness into an **injectable shared dependency**:

1. **Deterministic RNG shim**: the same xoshiro256++ is implemented in both Rust (`rng.rs`) and Python (`tools/parity/shim.py`); during tests both sides draw identical random sequences — provided the port calls the RNG in the same order as Python, which is exactly what faithful transcription guarantees;
2. **Determinism patches**: every unordered iteration (set traversal, dict-order reliance) is pinned to the same canonical order;
3. **Clock patch**: matrix and thunderstorm read the real clock; under test it is replaced by a virtual clock (advancing `1/frame_rate` per frame), making them deterministic.

This "shared random source + pinned ordering + virtual clock" methodology is worth borrowing for any deterministic-testing project.

## Deep Dive into the Technical Architecture

### Arena + IDs Instead of the Python Object Graph

Inside Python TTE is a web of back-references: character ⇄ animation/motion/event handler, events holding Scene/Path/Waypoint objects, `links`/`neighbors` between characters... In Rust, the borrow checker would torture you. ttfx's answer is the classic **arena architecture**:

- All `EffectCharacter`s live in a `Vec` arena, addressed by `CharacterId(u32)`;
- Scenes/Paths live in per-character maps addressed by `SceneId`/`PathId`;
- `neighbors`/`links` store only IDs;
- Event tables degrade to plain data: `HashMap<(Event, CallerId), Vec<(Action, Target)>>`.

**Zero `Rc<RefCell>` anywhere.** This is not just Rust survival — it also makes state snapshotable and comparable, a happy bonus for testing.

### Synchronous Event Dispatch (No Deferred Queue)

Python's semantics are subtle: event callbacks execute **immediately at the emission point**, and can fire in the *middle* of `Path.step` — e.g. segment events fire before the coordinate is computed, and a `SET_COORDINATE` action is subsequently overwritten by the move's own assignment. If the Rust port used a "deferred queue" (draining after tick), it would produce different frames even with identical RNG draws.

Conclusion: **no deferred queue.** All engine stepping functions are methods on `EngineCtx` operating through IDs, calling `handle_event` inline at the source's exact emission points, recursing depth-first just like Python's call stack. A perfect case of "the architecture was forced to its simplest form by byte-for-byte equivalence."

### One Terminal, Deterministic Ordering

Python constructs **two** Terminals per run (one owns the tty, one owns the simulation). ttfx collapses them into one `Terminal` plus a thin `TtyWriter` (canvas prep, frame pacing, cursor restore), with RAII `Drop` replacing the `@contextmanager`.

**"Ordering is behavior."** Python iterates unordered sets in several behaviorally relevant places — not just inside the engine but inside effects too (middleout and unstable iterate sets directly). ttfx's rules:

- anywhere Python iterates a dict's values/items, Rust uses `Vec` + id lookup or an insertion-ordered map;
- rendering sorts visible characters by `(layer, character_id)`;
- ticking snapshots `active_characters` sorted by `CharacterId`.

### Effects as a Trait + Static Registry

```rust
pub trait Effect {
    fn build(&mut self, ctx: &mut EngineCtx);          // Python __init__/build()
    fn next_frame(&mut self, ctx: &mut EngineCtx) -> Option<String>;  // __next__
}
```

`effects/mod.rs` holds a static registry (name → clap `Command` + constructor), replacing Python's `pkgutil` discovery. `--random-effect` / `--include-effects` / `--exclude-effects` / `--seed` all work as upstream, including the quirk that a randomly selected effect runs with pure default config.

### Python-Shaped RNG

`rng.rs` implements a set of Python-shaped methods backed by xoshiro256++, each matching every call TTE makes (counted in the survey):

| Method | Call count | Semantics (pinned exactly) |
|--------|-----------|----------------------------|
| `randint(a, b)` | 61 | closed interval integer |
| `choice(&[T])` | 54 | `seq[randbelow(len)]` |
| `shuffle` | 13 | Fisher-Yates, in Python's order |
| `randrange` | 13 | half-open interval |
| `uniform(a, b)` | 12 | `a + (b-a)*random()` |
| `random()` | 12 | [0, 1) |

The RNG lives on `EngineCtx` and is threaded explicitly — **no globals** — which is precisely what makes the parity harness possible.

### Clock Injection

matrix (reads `time.time()`) and thunderstorm (reads `time.monotonic()`) depend directly on the real clock. A real clock makes parity depend on execution speed: with `frame_rate=0`, a faster implementation produces more frames and consumes more RNG draws before a deadline. The solution is a `Clock` trait on `EngineCtx`: the production impl reads real time, the parity impl is virtual (advancing a fixed `1/frame_rate` per frame), and the Python shim monkeypatches `time.time`/`time.monotonic` with the same virtual clock.

### pycompat: The Containment Facility for Fidelity Traps

Everything that a "natural translation" would silently diverge from Python is concentrated in `pycompat.rs`, and every helper has tests pinned to Python-generated golden values:

- `round_half_even`: banker's rounding, used for every coordinate quantization, `Path.max_steps`, animation frame indices;
- `floor_div`: floor division, used for gradient channel deltas;
- `trunc`: truncation, used in `shift_color_towards`.

Plus `geometry.rs`'s faithfully reproduced "doubled row" convention (the cell-aspect ratio), `hexterm.rs`'s verbatim 256-color nearest-match table, and `input.rs`'s "mini terminal emulator" (a CSI-only ANSI parser) — these details stacked together are what make "byte-identical" credible.

## Performance Data: Why the Port Was Worth It

On a 200×50 terminal canvas, with pacing disabled (measuring throughput rather than `sleep()`), rendering a whole animation:

| At 200×50 cells | frames | ttfx | Python TTE | ttfx fps |
|-----------------|--------|------|------------|----------|
| slide | 375 | 76 ms | 2,203 ms | 4,930 |
| beams | 732 | 181 ms | 5,564 ms | 4,050 |
| rings | 1,566 | 521 ms | 10,439 ms | 3,004 |
| waves | 633 | 374 ms | 8,745 ms | 1,693 |
| startup | — | 0.5 ms | 64 ms | — |

**Conclusion**: across the 35 effects that aren't gated on wall-clock time, the median speedup is **27.5×** (range 17.1×–47.4×). Only the two time-gated effects are exceptions — `matrix` and `thunderstorm` spend most of their runtime in a fixed animation duration that no implementation can shorten, so they come in at 1.9× and 1.3×; what ttfx buys there is a far higher frame rate inside that window, not a shorter one.

Interestingly, the performance philosophy is restrained: plan.md explicitly says "Performance target: not a goal beyond 'never the bottleneck'". The O(n²) upstream algorithms (outside-in sort, grouped scans) are **kept as-is for fidelity**, because they are trivially fine at terminal scale. Performance is a natural result of the correct architecture, not a goal in itself.

## The 37 Effects at a Glance

All effects animate the same input (the Omarchy logo); every frame comes out of the Rust binary and is byte-identical to the Python original:

| Effect | One-line description |
|--------|---------------------|
| **beams** | Beams travel over the canvas illuminating the characters behind them |
| **binarypath** | Binary representations of each character move towards the home coordinate |
| **blackhole** | Characters are consumed by a black hole and explode outwards |
| **bouncyballs** | Characters are bouncy balls falling from the top of the canvas |
| **bubbles** | Characters form into bubbles that float down and pop |
| **burn** | Burns vertically in the canvas |
| **colorshift** | A gradient shifts colors across the terminal |
| **crumble** | Characters lose color, crumble into dust, get vacuumed up, and reform |
| **decrypt** | A movie-style decryption effect |
| **errorcorrect** | Some characters start in the wrong position and are corrected in sequence |
| **expand** | Expands the text from a single point |
| **fireworks** | Characters launch and explode like fireworks and fall into place |
| **highlight** | A specular highlight runs across the text |
| **laseretch** | A laser etches characters onto the terminal |
| **matrix** | Matrix digital rain effect |
| **middleout** | Text expands in a single row or column in the middle of the canvas then out |
| **orbittingvolley** | Four launchers orbit the canvas firing volleys of characters inward |
| **overflow** | Input text overflows and scrolls in random order until eventually ordered |
| **pour** | Pours the characters into position from the given direction |
| **print** | Lines are printed one at a time following a print head |
| **rain** | Rain characters from the top of the canvas |
| **randomsequence** | Prints the input data in a random sequence |
| **rings** | Characters are dispersed and form into spinning rings |
| **scattered** | Text is scattered across the canvas and moves into position |
| **slice** | Slices the input in half and slides it into place from opposite directions |
| **slide** | Slide characters into view from outside the terminal |
| **smoke** | Smoke floods the canvas colorizing any characters it crosses |
| **spotlights** | Spotlights search the text area, illuminating characters, then converge and expand |
| **spray** | Draws the characters spawning at varying rates from a single point |
| **swarm** | Characters group into swarms and move around before settling into position |
| **sweep** | Sweep across the canvas to reveal uncolored text, reverse sweep to color it |
| **synthgrid** | A grid fills with characters dissolving into the final text |
| **thunderstorm** | Creates a thunderstorm in the terminal |
| **unstable** | Spawn jumbled, explode to the canvas edge, then reassemble correctly |
| **vhstape** | Lines glitch left and right and lose detail like an old VHS tape |
| **waves** | Waves travel across the terminal leaving behind the characters |
| **wipe** | Wipes the text across the terminal to reveal characters |

Every effect takes its own options — `ttfx <effect> --help`. A few GIFs in the README shorten a timed phase so the loop stays watchable (e.g. `matrix --rain-time 3`); everything else is stock.

## Detailed Getting-Started Tutorial

### 1. Building

Building ttfx is dead simple — you only need the Rust toolchain:

```sh
# Normal release build (links system libc/libm/libgcc)
cargo build --release

# Fully static musl build (~3.3 MB, zero dynamic deps)
cargo build --release --target x86_64-unknown-linux-musl
```

Running the full test suite:

```sh
./bin/test        # all 6 suites (needs python3)
```

The parity suite needs a copy of upstream, which it clones at the pinned commit on first run (`./tools/parity/fetch_reference.sh` can be run by hand). Upstream is **not** vendored into the repo — "because it's their code."

### 2. Basic Usage

```
<producer> | ttfx [terminal options] <effect> [effect options]
```

Four out-of-the-box examples:

```sh
ls -la | ttfx decrypt            # a directory listing that decrypts
cat banner.txt | ttfx beams      # a banner illuminated by beams
fortune | ttfx --random-effect   # surprise me (filter with --include-effects/--exclude-effects)
git log --oneline -10 | ttfx matrix   # git log as digital rain
```

### 3. Terminal Options vs Effect Options

This is an easy trap to fall into; the rule is simple:

- **Terminal options go before the effect name**: canvas size and anchoring, color handling, frame rate, text wrapping;
- **Effect options go after the effect name**: per-effect parameters.

```sh
ttfx --help                 # all 37 effects + terminal options
ttfx <effect> --help        # options for one effect
ttfx --print-completion bash|zsh   # generate shell completions
```

**Option names and defaults match `tte` exactly** — so existing invocations (like `ls | tte decrypt --typing-speed 2`) work with the binary name swapped. That is the direct payoff of the CLI-compatibility goal.

### 4. Terminal Option Examples

```sh
# Fixed canvas size, ignoring real terminal dimensions (common in scripts/tests)
ttfx --canvas-width 80 --canvas-height 24 --ignore-terminal-dimensions beams

# Adjust frame rate
ttfx --frame-rate 30 slide

# Reuse the canvas (no scroll-make-room)
ttfx --reuse-canvas decrypt
```

### 5. Behavior Details

- **Input**: stdin (empty when tty), `--input-file`; empty/whitespace input → `NO INPUT.` on stdout, exit 1;
- **Exit codes**: 0 success; 1 runtime errors — no input, missing effect, file errors (message on *stdout*); unsupported ANSI sequence (message on *stderr* — yes, really that asymmetric); 2 usage errors from argument parsing (argparse/clap convention);
- **Signals**: SIGINT is recorded via flag/self-pipe and *returns control to the main loop*, which unwinds normally so RAII teardown runs (`Drop` alone doesn't fire on a signal); exit 1, no message (matching KeyboardInterrupt);
- **Decoding**: strict UTF-8, no lossy decoding;
- **Scope**: Linux and macOS. The byte-exact parity suites stay pinned to Linux/glibc — Apple's libm rounds a few transcendentals a last-ulp differently, which quantization hides in real frames but a bit-exact comparison would surface.

## The Fidelity Verification System: A Checkable "Byte-Identical"

This system is the most worth-learning methodology in the project, in three layers:

**Layer 1: Shared random source.** A portable xoshiro256++ is implemented once in Rust and once in the Python shim. The shim monkeypatches `random.randint/choice/shuffle/randrange/uniform/random` before importing TTE. Both sides now draw identical random sequences — provided the RNG call order matches, which is exactly what faithful transcription guarantees and what the harness verifies.

**Layer 2: Pinned ordering.** The shim also patches every unordered-iteration site in the plan.md §4.3 inventory (`BaseEffectIterator.update`, render layer ties, effect-level set iterations in middleout/unstable, `BreadthFirst`'s links-set traversal) to the same canonical orders as the Rust port.

**Layer 3: Guarding against "proving parity with a modified TTE".** Because the shim modifies the reference, there is a separate audit: every deterministic (RNG-free, clock-free) effect and the whole M0 preprocessing matrix are **also** byte-compared against a completely unmodified pinned CPython run; the shim's patches are limited by construction to ordering/RNG/clock substitution (the diff is small, reviewed, and committed alongside the harness).

**Frame capture**: the Python side iterates the effect with `frame_rate=0` and a fixed canvas, writing each frame string to a length-prefixed dump; the Rust side does the same via a hidden `--parity-dump <seed>` flag; a differ compares the streams and reports the first divergent frame/row/column with a decoded escape view.

**Test matrix**: per effect, 2–3 input texts (ASCII multiline, colored-ANSI input, ragged short input) × default config × 1–2 non-default configs exercising that effect's options; plus the option-matrix suite for M0 preprocessing. PTY byte-stream tests bypass frame dumps and compare the two implementations' **full output streams** under a pseudo-terminal: canvas prep, DEC save/restore, teardown — including the `--reuse-canvas`/`--no-eol`/`--no-restore-cursor` variants and the SIGINT path.

Should an effect's RNG interleaving ever prove unmatchable (currently zero), there is a tier-2 fallback: structural frame comparison + manual visual sign-off against side-by-side recordings. Goal: **zero tier-2 effects**.

## Key Takeaways: The Viewpoints

### Point 1: Language choice follows the "living environment", not the "library identity"

TTE is written in Python, which is correct as a library; but when the same tool lives in a shell pipeline, the 65 ms import and interpreter dependency become a real liability. **The same software needs different delivery shapes in different host environments.** ttfx did not "rewrite to improve the algorithms" — it simply swapped in a carrier better suited to the host environment, and got a 27.5× median speedup and 0.5 ms startup for free.

### Point 2: "Pixel-perfect" can be proven mechanically

Most port projects are accepted by human eyeballs. ttfx proves that once you **turn randomness into an injected dependency** (shared PRNG), **pin ordering into a canonical form** (sorted/insertion order), and **virtualize time** (virtual clock), "byte-identical" goes from a slogan to 354 automated checks in CI. Determinism is the foundation of testing.

### Point 3: The highest virtue of a port is restraint

Faced with 20 upstream "bugs", ttfx chose to **reproduce rather than fix** — because fixing breaks equivalence, and equivalence is the project's entire value. It even treats the "allowed divergence list" (§5 deliberate divergences) as the only legal scope of change, listing "scope creep into 'improving' TTE" as a risk with mitigations. **In a port, fidelity is scarcer than cleverness.**

### Point 4: Performance is the result of correct architecture, not a goal

The counterintuitive "performance is not a goal beyond never being the bottleneck" statement in plan.md runs deep: the arena architecture, synchronous events, explicit RNG threading — designs made for *equivalence* — incidentally produced a 27.5× speedup. O(n²) algorithms are kept because they are trivial at terminal scale. **Correctness first, then speed; speed is a byproduct of correctness.**

### Point 5: The single binary respects the "pipeline toy" niche

The `<producer> | ttfx <effect>` usage demands extremely low startup cost and frictionless installation. The 3.3 MB static binary, zero runtime deps, and `--print-completion` completions — every decision serves the "live in a pipeline" niche. It also solves distribution: download and run, no Python version hell.

### Point 6: Open-source ecosystem etiquette

"File effect ideas upstream", upstream code not vendored ("because it's their code"), MIT license preserving the original author's copyright, full attribution in NOTICE — **how a port should coexist with upstream** gets a textbook answer from ttfx.

## Use-Case Analysis

### When ttfx shines

✅ **Highly recommended:**

- **Omarchy users**: the project was built for Omarchy, ready out of the box;
- **Heavy shell users**: turn `git log`, `ls`, `fortune` output into a visual show at zero cost;
- **Demos and screen recordings**: terminal demos want "cinematic feel", 37 effects plug-and-play;
- **CI/script environments**: 0.5 ms startup + static binary, runs in containers too;
- **Developers who value determinism**: `--seed` makes effects reproducible, great for tests and tutorial screenshots;
- **Rust learners**: `plan.md` itself is an excellent engineering document on "how to do a parity port".

⚠️ **Consider first:**

- **Users who need Python plugin effects**: ttfx doesn't support TTE's plugin mechanism (no interpreter);
- **Users who need `--seed` interop with the Python version**: RNG algorithms differ, not reproducible across implementations;
- **Non-Linux/macOS platforms**: Windows is out of scope.

### What it deliberately doesn't try to solve

- Not a replacement for TTE (for library use cases, keep the Python version);
- Doesn't pursue "improving" the effects (send effect ideas upstream);
- Doesn't handle wide characters (one codepoint = one cell, matching TTE, documented as a known limitation).

## The Omarchy Connection

ttfx was born **only** for Omarchy — plan.md says "Linux only, targeted exclusively at Omarchy (Arch)". The two are a pair: Omarchy provides the opinionated, beautiful, modern Linux desktop, and ttfx provides the equally opinionated terminal show for that desktop. Support later widened to macOS, but the lineage is clear: this is a tool grown from the niche of "polishing to perfection for one specific distribution", not a generic project trying to please everyone. That "do the best for a specific group of users" attitude is cut from the same cloth as Omarchy's philosophy.

## Conclusion

On the surface ttfx is a terminal toy; underneath, it is a **manifesto of porting engineering**. It demonstrates three rare things:

1. **What seriousness means** — not "feature parity", but "byte parity", proven with mechanical tests;
2. **What restraint means** — reproducing 20 upstream quirks, listing "improvement" as a risk, explicitly "the port adds nothing";
3. **What a correct view of performance means** — an architecture designed for equivalence incidentally delivers a 27.5× speedup, while performance itself is never treated as a goal.

If you work in a terminal, enjoy a bit of visual magic, or are thinking about "how to port a large project from one language to another", ttfx's README, plan.md, and 37 effect GIFs are worth an afternoon of your time. The moment you run it, `ls -la | ttfx decrypt` will tell you: **a 0.5 ms startup delay buys a show where every frame is worth waiting for.**

---

**References:**

- [ttfx GitHub repository](https://github.com/omacom-io/ttfx)
- [TerminalTextEffects (the upstream original, by ChrisBuilds)](https://github.com/ChrisBuilds/terminaltexteffects)
- [Omarchy (where ttfx was born)](https://omarchy.org)