---
title: "OpenBot Phan Tich Sau: Moi AI Agent Co May Tinh Cua Rieng Minh"
date: "2026-08-21"
description: "Phan tich chuyen sau CopilotKit/OpenBot: nen tang AI agent, moi Bot co may tinh doc lap voi trinh duyet that, he thong tep va cong cu. Moi hanh dong duoc quyet dinh truoc khi thuc hien va ghi lai sau. Y tuong cot loi: cong nhan AI dang tin cay. Ho tro bat ky AG-UI agent nao, enggine chinh sach CEL, nhật ky kiểm toan day du, trien khai Docker mot lan."
tags:
  - OpenBot
  - CopilotKit
  - AI Agent
  - AG-UI
  - Agent Platform
  - LangGraph
  - CrewAI
  - Tu chu
  - Quan ly bao mat
  - MCP
categories:
  - Phan tich chuyen sau
  - AI Agent
  - Du an nguon mo
---

# OpenBot Phan Tich Sau: Moi AI Agent Co May Tinh Cua Rieng Minh

> Y tuong cot loi: **"Dong nghiep AI ma ban co the giao viec thuc su va thuc su tin tuong khi trao quyen truy cap"** — Nguoi sang lap OpenBot cho rang, van de hien tai cua AI Agent khong phai la "nang luc" ma la "gioi han hoat dong dang tin cay". Mot Agent co the dieu khien trinh duyet that, doc ghi tep, goi MCP, nhung no dang lam gi, tai sao, va ban co the接管 bat ky luc nao — day moi la dieu quyet dinh Agent co the thuc su tro thanh dong nghiep cua ban. Cau tra loi cua OpenBot: **Cho moi Agent mot may tinh cua rieng minh, voi mot cong khong chi la gateway chi xem ma khong quan ly, cong voi nhat ky van hanh day du.**

## I. Boi Canh Du An Va Đinh Vi Cot Loi

Nhom CopilotKit co hai san pham duoc biet nhieu trong linh vuc AI Agent: **Copilotkit** (khung tich hop Agent frontend) va **Copilot Runtime**. OpenBot la buoc di xa hon cua ho trong huong nay — mot **nen tang AI Agent nguon mo**, voi muc tieu dua AI Agent tu "co the goi cong cu" tien len "co the tin tuong trao quyen".

Mau thuan coi tro cua hau het cac san pham Agent hien nay la:

- Ban muon no lam viec that (dang nhap website, doc ghi tep, goi dich vu ben ngoai)
- Nhung lam viec that co nghia la co rui ro (no co bi loi thao tac khong? Co bi ro ri du lieu khong?)

Giai phap cua OpenBot khong phai la han che kha nang Agent, ma la **tai cau truc mo hinh uy quyen**: khong hoi "Agent co the lam gi", ma hoi "ai da phe duyet dieu gi, trong truong hop nao, va sau khi lam co ghi lai khong".

### Thong Tin Meta Du An

| Truong | Gia tri |
|--------|---------|
| Kho chua | https://github.com/CopilotKit/openbot |
| Trang thai | Alpha (dang phat trien tich cu) |
| License | MIT |
| Ngon ngu | TypeScript/React + Bun + Hono |
| Trien khai | Docker Compose / Docker container don |
| Co so du lieu | PostgreSQL + pgvector |
| Giao thuc Agent | AG-UI (giao thuc mo) |
| Phu thuoc | CopilotKit Intelligence (luong & bo nho) |

### Đinh Vi Mot Cau

OpenBot la **nen tang cong tac AI uu tien noi bo, co kiem toan, co quan tri**: moi Bot co may tinh doc lap (container + trinh duyet + he thong tep), moi thao tac di qua cong网关 phe duyet, nhat ky kiem toan day du, nguoi dung co the接管 bat ky luc nao.

## II. Y Tuong Cot Loi: Tu "Co The Lam Gi" Đen "Co Co So Lam"

### 2.1 Bai toan Tin Cay Cua Agent Truyen Thong

Cac san pham Agent chinh (Claude Code, Cursor Agent, OpenAI Operator) co diem chung: **giua thuc hien thao tac Agent va nhan thuc cua nguoi dung co bat dong bất đối xứng thong tin lon**.

