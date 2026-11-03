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
- **Cơ chế Lazy Loading Bảng Tin Facebook-style (5 bài/lượt):**
  - Khám phá áp dụng phân trang tải thông minh: ban đầu chỉ tải và render đúng **5 bài viết đầu tiên** (`batch size = 5`).
  - Khi người dùng cuộn đến gần cuối danh sách (`onEndReachedThreshold = 0.5`), hệ thống tự động lazy-load thêm 5 bài viết tiếp theo kèm biểu tượng xoay tải `ActivityIndicator`.
  - Cấu hình FlatList tối ưu hóa bộ nhớ: `initialNumToRender = 3`, `maxToRenderPerBatch = 5`, `windowSize = 5`, `removeClippedSubviews = true` giúp ứng dụng hoạt động 60fps mượt mà, triệt tiêu hiện tượng lag/đơ máy khi bảng tin có nhiều bài viết.
  - Khi kéo xuống để làm mới (`Pull-to-Refresh`), danh sách được tải lại và reset về đúng 5 bài viết đầu tiên.
- **Modal Bình Luận Bottom-Sheet Facebook-style (Thay thế Accordion Xổ Xuống):**
  - Khi người dùng ấn vào nút bình luận trên thẻ bài viết, hệ thống mở một **Modal Bottom Sheet riêng biệt trượt từ dưới lên (chiếm 80-85% chiều cao màn hình)** thay vì xổ xuống đẩy dài thẻ bài viết trong bảng tin.
  - **Header Modal:** Thanh kéo nhỏ (drag indicator pill), tiêu đề *"Bình luận ({tổng số})"* và nút đóng `✕`.
  - **Lazy Loading Bình Luận:** Ban đầu chỉ hiển thị **5 bình luận** đầu tiên. Nếu có nhiều hơn 5 bình luận, hiển thị nút *"Xem thêm bình luận cũ hơn..."* (+5 bình luận mỗi lần bấm) để không làm đơ giao diện khi bài viết có nhiều phản hồi.
  - **Cố định thanh nhập liệu:** Thanh input bình luận được ghim cố định ở đáy Modal (`KeyboardAvoidingView`), có avatar của người dùng hiện tại, ô nhập *"Viết bình luận công khai..."*, nút gửi Paw và thanh thông báo *"Đang trả lời @[Tên] • [Hủy]"*.
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
- **Cơ chế Bộ Đệm Trượt Thông Minh Tinder (Sliding Window Buffer = 5 Thẻ):**
  - Để tối ưu hóa hiệu năng và hạn chế tiêu thụ RAM/bộ nhớ đệm ảnh trên thiết bị di động, cọc thẻ Tinder áp dụng cơ chế bộ đệm trượt (**Sliding Window Buffer = 5 cards**).
  - FE chỉ duy trì tối đa 5 thẻ ứng viên trong hàng đợi hiển thị. Khi người dùng quẹt (Pass hoặc Like) 1 thẻ, thẻ đó được giải phóng và 1 thẻ tiếp theo từ kho dữ liệu sẽ được đẩy vào hàng chờ.
  - Tránh hoàn toàn việc render hàng chục thẻ cùng lúc gây tải trước hàng loạt ảnh nặng và ngốn tài nguyên thiết bị.
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
- **Bố Cục Thẻ Tinder Tinh Gọn & Con Dấu Quẹt Trực Quan (Borderless Swipe Icons):**
  - **Con dấu Phản hồi Quẹt Thẻ (Swipe Icons):**
    - Thiết kế tối giản, loại bỏ hoàn toàn khung viền vuông/squircle cứng nhắc (`borderWidth: 0`, `backgroundColor: 'transparent'`), sử dụng biểu tượng nổi bật với hiệu ứng đổ bóng mờ (`drop shadow`) để hiển thị sắc nét trên mọi bức ảnh thú cưng:
      - **Quẹt sang phải (Thích / Like):** Biểu tượng **Trái tim Đỏ** (`Feather name="heart"`, size 58, màu `#EF4444`, `fill="#EF4444"`), nghiêng góc -15 độ, opacity mượt mà theo cử chỉ kéo ngón tay.
      - **Quẹt sang trái (Bỏ qua / Pass):** Biểu tượng **Dấu X Trắng** (`Feather name="x"`, size 58, màu `#FFFFFF`, `strokeWidth={4}`), nghiêng góc 15 độ, opacity mượt mà theo cử chỉ kéo ngón tay.
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

