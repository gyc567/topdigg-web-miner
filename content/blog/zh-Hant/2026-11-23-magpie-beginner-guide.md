---
title: "40000 星的 magpie：別再一個工具一個工具配 API Key 了，這個網關把所有模型接進所有 AI 工具"
date: "2026-11-23"
description: "magpie 把散落的 API Key、已登錄的訂閱和本地模型收成一份清單，一鍵寫進任何 AI 工具的配置，並在本機跑一個統一網關。這一篇是零基礎老闆的保姆級教程：安裝、加模型來源、選模型、路由組、隱私遮罩、常見問題全包。"
author: "瑞哥观势"
tags:
  - 開源項目分析
  - AI工具
  - 模型網關
  - 降本增效
  - 教程
categories:
  - AI應用
keywords:
  - magpie
  - AI 工具
  - 模型網關
  - API Key
  - 路由組
  - 隱私遮罩
  - 降本增效
source:
  original:
    name: "瑞哥观势"
    url: "https://mp.weixin.qq.com/s/xxxxx"
---

# 40000 星的 magpie：別再一個工具一個工具配 API Key 了，這個網關把所有模型接進所有 AI 工具

**結論先行：** magpie 是給「AI 工具用得多的人」造的一個統一入口。它本身不提供模型，它做三件事：把你手上的模型來源（API Key、已登錄的訂閱、本地模型）收進一個清單；把清單裏的模型一鍵寫進任何一個 AI 編程工具的配置；再在你機器上跑一個本地網關，讓不同廠商的模型能被任何工具調用。

**它的價值不在於「更強」，在於「省錢 + 省事 + 不再被單一廠商鎖死」。** 你手裏有三個訂閱、五把 API Key，以前要寫五份配置、記五個 base URL；裝完 magpie 之後，它們變成一份清單，誰快用誰、誰便宜用誰。

**這一篇是寫給零基礎老闆的保姆級教程。** 不需要會寫代碼，只需要會複製粘貼命令、會點鼠標。

---

**一、先搞清楚：magpie 到底替你幹了什麼活**

在動手之前，你得先理解三個詞。看懂這三個詞，這一整篇就通了。

**① Agent（工具）**：就是你平時用來跟 AI 對話幹活的軟件。Claude Code、Codex、Gemini CLI、OpenCode、Cursor CLI、Cline、OpenClaw、Windsurf、Cursor 編輯器裏的 Chat，幾十種。每個 Agent 本來都只認自己的那套配置。

**② Provider（模型來源）**：模型從哪來。三種形態：

- **API Key**：你去 DeepSeek、Kimi、智譜、MiniMax、OpenAI、Anthropic 官網充值買的接口密鑰，一串 `sk-` 開頭的字符；
- **訂閱**：你已經在 Claude Code 裏登錄過的 Claude Pro/Max、ChatGPT Plus/Pro、GitHub Copilot。magpie 能讀到你本機已登錄的這些賬號，直接把它們的模型共享給別的工具；
- **本地模型**：Ollama、LM Studio 跑在自己機器上的模型，不需要 key。

**③ Gateway（網關）**：magpie 在你電腦上開的一個本地服務，地址是 `127.0.0.1:3425`。所有 Agent 都被改成指向它，它再把請求轉發給真正提供模型的那家廠商，順手把 OpenAI 格式、Anthropic 格式、Gemini 格式互相當翻譯。**你不需要懂技術細節，你只需要知道：所有工具從此只有一個出口。**

**裝之前，你現在的狀態是這樣的：**

```
Claude Code  →  Anthropic 官網  →  你的 Claude 訂閱
Codex        →  OpenAI 官網    →  你的 ChatGPT 訂閱
Cline        →  DeepSeek 官網  →  一把 DeepSeek Key
OpenClaw     →  Kimi 官網      →  一把 Kimi Key
```

**裝完之後：**

```
Claude Code ─┐
Codex       ─┼→  magpie 本地網關  →  { Anthropic, OpenAI, DeepSeek, Kimi, ... }
Cline       ─┤
OpenClaw    ─┘
```

