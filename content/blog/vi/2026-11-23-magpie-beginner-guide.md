---
title: "magpie 40000 sao: đừng cấu hình API Key từng công cụ một nữa, cổng kết nối này đưa mọi mô hình vào mọi công cụ AI"
date: "2026-11-23"
description: "magpie gom API Key, gói đăng nhập và mô hình cục bộ thành một danh sách, ghi vào mọi công cụ AI, chạy cổng kết nối chung. Hướng dẫn từ A đến Z."
author: "瑞哥观势"
tags:
  - phân tích dự án mã nguồn mở
  - công cụ AI
  - cổng kết nối mô hình
  - tiết kiệm chi phí
  - hướng dẫn
categories:
  - AI应用
keywords:
  - magpie
  - công cụ AI
  - cổng kết nối mô hình
  - API Key
  - nhóm định tuyến
  - che giấu riêng tư
  - tiết kiệm chi phí
source:
  original:
    name: "瑞哥观势"
    url: "https://mp.weixin.qq.com/s/xxxxx"
---

# magpie 40000 sao: đừng cấu hình API Key từng công cụ một nữa, cổng kết nối này đưa mọi mô hình vào mọi công cụ AI

**Kết luận đi trước:** magpie là một điểm vào thống nhất được xây dựng cho người dùng nhiều công cụ AI. Bản thân nó không cung cấp mô hình, nó làm ba việc: gom các nguồn mô hình bạn đang có (API Key, gói đăng nhập sẵn, mô hình cục bộ) vào một danh sách; ghi các mô hình trong danh sách vào cấu hình của bất kỳ công cụ lập trình AI nào chỉ với một cú nhấp; rồi chạy một cổng kết nối cục bộ trên máy bạn, để mô hình của các hãng khác nhau có thể được mọi công cụ gọi tới.

**Giá trị của nó không nằm ở "mạnh hơn", mà nằm ở "tiết kiệm tiền + tiết kiệm công sức + không còn bị một hãng duy nhất khóa"**. Bạn có ba gói đăng ký, năm API Key, trước đây phải viết năm bộ cấu hình và ghi nhớ năm base URL; sau khi cài magpie, chúng trở thành một danh sách duy nhất, cái nào nhanh thì dùng cái nào, cái nào rẻ thì dùng cái nào.

**Bài viết này là hướng dẫn từ A đến Z dành cho ông chủ hoàn toàn mới.** Không cần biết viết code, chỉ cần biết sao chép dán lệnh và biết bấm chuột.

---

**Một, Trước tiên hãy làm rõ: magpie thực sự giúp bạn làm những việc gì**

Trước khi bắt tay vào, bạn cần hiểu ba từ. Hiểu ba từ này là hiểu trọn bài.

**① Agent (công cụ)**: chính là phần mềm bạn dùng hằng ngày để trò chuyện và làm việc với AI. Claude Code, Codex, Gemini CLI, OpenCode, Cursor CLI, Cline, OpenClaw, Windsurf, khung Chat trong trình soạn thảo Cursor, hàng chục loại. Mỗi Agent vốn chỉ nhận ra bộ cấu hình riêng của nó.

**② Provider (nguồn mô hình)**: mô hình đến từ đâu. Có ba hình thức:

- **API Key**: khóa giao diện mà bạn nạp tiền trên trang chính thức của DeepSeek, Kimi, Zhipu, MiniMax, OpenAI, Anthropic, một chuỗi ký tự bắt đầu bằng `sk-`;
- **Gói đăng ký**: các tài khoản Claude Pro/Max, ChatGPT Plus/Pro, GitHub Copilot mà bạn đã đăng nhập trong Claude Code. magpie đọc được các tài khoản đã đăng nhập ngay trên máy bạn và chia sẻ trực tiếp mô hình của chúng cho các công cụ khác;
- **Mô hình cục bộ**: mô hình do Ollama, LM Studio chạy trên máy bạn, không cần key.

**③ Gateway (cổng kết nối)**: một dịch vụ cục bộ mà magpie mở trên máy bạn, địa chỉ là `127.0.0.1:3425`. Tất cả Agent được đổi để trỏ về đó, rồi nó chuyển tiếp yêu cầu tới đúng hãng thực sự cung cấp mô hình, tiện thể dịch qua lại giữa định dạng OpenAI, Anthropic, Gemini. **Bạn không cần hiểu chi tiết kỹ thuật, bạn chỉ cần biết: từ giờ mọi công cụ chỉ còn một lối ra duy nhất.**

**Trước khi cài, trạng thái hiện tại của bạn là như sau:**

```
Claude Code  →  Anthropic chinh thuc  →  goi Claude cua ban
Codex        →  OpenAI chinh thuc     →  goi ChatGPT cua ban
Cline        →  DeepSeek chinh thuc   →  mot khoa DeepSeek
OpenClaw     →  Kimi chinh thuc       →  mot khoa Kimi
```

**Sau khi cài:**

```
Claude Code ─┐
Codex       ─┼→  magpie cong ket noi cuc bo  →  { Anthropic, OpenAI, DeepSeek, Kimi, ... }
Cline       ─┤
OpenClaw    ─┘
```

