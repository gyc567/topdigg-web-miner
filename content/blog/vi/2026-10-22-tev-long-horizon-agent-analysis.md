---
title: "Phân tích chuyên sâu Tev: dùng «latent world» để tạo dữ liệu, dùng phần thưởng mật độ để huấn luyện agent dài hạn"
date: "2026-10-22"
description: "Phân tích chuyên sâu bài báo Tev do Adobe Research và UCLA phối hợp công bố: từ tổng hợp môi trường ưu tiên latent world, mổ xẻ 1,170 môi trường tác vụ dài hạn có thể kiểm chứng, định hình phần thưởng theo tiềm năng tiến độ (PPRS), cùng cách Tev-27B bắt kịp GPT-6 Astra và Claude Opus 5 trên ALE-CM. Kèm hướng dẫn tái tạo đầy đủ và phân tích triết lý thiết kế."
author: "瑞哥观势"
tags:
  - Tev
  - AI Agent
  - Củng cố mạng
  - Tác vụ dài hạn
  - Phần thưởng mật độ
  - Phân tích bài báo
  - Agentic RL
categories:
  - Phân tích chuyên sâu bài báo
  - AI Agent
---

# Phân tích chuyên sâu Tev: dùng «latent world» để tạo dữ liệu, dùng phần thưởng mật độ để huấn luyện agent dài hạn

> Bài báo: *Tev: Scaling Long-Horizon Agentic Environments with Dense Progress Rewards*
> Tác giả: Wenbo Hu、Shraman Pramanick、Krishna Kumar Singh、Nanyun Peng、Kai-Wei Chang、Yong Jae Lee(Adobe Research + UCLA)
> Trang bài báo: https://arxiv.org/abs/2610.18868 ｜ Bản HTML: https://arxiv.org/html/2610.18868v1
> Trang dự án: https://tev-agent.github.io/
> Trọng số mô hình: https://huggingface.co/gordonhu/Tev-27B ｜ https://huggingface.co/gordonhu/Tev-320B

## Lời dẫu: một lĩnh vực bị kẹt cứng vì thiếu dữ liệu

Trong hai năm qua, đường cong năng lực của AI Agent gần như hoàn toàn được vạch bởi «tác vụ dài bao nhiêu».

Tác vụ ngắn và trung bình là vùng ngọt. SWE-Smith có 5 vạn môi trường, TMAX-15K có 1.46 vạn, CLI-Gym、SETA、Endless Terminals mỗi cái có từ vài nghìn đến hơn mười nghìn. Các bộ dữ liệu này đủ lớn, quy trình huấn luyện đủ trưởng thành, mô hình quả thực sự tiến bộ.

Nhưng khi bạn kéo thang thời gian của tác vụ lên «từ vài giờ đến vài ngày» — các bài toán toán học mở thực sự, nghiên cứu tự động hóa máy học, phân tích nguyên nhân gốc sự cố trong sản xuất — cả lĩnh vực đâm vào một bức tường.

Bức tường đó gồm hai khoảng trống.

**Khoảng trống thứ nhất là dữ liệu.** Tác vụ dài hạn chỉ tồn tại dưới dạng bộ đánh giá do con người viết tay. Mỗi thể hiện trong Agents' Last Exam (ALE) và Terminal-Bench (TB) đều đòi hỏi chuyên gia bỏ ra hàng tuần. Toàn bộ ALE-CM chỉ có vài chục đến vài trăm đề, và chúng chỉ dùng được để đánh giá, không dùng được để huấn luyện. Điều này tạo ra một mâu thuẫn cấu trúc vô cùng khó chịu:

> Kho ngữ liệu huấn luyện của agent rất nhiều, nhưng đều ngắn; tác vụ dài thực sự tồn tại, nhưng chỉ là một lượng nhỏ bộ đánh giá viết tay.

Khoảng trống «dữ liệu huấn luyện dài hạn quy mô lớn» ở giữa hoàn toàn trống rỗng.

**Khoảng trống thứ hai là phần thưởng.** Dù bạn có muốn tạo dữ liệu, phần thưởng của tác vụ dài là thưa. Phần thưởng kết thúc chỉ xuất hiện khi tác vụ hoàn thành, còn tỷ lệ đạt của mô hình trên tác vụ dài thường chỉ 5% hoặc thấp hơn. Điều này nghĩa là trong các thuật toán củng cố mạng tương đối trong nhóm như GRPO, hầu hết các nhóm lấy mẫu đều thất bại hoàn toàn, lợi thế bằng không mọi nơi, và đóng góp vào gradient hoàn toàn bằng không.

Bài báo dùng một con số rất cụ thể để minh họa điều này: nếu xác suất đạt của tác vụ là $p=0.05$, mỗi nhóm có $G=8$ rollout, thì **66% các nhóm lấy mẫu bị lãng phí hoàn toàn**; khi $p=0.01$, tỷ lệ lãng phí lên tới **92%**. Và đây đúng là giai đoạn đầu huấn luyện, giai đoạn policy yếu nhất, giai đoạn cần tín hiệu nhất.

Việc bài báo Tev làm, gói gọn trong một câu:

> **Từ «một thế giới có đáp án đã biết» dựng ngược ra tác vụ, rồi dùng chân lý của thế giới đó để chấm điểm từng bước trong quá trình huấn luyện.**

Dưới đây chúng ta sẽ mổ xẻ đầy đủ ý tưởng cốt lõi, cấu trúc phương pháp, kết luận thực nghiệm và hướng dẫn tái tạo của nó.

---

## Một, ý tưởng cốt lõi: ưu tiên latent world (Latent-World-First)

### 1.1 Mâu thuẫn gốc với pipeline truyền thống

Pipeline tổng hợp dữ liệu hiện nay chủ yếu diễn ra như sau: để ngôn ngữ mô hình sinh ra một mô tả tác vụ, rồi sinh tệp đầu vào tương ứng, rồi sinh verifier hoặc test case. Không có chỗ nào trong cả chuỗi này tồn tại «đáp án đúng» — chỉ có những thứ trông hợp lý.

Cách làm này có ba vấn đề ai cũng biết:

1. **Verifier không đáng tin cậy.** Test case được sinh ra có thể bản thân nó đã sai.
2. **Tác vụ và verifier có thể không khớp.** Đây là điều chí mạng nhất. Bài báo gọi đó là **trôi dạt artifact (artifact drift)**: môi trường, tác vụ, verifier được sinh riêng lẻ, mỗi cái xét riêng đều hợp lý, nhưng gộp lại thì lại đang mô tả hai bài toán khác nhau.
3. **Không có trạng thái trung gian.** Chỉ kết cục là đen trắng, bạn không biết agent đã làm đúng bước nào, còn cách mục tiêu bao xa.

Cách làm của Tev là đảo ngược toàn bộ chuỗi đó.

**Trước tiên dựng một latent world $W$**: đó là trạng thái đầy đủ và chính xác của lĩnh vực tác vụ này. Ví dụ: khách hàng, sản phẩm, lịch sử giao dịch của một kho bán lẻ; các shard tensor và topo của một checkpoint phân tán; manifest tài nguyên của một cụm Kubernetes.

Trong thế giới này, **đáp án đúng tồn tại một cách tự nhiên**. Bởi vì chính thế giới đó là «bộ dạng khi mọi thứ bình thường».

Sau đó, **render (hiển thị)** thế giới này thành các tệp đầu vào mà agent thực sự sẽ nhìn thấy, rồi áp dụng **hư hỏng có kiểm soát và có thể đảo ngược**, để thu được không gian làm việc ban đầu $s_0$ mà agent nhận.

Điểm mấu chốt: **latent world $W$ đồng thời là nguồn chung cho cả bốn thứ: prompt tác vụ, tệp đầu vào, verifier, và bộ chấm điểm tiến độ.**

Bài báo viết mối quan hệ này thành một công thức gọn gàng:

$$E=(x,\;s_{0},\;\operatorname{ver}_{W},\;\Phi_{W}),\tag{1}$$

Bốn thành phần của một môi trường $E$ đều là hàm của cùng một $W$:

- $x$: prompt tác vụ (mô tả duy nhất mà agent nhìn thấy được)
- $s_0$: cây thư mục đầu vào (không gian làm việc ban đầu của agent)
- $\operatorname{ver}_{W}$: verifier nghiêm ngặt đạt/không đạt, kiểm tra tệp đầu ra của agent dựa trên $W$
- $\Phi_{W}$: tiềm năng tiến độ, được trình bày chi tiết ở mục 3

Một điểm neo này, từ gốc, loại bỏ trôi dạt artifact. Bởi vì chân lý đúng ngay từ cách xây dựng, bởi vì thao tác render có thể khôi phục khứ hồi (round-trip), bởi vì hư hỏng đã được khai báo và có thể đảo ngược, nên **không gian làm việc ban đầu $s_0$ của agent hoàn toàn quyết định $W$** — đáp án đúng có thể được tính ra từ chính nội dung agent nhìn thấy, không cần chạy bộ giải.

### 1.2 Ba hệ quả

Điểm tuyệt đẹp của thiết kế này là nó tiện tay giải quyết luôn ba vấn đề mà các phương án khác phải dùng thêm công cụ mới để xử lý.

**Hệ quả một: độ khó là một nút điều chỉnh có kiểm soát, không phải may mắn.**

Vì $W$ được dựng trước, nên «phóng to thêm một chút» là thao tác thuần mã, không cần bắt mô hình sinh lại bất cứ thứ gì. Bậc quy mô (scale tier, mặc định unit / small / full) điều khiển $|W|$, còn độ sâu phụ thuộc của DAG quy trình làm việc điều khiển «phải hoàn thành bao nhiêu giai đoạn mới lấy được đầu ra đúng». Hai nút điều chỉnh này độc lập với nhau.

**Hệ quả hai: trạng thái trung gian đến miễn phí.**

Vì mọi trạng thái trung gian đúng đều là một bản render của $W$, nên việc chấm điểm không cần nhãn bước thủ công, không cần huấn luyện một process reward model, không cần dùng ngôn ngữ mô hình làm giám khảo. $\Phi$ là xác định, có thể tái lập, và không gọi mô hình lần nào.

**Hệ quả ba: chi phí biên cực thấp.**

Việc sinh một môi trường (bao gồm chạy hai bộ giải tham chiếu, niêm phong bộ test ẩn, xem trước tiềm năng tiến độ) chỉ mất trung vị **30 giây thời gian CPU** (phân vị 90 là 82 giây), **không gọi mô hình lần nào**. Đây là khác biệt về đẳng cấp lượng so với công sức giờ của chuyên gia viết tay (hàng giờ cho mỗi bài). Và chi phí viết bộ sinh một lần duy nhất có thể được phân bổ dần cho tất cả các seed và bậc quy mô của nó.

Đắt hơn nữa: bài báo chỉ ra rằng Tev-Gym có thể mở rộng thêm — để coding agent viết bộ sinh, bộ sinh này hàng loạt tạo ra môi trường mới xuyên seed và xuyên bậc quy mô, **toàn bộ quá trình không cần gọi bất kỳ mô hình nào nữa**.

---

## Hai, mổ xẻ phương pháp: pipeline tổng hợp môi trường sáu giai đoạn

Mục 2.1 chia quá trình tổng hợp môi trường thành sáu giai đoạn. Toàn bộ pipeline **không có sự tham gia của bất kỳ ngôn ngữ mô hình nào**.