**核心收益：換模型不用改配置文件，改一次全套生效；某個廠商額度用完了自動切下一個，不讓 AI 工具在老闆面前報錯。**

---

**二、零基礎前置檢查（5 分鐘）**

在裝之前，先確認三件事。

**第 1 件：你的系統是什麼。**
macOS（菜單欄圖標那種）、Windows（右下角托盤）、Linux（桌面版或純終端版）。不確定也沒關係，教程裏三個都給了。

**第 2 件：你至少有一個模型來源。**
有訂閱（Claude / ChatGPT / Copilot 任一）最好；沒有的話，去 DeepSeek 或 Kimi 官網開個 API Key 也行，國內付款順暢、幾塊錢就能跑起來。**注意：magpie 本身免費開源，但它不會送模型。** 沒有模型來源就像買了臺路由器但沒接寬帶。

**第 3 件：你已經裝了至少一個 AI 工具。**
如果你還沒裝任何 AI 編程工具，magpie 的 Agents 頁面會是空的。建議先裝一個 Claude Code 或 Cursor，再回來。

**一句話檢查清單：**
- [ ] 有一個 AI 工具已經裝好並能正常對話
- [ ] 有一個 API Key 或一個訂閱賬號在手
- [ ] 知道自己的系統是 Mac / Windows / Linux

---

**三、第一步：安裝**

**3.1 最省事的辦法（推薦零基礎用這個）**

打開瀏覽器，訪問 `usemagpie.ai`，下載對應你係統的安裝包，雙擊安裝。Mac 的包是簽過名、做過 Apple 公證的；Windows 和 Linux 的包也有 GitHub Actions 的構建溯源證明。

**爲什麼推薦這個？** 因爲它繞開了終端裏所有可能的報錯。如果你想驗證下載文件確實是官方構建的，可以在終端裏跑（需要先裝 GitHub CLI）：

```bash
gh attestation verify magpie-darwin-arm64.dmg -R yetone/magpie-releases
```

它會顯示構建它的 workflow 和 run，文件不是官方構建出來的就會失敗。

**3.2 終端一鍵安裝**

如果你習慣命令行（Mac 和 Linux 用戶推薦）：

```bash
curl -fsSL https://usemagpie.ai/install.sh | sh
```

這一條命令幹三件事：下載對應你係統的構建、安裝、把 `magpie` 命令放進 PATH。

**3.3 國內網絡要加代理**

如果你所在網絡訪問不了官網或 GitHub，加參數：

```bash
curl -fsSL https://usemagpie.ai/install.sh | sh -s -- --proxy http://127.0.0.1:7890
```

把 `7890` 換成你自己代理軟件的端口。支持 http、https、socks5、socks5h 四種協議。如果你有 GitHub 下載鏡像，可以再加 `--mirror https://你的鏡像前綴/`。**放心：不管走哪條路，下載文件的 SHA-256 校驗值始終來自官方站點，鏡像改過文件會被直接拒絕。**

**3.4 Linux 用戶的特別說明**

Linux 上安裝腳本會自己判斷：

- 你有圖形桌面，且系統裏已經裝了 WebKitGTK 4.1 → 裝**桌面版**（有窗口、有托盤圖標）；
- 你有圖形桌面但缺 WebKitGTK 4.1 → 腳本會用你的包管理器裝上它（要輸 sudo 密碼），然後裝桌面版；
- 你沒有桌面（純服務器）或者不敢用 sudo → 裝**終端版**，只有命令行界面。

自己指定版本：

```bash
curl -fsSL https://usemagpie.ai/install.sh | sh -s -- --gui    # 強制桌面版
curl -fsSL https://usemagpie.ai/install.sh | sh -s -- --tui    # 強制終端版
```

**3.5 安裝成功的驗證**

打開終端（Mac 是「終端」App，Windows 是 PowerShell），敲：

```bash
magpie --version
```