**Lợi ích cốt lõi: đổi mô hình không phải sửa tệp cấu hình, sửa một lần là toàn bộ có hiệu lực; hết hạn mức ở một hãng thì tự động chuyển sang hãng tiếp theo, không để công cụ AI báo lỗi trước mặt ông chủ.**

---

**Hai, Kiểm tra trước khi bắt đầu (5 phút)**

Trước khi cài, hãy xác nhận ba điều.

**Việc thứ 1: Hệ điều hành của bạn là gì.**
macOS (loại có biểu tượng trên thanh menu), Windows (khay ở góc phải dưới), Linux (bản desktop hoặc bản thuần terminal). Không chắc cũng không sao, hướng dẫn có đủ cả ba.

**Việc thứ 2: Bạn có ít nhất một nguồn mô hình.**
Có gói đăng ký (Claude / ChatGPT / Copilot, một trong ba là được) thì tốt nhất; nếu chưa có, đi mở một API Key ở trang chính thức của DeepSeek hoặc Kimi cũng được, thanh toán trong nước thuận lợi, chỉ vài chục nghìn là chạy được. **Lưu ý: bản thân magpie miễn phí và mã nguồn mở, nhưng nó không tặng mô hình.** Không có nguồn mô hình thì giống như mua router mà không lắp internet.

**Việc thứ 3: Bạn đã cài ít nhất một công cụ AI.**
Nếu bạn chưa cài công cụ lập trình AI nào, trang Agents của magpie sẽ trống. Nên cài trước một Claude Code hoặc Cursor, rồi quay lại.

**Danh sách kiểm tra trong một dòng:**
- [ ] Đã cài ít nhất một công cụ AI và trò chuyện bình thường
- [ ] Có sẵn một API Key hoặc một tài khoản đăng ký
- [ ] Biết hệ thống của mình là Mac / Windows / Linux

---

**Ba, Bước một: cài đặt**

**3.1 Cách ít rắc rối nhất (người mới nên dùng cách này)**

Mở trình duyệt, truy cập `usemagpie.ai`, tải gói cài đặt tương ứng với hệ thống của bạn, nhấp đúp để cài. Gói cho Mac đã được ký và đã qua chứng thực của Apple; gói cho Windows và Linux cũng có bằng chứng truy vết bản dựng từ GitHub Actions.

**Vì sao nên dùng cách này?** Vì nó tránh được mọi lỗi có thể xảy ra trong terminal. Nếu bạn muốn xác minh tệp tải về đúng là bản dựng chính thức, bạn có thể chạy trong terminal (cần cài GitHub CLI trước):

```bash
gh attestation verify magpie-darwin-arm64.dmg -R yetone/magpie-releases
```

Nó sẽ hiện workflow và run đã tạo ra tệp, nếu tệp không do bản dựng chính thức tạo ra thì lệnh sẽ thất bại.

**3.2 Cài đặt một lệnh trong terminal**

Nếu bạn quen dùng dòng lệnh (người dùng Mac và Linux nên dùng):

```bash
curl -fsSL https://usemagpie.ai/install.sh | sh
```

Một lệnh này làm ba việc: tải bản dựng tương ứng với hệ thống của bạn, cài đặt, và đưa lệnh `magpie` vào PATH.

**3.3 Mạng trong nước cần thêm proxy**

Nếu mạng bạn đang dùng không truy cập được trang chính thức hoặc GitHub, hãy thêm tham số:

```bash
curl -fsSL https://usemagpie.ai/install.sh | sh -s -- --proxy http://127.0.0.1:7890
```

Đổi `7890` thành cổng của phần mềm proxy của bạn. Hỗ trợ bốn giao thức http, https, socks5, socks5h. Nếu bạn có dịch vụ mirror tải GitHub, có thể thêm `--mirror https://tien_to_mirror_cua_ban/`. **Yên tâm: dù đi đường nào, giá trị kiểm tra SHA-256 của tệp tải về luôn lấy từ trang chính thức, mirror sửa tệp thì sẽ bị từ chối ngay.**

**3.4 Lưu ý riêng cho người dùng Linux**

Trên Linux, script cài đặt sẽ tự phân biệt:

- Bạn có giao diện đồ họa và hệ thống đã có WebKitGTK 4.1 → cài **bản desktop** (có cửa sổ, có biểu tượng trên khay);
- Bạn có giao diện đồ họa nhưng thiếu WebKitGTK 4.1 → script sẽ dùng trình quản lý gói của bạn để cài nó (cần nhập mật khẩu sudo), rồi cài bản desktop;
- Bạn không có desktop (máy chủ thuần) hoặc không dám dùng sudo → cài **bản terminal**, chỉ có giao diện dòng lệnh.

Tự chỉ định phiên bản:

```bash
curl -fsSL https://usemagpie.ai/install.sh | sh -s -- --gui    # ep ban desktop
curl -fsSL https://usemagpie.ai/install.sh | sh -s -- --tui    # ep ban terminal
```

**3.5 Kiểm tra cài đặt thành công**

Mở terminal (trên Mac là App "Terminal", trên Windows là PowerShell), gõ:

