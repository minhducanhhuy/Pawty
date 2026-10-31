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
     - **Nhánh `Kết nối` (Tinder):** Trái: Tiêu đề `Kết nối` · Phải: Nút `Hoàn tác`, `Đã thích`, `Đổi vị trí`.
     - **Nhánh `Tin nhắn`:** Trái: Tiêu đề `Tin nhắn` · Phải: Nút `Kết nối` + Nút `SOS`.
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
- **Header Bài Viết & Nút "Xem Profile":**
  - Cạnh cụm Avatar + Tên tác giả trên bài viết: Thêm nút **`[Xem profile]`**. Khi bấm vào nút này, ứng dụng sẽ chuyển thẳng sang tab **Hồ sơ (`Tôi`)** và hiển thị trang thông tin của tác giả.
  - Chạm vào avatar/tên tác giả cũng mở Popup/Modal Profile rút gọn.
- **Modal Profile Tác Giả & Hai Nút Hành Động ("Kết bạn" & "Theo dõi"):**
  - Thay vì hiện nút "Nhắn tin", modal hiển thị 2 nút chính: **`[Kết bạn]`** và **`[Theo dõi]`** cùng nút phụ **`[Xem profile]`** (chuyển sang tab Tôi/Hồ sơ).
  - **Cơ chế Lời Mời Kết Bạn & Kiểm Soát Nhắn Tin:**
    - Khi người A ấn `[Kết bạn]` với người B: Nút chuyển sang trạng thái `[Đã gửi lời mời]`.
    - Hệ thống tự động bắn Thông báo (Notification) đến người B: `"${Người A} đã gửi lời mời kết bạn"`, kèm 2 nút tương tác **`[Chấp nhận]`** và **`[Từ chối]`**.
    - **Ràng buộc Nhắn tin Chặt chẽ:** Người dùng **CHỈ ĐƯỢC PHÉP NHẮN TIN khi hai bên đã là bạn bè (người B đã chấp nhận lời mời kết bạn)**. Nếu chưa chấp nhận hoặc đã từ chối, hệ thống ngăn không cho mở phòng chat và hiển thị thông báo yêu cầu kết bạn trước.
  - **Cơ chế Theo Dõi & Nhận Thông Báo Bài Viết:**
    - Khi ấn `[Theo dõi]`: Chuyển trạng thái sang `[Đang theo dõi]` (ấn lại để hủy theo dõi).
    - Khi người được theo dõi đăng tải bài viết/khoảnh khắc mới trên trang Khám phá, hệ thống sẽ tự động gửi thông báo đến toàn bộ người theo dõi: `"${Tên tác giả} vừa đăng một khoảnh khắc mới trên Khám phá!"`.
- **Huy hiệu AI Sighting trên Pet Feed:**
  - Khi AI quét bài viết và phát hiện ảnh/đặc điểm khớp với một tin SOS đang mở: Hiển thị thanh Banner cảnh báo màu San Hô (`#FF6F61`): *"🔍 AI phát hiện: Khớp 85% với tin SOS của bé Coca lúc 09:30 tại Công viên Bờ Sông"*.
  - Nhấp vào banner mở rộng bản đồ lộ trình truy vết và thông tin liên hệ chủ nuôi.
- **Khung Đăng bài mới (`new_moment`):**
  - **Tải ảnh & video thật từ điện thoại (`expo-image-picker`):** Cho phép bấm chọn nhiều ảnh hoặc video trực tiếp từ thư viện máy hoặc mở Camera, kèm thao tác gạt ngang xem trước và xóa từng mục.
  - **Hashtag tự do + Gợi ý:** Có ô nhập để người dùng **tự gõ hashtag bất kỳ** và bấm thêm, kết hợp chạm nhanh vào các hashtag gợi ý.
  - Khi đăng bài thành công, tự động gửi thông báo đến các tài khoản đang theo dõi tác giả.

