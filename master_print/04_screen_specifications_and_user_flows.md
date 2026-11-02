# MASTER PRINT — TẦNG 4: SCREEN SPECIFICATIONS & USER FLOWS (100% FREE & UNIFIED ARCHITECTURE)

> **Single Source of Truth (SSOT)** — Đồng bộ với giao diện và luồng nghiệp vụ thực tế của Pawty.

---

## 1. Quy Chuẩn Chung Toàn Hệ Thống
1. **Không Gói Thành Viên / Mở Khóa 100% Tính Năng Miễn Phí:**
   - Xóa bỏ hoàn toàn cơ chế gói hội viên VIP (`Pawty Plus`, `Pawty Gold`, `Sen VIP`), huy hiệu VIP, màn hình thanh toán nâng cấp VIP và giới hạn số lượng thú cưng.
   - Mọi thành viên có quyền lợi ngang nhau 100%: thêm thú cưng không giới hạn, quẹt thẻ không giới hạn, hoàn tác miễn phí, xem danh sách "Ai đã thích bạn" miễn phí, lọc khoảng cách không giới hạn và đăng tin SOS hoàn toàn miễn phí.
2. **Header Động theo từng Nhánh chính (`Dynamic Contextual Header`):**
   - **Khám phá:** Trái: Nút `+` (Đăng bài) · Giữa: Logo Pawty động · Phải: Nút `SOS` + Nút `Thông báo` (có badge đếm chưa đọc).
   - **Kết nối (Tinder):** Trái: Tiêu đề Kết nối kèm nhãn mục đích lọc · Phải: Nút `Ai đã thích bạn` (có badge số lượng) + Nút `Bộ lọc` + Nút `Menu thiết lập kết nối`.
   - **Tin nhắn:** Trái: Tiêu đề Tin nhắn · Phải: Nút `Kết nối` + Nút `SOS` + Nút `Thông báo`.
   - **Tôi / Xem Hồ Sơ Người Khác:** Thanh chuyển đổi phân trang ngang **[Con sen] · [Pet 1] · [Pet 2] ...**. Nếu xem của bản thân: có nút `[+]` thêm thú cưng và nút `☰` Hamburger Menu. Nếu xem hồ sơ người khác (`isViewingOther`): có nút `← Quay lại` bên trái và ẩn toàn bộ nút chỉnh sửa của chủ nhân.

---

## 2. Đặc Tả Chi Tiết Từng Phân Hệ

### 2.1 Tab 1: Khám Phá (`Explore`) & Đăng Bài
- **Kéo xuống để làm mới (`Pull-to-Refresh`):** Tích hợp `RefreshControl` trên danh sách Khám phá; khi người dùng kéo từ đỉnh xuống sẽ gọi lại `/api/bootstrap` để tải bài viết, hồ sơ và thông báo mới nhất từ PostgreSQL.
- **Tinh gọn giao diện Khám phá:** Loại bỏ thanh nhắc đăng bài ("Chia sẻ khoảnh khắc của thú cưng...") dưới thanh tìm kiếm do đã có nút dấu cộng (`+`) chuyên dụng trên thanh Header.
- **Đăng bài mới (`new_moment`) lưu trữ qua Cloudinary & PostgreSQL:**
  - Nút chọn nhiều ảnh/video từ Thư viện máy và chụp từ Camera (`expo-image-picker`). Ảnh được đẩy lên Cloudinary CDN và PostgreSQL lưu lại đường link HTTPS chuẩn.
  - Hỗ trợ chọn tích lũy nhiều ảnh, xóa từng ảnh bằng nút `✕` hoặc `Xóa hết`.
  - **Bỏ chọn chuyên mục bài đăng:** Người dùng chỉ cần chọn ảnh, nhập caption và chọn hashtag.
  - **Hashtag thông minh:** Lưu lại toàn bộ lịch sử các hashtag người dùng đã sử dụng trước đó, đồng thời hỗ trợ ô nhập trực tiếp cho phép người dùng tự do thêm hashtag mới theo ý muốn (`#custom_tag`).
  - Bấm **"Đăng bài lên Khám phá"** gọi trực tiếp `POST /api/posts`, hiển thị ngay trên bảng tin Khám phá và trang Hồ sơ cá nhân của người đăng.

