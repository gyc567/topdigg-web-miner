---
title: "OneTerm 深度解析：VeOps 開源堡壘機——基於 4A 概念的企業級安全接入與運維審計方案"
description: "全面解析 VeOps 開源的 OneTerm——一個簡潔、輕量、靈活的企業級堡壘機（跳板機）產品。基於 4A 安全概念（認證、授權、帳號、審計），用 Go 後端 + Vue.js 前端 + Apache Guacamole 實現 SSH/RDP/VNC/Telnet/資料庫等多協定安全接入，支援會話錄製回放、命令管控、時間/IP 訪問策略、OAuth2/LDAP/CAS 單點登入，以及與 VeOps CMDB 的一鍵資產同步。從核心思想、架構模組、設計哲學到完整 Docker Compose 部署教學與功能清單，一文講透。"
date: "2026-08-04"
author: "TopDigg Research Team"
tags: ["OneTerm", "Bastion Host", "Jump Server", "4A Security", "SSH", "RDP", "VNC", "DevOps", "Go", "VeOps"]
categories: ["Deep Dive"]
keywords: ["OneTerm", "堡壘機", "跳板機", "4A 安全", "認證授權", "審計", "SSH", "RDP", "VNC", "會話錄製", "命令管控", "Docker 部署", "運維安全"]
---

# OneTerm 深度解析：VeOps 開源堡壘機——基於 4A 概念的企業級安全接入與運維審計方案

> 核心思想：**堡壘機的本質是「一個入口管所有機器」——把散落在網路裡的伺服器訪問統一收口到一個安全節點上。** OneTerm 是 VeOps 開發的開源企業級堡壘機產品，基於 **4A 安全概念**（Authentication 認證 / Authorization 授權 / Account 帳號 / Audit 審計），用 **Go 後端 + Vue.js 前端 + Apache Guacamole 代理**建構了一套從認證到審計的完整運維安全棧。它支援 SSH、RDP、VNC、Telnet、MySQL、PostgreSQL、MongoDB、Redis 等多協定接入，提供會話錄製與回放、命令範本管控、時間/IP 訪問策略、OAuth2/LDAP/CAS 單點登入、SFTP 檔案傳輸，以及與 VeOps CMDB 的一鍵資產同步。一套 `docker compose up -d` 即可部署——把企業運維的「安全入口」問題，用最輕量的方式解決。

---

## 一、專案說明

### 1.1 它是什麼？

**OneTerm** 是 VeOps（維易科技）開發的**企業級堡壘機**（也叫跳板機、Bastion Host）。它的核心定位是：**在使用者和伺服器之間架設一道安全關卡**——所有遠端連接必須先經過 OneTerm 的認證和授權，才能觸達目標伺服器。

基於 **4A 安全概念**：

- **Authentication（認證）**：你是誰？（使用者名稱密碼、MFA、OAuth2/LDAP/CAS）
- **Authorization（授權）**：你能存取什麼？（基於角色的細粒度權限）
- **Account（帳號）**：統一管理使用者帳號和憑據
- **Audit（審計）**：你做了什麼？（全量操作日誌與會話錄製）

### 1.2 關鍵資料

- 儲存庫：`https://github.com/veops/oneterm`
- Stars：**1,524**
- Forks：**157**
- 作者：**VeOps**（維易科技）
- 建立時間：2024-01-30
- 最後推送：2026-02-03
- 最新版本：v25.9.1（2025-09-16）
- License：**AGPL-3.0**
- 語言：**Go**（後端）、**Vue.js**（前端）、Ant Design Vue（UI 元件庫）
- 提交數：389 commits
- 貢獻者：6 人
- 官網：`v1ops.com`
- 線上演示：`oneterm.v1ops.com`（demo/123456）

### 1.3 它解決什麼問題？

企業運維中有大量伺服器需要遠端管理，傳統做法是每台伺服器直接暴露 SSH 連接埠——密碼分散管理、沒有操作審計、一旦被入侵就是裸奔。OneTerm 的答案是：**用一個堡壘機作為唯一入口**，所有連接先過認證和授權，操作全程錄製，密碼統一管控。這樣即使某台伺服器被攻破，攻擊者也無法橫向移動——因為所有流量都必須經過 OneTerm。

---

## 二、核心思想

### 2.1 4A——安全運維的「四根柱子」

OneTerm 的整個設計圍繞 **4A** 展開：

- **Authentication（認證）**：你是誰？支援使用者名稱密碼、多因子認證（MFA）、OAuth2、LDAP、CAS 單點登入
- **Authorization（授權）**：你能做什麼？基於角色的存取控制（RBAC），細粒度到命令級別
- **Account（帳號）**：統一管理使用者憑據，支援密碼代填、集中改密
- **Audit（審計）**：你做了什麼？全量操作日誌、會話錄製與回放、命令風險等級分類

### 2.2 單一入口——攻擊面最小化

OneTerm 只暴露一個連接埠（預設 8666 Web + 2222 SSH），所有伺服器都在內網。攻擊者即使攻破 OneTerm，也只能看到已被授權的資源——而不是整個內網。這是**攻擊面最小化**的經典實踐。