有版本號輸出，就是裝好了。

再敲這一條，它會列出你機器上所有的 AI 工具和它們當前的配置：

```bash
magpie ls
```

**看到這張表，安裝就算成功了。** 這張表就是你以後每天要盯的儀表盤。

---

**四、第二步：把你的模型來源加進去**

打開 magpie。macOS 從右上角菜單欄圖標點開，Windows 從右下角托盤，右鍵圖標選「Open magpie」。

**4.1 加一個 API Key 廠商（最常見的情況）**

1. 點頂部的 **Providers**（模型來源）標籤；
2. 點 **＋ Add provider**（添加模型來源）；
3. 彈出的面板是一排廠商圖標，找到你買 key 的那家（DeepSeek、Kimi、智譜、MiniMax、阿里百鍊、火山方舟、騰訊混元、硅基流動、OpenRouter、xAI、OpenAI、Anthropic、Gemini 等等都有）；
4. 點進去，把你的 key 粘貼進輸入框，保存。

**各家 key 去哪拿？** 每個廠商旁邊都有一個「Get a key ↗」的小箭頭，點它直接跳到該廠商的密鑰管理頁面。**別從任何第三方頁面買 key，只從廠商官網拿。**

**4.2 登錄訂閱賬號（最省錢的用法）**

在同一個 Add provider 面板裏，點 **Claude**、**ChatGPT**、**GitHub Copilot**、**Gemini Code Assist** 這類訂閱卡片，magpie 會自動打開廠商官方的登錄頁面給你授權登錄。**登錄完，你的訂閱就變成了一個 Provider**，裏面的模型可以給任何一個工具用。

這裏有一個很重要的機制：**一個訂閱可以加多個賬號。** 比如你有 2 個 Claude 賬號、1 個 ChatGPT 賬號，在 Claude 卡片上再點一次就能加第二個賬號。magpie 會在它們之間自動分配，用完一個切下一個，你不會看到「額度已用盡」這種錯誤。

**重要提醒（官方明確說了）：** Claude 訂閱的請求是通過你本機安裝的 Claude Code 轉發的，所以 Claude Code 必須留在機器上別刪。Google 也可能因爲賬號被用在 Antigravity 之外而風控，**所以拿 Antigravity 賬號去做實驗，別拿主力賬號。**

**4.3 本地模型**

裝了 Ollama 或 LM Studio 的，Add provider 面板裏選 **Ollama** 或 **LM Studio**，不需要 key，填個端口就行（Ollama 默認 11434）。**注意成本：本地模型不要錢，但慢。** 日常拿它當兜底，別當主力。

**4.4 任何兼容接口（萬能選項）**

如果你用的是別家服務，只要它兼容 OpenAI 或 Anthropic 格式，就選 **Custom**，填三樣東西：名字、base URL（OpenAI 兼容的以 `/v1` 結尾，Anthropic 兼容的填根地址）、key。magpie 會給每個 API 都配上它能說那種話的接口，需要的那一種直接用，另一種由 magpie 翻譯。

**4.5 導入已有的配置（省事大招）**

Add provider 面板頂部有個 **Import…** 按鈕，點它可以讀取你 Claude Code 的 `settings.json`、Codex 的 `config.toml`、CC Switch、Alma 裏的配置，把裏面的模型來源直接搬進 magpie。**它只讀不改，原文件不動。** 你已經配過一堆 key 的話，這一步能省你半小時。

**4.6 關鍵的安全提示**

**magpie 的 key 存在 `~/.config/magpie/providers.json`，只有你自己能讀。** 它**不會**從你的 shell 環境變量裏讀 key。你加進去什麼，它就用什麼，不會偷偷複用你 `export` 過的其它 key。這一條設計很剋制，值得信任。

---

**五、第三步：給每個工具選模型**

**5.1 圖形界面操作**