```bash
magpie --version
```

Có số phiên bản hiện ra nghĩa là đã cài xong.

Gõ thêm lệnh này, nó sẽ liệt kê toàn bộ công cụ AI trên máy bạn cùng cấu hình hiện tại của chúng:

```bash
magpie ls
```

**Thấy bảng này nghĩa là cài đặt đã thành công.** Đây chính là bảng điều khiển bạn sẽ phải theo dõi hằng ngày.

---

**Bốn, Bước hai: đưa các nguồn mô hình của bạn vào**

Mở magpie. Trên macOS bấm biểu tượng ở thanh menu góc trên bên phải, trên Windows bấm biểu tượng ở khay góc phải dưới rồi chuột phải chọn "Open magpie".

**4.1 Thêm một hãng cấp API Key (trường hợp phổ biến nhất)**

1. Bấm thẻ **Providers** (nguồn mô hình) ở phía trên;
2. Bấm **＋ Add provider** (thêm nguồn mô hình);
3. Bảng bật ra là một hàng biểu tượng các hãng, hãy tìm hãng mà bạn mua key (DeepSeek, Kimi, Zhipu, MiniMax, Alibaba Bailian, Volcengine Ark, Tencent Hunyuan, SiliconFlow, OpenRouter, xAI, OpenAI, Anthropic, Gemini... đều có);
4. Bấm vào đó, dán key của bạn vào ô nhập, lưu lại.

**Lấy key ở đâu?** Bên cạnh mỗi hãng có một mũi tên nhỏ "Get a key ↗", bấm vào là thẳng đến trang quản lý khóa của hãng đó. **Đừng mua key ở bất kỳ trang bên thứ ba nào, chỉ lấy từ trang chính thức của hãng.**

**4.2 Đăng nhập tài khoản đăng ký (cách dùng tiết kiệm nhất)**

Trong cùng bảng Add provider, bấm vào thẻ dạng **Claude**, **ChatGPT**, **GitHub Copilot**, **Gemini Code Assist**, magpie sẽ tự mở trang đăng nhập chính thức của hãng để bạn cấp quyền. **Đăng nhập xong, gói đăng ký của bạn biến thành một Provider**, mô hình bên trong dùng được cho bất kỳ công cụ nào.

Ở đây có một cơ chế rất quan trọng: **một gói đăng ký có thể thêm nhiều tài khoản.** Ví dụ bạn có 2 tài khoản Claude và 1 tài khoản ChatGPT, bấm thêm một lần nữa vào thẻ Claude là thêm được tài khoản thứ hai. magpie sẽ tự động phân bổ giữa chúng, hết một thì chuyển sang cái tiếp theo, bạn sẽ không thấy lỗi kiểu "hạn mức đã hết".

**Lưu ý quan trọng (chính thức nói rõ):** các yêu cầu của gói Claude được chuyển tiếp qua Claude Code đã cài trên máy bạn, nên Claude Code phải được giữ lại trên máy, đừng xóa. Google cũng có thể kích hoạt kiểm soát rủi ro vì tài khoản bị dùng ngoài Antigravity, **nên hãy dùng tài khoản thử nghiệm để làm thí nghiệm, đừng dùng tài khoản chính.**

**4.3 Mô hình cục bộ**

Nếu đã cài Ollama hoặc LM Studio, trong bảng Add provider chọn **Ollama** hoặc **LM Studio**, không cần key, chỉ điền cổng là xong (Ollama mặc định là 11434). **Lưu ý về chi phí: mô hình cục bộ không tốn tiền, nhưng chậm.** Hằng ngày hãy dùng nó làm phương án dự phòng, đừng dùng làm phương án chính.

**4.4 Bất kỳ giao diện tương thích nào (lựa chọn đa năng)**

Nếu bạn dùng dịch vụ của hãng khác, chỉ cần nó tương thích với định dạng OpenAI hoặc Anthropic, hãy chọn **Custom** và điền ba thứ: tên, base URL (bản tương thích OpenAI thì kết thúc bằng `/v1`, bản tương thích Anthropic thì điền địa chỉ gốc), key. magpie sẽ cấp cho mỗi API một giao diện đúng với cách nó nói chuyện, cái nào cần thì dùng cái đó, cái kia magpie tự dịch.

**4.5 Nhập cấu hình sẵn có (đòn mạnh tiết kiệm thời gian)**

Ở đầu bảng Add provider có nút **Import…**, bấm vào để đọc cấu hình trong `settings.json` của Claude Code, `config.toml` của Codex, CC Switch, Alma, rồi chuyển thẳng các nguồn mô hình trong đó vào magpie. **Nó chỉ đọc chứ không sửa, file gốc không bị đụng tới.** Nếu bạn đã cấu hình kho key thì bước này tiết kiệm được nửa tiếng của bạn.

**4.6 Lưu ý bảo mật then chốt**

**Key của magpie nằm trong `~/.config/magpie/providers.json`, chỉ chính bạn đọc được.** Nó **không** đọc key từ biến môi trường của shell. Bạn thêm gì thì nó dùng gì, không âm thầm tái sử dụng các key khác mà bạn đã `export`. Thiết kế này rất tiết chế, đáng tin.

