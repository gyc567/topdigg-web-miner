---
title: 'Omarchy: Bản phân phối Linux Đẹp, Hiện đại và Có Chính Kiến của DHH'
date: "2026-08-15"
description: "Phân tích chuyên sâu về bản phân phối Linux Omarchy của Basecamp DHH: Triết lý thiết kế có chính kiến, tính năng mạnh mẽ, hướng dẫn bắt đầu, và cách nó định nghĩa lại trải nghiệm desktop Linux hiện đại"
tags:
  - Omarchy
  - Linux
  - DHH
  - Basecamp
  - Hyprland
  - Quản lý cửa sổ
  - Arch Linux
  - Lập trình AI
categories:
  - Bản phân phối Linux
  - Công cụ phát triển
  - Hệ điều hành
  - Năng suất
---

# Omarchy: Bản phân phối Linux Đẹp, Hiện đại và Có Chính Kiến của DHH

## Bối cảnh và Giới thiệu Dự án

Trong thế giới các bản phân phối Linux, sự lựa chọn không bao giờ thiếu. Từ tính phổ biến của Ubuntu đến khả năng tùy chỉnh cực độ của Arch, từ công nghệ tiên tiến của Fedora đến độ ổn định của Debian — mỗi bản phân phối đều cố gắng tìm vị trí của riêng mình. Tuy nhiên, khi người sáng lập Basecamp là DHH (David Heinemeier Hansson) công bố **Omarchy**, toàn bộ cộng đồng công nghệ đã bị chấn động — đây không chỉ là một bản phân phối Linux mới, mà còn là một tuyên ngôn về thẩm mỹ tính toán.

Định nghĩa chính thức của Omarchy ngắn gọn nhưng mạnh mẽ: **"Beautiful, Modern & Opinionated Linux"** — Linux Đẹp, Hiện đại và Có Chính Kiến. Ba từ này không phải là khẩu hiệu marketing mà phản ánh sâu sắc suy nghĩ độc đáo của DHH về trải nghiệm tính toán hiện đại.

## Triết lý Thiết kế Cốt lõi

### Có Chính Kiến: Một Lựa chọn Có Ý thức

Trong lĩnh vực thiết kế phần mềm, "có chính kiến" (Opinionated) thường bị coi là tiêu cực. Nó ngụ ý sự cứng nhắc, ít lựa chọn, và định nghĩa chủ quan về "cách đúng". Tuy nhiên, Omarchy đã tái diễn giải khái niệm này như một **chiến lược thiết kế có chủ đích**.

DHH đã nhiều lần trình bày quan điểm cốt lõi trong các tác phẩm và bài phát biểu của mình: **Năng suất bắt nguồn từ động lực** (Productivity is downstream from motivation). Khi ai đó sử dụng một hệ thống đẹp mắt, động lực tự nhiên tăng lên; ngược lại, một hệ thống nhàm chán, thiếu thẩm mỹ sẽ vô hình chất làm giảm sự nhiệt tình của người dùng, dù chức năng đầy đủ.

Triết lý này thể hiện rõ ràng trong Omarchy:

```text
Một hệ thống đẹp → Truyền cảm hứng sử dụng → Năng suất cao hơn
Một hệ thống xấu → Giảm ham muốn sử dụng → Năng suất giảm
```

### Triết lý Omakase: Tin tưởng vào chuyên gia

Omarchy áp dụng khái niệm "Omakase" (đầu bếp chọn) từ ẩm thực Nhật Bản. Trong ẩm thực Nhật, Omakase có nghĩa là bạn hoàn toàn tin tưởng đầu bếp sẽ đưa ra lựa chọn tốt nhất dựa trên nguyên liệu tươi nhất và khẩu vị cá nhân của bạn.

Trong thế giới phần mềm, điều này có nghĩa:
- **Tin tưởng vào kinh nghiệm sử dụng desktop nhiều năm của DHH**
- **Chấp nhận cấu hình toolchain đã được chọn lọc kỹ lưỡng**
- **Tin rằng các cài đặt mặc định đã được cân nhắc kỹ lưỡng**