Nguoi dung chi biet "to yeu cau Agent lam X", nhung khong biet:

- Agent goi cong cu gi cu the
- Tham so va muc tieu cua cong cu la gi
- Ket qua thao tac co nhu du kien khong
- Co thao tac nao nguy hiem bi tu choi lang nghe khong

Nhan dinh cot loi cua OpenBot la: **Su tin cay khong duoc xay dung bang viec han che nang luc, ma bang su minh bach va kha nang kiem soat.** Ban khong bao ve bang cach noi voi Agent "ban khong duoc lam dieu do", ma bang **cho phep moi thao tac deu qua cong网关 phe duyet, ghi lai, va co the接管 bat ky luc nao** de xay dung su tin cay thuc su.

### 2.2 Mo Hinh Quan Tri "Phe Duyet Truoc Khi Thuc Hien"

Tam guong thiet ke cot loi cua OpenBot la **Gateway (cong网关) lam cong cua vao duy nhat**:

```
Thao tac nguoi dung → Cong网关 server → Kiem tra chinh sach → Nhat ky kiem toan → Cho phep/Tu choi → May tinh Bot thuc hien
```

Diem quan trong cua luong nay: **Khong bao gio co hanh dong khong di qua ghi lai.** Moi thao tac deu la:

1. **resolve** - Giai ma muc tieu tu anh ngam cua server
2. **evaluate** - Danh gia co cho phep khong theo chinh sach CEL
3. **audit** - Viet dong kiem toan, ghi lai quyet dinh va ly do
4. **act** - Chi thuc hien khi duoc cho phep

### 2.3 Moi Bot Co May Tinh Cua Rieng Min

Y tuong doc dao nhat cua OpenBot la **moi Bot so huu mot may tinh rieng biet**:

- Trinh duyet Chromium doc lap (dang nhap rieng)
- He thong tep `/workspace` doc lap
- Profile trinh duyet doc lap
- Ho tro gVisor sandbox

Diem nay co nghia la du lieu giua cac Agent hoan toan bi cach ly, mot Agent bi ro ri khong co nghia la tat ca Agent bi ro ri.

## III. Mo Ta Du An: Kien Truc Va Thanh Phan

### 3.1 Sơ Đồ Kien Truc Dich Vu

OpenBot gom nhieu dich vu phoi hop, to chuc qua Docker Compose:

```
┌─────────────────────────────────────────────────────┐
│                     React/Vite UI                   │
│                    (app :3010)                      │
└──────────────────────┬──────────────────────────────┘
                       │
┌──────────────────────▼──────────────────────────────┐
│              Hono API Server (server :3001)          │
│  Auth / Policy / Audit / Credentials / Plugins       │
│  Components / Coworkers / Channels                   │
│  CopilotKit Runtime                                  │
└──────┬────────────────┬──────────────────┬───────────┘
       │                │                  │
┌──────▼──────┐  ┌──────▼──────┐  ┌────────▼────────┐
│agent-computer│  │ agent-bot   │  │agent-langgraph  │
│  (:4100)    │  │  (:4200)    │  │    (:4201)      │
│ Chromium    │  │ PoC AG-UI   │  │  LangGraph Bot  │
│ + workspace │  │  Bot        │  │                 │
└─────────────┘  └─────────────┘  └──────────────────┘
                       │
              ┌────────▼────────┐
              │   Supervisor    │
              │ (:4500 host /   │
              │  :4300 container)│
              │ Moi Bot la container doc lap  │
              └─────────────────┘
                       │
              ┌────────▼────────┐
              │   PostgreSQL    │
              │ + pgvector (:5432)│
              │ Du lieu/Kiem toan/Chinh sach │
              └─────────────────┘
```

### 3.2 Chi Tiet Cac Thanh Phan Cot Loi

#### Gateway (Cong网关 Chinh Sach)

Gateway la thanh phan cot loi cua mo hinh bao mat OpenBot. No la diem vao duy nhat cho tat ca thao tac cua Bot:

