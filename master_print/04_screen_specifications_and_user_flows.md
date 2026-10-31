# MASTER PRINT — TẦNG 4: SCREEN SPECIFICATIONS & USER FLOWS (INSTAGRAM + TINDER ARCHITECTURE)

> **Single Source of Truth (SSOT)** — Đồng bộ với các màn hình thực tế của Pawty Super App.

---

## 1. Quy Chuẩn Giao Diện, Đăng Nhập 1 Thiết Bị & Header Động

1. **Màn hình Mở đầu (Load / Đăng nhập / Tạo tài khoản mới):**
   - Hiển thị 1 Logo chính thức (`/assets/pawty-logo-full.png`) cùng khẩu hiệu hệ sinh thái: **"Những bàn chân nhỏ đang tới"**.
   - **Chống bàn phím che ô nhập:** Tự động đẩy khung nhập liệu lên trên bàn phím (`KeyboardAvoidingView` + tự động cuộn `ScrollView` khi mở bàn phím) để người dùng bấm vào các ô cuối ở mục *Tạo tài khoản mới* không bị che khuất.
   - **Chỉ đăng nhập trên 1 thiết bị duy nhất (`Single-Device Login`):** Mỗi tài khoản chỉ có 1 phiên thiết bị hoạt động (`activeDeviceSessionId`). Khi đăng nhập trên thiết bị mới, phiên thiết bị cũ tự động bị thu hồi.
2. **Header Động theo từng Nhánh chính (`Dynamic Contextual Header`):**
   - **Không cố định cứng 1 Header cho mọi trang**, mà biến đổi theo từng nhánh chính:
     - **Nhánh `Khám phá`:** Trái: Nút `+` (Đăng bài) · Giữa: 1 Logo `Pawty` duy nhất · Phải: Nút `SOS` (mở trang SOS toàn màn hình) + Nút `Thông báo`.
     - **Nhánh `Kết nối` (Tinder):** Header 1 hàng duy nhất: Trái: Tiêu đề `Kết nối` kèm nhãn mục đích đang lọc (Tất cả / Tìm bạn chơi / Hẹn hò / Giao lưu) · Phải: Nút `Bộ lọc` (Mục đích duyệt & Hộ chiếu vị trí Passport VIP) + Nút `Menu phụ` (Hoàn tác quẹt VIP, Danh sách ai thích bạn VIP, Hồ sơ kết nối của tôi). Tách riêng bộ lọc đang xem khỏi mục đích công khai của người dùng.
     - **Nhánh `Tin nhắn`:** Trái: Tiêu đề `Tin nhắn` · Phải: Nút `Kết nối` + Nút `SOS` (tự động ẩn khi vào phòng chat chi tiết).
     - **Nhánh `Tôi` (Chuẩn Instagram):** Trái: Nút `+` · Giữa: Biểu tượng khóa `🔒` (nếu bật chế độ riêng tư) + `@username` + `⌄` · Phải: Nút `Plus` tinh gọn + Nút Menu `☰` (mở trang **Cài đặt của tôi**).
     - **Nhánh `SOS` (Toàn màn hình khi bấm từ góc trên phải):** Trái: Nút `← Quay lại` + Tiêu đề `Bảng tin SOS Thú Lạc` · Phải: Nút `Thông báo`.
3. **Thanh Điều Hướng Dưới Đáy (`Bottom Tab Bar` — 4 tab chính, không có nút `+` nổi):**
   - Tab 1: **`Khám phá`** (Trang chính mặc định — Bảng tin MXH kiểu Instagram).
   - Tab 2: **`Kết nối`** (Giao diện chuẩn ứng dụng Tinder quẹt thẻ tìm bạn dắt dạo).
   - Tab 3: **`Tin nhắn`** (Nhắn tin với bộ lọc: `Tất cả | Chưa đọc | Kết nối`).
   - Tab 4: **`Tôi`** (Trang cá nhân chuẩn Instagram, Khám phá mọi người, Quản lý tối đa 3 thú cưng miễn phí có nút xóa, Thiết lập Hồ sơ Kết nối).