Đây không phải là sự mê tín mà là chiến lược quản lý thời gian thực tế. Như DHH đã nói: "Mỗi người đều có những điều não bộ đã quên mất nhưng đầu ngón tay vẫn nhớ." Omarchy cố gắng đóng gói trí tuệ tập thể này vào một hệ thống thống nhất.

### Diễn giải Hiện đại về Triết lý Unix

Omarchy có nền tảng sâu sắc trong triết lý Unix nhưng được diễn giải theo cách hiện đại:

1. **Làm tốt một việc**: Mỗi thành phần được thiết kế để xuất sắc trong lĩnh vực của nó
2. **Khả năng kết hợp**: Các thành phần cộng tác thông qua giao diện tiêu chuẩn
3. **Cấu hình dạng văn bản**: Tất cả cài đặt được lưu trong các tệp văn bản có thể quản lý phiên bản
4. **Nguyên tắc ít gây ngạc nhiên**: Hành vi hệ thống nên phù hợp với kỳ vọng của người dùng

## Kiến trúc Kỹ thuật và Thành phần Cốt lõi

### Kiến trúc Cơ bản

Omarchy được xây dựng trên ba trụ cột công nghệ cốt lõi:

| Thành phần | Công nghệ | Vai trò |
|------|----------|------|
| **Bản phân phối cơ bản** | Arch Linux | Cung cấp gói phần mềm tiên tiến Rolling Release và khả năng tùy chỉnh cao |
| **Quản lý cửa sổ** | Hyprland | Trình quản lý cửa sổ tiling hiện đại, hỗ trợ Wayland |
| **Bộ công cụ xây dựng Desktop** | Quickshell | Khung môi trường desktop có khả năng tùy chỉnh cao |

Sự lựa chọn kết hợp này không phải ngẫu nhiên. Arch Linux cung cấp các gói phần mềm tiên tiến nhất và tự do tùy chỉnh tuyệt đối; Hyprland với tư cách tiên phong trong era cửa sổ Wayland mang đến hoạt ảnh mượt mà và kiến trúc rendering hiện đại; còn Quickshell cho phép tùy chỉnh sâu mà không gây ra sự cồng kềnh của môi trường desktop truyền thống.

### Phiên bản Quattro: Cột mốc Mới nhất

Phiên bản chính thứ tư của Omarchy, **Quattro (v4.0.0)**, mang đến nhiều cải tiến:

- **Mã hóa toàn bộ đĩa được bật theo mặc định**: Bảo mật trở thành tiêu chuẩn, không phải tùy chọn
- **Trình cài đặt hoàn toàn mới**: Tuyên bố hoàn thành cài đặt dưới một phút trên máy hiện đại nhanh nhất
- **Hỗ trợ phần cứng được cải thiện**: Hỗ trợ card đồ họa, bàn phím và thiết bị ngoại vi tốt hơn
- **Tích hợp AI được tăng cường**: Đưa các tác nhân lập trình AI lên vị trí công dân hạng nhất

## Các Tính năng Cốt lõi Chi tiết

### 1. Quản lý Cửa sổ Tiling

Omarchy sử dụng **Hyprland** làm trình quản lý cửa sổ — đây là lựa chọn hoàn toàn khác so với trải nghiệm macOS/Windows truyền thống.

**Quản lý cửa sổ Truyền thống vs Tiling:**

```
Cách truyền thống:                Tiling:
┌──────────────┐                 ┌──────────────┐
│              │                 │              │
│   Cửa sổ 1  │                 │   Cửa sổ 1   │
│              │                 ├──────────────┤
│              │                 │   Cửa sổ 2   │
├──────────────┤                 │              │
│   Cửa sổ 2  │                 ├──────────────┤
│              │                 │   Cửa sổ 3   │
└──────────────┘                 └──────────────┘
Cần điều chỉnh thủ công           Cửa sổ tự động tiling, không chồng chéo
```