1. 點頂部 **Agents**（工具）標籤；
2. 頁面上每一行是一個 AI 工具，右邊那一列寫着它當前用的模型；
3. **點擊那個模型名**，彈出一個可搜索的列表，分三組：工具自己的模型、你的路由組、你添加的所有 provider 下的所有模型；
4. 直接點你想要的模型，或者輸入關鍵字過濾。

**點下去的一瞬間，magpie 就改好了這個工具的配置文件。** 它只動需要動的那一個鍵，註釋、順序、縮進全部原樣保留，寫入是原子的（不會寫到一半斷電留下半截文件）。

**5.2 它到底改了你哪些文件**

這張表值得老闆看一眼，因爲它是「magpie 不會弄壞你東西」的證據：

| 工具 | 被修改的配置文件 |
|------|------------------|
| Claude Code | `~/.claude/settings.json`：寫入 ANTHROPIC_BASE_URL、ANTHROPIC_AUTH_TOKEN 和模型字段 |
| Codex | `~/.codex/config.toml`：新增一個 `[model_providers.magpie]` 段和模型設置 |
| Gemini CLI | `~/.gemini/settings.json` 和 `~/.gemini/.env` |
| OpenCode | `~/.config/opencode/opencode.json(c)` |
| Cursor CLI | `~/.cursor/cli-config.json` |
| Cline / Roo / OpenClaw 等 | 各自約定的配置文件 |
| VS Code Chat、Zed、JetBrains | 編輯器自己的設置文件 |

**全部都是「只改一個鍵」，不是「重寫整個文件」。**

**5.3 命令行操作（更快）**

```bash
magpie claude deepseek/deepseek-v4-pro      # 讓 Claude Code 用 DeepSeek
magpie codex moonshot/kimi-k2.5             # 讓 Codex 用 Kimi
magpie opencode anthropic/claude-sonnet-5   # 讓 OpenCode 用 Claude
magpie codex effort high                    # 順便把推理強度調高
```

**模型名的格式是 `廠商/模型名`**，比如 `deepseek/deepseek-chat`、`moonshot/kimi-k2.5`。用 `magpie models` 可以列出當前所有 Agent 能選的模型。

**5.4 最關鍵的一步：開新會話**

**這是 90% 的人第一次會卡住的地方：** 已經開着的會話不會換模型。Agent 都是在啓動時讀配置文件的。

所以：**選完模型，退出當前會話，重新開一個。** Codex 用戶還要把 Codex 應用整個退出重開（它的模型列表是啓動時生成的）。

**5.5 怎麼確認真的生效了**

```bash
magpie ls
```

看看那行工具後面寫的模型變了沒有。變了就對了。

**或者看用量頁**：magpie 裏有一個 Usage（用量）標籤頁，會顯示每個工具、每個模型花了多少 token、多少錢、走的是哪個 provider。**這一頁是你以後做成本覆盤的依據。**

---

**六、第四步（可選，但強烈建議）：路由組，讓額度自動接力**

如果你的模型來源超過一個（兩個訂閱、或者訂閱 + API Key），你就不該讓工具只認一個模型。**額度用完自動切下一個，是 magpie 最有商業價值的一個功能。**

**6.1 一個模型多個來源的情況**

假設你既有 Claude 訂閱、又有 Copilot、還有一把 Anthropic 的 API Key，它們都提供 Opus 系列。magpie 會自動把它們組成一個組，叫 `auto/claude-opus-4.6`。你在 Agent 裏選這個組就行，請求會自動在這幾個來源之間分配。

**6.2 手動建組**

命令行方式：

```bash
magpie group add "Opus anywhere" models=claude/claude-opus-5-5,copilot/claude-opus-5.5 routing=smart
magpie claude group/opus-anywhere
```

**6.3 分配策略有 9 種，選哪個？**