- Giai ma muc tieu thao tac (URL, duong dan tep, goi MCP)
- Danh gia co cho phep theo chinh sach CEL
- Viet dong kiem toan
- Sau khi cho phep, goi May tinh Bot de thuc hien

Thiet ke then chot: **Khong co duong nao bo qua gateway de thao tac truc tiep.** Ngay ca dich vu port duoc bao ve boi token cap thap, cung khong the dung de bo qua gateway.

#### Supervisor (Giam Sat)

Supervisor chiu trach nhiem tao va quan ly container may tinh doc lap cho moi Bot:

- Moi Bot la mot Docker container
- Moi container co volume workspace doc lap
- Moi container co Profile trinh duyet doc lap
- Ho tro gVisor (`runsc`) lam runtime cach ly

#### Agent Computer (May Tinh Agent)

Agent Computer la thanh phan Bot dieu khien trinh duyet that:

- Trinh duyet Chromium that (co the dieu khien bat ky website nao)
- Cong cu he thong tep (doc ghi workspace cua Bot)
- Thuc thi Shell (qua cung cong网关 phe duyet)
- Chup anh man hinh va DOM snapshot

#### Bot Endpoints (Diem Cuoi Bot)

OpenBot ho tro hai loai Bot:

1. **Bot built-in**: Cau hinh system prompt la tao duoc
2. **Bot remote AG-UI**: Ket noi bat ky diem cuoi giao thuc AG-UI nao

Ho tro cac khung: LangGraph, Mastra, CrewAI, Pydantic AI, Google ADK, hoac tu viet diem cuoi AG-UI.

### 3.3 Ba Dong Nghiệp Built-in

OpenBot goi vi du built-in ba Bot (cau hinh, khong phai ma nguon):

| Bot | Đinh vi | Kha nang |
|-----|---------|----------|
| **General Assistant** | Tro giup hang ngay | Thao tac trinh duyet, xu ly tep, tra cuu thong tin |
| **Knowledge** | Kho tri thuc doanh nghiep | Ket noi nguon kien thuc Google Drive/OneDrive |
| **Risk Analyst** | Quan ly rui ro & tuyen tap | Xem xet rui ro thao tac, dua ra y kien tuan thu |

## IV. Huong Dan Chi Tiet: Xay Dung OpenBot Tu Con So Khong

### 4.1 Yeu Cau Tien Quyet

- **Docker** + Docker Compose (cho PostgreSQL va dich vu Bot)
- **Bun 1.3+** (cho dich vu App va API)
- **CopilotKit Intelligence project va license** (co free plan, co the tu host)
- **Model API Key** (OpenAI / Anthropic / Google)

### 4.2 Bat Đau Nhanh (5 Buoc Hoan Thanh)

**Buoc 1: Copy bien moi truong**

```bash
cp .env.example .env
```

**Buoc 2: Lay thong tin xac thuc CopilotKit Intelligence**

```bash
npx --yes copilotkit@latest login
npx --yes copilotkit@latest project select
npx --yes copilotkit@latest license --write
```

- `license --write` se ghi `COPILOTKIT_LICENSE_TOKEN` vao `.env`
- Output cua `project select` la runtime key `cpk-...` dat lam `INTELLIGENCE_API_KEY`

**Buoc 3: Đien day du cau hinh con lai**

```bash
# Phai dien
OPENAI_API_KEY=sk-...

# Tao khoa ma hoa (phat trien cuc bo)
openssl rand -base64 32
# Đien vao KEY_ENCRYPTION_KEY
```

**Buoc 4: Cai dat phu thuoc va khoi dong**

```bash
bun install
bash scripts/start.sh
```

Luong khoi dong cua `start.sh`:
1. Docker Compose khoi dong PostgreSQL, dich vu Bot
2. Chay migration co so du lieu
3. Khoi dong API Server (:3001)
4. Khoi dong React App (:3010)
5. Kiem tra suc khoe xac nhan moi dich vu san sang

**Buoc 5: Mo trinh duyet**

Truy cap http://localhost:3010

### 4.3 Cac Duong Dan Trai Nghiem Nhanh

**Duong dan 1: Tro chuyen truc tiep voi Bot**
- Truy cap `/bot`
- Nhap: `Open news.ycombinator.com and tell me the top story.`
- Quan sat Bot mo trinh duyet, tim kiem doc lap, bao cao ket qua

