---
title: "shuohao-skills với 6800 sao: ngưỡng thật của AI short drama không phải là khả năng tạo, mà là ai dám viết quality gate thành code"
date: "2026-11-19"
description: "Dự án mã nguồn mở shuohao-skills với 6800 sao biến một cuốn tiểu thuyết thành gói sản xuất AI short drama đặt hàng được: 7 skill, 60 quality gate, hơn 1600 assertion tự kiểm tra. Giá trị thật nằm ở việc đuổi checklist ra khỏi prompt và viết nó thành code tất định."
author: "瑞哥观势"
tags:
  - phân tích dự án mã nguồn mở
  - AI video
  - Agent Skill
  - nghiệm thu tự động
categories:
  - AI应用
keywords:
  - shuohao-skills
  - AI short drama
  - Agent Skill
  - quality gate
  - nghiệm thu tự động
  - storyboard
  - MiniMax H3
  - Seedance
source:
  original:
    name: "瑞哥观势"
    url: "https://mp.weixin.qq.com/s/xxxxx"
---

# shuohao-skills 6800 sao: rào cản thật sự của phim ngắn AI không phải là sinh video, mà là "ai dám viết cổng chất lượng thành code"

**Kết luận đi trước:** Trên GitHub có một dự án mã nguồn mở `shuohao-skills` với 6800 sao, hơn 960 fork, làm nhiệm vụ biến một cuốn tiểu thuyết thành gói sản xuất phim ngắn có thể đặt hàng trực tiếp cho mô hình video. 7 skill, 6 giai đoạn sản xuất, 60 cổng chất lượng, hơn 1600 khẳng định tự kiểm thử.

Nhưng thứ thực sự có giá trị của nó không phải 7 skill kia, mà là việc nó dám làm một điều trái dòng: **đuổi "danh sách kiểm tra" ra khỏi prompt, viết thành code tất định, để model không qua được cổng thì không đi tiếp được.**

Đây là mẫu "kỹ thuật hóa AI" sạch nhất mà tôi đọc được trong năm nay. Dưới đây tôi sẽ tháo nó ra thật kỹ: dự án là gì, chạy thế nào, bên trong nó giấu tư tưởng thiết kế ra sao, và — với người làm nghề phim ngắn — cả bộ này thực sự đáng giá bao nhiêu.

---

## I. Giới thiệu dự án: một đường ống tệp chia sản xuất phim ngắn thành sáu khúc

Tác giả của `shuohao-skills` là "Shuòng Hào" (X: @eternityspring), theo giấy phép Apache 2.0, khai trào tháng 8 năm 2026, sau hơn hai tháng đã đạt 6800 sao. Định vị của kho lưu trữ được nói gọn trong một câu:

> Bộ sưu tập skill làm phim ngắn AI dành cho mọi loại Agent, từ một cuốn tiểu thuyết đến nguyên liệu sản xuất có thể giao thẳng cho đường ống sinh.

Nó không gắn với bất kỳ runtime Agent nào. Claude Code và Codex chỉ là "hai ví dụ được hỗ trợ, không phải điều kiện tiên quyết" — chỉ cần Agent của bạn đọc được `SKILL.md` và chạy được script Node là dùng được.

### 1.1 Bộ bảy món

| Skill | Làm gì | Cổng chất lượng |
|---|---|---|
| `novel-outline` | Chuyển tiểu thuyết thành bộ năm đại cương phim ngắn: ghi chú chuyển thể, bảng nhân vật, bảng điểm bắt, cốt truyện theo tập, danh mục tài sản | 14 cổng |
| `novel-characters` | Làm bộ thiết lập nhân vật từ các vai đã chốt trong đại cương: hồ sơ nhân vật, prompt hình ảnh, prompt chất giọng, chỉ dẫn bố cục ba góc nhìn | — |
| `character-refs` | Thực sự sinh ảnh tham chiếu nhân vật: neo toàn thân mặt trước + các góc phái sinh | cổng kiểm tra |
| `novel-art` | Bộ thiết lập hình ảnh: neo nhất quán bối cảnh, biến thể trạng thái ánh sáng, bảng đạo cụ cốt truyện, ảnh nền trắng có thể tách nền | 10 cổng |
| `novel-script` | Kịch bản: cảnh + dòng nhịp (hành động và thoại xen kẽ), quy đổi thời lượng từng tập có tính tất định, bản thoại | 10 cổng |
| `novel-staging` | Xếp vị trí mở đầu cho mỗi cảnh: ai ở bên nào của vật thể nào, ngồi hay đứng, hướng mặt về đâu | 8 cổng |
| `novel-storyboard` | Phân cảnh: đoạn (≤ 15 giây) → cắt (cổng cứng 2–5 giây) → ảnh phân cảnh, H3 và gói sản xuất Seedance | 18 cổng |

Sơ đồ quy trình trông như thế này:

```
tiểu thuyết gốc → đại cương → nhân vật → hình ảnh → kịch bản → xếp vị trí mở đầu → phân cảnh → gói sản xuất video
                ↑        ↕        ↕
              nhân vật ←──────┴────────┘
                └→ ảnh tham chiếu nhân vật (đưa vào phân cảnh)
```

Chú ý `novel-characters` / `novel-art` / `novel-script` liên kết với nhau bằng **mũi tên hai chiều** — nhân vật, hình ảnh, kịch bản là ba nhánh lặp đồng bộ, không phải dòng thác. Điều này là cố ý: viết kịch bản được nửa chừng mới phát hiện nhân vật không có cảnh, phải quay lại sửa đại cương; hình ảnh thấy đạo cụ không đủ để đỡ cảnh, phải quay lại sửa kịch bản.

### 1.2 Nó bàn giao hình thức gì

Mỗi giai đoạn sinh ra ba món: `*.json` (dữ liệu công việc cho máy đọc), `*.md` (bản xuất văn bản cho người đọc), `*-report.html` (báo cáo đánh giá một trang, mở bằng cách nhấp đôi).

Báo cáo không phải để trang trí. Ví dụ báo cáo của `novel-outline`:

- **Dải KPI**: tổng số tập, số điểm bắt, phân tầng nhân vật, số bối cảnh chính, điểm khó sinh, mức độ chuyển thể
- **Sơ đồ nhịp điểm bắt**: đánh dấu từng điểm bắt trên trục thời gian cốt truyện, khoảng trống được ghi thẳng lên trục ("— 4 tập trống —"), vượt ngưỡng thì đỏ
- **Ma trận phân công từng tập**: lưới 60 tập × 25 nhân vật, đọc dọc một cột ra là danh sách yêu cầu của tập đó
- **Bảng cổng chất lượng**: ✓/✗ được nướng thẳng vào trang, mục chưa qua thì hiện biểu ngữ bệnh lý
- **Xuất JSON**: tải về đúng nguyên bản `outline.json`

Định vị của tác giả rất rõ ràng: **đây là báo cáo một trang dùng để ngành duyệt, người đọc cầm nó để quyết định cắt hay không, có lên lịch sản xuất hay không.** Hình thức bàn giao mặc định của báo cáo quyết định nó được dùng để ra quyết định, chứ không phải để lưu lại rồi mốc mơ.