### 2.3 會話錄製——事後追溯的「黑盒子」

每個使用者會話都被完整錄製並儲存（支援本地、S3、OSS、COS、MinIO、Azure Blob 等多種後端）。安全事件發生後，管理員可以像「回放錄影」一樣重放使用者的完整操作過程——這是合規審計的核心需求。

### 2.4 與 CMDB 聯動——資產即程式碼

OneTerm 與 VeOps CMDB（同為開源）深度整合，支援一鍵從 CMDB 匯入資產。這讓堡壘機的「資產清單」與企業 CMDB 保持同步，避免了手動維護資產列表的繁瑣與出錯。

---

## 三、內容架構

### 3.1 服務組成（Docker Compose）

OneTerm 的部署由 5 個 Docker 服務組成：

- **oneterm-api**：Go 後端 API 服務（連接埠 2222 SSH / 8888 HTTP）
- **oneterm-guacd**：Apache Guacamole 守護行程（RDP/VNC/Telnet 代理，連接埠 14822）
- **mysql**：MySQL 8.2.0 資料庫（連接埠 13306）
- **redis**：Redis 7.2.3 快取（連接埠 16379）
- **oneterm-ui**：Vue.js 前端 + Nginx（連接埠 8666）
- **acl-api**：ACL 權限服務（Flask/Python，連接埠 5000）

### 3.2 後端目錄結構

```
backend/
├── cmd/server/main.go           # 入口
├── internal/
│   ├── api/                     # HTTP API 層（控制器、中間件、路由、Swagger）
│   ├── connector/protocols/     # 協定處理器：ssh.go、guacd.go、telnet.go、web.go、db/
│   ├── guacd/                   # Guacamole 連線管理
│   ├── service/                 # 業務邏輯層（帳號、資產、授權、會話等）
│   ├── repository/              # 資料存取層
│   ├── model/                   # 資料模型
│   ├── sshsrv/                  # SSH 伺服器實作
│   ├── session/                 # 會話錄製與解析
│   ├── web_proxy/               # Web 代理
│   └── tunneling/               # SSH 隧道管理
└── pkg/storage/providers/       # 儲存後端：s3、oss、cos、obs、oos、minio、azure、local
```

### 3.3 前端目錄結構

```
oneterm-ui/src/modules/oneterm/views/
├── access/          # 存取控制、授權規則
├── assets/          # 資產管理
├── connect/         # 終端、Guacamole 客戶端、檔案管理
├── log/             # 登入日誌、操作日誌
├── replay/          # 會話回放
├── session/         # 活躍會話、歷史會話
└── workStation/     # 主工作站 UI
```

---

## 四、設計哲學

### 4.1 「簡潔輕量」是刻意的

OneTerm 在 README 開頭就強調：**"A Simple, Lightweight, Flexible Bastion Host."** 它沒有做成一個龐大的運維平台，而是專注於「安全接入 + 審計」這一件事。這讓它可以用 `docker compose up -d` 一條指令部署，也意味著運維團隊不需要學習一個複雜的系統就能上手。

### 4.2 4A 不是口號，是架構約束

4A（認證/授權/帳號/審計）在 OneTerm 裡不是貼在牆上的標語，而是實實在在的架構約束：每個連接必須先認證、再授權、操作必須審計、帳號統一管理。這四個環節缺一不可——少一個就不是堡壘機。

### 4.3 開源但不簡陋

OneTerm 雖然是開源專案，但功能覆蓋了企業級堡壘機的核心需求：MFA、LDAP/OAuth2/CAS 單點登入、命令範本管控、時間/IP 訪問策略、多儲存後端、CMDB 聯動。它沒有因為開源而「閹割」功能——AGPL-3.0 許可也確保了程式碼的持續開放。

### 4.4 依賴成熟元件而非重新發明

OneTerm 沒有自己寫 RDP/VNC 代理，而是整合了 Apache Guacamole（一個久經考驗的遠端桌面閘道）；沒有自己做權限系統，而是用獨立的 ACL 服務。這種「站在巨人肩膀上」的策略讓 OneTerm 可以專注於堡壘機的核心邏輯，而不是重複造輪子。

---

## 五、詳細教學

### 5.1 快速部署（預設密碼）

```bash
git clone https://github.com/veops/oneterm.git
cd oneterm/deploy
docker compose up -d
```

存取 `http://127.0.0.1:8666`，使用者名稱 `admin`，密碼 `123456`。

### 5.2 安全部署（自訂密碼）

```bash
git clone https://github.com/veops/oneterm.git
cd oneterm/deploy
./setup.sh          # 互動式產生安全密碼
docker compose up -d
```

### 5.3 連接埠映射

- **8666**：Web 介面（Nginx + Vue.js）
- **2222**：SSH 代理
- **13306**：MySQL
- **16379**：Redis
- **14822**：Guacamole（RDP/VNC/Telnet 代理）

### 5.4 開發環境搭建