**Duong dan 2: Xac nhan nhat ky kiem toan**
- Yeu cau Bot dien https://httpbin.org/forms/post
- Truy cap `/admin/audit` de xem ban ghi thao tac day du
- Thay moi buoc thao tac deu co timestamp, ten cong cu, dia chi muc tieu va ket qua

**Duong dan 3: Chinh sach chan**
- Truy cap `/admin/boundaries`
- Them mot quy tac tu choi (vi du: cam truy cap mot domain nao do)
- Thu lai thao tac giong nhau, quan sat Bot bi tu choi va hien thi ten quy tac

**Duong dan 4: Tao dong nghiep tự chỉnh**
- Truy cap `/agents`
- Tao Bot moi: dien ten, chuc vu, mo ta vai tro
- Chon diem cuoi AG-UI hoac che do built-in
- Khoi dong Channel doc lap

### 4.4 Trien Khai Docker Container Đon (Khuyen Nghi San Xuat)

```bash
# Build image
docker build -t openbot .

# Khoi dong (PostgreSQL built-in)
docker run -p 3001:3001 --env-file .env \
  -e EMBEDDED_POSTGRES=on \
  -v openbot-data:/var/lib/postgresql/data \
  openbot

# Hoac ket noi PostgreSQL ben ngoai
docker run -p 3001:3001 --env-file .env \
  -e DATABASE_URL="postgresql://user:pass@host:5432/openbot" \
  openbot
```

### 4.5 Cau Hinh Xac Thuc Google OAuth (Tuy Chon)

Phat trien cuc bo mac dinh su dung `OPENBOT_DEV_NO_AUTH` (bo qua dang nhap, moi request chay voi quyen quan tri).

Cau hinh dang nhap that:

```bash
# Tao khoa
openssl rand -base64 32

# Dat trong .env
BETTER_AUTH_URL=http://localhost:3001
BETTER_AUTH_SECRET=<khoa o tren (it nhat 32 ky tu)>
GOOGLE_OAUTH_CLIENT_ID=<Google OAuth Client ID cua ban>
GOOGLE_OAUTH_CLIENT_SECRET=<Google OAuth Client Secret cua ban>

# Nguon tin cay (phat trien cuc bo)
TRUSTED_ORIGINS=http://localhost:3010

# Email quan tri ban dau
INITIAL_ADMIN_EMAILS=your@email.com

# Xoa OPENBOT_DEV_NO_AUTH
```

## V. Chi Tiet Cong Cu Chinh Sach CEL

### 5.1 Dinh Dang Quy Tac Chinh Sach

Chinh sach duoc luu tru o dinh dang JSON trong bien moi truong `AGENT_COMPUTER_POLICY` hoac cau hinh duoc quan tri vien luu qua giao dien:

```json
{
  "deny": [
    {
      "description": "Chan truy cap dia chi metadata cloud",
      "expression": "page.host.matches('.*\\.google\\.com.*')"
    }
  ],
  "allow": [
    {
      "description": "Cho phep duyet va tim kiem",
      "expression": "tool.name in ['browser.navigate', 'browser.search']"
    }
  ]
}
```

### 5.2 Cac Truong Co The Kiem Tra

Quy tac CEL co the kiem tra cac truong sau:

| Loai truong | Truong co the dung |
|-------------|-------------------|
| Cong cu | `tool.name` |
| Y dinh | `intent` |
| Bot | `bot.id` |
| Nguoi dung | `actor.id` |
| Trang | `page.url`, `page.host` |
| Phan tu | `element.ref`, `element.role`, `element.name`, `element.type` |
| Ban phim | `key` |
| Tep | `file.path`, `file.name`, `file.extension` |
| MCP | `mcp.server`, `mcp.tool`, `mcp.effect` |

### 5.3 Nguyen Tac Fail-Closed

Cong cu chinh sach cua OpenBot **nghiem ngat tuan theo nguyen tac fail-closed**:

- Quy tac tu choi duoc danh gia truoc quy tac cho phep
- **Khong cau hinh chinh sach = Cam tat ca**
- Quy tac tu choi bi loi = Tu choi
- Quy tac cho phep bi loi = Khong cho phep