### 2.2 Tab 2: Kết Nối (`Tinder`) & Tách Biệt Hồ Sơ Hẹn Hò
- **Tách biệt Hồ sơ Hẹn hò & Hồ sơ Mạng xã hội:**
  - **Hồ sơ Mạng xã hội (Social Profile):** Nằm tại Tab "Tôi", gồm thông tin cá nhân, các bé thú cưng, sổ tiêm, và lưới bài đăng khoảnh khắc.
  - **Hồ sơ Hẹn hò & Kết nối (Dating Profile):** Hoạt động độc lập, quản lý trực tiếp từ Tab "Kết nối" (thông qua nút xem/chỉnh sửa Hồ sơ hẹn hò của tôi). Bao gồm: Bộ ảnh hẹn hò riêng biệt, Mục đích tìm kiếm (duy nhất), Lời giới thiệu khi kết nối (`dating bio`), Thú cưng đi dạo cùng khi đi date, và các Chip phong cách sống / Lifestyle. Thẻ quẹt Tinder và modal chi tiết ứng viên hiển thị đúng thông tin của Hồ sơ Hẹn hò.
  - **Cô lập bảo mật:** Người dùng chỉ xem được Hồ sơ Hẹn hò trong phạm vi kết nối, tuyệt đối không lộ trang cá nhân hay bài đăng thường nhật.
- **Cơ chế Duy Trì Cọc Thẻ Vô Tận & Tự Động Làm Mới (`Infinite Candidate Pool & Auto-Reload`):**
  - **Chỉ loại trừ người ĐANG MATCH (`status === 'matched'`):** Danh sách quẹt thẻ chỉ ẩn duy nhất những người dùng hiện tại đang tương hợp thành công. Khi người dùng từ chối (bấm Pass / quẹt trái) hoặc khi đã hủy match trước đó, ứng viên đó vẫn được giữ trong vòng quay và sẽ xuất hiện trở lại ở các lượt làm mới sau.
  - **Tự động làm mới cọc thẻ định kỳ:** Cứ mỗi 2-3 phút hoặc khi cọc thẻ về 0, hệ thống tự động đồng bộ lại danh sách ứng viên chưa match từ database.
  - **Nút "Làm mới danh sách ngay":** Khi màn hình hiển thị "Đã xem hết hồ sơ phù hợp", bổ sung nút bấm thao tác nhanh để người dùng chủ động nạp lại toàn bộ danh sách thẻ chưa match ngay lập tức mà không bao giờ bị đứng hình.
- **Header Kết Nối Tinh Gọn (Tránh Đè UI/UX):**
  - Tiêu đề gọn gàng: Icon Trái tim + chữ "Kết nối". Không chèn huy hiệu mục đích dài vào dòng tiêu đề gây tràn màn hình.
  - Cụm thao tác góc phải cân đối: Nút `Thích bạn ({count})` (compact pill), Nút `Bộ lọc` (có chấm báo trạng thái), Nút `Tùy chọn ⋮`.
  - Khắc phục triệt để lỗi modal: `MobileModals` chỉ can thiệp các modal toàn cục, không render đè bottom-sheet rỗng khi mở `TinderFilterModal` hay `TinderMenuModal`.
- **Xem Ai Đã Thích Mình (`Likes You` — Mở khóa 100% Free) & Đồng Bộ Real-time:**
  - Hiển thị trực tiếp danh sách tất cả người dùng đã thả tim hồ sơ của bạn (không làm mờ, không khóa VIP), kèm ảnh đại diện thẻ hẹn hò (`photoUrls[0]`).
  - Tự động đồng bộ số lượng và danh sách ứng viên đã thích ngay khi người dùng chuyển qua lại giữa các tab hoặc qua chu kỳ polling định kỳ.
  - Cho phép bấm xem chi tiết hồ sơ của họ, bấm **[Thích lại & Kết nối ngay]** (tự động Match, bắn thông báo cho cả 2 bên và tạo phòng chat) hoặc **[Bỏ qua]**.
  - **Đồng bộ phòng chat hẹn hò hai chiều:** Khi User B match User A, ngay lập tức cả User B và User A (người quẹt thích trước) đều xuất hiện cuộc trò chuyện mới trong tab Hẹn hò của màn hình Tin nhắn.