`novel-staging` còn đi xa hơn một bước, bàn giao một **công cụ HTML có tương tác**: mỗi cảnh là một mặt bằng nhìn từ trên xuống, người dùng có thể kéo để đổi chỗ, bấm để đổi tư thế ngồi/đứng và hướng mặt, xong bấm "Xuất JSON" là tải về `staging.json` mới, không phải sửa JSON bằng tay.

### 1.3 Ràng buộc kỹ thuật

| Hạng mục | Yêu cầu |
|---|---|
| Node | ≥ 18, **chỉ dùng thư viện chuẩn, không phụ thuộc npm** |
| API key | **không cần**, dùng hạn mức của phiên hiện tại |
| Agent | bất kỳ Agent nào đọc được SKILL.md + chạy được script Node |
| Mô hình sinh ảnh | chỉ `character-refs` cần (Qwen Image / Codex / GPT Image 2 / lệnh tùy chỉnh) |

Việc không phụ thuộc gì không phải để khoe, mà là **điều kiện tiên quyết của khả năng di động**. Nếu bạn muốn chép riêng một skill đi, nó phải chạy được.

---

## II. Hướng dẫn chi tiết: chạy trọn một đường ống từ số không

### 2.1 Cài đặt

```bash
git clone https://github.com/eternityspring/shuohao-skills.git
cd shuohao-skills
./scripts/install.sh
```

Việc mà script cài đặt làm khá giản dị: **liên kết mềm** mỗi thư mục skill vào thư mục skills của Agent được phát hiện. Liên kết mềm chứ không phải sao chép, nên sau `git pull` là có hiệu lực ngay, không phải cài lại.

```bash
./scripts/install.sh novel-characters   # chỉ cài một skill
./scripts/install.sh --codex            # chỉ cài vào codex
./scripts/install.sh --uninstall        # gỡ liên kết mềm
```

Cài tay cũng được:

```bash
ln -s "$PWD/skills/novel-characters" ~/.claude/skills/novel-characters
ln -s "$PWD/skills/novel-characters" ~/.codex/skills/novel-characters
```

Sau khi cài xong thì chạy một lượt toàn bộ tự kiểm thử, để chắc môi trường không có vấn đề (bước này đừng bỏ):

```bash
for f in skills/*/scripts/selftest.mjs; do node "$f"; done
```

Bài tự kiểm thử không gọi model, không tốn hạn mức, chạy hết khoảng một giây. **Lưu ý: thượng nguồn chỉ đã kiểm chứng trên macOS + Node 24, trên Linux và Node phiên bản thấp hơn thì lý thuyết là ổn nhưng chưa kiểm chứng.**

### 2.2 Quy ước thư mục làm việc (đừng trải phẳng)

Chạy trọn một đường ống sẽ sinh ra rất nhiều json / md / html. Quy ước thư mục được đóng thành trong kho lưu trữ là:

```
<demo>/
├── outline/       ← <phim>-outline.json / .md / -report.html
├── characters/    ← <phim>-cast.json / .md / -report.html
├── art/           ← <phim>-art.json / .md / -report.html
├── script/        ← <phim>-script.json / .md / -report.html
├── staging/       ← staging-report.html (bàn giao chính) + staging.json
├── storyboard/    ← <phim>-storyboard.json / .md / -report.html
│   ├── manifest.json
│   ├── E01-01/        ← gói phân cảnh do export sinh ra, mỗi đoạn một thư mục
│   └── E01-02/
├── docs/
└── scripts/
```

Có một cái bẫy đáng tách riêng ra nói: **đừng gom thêm một tầng vào thư mục đoạn** (ví dụ nhét vào `segments/`). Ảnh trong báo cáo phân cảnh dùng đường dẫn tương đối `<số-đoạn>/f<số-thứ-tự-cắt>.png`, mặc định đòi file html của báo cáo nằm cùng cấp với thư mục đoạn. Thêm một tầng mà không sửa đường dẫn thì ảnh trong báo cáo sẽ **âm thầm** biến hết thành placeholder "chưa sinh" — thượng nguồn đã thử nghiệm: sau khi chuyển 10 thư mục đoạn vào `segments/`, số ảnh nhúng giảm từ 2 về 0, **báo cáo không báo lỗi**.

Đây là mẫu điển hình của "thất bại âm thầm": tệp vẫn còn, ảnh vẫn còn, nhưng liên kết sai, còn trang thì giả vờ mọi chuyện bình thường.

### 2.3 Giai đoạn 1: đại cương chuyển thể

```bash
node skills/novel-outline/scripts/novel-outline.mjs chunk <book.txt> <workdir>
node skills/novel-outline/scripts/novel-outline.mjs validate <workdir>/outline.json --stage beats
node skills/novel-outline/scripts/novel-outline.mjs validate <output>/<tên-phim>-outline.json
node skills/novel-outline/scripts/novel-outline.mjs render <output>/<tên-phim>-outline.json --md   > <tên-phim>-outline.md
node skills/novel-outline/scripts/novel-outline.mjs render <output>/<tên-phim>-outline.json --html > outline-report.html
```

**Quy tắc đắt giá nhất trong quy trình: chốt trước, chi tiết sau.**

Khung cốt truyện (cắt dòng nào, gộp những ai, cú bộc phá lớn rơi vào tập mấy) phải cho ra **bản nhanh** để người dùng gật đầu, sau đó mới được phép viết cốt truyện chi tiết theo tập. Đây không phải thỏa thuận miệng, mà là **cổng quy trình**: trước khi viết từng tập bắt buộc phải qua `validate --stage beats`, khoảng cách điểm bắt và thời điểm "major" sai là bị chặn ngay tại chỗ.

Lập luận của tác giả rất thực tế: **bản nhanh sai chỉ mất một vòng khung, đến khi viết xong từng tập mới phát hiện hướng sai thì mất trắng.** Phần 60 tập vẫn viết theo lô, mỗi lô ≤ 10 tập — viết cả nửa sau một lượt thì chắc chắn sập.

14 cổng trông như thế này:

| Cổng | Ngưỡng mặc định |
|---|---|
| Nhóm chính (nam nữ chính + phản diện chính) | 1–5 người |
| Vai phụ có tên | ≤ 10 người |
| Vai chức năng (có mặt không có tên) | ≤ 10 người |
| Trần bối cảnh chính | **động theo số tập**: 4 + ⌈số tập/10⌉, kẹp trong 5–15 (6 tập→5, 60 tập→10, từ 110 tập trở lên chạm trần 15) |
| Trần đạo cụ cốt truyện | ≤ 8 món |
| Cảnh dùng một lần có phương án né | — |
| Khoảng cách điểm bắt không có vùng trống | ≤ 3 tập |
| Tập 1 có móc câu | — |
| Cú bộc phá lớn không dồn vào tập cuối | — |
| Mỗi tập đủ ba cột (tóm tắt/móc câu/tình tiết hấp dẫn) | — |
| Cảnh có từ ba người trở lên có phương án tách | — |
| Điểm khó sinh vào danh sách cảnh báo (cảnh mưa/chạm thân/đám đông/đặc tả bàn tay) | quét từ khóa |
| Tham chiếu đầy đủ: không vai trí thất nghiệp, không cảnh quay vòng, ID đều tồn tại | — |
| Tóm tắt là văn xuôi, không có thoại trong ngoặc kép | — |

