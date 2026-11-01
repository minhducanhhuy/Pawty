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
     - **Nhánh Khám phá:** Trái: Nút + (Đăng bài) · Giữa: 1 Logo Pawty động (PawtyAnimatedLogo size nhỏ) · Phải: Nút SOS (mở trang SOS toàn màn hình) + Nút Thông báo.
     - **Nhánh Kết nối (Tinder):** Header 1 hàng duy nhất: Trái: Tiêu đề Kết nối kèm nhãn mục đích đang lọc (Tất cả / Tìm bạn chơi / Hẹn hò / Giao lưu) · Phải: Nút Bộ lọc (Mục đích duyệt & Thanh trượt bán kính tìm kiếm 1-30km Miễn phí) + Nút Menu phụ (Hoàn tác quẹt VIP, Danh sách ai thích bạn VIP, Hồ sơ kết nối của tôi). Tách riêng bộ lọc đang xem khỏi mục đích công khai của người dùng.
     - **Nhánh Tin nhắn:** Trái: Tiêu đề Tin nhắn · Phải: Nút Kết nối + Nút SOS (tự động ẩn khi vào phòng chat chi tiết).
     - **Nhánh Tôi (Header Chuyển Đổi Profile Paging Tích Hợp):**
       - Bỏ nút + và chữ tên cố định.
       - Thay bằng dải chuyển đổi phân trang ngay trên Top Bar: **[Con sen] · [Lu] · [Miu] ... [+]**.
       - Phải: Nút Hamburger ☰ duy nhất mở toàn bộ Menu Cài đặt, Quyền riêng tư & Thiết lập kết nối. Khi xem hồ sơ người khác (isViewingOther): hiển thị nút ← Quay lại và các nút hành động (Theo dõi, Kết bạn, Nhắn tin).

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

### 2.2 Tab 2: Kết nối (`Tinder` — Tối Giản, Ảnh Lớn & Đa Mục Đích Chuẩn Pawty)
- **Cấu trúc màn hình tối giản & không cuộn (`No Outer ScrollView`):**
  - Bỏ hoàn toàn `ScrollView` bao ngoài màn hình quẹt. Thẻ co giãn thích ứng theo chiều cao còn lại (`flex: 1`) giữa header, hàng nút hành động và thanh điều hướng đáy, không gò ép `height: 520` cố định.
  - Phía dưới thẻ là thẻ kế tiếp hiển thị nền (`pointerEvents="none"`), tạo cảm giác trượt thẻ thực thụ như Tinder.
- **Thẻ quẹt ảnh lớn tập trung & Gradient tinh tế:**
  - Vùng ảnh lớn làm trọng tâm thị giác, không bị văn bản hoặc chip che lấp.
  - Thanh phân đoạn hiển thị số lượng ảnh ở đỉnh (`— — — —`). Phân biệt rõ cử chỉ chạm (tap trái/phải đổi ảnh) và kéo (drag quẹt trái/phải), ngăn chặn đổi ảnh ngoài ý muốn khi quẹt.
  - Chân thẻ dùng `expo-linear-gradient` chuyển tiếp mượt mà từ trong suốt sang đen mờ vừa đủ đọc chữ.
  - Bỏ 6 chip lifestyle và tiêu đề "Thông tin cơ bản & Phong cách sống" khỏi mặt thẻ.
  - **Tập trung tối đa vào Thú cưng:** Ảnh hiển thị trên thẻ và album vuốt ngang chỉ bao gồm ảnh của các bé thú cưng, tuyệt đối không đưa avatar to của chủ nhân lên làm ảnh chính. Trọng tâm thông tin là tên bé thú cưng (`Tên bé · Tuổi · Giống loài`), dòng phụ giới thiệu chủ nhân (`Đi cùng [Tên chủ] · cách [Khoảng cách] km`).
  - Nút mở hồ sơ tròn `↑` góc dưới phải có diện tích chạm tiêu chuẩn (tối thiểu 44×44).
