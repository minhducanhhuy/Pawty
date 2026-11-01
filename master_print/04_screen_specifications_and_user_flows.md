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
- **Đăng bài mới (`new_moment`) lưu trữ thật vào PostgreSQL:**
  - **Loại bỏ hoàn toàn ô nhập ảnh bằng URL.** Chỉ giữ nút chọn nhiều ảnh/video từ Thư viện máy và chụp từ Camera (`expo-image-picker` xuất Base64 nén tối ưu để lưu bền vững vào PostgreSQL và hiển thị trên mọi thiết bị).
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
- **Xem Ai Đã Thích Mình (`Likes You` — Mở khóa 100% Free):**
  - Hiển thị trực tiếp danh sách tất cả người dùng đã thả tim hồ sơ của bạn (không làm mờ, không khóa VIP).
  - Cho phép bấm xem chi tiết hồ sơ của họ, bấm **[Thích lại & Kết nối ngay]** (tự động Match, bắn thông báo cho cả 2 bên và tạo phòng chat) hoặc **[Bỏ qua]**.
- **Bộ lọc Khoảng cách Không Giới Hạn (Bỏ trần 160km):**
  - Thanh trượt khoảng cách kéo rộng tới **500 km** hoặc chọn **`Không giới hạn`** để tìm kiếm không giới hạn bán kính địa lý.
- **Đồng bộ Mục Đích Tìm Kiếm Duy Nhất (`Single-Select Purpose Mapping`):**
  - Trong **Thiết lập hồ sơ kết nối (`tinder_setup`)**, thuộc tính **Mục đích tìm kiếm (`lookingFor` / `intent`)** bắt buộc chọn **đúng 1 trong 3 mục đích chuẩn** bằng Selector/Chips:
    1. `Cùng dắt thú cưng đi dạo` (`playdate`)
    2. `Hẹn hò cho người yêu thú` (`dating`)
    3. `Giao lưu hội nuôi thú cưng` (`community`)

### 2.3 Thông Báo Thiết Bị Tự Nhiên (`Native Mobile Push Notifications`)
- **Tích hợp `expo-notifications` toàn diện:**
  - Cấu hình Foreground Notification Handler kích hoạt đầy đủ banner cảnh báo (Alert Banner), âm thanh chuông (Sound) và biểu tượng trên thanh trạng thái hệ điều hành (Android / iOS Status Bar).
  - Xin cấp quyền thông báo hệ thống khi khởi động ứng dụng.
  - Cơ chế Polling thời gian thực kiểm tra thông báo mới từ PostgreSQL: Khi có người dùng khác gửi lời mời kết bạn, chấp nhận kết bạn hoặc Match, ứng dụng lập tức kích hoạt `Notifications.scheduleNotificationAsync` để đẩy thông báo nổi (Heads-up Notification) trên màn hình điện thoại ngay lập tức.

### 2.4 Tab 4 & Xem Hồ Sơ Cá Nhân: Đồng Nhất Bố Cục & Cố Định Giao Diện
- **Bỏ theo dõi cân nặng theo tháng:** Cân nặng thú cưng là thông số được cài đặt 1 lần (hiển thị trên chip thông số chính), loại bỏ biểu đồ giả lập cân nặng theo tháng để giữ giao diện súc tích, thực tế.
- **Cố định Theme Thương Hiệu Duy Nhất:** Loại bỏ chức năng chuyển đổi Theme màu. Toàn bộ ứng dụng sử dụng cố định bảng màu nhận diện chuẩn Pawty (`Coral`, `Mint`, `Warm Cream`). Xóa bỏ hoàn toàn mục đổi Theme trong cài đặt và menu hồ sơ.
- **Đồng nhất tuyệt đối bố cục Hồ sơ giữa "Bản thân tự nhìn" và "Người ngoài nhìn vào":**
  - Giữ nguyên bố cục chuẩn: Ảnh bìa, Avatar nổi 50%, Dấu cộng ghi chú trạng thái ở góc trên bên phải avatar, Thông tin cá nhân, Chips tính cách, Lưới khoảnh khắc. Phía người ngoài xem chỉ hiển thị thêm cụm nút quan hệ `[Kết bạn]` / `[Theo dõi]` / `[Nhắn tin]`.