### Giai đoạn 0: nguồn tác vụ

Đối với bảy miền con tính toán và toán học của ALE-CM (tương ứng với bảy lĩnh vực lớn của Tev-Gym), trước tiên mỗi lĩnh vực thiết lập một **kho đặc tả tác vụ thực**:

| Miền con | Tên | Phạm vi bao phủ |
|------|------|----------|
| 9.1 | Software Engineering | Hiện thực chức năng, gỡ lỗi, tái cấu trúc, viết test |
| 9.2 | Data & Analytics Engineering | Pipeline ETL/ELT, hệ thống xếp hạng đề xuất, kỹ thuật đặc trưng |
| 9.3 | AI Engineering, Safety & CS Research | Pipeline huấn luyện đánh giá mô hình, tái tạo bài báo, quản lý checkpoint, thí nghiệm căn chỉnh |
| 9.4 | Mathematical & Operations Research | Tối ưu tổ hợp, cân bằng trò chơi, toán học ứng dụng và số học, ước lượng xác suất và lọc nhiễu |
| 9.5 | Cybersecurity & Digital Forensics | Kỹ thuật đảo ngược, trích xuất cấu hình mã độc, phân tích gói mạng, pháp y hiện trường sự cố |
| 9.6 | Infrastructure Engineering & Cloud Operations | Di chuyển và cấu hình K8s, phân tích nguyên nhân gốc sự cố sản xuất, gia cố OS, IaC |
| 9.7 | Quantum Computing | Xây dựng và mô phỏng mạch lượng tử, phân tích mã sửa lỗi, mô phỏng nhiễu |

Nguồn của kho đặc tả bao gồm: các đặc tả đào từ internet, 82 cuộc thi Kaggle của MLE-bench, cùng tài liệu tham khảo công khai cho miền lượng tử (không có benchmark nào phủ sát) như bộ mạch MQT Bench, sổ tay Qiskit Experiments, các ví dụ DMRG của TeNPy.

Từ trong kho, lấy mẫu ngẫu nhiên một đặc tả, rồi **tự viết một bộ sinh riêng cho từng đặc tả**. Chú ý ranh giới ở đây: bộ sinh tham chiếu cấu trúc và độ khó của đặc tả, **tuyệt đối không sao chép** prompt, đầu vào, đáp án hay văn bản chấm điểm của nó.

Ba bộ lọc:
- **Lọc khả thi**: chỉ giữ lại các đặc tả mà «chân lý đúng biết được ngay từ cách xây dựng» và «thực thi hàng loạt được bằng CPU thuần», loại bỏ những đặc tả phụ thuộc dịch vụ trực tuyến, âm thanh hình ảnh, chuỗi công cụ nặng, GPU kernel, hoặc các tác vụ mở kiểu «tối ưu đi một chút».
- **Cổng tương đồng**: so sánh code, đặc tả và dữ liệu sinh ra của bộ sinh mới với tất cả các bộ sinh đã đăng ký, từ chối các bản gần trùng lặp.
- **Đánh giá đối kháng**: tấn công từng đặc tả đã qua hai vòng trước, tìm đường tắt ẩn, độ dài quá ngắn, nguồn gốc bị giả dạng.

### Giai đoạn 1: xây dựng thế giới

Mỗi bộ sinh là một **chương trình có seed**. Với `(seed, scale_tier)` đã cho, nó sinh lập trình latent world $W$ và làm hai việc:

1. **Kiểm tra bất biến**: định danh duy nhất, kết nối hợp lệ, đo lường hữu hạn.
2. **Trích xuất kế hoạch khuyết điểm (defect plan)**: chỉ rõ chính xác những bản ghi, shard, trường dữ liệu nào trong $W$ sẽ bị hư hỏng, và bởi toán tử đã khai báo nào.

Kế hoạch khuyết điểm này «sinh từ seed», nên cùng một bộ sinh dưới hai seed khác nhau chắc chắn tạo ra hai thế giới khác nhau có thể chứng minh được.

### Giai đoạn 2: đồ thị quy trình làm việc

Biên dịch quy trình làm việc của môi trường thành **đồ thị có hướng không chu trình (DAG)**, với phụ thuộc tường minh, khả năng song song hóa, và ước lượng khối lượng công việc ngữ nghĩa cho từng giai đoạn. Ví dụ với kịch bản ETL kho bán lẻ:

```
profile-sources → reconcile-facts / normalize-dimensions → load-facts
                → aggregate-validate → package-sidecars
```

**DAG này do code sinh ra dựa trên quy mô của $W$, trong quá trình không có sự tham gia của mô hình.**

Hai đặc tính then chốt của DAG:

- **Đường dẫn then chốt** (chuỗi giai đoạn phụ thuộc dài nhất) định nghĩa **tầm nhìn (horizon)** của tác vụ.
- **Các giai đoạn riêng lẻ tạo nên khung xương của tiềm năng tiến độ** (mục 3).

Chú ý một lựa chọn phương pháp luận trong bài báo: **đo tầm nhìn bằng đường dẫn then chốt của DAG chứ không dùng độ dài rollout thực tế $T$**, vì $T$ sẽ bị thổi phồng lên do agent đi vòng. Độ sâu DAG mang tính cấu trúc và có thể kiểm soát được.

### Giai đoạn 3: render artifact

Chiếu $W$ lên các giao diện công khai mà môi trường khai báo, hiện thực hóa thành định dạng dòng mục tiêu:

- Phân vùng CSV / TSV
- Bản ghi JSON
- Cơ sở dữ liệu SQLite
- Shard safetensors
- Tệp nhị phân đã khử ký hiệu
- Manifest hạ tầng

**Render là một hàm thuần của $W$.** Và trước khi đi tiếp, pipeline sẽ **khẳng định rằng nó có thể khôi phục khứ hồi** — tức là khôi phục chính xác $W$ từ các tệp đã render.

### Giai đoạn 4: hư hỏng có kiểm soát

Áp dụng kế hoạch khuyết điểm của giai đoạn 1 lên các tệp đã render, tiêm vào trôi dạt schema, bản ghi trùng lặp và thiếu, trôi dạt phân lớp, chỉ mục shard bị xáo trộn, cache cũ, v.v.

Cây bị hư hỏng $s_0$ chính là tác vụ agent nhận, còn $W$ không bị thay đổi chính là chân lý đúng.

### Giai đoạn 5 và 6: đặc tả công khai và bộ test ẩn

**Giai đoạn 5** xuất ra hợp đồng công khai $x$: vai trò đầu vào, các artifact đầu ra cần thiết cùng schema của chúng, các yêu cầu có thứ tự, quy tắc ưu tiên có thẩm quyền, và chuỗi công cụ được phép. Đây là **mô tả duy nhất** mà agent nhìn thấy được.

**Giai đoạn 6** niêm phong bộ test ẩn ngoài tầm nhìn của agent, dùng cho các giai đoạn kiểm chứng:
- **Biến đổi hình thái (metamorphic transform)**: bản viết lại giữ nguyên ngữ nghĩa, **không được** thay đổi điểm số.
- **Phản thực tế đầu ra cũ (stale-output counterfactual)**: trạng thái trông hợp lý nhưng sai, **phải** bị phán định là không đạt.

Tầng này có tác dụng ngăn verifier quá hẹp, và ngăn việc «nộp một kết quả cũ nhưng trông hợp lý» lách qua.

### 2.2 Độ phủ, hiệu chuẩn và tám cổng đủ điều kiện

**Tính đa dạng.** Mỗi môi trường được gán nhãn trên **19 trục phủ sóng**: miền con, quy mô, bốn trục tầm nhìn, giai đoạn quy trình làm việc, năng lực công cụ, vai trò artifact, kiểu quan hệ, loại hư hỏng, v.v.

Bài báo đặc biệt nhấn mạnh giá trị của «trục hành vi»: thay đổi giá trị của một trục sẽ làm thay đổi agent **phải sửa cái gì** (loại hư hỏng), **sửa như thế nào** (giai đoạn quy trình làm việc, năng lực công cụ), **sửa qua những tệp nào** (vai trò artifact, kiểu quan hệ).

**Độ khó có thể kiểm soát.** Hai điều khiển: bậc quy mô (unit / small / full) kéo dài độ dài thao tác; độ sâu phụ thuộc DAG cộng với số lượng loại hư hỏng quyết định «phải hoàn thành bao nhiêu giai đoạn, theo thứ tự nào».

Một con số cụ thể để cảm nhận: với các bộ sinh được hiện thực ở cả ba bậc quy mô, cây đầu vào trung vị tăng từ **17 tệp / 51 KB (unit)** lên **20 tệp / 168 KB (small)**, rồi lên **28 tệp / 586 KB (full)**, trong khi **DAG quy trình làm việc giữ nguyên**.

**Tám cổng đủ điều kiện.** Một môi trường tổng hợp chỉ được chấp nhận sau khi vượt qua cả tám cổng độc lập với benchmark, mỗi cổng được kiểm tra tự động lúc sinh và tương ứng với một loại thất bại có tên:

| Cổng | Yêu cầu bắt buộc | Loại thất bại mà nó nhắm tới |
|------|----------|--------------|
| Nhân quả của phần thưởng | Mỗi thành phần phần thưởng phải giảm điểm khi bị biến đổi theo nhân quả | Thưởng cho kết quả sai |
| Chống khai thác | Cả **14 đầu dò gian lận** phải đạt 0 điểm | Lỗ hổng verifier, đường tắt bị chấp nhận |
| Độc lập vai trò | Code của bộ giải tham chiếu / bộ giải thay thế / verifier nghiêm ngặt / bộ chấm điểm tiến độ **đóng kín, không giao nhau** | Bộ giải và bộ chấm chia sẻ thiên lệch |
| Nhất quán bộ giải | Hai bộ giải viết độc lập phải tạo ra cây đầu ra hoàn toàn giống nhau trên mọi seed | Chỉ verifier đạt, đặc tả chưa được giải |
| Hiệu lực tiến độ | Trên trạng thái đúng một phần có $0<\Phi<1$; tăng đơn điệu lên 1 theo đường tham chiếu; tạo gia tăng âm khi lùi | Tín hiệu tiến trình vô hiệu |
| Bất biến hình thái | Bản viết lại giữ nguyên nghĩa không đổi điểm số; đầu ra cũ phải thất bại | Verifier quá hẹp, trạng thái cũ bị chấp nhận |
| Đa dạng sáu seed | Ít nhất 6 seed tạo ra danh tính thế giới / hash cây công khai / ID tác vụ khác nhau | Môi trường thoái lui, lặp khuôn mẫu |
| Vệ sinh hợp đồng công khai | Trong prompt và cây công khai không được xuất hiện bất kỳ thẩm quyền riêng tư, đáp án tham chiếu hay code verifier nào | Rò rỉ đáp án |

Về **đầu dò gian lận (gaming probe)**, bài báo liệt kê 14 chiến lược gian lận, gồm: đầu ra rỗng, đầu ra tối thiểu nhưng hợp lệ về schema, sao chép đầu vào, hardcode theo một seed, path traversal, truy vấn riêng tư, v.v. Mỗi chiến lược đều phải đạt 0 điểm đồng thời dưới cả verifier nghiêm ngặt lẫn bộ chấm điểm tiến độ.