- **Bộ lọc Khoảng cách & Giới tính Đối tượng (Lưu Trữ Bền Vững):**
  - Thanh trượt khoảng cách kéo rộng tới **500 km** hoặc chọn **`Không giới hạn`** để tìm kiếm không giới hạn bán kính địa lý.
  - **Bộ lọc giới tính đối tượng muốn ghép đôi:** Cung cấp 3 tùy chọn bằng Chip selector: **`Mọi người`** (`all`), **`Nữ`** (`female`), và **`Nam`** (`male`). Trạng thái lựa chọn được lưu trữ bền vững trong state ứng dụng, tự động nạp lại cọc thẻ theo giới tính đã chọn ngay khi bấm áp dụng, và giữ nguyên lựa chọn khi mở lại bộ lọc.
- **Bố Cục Thẻ Tinder Tinh Gọn (Dòng Khoảng Cách Riêng Biệt & Tên Thân Thiện):**
  - Khoảng cách địa lý (`Cách bạn ... km`) được bố trí trên một dòng riêng biệt với biểu tượng điều hướng để chống hoàn toàn hiện tượng tràn dòng mất chữ.
  - Tên chủ nuôi hiển thị tên thật thân thiện, loại bỏ hoàn toàn hậu tố tài khoản mang tính kỹ thuật `(@test2)`.
- **Trạng Thái Đọc Tin Nhắn Chuẩn Xác (Seen Receipt Không Nhấp Nháy):**
  - Tin nhắn mới gửi đi mang trạng thái `isRead = false`, hiển thị nhãn **`Đã gửi`** kèm biểu tượng `check`.
  - Chỉ hiển thị nhãn **`Đã xem`** kèm avatar tròn của đối phương tại đúng vị trí tin nhắn gần nhất mà đối phương đã thực tế đọc (`isRead = true`), khắc phục triệt để lỗi hiển thị nhấp nháy từ "Đã xem" sang "Đã gửi".
- **Đồng bộ Mục Đích Tìm Kiếm Duy Nhất (`Single-Select Purpose Mapping`):**
  - Trong **Thiết lập hồ sơ kết nối (`tinder_setup`)**, thuộc tính **Mục đích tìm kiếm (`lookingFor` / `intent`)** bắt buộc chọn **đúng 1 trong 3 mục đích chuẩn** bằng Selector/Chips:
    1. `Cùng dắt thú cưng đi dạo` (`playdate`)
    2. `Hẹn hò cho người yêu thú` (`dating`)
    3. `Giao lưu hội nuôi thú cưng` (`community`)
- **Triệt Tiêu Lỗi Vòng Lặp Vô Tận (Anti-loop Stability):**
  - Đảm bảo cơ chế tự động nạp thẻ của Tinder và các Selector Modal sử dụng ref guards và immutable primitives thay vì dependency mảng/hàm không ổn định, ngăn chặn hoàn toàn lỗi "Maximum update depth exceeded".

### 2.3 Thông Báo Thiết Bị Tự Nhiên (`Native Mobile Push Notifications`)
- **Tích hợp `expo-notifications` toàn diện:**
  - Cấu hình Foreground Notification Handler kích hoạt đầy đủ banner cảnh báo (Alert Banner), âm thanh chuông (Sound) và biểu tượng trên thanh trạng thái hệ điều hành (Android / iOS Status Bar).
  - Xin cấp quyền thông báo hệ thống khi khởi động ứng dụng.
  - Cơ chế Polling thời gian thực kiểm tra thông báo mới từ PostgreSQL: Khi có người dùng khác gửi lời mời kết bạn, chấp nhận kết bạn hoặc Match, ứng dụng lập tức kích hoạt `Notifications.scheduleNotificationAsync` để đẩy thông báo nổi (Heads-up Notification) trên màn hình điện thoại ngay lập tức.