| 策略 | 行爲 | 什麼場景用 |
|------|------|-----------|
| **smart（智能，默認）** | 優先用「快要重置但還沒用完」的那個訂閱，避免白白過期 | 老闆日常，**默認選這個** |
| order（按順序） | 第一個用到不能用爲止，然後換下一個 | 有一個特別想優先用的主力模型 |
| rotate（輪轉） | 每輪請求換一個來源 | 想把每個賬號的額度均衡消耗掉 |
| usage（最少用的優先） | 誰剩得多用誰 | 多個賬號額度差距大 |
| pace（快過期優先） | 誰這周快到期、損失最大先用誰 | 不想讓訂閱月底作廢 |
| weight（按權重） | 按設定的比例分流 | 想給便宜模型分配更多流量 |
| fast（速度優先） | 誰最近答得快用誰 | 對響應速度敏感的場景 |
| cheap（最便宜優先，僅組可用） | 誰最便宜用誰 | **純成本優化，老闆最該用的** |

**給老闆的直白建議：日常用 `smart`，跑批處理、跑無人值守任務用 `cheap`。** 便宜模型幹粗活，貴的模型留給需要判斷的活，這纔是 AI 降本增效真正的落點。

**6.4 額度儀表**

```bash
magpie quota
```

這條命令會告訴你每一個訂閱、每一把 key 還剩多少、什麼時候重置。**建議每週看一次。** 訂閱額度是白扔的，看一眼就能知道該不該換模型。

---

**七、第五步（可選）：配置檔案（Profile），一鍵切換工作模式**

**場景**：白天用便宜的模型跑日常任務，晚上要用最強模型改一個複雜架構；或者你要在「自己的 Claude 訂閱」和「公司的 API Key」之間切換。手工改配置很煩。

在 Agents 頁面底部點 **＋ Save current**，把當前所有工具的配置存成一個檔案，比如叫「省錢模式」和「攻堅模式」。以後點一下檔案，所有工具一次性切過去。

```bash
magpie save work      # 保存當前所有配置爲檔案 work
magpie use work       # 切回 work
magpie profiles      # 看有哪些檔案
```

**這個功能對老闆的真正價值：把「AI 用量」變成一個可控的管理動作。** 團隊裏誰在用哪個模型、花了多少錢、切檔案就能管住。

---

**八、第六步（強烈建議）：隱私遮罩**

**這一節是我認爲整個教程裏最值錢的部分，請務必看完。**

**問題是什麼？** 你的 AI 工具會把你讀到的東西塞進 prompt 裏發出去，包括你項目裏的 `.env` 文件、配置文件、日誌裏的 token。如果你的 prompt 裏不小心帶了 API Key、密碼、客戶郵箱，那它就原樣發給了模型廠商。

**magpie 的做法（開箱即用，本地完成）：**

1. 你在 **Settings → Privacy** 裏打開 masking（默認是關的，**記得手動打開**）；
2. magpie 在你**電腦上**把 key、密碼、郵箱這些值換成佔位符，比如 `{{API_KEY_k3v9x2mq}}`；
3. 請求發出去的是佔位符，**廠商永遠看不到你的真 key**；
4. 模型回覆裏帶着佔位符回來，magpie 在本地換回真值，工具照常能用。

**幾個設計細節，說明它不是隨便做的：**

- 同一個值每次都換**同一個佔位符**，所以對話上下文、prompt 緩存、思維簽名都不會失效；
- 值**只存在內存裏**，磁盤上只記「類型、長度、前幾個字符」，不記值本身；
- 如果遮罩開着但它跑不起來，請求會被**扣住不發**（返回 503），而不是把原文直接發出去；
- 內置規則覆蓋 API Key、私鑰、token、郵箱、校驗和能對上的卡號身份證號；還可以配自己的關鍵詞和正則；
- 每一條被改過的請求都可以在 **Insights → Masking** 裏對照查看：你改了什麼、廠商看到的到底是什麼。

**代價要說清楚：** 模型看到的是 `{{API_KEY_xxx}}` 而不是真 key，所以「這個 token 爲什麼被拒」這類問題它答不了。這種值要放進 Never mask 列表。**這是所有安全方案的通病，知情即可。**