**Tính năng Cốt lõi:**
- Cửa sổ không bao giờ chồng chéo; mở cửa sổ mới sẽ tự động chia không gian hiện có
- Điều hướng cửa sổ bằng bàn phím
- Hỗ trợ Workspace để chuyển đổi nhanh
- Hỗ trợ ngoại lệ cửa sổ floating

**Ánh xạ Phím tắt (Tương ứng với macOS/Windows):**

| Chức năng | Omarchy | macOS | Windows |
|------|---------|-------|---------|
| Mở menu | `Super + Space` | `Cmd + Space` | `Win + S` |
| Đóng cửa sổ | `Super + W` | `Cmd + W` | `Alt + F4` |
| Terminal mới | `Super + Return` | `Cmd + T` | `Win + T` |
| Chuyển workspace | `Super + 1/2/3/4` | `Ctrl + 1/2/3/4` | `Win + Tab` |

### 2. Hệ thống Chủ đề

Omarchy mang đến **22 chủ đề tuyệt đẹp**, mỗi chủ đề được thiết kế tỉ mỉ:

**Các chủ đề phổ biến bao gồm:**
- **Tokyo Night** - Chủ đề tối lấy cảm hứng từ đêm Nhật Bản
- **Catppuccin** - Tông màu mềm mại, ấm áp
- **Nord** - Bảng màu Bắc Cực lạnh lẽo
- **Gruvbox** - Màu terminal hoài cổ
- **Kanagawa** - Phong cách tranh thủy mặc Nhật Bản
- **Vantablack** - Chủ đề đen sâu thẳm
- **Rose Pine** - Tông màu ấm hiện đại
- **Ethereal** - Phong cách ảo diệu, mơ màng

**Tính nhất quán của Chủ đề:**
Mỗi chủ đề không chỉ là thay đổi màu sắc mà là ngôn ngữ thiết kế thống nhất bao phủ toàn bộ trải nghiệm desktop:
- Hình nền desktop và màn hình khóa
- Sơ đồ màu terminal
- Màu sắc trình soạn thảo Neovim
- Giao diện Chrome của trình duyệt
- Tất cả thành phần hệ thống (thông báo, menu, thanh trạng thái)

### 3. Tích hợp Tác nhân Lập trình AI

Một trong những quyết định thiết kế có tầm nhìn xa nhất của Omarchy là đưa **tác nhân lập trình AI lên vị trí công dân hạng nhất**.

**Lệnh Tác nhân AI được cấu hình sẵn:**

| Lệnh | Tác nhân AI |
|------|---------|
| `claude` | Claude Code (Anthropic) |
| `codex` | OpenAI Codex |
| `opencode` | OpenCode |
| `gemini` | Google Gemini CLI |
| `copilot` | GitHub Copilot CLI |
| `crush` | Crush |
| `grok` | xAI Grok CLI |
| `pi` | Oh My Pi |

**Tính năng Cốt lõi:**
- Tất cả tác nhân được quản lý lazy-load thông qua **mise** (một trình quản lý phiên bản hiện đại)
- Các thành phần chỉ được tải xuống khi sử dụng lần đầu
- Sau khi đặt tác nhân mặc định, khởi chạy nhanh qua `Super + Shift + Ctrl + A`
- Thay đổi chủ đề tự động đồng bộ với các tác nhân AI được hỗ trợ

**Tích hợp Bố cục Tmux:**
```
tdl c          # Khởi chạy bố cục ba ngăn: Editor + Claude Code + Terminal
tdl opencode   # Khởi chạy bố cục ba ngăn: Editor + OpenCode + Terminal
tsl 4 c        # Khởi chạy lưới 2x2 các instance OpenCode
```

### 4. Tích hợp Neovim

Omarchy đi kèm cấu hình **LazyVim** đầy đủ — đây là bản phân phối plugin và cấu hình Neovim đã được tuyển chọn kỹ lưỡng.

**Phím tắt Thường dùng:**

