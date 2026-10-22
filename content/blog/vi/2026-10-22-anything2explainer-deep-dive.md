---
title: "anything2explainer phân tích chuyên sâu: đưa một chủ đề, tạo ra một video giải thích được vẽ bằng code"
date: "2026-10-22"
description: "Phân tích chuyên sâu dự án mã nguồn mở anything2explainer của Vincentwei1021: đây không phải là một CLI, mà là cả một phương pháp giúp AI coding agent tự hoàn thành video giải thích khoa học. Bao gồm giới thiệu dự án, tư tưởng cốt lõi, hướng dẫn thực hành đầy đủ 9 giai đoạn, giao thức phân công multi agent, 8 triết lý thiết kế, cùng kết luận và giới hạn rút ra từ nhật ký làm lại của năm phim mẫu."
author: "瑞哥观势"
tags:
  - anything2explainer
  - Remotion
  - Multi Agent
  - Sinh video
  - Dự án mã nguồn mở
  - Claude Code
  - Video giải thích
categories:
  - Phân tích chuyên sâu dự án mã nguồn mở
  - AI Agent
---

# anything2explainer phân tích chuyên sâu: đưa một chủ đề, tạo ra một video giải thích được vẽ bằng code

## Dẫn dắt: bạn muốn AI giải thích rõ một việc, nhưng video lại là một rắc rối

Hãy hình dung một nhu cầu rất cụ thể.

Bạn vừa đọc xong một bài báo khoa học, hoặc vừa hiểu ra một khái niệm kỹ thuật, và muốn đăng một video giải thích khoa học dài ba phút lên Video Account. Đề tài đã có, kịch bản cũng gần như xong. Giờ vướng ở đây: phần hình ảnh thì làm sao?

Đi tìm tư liệu? Bản quyền không rõ ràng, hơn nữa tư liệu ghép với nhau không bao giờ tạo thành một tác phẩm có logic. Đi tìm mô hình sinh video bằng AI? Hiện tại các đoạn sinh ra không nối tiếp được, chữ viết sai, và mỗi khung hình đều trôi. Dùng digital human đọc lời? Về mặt kỹ thuật không có vấn đề, nhưng một cái đầu biết nói không giải thích được cơ chế nào, nó chỉ đọc kịch bản.

Lùi thêm một bước, bảo AI coding agent viết code để vẽ từng khung hình?

Hướng này là đúng, nhưng ngay lập tức sẽ đụng phải vấn đề thứ hai: bản thân Remotion chỉ cho bạn một tấm canvas, nó không nói cho bạn biết một bộ phim nên trông như thế nào. Agent thứ nhất vẽ ra những cảnh quay đẹp, agent thứ hai vẽ ra giống slide PowerPoint, agent thứ ba thì quên mất dải phụ đề đặt ở đâu. Ghép sản phẩm của năm agent lại, trông như năm công ty khác nhau làm.

Vậy rồi phải làm thế nào?

Câu trả lời của anything2explainer rất thẳng: đừng chỉ viết code, hãy viết ra cả phương pháp. Nó tách việc "làm thế nào để quay một video giải thích khoa học do AI tạo ra" thành: đặc tả phong cách, từ vựng chuyển động, các quy tắc cứng về bố cục và ánh sáng, giao thức phân công cho agent, các script đo lường chất lượng, cộng thêm một bộ phim mẫu hoàn chỉnh làm thước đo chất lượng.

Đây không phải là một công cụ dòng lệnh chạy được, nó giống một cuốn sổ tay làm phim dành cho AI hơn.

## Một, giới thiệu dự án: thực tế repo chứa những gì

### 1.1 Định vị trong một câu

Đưa vào một chủ đề, hoặc một bài viết bạn muốn chuyển thành video, nhận về một file MP4 H.264 1280×720: có lời đọc TTS, phụ đề căn theo từng từ, thẻ chương, HUD ở trên cùng và thanh tiến trình chương ở dưới, tiếng Trung hay tiếng Anh đều được.

Điểm mấu chốt là mọi khung hình đều được vẽ bằng code. Không có thư viện tư liệu, không có mô hình sinh video tạo sinh, cũng không lấy bất kỳ khung hình nào từ video của người khác.

Tác giả Vincentwei1021 tự định vị là "software" trong CITION.cff, phát hành ngày 2026-09-09, dùng giấy phép PolyForm Noncommercial 1.0.0: miễn phí cho mục đích phi thương mại, dùng thương mại thì cần xin phép trước, nhưng những video tạo ra bằng nó thuộc về bạn.

### 1.2 Nó không phải là CLI

Điểm này đáng nói riêng, vì nhiều người sẽ lấy nó làm công cụ để thử, dùng thử xong rồi thấy "không có phản hồi gì".

Trong repo có toàn bộ phương pháp để AI coding agent làm ra phim. Thực sự sẽ được thực thi chỉ có ba thứ:

- Một project mẫu Remotion 4 biên dịch được (`template/`), bạn dùng `new_project.sh` để copy nó thành thư mục làm việc;
- Một đống tài liệu đặc tả viết cho phiên chính và cho từng agent (`reference/`);
- Một bộ phim mẫu đã làm xong (`examples/rag/`), kèm theo tài liệu khảo sát, lời dẫn, bảng phân cảnh, mã nguồn của 44 cảnh quay và 5 báo cáo QC.

Tác giả gắn một huy hiệu Claude Code và một huy hiệu Codex cho skill, tức là nó là một "gói kỹ năng" được nạp bởi hai loại agent đó, chứ không phải phần mềm để người ta gõ lệnh.

### 1.3 Nhìn nhanh cấu trúc repo

```
SKILL.md                  流程主干：9 个阶段、4 个确认点、质量标尺
reference/                写给主会话和各 agent 的规范
  style-guide.md            安全区、调色板、字体、图元目录、版式规律
  motion-vocabulary.md      入场/强调/光效/离场/运镜的公式与帧数
  composition-and-light.md  主体尺寸三档、光跟主角、高光时刻编排、QC 量化判据
  narration-guidance.md     口播文案写作原则（纯英文，已译中文）
  narration-storyboard.md   解说词格式与预算、配音参数、分镜令牌、镜头模式表
  research-brief.md         研究员 prompt 与事实规则
  agent-build-rules.md      构建 agent 协议
  agent-qc-rules.md         QC agent 协议
  prompts.md                六种 agent 的 prompt 模板
  lessons.md                五部片子的踩坑记录与根因
template/                 可编译的 Remotion 4 工程
  src/common/               雾底、星点、点阵波、glitch、缓动、字幕、进度条
  src/ui.tsx  src/fx.tsx    图元与调色板/光效、纵深、运镜图元
  src/overlay/              片头、章节卡、HUD、流程轨、片尾
  scripts/                  配音、分镜、still、测渲、渲染、QC 度量脚本
examples/rag/             样片全套纸面文件与成片帧
examples/contrast/        6 组反例/正例帧对照
```

Thư mục `examples/contrast/` đáng chú ý đặc biệt, nó là một "bảng điểm". Bên trái là các khung hình của bộ phim khác《eCPM 与广告竞价》(eCPM và đấu giá quảng cáo) mà tá giả làm ngày 2026-09-08 bằng skill, bên phải là các khung hình của bộ phim mẫu《RAG 与知识库》(RAG và kho tri thức), sáu cặp đối chiếu, mỗi cặp trỏ tới một khiếm khuyết cụ thể: nhân vật chính quá nhỏ, nhân vật chính không có ánh sáng, khoảnh khắc cao trào không được sắp đặt, chữ ở mục kết quả quá nhỏ, nền rải vụn mảnh vụn, phần kết không có vật tượng trưng.

### 1.4 Khác biệt với các công cụ khác

Tác giả tự liệt kê một bảng so sánh, tôi coi đó là căn cứ để lựa chọn:

| Loại công cụ | Đầu ra | Điểm khác biệt của anything2explainer |
|---|---|---|
| Mô hình sinh video tạo sinh (Sora、Veo、Runway) | Tổng hợp tư liệu từ prompt | Đầu ra là code xác định chứ không phải pixel. Mỗi con số trên màn hình đều truy được về một URL nguồn, bất kỳ khung hình nào cũng sửa được bằng cách chỉnh một file cảnh quay |
| Digital human / công cụ người dẫn (HeyGen、Synthesia) | Một người dẫn số đọc kịch bản | Không dùng người dẫn. Dùng sơ đồ động để giải thích cơ chế, để lời dẫn dẫn dắt hình ảnh |
| Viết tay Remotion / Motion Canvas | Một canvas video lập trình được | Nó giao cả phương pháp trên nền canvas: khảo sát → lời dẫn → phân cảnh → xây dựng song song → QC, kèm đặc tả phong cách, từ vựng chuyển động và một bộ phim mẫu làm thước đo |
| Manim | Hoạt hình toán học bằng Python | Quy trình đầu-cuối do agent dẫn dắt, có phụ đề căn TTS, chương và QC; React / TypeScript thay vì Python |

