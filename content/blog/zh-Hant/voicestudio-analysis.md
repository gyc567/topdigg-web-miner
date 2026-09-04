---
title: "VoiceStudio：本機開源語音工作站——16 款 TTS + 11 款 ASR 引擎的架構解析與實戰教學"
date: "2026-09-03"
author: "ERIC"
description: "深度解析 VoiceStudio——完全在本機執行的開源語音平台：零樣本聲音複製、影片配音、聽寫、轉錄與有聲書製作，646 語言，16 TTS + 11 ASR 引擎，含實戰教學與引擎准入設計哲學"
tags:
  - VoiceStudio
  - TTS
  - 語音辨識
  - 聲音複製
  - 本機AI
  - 開源
categories:
  - AI 工具
  - 語音合成
  - 開源專案
  - 本機優先
keywords:
  - VoiceStudio
  - 聲音複製
  - 影片配音
  - WhisperX
  - 本機 TTS
---

# VoiceStudio：本機開源語音工作站——16 款 TTS + 11 款 ASR 引擎的架構解析與實戰教學

> **專案位址**：https://github.com/debpalash/VoiceStudio
> **授權**：AGPL-3.0（應用程式碼）；下載的模型保留各自上游授權
> **一句話概括**：VoiceStudio 是一個完全在本機執行的開源語音平台，涵蓋聲音複製、聲音設計、影片配音、聽寫、轉錄、有聲書製作，支援 646 種語言，無需帳號、API Key 或訂閱。

---

## 一、專案說明

### 1.1 定位

VoiceStudio（前身 OmniVoice-Studio）對標 ElevenLabs 的本機替代品。差別不在功能數量，在資料路徑：音訊與文字預設留在本機，連網功能是顯式開啟的選項，不是預設行為。

| 維度 | VoiceStudio | 託管語音服務 |
|------|-------------|--------------|
| 適用場景 | 私密、離線、自建、高吞吐量工作 | 快速上手、免模型管理 |
| 資料路徑 | 預設本機；遠端功能顯式開啟 | 音訊與文字由服務商處理 |
| 成本 | 軟體免費，硬體自備 | 訂閱、點數或計量 API |
| 離線使用 | 模型下載後可用 | 通常需要連網 |
| 客製空間 | 原始碼、引擎、模型、API、路由全部開放 | 限於服務商選項 |
| 維護責任 | 使用者負責更新、磁碟與算力 | 服務商負責基礎設施 |

### 1.2 核心資料

- 16 款 TTS 引擎，11 款 ASR 引擎，Model Catalogue 中按 Ctrl/Cmd+E 切換
- 646 種 TTS 語言目錄（實際涵蓋範圍與品質取決於所選引擎）
- 平台：macOS 13.3+（Apple Silicon）、Windows 10/11 x64、Linux x86_64（glibc 2.39+）、Docker
- 算力：CUDA、Apple Silicon MPS/MLX、ROCm（Linux）、CPU、可選遠端 Worker
- 介面：桌面應用、本機 REST/SSE/WebSocket API、OpenAI 相容音訊 API、MCP Server
- 儲存：聲音、專案、設定、輸出預設全部在本機

### 1.3 功能清單

| 功能區 | 內容 |
|--------|------|
| 聲音複製 | 短參考音訊零樣本合成，3 秒可用，5–15 秒效果更好 |
| 聲音設計 | 用文字指令描述年齡、口音、音高、風格，產生新聲音 |
| 影片配音 | 轉錄 → 翻譯 → 保留說話者 → 合成 → 匯出影片 |
| 故事與有聲書 | 多角色劇本、EPUB/PDF 匯入、章節渲染、.m4b 匯出 |
| 聽寫小工具 | 系統級快速鍵、即時轉錄、可選本機 LLM 文字清理 |
| 人聲分離 | Demucs 分離語音與背景音 |
| 說話者分離 | Pyannote 與 WhisperX 說話者標註 |
| 批次佇列 | 大批量音訊/影片任務排隊 + 目錄監控 |
| 模型目錄 | 安裝、解除安裝、選擇、路由 TTS/ASR/LLM 模型 |
| GPU 自動偵測 | CUDA / MPS / ROCm / CPU 路由，逐引擎檢查 |
| AI 浮水印 | AudioSeal 嵌入與偵測合成音訊 |
| MCP Server | 為 Claude Code、Cursor 等用戶端提供合成與轉錄工具 |
| 診斷 | 自檢、錯誤記錄檔、去識別化支援包 |