Thiết kế của hai ngưỡng này đáng tách ra nói, vì chúng lộ ra khác biệt căn bản giữa "phim ngắn AI" và "phim ngắn quay thật".

**Vì sao chia vai thành ba bậc thay vì một kiểu**: một kiểu sẽ lẫn hai việc khác nhau — "khán giả cần nhớ ai" và "sản xuất phải duy trì bao nhiêu khuôn mặt". Trần của nhóm chính canh phần lượng diễn và tải trí nhớ; trần của vai phụ và vai chức năng canh **chi phí tài sản vai trò AI** (mức đầu tư nhất quán cho mỗi bậc hoàn toàn khác nhau). Vai chức năng "không có vòng đời nhân vật" là bình thường — bác sĩ sinh ra để khâu máu, trình kiểm tra sẽ không ép buộc.

**Vì sao trần bối cảnh rộng hơn nhiều so với phim quay thật**: thời đại quay ngoại cảnh, "≤ 5 bối cảnh" là kinh tế học (dựng bối cảnh tốn tiền); trong phim ngắn AI bối cảnh là sinh ra, **không có tiền dựng bối cảnh**, nên phép kinh tế học thời đại quay thật không còn đứng vững. Trần chỉ còn canh **tài sản nhất quán xuyên tập** của bối cảnh và nhận thức không gian của khán giả; tính sức hút ăn trực tiếp vào sự đa dạng bối cảnh, nên được nới theo số tập đến 15.

Tiện thể: món thứ năm trong bộ năm, "danh mục tài sản", **luôn luôn do script tính ra**, nếu model tự viết tay thì chắc chắn sót.

### 2.4 Giai đoạn 2: thiết lập nhân vật

```bash
node skills/novel-characters/scripts/novel-characters.mjs seed <outline.json> > <workdir>/seed.json
node skills/novel-characters/scripts/novel-characters.mjs chunk <book.txt> <workdir>
node skills/novel-characters/scripts/novel-characters.mjs merge <workdir> --apply merges.json | tee <workdir>/merged.json
node skills/novel-characters/scripts/novel-characters.mjs validate <cast.json>
node skills/novel-characters/scripts/novel-characters.mjs render <cast.json> --html > cast-report.html
```

**Cơ chế seed là mẫu chung của kiến trúc này**: các sự thật đã được thượng nguồn chốt (ID nhân vật, tên, phân tầng, vòng đời nhân vật, nguồn gộp) được script chuyển sang một cách tất định, phần để trống mới là thiết kế thuộc về tầng này (tên gọi khác, hồ sơ một câu, prompt hình ảnh, chất giọng). Câu mà tài liệu nhắc đi nhắc lại:

> **Đừng để model nghĩ lại những sự thật này.**

Câu đó xuất hiện đúng một lần trong mỗi skill `novel-art`, `novel-script`, `novel-staging`, `novel-storyboard`. **Tránh suy luận lặp lại là tối ưu rẻ nhất trong đường ống AI** — mỗi lần model nghĩ lại là thêm một cơ hội lệch đường.

Phần gộp tên gọi khác có một chi tiết đáng nói. Script chỉ có thể hội tụ bằng **khớp chính xác** (một đoạn liệt kê "Lục" là bí danh của "Lục Hành Viễn", hai dòng sẽ gộp thành một người), phần còn lại là `mergeCandidates` — phán đoán ngữ nghĩa, script không làm được, bắt buộc con người/model phải duyệt từng mục. Ứng viên đến từ quan hệ bao hàm tên (`"Lục" ⊂ "Lục Hành Viễn"`), nhưng tác giả ghi rõ đây là **tín hiệu mạnh chứ không phải phán quyết** — cha con, anh em cùng họ thì không được gộp. Còn "Lục tiên sinh" và "Hành Viễn" không có quan hệ bao hàm, nên hoàn toàn không vào danh sách ứng viên, phải tự nhìn ra.

Mẫu "Duokou" của thượng nguồn cố tình dựng ra tình huống này: gã bán hàng suốt truyện chỉ có bí danh, người chèo thuyền chỉ được gọi là "lão bá".

### 2.5 Giai đoạn 3: thiết lập hình ảnh

```bash
node skills/novel-art/scripts/novel-art.mjs seed <outline.json> > <workdir>/art.json
node skills/novel-art/scripts/novel-art.mjs validate <art.json> --cast <cast.json>
node skills/novel-art/scripts/novel-art.mjs render <output>/<tên-phim>-art.json --html > art-report.html
```

Tiền đề của skill này khắc vào xương: **đây là AI sinh ra, không phải quay thật.** Không có khảo sát địa điểm, dựng bối cảnh, bố trí, mua sắm; môi trường và đạo cụ đều là tài sản phải sinh ra hàng chục lần mà vẫn phải giống nhau. Vì vậy toàn bộ sản phẩm bàn giao xoay quanh sự nhất quán:

| Sản phẩm bàn giao | Giải quyết cái gì |
|---|---|
| Neo nhất quán (mỗi cảnh 3–5 cái) | Khán giả nhận ra cảnh nhờ đó, QC đối chiếu xem cảnh sinh có trôi lệch không |
| Biến thể theo khung giờ ánh sáng | AI đổi khung giờ là **sinh lại** chứ không phải đặt lại đèn, mỗi trạng thái phải thành một prompt đầy đủ |
| Prompt ảnh bối cảnh trống | Môi trường và nhân vật là hai lớp tài sản, lẫn người vào ảnh tham chiếu thì nhất quán hỏng hoàn toàn |
| Cơ chế biến thể (`variantOf`) | Sinh cảnh mới thì rẻ, nhưng biến thể tái dùng tài sản của cảnh mẹ thì nhất quán hơn |
| Biến thể trạng thái đạo cụ | Vali đóng và vali mở là hai ảnh tham chiếu — đạo cụ có vòng đời trạng thái, bối cảnh thì không |
| Tham chiếu kích thước đạo cụ | AI hay vẽ đồ cầm tay với kích thước như đồ nội thất, prompt phải có cụm chỉ kích thước |
| Đạo cụ nền trắng không có tay | Ảnh đạo cụ sẽ được dán vào nhiều kiểu cảnh, phải tách nền được; bàn tay đang cầm đạo cụ là nhiễu phổ biến nhất |

Ranh giới "chỉ nhận đạo cụ cốt truyện" được đặt rất rõ: có cận cảnh, xuyên tập, mang cốt truyện, thường 3–8 món. Đạo cụ trang trí bối cảnh thuộc về neo bối cảnh, đạo cụ tay dùng một lần thì giải bằng prompt cấp cảnh, đều không lập tài sản riêng.

"Loại vali đi theo người như thế này thì lẽ ra phải nằm ở tầng này" — nhét vào neo bối cảnh hay hồ sơ nhân vật đều sai.

Hai quy tắc thiết thực nhất trong 10 cổng: **prompt toàn bộ bằng tiếng Anh** (prompt tiếng Trung đưa vào mô hình ảnh hiệu quả kém hơn nói chung, đây là thực hành tốt nhất bị cổng cưỡng chế, không dựa vào ý thức), và **prompt không chứa tên nhân vật** (tên nhân vật do mô hình ảnh tự liên kết với ảnh tham chiếu, cái tên ngược lại gây nhiễu).