---

## 2. Đặc Tả Chi Tiết Từng Phân Hệ

### 2.1 Tab 1: Khám phá (`Explore`) & Khung Đăng Bài Mới
- **Bài viết nhiều ảnh & Phóng to vuốt chuyển ảnh:**
  - Trên bài đăng có nhiều ảnh: Hỗ trợ **gạt ngang (`ScrollView horizontal pagingEnabled`)** để chuyển ảnh mượt mà kèm chỉ báo vị trí (`1/3`, `2/3`).
  - Khi chạm vào ảnh/video để mở **Phóng to toàn màn hình (`Lightbox`)**: Hỗ trợ **gạt ngang trái/phải** để chuyển qua lại giữa các ảnh trong bài đăng.
- **Huy hiệu AI Sighting trên Pet Feed:**
  - Khi AI quét bài viết và phát hiện ảnh/đặc điểm khớp với một tin SOS đang mở: Hiển thị thanh Banner cảnh báo màu San Hô (`#FF6F61`): *"🔍 AI phát hiện: Khớp 85% với tin SOS của bé Coca lúc 09:30 tại Công viên Bờ Sông"*.
  - Nhấp vào banner mở rộng bản đồ lộ trình truy vết và thông tin liên hệ chủ nuôi.
- **Khung Đăng bài mới (`new_moment`):**
  - **Tải ảnh & video thật từ điện thoại (`expo-image-picker`):** Cho phép bấm chọn nhiều ảnh hoặc video trực tiếp từ thư viện máy hoặc mở Camera, kèm thao tác gạt ngang xem trước và xóa từng mục.
  - **Hashtag tự do + Gợi ý:** Có ô nhập để người dùng **tự gõ hashtag bất kỳ** và bấm thêm, kết hợp chạm nhanh vào các hashtag gợi ý.

### 2.2 Tab 2: Kết nối (`Tinder` — Tối Giản, Ảnh Lớn & Đa Mục Đích Chuẩn Pawty)
- **Cấu trúc màn hình tối giản & không cuộn (`No Outer ScrollView`):**
  - Bỏ hoàn toàn `ScrollView` bao ngoài màn hình quẹt. Thẻ co giãn thích ứng theo chiều cao còn lại (`flex: 1`) giữa header, hàng nút hành động và thanh điều hướng đáy, không gò ép `height: 520` cố định.
  - Phía dưới thẻ là thẻ kế tiếp hiển thị nền (`pointerEvents="none"`), tạo cảm giác trượt thẻ thực thụ như Tinder.
- **Thẻ quẹt ảnh lớn tập trung & Gradient tinh tế:**
  - Vùng ảnh lớn làm trọng tâm thị giác, không bị văn bản hoặc chip che lấp.
  - Thanh phân đoạn hiển thị số lượng ảnh ở đỉnh (`— — — —`). Phân biệt rõ cử chỉ chạm (tap trái/phải đổi ảnh) và kéo (drag quẹt trái/phải), ngăn chặn đổi ảnh ngoài ý muốn khi quẹt.
  - Chân thẻ dùng `expo-linear-gradient` chuyển tiếp mượt mà từ trong suốt sang đen mờ vừa đủ đọc chữ.
  - Bỏ 6 chip lifestyle và tiêu đề "Thông tin cơ bản & Phong cách sống" khỏi mặt thẻ.
  - Tóm tắt gọn 3-4 dòng thông tin cùng 1 nhãn mục đích (`Intent Badge`) nổi bật.
  - Nút mở hồ sơ tròn `↑` góc dưới phải có diện tích chạm tiêu chuẩn (tối thiểu 44×44).