Về **độc lập vai trò**, điều này đáng để tách ra nhấn mạnh. Nó đòi hỏi:

$$\operatorname{ver}_W(\pi^{\mathrm{ref}}(s_0))=\Phi_W(\pi^{\mathrm{ref}}(s_0))=1,\quad \pi^{\mathrm{ref}}(s_0)=\pi^{\mathrm{alt}}(s_0)$$

Bộ giải tham chiếu $\pi^{\mathrm{ref}}$ (điểm chính xác 1.0) và bộ giải thay thế $\pi^{\mathrm{alt}}$ được **viết độc lập** phải tạo ra cây đầu ra hoàn toàn giống nhau trên mọi seed. **Chỉ cần không khớp, là coi như đặc tả chưa được giải và trực tiếp từ chối môi trường đó.**

Bài báo giải thích ý nghĩa của thiết kế này: việc kiểm toán bộ giải độc lập với verifier — cả hai bộ giải đều không import code của verifier — nên sự nhất quán giữa chúng là bằng chứng về **chính đặc tả**, chứ không phải bằng chứng về **bộ chấm điểm**.

---

## Ba, phần thưởng mật độ: từ tiềm năng tiến độ đến PPRS

### 3.1 Vì sao phần thưởng kết thúc lại «bỏ đói» RL tương đối trong nhóm

Xét trước lợi thế tương đối trong nhóm của GRPO:

$$\hat{A}_i=\frac{R_i-\operatorname{mean}(R_{1:G})}{\operatorname{std}(R_{1:G})+\epsilon}\tag{2}$$

Trong đó $R_i=\mathds{1}[\tau_i\ \text{passes}]$, tức chỉ bằng 1 khi rollout có nộp bài và bị verifier nghiêm ngặt $\operatorname{ver}_W$ chấp nhận.

**Vấn đề cốt lõi**: nếu một nhóm $G$ rollout đều thất bại, thì $R_1=\cdots=R_G=0$, suy ra mọi $\hat{A}_i=0$. Tác vụ này đóng góp bằng không vào gradient, và cả $G$ rollout đó đều vô hiệu.

Tỷ lệ lãng phí là $(1-p)^G$:

| Tỷ lệ đạt $p$ | Tỷ lệ nhóm lãng phí khi $G=8$ |
|------------|---------------------|
| 0.05 | 66% |
| 0.01 | 92% |

Bài báo còn chỉ ra một vấn đề tinh vi hơn: **ngay cả khi chỉ có một rollout thành công trong một nhóm thì cũng không khá hơn nhiều.** Mẫu dương đó phải đối mặt với $G-1$ mẫu âm, tất cả mẫu âm nhận cùng một lợi thế âm, và gradient **không phân biệt được «sai lệch một chút» với «hoàn toàn không có tiến triển»**.

Trên tác vụ dài hạn, $p$ của các mô hình mở nguồn chưa huấn luyện nằm ở khoảng một phần mười hoặc thấp hơn. Vì vậy các cách làm như «vứt bỏ nhóm toàn thất bại» hay «lấy mẫu lại», áp dụng vào tác vụ dài, sẽ vứt bỏ phần lớn batch.

### 3.2 Tiềm năng tiến độ: thước đo xác định đến từ latent world

Mỗi môi trường Tev-Gym đều cung cấp một **hợp đồng tiến độ**: một tập nút $V$, mỗi nút là một trạng thái có thể kiểm tra của không gian làm việc đầu ra, bắt nguồn từ DAG quy trình làm việc ở giai đoạn 2. Các nút mang trọng số $w_v>0$, $\sum_v w_v=1$, cùng tập phụ thuộc tiền điều kiện $\mathrm{pre}(v)$.

Bộ chấm điểm từng phần $c_v(s)\in[0,1]$ chấm trực tiếp không gian làm việc hiện tại $s$ của agent dựa trên latent world.

**Tín dụng được cổng phụ thuộc tiền điều kiện (prerequisite-gated)**: $\tilde{c}_v(s)$ lấy điểm phần nhỏ nhất trong số $v$ và tất cả các nút tiền điều kiện trực tiếp và gián tiếp của nó.

Vậy tiềm năng tiến độ là:

$$\Phi(s)=\sum_{v\in V}w_v\,\tilde{c}_v(s)\in[0,1]\tag{3}$$

Thiết kế này mang lại ba đặc tính được cổng đảm bảo cưỡng chế:

- **Có neo (chống khai thác)**: cây công khai chưa sửa đổi và mọi đầu dò gian lận đều đạt chính xác $\Phi=0$; khi verifier nghiêm ngặt chấp nhận thì đạt chính xác $\Phi=1$.
- **Đơn điệu (hiệu lực tiến độ)**: tăng lên khi nút hoàn thành, giảm xuống khi công việc đã hoàn thành bị phá hủy.
- **Độc lập (độc lập vai trò)**: code của bộ chấm điểm đóng kín và không giao với verifier, bộ giải tham chiếu, một khuyết điểm của bộ chấm này không được bộ khác kế thừa. Hơn nữa, các code chấm điểm này **không được phát hành** cùng cây công khai.

Bài báo đặc biệt nhấn mạnh «thiết kế phần thưởng có thể mở rộng»: vì latent world đã được định nghĩa trước khi tạo tác vụ, mọi trạng thái trung gian đúng đều có thể render trực tiếp và được $c_v$ đánh giá. Điều này cung cấp phản hồi tiến độ **chính xác, xác định**, và **không cần** nhãn bước thủ công, không cần huấn luyện mô hình phần thưởng, không cần ngôn ngữ mô hình làm giám khảo.

Đây chính là điểm phân tuyến căn bản nhất so với các phương án chủ đạo.

### 3.3 PPRS: định hình phần thưởng theo tiềm năng tiến độ

Giả sử trạng thái không gian làm việc của một rollout là $s_0,\dots,s_T$, trong đó $s_0$ là cây công khai chưa sửa đổi, nên $\Phi(s_0)=0$.

Tham chiếu định hình phần thưởng dựa trên tiềm năng (PBRS, Ng et al. 1999), phần thưởng định hình ở mỗi bước là biến đổi của tiềm năng:

$$r_t=\Phi(s_t)-\Phi(s_{t-1})$$

Tổng phần thưởng của rollout là:

$$R(\tau)=\mathds{1}[\tau\ \text{passes}]+\lambda\sum_{t=1}^{T}r_t=\mathds{1}[\tau\ \text{passes}]+\lambda\,\Phi(s_T),\tag{4}$$

trong đó **$\lambda=0.25$, mọi lần chạy thực nghiệm đều dùng giá trị này**.

Ở đây có bốn chi tiết thiết kế, mỗi chi tiết đều đáng tách ra riêng.

**Chi tiết một: PPRS cố ý không bảo toàn policy tối ưu.**

PBRS tiêu chuẩn đặt tiềm năng kết thúc bằng không, nhờ đó bảo toàn policy tối ưu. PPRS giữ lại $\lambda\Phi(s_T)$, **cố ý thay đổi mục tiêu tối ưu**. Đây là một sự lệch tình ý và có rủi ro, và bài báo thành thật thảo luận trong phụ lục về «điều gì được giữ lại, điều gì không được giữ lại».

**Chi tiết hai: nộp bài là hành động, không phải trạng thái.**

$\Phi$ chấm điểm không gian làm việc, còn thành phần kết cục chấm điểm không gian làm việc mà policy **nộp bài**. Một rollout đã hết lượt hoặc hết ngân sách token mà không nộp bài, **sẽ không được chấm điểm kết cục**, chỉ nhận $\lambda\Phi(s_T)$. Đây chính là lý do rollout «xây dựng đầy đủ nhưng chưa nộp bài» trong hình 4 đạt được $\Phi=1$ trong khi phần thưởng kết cục bằng 0.

**Chi tiết ba: phần thưởng chỉ phụ thuộc trạng thái cuối.**

Vì $\Phi$ chỉ là hàm của không gian làm việc, $R(\tau)$ chỉ phụ thuộc rollout qua trạng thái cuối $s_T$. Điều này nghĩa là **hai rollout đi qua các đường khác nhau, thứ tự bước khác nhau, cách hiện thực khác nhau, nhưng có cùng không gian làm việc cuối, sẽ nhận hoàn toàn giống nhau phần thưởng**. Điều này loại bỏ mọi thiên hướng thiếu chuẩn của phần thưởng đối với «phong cách quá trình».

**Chi tiết bốn: thứ hạng của phần thưởng kết cục vẫn nằm trên đỉnh.**

Vì $\Phi\le 1$, mọi rollout đạt đều nhận $1+\lambda=1.25$, cao hơn chặt chẽ bất kỳ rollout thất bại nào. Vì vậy không rollout nào được lợi nhờ «đánh đổi mức độ hoàn thành lấy tiến triển một phần». Phụ lục B đưa ra một chặn trên cho trường hợp sở thích có thể đảo ngược dưới policy ngẫu nhiên.

**Sau khi thế vào GRPO, vấn đề bỏ đói được khắc phục.**

Khi không rollout nào trong một nhóm đạt, phần thưởng trở thành $R_i=\lambda\Phi(s_T^{(i)})$. Chỉ cần các rollout tiến triển ở các độ sâu khác nhau, các phần thưởng này khác nhau, lợi thế trong nhóm khác không, và **rollout được xếp hạng theo độ sâu tiến triển**.

Hình 4 của bài báo minh họa trực quan tác dụng này: cùng một môi trường kho, nhóm $G=8$ rollout, chấm điểm theo thời gian thực ở mỗi vòng.

- **Chỉ phần thưởng kết thúc (đỏ)**: tất cả rollout đều được 0 điểm.
- **Phần thưởng tiệm tiến**: 2 rollout đã nộp kho chưa hoàn chỉnh (hình tròn), 5 rollout đã hết ngữ cảnh 65k token (dấu ×), 1 rollout đã dựng được kho đầy đủ.

Phần thưởng trong nhóm cuối cùng đã có sự khác biệt, và gradient cuối cùng đã có thứ để học.

### 3.4 So sánh với các cách làm đã có

| Phương án | Độ mịn tiến độ | Cần thêm mô hình | Nhược điểm chính |
|------|---------|------------|---------|
| Phần thưởng kết thúc (thưa) | Kết cục | Không | Nhóm toàn thất bại có lợi thế bằng không, lãng phí 66%–92% |
| Lọc bằng phần thưởng giống nhau / chọn tác vụ gần độ khó / thêm tiền tố chuyên gia | Kết cục | Cần tiền tố chuyên gia | Chỉ né tránh vấn đề, và vứt bỏ batch |
| Giám khảo học được | Trung gian | Cần huấn luyện bộ chấm | Đưa vào thiên lệch và chi phí huấn luyện bổ sung |
| Tín hiệu proxy như tỷ lệ test đạt | Thô | Không | Chỉ bắt được kết quả kết cục |
| **PPRS (bài này)** | **Từng giai đoạn quy trình làm việc** | **Không** | Cần bảo đảm latent world được xây dựng đúng |

---

## Bốn, thực nghiệm: Tev-27B mạnh đến nhường nào

### 4.1 Cấu hình huấn luyện

