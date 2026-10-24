---
title: "Motion2MixamoRig 深度解析：把真人視頻變成 Mixamo 角色，這個專案做對了什麼"
date: "2026-10-24"
description: "開源專案 Motion2MixamoRig 把視頻裡的人物動作重定向到 Adobe Mixamo 骨骼的 3D 角色上。本文拆解它的完整流水線、腳下打滑與身體穿模的解法、手指重定向的數學、診斷系統，以及六條貫穿程式碼的設計哲學。"
author: "瑞哥观势"
tags:
  - Motion Capture
  - Motion Retargeting
  - Mixamo
  - Blender
  - GVHMR
  - 開源專案
categories:
  - 开源项目解析
  - 深度观察
---

# Motion2MixamoRig 深度解析：把真人視頻變成 Mixamo 角色，這個專案做對了什麼

先說結論。

如果你手裡有一個 Mixamo 角色（Adobe 免費送的那套骨骼），現在想給它一段真人動作。以前這活兒要嘛外包，要嘛買動捕設備，價格都在幾千到幾萬元一單。

Motion2MixamoRig 把這件事變成了：裝個 Python 環境，扔進一段視頻，等十幾分鐘，拿到一個能直接丟進 Blender 或 Unity 的 `.glb`。

**但這個專案真正值得看的不是它省了多少錢，而是它解決「動作遷移」這件事的方式。**

我把它的完整流水線、六個關鍵問題的解法、以及藏在程式碼註解裡的設計哲學全拆一遍。

---

## 一、專案說明：它到底做什麼

Motion2MixamoRig 由 MaxLiu22 開發，Apache-2.0 授權，2026 年 8 月 29 日開源，目前 1583 star、200 fork。Python 實作，`motion2mixamorig` 套件 10742 行，Blender 外掛部分 5922 行。

### 一句話定義

**輸入一段單人的視頻（或一張照片），輸出一個由 Adobe Mixamo 骨骼驅動、帶完整蒙皮和動畫的 3D 角色檔案。**

### 完整流水線

```
视频 / 照片
    ↓  ① 预检（内容检查，不是存在性检查）
    ↓  ② 人体动作提取（GVHMR，24 个 SMPL 关节）
    ↓  ③ 脚部接触检测（4 通道静态置信度）
    ↓  ④ 重定向到 Mixamo 骨骼（swing / twist 分解 + FK）
    ↓  ⑤ 脚部锁定（解析双骨 IK）
    ↓  ⑥ 落地校正（髋部垂直平移）
    ↓  ⑦ 蒙皮导出（GLB + 每骨骼旋转）
    ↓  ⑧ 自相交诊断（直接读 GLB 做线性混合蒙皮）
视频输入 → 4 个预览视频；照片输入 → 4 张预览图 + 360° 环绕对比
```

### 兩種用法

**Blender 外掛（面向非程式設計師）**

從 GitHub Releases 下載對應平台的 zip（目前只有 `macos-arm64`），在 Blender 裡 `Edit → Preferences → Get Extensions → ∨ → Install from Disk…` 裝上，3D 視圖按 `N` 打開側邊欄，點 `Install Runtime (one click)` 自動裝好獨立的 Python 執行時，然後選 SMPL-X 模型、選 Mixamo FBX、選視頻、點 `Generate Motion`。

**命令列（面向開發者）**

```bash
m2mr doctor          # 检查资产和依赖，缺什么告诉你去哪下
m2mr run             # 用 assets/video/ 里最新的视频 + Y_Bot.fbx
```

外掛的核心設計是**它不碰 Blender 的 Python**。外掛本身不 import PyTorch、不 import GVHMR、不 import OpenCV，它只負責起一個外部行程：

```text
<external-python> -m motion2mixamorig.cli run ...
```

這個外部 Python 要嘛是外掛一鍵裝到 `~/Motion2MixamoRig` 的執行時，要嘛是使用者自己指定的 venv。這條隔離做得非常乾淨，避免了 Blender 自帶 Python 版本和 pip 環境地獄。

### 專案規模速覽

| 項目 | 數量 |
|---|---|
| 核心 Python | 10742 行 |
| Blender 外掛 | 5922 行 |
| README 翻譯 | 18 種語言 + 英文 |
| 使用指南翻譯 | 18 種語言 + 英文 |
| 外掛 UI 語言 | 19 種 |
| 推理權重下載量 | 約 5 GB（+手部 2.7 GB）|
| 30 秒片段 CPU 處理 | 首次 8-15 分鐘，之後 3-5 分鐘 |

