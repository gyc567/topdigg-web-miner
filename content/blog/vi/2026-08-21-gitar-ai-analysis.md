---
title: "Gitar AI Phan Tich Sau: Review Code That That Thuc Su Fix Code"
date: "2026-08-21"
description: "Phan tich chuyen sau Gitar AI: tu dong sua build loi, test loi, va phan hoi review code. Y tuong cot loi: review code khong phai de comment ma de thuc su sua code."
tags:
  - Gitar
  - AI Code Review
  - CI Failure Analysis
  - Pull Request
  - GitHub
  - GitLab
  - Repository Rules
  - Automation
categories:
  - Phan tich chuyen sau
  - AI Dev Tools
  - Code Review
---

# Gitar AI Phan Tich Sau: Review Code That That Thuc Su Fix Code

> Y tuong cot loi: **"Review code khong phai de danh gia comment, ma la de thuc su thuc hien sua chua code"** — Gitar khong giong nhu cac cong cu review code truyen thong chi de lai comment, no se tu dong phan tich nguyen nhan CI that bai, phan tich goc van de, va day thang fix truc tiep vao PR cua ban. No den tu doi ngu xay dung Uber dev stack, nam 2026 da gia nhap SonarSource (cong ty me cua SonarQube), tro thanh mot phan cua he sinh thai chat luong code doanh nghiep.

## I. Tong Quan Du An: Buoc Tien Hoa Tiep Theo Cua Code Review

Gitar la cong cu review code AI duoc xay dung boi cac ky su cu Uber, voi dinh vi la **"bot review code biet sua code"**.

Su khac biet co ban giua Gitar va cac cong cu review code truyen thong:

| Loai cong cu | Dai dien | Lam gi | Khong lam gi |
|-------------|---------|--------|-------------|
| **Bot review truyen thong** | GitHub Actions, mot so cong cu AI review | De lai comment | Khong sua code |
| **Gitar** | Gitar | De lai comment + **Day truc tiep fix** | Can ban tu merge |

Loi chung minh tu nguoi dung co the noi len tat ca:

> "Gitar has been a big help in maintaining the OpenMetadata open-source repository. Its code reviews are consistently actionable and relevant, not generic bot feedback, and it has caught real bugs and security vulnerabilities that reviewers might have missed."
> — Sriharsha Chintalapani, Co-founder & CTO, Collate (OpenMetadata)

### Du Lieu Quan Trong

- **Quy mo nguoi dung**: 130+ doi ngu ky su, 1100+ kho code (Altruist)
- **Pham vi tich hop**: GitHub, GitLab, Buildkite, CircleCI, Bitrise, Harness
- **Loai CI ho tro**: Loi build, test that bai, loi lint, flaky test
- **Xuat xu doi ngu**: Den tu doi ngu Uber dev stack, nam 2026 gia nhap SonarSource

### Dinh Vi Mot Cau

**Gitar = AI Code Review + CI Failure Auto-Fix + Natural Language Rules Engine**, tat ca deu hoan thanh trong giao dien PR, khong can chuyen sang cong cu ben ngoai.

## II. Huong Dan Chi Tiet: Cai Dat Trong 5 Phut

### 2.1 Yeu Cau Moi Truong

- Tai khoan GitHub hoac GitLab, co quyen quan tri tren it nhat mot organization
- Mot PR da duoc mo (hoac kho code co the tao PR)
- 14 ngay dung thu mien phi, khong can the tin dung

### 2.2 Cac Buoc Cai Dat

**Buoc 1: Dang nhap Gitar**