| Hạng mục | Cấu hình |
|------|------|
| Thuật toán | DPPO(Qi et al., 2026), phần thưởng theo công thức (4) |
| Base model | Qwen3.5-9B(dùng tập con 264 tác vụ bậc unit của Tev-Gym), Qwen3.8-27B(dùng toàn bộ corpus) |
| Kiểm chứng base model lớn hơn | GLM-5.3-Flash → Tev-320B |
| Lấy mẫu mỗi bước | 8 tác vụ × 24 rollout($G=24$) |
| Ngân sách phản hồi | 65,536 token mỗi rollout(16,384 mỗi lượt) |
| Giới hạn gọi công cụ | 64 lần |
| Sandbox | Chỉ mở một công cụ bash |
| Tính toán | 27B: 4 node B200 hoặc 8 node A100, khoảng 4 ngày |

### 4.2 Kết quả chính trên ALE-CM

ALE-CM là lát cắt tính toán và toán học của Agents' Last Exam. Các chỉ số là **điểm chấm trung bình (S@k)** và **tỷ lệ giải hoàn toàn (P@k)**, mỗi tác vụ 5 rollout.

| Mô hình | S@1 | S@5 | P@1 | P@5 |
|------|-----|-----|-----|-----|
| GPT-6 Astra (Codex) | 0.58 | 0.58 | 0.38 | 0.38 |
| Claude Opus 5 (Claude Code) | 0.51 | 0.53 | 0.38 | 0.38 |
| Claude Fable 5 (Claude Code) | 0.47 | 0.51 | 0.38 | **0.33** |
| Gemini 3.7 Flash (Gemini CLI) | 0.48 | 0.50 | 0.38 | 0.38 |
| Qwen3.8-27B (base) | 0.33 | 0.43 | 0.12 | 0.17 |
| **Tev-27B (của chúng tôi)** | **0.40** | **0.54** | **0.16** | **0.28** |
| Δ so với base | +0.07 | +0.11 | +0.04 | **+0.11 (↑65%)** |
| Qwen3.5-9B (base) | 0.25 | 0.33 | 0.06 | 0.06 |
| **Tev-9B (của chúng tôi)** | **0.29** | **0.40** | 0.07 | **0.11** |

Các điểm số cần đọc:

- **P@5 của Tev-27B là 0.28, ngang bằng GPT-6 Astra (0.28) và Claude Opus 5 (0.28)**, tức là đã bắt kịp các mô hình đóng thương mại tiên phong.
- So với Qwen3.8-27B trong cùng harness, Pass@5 **tăng 65%**(0.17 → 0.28).
- Đạt 85% mức 0.33 của Claude Fable 5, **lấp đầy hơn hai phần ba khoảng cách ban đầu**.
- Tev-27B vượt Qwen3.8-2.4T-A95B (một MoE với 2.4T tham số) trong cùng harness.
- Pass@5 của Tev-9B so với Qwen3.5-9B **tăng 83%**(0.06 → 0.11).

Cần lưu ý rằng bảng trên là **dữ liệu do bên bài báo báo cáo**. Kết luận P@5 ngang bằng dựa trên harness của từng bên (Codex / Claude Code / Vanillux2) và thiết lập đánh giá tương ứng; tính so sánh chặt chẽ giữa các harness khác nhau cần người đọc tự đánh giá.

### 4.3 Khái quát hóa zero-shot xuyên tầm nhìn

**Trong quá trình huấn luyện hoàn toàn không dùng bất kỳ tác vụ Terminal-Bench nào**, nhưng:

| Mô hình | TB 3.0-CM (22 tác vụ) P@1 | TB 4.0-CM (18 tác vụ) P@1 | TB 2.1 P@1 |
|------|--------------------------|--------------------------|-------------|
| Qwen3.8-27B (base) | 0.09 | 0.04 | 0.764 |
| **Tev-27B** | **0.14 (↑56%)** | **0.10 (↑150%)** | **0.794** |
| GLM 5.2 | 0.04 | 0.03* | — |
| Gemini 3.7 Flash | 0.07 | 0.09* | — |
| Claude Opus 4.8 | 0.19 | 0.27 | 0.789 |

(Kết quả có dấu * do bên bài báo tự đánh giá, không phải dữ liệu leaderboard chính thức.)

**Đây là kết quả thuyết phục nhất của toàn bài.** Sau khi huấn luyện trên ALE-CM, khi chuyển zero-shot sang Terminal-Bench 4.0-CM dài hơn, P@1 tăng 150%, và vượt qua GLM 5.2 cũng như Gemini 3.7 Flash. Đồng thời, TB 2.1 tầm trung bình **không suy giảm**, mà còn tăng nhẹ từ 0.764 lên 0.794, đạt cấp độ Claude Opus 4.8 (0.789) — cho thấy quá trình huấn luyện không làm tổn hại năng lực lập trình tổng quát.

Bài báo còn kiểm chứng tính đại diện của tập con: họ dùng Claude để phán đoán mỗi tác vụ TB có thuộc miền tính toán và toán học hay không (dù chỉ là gần đúng) để dựng tập con "CM", rồi so sánh thành tích leaderboard giữa tập con và toàn bộ; hệ số tương quan Pearson là **r=0.96** cho TB 3.0 P@1 và **r=0.97** cho TB 4.0 P@1. Tập con là đại diện.

### 4.4 Base model lớn hơn: Tev-320B

Áp dụng cùng bộ recipe đó lên GLM-5.3-Flash, thu được Tev-320B:

- TB 3.0-CM P@1 tăng 35%
- TB 4.0-CM P@1 tăng 28%
- Trên TB 4.0-CM, chỉ kém Claude Opus 5, Claude Fable 5 và GPT-5.6 (sol)

Điều này cho thấy **bản thân recipe không gắn với base model cụ thể nào**.

### 4.5 Thí nghiệm ablation

Các thí nghiệm ablation được tiến hành ở thiết lập 9B.

**Ablation về cách dựng dữ liệu:**

| Phương pháp | World | DAG | Chân lý ẩn | Tín hiệu | S@1 | S@5 | P@1 | P@5 | GPU-h/step |
|------|-------|-----|---------|------|-----|-----|-----|-----|------------|
| Qwen3.5-9B (base) | – | – | – | Không RL | 0.25 | 0.33 | 0.06 | 0.06 | – |
| **Tev-9B (của chúng tôi)** | ✓ | ✓ | ✓ | ΔΦ + kết cục | **0.29** | **0.40** | **0.07** | **0.11** | 9.0 |
| Verifier dựa trên public-view | ✓ | ✓ | LLM | Kết cục | 0.24 | 0.35 | 0.04 | 0.06 | 22.3 |
| Prompt-first | LLM | LLM | LLM | Kết cục | 0.23 | 0.32 | 0.06 | 0.06 | 11.8 |
| Sparse (chỉ kết cục) | ✓ | ✓ | ✓ | Kết cục | 0.25 | 0.32 | 0.06 | 0.06 | 16.7 |
| PPRS, pooled norm. | ✓ | ✓ | ✓ | ΔΦ + kết cục | 0.28 | 0.35 | 0.06 | 0.06 | 10.9 |
| Direct reward (cộng) | ✓ | ✓ | ✓ | Φ + kết cục | 0.29 | 0.35 | 0.06 | 0.06 | 9.7 |

Ba điểm đọc:

**Điểm đọc một: cả hai biến thể « thoái lui về LLM sinh » đều không hiệu quả, lại còn tốn kém hơn.**

- **Verifier dựa trên public-view**: để mô hình viết verifier từ góc nhìn của agent (từ bỏ chân lý ẩn). **88% các nhóm lấy mẫu bị loại bỏ trong quá trình huấn luyện**, tốn 22.3 GPU-h/step, gấp 2.5 lần phương pháp đầy đủ.
- **Prompt-first** (baseline self-instruct tiêu chuẩn): toàn bộ pipeline đổi thành «ra prompt trước, rồi ra đầu vào, verifier, lời giải», không có latent world cũng không có DAG.

S@1 của hai biến thể lần lượt là 0.24 và 0.23, **đều không vượt mức 0.25 của baseline**; còn phương pháp đầy đủ dẫn trước chúng 0.05–0.06 (S@1) và 0.05 (P@5).

**Điểm đọc hai: phần thưởng mật độ phải «định hình», không thể chỉ «cộng».**

- **Sparse (chỉ kết cục)**: S@1 = 0.25, đồng thời tốn nhiều GPU nhất (16.7).
- **PPRS, pooled norm.**(chuẩn hóa theo từng rollout)：S@1 = 0.28, có cải thiện nhưng P@1/P@5 không nhúc nhích.
- **Direct reward (cộng)**($\gamma=0$, dùng trực tiếp $\Phi(s_t)$ để cộng)：S@1 = 0.29, nhưng P@1 vẫn là 0.06.

PPRS đầy đủ so với phần thưởng thưa **tăng S@1 0.04**, và là **phương án duy nhất** nâng được P@1 từ 0.06 lên 0.07, P@5 từ 0.06 lên 0.11.

Giải thích của bài báo về việc tại sao phương án cộng không work rất đáng chú ý: **cộng trực tiếp sẽ thưởng lặp lại các trạng thái tiềm năng cao mà không truyền tín dụng về phía trước**, dẫn đến nhiều rollout hết cửa sổ ngữ cảnh trước khi nộp bài, tạo ra các đường đi dài hơn. Còn PPRS đầy đủ dùng return-to-go ($\gamma=1$) để truyền tín dụng về phía trước cho tiến triển, và dùng **lợi thế được chuẩn hóa theo chỉ số lượt** để giữ lại tín dụng của các lượt sau (tránh việc đem return nhỏ hơn ở lượt sau ra so sánh với trung bình của cả rollout).

**Điểm đọc ba: ở quy mô 27B, khoảng cách càng bị nới rộng.**

Bài báo chỉ rõ: ở 27B, phần thưởng đã định hình có thể huấn luyện đến mức hoàn thành, trong khi **phần thưởng chỉ-kết-cục tạo ra các nhóm gần như toàn lợi thế bằng không, không bước tối ưu hoàn chỉnh nào đi nổi**.

### 4.6 Trường hợp định tính: phân tích nguyên nhân gốc API thanh toán k8s

Bài báo đưa ra một trường hợp cụ thể trên ALE-CM ở miền Coding & System (mô hình viết ra báo cáo nguyên nhân gốc ở dạng JSON kèm chuỗi bằng chứng nguyên văn và kết luận rollback, dựa trên một lần kubectl fetch, YAML Deployment/HPA và log của một pod bị crash):

| Mô hình | Điểm | Điểm chính của đường đi |
|------|------|---------|
| Claude Fable 5 | **0.97** | t14 trích dẫn nguyên nhân probe `initialDelaySeconds: 5` và đo thời gian làm nóng cache `duration=6.67s`, kết luận rollback không an toàn; t18–21 kiểm tra từng chữ 41 chỗ trích dẫn rồi mới nộp bài |
| GPT-6 Astra | 0.75 | t6 dump trạng thái cụm và YAML một lần; t8 xác nhận xung đột giữa OOM kill và HPA, nhưng **tính an toàn của rollback chưa được kiểm chứng** (không trích dẫn phép đo làm nóng), thành phần này không được điểm |
| Qwen3.8-27B base | 0.70 | t12–16 đối chiếu từng byte dấu gạch ngang và khoảng cách cột, viết `build_rca.py` để trích xuất chính xác; kết luận `safe_to_rollback: false` |
| **Tev-27B** | **0.97** | t20 trích dẫn nguyên nhân probe và **xác nhận từng chữ các trích dẫn trong kế hoạch**; t30 **cân nhắc lại quyết định rollback**, kết luận `safe_to_rollback: true` |