**老闆視角的一句話：這一條是「讓公司敢把真實業務數據餵給 AI」的開關。不開，你的研發同事遲早會把生產環境的密鑰發到模型廠商那兒。**

---

**九、常見問題排查（照着做就行）**

**問題 1：Agent 報 502，或者連不上，magpie 的 Routing 頁面也是空的。**

**這是國內最常見的一個坑，90% 是代理軟件乾的。** 你的 Surge / Clash / mihomo 開着系統代理或 TUN 模式，把發往 `127.0.0.1:3425` 的請求也代理走了，magpie 根本收不到。

**解法：給本地地址加直連規則，放在你其它規則的最前面。**

Surge：
```
IP-CIDR,127.0.0.0/8,DIRECT,no-resolve
IP-CIDR6,::1/128,DIRECT,no-resolve
```

Clash / mihomo（放在 `rules:` 下，每行前面加一個 `-`）：
```yaml
- IP-CIDR,127.0.0.0/8,DIRECT,no-resolve
- IP-CIDR6,::1/128,DIRECT,no-resolve
```

改完給 Agent 發一個新請求。**記住這個解法，它能省你兩小時。**

**問題 2：我換了模型，但 Agent 還是用老的。**

三個原因：① 會話沒重開；② Codex 沒重啓應用；③ 你改的是工具的配置文件，但工具讀的是另一個環境變量。

按順序試：關掉當前會話 → 新開一個會話 → 還不行就完全退出 Codex 應用再啓動。

**問題 3：改完 magpie 配置，我手改的設置會不會丟？**

不會。magpie 每次都重新讀文件，只動它自己那幾個鍵。你手寫的註釋、其他配置項、縮進全部保留。

**問題 4：怎麼把某個工具恢復原樣？**

```bash
magpie claude default
```

它會把它寫進去的東西撤掉，把你原來的 `ANTHROPIC_BASE_URL` 之類的值還原回來。圖形界面裏選這個工具自己的模型，效果一樣。

**問題 5：magpie 必須一直開着嗎？**

**用 magpie 的模型，就必須開着。** 網關是跟着 app 一起跑的。

三種讓它常駐的方式：

```bash
magpie tray              # 只留菜單欄/托盤圖標（放進開機自啓）
magpie serve             # 只跑網關，不開窗口
magpie daemon install    # 裝成系統服務，Linux 用 systemd，Mac 用 launchd，開機自啓
```

`magpie daemon install --web` 還能順便把網頁版界面也開起來。**老闆的建議：用 `magpie daemon install` 裝成服務，別指望手動去點圖標。**

**問題 6：Linux 上裝完只有終端界面，想換成桌面版。**

按提示裝 WebKitGTK 4.1：

```bash
sudo apt install libwebkit2gtk-4.1-0     # Debian / Ubuntu
sudo dnf install webkit2gtk4.1            # Fedora
sudo pacman -S --needed --noconfirm webkit2gtk-4.1   # Arch
sudo zypper install libwebkit2gtk-4_1-0   # openSUSE
```

裝完再跑一次安裝腳本。

**問題 7：怎麼徹底卸載、把工具恢復原狀？**

```bash
curl -fsSL https://usemagpie.ai/install.sh | sh -s -- --uninstall
```

它會先斷開所有 Agent 並還原它們原來的配置，再把安裝的東西刪掉。**你的設置和 provider 保留在 `~/.config/magpie`，加 `--purge` 纔會一起刪。**

**問題 8：換電腦怎麼辦？**

```bash
magpie backup                       # 備份（會要你設兩遍密碼）
magpie restore magpie.magpie-backup # 在新電腦上恢復
```

也可以在設置裏同步到 WebDAV、S3 或一個加密的 GitHub 倉庫。**備份文件默認不含 API Key**，想帶走 key 要設密碼短語。

---

**十、進階玩法（知道就行，先不做）**

**10.1 讓所有工具都能聯網搜索**

