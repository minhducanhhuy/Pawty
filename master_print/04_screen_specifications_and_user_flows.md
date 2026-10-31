# MASTER PRINT — TẦNG 4: SCREEN SPECIFICATIONS & USER FLOWS (PET-CENTRIC ARCHITECTURE)

> **Single Source of Truth (SSOT)** — Đồng bộ với các màn hình thực tế của Pawty Super App.

---

## 1. Quy Chuẩn Giao Diện, Đăng Nhập 1 Thiết Bị & Header Động

1. **Màn hình Mở đầu (Splash Screen & Launch Animation):**
   - **Màn hình Chào (`AppSplashScreen`):** Xuất hiện ngay khi vừa mở app trong 2.2 giây.
   - **Logo Động CSS (`PawtyAnimatedLogo`):** Hiệu ứng loang cọ màu nước (Watercolor Bloom) mở ra từ tâm, kèm đuôi cún vẫy nhịp nhàng và sóng chuyển động Mint rung rinh hai bên.
   - **Khẩu hiệu hệ sinh thái:** Hiển thị slogan *"Những bàn chân nhỏ đang tới"* cùng phụ đề *"Mạng xã hội và kết nối người nuôi thú cưng"*.
   - **Chống bàn phím che ô nhập:** Tự động đẩy khung nhập liệu lên trên bàn phím (`KeyboardAvoidingView` + tự động cuộn `ScrollView` khi mở bàn phím) để người dùng bấm vào các ô cuối ở mục *Tạo tài khoản mới* không bị che khuất.
   - **Chỉ đăng nhập trên 1 thiết bị duy nhất (`Single-Device Login`):** Mỗi tài khoản chỉ có 1 phiên thiết bị hoạt động (`activeDeviceSessionId`). Khi đăng nhập trên thiết bị mới, phiên thiết bị cũ tự động bị thu hồi.
2. **Header Động theo từng Nhánh chính (`Dynamic Contextual Header`):**
   - **Không cố định cứng 1 Header cho mọi trang**, mà biến đổi theo từng nhánh chính:
     - **Nhánh `Khám phá`:** Trái: Nút `+` (Đăng bài) · Giữa: 1 Logo `Pawty` động (`PawtyAnimatedLogo` size nhỏ) · Phải: Nút `SOS` (mở trang SOS toàn màn hình) + Nút `Thông báo`.
     - **Nhánh `Kết nối` (Tinder):** Trái: Tiêu đề `Kết nối` · Phải: Nút `Hoàn tác`, `Đã thích`, `Đổi vị trí`.
     - **Nhánh `Tin nhắn`:** Trái: Tiêu đề `Tin nhắn` · Phải: Nút `Kết nối` + Nút `SOS`.
     - **Nhánh `Tôi` (Pet-Centric Profile):** Trái: Biểu tượng nón tiệc Pawty hoặc Tên gia đình · Giữa: Tên chủ nuôi & Huy hiệu VIP · Phải: Nút Hamburger `☰` duy nhất mở toàn bộ Menu Cài đặt, Quyền riêng tư & Thiết lập kết nối.
     - **Nhánh `SOS` (Toàn màn hình khi bấm từ góc trên phải):** Trái: Nút `← Quay lại` + Tiêu đề `Bảng tin SOS Thú Lạc` · Phải: Nút `Thông báo`.
3. **Thanh Điều Hướng Dưới Đáy (`Bottom Tab Bar` — 4 tab chính, không có nút `+` nổi):**
   - Tab 1: **`Khám phá`** (Trang chính mặc định — Bảng tin MXH thú cưng).
   - Tab 2: **`Kết nối`** (Giao diện chuẩn Tinder quẹt thẻ tìm bạn dắt dạo).
   - Tab 3: **`Tin nhắn`** (Nhắn tin với bộ lọc: `Tất cả | Chưa đọc | Kết nối`).
   - Tab 4: **`Tôi`** (Hồ sơ Gia đình Boss & Sen: Hộ chiếu thú cưng chuyên sâu, nhật ký khoảnh khắc, không sao chép rập khuôn Instagram).

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
  - **Chỉ chính người đăng bài (`sos.ownerHandle === ownerHandle`) mới được phép nhìn thấy và bấm nút "Đã đón về"**. Người dùng khác chỉ thấy nút *"Báo vừa nhìn thấy"* và *"Liên hệ chủ nuôi"*.