---

**Năm, Bước ba: chọn mô hình cho từng công cụ**

**5.1 Thao tác trên giao diện đồ họa**

1. Bấm thẻ **Agents** (công cụ) ở phía trên;
2. Mỗi dòng trên trang là một công cụ AI, cột bên phải ghi mô hình mà nó đang dùng;
3. **Bấm vào tên mô hình đó**, một danh sách có tìm kiếm sẽ hiện ra, chia thành ba nhóm: mô hình của chính công cụ, nhóm định tuyến của bạn, và toàn bộ mô hình dưới tất cả provider bạn đã thêm;
4. Bấm thẳng vào mô hình bạn muốn, hoặc gõ từ khóa để lọc.

**Ngay khoảnh khắc bạn bấm, magpie đã sửa xong cấu hình của công cụ đó.** Nó chỉ đụng đúng một khoá cần đụng, phần chú thích, thứ tự, thụt lề đều giữ nguyên, việc ghi là nguyên tử (không để lại file nửa vời nếu mất điện giữa chừng).

**5.2 Nó thực sự sửa những file nào của bạn**

Bảng này đáng để ông chủ liếc một cái, vì đó là bằng chứng cho thấy "magpie không làm hỏng đồ của bạn":

| Công cụ | Tệp cấu hình bị sửa |
|------|------------------|
| Claude Code | `~/.claude/settings.json`: ghi ANTHROPIC_BASE_URL, ANTHROPIC_AUTH_TOKEN và trường mô hình |
| Codex | `~/.codex/config.toml`: thêm một đoạn `[model_providers.magpie]` và cài đặt mô hình |
| Gemini CLI | `~/.gemini/settings.json` và `~/.gemini/.env` |
| OpenCode | `~/.config/opencode/opencode.json(c)` |
| Cursor CLI | `~/.cursor/cli-config.json` |
| Cline / Roo / OpenClaw v.v. | tệp cấu hình theo thoả thuận riêng của từng công cụ |
| VS Code Chat, Zed, JetBrains | tệp cài đặt riêng của trình soạn thảo |

**Tất cả đều là "chỉ sửa một khoá", không phải "viết lại toàn bộ file".**

**5.3 Thao tác bằng dòng lệnh (nhanh hơn)**

```bash
magpie claude deepseek/deepseek-v4-pro      # de Claude Code dung DeepSeek
magpie codex moonshot/kimi-k2.5             # de Codex dung Kimi
magpie opencode anthropic/claude-sonnet-5   # de OpenCode dung Claude
magpie codex effort high                    # tien the tang cuong do suy luan
```

**Định dạng tên mô hình là `hãng/tên_mô_hình`**, ví dụ `deepseek/deepseek-chat`, `moonshot/kimi-k2.5`. Dùng `magpie models` để liệt kê toàn bộ mô hình hiện có mà các Agent có thể chọn.

**5.4 Bước quan trọng nhất: mở phiên làm việc mới**

**Đây là chỗ 90% người ta vấp lần đầu:** phiên đang mở sẽ không tự đổi mô hình. Các Agent đều đọc tệp cấu hình lúc khởi động.

Vậy nên: **chọn xong mô hình, thoát phiên hiện tại, mở phiên mới.** Người dùng Codex còn phải thoát hẳn ứng dụng Codex rồi mở lại (danh sách mô hình của nó được sinh ra lúc khởi động).

**5.5 Làm sao xác nhận đã có hiệu lực**

```bash
magpie ls
```

Xem dòng của công cụ đó, phía sau tên có đổi mô hình không. Đổi rồi là đúng.

**Hoặc xem trang Usage (mức dùng)**: trong magpie có một thẻ Usage, hiển thị mỗi công cụ, mỗi mô hình dùng bao nhiêu token, bao nhiêu tiền, đi qua provider nào. **Trang này là cơ sở để bạn rà soát chi phí sau này.**

---
**Sáu, Bước bốn (không bắt buộc, nhưng rất nên): nhóm định tuyến, để hạn mức tự động tiếp sức**

Nếu bạn có nhiều hơn một nguồn mô hình (hai gói đăng ký, hoặc gói đăng ký kèm API Key), bạn không nên để công cụ chỉ nhận một mô hình duy nhất. **Hết hạn mức thì tự động chuyển sang nguồn tiếp theo, đây là tính năng có giá trị thương mại nhất của magpie.**

**6.1 Trường hợp một mô hình có nhiều nguồn**

Giả sử bạn vừa có gói Claude, vừa có Copilot, vừa có một API Key của Anthropic, chúng đều cung cấp dòng Opus. magpie sẽ tự động gom chúng thành một nhóm, tên là `auto/claude-opus-4.6`. Bạn chọn nhóm này trong Agent là xong, các yêu cầu sẽ tự động phân bổ giữa những nguồn đó.

**6.2 Tự tạo nhóm**

Bằng dòng lệnh:

```bash
magpie group add "Opus anywhere" models=claude/claude-opus-5-5,copilot/claude-opus-5.5 routing=smart
magpie claude group/opus-anywhere
```

