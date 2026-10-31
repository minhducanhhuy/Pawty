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
     - **Nhánh `Tôi` (Header Chuyển Đổi Profile Paging Tích Hợp):**
       - Bỏ nút `+` và chữ tên cố định.
       - Thay bằng dải chuyển đổi phân trang ngay trên Top Bar: **`[Con sen]` · `[Lu]` · `[Miu]` ... `[+]`**.
       - Phải: Nút Hamburger `☰` duy nhất mở toàn bộ Menu Cài đặt, Quyền riêng tư & Thiết lập kết nối.
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

### 2.5 Tab 4: Tôi (`Profile` — Kiến Trúc Paging Vuốt Ngang Liên Tiếp: Con Sen & Từng Bé Thú Cưng)
- **Triết lý Cấu trúc Paging Ngang (`Horizontal ScrollView pagingEnabled`):**
  - **Menu Hamburger Tinh Gọn (Top Header Action):**
    - Nhấn nút Hamburger trên góc phải mở Bottom Sheet Menu tinh giản, loại bỏ chữ rườm rà:
      1. Cài đặt tài khoản & Quyền riêng tư (mở chỉnh sửa & ẩn/hiện profile).
      2. Thiết lập hồ sơ kết nối (cấu hình radar dắt dạo & ghép đôi).
      3. Gói hội viên Sen VIP (nâng cấp quẹt không giới hạn).
      4. Giao diện ứng dụng (chuyển đổi chủ đề màu sắc tức thì).
      5. Đăng xuất tài khoản (kèm hộp thoại xác nhận an toàn).
  - **Trang 0: Hồ sơ Con sen (Owner Profile Page):**
    - **Ảnh nền Background / Bìa:** Nút "Đổi ảnh bìa" đặt tại góc trên bên phải (`top: 14, right: 14`, `zIndex: 99`, `elevation: 10`) tách biệt hoàn toàn khỏi avatar overlap, đảm bảo nhận chạm 100% mở modal chọn ảnh từ thiết bị hoặc ảnh mẫu phong cảnh.
    - **Avatar Chủ nuôi & Ghi chú (Note):** Avatar tròn lớn ở trung tâm. Góc avatar có dấu cộng nhỏ `+` chạm vào để mở Popup ghi chú ngắn gọn (không có chữ 24h, thuần ô nhập text, không có icon mẫu rườm rà).
    - **Nút Chỉnh sửa Tinh Gọn:** Mở riêng **Popup Chỉnh sửa Hồ sơ Con sen Đầy Đủ**:
      - Giới tính, Họ và tên, Địa chỉ / Khu vực sinh sống, Độ tuổi & Ngày sinh.
      - Cung hoàng đạo (12 chòm sao), MBTI (16 nhóm tính cách).
      - Học vấn: Tốt nghiệp ở đâu, Chuyên ngành học gì.
      - Công việc: Đang làm gì, Nghề nghiệp hiện tại.
      - Câu giới thiệu bản thân / Châm ngôn nuôi pet.
      - **Cơ chế Ẩn/Hiện (Public / Private toggle):** Người dùng có quyền bật/tắt hiển thị công khai cho từng trường thông tin nhạy cảm.
    - **Thẻ Thống kê Cân xứng & Khoảnh khắc:**
      - Thống kê: Số người theo dõi, Đang theo dõi, Lượt thích.
      - Nút `+ Đăng bài` trực tiếp mở khung đăng khoảnh khắc.
    - **Xem trước & Chi tiết Bài viết (Post Detail Modal):**
      - Bỏ dòng nhạc nền không liên quan.
      - Caption hiển thị trọn vẹn bên dưới ảnh (không chèn đè lên ảnh làm che nội dung).
      - Menu thao tác: Nút "Xóa khỏi bảng tin", Nút Thả tim (Hiển thị số lượt like thực tế).
      - Nút **"Xem chi tiết bài viết"**: Mở màn hình bài viết hoàn chỉnh với:
        - Bảng tương tác đa cảm xúc (Love, Paws, Haha, Wow...).
        - Danh sách bình luận chi tiết: Hiển thị avatar, tên, nội dung, thời gian.
        - Thả react tim cho từng bình luận.
        - Nút "Trả lời" (Reply) trực tiếp từng người xem.
        - Khung nhập bình luận mới ở đáy màn hình.
  - **Trang 1, 2, ...: Hồ sơ Từng Bé Thú Cưng (Scrollable Downward Pet Screen):**
    - Mỗi thú cưng là một trang dọc độc lập nằm trong khối paging ngang (`nestedScrollEnabled={true}`).
    - **Hero Photo Bé Cưng Nổi Bật & An Toàn Fallback:**
      - Khung ảnh chiếm vị trí trang trọng ở nửa trên màn hình (`height: 58%`), có cơ chế fallback URL đa tầng (chó/mèo) đảm bảo không bao giờ bị đen màn hình.
      - 2 Nút chuyển ảnh `<` và `>` mờ nhạt đặt tại hai bên hông ảnh để người dùng lướt album ảnh của bé.
      - Chạm đúp (Double-tap) vào ảnh để thả tim kèm hoạt cảnh nổ tim hồng lộng lẫy.
    - **Thẻ Kính Mờ Mở Rộng Cuộn Xuống Dưới (Downward Expandable Frosted Card):**
      - Thẻ kính mờ (`rgba(28, 22, 20, 0.65)`) nằm gối nhẹ lên đáy ảnh (`marginTop: -32px`).
      - Khi người dùng nhấn **`[ Hiện thêm chi tiết sức khỏe & sổ tiêm ⌄ ]`**, toàn bộ nội dung chi tiết mở rộng **CUỘN XUÔI XUỐNG DƯỚI (SCROLL DOWN)** theo trục dọc của trang, tuyệt đối không bị đẩy ngược lên che mất ảnh khuôn mặt bé cưng.
      - Khi cuộn xuống, người dùng đọc được:
        1. Tính cách & Giới thiệu chi tiết.
        2. Thói quen tốt & Lưu ý an toàn khi đi dạo chung (tránh xung đột).
        3. Sở thích ăn uống (thức ăn yêu thích, pate, bánh thưởng).
        4. Lịch sử tẩy giun định kỳ.
        5. Tiền sử bệnh lý / thể trạng.
        6. **Biểu đồ Cân nặng theo tháng:** Cột thanh bar rõ ràng, chữ và số cân cách biệt, không đè chữ.
        7. **Sổ Tiêm Chủng Điện Tử:** Thẻ chứng nhận mũi tiêm có icon khiên bảo vệ.
      - Nút CTA lớn **`[ Hẹn dạo cùng bé ]`** nằm ở chân thẻ.