### 2.6 Màn Hình Khởi Động Mobile (Splash Screen), Hoạt Ảnh Mascot Frame-by-Frame & Bộ Loading Xoay Tròn (Pawty Loading Spinner)
- **Quy chuẩn Splash Screen Mobile:**
  - **Màu nền toàn màn hình:** `#FDFBF7` (trắng kem ấm áp thương hiệu Pawty).
  - **Thời gian chờ khởi động (Splash Boot Delay):** Kéo dài 3000ms (3s mặc định + 5s delay mở rộng theo yêu cầu người dùng) để trải nghiệm trọn vẹn chu kỳ hoạt cảnh chữ P đáng yêu trước khi chuyển tiếp vào màn hình chính / đăng nhập.
  - **Cụm đầu trang (Đẩy lên trên một chút):** Chữ Pawty hòa trực tiếp vào nền kem với hiệu ứng phát sáng mờ ảo bám sát từng nét chữ (`letter-contour drop-shadow blur`), tiêu đề "Những bàn chân nhỏ đang tới" màu san hô `#FF6F61` và dòng chữ nhỏ "Mạng xã hội kết nối người nuôi thú cưng" màu xám ấm `#7A6E63`.
  - **Hoạt cảnh Mascot Chữ P Frame-by-Frame Mượt Mà (Vị trí ô 1):**
    - Tách riêng nguyên chữ P từ 4 hình gốc của người dùng, loại bỏ đường gạch chân và thanh bar cũ.
    - Hoạt cảnh lặp tuần hoàn 4 khung hình chuyển động siêu đáng yêu với hiệu ứng hòa mờ mượt mà (`Crossfade Opacity Transition`) và nhún nhảy hoạt hình nhẹ nhàng (`organic idle bounce`):
      1. Khung 1: Chữ P đứng vẫy nón sinh nhật vui tươi (450ms).
      2. Khung 2: Chữ P nghiêng người chạy tăng tốc với nón ngủ vẫy theo gió (380ms).
      3. Khung 3: Chữ P nằm bẹp ngủ say kèm bọt khí "z z Z" (650ms).
      4. Khung 4: Chữ P thức dậy phóng vụt về phía trước (380ms).
    - Căn chỉnh chân chữ P đồng phẳng mặt sàn, hiệu ứng chuyển khung có làm mờ chuyển tiếp triệt tiêu giật hình.
  - **Thanh chạy tiến trình liên tiếp (Vị trí ô 2):**
    - Nằm ngay dưới hoạt cảnh mascot chữ P: Thanh chạy liên tiếp vô tận (`continuous indeterminate running bar`) với vệt san hô `#FF6F61` trượt tuần hoàn từ trái sang phải trên rãnh mờ, tạo cảm giác tải ứng dụng sống động.
    - Dưới cùng là dòng trạng thái tải: `ĐANG KẾT NỐI CỘNG ĐỒNG BOSS...` màu `#A89F95` dãn chữ (`letterSpacing: 1.5`).

- **Bộ Biểu Tượng Tải Ứng Dụng (Pawty Loading Spinner & Loading State):**
  - **Biểu tượng xoay tròn ribbon (PawtySpinner):**
    - Sử dụng hình ảnh vòng dải băng san hô & xanh mint uốn lượn kèm biểu tượng chữ 'z z Z' đáng yêu (`pawty-spinner.png`).
    - Hoạt cảnh xoay tròn 360 độ liên tục vô tận (`continuous 360-degree rotation`, chu kỳ 2000ms), xoay quanh đúng tâm hình học đồng trục.
    - Kích thước hiển thị chuẩn 80-84px, đường nét đậm đà, sắc nét, tương phản cao, triệt tiêu hiện tượng mờ nhạt pastel.
  - **Dòng thông điệp tải kèm hiệu ứng 3 chấm nhảy tuần tự (`PawtyLoadingState`):**
    - Câu thông điệp dễ thương: `"Đợi Pawty xíu nha..."`.
    - Dấu 3 chấm xuất hiện tuần tự từng dấu chấm một và lặp lại (`""` -> `"."` -> `".."` -> `"..."`, chu kỳ ~380ms/nhịp).
  - **Quy chuẩn bố cục Không Đóng Thẻ Card (No Card Box Policy):**
    - Tuyệt đối không đóng khung biểu tượng loading vào bất kỳ thẻ card trắng, viền bo tròn hay bóng đổ nào.
    - Loading hòa trực tiếp và lơ lửng tự nhiên trên nền màu kem thương hiệu `#FDFBF7`.
    - Triệt tiêu 100% vòng xoay mặc định của hệ điều hành Android (sử dụng `progressViewOffset={-1000}` đẩy hoàn toàn ra ngoài màn hình kết hợp `colors={['transparent']}` và `progressBackgroundColor="transparent"`).
    - Thay thế toàn bộ bằng biểu tượng ribbon xoay tròn 360 độ của Pawty (`PawtySpinner.tsx`) nằm ngay phía trên dòng chữ "Đợi Pawty xíu nha...", mang lại trải nghiệm thương hiệu độc bản, không bị trùng lặp 2 biểu tượng loading.
  - **Phạm vi áp dụng trong ứng dụng (In-App Loading):**
    - Kéo làm mới bảng tin Khám phá (`Pull-to-refresh Explore Feed`) khi mạng yếu hoặc tắt Wi-Fi.
    - Trạng thái chờ tải dữ liệu ban đầu của Bảng tin, Kết nối ghép đôi và Trang cá nhân.
    - Modal xác thực hoặc chờ phản hồi từ máy chủ.