**6.3 Có 9 chiến lược phân bổ, nên chọn cái nào?**

| Chiến lược | Hành vi | Dùng khi nào |
|------|------|-----------|
| **smart (thông minh, mặc định)** | ưu tiên gói đăng ký "sắp reset nhưng chưa hết hạn mức", tránh lãng phí | Dùng hằng ngày, **mặc định chọn cái này** |
| order (theo thứ tự) | dùng cái đầu tiên tới khi không dùng được rồi mới chuyển | có một mô hình chủ lực bạn rất muốn ưu tiên |
| rotate (luân phiên) | mỗi lượt yêu cầu đổi một nguồn | muốn tiêu hạn mức đều trên mọi tài khoản |
| usage (ít dùng nhất trước) | ai còn nhiều hơn thì dùng người đó | hạn mức giữa các tài khoản lệch nhau nhiều |
| pace (sắp hết hạn trước) | ai sắp đáo hạn trong tuần, thiệt hại lớn nhất thì dùng trước | không muốn để gói đăng ký hết hạn rồi phí |
| weight (theo trọng số) | chia theo tỉ lệ đã đặt | muốn dồn thêm lưu lượng cho mô hình rẻ |
| fast (ưu tiên tốc độ) | ai trả lời nhanh gần đây thì dùng | các kịch bản nhạy cảm với tốc độ phản hồi |
| cheap (rẻ nhất trước, chỉ dùng trong nhóm) | ai rẻ nhất thì dùng | **tối ưu chi phí thuần túy, ông chủ nên dùng nhất** |

**Lời khuyên thẳng cho ông chủ: hằng ngày dùng `smart`, chạy batch hoặc tác vụ không cần canh giám thì dùng `cheap`.** Mô hình rẻ làm việc nặng nhọc, mô hình đắt dành cho việc cần phán đoán, đó mới là điểm rơi thật của việc dùng AI để giảm chi phí và tăng hiệu quả.

**6.4 Bảng theo dõi hạn mức**

```bash
magpie quota
```

Lệnh này cho bạn biết mỗi gói đăng ký, mỗi key còn lại bao nhiêu, khi nào reset. **Nên xem một lần mỗi tuần.** Hạn mức đăng ký bị phí phạm là chuyện dễ xảy ra, liếc một cái là biết có nên đổi mô hình không.

---

**Bảy, Bước năm (không bắt buộc): hồ sơ cấu hình (Profile), chuyển chế độ làm việc bằng một cú nhấp**

**Tình huống**: ban ngày dùng mô hình rẻ để chạy việc thường, buổi tối cần mô hình mạnh nhất để sửa một kiến trúc phức tạp; hoặc bạn muốn chuyển qua lại giữa "gói Claude của bạn" và "API Key của công ty". Sửa cấu hình bằng tay rất phiền.

Ở cuối trang Agents bấm **＋ Save current**, lưu toàn bộ cấu hình hiện tại của các công cụ thành một hồ sơ, ví dụ đặt tên là "che do tiet kiem" và "che do phao". Sau này bấm một cái vào hồ sơ, mọi công cụ chuyển sang cùng lúc.

```bash
magpie save work      # luu toan bo cau hinh hien tai thanh ho so work
magpie use work       # chay lai ho so work
magpie profiles      # xem cac ho so dang co
```

**Giá trị thực sự của tính năng này với ông chủ: biến "mức dùng AI" thành một hành động quản trị có thể kiểm soát.** Trong đội ngũ, ai đang dùng mô hình nào, tốn bao nhiêu tiền, chuyển hồ sơ là quản được.

---

**Tám, Bước sáu (rất nên): che giấu riêng tư**

**Đây là phần tôi cho là đáng giá nhất trong toàn bộ hướng dẫn, xin đọc kỹ.**

**Vấn đề là gì?** Công cụ AI của bạn sẽ nhét mọi thứ nó đọc được vào prompt rồi gửi đi, bao gồm tệp `.env` trong dự án, tệp cấu hình, token trong log. Nếu prompt của bạn lỡ chứa API Key, mật khẩu, email khách hàng, thì nó bị gửi nguyên si tới hãng cung cấp mô hình.

**Cách làm của magpie (dùng được ngay, hoàn thành tại máy bạn):**

1. Trong **Settings → Privacy** bạn bật masking (mặc định là tắt, **nhớ bật thủ công**);
2. magpie thay các giá trị key, mật khẩu, email trên **máy tính của bạn** bằng các ký hiệu thay thế, ví dụ `{{API_KEY_k3v9x2mq}}`;
3. Thứ được gửi đi là ký hiệu thay thế, **hãng cung cấp mô hình không bao giờ thấy key thật của bạn**;
4. Câu trả lời của mô hình quay về kèm ký hiệu thay thế, magpie đổi lại thành giá trị thật ngay tại máy, công cụ vẫn dùng được như bình thường.

**Một vài chi tiết thiết kế cho thấy nó không làm bừa:**