- **Trình bày thông tin linh hoạt theo Mục đích (`Intent Layout`):**
  - **Playdate (Tìm bạn chơi chung):** Tên và ảnh bé pet đại diện (mặc định pet đầu tiên) là trọng tâm; tuổi, giống, cân nặng. Dòng phụ: *"Đi cùng [Tên chủ] · cách [Khoảng cách] km"*. Nếu có nhiều pet, hiển thị nhãn `+N bé` (chạm mở hồ sơ chi tiết). Lượt thích vẫn lưu theo hồ sơ chủ nuôi.
  - **Dating (Hẹn hò chủ nuôi):** Ảnh và thông tin chủ nuôi (`Tên Tuổi`), khoảng cách, một dòng tóm tắt thú cưng (kèm avatar nhỏ và `+N bé`).
  - **Community (Giao lưu nội khu):** Tên chủ và bé thú cưng, khoảng cách, mục đích giao lưu. Chỉ hiển thị khu vực nếu candidate có trường dữ liệu riêng, tuyệt đối không dùng Passport tạm thời gán làm khu vực cư trú của ứng viên.
  - Chế độ *"Tất cả mục đích"*: Duyệt qua từng ứng viên và hiển thị thẻ chuẩn theo intent của ứng viên đó.
- **Hàng hành động cố định (`Fixed Action Bar`):**
  - Hai nút chính: **[Bỏ qua ✕]** và **[Thích ❤️]** kích thước chuẩn, cố định ở đáy ngoài thẻ chuyển động, không bị kéo bay theo thẻ.
  - Cơ chế đồng bộ cử chỉ: Bấm nút hoặc kéo tay dùng chung một luồng animation và chỉ commit 1 lần duy nhất; khóa tương tác khi đang chuyển cảnh để chống bấm nhanh sinh nhiều lượt quẹt/match.
- **Hồ sơ chi tiết phủ toàn màn hình (`Fullscreen Detail Sheet`):**
  - Mở dạng phủ màn hình khi bấm nút `↑` trên thẻ, không đẩy dồn bung nội dung thẻ.
  - Đóng chi tiết giữ nguyên ứng viên và ảnh đang xem; chặn tương tác quẹt ngầm khi đang mở hồ sơ.
  - Nội dung phân tầng theo mục đích: Đang tìm kiếm & Giới thiệu, Danh sách từng bé thú cưng, Thông tin chủ nuôi, Phong cách sống (Dating).
  - Đổi nút "Trả lời" thành "Xem hồ sơ chủ nuôi" để khớp đúng hành động mở `PublicUserProfile`.
- **Trạng thái Tiêm chủng & An toàn Thú cưng:**
  - Hiển thị theo từng bé thú cưng. Dữ liệu `isVaccinatedAndRabies` được thể hiện chính xác là *"Chủ nuôi khai báo đã tiêm"* hoặc *"Chưa có xác nhận đầy đủ"*, không khẳng định là chứng chỉ y tế đã kiểm định.
  - Không gắn huy hiệu tiêm chủng chung lên chủ nuôi.
  - Modal chúc mừng kết nối (`matchedCandidateModal`) diễn đạt trung thực về thú cưng, không tuyên bố tất cả pet đã tiêm khi chưa kiểm tra.
- **Cơ chế Quản lý Deck Nhất quán:**
  - Xử lý nhất quán giữa context và màn hình quẹt: Candidate trên đỉnh deck luôn là `filteredCandidates[0]`. Khi quẹt, context xóa candidate đó thì ứng viên kế tiếp tự động lên đỉnh deck mà không làm lệch chỉ số (khắc phục lỗi quẹt A nhảy sang C).

### 2.3 Nhánh `SOS Thú Lạc` Toàn Màn Hình & AI Radar Truy Vết
- Mở **full màn hình** như một tab chính khi bấm nút `SOS` ở góc trên phải.
- **Trang Quản lý, Lọc & Tìm kiếm thông tin SOS:**
  - Thanh tìm kiếm theo tên thú cưng, giống loài, khu vực mất tích.
  - Bộ lọc: `Tất cả`, `Đang tìm quanh đây`, `Loài Chó`, `Loài Mèo`, `Tin của tôi`, `Đã đón về`.
