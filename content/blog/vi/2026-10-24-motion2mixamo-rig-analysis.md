---
title: "Phân tích chuyên sâu Motion2MixamoRig: Biến video người thật thành nhân vật Mixamo, dự án này làm đúng những gì"
date: "2026-10-24"
description: "Dự án mã nguồn mở Motion2MixamoRig chuyển chuyển động người trong video sang nhân vật 3D có bộ xương Adobe Mixamo. Bài viết phân tích toàn bộ quy trình, cách giải quyết chân trượt và xuyên cơ thể, toán học chuyển động ngón tay, hệ thống chẩn đoán, cùng sáu triết lý thiết kế xuyên suốt mã nguồn."
author: "瑞哥观势"
tags:
  - Motion Capture
  - Motion Retargeting
  - Mixamo
  - Blender
  - GVHMR
  - Mã nguồn mở
categories:
  - 开源项目解析
  - 深度观察
---

# Phân tích chuyên sâu Motion2MixamoRig: Biến video người thật thành nhân vật Mixamo, dự án này làm đúng những gì

Nói thẳng đã.

Nếu bạn đang có sẵn một nhân vật Mixamo (bộ xương Adobe cho miễn phí) và muốn gắn cho nó một đoạn chuyển động của người thật, trước đây công việc này hoặc phải thuê ngoài, hoặc phải mua thiết bị ghi chuyển động, giá nằm ở mức vài nghìn đến mấy chục nghìn nhân dân mỗi đơn vị.

Motion2MixamoRig biến việc đó thành: cài một môi trường Python, đưa vào một đoạn video, chờ mười mấy phút, và có một file `.glb` bỏ thẳng vào Blender hoặc Unity.

**Nhưng điều đáng xem nhất ở dự án này không phải là nó tiết kiệm được bao nhiêu tiền, mà là cách nó giải quyết bài toán "chuyển chuyển động".**

Tôi sẽ tháo rời toàn bộ quy trình, lời giải cho sáu bài toán then chốt, và cả sáu triết lý thiết kế ẩn trong phần chú thích mã nguồn.

---

## Một, Giới thiệu dự án: nó thực sự làm gì

Motion2MixamoRig do MaxLiu22 phát triển, theo giấy phép Apache-2.0, mã nguồn mở ngày 29 tháng 8 năm 2026, hiện có 1583 star và 200 fork. Viết bằng Python, gói `motion2mixamorig` dài 10742 dòng, phần plugin Blender dài 5922 dòng.

### Định nghĩa một câu

**Đưa vào một video có một người (hoặc một ảnh), nhận về một file nhân vật 3D có bộ xương Adobe Mixamo, đã skinning đầy đủ và kèm animation.**

### Quy trình đầy đủ

```
Video / Ảnh
    ↓  ① Kiểm tra trước (kiểm tra nội dung, không phải kiểm tra sự tồn tại)
    ↓  ② Trích xuất chuyển động cơ thể (GVHMR, 24 khớp SMPL)
    ↓  ③ Phát hiện tiếp xúc bàn chân (4 kênh độ tin cậy tĩnh)
    ↓  ④ Chuyển đổi sang xương Mixamo (phân rã swing / twist + FK)
    ↓  ⑤ Khóa bàn chân (IK hai khớp giải tích)
    ↓  ⑥ Hiệu chỉnh chạm đất (dịch chuyển dọc hông)
    ↓  ⑦ Xuất skinning (GLB + góc xoay từng khớp)
    ↓  ⑧ Chẩn đoán tự giao (đọc trực tiếp GLB, linear blend skinning)
Đầu vào video → 4 video xem trước; đầu vào ảnh → 4 ảnh xem trước + so sánh xoay 360°
```

### Hai cách dùng

**Plugin Blender (dành cho người không lập trình)**

Tải zip đúng nền tảng từ GitHub Releases (hiện chỉ có `macos-arm64`), trong Blender vào `Edit → Preferences → Get Extensions → ∨ → Install from Disk…` để cài, trong khung 3D nhấn `N` để mở thanh bên, bấm `Install Runtime (one click)` để tự động cài runtime Python riêng, rồi chọn mô hình SMPL-X, chọn FBX Mixamo, chọn video, bấm `Generate Motion`.

**Dòng lệnh (dành cho lập trình viên)**

```bash
m2mr doctor          # kiểm tra tài nguyên và phụ thuộc, thiếu gì thì báo tải ở đâu
m2mr run             # dùng video mới nhất trong assets/video/ + Y_Bot.fbx
```

Thiết kế cốt lõi của plugin là **nó không đụng vào Python của Blender**. Bản thân plugin không import PyTorch, không import GVHMR, không import OpenCV, nó chỉ chịu trách nhiệm khởi chạy một tiến trình bên ngoài:

```text
<external-python> -m motion2mixamorig.cli run ...
```

Python bên ngoài đó hoặc là runtime do plugin cài một cú vào `~/Motion2MixamoRig`, hoặc là venv do người dùng tự chỉ định. Rào cách ly này làm rất sạch, tránh khỏi cả địa ngục phiên bản Python và môi trường pip tích hợp sẵn của Blender.

### Tổng quan quy mô dự án

| Hạng mục | Số lượng |
|---|---|
| Python lõi | 10742 dòng |
| Plugin Blender | 5922 dòng |
| Bản dịch README | 18 ngôn ngữ + tiếng Anh |
| Bản dịch hướng dẫn sử dụng | 18 ngôn ngữ + tiếng Anh |
| Ngôn ngữ giao diện plugin | 19 |
| Dung lượng tải trọng số suy luận | khoảng 5 GB (+2.7 GB cho bàn tay) |
| Xử lý đoạn 30 giây trên CPU | Lần đầu 8-15 phút, sau đó 3-5 phút |

**Một chi tiết dễ bị bỏ qua**: README và hướng dẫn sử dụng của dự án này đã được dịch sang 18 ngôn ngữ, bản tiếng Trung nằm ở `docs/i18n/README.zh-Hans.md` và `docs/i18n/user-guide.zh-Hans.md`. Nhưng `AGENTS.md`, `CHANGELOG.md`, `NOTICE.md`, `docs/blender-extension.md`, `docs/c4d-fbx-support.md`, `docs/release-checklist.md`, sáu tài liệu cốt lõi này **chưa có bản tiếng Trung**. Phần bản dịch kèm theo bài viết này chính là để bù cho sáu tài liệu đó.