### 2.6 Giai đoạn 4: kịch bản

```bash
node skills/novel-script/scripts/novel-script.mjs seed <outline.json> --eps 1-3 > <workdir>/script.json
node skills/novel-script/scripts/novel-script.mjs validate <script.json> --outline <outline.json> --art <art.json>
node skills/novel-script/scripts/novel-script.mjs render <output>/<tên-phim>-script.json --html > script-report.html
```

**Tiền đề khắc vào xương: kịch bản quản lý diễn xuất, phân cảnh quản lý quay.** Thoại phải bị đảo lại viết lại nhiều lần, khi đã gắn với phân rã cảnh quay thì sửa một câu là phải xếp lại cảnh quay. Nên tầng này chỉ có tập, cảnh, dòng nhịp, không có mã cảnh quay.

Nhưng có một đường đáy không được vượt: **thoại phải là dữ liệu có cấu trúc, không được viết thành văn xuôi.** Mỗi câu thoại là một mục độc lập (người nói + thoại + giọng điệu), hành động là một nhịp độc lập. Đây là nền móng của toàn bộ các kiểm tra tất định.

Thời lượng là **tính ra**: thoại quy đổi theo 4,5 chữ/giây, hành động theo 2,5 giây/nhịp, một tập ba phút thì đúng ba phút, vượt hay thiếu là bị chặn ngay, không để dòng xuống giai đoạn sinh mới phát hiện.

Trong 10 cổng, hai cổng thể hiện sức lớn nhất:

- **Móc câu cụ thể hóa được hiện thực trong 3 nhịp đầu** (`hookBeat` nhận phần) — móc câu không phải nhãn dán ở nhịp đầu tiên. Sống còn của phim ngắn phải nằm trên giấy, chứ không trông chờ vào việc model "nhớ viết một tình tiết hấp dẫn".
- **Mỗi cảnh có ít nhất một nhịp hành động** — cảnh chỉ toàn thoại là tiểu thuyết nói, khi AI sinh ra không có hình để viết.

Viết quá thì cắt nhịp hành động trước rồi nén thoại; viết thiếu thì **bổ sung tình tiết chứ không thêm nước** — thêm xung đột chứ không thêm câu chào.

### 2.7 Giai đoạn 5: xếp vị trí mở đầu (skill thú vị nhất)

```bash
node skills/novel-staging/scripts/novel-staging.mjs seed <script.json> --art <art.json> --outline <outline.json> > <workdir>/staging.json
node skills/novel-staging/scripts/novel-staging.mjs validate <staging.json> --script <script.json> --art <art.json>
node skills/novel-staging/scripts/novel-staging.mjs render staging.json > staging-report.html
node skills/novel-staging/scripts/novel-staging.mjs blocking staging.json
```

**Vì sao phải xếp vị trí riêng?** Mỗi đoạn video của phim ngắn là một lần sinh độc lập, mỗi đoạn tự quyết ai ngồi ở đâu. Trong cảnh tập thể sáu người quanh một chiếc bàn dài, đoạn một bên bàn lại dư năm vị khách không tên, đoạn ba người rót rượu ngồi yên lại mặc đồ của nhân vật chính.

Câu đi bàn của phân cảnh được bàn giao từng đoạn một, nhưng câu ở **đoạn đầu tiên** của mỗi cảnh là do chính phân cảnh tự bịa ra — **người ta không nhìn thấy, cũng không sửa được**. Nên trước khi vào phân cảnh, mỗi cảnh phải có một bản xếp vị trí, phân cảnh thì chép lại.

Quy trình là **nhận diện hình ảnh trước, xếp vị trí sau**: từ góc nhìn chính của ảnh bối cảnh, nhận ra những thứ mà người ta sẽ đứng cạnh, sẽ ngồi lên (4–20 món), viết tên, khung trên hình, vị trí trên mặt bằng nhìn từ trên xuống. Sau đó theo kịch bản để xếp ai ở bên nào của vật thể nào, cách bao xa dọc theo bên đó, ngồi hay đứng, hướng mặt về đâu.

Hai luật bất di bất dịch:

- **Không thứ gì không nhìn thấy trong ảnh thì không viết** (có trong prompt nhưng không có trên ảnh đều không viết) — nếu không, người ta ngồi lên bậc cao, mỗi đoạn video lại một khác
- **`plan` được suy ra theo phối cảnh**, không chép lại `box` — "mặt bắc của bàn" trên ảnh phối cảnh chỉ là một khe hẹp, không nói rõ được độ sâu trước sau, dàn phẳng ra thì nhìn từ trên xuống mới rõ

Các quy tắc xếp vị trí cũng được đóng thành: **người đến sau thì mở đầu không có mặt**; **kịch bản không viết có người khác thì không có quần chúng**; **chỉ dùng những thứ đã nhận diện được**.

Câu đi bàn do chương trình viết, không sai một chữ nào, giao cho phân cảnh:

> "Hu nhị gia ngồi ở thanh ngồi hàng ba, mặt hướng bắc; những chỗ khác đều trống, không có ai khác."

Skill này mới được thêm vào ở bản 2.2.0 (2026-10-14), là cái mới nhất, cũng là cái nhiều khả năng chứng minh nhất rằng tác giả đã dính lỗi trong dự án thật.

### 2.8 Giai đoạn 6: phân cảnh

```bash
node skills/novel-storyboard/scripts/novel-storyboard.mjs seed <script.json> --eps 1-3 --aspect 16:9 > <workdir>/storyboard.json
node skills/novel-storyboard/scripts/novel-storyboard.mjs validate <storyboard.json> --script <script.json> --outline <outline.json> --cast <cast.json> --art <art.json>
node skills/novel-storyboard/scripts/novel-storyboard.mjs render <output>/<tên-phim>-storyboard.json --html > storyboard-report.html
node skills/novel-storyboard/scripts/novel-storyboard.mjs export <storyboard.json> --protocol h3 --out storyboard
```

**Tiền đề khắc vào xương: cảnh quay được sinh ra, thêm một cảnh cắt gần như không tốn chi phí.** Nên ở đây không tiếc số cảnh quay, chỉ có một trần: thời lượng sinh một đoạn của mô hình video (mặc định 15 giây).

Cấu trúc ba tầng:

```
đoạn (segment) = một lần gọi sinh video, ≤ 15 giây, không cắt qua cảnh
 ├─ cắt (cut) = cắt trong đoạn, mỗi cắt 2–5 giây (cổng cứng), mỗi cắt nhận phần nhịp kịch bản riêng
 ├─ ảnh phân cảnh = mỗi cắt một khung hình chủ lực: ảnh chính ghim ở 0,00 giây, ảnh phụ ghim ở thời điểm cắt tương ứng
 └─ prompt H3  = mỗi đoạn một cái, chỉ dẫn căn chỉnh nhiều ảnh + đối chiếu từng ký tự thời điểm cắt [Shot k]
```

Vài cơ chế then chốt:

- **Nhận phần nhịp**: mỗi cắt khai báo nó phủ nhịp nào liên tiếp của cảnh nào trong kịch bản, không được cắt qua cảnh — đổi cảnh thì phải đổi cảnh quay. Nhờ vậy quan hệ giữa phân cảnh và kịch bản trở thành thứ **có thể đối chiếu bằng máy**.
- **Đối lập thoại ngược-hướng sinh cùng lúc trong một đoạn**: toàn cảnh, gần cảnh A, gần cảnh B là mỗi cắt một cảnh quay 2–5 giây, mỗi ô bố cục do ảnh phân cảnh riêng của nó kiểm soát, **không dựa vào may mắn với chữ**.
- **Chỉ dẫn căn chỉnh là suy ra, không phải viết ra**: `Picture 2 aligns with the 3.00-second mark…` và `[Shot k] At 00:0X.XXX` đều suy ra từ số giây của phân cảnh, validate **đối chiếu từng ký tự** — sửa số giây mà quên sửa prompt là bị chặn ngay.
- **H3 và Seedance đứng ngang hàng**: prompt H3 dùng cấu trúc I2VA chính thức của MiniMax (chỉ dẫn căn chỉnh + `integrated_multimodal_description` + `overall_soundscape` + `non_diegetic_music`); prompt Seedance **do script ghép trực tiếp theo cấu trúc chính thức**, model chỉ viết `shot` cho mỗi cắt, không viết số giây, số thứ tự và tham chiếu ảnh.
- **Trường định lượng bố cục**: mỗi đoạn có `blocking` (ai bên trái ai bên phải, khoảng cách), mỗi cảnh quay có tiêu cự/lời đạo diễn/bố cục/điểm rơi của hướng nhìn/điểm lấy nét/độ ổn định. Lý do viết rất thẳng — khi chỉ có ảnh tham chiếu mà không có ảnh phân cảnh thì "gần bao xa, đầy bao nhiêu, ai ở đâu, mắt nhìn về đâu" hoặc là phải viết thành chữ, hoặc là biến mất tại chỗ; và thứ biến mất trong thực nghiệm đúng là chúng: cảnh quay xa, hành động nhỏ, bố trí nhân vật tùy tiện.

Trong 18 cổng, vài cổng cứng nhất: **thời lượng cắt 2–5 giây là cổng cứng chứ không phải khuyến nghị** (nhịp chú ý của phim ngắn quanh 3 giây); **thoại vừa chỗ** (số giây của thoại nhận phần ≤ số giây của cắt, kiểm tra từng cắt); **một cảnh quay có tối đa 3 người** (vượt thì phải kèm giải thích tách); **thoại H3 phải khớp từng ký tự** (đổi một dấu câu cũng không qua được); **prompt video không chứa tên nhân vật** (yêu cầu của đặc tả chính thức H3 và Seedance).

### 2.9 Gộp trang và xuất

Báo cáo của năm giai đoạn có thể gộp thành một trang duy nhất:

```bash
node scripts/report.mjs --from <thư-mục-demo> --out report.html
```

**Nó là bộ lắp ráp, không phải skill thứ sáu.** Nó không import mã của bất kỳ skill nào, mà gọi `render --html` của từng skill để lấy sản phẩm rồi ghép lại. Nên năm skill không cần sửa một dòng nào, mỗi cái vẫn chạy độc lập, vẫn có thể chép riêng đi; skill nào đổi cách render thì bên này tự động theo kịp.

Việc gộp phải giải ba việc, **toàn bộ làm trong bộ lắp ráp, không xâm nhập vào skill**:

- **Trộn lẫn style**: năm báo cáo dùng chung 57 tên lớp, trong đó 13 tên trùng nhưng định nghĩa khác nhau (`.copy` `.kpis` `.badge` `.chip`…), nên thêm tiền tố phạm vi cho mỗi bộ chọn
- **Trộn lẫn script**: script của các báo cáo đều là truy vấn toàn cục kiểu `document.querySelector('.expo')`, gộp vào một trang thì chỉ trúng cái đầu tiên — cả năm nút xuất sẽ hỏng. Cách làm là bọc một lớp Proxy để thay `document`
- **Đường dẫn ảnh**: ảnh của mỗi báo cáo tương đối so với thư mục json của chính nó, sau khi gộp phải tính lại theo vị trí file đầu ra

Bản thân bộ lắp ráp dính ba cái bẫy, và mỗi bẫy giờ đều có một khẳng định tự kiểm thử canh giữ:

1. `<script type="application/json">` là **dữ liệu** json nguồn nhúng trong mỗi báo cáo để nút xuất đọc; nếu coi như script mà bóc ra thì chạy, trình duyệt quăng thẳng `Unexpected token ':'`, cả năm bảng cùng hỏng
2. Ghi chú CSS giữa các quy tắc bị dính vào bộ chọn kế tiếp, dấu phẩy trong ghi chú cắt ngang bộ chọn — thực nghiệm làm 18 quy tắc mất phạm vi
3. Ảnh nhỏ trong báo cáo nhân vật dùng inline `background-image:url(…)`, chỉ quét thuộc tính `src` sẽ bỏ sót. Biểu hiện là ảnh lớn bình thường, ảnh nhỏ 404, rất khó truy ra

### 2.10 Chạy riêng một nhân vật (không chuyển thể tiểu thuyết)

`character-refs` không phụ thuộc tiểu thuyết:

```bash
node skills/character-refs/scripts/character-refs.mjs config --model qwen --confirm-anchor yes
node skills/character-refs/scripts/character-refs.mjs intake-check <nhân-vật>-intake.json
node skills/character-refs/scripts/character-refs.mjs gen <asset.json> --tier 1   # trước chỉ sinh neo
node skills/character-refs/scripts/character-refs.mjs gen <asset.json>           # bổ sung bậc thứ hai
node skills/character-refs/scripts/character-refs.mjs render <asset.json> --html > report.html
```

**Quy tắc cốt lõi: một bộ ảnh chỉ có một gốc — neo toàn thân mặt trước.** Chỉ ảnh này là sinh từ văn bản, tất cả những ảnh còn lại đều là "neo + một câu chỉ dẫn sửa ảnh". Ba loại chi tiết tóc, mặt, cổ áo được gắn thêm ảnh đầu mặt chính diện đã xác nhận. Các ảnh không tham chiếu lẫn nhau — nên ảnh nào hỏng thì chỉ sinh lại ảnh đó, **không dây chuyền**.

Sinh ảnh theo bậc:

| Bậc | Nội dung | Khi nào sinh |
|---|---|---|
| 1 | Toàn thân mặt trước (neo) | luôn luôn, ảnh đầu tiên |
| 2 (mặc định) | Đầu mặt chính diện, mặt nghiêng 90°, mặt sau | mặc định sinh đủ |
| 3 | Ảnh chi tiết (tối đa 8 ảnh) | khi có phụ kiện hoặc cận cảnh trang phục từng phần |
| 4 (mặc định không sinh) | Đầu mặt 45° | khi người dùng yêu cầu rõ ràng |

Vì sao mặc định sinh tới bậc hai? Thực nghiệm H3: **chỉ cho toàn thân mặt trước thì trang phục và tấm lưng đều đúng, nhưng khuôn mặt bị biến dạng; thêm một ảnh đầu mặt thì khuôn mặt gần đúng nhất.**