- **Trình bày thông tin linh hoạt theo Mục đích (`Intent Layout`):**
  - **Playdate, Dating, Community:** Đều hiển thị ảnh thú cưng làm nhân vật chính trên thẻ. Chủ nuôi và khoảng cách được hiển thị ở dòng phụ tinh gọn. Lượt thích vẫn lưu theo hồ sơ chủ nuôi.
  - Chế độ *"Tất cả mục đích"*: Duyệt qua từng ứng viên và hiển thị thẻ chuẩn theo intent của ứng viên đó.
- **Thanh trượt điều chỉnh Bán kính tìm kiếm Chuẩn Tinder (Interactive Radius Slider 2km - 160km):**
  - **Dải khoảng cách chuẩn Tinder:** Kéo thả mượt mà từ **2 km đến 160 km** (tương đương chuẩn 100 miles của Tinder quốc tế, bao quát từ nội đô đến toàn vùng kinh tế trọng điểm).
  - **Cơ chế lưu tạm chống quá tải Backend (Draft State / Deferred Apply):** Khi người dùng kéo thanh trượt hoặc đổi mục đích, hệ thống chỉ cập nhật trạng thái tạm thời trong modal; **tuyệt đối không gửi request query backend hay re-render cọc thẻ trong khi đang kéo**. Chỉ khi bấm nút **[Áp dụng bộ lọc]**, filter mới được gửi đi và nạp lại ứng viên. Chạm ✕ hoặc bấm ra ngoài sẽ hủy bỏ thay đổi nháp.
  - **Triệt tiêu rung giật khi kéo (Smooth Dragging):** Thanh trượt tính toán theo tỷ lệ di chuyển ngón tay delta (`gestureState.dx`), khóa `pointerEvents="none"` cho các phần tử con bên trong để tránh sai lệch tọa độ tương đối, cập nhật 60 FPS không giật lag.
  - **Nút chọn nhanh (Quick Preset Chips):** `5 km`, `15 km`, `30 km`, `50 km`, `100 km`, `160 km`, và `Tất cả khoảng cách`.
- **Dữ liệu Khởi tạo Sạch cho Kiểm thử (Clean Test State):**
  - Toàn bộ hồ sơ ứng viên trong seed database được khởi tạo ở trạng thái chưa từng tương tác (`hasLikedMe: false`, `isMatched: false`), cho phép kiểm thử luồng quẹt thẻ và khớp nối Match chuẩn xác từ đầu.
- **Hàng hành động cố định (`Fixed Action Bar`) & Nút Hoàn tác Độc lập:**
  - Ba nút hành động: **[Hoàn tác ⟲]** (bên trái), **[Bỏ qua ✕]** (ở giữa), và **[Thích ❤️]** (bên phải).
  - **Trạng thái kích hoạt nút Hoàn tác:**
    - Khi người dùng ở hồ sơ đầu tiên (chưa từng quẹt ai, `swipedCandidateHistory.length === 0`): Nút Hoàn tác bị vô hiệu hóa (`disabled`), màu xám mờ (`#C5BDB3`, nền `#F3EFEA`), không thể bấm.
    - Khi người dùng đã quẹt ít nhất 1 hồ sơ (`swipedCandidateHistory.length > 0`): Nút Hoàn tác sáng lên nổi bật (chuẩn Tinder: icon vàng hổ phách `#E5A93C`, viền sáng `#F5DCA8`, nền trắng, đổ bóng elevation), cho phép bấm.
    - Khi bấm Hoàn tác: Hồ sơ vừa lướt qua ngay lập tức được phục hồi lại vị trí đầu tiên trên đỉnh deck (`tinderCandidates[0]`), đồng thời gửi request đồng bộ xóa bản ghi quẹt trong database (`POST /api/matches/rewind`). Nếu lịch sử quẹt trở về 0, nút lại tự động mờ đi.
  - Cơ chế đồng bộ cử chỉ: Bấm nút hoặc kéo tay dùng chung một luồng animation và chỉ commit 1 lần duy nhất; khóa tương tác khi đang chuyển cảnh để chống bấm nhanh sinh nhiều lượt quẹt/match.