Truy cap [app.gitar.ai](https://app.gitar.ai), su dung tai khoan GitHub hoac GitLab de dang nhap.

**Buoc 2: Ket noi kho code**

<Tabs>
  <Tab title="GitHub">
    Nhan Install, cai dat Gitar GitHub App vao organization cua ban. Co the uy quyen tat ca cac kho code hoac chi dinh nhung kho code cu the.
    
    > 💡 Sau do co the sua quyen kho code bat ky luc nao trong phan Installed GitHub Apps trong cai dat GitHub organization.
  </Tab>

  <Tab title="GitLab">
    Ket noi GitLab su dung service account + service account Token:
    
    1. Tao **service account** trong GitLab group muc cao nhat (Settings → Service accounts)
    2. Tao service account Token, can cac quyen `api`, `read_api`, `read_user`, `read_repository`, `write_repository`
    3. Moi service account voi vai tro Owner vao group can ket noi
    4. Nhap Token vao Gitar dashboard de hoan thanh ket noi
  </Tab>
</Tabs>

**Buoc 3: Ket noi tich hop (Tuy chon)**

Gitar co the keo nguyen canh tu cac cong cu issue tracking va cong cu quan sat. Co the ket noi Jira, Linear, etc. o buoc nay, hoac them sau trong cai dat.

**Buoc 4: Xem Gitar hoat dong**

Sau khi ket noi hoan tat, Gitar se chay quet ban dau tren kho code. Co hai cach de thay hieu qua cua no:

- **Mo mot PR moi**: Tao PR chua mot so thay doi, Gitar se tu dong chay tren tat ca cac kho code da ket noi
- **Thu tren PR hien co**: Tim the "Try Gitar on Open PRs" trong dashboard, kich hoat review cho cac PR hien co

**Buoc 5: Xem phan hoi cua Gitar**

Sau vai phut, Gitar se dang mot **dashboard comment** tren PR cua ban, chua tom tat phan tich.

Chuyen tiep theo se xay ra:
- **CI that bai** → Gitar phan tich nguyen nhan that bai va dang phan tich goc van de. Neu bat auto-apply, Gitar se day truc tiep fix commit
- **Review code** → Gitar dang comment review truc tiep tren dong code co van de, va dang tom tat trong dashboard comment
- **Chi dang comment** → Tra loi comment cua Gitar bang ngon ngu tu nhien de yeu cau thay doi

> ⚠️ **Quan trong**: Gitar **tuyet doi khong bao gio force-push** vao nhanh cua ban. Tat ca cac sua doi deu duoc them moi commit, lich su code duoc bao toan day du.

## III. Chi Tiet Cac Tinh Nang Cot Yeu

### 3.1 AI Code Review

Gitar tu dong review PR tren GitHub va GitLab, cung cap phan hoi danh driving boi AI ve an toan, bug, hieu suat, truong hop edge va chat luong code.

**Cac kich thuoc review duoc ho tro:**

| Kich thuoc | Noi dung |
|-----------|---------|
| **Phan tich bao mat** | Loi he thong, mau khong an toan, xac thuc dau vao |
| **Phat hien bug** | Loi logic, nguy co null pointer, truong hop edge |
| **Phan tich hieu suat** | Do phuc tap thuat toan, truy van co so du lieu, su dung bo nho |
| **Chat luong code** | Doc duoc, kha nang bao tri, thuc hanh tot |

**Cach xuat hien ket qua review:**

1. **Comment review truc tiep** — Moi phat hien chua giai quyet deu duoc dang tai file va dong tuong ung, phan hoi di thang den vi tri code ban dang doc
2. **Dashboard comment — Phan Code Review** — Tom tat hien thi, hien thi quyet dinh tong the, phan chia do nghiem trong va theo doi cac phat hien da giai quyet

**Tuy chinh chi dan review code:**

Co the them file markdown trong thu muc `.gitar/review/` de tuy chinh quy trinh review. Gitar ho tro cu phap `@` de bao gom cac file khac:

```
your-repo/
  .gitar/
    review/
      gotchas.md
    documents/
      rust_best_practices.md
```

Su dung trong `.gitar/review/gotchas.md`:
```markdown
@../documents/rust_best_practices.md
@shared/common_rules.md
```

### 3.2 Phan Tich That Bai CI Va Sua Tu Dong

Day la chuc nang co gia tri nhat cua Gitar — **no khong chi cho ban biet tai sao CI that bai, ma con sua chua no**.

**Quy trinh hoat dong:**

1. Gitar doc CI log, nhan dien cac buoc that bai
2. Xac dinh nguyen nhan goc cua that bai
3. Dang giai thich chi tiet tren dashboard comment cua PR
4. Theo cai dat auto-apply, cho phep phe duyet hoac day truc tiep sua doi

**Cac loai that bai duoc ho tro:**

| Loai that bai | Vi du |
|--------------|-------|
| **Loi build** | Compile that bai, thieu import, loi kieu |
| **Test that bai** | Assertion loi, thieu setup, gia tri kỳ vong sai |
| **Loi Lint** | Vi pham phong cach code, loi dinh dang |
| **Flaky test** | Race condition, van de timing, hanh vi khong xac dinh |

**CI Retry (Thu lai tu dong cac that bai khong lien quan):**

Gitar co the tu dong thu lai cac CI job khong lien quan den thay doi cua PR — vi du nhu flaky test, loi co so ha tang tam thoi hoac that bai do nhanh dich. Khi bat ky that bai nao trong pipeline duoc phan loai la khong lien quan den PR, cac job nay co the chay lai ma khong can thao tac thu cong.

**Sua doi Multi-Iteration:**

That bai CI co the khong the giai quyet trong mot lan lap, Gitar ho tro sua doi nhieu vong:

1. Gitar day sua chua that bai CI ban dau
2. CI chay lai tren nhanh da cap nhat
3. Neu CI that bai lan nua, Gitar phan tich lai that bai moi
4. Gitar thu lan sua chua khac, co xet den lich su day du cac lan thu truoc

Vong lap nay tu dong tiep tuc cho den khi CI pass hoac Gitar xac dinh khong the tiep tuc.

### 3.3 Repository Rules: Tu Dong Hoa Workflow Bang Ngon Ngu Tu Nhien

Repository Rules cho phep ban dinh nghia workflow tu dong bang file markdown thuan tuy, **khong can viet code**.

**Bat dau nhanh:**

```bash
mkdir -p .gitar/rules
```

Tao `.gitar/rules/security-review.md`:

```markdown
---
title: "Security Review"
description: "Require security team review for sensitive changes"
when: "PRs modifying authentication or encryption code"
actions: "Assign security team and add label"
---

# Security Review

When sensitive code is modified:
- Assign @security-team as reviewer
- Add "security-review" label
- Post comment with security checklist
```

**Thoi Diem Kich Hoat Quy Tac:**

- Khi PR mo — Danh gia day du tat ca cac quy tac ap dung
- Khi commit moi day len PR — Danh gia lai cac kiem tra, co the kich hoat tu dong hoa
- Khi CI that bai tren PR — Kich hoat tu dong hoa lien quan CI
- Khi cap nhat metadata PR — Tieu de, mo ta, nguoi review hoac nhan thay doi
- Khi PR dong hoac merge — Kich hoat workflow sau khi merge

**Cac Actions Duoc Ho Tro:**

- **Dang comment**: Dang comment hoac review code truc tiep tren PR
- **Ap dung nhan**: Them hoac xoa nhan theo dieu kien phat hien
- **Gan nguoi review**: Gan nguoi review cu the khi phat hien thay doi
- **De xuat sua doi code**: De xuat hoac thuc hien sua doi code

**Ho Tro Tich Hop:**

- **Jira**: Lien ket PR voi Jira ticket va tu dong cap nhat trang thai issue
- **Linear**: Lien ket PR voi Linear issue va tu dong cap nhat trang thai
- **Slack**: Gui thong bao den Slack channel
- **MCP tuychinh (Enterprise)**: Ket noi MCP server cua ban lam tich hop tuy chinh

### 3.4 Phan Hoi Va Tuong Tac

Gitar cung cap nhieu cach tuong tac phong phu:

| Cach tuong tac | Thao tac |
|---------------|---------|
| Tra loi `gitar fix` | Ap dung sua doi duoc de xuat |
| Ap dung mot chuot | Tick o tren GitHub de ap dung sua doi, tren GitLab dung reaction emoji tick |
| Tra loi finding | Comment "this is intentional" hoac "already fixed", Gitar xu ly tra loi va dong finding |
| Resolve/Unresolve | Resolve finding thread tren GitHub hoac GitLab, dismiss finding theo thoi gian thuc |
| Tra loi mo | Neu tra loi khong ro rang, Gitar se hoi de lam ro thay vi doan |

## IV. Mo Ta Du An: Kien Truc Va Tich Hop

### 4.1 Cac Platform Duoc Ho Tro

| Loai | Cac tuy chon ho tro |
|------|--------------------|
| **Kho code** | GitHub, GitLab (ke ca tu host) |
| **He thong CI** | Buildkite, CircleCI, Bitrise, Harness |
| **Cong cu tich hop** | Jira, Linear, Slack |
| **SSO** | Ho tro cau hinh SSO doanh nghiep |
| **Ky GPG** | Ho tro xac minh GPG key cho commit cua Gitar ky |

### 4.2 Che Do Trien Khai

Gitar duoc trien khai duoi dang GitHub App / GitLab App, tat ca tuong tac duoc hoan thanh trong giao dien PR, khong can dashboard ben ngoai.

### 4.3 An Toan Va Tuân Thú

- Chung nhan SOC 2
- Chung nhan ISO 27001
- Xac minh GDPR
- Bien phap bao ve code va du lieu duoc dam bao

## V. Triet Ly Thiet Ke: Bon Nguyen Tac Cot Yeu

### 5.1 Sua Chua, Khong Chi Phat Hien

Triet ly cua cac cong cu review code truyen thong la **"phat hien van de, thong bao cho lap trinh vien"**. Triet ly cua Gitar la **"phat hien van de, sua chua van de"**.

Dieu nay nghe don gian, nhung de hien thuc can:
- Hieu nguyen nhan goc cua that bai CI (khong chi la thong bao loi binh thuong)
- Tao cac sua doi code co hieu luc (khong chi la de xuat)
- Xac minh CI pass sau khi sua (khong chi day ra roi thoi)
- Lap di lap lai cho den khi thanh cong (khong chi thu mot lan)

Day la mot hinh thai san pham hoan toan khac — **Gitar khong phai mot giam khao, ma la vai tro cua mot ky su moi**, co the review, cung co the tuong tac sua chua.

### 5.2 CI-Aware: Khong Xem Code Mot Cach Don Le

Nhieu cong cu review code AI **chi nhin code, khong nhin CI** di cung. Dieu nay dan den mot van de pho bien: luc review thi看起来 khong van de gi, nhung CI chay khong qua.

Thiet ke cua Gitar la **CI-Aware**:
- Review code va phan tich CI la hai chuc nang cua cung mot san pham, khong phai hai cong cu doc lap
- Khi CI that bai, Gitar se phan tich va sua chua, khong phai bo qua
- Neu sua doi tao ra that bai CI moi, Gitar se tu dong thu lai

### 5.3 Khoi Dau Khong Cau Hinh, Khong Can Thay Doi Workflow

Trai nghiem mac dinh cua Gitar la **cai dat la chay**:
- Khong can cau hinh quy tac de hoat dong
- Khong can thay doi chiến luoc branch
- Khong can hoc cong cu command line moi
- Tat ca tuong tac deu trong giao dien PR ma ban da dang su dung

 Dieu nay lam giam nguong chan tiep nhan — doi ngu khong can thay doi bat ky quy trinh nao de su dung Gitar.

### 5.4 Synergy Voi He Sinh Thai SonarQube

Gitar gia nhap SonarSource nam 2026 (cong ty me cua SonarQube), co nghia la:

- Gitar phu trach **phan tich dong** (review va sua theo thoi gian thuc o muc PR)
- SonarQube phu trach **phan tich tinh** (kiem tra chat luong o muc rong hon ve toan bo co so code)
- Hai thu bu khac nhau, cung nhau phu song toan bo chu ky chat luong code

Day la dinh vi san pham thong minh — Gitar khong co y dinh thay the SonarQube, ma lap day khoang trong "review va sua theo thoi gian thuc o muc PR" ma SonarQube khong phu song.

## VI. Tom Tat Cac Quan Diem Va Bai Hoc

### Quan Diem 1: "Doan Cuoi Cung" Cua AI Code Review La Sua Chua

Tat ca cac cong cu review code AI hien nay (CodeRabbit, Copilot Reviews, mot so open source Bot) deu dung lai o giai doan "phat hien van de, thong bao cho lap trinh vien". Han che cua giai doan nay la:

- Lap trinh vien van can tu hieu van de
- Lap trinh vien van can tu viet code sua
- Lap trinh vien van can tu chay CI de xac minh

Gia tri cua Gitar cat thang vao **"doan cuoi cung"**: no khong chi cho ban biet van de, ma truc tiep sua chua va xac minh. Dieu nay tiet kiem khong chi thoi gian "phat hien van de", ma toan bo thoi gian "sua + xac minh".

### Quan Diem 2: "Den Tu Uber Dev Stack" La Uy Tin Cao Nhat

Doi nguyen cua Gitar den tu doi ngu Uber dev stack. Uber la mot trong nhung cong ty cong nghe co quy mo lon nhat, phuc tap ve ky thuat nhat the gioi, voi dev stack da trai qua xac nhan cua hang ngan ky su, hang ngan kho code.

Nen tang nay co nghia:
- Gitar khong duoc thiet ke tu "tinh huong ly tuong", ma tu "quy trinh that su cua doi ngu sieu lon"
- Ky nang chon chuc nang se nghien ve "thuc dung" thay vi "hoanh tao"
- Co nhan thuc chinh muoi ve CI, review code, quan ly kho code lon

### Quan Diem 3: Hoan Tat Tat Ca Thao Tac Trong Giao Dien PR La Quyet Dinh San Pham Dung

Van de cua nhieu cong cu dev hien nay la **can chuyen doi nguyen canh**: review xem tren GitHub, chi tiet CI xem tren he thong CI, code sua trong IDE, theo doi van de ghi trong Jira.

Gitar chon hoan thanh tat ca thao tac trong giao dien PR, co nghia la:
- Lap trinh vien khong can nho URL cua mot cong cu khac
- Review code, phan tich CI, tu dong hoa quy tac deu o cung mot noi
- Chi phi chuyen doi nguyen canh bang khong

### Quan Diem 4: Repository Rules Dinh Nghia Workflow Bang Ngon Ngu Tu Nhien La Huong Di Dung

Cau hinh CI/CD truyen thong (GitHub Actions, GitLab CI) can viet file YAML, hieu cu phap workflow, xu ly logic dieu kien phuc tap.

Repository Rules cua Gitar dinh nghia workflow **bang ngon ngu tu nhien**:
- Viet "When PRs modifying authentication code" thay vi viet dieu kien YAML
- Viet "Assign security team and add label" thay vi viet action YAML
- File quy tac la markdown, co the quan ly bang trinh soan thao van ban binh thuong

Day la dung. **Workflow nen la thu ma con nguoi co the doc duoc, khong phai la file cau hinh ma may co the phan tich**.

### Quan Diem 5: Gia Nhap SonarSource La Loi Di Tot Nhat Cua Gitar

Gitar chon gia nhap SonarSource thay vi phat trien doc lap, day la quyet dinh san pham truong thanh:

- SonarQube co co so nguoi dung chat luong code lon nhat the gioi
- Gitar co the tap dung mang ban va phan phoi cua Sonar de tiep can nguoi dung doanh nghiep
- SonarQube thieu nang luc "review va sua theo thoi gian thuc o muc PR", Gitar lap day khoang trong nay

Doi voi nguoi dung, dieu nay co nghia Gitar se co chu ky san pham dai hon va ho tro doanh nghiep on dinh hon.

### Quan Diem 6: Auto-apply Can Loi Tin, Nhung Can Xay Dung

Chuc nang auto-apply cua Gitar nghia la AI se day truc tiep commit vao nhanh cua ban. Dieu nay doi hoi doi ngu phai co su tin tuong vao nang luc sua loi cua AI.

Xay dung su tin tuong nay can:
- Ty le chinh xac sua loi cua AI cao (phan hoi nguoi dung la "chung toi chua tung phat hien mot comment vo ich")
- Tat ca sua doi deu la commit moi, khong bao gio force-push (lich su code duoc bao toan day du)
- Co che nhieu vong dam bao sua doi khong tao ra van de moi

Khi da co loi tin, hieu suat cua auto-apply rat lon — lap trinh vien khong can tu debug sau that bai CI, tu viet code sua, tu day len, doi CI chay lai.

## VII. Moi Quan He Voi SonarQube

Nhieu nguoi se hoi: Gitar va SonarQube khac gi nhau? Chung no co xung dot khong?

| Kich thuoc | Gitar | SonarQube |
|-----------|-------|-----------|
| **Thoi diem phan tich** | Khi PR tao/cap nhat (theo thoi gian thuc) | Trong CI/CD pipeline hoac quet dinh ky |
| **Pham vi phan tich** | Tang tang cua PR | Toan bo co so code |
| **Nang luc chinh** | Review + **Sua** | Phan tich tinh + Cong cu chat luong |
| **Workflow** | Hoan thanh trong giao dien PR | Giao dien Web doc lap |
| **Kha nang sua** | Day sua doi tu dong | Dua ra vi tri van de va de xuat |
| **Nguoi dung** | Doi phat trien | Doi phat trien + Doi bao mat/tuan thu |

**Chung la quan he bu互补, khong phai thay the:**

- Gitar phu trach review va sua theo thoi gian thuc o muc PR
- SonarQube phu trach phan tich tinh va quan ly ky thuat no o muc co so code

Sau khi Gitar gia nhap SonarSource, hai thu se duoc tich hop tot hon, cung cap phu song day du tu PR den co so code ve chat luong code.

## VIII. Thong So Ky Thuat Tong Hop

| Kich thuoc | Thong so |
|-----------|---------|
| Hinh thai | GitHub App / GitLab App |
| Kho code | GitHub, GitLab (ke ca tu host) |
| Tich hop CI | Buildkite, CircleCI, Bitrise, Harness |
| Kich thuoc review | Bao mat, bug, hieu suat, chat luong code |
| Loai that bai CI | Loi build, test that bai, loi lint, flaky test |
| Cong cu rules | Natural language .gitar/rules/*.md |
| Cong cu tich hop | Jira, Linear, Slack, MCP (Enterprise) |
| An toan tuan thu | SOC 2, ISO 27001, GDPR |
| Gia ca | Dung thu 14 ngay mien phi; Pro (5 quy tac tuy chinh); Enterprise (quy tac vo han) |
| Xuat xu doi ngu | Dong ngu Uber dev stack |
| Thuoc tinh cong ty | Nam 2026 gia nhap SonarSource |

## IX. Ket Luan

Gia tri lon nhat cua Gitar khong phai la "them mot cong cu review code AI nua", ma la **dinh nghia lai vai tro cua code review**.

Cong cu truyen thong la tran truong: phat hien van de, thong bao lap trinh vien, khong tuong tac.

Gitar la doi ngu: phat hien van de, phan tich goc van de, tuong tac sua chua, xac minh ket qua.

Su chuyen tu tran truong sang doi ngu, la su rut gon ve vai tro cua AI trong quy trinh phat trien. Gitar khong chi cho ban biet "cho nay co van de", ma truc tiep lam thu cho ban. Day moi la hinh thai ma cong cu lap trinh AI nen co.

---

*Website: https://gitar.ai*
*Tai lieu: https://docs.gitar.ai*
*GitHub: https://github.com/gitarcode*
*Luu y: Gitar gia nhap SonarSource nam 2026, tao nen he sinh thai bu互补 voi SonarQube*