- **Hiệu ứng Logo Chữ Viết Cọ Mực (Calligraphy Brush Reveal & Dog Tail Wag):**
  - **Khắc phục triệt để lỗi đứt gãy khớp đuôi chữ Y:** Neo tâm quay chuẩn xác tại tọa độ tiếp giáp đuôi và thân chữ Y (`transform-origin: 66.4% 67.4% 0px`), đảm bảo khi lắc đuôi góc từ `-8deg` đến `+11deg`, khớp nối hoàn toàn liền mạch không tách rời một pixel nào.
  - **Hiệu ứng Cây cọ viết (Brush Writing Reveal):** Mô phỏng nét cọ vẽ mực ướt từ trái sang phải, chữ "Pawty" được hé lộ tuần tự từ chữ P đội nón sinh nhật sang chữ y bằng clipping mask động kết hợp mờ ảo (bloom). Khi nét cọ hoàn thành chữ y, đuôi cún lập tức xuất hiện và vẫy mừng vui nhộn cùng sóng âm xanh mint.
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
- **Cơ chế Chống Xung Đột Tin Nhắn Lạc Quan (Optimistic Message Reconciliation):**
  - Khi người dùng bấm gửi tin nhắn, giao diện hiển thị ngay lập tức với ID tạm (`temp-msg-${timestamp}`).
  - Hệ thống duy trì một bộ đệm tham chiếu theo dõi (`pendingChatMessagesRef`). Khi tiến trình ngầm (Background Poller mỗi 3.5s) hoặc khi chuyển tab nạp lại danh sách cuộc trò chuyện từ máy chủ đám mây (Cloud Database latency ~1-2s), hàm điều hòa `reconcileChatRoomsWithPending` sẽ bảo tồn toàn bộ tin nhắn đang gửi dở (pending) và gộp vào cuối danh sách.
  - Triệt tiêu 100% hiện tượng tin nhắn chớp nháy, biến mất rồi mới hiện lại sau khi database đám mây hoàn tất ghi.

### 2.7 Giao Diện Đăng Nhập & Onboarding Chuẩn Nhận Diện Mới (Playful Minimalism)
- **Cơ Chế Ghi Nhớ Phiên Đăng Nhập & Tự Động Vào Thẳng Khám Phá (Zero-Friction Auto-Login):**
  - Khi thiết bị đã có phiên đăng nhập hợp lệ trong máy (`AsyncStorage`), ngay khi màn hình Splash khởi động (`SplashBootScreen`) hoàn tất hoạt cảnh mascot, hệ thống sẽ tự động khôi phục dữ liệu phiên và **tiến thẳng vào Tab Khám phá (`explore`)**.
  - **Loại bỏ hoàn toàn bước chạm trung gian:** Gỡ bỏ thẻ *"Chào mừng bạn quay lại"* và nút *"Vào thẳng ->"*. Người dùng mở app là vào thẳng không gian cộng đồng nuôi thú cưng mượt mà, không gián đoạn.
  - Màn hình Onboarding/Đăng nhập chỉ hiển thị khi người dùng lần đầu cài đặt ứng dụng hoặc đã chủ động bấm **"Đăng xuất"** từ Tab Tôi.
- **Bảo tồn hệ màu thương hiệu:** Nền kem ấm áp `#FDFBF7`, điểm nhấn san hô `#FF6F61` và xanh mint `#A3E4D7`.
- **Hòa nền Wordmark Logo:** Tuyệt đối không đóng khung chữ trong bất kỳ hình bo tròn, hình oval hay thẻ card nào. Hiệu ứng phát sáng mờ ảo bám sát theo từng chữ cái (`drop-shadow glow`) trên nền kem ấm `#FDFBF7`.
- **Loại bỏ đường viền bo tròn màu cam nhạt:** Thẻ lưu tài khoản (`savedAccountBox`) và các khối form loại bỏ viền cam (`borderWidth: 0`), chuyển sang giao diện phẳng hiện đại, tinh tế.
- **Tiêu đề sinh động "Những bàn chân nhỏ đang tới":**
  - Loại bỏ icon nhỏ đính kèm trong pill.
  - Sử dụng phông chữ bo tròn đáng yêu (`rounded font`), in đậm với hiệu ứng đổ bóng phát sáng mờ ảo (`blur text glow`).
  - Tích hợp hiệu ứng hoạt cảnh **Nổi bọt biển nhảy nhót theo từng ký tự (Bubble Bouncing Letter Wave)** — từng chữ cái nhún nhảy nhẹ nhàng như bọt bóng nước tạo cảm giác vui tươi, thân thiện ngay từ màn hình đăng nhập.