| Phím tắt | Chức năng |
|--------|------|
| `Space Space` | Tìm kiếm mờ các tệp trong thư mục hiện tại |
| `Space S G` | Tìm kiếm Grep với xem trước |
| `Space E` | Bật/tắt cây tệp |
| `Space G G` | Khởi chạy LazyGit trong cửa sổ floating |
| `Ctrl + W W` | Nhảy giữa cây tệp và trình soạn thảo |

### 5. Clipboard và Lịch sử Thống nhất

Omarchy cung cấp trải nghiệm clipboard thống nhất trên tất cả ứng dụng:

- **`Super + C/X/V`** - Sao chép/Cắt/Dán, hoạt động cả trong terminal
- **`Super + Ctrl + V`** - Lịch sử clipboard (tương tự Windows Win+V)
- Hỗ trợ lưu trữ hỗn hợp hình ảnh và văn bản

### 6. Cập nhật Hệ thống

Tất cả phần mềm được cập nhật thông qua một lệnh duy nhất:

```
Update > Omarchy
```

Điều này cập nhật Omarchy và mọi gói trên hệ thống, tự động tạo snapshot trước khi cập nhật. Không có các trình cập nhật ứng dụng độc lập gây phiền nhiễu.

## Hướng dẫn Bắt đầu: Cài đặt Omarchy từ đầu

### Chuẩn bị

**Yêu cầu Hệ thống:**
- Tối thiểu 4GB RAM
- Tối thiểu 50GB dung lượng đĩa trống
- Bộ xử lý 64-bit x86 hỗ trợ UEFI
- Cổng USB để khởi động

**Công cụ Cần thiết:**
- USB flash drive (tối thiểu 8GB)
- BalenaEtcher (Mac/Windows) hoặc dd (Linux)
- Image ISO Omarchy (tải từ omarchy.org)

### Các Bước Cài đặt

**Bước 1: Tạo USB có thể khởi động**

1. Tải xuống ISO Omarchy
2. Sử dụng BalenaEtcher để ghi ISO vào ổ USB
3. Khởi động máy mục tiêu từ USB

**Quan trọng: Phải tắt Secure Boot và TPM**
```
Đây là các scheme bảo mật của Microsoft dành cho Windows và các bản phân phối Linux liên kết với Microsoft.
Bạn phải tắt chúng để cài đặt Omarchy.
```

**Bước 2: Khởi động và Cấu hình**

1. Khởi động từ USB, vào trình hướng dẫn cài đặt
2. Chọn bố cục bàn phím (bàn phím có dây hoặc 2.4GHz — bàn phím Bluetooth không được hỗ trợ để mở khóa đĩa mã hóa!)
3. Cấu hình tài khoản người dùng và mật khẩu
4. Chọn ổ đĩa đích để cài đặt
5. Xác nhận cấu hình cài đặt

**Bước 3: Chờ cài đặt hoàn tất**

Trên máy hiện đại nhanh nhất, cài đặt có thể hoàn thành dưới một phút; ngay cả máy cũ cũng không nên mất quá năm phút.

**Bước 4: Khởi động Lần đầu**

1. Lần khởi động đầu tiên sẽ nhắc nhập mật khẩu mã hóa toàn bộ đĩa
2. Đặt khu vực, ngôn ngữ và các cấu hình cơ bản khác
3. Sẵn sàng để bắt đầu!

### Cài đặt cho Người khác (Kịch bản Đa người dùng)**

Nếu bạn đang thiết lập máy cho gia đình, nhân viên hoặc khách hàng:

1. Nhấn **`Ctrl + C`** tại màn hình đầu tiên của trình cài đặt (chọn bàn phím)
2. Omarchy sẽ chuẩn bị máy cho "chủ sở hữu khác"
3. Tất cả cài đặt cá nhân (bố cục bàn phím, tên người dùng, mật khẩu) sẽ được hoãn đến lần khởi động đầu tiên
4. Ổ đĩa vẫn được mã hóa theo mặc định

### Cài đặt Dual Boot**