Quyết định "không dùng người dẫn" ở dòng thứ hai quan trọng hơn nghe có vẻ. Lượng thông tin hình ảnh của video digital human bằng không, bạn chỉ đọc lại kịch bản. Còn sơ đồ động thì hiển thị được đồng thời cấu trúc, trình tự và số lượng. Trong README có một câu rất đắt: lời dẫn phụ trách lý do, hậu quả, so sánh và phán đoán; hình ảnh phụ trách cấu trúc, trình tự và số lượng.

## Hai, tư tưởng cốt lõi: tại sao cứ dùng code để vẽ

### 2.1 Ba nguyên tắc không nhượng bộ

**Thứ nhất, toàn bộ hình ảnh được vẽ bằng code.** B-roll quay thực tế nếu có chỉ được phép dùng nguồn miễn phí bản quyền, và phải đăng ký vào MANIFEST (sha256, URL nguồn, giấy phép, mục đích sử dụng). Không được dùng khung hình hay đoạn trích của bất kỳ video hiện hữu nào.

**Thứ hai, sự thật phải có nguồn.** Mỗi con số, năm, tổ chức, tên người và thuật ngữ tiếng Anh xuất hiện trên màn hình đều phải tìm được URL nguồn trong tài liệu khảo sát của chính bộ phim đó. Nội dung khảo sát chưa xác minh thì không lên hình, cũng không vào lời đọc.

**Thứ ba, toàn bộ phim dùng một ví dụ xuyên suốt.** Lời dẫn và hình ảnh dùng chung một ví dụ từ đầu đến cuối. Bộ phim mẫu dùng kịch bảch "chi phí công tác": câu hỏi là「差旅报销的上限是多少？」(hạn mức hoàn trở chi phí công tác là bao nhiêu?), câu trả lời bịa đặt là「每天 1000 元，全国统一」(1000 nhân dân/ngày, thống nhất toàn quốc), câu trả lời đúng là「住宿上限每天 600 元[1]，一线城市 800 元[2]」(hạn mức tạm trú tối đa 600 nhân dân/ngày, thành phố hạng nhất 800 nhân dân), nguồn là「员工手册 p.12」(sổ tay nhân viên trang 12) và「差旅补充规定 2025」(quy định bổ sung về công tác 2025). Tất cả các nhóm dùng chung một bộ văn bản ví dụ, đây là ràng buộc cứng.

Nguyên tắc thứ hai là thiết kế có giá trị nhất của cả dự án. Vì khán giả của video không thể bấm vào nguồn, một khi con số sai thì nó sai thật, chi phí sửa sai lớn hơn nhiều so với bài viết. Đưa nó lên trước thành "quy trình khảo sát chưa xác minh thì không được lên hình" đáng tin hơn nhiều so với sau đó dựa vào QC để đọc chữ từ pixel.

### 2.2 "Vẽ bằng code" thực sự đổi được gì

Đây là chìa khóa để hiểu dự án này. Mô hình sinh video và render bằng code trông đều giống "để máy vẽ hình", nhưng thứ đổi được hoàn toàn khác nhau.

**Tính xác định.** Mỗi hoạt ảnh là một hàm thuần của số khung hình, số ngẫu nhiên dùng `rnd(...)` có seed, độ rộng chữ được tính ra chứ không đo trong DOM. Nên render lại một lần nữa, các khung hình ra hoàn toàn giống hệt. Mô hình sinh video không làm được điều này, chạy cùng một prompt hai lần là ra hai thứ khác nhau.

**Khả năng chỉnh sửa.** Bất kỳ cảnh quay nào có vấn đề, agent chỉ cần sửa một con số trong một file `SCxx.tsx` rồi render lại. Mô hình sinh video không làm được điều này, bạn chỉ có thể sinh lại cả đoạn, và không bảo đảm lần này lại tốt hơn.

**Khả năng truy vết.** Mỗi con số trên màn hình đều truy được về một URL trong tài liệu khảo sát. Vì hình ảnh vốn được "vẽ ra" từ tài liệu đó.

**Khả năng kiểm chứng.** Đây là điều bị đánh giá thấp nhất. Vì hình ảnh là code nên có thể phân tích tĩnh. `selfcheck.py` có thể, không cần render, quét mã nguồn của tất cả cảnh quay, đếm có bao nhiêu chỗ nhấp nháy, đối chiếu chúng với danh sách cho phép nhấp nháy trong bảng phân cảnh, và trích ra mọi chuỗi ký tự sẽ lên hình để đối chiếu với danh sách sự kiện. Ba việc này chạy mất mấy giây, còn QC agent thì tra từ pixel, không nhìn thấy những khung hình chưa bị trích ra. Tác giả nói rất thẳng trong `lessons.md`: ba kiểm tra này bắt được toàn bộ những vấn đề mà QC không thể tra từ pixel.

### 2.3 Một phán đoán ngược đời

Phản ứng đầu tiên của nhiều người là "AI vẽ video thì nên dùng mô hình sinh, render bằng code là cách cổ rích". Tác giả dùng một bộ số liệu để phản bác phán đoán đó.

Ông so từng khung hình bộ phim《eCPM 与广告竞价》(eCPM và đấu giá quảng cáo) do chính mình làm bằng skill với bộ phim mẫu《RAG 与知识库》(RAG và kho tri thức), hai phim có số lượng chuyển động, nhịp độ và tổng diện tích ánh sáng mềm gần như giống hệt nhau:

| Chỉ số (từng khung hình phim thành phẩm, vùng nội dung) | Đấu giá quảng cáo | Bộ phim mẫu RAG |
|---|---|---|
| Lượng thay đổi trung bình mỗi khung hình / số sự kiện chuyển động mỗi phút | 0.47 / 72 | 0.56 / 76 |
| Trung vị chiều cao vật thể lớn nhất | 172px | 219px |
| Tỷ lệ thời gian vật thể lớn nhất <110px kéo dài ≥1.5s | 29% | 12% |
| Từ hiệu ứng sáng halo / sweep / ghost trong mã nguồn | 0 / 0 / 0 | 14 / 12 / 5 |
| skew / perspective / rotate trong mã nguồn | 1 / 0 / 4 | 7 / 1 / 15 |

Khoảng cách nằm trọn ở ba việc: "vẽ bao lớn, ai được chiếu sáng, sắp đặt khoảnh khắc cao trào thế nào", chẳng liên quan gì đến "chuyển động nhiều hay ít".

Điều này giải thích một cái hố mà nhiều người sẽ mắc: bản skill đầu tiên đã viết các kỷ luật về vùng an toàn, danh sách cho phép nhấp nháy, quy về 0, nhịp độ, và bộ phim mới còn làm tốt hơn ở những mục đó, nhưng "chủ thể nên vẽ bao lớn, ánh sáng nên rơi lên ai" thì chỉ nằm trong đầu người làm bộ phim mẫu. Kết quả là hình nhỏ và tối, bốn vòng QC đều đạt mà vẫn xấu.

Cách sửa không phải là thêm chuyển động, mà là thêm quy tắc cứng. Đó là lý do tồn tại của toàn bộ `composition-and-light.md`.

## Ba, hướng dẫn chi tiết: chạy trọn một bộ phim từ con số 0

Dưới đây là toàn bộ quy trình 9 giai đoạn. Giai đoạn 0 đến giai đoạn 8, cộng thêm 4 điểm xác nhận nằm xen kẽ.

### 3.1 Giai đoạn 0: dựng project (5 phút)

```bash
git clone https://github.com/Vincentwei1021/anything2explainer.git
ln -s "$PWD/anything2explainer" ~/.claude/skills/anything2explainer   # Claude Code
ln -s "$PWD/anything2explainer" ~/.codex/skills/anything2explainer    # Codex
```

Phụ thuộc:

```bash
# Node ≥18（模板的 npm install 会装 remotion 4.0.507 / react 19）
brew install ffmpeg          # 抽帧 / 转码，必需

python3 -m venv ~/.venvs/a2e && source ~/.venvs/a2e/bin/activate
pip install 'edge-tts==7.2.8' numpy pillow scipy   # edge-tts 必须锁版本
```

Việc khóa phiên bản của `edge-tts` không phải do ám ảnh. README viết rõ: nó theo dõi một endpoint của Microsoft, sẽ hỏng khi đổi phiên bản, từ 7.2.0 trở đi cần yêu cầu tường minh ranh giới từ. `scipy` chỉ `frame_metrics.py` dùng đến.

Nếu chỉ làm phim tiếng Anh thì cài thêm `kokoro soundfile` và `espeak-ng`.

Trên Raspberry Pi và máy ARM tác giả cũng đã kiểm chứng, có ba điểm khác: script dùng `#!/bin/zsh` nên phải cài zsh, Remotion không có trình duyệt headless linux-arm64 nên phải trỏ về Chromium của hệ thống (`REMOTION_BROWSER_EXECUTABLE=/usr/bin/chromium`), và kokoro không cài được trên ARM (nó khóa numpy cũ và kéo về spaCy, mà blis không có wheel aarch64), nên dùng `kokoro_onnx` hoặc `piper` làm phương án dự phòng.

Dựng project:

```bash
template/scripts/new_project.sh ~/work/my-video myslug
```

Lệnh này copy template, chạy npm install, chạy tsc. Bước này ăn khoảng 2GB đĩa, README khuyên chạy `df -h` và để dư 5GB.

Nếu làm phim tiếng Anh thì tiện thể sửa `lang` trong `src/config.ts` thành `'en'`. Nền mặc định là sóng trường chấm (`bg: 'dots'`), muốn có nền sương chấm sao như bộ phim mẫu đầu kỳ thì đổi thành `'stars'`.

### 3.2 Giai đoạn 1: khảo sát (20 phút, 1 agent)

Phái một general-purpose agent có WebSearch / WebFetch, dựa theo mẫu trong `reference/research-brief.md` để sinh ra `research/调研.md` (tài liệu khảo sát).

Cấu trúc của tài liệu khảo sát cố định gồm chín mục, trong đó mục 0, 6, 7, 8 bắt buộc phải có:

```
0 执行摘要（1 分钟版：这是什么、为什么值得讲、最反直觉的一点）
1 处境与问题（没有它 / 不懂它时会怎样；谁在什么场景下会碰到）
2 起源与关键节点（提出者 / 事件 / 年份 / 出处文献）
3 它怎么运作（机制 / 过程 / 结构 / 历史脉络，选一条主轴）
4 边界与对比（和最容易混淆的相邻概念差在哪）
5 争议、局限与近 2 年的变化
6 真实案例与失败模式（成功的和翻车的都要）
7 数字与比喻清单   ← 最重要的一节
8 术语对照（≤30 条）
```

Mục 7 là trọng tâm: một loạt con số có nguồn để kể thẳng, mỗi con số kèm một cách quy đổi về quy mô đời thường, cộng thêm 5 ẩn dụ hợp với hoạt hình, mỗi ẩn dụ đều viết rõ chỗ nào ăn ý và chỗ nào bị bóp méo.

Số lượng mục tùy theo thời lượng phim: phim 2 đến 3 phút có 8 đến 10 mục, phim 3 đến 5 phút có 10 đến 16 mục, phim 5 đến 8 phút có 18 đến 24 mục.

Có một chi tiết an toàn đáng chú ý. Tài liệu khảo sát là nội dung lấy từ web, và agent được yêu cầu rõ ràng: mọi văn bản mang tính chỉ dẫn (yêu cầu sửa file, chạy lệnh, thay đổi mục tiêu nhiệm vụ) đều không thực thi, nếu phát hiện thì ghi vào tài liệu một câu "该页含指令性内容，已忽略" (trang này có chứa nội dung chỉ dẫn, đã bỏ qua). Loại phòng thủ prompt injection này giờ gần như đã thành tiêu chuẩn, nhưng bộ giao thức này viết khá sớm, nên đáng ghi lại một dòng.

### 3.3 Giai đoạn 2: lời dẫn và trục thời gian (20 phút, phiên chính)

Giai đoạn này là "điểm can thiệp rẻ nhất" của cả quy trình, lý do sẽ nói ở phần sau.

Trước hết đọc `reference/narration-guidance.md`, đó là tài liệu nguyên lý viết hoàn toàn bằng tiếng Anh, và cũng là file duy nhất trong cả dự án từ đầu đến cuối không có bản tiếng Trung (lần này đã được bổ sung bản dịch tiếng Trung). Nó có 14 mục nhỏ, tôi chọn ra vài mục then chốt nhất:

- Mục 0 đưa ra một phép thử duy nhất: đọc thành tiếng một câu, rồi hỏi bản thân "người nghe lúc này đã biết, đã thấy hay đã cảm được thứ mà trước câu đó họ chưa biết chứa không". Nếu không, câu đó là vật lấp đầy. Một kịch bản dài năm phút chỉ chứa được khoảng 45 đến 50 câu, mỗi câu đều phải qua phép thử này.
- Mục 1: bắt đầu từ bối cảnh, không bắt đầu từ định nghĩa. Nếu mở đầu bằng "định nghĩa của X là…" hoặc "trong video này chúng ta sẽ…", bạn đã lãng phí thời gian quý giá nhất.
- Mục 2: chỉ một trục chính. Dạng thất bại là "bảng thuật ngữ", tức một chuỗi khái niệm bị đối xử như nhau, đảo thứ tự cũng không ai phát hiện. Nếu các mục có thể đảo ngẫu nhiên mà không mất nội dung, nghĩa là chưa có trục chính, hãy quay lại tìm.
- Mục 3: động cơ trước, cơ chế sau. Không có nó thì sẽ ra vấn đề gì, nó hoạt động thế nào, điều đó mang lại gì cho bạn. Tuyệt đối đừng giải thích cơ chế mà người nghe còn chưa muốn nghe.
- Mục 5: ẩn dụ là công cụ chứ không phải đồ trang trí. Một ẩn dụ hay xuyên suốt mấy nhịp thắng sáu ẩn dụ hay nhưng chỉ dùng một lần.
- Mục 11: hãy nói điều mà hình ảnh không nói được. Lời dẫn phụ trách lý do, hậu quả, so sánh và phán đoán; hình ảnh phụ trách cấu trúc, trình tự và số lượng. Câu nào chỉ mô tả những gì có trên màn hình thì xóa thẳng.
- Mục 13: bàn giao ở mối nối. Cuối mục trước phải để lại một câu hỏi, một cái giá hoặc một khoảng trống, câu đầu của mục sau phải chỉ ngược lại thành quả của mục trước rồi mới mở đề tài. Những lời dẫn chuyển tiếp chỉ đọc tên như "接下来我们看 X" (bây giờ chúng ta xem X) thì xóa.

Định dạng lời dẫn trông như thế này:

```
# CHAPTER 1 章名（≤6 字，进度条章名）
一句话|按竖线切成字幕块|每块 ≤16 字        ← 一行一句
同一段的下一句                                ← 段内句之间只隔 10 帧
                                              ← 空行 = 段落分隔：一段 = 一个镜头
新的一段（= 下一个镜头）
## gap 20                                     ← 可选：额外插空白
```

Dấu gạch dọc chỉ dùng để cắt phụ đề, không ảnh hưởng tới việc đọc. Dòng trống là ranh giới cảnh quay, điều này là nền móng của toàn bộ cấu trúc phim.

Phần đầu lời dẫn của bộ phim mẫu trông như thế này, có thể cảm nhận trực tiếp nhịp độ:

```
大模型很聪明|但它有三个天生的短板
第一|它的知识有截止日期|训练之后发生的事|它一概不知
第二|它读不到你公司内网里的文档|也不知道你昨天刚写的会议纪要
第三|遇到不知道的问题|它不会说我不知道|而是一脸自信地编一个答案|这就是幻觉
怎么办|重新训练一遍|成本太高|而且明天数据又变了
于是工程师们想出了一个办法|让模型开卷考试
考试前先把资料整理成一本手册|答题时先翻手册|再作答
这套方法就是今天的主角|RAG|检索增强生成
```

Chú ý rằng không câu nào giới thiệu khái niệm, tất cả đều nói về bối cảnh.

Điểm xác nhận 2 nằm ở đây: dán toàn bộ lời dẫn, cách chia chương, số chữ và thời lượng ước tính cho người dùng, rồi hỏi "bản văn này ổn chứ". Tên chương và danh sách mục nhỏ của HUD được tách riêng thành một dòng, vì trên thanh tiến trình chương chỉ có mấy từ đó, tác giả còn đưa ra ba câu tự kiểm: chỉ nhìn mấy từ này, người chưa xem phim có nói được mỗi chương nói về gì không? Mỗi cái có phải là một cụm danh từ không? Ghép lại có thành một trục chính người ta hiểu được không?

Tác giả cố tình viết ra ví dụ phản. Phim thứ sáu bị người dùng nêu tên, tên chương trên thanh tiến trình là「感觉还行 / 搭台留痕 / 两把尺子 / 诊断与证明」(cảm giác tạm ổn / dựng sân khấu để lưu vết / hai thước đo / chẩn đoán và chứng minh), đó là câu đánh giá và câu đùa, khán giả liếc một cái không đoán được nội dung. Ví dụ đúng là bộ phim mẫu「为什么要RAG / 知识库构建 / 检索与生成 / 评估与进阶」(tại sao cần RAG / xây dựng kho tri thức / truy hồi và sinh / đánh giá và nâng cao), chép ra cho người chưa xem phim, họ cũng nói được mỗi chương nói về gì.

Điểm xác nhận 3 tiếp ngay sau đó hỏi một câu "配音 có TTS nào bạn thích không". Nếu không thì dùng mặc định: tiếng Trung edge-tts `zh-CN-YunxiNeural`（云希，男声，原速不加速，约 5.5 字/秒 - Yunxi, giọng nam, giữ nguyên tốc độ không tăng tốc, khoảng 5,5 chữ/giây）, tiếng Anh kokoro-82m `am_liam`（Liam，男声 - Liam, giọng nam）. Nếu có sở thích riêng thì dùng TTS của bạn để sinh file wav thành phẩm đặt vào `public/assets/<slug>/audio.wav`, rồi điền tay `src/common/timeline.ts` và `subs.ts`, các bước sau hoàn toàn không đổi.