### 2.3 Tab 4 & Xem Hồ Sơ Cá Nhân: Đồng Nhất Bố Cục 100% & Selector-First UX
- **Đồng nhất tuyệt đối bố cục Hồ sơ giữa "Bản thân tự nhìn" và "Người ngoài nhìn vào":**
  - Khi người dùng bấm xem trang cá nhân của người khác từ **Khám phá**, **Tin nhắn**, **Kết nối (Tinder)**, **SOS**, hoặc **Thông báo**, hệ thống điều hướng về đúng giao diện chuẩn của **`MobileProfileScreen`** (thay thế hoàn toàn modal rút gọn không đồng nhất trước đây).
  - **Bố cục 2 bên giống hệt nhau 100%** (lấy bố cục của bản thân làm chuẩn):
    - Cùng thanh tab ngang: `[Con sen]` và các tab `[Tên từng bé thú cưng]`.
    - Trang Con sen: Cùng khung Ảnh bìa, Avatar tròn chồng 50% lên ảnh bìa, Tên, Nghề nghiệp, Câu giới thiệu, Khu vực, Chips thông tin (Cung hoàng đạo, MBTI, Tuổi, Học vấn tuân thủ cài đặt ẩn/hiện của chủ hồ sơ), Thẻ thống kê (Người theo dõi, Đang theo dõi, Lượt thích) và Lưới bài đăng Khoảnh khắc.
    - Trang Thú cưng: Cùng giao diện Ảnh bé cưng tràn toàn màn hình, nút `< >` chuyển ảnh, chạm đúp thả tim nổ, và thẻ kính mờ nửa dưới cuộn xuôi xuống xem đầy đủ Tính cách, Thói quen tốt, Lưu ý dạo chung, Sở thích ăn uống, Lịch sử tẩy giun, Tiền sử bệnh lý, Biểu đồ cân nặng và Sổ tiêm chủng.
  - **Điểm khác biệt duy nhất về nút thao tác:**
    - **Khi bản thân tự xem (`!isViewingOther`):** Hiển thị các nút chỉnh sửa (`Đổi ảnh bìa`, camera đổi avatar, dấu `+` ghi chú, bút chỉnh sửa chủ, nút `+` thêm thú cưng trên thanh tab, nút `+ Đăng bài`, tab `Được lưu`, nút camera & bút sửa thú cưng, menu `☰`).
    - **Khi người ngoài xem (`isViewingOther`):** Ẩn 100% các nút chỉnh sửa của chủ nhân; hiển thị nút `← Quay lại` trên thanh đầu trang và cụm nút tương tác khách xem ngay dưới thông tin chủ nuôi: **`[Kết bạn / Đã gửi lời mời / Bạn bè]`**, **`[Theo dõi / Đang theo dõi]`**, và **`[Nhắn tin]`** (chỉ mở khi đã là bạn bè/kết nối).
- **Sửa lỗi Tạo Hồ Sơ Thú Cưng Mới & Lưu Database 100%:**
  - Sửa triệt để lỗi stale closure và kết nối trực tiếp `POST /api/pets`, `PUT /api/pets/:id`, `DELETE /api/pets/:id` để tạo/sửa/xóa thú cưng lưu vĩnh viễn vào PostgreSQL, hỗ trợ chọn ảnh từ máy/camera ngay khi tạo mới.