Điểm thú vị nhất của trường hợp này là bước t30 của Tev-27B: «'started flapping after a routine chart-value change'… roll back first» → `safe_to_rollback: true`. **Nó đã lật ngược một phán đoán sớm của chính mình.** Dưới phần thưởng mật độ, agent nhận được phản hồi liên tục kiểu «tiến gần dần tới trạng thái đúng trên không gian làm việc», nên vì thế có năng lực ra quyết định «quay lại sửa» — thay vì như các mô hình chỉ được huấn luyện bằng phần thưởng kết thúc thuần túy, một khi đi lệch là không thể quay đầu.

---

## Năm, Đặc trưng dữ liệu Tev-Gym

### 5.1 So sánh với các corpus hiện hữu

| Dataset | Quy mô | Số miền | Thời gian agent trung vị (phút) | Oracle | Cách chấm điểm | Thưởng tiến trình | P@1 | P@8 |
|--------|------|------|----------------------|--------|----------|---------|-----|-----|
| SWE-Smith | 50.1k | 1 | 2.0 | unit test | đạt/không đạt | ✗ | 47% | 52% |
| Terminal-Universe | 32.0k | 3 | NA | pytest | đạt/không đạt | ✗ | NA | NA |
| TMAX-15K | 14.6k | 3 | 1.3 | unit test | đạt/không đạt | ✗ | 74% | 80% |
| SETA | 4.5k | 4 | 1.2 | unit test | tỉ lệ test đạt | ✗ | 80% | 88% |
| Endless Terminals | 3.3k | 2 | 0.5 | unit test | đạt/không đạt | ✗ | 83% | 89% |
| CLI-Gym | 1.7k | 4 | 1.9 | unit test | đạt/không đạt | ✗ | 69% | 74% |
| **Tev-Gym (của chúng tôi)** | **1,170** | **7** | **12.4** | **latent world** | **Φ theo từng pha + đạt/không đạt** | **✓** | **29%** | **40%** |

Thời gian agent trung vị của Tev-Gym là 12.4 phút, **xấp xỉ 6 lần corpus tốn thời gian nhất trước đây (SWE-Smith)**. Quy mô nhỏ hơn, nhưng độ phức tạp của mỗi task cao hơn nhiều — tỉ lệ đạt thấp nhất (29% so với 47%–83% của các corpus khác) chính là bằng chứng trực tiếp cho độ phức tạp đó.

### 5.2 Thống kê thành phần

| Lĩnh vực năng lực | Số môi trường task | Số pha (trung vị) | Số file đầu vào (trung vị) | Số lần hư hỏng (trung vị) | Số định dạng dòng | Base 27B P@1 | P@1 tiền tuyến |
|---------|-----------|-------------|--------------|------------|---------|-------------|----------|
| Math & Science | 264 | 6 | 8 | 1 | 7 | 0.04 | 0.31 |
| ML | 242 | 6 | 12 | 1 | 11 | 0.03 | 0.24 |
| Coding & System | 664 | 6 | 14 | 3 | 19 | 0.03 | 0.30 |
| **Tev-Gym (tổng)** | **1,170** | **6** | **12** | **2** | **15** | **0.03** | **0.29** |

Các con số chốt chặn khác:

- **Cân bằng**: điểm entropy chuẩn hóa $\mathrm{Balance}=\exp(H)/K$, đạt **0.89** trên ba lĩnh vực năng lực, **0.91** trên bảy miền (1 là phân bố hoàn toàn đều).
- **Tầm nhìn (horizon)**: số pha trung vị của môi trường là 6 pha quy trình làm việc (phạm vi 3–12), 8 nút tiến độ, 6 thành phần phần thưởng, 2 lần hư hỏng được tiêm vào (phạm vi 1–7). Số file được phơi bày cho agent có trung vị 12 file (tối đa 501 file), tổng cộng 51 KB (tối đa 6.1 MB), liên quan đến 23 loại định dạng dòng (32 phần mở rộng), prompt task có trung vị 583 token (tokenizer Qwen, tối đa 944).
- **Hành vi của base model**: trong harness huấn luyện, Qwen3.8-27B chưa huấn luyện dùng trung vị 19 lần gọi công cụ mỗi rollout và sinh ra 30k token, **52% rollout đã hết 65,536 token ngữ cảnh trước khi nộp bài**.
- **Độ khó**: dưới đầu dò rollout đơn lẻ, **chỉ 3.2% môi trường được giải hoàn toàn** (điểm chấm trung bình 0.06). Điều này cho thấy phần thưởng kết thúc thuần túy gần bằng không trên phần lớn corpus — đúng là regime mà mục 3 nhắm tới.
- **Khả năng tiếp cận của tiền tuyến**: trên tập con 92 môi trường, Gemini 3.6 Flash đạt pass@1 29%, pass@8 40%. Nhưng ở 26 môi trường trong số đó (cùng 52 môi trường được đầu dò thêm ở bậc small/full), **nó không giải được môi trường nào**, và có nhiều nhất chỉ nộp đáp án trong 29% số rollout. **Một phần đáng kể của Tev-Gym, với cách viết hiện tại, vượt quá năng lực của mô hình tiền tuyến.**

### 5.3 Khử nhiễm ô nhiễm

- Trong Tev-Gym, **không có môi trường nào** chia sẻ 13-gram hay 8-gram với bất kỳ task nào của ALE-CM, TB 3.0, TB 4.0, TB 2.1.
- Jaccard trung vị của prompt giữa task đánh giá và tập dữ liệu lân cận gần nhất: **0.13** cho TB 3.0/4.0, **0.22** cho ALE-CM, so với 0.24–0.25 và 0.28 khi so sánh các task trong cùng một benchmark.
- Sâu hơn nữa là **khử nhiễm ô nhiễm mang tính cấu trúc**: vì latent world được sinh thủ tục có hạt giống (seed), cây công khai của bất kỳ hai môi trường nào cũng khác nhau, và đều không chia sẻ với các instance đánh giá.

---

## Sáu, Hướng dẫn chi tiết: cách tái tạo phương pháp của Tev-Gym

Bài báo**chưa phát hành mã nguồn và dữ liệu của Tev-Gym** (nút Code và Data trên trang dự án vẫn ghi "soon"), **chỉ phát hành trọng số mô hình**. Vì vậy hướng dẫn dưới đây là **sổ tay tái tạo phương pháp** — tự hiện thực một pipeline tương đương theo đúng mô tả trong bài báo — chứ không phải script dùng ngay được.

### Bước 0: Chuẩn bị môi trường

```bash
# Python 3.10+，建议用 uv 或 venv
python3 -m venv .venv && source .venv/bin/activate
pip install numpy pandas scipy pytest

# 确认你的环境是「纯 CPU 可执行」的，这是可行性过滤的要求
python3 -c "import pandas, numpy; print(pandas.__version__, numpy.__version__)"
```

Toolchain phải được khai báo trong hợp đồng công khai của mỗi môi trường (ví dụ `python3`, `sqlite3`), không gian làm việc của agent ban đầu chỉ chứa cây công khai.

### Bước 1: Viết generator (lõi của pha 1–4)

Một generator chính là một **hàm thuần có hạt giống**: `make_world(seed, scale_tier) -> World`. Nó phải đáp ứng:

```python
import random, hashlib

def make_world(seed: int, tier: str = "unit"):
    """生成潜在世界 W。必须是 seed 的纯函数，无副作用，无模型调用。"""
    rng = random.Random(seed)

    # 规模档位决定 |W|
    n_customers = {"unit": 30, "small": 240, "full": 480}[tier]
    n_tx_per_month = {"unit": 48, "small": 480, "full": 960}[tier]

    world = {
        "customers": [
            {"id": f"C{i:05d}", "name": f"cust_{i}"}
            for i in range(n_customers)
        ],
        "products": [
            {"id": f"P{i:05d}", "sku": f"sku-{i:04d}", "price": round(rng.uniform(1, 500), 2)}
            for i in range(n_tx_per_month)
        ],
        "transactions": [],
    }

    # ---- 不变量校验（阶段 1）----
    assert len({c["id"] for c in world["customers"]}) == n_customers, "ID 必须唯一"
    assert all(t["qty"] > 0 for t in world["transactions"]), "度量必须有限"

    # ---- 缺陷计划（阶段 1）：精确指明要损坏什么 ----
    defect_plan = {
        "operators": ["duplicate_records", "missing_records", "schema_drift"],
        "targets": rng.sample(range(len(world["transactions"])), k=2),
    }
    world["_defect_plan"] = defect_plan
    return world
```

**Ba kỷ luật cứng**:

1. **Hàm thuần.** Không đọc thời gian, không đọc biến môi trường, không gọi mạng, không gọi mô hình. Cùng một `(seed, tier)` phải sinh ra hoàn toàn giống nhau.
2. **Kế hoạch khuyết điểm nằm trong thế giới.** Việc hư hỏng xảy ra sau khi render, và kế hoạch được suy ra từ seed — nhờ vậy "những gì bị hư hỏng" bản thân nó là một phần của thế giới và có thể được dựng lại độc lập.
3. **Không import mã verifier.** Đây là yêu cầu của cổng độc lập vai trò; ở pha chấm điểm sau, mã sẽ kiểm tra các đóng gói mã của chúng không giao nhau.

### Bước 2: Định nghĩa DAG quy trình làm việc (pha 2)

DAG quyết định tầm nhìn, đồng thời quyết định bộ khung của tiềm năng tiến độ.

```python
from dataclasses import dataclass

@dataclass(frozen=True)
class Stage:
    name: str
    depends_on: tuple[str, ...]      # 显式依赖
    weight: float                     # 进度节点权重
    parallel_with: tuple[str, ...] = ()  # 允许并行

WORKFLOW = (
    Stage("profile-sources",   (),                    0.15),
    Stage("reconcile-facts",   ("profile-sources",),   0.25),
    Stage("normalize-dimensions", ("profile-sources",), 0.15),
    Stage("load-facts",        ("reconcile-facts", "normalize-dimensions"), 0.20),
    Stage("aggregate-validate",("load-facts",),        0.15),
    Stage("package-sidecars",  ("aggregate-validate",), 0.10),
)

def critical_path():
    """最长依赖链 = 任务跨度。这是结构性的度量，不受 agent 绕路影响。"""
    memo = {}
    def depth(s):
        if s.name in memo: return memo[s.name]
        memo[s.name] = 1 + max([depth(d) for d in s.depends_on], default=0)
        return memo[s.name]
    return max(depth(s) for s in WORKFLOW)
```

Tổng các trọng số phải chuẩn hóa về 1 (tương ứng với $\sum_v w_v=1$ trong công thức (3)).

### Bước 3: Render và khẳng định khôi phục khứ hồi (pha 3)