Rồi chạy phần lồng tiếng:

```bash
python3 scripts/tts_build.py
```

Nó tổng hợp từng câu, dùng WordBoundary để cắt các khối phụ đề, xuất ra wav lồng tiếng, trục thời gian theo khung hình và bảng phụ đề. Chiến lược ngắt quãng nằm trong script: trong đoạn câu cách nhau 10 khung hình, cuối đoạn thêm 20 khung hình, trước chương 45 khung hình.

**Chỉ đặt khoảng ngắt ở cuối đoạn, không đặt sau mỗi câu.** Điều này do phản hồi của người dùng ép buộc phải thay đổi, ngắt sau mỗi câu làm cả phim thấy lê thê. Cuối đoạn 30 khung hình xấp xỉ 1 giây, khán giả cảm thấy "câu này nói xong rồi, hình ảnh cũng đã dừng lại sau khi đặt xuống", rồi mới cắt cảnh.

Script còn liệt kê ở terminal những câu cuối đoạn mà khối cuối thiếu 45 khung hình, đánh dấu bằng `¶`. Sau những câu đó cần thêm `## gap 15-30`, hoặc khi phân cảnh thì gắn phần tử nhịp cuối vào trước khối trước đó.

Chạy xong hãy đối chiếu thời lượng thành phẩm có nằm trong khoảng người dùng yêu cầu không, nếu lệch quá 15% thì thêm hoặc bớt câu rồi chạy lại, đừng cố vặn tốc độ đọc cho khớp.

Rồi đóng băng. Sau khi chốt không sửa lời nữa, vì số khung hình của mỗi cảnh quay đều được hardcode trong code của nhóm xây dựng, sửa một chữ là phải căn lại toàn bộ phim.

### 3.4 Giai đoạn 3: phân cảnh (25 phút, phiên chính)

Viết `script/storyboard_src.md`, dùng token thay cho số khung hình, rồi render thành `分镜表.md` (bảng phân cảnh):

```bash
python3 scripts/render_storyboard.py
```

Token trông như thế này: `{S12.from}` `{S12.to}` `{S12.c3}`（khung hình bắt đầu của khối phụ đề thứ 3）`{C2}`（khung hình bắt đầu của chương 2）`{TOTAL}`, có thể kèm độ lệch, ví dụ `{S12.from-8}`.

Mỗi cảnh quay một dòng, các cột là: cảnh quay / khung hình / nhịp / hình ảnh / chuyển động / **nhân vật chính·kích thước** / **ánh sáng**.

Hai cột cuối được thêm sau, và đây cũng là lần cải tiến đáng giá nhất. Trước đó bảng phân cảnh chỉ có "hình ảnh" và "chuyển động", nhóm xây dựng không biết phải vẽ chủ thể bao lớn và ánh sáng nên dành cho ai, kết quả chiều cao trung vị của chủ thể chỉ 172px, nhân vật chính toàn là khung trắng không ánh sáng. Sau khi bổ sung hai cột này, bộ phim mẫu đạt 219px.

Cuối mỗi dòng trong cột chuyển động bắt buộc phải có hai câu「持续：…」(tiếp diễn: …) và「停留：…」(dừng lại: …):

- **持续**: động từ của khối phụ đề này được giữ bằng hành động nào tới nhịp sau (dòng dữ liệu, điểm sáng xung nhịp chạy dọc theo mũi tên, gõ từng dòng, lần lượt sáng từng ô, mọc lên, xoay, cổng mở đóng, hàng chờ bị nén lại). Với cảnh không có chuyển động camera khác thì viết「1.0→1.05 慢推」(đẩy chậm). **Không viết漂浮、飘动、呼吸** (trôi, bay, thở).
- **停留**: số khung hình từ lúc phần tử nhịp cuối dừng lại sau khi đặt xuống cho tới lúc bắt đầu thoát về 0, ≥30, mục tiêu 30 đến 45. Nếu không đủ thì chọn một trong ba: gắn phần tử nhịp cuối vào trước, thêm `## gap` vào phần lời, hoặc gộp vào cảnh quay liền kề.

Mục「全局约束」(ràng buộc toàn cục) cuối bảng phân cảnh phải viết bảy khối nội dung: ngữ cảnh ví dụ, danh sách sự kiện, danh sách cho phép nhấp nháy, danh sách phần tử đồ họa tái sử dụng, danh sách ranh giới chương, danh sách khoảnh khắc cao trào, danh sách cho phép quét sáng, cộng thêm toàn văn quy tắc của §9 về hành động liên tục và dừng lại sau khi đặt xuống.

### 3.5 Giai đoạn 4: lớp phủ và phần tử đồ họa (10 phút, phiên chính)

Template đã có sẵn phần mở đầu, thẻ chương, HUD, đường chạy quy trình, phần kết, thư viện phần tử đồ họa nằm ở `src/ui.tsx`, các phần tử đồ họa ánh sáng và chuyển động camera nằm ở `src/fx.tsx`. Bạn chỉ cần bổ sung 2 đến 5 biểu tượng ngữ nghĩa theo chủ đề.

Bộ phim mẫu bổ sung `DocIcon`（文档 - tài liệu）、`DBIcon`（数据库 - cơ sở dữ liệu）、`ChunkCard`（文本块 - khối văn bản）、`LLMIcon`（大模型 - mô hình ngôn ngữ lớn）.

Rồi xuất một ảnh still để xem:

```bash
scripts/still.sh Overlay 40,<章节卡帧>,<有轨帧>,<片尾帧> <绝对路径> ov
```

### 3.6 Giai đoạn 5a: dựng mẫu (15 phút, 1 agent)

Chỉ phái G1（nửa trên chương 1）, xong thì render 30 giây đầu:

```bash
scripts/preview.sh 30
```

Đây là điểm xác nhận 4. Mọi thứ người dùng muốn sửa（bảng màu, cỡ chữ, tốc độ đọc, phần mở đầu, ngữ cảnh ví dụ）đều nên sửa hết một lượt ở đây.

Phán đoán của tác giả về điểm này rất tỉnh: sửa một lần ở đây tốn chi phí của 1 nhóm, đợi cả phim render xong rồi sửa thì tốn chi phí của tất cả các nhóm.

### 3.7 Giai đoạn 5b: xây dựng song song (40 phút, mỗi nhóm còn lại 1 agent)

Số nhóm tùy theo thời lượng phim, bộ phim mẫu ở mức 8 nhóm, phái G2 đến G8. Mỗi nhóm 5 đến 7 cảnh quay, mỗi cảnh quay một file `src/shots/Gn/SCxx.tsx`.

Việc giao việc dùng build prompt trong `reference/prompts.md`, kèm `reference/agent-build-rules.md`, và phải nêu G1 như một ví dụ phong cách đã được nghiệm thu để chúng đọc.

Đây là mấy ràng buộc cứng, được nhắc đi nhắc lại trong giao thức dựng:

- Số khung hình `N = useCurrentFrame() + F0`, mọi hoạt ảnh là hàm thuần của N, phần ngẫu nhiên chỉ dùng `rnd()`, cấm `Math.random`, không dùng useState / useEffect để làm hoạt ảnh.
- Chỉ được sửa `src/shots/Gn/**`, không đụng Main / Root / common / nhóm khác.
- Trước khi cắt cứng, lúc thoát phải về 0: dùng `opacity = 1 − (n/N)^1.5`, không dùng exitFade 6,7% mỗi khung (khung cuối vẫn còn 40% đến 60% sẽ "bụp").
- Đường đi vào không được xuyên qua dải phụ đề: trượt vào từ dưới Δ ≤ 120, nếu phải vào từ ngoài khung hình thì dùng trượt vào theo chiều ngang Δ 260 đến 320.
- Vạch đỏ hiệu năng: cấm `feConvolveMatrix`, `filter: blur()` có σ ≥ 1, số nút DOM mỗi khung ≤ 600, số thực thể SVG filter ≤ 6. Vi phạm sẽ khiến toàn bộ phim render chậm hơn 10 đến 50 lần.
- Trước khi hoàn thành bắt buộc phải chạy `npx tsc --noEmit`, mỗi cảnh ít nhất xuất 6 ảnh still, render thử 30 khung, và `python3 scripts/motion_check.py <Gn>`.

Điều cuối cùng là mới nhất, và nó định lượng hành động liên tục cùng dừng lại sau khi đặt xuống: mỗi cảnh thời gian tĩnh tối đa ≤3 giây, giai đoạn ổn định ở nhịp cuối ≥30 khung.

### 3.8 Giai đoạn 6: Render (5 phút)

```bash
npx tsc --noEmit
VER=v1 scripts/render.sh
```

8000 khung hình tương đương khoảng 4 phút rưỡi độ dài phim, render mất 3 đến 4 phút, concurrency 6. Cho ra `renders/<slug>_v1.mp4` cùng `fin_frames/`.