### 1.4 專案結構

```
frontend/src-tauri/    Tauri v2 桌面殼（Rust）：窗口、托盤、快速鍵、更新器
frontend/src/          React UI、Zustand 狀態、API 與事件用戶端、i18n
backend/api/           REST 路由、schema、認證邊界、流式輸出
backend/services/      生成、配音、音訊處理、持久化
backend/engines/       隔離的可選引擎轉接器
backend/worker/        帶認證的遠端算力與任務傳輸
omnivoice_data/        專案、聲音、設定、記錄、SQLite 狀態
scripts/ deploy/       開發、打包、容器、發佈、CI
```

架構分層：Tauri 桌面殼透過 IPC 連接 React UI；UI 透過 localhost:3900 的 HTTP/SSE/WebSocket 連接 FastAPI 後端；後端內部是引擎登錄檔、配音/音訊/長文字流水線、OpenAI 相容 API 與 MCP Server，狀態落在 SQLite + Alembic 遷移。

---

## 二、詳細教學

### 2.1 安裝

| 平台 | 套件 | 說明 |
|------|-----|------|
| macOS 13.3+ | Apple Silicon DMG | 首次啟動需右鍵 → 打開，過 Gatekeeper |
| Windows 10/11 | x64 MSI | 選 current-user 建構可免管理員安裝 |
| Linux | AppImage | x86_64，glibc 2.39+ |
| Docker | 多 profile | CUDA、ROCm、CPU、純 Worker GPU |

Docker 一行啟動：

```bash
docker run -d -p 127.0.0.1:3900:3900 \
  -v omnivoice-data:/app/omnivoice_data \
  --name voicestudio \
  palashdeb/omnivoice-studio:stable
```

首次啟動會建立受管 Python 環境並下載預設模型，之後複用。不想安裝可用 Google Colab 筆記本雲端體驗（注意：Colab 是遠端算力，上傳音訊不在本機）。

### 2.2 五分鐘跑通聲音複製

1. 打開 VoiceStudio → Voice Cloning
2. 新增一段乾淨的人聲樣本。3 秒可用；5–15 秒效果更好
3. 輸入文字、選語言、點 Generate

注意：零樣本複製中，參考音訊是"提示詞"不是"訓練資料"。樣本應滿足：單人、靠近麥克風、無音樂雜訊殘響、語氣與目標輸出一致。更長的樣本不必然更好。

### 2.3 原始碼執行與開發

前置：Node 20+/Bun、Python 3.11+。

```bash
git clone https://github.com/debpalash/VoiceStudio.git
cd VoiceStudio
bun install
bun run desktop        # 桌面版；首次自動用 uv 設定 Python 依賴
bun run dev            # 瀏覽器 UI
```

診斷命令：

```bash
uv run python backend/main.py --diagnose --deep
```

### 2.4 OpenAI 相容 API

把 OpenAI 用戶端的 base_url 指向本機後端即可複用現有程式碼：

```python
from openai import OpenAI

client = OpenAI(base_url="http://localhost:3900/v1", api_key="local")
with client.audio.speech.with_streaming_response.create(
    model="tts-1",
    voice="<profile-id>",
    input="Made on my own hardware.",
    response_format="wav",
) as response:
    response.stream_to_file("speech.wav")
```

cURL 測試：

```bash
curl http://localhost:3900/v1/audio/speech \
  -H "Content-Type: application/json" \
  -d '{"model": "tts-1", "input": "Made on my own hardware.", "voice": "default", "response_format": "wav"}' \
  --output speech.wav
```

| 端點 | 用途 |
|------|------|
| POST /v1/audio/speech | TTS，輸出 mp3/opus/aac/flac/wav/pcm |
| POST /v1/audio/transcriptions | STT，輸出 json/text/verbose_json/srt/vtt |
| WS /v1/audio/transcriptions/stream | 即時 PCM/WebM 轉錄，含中間結果與工作階段終局事件 |
| GET /.well-known/voicestudio-speech | 探索 HTTP/WebSocket/MCP/聽寫控制傳輸 |
| GET /v1/audio/voices | 列出本機聲音檔案與引擎 |

### 2.5 MCP 接入