```python
import csv, io, json, sqlite3, os, tempfile

def render(world, out_dir: str):
    """把 W 投影到公共接口。必须是 W 的纯函数，且能往返还原。"""
    os.makedirs(out_dir, exist_ok=True)
    with open(os.path.join(out_dir, "customers.csv"), "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["id", "name"])
        w.writeheader()
        w.writerows(world["customers"])
    with open(os.path.join(out_dir, "products.csv"), "w", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["id", "sku", "price"])
        w.writeheader()
        w.writerows(world["products"])
    # ... 其余格式：JSON / SQLite / safetensors / 基础设施清单 ...

def assert_roundtrip(world, out_dir):
    """从渲染出的文件精确恢复 W。这是整个方法的地基。"""
    with open(os.path.join(out_dir, "customers.csv")) as f:
        rows = list(csv.DictReader(f))
    recovered = {"customers": [{"id": r["id"], "name": r["name"]} for r in rows]}
    assert recovered["customers"] == world["customers"], "往返还原失败"
    # ... 逐个制品重复上述检查 ...
```

**Bước này là nền tảng của toàn bộ phương pháp, phải được khẳng định thành công vô điều kiện ngay lúc sinh.** Nếu khôi phục khứ hồi không thành lập, thì mọi suy luận "$s_0$ hoàn toàn quyết định $W$" ở phía sau cũng không thành lập.

### Bước 4: Áp dụng hư hỏng có thể đảo ngược (pha 4)

```python
def corrupt(world, out_dir):
    """按缺陷计划施加损坏。必须声明式、可逆。"""
    plan = world["_defect_plan"]
    for idx in plan["targets"]:
        op = plan["operators"][idx % len(plan["operators"])]
        if op == "duplicate_records":
            # 复制一条交易记录
            path = os.path.join(out_dir, "transactions.csv")
            with open(path) as f:
                lines = f.readlines()
            lines.append(lines[1])
            with open(path, "w") as f:
                f.writelines(lines)
        elif op == "missing_records":
            path = os.path.join(out_dir, "transactions.csv")
            with open(path) as f:
                lines = f.readlines()
            del lines[1]
            with open(path, "w") as f:
                f.writelines(lines)
        elif op == "schema_drift":
            path = os.path.join(out_dir, "customers.csv")
            with open(path) as f:
                lines = f.readlines()
            lines[0] = lines[0].replace("name", "full_name")  # 列名漂移
            with open(path, "w") as f:
                f.writelines(lines)
```

**Điểm mấu chốt**: việc hư hỏng phải **được khai báo và có thể đảo ngược**. Chỉ khi đó $s_0$ mới hoàn toàn quyết định $W$, và đáp án đúng mới có thể được tính ra từ những gì agent nhìn thấy.

### Bước 5: Viết verifier nghiêm ngặt và bộ chấm điểm tiến độ (pha 5–6)

Hai thứ này **bắt buộc phải là hai đoạn mã rời nhau không giao nhau**.

```python
# verifier.py —— 严格通过/不通过，只看最终产出
def verify(world, output_dir) -> bool:
    """对照 W 检查 agent 的输出文件。严格、确定性、无副作用。"""
    for path, checker in world["_verifiers"]:
        if not checker(world, os.path.join(output_dir, path)):
            return False
    return True

# progress.py —— 进度打分器，独立代码闭包
def partial_score(world, output_dir) -> dict:
    """对每个进度节点给出 [0,1] 的部分分数。"""
    return {v: checker(world, output_dir) for v, checker in world["_partial_scorers"].items()}

def progress_potential(world, output_dir) -> float:
    """式 (3)：前置依赖门控的加权求和。"""
    scores = partial_score(world, output_dir)
    gated = {}
    for v, s in scores.items():
        pre = world["_prereqs"][v]
        gated[v] = min([scores[v]] + [gated[p] for p in pre]) if pre else scores[v]
    return sum(world["_weights"][v] * gated[v] for v in scores)
```

Điểm mấu chốt khi hiện thực cổng phụ thuộc tiền điều kiện: **phải tính theo thứ tự topo**, vì $\tilde{c}_v$ phụ thuộc vào $\tilde{c}$ của các node tiền nhiệm, chứ không chỉ vào điểm gốc.

### Bước 6: Chạy tám cổng đủ điều kiện

Đây là bước dễ bị bỏ qua nhất, nhưng lại **không nên bỏ qua nhất**.

```python
GAMING_PROBES = [
    "empty_output", "minimal_schema_valid", "copied_input",
    "single_seed_hardcode", "path_traversal", "private_lookup",
    # ... 补齐 14 种
]

def qualify(world, out_dir, reference_solver, alternative_solver):
    # 1. 奖励因果性：变异原因后，对应分量必须掉分
    # 2. 抗利用性：14 个作弊探针在 verifier 和 scorer 下都得 0
    for probe in build_gaming_probes(world, out_dir):
        assert not verify(world, probe)
        assert progress_potential(world, probe) == 0.0, f"{probe} 探针得分非零"
    # 3. 角色独立性：检查 import 闭包互不相交
    assert code_closures_disjoint(world)
    # 4. 求解器一致性：两个独立求解器必须产出相同输出树
    assert reference_solver(world) == alternative_solver(world), "规格未解决"
    # 5. 进度有效性
    assert 0.0 < progress_potential(world, partial_state) < 1.0
    # 6. 变形不变性
    # 7. 六种子多样性：>=6 个种子产出不同的世界身份/公共树哈希/任务 ID
    # 8. 公开契约卫生：prompt 与公共树中不含私有权威
    return True
```

**Cổng tính nhất quán của solver là cổng có giá trị nhất.** Khi hai solver được viết độc lập cho ra kết quả khác nhau trên cùng một đặc tả, điều đó cho thấy chính đặc tả mang tính mơ hồ — lúc đó nên loại bỏ môi trường, chứ không nên để mô hình đi đoán.

### Bước 7: Hiện thực phần thưởng PPRS

```python
import numpy as np

LAMBDA = 0.25  # 论文中所有运行均为 0.25

def rollout_reward(workspace_states, passed: bool) -> float:
    """
    式 (4)：R(τ) = 1[passes] + λ * Φ(s_T)

    注意 telescoping：Σ ΔΦ = Φ(s_T) - Φ(s_0) = Φ(s_T)，因为 Φ(s_0)=0。
    """
    phi_final = workspace_states[-1]
    return (1.0 if passed else 0.0) + LAMBDA * phi_final

def grpo_advantages(rewards):
    """式 (2)：组内相对优势值。"""
    r = np.asarray(rewards)
    return (r - r.mean()) / (r.std() + 1e-6)
```

**Ba điểm cấu hình quan trọng nhất khi huấn luyện** (đây là những điều bài báo nêu rõ, cũng là những chỗ dễ làm sai nhất):

1. **Chuẩn hóa lợi thế theo từng lượt (per turn)**, chứ không phải theo cả rollout (pooled). Cách trước giữ lại tín hiệu credit của các lượt sau.
2. **return-to-go với $\gamma=1$**, truyền tiến bộ ngược về những hành động sớm hơn.
3. **$\lambda=0.25$**.

So sánh với cách làm sai:

```python
# ❌ 反面：直接相加的奖励（论文消融里 S@1=0.29 但 P@1=0.06）
def bad_reward(workspace_states, passed):
    return (1.0 if passed else 0.0) + LAMBDA * sum(workspace_states)

# ❌ 反面：仅终止奖励（论文消融里 S@1=0.25，27B 上一个完整优化器 step 都走不出去）
def bad_reward2(workspace_states, passed):
    return 1.0 if passed else 0.0
```

**Hai cách này trông gần như giống nhau ở S@1, nhưng tỉ lệ giải hoàn toàn P@1 sẽ bị kẹt ở mức baseline.** Bảng ablation của bài báo chính là nhờ khác biệt này mà lộ ra sự khác biệt căn bản giữa "hình dạng" và "phép cộng".

### Bước 8: Xây dựng corpus và mở rộng quy mô

```bash
# 跨种子、跨规模档位批量生成，全程零模型调用
for seed in $(seq 1 1000); do
  for tier in unit small full; do
    python3 build_env.py --seed $seed --tier $tier --out data/envs/
  done
done

# 每个环境的中位生成成本：30 秒 CPU，无模型调用
```

**Đây là đòn bẩy kỹ thuật đáng học nhất của bài báo**: chi phí viết generator một lần được san bằng bởi toàn bộ các seed và bậc quy mô của nó. Và khi hướng đi mà bài báo nhắc tới được hiện thực — để coding agent tự viết generator — pipeline này còn có thể tự động hóa thêm.

### Bước 9: Kiểm chứng khả năng khái quát và khử nhiễm ô nhiễm

```python
def decontamination_check(train_prompts, eval_prompts, n=13):
    """Tev-Gym 无任何环境与评测集共享 13-gram 或 8-gram。"""
    for name, ngram_n in [("13-gram", 13), ("8-gram", 8)]:
        eval_ngrams = set()
        for p in eval_prompts:
            eval_ngrams |= {tuple(p[i:i+ngram_n]) for i in range(len(p)-ngram_n+1)}
        for p in train_prompts:
            overlap = {tuple(p[i:i+ngram_n]) for i in range(len(p)-ngram_n+1)} & eval_ngrams
            assert not overlap, f"{name} 泄漏"
```

Đồng thời kiểm tra **khử nhiễm ô nhiễm mang tính cấu trúc**: hash cây công khai của bất kỳ hai môi trường nào phải khác nhau, và đều không chia sẻ với các instance đánh giá.

### Bước 10: Đánh giá

Giao thức đánh giá của bài báo nghiêm túc hơn đa số các bài khác, đáng học theo:

- **Thời gian agent là đo thực tế, không phải ước lượng**: ghi lại thời gian thực (wall-clock) từ hành động đầu tiên đến hành động cuối cùng của agent, bao gồm mọi lần gọi mô hình, lần thử lại và các lần thực thi lệnh trung gian.
- **Cần nới ngân sách so sánh**: 28% rollout của Tev-Gym tiêu tốn hơn 60 lượt gọi công cụ, nên với Tev-Gym phải nâng ngân sách lên mức không còn là ràng buộc (bài báo dùng 300 lượt gọi công cụ / 2 giờ wall-clock).
- **Lấy mẫu phải phân tầng**: bài báo rút 100 môi trường từ tổng cộng 1,170 môi trường, phân tầng theo bảy miền (seed 20260915).
- **Tính đại diện của tập con kiểm chứng**: dùng tương quan Pearson để kiểm tra sự nhất quán giữa tập con CM và kết quả leaderboard của toàn bộ tập (bài báo đạt r=0.96 / r=0.97).

---

## Bảy, Tổng kết: các luận điểm và kết luận chính của bài báo

### Luận điểm một: nút cổ chai của agent tầm nhìn dài không phải thuật toán, mà là dữ liệu và phần thưởng

Toàn bộ khung của bài báo dựa trên một quan sát: **sự thất bại của mô hình mã nguồn mở trên các task tầm nhìn dài chủ yếu không phải vì thuật toán tối ưu chưa đủ tốt, mà vì vừa không có dữ liệu huấn luyện, vừa không có công thức khả thi**.

Hai nút cổ chai quấn vào nhau: task dài thì vừa khó tạo ra vừa khó kiểm chứng, mà phần thưởng lại cực kỳ thưa. Giải quyết riêng lẻ đều không được — chỉ tạo dữ liệu sẽ cho ra một mô hình không huấn luyện nổi dưới phần thưởng thưa; chỉ thiết kế phần thưởng mật độ mà không có thế giới "đáp án đã biết" thì điểm tiềm năng bản thân nó không đáng tin.

### Luận điểm hai: hướng tổng hợp đúng là "suy ra câu hỏi từ đáp án"