Sau đó chính phiên chính sẽ ghép 6 tấm contact sheet để đọc lại một lượt, rồi chạy:

```bash
python3 scripts/frame_metrics.py --out qc/frame_metrics_v1.md
```

Bước này đo: chiều cao vật thể lớn nhất của mỗi cảnh, diện tích ánh sáng mềm trong vùng nhân vật chính, chỉ số mảnh vụn tím, các đoạn tĩnh.

### 3.9 Giai đoạn 7: QC và sửa lỗi (60 đến 90 phút)

Mỗi chương 1 QC agent, chạy theo `reference/agent-qc-rules.md`, xuất ra `qc/qc_v1_Cn.md`. Phân công agent sửa theo nhóm, một agent chỉ sửa một đến hai nhóm.

Render v2, 2 agent đối chiếu kiểm từng mục vấn đề của v1 cộng thêm một lượt đọc hồi quy, sửa nhỏ, render v3.

Kiểm tra cuối cùng phải làm bốn việc: quét danh sách cho phép nhấp nháy, đối chiếu danh sách cho phép quét sáng, rà lại bố cục và ánh sáng qua frame_metrics, và đo lại toàn phim bằng motion_check.

Tác giả nhấn mạnh điều này nhiều lần: **motion_check ở cấp nhóm đạt không có nghĩa phim hoàn chỉnh đạt.** Phim thứ tư, v1 đạt 48/48 cảnh ở cấp nhóm, nhưng khi đo lại toàn phim thì có 11 cảnh vượt hạn, trong đó 3 cảnh là tĩnh thật, 8 cảnh chỉ có vùng chuyển động nhỏ. Nguyên nhân là cấp nhóm render ở độ phân giải thấp nên số đọc bị lỏng. Vì vậy trong quy trình, đo lại toàn phim là bắt buộc, không được bỏ.

### 3.10 Giai đoạn 8: Bàn giao

Sinh ra `交付说明.md`: phim hoàn chỉnh, nguồn lồng tiếng, nguồn sự thật, ngữ cảnh ví dụ, kết luận kiểm tra chất lượng, các hạng mục cố ý giữ lại, mục lục. Chữ ký mặc định ở cuối phim là `built by Anything2Explainer skill`, đặt `config.builtBy` thành chuỗi rỗng thì bỏ được.

Sau đó viết lại kinh nghiệm mới vào `reference/lessons.md`. Điều này biến cả kho lưu trữ thành một hệ thống học liên tục, những bài học của năm phim trước vẫn nằm đó.

## Bốn, Giao thức phân công nhiều agent: một phim cần mở bao nhiêu agent

Đây là phần "công nghiệp" nhất của toàn bộ dự án, cũng là thứ người khác nhìn thấy thì không chép lại được.

### 4.1 Sáu loại vai trò

`reference/prompts.md` định nghĩa sáu mẫu agent prompt, cộng thêm `research-brief.md` và hai tài liệu quy tắc, tổng cộng tám tài liệu tạo nên giao thức điều phối hoàn chỉnh.

| Vai trò | Số lượng | Trách nhiệm | Sản phẩm |
|---|---|---|---|
| Nghiên cứu | 1 | Dùng WebSearch/WebFetch để kiểm chứng sự thật | `research/调研.md` |
| Nhóm dựng | 8 (mức phim mẫu) | Mỗi nhóm 5–7 cảnh, mỗi cảnh một file | `src/shots/Gn/**` + `BUILD_NOTES.md` |
| QC | Mỗi chương 1 | Kiểm tra từng khung theo tiêu chí viết ra | `qc/qc_vN_Cn.md` |
| Sửa lỗi | Mỗi 1–2 nhóm 1 | Sửa các mục trong báo cáo QC | Code + mục phụ ghi thêm trong BUILD_NOTES |
| Đối chiếu lại | Mỗi hai chương 1 | Kiểm tra vấn đề v1 đã thực sự sửa chưa + đọc hồi quy | `qc/qc_vN+1_recheck_C**.*.md` |
| Kiểm tra cuối | 1 | Tuân thủ nhấp nháy, danh sách cho phép quét sáng, frame_metrics, đo lại toàn phim bằng motion_check | `qc/qc_vN_final.md` |

### 4.2 Kỷ luật đầu tiên khi phân công: một agent chỉ nhận một việc nặng

Tác giả viết cứng điều này trong `lessons.md`: dựng 5 đến 7 cảnh là việc nặng, QC một chương là việc nặng, sửa 1 đến 2 nhóm là việc nặng. Việc thứ hai chỉ phân công việc nhẹ.

Lý do là ông đã dính lỗi: agent đã đọc rất nhiều ảnh mà lại được giao tiếp việc nặng sẽ có khoảng 30% khả năng "chết" ngay, báo lỗi "input too long".

Điều này đối lập với một hiểu lầm phổ biến khác: QC agent được yêu cầu "vừa tra vừa append" vào file không phải là gợi ý mà là yêu cầu cứng. Có một phim, một QC agent tích góp đến cuối mới ghi đĩa, chạy một tiếng không ra sản phẩm gì và cũng không trả lời tin nhắn, chỉ có thể TaskStop rồi phân công lại. Lý do rất đơn giản: nếu nó bị giết giữa chừng, toàn bộ kết luận đã gom được trước đó sẽ mất sạch.

### 4.3 Trần đồng thời: pane được chia sẻ toàn máy

Đây là điều ngược đời nhất. Tác giả dính lỗi ở phim thứ ba: trần pane bị chạm trước lần trước, trong khi đang mở 13 phiên khác, phân công tới agent thứ 5 thì đã `respawn pane failed: fork failed: Device not configured`.

Cách sửa là phân công theo từng đợt 4, đợt trước xong và giải phóng rồi mới phân công đợt sau; trước khi phân công thì `ListAgents` để xem tình trạng chiếm dụng toàn máy, chừa ra 1 đến 2 pane cho các vòng QC và sửa lỗi về sau.

Điều này giống nhau trong cả Claude Code và Codex, nên tác giả đặc biệt viết thêm một đoạn "phân công và watchdog" ở cuối các mẫu prompt: agent đã xong thì TaskStop kịp thời để giải phóng, agent bị chết vì lỗi API thì trước tiên SendMessage gọi một lần, 10 phút không ra sản phẩm thì TaskStop rồi phân công lại (khi phân công lại phải nói rõ "dùng lại phần dở dang trên đĩa, chỉ bổ sung phần chưa xong"), cứ 30 đến 40 phút kiểm tra một lần mtime của index.ts và BUILD_NOTES của các nhóm.

### 4.4 Đừng chép nguyên văn tự đánh giá của agent

Tác giả đã kiểm tra chéo tự đánh giá của một nhóm: "các năm ở giữa mờ và không đọc được" — nhưng ảnh thực tế rõ ràng và đọc được, chính nhóm đó cũng thừa nhận trong bản tự vấn rằng đánh giá này quá lạc quan.

Nhưng kết luận của ông không phải là "agent nói dối", mà là hai câu cùng lúc: báo cáo thì cần kiểm tra chéo, nhưng cũng đừng vội kết luận agent sai, hãy xem hết bằng chứng. Có một mục khác mà ông tra ra thì do chính mình hiểu lầm, báo cáo thực ra là đúng.

### 4.5 Nhóm dựng sẽ phát hiện lỗi ngay trong bảng phân cảnh

Đây là một trong những tài sản ông coi trọng nhất. Ba cải tiến giá trị nhất của phim thứ ba đều đến từ nhóm dựng: công thức cột giá trị mâu thuẫn với chú thích trên hình, lỗ hổng tuân thủ sự thật của bàn xoay năm, và việc chủ động lệch ra không ghi mili giây để làm đếm.

Cách xử lý của ông là: mỗi điểm một câu phán quyết, rồi mở rộng phán quyết đó thành quy tắc chung cho cả phim và viết ngược lại bảng phân cảnh, chứ không chỉ duyệt đúng cái thay đổi điểm lẻ ấy.

Kèm theo còn một yêu cầu cứng: nhóm dựng lệch hợp lý (đổi văn bản ví dụ, thêm tên đầy đủ bằng tiếng Trung, đổi topo) thì cứ để qua, miễn là có căn cứ.

### 4.6 Chính phiên chính cũng phải tự làm kiểm tra tĩnh

Tác giả không hài lòng với việc chỉ dựa vào QC. Ông tự giữ lại ba kiểm tra không cần render: phân tích tĩnh độ phủ khung hình (khoảng trống và chồng lấn của các đoạn khung), đối chiếu literal trong mã nguồn với danh sách sự kiện, và đếm danh sách cho phép nhấp nháy ở cấp mã nguồn.

Ba mục này chạy mất vài giây, bắt được toàn bộ vấn đề mà QC không thể tìm ra từ pixel. Ở phim thứ tư, đối chiếu mã nguồn một lần bắt được một bộ đếm thời gian thực — trên hình hiện "giây này +2405", ngay bên dưới là dòng chữ nhỏ màu xám ghi "mỗi ngày mấy chục tỷ lần", hai bên chênh nhau 30 lần, cả bốn QC agent đều bỏ sót.