- **Tinh giản nội dung rườm rà:**
  - Bỏ dòng chữ phụ dài dòng: *"Mạng xã hội hình ảnh, kết nối bạn đi dạo và đặt lịch chăm sóc thú cưng quanh bạn."*
  - Bỏ dòng chữ giải thích nhỏ dưới tiêu đề *"Đăng nhập tài khoản"* và *"Chào mừng bạn quay lại"*.
- **Tối ưu Form đăng nhập:**
  - Placeholder ô tài khoản hiển thị đầy đủ, không bị cụt/thiếu: `SĐT hoặc tên đăng nhập`.
  - Icon mở xem mật khẩu hiển thị chuẩn xác **Icon Con Mắt (`eye` / `eye-off`)** (khắc phục lỗi thiếu mapping icon trong `FeatherIcon`).

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

### 2.14 Form Thêm & Sửa Thú Cưng Thông Minh (Smart Pet Onboarding & Custom Inputs)
- **Validate ngày sinh nghiêm ngặt:** Kiểm tra chặt chẽ ngày sinh không được vượt quá ngày hiện tại (không cho phép chọn ngày tương lai). Tự động cảnh báo Toast nếu ngày chọn không hợp lệ.
- **Tự động suy ra độ tuổi:** Loại bỏ bộ chọn độ tuổi thủ công; hệ thống tự động tính toán độ tuổi chính xác từ ngày sinh (`tuần tuổi`, `tháng tuổi`, `x.5 tuổi`, `x tuổi`) và lưu vào `ageLabel`.
- **Hỗ trợ nhập text tay tùy chỉnh (Custom Text Input):** Cung cấp ô nhập text tự do ngay trong bộ chọn (Selector) và form đối với: Cân nặng (`weightKg`), Màu lông (`furColor`), Sở thích ăn uống (`favoriteFood`), Lịch sử tẩy giun (`dewormingHistory`), Tiền sử bệnh lý (`medicalHistory`), Thói quen tốt (`goodHabits`), và Lưu ý khi dạo chung (`cautionHabits`). Người dùng có thể chọn nhanh từ danh sách gợi ý hoặc tự gõ nội dung thực tế của thú cưng.

### 2.15 Tối Ưu Hóa Hiệu Năng Cuộn Danh Sách Dài Với FlatList (Virtualization & 60 FPS Scrolling)
- Thay thế toàn bộ các `ScrollView` chứa mảng danh sách bài viết / tin nhắn dài (Bảng tin mạng xã hội `MobileExploreScreen`, Danh sách phòng chat `MobileChatScreen`) bằng **`FlatList`** chuẩn React Native.
- Tận dụng cơ chế ảo hóa (Virtualization) và tái sử dụng component (`initialNumToRender={4}`, `maxToRenderPerBatch={4}`, `windowSize={5}`) giúp cuộn mượt mà 60 FPS và triệt tiêu tràn RAM trên thiết bị thật.

### 2.16 Triệt Để Loại Bỏ @handle Trong Tiêu Đề Chat, Danh Sách Phòng Chat & Hồ Sơ Tinder (Zero Residual Handles)
- Áp dụng bộ lọc `cleanName()` triệt để tại mọi điểm hiển thị tên đối phương:
  - **Tiêu đề thanh Header phòng chat (`MobileChatScreen`):** Cả phân hệ Mạng xã hội lẫn Hẹn hò đều bắt buộc bọc `{cleanName(activeChat.partnerName)}` và các dialog xác nhận (`Xem Hồ sơ`, `Hủy tương hợp`, `Hủy kết bạn`).
  - **Danh sách phòng chat (`MobileChatScreen`):** Render tên người trò chuyện chuẩn qua `cleanName(room.partnerName)`.
  - **Hồ sơ chi tiết Tinder (`TinderProfileDetailModal`):** Loại bỏ nickname nếu trùng với tên chính sau khi làm sạch, và loại trừ toàn bộ chuỗi dạng `(@...)` hoặc `@username`.
  - **Bộ lọc Regex chuẩn hóa:** `cleanName` mở rộng xóa sạch cả pattern `(@...)` thiếu ngoặc đóng hoặc trailing `@.*`.