1. Tắt BitLocker trong Windows
2. Để không gian chưa phân bổ trên đĩa
3. Chạy trình cài đặt Omarchy
4. Chọn tùy chọn "cài đặt không gian trống"
5. Omarchy sẽ tự động cùng tồn tại với các hệ thống hiện có

## Cấu hình và Tùy chỉnh

### Quản lý Dotfiles

Tất cả cấu hình của Omarchy được lưu trong các tệp văn bản trong thư mục `~/.config/`:

```bash
~/.config/
├── hypr/           # Cấu hình trình quản lý cửa sổ Hyprland
│   ├── input.lua   # Cấu hình thiết bị đầu vào
│   ├── bindings.lua # Ràng buộc phím tắt
│   └── windowconf.lua # Quy tắc cửa sổ
├── quickshell/     # Cấu hình Quickshell
├── foot/           # Cấu hình Terminal
└── nvim/           # Cấu hình Neovim
```

Tất cả các tệp cấu hình có thể:
- Được quản lý phiên bản
- Được sao chép sang máy mới
- Được chia sẻ với cộng đồng

### Sử dụng Omarchy CLI

Omarchy cung cấp một công cụ dòng lệnh mạnh mẽ:

```bash
# Cập nhật hệ thống
omarchy update

# Cài đặt gói
omarchy pkg add <package-name>

# Đặt tác nhân AI mặc định
omarchy default agent claude

# Điều chỉnh chủ đề
omarchy theme set tokyo-night

# Chuyển đổi bố cục bàn phím
omarchy keyboard set us,fr
```

### Tạo Chủ đề Tùy chỉnh

Hệ thống chủ đề Omarchy hoàn toàn mở:

1. Tạo thư mục chủ đề mới trong `~/.config/omarchy/themes/`
2. Định nghĩa các biến màu
3. Cấu hình hình nền
4. Đặt kiểu màn hình mở khóa
5. Áp dụng bằng `omarchy theme install <theme-name>`

## Phân tích Sâu Triết lý Thiết kế

### Vẻ đẹp là Động lực

Lập luận cốt lõi của DHH: **Một hệ thống đẹp là một hệ thống có động lực**. Đây không chỉ là sở thích thẩm mỹ mà còn dựa trên sự hiểu biết sâu sắc về tâm lý con người:

- **Động lực ban đầu**: Khi hệ thống dễ chịu, mọi người sẵn lòng bắt đầu công việc hơn
- **Sự gắn bó liên tục**: Niềm vui thẩm mỹ duy trì sự nhiệt tình sử dụng lâu dài
- **Duy trì sự tập trung**: Giao diện được thiết kế cẩn thận giảm thiểu mệt mỏi nhận thức
- **Hình ảnh chuyên nghiệp**: Một môi trường phát triển đẹp mắt cũng là một tuyên ngôn chuyên nghiệp

### Giá trị của Việc Có Chính Kiến

Trong công nghệ phần mềm, thiết kế có chính kiến loại bỏ sự mệt mỏi từ lựa chọn không cần thiết:

```
Vấn đề với quá nhiều lựa chọn:
┌─────────────────────────────────────┐
│  "Tôi nên dùng terminal nào?"       │
│  "Cấu hình trình quản lý cửa sổ của tôi đúng không?"│
│  "Sơ đồ màu này có hợp lý không?"   │
│  "Các phím tắt có tối ưu không?"     │
└─────────────────────────────────────┘
                    ↓
Câu trả lời của Omarchy:
"Hãy tin vào lựa chọn của đầu bếp, tập trung vào điều thực sự quan trọng."
```

### Triết lý Terminal First

Omarchy đại diện cho một sự trở lại: **ôn lại sức mạnh của terminal trong thời đại GUI**.

Đây không phải là sự phủ nhận giao diện đồ họa mà là sự điều chỉnh lại bản chất của công cụ:

| Kịch bản | Lựa chọn Công cụ | Lý do |
|------|----------|------|
| Viết code | Neovim + Tmux | Kiểm soát chính xác, điều khiển bằng bàn phím, hiệu quả |
| Duyệt tệp | Ranger (TUI) | Điều hướng bằng bàn phím, không cần chuột |
| Thao tác Git | LazyGit (TUI) | Diff trực quan, đồ thị nhánh rõ ràng |
| Giám sát hệ thống | btop (TUI) | Sử dụng ít tài nguyên, có thể dùng từ xa |
| Viết tài liệu | Neovim + Obsidian | Lưu trữ cục bộ, Markdown native |

### Bàn phím như Công dân Hạng nhất

Omarchy giả định rằng bạn sẽ chủ yếu sử dụng bàn phím để tương tác với máy tính. Đây không phải là cưỡng ép mà là sự cải thiện hiệu quả đã được chứng minh:

**Dữ liệu Nghiên cứu:**
- Điều hướng bằng bàn phím nhanh hơn **20-30%** so với chuột trong các tác vụ chuyên nghiệp
- Giảm di chuyển tay có thể giảm nguy cơ **Chấn thương do Lặp đi Lặp lại**
- Việc hình thành ký ức cơ bắp làm cho các thao tác phức tạp trở nên tự động

## So sánh với macOS/Windows

### Chuyển đổi từ macOS

| Thói quen macOS | Tương ứng trong Omarchy |
|------------|-------------|
| Spotlight (`Cmd + Space`) | `Super + Space` (Menu Omarchy) |
| Phím Command | Super Key (vị trí giống nhau) |
| Dock | Workspaces + Menu |
| Finder | Ranger hoặc cây tệp |
| Time Machine | Snapshot hệ thống tự động |
| App Store | `omarchy pkg add` hoặc cài đặt từ menu |

### Chuyển đổi từ Windows

| Thói quen Windows | Tương ứng trong Omarchy |
|-------------|-------------|
| Menu Start | `Super + Space` |
| Win + V (lịch sử clipboard) | `Super + Ctrl + V` |
| Snap Windows | Tiling tự động |
| Thanh tác vụ | Workspaces + Thanh trên |
| Control Panel | Menu _Setup_ |

### Sự khác biệt Cốt lõi

**Những thay đổi tâm lý cần chấp nhận:**
1. Cửa sổ không còn chồng chéo — chúng được tiling
2. Đóng ứng dụng có nghĩa là nó thực sự thoát — không có trạng thái "đóng băng" nền
3. Nhiều cài đặt cần chỉnh sửa tệp văn bản — không phải nhấp qua các bảng tùy chọn
4. Phần mềm đến từ trình quản lý gói — không phải từ trình cài đặt đã tải xuống

## Phân tích Kịch bản Sử dụng

### Ai Nên Sử dụng Omarchy

✅ **Khuyến khích mạnh mẽ:**

- **Người yêu thích dòng lệnh**: Đã quen với thao tác terminal, khao khát trải nghiệm hiệu quả hơn
- **Người dùng hệ sinh thái DHH/Basecamp**: Sử dụng HEY, Basecamp và các công cụ tương tự
- **Nhà phát triển theo đuổi thẩm mỹ**: Có yêu cầu thẩm mỹ đối với môi trường phát triển
- **Blog công nghệ và nhà giáo dục**: Trình diễn khả năng Linux hiện đại
- **Người học muốn hiểu sâu hơn về Linux**: Tất cả cấu hình đều minh bạch và có thể xem

⚠️ **Cần Cân nhắc:**

- **Nhà thiết kế đồ họa**: Có thể cần thêm công cụ GUI
- **Người dùng máy tính nhẹ**: Thiết kế có chính kiến có thể quá hạn chế
- **Người dùng cần phần mềm doanh nghiệp cụ thể**: Một số phần mềm độc quyền có thể không tương thích

❌ **Không Phù hợp:**

- Game thủ (mặc dù Steam/Proton có thể chạy nhiều trò chơi)
- Người dùng doanh nghiệp cần Microsoft Office
- Người dùng không thoải mái khi thay đổi cài đặt mặc định

## Tổng kết Các Quan điểm Chính

### Nhận định Cốt lõi