**Mô hình không bị khóa**: ảnh chính và ảnh phái sinh có thể dùng mô hình khác nhau, sự nhất quán đến từ "cùng một tấm neo" chứ không phải "cùng một mô hình" (thực nghiệm: neo Qwen + phái sinh GPT, neo GPT + phái sinh Qwen, trộn lẫn trong cùng nhóm đều khớp được).

**Chỉ có ba thứ bị đóng băng**: tệp neo (sha256), ảnh chụp phong cách vẽ, vân tay của mô tả văn bản. Bất kỳ thứ nào thay đổi, những ảnh phụ thuộc vào nó sẽ tự động được đánh dấu "lỗi thời" — chỉ đánh dấu, không xóa, toàn bộ bản cũ đều được giữ lại.

---

## Ba, Triết lý thiết kế: điều mà bộ dự án này thực sự muốn nói

Dưới đây là tám điểm, theo tôi đây là phần có giá trị nhất của kho mã này.

### Triết lý một: không thể trông cậy vào việc model tự giác tuân thủ checklist

Đây là nguyên lý nền tảng của toàn bộ dự án, nguồn gốc nằm ngay trong README của `novel-outline`, chỉ một câu:

> **checklist giao cho model tự giác là không đáng tin.**

Vì vậy mỗi cổng chất lượng đều là một kiểm tra tất định trong `validate`, không phải văn bản để cho model đọc. 14 cổng, 10 cổng, 10 cổng, 8 cổng, 18 cổng, tổng cộng 60 cổng.

Yêu cầu đi kèm còn khắc nghiệt hơn: **trong bộ tự kiểm thử, mỗi cổng đều có ca thử phá** — cố tình dựng dữ liệu vi phạm để xác nhận bộ kiểm tra thực sự báo lỗi. Điều này chứng minh nó thực sự chặn được, chứ không phải bài kiểm tra giả luôn đúng.

Tầm quan trọng của điểm này, dù đánh giá thế nào cũng không quá. Phần lớn dự án "quy trình AI" dừng ở mức "tôi viết cho model 20 yêu cầu, nó đại khái sẽ tuân thủ". Yêu cầu ở đây là: **đừng viết cho model nghe một yêu cầu nào cả, hãy viết cho code.** Đầu ra của model mang tính xác suất, chỉ code mới mang tính tất định.

### Triết lý hai: mọi thứ chỉ quyết định được lúc xuất ảnh đều bị đưa ra khỏi skill

Đây là lõi của bản thay đổi phá vỡ trong phiên bản 2.0, cũng là lần đánh đổi táo bạo nhất mà dễ bị bỏ qua nhất của toàn bộ dự án.

Ở phiên bản 1.x, ba skill gồm vai diễn, hình ảnh và phân cảnh tự xuất ảnh, tự chọn model, tự định phong cách vẽ, tự quản lý khung hình. Bản 2.0 đã xóa sạch những thứ đó. Lý do được viết trong changelog:

> **Mọi thứ chỉ quyết định được lúc xuất ảnh (dùng model nào, phong cách vẽ nào, khung hình nào), đều bị đưa ra khỏi skill; skill chỉ giao prompt và dữ liệu có cấu trúc.**

Ràng buộc cứng đi kèm là: **skill không xuất ảnh.** README của `novel-art` ghi rõ "đừng nói 'đã xuất ảnh' — bước này không còn tồn tại, thứ được giao là prompt".

Tại sao làm vậy? Vì chọn model, chọn phong cách vẽ, chọn khung hình là **quyết định ở tầm dự án**, không phải quyết định ở tầm giai đoạn. Ảnh vai diễn và ảnh bối cảnh của cùng một bộ phim nên dùng cùng một model, cùng một bộ phong cách, cùng một khung hình. Nếu các tham số này nằm rải rác ở ba skill, thì hoặc bạn phải cấu hình lặp lại ở ba chỗ (rủi ro thiếu nhất quán), hoặc phải thêm một lớp cấu hình dùng chung (phá vỡ tính tự chứa). Đưa ra khỏi skill, nghịch lý hai đầu biến mất.

Ngoại lệ duy nhất là `character-refs` — bản thân nó chính là "khoảnh khắc" đó, nên nó giữ lại khả năng xuất ảnh. **Quy tắc phải có ngoại lệ, và ngoại lệ phải nói rõ vì sao.**

### Triết lý ba: mỗi skill tự chứa, có thể sao chép riêng để dùng

```
skills/<skill-name>/
├── SKILL.md          quy trình làm việc để agent đọc (bắt buộc)
├── README.md         hướng dẫn cho con người đọc
├── scripts/
│   ├── <name>.mjs    công cụ tất định, không phụ thuộc
│   └── selftest.mjs  tự kiểm thử, không gọi model (bắt buộc)
├── references/       chỉ dẫn chi tiết tải theo nhu cầu
├── examples/         mẫu đi kèm, đồng thời là bộ fixture kiểm thử
└── assets/           ảnh chụp màn hình
```

Hai yêu cầu cứng: phải có `SKILL.md`, phải có `scripts/selftest.mjs` và **không gọi model, không tiêu hao hạn mức**.

Các quy tắc hành vi trong AGENTS.md đi kèm còn khắc nghiệt hơn:

> **Skill phải tự chứa, có thể sao chép riêng: không phụ thuộc bất kỳ skill bên thứ ba nào (kể cả skill chính thức). Sau khi học phương pháp bên ngoài, phải nội hóa thành tài liệu references của chính kho này, ghi rõ nguồn gốc đã học.**

Vì vậy phương pháp chính thức H3 đã được nội hóa thành `references/h3-prompt.md`, thay vì gắn một phụ thuộc bên ngoài.

**Cái giá của ràng buộc này là có thật**: code có sự trùng lặp (bộ ghép phải tự giải quyết việc 57 tên lớp bị trộn màu, thay vì các skill dùng chung biến CSS). Tác giả chọn trả cái giá đó — bởi vì một skill có thể bị nhặt ra dùng riêng lẻ, giá trị của nó cao hơn nhiều so với chút sự gọn gàng nhờ loại bỏ trùng lặp.

### Triết lý bốn: model viết bốn món, script tính một món

Trong bộ năm món của dàn ý, bốn món đầu (ghi chú chuyển thể, bảng nhân vật, bảng điểm hấp dẫn, tóm tắt theo tập) do model viết, còn món thứ năm (danh mục tài sản) **luôn luôn do script tổng hợp**.

Lý do chỉ một câu: "model viết tay chắc chắn bỏ sót."

Cùng nguyên tắc ấy rải khắp nơi: thống kê số vai diễn trong báo cáo, danh sách điểm bùng nổ, các điểm hấp dẫn được gán vào thẻ tổng quan bối cảnh — tất cả đều được tính ra, model không viết một chữ nào.

**Tiêu chuẩn rất rõ: có thể tính bằng cơ học thì tuyệt đối không giao cho model.** Bất cứ việc gì mang tính "model phải đếm, phải tính, phải đối chiếu" đều nên là code.

### Triết lý năm: chốt trước rồi mới tinh chỉnh, sai thì chỉ mất một vòng

