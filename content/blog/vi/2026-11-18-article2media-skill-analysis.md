---
title: "article2media với 435 sao: thứ đáng giá không phải là AI viết bài, mà là biến cảm giác 'có gì đó sai' thành những chỉ số mà script có thể chặn"
date: "2026-11-18"
description: "article2media là dự án mã nguồn mở với 435 sao và 65 lượt fork, biến một bài viết hoặc một video thành ảnh bài đăng Xiaohongshu, ảnh dài kiểu tạp chí, bố cục WeChat và video lồng tiếng AI. Giá trị thật không nằm ở 10 năng lực mà ở kỷ luật nghiệm thu: biến phản hồi mơ hồ như 'quá gấp' thành 4.5 chữ/giây."
author: "瑞哥观势"
tags:
  - phân tích dự án mã nguồn mở
  - sản xuất nội dung bằng AI
  - Claude Code Skill
  - nghiệm thu tự động
categories:
  - AI应用
keywords:
  - article2media
  - plugin Claude Code
  - quy trình nội dung AI
  - hệ thống nghiệm thu tự động
  - ảnh bài đăng Xiaohongshu
  - tạo video lồng tiếng
source:
  original:
    name: "瑞哥观势"
    url: "https://mp.weixin.qq.com/s/xxxxx"
---

# article2media với 435 sao: thứ đáng giá không phải là AI viết bài, mà là biến cảm giác 'có gì đó sai' thành những chỉ số mà script có thể chặn

**Kết luận trước:** Trên GitHub có một dự án mã nguồn mở tên article2media với 435 sao và 65 lượt fork. Nó làm một việc: biến một bài viết hoặc một video thành ảnh bài đăng Xiaohongshu, ảnh dài kiểu tạp chí, bố cục WeChat chính thức và video lồng tiếng AI, đủ để đăng ngay, chỉ với một lệnh.

Nó có 10 năng lực, 12 bộ chủ đề, nghiệm thu tự động (acceptance) cho mọi loại sản phẩm, không phụ thuộc npm, chỉ cần Node 22 và một trình duyệt Chrome.

Nhưng nếu bạn chỉ coi nó là "một công cụ viết bài bằng AI khác", bạn sẽ hiểu sai trọng tâm.

**Điều đáng để một chủ doanh nghiệp học theo nhất không phải là 10 năng lực kia, mà là kỷ luật nghiệm thu: biến những phản hồi mơ hồ như "quá gấp", "cứ nhấp nháy", "chủ đề này không ổn" thành 4.5 chữ/giây, 0 lần nhấp nháy, 0 lỗi bố cục, tức là những chỉ số máy kiểm được.**

Bộ công cụ này mang thẳng vào đội ngũ nội dung của bạn, vào chuỗi công cụ AI của bạn, vào quy trình SOP bạn giao cho khách hàng. Tôi sẽ tháo ra từng phần cho bạn xem.

---

## 1. Giới thiệu dự án: nó thực sự là gì

article2media là một bộ Claude Code / Codex Skill mã nguồn mở, đồng thời cũng là một plugin của Claude Code.

Tác giả là LeiLiu (GitHub: threerocks), giấy phép MIT, kho mã được tạo ngày 8 tháng 11 năm 2026, và chỉ trong một tuần đã lên 435 sao. Kho mã viết bằng JavaScript, có 77 file .mjs, khoảng 12400 dòng mã.

Đầu vào của nó là:

- Bài viết: bài dài trên X (Twitter), chuỗi bài, mọi trang web, bài trên WeChat chính thức, Markdown cục bộ, hoặc nội dung bạn dán trực tiếp;
- Video: liên kết Douyin, YouTube, Bilibili, video hoặc âm thanh cục bộ, phụ đề `.srt` / `.vtt`.

Video trước hết được chuyển thành bài viết lời thoại nguyên văn, và mọi bước sau đó đi đúng quy trình của một bài viết.

Đầu ra của nó có mười hai hình thức:

| Sản phẩm | Quy cách | Đăng ở đâu |
|---|---|---|
| Ảnh dài tóm tắt | bản di động một cột rộng 1080, 1 đến 4 trang; thêm `--wide` cho bản tạp chí hai cột rộng 1200 | WeChat, nhóm WeChat, Weibo |
| Bộ thẻ | Xiaohongshu 3:4 (1080×1440), thêm 4:5, 1:1, 9:16; 6 kiểu bìa, có thể xen trang trích dẫn, con số lớn, ảnh tràn trang | Xiaohongshu, Instagram, ảnh bài Douyin |
| Nhiều phiên bản bìa | cùng một bài cho ra vài bìa, khác kiểu bố cục hoặc khác câu mở đầu | Chọn bìa, đăng riêng từng bản để so sánh hiệu quả |
| Dạng nhẹ | đọc hết trong một trang, ảnh trích dẫn, thẻ hỏi đáp | Đăng tần suất cao, dẫn traffic về cả bộ thẻ |
| Bố cục WeChat chính thức | style nội tuyến, ảnh nhúng, dán thẳng vào trình soạn thảo; kèm ảnh bìa 2.35:1 và ảnh vuông 1:1 | WeChat chính thức |
| Video lồng tiếng | dọc 1080×1920, hoạt ảnh đồng bộ từng từ, lồng tiếng AI cục bộ kèm phụ đề | Douyin, WeChat Channels, video Xiaohongshu |
| Ảnh dài nguyên bản | không đổi một chữ nào, chỉ bố cục | Giữ trọn vẹn nguyên bản |
| Thẻ nguyên bản | chia toàn bộ bài thành thẻ theo thứ tự | Đăng toàn văn lên Xiaohongshu |
| Bản dịch toàn văn | dịch từng đoạn văn nước ngoài sang tiếng Trung, cấu trúc khớp từng khối | Chuyển lại nội dung nước ngoài |
| Bảng trắng luận điểm | một trục suy luận dọc: vấn đề, tiền đề, bằng chứng, mâu thuẫn, bước ngoặt, kết luận | Thấy rõ tác giả đi đến kết luận bằng cách nào |
| Truyện tranh | khung đen trắng, nhân vật nhất quán từ đầu đến cuối | Kể một cơ chế bằng câu chuyện |

**Thiết kế cốt lõi là "năng lực độc lập, tổ hợp tự do".** Mỗi năng lực trong mười năng lực là một skill riêng biệt, chúng chỉ chuyền dữ liệu cho nhau qua các tệp trong thư mục làm việc: `article.md` (nguyên bản), `article.zh.md` (bản dịch), `content.json` (bản viết lại), `rewrite.md` (bản viết lại ở dạng bài viết).

Nghĩa là bạn có thể chỉ lấy nội dung, chỉ dịch, chỉ dàn trang. Hoặc bạn có thể làm trọn ảnh dài, Xiaohongshu và WeChat chính thức trong một lượt.

---

## 2. Hướng dẫn chi tiết: chạy được sản phẩm đầu tiên từ con số không

### Bước 1: Cài đặt

Khuyến nghị dùng plugin Claude Code, cài một lúc là có đủ 11 skill:

```bash
claude plugin marketplace add threerocks/article2media
claude plugin install article2media@article2media
```

Bạn cũng có thể dùng skills CLI để cài cho cả Claude Code lẫn Codex:

```bash
npx skills add threerocks/article2media -g -a claude-code -a codex -y
```

`-g` là cài toàn cục (Claude Code cài vào `~/.claude/skills/`, Codex cài vào `~/.agents/skills/`); không có `-g` thì chỉ cài vào dự án hiện tại. `-y` bỏ qua bước xác nhận, `-l` chỉ liệt kê mà không cài.

Nếu cài thủ công, chú ý một điểm: **thư mục gốc của kho mã không phải thư mục skill, bạn phải đồng bộ toàn bộ thư mục `skills/`.**

```bash
git clone --depth 1 https://github.com/threerocks/article2media.git ~/code/article2media
rsync -a ~/code/article2media/skills/ ~/.claude/skills/
rsync -a ~/code/article2media/skills/ ~/.agents/skills/
```

Nếu chỉ chép một năng lực mà bên cạnh không có `article2media`, script sẽ báo thẳng là không tìm thấy engine dùng chung, vì script của mọi năng lực đều nằm trong `article2media/engine/`. Bạn cũng có thể chỉ định bằng biến môi trường `ARTICLE2MEDIA_ENGINE=/path/to/skills/article2media/engine`.

### Bước 2: Kiểm tra môi trường

```bash
bash scripts/install.sh
```

Script này chỉ nói cho bạn biết thiếu gì và cài bằng cách nào, **bản thân nó không tải bất cứ thứ gì xuống**.

Nó kiểm tra: Node 22+ và bất kỳ Chrome / Chromium nào (bắt buộc), ffmpeg (cho video lồng tiếng), đăng nhập Codex CLI hoặc key OpenAI / Gemini (cho tranh vẽ AI và truyện tranh), Apple Silicon cộng mlx-audio cộng VoxCPM2 (cho giọng đọc cục bộ), mlx-whisper (cho căn chỉnh từng từ và chép video không có phụ đề), yt-dlp (cho phụ đề YouTube và Bilibili).