### 2.17 Chống Rớt Dòng Ngày Sinh & Tinh Chỉnh Khung Thông Số Thú Cưng (Pet Specs Layout Integrity)
- Tinh chỉnh `specFrostedChip` trong `MobileProfileScreen`:
  - `minWidth: 64`, `paddingHorizontal: 4`.
  - Nhãn `specChipValue` được cấu hình `numberOfLines={1}` và `adjustsFontSizeToFit={true}` với `fontSize: 11` cho chuỗi ngày sinh `DD/MM/YYYY`, đảm bảo không bao giờ bị rớt dòng thành `01/01/20 \n 24` trên các màn hình có mật độ hiển thị nhỏ.
  - Ảnh đại diện Boss khi chưa tải ảnh lên sẽ sử dụng fallback banner màu ấm chất lượng cao thay cho khung nền màu đơn điệu.

### 2.18 Cơ Chế Phân Đoạn Slide Thẻ Radar Tinder (Owner-First Then Pets Sequence)
- **Chuỗi trình tự hiển thị Story/Slide trên thẻ Radar:**
  - **Nhóm 1 - Slide Chủ Nuôi (Owner Slides):** Xuất hiện đầu tiên trong chuỗi slide.
    - Hiển thị toàn bộ album ảnh cá nhân của người dùng (`photoUrls` của chủ nuôi).
    - Thông tin đáy thẻ: Tên chủ nuôi & Tuổi (`Minh Anh, 24`), Khu vực sống & Giới tính (`Vinhomes Central Park · Nữ`), Khoảng cách tương đối (`Cách bạn 1.5 km`), Châm ngôn / Bio hẹn hò, kèm Chip thông báo số lượng Boss (`🐾 Có 2 bé cưng: Huhu, Miu`).
  - **Nhóm 2 - Slide Thú Cưng (Pet Slides):** Xuất hiện nối tiếp ngay sau khi người dùng bấm chuyển hết toàn bộ ảnh cá nhân của chủ nuôi.
    - Hiển thị lần lượt từng bé thú cưng trong danh sách `candidate.pets`.
    - Thông tin đáy thẻ chuyển động đồng bộ theo đúng bé thú cưng đang hiển thị: Tên bé & Tuổi (`Huhu · 1 tuổi`), Giống loài & Cân nặng (`Phốc Sóc (Pomeranian) · 2.5 kg`), Mối quan hệ với chủ nuôi (`Bé cưng của Minh Anh (24t)`), Khoảng cách, kèm Badge thứ tự (`🐾 Bé cưng 1/2`).
  - **Thanh đo tiến độ Dash Bar:** Tổng số vạch dash trên đầu thẻ bằng tổng số `[Ảnh cá nhân + Ảnh các bé thú cưng]`. Vạch sáng chuyển động nhịp nhàng theo đúng slide người dùng đang xem.

### 2.19 Làm Sạch Luồng Đăng Ký & Form Thú Cưng Mới (Zero Dummy Data & Clean Onboarding)
- **Chuẩn hóa luồng Đăng ký tài khoản mới:**
  - Người dùng đăng ký chỉ điền Họ tên, Số điện thoại, Mật khẩu, Tên bé, Giống loài.
  - Backend và Client tuyệt đối KHÔNG tự sinh dữ liệu giả (fake dummy data): tuổi, ngày sinh, cung hoàng đạo, MBTI, nghề nghiệp, học vấn, phong cách sống (hút thuốc, dắt cún, giao lưu) sẽ ở trạng thái `null` / `undefined`.
  - Không tự gán ảnh Unsplash hay sổ tiêm mẫu "verified" vào bé cưng mới tạo. Khi chưa tải ảnh, hiển thị placeholder chuẩn thương hiệu (Card màu ấm kem, icon bàn chân dễ thương kèm nút `+ Thêm ảnh`).
  - Toàn bộ thông tin nâng cao (Cân nặng, Thói quen, Sổ tiêm, Sở thích ăn uống) khi chưa nhập sẽ hiển thị trạng thái "Chưa cập nhật", khuyến khích người dùng tự hoàn thiện trong trang cá nhân.
- **Chuẩn hóa Modal "Thêm bé cưng mới" & "Chỉnh sửa bé cưng":**
  - Khởi tạo form ở trạng thái rỗng (`''`, `[]`), không tự điền trước bất kỳ giá trị mặc định nào (không mặc định 4.8kg, không mặc định Vàng kem, không mặc định Hạt dinh dưỡng & Ức gà, không tự thêm thói quen hay sổ tiêm).
  - Loại bỏ hoàn toàn bộ chọn "Độ tuổi" (tự động tính từ ngày sinh khi có ngày sinh, nếu chưa có ngày sinh thì hiển thị "Chưa rõ").
  - Lưu hồ sơ chỉ gửi đúng các trường người dùng thực sự nhập, không ép dữ liệu giả vào PostgreSQL.