Diem nay co nghia la trang thai mac dinh, Bot khong lam duoc gi cho den khi quan tri vien cau hinh ro rang quy tac cho phep.

### 5.4 Giao Diện Quan Ly Chinh Sach

Quan tri vien co the qua giao dien `/admin/boundaries`:

- Xem chinh sach hien tai
- Them/Sua/Xoa quy tac
- Chon mau chinh sach co san
- Xem hieu qua chan sau khi ap dung quy tac

## VI. Phan Tich Chuyen Sau Cac Tinh Nang Cot Loi

### 6.1 Co Che "Nam Lai Tay Lái"

Khi Bot gap cac truong hop sau, no se yeu cau tro giup nguoi:

- Tuuong dang nhap (can nhap thong tin)
- Nhac 2FA
- Thao tac nguy hiem khong chac chan

Viec chuyen quyen dieu khien duoc ghi lai thanh ba su kien kiem toan:

- `computer.help_requested` - Bot yeu cau tro giup
- `computer.control_taken` - Nguoi dung nam lai dieu khien
- `computer.control_released` - Nguoi dung tra lai quyen dieu khien

**Thiet ke then chot**: Trong luc nguoi dung nam quyen dieu khien, moi yeu cau thao tac cua Bot deu **bi tu choi truc tiep**, khong phai xep hang doi. Diem nay dam bao nguoi dung luon co quyen quyet dinh cuoi cung.

### 6.2 Kho Thong Tin (Credential Vault)

Thong tin nhạy cam (API Key, OAuth Token, mat khau database) khong nen xuat hien trong ban ghi tro chuyen.

Giai phap cua OpenBot:

- Luu thong tin nhạy cam ma hoa qua giao dien `/admin/credentials`
- Thong tin nhạy cam duoc ma hoa, **khong bao gio tra ve trong API response**
- Nhat ky kiem toan chi ghi la "thong tin duoc yeu cau" va "thoi gian yeu cau", khong ghi lai noi dung thong tin nhạy cam

### 6.3 Quan Ly MCP

OpenBot tich hop ho tro MCP (Model Context Protocol), cung voi lop quan tri noi bo:

**Tich hop MCP built-in**:

- Atlassian (Jira, Confluence)
- Box
- Slack
- Salesforce
- ServiceNow

**Quy tac quan ly**:

- Server MCP tuychinh phai qua kiem tra URL
- Cong cu khong the xac dinh ro la "doc" se **mac dinh xu ly nhu thao tac ghi**
- Moi goi MCP deu qua kiem tra grant va danh gia chinh sach

### 6.4 Component React Lam Cong Cu

Khac voi hau het Agent tra loi bang van ban thuan tuy, Bot cua OpenBot co the tra ve **Component React**:

- Component da bien dich luu trong `app/src/components/gallery/`
- Component sandbox duoc tao va xuat ban o `/admin/playground`
- Moi goi component deu qua xac minh server (ton tai? da xuat ban? cho phep Bot su dung?)
- Ham du lieu built-in: `botActivity` (hoat dong Bot) va `recentRefusals` (tu choi gan day)

### 6.5 Luong & Bo Nho Lâu Dài

OpenBot thong qua CopilotKit Intelligence trien khai:

- Cuoc tro chuyen duoc giu lai sau khi dich vu khoi dong lai (khong mat ngon ngu)
- Moi luong duoc trien khai co identifier doc lap (`DEPLOYMENT_ID`)
- Ho tro tai suat bo nho xuyen sessions

## VII. Triet Ly Thiet Ke: Sau Nguyen Tac Cot Loi

### 7.1 Ghi Truoc Khi Hanh Đong (Record Before Act)

Day la nguyen tac thiet ke quan trong nhat cua OpenBot: **Khong co thao tac nao co the thuc hien truoc khi duoc ghi vao nhat ky kiem toan.** Ke ca khi thao tac duoc cho phep, dong kiem toan cung phai duoc ghi truoc hanh dong. Diem nay dam bao rang ke ca khi he thong bi tan cong, hanh vi tan cong van duoc ghi lai.