## Năm, Tổng kết: các luận điểm cốt lõi của dự án

Đọc hết bộ giao thức này, tôi rút ra bảy luận điểm.

### Luận điểm một: nút thắt chất lượng của sáng tạo bằng AI không nằm ở năng lực sinh ra, mà nằm ở đặc tả

Chất lượng sản phẩm của mọi agent trong dự án này đều phụ thuộc mạnh vào mật độ đặc tả. Mười một tài liệu dưới `reference/`, cộng hơn một trăm component và hàm trong các mẫu, lượng code thực ra không lớn, thể tích đặc tả còn dày hơn code.

Đối chiếu với những ghi chép trong `lessons.md` là thấy ngay tác dụng của đặc tả: bản skill đầu tiên có các kỷ luật về vùng an toàn, danh sách cho phép, về 0, nhịp đậu; phim mới làm tốt hơn phim mẫu ở những mục ấy, nhưng "vẽ to cỡ nào, ai phát sáng" thì chưa viết, nên phim mới lại nhỏ và tối. Những thứ không viết trong đặc tả, agent sẽ không tự nghĩ ra.

### Luận điểm hai: tính tất định và khả chỉnh sửa quan trọng hơn cảnh hình bắt mắt

Mục 2.2 đã nói rồi. Cốt lõi là: vì hình ảnh là code nên có thể phân tích tĩnh, có thể sửa chính xác một khung hình, có thể truy vết nguồn gốc. Ba điều đó cộng lại còn giá trị hơn nhiều so với "khung hình này nhìn đẹp".

Một hệ quả trực tiếp là: đừng dùng mô hình sinh ra để làm việc này.

### Luận điểm ba: ràng buộc phải viết ra một cách công khai, đừng trông chờ agent tự hiểu

"Một ví dụ xuyên suốt cả phim", "mỗi cảnh một nhân vật chính", "mỗi cảnh nhiều nhất một chỗ nhấp nháy" — đây không phải gợi ý mà là luật cứng, và phải kiểm tra được bằng máy.

Sự tồn tại của `selfcheck.py` nằm đúng chỗ đó: nó biến "danh sách cho phép nhấp nháy" từ một khẩu hiệu thành một cuộc đối chiếu đếm số. Danh sách cho phép có 23 mục, script quét ra phải đúng 23 chỗ, nhiều một hay thiếu một đều là vấn đề.

Tác giả từng đưa ra một ví dụ phản diện: nếu trong bảng phân cảnh chữ "glitch" chỉ nằm ở một ô, agent dựng sẽ thêm hiệu ứng nhấp nháy cho mọi chữ trong phim, ra thành 102 chỗ và người dùng bác thẳng. Sau đó đổi thành "mỗi cảnh nhiều nhất 1 chỗ glitch, chỉ dành cho từ trọng tâm của cảnh đó", còn 21 chỗ thì mới qua.

### Luận điểm bốn: chất lượng tự sự phụ thuộc vào việc có tuyến chính hay không, chứ không phụ thuộc vào lượng thông tin

Mục 2 của `narration-guidance.md` và bài tổng kết của phim thứ tư chính là hai mặt của cùng một sự việc. Bản đầu tiên của phim thứ tư có 48 câu viết theo thứ tự tiểu mục của cuốn sách tham chiếu, phản ứng đầu tiên của người dùng là "quá cứng nhắc và chán"; bản viết lại độc lập theo nguyên tắc viết thì điểm mù so sánh là 8,2 so với 4,3.

Nguyên nhân không phải văn phong, mà là không có tuyến chính. Chương có thể tùy ý đổi thứ tự mà không mất gì, thì đó là không có tuyến chính.

Ở đây có một cách làm đáng học: tác giả tách "viết thế nào cho khỏi chán" ra khỏi "đặc tả phân cảnh", tách thành riêng một `narration-guidance.md`, và quy định trong SKILL.md rằng giai đoạn 2 bắt buộc phải đọc. `narration-storyboard.md` không còn quy định cách chia chương cố định, chỉ giữ lại định dạng, ngân sách và giao diện hình ảnh, cột trái của bảng mẫu cảnh cũng đổi thành "loại quan hệ hình ảnh" không gắn với chủ đề.

**Đặc tả phải được đặt đúng chỗ theo cấp độ trừu tượng.** Nguyên tắc tự sự là nguyên tắc phổ quát, để dưới một mẫu gắn với chủ đề cụ thể thì sẽ bị coi như một phần của mẫu đó.

### Luận điểm năm: chốt bản thảo trước rồi mới lồng tiếng, vì số khung hình sẽ được hardcode

Đây là quyết định kỹ thuật ngược đời nhất của cả dây chuyền, và cũng là cơ sở thiết kế của bốn điểm xác nhận.

Một khi lồng tiếng chốt, số khung hình được viết thẳng vào code của từng cảnh. Sửa một chữ = phải đồng bộ lại toàn phim = mọi nhóm dựng phải chạy lại. Vì vậy tác giả đặt điểm xác nhận 2 (chốt lời dẫn) trước khi lồng tiếng, và nói thẳng trong README: đây là điểm can thiệp rẻ nhất của toàn bộ quy trình.

Nói ngược lại, điểm xác nhận thứ nhất và thứ hai giá trị hơn điểm thứ ba và thứ tư. Cái thứ nhất (thời lượng và ngôn ngữ) quyết định số câu, số cảnh, số nhóm dựng, tức là quy mô của cả dây chuyền; cái thứ hai (chốt lời dẫn) quyết định nếu sai thì phải chạy lại bao nhiêu.

### Luận điểm sáu: tiêu chí định lượng phải phân biệt "cấp nhóm" và "phim hoàn chỉnh"

Bài học từ phim thứ tư: motion_check cấp nhóm 48/48 đạt, đo lại toàn phim có 11 cảnh vượt hạn.

Render ở độ phân giải thấp cho số đọc bị lỏng. Cách sửa của tác giả là đổi render cấp nhóm thành 0,5 lần cộng JPEG q80, và cho chế độ `--frames` thêm một cột "số pixel thay đổi ở độ phân giải đầy đủ trong đoạn tĩnh dài nhất", dùng để phân biệt tĩnh thật (<800) với vùng chuyển động nhỏ (800–2500).

Còn một điều tinh vi hơn: cách sửa cho vùng chuyển động nhỏ là **tăng biên độ**, không phải thêm phần tử. Yếu tố chuyển động sáng hơn, to hơn, dày đặc hơn, nhân vật chính thở 30 khung hình ±2%, chứ không phải chồng thêm nhiều biểu tượng nhỏ lên trên.

Sự phân biệt này rất quan trọng. "Cho vật đứng yên thêm bay, thêm lơ lửng, thêm thở" là điều bị cấm rõ ràng, lý do tác giả đưa ra là: hành động phải là hành động của chính động từ, cảnh nào không tìm được hành động của động từ thì cứ để tĩnh, tĩnh ≤3 giây không phải là khiếm khuyết.

### Luận điểm bảy: sau khi dạy agent làm, còn phải dạy nó cách bị đánh giá

Đây là điều tôi cho là dễ bị bỏ qua nhất, mà cũng giá trị nhất.

Tác giả không dừng ở "bảo agent viết code", ông viết cho agent bộ tiêu chí, viết cho agent script định lượng, viết cho agent danh sách kiểm tra cuối, viết cho agent những yêu cầu trông có vẻ máy móc như "mỗi cảnh phải cho ra ít nhất một dòng kết luận (OK cũng phải viết)".

Thậm chí có một mục nói về phản ví dụ: trong `examples/contrast/` có 6 nhóm khung hình phản ví dụ, agent dựng bắt buộc phải dùng Read để xem `contrast_sheet.jpg` và ít nhất 6 ảnh `ref_*.jpg` để dựng thang chuẩn trước khi bắt tay vào làm.

Đây là cách biến "gu thẩm mỹ" thành "vật tham chiếu có thể truyền đạt". Gu thẩm mỹ không viết được vào prompt, nhưng có thể đưa ra một bộ khung hình đối chiếu.

## Sáu, Phân tích triết lý thiết kế

Gom những nguyên tắc rải rác ở mọi nơi lại, triết lý thiết kế của dự án này xấp xỉ bảy điều.

### 6.1 Màu sắc chính là ngữ nghĩa

Mỗi màu trong bảng màu đều mang một nghĩa cố định, không màu nào chỉ dùng vì "đẹp":

| Màu | Giá trị | Ngữ nghĩa |
|---|---|---|
| PURPLE | #6630F8 | Trọng tâm hiện tại / kích hoạt / thương hiệu |
| ORANGE / CORAL | #F05F41 | Chữ số chỉ số, cảnh báo, "phe bên kia", điểm truy vấn |
| RED_DEEP | #EC081F | Khối cảnh báo đỏ đậm (ảo giác, không đáng tin) |
| GREEN | #8FF740 | Dấu tích xanh (đúng) |
| Dải GREY | Từ #A0A0A1 | Chữ không trọng tâm, khối xám, đường lưới |

