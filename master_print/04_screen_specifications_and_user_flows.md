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
     - **Nhánh `Tôi` (Pet & Owner Paging Profile):** Trái: Nút `+` (Đăng khoảnh khắc mới) · Giữa: Dải chấm chỉ báo chuyển trang (Pagination Dots `● ○ ○`) hiển thị vị trí giữa Chủ nuôi và các bé Pet · Phải: Nút Hamburger `☰` duy nhất mở toàn bộ Menu Cài đặt & Quyền riêng tư.
     - **Nhánh `SOS` (Toàn màn hình khi bấm từ góc trên phải):** Trái: Nút `← Quay lại` + Tiêu đề `Bảng tin SOS Thú Lạc` · Phải: Nút `Thông báo`.
3. **Thanh Điều Hướng Dưới Đáy (`Bottom Tab Bar` — 4 tab chính, không có nút `+` nổi):**
   - Tab 1: **`Khám phá`** (Trang chính mặc định — Bảng tin MXH thú cưng).
   - Tab 2: **`Kết nối`** (Giao diện chuẩn Tinder quẹt thẻ tìm bạn dắt dạo).
   - Tab 3: **`Tin nhắn`** (Nhắn tin với bộ lọc: `Tất cả | Chưa đọc | Kết nối`).
   - Tab 4: **`Tôi`** (Hồ sơ Paging liên tiếp: Trang Chủ nuôi với ảnh bìa & khoảnh khắc → Vuốt ngang xem từng trang Hộ chiếu Thú cưng toàn màn hình).

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

### 2.5 Tab 4: Tôi (`Profile` — Kiến Trúc Paging Vuốt Ngang Liên Tiếp: Chủ Nuôi & Từng Bé Thú Cưng)
- **Triết lý Cấu trúc Paging Ngang (`Horizontal ScrollView pagingEnabled`):** Tách bạch rõ ràng, không dồn nén cả chủ và thú cưng vào 1 màn hình cuộn dọc rối rắm.
  - **Trang 0: Hồ sơ Chủ nuôi (Owner Profile Page):**
    - **Ảnh nền Background / Cover:** Ảnh phong cảnh đẹp mắt tràn viền phía trên.
    - **Avatar Chủ nuôi:** Bo tròn mềm mại ở trung tâm với viền nổi bật đè lên giữa ảnh bìa và thẻ nội dung.
    - **Nút Chỉnh sửa:** Nút pill `[ Chỉnh sửa hồ sơ ]` gọn gàng ở góc phải dưới ảnh bìa.
    - **Thông tin Sen:** Tên chủ nuôi (`ownerName`), Nghề nghiệp / Châm ngôn (`UI/UX Designer` hoặc câu chào), Vị trí địa lý (`ownerArea` kèm chấm đỏ ghim vị trí).
    - **Thẻ 3 Con số Thống kê Cân xứng:**
      `{followersCount} người theo dõi` · `{followingCount} đang theo dõi` · `{likesCount} yêu thích`.
    - **Các Bài Đăng Khoảnh Khắc (Moments Grid):** Lưới các ảnh kỷ niệm bo tròn góc mềm mại (`borderRadius: 16`), chạm để xem phóng to Lightbox.
  - **Trang 1, 2, ...: Hồ sơ Từng Bé Thú Cưng (Full-Bleed Pet Passport Pages):**
    - Mỗi thú cưng là một trang toàn màn hình riêng biệt khi vuốt sang ngang.
    - **Ảnh Chân Dung Boss Bao Trọn Màn Hình:** Hình ảnh độ phân giải cao của bé bao trọn không gian, tạo cảm xúc ấn tượng sâu sắc.
    - **Thẻ Lớp Phủ Kính Mờ (Frosted Overlay Card):**
      - Tên bé, khoảng cách (`Cách bạn 1.5 km`), Giống loài (`Poodle`, `Golden`, `Mèo Anh Lông Ngắn`).
      - **3 Viên Thuốc Thông Số:** `Giới tính (Sex)` · `Tuổi (Age)` · `Cân nặng (Weight)`.
      - **Sổ Tiêm Chủng Safe Pet (Xanh Mint):** Xác nhận tiêm phòng 7 bệnh & phòng dại, chạm trực tiếp để cập nhật.
      - **Về Bé (About):** Đoạn miêu tả tính nết, thói quen khi dắt dạo (Good habits / Caution habits).
      - **Tương Tác Yêu Thích:** Nút Thả tim (Like) cho người xem và hiển thị số lượt yêu thích của bé.
  - **Chỉ Báo Trang (Pagination Indicator Dots `● ○ ○`):**
    - Dải chấm tròn tinh tế ở đỉnh hoặc đáy màn hình giúp người dùng trực quan biết mình đang ở trang Chủ nuôi hay trang của Bé nào, kèm nút gạt tiện lợi.
  - **Menu Hamburger (`☰`):**
    - Mọi cài đặt hệ thống, quyền riêng tư và thiết lập kết nối được gom gọn gàng trong nút Hamburger ở góc trên phải.