- Cùng một giá trị luôn được thay bằng **cùng một ký hiệu**, nên ngữ cảnh hội thoại, bộ nhớ đệm prompt, chữ ký suy luận đều không bị vô hiệu;
- Giá trị **chỉ nằm trong bộ nhớ**, trên ổ đĩa chỉ ghi "loại, độ dài, vài ký tự đầu", không ghi giá trị;
- Nếu đã bật che giấu mà nó không chạy được, yêu cầu sẽ bị **giữ lại không gửi** (trả về 503), thay vì gửi thẳng bản gốc đi;
- Quy tắc tích hợp bao phủ API Key, khóa riêng, token, email, số thẻ và mã định danh khớp được; bạn còn có thể tự thêm từ khóa và biểu thức chính quy;
- Từng yêu cầu bị sửa đều xem lại được ở **Insights → Masking**: bạn đã đổi gì, hãng cung cấp thực sự nhìn thấy gì.

**Cái giá phải nói rõ:** mô hình nhìn thấy `{{API_KEY_xxx}}` chứ không phải key thật, nên nó không trả lời được câu kiểu "tại sao token này bị từ chối". Những giá trị đó nên đưa vào danh sách Never mask. **Đây là điểm yếu chung của mọi phương án bảo mật, biết là được.**

**Một câu từ góc nhìn ông chủ: đây chính là công tắc cho phép công ty dám đưa dữ liệu kinh doanh thật vào AI.** Không bật thì sớm muộn đồng nghiệp R&D của bạn cũng sẽ gửi khoá môi trường production tới hãng mô hình.

---

**Chín, Xử lý sự cố thường gặp (làm theo là được)**

**Vấn đề 1: Agent báo 502, hoặc không kết nối được, trang Routing của magpie cũng trống.**

**Đây là cái hố phổ biến nhất ở trong nước, 90% là do phần mềm proxy gây ra.** Surge / Clash / mihomo của bạn đang bật proxy hệ thống hoặc chế độ TUN, khiến các yêu cầu gửi tới `127.0.0.1:3425` cũng bị proxy đi, magpie không nhận được gì.

**Cách sửa: thêm luật đi thẳng cho địa chỉ cục bộ, đặt trước tất cả các luật khác.**

Surge:
```
IP-CIDR,127.0.0.0/8,DIRECT,no-resolve
IP-CIDR6,::1/128,DIRECT,no-resolve
```

Clash / mihomo (đặt dưới mục `rules:`, mỗi dòng thêm một dấu `-`):
```yaml
- IP-CIDR,127.0.0.0/8,DIRECT,no-resolve
- IP-CIDR6,::1/128,DIRECT,no-resolve
```

Sửa xong hãy gửi một yêu cầu mới cho Agent. **Ghi nhớ cách sửa này, nó tiết kiệm được hai tiếng của bạn.**

**Vấn đề 2: Tôi đã đổi mô hình, nhưng Agent vẫn dùng mô hình cũ.**

Ba nguyên nhân: ① phiên làm việc chưa mở lại; ② Codex chưa khởi động lại ứng dụng; ③ bạn sửa tệp cấu hình của công cụ, nhưng công cụ lại đọc một biến môi trường khác.

Thử theo thứ tự: đóng phiên hiện tại → mở phiên mới → vẫn không được thì thoát hẳn ứng dụng Codex rồi khởi động lại.

**Vấn đề 3: Sau khi sửa cấu hình magpie, các thiết lập tôi tự chỉnh có bị mất không?**

Không. Mỗi lần magpie đều đọc lại tệp, chỉ đụng vào mấy khoá của riêng nó. Chú thích bạn viết tay, các mục cấu hình khác, thụt lề đều được giữ nguyên.

**Vấn đề 4: Làm sao trả một công cụ về trạng thái ban đầu?**

```bash
magpie claude default
```

Nó sẽ gỡ bỏ những gì nó đã ghi vào, trả lại các giá trị cũ như `ANTHROPIC_BASE_URL` của bạn. Trên giao diện đồ họa, chọn mô hình của chính công cụ đó là hiệu quả tương tự.

**Vấn đề 5: magpie có phải luôn phải bật không?**

**Dùng mô hình qua magpie thì phải bật.** Cổng kết nối chạy cùng ứng dụng.

Ba cách để nó luôn chạy nền:

```bash
magpie tray              # chi giu bieu tuong tren thanh menu / khay (dat vao khoi dong tu dong)
magpie serve             # chi chay cong ket noi, khong mo cua so
magpie daemon install    # cai thanh dich vu he thong, Linux dung systemd, Mac dung launchd, tu dong khoi dong
```

`magpie daemon install --web` còn có thể bật luôn giao diện bản web. **Lời khuyên cho ông chủ: dùng `magpie daemon install` để cài thành dịch vụ, đừng trông chờ việc tự bấm biểu tượng.**

**Vấn đề 6: Cài trên Linux chỉ có giao diện dòng lệnh, muốn đổi sang bản desktop.**

Cài WebKitGTK 4.1 theo hướng dẫn:

```bash
sudo apt install libwebkit2gtk-4.1-0     # Debian / Ubuntu
sudo dnf install webkit2gtk4.1            # Fedora
sudo pacman -S --needed --noconfirm webkit2gtk-4.1   # Arch
sudo zypper install libwebkit2gtk-4_1-0   # openSUSE
```

