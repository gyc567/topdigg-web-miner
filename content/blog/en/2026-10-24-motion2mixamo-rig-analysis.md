---
title: "Motion2MixamoRig Deep Dive: Turning Real-Person Video into a Mixamo Character, What This Project Got Right"
date: "2026-10-24"
description: "The open-source project Motion2MixamoRig retargets a person's motion from video onto a 3D character driven by Adobe Mixamo rigs. This article breaks down its complete pipeline, the fixes for foot sliding and body clipping, the math of finger retargeting, the diagnostic system, and six design philosophies that run through the code."
author: "瑞哥观势"
tags:
  - Motion Capture
  - Motion Retargeting
  - Mixamo
  - Blender
  - GVHMR
  - Open Source Project
categories:
  - 开源项目解析
  - 深度观察
---

# Motion2MixamoRig Deep Dive: Turning Real-Person Video into a Mixamo Character, What This Project Got Right

Let me start with the conclusion.

If you already have a Mixamo character (that rig Adobe gives away for free) and now want to put a real person's motion on it, this job used to mean either outsourcing or buying motion capture gear, and either way the price runs from a few thousand to tens of thousands of RMB per order.

Motion2MixamoRig turns this into: set up a Python environment, drop in a video, wait a dozen-odd minutes, and get a `.glb` you can drop straight into Blender or Unity.

**But what is really worth looking at in this project is not how much money it saves, but the way it goes about solving the problem of "motion retargeting".**

I will take apart its complete pipeline, the solutions to six key problems, and the design philosophy hidden in the code comments.

---

## I. Project Description: What It Actually Does

Motion2MixamoRig was developed by MaxLiu22, is licensed under Apache-2.0, was open-sourced on August 29, 2026, and currently has 1583 stars and 200 forks. It is implemented in Python, the `motion2mixamorig` package is 10742 lines, and the Blender plugin part is 5922 lines.

### One-Sentence Definition

**Input a single-person video (or a single photo), output a 3D character file driven by the Adobe Mixamo rig, with complete skinning and animation.**

### The Complete Pipeline

```
Video / Photo
    ↓  ① Precheck (content check, not an existence check)
    ↓  ② Human motion extraction (GVHMR, 24 SMPL joints)
    ↓  ③ Foot contact detection (4-channel static confidence)
    ↓  ④ Retargeting onto the Mixamo rig (swing / twist decomposition + FK)
    ↓  ⑤ Foot locking (analytic two-bone IK)
    ↓  ⑥ Ground correction (vertical hip translation)
    ↓  ⑦ Skinning export (GLB + per-bone rotation)
    ↓  ⑧ Self-intersection diagnosis (read the GLB directly for linear blend skinning)
Video input → 4 preview videos; photo input → 4 preview images + 360° orbit comparison
```

### Two Ways to Use It

**Blender plugin (for non-programmers)**

Download the zip for your platform from GitHub Releases (currently only `macos-arm64`), install it in Blender via `Edit → Preferences → Get Extensions → ∨ → Install from Disk…`, press `N` in the 3D viewport to open the sidebar, click `Install Runtime (one click)` to have the standalone Python runtime installed automatically, then select the SMPL-X model, select the Mixamo FBX, select the video, and click `Generate Motion`.

**Command line (for developers)**

```bash
m2mr doctor          # check assets and dependencies, tells you where to get whatever is missing
m2mr run             # use the newest video in assets/video/ + Y_Bot.fbx
```

The core design of the plugin is **that it never touches Blender's Python**. The plugin itself does not import PyTorch, does not import GVHMR, does not import OpenCV; it only starts an external process:

```text
<external-python> -m motion2mixamorig.cli run ...
```

This external Python is either the runtime the plugin installs with one click into `~/Motion2MixamoRig`, or a venv the user specifies themselves. This isolation is done very cleanly, and it avoids the hell of Blender's bundled Python version and pip environment.

### Project Scale at a Glance

| Item | Number |
|---|---|
| Core Python | 10742 lines |
| Blender plugin | 5922 lines |
| README translations | 18 languages + English |
| User guide translations | 18 languages + English |
| Plugin UI languages | 19 |
| Inference weight download | about 5 GB (+2.7 GB for hands) |
| CPU processing of a 30-second clip | 8-15 minutes the first time, 3-5 minutes afterwards |