### 2.20 Chuẩn Hóa Điều Kiện Huy Hiệu "An Tâm Dạo Chung" (Safe Pet Verification Guard)
- Huy hiệu `[✓ An tâm dạo chung]` trên thẻ chi tiết ứng viên Tinder và hồ sơ công khai chỉ được hiển thị khi:
  - Chủ nuôi có ít nhất 1 thú cưng (`candidate.pets.length > 0`).
  - Có ít nhất một bé đã được xác minh tiêm phòng đầy đủ (`candidate.pets.some(p => p.isVaccinatedAndRabies)`).
- Nếu chủ nuôi chưa có thú cưng (`0 bé`) hoặc chưa tiêm phòng đầy đủ: Tuyệt đối KHÔNG hiển thị huy hiệu "An tâm dạo chung".

### 2.21 Cô Lập Vùng Placeholder Ảnh Thú Cưng Rỗng (Zero Stacking Bug on Empty Pet Photo)
- **Khắc phục lỗi đè chữ giao diện:**
  - Vùng placeholder khi thú cưng chưa có ảnh đại diện (`hasUserPhotos === false`) được đặt cố định trọn vẹn bên trong `petPhotoSpacerArea` (khu vực 44% chiều cao phía trên), thay vì căn giữa toàn màn hình bằng `StyleSheet.absoluteFill`.
  - Icon camera, tiêu đề "Bé [Tên] chưa có ảnh đại diện" và nút "+ Thêm ảnh bé cưng" luôn nằm độc lập ở nửa trên, tuyệt đối không bị thẻ kính mờ `petScrollableFrostedCard` đè lên.
  - Khi hồ sơ bé còn thiếu các trường quan trọng (ảnh, ngày sinh, cân nặng), hiển thị thêm Banner nhắc nhở tinh tế: *"🐾 Hồ sơ bé [Tên] chưa hoàn tất · Chạm để cập nhật ảnh & thông số"* dẫn thẳng vào modal chỉnh sửa chi tiết.

### 2.22 Luồng Hoàn Thiện Hồ Sơ Thú Cưng Sau Đăng Ký (Post-Registration Pet Setup Wizard)
- **Luồng Onboarding 2 bước:**
  - **Bước 1 (Đăng ký cơ bản):** Họ tên, SĐT, Mật khẩu, Tên bé, Giống loài.
  - **Bước 2 (Hoàn tất hồ sơ Boss):** Hiển thị màn hình thiết lập nhanh ngay sau khi tạo tài khoản:
    1. **Tải ảnh đại diện:** Chụp ảnh trực tiếp từ Camera hoặc chọn từ Thư viện ảnh (upload lên Cloudinary).
    2. **Giới tính:** Bộ chọn 2 nút pill thân thiện `♂ Đực` / `♀ Cái` + Toggle `Đã triệt sản`.
    3. **Ngày sinh:** Bộ chọn ngày sinh trực quan (DD/MM/YYYY), tự động quy đổi ra `... tháng tuổi` hoặc `... tuổi`.
    4. **Cân nặng (kg):** Nhập cân nặng thực tế.
    5. **Xác nhận sổ tiêm Safe Pet:** Checkbox nhanh "Đã tiêm phòng dại & 7 bệnh đầy đủ" để kích hoạt huy hiệu an toàn dạo chung.
    6. **Hành động điều hướng:** Nút chính "Hoàn tất & Khám phá Pawty" (lưu vào PostgreSQL) và Nút phụ "Để sau" (cho phép bỏ qua nếu đang vội mà không làm crash/hỏng giao diện).

### 2.23 Đồng Bộ Phản Hồi Bài Viết Tuyệt Đối (Zero Drift Like & Comment Sync: Explore vs Profile)
- **Nguồn chân lý duy nhất (Single Source of Truth):**
  - Cả Bảng tin Khám phá (`MobileExploreScreen`) và Lưới Khoảnh khắc Cá nhân / Xem trang người khác (`MobileProfileScreen`) đều sử dụng chung một state `posts` liên kết PostgreSQL thời gian thực.
  - Loại bỏ hoàn toàn việc lưu object bài viết tĩnh `useState<MobilePost>(post)` trong `MobileProfileScreen`. Thay vào đó, lưu `selectedPreviewPostId: string | null` và `activePostDetailId: string | null` và derive trực tiếp từ mảng `posts` (`livePost = posts.find(p => p.id === activePostDetailId)`).
- **Thống nhất chỉ số và hành động Thả Paw / Like:**
  - Loại bỏ hoàn toàn giá trị fallback giả định (`|| 120`). Số lượt thích được tính chuẩn xác từ `totalLikes = (paws || 0) + (love || 0) + (wow || 0) + (helpful || 0)`.
  - Icon phản hồi: Đồng nhất biểu tượng Paw và Coral `#FF6F61` khi đã thích (`userReaction !== null`). Thao tác thả thích ở Explore, Preview modal hay Chi tiết bài viết đều gọi chung một hàm `toggleReaction` và hiển thị đồng bộ 100%.