Trên mạng Trung Quốc đại lục, phông chủ đề mặc định tải từ Google Fonts và jsDelivr nên thường không kéo về được. Lúc đó chạy một lần:

```bash
node skills/article2media/scripts/fonts.mjs
```

Khoảng 65 MB, nó nhân bản phông chủ đề về bộ nhớ đệm cục bộ, từ đó mọi lần xuất ảnh không còn ra mạng. Bản thân quá trình dàn trang không bao giờ tải gì.

### Bước 3: Gọi trong Claude Code

Dùng lối vào tổng hợp để chạy một lệnh cho nhiều định dạng:

```
/article2media https://x.com/thedankoe/status/2117664712532123680
/article2media https://example.com/post xiaohongshu
/article2media ./my-essay.md wechat
/article2media https://x.com/… dịch sang tiếng Trung rồi đăng wechat
/article2media https://x.com/… cần cả ảnh dài, xiaohongshu và wechat
/article2media https://www.bilibili.com/video/BV… xiaohongshu
/article2media links.txt hàng loạt, mỗi bài ra xiaohongshu và ảnh dài
```

Bạn cũng có thể gọi thẳng một năng lực đơn lẻ (trong plugin, tên có tiền tố `article2media:`):

```
/article2media:wechat-layout ./my-essay.md
/article2media:image-cards ./my-essay.md thẻ nguyên bản
/article2media:video-transcript https://www.bilibili.com/video/BV…
/article2media:article-translate article2media-out/x-…/article.md
```

Sản phẩm được ghi ra thư mục `article2media-out/<slug>/` trong thư mục hiện tại.

### Bước 4: Chạy thẳng script, không qua Claude

Mỗi năng lực có cửa vào script riêng, không cần Claude vẫn chạy được:

```bash
K=skills
node $K/article-fetch/scripts/fetch.mjs "https://x.com/…/status/…"
node $K/video-transcript/scripts/transcribe.mjs "https://www.bilibili.com/video/BV…"
node $K/article-rewrite/scripts/check.mjs <slug>/content.json
node $K/article-rewrite/scripts/export.mjs <slug>/content.json
node $K/long-image/scripts/long.mjs <slug>/content.json --theme all
node $K/image-cards/scripts/cards.mjs <slug>/content.json --ratio 3:4
node $K/image-cards/scripts/cards.mjs <slug>/content.json --covers
node $K/wechat-layout/scripts/wechat.mjs <slug>/article.md --theme quiet
node $K/explainer-video/scripts/video.mjs make <slug>/video/video.json
node $K/logic-whiteboard/scripts/whiteboard.mjs <slug>/article.md
node $K/article-comic/scripts/comic.mjs make <slug>/comic.json
```

Ảnh dài và thẻ còn hỗ trợ `--out <thư mục>`, `--page 1,3`, `--scale 2`, `--format jpeg --quality 90`, `--max-height 7600`, `--brand brand.json`, `--issue 13`, `--html-only`. Bố cục WeChat chính thức có thêm `--title`, `--digest`, `--cover-title`, `--kicker`, `--hero`.

### Bước 5: Xử lý hàng loạt và vòng lặp đăng bài

Ở chế độ hàng loạt, bạn ghi các liên kết vào một tệp văn bản:

```bash
node $K/article2media/scripts/batch.mjs init links.txt --name tuan-nay --spec "cards:3:4,long,wechat"
node $K/article2media/scripts/batch.mjs next tuan-nay
node $K/article2media/scripts/batch.mjs checklist tuan-nay
```

`batch.mjs init` phụ trách lấy nội dung và dựng bảng điều khiển, Claude làm theo `next` từng bài một, xong bài này mới sang bài sau. Bài lấy thất bại, bài thân bài quá ngắn, bài có dấu hiệu nằm sau tường trả phí sẽ được tách ra danh sách chờ bạn xác nhận, không làm tắc cả đợt.

Mỗi bài xong sẽ có một danh sách kiểm tra đăng bài `publish.md`: thứ tự tải lên, tiêu đề dự phòng, lời chữ, thẻ, và kiểm tra các giới hạn cứng của nền tảng (Xiaohongshu tiêu đề không quá 20 chữ, thân bài không quá 1000 chữ, không quá 18 ảnh; WeChat chính thức tiêu đề không quá 64 chữ, tóm tắt không quá 120 chữ).

Sau khi đăng, bạn đưa số liệu cho nó:

```bash
node $K/article2media/scripts/stats.mjs add <slug> --platform xhs --views 1200 --likes 80 --saves 150
node $K/article2media/scripts/stats.mjs report
```