### 2.2 Tab 2: Kết nối (`Tinder` — Giao diện chuẩn Tinder & Nhiều Thú Cưng)
- **Giao diện thẻ chuẩn ứng dụng Tinder:**
  - Thẻ ảnh lớn tràn khung với **thanh vạch chuyển ảnh ở đỉnh thẻ (`— — — —`)**, chạm nửa trái/phải hoặc gạt để xem ảnh của chủ nuôi và các bé thú cưng.
  - Lớp phủ tối dưới đáy ảnh hiển thị: `Tên + Tuổi`, nút mở rộng chi tiết (`↑`), và các viên thuốc tối màu hiển thị **Thông tin cơ bản & Phong cách sống**.
  - Khi mở rộng hoặc cuộn xuống dưới thẻ sẽ hiển thị các khối thông tin chuẩn Tinder:
    1. **Đang tìm kiếm:** Mong muốn kết nối (*Hẹn hò*, *Tìm bạn chơi chung*, *Giao lưu*, *Bất kỳ điều gì có thể*).
    2. **Thú cưng của người này (Hỗ trợ 1 người có nhiều thú cưng — tối đa 3 bé):** Hiển thị danh sách từng bé thú cưng. **Dấu tích `✓ Đã tiêm chủng & Phòng dại` được gắn trực tiếp trên từng bé thú cưng**, tuyệt đối không gắn vào thông tin của người.
    3. **Thông tin chính:** Khoảng cách (`Cách xa ... km`), Giới tính, Khu vực.
    4. **Phong cách sống:** Tập luyện, Thói quen cuối tuần, Hút thuốc, Bia rượu, Gu nhắn tin, Thú cưng đang nuôi.

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
  - **Phân quyền nghiệp vụ trên thẻ SOS:** Chỉ chính người đăng bài (`sos.ownerHandle === ownerHandle`) mới thấy và bấm nút "Xác nhận đã đón về" (chiếm toàn chiều rộng thẻ). Người đăng KHÔNG được phép thấy hoặc bấm "Báo vừa nhìn thấy" trên tin của chính mình. Người dùng khác (hàng xóm, người qua đường) thấy cặp nút *"Báo vừa nhìn thấy"* và *"Liên hệ chủ nuôi"*.
- **Thao tác thoát Lightbox ảnh:** Cho phép chạm 1 lần vào ảnh/nền backdrop hoặc bấm nút mũi tên trái (Back) và nút [X] ở góc trên để đóng thoát Lightbox ngay lập tức trở về bảng tin.

### 2.4 Tab 3: Tin nhắn (`Chat`)
- Nhắn tin trực tiếp giữa người dùng với các bộ lọc tiện lợi: `Tất cả`, `Chưa đọc`, `Kết nối`.

### 2.5 Tab 4: Tôi (`Profile` Chuẩn Instagram, Tối đa 3 Pet Miễn phí & Cài đặt)
- **Thiết kế trang `Tôi` giống hệt Instagram:**
  - Header riêng của trang `Tôi`: Trái `+` · Giữa `🔒 username ⌄` · Phải `Plus` & Menu `☰`.
  - Cụm thông tin đầu trang: Avatar tròn (có dấu `+` và bong bóng ghi chú *"Hỏi bạn bè bất cứ điều gì..."*) + Tên và 3 cột thống kê (`bài viết`, `người theo dõi`, `đang theo dõi`).
  - Hàng nút hành động: **`[Chỉnh sửa trang cá nhân]`** · **`[Thiết lập Kết nối]`** · **`[+👤]`**.
  - Khối **"Khám phá mọi người" (`Xem tất cả`)**: Dải thẻ ngang gợi ý kết bạn với nút `Theo dõi / Kết bạn` và nút `✕`.
- **Quản lý Hồ sơ Thú cưng (Tối đa 3 con miễn phí + Có nút Xóa):**
  - Hiển thị danh sách thú cưng của tôi kèm nút thêm bé mới (tối đa 3 bé). Có nút xóa bé với popup xác nhận an toàn.