Đã đề cập ở trên, không nói lại. Nhưng đáng nhấn mạnh hình thức của nó: **đây không phải lời khuyên về quy trình, mà là một cổng trong quy trình.** Trước khi viết phân cảnh theo tập phải vượt qua `validate --stage beats`, không vượt qua thì không được đi tiếp.

Sự hỏng của pipeline AI có một điểm đặc biệt: những lỗi nhỏ ở giai đoạn đầu sẽ **nhân khuếch đại theo dây chuyền** và lãng phí lượng lớn tài nguyên tính toán. Khung bị sai thì phân cảnh 60 tập đều vô nghĩa; nhân vật đặt sai thì hình ảnh và kịch bản đều phải làm lại. **Chặn ở nơi rẻ nhất là thiết kế duy nhất hợp lý của pipeline AI.**

### Triết lý sáu: tính nhất quán dựa trên "mốc neo", không dựa trên "cùng một model"

Tư tưởng "một gốc, các bản còn lại phái sinh" trong bộ ảnh tham chiếu nhân vật thực ra xuyên suốt toàn bộ dự án:

- Tính nhất quán của bối cảnh → 3–5 mốc neo cho mỗi bối cảnh
- Tính nhất quán của đạo cụ → các biến thể trạng thái (đóng/mở, mỗi trạng thái một ảnh)
- Tính nhất quán của nhân vật → mốc neo toàn thân chính diện, các ảnh phái sinh chỉ tham chiếu nó
- Tính nhất quán của ánh sáng → trạng thái cụ thể suy ngược từ từng tập, mỗi trạng thái được viết thành một prompt hoàn chỉnh
- Tính nhất quán xuyên tập → cơ chế biến thể `variantOf`, tái sử dụng tài sản của bối cảnh mẹ

Ý tưởng thống nhất là: **biến việc mơ hồ như "tính nhất quán" thành một tệp cụ thể có thể truyền tải, có thể kiểm chứng, có thể quản lý phiên bản.**

### Triết lý bảy: đối chiếu từng chữ, không dựa vào mắt thường

Nhiều cổng của `validate` bản chất là "so từng chữ":

- Chỉ dẫn căn chỉnh của prompt H3 phải được suy ra từ cấu trúc phân cảnh, lệch dù chỉ một ký tự cũng không được
- Lời thoại đã nhận diện phải xuất hiện chính xác trong khối `<d>`, đổi cả dấu câu cũng không qua
- Thời điểm cắt phải bằng đúng tổng số giây của các cảnh trước đó
- Ngôn ngữ của prompt phải đối chiếu hai chiều với `promptLang`

**Từ "từng chữ" là mấu chốt.** Thứ dễ xảy ra nhất với nội dung do AI sinh ra không phải là "sai hoàn toàn", mà là "đúng, nhưng chưa hoàn toàn đúng" — lệch một chữ, lệch nửa giây. Loại sai lệch này cực kỳ khó phát hiện bằng mắt, nhưng trong pipeline sẽ tích tụ thành phim rác. Đối chiếu từng chữ biến loại sai lệch ấy thành đèn đỏ.

### Triết lý tám: cổng thất bại tích tụ lại, stats cho biết model hay vi phạm quy tắc nào nhất

Mỗi lần `validate` của `novel-storyboard` đều nối kết quả của các cổng vào `.gates.jsonl` trong thư mục hiện tại:

```bash
node scripts/novel-storyboard.mjs stats
```

Sau khi tích tụ vài chục lần, thống kê cho bạn biết **model hay vấp ngã ở quy tắc nào nhất**, và bạn có thể đi sửa đúng quy tắc đó.

Đây là một thiết kế tự tiến hoá. Và cách tác giả xử lý rất tiết chế:

> **Việc tích tụ cổng thất bại hiện chỉ áp dụng cho novel-storyboard. Đây là cố ý: trước tiên hãy dùng nó một thời gian trong dự án thực tế, xác nhận thứ mà stats đưa ra thực sự chỉ về đúng quy tắc cần sửa, rồi mới quyết định có mở rộng sang năm cái còn lại hay không. Nếu lâu không ai mở nó ra, nghĩa là tính năng này không nên làm, việc mở rộng chỉ là nhân bản sai lệch đi năm bản. Đừng chủ động đề xuất mở rộng nữa.**

**"Nếu lâu không ai mở nó ra, nghĩa là tính năng này không nên làm"** — tầm quan trọng của câu này lớn hơn vẻ ngoài của nó. Nó thừa nhận mình có thể đã sai, và đã quy định trước tiêu chuẩn "sai thì xóa". Đây là một thái độ kỹ thuật rất lành mạnh: giá trị của một tính năng do việc sử dụng chứng minh, chứ không do nhiệt huyết của người thiết kế chứng minh.

Sự tiết chế cùng loại còn thể hiện ở cách xử lý "công thức cảnh quay". Thư viện thẻ công thức là phần gắn thêm tùy chọn, và **cỡ cảnh quay cùng phong cách chuyển động trong thẻ cố ý không đặt cổng**, chỉ thêm một dấu `≠` trong báo cáo. Lý do của tác giả:

> **Công thức là vốn từ ngữ, không phải điều lệ; thứ gắn thêm tùy chọn mà một khi nghiêm ngặt hóa sẽ không ai gắn nữa, một cổng chặn nhầm còn tệ hơn không có cổng.**

**"Một cổng chặn nhầm còn tệ hơn không có cổng"** — câu này đáng được treo riêng lên tường. Khi một cổng chất lượng báo báo động giả, phản ứng của người dùng không phải là "cổng này có bug", mà là "công cụ này hay soi xét quá, tôi không dùng nữa". Một hệ thống cổng chất lượng mất đi niềm tin thì coi như không tồn tại.

---

## Bốn, Tổng kết: tám quan điểm

Kết hợp với dự án này, đánh giá của riêng tôi như sau.

**Quan điểm một: rào cản thực sự của ngắn phim AI đã chuyển từ "có tạo được hay không" sang "có nghiệm thu được hay không".**

Việc model sinh ra một đoạn video 5 giây đã không còn khó. Khó là: khi chạy 600 tập, làm sao biết tập 387 đoạn 2 không bị hỏng. Dự án này viết 60 tiêu chí cụ thể thành code, tương đương với việc biến "nghiệm thu" từ người ngắm bằng mắt thành thứ máy thực thi được. **Ai xây được hệ thống nghiệm thu này trước, năng lực sản xuất của người đó mới dám nhân lên.**

**Quan điểm hai: viết checklist thành code còn giá trị hơn viết một trăm câu lệnh prompt.**

Đây là điểm có thể chuyển giao dễ dàng nhất của dự án. Mọi quy trình AI đều áp dụng được: prompt là ràng buộc mềm, code là ràng buộc cứng. Khác biệt không nằm ở độ mạnh của cách diễn đạt, mà nằm ở **có thể bị vi phạm hay không**.

**Quan điểm ba: muốn biết một pipeline AI có chuyên nghiệp hay không, hãy xem nó trao "quyền quyết định" cho ai.**

Thái độ của kho mã này rất rõ: cấu trúc, đếm số, kiểm chứng, ghép nối, xuất dữ liệu — tất cả giao cho code. Model chỉ làm đúng hai việc nó thực sự giỏi: viết nội dung và phán đoán thẩm mỹ. **Phân công càng rõ, pipeline càng đáng tin.**