### 2.4 Tab 4 & Xem Hồ Sơ Cá Nhân: Đồng Nhất Bố Cục 100% & Selector-First UX
- **Bỏ theo dõi cân nặng theo tháng:** Cân nặng thú cưng là thông số được cài đặt 1 lần (hiển thị trên chip thông số chính), loại bỏ biểu đồ giả lập cân nặng theo tháng để giữ giao diện súc tích, thực tế.
- **Cố định Theme Thương Hiệu Duy Nhất:** Loại bỏ chức năng chuyển đổi Theme màu. Toàn bộ ứng dụng sử dụng cố định bảng màu nhận diện chuẩn Pawty (`Coral`, `Mint`, `Warm Cream`). Xóa bỏ hoàn toàn mục đổi Theme trong cài đặt và menu hồ sơ.
- **Đồng nhất tuyệt đối bố cục Hồ sơ giữa "Bản thân tự nhìn" và "Người ngoài nhìn vào":**
  - Khi người dùng bấm xem trang cá nhân của người khác từ **Khám phá**, **Tin nhắn**, **Kết nối (Tinder)**, **SOS**, hoặc **Thông báo**, hệ thống điều hướng về đúng giao diện chuẩn của **`MobileProfileScreen`**.
  - **Bố cục 2 bên giống hệt nhau 100%** (lấy bố cục của bản thân làm chuẩn):
    - Cùng thanh tab ngang: `[Con sen]` và các tab `[Tên từng bé thú cưng]`.
    - Trang Con sen: Cùng khung Ảnh bìa, Avatar tròn chồng 50% lên ảnh bìa, Tên, Nghề nghiệp, Câu giới thiệu, Khu vực, Chips thông tin (Cung hoàng đạo, MBTI, Tuổi, Học vấn), Thẻ thống kê và Lưới bài đăng Khoảnh khắc.
    - Trang Thú cưng: Cùng giao diện Ảnh bé cưng tràn toàn màn hình, nút `< >` chuyển ảnh, chạm đúp thả tim nổ, và thẻ kính mờ nửa dưới cuộn xuôi xuống xem đầy đủ Tính cách, Thói quen tốt, Lưu ý dạo chung, Sở thích ăn uống, Lịch sử tẩy giun, Tiền sử bệnh lý và Sổ tiêm chủng.
  - **Điểm khác biệt duy nhất về nút thao tác:**
    - **Khi bản thân tự xem (`!isViewingOther`):** Hiển thị các nút chỉnh sửa (`Đổi ảnh bìa`, camera đổi avatar, dấu `+` ghi chú, bút chỉnh sửa chủ, nút `+` thêm thú cưng trên thanh tab, nút `+ Đăng bài`, tab `Được lưu`, nút camera & bút sửa thú cưng, menu `☰`).
    - **Khi người ngoài xem (`isViewingOther`):** Ẩn 100% các nút chỉnh sửa của chủ nhân; hiển thị nút `← Quay lại` trên thanh đầu trang và cụm nút tương tác khách xem: **`[Kết bạn / Đã gửi lời mời / Bạn bè]`**, **`[Theo dõi / Đang theo dõi]`**, và **`[Nhắn tin]`**.
- **Chuẩn Hóa Selector Toàn Diện & Media Cloudinary:**
  - Đổi ảnh đại diện, ảnh bìa, ảnh các bé thú cưng tự động đẩy lên Cloudinary và lưu lại liên kết HTTPS trên database.

### 2.5 Nhánh `SOS Thú Lạc`: Miễn Phí 100% & Tinh Gọn AI Đúng Trọng Tâm
- **Đăng bài SOS miễn phí 100%:** Gỡ bỏ hoàn toàn phí 39.000đ / 19.000đ và mã VietQR. Chủ nuôi điền thông tin và bấm **"Phát tín hiệu SOS khẩn cấp"** là bài đăng được xuất bản ngay lập tức.
- **Chức năng AI duy nhất:** Chỉ giữ nút **`AI Đọc Ảnh Tạo Mô Tả`** trong form đăng bài SOS — đọc bức ảnh thú cưng mà chủ gửi vào để tự động tạo câu mô tả đặc điểm nhận dạng.

### 2.6 Tab 3: Tin Nhắn (`Chat`) — Tách Biệt 2 Phân Hệ & Cơ Chế Hủy Match Xóa Sạch
- **Hộp thư Mạng xã hội (`Social DMs`):** Nhắn tin tự do không cần kết bạn, xem Hồ sơ Mạng xã hội, xóa toàn bộ tin nhắn.
  - Khi người dùng ở trang Khám phá hoặc trang cá nhân của người khác và bấm **[Nhắn tin]**, hệ thống bắt buộc điều hướng vào cuộc trò chuyện **Mạng xã hội** (`social`), hiển thị ảnh đại diện mạng xã hội (`user.avatarUrl`), tuyệt đối không nhảy nhầm sang hội thoại Hẹn hò (`dating`) dù hai người đã match nhau trên Tinder.