- **Hồ sơ chi tiết phủ toàn màn hình (`Fullscreen Detail Sheet`) & Modal Tương Hợp:**
  - Mở dạng phủ màn hình khi bấm nút `↑` trên thẻ, không đẩy dồn bung nội dung thẻ.
  - Đóng chi tiết giữ nguyên ứng viên và ảnh đang xem; chặn tương tác quẹt ngầm khi đang mở hồ sơ.
  - **Modal chúc mừng kết nối (`matchedCandidateModal`):**
    - Áp dụng đệm đáy an toàn theo `insets.bottom` (`Math.max(insets.bottom, 28) + 16`), đảm bảo nút **[Nhắn tin làm quen ngay]** luôn hiển thị nổi hoàn toàn phía trên Android Navigation Bar (3 phím điều hướng hệ thống), không bị che đè.
    - Tự động liên kết `conversationId` thực tế từ cơ sở dữ liệu để khi bấm nhắn tin sẽ dẫn thẳng vào phòng chat chung giữa hai tài khoản.
  - **Ưu tiên thông tin thú cưng lên hàng đầu:**
    - Hero photo album chỉ hiển thị ảnh của các bé thú cưng.
    - Khối đầu tiên: Hồ sơ chi tiết từng bé thú cưng (Ảnh pet, Tên, Loài, Giống, Cân nặng, Sổ tiêm chủng & phòng dại, Thói quen).
    - Khối thứ hai: Mục đích kết nối & giới thiệu chung (`lookingFor`, `bio`, khoảng cách).
    - Khối dưới cùng: Thông tin chủ nuôi (Avatar nhỏ, Handle, Tuổi, Phong cách sống lifestyle chips, Nút xem trang cá nhân chủ nuôi).
  - **Tương thích toàn diện Android Insets (Tránh bị đè Status Bar & Nav Bar):**
    - Cụm Header trên (Nút ẩn `chevron-down`, tiêu đề, nút chia sẻ `share-2`) được áp dụng padding an toàn tính theo `StatusBar.currentHeight` và `insets.top`, triệt tiêu hoàn toàn lỗi bị icon Pin, Sóng, Wifi của Android chèn lên.
    - Cụm Floating Action Bar dưới đáy (Nút ✕ và ❤️) được áp dụng khoảng đệm an toàn theo `insets.bottom`, đảm bảo nằm nổi rõ ràng phía trên Navigation Bar (3 phím điều hướng hoặc thanh cử chỉ) của Android.
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
  - **Phân quyền nghiệp vụ trên thẻ SOS:** Chỉ chính người đăng bài (`sos.ownerHandle === ownerHandle`) mới thấy và bấm nút "Xác nhận đã đón về" (chiếm toàn chiều rộng thẻ). Người đăng KHÔNG được phép thấy hoặc bấm "Báo vừa nhìn thấy" trên tin của chính mình. Người dùng khác (hàng xóm, người qua đường) thấy cặp nút *"Báo vừa nhìn thấy"* và *"Liên hệ chủ nuôi"*.
- **Thao tác thoát Lightbox ảnh:** Cho phép chạm 1 lần vào ảnh/nền backdrop hoặc bấm nút mũi tên trái (Back) và nút [X] ở góc trên để đóng thoát Lightbox ngay lập tức trở về bảng tin.

### 2.4 Tab 3: Tin nhắn (`Chat`)
- Nhắn tin trực tiếp giữa người dùng với các bộ lọc tiện lợi: `Tất cả`, `Chưa đọc`, `Kết nối`.
- **Trải nghiệm phòng chat chi tiết & Chống bàn phím ảo che khuất (`Keyboard Avoiding Chat Room`):**
  - Khi mở một cuộc trò chuyện cụ thể (`activeChatId` khác null), tự động ẩn Header chung của ứng dụng và ẩn Thanh điều hướng đáy (`bottomBar`) để nhường toàn bộ không gian cho màn hình chat.
  - Xử lý bàn phím ảo Android chuẩn xác: Cấu hình `KeyboardAvoidingView` với `behavior="height"` trên Android kết hợp `keyboardVerticalOffset=(StatusBar.currentHeight || 28) + 14` để bù đắp phần chiều cao Status Bar của thiết bị, loại bỏ đệm đáy `bottom` của `SafeAreaView` gốc khi đang ở phòng chat; đảm bảo thanh soạn thảo `inputBar` được đẩy lên trọn vẹn 100% khít ngay trên mép bàn phím ảo, không bị che mất nửa thanh.
  - `ScrollView` danh sách tin nhắn tích hợp `ref` tự động cuộn xuống tin nhắn cuối cùng (`scrollToEnd`) khi mở màn hình, khi bàn phím ảo xuất hiện và khi gửi tin nhắn mới.