Luật là "trong một khung hình, phần diện tích lớn màu tím trọng tâm không quá một chỗ". Bố cục màu không phải vấn đề thẩm mỹ, mà là vấn đề thông tin.

### 6.2 Ánh sáng chỉ dành cho nhân vật chính hiện tại

Nhân vật chính bắt buộc có ánh sáng (`GLOW_PURPLE` lớp ánh sáng mềm tím hai lớp, hoặc `HaloRing` dưới chân, hoặc chữ lớn có đổ bóng cứng tím `6px 6px 0 PURPLE`), yếu phụ thì không phát sáng.

Ánh sáng có ba tầng: bloom trắng (đường nét cấu trúc luôn hiện) < ánh sáng mềm tím (nhân vật chính luôn sáng + trọng tâm hiện tại) < chớp trắng (sự kiện, 3–6 khung). Cả phim chỉ dùng ba loại này, màu ánh sáng chỉ dùng tím, cam, đỏ.

Còn mấy quy tắc tinh vi: ánh sáng của nhân vật chính thở theo chu kỳ 30 khung hình ±15%; khi trọng tâm chuyển thì ánh sáng chỗ trước tắt trong vòng 8 khung; lúc thoát thì ánh sáng tắt trước (6 khung) rồi cả khung mới mờ dần, đừng cắt cứng khi vẫn đang sáng trưng.

### 6.3 Ba kích thước, không có kích thước thứ tư

Nhân vật chính ≥170px hoặc chữ lớn ≥96px với cả dòng rộng ≥300px; yếu phụ 60–110px; nhãn và phần chú thích 22–30px. Yếu phụ ≤4, nhãn ≤6.

Giá trị của ràng buộc "ngoài ba kích thước ấy không có kích thước thứ tư" nằm ở chỗ nó tự động loại bỏ loại tinh chỉnh vô tận kiểu "biết đâu cái biểu tượng này có nên to lên một chút".

Tiêu chí đi kèm là khung trống: chiều cao vật thể lớn nhất trong vùng nội dung <110px kéo dài >45 khung là lỗi mức trung bình, <80px kéo dài >45 khung là lỗi nặng.

### 6.4 Quét sáng là chiêu đắt nhất, cả phim nhiều nhất hai lần

Ba vòng tím quét ngang + ánh sáng sân khấu + đường viền ma là bộ dàn dựng kiểu xuất hiện đắt nhất của cả phim, tác giả đặt hạn ngạch là **≤2 chỗ**: khái niệm lõi lần đầu xuất hiện chắc chắn có 1 chỗ, chỗ thứ hai tùy chọn dành cho phần kết nối lại.

Lý do là phản hồi của người xem. Phim thứ năm dùng 8 chỗ với ba vòng quét sáng trong 47 cảnh, người xem xem xong nói "quá thường xuyên". Phim mẫu 44 cảnh chỉ dùng 1 lần.

Bảng phân cảnh vì vậy tách riêng một "danh sách cho phép quét sáng", cảnh nào không có trong danh sách thì tuyệt đối không dùng `LightSweep` / `StageLine` / `GhostText`, `selfcheck.py` đếm theo file, kiểm tra cuối đối chiếu theo khung hình.

Đây là một thiết kế rất đáng học: thay vì nói trong prompt là "dùng ít hiệu ứng lấp lánh" (mô hình không hiểu), hãy đưa cho nó một hạn ngạch cứng và một danh sách cho phép.

### 6.5 Hành động liên tục + dừng lại sau khi đặt xuống

Đây là quy tắc động lực học muộn hình thành nhất, cũng là quan trọng nhất của cả dự án, nó tương ứng với hai kiểu thất bại ngược nhau:

- **"Vào là đứng"**: phần tử đi vào theo nhịp rồi đứng yên chờ nhịp sau, chỉ có ánh sáng mềm thở. Sau khi định lượng ở phim thứ tư: 4/6 cảnh có tỉ lệ khung tĩnh 42% đến 72%, thời gian tĩnh dài nhất 2,8 giây.
- **"Đặt xuống là cắt"**: sửa theo "không được tĩnh >30 khung" quá tay, 47 cảnh có 34 chỗ đẩy cận cảnh, 48 câu "liên tục", phần tử vừa đặt xuống ở nhịp cuối đã vào 8 khung cuối để thoát. Nguyên văn của người dùng là "tất cả các animation vừa đặt xuống là lập tức cắt sang cảnh tiếp theo, gần như không có khoảng dừng".

Luật một là **liên tục**: với mỗi khối phụ đề, động từ mà nó kể phải có một hành động trên hình kéo dài tới nhịp sau; phần tử đi vào không được hoàn toàn đứng yên quá 3 giây (90 khung); nhưng **không được thêm bay, lơ lửng, thở cho vật đứng yên chỉ để đạt chỉ số**.

Luật hai là **dừng lại**: sau khi phần tử đặt xuống ở nhịp cuối của mỗi cảnh, phải có 30 đến 45 khung (1 đến 1,5 giây) ổn định trước khi thoát. Trong giai đoạn ổn định không thêm phần tử mới, không chuyển động camera, không đổi HUD, nhưng hành động của động từ đang chạy thì vẫn tiếp tục. Chuyển động camera không được đi vào nhịp cuối.

Thời gian lấy từ đâu? Quyết định của người dùng: cho phép phim dài hơn lời thuần 5% đến 8% để đổi lấy khoảng dừng. Chỉ đặt điểm dừng ở cuối đoạn, không đặt sau mỗi câu.

Tác giả giao cả bộ quy tắc này cùng script định lượng `motion_check.py` trong tài liệu, chứ không chỉ viết trong đặc tả.

### 6.6 Chuyển tiếp phải viết rõ cả hai phía

Tác giả từng dính một cái bẫy rất điển hình. Nếu bảng phân cảnh chỉ ghi "cắt cứng", hai bên sẽ hiểu mỗi bên là "tôi không động, bạn thì từ khung nhịp mới vào", kết quả là xuất hiện khoảng trống 6 đến 8 khung ở ranh giới nhóm, một phim có 5 chỗ.

Vì vậy quy cách viết là: "8 khung cuối của A về 0 và mờ dần + hạ nhẹ camera; các phần tử đầu tiên của B SoftIn từ khung đầu".

Kèm theo còn nguyên tắc nối tiếp quan trọng hơn dọn sạch: một câu ngắn kết thúc ở nhịp này thì gộp vào cảnh trước, dùng dịch chuyển bàn giao 16 khung để nhường chỗ, đừng dọn sạch rồi vẽ lại vì nó.

Ranh giới chương còn nghiêm hơn: cảnh đầu tiên của chương phải tiếp nối nhân vật chính hoặc vật tượng trưng của cảnh cuối chương trước (cùng component, cùng tham số, có thể thu nhỏ và dịch chuyển), lời dẫn cũng phải vừa nối vừa mở. Phản ví dụ mà tác giả đưa ra là "chương đầu khởi động từ số không" và "chương đầu chỉ đọc tên chương", khác biệt giữa hai thứ là: đọc tên chương thì không, vừa nối vừa mở thì có.

### 6.7 Tuân thủ sự thật là một vấn đề thẩm mỹ

Điều này thú vị nhất. Bề ngoài là quy tắc QC, thực chất là triết lý thiết kế.

Tiêu chí của tác giả là: mọi con số xuất hiện trên hình đều phải truy được về nguồn. Hệ quả thiết kế trực tiếp là:

- Giá trị trung gian của hiệu ứng đếm cũng là "con số lên hình". Năm 1995→1998 đếm tuyến tính sẽ khiến 1995, 1996, 1997 hiện rõ trong 4 đến 6 khung; mili giây 0→120 sẽ lóe ra "37 ms""88 ms". Những thứ này đều không có trong danh sách sự kiện, nên hoặc phải làm cho nó không đọc được, hoặc không đếm.
- Làm cho năm không đọc được thì phải đủ dữ: blur 6.3→1.3px thì các năm ở giữa vẫn đọc rõ; 12→2px thì năm gần thứ hai vẫn phân biệt được khoảng 2 khung; cuối cùng 12→9px suốt quá trình + khung chốt lại về 0 thì mới sạch. Tác giả đóng gói điều này thành component `YearRoll` trong mẫu.
- Dữ liệu ví dụ (mã model, điểm tương đồng, số tiền) được ghi rõ là "giá trị minh họa" trong tài liệu bàn giao.

Đây không phải là gây khó cho chính tác giả, mà là bảo vệ khán giả. Video thì không bấm được vào nguồn, không kiểm chứng được, khán giả chỉ có thể tin bạn.

## Bảy, Giới hạn, hoài nghi và các điểm đáng chờ sau này

### 7.1 Ba giới hạn thực tế tôi cần nói rõ trước

**Một, đây không phải là một sản phẩm "đưa chủ đề vào là ra phim".** Nó cần con người (hoặc đúng hơn là cần một phiên chính có agent) ra quyết định ở bốn điểm: thời lượng và ngôn ngữ, chốt lời dẫn, engine lồng tiếng, và 30 giây phim mẫu đầu tiên. Bốn điểm xác nhận không cái nào bỏ được, tác giả cũng không định bỏ.