1. **Có chính kiến là đức hạnh**: Giảm gánh nặng nhận thức thông qua việc hạn chế lựa chọn, cho phép người dùng tập trung vào bản thân việc sáng tạo

2. **Vẻ đẹp là nền tảng của năng suất**: Một môi trường làm việc dễ chịu liên tục thúc đẩy sự nhiệt tình sáng tạo

3. **Terminal là tương lai của tính toán hiện đại**: Trong kỷ nguyên AI, giao diện điều khiển bằng bàn phím tự nhiên phù hợp với các tác nhân AI

4. **Cấu hình là mã**: Việc lưu trữ văn bản tất cả cài đặt giúp môi trường có thể sao chép và quản lý phiên bản

5. **AI là Công dân Hạng nhất**: Omarchy cấu hình sẵn tất cả các tác nhân lập trình AI chính, sử dụng ngay từ đầu

### Điểm nổi bật Kỹ thuật

- **Mã hóa toàn bộ đĩa được bật theo mặc định**: Bảo mật là tiêu chuẩn, không phải tùy chọn
- **Mô hình phát hành rolling**: Dựa trên Arch Linux, luôn sử dụng phần mềm mới nhất
- **22 chủ đề đẹp**: Thẩm mỹ desktop thống nhất bao phủ tất cả thành phần
- **Tác nhân AI lazy-load**: Được quản lý qua mise, chỉ tải xuống khi sử dụng lần đầu
- **Bố cục Tmux được thiết lập sẵn**: Bố cục môi trường phát triển được tối ưu hóa cho cộng tác AI

### Lời khuyên cho Người dùng Mới

1. **Dành hai tuần**: Làm quen với tiling cửa sổ và điều hướng bằng bàn phím cần thời gian điều chỉnh ngắn
2. **Bắt đầu với `Super + K`**: Điều này sẽ hiển thị tất cả các phím tắt khả dụng
3. **Đừng sợ các tệp cấu hình**: Chúng đơn giản hơn bạn nghĩ và hoàn toàn kiểm soát được
4. **Đón nhận Tmux**: Nó đưa việc sử dụng terminal lên một tầm cao mới
5. **Thử các tác nhân AI**: Chúng là nhân nhân thực sự để tăng năng suất

## Kết luận

Omarchy đại diện cho một loại sản phẩm phát triển phần mềm hiếm có: đây không phải là công cụ đa năng được thiết kế để đáp ứng khẩu vị của tất cả mọi người, mà là một tác phẩm cá nhân có lập trường thẩm mỹ rõ ràng và triết lý thiết kế mạch lạc. DHH đã đổ toàn bộ sự hiểu biết của mình về tính toán — từ triết lý Unix đến thẩm mỹ terminal, từ tác nhân lập trình AI đến thiết kế hình ảnh — vào dự án này.

Đối với những ai sẵn lòng chấp nhận cách suy nghĩ mới, sẵn sàng đầu tư vào đường cong học tập, sẵn sàng xem môi trường làm việc như một phần của quá trình sáng tạo, Omarchy cung cấp một trải nghiệm gần như không thể sao chép trong hệ sinh thái Linux hiện đại.

Nó không cố gắng trở thành hệ điều hành cho tất cả mọi người. Nó cố gắng trở thành hệ điều hành *hoàn hảo* cho một kiểu người nhất định.

Nếu bạn quan tâm đến Linux "có chính kiến", nếu bạn tin vào mối liên hệ sâu sắc giữa vẻ đẹp và năng suất, nếu bạn sẵn sàng bước vào hành trình khám phá ranh giới của thẩm mỹ tính toán hiện đại — Omarchy đang chờ bạn.

---

**Tài nguyên Tham khảo:**

- [Trang web chính thức Omarchy](https://omarchy.org)
- [Sổ tay chính thức Omarchy](https://learn.omacom.io/2/the-omarchy-manual)
- [Kho GitHub](https://github.com/basecamp/omarchy)
- [Discord cộng đồng](https://omarchy.org/discord)