Báo cáo so sánh tỷ lệ lưu và tỷ lệ tương tác giữa các chủ đề, các kiểu bìa, theo từng nền tảng. **Nhóm dưới 5 mẫu sẽ được ghi rõ là "mẫu số không đủ, chỉ để tham khảo"**, không để bạn kết luận chỉ từ khác biệt giữa hai ba bài đăng.

### Bước 6: Tự kiểm thử (nếu bạn sửa mã trên máy)

```bash
node tests/run-all.mjs --quick
node tests/run-all.mjs
node tests/unit.mjs
node tests/visual.mjs
node tests/eval-score.mjs <thu muc> --ref <thu muc>
```

`run-all.mjs` là ma trận tự kiểm thử: 4 bài mẫu nhân 7 kiểu bố cục nhân 12 bộ chủ đề chính, tổng cộng 504 lần dàn trang, mỗi lần đều đòi 0 lỗi bố cục. `visual.mjs` là hồi quy thị giác ở mức pixel, `eval-score.mjs` là chấm điểm chất lượng khi đổi mô hình.

---

## 3. Ba đường đi: nguyên bản, tóm tắt, bản dịch

Đây là quyết định thiết kế quan trọng nhất của cả dự án, và cũng là điều dễ chủ doanh nghiệp học theo nhất.

Nhiều công cụ chỉ có một nút "AI tóm tắt", muốn nguyên bản thì không có cách nào. article2media biến việc này thành một quy tắc phân luồng rõ ràng.

| Bạn nói | Đi theo đường nào |
|---|---|
| Dàn trang, nguyên bản, toàn văn, không đổi chữ nào, giữ nguyên, `-f` | Đường nguyên bản: đưa thẳng cho năng lực trình bày |
| Tóm tắt, rút gọn, viết lại, trọng tâm, phần thực dụng | Đường viết lại: chạy `article-rewrite` trước, rồi mới trình bày |
| Dịch, dịch sang tiếng Trung, chuyển lại nội dung nước ngoài | Đường dịch: dịch toàn văn trước, rồi trình bày theo đường nguyên bản |
| Không nói gì, muốn ảnh dài hoặc thẻ | Mặc định viết lại |
| Không nói gì, muốn WeChat chính thức | Mặc định dàn trang nguyên bản |
| Đi đường nguyên bản, nhưng ngôn ngữ nguyên bản khác ngôn ngữ đích | Dịch trước, rồi dàn trang nguyên bản |

**Ở đây có một giá trị mặc định rất ngược đời: WeChat chính thức mặc định không tóm tắt.**

Nghĩa là bạn đưa bài của người khác vào và bảo "đăng WeChat", thứ bạn nhận về là bản dàn trang nguyên bản không đổi một chữ nào. Chỉ khi bạn nói rõ "tóm tắt" thì nó mới viết lại.

**Ý nghĩa với chủ doanh nghiệp:** Trong đội ngũ làm nội dung, sự cố dễ xảy ra nhất không phải là bố cục xấu, mà là câu nói "AI tóm tắt giúp tôi với". Tóm tắt một lần, ý định gốc của tác giả mất một lớp; mất đến lớp thứ ba thì đã thành lời rỗng của triết lý thành công. Đặt mặc định thành "không tóm tắt", đồng nghĩa với việc lắp cho đội ngũ một cánh cửa mặc định không vượt quyền.

---

## 4. Triết lý thiết kế: sáu quy tắc cứng

### 1. Tách nội dung và phong cách

Một chủ đề chỉ là tập biến CSS cộng chút ghi đè cấu trúc. Đổi chủ đề chỉ cần dàn trang lại, không cần viết lại nội dung.

Điều này có nghĩa cùng một `content.json` có thể dàn trang thành bất kỳ chủ đề nào trong 12 bộ chủ đề chính, đồng thời xuất ra cả ảnh dài, thẻ và bố cục WeChat chính thức.

### 2. Không phụ thuộc npm

Chỉ dùng WebSocket và fetch tích hợp sẵn trong Node 22, điều khiển trực tiếp Chrome đã có sẵn trên máy. Không puppeteer, không playwright, không gói nào cần tải trình duyệt.

### 3. Không đặt chữ trong ảnh

Đây là quyết định khôn ngoan nhất của cả dự án.

Một trong những vấn đề lớn nhất của ảnh do AI tạo là chữ Trung hay bị vẽ sai. Cách làm của article2media là: **ảnh sinh ra không chứa bất kỳ chữ nào**, mọi chữ, kể cả tiêu đề, nhãn biểu đồ, lời thoại truyện tranh, phụ đề video, đều được dàn trang bằng HTML rồi chụp màn hình bằng Chrome không đầu.