Khẳng định này phổ quát hơn cả cách hiện thực cụ thể của bài báo.

> 「Khác với những pipeline buộc ngôn ngữ model sinh ra task, đầu vào và checker khi chưa có đáp án thật, latent world của chúng tôi đóng vai trò là sổ đáp án chính xác, dùng để kiểm chứng một cách đáng tin cậy.」

Bài báo xếp nó vào một họ kỹ thuật đã trưởng thành — suy ra task từ lời giải đã biết: khử nhiễm, tiêm lỗi có kiểm soát, biến đổi mã nguồn, truy vết ngược môi trường, dịch ngược chỉ thị, sinh câu đố theo chương trình. Nhưng khác biệt nằm ở chỗ: **những phương pháp đó hư hỏng ground truth của một artifact đơn lẻ, còn Tev hư hỏng một bản render của toàn bộ latent world**.

Khác biệt này tạo ra khác biệt về tính nguyên tử: task, verifier và tín hiệu tiến độ đều là hàm của cùng một thế giới, nên không thể trôi dạt lẫn nhau.

### Luận điểm ba: phần thưởng tiến độ phải "chứng minh được" chứ không phải "học được"

Các phương án phần thưởng mật độ phổ biến hoặc huấn luyện một process reward model, hoặc dùng evaluator theo kiểu học, hoặc dùng chính ngôn ngữ model làm giám khảo. Tất cả đều kéo theo model bổ sung, sai lệch bổ sung và chi phí huấn luyện bổ sung.

Cách làm của Tev là: **vì latent world đã được định nghĩa trước khi sinh task, nên mọi trạng thái trung gian đúng đều có thể được render trực tiếp và chấm điểm một cách tất định**. Không cần critic, không cần judge, không cần nhãn bước thủ công.

Đây là điểm có giá trị nhất về mặt phương pháp luận của toàn bộ bài: **biến câu hỏi "phần thưởng lấy từ đâu" từ "làm sao học một mô hình phần thưởng" thành "làm sao bảo đảm ground truth đã biết".**

### Luận điểm bốn: định hình phần thưởng phải cố ý lệch khỏi "tính bất biến của chiến lược tối ưu"

PBRS tiêu chuẩn sẽ đặt tiềm năng kết thúc bằng 0 để bảo đảm tính bất biến của chiến lược tối ưu. PPRS giữ lại $\lambda\Phi(s_T)$, **cố ý thay đổi mục tiêu tối ưu**.

Đây là một sự chấp nhận rủi ro rõ ràng. Bài báo không né tránh mà thảo luận trong phụ lục về "điều gì được giữ, điều gì không được giữ", đồng thời đưa ra các bound về thời điểm sở thích có thể đảo chiều dưới chính sách ngẫu nhiên.

**Rất nhiều bài báo sẽ giấu nhẹm sự lệch này hoặc giả vờ nó không tồn tại, còn Tev đặt nó lên bàn.** Đây là vấn đề thái độ nghiên cứu.

### Luận điểm năm: trong lĩnh vực này, chất lượng dữ liệu và quy mô dữ liệu đi ngược chiều nhau

Cách đọc Bảng 1 rất nghịch lý:

| | SWE-Smith | Tev-Gym |
|---|---|---|
| Quy mô | 50.1k | 1,170 |
| Số miền | 1 | 7 |
| Thời gian agent trung vị | 2.0 min | 12.4 min |
| Thưởng tiến trình | ✗ | ✓ |
| P@1 | 47% | 29% |

**Tev-Gym chỉ lớn bằng 1/40 các corpus có sẵn, nhưng lại chống đỡ được kết quả mạnh nhất.** Bởi vì ở các task tầm nhìn dài, "số lượng môi trường" đã không còn là nút cổchai từ lâu — **"trong môi trường có trạng thái trung gian nào kiểm chứng được hay không" mới là nút cổchai**.

Điều này cũng giải thích vì sao 1170 môi trường có thể huấn luyện ra mô hình sánh ngang GPT-6 Astra, còn 50 nghìn môi trường thì không.

### Luận điểm sáu: những bài học mang tính vận hành từ ablation

Ba kết luận có thể mang đi dùng ngay:

1. **Để mô hình tự viết verifier = 88% số nhóm bị loại bỏ + 2.5 lần compute + hiệu năng tệ hơn.** Thời gian tiết kiệm được khi sinh checker bằng LLM sẽ được trả lại đắt hơn ở pha huấn luyện.
2. **"Hình dạng" của phần thưởng mật độ quan trọng hơn "mật độ" của nó.** $\Phi(s_t)$ cộng trực tiếp trông ổn ở S@1 (0.29), nhưng P@1 hoàn toàn không nhúc nhích (0.06) — nó thưởng lặp đi lặp lại các trạng thái tiềm năng cao mà không truyền tín hiệu credit, khiến agent đi vòng vòng cho tới khi hết ngữ cảnh.
3. **Quy mô càng lớn, phần thưởng kết thúc thuần túy càng sụp đổ triệt để.** Trên 27B, phần thưởng chỉ có kết thúc tạo ra các nhóm gần như toàn bộ đều có lợi thế bằng 0, **không đi nổi một step tối ưu hoàn chỉnh nào**.

### Kết luận

Bài báo viết phần kết luận khá tiết chế:

> Chúng tôi đề xuất phương pháp latent world ưu tiên để mở rộng huấn luyện agent tầm nhìn dài có thể kiểm chứng. Mỗi task được dựng ngược từ một latent world đã biết là đúng, được render thành các file liên kết với nhau, bị biến đổi thông qua hư hỏng có kiểm soát, và được tái sử dụng cho cả kiểm chứng chính xác lẫn phần thưởng tiến độ mật độ. Chúng tôi hiện thực phương pháp này thành Tev-Gym — 1,170 môi trường đã được kiểm chứng trải rộng bảy miền — và chứng minh rằng việc huấn luyện đồng thời cải thiện các mô hình mã nguồn mở 9B và 27B trên ALE-CM, đồng thời phần cải thiện có thể chuyển sang các task Terminal-Bench với độ dài khác nhau cũng như một base model 320B.

Nó cũng thừa nhận rõ ràng các hạn chế:

> Một hạn chế của nghiên cứu hiện tại là tập trung vào các môi trường terminal tổng hợp, và trên những benchmark khó nhất, mô hình của chúng tôi vẫn còn khoảng cách so với agent tiền tuyến. Việc hỗ trợ các quy trình làm việc mới còn đòi hỏi phải viết và kiểm chứng thêm các thành phần môi trường.

---

## Tám, Phân rã triết lý thiết kế

Khi trừu tượng hoá cách làm của bài báo lên tầng triết lý, tôi thấy năm nguyên tắc hỗ trợ lẫn nhau.

### Nguyên tắc một: Nguyên tắc neo duy nhất (Single Anchor)

Một môi trường chỉ có một nguồn ground truth. Mọi artifact — task, đầu vào, verifier, tín hiệu tiến độ — đều là hàm của nó.

**Điều này chống lại "entropy" của việc sinh phân tán.** Khi bốn thành phần được sinh bởi các quy trình khác nhau, phân phối đồng của chúng sẽ trôi dạt; khi có một neo chung, sự trôi dạt về mặt cấu trúc là không thể xảy ra.

**Hệ quả**: nếu bạn nhận ra mình đang làm công việc căn chỉnh giữa hai bước "sinh task" và "sinh đáp án", hãy cân nhắc làm ngược lại.

### Nguyên tắc hai: Nguyên tắc ground truth đứng trước task (Ground Truth Precedes Task)

Task không phải được "sinh ra", mà được "suy ra".

Trước thời đại agent, câu này nghe có vẻ nhạt nhòa. Trong thời đại LLM sinh nội dung, nó trở nên táo bạo: **bạn đang yêu cầu một mô hình sinh ra một bài toán cần lời giải, ngay tại nơi chính nó cũng không biết lời giải.** Cả bài báo Tev, theo một nghĩa nào đó, là một sự phản biện có hệ thống với cách làm đó.

### Nguyên tắc ba: Nguyên tắc tính tất định hơn học tập (Determinism Over Learning)

Khi một đại lượng có thể được tính một cách tất định, đừng huấn luyện một mô hình để ước lượng nó.

| Nhu cầu | Cách làm phổ biến | Cách làm của Tev |
|------|---------|---------|
| Đánh giá bước đúng/sai | Huấn luyện PRM / evaluator theo kiểu học | Render trạng thái trung gian đúng và chấm điểm tất định |
| Đánh giá kết quả cuối đúng/sai | Sinh test case | Kiểm chứng nghiêm ngặt đối chiếu với $W$ |
| Đánh giá độ khó | Cho mô hình chạy thử rồi chấm điểm | Định nghĩa các đại lượng cấu trúc lúc sinh |

**Cái giá là bạn phải dựng đúng thế giới trước đã.** Đó là lý do Tev bỏ nhiều công sức cho đa dạng sáu hạt giống, tính nhất quán hai solver và kiểm toán độc lập vai trò — **vì một khi tiềm năng không đáng tin, cả chuỗi huấn luyện đều bị nhiễm độc.**

### Nguyên tắc bốn: Nguyên tắc cổng trước quy mô (Gates Before Scale)

Chặn những môi trường không đạt ngay lúc sinh, thay vì trông đợi RL ở phía dưới lọc mềm.

Bài báo so sánh rõ ràng lựa chọn này: 「Khác với những pipeline bỏ qua bước kiểm chứng và dựa vào RL phía dưới để lọc mềm các task không giải được, chúng tôi đặt chốt chặn ngay lúc sinh, bởi vì tín hiệu tiến độ mật độ chỉ hữu ích khi có tính nhân quả mạnh và kháng gian lận.」

**Câu này là khuyến nghị kỹ thuật thực dụng hữu ích nhất của toàn bài.** Sự lười mà bạn bỏ lỡ ở phía sinh dữ liệu sẽ được trả lại ở phía huấn luyện dưới dạng lãng phí compute và nhiễm tín hiệu — trong ablation của bài báo, verifier Public-view với 22.3 GPU-h/step chính là hóa đơn đó.

### Nguyên tắc năm: Nguyên tắc quy trình chính là artifact (Process as Artifact)

Tiềm năng tiến độ được định nghĩa là một cấu trúc dữ liệu tường minh gồm **tập node + phụ thuộc tiền điều kiện + trọng số**, chứ không phải một điểm số hộp đen.

Lợi ích mang lại không chỉ ở tính giải thích:

- Đường dẫn then chốt của DAG chính là đại lượng cấu trúc của tầm nhìn
- Cổng phụ thuộc tiền điều kiện tự nhiên hiện thực "phía trên chưa làm tốt, phía dưới không được điểm"
- Ablation có thể kiểm soát chính xác "dữ liệu đổi" hay "phần thưởng đổi"

**Khi phần thưởng được mô hình hóa tường minh thành cấu trúc, nó mới có thể được kiểm toán, chất vấn và phân rã.**

### Một đường chỉ triết lý ẩn: từ "sinh nội dung" đến "sinh thế giới"

Tôi nghĩ đây mới là tầng sâu nhất của bài báo.

Hai năm qua, paradigm của sinh nội dung AI là: **cho prompt, lấy mẫu đầu ra.** Mọi vấn đề chất lượng — ảo giác, thiếu nhất quán, không kiểm chứng được — đều bắt nguồn từ một giới hạn gốc: **không có nguồn tri thức nào độc lập với mô hình.**