```bash
# 前端開發（熱重載）
./dev-start.sh frontend

# 後端開發（熱重載）
./dev-start.sh backend

# 完整環境
./dev-start.sh full

# 停止
./dev-start.sh stop
```

**前置要求**：Docker、Node.js 14.17.6+、Go 1.21.3+

### 5.5 連接伺服器

部署完成後，在 Web 介面中：

1. 新增資產（伺服器 IP、連接埠、協定）
2. 建立使用者並分配授權規則
3. 使用者登入後，在「工作台」選擇目標伺服器，點擊「連接」
4. 瀏覽器內開啟 Web 終端（SSH）或 Guacamole 客戶端（RDP/VNC）

### 5.6 會話錄製與回放

連線建立後，所有操作自動錄製。管理員在「會話管理」中可以：

- 查看活躍會話（支援即時監控）
- 回放歷史會話（像影片一樣重放完整操作）
- 匯出會話日誌

### 5.7 命令管控

在「授權規則」中配置命令範本：

- **允許命令白名單**：只允許執行特定命令
- **禁止命令黑名單**：禁止危險操作（如 `rm -rf`、`drop database`）
- **命令風險等級**：按風險分類，高風險命令需二次審批

### 5.8 與 CMDB 聯動

如果已部署 VeOps CMDB，可以在 OneTerm 中一鍵匯入資產——CMDB 中的伺服器資訊自動同步到堡壘機，無需手動重複錄入。

---

## 六、功能清單

- **多協定支援**：SSH、RDP、VNC、Telnet、MySQL、PostgreSQL、MongoDB、Redis
- **會話錄製**：完整操作錄製，支援本地/S3/OSS/COS/MinIO/Azure Blob 儲存
- **會話回放**：像影片一樣重放使用者操作
- **會話共享**：將活躍會話分享給其他使用者
- **命令管控**：命令白名單/黑名單、風險等級分類
- **時間訪問策略**：基於時間範本控制訪問視窗
- **IP 白名單**：基於 IP 的訪問限制
- **多因子認證（MFA）**：透過 ACL 服務整合
- **OAuth2/LDAP/CAS**：企業單點登入
- **密碼管理**：集中密碼管理、密碼代填、自動改密
- **Web 終端**：瀏覽器內 SSH 終端（WebSocket）
- **Web 代理**：無需客戶端的 Web 方式存取伺服器
- **檔案傳輸**：SFTP 上傳/下載
- **儲存後端**：本地、S3、OSS、COS、OBS、OOS、MinIO、Azure Blob
- **CMDB 整合**：與 VeOps CMDB 一鍵資產同步
- **統計儀表板**：資產活躍狀態、使用者排行等
- **快捷命令**：預定義命令快捷方式
- **Docker 部署**：`docker compose up -d` 一鍵部署

---

## 七、歸納總結（觀點與結論）

結合專案與資料，幾個值得思考的點：

1. **堡壘機的價值不在「技術複雜度」，而在「制度執行」。** 很多企業有堡壘機但沒人用——因為運維人員嫌麻煩，直接 SSH 到伺服器。OneTerm 的 Web 終端和一鍵部署降低了使用門檻，讓「制度執行」變得可行。簡潔不是簡陋，而是讓安全策略真正落地的手段。

2. **4A 是安全運維的最小完備集。** 認證解決「你是誰」，授權解決「你能做什麼」，帳號解決「怎麼管你」，審計解決「你做了什麼」——這四個維度覆蓋了運維安全的核心訴求。OneTerm 沒有試圖做成大而全的運維平台，而是把 4A 做透。

3. **Docker Compose 部署是「輕量」的最佳體現。** 一條指令起 6 個服務，30 分鐘內從零到可用——這對中小企業來說是巨大的吸引力。複雜度被封裝在 Docker 映象裡，運維團隊不需要理解 Go 編譯、Vue.js 構建、MySQL 配置。

4. **Apache Guacamole 是「不重新發明輪子」的典範。** RDP/VNC 代理是一個極其複雜的協定實作，OneTerm 選擇整合 Guacamole 而不是自己寫——這讓它可以把精力集中在堡壘機的核心邏輯（認證、授權、審計）上。

5. **AGPL-3.0 是一把雙刃劍。** 它確保了程式碼的持續開放（任何修改都必須回饋社群），但也意味著企業如果要做 SaaS 服務就必須開源自己的修改——這在商業場景下可能是一個顧慮。

6. **CMDB 聯動是「資產即程式碼」的實踐。** 堡壘機的資產列表如果靠手動維護，很快就會過時。與 CMDB 的整合讓資產自動同步，確保了堡壘機始終知道「有哪些伺服器需要保護」。

---

## 參考資料

- 儲存庫：`https://github.com/veops/oneterm`
- 官網：`https://v1ops.com/`
- 線上演示：`https://oneterm.v1ops.com/`（demo/123456）
- 產品文件：`https://v1ops.com/docs/design/`
- VeOps CMDB：`https://github.com/veops/cmdb`
- VeOps ACL：`https://github.com/veops/acl`
- VeOps Messenger：`https://github.com/veops/messenger`
- Apache Guacamole：`https://guacamole.apache.org/`