### 7.2 Loi = Đong Cua (Fail Closed)

Han vi fail-closed cua cong cu chinh sach CEL co nghia:

- Trang thai mac dinh la an toan nhat
- Loi hổng bao mat den tu loi cau hinh, khong phai loi thiet ke
- Quan tri vien phai ro rang cap quyen cho tung phep

### 7.3 Cach Ly, Khong Han Che (Isolate, Don't Restrict)

Moi Bot co container doc lap, Profile trinh duyet doc lap, workspace doc lap — **Cach ly la mac dinh**, khong phai thong qua han che de dat an toan. Diem nay tuong tu logic cua day an toan leo nui: an toan den tu viec隔开 ban khoi rơi, chu khong phai khong cho ban leo cao.

### 7.4 Minh Bach = Tin Cay (Transparency is Trust)

OpenBot khong xay dung su tin cay bang cach an cac chuc nang, ma bang **su minh bach hoan toan**:

- Moi thao tac deu co ghi lai
- Moi lan tu choi deu co ly do
- Nguoi dung co the接管 bat ky luc nao
- Thong tin nhạy cam khong bao gio di vao ban ghi tro chuyen

### 7.5 Giao Thuc, Khong Phai Nền Tảng (Protocol, Not Platform)

OpenBot xay dung tren giao thuc AG-UI, khong bind bat ky khung nao. Diem nay dam bao:

- LangGraph, Mastra, CrewAI, Pydantic AI co the ket noi无缝
- Logic quan tri di theo giao thuc, khong di theo khung
- Nguoi dung khong bi khoa trong he sinh thai CopilotKit

### 7.6 Ưu Tien Noi Bo (Local-First)

OpenBot duoc thiet ke chay tren **co so ha tang cua chinh ban**:

- Du lieu trong PostgreSQL (co so du lieu ban kiem soat)
- Model do ban chon (API Key ban cung cap)
- Trinh duyet bind vao loopback (noi bo)
- Khong can gui du lieu nhạy cam den dich vu ben thu ba

## VIII. Tong Hop Quan Điem Va Bai Hoc

### Quan Điem 1: Huong tien hoa tiep theo cua Agent la "Kha nang kiem toan", khong phai "Nang luc"

Cuoc chay dua hien tai cua AI Agent tap trung vao "co the lam gi" — nhieu cong cu hon, suy luan manh hon, ngon ngu dai hon. OpenBot chi ra mot huong bi bo qua: **Kha nang kiem toan.** Khi Agent co the lam nhieu hon, van de tin cay khong den tu "nang luc qua manh" ma den tu "gioi han khong ro rang". Truong tien hoa tiep theo se la lam cho moi thao tac co the truy vet, co the can thiep, co the giai thich.

### Quan Điem 2: "Phe duyet truoc khi thuc hien" la duong di bat buoc cua Agent cap doanh nghiep

Cho kich ban doanh nghiep, AI Agent phai dap ung yeu cau tuan thu (SOX, GDPR, SEC). Duong di ky thuat de dat tuan thu khong phai "han che nang luc Agent", ma la **xay dung diem quyet dinh truoc moi thao tac**. Cong cu chinh sach CEL + nhat ky kiem toan cua OpenBot la vi du tham khao ky thuat cho huong di nay.

### Quan Điem 3: Kien truc cach ly co ban hon he thong quyen

Tu duy bao mat truyen thong la RBAC (dieu khien truy cap theo vai tro): Gan Agent vai tro, vai tro quyet dinh quyen. Đieu nay khong du trong kich ban Agent, vi hanh vi cua Agent la dong, phu thuoc ngon ngu. Kien truc "moi Bot container doc lap" cua OpenBot cung cap cach ly co ban hon — cho du mot Bot bi tan cong, be mat tan cong cung bi gioi han trong container doc lap cua no.

### Quan Điem 4: Quan ly thong tin (Credential) la ha tang nen tang, khong phai tinh nang

Ha het san pham Agent hien nay xu ly "quan ly thong tin" nhu chuc nang bo sung. OpenBot xem no nhu cong dan bac nhat: kho thong tin, ma hoa, khong bao gio tra ve API, ghi nhat ky nhung khong ghi noi dung. Đay la buoc chuyen tu "do choi thu nghiem" sang "he thong san xuat".