Cách làm của Tev lật ngược paradigm: **cho một thế giới hoàn chỉnh đúng đắn, suy ra mọi artifact.** Mô hình lùi từ vị trí "nguồn của tri thức" về vị trí "người giải bài toán".

Trong khung này:

- Vấn đề ảo giác trở thành vấn đề kỹ thuật "khôi phục khứ hồi sau khi render thất bại"
- Verifier không đáng tin trở thành vấn đề kiểm tra tĩnh "các đóng gói mã có giao nhau hay không"
- Phần thưởng thưa trở thành một tính chất hình thức "hàm tiềm năng có đơn điệu hay không"
- Kiểm soát độ khó trở thành hai nút xoay "bậc quy mô × độ sâu phụ thuộc"

**Mỗi vấn đề AI vốn mờ nhạt đều được biến thành một vấn đề kỹ thuật có thể chứng minh, có thể kiểm thử, có thể kiểm toán.** Đây mới là chỗ thực sự quý giá của phương pháp "latent world ưu tiên" — nó không chỉ là một kỹ thuật sinh dữ liệu hiệu quả hơn, mà là một tư duy kỹ thuật hóa các vấn đề của hệ thống AI.

Và điều này cũng giải thích vì sao Tev-Gym chỉ có 1,170 môi trường mà vẫn thắng được: bởi vì **khi vấn đề đã được hình thức hóa đúng, tầm quan trọng của chiều "lượng" dữ liệu sẽ giảm mạnh.**

---

## Chín, Hạn chế, chất vấn và các điểm cần theo dõi tiếp

Đây là đánh giá của tôi, không phải tự tuyên bố của bài báo.

### Những hạn chế mà bài báo tự thừa nhận

1. **Tập trung vào môi trường terminal tổng hợp.** Chưa bao phủ GUI, dịch vụ trực tuyến thực tế, cộng tác multi-agent, v.v.
2. **Vẫn còn khoảng cách trên benchmark khó nhất.** Ở TB 4.0-CM, 0.10 của Tev-27B so với 0.52 của Claude Opus 5 — chênh lệch cả một bậc độ lớn.
3. **Hỗ trợ quy trình mới đòi hỏi đầu tư thêm.** Mỗi lĩnh vực mới đều phải viết generator, verifier, scorer và vượt qua tám cổng. Đây là chi phí nhân lực có thật, bài báo không định lượng nó.
4. **Mã nguồn và dữ liệu chưa được phát hành.** Nút Code và Data trên trang dự án đến nay vẫn ghi "soon", chỉ có trọng số mô hình. **Điều này có nghĩa hiện chưa thể kiểm chứng độc lập chất lượng tập dữ liệu, cũng không thể tái sử dụng trực tiếp.**

### Những chất vấn thêm của tôi

**Chất vấn một: $s_0$ có thực sự hoàn toàn quyết định $W$ hay không?**

Lập luận của bài báo là: render có thể khôi phục khứ hồi + việc hư hỏng đã được khai báo và có thể đảo ngược ⟹ $s_0$ hoàn toàn quyết định $W$. Nhưng suy luận này phụ thuộc vào việc "tập hợp toán tử hư hỏng là đóng, và nghịch đảo của mỗi toán tử đều tính được". Nếu có toán tử nào (ví dụ "trôi dạt category") không đảo ngược được trên một số dữ liệu (hai giá trị gốc khác nhau cùng ánh xạ về một giá trị bị trôi), thì về mặt nghiêm ngặt $s_0$ chỉ xác định được một **lớp tương đương** của $W$, chứ không phải $W$ itself.

Bài báo đề cập "biến đổi hình thái (metamorphic transform)" và "phản thực tế" trong bộ ẩn chính là để xử lý loại mơ hồ này, nhưng tôi cho rằng lập luận về tính tất định ở tầng cây công khai vẫn còn biên giới.

**Chất vấn hai: P@1 ở mức 0.03 của base model có quá thấp không?**

Qwen3.8-27B chưa huấn luyện trên Tev-Gym chỉ giải hoàn toàn 3.2% môi trường, điểm chấm trung bình 0.06. Điều này đúng là khớp với thực tế "task tầm nhìn dài rất khó", nhưng cũng có nghĩa là: **phần lớn tín hiệu huấn luyện đến từ $\Phi$ chứ không phải từ "thực sự làm đúng".** Mô hình có thể đang tối ưu "đường leo của hàm tiềm năng" thay vì "lời giải đúng của bản thân task".

Cổng bất biến dưới biến đổi và cổng phản thực tế với đầu ra cũ của bài báo có giảm nhẹ phần nào vấn đề này (chúng trực tiếp nhắm vào "đi tắt"), nhưng khoảng cách giữa "tối ưu theo đường leo ngắn nhất của hàm tiềm năng" và "thực sự hiểu task" thì bài báo không đo trực tiếp.

**Chất vấn ba: cần thận trọng khi diễn giải kết quả khái quát hoá sang TB.**

Tập con "CM" của TB 3.0/4.0 được **dựng bằng cách dùng Claude phán đoán từng task có thuộc miền tính toán và toán học hay không**. Dù bài báo đã xác minh tập con có tương quan cao với toàn bộ (r=0.96 / r=0.97), điều đó có nghĩa bản thân việc chia tập mang theo phán đoán của một mô hình tiền tuyến. Dùng tập con do Claude dựng để đánh giá một mô hình được so sánh với Claude thì tính tuần hoàn này không gây ra vấn đề nghiêm trọng, nhưng người đọc nên biết.

**Chất vấn bốn: cần định tính cụ thể cho cách nói "sánh ngang mô hình tiền tuyến".**

P@5 = 0.28 của Tev-27B ngang với 0.28 của GPT-6 Astra và Claude Opus 5 — đây là một con số rất ấn tượng. Nhưng:

- Tev-27B dùng harness Vanillux2, còn mô hình tiền tuyến dùng Codex / Claude Code, **bản thân harness ảnh hưởng rất lớn đến hành vi của agent**
- Trên ALE-CM, S@5 của mô hình tiền tuyến rõ ràng cao hơn (0.58 so với 0.54 của Tev-27B, và S@5/S@1 của GPT-6 Astra đều là 0.58), cho thấy **mô hình tiền tuyến làm triệt để hơn trên "những task đã làm đúng"**
- Dạng "bão hòa" P@5 = S@5 = 0.28 và dạng 0.16/0.28 (S@1/P@5) của Tev-27B mang ý nghĩa không giống nhau

**Quan điểm của tôi: đây là một bước tiến đáng kể trên một hướng thực sự có thể tái lập, nhưng cách nói "sánh ngang mô hình tiền tuyến" nên được hiểu với mức chiết khấu khi so sánh xuyên harness.**

**Chất vấn năm: nút cổchai của khả năng mở rộng sẽ dịch chuyển sang "việc viết generator".**

Bài báo chỉ ra rằng Tev-Gym có thể mở rộng thêm bằng cách để coding agent viết generator, và **không còn cần gọi mô hình nữa**. Nhưng bản thân mã generator vẫn phải vượt qua tám cổng, mà yêu cầu tính nhất quán hai solver đòi hỏi "hai solver được viết độc lập phải cho ra cùng kết quả" — **viết thủ công một generator thì dễ, nhưng viết cho nó hai solver độc lập và bảo đảm nhất quán thì khó hơn nhiều.**

Khi quy mô đẩy từ 1,170 lên 10,000, năng lực review generator thủ công sẽ trở thành nút cổhai thực sự. Bài báo không bàn tới điều này.

### Các điểm cần theo dõi tiếp

1. **Khi nào mã nguồn và dữ liệu được phát hành** — đây là cửa sổ quan sát quan trọng nhất. Nếu được phát hành, cộng đồng có thể kiểm chứng độc lập chất lượng thực tế của 1,170 môi trường.
2. **Có mở rộng được ra ngoài môi trường terminal không** (trình duyệt, GUI, toolchain thực) — điều này quyết định "latent world ưu tiên" là kỹ thuật chuyên biệt cho task terminal hay là một paradigm dùng chung.
3. **Đường cong chi phí** — mỗi lĩnh vực mới cần bao nhiêu giờ công nhân? Con số này quyết định trần khả năng mở rộng của phương pháp.
4. **Tương quan giữa $\Phi$ và năng lực giải thật** — nếu có thể đo trực tiếp "những quỹ đạo có tiềm năng cao hơn có khả năng thực sự giải đúng task cao hơn không", thì chất vấn hai của tôi sẽ được giải đáp.
5. **Đánh giá đầy đủ cho Tev-320B** — bài báo chỉ đánh giá phiên bản 320B trên tập con TB, diễn biến trên ALE-CM chưa rõ.

---

## Mười, Tóm tắt trong một câu

> **Để mô hình tự ra đề, nó sẽ chế ra cả đáp án sai nối.**
>
> Cách làm của Tev là đảo ngược thứ tự: trước tiên có một thế giới hoàn chỉnh đúng đắn, rồi suy ra từ đó task, đầu vào, verifier và thang đo tiến độ. Vì đáp án đã biết ngay trong cách dựng, việc kiểm chứng là chính xác, trạng thái trung gian là miễn phí, và tín hiệu huấn luyện có thể mật độ đến từng bước.
>
> 1,170 môi trường, một mô hình mã nguồn mở 27B, đạt Pass@5 bằng 0.28 trên phân mảnh tính toán và toán học của Agents' Last Exam, ngang với GPT-6 Astra và Claude Opus 5; đồng thời chuyển zero-shot sang tập con Terminal-Bench 4.0 chưa từng thấy, với P@1 tăng 150%.
>
> Số lượng chưa bao giờ là mâu thuẫn chính của lĩnh vực này. **"Đáp án lấy từ đâu" mới là.**

---

**参考链接**

- Trang tóm tắt bài báo：https://arxiv.org/abs/2610.18868
- Bản HTML đầy đủ của bài báo：https://arxiv.org/html/2610.18868v1
- PDF của bài báo：https://arxiv.org/pdf/2610.18868
- Trang dự án：https://tev-agent.github.io/
- Kho mã của trang dự án：https://github.com/tev-agent/tev-agent.github.io
- Trọng số mô hình Tev-27B：https://huggingface.co/gordonhu/Tev-27B
- Trọng số mô hình Tev-320B：https://huggingface.co/gordonhu/Tev-320B
- Trang bài báo trên Hugging Face：https://huggingface.co/papers/2610.18868

**延伸阅读**

- Agents' Last Exam（ALE）：https://arxiv.org/abs/2509.04142
- Terminal-Bench：https://www.tbench.ai/
- Group Relative Policy Optimization（Shao et al., 2024）：https://arxiv.org/abs/2402.12516
- Ng et al., 1999, Potential-based Reward Shaping：https://arxiv.org/abs/9901011
- DPPO（Qi et al., 2026）：xem danh mục tài liệu tham khảo của bài báo
- SWE-Smith（Yang et al., 2025）：https://arxiv.org/abs/2504.21798

以上，既然看到这里了，如果觉得不错，随手点个赞、在看、转发三连吧，如果想第一时间收到推送，也可以给我个星标，谢谢你看我的文章，我们，下次再见。

首发于微信公众号「瑞哥观势」。