- **Chế độ xem Bản đồ AI Radar Truy Vết (AI Spatiotemporal Trajectory Map):**
  - Thanh nút chuyển đổi: `[Danh sách tin SOS] ↔ [Bản đồ AI Truy Vết]`.
  - Trực quan hóa lộ trình phỏng đoán theo dòng thời gian mốc:
    - Điểm $T_0$ (Đỏ): Tọa độ mất tích ban đầu (`lastSeenCoords`).
    - Điểm $T_1$ (Vàng cam): Manh mối nhìn thấy từ cư dân gửi về (`sighting`).
    - Điểm $T_2$ (Xanh mint): Manh mối AI tự động quét ra từ bài đăng Feed có ảnh tương đồng $\ge 70\%$.
  - Hiển thị độ dài quãng đường di chuyển khả dĩ, vận tốc di chuyển ước tính và thẻ thông tin chi tiết từng điểm dừng.
- **Quyền xác nhận "Đã đón về":**
  - **Chỉ chính người đăng bài (`sos.ownerHandle === ownerHandle`) mới được phép nhìn thấy và bấm nút "Đã đón về"**. Người dùng khác chỉ thấy nút *"Báo vừa nhìn thấy"* và *"Liên hệ chủ nuôi"*.

### 2.4 Tab 3: Tin nhắn (`Chat`)
- Nhắn tin trực tiếp giữa người dùng với các bộ lọc tiện lợi: `Tất cả`, `Chưa đọc`, `Kết nối`.
- **Trải nghiệm phòng chat chi tiết & Chống bàn phím ảo che khuất (`Keyboard Avoiding Chat Room`):**
  - Khi mở một cuộc trò chuyện cụ thể (`activeChatId` khác null), tự động ẩn Header chung của ứng dụng và ẩn Thanh điều hướng đáy (`bottomBar`) để nhường toàn bộ không gian cho màn hình chat.
  - Sử dụng `KeyboardAvoidingView` kết hợp `useSafeAreaInsets` tinh chỉnh độ nâng theo nền tảng (iOS padding, Android tương thích adjustResize), đảm bảo thanh nhập tin nhắn (`inputBar`) luôn nằm sát ngay phía trên bàn phím ảo.
  - `ScrollView` danh sách tin nhắn tích hợp `ref` tự động cuộn xuống tin nhắn cuối cùng (`scrollToEnd`) khi mở màn hình, khi bàn phím ảo xuất hiện (`keyboardDidShow`) và khi gửi tin nhắn mới, giúp người dùng luôn thấy rõ nội dung đang soạn thảo và ngữ cảnh trò chuyện.

### 2.5 Tab 4: Tôi (`Profile` Chuẩn Instagram, Tối đa 3 Pet Miễn phí & Cài đặt)
- **Thiết kế trang `Tôi` giống hệt Instagram:**
  - Header riêng của trang `Tôi`: Trái `+` · Giữa `🔒 username ⌄` · Phải `Plus` & Menu `☰`.
  - Cụm thông tin đầu trang: Avatar tròn (có dấu `+` và bong bóng ghi chú *"Hỏi bạn bè bất cứ điều gì..."*) + Tên và 3 cột thống kê (`bài viết`, `người theo dõi`, `đang theo dõi`).
  - Hàng nút hành động: **`[Chỉnh sửa trang cá nhân]`** · **`[Thiết lập Kết nối]`** · **`[+👤]`**.
  - Khối **"Khám phá mọi người" (`Xem tất cả`)**: Dải thẻ ngang gợi ý kết bạn với nút `Theo dõi / Kết bạn` và nút `✕`.
- **Quản lý Hồ sơ Thú cưng (Tối đa 3 con miễn phí + Có nút Xóa):**
  - Hiển thị danh sách thú cưng của tôi kèm nút thêm bé mới (tối đa 3 bé). Có nút xóa bé với popup xác nhận an toàn.