---

## Hai, Hướng dẫn chi tiết: chạy thử chuyển động đầu tiên từ con số không

### Bước 0: Chuẩn bị tài nguyên

Kho lưu trữ không kèm sẵn các file này (vì liên quan đến giấy phép nghiên cứu riêng và điều khoản sử dụng của Adobe), bạn phải tự đi lấy:

| Đặt gì | Đặt ở đâu | Lấy ở đâu |
|---|---|---|
| Mô hình cơ thể SMPL-X | `assets/body_models/smplx/SMPLX_NEUTRAL.npz` | Đăng ký [SMPL-X](https://smpl-x.is.tue.mpg.de/) rồi tải bản NPZ |
| FBX nhân vật Mixamo | `assets/mixamo/Y_Bot.fbx` | Đăng nhập tài khoản Adobe tại [Mixamo](https://www.mixamo.com) để tải |
| Video chuyển động | `assets/video/<name>.mp4` | Chỉ một người, từ đầu đến chân luôn nằm trong khung hình |
| Ảnh tư thế (tùy chọn) | `assets/image/<name>.jpg` | Như trên, dùng kèm `--image` |
| Mô hình tay phải MANO | `assets/body_models/mano/MANO_RIGHT.pkl` | Đăng ký [MANO](https://mano.is.tue.mpg.de/) tải Models & Code |

**Cái bẫy người mới hay mắc kết**: file tải từ Mixamo về có tên `Y Bot.fbx` (giữa có khoảng trắng), trong khi đường dẫn đọc mặc định là `Y_Bot.fbx` (gạch dưới), lệch nhau đúng một ký tự. Đổi tên là nó thành nhân vật mặc định; không đổi cũng được, khi không tìm thấy chương trình sẽ tự dùng file `.fbx` đầu tiên trong `assets/mixamo/`.

**Yêu cầu về tư liệu rất cứng**: trong khung hình chỉ được có một người, từ đầu đến chân phải luôn ở trong khung. `m2mr doctor` và `m2mr run` sẽ đếm số người ngay ở bước kiểm tra trước, thấy hai người là dừng luôn, không lãng phí mười mấy phút để trích xuất.

### Bước 1: Cài đặt

```bash
git clone https://github.com/MaxLiu22/Motion2MixamoRig.git
cd Motion2MixamoRig
python -m venv .venv && source .venv/bin/activate

pip install --upgrade pip setuptools wheel \
  && pip install "numpy>=1.26" \
  && pip install --no-build-isolation "chumpy==0.70" \
  && pip install -e .
```

Cái `--no-build-isolation` không phải là tùy chọn. `chumpy` là package cũ nằm trong chuỗi phụ thuộc của GVHMR, setup script của nó sẽ import pip, trong môi trường build cách ly mặc định của pip chắc chắn báo lỗi `No module named 'pip'`. Phải tắt cách ly rồi cài riêng nó trước.

Nên cài thêm ffmpeg (`brew install ffmpeg` hoặc `apt install ffmpeg`). Không có cũng chạy được, nhưng video đầu ra sẽ không có tiếng và định dạng mã hóa cũng không phát được trực tiếp trên trình duyệt.

### Bước 2: Kiểm tra sức khỏe

```bash
m2mr doctor                 # chỉ kiểm tra nhánh cơ thể
m2mr doctor --detect-hands  # kiểm tra cả file và package Python cho phát hiện ngón tay
```

Việc `doctor` làm chi tiết hơn nhiều so với "kiểm tra file có tồn tại không". Nó nhìn vào **bên trong** file, vì lỗi thường gặp thực sự không phải là thiếu file mà là file sai:

- Số đỉnh của SMPL-X là 10475, của SMPL là 6890, dùng số đỉnh để nhận diện họ mô hình, **không nhìn tên file** (phòng khi ai đó đổi tên file SMPL thành SMPLX)
- Đọc 12 byte đầu của FBX để kiểm tra magic number xem có phải định dạng Binary không, FBX dạng ASCII bị từ chối thẳng
- Lấy 16 frame chạy YOLO đếm số người, thấy hai người là kết luận không dùng được
- Lọc bỏ những "nhân vật con dấu" có diện tích nhỏ hơn 1.5% (khán giả, áp phích), nếu người thứ hai lớn hơn mức đó thì báo động

### Bước 3: Chạy lần đầu

```bash
m2mr run
```

Lần chạy đầu sẽ tải khoảng 5 GB trọng số suy luận về `weights/` (GVHMR, HMR2, RTMPose/ViTPose tư thế 2D, YOLOv8 phát hiện người). Bước này chỉ tải một lần.

Xử lý một đoạn 30 giây trên CPU: lần đầu 8 đến 15 phút, sau khi có trọng số thì 3 đến 5 phút. Chuyển đổi và kết xuất thường mất một hai phút.

**Việc tải trọng số là tự động, nhưng giấy phép của trọng số suy luận không thuộc quyền quản lý của dự án này**, README liệt kê rõ từng giấy phép thượng nguồn, đó là cách làm có trách nhiệm.

### Bước 4: Đổi nhân vật, không trích xuất lại

Đây là thiết kế hữu dụng nhất của cả công cụ.

Trích xuất chuyển động cơ thể là bước chậm, chuyển đổi là bước nhanh. Nên bộ xương được lưu riêng thành file:

```bash
m2mr run --skeleton outputs/20260829_193205_dance/skeleton_motion.npz \
         --rig assets/mixamo/Vampire.fbx
```

**Vài phút biến thành vài chục giây.** Cùng một đoạn chuyển động đổi thoải mái mười nhân vật Mixamo, chi phí gần như chỉ còn phần chuyển đổi.

### Bước 5: Thêm ngón tay

```bash
m2mr run --video assets/video/dance.mp4 --detect-hands --hand-smooth 0.08
```

`--detect-hands` sẽ bật mô hình bàn tay HaMeR, cắt vùng cổ tay ra khỏi cơ thể, ước lượng góc xoay ngón tay trên những frame GVHMR đã chọn, ghi vào `skeleton_motion.npz`, điều khiển 30 khớp ngón tay của Mixamo.

Ba điều bắt buộc phải biết:

1. **Thời gian chạy tăng gấp đôi**. Phát hiện bàn tay chồng lên phần trích xuất cơ thể, không phải chạy song song.
2. **Lần đầu tải thêm 2.7 GB** trọng số về `weights/hamer/`.
3. **Khi dùng lại skeleton không cần thêm flag**. Nếu `skeleton_motion.npz` đã lưu chuyển động bàn tay, `--skeleton` sẽ tự điều khiển ngón tay. Nếu chưa lưu nhưng cache cơ thể vẫn nằm cạnh đó, thêm `--detect-hands` sẽ chỉ bổ sung ngón tay mà không chạy lại cơ thể. Chỉ khi mất cache mới phải chạy lại video.

`--hand-smooth` là số giây làm trơn góc xoay ngón tay, mặc định 0.08, điền 0 nghĩa là giữ nguyên giá trị ước lượng thô.

### Bước 6: Xem chẩn đoán

```bash
m2mr diagnose outputs/<run>                        # tính lại chẩn đoán
m2mr diagnose outputs/<run> --visualize            # sinh thêm diagnostics.html
m2mr diagnose outputs/<run> --threshold-cm 2       # chỉ báo những lỗi sâu hơn 2 cm
```

Mỗi lần `m2mr run` đều tự động kiểm tra nhân vật đầu ra có bị tự giao hay không (một bộ phận cơ thể cắm vào bộ phận khác, ví dụ tay cắm vào đầu), rồi ghi ra `diagnostics.json`. Terminal in ra một dòng tóm tắt:

```
diagnostics: 14 self-intersection(s) over 116 of 719 frames, deepest 7.87 cm
```

**Lưu ý một thiết kế quan trọng: kiểm tra thất bại không làm cho lần chạy thất bại.** Báo cáo là thông tin, không phải cổng chặn. Tác giả để quyền phán đoán lại cho người dùng.

`diagnostics.html` là báo cáo đầy đủ hơn: video nguồn và nhân vật đặt cạnh nhau, thanh thời gian, danh sách sự cố bấm được, khung nhìn 3D tải three.js từ CDN. Trên sàn có các mốc cố định (mỗi 0.5 mét một chữ thập nhỏ, mỗi mét một chữ thập lớn, gốc tọa độ màu xanh lá), nhờ vậy bạn nhìn ra được nhân vật đang đi hay đang trượt.

### Bước 7: Ghi chú thủ công và sửa cục bộ

Có những vấn đề chỉ mắt thường mới thấy được: chân trượt, đầu gối giật, tay không chạm tới cơ thể. Những thứ này **không nằm trong** `diagnostics.json`.

Trên đường ray ghi chú màu hổ phách phía trên đường ray tự giao của `diagnostics.html`, bạn có thể kéo chọn một đoạn frame, điền In / Out, ghi vấn đề. Danh sách Notes bên phải sẽ liệt kê, bấm một dòng là nhảy tới frame đó. **Download notes** sẽ lưu ghi chú cùng danh sách tự giao thành `<tên video>_review.json`.

File này có schema chính thức: `m2mr-review-v1`.

```json
{
  "schema": "m2mr-review-v1",
  "run": "20261024_032240_beat_it_shotaro_test_input_compatible",
  "video": "/absolute/path/to/assets/video/beat_it.mp4",
  "rig": "/absolute/path/to/assets/mixamo/Y_Bot.fbx",
  "fps": 30,
  "frame_count": 554,
  "manual_annotations": [
    {"id": "n1", "start_frame": 380, "end_frame": 410, "start_s": 12.667, "end_s": 13.667, "note": "left foot slides"}
  ],
  "self_intersections": [
    {"kind": "self_intersection", "parts": ["left_hand", "left_thigh"], "ranges": [[372, 373], [378, 381]], "max_depth_cm": 7.37, "also_in_rest_pose": false}
  ]
}
```

Đưa file JSON này cùng với file nhân vật hoặc file skeleton trả lại cho AI hoặc nhà phát triển, nó sẽ **làm lại animation Mixamo chỉ cho đúng đoạn frame đã ghi chú**, ghi ra một thư mục mới, **kết quả chạy cũ được giữ nguyên không đụng tới**.

**Thiết kế "không ghi đè, chỉ sửa cục bộ" này, theo tôi, là dấu hiệu cho thấy độ chín muối về kỹ thuật của dự án vượt ra ngoài các dự án cùng loại.**

### Bước 8: Nhập vào Blender

`File → Import → glTF 2.0 (.glb/.gltf)`.

Vài điểm dễ gây hoang mang:

- Nếu camera hướng vào chỗ trống, chọn lưới nhân vật rồi `View → Frame Selected`
- Cụm các quả cầu ở đầu và tay là hiển thị khớp chứ không phải lưới, trong Outliner hãy ẩn `Icosphere` và armature, **chỉ để lưới đã skinning hiển thị**
- FPS của cảnh phải đọc từ `run.json`, đặt timeline từ 0 tới `n_frames - 1`, như vậy số frame mới khớp với `diagnostics.json`
- Nhân vật là mỗi hình học FBX một đối tượng (Y Bot có hai: `skinned_mesh_0_Alpha_Surface` và `skinned_mesh_1_Alpha_Joints`)

### Bước 9: Chế độ ảnh

```bash
m2mr run --image assets/image/pose.jpg
```

Khôi phục tư thế 3D tĩnh từ một bức ảnh, đi qua đúng con đường chuyển đổi như bản video. Đầu ra là bốn ảnh trong `images/` (cùng góc nhìn với bản video), cộng thêm một file `before_after_360_compare.mp4`: bên trái là ảnh gốc, bên phải là nhân vật xoay trọn vòng 360° mỗi bước 10 độ.

**Không thể truyền cả `--video` và `--image` cùng lúc.**

### Bảng tra nhanh toàn bộ lệnh

| Lệnh | Tác dụng |
|---|---|
| `m2mr doctor` | Kiểm tra tài nguyên và phụ thuộc |
| `m2mr run` | Video mới nhất + Y_Bot, chạy toàn bộ quy trình |
| `m2mr run --video X --rig Y` | Chỉ định đầu vào và nhân vật |
| `m2mr run --image X` | Chế độ ảnh |
| `m2mr run --skeleton X --rig Y` | Dùng lại kết quả trích xuất, chỉ đổi nhân vật |
| `m2mr run --no-foot-lock` | Giữ nguyên bản chuyển đổi gốc (chân sẽ trượt) |
| `m2mr run --detect-hands --hand-smooth 0.08` | Bật ngón tay |
| `m2mr diagnose <run> --visualize` | Tính lại chẩn đoán và xuất báo cáo HTML |
| `m2mr run --output-dir DIR --progress-jsonl F --no-preview` | Dành cho plugin và tự động hóa |

---
## Ba, Sáu bài toán khó và cách giải

Đây là phần cốt lõi của bài viết. Chuyển chuyển động nghe có vẻ chỉ là "chuyển góc khớp của A sang xương của B", nhưng khi làm thật lại có sáu cái hố độc lập.

### Bài toán một: Đọc tư thế tĩnh của bộ xương Mixamo bằng cách nào

FBX gốc của Mixamo mã hóa hướng ràng buộc của mỗi khớp trong `PreRotation`. Nhưng nhiều người mở rồi xuất lại trong Blender hoặc Cinema 4D, thông tin này bị ghi đè thậm chí bị bỏ mất.

Nếu dựng lại tư thế tĩnh bằng góc Euler cục bộ, hệ toạ độ khớp thu được sẽ sai, **và càng đi sâu trong cây phân cấp thì sai càng nhiều**: tư thế tĩnh sai, skinning vỡ, dù chỉ thêm chút animation nào cũng vẫn sai.

**Cách giải của dự án là khôi phục ma trận ràng buộc theo ba mức ưu tiên**:

1. `Pose` / `PoseNode.Matrix` của FBX (có thì dùng cái này)
2. `TransformLink` của skin cluster (khi không có bản ghi Pose thì dùng cái này; khi nhiều lưới cùng nối vào một khớp, chọn cái nào gần với các ma trận còn lại nhất, vì ma trận xoay không thể trung bình được)
3. Thuộc tính biến đổi cục bộ (cho những khớp không có cách nào, thường là khớp đầu chuỗi)

Tác giả còn dán số liệu kiểm chứng trong `docs/c4d-fbx-support.md`: FBX Mixamo gốc và bản xuất từ Cinema 4D, xương lõi đều là 25 xương, toàn rig là 33 xương, sai số lớn nhất của ma trận FK tĩnh lần lượt là `1.7e-14` và `3.2e-14`, sai số skinning tĩnh là `6.5e-14` cm và `2.0e-13` cm.

**Và không có hồi quy**: cùng một file `skeleton_motion.npz` (787 frame) chạy Y Bot trước và sau thay đổi, góc xoay mỗi xương chênh lệch trong `4e-7` (độ chính xác số thực), vị trí đỉnh skinning trong Blender lệch 0.5 micromet.

### Bài toán hai: Khung toán học của việc chuyển đổi

Lõi chuyển đổi của cả dự án là một công thức, ghi trong phần chú thích đầu `kinematics.py`:

```
M_local = T_bind * R_bind * R_anim
M_world = M_parent_world * M_local
```

Ba điểm then chốt:

**`R_anim` là gia số tương đối so với hướng ràng buộc**, không phải hướng tuyệt đối. Đây là nền móng của toàn bộ kiến trúc. Có nó, cùng một đoạn animation có thể áp lên bất kỳ rig nào có tư thế tĩnh khác nhau.

**Chiều dài xương tĩnh của Mixamo không bao giờ bị co lại**. Tay nhân vật dài bao nhiêu thì dài bấy nhiêu, animation chỉ đổi hướng chứ không đổi tỷ lệ. Đây là lỗi nhiều công cụ hay mắc (co xương cho khớp với tỷ lệ cơ thể), một khi co rồi thì không bao giờ quay lại được.

**Dùng FK với góc xoay ràng buộc đầy đủ**. Có thư viện lưu `PreRotation` riêng, dự án này giữ nó làm bí danh tương thích trên `MixamoBone`, nhưng phép tính thực tế đi theo hướng ràng buộc cục bộ đầy đủ.

Trong `retarget.py` còn một hàm tự kiểm `verify_rest_fk`: khi `R_anim` là ma trận đơn vị, FK phải tái tạo chính xác tư thế tĩnh của FBX, sai số vượt `1e-4` là ném exception ngay. **Điều này biến "có gộp sai góc ràng buộc hay không" thành lỗi cứng làm sập ngay lúc khởi động, thay vì một chuyển động kỳ quặc chỉ lộ ra giữa chừng.**

**Phân rã Swing / Twist** là cách làm tiêu chuẩn: tách góc xoay của mỗi xương thành "chỉ về hướng nào" và "xoay bao nhiêu quanh hướng đó". Trong dự án có cả một đống bảng tra: `SWING_TARGETS` (xương nào dùng vector hướng giữa hai khớp cơ thể nào để xác định swing), `AIM_CHILD` (trục tĩnh của xương do xương con nào quyết định), `MIXAMO_TO_HUMAN` (ánh xạ xương Mixamo sang khớp SMPL).

Có một đoạn chú thích đáng đọc kỹ, giải thích một cái hố rất cụ thể:

> Neck/Head không được nhắm theo hướng neck→head của SMPL. Vector đó chỉ dài khoảng 9 cm, là độ lệch từ cổ lên hộp sọ, lệch so với phương thẳng đứng từ 50 đến 70 độ, nhắm theo nó sẽ khiến xương cổ dài hơn nhiều và xương sọ của Mixamo vung loạn. `spine3→head` mới là hướng lên ổn định (hộp sọ nằm trên ngực), đồng thời vẫn dùng khớp head của Human. Ánh xạ khớp giữ nguyên neck→Neck, head→Head.

**Còn một điều nữa**: phép tịnh tiến tĩnh của Neck→Head và Head→HeadTop trong Mixamo không dọc theo +Y cục bộ (chúng mang một độ lệch +Z hướng phía trước), nhắm vào độ lệch đó sẽ làm xương cổ và xương sọ nghiêng. Vì vậy Neck/Head chuyển sang quay quanh +Y cục bộ.

Mật độ chú thích kiểu này cho thấy tác giả đã bị những vấn đề cụ thể này cắn vào.

### Bài toán ba: Chân trượt trên sàn

Đây là thất bại kinh điển của mọi công cụ chuyển chuyển động. Chân đáng lẽ phải đóng đinh xuống sàn, nhưng nhân vật sau khi chuyển đổi lại trượt trên sàn như đi trượt.

**Cách giải của dự án chia làm hai tầng.**

Tầng một là **khóa bàn chân** (`foot_lock.py`). GVHMR dự đoán cho mỗi frame bốn khớp có "độ tin cậy tĩnh": gót chân trái, bàn chân trái, gót chân phải, bàn chân phải. Gót và bàn chân **khóa độc lập**, nên ba trường hợp đặt bàn chân phẳng, nhón chân, và gót chạm đất sẽ mỗi trường hợp ghim đúng phần thực sự tiếp xúc mặt đất.

Xử lý độ tin cậy dùng **độ trễ** (hysteresis): để bắt đầu tiếp xúc cần độ tin cậy trên 0.8, để kết thúc thì chỉ cần rơi xuống dưới 0.5. `ENTER_CONF = 0.8`, `EXIT_CONF = 0.5`. Thiết kế này tránh việc bật tắt tiếp xúc liên tục quanh ngưỡng, mà rung run còn tệ hơn chính cái rung. Đoạn tiếp xúc ngắn hơn 0.1 giây bị loại thẳng.

Mỗi đoạn tiếp xúc ghim điểm khóa vào **vị trí trung bình của chính đoạn đó**. Lượng hiệu chỉnh có một cửa sổ ngắn ở hai đầu đoạn để mờ dần, nhờ vậy chân đang lắc không bị giật.

**Bàn chân ưu tiên hơn gót**. Chú thích giải thích lý do: hai điểm neo đến từ hai đoạn tiếp xúc khác nhau, giữa chúng không có quan hệ chiều dài bàn chân cứng nhắc, cứ ghim cả hai sẽ làm bàn chân bị vặn. Nên khi bàn chân và gót cùng chạm đất thì ghim bàn chân. Bàn chân giữ nguyên hướng thế giới cũ, nên nhón chân vẫn xoay quanh bàn chân đã ghim.

Tiếp theo là **IK hai khớp giải tích**: `UpLeg` và `Leg` giải tới vị trí mục tiêu ở khớp cổ chân, đầu gối giữ nguyên trong mặt phẳng uốn gốc. **Khi chân thẳng không với tới điểm neo, cả hông dịch chuyển** tới vị trí để mọi khớp hông đang chạm đất đều với tới, hai khớp hông dùng chung phần dịch này. **Ở đây không ghim bất cứ thứ gì xuống sàn**, chỉ loại bỏ sai lệch trong lúc tiếp xúc.

Tầng hai là **hiệu chỉnh chạm đất** (`ground.py`). Cái được ghim là "vị trí bàn chân đang ở", nhưng đó là độ cao của khớp xương, không phải độ cao của mặt sàn. Bàn chân nhân vật vẫn cách khớp xương một đoạn, hơn nữa độ cao khôi phục được sẽ trôi dần trong một đoạn video, kết quả là nhân vật lơ lửng hoặc chui xuống đất.

Cách giải là: **đáy bàn chân = đỉnh skinning thấp nhất của bộ phận đó** (gót là `Foot`, bàn chân là `ToeBase` / `Toe_End`). Ở các frame chạm đất, hông dịch theo phương thẳng đứng để đỉnh thấp nhất đó rơi vào `y = 0`. Mỗi đoạn chạm đất giữ độ lệch của frame thấp nhất của chính nó, nên khi bước chân có thể nâng lên nhưng không xuống lõm. Các frame trên không chạm đất chuyển tiếp mượt từ đoạn chạm trước sang đoạn chạm sau, **nhờ vậy giữ được độ cao của cú nhảy, đồng thời loại bỏ trôi chậm giữa các bước**.

Hiệu quả của cả hai giai đoạn đều được ghi trong `run.json`, ở hai mục `foot_lock` và `ground`.

**Lưu ý một chi tiết**: kể cả khi thêm `--no-foot-lock` (giữ bản chuyển đổi gốc, chân sẽ trượt), hiệu chỉnh chạm đất **vẫn chạy**. Vì chạm đất và chống trôi là hai việc khác nhau.

### Bài toán bốn: Lật trái phải trong ước lượng tư thế 2D

RTMPose / ViTPose phán đoán trái phải dựa trên ngoại hình từng frame, **không có trí nhớ**. Người trong khung hình xoay người, chỉ cần một frame bị gán sai, cả cơ thể sẽ xoay 180 độ tại chỗ trong không gian 3D.

Chú thích trong `stabilize_kp2d.py` giải thích cơ chế này rất rõ:

> **Dấu hiệu hướng** của một frame là `sign(x_left - x_right)` ở vai (khi vai sát vào nhau thì dùng hông). Hai sự thật dẫn dắt quy tắc:
>
> - Một lần xoay 180 độ thật sẽ đi qua tư thế nghiêng, ở đó dấu hiệu hướng đổi, đồng thời bề rộng vai gần bằng không ("frame hẹp")
> - Nhãn bị lật là hiện tượng lẻ loi: vài frame có dấu hiệu ngược, bị bao quanh bởi các frame có dấu hiệu nhất quán, và bề rộng vai vẫn đầy đủ

Vậy nên quy tắc là: **cắt video thành các đoạn tại các frame hẹp, bên trong mỗi đoạn lấy giá trị đa số của nhãn RTMPose**. Nếu một đoạn liên tiếp có dấu hiệu ngược ngắn hơn khoảng 0.33 giây thì coi là bị lật và sửa lại; dài hơn thì coi là lần xoay thật "quay nhanh quá không kịp có tư thế nghiêng" và giữ nguyên.

Frame hẹp nằm giữa hai đoạn nhất quán thì ép về dấu hiệu đó (gần ảnh nghiêng cũng có thể bị lật); frame hẹp nằm giữa hai đoạn không nhất quán thì nghĩa là đang xoay, giữ nhãn của bộ ước lượng.

**Bộ quy tắc này không nhìn mặt**, nên mũ và khẩu trùng đều không ảnh hưởng. Hơn nữa mỗi quyết định đều dựa trên cả đoạn chứ không phải một frame bị đổi, **một frame hỏng không thể khóa cả đoạn video ở trạng thái sai**.

Kết quả ghi trong CHANGELOG, con số khá thuyết phục: **một đoạn nhảy có lần xoay nhanh nửa giây, số frame sai hướng giảm từ 320 frame trong 642 frame xuống còn 3 frame**.

Và khi chạy lại với cache sẵn có, nó ổn định lại từ bản sao lưu `vitpose_raw.pt`, **không phải tính tiếp từ đầu ra của quy tắc trước**. Chi tiết này cho thấy tác giả đã tính tới việc "quy tắc sẽ còn tiến hóa, dữ liệu lịch sử không được nhiễm bẩn" ngay từ khi thiết kế.

### Bài toán năm: Chuyển đổi ngón tay

Khi bật `--detect-hands`, HaMeR ước lượng ra góc xoay khớp MANO. Mà góc xoay khớp MANO là **tương đối so với khớp cha**, và được biểu diễn **trong hệ toạ độ riêng của mô hình bàn tay** (vì mỗi frame tĩnh của MANO đều là ma trận đơn vị). Kênh animation của các xương ngón tay Mixamo cũng là tương đối so với khớp cha, nhưng được biểu diễn trong **hệ toạ độ tĩnh riêng của xương đó**.

Vậy nên phép chuyển là một **phép biến đổi cơ sở thuần túy**:

```
R_anim[b] = D_bᵀ · (C · R_mano[j] · Cᵀ) · D_b
```

- `C`: hệ toạ độ bàn tay MANO → hệ toạ độ tĩnh của xương Hand của Mixamo, tính từ hai hệ toạ độ bàn tay ở tư thế tĩnh (cổ tay→ngón giữa 1, ngón trỏ 1→ngón út 1)
- `D_b`: góc xoay tĩnh trong không gian thế giới của xương ngón tay b so với xương Hand

**Phép biến đổi này từ đầu đến cuối đều được đo, không bao giờ viết tay.** Trong chú thích không có câu nào kiểu "nếu là tay trái thì xoay X độ".

HaMeR là mô hình ảnh đơn, góc xoay thô sẽ rung từng frame. `load_hand_motion` dùng **gauss theo thời gian có trọng số độ tin cậy** để làm trơn, đồng thời lấp các lỗ phát hiện ngắn từ frame lân cận.

### Bài toán sáu: Làm sao biết kết quả có tốt không

Đây là phần tôi cho là bị đánh giá thấp nhất, mà cũng giá trị nhất.

**Nó không kiểm tra "trông có đúng không", nó kiểm tra chính file đầu ra.**

`diagnose.py` đọc thẳng `mixamo_character.glb`, **dùng chính trọng số skinning của file** (linear blend skinning, giống hệt mọi trình xem glTF) để dựng từng frame, rồi phát hiện sự xuyên giữa các bộ phận cơ thể.

**Điểm mấu chốt: nó kiểm tra file GLB đã xuất, không phải trạng thái trung gian trong bộ nhớ.** Nghĩa là nó đo đúng thứ mà người dùng thực sự cầm trên tay, bao gồm mọi lỗi có thể sinh ra trong bước xuất.

Vài chi tiết thiết kế:

- **Các bộ phận nối qua khớp không so sánh**. Cánh tay trên và cẳng tay, thân và đùi, da của chúng vốn chồng lên hoặc trộn vào nhau ở chỗ khớp, ở bất kỳ tư thế nào cũng "giao nhau". Tập `_ADJACENT` loại những cặp này ra.
- **Chỉ kiểm tra tự giao, không kiểm tra sàn**. Chú thích viết rất thẳng: tiếp xúc sàn đòi hỏi phải định nghĩa một mặt sàn, mà công cụ này hiện chưa có.
- **Số frame bắt đầu từ 0**, khớp với timeline sau khi Blender import glTF.
- **Các đoạn cùng một cặp bộ phận cách nhau không quá 3 frame được gộp thành một**, tránh báo cáo bị vỡ vụn.
- Ngưỡng độ sâu mặc định 1 cm, chỉnh được bằng `--threshold-cm`.

Rồi đến `diagnostics.html`. Đây là một báo cáo HTML tự chứa, video nguồn và nhân vật đặt cạnh nhau, thanh thời gian, danh sách sự cố bấm được, khung nhìn 3D tải three.js từ CDN. **Trên sàn có các mốc cố định** (mỗi 0.5 mét một chữ thập nhỏ, mỗi mét một chữ thập lớn, gốc tọa độ màu xanh lá), nhờ vậy bạn phân định được nhân vật đang di chuyển hay đang đứng yên.

**Các mốc sàn này là do cộng đồng đóng góp.** CHANGELOG ghi rõ đề xuất đến từ @_____eddie_____ trên X, kèm link cụ thể. Các mốc sàn xuất hiện đồng thời trong báo cáo HTML và trong lưới `Floor Markers` được thêm khi import vào Blender.

Rồi đến **đường ray ghi chú thủ công**: một rãnh màu hổ phách, kéo chọn đoạn frame, ghi vấn đề, lưu thành JSON `m2mr-review-v1`. Trình duyệt lưu bằng localStorage theo khoá `m2mr-review-v1:<glb nguồn>:<số frame>:<fps>`, **nên sinh lại HTML không làm mất ghi chú**.

**Ranh giới của phần mềm được vạch rất rõ: cái máy kiểm tra được thì máy kiểm tra, cái chỉ mắt thường thấy được thì người ghi, hai bên mang theo những thứ khác nhau và trách nhiệm khác nhau, nhưng vẫn giao lại chung.**

---

## Bốn, Tổng kết: sáu triết lý thiết kế

Tháo rời tất cả những thứ trên ra, có thể rút ra sáu triết lý thiết kế xuyên suốt. Chúng không phải khẩu hiệu viết trong README, mà là thứ đọc được từ mã nguồn.

### Triết lý một: Một nguồn sự thật duy nhất, hệ toạ độ chỉ định nghĩa một lần

Đầu file `tpose_calibration.py` viết:

> Mixamo Skeleton T-pose ↕ một lịch hiệu chuẩn toàn cục ↔ character Rig rest T-pose
>
> Chương trình kiểm tra T-pose và phần chuyển đổi animation đều import module này, nên trong dự án chỉ có **một** quy ước Front / Right / Up.

Đau lòng hơn nữa là câu sau:

> **Ở đây không có bất kỳ chỉnh sửa thủ công nào**: hướng giải phẫu được đo từ vị trí xương, việc căn chỉnh dùng `B_rig @ B_skel.T`, **không có hiệu chỉnh định thức của ma trận cực đoan/SVD, không có bản vá 90/180 độ cho từng xương**.

**Bốn chữ "không dựa vào vá lỗi" chính là ghi chú tốt nhất về phẩm chất kỹ thuật của dự án này.**

Trong những bài toán như chuyển chuyển động, "thêm một xử lý đặc biệt cho xương này" là con đường dễ đi nhất, cũng là con đường dễ biến hệ thống thành thứ không bảo trì được nhất. Dự án này dứt khoát từ chối con đường đó, thay bằng cách đo quy ước từ hình học.

### Triết lý hai: Để lỗi sập ngay lúc khởi động, thay vì kỳ quặc trong hình ảnh

`verify_rest_fk` là ví dụ điển hình: góc xoay animation đơn vị phải tái tạo chính xác tư thế tĩnh, sai số vượt `1e-4` là ném exception ngay.

Cùng tư duy ấy còn xuất hiện ở kiểm tra nội dung trong `checks.py` (nhận diện họ mô hình bằng số đỉnh thay vì tên file), và ở các trường `rest_fk_error` cùng `rest_skin_error_cm` được ghi lại mỗi lần chạy trong `run.json`.

**Kiểm tra không phải là công đoạn thủ công cuối cùng trước khi phát hành, mà là một phần của hệ thống.** Mỗi lớp đều tự kiểm, sai là dừng ngay.

### Triết lý ba: Tách phán đoán của máy và phán đoán của người, nhưng gộp chung sản phẩm bàn giao

`diagnostics.json` lưu những gì máy kiểm tra được (tự giao, độ sâu, đoạn frame), `m2mr-review-v1` lưu những gì chỉ người mới thấy được (chân trượt, tay không chạm tới cơ thể).

Cái trước là JSON, chương trình đọc; cái sau cũng là JSON, chương trình cũng đọc, nhưng nội dung là lời nguyên văn của người đánh giá, **lưu đúng như họ nhập, không sửa một chữ, lưu bằng ngôn ngữ nào thì giữ nguyên ngôn ngữ đó**.

Mục đích gộp hai bên vào cùng một file rất rõ ràng: **biến file này thành đầu vào đầy đủ cho một nhiệm vụ sửa lỗi**. AI hay nhà phát triển cầm nó lên là biết cần sửa frame nào, sửa cái gì.

### Triết lý bốn: Ưu tiên tăng dần, tuyệt đối không ghi đè

Đã nhắc ở trên, đây là điểm đáng tách riêng ra nhất.

- Đổi nhân vật không chạy lại trích xuất (`--skeleton`)
- Bổ sung ngón tay không chạy lại cơ thể (khi cache còn)
- Sửa lỗi chỉ sửa đúng đoạn frame đã ghi chú, ghi ra **thư mục mới**
- Chạy lại ổn định hóa thì tính từ bản sao lưu gốc, không tính tiếp từ đầu ra của quy tắc trước

**Thỏa thuận "thư mục mới, không ghi đè" giúp toàn bộ quy trình có thể lặp lại an toàn.** Một lần sửa lỗi thất bại thì kết quả gốc vẫn còn nguyên.

### Triết lý năm: Báo cáo thất bại, nhưng không chặn sản phẩm

Kiểm tra tự giao thất bại **không** làm `m2mr run` thất bại. Chẩn đoán là thông tin, không phải cổng chặn.

Đây là một phán đoán rất trưởng thành. Nhà phát triển biết bàn tay thò vào đầu là vấn đề **của anh ta**, không phải của công cụ. Công cụ đo lường rõ vấn đề rồi giao cho anh ta, quyền phán đoán thuộc về anh ta.

**Nếu công cụ vì "phát hiện có vấn đề" mà từ chối xuất kết quả, ép người dùng đi sửa, thì ngược lại càng tạo thêm ma sát.**

### Triết lý sáu: Đặt giấy phép và giới hạn ở chỗ dễ thấy nhất

`NOTICE.md` đứng riêng, liệt kê rõ điều khoản của từng thành phần thượng nguồn:

- **GVHMR** (SIGGRAPH Asia 2024): chỉ dành cho nghiên cứu phi thương mại
- **SMPL-X**: có đăng ký MPI, dùng cho nghiên cứu/giáo dục/nghệ thuật phi thương mại, thương mại cần thỏa thuận riêng
- **MANO**: có đăng ký MPI
- **Mixamo FBX**: được phát hành kèm sản phẩm, nhưng không được phân phối lại như gói tài nguyên
- **YOLOv8** (Ultralytics): **AGPL-3.0**
- Các checkpoint tư thế và HMR: giấy phép nghiên cứu riêng của từng cái

Kết luận viết rất thẳng:

> Do giới hạn từ các thành phần thượng nguồn, **pipeline end-to-end thực tế bị giới hạn ở mục đích phi thương mại/nghiên cứu**, dù giấy phép của chính kho lưu trữ này là gì.

README cũng lặp lại đoạn này. Hướng dẫn sử dụng thì thẳng thắn hơn: **Motion2MixamoRig chỉ dành cho sử dụng phi thương mại**.

**Tác giả không để sự thật "mã nguồn là Apache-2.0" che giấu giới hạn thực tế của cả chuỗi.** Ở các dự án mã nguồn mở, điều này khá hiếm.

---

## Năm, Tôi nghĩ gì về dự án này

Vài nhận định của riêng tôi.

### Nó chọn đúng một điểm đau có thật

Nhân vật Mixamo là tài nguyên xương Adobe cho miễn phí cho tất cả mọi người, người dùng Blender và Unity không thiếu nhân vật, cái họ thiếu là **chuyển động**. Thiết bị ghi chuyển động và dịch vụ thuê ngoài có giá vài nghìn đến mấy chục nghìn nhân dân mỗi đơn vị, còn nhu cầu "tôi chỉ cần một đoạn đi bộ hay nhảy đơn giản" trước đây gần như không có lời giải chi phí thấp.

Dự án này đẩy chi phí xuống mức "tải 5 GB trọng số + chờ mười mấy phút". **Với nhà phát triển game độc lập, người học animation, người làm công cụ, đây là bước từ 0 lên 1.**

### Chất lượng kỹ thuật của nó không nằm ở mô hình, mà ở hình học

Bước trích xuất chuyển động cơ thể bằng GVHMR thì người khác cũng làm được. **Cái khó là cả chuỗi dài phía sau**: đọc hướng ràng buộc, xác minh tư thế tĩnh, ghim bàn chân, hiệu chỉnh chạm đất, ổn định trái phải, đổi hệ toạ độ ngón tay.

Không một bước nào trong số đó giải được bằng cách "chạy một mô hình", tất cả đều là **thứ phải hiểu hệ toạ độ và động học mới viết đúng**. **Trong 10742 dòng mã, phần thực sự gọi mô hình rất nhỏ, phần lớn là hình học.**

### Mật độ tài liệu của nó hiếm gặp

Chú thích trong mã toàn là lập luận cụ thể kiểu "tại sao làm thế này, không thể làm thế kia", không phải loại "tính ma trận xoay" vô nghĩa. Những đoạn trích dẫn ở trên, ví dụ "vector đó chỉ dài khoảng 9 cm, là độ lệch từ cổ lên hộp sọ, lệch so với phương thẳng đứng từ 50 đến 70 độ", thực sự giải thích nguồn gốc của một lỗi.

Với một dự án cho phép AI agent cũng tham gia phát triển (`AGENTS.md` viết là cho AI), chất lượng chú thích kiểu này quyết định trực tiếp AI có sửa đúng hay không.

### Nó hấp thụ ý kiến cộng đồng rất nhanh

Các mốc sàn đến từ một người cụ thể trên X, sửa xong là ghi tên kèm link trong CHANGELOG. Hỗ trợ FBX xuất từ Cinema 4D đến từ PR #8, cũng ghi tên.

**Một dự án còn ở giai đoạn 0.1.x mà mật độ lặp đi lặp lại và vòng phản hồi đã khá trưởng thành.**

### Cần rót nước lạnh

**Thứ nhất, nó đang ở giai đoạn thử nghiệm.** Ngay đầu README đã viết `Motion2MixamoRig is currently experimental`, và hiện tại **mới chỉ được thử trên macOS Apple Silicon**, Windows và Linux chưa thử, plugin cũng mới chỉ có một gói zip cho macos-arm64.

**Thứ hai, giới hạn phi thương mại là cứng.** Nói rồi ở trên, nhưng đáng nhắc lại: **tài sản animation tạo ra bằng dự án này có dùng thương mại được hay không, phụ thuộc vào điều khoản của GVHMR và SMPL-X, chứ không phụ thuộc vào việc kho lưu trữ này là Apache-2.0.** Đội ngũ muốn dùng thương mại phải tự đi thương lượng.

**Thứ ba, trần chất lượng bị giới hạn bởi bản thân video đơn góc nhìn.** Cơ thể bị che khuất trong góc nhìn đơn, độ sâu bị ước lượng sai, đều là mất thông tin ở tầng dữ liệu, không phải thứ thuật toán nào bù lại được. Đi bộ, nhảy là các chuyển động rõ ràng thuộc sân của nó, còn tương tác nhiều người, che khuất nhiều, cầm vật, những thứ đó, dòng "một người, từ đầu đến chân luôn trong khung" trong README chính là để chào xa người đọc ngay từ đầu.

**Thứ tư, trên CPU nó khá chậm.** Đoạn 30 giây mất 3 đến 5 phút, mức này chấp nhận được cho sử dụng cá nhân, nhưng hơi nặng nếu sản xuất hàng loạt. Có GPU sẽ nhanh hơn nhiều, nhưng số liệu thời gian trong README đều là của CPU.

### Một nhận xét cuối

Tôi đọc hết CHANGELOG và tài liệu của dự án này, điều gây ấn tượng nhất không phải bất kỳ chi tiết kỹ thuật nào, mà là **sự thành thật về ranh giới giữa cái gì kiểm tra được và cái gì không**.

Nó kiểm tra tự giao, vì tự giao có thể phán định bằng hình học, kết quả đo được thành centimet. Nó không kiểm tra chân trượt, vì chân trượt cần hiểu ý định và mặt sàn. Nó viết thẳng "tiếp xúc sàn đòi hỏi phải định nghĩa một mặt sàn, mà công cụ này hiện chưa có". Những lỗi xuyên cơ thể nó tìm ra sẽ không làm lần chạy thất bại, vì đó là vấn đề của người dùng.

**Đây là một dự án biết rõ giới hạn của mình nằm ở đâu, và không định giả vờ vượt qua giới hạn đó mà vẫn dùng được.**

Quay lại câu mở đầu: nếu bạn đang có sẵn một nhân vật Mixamo cần làm animation, kho lưu trữ này đáng để lật qua.

Bàn luận xem, các bạn đang làm animation nhân vật thế nào? Thuê ngoài, mua thiết bị, hay dựng tay từng khung hình? Tôi khá muốn xem cách làm của mọi người.

---

## Phụ lục: Tài liệu dự án

**Địa chỉ kho lưu trữ**: MaxLiu22/Motion2MixamoRig

**Danh mục tài liệu cốt lõi**

| Tài liệu | Nội dung | Bản tiếng Trung |
|---|---|---|
| README.md | Bắt đầu nhanh, tham chiếu lệnh | `docs/i18n/README.zh-Hans.md` |
| docs/user-guide.md | Hướng dẫn dùng plugin Blender (dành cho người không lập trình) | `docs/i18n/user-guide.zh-Hans.md` |
| AGENTS.md | Mô tả kiến trúc cho AI agent, sổ tay lệnh, schema review notes | Có bản dịch kèm theo bài viết này |
| CHANGELOG.md | Toàn bộ lịch sử thay đổi phiên bản | Có bản dịch kèm theo bài viết này |
| NOTICE.md | Điều khoản giấy phép của từng thành phần thượng nguồn | Có bản dịch kèm theo bài viết này |
| docs/c4d-fbx-support.md | Chi tiết hỗ trợ FBX xuất từ Cinema 4D và số liệu kiểm chứng | Có bản dịch kèm theo bài viết này |
| docs/blender-extension.md | Danh sách kiểm thử khói cho người bảo trì plugin | Có bản dịch kèm theo bài viết này |
| docs/release-checklist.md | Danh sách kiểm tra trước khi phát hành | Có bản dịch kèm theo bài viết này |

**Các lệnh chính**

```bash
m2mr doctor
m2mr run
m2mr run --skeleton outputs/<run>/skeleton_motion.npz --rig assets/mixamo/Vampire.fbx
m2mr run --detect-hands --hand-smooth 0.08
m2mr diagnose outputs/<run> --visualize
```

**Giấy phép**: mã nguồn của kho lưu trữ này là Apache-2.0; pipeline end-to-end thực tế chịu giới hạn của giấy phép nghiên cứu thượng nguồn, chỉ dành cho sử dụng phi thương mại.

---

首发于微信公众号「瑞哥观势」

既然看到这里了，如果觉得不错，随手点个赞、在看、转发三连吧，如果想第一时间收到推送，也可以给我个星标，谢谢你看我的文章，我们，下次再见。

首发于微信公众号「瑞哥观势」。
