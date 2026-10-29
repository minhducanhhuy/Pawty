# MASTER PRINT — TẦNG 4: SCREEN SPECIFICATIONS & USER FLOWS (INSTAGRAM + TINDER ARCHITECTURE)

> **Single Source of Truth (SSOT)** — Đồng bộ với `.agents/rules/01_product_concept_and_design.md` và `plan/03_user_flows_and_screens.md`.

---

## 1. Quy Chuẩn Giao Diện, Đăng Nhập 1 Thiết Bị & Header Động

1. **Màn hình Mở đầu (Load / Đăng nhập / Tạo tài khoản mới):**
   - Hiển thị 1 Logo chính thức (`/assets/pawty-logo-full.png`) cùng khẩu hiệu hệ sinh thái: **"Những bàn chân nhỏ đang tới"**.
   - **Chống bàn phím che ô nhập:** Tự động đẩy khung nhập liệu lên trên bàn phím (`KeyboardAvoidingView` + tự động cuộn `ScrollView` khi mở bàn phím) để người dùng bấm vào các ô cuối ở mục *Tạo tài khoản mới* không bị che khuất.
   - **Chỉ đăng nhập trên 1 thiết bị duy nhất (`Single-Device Login`):** Mỗi tài khoản chỉ có 1 phiên thiết bị hoạt động (`activeDeviceSessionId`). Khi đăng nhập trên thiết bị mới, phiên thiết bị cũ tự động bị thu hồi.
2. **Header Động theo từng Nhánh chính (`Dynamic Contextual Header`):**
   - **Không cố định cứng 1 Header cho mọi trang**, mà biến đổi theo từng nhánh chính:
     - **Nhánh `Khám phá`:** Trái: Nút `+` (Đăng bài) · Giữa: 1 Logo `Pawty` duy nhất · Phải: Nút `SOS` (mở trang SOS toàn màn hình) + Nút `Thông báo`.
     - **Nhánh `Kết nối` (Tinder):** Trái: Tiêu đề `Kết nối` & chọn Mong muốn · Phải: Nút `Hoàn tác`, `Đã thích`, `Đổi vị trí`.
     - **Nhánh `Dịch vụ`:** Trái: Tiêu đề `Dịch vụ Thú cưng` · Phải: Nút chuyển nhanh qua `Lịch hẹn`.
     - **Nhánh `Lịch hẹn`:** Trái: Tiêu đề `Quản lý Lịch hẹn` · Phải: Nút `+ Đặt lịch mới`.
     - **Nhánh `Tin nhắn`:** Trái: Tiêu đề `Tin nhắn` · Phải: Nút lọc nhanh.
     - **Nhánh `Tôi` (Chuẩn Instagram):** Trái: Nút `+` · Giữa: Biểu tượng khóa `🔒` (nếu bật chế độ riêng tư) + `@username` + `⌄` · Phải: Nút `Plus` tinh gọn + Nút Menu `☰` (mở trang **Cài đặt của tôi**).
     - **Nhánh `SOS` (Toàn màn hình khi bấm từ góc trên phải):** Trái: Nút `← Quay lại` + Tiêu đề `Trung tâm SOS Thú Lạc` · Phải: Nút `+ Đăng tin SOS`.
3. **Thanh Điều Hướng Dưới Đáy (`Bottom Tab Bar` — 6 tab chính, không có nút `+` nổi):**
   - Tab 1: **`Khám phá`** (Trang chính mặc định — Bảng tin MXH kiểu Instagram).
   - Tab 2: **`Kết nối`** (Đổi tên từ *Hẹn hò* — Giao diện chuẩn ứng dụng Tinder).
   - Tab 3: **`Dịch vụ`** (Đặt lịch Spa, Thú y, Khách sạn thú cưng).
   - Tab 4: **`Lịch hẹn`** (Quản lý lịch hẹn Spa, Thú y đã đặt).
   - Tab 5: **`Tin nhắn`** (Nhắn tin với bộ lọc: `Tất cả | Chưa đọc | Kết nối | Dịch vụ`).
   - Tab 6: **`Tôi`** (Trang cá nhân chuẩn Instagram, Khám phá mọi người, Quản lý tối đa 3 thú cưng miễn phí có nút xóa, Thiết lập Hồ sơ Kết nối).

---

## 2. Đặc Tả Chi Tiết Từng Phân Hệ

### 2.1 Tab 1: Khám phá (`Explore`) & Khung Đăng Bài Mới
- **Bài viết nhiều ảnh & Phóng to vuốt chuyển ảnh:**
  - Trên bài đăng có nhiều ảnh: Hỗ trợ **gạt ngang (`ScrollView horizontal pagingEnabled`)** để chuyển ảnh mượt mà kèm chỉ báo vị trí (`1/3`, `2/3`).
  - Khi chạm vào ảnh/video để mở **Phóng to toàn màn hình (`Lightbox`)**: Hỗ trợ **gạt ngang trái/phải** để chuyển qua lại giữa các ảnh trong bài đăng.
- **Khung Đăng bài mới (`new_moment`):**
  - **Bỏ phần phân loại bài viết** và **bỏ phần chọn định dạng phương tiện** (lấy chung cả ảnh và video trong một thao tác).
  - **Tải ảnh & video thật từ điện thoại (`expo-image-picker`):** Cho phép bấm chọn nhiều ảnh hoặc video trực tiếp từ thư viện máy hoặc mở Camera, kèm thao tác gạt ngang xem trước và xóa từng mục.
  - **Hashtag tự do + Gợi ý:** Có ô nhập để người dùng **tự gõ hashtag bất kỳ** và bấm thêm, kết hợp chạm nhanh vào các hashtag gợi ý.