- **Chuẩn Hóa Selector Toàn Diện (Chủ Nuôi & Thú Cưng):**
  - Không bắt người dùng tự gõ các trường thuộc tính phân loại — chuyển toàn bộ sang **Selector chọn từ danh sách** (hoặc Multi-select Chips cho thói quen):
    - **Hồ sơ Chủ nuôi:** Giới tính, Độ tuổi, Ngày sinh (Date Picker), Khu vực sinh sống (Selector danh sách khu đô thị/quận), Nghề nghiệp (Selector danh mục nghề nghiệp), Học vấn (Selector trường/trình độ), Cung hoàng đạo (Selector), MBTI (Selector). Chỉ giữ nhập tay cho **Tên hiển thị** (`maxLength = 40`) và **Câu tự giới thiệu bản thân (`bio`)** có giới hạn ký tự (`maxLength = 150` kèm bộ đếm ký tự).
    - **Hồ sơ Thú cưng (Thêm mới & Chỉnh sửa):** Loài (Selector/Chips), Loài khác (Selector: Thỏ, Hamster, Nhím kiểng, Chim vẹt, Rùa, Sóc bay...), Giống loài (Selector), Giới tính (Selector/Chips), Ngày sinh (Date Picker), Độ tuổi (Selector), Cân nặng (Selector dải kg chuẩn), Sở thích ăn uống (Selector / Multi-chips), Lịch sử tẩy giun (Selector chu kỳ & loại thuốc), Tiền sử bệnh lý (Selector tình trạng sức khỏe), Thói quen tốt (Multi-select Chips), Lưu ý khi dạo chung (Multi-select Chips), Tên vắc-xin & Mũi tiêm & Ngày tiêm (Selector + Date Picker), Tháng & Cân nặng theo dõi (Selector). Chỉ giữ nhập tay cho **Tên bé** (`maxLength = 30`) và **Tự mô tả tính cách (`bio`)** có giới hạn ký tự (`maxLength = 160` kèm bộ đếm ký tự).

### 2.4 Nhánh `SOS Thú Lạc`: Miễn Phí 100% & Tinh Gọn AI Đúng Trọng Tâm
- **Đăng bài SOS miễn phí 100%:** Gỡ bỏ hoàn toàn phí 39.000đ / 19.000đ và mã VietQR. Chủ nuôi điền thông tin và bấm **"Phát tín hiệu SOS khẩn cấp"** là bài đăng được xuất bản ngay lập tức. (Mức hậu tạ người tìm thấy chuyển thành Selector tùy chọn: `Không kèm hậu tạ`, `Hậu tạ cảm ơn nhẹ`, `500.000đ`, `1.000.000đ`, `2.000.000đ`, `Thương lượng trực tiếp`).
- **Chức năng AI duy nhất:** Chỉ giữ nút **`AI Đọc Ảnh Tạo Mô Tả`** trong form đăng bài SOS — đọc bức ảnh thú cưng mà chủ gửi vào để tự động tạo câu mô tả đặc điểm nhận dạng. Xóa sạch toàn bộ chế độ Bản đồ AI Truy Vết lộ trình và banner AI quét Feed tự động.

### 2.5 Tab 3: Tin Nhắn (`Chat`) — Tách Biệt 2 Phân Hệ & Cơ Chế Hủy Match Xóa Sạch