Hai hệ quả: chữ không bao giờ bị lỗi font và có thể đổi bất cứ lúc nào. Quan trọng hơn, **chương trình có thể đọc lại chữ đã dàn trang để kiểm tra**.

### 4. Dò khả năng, không ép buộc

Sinh ảnh (Codex CLI đến OpenAI đến Gemini), giọng đọc cục bộ (VoxCPM2 đến edge-tts đến giọng hệ thống), căn chỉnh từng từ, chép video: tất cả đều dò trước rồi mới chọn. Thiếu thì hạ cấp hoặc nói rõ còn thiếu gì, **không bao giờ tự tải hay tự cài đặt bất cứ thứ gì**.

### 5. Mô hình phán đoán, script đo lường

Claude phụ trách hiểu và viết: lên kế hoạch cấu trúc, viết lại tiêu đề, quyết định mục nào đặt biểu đồ cột, mục nào đặt lưu đồ, đối chiếu các con số. Đầu ra của nó là một `content.json` chỉ có nội dung, không có bất kỳ style nào.

Dàn trang, chụp màn hình, lồng tiếng, căn chỉnh, trộn âm, nghiệm thu, tất cả giao cho script.

### 6. Tuân thủ đặt trước

Cả 6 giọng đi kèm đều được thiết kế hoàn toàn dựa trên mô tả bằng chữ, không mô phỏng người thật nào. Giọng nhân bản chỉ nằm trong thư viện giọng cá nhân cục bộ, khi dùng bước duyệt sẽ nhắc bạn xác nhận quyền sử dụng. Khung hình đầu của video hoàn chỉnh và siêu dữ liệu MP4 đều mang nhãn báo AI tạo, mỗi ảnh đều ghi nguồn gốc.

Về giọng nói, kết luận của dự án rất tỉnh táo: **dùng AI để tổng hợp lại một giọng đã nhân bản thì không phải là một giọng mới.** Căn cứ là Điều 1023 khoản 2 Bộ luật Dân sự (quy định bảo vệ giọng nói của cá nhân tự động áp dụng các quy định về bảo vệ quyền hình hài), cùng một án của Tòa án Internet Bắc Kinh tháng 4 năm 2024 (nếu người nghe bình thường nhận ra đó là ai trong giọng nói tổng hợp bằng AI thì giọng nói đó cũng được bảo vệ như vậy). Vì vậy thư viện giọng được chia thành hai lớp theo bản quyền: giọng công khai đi kèm dự án, thư viện giọng cá nhân cục bộ chỉ dành cho chính chủ nhân sử dụng.

---

## 5. Nghiệm thu tự động: mỗi loại sản phẩm có bộ kiểm tra riêng

Đây là khác biệt cốt lõi nhất giữa dự án này và việc "để AI vẽ thẳng ra".

Thứ đáng sợ nhất với sản phẩm do AI tạo là "trông cũng gần giống". Vì vậy mỗi loại sản phẩm đều có phép nghiệm thu riêng, không đạt thì báo lỗi rồi thoát, thay vì giao cho người để mắt thường đi tìm lỗi.

| Sản phẩm | Hạng mục kiểm tra |
|---|---|
| Bản viết lại (so với nguyên bản) | con số không tìm thấy trong nguyên bản, bài của người khác bị viết ở ngôi thứ nhất, ảnh trong nguyên bản không dùng ảnh nào, đã dùng được bao nhiêu con số cụ thể, tên riêng và tên công cụ của nguyên bản, từ tiếng Anh thông thường lẫn vào tiếng Trung; thân bài mỏng, ít bảng dữ liệu và ít thẻ tràn trang, con số lớn không khớp tiêu đề, lặp lại cùng một câu, "điều cần tránh" viết thành "điều cần làm", phần chân trang ghi quy trình sản xuất, thiếu tiêu đề dự phòng |
| Ảnh dài tóm tắt, thẻ, bìa | chữ tràn, bị cắt, phần tử chồng lấn, một chữ đứng thành dòng riêng, trang quá cao, ảnh không tải được, kiểm tra font theo họ, thẻ tràn, biểu đồ quá nhỏ, có gì bị tự động lược bỏ |
| Ảnh dài nguyên bản, thẻ nguyên bản, bố cục WeChat chính thức | so từng khối với sổ cái khối nguyên bản (kể cả khi ghép qua ranh giới thẻ), độ phủ khi phân tích, khóa SHA-256 của nguồn, font thực tế đã dùng, thẻ tràn, trần số trang, style còn sót trong bản WeChat, độ dài tiêu đề |
| Bản dịch toàn văn | số khối và cấu trúc khớp từng khối, mã và ảnh giữ nguyên, nghi vấn chưa dịch hoặc dịch thiếu, con số có bị mất không |
| Bảng trắng luận điểm | sổ cái lập luận: mỗi đoạn nguyên bản đều phải đi vào một bước nào đó, hoặc phải ghi rõ lý do bỏ |
| Truyện tranh | lời thoại, lời dẫn và chữ hiệu ứng không vượt ra ngoài khung |
| Video lồng tiếng | vùng an toàn, câu đầu không quá 5 giây, hình ảnh đầu không quá 2,5 giây, hình tĩnh không quá 5 giây, tốc độ đọc lời dẫn, thời gian giữ phụ đề và hiện tượng nhấp nháy, rớt phụ đề theo từng khung hình trong video hoàn chỉnh, kiểm tra chất lượng lồng tiếng theo từng câu, độ lớn âm thanh |
| Danh sách kiểm tra đăng bài | Xiaohongshu tiêu đề không quá 20 chữ, thân bài không quá 1000 chữ, không quá 18 ảnh; WeChat chính thức tiêu đề không quá 64 chữ, tóm tắt không quá 120 chữ |