**Quan điểm bốn: tính nhất quán là tài sản, không phải không khí.**

"Không khí" là một tính từ, còn "3–5 mốc neo + biến thể trạng thái + tham chiếu thước đo + đóng băng sha256" là tài sản. Cái trước có thể trôi chệch mỗi lần sinh, cái sau có thể tái sử dụng xuyên tập, có thể QC, có thể quản lý phiên bản. **Sản xuất nội dung AI cuối cùng cạnh tranh bằng năng lực quản lý tài sản, không phải bằng cảm hứng.**

**Quan điểm năm: "có thể sao chép riêng để dùng" là thước đo của kiến trúc tốt.**

Một thành phần có thể bị sao chép riêng mà không vỡ hay không, phơi bày những phụ thuộc ngầm của nó vào bối cảnh. Kho này đã viết tính tự chứa thành yêu cầu cứng, cái giá là code trùng lặp, đổi lại là **mỗi skill đều có thể bán như một sản phẩm độc lập**. Đây là kiểu "dùng sự trùng lặp trong tầm kiểm soát để đổi lấy tự do cấu trúc" điển hình.

**Quan điểm sáu: biến "bắt buộc chốt" thành một cổng, chứ không phải một lời khuyên.**

Chi phí làm lại trong pipeline AI cực kỳ cao. Hướng đi sai thì phần sau coi như làm vô ích. Vì vậy "chốt trước rồi mới tinh chỉnh" phải được viết thành một cổng trong code, không phải một câu trên sơ đồ quy trình. **Bất kỳ quy trình nào có sự tham gia của AI, điểm quyết định càng sớm thì càng phải cứng.**

**Quan điểm bảy: sự dũng cảm của tác giả khi nói "tính năng này không nên làm" còn đáng học hơn chính những tính năng ông đã làm được.**

"Nếu lâu không ai mở nó ra, nghĩa là tính năng này không nên làm" và "Đừng chủ động đề xuất mở rộng nữa" — hai câu này hiếm trong các dự án mã nguồn mở. Phần lớn dự án chỉ biết thêm tính năng, ít khi viết trước điều kiện để tự gỡ bỏ.

**Quan điểm tám: sản phẩm thực sự của dự án này là hơn 1600 khẳng định tự kiểm thử, chứ không phải 7 skill kia.**

Hơn 1600 khẳng định, không gọi model, không tiêu hao hạn mức, chạy xong trong một giây, mỗi cổng đều có ca thử phá. Chính bộ này mới là tài sản thực sự của "hệ thống cổng chất lượng" — nó giúp bất kỳ đội ngũ nào cũng có thể tái sử dụng phương pháp này trên loại nội dung của riêng mình. **Skill thì sao chép được, còn phương pháp thì không, vì nó mọc lên từ bộ kiểm thử.**

---

## Năm, Điều này có nghĩa là gì với người làm ăn ngắn phim

Nếu bạn là chủ doanh nghiệp làm ngắn phim bằng AI, vài điểm sau đây thực tế hơn:

**Thứ nhất, bộ này trực tiếp nén "tỷ lệ làm lại không kiểm soát được" xuống.** Ngắn phim AI đắt nhất không phải khâu sinh ra, mà là khâu "chạy xong 200 tập mới phát hiện nhân vật hỏng, bối cảnh lộ, hook không được đền đáp". 60 cổng biến loại làm lại này từ "kiểm tra chéo sau khi xong" thành "chặn trước khi xảy ra".

**Thứ hai, không phụ thuộc gì và không cần API key nghĩa là chi phí thử sai gần như bằng không.** Chạy trọn một pipeline chỉ cần Node 18+ và hạn mức hội thoại của chính bạn. Chạy một lượt toàn bộ dàn ý, chi phí có khi còn thấp hơn một bữa cà phê. **Kiểu chi phí này hợp với chiến lược "thử nhiều trước, rồi tập trung đầu tư sau".**

**Thứ ba, ranh giới "kịch bản quản lý nội dung, phân cảnh quản lý quay" đáng ghi nhớ riêng.** Nhiều người khi làm video AI trộn lẫn viết nội dung với cắt cảnh, kết quả là sửa một câu thoại phải sắp xếp lại hàng chục cảnh quay, thời gian bị đốt hết vào làm lại. Cái giá của việc tách ra là thêm một lần bàn giao, đổi lại là **hai khâu có thể lặp đi lặp lại song song**.

**Thứ tư, cổng cứng cắt cảnh 2–5 giây là giá trị mặc định ngành có thể sao chép trực tiếp.** Nhịp chú ý của khán giả ngắn phim, chi phí sinh, trần thời lượng của model video — ba ràng buộc giao nhau ở đây thành một con số. Bạn tự làm ngắn phim thì con số này cũng nên là 2–5 giây.

**Thứ năm, "một cổng chặn nhầm còn tệ hơn không có cổng" là bài học cho mọi sản phẩm công cụ AI.** Nếu bạn định bán một hệ thống tương tự cho đội ngũ của mình, **việc đầu tiên không phải là thêm cổng, mà là bảo đảm các cổng hiện có không báo động giả.** Một công cụ báo động giả chỉ một lần là đội ngũ sẽ không dùng nữa.

---

## Sáu, Lời kết

`shuohao-skills` không phải là một "bộ sinh ngắn phim AI", nó thậm chí không sinh video.

Cái nó làm là việc nền tảng hơn và cũng khó hơn: **định nghĩa trong quá trình sản xuất ngắn phim AI, từng "thế nào mới coi là đúng", và biến những định nghĩa ấy thành những phán đoán mà máy có thể thực thi.**

6800 ngôi sao mua được chính là mật độ nhận thức ấy. 7 skill là bộ xương, 60 cổng chất lượng là cơ bắp, hơn 1600 khẳng định là bộ kiểm thử hồi quy. **Hàng hóa khan hiếm thực sự không phải là model biết viết prompt, mà là con người biết "thế nào mới coi là đúng" và có thể mã hóa điều đó.**

Nếu bạn đang tìm công cụ AI cho ngắn phim, đừng vội xem nó có ra phim hay không, hãy xem nó **dám viết tiêu chuẩn nghiệm thu thành code hay không**. Đó là ranh giới phân định.

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

**🏢 AI cho doanh nghiệp: KumoAI, triển khai kho tri thức theo yêu cầu**

Tôi đã biến việc triển khai AI cho doanh nghiệp thành một sản phẩm thật: **KumoAI, trung tâm làm việc AI cấp doanh nghiệp**.

Kiến thức, dữ liệu nghiệp vụ và dữ liệu khách hàng của doanh nghiệp nằm ngay tại chỗ, triển khai riêng tư, dữ liệu không rời khỏi doanh nghiệp. Đây không phải một công cụ chat, mà là hệ thống nhân số số hóa tiếp tục tiến hóa và tối ưu theo quy mô kinh doanh: tài liệu đặt vào là tìm kiếm và gọi được, dùng càng nhiều AI càng hiểu đúng tiêu chuẩn và cách làm của doanh nghiệp, kinh nghiệm không còn nằm trong đầu một người mà trở thành năng lực của cả tổ chức.

Website: kumolabsai.com

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