Nhìn từ góc "đưa một đầu vào là có phim hoàn chỉnh" thì nó còn rất xa so với một sản phẩm. Nhưng nhìn từ góc "để agent tự hoàn thành một bộ phim" thì nó đã đi rất xa.

**Hai, chi phí không hề thấp.** Mức phim mẫu 8 nhóm dựng chạy song song 40 phút, cộng hai vòng QC 60 đến 90 phút, toàn bộ quy trình khoảng 2 giờ, tốn từ 2GB đĩa trở lên. Mà đó còn là khi bạn đã quen Remotion.

**Ba, vấn đề giấy phép.** PolyForm Noncommercial 1.0.0, miễn phí cho mục đích phi thương mại, dùng thương mại thì phải xin tác giả cho phép trước. Làm khoa học phổ thông, hướng dẫn, dự án cá nhân thì không sao, muốn dùng vào sản phẩm thương mại thì phải thương lượng trước.

### 7.2 Hai câu hỏi tôi cho là đáng truy vấn nhất

**Câu hỏi thứ nhất: bộ phương pháp này có tái lập được trên máy không có tác giả không?**

Giọng văn của cả kho lưu trữ là "một người làm hết bộ phim này bộ phim khác, mỗi lần dính lỗi thì viết ngược lại lessons.md". Mức độ hoàn chỉnh của giao thức phụ thuộc rất lớn vào những bản ghi dính lỗi ấy, và chúng được tích lũy trong bốn ngày từ 2026-09-07 đến 09-10.

Ưu điểm của loại tài liệu "lắng đọng kinh nghiệm" là mỗi mục đều có sự cải sửa thật đứng sau, sức nặng rất lớn; rủi ro là nó chỉ được kiểm chứng trên máy của tác giả, với bộ cấu hình Claude Code của tác giả, với trần pane của tác giả. README nói "trên Linux chắc là chạy được, Windows chưa thử", cái Raspberry Pi cũng chạy thông, đã là cách đối diện khá trung thực, nhưng dù sao cũng không phải "ai cũng chạy được trên máy nào".

**Câu hỏi thứ hai: nút thắt thật sự của dây chuyền này là gì?**

Tác giả dồn toàn bộ sự chú ý vào việc "làm cho hình ảnh đẹp hơn" — kích thước chủ thể, ánh sáng, khoảnh khắc cao trào, hạn ngạch quét sáng, hành động liên tục, dừng lại sau khi đặt xuống, tất cả đều là thị giác. Nhưng chính ông đã thừa nhận trong `lessons.md` một điều thú vị hơn:

> Truyền tải phong cách (tổng kết 2026-09-08): skill đã viết lệnh cấm nhưng không viết động lực thẩm mỹ…… nhưng "vẽ to cỡ nào, ai phát sáng, khoảnh khắc cao trào sắp xếp thế nào" chỉ nằm trong đầu người làm phim mẫu.

Nói cách khác, ông đã dồn rất nhiều công sức để chữa triệu chứng "AI làm hình ảnh tệ", động đến hai năm. Nhưng xét từ cấu trúc tổng thể của `lessons.md`, **thứ thực sự khan hiếm không phải quy tắc thẩm mỹ, mà là bộ phương pháp "làm thế nào để biến phán đoán thẩm mỹ của một con người thành dạng có thể truyền đạt, có thể kiểm tra, có thể lặp đi lặp lại"**. Dự án này hiện là một lần thử thành công theo hướng đó, chứ chưa phải là một phương pháp phổ quát đã trưởng thành.

Một lời chứng cứ phụ là chính kết luận tổng kết của ông: "khoảng cách không nằm ở 'chuyển động nhiều hay ít', đừng đi sửa theo hướng thêm hiệu ứng". Giá trị của câu này là nó là một phán đoán phủ định — loại bỏ một hướng, chứ không chỉ đường nào. Cái thực sự khó là tìm ra nên sửa theo hướng nào.

### 7.3 Có thể trông đợi gì ở phía sau

- **Dọc dọc.** README nói rõ không hỗ trợ 9:16, mẫu và mọi luật vùng an toàn đều giả định khung ngang 1280×720. Nền tảng video ngắn gần như toàn dọc, đây là khoảng trống rõ ràng nhất.
- **Thêm ngôn ngữ.** Hiện chỉ hỗ trợ Trung–Anh, mỗi thứ có một bộ mô hình tốc độ nói, ngân sách phụ đề và giọng mặc định. Trường `lang` đã để sẵn lối mở rộng.
- **TTS chất lượng cao hơn.** Con đường hiện tại là "tự mang TTS" — người dùng tự sinh file wav hoàn chỉnh rồi điền thủ công mốc thời gian. Tác giả nói thẳng edge-tts và kokoro mặc định "dùng được nhưng không phải tốt nhất". Điều này có nghĩa cả dây chuyền này cởi mở cho các kỹ thuật như nhân bản giọng nói, forced alignment.
- **Mở rộng thư viện phản ví dụ.** `examples/contrast/` hiện chỉ có 6 nhóm, và toàn bộ ví dụ đúng đều đến từ cùng một bộ phim (phim mẫu). Thêm vài bộ phim khác chủ đề làm ví dụ đúng sẽ giúp truyền tải tiêu chuẩn thẩm mỹ.

### 7.4 Quyết định thiết kế đáng học nhất

Nếu chỉ được mang về một thứ từ dự án này, tôi chọn cái này:

**Biến "gu thẩm mỹ" thành bộ ba "vật tham chiếu + tiêu chí + bộ đếm".**

- Vật tham chiếu: 6 nhóm khung hình đúng/sai trong `examples/contrast/contrast_sheet.jpg`, agent bắt buộc phải xem trước khi làm.
- Tiêu chí: ba kích thước, quyền sở hữu ánh sáng, ngưỡng khung trống, hạn ngạch quét sáng trong `composition-and-light.md`.
- Bộ đếm: `selfcheck.py` đếm danh sách cho phép nhấp nháy, `frame_metrics.py` đo chiều cao chủ thể và ánh sáng mềm, `motion_check.py` đo thời lượng tĩnh.

Chỉ dựa vào hai cái đầu, agent sẽ hiểu nhưng sẽ lệch. Thêm cái thứ ba thì sai lệch bị phát hiện ngay.

Tác giả đưa ra một quan sát rất thực tế ở cuối phim thứ tư: khi một nhóm agent phản hồi "các năm ở giữa mờ và không đọc được" thì ảnh thực tế lại rõ ràng và đọc được. Ông không coi đó là agent không đáng tin, mà bổ sung "trích tĩnh từ mã nguồn tất cả các chữ sẽ lên hình, rồi đối chiếu với danh sách sự kiện" thành một bước kiểm tra.

**Đó chính là dạng một hệ thống cải tiến liên tục nên có: mỗi lần thất bại đều biến thành một mục kiểm tra mới, chứ không phải một lời than phiền một lần rồi bỏ.**

## Tám, Tóm tắt trong một câu

anything2explainer biến việc "để AI làm một video giải thích khoa học" từ một bài toán prompt thành một bài toán kỹ thuật.

Nó không sinh pixel, nó sinh code tất định; nó không trông chờ mô hình hiểu thẩm mỹ, nó truyền tải thẩm mỹ bằng vật tham chiếu, tiêu chí và bộ đếm; nó không trông chờ agent làm đúng ngay lần đầu, nó biến mỗi lần làm lại thành mục kiểm tra của phim tiếp theo trong lessons.md.

Với một người muốn làm nội dung kỹ thuật, thứ thiết thực nhất của kho lưu trữ này có lẽ không phải 9 giai đoạn đó, mà là những thứ tích góp trong 11 tài liệu `reference/`: chủ thể nên vẽ to cỡ nào, ánh sáng nên chiếu vào ai, khoảnh khắc cao trào nên sắp xếp thế nào, quét sáng nhiều nhất là mấy lần, khoảng dừng nên đặt ở đâu, tại sao "vào là đứng" và "đặt xuống là cắt" đều là lỗi, và làm sao dùng ba script chạy vài giây để kiểm tra xem agent rốt cuộc có làm được không.

## Đọc thêm

- Kho lưu trữ dự án: https://github.com/Vincentwei1021/anything2explainer
- Remotion: https://remotion.dev
- Giấy phép Remotion (người dùng doanh nghiệp có yêu cầu khác): https://remotion.dev/license
- Giấy phép của dự án này: PolyForm Noncommercial 1.0.0, miễn phí cho mục đích phi thương mại, thương mại cần xin phép trước
- Nguồn phong cách hình ảnh: nhà sáng tạo Douyin @图灵宇宙 (toàn bộ hình ảnh tự vẽ, không dùng bất kỳ tư liệu nào của họ)

---

以上，既然看到这里了，如果觉得不错，随手点个赞、在看、转发三连吧，如果想第一时间收到推送，也可以给我个星标，谢谢你看我的文章，我们，下次再见。

首发于微信公众号「瑞哥观势」。