- **Bình luận thời gian thực (Real-time Comments):**
  - Gửi bình luận hoặc trả lời bình luận trong Modal chi tiết lập tức cập nhật giao diện ngay lập tức mà không cần đóng/mở lại modal, đồng thời số lượng bình luận tại Bảng tin Khám phá cũng tăng lên tương ứng.

### 2.24 Chuẩn Hóa Theme Xem Bài Viết Cá Nhân & Phân Lập Tab "Được Lưu" (Profile Post UX & Saved Isolation)
- **Đồng Bộ Theme Sáng / Trắng Kem (Warm Cream & Clean Light Theme):**
  - Loại bỏ hoàn toàn giao diện màu đen tối (`#20242C`) của Popup xem nhanh bài viết (`postPreviewCard`) trên Trang cá nhân.
  - Chuyển sang theme sáng chuẩn Pawty: Nền trắng ngà (`#FFFFFF`), viền bo mềm mại (`#EFE8DE`), chữ tiêu đề màu cà phê đậm (`#2C2520`), văn bản mô tả sắc nét và dễ đọc.
  - Loại bỏ nút phụ "Đã thích / Thả Paw" bên dưới vì đã có dòng thống kê `{totalLikes} lượt thích · {totalComments} bình luận` phía trên; chỉ giữ nút chính nổi bật: **"Xem chi tiết & bình luận"** (`#FF6F61`).
- **Phân Lập Tuyệt Đối Tab "Được Lưu" (Saved Posts Privacy):**
  - Tab "Được lưu" là khu vực riêng tư 100% của chủ tài khoản, **tuyệt đối chỉ hiển thị khi xem trang cá nhân của chính mình (`!isViewingOther`)**. Khi xem trang cá nhân của người khác, tab này luôn bị ẩn và danh sách bài viết chỉ hiển thị bài của đối phương.
  - Khắc phục lỗi rò rỉ: Khi điều hướng giữa các trang cá nhân, `ownerMediaTab` luôn tự động đặt lại về `'moments'`.
  - **Phân định rõ ràng nút hành động:**
    - Khi xem bài trong mục **"Được lưu"** (hoặc bài viết của người khác): Nút hành động hiển thị **"Xóa khỏi mục đã lưu"** (`toggleBookmark`), gỡ bài khỏi danh sách lưu trữ của người dùng kèm thông báo toast trực quan.
    - Khi xem bài do chính mình đăng trong mục **"Khoảnh khắc"**: Nút hành động hiển thị **"Xóa bài viết"** (`deletePost`), có xác nhận và xóa khỏi cơ sở dữ liệu.
- **Header Bài Viết Tinh Gọn (Loại Bỏ Username `@handle`):**
  - Xóa bỏ việc hiển thị `@username` / `@handle` mang tính kỹ thuật ở cả Popup xem nhanh và Modal chi tiết bài viết.
  - Bổ sung các thông số tiêu chuẩn như một bài viết thông thường trên Khám phá:
    - Tên hiển thị đầy đủ của tác giả (`authorName`).
    - Thời gian đăng bài (`createdAt` hoặc `Vừa xong`).
    - Nhãn phân loại bài viết (`categoryLabel` hoặc `Khoảnh khắc`).
    - Thẻ thú cưng / Giống loài nếu có và biểu tượng phạm vi chia sẻ (Công khai).

### 2.25 Hệ Thống Bình Luận & Trả Lời Đa Tầng Chuẩn Facebook (Facebook-Style Nested Comment & Reply System)
- **Đồng Bộ Hai Chiều Tuyệt Đối (Khám Phá & Trang Cá Nhân):**
  - Mọi phản hồi (reply) cho một bình luận đều được lưu trữ bền vững vào bảng `comments` trong cơ sở dữ liệu PostgreSQL thông qua trường `parent_id` (`parentId`).
  - Cả giao diện Khám phá (`MobileExploreScreen`) và Modal chi tiết bài viết ở Trang cá nhân (`MobileProfileScreen`) đều sử dụng chung một chuẩn hiển thị `FacebookCommentSection` thống nhất, đồng bộ 100% thời gian thực.
  - Số lượng hiển thị trên huy hiệu icon bình luận phản ánh chính xác tổng số bình luận cha cộng toàn bộ câu trả lời con: `(comments + replies)`.