- **Đồng bộ Tin Nhắn 2 Chiều & Lưu Trữ PostgreSQL (`Real-time DB Message Sync`):**
  - Mọi tin nhắn gửi đi lập tức được lưu vào bảng `Message` trong PostgreSQL qua API `POST /api/chats/:id/messages` với cơ chế Optimistic UI (hiện tức thì trên máy người gửi).
  - Định kỳ đồng bộ hai chiều thời gian thực (Real-time polling 2.5s) khi người dùng đang ở tab Chat, tự động tải các tin nhắn mới từ đối phương mà không cần tải lại trang.
  - Đảm bảo tính nhất quán tuyệt đối giữa các tài khoản: Tin nhắn của `Mai Nguyễn` gửi cho `Hải Yến` sẽ được lưu vĩnh viễn trên server, khi đăng xuất và đổi sang tài khoản `Hải Yến` sẽ thấy đầy đủ cuộc trò chuyện.
- **Cơ chế Đã Đọc & Báo Nhận Đã Xem Chuẩn Messenger (`Read Receipts & Badge Clearing`):**
  - **Tự động xóa badge chưa đọc khi mở chat:** Ngay khi người dùng nhấp vào mở một cuộc trò chuyện (`setActiveChatId(room.id)`), client kích hoạt `markChatRead(chatId)`:
    - Optimistic: Lập tức reset `unreadCount = 0` trên phòng chat đó, trừ số lượng chưa đọc trên tab lọc `Chưa đọc` và trên icon tab bar `Tin nhắn` ở đáy màn hình.
    - Database sync: Gửi API `POST /api/chats/:id/read` lên server để cập nhật tất cả tin nhắn đối phương gửi thành `isRead = true` trong database PostgreSQL.
  - **Hiển thị trạng thái "Đã xem" (Seen) kiểu Facebook Messenger:**
    - Dưới tin nhắn cuối cùng do người gửi tạo (`isMe && isLastMessage`), nếu người nhận đã vào xem cuộc trò chuyện (`msg.isRead === true`), hệ thống hiển thị dòng chữ thanh thoát `Đã xem` kèm avatar thu nhỏ 14x14 của đối phương (hoặc icon tích xanh đã đọc).
    - Nếu người nhận chưa mở phòng chat (`isRead === false`), hiển thị trạng thái `Đã gửi` kèm icon tích kiểm tinh tế.
  - **Tự động đánh dấu đã đọc khi đang mở phòng chat:** Nếu người dùng đang ở trong màn hình chat chi tiết và đối phương gửi tin nhắn mới đến, tin nhắn vừa nhận sẽ tự động được đánh dấu đã đọc ngay lập tức, không để lại badge chưa đọc tồn đọng vô lý.