Mọi script đều báo từng dòng bằng `✓ / ⚠ / ✗`, rồi tổng hợp thành "kiểm tra bố cục: N lỗi, M cảnh báo". **Chỉ cần có lỗi, script thoát với mã khác 0.**

Trong đó khắc khoết nhất là "sổ cái khối nguyên bản". Mọi khối chữ nhìn thấy đều được ghi vào sổ, sau khi dàn trang thì đọc lại từng khối trong trình duyệt để so. **Đổi một chữ, đảo một thứ tự, thiếu một khối hay lặp một khối, đều thất bại.**

---

## 6. Tổng kết: 8 nhận định và ý nghĩa của chúng với chủ doanh nghiệp

### Nhận định 1: bản chất của dự án này là "hệ thống nghiệm thu", không phải "hệ thống sinh nội dung".

Mười năng lực chỉ là da, nghiệm thu mới là xương. Năng lực sinh nội dung thì ai cũng gắn được mô hình, còn kỷ luật nghiệm thu thì cần hàng nghìn vòng lặp.

**Với chủ doanh nghiệp:** Khi đánh giá bất kỳ công cụ AI nào, trước tiên hãy xem nó "biết mình sai ở đâu bằng cách nào". Trả lời không được thì chất lượng sản phẩm hoàn toàn dựa vào mắt thường của bạn, một đội ngũ chỉ làm được ba bài mỗi ngày.

### Nhận định 2: biến "có gì đó sai" thành chỉ số là cách duy nhất để mở rộng chất lượng cao.

Tác giả dự án từng ghi lại một lời phản hồi: "tốc độ đọc lời dẫn giải thích không được quá gấp, đó là điều tuyệt đối tránh". Họ không chỉ sửa code. Họ đo tốc độ đọc của tệp âm thanh tham chiếu, đặt chuẩn khoảng 4.5 chữ/giây, coi một đoạn vượt 5.2 chữ/giây là quá nhanh, sinh lại câu đó bằng hạt giống khác, và nếu vẫn nhanh thì làm chậm lại trong khi giữ cao độ. Sau khi sửa, lời dẫn của cùng một video đi từ 5.97 chữ mỗi giây xuống 4.27 chữ.

**Quy tắc này giờ đã nằm trong script duyệt. Lần sau ai đó sửa code, máy sẽ thay họ nhớ câu "quá gấp" đó.**

**Với chủ doanh nghiệp:** Những lời phản hồi kiểu "chỗ này chưa đủ cao cấp", "cái này thấy kỳ kỳ" trong đội ngũ của bạn, nếu không biến thành con số thì vĩnh viễn là huyền học, vĩnh viễn phải có một người ngồi canh. Việc lượng từ hóa từng cái một là bước rẻ nhất trong sản xuất nội dung công nghiệp.

### Nhận định 3: kiểm tra bằng máy là bắt buộc, mắt người cũng không bỏ được.

Khi dự án làm chủ đề phong cách Trung Hoa mới, họ chọn một phông tiêu đề trông đẹp, kiểm tra bố cục báo cáo toàn bộ đạt, nhưng người nhìn sản phẩm thì thấy chữ "hui" nào cũng là một khối đen đặc. Bản thân tệp phông bị hỏng, chương trình không phát hiện được.

Từ đó, mỗi phông mới đều phải thử trước bằng vài chữ "hui tu guo yuan pin qi e".