- **Trải Nghiệm Trả Lời Bình Luận Chuẩn Facebook (Facebook UX):**
  - **Bong bóng bình luận cha (Parent Comment Bubble):** Avatar tròn (36px), bong bóng xám nhạt (`#FAF7F2`), tên tác giả in đậm (click mở Profile), nội dung text, thời gian đăng, nút **Thích** (`Like` - đổi màu san hô khi đã thích, hiển thị số lượt thích) và nút **Trả lời** (`Reply`).
  - **Bong bóng câu trả lời con (Child Reply Bubble):** Lùi lề trái (`marginLeft: 38px`), avatar nhỏ hơn (28px), có đường kẻ chữ L mềm mại (`borderLeft` và `borderBottomLeftRadius`) nối từ dưới avatar của bình luận cha sang avatar câu trả lời con.
  - **Cơ chế Trả lời một câu trả lời (Reply to a Reply):**
    - Khi người dùng nhấn nút 'Trả lời' ở một câu trả lời con (ví dụ trả lời cho bạn B):
      - Gắn kết chặt chẽ vào cây bình luận cha gốc (Root Comment ID) để dữ liệu không bị phân mảnh hay thất lạc.
      - Tự động điền tiền tố `@B ` hoặc hiển thị banner chỉ báo: `Đang trả lời B` (kèm nút `[x]` Hủy).
      - Tự động kích hoạt bàn phím và focus trực tiếp vào ô nhập liệu (`inputRef.current?.focus()`).
      - Khi hiển thị, tiền tố `@Tên ` được tô màu nổi bật (`#FF6F61`, font weight 800) mô phỏng chính xác trải nghiệm Facebook.
  - **Hỗ trợ thu gọn / mở rộng phản hồi:** Hỗ trợ nút 'Xem thêm phản hồi' và 'Thu gọn phản hồi' khi một bình luận có nhiều câu trả lời, tránh chiếm dụng diện tích màn hình.
  - **Thuật toán Chuẩn hóa Bình luận Đa Thế Hệ (Multi-Generation Root Resolver):** Khi nạp dữ liệu từ PostgreSQL, hàm chuẩn hóa sẽ đệ quy truy ngược `parentId` về root parent comment ID, đảm bảo 100% mọi câu trả lời thế hệ F1, F2,... đều được gom đúng vào cây hội thoại tương ứng mà không bao giờ bị biến mất.


### 2.27. Cơ chế Đẩy View & Cuộn Thông Minh Khi Viết Bình Luận Khám Phá (Keyboard-Aware Comment Positioning)
- **Vấn đề cốt lõi:** Khi người dùng mở bàn phím để viết bình luận cho một bài viết trên Bảng tin Khám phá (`MobileExploreScreen`), bàn phím ảo chiếm từ 300px - 340px chiều cao màn hình. Nếu chỉ cuộn theo index hoặc không đo đạc layout thực tế, thanh nhập liệu (`TextInput`) và nút gửi sẽ bị che khuất bên dưới bàn phím.
- **Giải pháp chuẩn:**
  1. **Đo đạc vị trí thực tế (`onLayout` Tracker):** Mỗi thẻ bài viết ghi nhận tọa độ `y` và chiều cao `height`. Tọa độ đáy bài viết (vị trí đặt thanh nhập liệu) được xác định chính xác bằng công thức: `bottomOfPost = layout.y + layout.height`.
  2. **Tính toán `targetOffset` theo chiều cao bàn phím:** Khi bàn phím xuất hiện (`keyboardDidShow`) hoặc khi ô nhập liệu nhận tiêu điểm (`onFocusInput`), danh sách tự động cuộn đến:
     $$\text{targetOffset} = \max(0, \text{bottomOfPost} - \text{visibleViewportHeight} + 40)$$
     Trong đó $\text{visibleViewportHeight} = \text{windowHeight} - \text{keyboardHeight} - \text{statusBarHeight} - \text{headerHeight}$.
  3. **Ẩn thanh Bottom Bar khi bàn phím mở:** Khi bàn phím xuất hiện trên màn hình, thanh điều hướng đáy tự động ẩn đi để nhường toàn bộ diện tích cho nội dung bình luận và thanh nhập liệu.

### 2.28. Quy chuẩn Avatar Người Dùng & Chống Tràn Ảnh Ngẫu Nhiên (Zero Random Avatar Leakage)
- **Nguyên tắc tôn trọng danh tính:** Nếu tài khoản người dùng chưa tải lên ảnh đại diện (`avatarUrl === null` hoặc `''`), hệ thống **BẮT BUỘC** hiển thị khung đại diện trống kèm icon người dùng mặc định (`Feather name="user"`).
- **Tuyệt đối không gán ảnh người lạ:** Nghiêm cấm mọi logic fallback tự động gán đường dẫn ảnh Unsplash của người lạ vào tài khoản hoặc bình luận của người dùng.
- **Đồng bộ bình luận và tài khoản:** Khi gửi bình luận mới (`addComment` / `addCommentReply`), trường `authorAvatar` chỉ lấy từ `ownerAvatarUrl || ownerAvatar` của tài khoản hiện tại. Nếu chưa có ảnh, giá trị phải là chuỗi rỗng `''`.