**一個容易被忽略的細節**：這個專案的 README 和使用者指南已經翻譯成了 18 種語言，中文版在 `docs/i18n/README.zh-Hans.md` 和 `docs/i18n/user-guide.zh-Hans.md`。但 `AGENTS.md`、`CHANGELOG.md`、`NOTICE.md`、`docs/blender-extension.md`、`docs/c4d-fbx-support.md`、`docs/release-checklist.md` 這六份核心文件**沒有中文版**。本文後面的譯文正是補上這六份。

---

## 二、詳細教學：從零跑通第一個動作

### 步驟 0：準備資產

這些檔案倉庫不附帶（涉及各自的研究授權和 Adobe 的使用條款），得你自己去拿：

| 放什麼 | 放到哪 | 去哪拿 |
|---|---|---|
| SMPL-X 人體模型 | `assets/body_models/smplx/SMPLX_NEUTRAL.npz` | 註冊 [SMPL-X](https://smpl-x.is.tue.mpg.de/) 後下載 NPZ 版 |
| Mixamo 角色 FBX | `assets/mixamo/Y_Bot.fbx` | Adobe 帳號登入 [Mixamo](https://www.mixamo.com) 下載 |
| 動作視頻 | `assets/video/<name>.mp4` | 只有一個人、頭到腳全程在畫框內 |
| 姿勢照片（可選） | `assets/image/<name>.jpg` | 同上，配合 `--image` 使用 |
| MANO 右手模型 | `assets/body_models/mano/MANO_RIGHT.pkl` | 註冊 [MANO](https://mano.is.tue.mpg.de/) 下載 Models & Code |

**新手最常踩的坑**：Mixamo 下載下來的檔案叫 `Y Bot.fbx`（中間是空格），而預設讀取路徑是 `Y_Bot.fbx`（底線），差一個字元。改個名它就是預設角色；不改也行，找不到時程式會自動用 `assets/mixamo/` 裡的第一個 `.fbx`。

**素材要求**很硬：畫面裡只能有一個人，頭到腳必須全程在畫面裡不能出畫。`m2mr doctor` 和 `m2mr run` 會在預檢階段就偵測人數，發現兩個人直接停，不會浪費十幾分鐘去提取。

### 步驟 1：安裝

```bash
git clone https://github.com/MaxLiu22/Motion2MixamoRig.git
cd Motion2MixamoRig
python -m venv .venv && source .venv/bin/activate

pip install --upgrade pip setuptools wheel \
  && pip install "numpy>=1.26" \
  && pip install --no-build-isolation "chumpy==0.70" \
  && pip install -e .
```

那個 `--no-build-isolation` 不是可選項。`chumpy` 是 GVHMR 相依鏈上的舊套件，它的 setup 腳本會 import pip，在 pip 預設的隔離建置環境裡必然報 `No module named 'pip'`。必須先關掉隔離單獨裝它。

建議再裝上 ffmpeg（`brew install ffmpeg` 或 `apt install ffmpeg`）。沒有它也能跑完，但輸出的視頻沒聲音，編碼格式也沒辦法直接在瀏覽器裡播。

### 步驟 2：體檢

```bash
m2mr doctor                 # 只查身体这一路
m2mr doctor --detect-hands  # 连手指检测的文件和 Python 包一起查
```

`doctor` 做的事比「檢查檔案在不在」細緻得多。它往檔案**裡面**看，因為真正常見的失敗不是檔案缺失，而是檔案不對：

- SMPL-X 頂點數是 10475，SMPL 是 6890，用頂點數辨識模型家族，**不看檔名**（防止有人把 SMPL 改名成 SMPLX）
- FBX 讀前 12 位元組魔數判斷是不是 Binary 格式，ASCII FBX 直接拒
- 抽 16 影格跑 YOLO 人數偵測，兩個人直接判定不可用
- 過濾掉面積佔比小於 1.5% 的「郵票人物」（觀眾、海報），第二個人如果比這個大就報警

### 步驟 3：第一次跑

```bash
m2mr run
```

首次執行會下載約 5 GB 推理權重到 `weights/`（GVHMR、HMR2、RTMPose/ViTPose 2D 姿勢、YOLOv8 人體偵測）。這一步只下一次。

CPU 上處理一段 30 秒的片段：首次 8 到 15 分鐘，權重就位後 3 到 5 分鐘。重定向和渲染通常一兩分鐘。

**權重下載是自動的，但推理權重的授權不歸本專案管**，README 裡明確列了每一條上游授權，這是負責任的做法。

### 步驟 4：換角色，不重複提取

這是整個工具最實用的一個設計。

提取人體動作是慢的一步，重定向是快的一步。所以骨架單獨存成檔案：

```bash
m2mr run --skeleton outputs/20260829_193205_dance/skeleton_motion.npz \
         --rig assets/mixamo/Vampire.fbx
```

**幾分鐘變成幾十秒。** 同一個動作隨便換十個 Mixamo 角色，成本幾乎只有重定向那部分。

### 步驟 5：加手指

```bash
m2mr run --video assets/video/dance.mp4 --detect-hands --hand-smooth 0.08
```

`--detect-hands` 會啟用 HaMeR 手部模型，從人體上裁出手腕、在 GVHMR 已選定的影格上估計手指旋轉，寫進 `skeleton_motion.npz`，驅動 Mixamo 的 30 根手指骨。

三個必須知道的事：

1. **耗時翻倍**。手部偵測疊在身體提取之上，不是並行。
2. **首次多下 2.7 GB** 權重到 `weights/hamer/`。
3. **複用骨架時不用重複加 flag**。如果 `skeleton_motion.npz` 裡已經存了手部運動，`--skeleton` 會自己驅動手指。如果沒存但身體快取還在旁邊，加 `--detect-hands` 可以只補手指不重跑身體。快取沒了才需要重跑視頻。

`--hand-smooth` 是手指旋轉的平滑秒數，預設 0.08，填 0 就是原始估計值。

### 步驟 6：看診斷

```bash
m2mr diagnose outputs/<run>                        # 重算诊断
m2mr diagnose outputs/<run> --visualize            # 额外生成 diagnostics.html
m2mr diagnose outputs/<run> --threshold-cm 2       # 只报深度超过 2 cm 的
```

每次 `m2mr run` 都會自動檢查成品角色有沒有自相交（一個身體部位插進另一個，比如手插進頭裡），並寫 `diagnostics.json`。終端會印出一行摘要：

```
diagnostics: 14 self-intersection(s) over 116 of 719 frames, deepest 7.87 cm
```

**注意一個重要設計：檢查失敗不會讓執行失敗。** 報告是資訊，不是門禁。作者把判斷權留給使用者。

`diagnostics.html` 是更完整的報告：源視頻和角色並排、時間軸、可點擊的問題清單、3D 檢視用 three.js 從 CDN 載入。地板上固定了標記（每 0.5 公尺一個十字，每公尺一個大十字，原點綠色），這樣你能看出角色到底是在走還是在滑。

### 步驟 7：人工標註與局部返修

有些問題只有眼睛能看出來：腳滑了、膝蓋跳了、手沒夠到身體。這些**不在** `diagnostics.json` 裡。

`diagnostics.html` 在自相交軌道上方有一條琥珀色的標註道，可以拖選一段影格範圍、填 In / Out、寫上問題。右側 Notes 清單會列出，點一行跳到那一影格。**Download notes** 會把標註和自相交清單一起存成 `<视频名>_review.json`。

這個檔案有正式 schema：`m2mr-review-v1`。

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

把這份 JSON 連同角色檔案或骨架檔案交回給 AI 或開發者，它會**只針對標註的影格段**重做 Mixamo 動畫，寫到一個新目錄裡，**原來的執行結果原封不動保留**。

**這個「不覆蓋、只增量返修」的設計，是我認為這個專案在工程成熟度上超出同類的指標。**

### 步驟 8：匯入 Blender

`File → Import → glTF 2.0 (.glb/.gltf)`。

幾個容易懵的點：

- 如果相機對著空處，選中角色網格 `View → Frame Selected`
- 頭和手上那簇球是骨骼顯示不是網格，在 Outliner 裡把 `Icosphere` 和 armature 隱藏，**只留蒙皮網格可見**
- 場景 FPS 要從 `run.json` 裡讀，時間軸設成 0 到 `n_frames - 1`，這樣影格號才能和 `diagnostics.json` 對上
- 角色是每個 FBX 幾何體一個物件（Y Bot 是兩個：`skinned_mesh_0_Alpha_Surface` 和 `skinned_mesh_1_Alpha_Joints`）

### 步驟 9：照片模式

```bash
m2mr run --image assets/image/pose.jpg
```

從一張照片恢復出靜態 3D 姿勢，走和視頻完全一樣的重定向路徑。輸出是 `images/` 下的四張圖（和影片版同視角），外加一個 `before_after_360_compare.mp4`：左邊原照片，右邊角色 10 度一格的完整環繞。

**不能同時傳 `--video` 和 `--image`。**

### 完整命令速查

| 命令 | 作用 |
|---|---|
| `m2mr doctor` | 檢查資產和相依套件 |
| `m2mr run` | 最新影片 + Y_Bot，跑完整流程 |
| `m2mr run --video X --rig Y` | 指定輸入和角色 |
| `m2mr run --image X` | 照片模式 |
| `m2mr run --skeleton X --rig Y` | 複用提取，只換角色 |
| `m2mr run --no-foot-lock` | 保留原始重定向（腳會滑） |
| `m2mr run --detect-hands --hand-smooth 0.08` | 啟用手指 |
| `m2mr diagnose <run> --visualize` | 重算診斷並出 HTML 報告 |
| `m2mr run --output-dir DIR --progress-jsonl F --no-preview` | 給外掛和自動化用 |

---

## 三、六道難題和它們的解法

這一節是全文的核心。動作遷移看起來是「把 A 的關節角度搬到 B 的骨骼上」，實際做起來有六個獨立的坑。

### 難題一：Mixamo 骨骼的靜止姿勢怎麼讀

Mixamo 原始 FBX 把每個關節的綁定朝向編碼在 `PreRotation` 裡。但很多人在 Blender 或 Cinema 4D 裡開啟再匯出，這個資訊就被改寫甚至丟棄了。

如果用局部歐拉角重建靜止姿勢，得到的關節座標系是錯的，**而且越往階層下面錯得越厲害**：靜止姿勢錯、蒙皮崩，哪怕一點動畫都不加也是錯的。

**專案的解法是三級優先的綁定矩陣復原**：

1. FBX 的 `Pose` / `PoseNode.Matrix`（有就用這個）
2. Skin cluster 的 `TransformLink`（沒有 Pose 記錄時用這個；多個網格連同一個關節時，選那個和其餘矩陣最接近的，因為旋轉矩陣不能平均）
3. 局部變換屬性（都沒有的關節，通常是末端骨）

作者還在 `docs/c4d-fbx-support.md` 裡貼了驗證數據：原始 Mixamo FBX 和 Cinema 4D 匯出版，核心骨骼都是 25 根，全 rig 33 根，靜止 FK 矩陣最大誤差分別是 `1.7e-14` 和 `3.2e-14`，靜止蒙皮誤差 `6.5e-14` cm 和 `2.0e-13` cm。

**而且沒有回歸**：同一份 `skeleton_motion.npz`（787 影格）改動前後跑 Y Bot，每骨骼旋轉差在 `4e-7` 以內（浮點精度），Blender 裡蒙皮頂點位置差 0.5 微米。

### 難題二：重定向的數學骨架

整個專案的重定向核心是一行公式，註解寫在 `kinematics.py` 開頭：

```
M_local = T_bind * R_bind * R_anim
M_world = M_parent_world * M_local
```

三個重點：

**R_anim 是相對綁定朝向的增量**，不是絕對朝向。這是整個架構的地基。有了它，同一段動畫可以套到任何靜止姿勢不同的 rig 上。

**Mixamo 的靜止骨長永遠不被縮放**。角色的手臂多長就是多長，動畫只改朝向不改比例。這是很多工具會犯的錯（為了匹配人體比例去縮放骨長），一旦縮了就再也回不去。

**使用完整綁定旋轉的 FK**。有的庫用 `PreRotation` 單獨存，這個專案把它保留為 `MixamoBone` 上的相容別名，但實際計算走的是完整局部綁定朝向。

`retarget.py` 裡還有一個自我檢查函式 `verify_rest_fk`：當 `R_anim` 取單位矩陣時，FK 必須精確重現 FBX 的靜止姿勢，誤差超過 `1e-4` 直接丟例外。**這是把「綁定旋轉組合是否搞錯了」變成一個啟動時就崩的硬錯誤，而不是一個執行到一半才顯形的怪異動作。**

**Swing / Twist 分解**是標準做法：把每個骨骼的旋轉拆成「指向哪裡」和「繞著這個指向轉多少」。專案裡維護了 `SWING_TARGETS`（骨骼 → 用哪兩個人體關節的方向向量來定 swing）、`AIM_CHILD`（骨骼的靜止軸由哪個子骨決定）、`MIXAMO_TO_HUMAN`（Mixamo 骨骼 → SMPL 關節的對應）等一堆表。

這裡有一段註解特別值得看，它解釋了一個非常具體的坑：

> Neck/Head 不能沿著 SMPL 的 neck→head 方向瞄準。那個向量只有約 9 公分，是從頸部到顱骨的偏移，跟垂直方向差 50 到 70 度，照它瞄準會讓 Mixamo 那根長得多的頸骨和頭骨亂甩。`spine3→head` 才是穩定的朝上方向（顱骨在胸口上方），同時仍然用 Human 的 head 關節。關節對應保持 neck→Neck、head→Head 不變。

**還有一條**：Mixamo 的 Neck→Head 和 Head→HeadTop 靜止平移並不沿局部 +Y（它們帶一個向前的 +Z 偏移），瞄準那個偏移會讓頸骨和頭骨傾斜。所以 Neck/Head 改為擺動局部 +Y。

這種註解密度說明作者是被這些具體問題咬過的。

### 難題三：腳在地上滑

這是所有動作遷移工具的經典失敗。腳應該釘在地上不動，但重定向出來的角色腳在地板上滑行，像溜冰。

**專案的解法分兩層。**

第一層是**腳部鎖定**（`foot_lock.py`）。GVHMR 會為每一影格預測四個關節的「靜止置信度」：左腳跟、左腳掌、右腳跟、右腳掌。腳跟和腳掌**獨立鎖定**，所以平踩、踮腳尖、腳跟著地三種情況各自釘住真正接觸地面的那個部位。

置信度處理用了**遲滯**（hysteresis）：進入接觸要 0.8 以上的置信度，退出只要降到 0.5 就行。`ENTER_CONF = 0.8`、`EXIT_CONF = 0.5`。這個設計避免了在臨界值附近反覆開關接觸，產生的抖動比抖動本身更糟。短於 0.1 秒的接觸段直接丟棄。

每個接觸段把鎖定點釘在**該段的平均位置**上。修正量在段兩側各有一個短視窗淡出，這樣擺動腿不會彈跳。

**球優先於跟**。註解解釋了原因：兩個錨點來自不同的接觸段，彼此之間不是剛性足長關係，硬要同時釘住會把腳扭壞。所以腳掌和腳跟都著地時，釘腳掌。腳保持原有世界朝向，所以踮腳尖仍然繞著被釘住的腳掌轉。

接著是**解析雙骨 IK**：`UpLeg` 和 `Leg` 解到踝關節目標，膝蓋保持在原始彎曲平面內。**直腿夠不到錨點時，髖部整體平移**到能讓所有著地的髖關節都夠得到，兩個髖關節共享這個平移。**這裡不把任何東西吸附到地板**，只消除接觸期間的漂移。

第二層是**落地校正**（`ground.py`）。腳鎖定釘住的是「腳已經在的位置」，但那是骨架關節的高度，不是地板高度。角色的腳底在骨骼關節下方還有一段距離，而且復原出來的高度在一段視頻裡會漂移，結果就是角色浮空或者陷進地裡。

解法是：**腳底 = 該部位最低的蒙皮頂點**（跟是 `Foot`，腳掌是 `ToeBase` / `Toe_End`）。著地影格上，髖部垂直平移，讓那個最低頂點落在 `y = 0`。一個著地段保持自己最低影格的偏移量，所以腳在邁步時可以抬起但不會下陷。騰空影格從前一個著地段平滑過渡到下一個，**這樣跳躍的高度保住了，步與步之間的慢漂移也去掉了**。

兩個階段的效果都記在 `run.json` 裡：`foot_lock` 和 `ground` 兩個小節。

**注意一個細節**：即使加 `--no-foot-lock`（保留原始重定向，腳會滑），落地校正**仍然會跑**。因為落地和防漂移是兩件事。

### 難題四：2D 姿勢估計的左右翻轉

RTMPose / ViTPose 靠外觀逐影格判斷左右，**沒有記憶**。畫面裡的人轉個身，某一影格標錯了，整個人體就會在 3D 裡原地轉 180 度。

專案裡 `stabilize_kp2d.py` 的註解把這個機制講得非常清楚：

> 一影格的**朝向符號**是肩部的 `sign(x_left - x_right)`（肩膀塌在一起時用髖部）。兩個事實驅動規則：
>
> - 真實的 180 度轉身會經過側視，在那裡朝向符號改變，而肩寬接近零（「窄」影格）
> - 標籤翻轉是孤立的：少數幾影格符號相反，被符號一致的影格包圍，而且肩寬是滿的

於是規則是：**在窄影格處把影片切成段，每段內部取 RTMPose 標籤的多數值**。段內相反符號的連續段如果短於約 0.33 秒，判定為翻轉並改回來；更長就當作「轉得太快沒出現側視」的真實轉身，保留。

窄影格夾在兩個一致段之間，強制歸到那個符號（側視圖附近也可能發生翻轉）；窄影格夾在兩個不一致段之間，說明是轉身進行中，保留估計器的標籤。

**這套規則不看臉，所以帽子和口罩都不影響**。而且每個決策都基於整段而不是某一個轉折影格，**一個壞影格無法把整段影片鎖死在錯誤狀態**。

修復記錄在 CHANGELOG 裡，數字很有說服力：**一段有快速半秒轉身的舞蹈片段，方向錯誤的影格從 642 影格中的 320 影格降到 3 影格。**

而且重跑已有快取時會從 `vitpose_raw.pt` 備份重新穩定化，**不是從上一條規則的輸出繼續算**。這個細節說明作者在設計時就考慮了「規則會迭代，歷史資料不能被污染」。

### 難題五：手指重定向

`--detect-hands` 打開後，HaMeR 估計出的是 MANO 關節旋轉。而 MANO 的關節旋轉是**父層相對**、且表達在**手模型自己的座標系**裡（因為 MANO 每個靜止影格都是單位矩陣）。Mixamo 手指骨的動畫通道也是父層相對，但表達在那根骨**自己的靜止座標系**裡。

所以轉移是一個**純基變換**：

```
R_anim[b] = D_bᵀ · (C · R_mano[j] · Cᵀ) · D_b
```

- `C`：MANO 手座標系 → Mixamo Hand 骨靜止座標系，由兩個靜止姿勢的手部座標系（腕→中指1、食指1→小指1）算出
- `D_b`：手指骨 b 相對 Hand 骨的靜止世界旋轉

**這個變換從頭到尾都是測出來的，從不手寫。** 註解裡沒有一句「如果是左手就翻轉 X 度」。

HaMeR 是單一影像模型，原始旋轉會逐影格抖。`load_hand_motion` 用**有效度加權的時域高斯**做平滑，並從相鄰影格填補短的偵測空洞。

### 難題六：怎麼知道結果好不好

這是我認為最被低估、也最有價值的一塊。

**它不檢查「看起來對不對」，它檢查成品檔案本身。**

`diagnose.py` 直接讀 `mixamo_character.glb`，**用檔案自己的蒙皮權重**（線性混合蒙皮，和任何 glTF 檢視器一樣）擺出每一影格，然後檢測身體部位之間的相交。

**關鍵點：它檢查的是匯出的 GLB，不是記憶體裡的中間狀態。** 這意味著它測的是使用者真正拿到手的東西，包含了匯出環節可能引入的所有錯誤。

幾個設計細節：

- **關節相連的部位不比較**。上臂和小臂、軀幹和大腿，它們的皮膚在關節處本來就會重疊或混合，在任何姿勢下都「相交」。`_ADJACENT` 集合把這些排除掉。
- **只檢查自相交，不檢查地面**。註解寫得很誠實：地面接觸需要定義一個地板，而這個工具目前沒有。
- **影格號從 0 開始**，和 Blender 匯入 glTF 後的時間軸一致。
- **同一對部位相隔不超過 3 影格的片段合併成一段**，避免報告被碎片淹沒。
- 深度預設閾值 1 cm，`--threshold-cm` 可調。

然後是 `diagnostics.html`。這是個自包含的 HTML 報告，源影片和角色並排、時間軸、點擊式問題清單，3D 檢視從 CDN 載入 three.js。**地板上固定了標記**（每 0.5 公尺一個十字，每公尺一個大十字，原點綠色），這樣你能判斷角色是在移動還是站著不動。

**這個地板標記是社群貢獻的。** CHANGELOG 裡寫著建議來自 X 上的 @_____eddie_____，附了具體連結。地板標記同時出現在 HTML 報告和 Blender 匯入時新增的 `Floor Markers` 網格上。

然後是**人工標註道**：琥珀色軌道，拖選影格範圍，寫下問題，存成 `m2mr-review-v1` JSON。瀏覽器用 localStorage 按 `m2mr-review-v1:<源glb>:<帧数>:<fps>` 存，**所以重新產生 HTML 不會丟標註**。

**軟體邊界劃得很清楚：機器能查的（自相交）機器查，眼睛才能看的（腳滑、膝蓋跳）人來標，兩者的載體不同、職責不同，但可以合併交付。**

---

## 四、歸納總結：六條設計哲學

把上面這些拆開看，能提煉出六條貫穿始終的設計哲學。它們不是寫在 README 裡的口號，而是能從程式碼裡讀出來的。

### 哲學一：單一真源，座標系只定一次

`tpose_calibration.py` 的開頭寫著：

> Mixamo Skeleton T-pose ↕ 一個全域標定 ↔ character Rig rest T-pose
>
> T-pose 檢查程式和動畫重定向都匯入這個模組，所以專案裡只有**一個** Front / Right / Up 慣例。

更狠的是後半句：

> **這裡沒有任何手動修正**：解剖學軸向是從骨位測出來的，對齊用的是 `B_rig @ B_skel.T`，**沒有極座標/SVD 的行列式修正，沒有逐骨骼的 90/180 度修補**。

**「不靠打補丁」這四個字，是這個專案技術品格的最好註腳。**

在動畫遷移這類問題裡，「給某根骨骼加個特殊處理」是最容易走的路，也是最容易把系統變成不可維護的路。這個專案明確拒絕這條路，改用從幾何測量出慣例。

### 哲學二：讓錯誤在啟動時崩，而不是在畫面裡詭異

`verify_rest_fk` 是個典型代表：單位動畫旋轉必須精確重現靜止姿勢，誤差超 `1e-4` 直接丟例外。

同樣的思路還有 `checks.py` 的內容檢查（用頂點數辨識模型家族而不是檔名）、`run.json` 裡每次都記的 `rest_fk_error` 和 `rest_skin_error_cm`。

**驗證不是發佈前的最後一道手工工序，而是系統的一部分。** 每一層都自帶自我檢查，錯了就立刻停。

### 哲學三：把機器的判斷和人的判斷分開，但把交付合併

`diagnostics.json` 存機器能查的（自相交、深度、影格段），`m2mr-review-v1` 存人才能看的（腳滑、手夠不到）。

前者是 JSON，程式讀；後者也是 JSON，程式讀，但內容是評審者自己的原話，**照他輸入的樣子存，一個字不改，存什麼語言就存什麼語言**。

而把兩者合併進同一個檔案的目的很明確：**讓這個檔案成為一次返修任務的完整輸入**。AI 或開發者拿到它，就知道該改哪幾影格、該改什麼。

### 哲學四：增量優先，絕不覆蓋

前面提過過，這是最值得單獨拎出來的一條。

- 換角色不重跑提取（`--skeleton`）
- 補手指不重跑身體（快取還在時）
- 返修只改標註的影格段，寫到**新目錄**
- 重跑穩定化從原始備份算，不從上一版規則輸出算

**「新目錄，不覆蓋」這個約定，讓整個流程可以安全地反覆迭代。** 任何一次返修失敗，原結果都還在。

### 哲學五：報告失敗，但不阻塞產出

自相交檢查失敗**不會**讓 `m2mr run` 失敗。診斷是資訊，不是門禁。

這是一個很成熟的判斷。開發者知道自己的手伸進頭裡是**他的**問題，不是工具的問題。工具把問題量化清楚交給他，判斷權歸他。

**如果工具因為「偵測到問題」就拒絕出結果，逼著使用者去修，反而製造了更多摩擦。**

### 哲學六：授權和限制寫在最顯眼的地方

`NOTICE.md` 單獨成文，把每個上游元件的條款列清楚：

- **GVHMR**（SIGGRAPH Asia 2024）：僅限非商業研究用途
- **SMPL-X**：MPI 註冊門控，非商業科研/教育/藝術用途，商用需單獨協議
- **MANO**：MPI 註冊門控
- **Mixamo FBX**：可隨產品發布，但不可作為素材包重新散布
- **YOLOv8**（Ultralytics）：**AGPL-3.0**
- 各種姿勢和 HMR 檢查點：各自的研究授權

結論寫得很直白：

> 由於上游元件的限制，**端到端 pipeline 實際上被限制在非商業/研究用途**，無論本倉庫自身的授權是什麼。

README 裡也重複了這段。使用者指南裡更直接：**Motion2MixamoRig 僅供非商業使用**。

**作者沒有讓「程式碼是 Apache-2.0」這個事實掩蓋整條鏈路的實際限制。** 這在開源專案裡是少見的誠實。

---

## 五、我怎麼看這個專案

說幾點我自己的判斷。

### 它選對了一個真實的痛點

Mixamo 角色是 Adobe 免費提供給所有人的骨骼資產，Blender 和 Unity 使用者手上不缺角色，缺的是**動作**。動捕設備和外包服務是幾千到幾萬元一單的價格，而「我只需要一個簡單的走位或舞蹈動作」這個需求，以前基本沒有低成本解法。

這個專案把成本打到了「下載 5 GB 權重 + 等待十幾分鐘」這個量級。**對獨立遊戲開發者、動畫學習者、工具開發者來說，這是從 0 到 1 的那一步。**

### 它的技術含量不在模型，在幾何

用 GVHMR 提取人體動作這一步，別人也能做。**真正難的是後面那一長串幾何和運動學問題**：綁定朝向怎麼讀、靜止姿勢怎麼驗證、腳怎麼釘、落地怎麼校、左右怎麼穩定、手指座標系怎麼轉。

這些活兒沒有一步是「跑個模型」能解決的，全是**必須理解座標系和運動學才能寫對**的東西。**10742 行程式碼裡，真正呼叫模型的部分很小，大部分是幾何。**

### 它的文件密度罕見

程式碼註解裡全是「為什麼這樣，不能那樣」的具體推理，不是「計算旋轉矩陣」這種廢話。上面引的那些段落，比如「那個向量只有約 9 公分，是從頸部到顱骨的偏移，跟垂直方向差 50 到 70 度」，是真正解釋了一個 bug 的來源。

對一個讓 AI 代理也能參與開發的專案（`AGENTS.md` 就是寫給 AI 的），這種註解品質直接決定了 AI 能不能改對。

### 它對社群意見的吸收很快

地板標記來自 X 上一個具體的人，改完就在 CHANGELOG 裡署名並附連結。Cinema 4D FBX 支援來自 PR #8，同樣署名。

**一個還在 0.1.x 階段的專案，迭代密度和回饋閉環都相當成熟。**

### 需要潑的冷水

**第一，它現在是實驗階段。** README 開頭就寫著 `Motion2MixamoRig is currently experimental`，且目前**只在 macOS Apple Silicon 上測試過**，Windows 和 Linux 尚未測試，外掛也只有 macos-arm64 一個平台的 zip。

**第二，非商業限制是硬的。** 前面說過，但這值得再強調一次：**用這個專案做出來的動畫資產，能不能商用，取決於 GVHMR 和 SMPL-X 的條款，不取決於這個倉庫是 Apache-2.0。** 想商用的團隊需要自己去談協議。

**第三，效果上限受限於單目視頻本身。** 單視角下被遮擋的肢體、被誤判的深度，都是資訊層面的缺失，不是演算法能補的。走路、舞蹈這類清晰動作是它的主場，多人互動、大幅遮擋、手持物品這些場景，README 的「一個人、頭到腳全程在畫面裡」就是在提前勸退。

**第四，CPU 上很慢。** 30 秒片段 3 到 5 分鐘，這個量級對個人使用可以接受，對批次生產就偏重了。有 GPU 會快很多，但 README 裡的時間數據都是 CPU 的。

### 最後一個觀察

我翻遍了這個專案的 CHANGELOG 和文件，最打動我的不是任何一項技術細節，是**它對「什麼能查、什麼不能查」這條邊界的誠實**。

它查自相交，因為自相交可以幾何判定，判定結果可以量化成公分。它不查腳滑，因為腳滑需要理解意圖和地面。它明確寫「地面接觸需要一個定義好的地板，而這個工具目前沒有」。它查出來的穿模不會讓執行失敗，因為那是使用者的問題。

**這是一個知道自己的邊界在哪、並且不打算假裝越界也能用的專案。**

回到開頭那句話：如果你正好有個 Mixamo 角色等著做動畫，這個倉庫值得翻一翻。

評論區聊聊，你們做角色動畫現在是怎麼解決的？外包、買設備、還是純手工 K 影格？我挺想看看大家的做法。

---

## 附：專案資料

**倉庫位址**：MaxLiu22/Motion2MixamoRig

**核心資料清單**

| 文件 | 內容 | 中文版 |
|---|---|---|
| README.md | 快速開始、命令參考 | `docs/i18n/README.zh-Hans.md` |
| docs/user-guide.md | Blender 外掛使用指南（非程式設計師） | `docs/i18n/user-guide.zh-Hans.md` |
| AGENTS.md | 給 AI 代理的架構說明、命令手冊、Review notes schema | 本文附譯文 |
| CHANGELOG.md | 完整版本變更記錄 | 本文附譯文 |
| NOTICE.md | 各上游元件授權條款 | 本文附譯文 |
| docs/c4d-fbx-support.md | Cinema 4D 匯出 FBX 的支援細節與驗證數據 | 本文附譯文 |
| docs/blender-extension.md | 外掛維護者冒煙測試清單 | 本文附譯文 |
| docs/release-checklist.md | 發佈檢查清單 | 本文附譯文 |

**關鍵命令**

```bash
m2mr doctor
m2mr run
m2mr run --skeleton outputs/<run>/skeleton_motion.npz --rig assets/mixamo/Vampire.fbx
m2mr run --detect-hands --hand-smooth 0.08
m2mr diagnose outputs/<run> --visualize
```

**授權**：本倉庫程式碼 Apache-2.0；端到端 pipeline 實際受上游研究授權限制，僅限非商業用途。

---

首發於微信公眾號「瑞哥观势」

既然看到這裡了，如果覺得不錯，隨手點個讚、在看、轉發三連吧，如果想第一時間收到推送，也可以給我個星標，謝謝你看我的文章，我們，下次再見。

首發於微信公眾號「瑞哥观势」。