VoiceStudio 在 `http://localhost:3900/mcp` 掛載 MCP Server，工具包括 `generate_speech`、`clone_voice`、`transcribe`：

```json
{
  "mcpServers": {
    "voicestudio": {
      "url": "http://localhost:3900/mcp"
    }
  }
}
```

需要 stdio 傳輸的用戶端使用內建 shim：

```json
{
  "mcpServers": {
    "voicestudio": {
      "command": "python",
      "args": ["-m", "backend.mcp_shim"],
      "cwd": "/path/to/VoiceStudio"
    }
  }
}
```

### 2.6 引擎選擇：按硬體對號入座

| 硬體 | 推薦 TTS | 推薦 ASR | 原因 |
|------|----------|----------|------|
| Apple Silicon (M1–M4) | MLX-Audio、OmniVoice (MPS) | MLX Whisper、Parakeet MLX | 統一記憶體，macOS 延遲最低 |
| NVIDIA GPU (8 GB+) | OmniVoice、CosyVoice 3 | WhisperX | 高保真零樣本複製、詞級時間戳 |
| 低顯存 / 純 CPU | PocketTTS、Sherpa-ONNX、KittenTTS | Moonshine、Faster-Whisper (int8) | 低記憶體佔用，CPU 推論最佳化 |

裝置自動偵測（CUDA/ROCm/MPS/CPU），可在 Settings → Performance & Device 或 `OMNIVOICE_DEVICE` 手動鎖定。

---

## 三、設計哲學

### 3.1 Local-first：本機優先是預設狀態，不是行銷詞

核心工作流留在本機；連網功能（遠端 Worker、外部 ASR 端點）是顯式開啟的選項。回環 API 呼叫無需金鑰；遠端存取需要分享 PIN 或 API Key。回環 ASR 可用 HTTP 且音訊不出機；非回環端點強制 HTTPS，不跟隨重新導向。分析功能預設關閉，開啟後也只發白名單內的無內容中繼資料——不發文字、音訊、檔名、專案資料。

### 3.2 引擎不是清單，是職位：engine-acceptance 的准入機制

VoiceStudio 內建 16 款 TTS 引擎。引擎數量只在"每個引擎在每個平台都能工作"時才是資產，否則是支援佇列的堆積，損害"首次執行就能用"的承諾。因此新引擎是"為職位招聘"，不是"加入清單"。

**職位表**（每個職位只有一個任職者）：

| 職位 | 現任 |
|------|------|
| 最佳零樣本複製品質 | omnivoice |
| 最廣語言覆蓋 | omnivoice |
| 預設模型當機隔離 | omnivoice-subprocess |
| 最快 CPU 渲染 / 最低延遲 | 空缺 |
| 最佳中/日表現力 | cosyvoice、indextts2 |
| CPU 即時英語、極小體積 | kittentts、supertonic3 |
| 最佳轉錄準確率 | whisperx、faster-whisper |
| 最快 Apple Silicon 轉錄 | parakeet-mlx、mlx-whisper |
| 轉錄當機隔離 | faster-whisper-isolated |

提案必須"用資料從現任手中搶走職位"，或"認領無人覆蓋的職位"。"跑分不錯"不是職位。

**准入門檻**，缺一即拒：

1. 說出職位名稱——搶哪個職位，為什麼現任覆蓋不了；
2. 授權乾淨，可商用，權重與程式碼都要查——這一條最常終結提案；
3. 全平台可用或顯式可選——必須有 CPU 路徑，只能跑單一加速卡的引擎必須降級可用而不是直接當機；
4. 適配現有轉接器介面（TTSBackend / SubprocessBackend），不改核心流水線；依賴衝突走 sidecar；
5. 同一 PR 附帶 CI 煙霧測試，無 GPU 可樁掉 sidecar；
6. 指定 12 個月 steward（負責人），無 steward 不合入——這是"廣度"與"債務"的分界線；
7. 提供需求證據：真實請求、真實工作流、真實使用者。

**退出機制**：連續兩個版本無 steward 且無通過煙霧測試的引擎被封存。封存不是評判，是讓存活引擎保持可信的方式。**不適配介面的引擎可以在樹外生存**——轉接器介面是公開的，裝好即可按 id 選用，專案寧可連結好的外部引擎，也不養半維護的內部引擎。

### 3.3 能力邊界顯式失敗，不靜默降級