magpie 內置了一堆搜索引擎接口（Tavily、Brave、Exa、Firecrawl、DeepSeek 搜索、豆包、騰訊元寶等），可以在設置裏配好，然後以 MCP 的方式掛給任何 Agent，Agent 就同時擁有 `web_search` 和 `web_fetch` 兩個工具。**注意：這是要花錢的**，各家的 key 各自計費。

**10.2 讓所有工具都能畫圖**

magpie 提供了圖像生成工具，用你指定的模型，通過 MCP 掛給任何 Agent。

**10.3 在 NAS 或服務器上跑**

```bash
docker run -d -p 3430:3430 ghcr.io/yetone/magpie
```

然後用瀏覽器管理。**適合做團隊共享的模型網關**，配合「Share on local network」還能給局域網內其他機器用，並且可以給每個客戶端發獨立的 key，配上每日/每週/每月的 token 和花費上限。**這一條對有研發團隊的公司價值很大：等於給全公司的 AI 支出裝了個總閘門。**

**10.4 用插件**

magpie 支持插件（跑在 Bun 上），社區有現成的市場。插件既能提供模型（比如登錄類插件），也能作爲網關中間件，改寫請求、過濾敏感詞、映射模型名。

**10.5 讓別的工具也接進來**

任何支持自定義 base URL 的工具都能用，導出的環境變量長這樣：

```bash
export OPENAI_BASE_URL=http://127.0.0.1:3425/v1
export OPENAI_API_KEY=magpie
export ANTHROPIC_BASE_URL=http://127.0.0.1:3425
export ANTHROPIC_API_KEY=magpie
export GOOGLE_GEMINI_BASE_URL=http://127.0.0.1:3425
export GEMINI_API_KEY=magpie
```

---

**十一、magpie 到底給不給數據出去？（老闆必看這一段）**

**結論：你的 prompt、回覆、key、賬號，只發給你自己選的那些模型廠商，magpie 自己沒有服務器站在中間。** 它就是個本地轉發器。

**它默認每天上報一次使用統計**，內容包括：一個隨機 id（在你本機生成的）、版本號、系統信息、你用了哪些 agent / provider / 模型（用 magpie 自己的 id，你自己加的 provider 只標記爲 custom）、裝了哪些插件和用了哪些市場 MCP。**不含任何名字、URL、賬號、key、prompt 和用量明細。**

**關閉方式**（三選一）：
- 設置 → Privacy 裏逐項關掉；
- 環境變量設 `DO_NOT_TRACK=1`；
- 環境變量設 `MAGPIE_NO_STATS=1`。

**另外兩件事你該知道：**

- 它會讀你機器上已登錄的 Claude Code、Codex 的登錄信息（鑰匙串裏的）。不想讓它讀：**設置 → Privacy → 訂閱賬號 關掉**，或者 `magpie accounts discovery off`。**API Key 類型的 provider 不受影響，照常能用。**
- 官方文檔在 `/docs/privacy` 列了全部上報內容。

**老闆的判斷標準：如果你的公司對「數據出境」有法務要求，去讀那一頁。它寫得比大多數同類產品都細，包括插件圖標走 Cloudflare 代理、只統計點擊數不留 id 這類細節。** 這是一個加分項，不是減分項。

---

**十二、最後：這套東西對老闆意味着什麼**

技術講完了，說點實際的。

**第一層，賬。**
你現在有多少個 AI 訂閱？每個月的錢是不是對得上賬？magpie 的 Usage 頁把每個工具、每個模型、每把 key 的花費攤開給你看，配上路由組的 `smart` 和 `cheap` 策略，**同樣一件事能省 30% 到 60% 是常態**，因爲過去你只能用一個模型幹所有活，現在可以按任務難度分流。

**第二層，人。**
新來的工程師不用再問「key 在哪、base URL 怎麼填」，一條命令 `magpie claude deepseek/deepseek-chat` 就完事。**這省下來的是「每個新人花兩天配環境」的成本。**

**第三層，資產。**
你的模型來源（訂閱、key、配置）現在有一份可備份、可遷移的清單。`magpie backup` 一條命令帶走，換電腦、換人接手，不至於「只有某個人知道 key 在哪」。

