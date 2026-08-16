---
title: 'ttfx: Biên dịch hiệu ứng văn bản đầu cuối thành một binary tĩnh 3.3MB duy nhất bằng Rust'
date: "2026-08-16"
description: "Phân tích chuyên sâu omacom-io/ttfx — bản port Rust tái tạo TerminalTextEffects từng byte. Khám phá cách nó nhồi 37 hiệu ứng đầu cuối vào một binary tĩnh không phụ thuộc nào, cách kiểm thử xác định chứng minh 'khớp từng pixel', và triết lý thiết kế đằng sau mức tăng tốc trung vị 27.5×, kèm hướng dẫn chi tiết"
tags:
  - ttfx
  - TerminalTextEffects
  - Rust
  - CLI
  - Terminal
  - Hiệu ứng đầu cuối
  - Công cụ dòng lệnh
  - Tối ưu hiệu năng
categories:
  - Công cụ phát triển
  - Công cụ dòng lệnh
  - Rust
  - Terminal
  - Mã nguồn mở
---

# ttfx: Biên dịch hiệu ứng văn bản đầu cuối thành một binary tĩnh 3.3MB duy nhất bằng Rust

## Bối cảnh và tổng quan dự án

Nếu bạn từng chạy `fortune`, `cowsay`, hoặc dùng `neofetch` để khoe thông tin hệ thống, bạn chắc đã cảm nhận được khát khao "một chút phép màu" của thế giới dòng lệnh. Và [TerminalTextEffects](https://github.com/ChrisBuilds/terminaltexteffects) (gọi tắt là TTE) của ChrisBuilds đẩy phép màu đó lên đến cực hạn — nó khiến văn bản của bạn **giải mã, cháy, nổ tung, hóa mưa sao băng** ngay trong terminal, với 37 hiệu ứng, tất cả đều mã nguồn mở.

Nhưng TTE có một "nỗi niềm hạnh phúc": nó là một gói Python. Là một thư viện thì đó là lựa chọn hoàn toàn đúng, nhưng với một món đồ chơi sống trong pipeline của shell, Python đồng nghĩa với trình thông dịch, bước cài đặt, và **khoảng 65ms import trước khung hình đầu tiên**.

**ttfx** chính là câu trả lời cho vấn đề đó: một bản port Rust, biên dịch toàn bộ 37 hiệu ứng, động cơ hoạt hình và giao diện dòng lệnh của TTE thành **một binary tĩnh duy nhất, không phụ thuộc runtime nào** — khởi động chỉ trong **0.5ms**, dung lượng khoảng **3.3MB**.

> ttfx: Terminal text effects as a single static binary. Pipe text in, pick an effect:
>
> ```sh
> ls -la | ttfx decrypt
> cat banner.txt | ttfx beams
> fortune | ttfx --random-effect
> git log --oneline -10 | ttfx matrix
> ```

Đây không phải một bản port "viết lại bằng Rust" thông thường. Tham vọng của ttfx là **khớp từng byte (parity-exact)**: với cùng đầu vào, cùng cấu hình và cùng chuỗi số ngẫu nhiên, mọi khung hình nó tạo ra đều **giống hệt từng byte** so với bản gốc Python — và sự khớp này không phải do nhìn bằng mắt, mà được chứng minh bằng kiểm chứng cơ giới hóa trong CI. Bản thân dự án này chính là một cuốn giáo trình về "cách port một dự án một cách nghiêm túc".

## Tổng quan dự án

| Khía cạnh | Chi tiết |
|-----------|---------|
| **Tên dự án** | ttfx (`ttx` đã bị fonttools chiếm, nên đặt là `ttfx`) |
| **Tác giả/Tổ chức** | omacom-io (sinh ra cho bản phân phối Omarchy) |
| **Định vị** | Bản port parity-exact của TerminalTextEffects |
| **Ngôn ngữ** | Rust (edition 2021), quy mô tương đương ~22k dòng Python |
| **Phụ thuộc** | Chỉ 3: clap / clap_complete / terminal_size |
| **Sản phẩm** | Một binary tĩnh duy nhất (musl static linking, ~3.3MB), không phụ thuộc runtime |
| **Số hiệu ứng** | 37, khớp hoàn toàn với upstream |
| **Giấy phép** | MIT (đồng thời giữ bản quyền gốc của TTE) |
| **Nền tảng mục tiêu** | Linux và macOS (ban đầu chỉ dành cho Omarchy/Arch) |
| **Phiên bản upstream** | Cố định tại TTE v0.15.0 (commit `7a91dd9`) |
| **Cách kiểm chứng** | So sánh byte CI cơ giới hóa + kiểm thử hành vi + golden unit |

## Triết lý thiết kế cốt lõi

### Vinh dự thuộc về tác giả gốc: Port không thêm thắt gì

Câu đầu tiên trong README của dự án là "Credit where it's due" (Vinh dự thuộc về người xứng đáng):

> **Đây là bản port của TerminalTextEffects của ChrisBuilds.** Mọi hiệu ứng, động cơ hoạt hình và giao diện dòng lệnh đều là thiết kế của họ — dự án này chỉ dịch công việc đó sang Rust và **không thêm bất kỳ thứ gì của riêng mình vào nghệ thuật này**. Nếu bạn thích những gì thấy ở đây, hãy star bản gốc.

Sự khiêm tốn này không phải khách sáo, mà là một nguyên tắc cứng rắn. Ngay cả ý tưởng hiệu ứng mới cũng được chỉ dẫn rõ ràng về upstream: "Please file *effect* ideas upstream, where they belong." — Dự án port không làm product manager, chỉ làm người dịch.

### Parity Port: Khớp từng byte, không phải "giống về tinh thần"

Hầu hết các dự án port lấy tiêu chuẩn nghiệm thu là "chức năng tương đương, nhìn na ná". Tiêu chuẩn của ttfx khắt khe hơn một bậc độ lớn:

> Đây là *parity port* (port tương đương), không phải reimplementation-in-spirit (tái hiện theo tinh thần). Với cùng đầu vào, cấu hình và số ngẫu nhiên, ttfx tạo ra **các khung hình giống hệt từng byte** với bản gốc Python — được kiểm chứng cơ giới hóa trong CI dựa trên bản checkout upstream cố định (v0.15.0), không phải bằng mắt thường.

Hệ thống kiểm chứng này gồm 6 bộ kiểm thử:

| Bộ kiểm thử | Số check | Chứng minh điều gì |
|------|--------|---------|
| `tools/parity/run_suite.sh` | 354 | luồng khung hình của mọi hiệu ứng, từng byte, qua nhiều cấu hình và seed |
| `tools/parity/tty_compare.sh` | 41 | toàn bộ luồng byte đầu cuối — chuẩn bị canvas, di chuyển con trỏ, thu dọn |
| `tools/tests/cli_corpus.sh` | 19 | mã thoát và định tuyến stdout/stderr |
| `tools/tests/*_behavior.py` | pty | chỉ terminal thật mới lộ ra: khởi động lại khi resize, thu dọn khi tín hiệu |
| `cargo test` | goldens + traces | giá trị easing/hình học/gradient và state machine của engine |

`./bin/test` chạy tất cả chỉ với một lệnh — và đó **chính là** toàn bộ những gì CI làm.

### Cố tình tái hiện những "quirk", không phải "sửa" chúng

Đây là quyết định thiết kế phản trực giác và sâu sắc nhất của toàn dự án. Để đầu ra khớp từng byte, ttfx phải **cố tình giữ lại** một loạt "bug" của bản gốc Python:

- **Banker's rounding của Python** (round-half-even): `f64::round` của Rust làm tròn ra xa số 0; hai bên hành xử khác nhau tại biên `.5`, phải tái hiện;
- **Gradient dùng phép chia nguyên lấy phần nguyên (floor division) thay vì nội suy float**: `(end - start) // steps` — với độ tăng âm, `//` của Python làm tròn xuống, còn `/` của Rust cắt về 0 — phải tái hiện;
- **Xấp xỉ độ dài cung bézier bỏ mất đoạn cuối**: bug vòng lặp 10 mẫu của upstream khiến chiều dài đường đi ngắn đi một cách hệ thống, `max_steps` phụ thuộc vào nó — **tái hiện cả bug**;
- **Các scene lặp tự báo mình hoàn thành mỗi tick**: hiệu ứng dựa vào quirk này để kết thúc đúng cách.

Tất cả những cái bẫy này được ghi lại trong danh sách "fidelity traps" của `plan.md` (tổng cộng 20 mục), còn những nơi Python lặp không theo thứ tự cần phải cố định thì nằm trong `docs/ordering-inventory.md`.

**Chỉ có hai khác biệt chủ động được chấp nhận**: một là bộ sinh số ngẫu nhiên (ttfx dùng xoshiro256++, không tương thích với Mersenne Twister của CPython, nên `--seed` tái lập được *trong* ttfx nhưng không tương thích với Python); hai là không hỗ trợ hiệu ứng plugin Python (vì không có trình thông dịch để nạp chúng).

### Chép lại chứ không tưởng tượng lại (Transcription, not reimagination)

Bản thân chiến lược port cũng là một triết lý:

> Mỗi file Python ánh xạ sang một file Rust; hàm giữ nguyên tên và cấu trúc bên trong; mọi chỗ tinh vi đều có comment tham chiếu số dòng của upstream. Hai tài liệu khảo sát (kiến trúc engine + danh mục hiệu ứng) là bản đồ, bản checkout cố định là văn bản gốc.

Dịch chứ không cải biên, ánh xạ từng dòng chứ không "tiện tay tối ưu" — phần thưởng trực tiếp là: **chỉ cần chép trung thực, thứ tự gọi RNG sẽ tự khớp**, và đó chính là tiền đề của việc so sánh từng byte. Bất kỳ ý nghĩ "chỗ này mình viết hay hơn được" nào cũng phá vỡ tính tương đương.

### Triết lý binary tĩnh đơn lẻ

Vì sao làm đến mức này cho một món đồ chơi đầu cuối? Vì "ở trong pipeline" và "là một thư viện" là hai thế giới hoàn toàn khác nhau:

```
Python TTE (là thư viện):       ttfx (là đồ chơi pipeline):
  trình thông dịch python3   →   một file binary
  pip install                →   tải về là chạy
  ~65ms import               →   0.5ms khởi động
  cả đống phụ thuộc runtime  →   không phụ thuộc runtime
```

> TTE là một gói Python. Là thư viện thì đó là lựa chọn đúng, nhưng với một món đồ chơi shell sống trong pipeline lời nhắc, nó đồng nghĩa với trình thông dịch, bước cài đặt, và ~65ms import trước khung hình đầu tiên. ttfx là một binary không phụ thuộc, khởi động trong nửa mili giây. **Khác biệt đó chính là toàn bộ lý do nó tồn tại.**

### Kiểm chứng xác định: khiến "khớp từng pixel" có thể kiểm tra được

Hiệu ứng là ngẫu nhiên, nên "diff từng khung hình" thất bại một cách tự nhiên. Giải pháp của ttfx là biến tính ngẫu nhiên thành **một phụ thuộc dùng chung có thể tiêm vào**:

1. **RNG shim xác định**: cùng một xoshiro256++ được cài trong cả Rust (`rng.rs`) lẫn Python (`tools/parity/shim.py`); khi kiểm thử, hai bên rút ra các chuỗi ngẫu nhiên giống hệt — với điều kiện bản port gọi RNG theo cùng thứ tự như Python, mà đó chính xác là điều việc chép trung thực đảm bảo;
2. **Patch xác định**: mọi vòng lặp không theo thứ tự (duyệt set, phụ thuộc thứ tự dict) được cố định về cùng một thứ tự chuẩn;
3. **Patch đồng hồ**: matrix và thunderstorm đọc đồng hồ thật; khi kiểm thử được thay bằng đồng hồ ảo (mỗi khung hình tiến `1/frame_rate`), khiến chúng xác định.

Phương pháp "nguồn ngẫu nhiên dùng chung + cố định thứ tự + đồng hồ ảo" này đáng để bất kỳ dự án kiểm thử xác định nào học hỏi.

## Giải mã kiến trúc kỹ thuật

### Arena + ID thay thế đồ thị đối tượng Python

Bên trong Python TTE là một mạng lưới tham chiếu chéo: ký tự ⇄ animation/motion/event handler, event giữ các đối tượng Scene/Path/Waypoint, giữa các ký tự còn có `links`/`neighbors`... Trong Rust, trình kiểm tra borrow sẽ hành hạ bạn. Câu trả lời của ttfx là **kiến trúc arena** kinh điển:

- Mọi `EffectCharacter` nằm trong `Vec` arena, được định địa chỉ bằng `CharacterId(u32)`;
- Scenes/Paths nằm trong các map theo từng ký tự, định địa chỉ bằng `SceneId`/`PathId`;
- `neighbors`/`links` chỉ lưu ID;
- Bảng event thoái hóa thành dữ liệu thuần: `HashMap<(Event, CallerId), Vec<(Action, Target)>>`.

**Không một `Rc<RefCell>` nào.** Đây không chỉ là cách sống còn trong Rust, mà còn khiến trạng thái có thể snapshot và so sánh được — một lợi ích bất ngờ cho kiểm thử.

### Phân phối event đồng bộ (không có hàng đợi trì hoãn)

Ngữ nghĩa của Python rất tinh tế: callback event **thực thi ngay tại điểm phát ra**, và có thể cháy ở *giữa* `Path.step` — ví dụ event segment cháy trước khi tọa độ được tính, và action `SET_COORDINATE` sau đó bị chính phép gán của move ghi đè. Nếu bản Rust dùng "hàng đợi trì hoãn" (drain sau khi tick), thì dù số ngẫu nhiên giống hệt vẫn sinh ra các khung hình khác nhau.

Kết luận: **không có hàng đợi trì hoãn.** Mọi hàm bước của engine đều là phương thức trên `EngineCtx` thao tác qua ID, gọi `handle_event` inline tại đúng điểm phát ra trong source, đệ quy theo chiều sâu giống hệt call stack của Python. Một ví dụ hoàn hảo về "kiến trúc bị ép về dạng đơn giản nhất vì yêu cầu khớp từng byte".

### Một Terminal duy nhất và thứ tự xác định

Python mỗi lần chạy dựng **hai** Terminal (một sở hữu tty, một sở hữu mô phỏng). ttfx gộp thành một `Terminal` + một `TtyWriter` mỏng (chuẩn bị canvas, kiểm soát frame rate, phục hồi con trỏ), với RAII `Drop` thay thế `@contextmanager` của Python.

**"Thứ tự chính là hành vi."** Python lặp các tập hợp không thứ tự ở nhiều nơi liên quan đến hành vi — không chỉ trong engine mà cả trong các hiệu ứng (middleout và unstable lặp tập hợp trực tiếp). Quy tắc của ttfx:

- bất cứ nơi nào Python lặp value/item của dict, Rust dùng `Vec` + tra ID hoặc map giữ thứ tự chèn;
- khi render, sắp xếp ký tự hiển thị theo `(layer, character_id)`;
- khi tick, snapshot `active_characters` và sắp theo `CharacterId`.

### Effect trait + registry tĩnh

```rust
pub trait Effect {
    fn build(&mut self, ctx: &mut EngineCtx);          // Python __init__/build()
    fn next_frame(&mut self, ctx: &mut EngineCtx) -> Option<String>;  // __next__
}
```

`effects/mod.rs` giữ một registry tĩnh (name → clap `Command` + constructor), thay thế cơ chế khám phá động `pkgutil` của Python. `--random-effect` / `--include-effects` / `--exclude-effects` / `--seed` đều hoạt động đúng như upstream, kể cả quirk: hiệu ứng được chọn ngẫu nhiên sẽ chạy với **cấu hình mặc định thuần túy**.

### RNG mang hình dáng Python

`rng.rs` cài một bộ phương thức mang hình dáng Python dựa trên xoshiro256++, khớp từng lời gọi mà TTE thực hiện (đã đếm trong khảo sát):

| Phương thức | Số lần gọi | Ngữ nghĩa (được cố định chính xác) |
|------|---------|-------------------|
| `randint(a, b)` | 61 | số nguyên khoảng đóng |
| `choice(&[T])` | 54 | `seq[randbelow(len)]` |
| `shuffle` | 13 | Fisher-Yates, theo thứ tự của Python |
| `randrange` | 13 | khoảng nửa mở |
| `uniform(a, b)` | 12 | `a + (b-a)*random()` |
| `random()` | 12 | [0, 1) |

RNG nằm trên `EngineCtx` và được truyền tường minh — **không có biến toàn cục** — đó chính xác là điều khiến harness parity khả thi.

### Tiêm đồng hồ

matrix (đọc `time.time()`) và thunderstorm (đọc `time.monotonic()`) phụ thuộc trực tiếp vào đồng hồ thật. Đồng hồ thật khiến parity phụ thuộc vào tốc độ thực thi: với `frame_rate=0`, bản cài nhanh hơn tạo ra nhiều khung hình hơn và tiêu tốn nhiều số ngẫu nhiên hơn trước hạn chót. Giải pháp là `EngineCtx` mang một trait `Clock`: bản production đọc thời gian thật, bản parity là ảo (mỗi khung hình tiến cố định `1/frame_rate`), còn shim Python monkeypatch `time.time`/`time.monotonic` bằng cùng đồng hồ ảo.

### pycompat: nơi giam giữ các bẫy fidelity

Mọi nơi mà "bản dịch tự nhiên" sẽ lặng lẽ lệch khỏi Python đều tập trung trong `pycompat.rs`, và mỗi helper đều có kiểm thử cố định vào giá trị golden do Python sinh ra:

- `round_half_even`: banker's rounding, dùng cho mọi lượng tử hóa tọa độ, `Path.max_steps`, chỉ số khung hình animation;
- `floor_div`: phép chia lấy phần nguyên, dùng cho độ tăng kênh gradient;
- `trunc`: phép cắt, dùng trong `shift_color_towards`.

Cộng với quy ước "nhân đôi hàng" được tái hiện trung thực trong `geometry.rs` (tỷ lệ ô), bảng 256 màu khớp gần nhất chép nguyên văn trong `hexterm.rs`, và "trình giả lập terminal mini" trong `input.rs` (một bộ phân tích ANSI chỉ CSI)… những chi tiết này chất chồng lại mới tạo nên sự đáng tin của "khớp từng byte".

## Dữ liệu hiệu năng: vì sao đáng để port

Trên canvas đầu cuối 200×50, tắt pacing (đo throughput thay vì `sleep()`), render trọn một animation:

| 200×50 ô | Số khung hình | ttfx | Python TTE | ttfx fps |
|-------------|------|------|-----------|----------|
| slide | 375 | 76 ms | 2,203 ms | 4,930 |
| beams | 732 | 181 ms | 5,564 ms | 4,050 |
| rings | 1,566 | 521 ms | 10,439 ms | 3,004 |
| waves | 633 | 374 ms | 8,745 ms | 1,693 |
| khởi động | — | 0.5 ms | 64 ms | — |

**Kết luận**: trong 35 hiệu ứng không bị giới hạn bởi thời gian treo tường, mức tăng tốc trung vị là **27.5×** (khoảng 17.1×–47.4×). Chỉ hai hiệu ứng bị "cổng thời gian" là ngoại lệ — `matrix` và `thunderstorm` dành phần lớn thời gian chạy trong một khoảng thời gian animation cố định mà không một bản cài nào rút ngắn được, nên chúng chỉ đạt 1.9× và 1.3×; thứ ttfx mua được trong khoảng đó là **frame rate cao hơn hẳn**, chứ không phải thời gian ngắn hơn.

Thú vị ở chỗ triết lý hiệu năng rất kiềm chế: plan.md viết rõ "Performance target: not a goal beyond 'never the bottleneck'" (Hiệu năng không phải mục tiêu, chỉ cần không thành nút thắt cổ chai). Các thuật toán O(n²) của upstream (sắp xếp outside-in, quét nhóm) được **giữ nguyên vì fidelity**, bởi chúng hoàn toàn vô hại ở quy mô terminal. Hiệu năng là kết quả tự nhiên của kiến trúc đúng đắn, chứ không phải mục tiêu tự thân.

## Toàn cảnh 37 hiệu ứng

Tất cả hiệu ứng đều tác động lên cùng một đầu vào (logo Omarchy); mọi khung hình đều đến từ binary Rust và giống hệt từng byte so với bản gốc Python:

| Hiệu ứng | Mô tả một dòng |
|------|-----------|
| **beams** | Chùm tia quét qua canvas, chiếu sáng các ký tự phía sau |
| **binarypath** | Biểu diễn nhị phân của từng ký tự di chuyển về tọa độ nhà của nó |
| **blackhole** | Ký tự bị hố đen nuốt chửng rồi nổ tung ra ngoài |
| **bouncyballs** | Ký tự trở thành bóng nảy rơi từ đỉnh canvas |
| **bubbles** | Ký tự tạo thành bong bóng trôi xuống rồi vỡ |
| **burn** | Cháy theo chiều dọc trong canvas |
| **colorshift** | Hiển thị gradient đổi màu chạy khắp terminal |
| **crumble** | Ký tự mất màu, vỡ thành bụi, bị hút đi rồi tái tạo |
| **decrypt** | Hiệu ứng giải mã kiểu phim điện ảnh |
| **errorcorrect** | Một số ký tự bắt đầu ở vị trí sai và được sửa theo trình tự |
| **expand** | Mở rộng văn bản từ một điểm duy nhất |
| **fireworks** | Ký tự phóng lên nổ như pháo hoa rồi rơi vào vị trí |
| **highlight** | Một vệt sáng lướt qua văn bản |
| **laseretch** | Tia laser khắc ký tự lên terminal |
| **matrix** | Mưa số kỹ thuật số kiểu Ma trận |
| **middleout** | Văn bản mở rộng từ một hàng/cột giữa canvas rồi ra ngoài |
| **orbittingvolley** | Bốn bệ phóng quay quanh canvas, bắn loạt ký tự vào trong để dựng văn bản từ tâm ra |
| **overflow** | Văn bản đầu vào tràn và cuộn theo thứ tự ngẫu nhiên cho đến khi có trật tự |
| **pour** | Đổ các ký tự vào vị trí từ hướng đã cho |
| **print** | In từng dòng theo một đầu in, thực hiện xuống dòng và về đầu dòng |
| **rain** | Ký tự mưa từ đỉnh canvas |
| **randomsequence** | In dữ liệu đầu vào theo trình tự ngẫu nhiên |
| **rings** | Ký tự tản ra rồi tạo thành các vòng xoay |
| **scattered** | Văn bản rải khắp canvas rồi di chuyển vào vị trí |
| **slice** | Cắt đầu vào làm đôi và trượt vào vị trí từ hai hướng ngược nhau |
| **slide** | Trượt ký tự vào tầm nhìn từ bên ngoài terminal |
| **smoke** | Khói tràn ngập canvas, tô màu mọi ký tự nó đi qua |
| **spotlights** | Đèn rọi quét vùng văn bản, chiếu sáng ký tự, rồi hội tụ ở tâm và mở rộng |
| **spray** | Vẽ các ký tự phun ra với tốc độ khác nhau từ một điểm |
| **swarm** | Ký tự tụ thành bầy di chuyển quanh terminal rồi vào vị trí |
| **sweep** | Quét ngang canvas để lộ văn bản không màu, quét ngược để tô màu |
| **synthgrid** | Một lưới đầy ký tự hòa tan thành văn bản cuối cùng |
| **thunderstorm** | Tạo một cơn giông bão trong terminal |
| **unstable** | Sinh các ký tự lộn xộn, nổ ra mép canvas, rồi ráp lại đúng bố cục |
| **vhstape** | Các dòng ký tự giật trái phải và mất chi tiết như băng VHS cũ |
| **waves** | Sóng chạy ngang terminal để lại các ký tự phía sau |
| **wipe** | Lau văn bản ngang terminal để lộ các ký tự |

Mỗi hiệu ứng có option riêng — xem bằng `ttfx <effect> --help`. Vài GIF trong README rút ngắn pha thời gian để vòng lặp dễ xem (ví dụ `matrix --rain-time 3`); còn lại đều là cấu hình mặc định.

## Hướng dẫn chi tiết từng bước

### 1. Build

Build ttfx cực kỳ đơn giản, chỉ cần toolchain Rust:

```sh
# Build release thông thường (liên kết libc/libm/libgcc của hệ thống)
cargo build --release

# Build musl tĩnh hoàn toàn (~3.3MB, không phụ thuộc động)
cargo build --release --target x86_64-unknown-linux-musl
```

Chạy toàn bộ test suite:

```sh
./bin/test        # tất cả 6 bộ (cần python3)
```

Bộ parity cần một bản sao upstream, tự clone tại commit cố định trong lần chạy đầu (`./tools/parity/fetch_reference.sh` có thể chạy tay). Upstream **không** được vendor vào repo — "vì đó là code của họ".

### 2. Cách dùng cơ bản

```
<nhà sản xuất> | ttfx [terminal options] <hiệu ứng> [effect options]
```

Bốn ví dụ dùng ngay được:

```sh
ls -la | ttfx decrypt            # danh sách thư mục trình diễn giải mã
cat banner.txt | ttfx beams      # banner được chùm tia chiếu sáng
fortune | ttfx --random-effect   # bất ngờ (lọc bằng --include-effects/--exclude-effects)
git log --oneline -10 | ttfx matrix   # git log thành mưa số
```

### 3. Terminal options vs Effect options

Đây là cái bẫy dễ dẫm; quy tắc đơn giản:

- **Terminal options đứng trước tên hiệu ứng**: kích thước và neo canvas, xử lý màu, frame rate, ngắt dòng văn bản;
- **Effect options đứng sau tên hiệu ứng**: tham số riêng của từng hiệu ứng.

```sh
ttfx --help                 # tất cả 37 hiệu ứng + terminal options
ttfx <effect> --help        # option của một hiệu ứng
ttfx --print-completion bash|zsh   # sinh shell completions
```

**Tên option và mặc định khớp hoàn toàn với `tte`** — nên các lời gọi `tte` hiện có (ví dụ `ls | tte decrypt --typing-speed 2`) chỉ cần đổi tên binary là chạy được. Đó là phần thưởng trực tiếp của mục tiêu tương thích CLI.

### 4. Ví dụ terminal options

```sh
# Cố định kích thước canvas và bỏ qua kích thước terminal thật (hay dùng trong script/test)
ttfx --canvas-width 80 --canvas-height 24 --ignore-terminal-dimensions beams

# Điều chỉnh frame rate
ttfx --frame-rate 30 slide

# Tái sử dụng canvas (không cuộn để chừa chỗ)
ttfx --reuse-canvas decrypt
```

### 5. Chi tiết hành vi

- **Đầu vào**: stdin (rỗng khi là tty), `--input-file`; đầu vào rỗng/khoảng trắng → stdout xuất `NO INPUT.`, mã thoát 1;
- **Mã thoát**: 0 thành công; 1 lỗi runtime — không đầu vào, hiệu ứng không tồn tại, lỗi file (thông báo ra *stdout*); chuỗi ANSI không hỗ trợ (thông báo ra *stderr* — đúng vậy, bất đối xứng thật); 2 lỗi cách dùng (phân tích tham số, theo quy ước argparse/clap);
- **Tín hiệu**: SIGINT được ghi nhận qua flag/self-pipe và *trả quyền điều khiển về vòng lặp chính*, vòng lặp tự tháo gỡ bình thường để RAII teardown chạy (`Drop` đơn lẻ không kích hoạt khi có tín hiệu); mã thoát 1, không thông báo (khớp với cách xử lý KeyboardInterrupt);
- **Giải mã**: UTF-8 nghiêm ngặt, không giải mã mất dữ liệu;
- **Phạm vi**: Linux và macOS. Các bộ parity khớp từng byte được neo vào Linux/glibc — libm của Apple làm tròn vài hàm siêu việt khác đi một ulp cuối, lượng tử hóa che được trong khung hình thật, nhưng so sánh mức bit sẽ lộ ra.

## Hệ thống kiểm chứng fidelity: một "khớp từng byte" có thể kiểm tra

Hệ thống này là phương pháp luận đáng học nhất của dự án, tóm gọn ba lớp:

**Lớp 1: Nguồn ngẫu nhiên dùng chung.** Một xoshiro256++ dễ port được cài một bản trong Rust và một bản trong shim Python. Shim monkeypatch `random.randint/choice/shuffle/randrange/uniform/random` trước khi import TTE. Hai bên giờ rút ra các chuỗi ngẫu nhiên giống hệt — với điều kiện thứ tự gọi RNG khớp nhau, mà đó chính xác là điều chép trung thực đảm bảo và harness kiểm chứng.

**Lớp 2: Cố định thứ tự.** Shim cũng vá mọi điểm lặp không theo thứ tự trong danh mục §4.3 của plan.md (`BaseEffectIterator.update`, hòa thứ tự lớp khi render, vòng lặp tập hợp cấp hiệu ứng trong middleout/unstable, duyệt tập links của `BreadthFirst`) về cùng thứ tự chuẩn với bản Rust.

**Lớp 3: Chống lại việc "chứng minh parity bằng một TTE đã bị sửa".** Vì shim sửa đổi bản tham chiếu, dự án đặt riêng một lớp kiểm toán: mọi hiệu ứng xác định (không RNG, không đồng hồ) và toàn bộ ma trận tiền xử lý M0 **còn** được so byte với một lần chạy CPython cố định hoàn toàn chưa sửa; các patch của shim bị giới hạn về mặt cấu trúc chỉ còn thay thế thứ tự/RNG/đồng hồ (diff nhỏ, được xem xét, và được commit cùng harness).

**Chụp khung hình**: phía Python lặp hiệu ứng với `frame_rate=0` + canvas cố định, ghi mỗi chuỗi khung hình vào một bản dump có tiền tố độ dài; phía Rust làm tương tự qua cờ ẩn `--parity-dump <seed>`; một bộ so sánh đối chiếu hai luồng và báo khung hình/hàng/cột phân kỳ đầu tiên kèm chế độ xem escape đã giải mã.

**Ma trận kiểm thử**: mỗi hiệu ứng 2–3 văn bản đầu vào (ASCII nhiều dòng, đầu vào ANSI có màu, đầu vào ngắn lởm chởm) × cấu hình mặc định × 1–2 cấu hình không mặc định thử các option của hiệu ứng đó; cộng bộ ma trận option cho tiền xử lý M0. Kiểm thử luồng byte PTY bỏ qua dump khung hình, so trực tiếp **toàn bộ luồng đầu ra** của hai bản cài dưới pseudo-terminal: chuẩn bị canvas, DEC save/restore, thu dọn — kể cả các biến thể `--reuse-canvas`/`--no-eol`/`--no-restore-cursor` và đường SIGINT.

Phòng khi thứ tự xen kẽ RNG của một hiệu ứng không thể khớp được (hiện tại là con số 0), có phương án dự phòng tier-2: so khung hình cấu trúc + ký duyệt trực quan bằng mắt với bản ghi song song. Mục tiêu: **zero hiệu ứng tier-2**.

## Tổng kết: những quan điểm chính

### Quan điểm 1: Chọn ngôn ngữ theo "môi trường sống", không theo "thân phận thư viện"

TTE viết bằng Python, là thư viện thì hoàn toàn đúng; nhưng khi cùng một công cụ sống trong shell pipeline, 65ms import và phụ thuộc trình thông dịch trở thành điểm yếu thật. **Cùng một phần mềm, ở các môi trường chủ khác nhau, cần các hình thái phân phối khác nhau.** ttfx không "viết lại để cải tiến thuật toán", chỉ đổi sang một vật chuyên chở phù hợp hơn với môi trường chủ, là có ngay 27.5× tăng tốc trung vị và 0.5ms khởi động.

### Quan điểm 2: "Khớp từng pixel" có thể chứng minh bằng máy

Hầu hết dự án port nghiệm thu bằng mắt người. ttfx chứng minh: chỉ cần **biến tính ngẫu nhiên thành phụ thuộc tiêm vào** (PRNG dùng chung), **cố định thứ tự thành dạng chuẩn** (sắp xếp/thứ tự chèn), và **ảo hóa thời gian** (đồng hồ ảo), thì "khớp từng byte" từ khẩu hiệu biến thành 354 check tự động trong CI. Tính xác định là nền móng của kiểm thử.

### Quan điểm 3: Đỉnh cao của một bản port là sự kiềm chế

Đối mặt với 20 "bug" của upstream, ttfx chọn **tái hiện thay vì sửa** — vì sửa sẽ phá vỡ tính tương đương, mà tính tương đương là toàn bộ giá trị của dự án. Nó còn coi "danh sách khác biệt được phép" (§5 deliberate divergences) là phạm vi thay đổi hợp pháp duy nhất, và liệt "lan rộng phạm vi vào việc 'cải tiến' TTE" thành một rủi ro có biện pháp giảm thiểu. **Trong một bản port, trung thực hiếm hơn thông minh.**

### Quan điểm 4: Hiệu năng là kết quả của kiến trúc đúng đắn, không phải mục tiêu

Phát biểu phản trực giác "hiệu năng không phải mục tiêu, chỉ cần không thành nút thắt" trong plan.md rất sâu: kiến trúc arena, event đồng bộ, truyền RNG tường minh — những thiết kế vì *tính tương đương* — tình cờ tạo ra 27.5× tăng tốc. Thuật toán O(n²) được giữ nguyên vì vô hại ở quy mô terminal. **Đúng trước, nhanh sau; nhanh là sản phẩm phụ của đúng.**

### Quan điểm 5: Binary đơn lẻ tôn trọng hốc sinh thái "đồ chơi pipeline"

Cách dùng `<producer> | ttfx <effect>` đòi hỏi chi phí khởi động cực thấp và cài đặt không ma sát. Binary tĩnh 3.3MB, không phụ thuộc runtime, `--print-completion` sinh completions — mọi quyết định đều phục vụ hốc sinh thái "sống trong pipeline". Nó còn giải quyết luôn bài toán phân phối: tải về là chạy, không có địa ngục phiên bản Python.

### Quan điểm 6: Phép lịch sự của hệ sinh thái mã nguồn mở

"Ý tưởng hiệu ứng hãy đề xuất lên upstream", code upstream không vendor ("vì đó là code của họ"), giấy phép MIT giữ bản quyền tác giả gốc, NOTICE ghi lời cảm ơn đầy đủ — **một bản port nên sống chung với upstream thế nào**, ttfx đã cho câu trả lời kiểu giáo trình.

## Phân tích trường hợp sử dụng

### Khi nào ttfx tỏa sáng

✅ **Cực kỳ khuyến nghị:**

- **Người dùng Omarchy**: dự án sinh ra cho Omarchy, dùng ngay được;
- **Người dùng shell nặng ký**: biến đầu ra của `git log`, `ls`, `fortune` thành màn trình diễn thị giác với chi phí bằng không;
- **Demo và quay màn hình**: demo terminal cần "cảm giác điện ảnh", 37 hiệu ứng cắm là chạy;
- **Môi trường CI/script**: 0.5ms khởi động + binary tĩnh, chạy được cả trong container;
- **Nhà phát triển coi trọng tính xác định**: `--seed` khiến hiệu ứng tái lập được, tuyệt cho kiểm thử và ảnh chụp tutorial;
- **Người học Rust**: bản thân `plan.md` là một tài liệu kỹ thuật xuất sắc về "cách làm một bản parity port".

⚠️ **Cần cân nhắc:**

- **Người cần hiệu ứng plugin Python**: ttfx không hỗ trợ cơ chế plugin của TTE (không có trình thông dịch);
- **Người cần `--seed` tương tác với bản Python**: thuật toán RNG khác nhau, không tái lập chéo giữa hai bản cài;
- **Nền tảng ngoài Linux/macOS**: Windows nằm ngoài phạm vi.

### Điều nó cố tình không giải quyết

- Không phải bản thay thế TTE (dùng thư viện thì cứ dùng bản Python);
- Không theo đuổi "cải tiến" hiệu ứng (ý tưởng đề xuất lên upstream);
- Không xử lý ký tự rộng (một codepoint = một ô, khớp TTE, ghi nhận là hạn chế đã biết).

## Mối duyên với Omarchy

ttfx ban đầu **chỉ** sinh ra cho Omarchy — plan.md viết "Linux only, targeted exclusively at Omarchy (Arch)". Hai bên là một cặp: Omarchy cung cấp desktop Linux hiện đại, đẹp, có chính kiến; ttfx cung cấp cho desktop đó màn trình diễn terminal cũng đầy chính kiến không kém. Sau này phạm vi hỗ trợ mở rộng sang macOS, nhưng huyết thống rất rõ: đây là công cụ lớn lên từ hốc sinh thái "mài giũa đến hoàn hảo cho một bản phân phối cụ thể", chứ không phải dự án đại trà cố làm hài lòng tất cả. Thái độ "làm tốt nhất cho một nhóm người dùng cụ thể" này cùng chung nguồn gốc với triết lý của Omarchy.

## Kết luận

Bề ngoài ttfx là một món đồ chơi terminal; bên trong, nó là một **bản tuyên ngôn của kỹ thuật port**. Nó minh họa ba điều hiếm có:

1. **Nghiêm túc nghĩa là gì** — không phải "khớp chức năng", mà là "khớp từng byte", và chứng minh bằng kiểm thử cơ giới hóa;
2. **Kiềm chế nghĩa là gì** — tái hiện 20 quirk của upstream, liệt "cải tiến" vào rủi ro, tuyên bố rõ "port không thêm thắt";
3. **Quan niệm hiệu năng đúng đắn nghĩa là gì** — kiến trúc thiết kế vì tính tương đương tình cờ mang lại 27.5× tăng tốc, còn bản thân hiệu năng chưa bao giờ bị coi là mục tiêu.

Nếu bạn làm việc trong terminal, thích một chút phép màu thị giác, hoặc đang nghĩ về "cách port một dự án lớn từ ngôn ngữ này sang ngôn ngữ khác", thì README, plan.md và 37 GIF hiệu ứng của ttfx đáng giá một buổi chiều của bạn. Khoảnh khắc bạn chạy nó, `ls -la | ttfx decrypt` sẽ nói với bạn: **0.5ms khởi động, đổi lấy một buổi diễn mà mọi khung hình đều đáng chờ.**

---

**Tài liệu tham khảo:**

- [Kho lưu trữ GitHub ttfx](https://github.com/omacom-io/ttfx)
- [TerminalTextEffects (bản gốc upstream, của ChrisBuilds)](https://github.com/ChrisBuilds/terminaltexteffects)
- [Omarchy (nơi ttfx ra đời)](https://omarchy.org)