Cài xong chạy lại script cài đặt.

**Vấn đề 7: Gỡ cài đặt triệt để, đưa công cụ về trạng thái cũ?**

```bash
curl -fsSL https://usemagpie.ai/install.sh | sh -s -- --uninstall
```

Nó sẽ ngắt kết nối mọi Agent và khôi phục cấu hình gốc của chúng, rồi mới xóa những gì đã cài. **Cài đặt và provider của bạn vẫn nằm trong `~/.config/magpie`, phải thêm `--purge` thì mới xóa luôn.**

**Vấn đề 8: Đổi máy tính thì làm sao?**

```bash
magpie backup                       # sao luu (se yeu cau dat mat khau hai lan)
magpie restore magpie.magpie-backup # khoi phuc tren may moi
```

Bạn cũng có thể đồng bộ trong phần cài đặt sang WebDAV, S3 hoặc một kho GitHub đã mã hoá. **Tệp sao lưu mặc định không chứa API Key**, muốn mang key theo thì phải đặt mật khẩu.

---

**Mười, Nâng cao (biết là được, trước tiên chưa cần làm)**

**10.1 Cho mọi công cụ đều tìm kiếm trên mạng**

magpie tích hợp sẵn một loạt giao diện công cụ tìm kiếm (Tavily, Brave, Exa, Firecrawl, tìm kiếm DeepSeek, Doubao, Tencent Yuanbao...), có thể cấu hình trong phần cài đặt, rồi gắn cho bất kỳ Agent nào dưới dạng MCP, khi đó Agent sẽ có đồng thời hai công cụ `web_search` và `web_fetch`. **Lưu ý: việc này tốn tiền**, key của mỗi hãng được tính tiền riêng.

**10.2 Cho mọi công cụ đều vẽ được hình**

magpie cung cấp công cụ sinh ảnh, dùng mô hình bạn chỉ định, gắn cho bất kỳ Agent nào dưới dạng MCP.

**10.3 Chạy trên NAS hoặc máy chủ**

```bash
docker run -d -p 3430:3430 ghcr.io/yetone/magpie
```

Sau đó quản lý bằng trình duyệt. **Phù hợp để làm cổng kết nối mô hình dùng chung cho cả đội**, kết hợp với "Share on local network" còn cho máy khác trong cùng mạng nội bộ dùng được, và có thể cấp key riêng cho từng máy, kèm giới hạn token và chi phí theo ngày, tuần, tháng. **Điểm này có giá trị rất lớn với công ty có đội R&D: giống như lắp một van tổng cho toàn bộ chi phí AI của công ty.**

**10.4 Dùng plugin**

magpie hỗ trợ plugin (chạy trên Bun), cộng đồng có sẵn một chợ. Plugin vừa có thể cung cấp mô hình (ví dụ plugin đăng nhập), vừa có thể làm middleware của cổng kết nối, sửa yêu cầu, lọc từ nhạy cảm, ánh xạ tên mô hình.

**10.5 Cho công cụ khác kết nối vào**

Mọi công cụ hỗ trợ base URL tuỳ chỉnh đều dùng được, các biến môi trường sau khi xuất ra trông như sau:

```bash
export OPENAI_BASE_URL=http://127.0.0.1:3425/v1
export OPENAI_API_KEY=magpie
export ANTHROPIC_BASE_URL=http://127.0.0.1:3425
export ANTHROPIC_API_KEY=magpie
export GOOGLE_GEMINI_BASE_URL=http://127.0.0.1:3425
export GEMINI_API_KEY=magpie
```

---

**Mười một, magpie có đưa dữ liệu của bạn ra ngoài không? (ông chủ nhất định phải đọc đoạn này)**

**Kết luận: prompt, câu trả lời, key, tài khoản của bạn chỉ được gửi tới đúng những hãng cung cấp mô hình mà bạn tự chọn, magpie không có máy chủ nào đứng ở giữa.** Nó chỉ là một bộ chuyển tiếp cục bộ.

**Mặc định nó báo cáo số liệu sử dụng một lần mỗi ngày**, nội dung gồm: một id ngẫu nhiên (sinh ra trên máy bạn), số phiên bản, thông tin hệ thống, bạn đã dùng agent / provider / mô hình nào (dùng id của chính magpie, provider bạn tự thêm chỉ được đánh dấu là custom), đã cài plugin nào và dùng MCP marketplace nào. **Không chứa bất kỳ tên nào, URL nào, tài khoản nào, key nào, prompt nào hay chi tiết mức dùng nào.**

**Cách tắt** (chọn một trong ba):
- Tắt từng mục trong Cài đặt → Privacy;
- Đặt biến môi trường `DO_NOT_TRACK=1`;
- Đặt biến môi trường `MAGPIE_NO_STATS=1`.

**Hai điều nữa bạn nên biết:**

- Nó đọc thông tin đăng nhập của Claude Code, Codex đã đăng nhập trên máy bạn (nằm trong chuỗi khoá). Không muốn nó đọc thì: Cài đặt → Privacy → tài khoản đăng ký, tắt đi, hoặc chạy `magpie accounts discovery off`. **Provider dạng API Key không bị ảnh hưởng, vẫn dùng bình thường.**
- Tài liệu chính thức liệt kê toàn bộ nội dung báo cáo ở `/docs/privacy`.