### Quan Điem 5: Gia tri cua giao thuc AG-UI la "Quan tri di theo giao thuc"

OpenBot chon AG-UI thay vi tu xay dung giao thuc, logic cot loi la: **Quy tac quan tri nen di theo giao thuc, khong theo khung.** Neu logic quan tri nhung trong LangGraph hay CrewAI, moi lan doi khung la phai tai cau hinh quan tri. AG-UI lam giao thuc mo, co the cung cap kha nang quan tri thong nhat xuyen khung.

### Quan Điem 6: "Nguoi trong vong lap" khong giam hieu qua, ma tang do tin cay

Co nguoi thac mac rang "nguoi dung co the接管 bat ky luc" se giam hieu qua Agent. Thuc hanh thiet ke cua OpenBot cho thay: **Sau khi tin cay duoc xay dung, tan suat nguoi dung can thiep se giam dong ke.** Thuc su giam hieu qua la "khong biet Agent dang lam gi nen khong dam buong tay". Su minh bach va kha nang kiem soat la goc cua tang tin cay va giam can thiep.

### Quan Điem 7: Nen tang Agent nguon mo đang thu hep khoang cach voi san pham thuong mai

Nhom CopilotKit hoan toan mo nguon OpenBot (MIT), bao gom so do kien truc (co the tai tao bang `bun run diagram`), cong cu chinh sach, quan ly MCP. Đieu nay dan dau rang共同体 nguon mo trong ha tang co so AI Agent đang nhanh chong thu hep khoang cach voi san pham thuong mai.

## IX. Thong So Ky Thuat Tong Hop

| Kich thuoc | Thong so |
|-----------|---------|
| Hinh thuc trien khai | Docker Compose / Docker container don |
| Co so du lieu | PostgreSQL + pgvector |
| Port App | 3010 |
| Port API | 3001 |
| Port trinh duyet Bot | 4100 |
| Port diem cuoi Bot | 4200/4201 |
| Port giam sat | 4500 (may chu) / 4300 (container) |
| Cong cu chinh sach | Bieu thuc CEL + fail-closed |
| Runtime cach ly | gVisor (tuy chon) |
| Ma hoa thong tin | AES-256, khoa tu KEY_ENCRYPTION_KEY |
| Giao thuc Agent | AG-UI |
| Khung ho tro | LangGraph, Mastra, CrewAI, Pydantic AI, Google ADK |
| MCP built-in | Atlassian, Box, Slack, Salesforce, ServiceNow |

## X. Lời Ket

Cong tac cot loi cua OpenBot khong phai "mot framework Agent khac", ma la **tai dinh nghia lai mo hinh tin cay cua Agent**.

Ha het san pham Agent hien nay cong khai xay dung su tin cay bang viec han che nang luc ("Agent nay chi co the lam nhung viec nay"). Con OpenBot di theo huong: **Khong han che nang luc, nhung lam cho moi hanh dong deu minh bach, co the kiem toan, co the can thiep.** Tin cay khong duoc xay dung bang "lam it hon", ma bang "lam moi viec deu co ghi lai".

No con mang lai mot nha nho co ban hon: **Van de cua AI Agent khong chi la "model du manh chua", ma con la "gioi han hanh vi cua Agent trong moi truong that co ro rang khong".** Khi Agent thao tac trinh duyet that, doc ghi tep that, goi dich vu that, "nang luc" va "quan tri" phai tien hoa dong thoi.

OpenBot hien tai o giai doan Alpha (tai lieu ro rang ghi "Expect rough edges and bugs"), nhung huong di cua no la dung — no giai quyet khong phai van de nang luc cua Agent, ma la van de tin cay. Đay la duong di bat buoc de AI Agent chuyen tu "do choi trinh dien" sang "he thong san xuat".

---

*Đia chi du an: https://github.com/CopilotKit/openbot*
*Trang chu: https://copilotkit.ai/openbot*
*Giao thuc: AG-UI (giao thuc mo, https://github.com/ag-ui-protocol/ag-ui)*