- **Hộp thư Hẹn hò & Kết nối (`Dating / Matches Chat`):** Bắt nguồn từ Match Tinder, chỉ xem Hồ sơ Hẹn hò (bảo mật tuyệt đối), hiển thị ảnh thẻ hẹn hò (`photoUrls[0]`), nút Hủy tương hợp (Bỏ Match) xóa sạch tin nhắn trong PostgreSQL và chặn tái xuất hiện.
  - Tách biệt danh tính: Avatar ở hồ sơ hẹn hò lấy từ thẻ ảnh hẹn hò (`photoUrls[0]`), hoàn toàn độc lập với avatar ở hồ sơ mạng xã hội (`user.avatarUrl`).

### 2.7 Giao Diện Đăng Nhập & Đăng Ký Thân Thiện (Loại Bỏ Text Kỹ Thuật)
- **Tối ưu văn phong thân thiện với người dùng cuối:**
  - Ô nhập tài khoản: placeholder `Nhập số điện thoại hoặc tên đăng nhập` (loại bỏ hoàn toàn các chuỗi kỹ thuật `VD: 0900000001 hoặc test1`).
  - Nhãn nút đăng nhập: `Đăng nhập` (loại bỏ hoàn toàn nhãn `Đăng nhập ngay (1 Thiết bị)`).
  - Loại bỏ hoàn toàn khối thông báo mang tính kỹ thuật "Bảo mật 1 thiết bị: Tài khoản chỉ được đăng nhập trên 1 điện thoại...".
  - Giữ lại đầy đủ tính năng ghi nhớ phiên đăng nhập trên thiết bị với nút **"Vào thẳng"** nhanh chóng và tiện lợi.

### 2.8 Hệ Thống Thông Báo Toast Đa Tầng (Multi-layer Toast Modal Overlay)
- **Đảm bảo Toast luôn nổi trên cùng:** Toàn bộ thông báo hệ thống (`toastMessage`) được bao bọc trong một React Native `<Modal transparent statusBarTranslucent animationType="fade">` với `pointerEvents="box-none"`.
- Nhờ cơ chế Modal native, Toast không bao giờ bị che khuất hoặc in chìm bên dưới bất kỳ Modal giao diện nào (như Modal Thêm thú cưng, Sửa hồ sơ, Bộ lọc, Cài đặt). Người dùng luôn đọc được trọn vẹn thông báo phản hồi.

### 2.9 Tách Biệt Tuyệt Đối 100% Giữa Hồ Sơ Hẹn Hò & Mạng Xã Hội (Zero Cross-Profile Leak)
- **Nguyên tắc cô lập danh tính 2 chiều:**
  - **Từ Hẹn hò (Dating / Tinder / Chat Tinder):** Chỉ thấy Hồ sơ Hẹn hò (`TinderProfileDetailModal`), ảnh thẻ date, intent, lifestyle. Tuyệt đối KHÔNG hiển thị username mạng xã hội (`ownerHandle`), KHÔNG có nút hay liên kết "Xem trang mạng xã hội", không lộ feed bài đăng thường nhật.
  - **Từ Mạng xã hội (Social / Khám phá / Chat Social):** Chỉ thấy Hồ sơ Mạng xã hội (`MobileProfileScreen`), avatar cá nhân, bio MXH, bài viết Moments và danh sách Boss gia đình. Tuyệt đối KHÔNG có thông tin Hẹn hò (không lộ mục đích tìm bạn Tinder, không lộ ảnh date, không có nút mở hồ sơ Hẹn hò).
  - Người dùng dù biết tài khoản MXH của đối phương cũng không thể xem hoặc biết được hồ sơ Dating của họ, và ngược lại.