**Tiêu chuẩn để ông chủ tự đánh giá: nếu công ty bạn có yêu cầu pháp lý về "dữ liệu xuất khẏi nước", hãy đọc trang đó.** Nó viết chi tiết hơn phần lớn sản phẩm cùng loại, kể cả những chi tiết như biểu tượng plugin đi qua proxy Cloudflare, chỉ thống kê số lượt click mà không lưu id. **Đây là một điểm cộng, không phải điểm trừ.**

---

**Mười hai, Cuối cùng: bộ này có ý nghĩa gì với ông chủ**

Phần kỹ thuật đã xong, nói điều thực tế.

**Tầng một, bài toán chi phí.**
Bạn đang có bao nhiêu gói đăng ký AI? Tiền mỗi tháng có khớp với sổ sách không? Trang Usage của magpie bày rõ chi phí của từng công cụ, từng mô hình, từng key, kết hợp với chiến lược `smart` và `cheap` của nhóm định tuyến, **cùng một việc mà tiết kiệm được 30% đến 60% là chuyện thường**, vì trước đây bạn chỉ có thể dùng một mô hình cho mọi việc, giờ có thể phân chia theo độ khó của từng tác vụ.

**Tầng hai, con người.**
Kỹ sư mới vào không còn phải hỏi "key ở đâu, base URL điền thế nào", một lệnh `magpie claude deepseek/deepseek-chat` là xong. **Phần bạn tiết kiệm được là chi phí "mỗi người mới mất hai ngày dựng môi trường".**

**Tầng ba, tài sản.**
Các nguồn mô hình của bạn (gói đăng ký, key, cấu hình) giờ có một danh sách có thể sao lưu, có thể di chuyển. Một lệnh `magpie backup` mang đi hết, đổi máy, đổi người tiếp quản, không đến nỗi "chỉ có ai đó biết key nằm ở đâu".

**Tầng bốn, rủi ro.**
Tính năng che giấu riêng tư chặn lại việc "R&D lỡ tay gửi khoá production tới hãng mô hình", một việc gần như chắc chắn sẽ xảy ra. **Tôi cho rằng điểm này đáng giá bằng tổng ba điểm trên.**

**Tầng năm, cũng là tầng quan trọng nhất: bạn không bị khóa.**
Hôm nay OpenAI giảm giá, ngày mai Anthropic tăng giá, ngày kia có mô hình mới rất mạnh. Cài magpie rồi, đổi hãng chỉ là một cú nhấp, không phải một dự án kỹ thuật sửa cấu hình cho cả công ty. **Đây là khả năng biến "công cụ AI" từ tài sản cố định thành chi phí biến đổi.**

---

**Mười ba, Lộ trình triển khai (đừng làm hết một lượt)**

**Ngày 1**: cài magpie, thêm một API Key vào, chỉ đổi một công cụ (ví dụ Cline) để chạy thử một ngày. Xác nhận dùng được rồi hãy đi tiếp.

**Ngày 2**: đăng nhập các gói đăng ký còn lại, tạo hai nhóm định tuyến: dùng hằng ngày thì `cheap`, dùng cho việc khó thì `smart`. Tập dùng `magpie quota` và trang Usage.

**Ngày 3**: bật che giấu riêng tư. Tạo một bộ Profile cho toàn bộ công cụ (tiết kiệm / pháo). Chạy một lần `magpie ls` lưu lại làm cấu hình chuẩn cho cả đội.

**Tuần thứ 2**: nếu đội ngũ vượt quá ba người, hãy bật chia sẻ mạng nội bộ cộng với key riêng và giới hạn chi phí cho từng máy. Làm xong bước này là bạn đã nắm quyền kiểm soát tổng thể chi phí AI.

**Đừng làm:** đừng lập tức sửa cấu hình của 20 công cụ rồi mở lại toàn bộ, gặp lỗi là bạn không truy được nguồn. Mỗi lần sửa một cái, sửa xong kiểm tra một lần.

---

**Tổng kết cuối cùng**

magpie có hơn 40000 sao, không phải vì nó giúp bạn dùng được mô hình mạnh hơn, mà vì nó giải quyết một việc mà ai cũng từng bực bội: **định ghép mô hình với công cụ là một địa ngục.**

Chuyển việc nó làm thành lời mà ông chủ hiểu được thì bốn câu:

**Một, gom các nguồn mô hình rải rác thành một danh sách. Hai, biến việc "đổi mô hình" từ sửa cấu hình thành một cú nhấp. Ba, hết hạn mức thì tự động tiếp sức, đừng để công cụ báo lỗi trước mặt bạn. Bốn, trước khi dữ liệu ra khỏi cửa, hãy thay khoá trên chính máy bạn.**

Ba câu đầu là hiệu quả, câu thứ tư là an toàn. **Cộng cả bốn câu lại, đó là toàn bộ lý do tôi khuyên bạn dành một buổi chiều để cài nó.**

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