**An easily overlooked detail**: the README and user guide of this project have already been translated into 18 languages, with the Chinese version in `docs/i18n/README.zh-Hans.md` and `docs/i18n/user-guide.zh-Hans.md`. But `AGENTS.md`, `CHANGELOG.md`, `NOTICE.md`, `docs/blender-extension.md`, `docs/c4d-fbx-support.md`, and `docs/release-checklist.md`, these six core documents **have no Chinese version**. The translations later in this article are exactly here to fill in those six gaps.

---

## II. Detailed Tutorial: Getting Your First Motion Running from Scratch

### Step 0: Prepare the Assets

The repository does not ship these files (they involve their own research licenses and Adobe's terms of use), you have to get them yourself:

| What to put | Where to put it | Where to get it |
|---|---|---|
| SMPL-X body model | `assets/body_models/smplx/SMPLX_NEUTRAL.npz` | Register for [SMPL-X](https://smpl-x.is.tue.mpg.de/) then download the NPZ version |
| Mixamo character FBX | `assets/mixamo/Y_Bot.fbx` | Log into [Mixamo](https://www.mixamo.com) with an Adobe account and download |
| Motion video | `assets/video/<name>.mp4` | Only one person, head to toe inside the frame the whole time |
| Pose photo (optional) | `assets/image/<name>.jpg` | Same as above, used together with `--image` |
| MANO right hand model | `assets/body_models/mano/MANO_RIGHT.pkl` | Register for [MANO](https://mano.is.tue.mpg.de/) and download Models & Code |

**The trap most newcomers fall into**: the file downloaded from Mixamo is called `Y Bot.fbx` (with a space in the middle), while the default read path is `Y_Bot.fbx` (with an underscore), a difference of one character. Rename it and it becomes the default character; not renaming is fine too, because when the file is not found the program automatically uses the first `.fbx` in `assets/mixamo/`.

The **asset requirements** are strict: there can be only one person in the frame, and the head-to-toe body must stay in frame the entire time. `m2mr doctor` and `m2mr run` detect the number of people during the precheck stage and stop immediately if they find two people, so you do not waste a dozen-odd minutes on extraction.

### Step 1: Install

```bash
git clone https://github.com/MaxLiu22/Motion2MixamoRig.git
cd Motion2MixamoRig
python -m venv .venv && source .venv/bin/activate

pip install --upgrade pip setuptools wheel \
  && pip install "numpy>=1.26" \
  && pip install --no-build-isolation "chumpy==0.70" \
  && pip install -e .
```

That `--no-build-isolation` is not optional. `chumpy` is an old package in the GVHMR dependency chain, and its setup script imports pip, which necessarily fails with `No module named 'pip'` inside pip's default isolated build environment. You must turn off isolation and install it separately first.

It is also recommended to install ffmpeg (`brew install ffmpeg` or `apt install ffmpeg`). Without it the pipeline still runs to completion, but the output video has no audio and the encoding format cannot be played directly in a browser.

### Step 2: Health Check

```bash
m2mr doctor                 # only check the body path
m2mr doctor --detect-hands  # also check the hand detection files and Python packages
```

What `doctor` does is far more thorough than "checking whether the file is there". It looks **inside** the files, because the most common real failure is not a missing file but a wrong file:

- The SMPL-X vertex count is 10475 and SMPL is 6890, so the model family is identified by vertex count, **not by file name** (this prevents someone from renaming SMPL to SMPLX)
- The first 12 bytes of the FBX are read as a magic number to determine whether it is Binary format, and ASCII FBX is rejected outright
- 16 frames are sampled and YOLO person detection runs, and two people means the input is judged unusable
- "Stamp-sized" people whose area ratio is below 1.5% are filtered out (spectators, posters), and a second person larger than that raises an alarm

### Step 3: First Run

```bash
m2mr run
```

The first run downloads about 5 GB of inference weights into `weights/` (GVHMR, HMR2, RTMPose/ViTPose 2D pose, YOLOv8 person detection). This step only happens once.

Processing a 30-second clip on CPU: 8 to 15 minutes the first time, 3 to 5 minutes once the weights are in place. Retargeting and rendering usually take one or two minutes.

**The weight download is automatic, but the license of the inference weights is not this project's to manage.** The README explicitly lists every upstream license, which is a responsible way to do things.

### Step 4: Swap Characters Without Repeating Extraction

This is the most practically useful design in the whole tool.

Extracting human motion is the slow step, retargeting is the fast step. So the skeleton is stored on its own as a file:

```bash
m2mr run --skeleton outputs/20260829_193205_dance/skeleton_motion.npz \
         --rig assets/mixamo/Vampire.fbx
```

**Minutes become tens of seconds.** The same motion can be swapped onto any of ten Mixamo characters, and the cost is essentially just the retargeting part.

### Step 5: Add Fingers

```bash
m2mr run --video assets/video/dance.mp4 --detect-hands --hand-smooth 0.08
```

`--detect-hands` enables the HaMeR hand model, crops the wrists from the body, estimates finger rotations on the frames already selected by GVHMR, writes them into `skeleton_motion.npz`, and drives Mixamo's 30 finger bones.

Three things you must know:

1. **The time cost doubles**. Hand detection is layered on top of body extraction, it is not run in parallel.
2. **2.7 GB of extra weights are downloaded the first time** into `weights/hamer/`.
3. **You do not need to repeat the flag when reusing the skeleton**. If hand motion is already stored in `skeleton_motion.npz`, `--skeleton` drives the fingers by itself. If it is not stored but the body cache is still next to it, adding `--detect-hands` can fill in only the fingers without rerunning the body. Only when the cache is gone do you need to rerun the video.

`--hand-smooth` is the smoothing duration in seconds for the finger rotations, 0.08 by default, and 0 means the raw estimates.

### Step 6: Look at the Diagnostics

```bash
m2mr diagnose outputs/<run>                        # recompute diagnostics
m2mr diagnose outputs/<run> --visualize            # additionally generate diagnostics.html
m2mr diagnose outputs/<run> --threshold-cm 2       # only report depths beyond 2 cm
```

Every `m2mr run` automatically checks whether the finished character self-intersects (one body part pushed into another, for example a hand going into the head) and writes `diagnostics.json`. The terminal prints a one-line summary:

```
diagnostics: 14 self-intersection(s) over 116 of 719 frames, deepest 7.87 cm
```

**Note one important design: a failed check does not make the run fail.** The report is information, not a gate. The author leaves the judgment to the user.

`diagnostics.html` is a more complete report: the source video and the character side by side, a timeline, a clickable list of issues, and a 3D view that loads three.js from a CDN. Markers are fixed on the floor (a cross every 0.5 meters, a bigger cross every meter, the origin in green), so you can tell whether the character is actually walking or sliding.

### Step 7: Manual Annotation and Local Repairs

Some problems only the eye can spot: the foot slid, the knee popped, the hand did not reach the body. These are **not** in `diagnostics.json`.

`diagnostics.html` has an amber annotation track above the self-intersection track. You can drag-select a range of frames, fill in In / Out, and write down the issue. The Notes list on the right will list them, and clicking a line jumps to that frame. **Download notes** saves the annotations together with the self-intersection list into `<video name>_review.json`.

This file has an official schema: `m2mr-review-v1`.

```json
{
  "schema": "m2mr-review-v1",
  "run": "20261024_032240_beat_it_shotaro_test_input_compatible",
  "video": "/absolute/path/to/assets/video/beat_it.mp4",
  "rig": "/absolute/path/to/assets/mixamo/Y_Bot.fbx",
  "fps": 30,
  "frame_count": 554,
  "manual_annotations": [
    {"id": "n1", "start_frame": 380, "end_frame": 410, "start_s": 12.667, "end_s": 13.667, "note": "left foot slides"}
  ],
  "self_intersections": [
    {"kind": "self_intersection", "parts": ["left_hand", "left_thigh"], "ranges": [[372, 373], [378, 381]], "max_depth_cm": 7.37, "also_in_rest_pose": false}
  ]
}
```

Hand this JSON, together with the character file or the skeleton file, back to the AI or the developer, and it will **redo the Mixamo animation only for the annotated frame range**, writing to a new directory, and **the original run result is preserved untouched**.

**This "never overwrite, only incrementally repair" design is, in my view, the mark of this project outpacing its peers in engineering maturity.**

### Step 8: Import into Blender

`File → Import → glTF 2.0 (.glb/.gltf)`.

A few points that easily confuse people:

- If the camera is pointed at empty space, select the character mesh and use `View → Frame Selected`
- The cluster of spheres on the head and hands is the bone display, not the mesh, so hide `Icosphere` and the armature in the Outliner and **keep only the skinned mesh visible**
- The scene FPS must be read from `run.json`, and the timeline set from 0 to `n_frames - 1`, so the frame numbers line up with `diagnostics.json`
- The character is one object per FBX geometry (Y Bot has two: `skinned_mesh_0_Alpha_Surface` and `skinned_mesh_1_Alpha_Joints`)

### Step 9: Photo Mode

```bash
m2mr run --image assets/image/pose.jpg
```

A static 3D pose is recovered from a single photo, going through exactly the same retargeting path as the video. The output is four images under `images/` (from the same viewpoints as the video version), plus a `before_after_360_compare.mp4`: the original photo on the left, the character on the right in a full orbit of 10 degrees per step.

**You cannot pass `--video` and `--image` at the same time.**

### Complete Command Reference

| Command | Purpose |
|---|---|
| `m2mr doctor` | Check assets and dependencies |
| `m2mr run` | Newest video + Y_Bot, run the full pipeline |
| `m2mr run --video X --rig Y` | Specify input and character |
| `m2mr run --image X` | Photo mode |
| `m2mr run --skeleton X --rig Y` | Reuse the extraction, only swap the character |
| `m2mr run --no-foot-lock` | Keep the original retargeting (the feet will slide) |
| `m2mr run --detect-hands --hand-smooth 0.08` | Enable fingers |
| `m2mr diagnose <run> --visualize` | Recompute diagnostics and produce the HTML report |
| `m2mr run --output-dir DIR --progress-jsonl F --no-preview` | For the plugin and for automation |

---

## III. Six Hard Problems and Their Solutions

This section is the core of the whole article. Motion retargeting looks like "moving A's joint angles onto B's rig", but when you actually do it there are six independent traps.

### Problem One: How to Read the Rest Pose of the Mixamo Rig

The original Mixamo FBX encodes each joint's binding orientation in `PreRotation`. But many people open the file in Blender or Cinema 4D and export it again, and this information gets rewritten or even discarded.

If you rebuild the rest pose with local Euler angles, the joint coordinate systems you get are wrong, **and the deeper down the hierarchy they go, the worse the error becomes**: the rest pose is wrong, the skinning breaks, and it is already wrong even when not a single frame of animation is added.

**The project's solution is a three-tier priority binding matrix recovery**:

1. The FBX `Pose` / `PoseNode.Matrix` (use this when it exists)
2. The skin cluster `TransformLink` (use this when there is no Pose record; when several meshes link to the same joint, pick the one whose matrix is closest to the rest, because rotation matrices cannot be averaged)
3. The local transform properties (for joints that have neither, usually the terminal bones)

The author also pasted verification data into `docs/c4d-fbx-support.md`: for the original Mixamo FBX and the Cinema 4D exported version, the core bones are 25 in both and the full rig is 33 in both, the maximum rest FK matrix errors are `1.7e-14` and `3.2e-14` respectively, and the rest skinning errors are `6.5e-14` cm and `2.0e-13` cm.

**And there is no regression**: running Y Bot with the same `skeleton_motion.npz` (787 frames) before and after the change, the per-bone rotation difference stays within `4e-7` (floating point precision), and the skinned vertex positions in Blender differ by 0.5 micrometers.

### Problem Two: The Mathematical Skeleton of Retargeting

The core of retargeting in the whole project is a single formula, with the comment written at the top of `kinematics.py`:

```
M_local = T_bind * R_bind * R_anim
M_world = M_parent_world * M_local
```

Three key points:

**R_anim is the increment relative to the binding orientation**, not the absolute orientation. This is the foundation of the whole architecture. With it, the same animation can be applied to any rig whose rest pose differs.

**Mixamo's rest bone lengths are never scaled**. The character's arm is as long as it is, and the animation only changes orientation, never proportions. This is a mistake many tools make (scaling bone lengths to match human proportions), and once scaled it can never be undone.

**FK with the full binding rotation**. Some libraries store `PreRotation` separately; this project keeps it as a compatibility alias on `MixamoBone`, but the actual computation goes through the full local binding orientation.

There is also a self-check function `verify_rest_fk` in `retarget.py`: when `R_anim` is the identity matrix, FK must reproduce the FBX rest pose exactly, and an error above `1e-4` throws an exception immediately. **This turns "did I get the binding rotation composition wrong" into a hard error that crashes at startup, rather than a weird motion that only shows up halfway through the run.**

**Swing / Twist decomposition** is standard practice: splitting each bone's rotation into "where it points" and "how much it turns around that pointing direction". The project maintains a bunch of tables such as `SWING_TARGETS` (bone → which two human joint direction vectors determine the swing), `AIM_CHILD` (which child bone determines a bone's rest axis), and `MIXAMO_TO_HUMAN` (Mixamo bone → SMPL joint mapping).

There is one comment here that is particularly worth reading, because it explains a very specific trap:

> Neck/Head cannot aim along the SMPL neck→head direction. That vector is only about 9 centimeters, it is the offset from the neck to the skull, and it differs from the vertical direction by 50 to 70 degrees; aiming along it makes Mixamo's much longer neck bone and head bone flail around. `spine3→head` is the stable upward direction (the skull is above the chest), while still using the Human head joint. The joint mapping stays neck→Neck, head→Head.

**There is one more**: Mixamo's Neck→Head and Head→HeadTop rest translations are not along the local +Y (they carry a forward +Z offset), and aiming at that offset tilts the neck and head bones. So Neck/Head instead swing along the local +Y.

This density of comments shows that the author has been bitten by these specific problems.

### Problem Three: Feet Sliding on the Ground

This is the classic failure of every motion retargeting tool. The foot should be nailed to the ground, but the retargeted character's feet slide across the floor like ice skates.

**The project's solution has two layers.**

The first layer is **foot locking** (`foot_lock.py`). GVHMR predicts a "static confidence" for four joints in every frame: left heel, left toe, right heel, right toe. The heel and the toe are **locked independently**, so a flat plant, a toe stand, and a heel strike each nail down the part that is actually touching the ground.

The confidence handling uses **hysteresis**: entering contact requires a confidence above 0.8, while exiting only requires it to drop to 0.5. `ENTER_CONF = 0.8`, `EXIT_CONF = 0.5`. This design avoids contact chattering back and forth around a threshold value, and the resulting jitter is worse than the jitter itself. Contact segments shorter than 0.1 seconds are discarded outright.

Each contact segment pins its lock point to **the average position of that segment**. The correction amount fades out over a short window on both sides of the segment, so the swing leg does not bounce.

**The toe wins over the heel**. The comment explains why: the two anchors come from different contact segments and there is no rigid foot-length relationship between them, so pinning both at once would twist the foot. So when both the toe and the heel are on the ground, the toe gets pinned. The foot keeps its original world orientation, so a toe stand still rotates around the pinned toe.

Next is **analytic two-bone IK**: `UpLeg` and `Leg` are solved to the ankle joint target, with the knee kept inside its original bending plane. **When a straight leg cannot reach the anchor, the hips are translated as a whole** so that every grounded hip joint can reach it, and both hip joints share this translation. **Nothing here is snapped to the floor**, it only removes the drift during contact.

The second layer is **ground correction** (`ground.py`). What foot locking pins is "where the foot already is", but that is the height of the skeleton joint, not the height of the floor. The soles of the character's feet are still some distance below the bone joints, and the recovered height also drifts over the course of a video, so the result is a character that floats above the ground or sinks into it.

The solution is: **sole = the lowest skinned vertex of that part** (the heel is `Foot`, the toe is `ToeBase` / `Toe_End`). On grounded frames, the hips are translated vertically so that the lowest vertex lands on `y = 0`. A grounded segment keeps the offset of its own lowest frame, so the foot can lift while stepping but will not sink. Airborne frames transition smoothly from the previous grounded segment to the next, **which preserves the height of jumps while also removing the slow drift between steps**.

The effects of both stages are recorded in `run.json`: the `foot_lock` and `ground` subsections.

**Note one detail**: even with `--no-foot-lock` (keeping the original retargeting, feet will slide), ground correction **still runs**. Because landing and drift removal are two different things.

### Problem Four: Left-Right Flipping in 2D Pose Estimation

RTMPose / ViTPose judge left and right by appearance frame by frame, **with no memory**. If the person in the frame turns around and a single frame gets labeled wrong, the whole body spins 180 degrees in place in 3D.

The comment in `stabilize_kp2d.py` in the project explains this mechanism very clearly:

> The **orientation sign** of a frame is the `sign(x_left - x_right)` of the shoulders (when the shoulders collapse together, the hips are used). Two facts drive the rule:
>
> - A real 180-degree turn passes through a side view, where the orientation sign changes while the shoulder width approaches zero (a "narrow" frame)
> - Label flips are isolated: a few frames with the opposite sign, surrounded by frames with a consistent sign, and the shoulder width is full

So the rule is: **cut the video into segments at the narrow frames, and take the majority value of the RTMPose labels within each segment**. A run of the opposite sign inside a segment that is shorter than about 0.33 seconds is judged a flip and gets corrected; a longer one is treated as a real turn that was "too fast to produce a side view" and is preserved.

A narrow frame sandwiched between two consistent segments is forced into that sign (flips can also happen near a side view); a narrow frame sandwiched between two inconsistent segments means the turn is in progress, and the estimator's label is preserved.

**This set of rules does not look at faces, so hats and masks do not affect it.** And every decision is based on a whole segment rather than on a single turning-point frame, so **one bad frame cannot lock the entire video into a wrong state**.

The fix is recorded in the CHANGELOG, and the numbers are compelling: **for a dance clip with a fast half-second turn, the frames with the wrong direction dropped from 320 out of 642 frames to 3 frames.**

And when rerunning with an existing cache, it restabilizes from the `vitpose_raw.pt` backup, **rather than continuing from the output of the previous rule**. This detail shows that the author considered at design time that "rules will iterate, and historical data must not be contaminated".

### Problem Five: Finger Retargeting

When `--detect-hands` is on, what HaMeR estimates are MANO joint rotations. And MANO joint rotations are **parent-relative**, and expressed in **the hand model's own coordinate system** (because every MANO rest frame is the identity matrix). The animation channels of Mixamo finger bones are also parent-relative, but expressed in the **own rest coordinate system of that bone**.

So the transfer is a **pure basis change**:

```
R_anim[b] = D_bᵀ · (C · R_mano[j] · Cᵀ) · D_b
```

- `C`: MANO hand coordinate system → Mixamo Hand bone rest coordinate system, computed from the hand coordinate systems of the two rest poses (wrist→middle finger 1, index finger 1→little finger 1)
- `D_b`: the rest world rotation of finger bone b relative to the Hand bone

**This transform is measured from start to finish, never hand-written.** Not a single comment says something like "if it is the left hand, flip X degrees".

HaMeR is a single-image model, so the raw rotations jitter frame by frame. `load_hand_motion` smooths with a **validity-weighted temporal Gaussian**, and fills in short detection gaps from neighboring frames.

### Problem Six: How to Know Whether the Result Is Good

This is the part I think is the most underestimated and the most valuable.

**It does not check whether it "looks right", it checks the finished file itself.**

`diagnose.py` reads `mixamo_character.glb` directly, **poses every frame using the file's own skinning weights** (linear blend skinning, exactly like any glTF viewer), and then detects intersections between body parts.

**The key point: it checks the exported GLB, not the in-memory intermediate state.** This means it measures the thing the user actually ends up holding, including every error that the export step might introduce.

A few design details:

- **Parts that are joint-connected are not compared**. The upper arm and the forearm, the torso and the thigh, their skins overlap or blend at the joint and "intersect" in any pose at all. The `_ADJACENT` set excludes them.
- **Only self-intersection is checked, not the ground**. The comment is written very honestly: ground contact requires a defined floor, and this tool does not have one yet.
- **Frame numbers start from 0**, consistent with the Blender timeline after importing glTF.
- **Fragments of the same pair of parts that are no more than 3 frames apart are merged into one**, so the report is not drowned in fragments.
- The default depth threshold is 1 cm, and `--threshold-cm` is adjustable.

Then there is `diagnostics.html`. This is a self-contained HTML report, with the source video and the character side by side, a timeline, a clickable issue list, and a 3D view that loads three.js from a CDN. **Markers are fixed on the floor** (a cross every 0.5 meters, a bigger cross every meter, the origin in green), so you can tell whether the character is moving or standing still.

**These floor markers were a community contribution.** The CHANGELOG records that the suggestion came from @_____eddie_____ on X, with a concrete link attached. The floor markers appear both in the HTML report and in the `Floor Markers` mesh added on Blender import.

Then there is the **manual annotation track**: an amber track where you drag-select a frame range, write down the issue, and store it as `m2mr-review-v1` JSON. The browser stores it in localStorage under `m2mr-review-v1:<source glb>:<frame count>:<fps>`, **so regenerating the HTML does not lose the annotations**.

**The software boundary is drawn very clearly: what machines can check (self-intersection) machines check, what only eyes can see (foot sliding, knee popping) humans annotate, the two have different carriers and different responsibilities, but they can be delivered together.**

---

## IV. Summary: Six Design Philosophies

Looking at all of the above separately, six design philosophies can be distilled. They are not slogans written in the README, they can be read out of the code.

### Philosophy One: A Single Source of Truth, Coordinate System Defined Only Once

The top of `tpose_calibration.py` says:

> Mixamo Skeleton T-pose ↕ one global calibration ↕ character Rig rest T-pose
>
> The T-pose checking program and the animation retargeting both import this module, so the project has **only one** Front / Right / Up convention.

Even sharper is the second half:

> **There are no manual corrections here**: the anatomical axes are measured from the bone positions, and the alignment uses `B_rig @ B_skel.T`, **with no determinant correction from polar decomposition/SVD, and no per-bone 90/180 degree patches**.

**Those four words, "no patching", are the best annotation of this project's technical character.**

In problems like animation transfer, "add a special case for some bone" is the easiest path, and also the path most likely to turn the system into something unmaintainable. This project explicitly refuses that path and instead derives the convention from geometric measurement.

### Philosophy Two: Make Errors Crash at Startup Instead of Looking Weird On Screen

`verify_rest_fk` is a typical representative: identity animation rotation must reproduce the rest pose exactly, and an error above `1e-4` throws an exception immediately.

The same idea shows up in the content checks in `checks.py` (identifying the model family by vertex count rather than by file name), and in the `rest_fk_error` and `rest_skin_error_cm` recorded in `run.json` on every run.

**Validation is not the last manual step before release, it is part of the system.** Every layer comes with its own self-check, and stops immediately when something is wrong.

### Philosophy Three: Separate the Machine's Judgment from the Human's Judgment, but Merge the Delivery

`diagnostics.json` stores what machines can check (self-intersection, depth, frame ranges), `m2mr-review-v1` stores what only humans can see (foot sliding, hands not reaching).

The former is JSON read by programs; the latter is also JSON read by programs, but the content is the reviewer's own words, **stored exactly as they entered them, not one word changed, stored in whatever language they wrote it in**.

And the purpose of merging the two into one file is very clear: **to make this file the complete input for one repair task**. An AI or a developer who receives it knows which frames to change and what to change.

### Philosophy Four: Incremental First, Never Overwrite

Mentioned above, this is the one most worth pulling out on its own.

- Swapping the character does not rerun the extraction (`--skeleton`)
- Adding fingers does not rerun the body (when the cache is still there)
- Repairs only touch the annotated frame ranges, and are written to a **new directory**
- Rerunning the stabilization computes from the original backup, not from the output of the previous version of the rules

**This "new directory, no overwrite" convention lets the whole flow iterate safely over and over.** If any single repair fails, the original result is still there.

### Philosophy Five: Report Failures, but Do Not Block the Output

A failed self-intersection check **does not** make `m2mr run` fail. Diagnostics are information, not a gate.

This is a very mature judgment. The developer knows that their own hand going into their own head is **their** problem, not the tool's problem. The tool quantifies the problem and hands it over, and the judgment belongs to them.

**If a tool refuses to produce a result just because it "detected a problem", and forces the user to go fix it, that creates even more friction.**

### Philosophy Six: Licenses and Limitations Are Put in the Most Prominent Place

`NOTICE.md` is a standalone document that spells out the terms of every upstream component:

- **GVHMR** (SIGGRAPH Asia 2024): non-commercial research use only
- **SMPL-X**: MPI registration gated, non-commercial research/education/artistic use, commercial use requires a separate agreement
- **MANO**: MPI registration gated
- **Mixamo FBX**: may be shipped with a product, but may not be redistributed as an asset pack
- **YOLOv8** (Ultralytics): **AGPL-3.0**
- The various pose and HMR checkpoints: their own research licenses

The conclusion is written very plainly:

> Because of the restrictions on the upstream components, **the end-to-end pipeline is in practice limited to non-commercial/research use**, regardless of this repository's own license.

The README repeats this passage. The user guide is even more direct: **Motion2MixamoRig is for non-commercial use only**.

**The author did not let the fact that "the code is Apache-2.0" paper over the actual restrictions of the whole chain.** In an open-source project this kind of honesty is rare.

---

## V. How I See This Project

A few of my own judgments.

### It Picked a Real Pain Point

Mixamo characters are a rig asset Adobe gives away for free to everyone, so Blender and Unity users never lack characters, what they lack is **motion**. Motion capture gear and outsourcing services cost from a few thousand to tens of thousands of RMB per order, while "I just need one simple walk cycle or dance move" used to have basically no low-cost solution.

This project drives the cost down to the scale of "download 5 GB of weights plus wait a dozen-odd minutes". **For indie game developers, animation learners and tool developers, this is the step from 0 to 1.**

### Its Technical Weight Lies Not in the Model but in Geometry

Extracting human motion with GVHMR, other people can do that too. **What is genuinely hard is the long tail of geometry and kinematics problems that follow**: how to read the binding orientation, how to verify the rest pose, how to pin the feet, how to correct the ground, how to stabilize left and right, how to rotate the finger coordinate system.

Not one of these jobs can be solved by "running a model"; they are all **things you can only get right if you understand coordinate systems and kinematics**. **In those 10742 lines of code, the part that actually calls the model is small; most of it is geometry.**

### Its Documentation Density Is Rare

The code comments are full of concrete reasoning about "why this way and not that way", not fluff like "compute the rotation matrix". The passages quoted above, for instance "that vector is only about 9 centimeters, it is the offset from the neck to the skull, and it differs from the vertical direction by 50 to 70 degrees", really explain where a bug came from.

For a project that also lets AI agents participate in development (`AGENTS.md` is written for AI), this quality of comments directly determines whether the AI can make the fix correctly.

### It Absorbs Community Feedback Fast

The floor markers came from one specific person on X, and once implemented they were credited with a link in the CHANGELOG. Cinema 4D FBX support came from PR #8, also credited.

**For a project still at the 0.1.x stage, the iteration density and feedback loop are both quite mature.**

### Some Cold Water

**First, it is at the experimental stage.** The README opens with `Motion2MixamoRig is currently experimental`, and it has so far **only been tested on macOS Apple Silicon**, Windows and Linux have not been tested, and the plugin only ships a zip for one platform, macos-arm64.

**Second, the non-commercial restriction is hard.** Covered above, but it is worth emphasizing once more: **whether the animation assets produced with this project can be used commercially depends on the terms of GVHMR and SMPL-X, not on the fact that this repository is Apache-2.0.** Teams that want commercial use need to negotiate the agreements themselves.

**Third, the ceiling on the results is bounded by monocular video itself.** Occluded limbs and misjudged depth under a single viewpoint are information-level losses that no algorithm can make up for. Clear motions such as walking and dancing are its home turf, while multi-person interaction, heavy occlusion and handheld objects are the scenarios where the README's "one person, head to toe in frame the whole time" is a preemptive discouragement.

**Fourth, it is slow on CPU.** A 30-second clip takes 3 to 5 minutes, which is acceptable for personal use but on the heavy side for batch production. A GPU will be much faster, but all the timing numbers in the README are for CPU.

### One Final Observation

I went through this project's CHANGELOG and documentation thoroughly, and what moved me most was not any single technical detail but **its honesty about the boundary of "what can be checked and what cannot".**

It checks self-intersection, because self-intersection can be judged geometrically and the judgment can be quantified in centimeters. It does not check foot sliding, because foot sliding requires understanding intent and the ground. It explicitly writes "ground contact requires a defined floor, and this tool does not have one yet". The clipping it finds does not make the run fail, because that is the user's problem.

**This is a project that knows where its own boundaries are, and does not pretend it can be used beyond them.**

Back to the opening sentence: if you happen to have a Mixamo character waiting for animation, this repository is worth a look.

Let us talk in the comments: how do you solve character animation today? Outsourcing, buying equipment, or hand keyframing? I would really like to see how everyone does it.

---

## Appendix: Project Resources

**Repository**: MaxLiu22/Motion2MixamoRig

**Core Resource List**

| Document | Content | Chinese Version |
|---|---|---|
| README.md | Quick start, command reference | `docs/i18n/README.zh-Hans.md` |
| docs/user-guide.md | Blender plugin user guide (non-programmers) | `docs/i18n/user-guide.zh-Hans.md` |
| AGENTS.md | Architecture notes for AI agents, command manual, Review notes schema | Translation in this article |
| CHANGELOG.md | Complete version change log | Translation in this article |
| NOTICE.md | License terms of each upstream component | Translation in this article |
| docs/c4d-fbx-support.md | Support details and verification data for Cinema 4D exported FBX | Translation in this article |
| docs/blender-extension.md | Maintainer smoke test checklist for the plugin | Translation in this article |
| docs/release-checklist.md | Release checklist | Translation in this article |

**Key Commands**

```bash
m2mr doctor
m2mr run
m2mr run --skeleton outputs/<run>/skeleton_motion.npz --rig assets/mixamo/Vampire.fbx
m2mr run --detect-hands --hand-smooth 0.08
m2mr diagnose outputs/<run> --visualize
```

**License**: the code in this repository is Apache-2.0; the end-to-end pipeline is in practice restricted by upstream research licenses and is for non-commercial use only.

---

First published on the WeChat public account 「瑞哥观势」

Since you have read this far, if you like it, feel free to hit like, share, and repost. If you want to receive pushes as soon as possible, give me a star as well. Thank you for reading my article, and see you next time.

First published on the WeChat public account 「瑞哥观势」.