### 2.10 Bố Cục Cuộn Hồ Sơ Boss Tránh Đè Lớp (Pet Profile Scroll Integrity)
- Cụm nút thao tác trên ảnh thú cưng (nhãn loài thú cưng, nút thích, nút thêm ảnh, nút sửa thông tin, cùng 2 nút mũi tên chuyển ảnh `‹` và `›`) được đặt trọn vẹn bên trong khu vực ảnh (`petPhotoSpacerArea`) của ScrollView.
- Khi người dùng cuộn xuống dưới đọc thông tin sổ sức khỏe & tiêm chủng, toàn bộ nút điều khiển ảnh sẽ cuộn lên trên cùng với ảnh một cách tự nhiên, triệt tiêu hoàn toàn hiện tượng nút và mũi tên bay lơ lửng đè lên văn bản.

### 2.11 Hồ Sơ Hẹn Hò Chuyên Sâu Tách Biệt Toàn Diện (Dedicated Dating Identity)
- **Tên hiển thị hẹn hò riêng biệt (`datingDisplayName`):** Người dùng có thể đặt biệt danh hoặc tên riêng trên thẻ hẹn hò (ví dụ: "Minh Anh", "Candy") hoàn toàn độc lập với tên thật trên hồ sơ Con Sen mạng xã hội.
- **Bộ ảnh thẻ hẹn hò riêng biệt (`photoUrls` / `photos`):** Người dùng tải lên album ảnh riêng dành cho hẹn hò (lưu trữ trên Cloudinary folder `pawty/tinder`), hỗ trợ thêm/xóa ảnh linh hoạt, ảnh đầu tiên làm avatar thẻ Radar, hoàn toàn tách biệt với avatar và ảnh bìa mạng xã hội.
- **Lời tự bạch hẹn hò (`datingBio`):** Đoạn giới thiệu bản thân riêng khi kết nối dắt dạo, tách biệt với bio mạng xã hội.
- **Bé cưng đồng hành (`datingPetId`):** Người dùng chọn 1 bé thú cưng đại diện để đồng hành trên Radar Kết nối.
- **Lối sống & Gu trò chuyện:** Cung cấp đầy đủ các thông số chi tiết (Độ tuổi, Giới tính, Mục đích kết nối chuẩn, Lối sống: Hút thuốc, Thể thao, Đồ uống, Cung hoàng đạo, Gu chat, Châm ngôn ấn tượng).

### 2.12 Khắc Phục Lỗi Bàn Phím Đẩy View Mất Tiêu Đề Hồ Sơ Con Sen (Modal View Jump Fix)
- Điều chỉnh cấu trúc `fullscreenModalCard` sử dụng `height: '88%'` và `maxHeight: '88%'` kết hợp `flexShrink: 1` và `ScrollView keyboardShouldPersistTaps="handled"`.
- Khi bàn phím xuất hiện trên Android / iOS, modal tự động co giãn trong vùng viewport hiển thị khả dụng, giữ nguyên phần thanh tiêu đề (Header row với tên modal và nút đóng X) luôn nằm cố định trong tầm mắt người dùng, không bao giờ bị đẩy vượt mép trên màn hình.

### 2.13 Ẩn Toàn Bộ Username / @handle Trên Tất Cả Màn Hình (Total Username Masking)
- Scan toàn diện toàn bộ ứng dụng và loại bỏ hiển thị `@username` / `@handle`:
  - **Trang Khám phá:** Ẩn text `@handle` dưới tên tác giả của bài viết; placeholder ô tìm kiếm chuyển thành `Tìm bài viết, #hashtag, người dùng...`.
  - **Trang Chat:** Ẩn `@partnerHandle` trong thanh tiêu đề cuộc trò chuyện (Header) và danh sách phòng chat (Chat list), chỉ hiển thị tên thân thiện và mô tả thú cưng / khoảng cách. Placeholder ô tìm kiếm chuyển thành `Tìm cuộc trò chuyện...`.
  - **Trang Hồ sơ cá nhân:** Ẩn `@handle` trong modal xem trước bài viết (`previewAuthorHandle`) và modal chi tiết bài viết (`postDetailAuthorHandle`).
  - **Trang SOS:** Thay thế hiển thị username bằng tên chủ nuôi sạch sẽ (`sos.ownerName`).
  - **Trang Onboarding:** Thay thế `@handle` bằng tên hiển thị hoặc nhãn thân thiện.