**第四層，風險。**
隱私遮罩這一條，把「研發不小心把生產密鑰發到模型廠商」這個幾乎必然會發生的事，攔在了你公司內部解決。**這一條我認爲值前面三條的總和。**

**第五層，也是最重要的一層：你不被鎖死。**
今天 OpenAI 降價，明天 Anthropic 漲價，後天出了個新模型很猛。裝了 magpie，換廠商是一次點擊的事，不是全公司改配置的技術項目。**這是把「AI 工具」從固定資產變成可變成本的能力。**

---

**十三、落地建議（別一次做完）**

**第 1 天**：裝好 magpie，把一個 API Key 加進去，只改一個工具（比如 Cline）試跑一天。確認能用再往下走。

**第 2 天**：把手上其它訂閱也登錄進來，建兩個路由組：日常用 `cheap`，攻堅用 `smart`。教會自己用 `magpie quota` 和 Usage 頁。

**第 3 天**：打開隱私遮罩。給你所有工具配一份 Profile（省錢 / 攻堅）。跑一次 `magpie ls` 存檔，作爲團隊的標準配置基線。

**第 2 周**：如果團隊超過三個人，開局域網共享 + 每客戶端獨立 key 和花費上限。這一步做完，你對 AI 支出就有了總控能力。

**不要做的事：** 不要一上來就改 20 個工具的配置然後全部重開，出問題你排查不動。一次改一個，改完驗一次。

---

**最後總結**

magpie 拿了 40000 多個 star，不是因爲它能讓你用上更強的模型，是因爲它解決了一件每個人都被煩過的事：**模型和工具的配對地獄。**

它做的事翻譯成老闆能聽懂的話就是四句：

**第一，把散落的模型來源收成一份清單。第二，把「換模型」從改配置變成點一下。第三，額度用完自動接力，別讓工具在你面前報錯。第四，在數據出門之前，先在你自己的電腦上把密鑰換掉。**

前三句是效率，第四句是安全。**四句加起來，纔是我推薦你花一個下午去裝它的全部理由。**

---
Eric|瑞哥
广东 深圳

✅前IBM架构师｜区块链书《区块链核心技术与应用》合著作者
技术代码仓库:https://github.com/gyc567
个人网站:www.topdigg.com
💼新加坡资管公司前CTO
👉公众号「瑞哥观势」主理人
💎聚焦在:创富和守富
🎯专注老板群体：用AI 降本增效
微信:360369487

---

**🏢 企業 AI 落地：KumoAI 企業知識庫客製化開發**

我把企業 AI 的落地做成了自己的產品：**KumoAI 企業級 AI 辦公中台**。

企業的知識、業務數據、客戶數據，留在自己本地，私有化部署，數據不出門。它不是一個聊天工具，而是一套隨業務規模不停進化和最佳化的數字員工系統：文件放進去就能被檢索、被調用；用得越多，AI 越懂這家公司的口徑和打法；經驗從「躺在某個人的腦子裡」變成「長在系統裡」。

官網：kumolabsai.com

---


在这个快节奏的时代，我依然相信面对面、小范围、高浓度的链接力量。

我致力于搭建一个"去泡沫化"的老板圈子，重点关注：

🔹 电商全域：国内直播、跨境电商与出海项目孵化

🔹 创投与产投：金融银行资源对接、企业融资与并购

🔹 内容生态：MCN机构、达人矩阵与品牌整合

🔹 组织建设：企业核心团队搭建、高管寻访

**【我的线下局】**

不办大会，只办"小会"。

✅ 创业私董会：深度剖析商业难题

✅ 老板闭门饭：链接同频灵魂，甚至解决人生大事（高质量单身圈层）

✅ 行业沙龙：聚焦具体赛道，促成实质合作

**筛选标准：**

只欢迎有结果、有边界感、有长期主义心态的创始人/合伙人。

时间宝贵，只留给有价值的人。