**Với chủ doanh nghiệp:** Quy trình kiểm tra chất lượng của bạn cần cả kiểm tra tự động lẫn kiểm tra mắt người. Chỉ làm tự động thì bỏ sót loại "đạt kỹ thuật nhưng người ta nhìn thấy khó chịu"; chỉ làm bằng mắt thì năng suất không lên được.

### Nhận định 4: làm được không có nghĩa nên làm.

Nhạc nền được thử ba lần: thư viện nhạc miễn phí bản quyền trực tuyến, lớp hợp âm tổng hợp bằng chương trình, và sáng tác bằng AI cục bộ (chỉ riêng mô hình đã 11 GB). Cuối cùng không giữ lại cái nào.

Lý do rất đơn giản: quá nặng, và thêm nhạc nền trong app của nền tảng chỉ mất vài giây.

**Với chủ doanh nghiệp:** Đây là lựa chọn cắt bỏ đáng giá nhất mà tôi thấy trong toàn bộ dự án. Sai lầm dễ nhất của đội ngũ khi làm chuỗi công cụ AI là "cái nào làm được thì thêm cái đó". Mỗi tính năng thêm vào là thêm một chi phí bảo trì, thêm một điểm hỏng, thêm một lối vào mà người dùng không biết dùng thế nào. **Trừ khó hơn cộng, vì cộng thì được khen, trừ thì chỉ mình bạn được lợi.**

### Nhận định 5: tuân thủ phải đúng từ ngày đầu, giá để sửa sau này cao hơn nhiều so với làm đúng ngay từ đầu.

**Với chủ doanh nghiệp:** Nếu chuỗi công cụ AI của bạn có liên quan đến dữ liệu khách hàng, bản quyền tài nguyên, quyền giọng nói và hình ảnh, giá của việc sửa sau là gấp mười lần so với việc viết đúng quy tắc ngay từ đầu. Điều này áp dụng cho mọi giải pháp AI bạn giao cho khách hàng.

### Nhận định 6: đổi mô hình là việc phải đo, không phải việc phải đoán.

Dự án có sẵn bài kiểm tra hồi quy khi đổi mô hình: so sánh Haiku và Opus trên 3 bài viết, đo khả năng "viết lại thành thẻ Xiaohongshu".

Kết quả: ở tầng quy tắc (điểm khách quan), Haiku đi từ 70% đến 95% của Opus và vượt 100% khi các quy tắc được giữ; ở tầng người đọc (đánh giá mù, không biết nhóm nào do ai làm, hoán đổi vị trí ba vòng), Haiku đạt 85% đến 91% của Opus, trung bình khoảng 88%. Chênh lệch chủ yếu nằm ở khả năng hiểu: bỏ sót phương pháp cốt lõi của nguyên bản, lẫn hai con số gần giống, đặt ảnh vào sai mục.

**Với chủ doanh nghiệp:** Đây là trần thực tế của mô hình "mô hình nhỏ viết, mô hình lớn duyệt", và nó là 88%. Đừng trông chờ việc đổi sang mô hình rẻ hơn là tiết kiệm được, hãy đo chiều bạn thực sự quan tâm trước.

### Nhận định 7: mặc định "không tóm tắt" là một quyết định thiết kế quan trọng hơn mặc định "thông minh hơn".

**Với chủ doanh nghiệp:** Khi giao một quy trình AI cho khách hàng, việc đầu tiên bạn nên làm là chỉnh hành vi mặc định thành lựa chọn thận trọng nhất. Người dùng muốn gì thì hãy đưa đúng thứ đó.

### Nhận định 8: dấu hiệu một tính năng làm tốt là nó có vòng lặp khép kín.

Sinh ảnh chỉ mới là một nửa. Xoay quanh việc "đăng ra và có hiệu quả", dự án làm trọn một bộ: nhiều phiên bản bìa, bộ thương hiệu, dạng nhẹ, xử lý hàng loạt, danh sách kiểm tra đăng bài, ghi nhận và báo cáo so sánh số liệu sau đăng. Dữ liệu chỉ nằm trên máy bạn, và khi tích lũy đủ mẫu, hướng dẫn chọn chủ đề sẽ dùng nó làm căn cứ phán đoán giữa hai lựa chọn tương đương.

**Với chủ doanh nghiệp:** Đây chính là mắt xích đứt giữa nội dung và phân phối. Đa số đội ngũ nội dung làm xong thì đẩy thẳng vào công cụ đăng, rồi không bao giờ quay lại xem số liệu, nên bạn không bao giờ biết cách làm nào hiệu quả. **Vòng lặp khép kín không cần hệ thống lớn, ghi 10 mẫu số liệu là đủ để bắt đầu.**