- **Tách riêng 2 phân hệ hộp thư độc lập:**
  1. **Hộp thư Mạng xã hội (`Social DMs` — Mô hình Mở chuẩn Pinterest / Facebook):**
     - **Nhắn tin không cần kết bạn:** Người dùng có thể nhắn tin trực tiếp với bất kỳ ai trên Pawty mà không bắt buộc phải gửi lời mời hay chờ đối phương đồng ý kết bạn. Nút "Nhắn tin" trên bài đăng Khám phá hay Trang cá nhân mở ngay phòng chat mở.
     - **Xem hồ sơ chuẩn Mạng xã hội:** Khi bấm vào avatar, tên hoặc menu `⋮` trong phòng chat này, ứng dụng mở **Hồ sơ Mạng Xã Hội (Social Profile)** xem đầy đủ thông tin con sen, các bé thú cưng, sổ tiêm và lưới bài đăng khoảnh khắc.
     - **Công cụ quản lý:** Hỗ trợ tìm kiếm bạn bè / cư dân trên thanh tìm kiếm và nút "Xóa toàn bộ tin nhắn" (có modal xác nhận).
  2. **Hộp thư Hẹn hò & Kết nối (`Dating / Matches Chat`):**
     - Chỉ lưu trữ các cuộc trò chuyện phát sinh từ việc 2 bên quẹt phải tương hợp (`Tinder Match`).
     - **Cô lập danh tính 100% (Chỉ xem Hồ sơ Hẹn hò):**
       - Ở phân hệ này, người dùng **CHỈ ĐƯỢC PHÉP XEM HỒ SƠ HẸN HÒ (Dating Profile)** của đối phương (bộ ảnh date, bio hẹn hò, mục đích kết nối, bé thú cưng đi cùng và lifestyle chips).
       - **Tuyệt đối KHÔNG hiển thị hay điều hướng sang Hồ sơ Mạng xã hội** (không lộ bài đăng khoảnh khắc, không lộ trang cá nhân thường ngày) nhằm bảo vệ tính riêng tư tuyệt đối cho việc hẹn hò.
     - **Cơ chế Hủy Tương Hợp (Bỏ Match) Triệt Để:**
       - Trong menu `⋮` của phòng chat hẹn hò có nút **"Bỏ tương hợp (Hủy Match)"** kèm Modal xác nhận cảnh báo.
       - Khi người dùng xác nhận bỏ match:
         1. **Xóa sạch 100% tin nhắn:** Xóa toàn bộ nội dung tin nhắn giữa hai người trong PostgreSQL bảng `messages`.
         2. **Xóa cuộc trò chuyện:** Xóa bản ghi trong bảng `conversations`.
         3. **Chặn vĩnh viễn không hiển thị lại:** Cập nhật trạng thái `match` thành `unmatched` trong PostgreSQL. Người này sẽ bị loại trừ vĩnh viễn khỏi danh sách quẹt thẻ (`candidates`), danh sách thích bạn (`likes_you`) và tìm kiếm — **không bao giờ xuất hiện lại**.

- **Menu Quản lý Phòng Chat:**
  - Phòng Chat Mạng Xã Hội: `[Xem Trang Mạng Xã Hội]` · `[Xóa toàn bộ tin nhắn]`.
  - Phòng Chat Hẹn Hò: `[Xem Hồ Sơ Hẹn Hò]` · `[Bỏ tương hợp & Xóa cuộc trò chuyện]`.

### 2.6 Trung Tâm Thông Báo (`Notifications` — Thiết Kế Lại Toàn Diện)
- **Phân loại danh sách trực quan bằng Thanh Tab Lọc:**
  1. **`Tất cả`**: Toàn bộ thông báo mới nhất.
  2. **`Kết bạn & Match`**:
     - Lời mời kết bạn đến (`friend_request`): Hiển thị avatar người gửi, nội dung rõ ràng và 2 nút thao tác trực tiếp **`[Chấp nhận]`** / **`[Từ chối]`** (sau khi bấm cập nhật trạng thái ngay lập tức thành *"Đã chấp nhận lời mời kết bạn"* hoặc *"Đã từ chối"* và lưu vào DB).
     - Phản hồi kết bạn (`friend_accepted`): Thông báo khi đối phương đã đồng ý kết bạn kèm nút **`[Nhắn tin ngay]`**.
     - Ghép đôi thành công (`match`): Thông báo khi 2 bên tương hợp trên Kết nối kèm nút **`[Trò chuyện]`**.
  3. **`Theo dõi & Tương tác`**:
     - Người mới theo dõi (`follow`): Có nút xem hồ sơ / theo dõi lại.
     - Bài viết mới từ người đang theo dõi (`new_post`), lượt thả Paw/Tim (`post_reaction`), bình luận mới (`post_comment`).
  4. **`SOS`**: Thông báo tin SOS mới quanh khu vực hoặc manh mối nhìn thấy thú lạc (`sos_sighting`).
- **Công cụ Quản lý Thông báo đầy đủ:**
  - Nút **`Đọc tất cả`** (đánh dấu toàn bộ là đã đọc, xóa badge đỏ).
  - Nút **`Xóa tất cả`** (có xác nhận) và nút **`✕`** xóa lẻ từng thông báo khỏi danh sách.
  - Chạm vào avatar/nội dung thông báo tự động đánh dấu đã đọc và điều hướng chính xác tới Hồ sơ người đó, Phòng chat, Bài viết, hoặc trang SOS tương ứng.