- **Trải nghiệm Thời gian Gửi Chuẩn Facebook Messenger (`Messenger Timestamp & Tap-to-Reveal`):**
  - **Khoảng cách tin nhắn cùng phiên siêu gọn:** Bỏ `gap: 10` của container, các tin nhắn liên tiếp do cùng một người gửi trong cùng một phiên chỉ cách nhau 2.5px, tạo cảm giác cụm bong bóng liền mạch như Messenger.
  - **Ẩn giờ gửi cố định trong từng bong bóng tin nhắn:** Toàn bộ bong bóng chat loại bỏ nhãn giờ gửi bên trong.
  - **Mốc thời gian đặt ở giữa theo phiên (`Centered Session Timestamps`):**
    - Ngưỡng phân tách phiên là 5 phút: Nếu hai tin nhắn cách nhau từ 5 phút trở lên (ví dụ: 5:02 và 5:12) hoặc sang ngày mới, hệ thống tự động chèn một mốc thời gian ở chính giữa (dạng `T.7 LÚC 21:16` hoặc `CN LÚC 05:12`).
    - Các tin nhắn liên tiếp gửi gần nhau (dưới 5 phút) sẽ gom chung một phiên mà không lặp lại mốc thời gian ở giữa.
  - **Chạm vào tin nhắn để hiện mốc giờ ở giữa và trạng thái ở dưới (`Tap to Reveal`):**
    - Khi người dùng chạm (tap) vào một tin nhắn cụ thể:
      - Tự động đẩy các tin nhắn phía trên lên để hiển thị mốc thời gian gửi của tin nhắn đó ở chính giữa màn hình.
      - Đồng thời hiển thị dòng trạng thái (`Đã gửi ✓` hoặc `Đã xem` kèm avatar) ngay dưới chân tin nhắn đó.
    - Chạm lại lần nữa để thu gọn trở lại trạng thái ban đầu.

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
    - **Ảnh nền Background / Bìa:** Nút "Đổi ảnh bìa" đặt tại góc trên bên phải (`top: 14, right: 14`, `zIndex: 99`, `elevation: 10`) tách biệt hoàn toàn khỏi avatar overlap, đảm bảo nhận chạm 100% mở modal chọn ảnh từ thiết bị hoặc ảnh mẫu phong cảnh. Vùng cover container có `zIndex: 1`.
    - **Avatar Chủ nuôi & Ghi chú (Note):** Avatar tròn lớn ở trung tâm thuộc khối `avatarSectionRow` (`zIndex: 30, elevation: 10`), nằm hoàn toàn trên lớp ảnh bìa, không bao giờ bị cắt mất góc trên.
    - **Dấu cộng ghi chú (+ Badge):** Đặt tại góc trên bên phải của vòng tròn avatar (`top: 2, right: 2`, `zIndex: 40`), chạm vào mở Popup ghi chú nhanh.
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
  - **Trang 1, 2, ...: Hồ sơ Từng Bé Thú Cưng (Fullscreen Photo & Scrollable Downward Card):**
    - Mỗi thú cưng là một trang dọc độc lập nằm trong khối paging ngang (`nestedScrollEnabled={true}`).
    - **Ảnh Bé Cưng Tràn Trọn Toàn Màn Hình (100% Fullscreen Photo):**
      - Ảnh bé cưng hiển thị tràn trọn vẹn 100% màn hình phía sau (`position: 'absolute', top: 0, left: 0, width: SCREEN_WIDTH, height: '100%'`).
      - Cơ chế album ảnh chuẩn xác (`cleanGallery`), 2 nút `<` và `>` hai bên hông chuyển đổi mượt mà qua các bức ảnh mẫu sắc nét của bé.
      - Chạm đúp (Double-tap) vào ảnh để thả tim kèm hoạt cảnh nổ tim hồng lộng lẫy.
    - **Thẻ Kính Mờ Nằm Nửa Dưới & Cuộn Xuống (Scroll Downward):**
      - Thẻ kính mờ (`rgba(22, 18, 16, 0.48)`) nằm ở nửa dưới, cho phép nhìn thấu cơ thể bé cưng xuyên qua lớp kính mờ.
      - Khi người dùng cuộn xuống dưới (Scroll Down), thẻ lướt xuôi xuống theo chiều đọc tự nhiên của người dùng, không bao giờ bị đẩy ngược lên che mặt bé.
      - Khi nhấn **`[ Hiện thêm chi tiết sức khỏe & sổ tiêm ⌄ ]`**, người dùng cuộn xuống để đọc:
        1. Tính cách & Giới thiệu chi tiết.
        2. Thói quen tốt & Lưu ý an toàn khi đi dạo chung (tránh xung đột).
        3. Sở thích ăn uống (thức ăn yêu thích, pate, bánh thưởng).
        4. Lịch sử tẩy giun định kỳ.
        5. Tiền sử bệnh lý / thể trạng.
        6. **Biểu đồ Cân nặng theo tháng:** Cột thanh bar rõ ràng, chữ và số cân cách biệt, không đè chữ.
        7. **Sổ Tiêm Chủng Điện Tử:** Thẻ chứng nhận mũi tiêm có icon khiên bảo vệ.
      - Nút CTA lớn **`[ Hẹn dạo cùng bé ]`** nằm ở chân thẻ.