### 2.4 Tab 3: Tin nhắn (`Chat`)
- Nhắn tin trực tiếp giữa người dùng với các bộ lọc tiện lợi: `Tất cả`, `Chưa đọc`, `Kết nối`.

### 2.5 Tab 4: Tôi (`Profile` — Thiết Kế Độc Bản "Pet Family Identity", Khác Biệt Hoàn Toàn Instagram/Facebook)
- **Triết lý Thiết kế:** Không rập khuôn mạng xã hội truyền thống (không 3 cột số follow, không khối gợi ý kết bạn). Tôn vinh danh thiếp gia đình Sen & Boss tại đô thị:
  1. **Thẻ Căn Cước Sen (Pet Parent Identity Card):**
     - Avatar tròn bo viền đôi sang trọng với ảnh Sen / Boss đại diện.
     - Tên Sen, @handle, Khu căn hộ / Chung cư (VD: *Masteri Thảo Điền*), và Huy hiệu Yêu Thú Cưng / Gói thành viên VIP.
     - Châm ngôn / Lời nhắn nuôi cưng hôm nay (*"Cùng Lu dạo mát mỗi chiều"*).
     - Duy nhất 1 nút hành động tinh gọn: **`[ Chỉnh sửa thông tin ]`** với typography căn giữa hoàn hảo.
  2. **Toàn Bộ Cài Đặt, Quyền Riêng Tư & Kết Nối Trong Hamburger (☰):**
     - Tuyệt đối không để nút bấm rườm rà trên màn hình chính.
     - Nút `☰` ở góc phải mở Menu Bottom Sheet:
       - **Công tắc Quyền riêng tư (`🔒`):** Bật/Tắt chế độ chỉ bạn bè mới xem được Boss.
       - **Thiết lập Hồ sơ Kết nối (Tinder Setup):** Tuổi, Giới tính, Đang tìm kiếm, Gu dắt dạo.
       - **Gói thành viên Pawty Plus & Gold:** Quyền lợi VIP.
       - **Tài khoản & Thiết bị đăng nhập:** Quản lý Single-Device Login, Đăng xuất.
  3. **Bỏ hoàn toàn phần "Khám phá mọi người":**
     - Không hiển thị bất kỳ danh sách gợi ý người dùng nào trên trang này.
  4. **Phân Hệ Hộ Chiếu Thú Cưng Chuyên Sâu (Pet Passport Interactive Showcase):**
     - **Thanh Chọn Boss Sinh Động (Pet Selector Bar):** Dải avatar các bé thú cưng tròn đáng yêu với viền active màu San Hô, kèm nút `[ + Thêm bé ]` (tối đa 3 bé miễn phí).
     - **Thẻ Hộ Chiếu Boss Đang Chọn (Active Pet Passport):**
       - Ảnh chân dung Boss kích thước lớn, sắc nét, có nút chỉnh sửa ảnh.
       - Tên Boss, Loài (Chó/Mèo), Giống lai, Cân nặng chuẩn, Tuổi.
       - **Thẻ Sổ Tiêm Chủng Điện Tử Safe Pet (Màu Mint `#A3E4D7`):** Chứng nhận tiêm phòng 7 bệnh và vắc-xin phòng dại, chạm trực tiếp để cập nhật mũi tiêm.
       - **Thói quen & Lưu ý khi gặp gỡ:** Minh bạch hành vi để dắt dạo an toàn (VD: *Thân thiện với cún nhỏ, Hay đuổi bồ câu, Thích chia sẻ đồ ăn*), triệt tiêu nguy cơ cắn nhau ngoài công viên.
       - Thao tác: Chỉnh sửa hồ sơ bé · Xóa thú cưng có hộp thoại xác nhận.
  5. **Bộ Sưu Tập Khoảnh Khắc Của Gia Đình Boss (Furry Family Moments):**
     - Nhật ký hình ảnh kỷ niệm của các bé do Sen chia sẻ, hiển thị đẹp mắt, trực quan và tối ưu cho màn hình cảm ứng di động.