不支援複製的引擎無法在配音或鎖定聲音的批次任務中保留參考說話者。VoiceStudio 的處理是**拒絕任務**，不是悄悄換引擎。行為可預測優先於功能表面上的"都能跑"。

### 3.4 為 Agent 時代預留介面

同一後端同時提供 REST/SSE/WebSocket、OpenAI 相容音訊 API、MCP Server、Rust 聽寫控制 sidecar（可被 Herdr、編碼 Agent、VS Code、TUI 觸發系統級聽寫流程）。專案還隨儲存庫分發 Agent skill（`npx skills add debpalash/VoiceStudio`）。設計假設是：人不是唯一的消費者，AI Agent 也是一等使用者。

### 3.5 責任邊界寫進產品

預設整合 AudioSeal 不可感知浮水印，用於偵測合成音訊；使用前需要說話者明確授權複製；解除安裝腳本先 dry-run 再刪除。倫理要求以功能形態存在，不是檔案裡的倡議。

---

## 四、歸納總結：觀點與結論

### 4.1 六個核心觀點

1. **本機優先是架構決策，不是發行方式。** 資料路徑、認證邊界（回環免金鑰/遠端要 PIN）、HTTPS 強制、分析預設關閉——每個細節都有實作支撐。隱私是預設狀態，不是設定項。

2. **"引擎多"是負債管理問題。** engine-acceptance 機制把引擎准入變成職位競爭：命名職位、資料搶職、授權一票否決、12 個月 steward、連續失修即封存。這條規則適用於任何想整合多個第三方模型的專案。

3. **靜默降級是系統信任的腐蝕劑。** 複製不了的引擎接單後悄悄換引擎，使用者得到的是不可預測的結果。拒絕任務比錯誤輸出便宜。

4. **轉接器介面公開 = 生態擴展不必走主儲存庫。** 樹外引擎按 id 即可接入。專案用"連結好外部引擎"替代"養半維護內部引擎"，降低維護面。

5. **OpenAI 相容 API 是最便宜的整合路徑。** 現有 OpenAI 用戶端改一行 base_url 即可接入，生態遷移成本接近零。對工具類基礎設施，相容主流協定比發明新協定更划算。

6. **AGPL + 模型分層授權是誠實的設計。** 應用程式碼 AGPL-3.0；預設 OmniVoice 權重 CC-BY-NC（商用受限）、部分引擎有 MAU/營收觸發的單獨授權（如 IndexTTS 2.5 超 1 億 MAU 需 Bilibili 書面授權）。應用授權不替代模型授權，使用者在介面上就能看到這個提醒。商用前必須逐引擎核對權重條款。

### 4.2 適用場景

| 場景 | 建議 |
|------|------|
| 個人創作者做配音/有聲書 | 直接裝桌面版，預設 OmniVoice 起步 |
| 隱私敏感產業（醫療、法律、媒體） | 本機工作流 + 回環 API，音訊不出機 |
| 高吞吐批次轉錄/合成 | Docker + 批次佇列 + 遠端 Worker 擴充算力 |
| 給 Agent 加語音能力 | MCP Server 或 OpenAI 相容 API，半天接入 |

### 4.3 局限與注意事項

- 處於 beta 階段，官方建議用最新 release 而非 main 分支；
- 商用授權需逐引擎核對模型權重條款，預設引擎權重是 CC-BY-NC；
- Intel Mac 無法執行本機 Python 後端（PyTorch 無可用 wheel），只能連遠端後端；
- 646 語言是目錄上限，實際品質隨引擎變化，小語種需實測；
- 遠端 Worker 與外部 ASR 端點一旦開啟，資料離開本機，邊界由設定決定。

---

## 五、結語

VoiceStudio 的核心思想可以壓縮成一句話：**把語音能力做成使用者可以完全掌控的本機基礎設施。** 它用本機優先的預設狀態回答隱私問題，用職位制引擎准入回答維護問題，用顯式失敗回答信任問題，用 OpenAI 相容與 MCP 回答生態問題。四條路徑指向同一目標：首次執行就能用，長期執行不出問題。

> **參考資料**
> - 專案儲存庫：https://github.com/debpalash/VoiceStudio
> - 引擎准入機制：docs/engine-acceptance.md（本文 3.2 節主要譯自該文件）
> - 引擎指南：docs/engines/