---

## 7. Vài ranh giới phải nói rõ

- **Giọng đọc cục bộ**: VoxCPM2 hiện chỉ chạy trên Apple Silicon, máy khác dùng edge-tts hoặc giọng hệ thống.
- **Sinh ảnh**: tranh AI và truyện tranh cần khả năng sinh ảnh, tức là đăng nhập Codex CLI (tài khoản ChatGPT là đủ) hoặc key trả phí của OpenAI, Gemini.
- **Nhạc nền**: video hiện chưa có nhạc nền, bạn phải tự thêm trong app của nền tảng.
- **Lấy nội dung từ X**: phụ thuộc FxTwitter, khi không dùng được thì phải tự dán nội dung.
- **Đầu vào video**: nhận dạng giọng nói cục bộ cần Apple Silicon. YouTube đôi khi yêu cầu xác nhận đăng nhập trên một số mạng, Douyin đôi khi cần cookie của trình duyệt, lúc đó hoặc bạn đồng ý dùng lại trạng thái trình duyệt (`--cookies-from-browser chrome`), hoặc tải video về máy rồi truyền tệp.
- **Cảm nhận thính giác**: phán đoán cuối cùng về giọng và tốc độ đọc vẫn phải dựa vào tai người.
- **Sandbox Codex**: mặc định không cho phép khởi động Chrome, sinh ảnh sẽ báo "Chrome đã thoát đột ngột", cần mở cho bước này.

Còn một chi tiết đáng ghi nhớ: khi chuyển video thành chữ, **cả phụ đề dịch máy lẫn bình luận Bilibili đều không dùng được**. Cái trước không phải lời nguyên của người nói, cái sau là bình luận của người xem. Thứ tự độ tin cậy của nguồn chữ là: phụ đề do người làm, phụ đề tự động do nền tảng tạo theo ngôn ngữ gốc, nhận dạng bằng Whisper cục bộ.

---

## 8. Nếu chỉ chép ba thứ

### Chép thứ nhất: gắn cho mọi sản phẩm AI một bộ kiểm tra mà "không đạt thì thoát với mã khác 0". Dù chỉ có năm quy tắc, vẫn hơn hoàn toàn dựa vào mắt thường.

### Chép thứ hai: biến 3 đến 5 cảm giác xuất hiện nhiều nhất trong phản hồi nói miệng của đội ngũ thành những con số đo được. "Quá gấp" thành 4.5 chữ/giây, "cứ nhấp nháy" thành 0 lần nhấp nháy, "dài quá" thành 15 giây.

### Chép thứ ba: chỉnh hành vi mặc định cho thật thận trọng. Không tóm tắt, không bóng bẩy, không tự bịa thêm. Người dùng yêu cầu thì mới đưa.

Ba điều này không đòi bạn cài Node 22 trước, không đòi có MacBook Pro, không đòi đăng nhập Codex. **Buổi chiều nay bạn đã có thể thử điều thứ nhất trong quy trình nội dung của riêng mình.**

Bản thân dự án này, tôi hiểu nó là một thí nghiệm trung thực: nó chứng minh một điều, **thứ thực sự khan hiếm trong sản xuất nội dung bằng AI không phải năng lực sản xuất, mà là sức phán đoán**. Mười năng lực thì ai cũng làm được, viết sức phán đoán ấy thành quy tắc và để máy thay bạn canh, mới là hào cảu.

---

## Tài liệu đầy đủ về dự án này

Tôi đã dịch tài liệu tiếng Anh của nó sang tiếng Trung. Địa chỉ kho mã nằm ở trên (github.com/threerocks/article2media), giấy phép MIT, tác giả là LeiLiu.

Bản dịch tiếng Trung tôi đặt trong thư mục `docs/article2media-zh/` của kho mã của chính tôi, gồm ba tệp:

- `CLAUDE.zh.md`: bản dịch đầy đủ các quy ước phát triển của kho mã, 88 dòng tiếng Anh, gồm kiến trúc, cấu trúc thư mục, quy ước mã hóa, cách kiểm thử;
- `README-en.zh.md`: bản dịch phần giới thiệu tiếng Anh trong README;
- `README.md`: chỉ mục của bản dịch, giải thích nguyên tắc dịch và tình hình ngôn ngữ của tài liệu gốc.

Tiện thể nói thêm, phần lớn tài liệu trong kho mã này vốn đã viết bằng tiếng Trung giản thể (11 tệp SKILL.md, 15 tài liệu tham khảo, CHANGELOG, bài giới thiệu dài về dự án), chỉ có hai tệp là cần dịch: CLAUDE.md và phần English trong README.

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