### 2.2 Tab 2: Kết nối (`Tinder` — Giao diện chuẩn Tinder & Nhiều Thú Cưng)
- **Giao diện thẻ chuẩn ứng dụng Tinder:**
  - Thẻ ảnh lớn tràn khung với **thanh vạch chuyển ảnh ở đỉnh thẻ (`— — — —`)**, chạm nửa trái/phải hoặc gạt để xem ảnh của chủ nuôi và các bé thú cưng.
  - Lớp phủ tối dưới đáy ảnh hiển thị: `Tên + Tuổi`, nút mở rộng chi tiết (`↑`), và các viên thuốc tối màu hiển thị **Thông tin cơ bản & Phong cách sống**.
  - Khi mở rộng hoặc cuộn xuống dưới thẻ sẽ hiển thị các khối thông tin chuẩn Tinder:
    1. **Đang tìm kiếm:** Mong muốn kết nối (*Hẹn hò*, *Tìm bạn chơi chung*, *Giao lưu*, *Bất kỳ điều gì có thể*).
    2. **Thú cưng của người này (Hỗ trợ 1 người có nhiều thú cưng — tối đa 3 bé):** Hiển thị danh sách từng bé thú cưng. **Dấu tích `✓ Đã tiêm chủng & Phòng dại` được gắn trực tiếp trên từng bé thú cưng**, tuyệt đối không gắn vào thông tin của người.
    3. **Thông tin chính:** Khoảng cách (`Cách xa ... km`), Giới tính, Khu vực.
    4. **Phong cách sống:** Tập luyện, Thói quen cuối tuần, Hút thuốc, Bia rượu, Gu nhắn tin, Thú cưng đang nuôi.

### 2.3 Nhánh `SOS Thú Lạc` Toàn Màn Hình (Bấm từ góc trên phải)
- Mở **full màn hình** như một tab chính khi bấm nút `SOS` ở góc trên phải.
- **Trang Quản lý, Lọc & Tìm kiếm thông tin SOS:**
  - Thanh tìm kiếm theo tên thú cưng, giống loài, khu vực mất tích.
  - Bộ lọc: `Tất cả`, `Đang tìm quanh đây`, `Loài Chó`, `Loài Mèo`, `Tin của tôi`, `Đã đón về`.
- **Quyền xác nhận "Đã đón về":**
  - **Chỉ chính người đăng bài (`sos.ownerHandle === ownerHandle`) mới được phép nhìn thấy và bấm nút "Đã đón về"**. Người dùng khác chỉ thấy nút *"Báo vừa nhìn thấy"* và *"Liên hệ chủ nuôi"*.

### 2.4 Tab 5: Tin nhắn (`Chat`)
- Bổ sung bộ lọc **`Dịch vụ`** bên cạnh `Tất cả`, `Chưa đọc`, `Kết nối`, giúp lọc riêng các cuộc trò chuyện tư vấn/đặt lịch với Spa, Phòng khám thú y, Khách sạn thú cưng.

### 2.5 Tab 6: Tôi (`Profile` Chuẩn Instagram, Tối đa 3 Pet Miễn phí & Cài đặt)
- **Thiết kế trang `Tôi` giống hệt Instagram:**
  - Header riêng của trang `Tôi`: Trái `+` · Giữa `🔒 username ⌄` · Phải `Plus` & Menu `☰`.
  - Cụm thông tin đầu trang: Avatar tròn (có dấu `+` và bong bóng ghi chú *"Hỏi bạn bè bất cứ điều gì..."*) + Tên và 3 cột thống kê (`bài viết`, `người theo dõi`, `đang theo dõi`).
  - Hàng nút hành động: **`[Chỉnh sửa trang cá nhân]`** · **`[Thiết lập Kết nối]`** · **`[+👤]`**.
  - Khối **"Khám phá mọi người" (`Xem tất cả`)**: Dải thẻ ngang gợi ý kết bạn với nút `Theo dõi / Kết bạn` và nút `✕`.
- **Quản lý Hồ sơ Thú cưng (Tối đa 3 con miễn phí + Có nút Xóa):**
  - Cho phép tạo và quản lý **tối đa 3 hồ sơ thú cưng hoàn toàn miễn phí** (không khóa theo gói Plus).
  - Mỗi hồ sơ thú cưng có nút **Xóa thú cưng** và dấu tích **`✓ Đã tiêm chủng & Phòng dại`** riêng cho từng bé.
- **Thiết lập Hồ sơ Kết nối (Tinder Setup Profile):**
  - Cho phép người dùng cài đặt thông tin cá nhân phục vụ riêng cho tab `Kết nối`: Tuổi, Giới tính, Đang tìm kiếm, Phong cách sống (Tập luyện, Cuối tuần, Hút thuốc, Bia rượu, Gu nhắn tin).
- **Chế độ Riêng tư & Gói Plus trong Cài đặt (`☰`):**
  - Công tắc bật/tắt **Chế độ Riêng tư** được đặt gọn bên trong trang **Cài đặt của tôi** (bấm nút `☰` ở góc trên phải trang `Tôi`).
  - Các gói **Pawty Plus** được thiết kế lại dạng thẻ trượt ngang sang trọng, rõ ràng.
