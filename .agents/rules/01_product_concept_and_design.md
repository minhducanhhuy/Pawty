# PRODUCT CONCEPT & UX/UI DESIGN (Pawty — Những bàn chân nhỏ đang tới)

Dự án **Pawty** (Khẩu hiệu hệ sinh thái: **"Những bàn chân nhỏ đang tới"**) là mạng xã hội kiểu Instagram kết hợp nền tảng ghép đôi hẹn hò/kết bạn kiểu Tinder, đặt lịch dịch vụ và bảng tin SOS thú lạc dành cho cộng đồng yêu thú cưng tại Việt Nam.

## 1. NGUYÊN TẮC THIẾT KẾ TỐI GIẢN ẤM ÁP & PHONG CÁCH INSTAGRAM
- **Khẩu hiệu mở đầu:** Màn hình Load / Mở đầu bắt buộc hiển thị Logo chính thức (`/assets/pawty-logo-full.png`) cùng dòng chữ **"Những bàn chân nhỏ đang tới"**.
- **Header chuẩn Instagram (1 Logo duy nhất):**
  - Tuyệt đối không đặt cả 2 logo thu gọn và logo chữ cùng lúc trên Header. Chỉ sử dụng **1 logo duy nhất** (`pawty-logo-full.png`) ở trung tâm hoặc góc chuẩn.
  - Bố cục Header kiểu Instagram: Bên trái là nút `+` (Đăng bài mới), ở giữa là Logo `Pawty`, bên phải là nút `SOS` (Bảng tin Thú lạc riêng biệt) và `Thông báo` (Trái tim/Chuông).
- **Xóa bỏ hoàn toàn tính năng Chăm chung (Circle), Todo (Việc hôm nay) và Theo dõi sức khỏe rườm rà:**
  - Bỏ tab `Hôm nay` cũ. Khi người dùng mở ứng dụng, **trang chính mặc định là `Khám phá` (Bảng tin Mạng xã hội)**.
- **Hệ thống Điều hướng Dưới Đáy (Bottom Tab Bar — Không có nút dấu `+` nổi ở giữa):**
  1. **`Khám phá`** (Trang chính mặc định — Bảng tin MXH kiểu Instagram).
  2. **`Hẹn hò`** (Chức năng Tinder quẹt thẻ kéo thả trực tiếp — Chọn rõ nhu cầu: Hẹn hò, Tìm bạn chơi chung, hoặc Giao lưu).
  3. **`Dịch vụ`** (Tab chính riêng biệt để tìm và đặt lịch Spa, Thú y, Khách sạn thú cưng).
  4. **`Lịch hẹn`** (Tab chính riêng biệt để quản lý các lịch hẹn Spa, Thú y đã đặt).
  5. **`Tin nhắn`** (Nhắn tin giao lưu bạn bè, người đã Match từ Tinder, cơ sở dịch vụ — xóa bỏ các nút hẹn đi dạo/bàn giao cũ).
  6. **`Tôi`** (Trang cá nhân kiểu Instagram, quản lý hồ sơ thú cưng chi tiết, cài đặt quyền riêng tư chỉ cho Bạn bè hoặc người đã Match Tinder xem).
- **Xử lý Cử chỉ Back & Nút Back Phần cứng (`BackHandler`):**
  - Vuốt cạnh màn hình (Gesture Back) hoặc bấm nút Back trên điện thoại sẽ điều hướng lùi từng bước tương ứng với nút Back trong ứng dụng (đóng trình xem ảnh phóng to -> đóng Modal -> đóng hồ sơ người khác -> thoát phòng chat -> quay về tab `Khám phá`), không bị văng thoát ngang khỏi ứng dụng.

## 2. CHI TIẾT CÁC PHÂN HỆ CORE
1. **Khám phá (Bảng tin Mạng Xã Hội kiểu Instagram):**
   - Chốt **Khám phá = Bảng tin** (bỏ thanh tab phụ Bảng tin / Cộng đồng / Dịch vụ / Quanh đây).
   - **Thanh tìm kiếm thông minh:** Khi bấm vào sẽ hiển thị **Lịch sử tìm kiếm** (có thể xóa) và **Đề xuất / Thịnh hành hiện tại** trên ứng dụng.
   - **Header bài viết tối giản & thân thiện:**
     - Bấm vào Avatar hoặc Tên người đăng sẽ mở **Trang cá nhân (Public Profile)** của họ để xem ảnh, kết bạn, nhắn tin.
     - Bỏ huy hiệu `Thành viên VIP` gây phân biệt; thay bằng **Biệt danh thân thiện** (VD: *Bạn thân của cún*, *Mê mèo Anh*, *Bác sĩ thú y*).
     - Dòng thông tin phụ (small title) dưới tên chỉ hiển thị **Loại bài viết · Thời gian đăng** (bỏ tên chó và vị trí ở dòng phụ này).
   - **Đa phương tiện & Phóng to:** Hỗ trợ đăng **nhiều ảnh cùng lúc** và **đăng video** trong 1 bài viết. Bấm vào ảnh/video sẽ **phóng to toàn màn hình (Lightbox)** để xem rõ.
   - **Thanh tương tác gộp gọn kiểu Instagram:** Gộp cảm xúc thành 1 cụm gọn bên trái kèm số lượng, nút Bình luận, **nút Chia sẻ (Share)**, và bên phải là nút Lưu bài.
2. **Hẹn hò & Kết bạn (Tinder Kéo Thả & Gói Premium Riêng):**
   - Khi vào phải chọn rõ **Mong muốn kết nối**: `Hẹn hò`, `Tìm bạn chơi chung`, hoặc `Giao lưu kinh nghiệm`.
   - **Thẻ quẹt có hiệu ứng kéo thả (Drag/Swipe Gesture)** trực tiếp sang trái/phải, không dùng nút bấm dưới thẻ.
   - Khi **Match (Tương hợp)** sẽ chuyển thẳng sang nhắn tin tại tab **Tin nhắn**.
   - **Gói Premium (Pawty Plus) thiết kế riêng cho tính năng Tinder:** Mở khóa *Xem ai đã thích bạn*, *Hoàn tác lượt quẹt*, *Đổi vị trí tìm kiếm (Passport)*, *Lượt quẹt không giới hạn* và *Gửi lời chào ưu tiên*. Dù đang là VIP vẫn luôn xem được đầy đủ danh sách thông tin các gói.
3. **Cổng SOS Tìm Thú Lạc Chuyên Biệt (Tách riêng, Không Làm Phiền, Chống Trôi Bài):**
   - Tách riêng hoàn toàn khỏi màn hình chính để không làm vướng người dùng. Khi bấm vào nút `SOS` trên Header sẽ mở **Bảng tin Thú Lạc** kèm nút **Đăng tin tìm thú lạc**.
   - **Giải pháp chống spam & chống trôi bài:**
     - Thu phí nhỏ ban đầu (19.000đ qua VietQR) để chống spam tin giả.
     - Thuật toán **Ưu tiên Bán kính Động (`Geo-Sighting Boost`)**: Sắp xếp theo khoảng cách gần nhất + tự động đẩy bài lên đầu và cập nhật tâm bán kính mới mỗi khi có người bấm *"Báo vừa nhìn thấy"*.
     - **Quy trình tìm thấy khép kín:** Người nhìn thấy gửi vị trí & SĐT -> Chủ nuôi nhận thông báo tức thì -> Khi đón được thú cưng, chủ nuôi bấm *"Xác nhận đã tìm thấy"* -> Hệ thống đóng tin khẩn cấp và tự động gửi thông báo cảm ơn tới tất cả những người đã hỗ trợ.
4. **Hồ sơ Cá nhân & Hồ sơ Thú cưng (`Tôi`):**
   - Cho phép chỉnh sửa đầy đủ thông tin thú cưng (Tên, Loài Chó/Mèo, Giống, Giới tính, Ngày sinh/Tuổi, Cân nặng, Màu lông, Đặc điểm nhận dạng, Món yêu thích, Dị ứng).
   - **Hồ sơ tiêm chủng tối giản:** Gộp chung thành 1 trạng thái duy nhất có **Dấu Tick xác nhận** (`Đã tiêm chủng & Phòng dại đầy đủ`).
   - **Chế độ Riêng tư (Private Profile):** Bật/tắt chế độ chỉ cho phép **Bạn bè** hoặc **Người đã Match qua Tinder** xem chi tiết hồ sơ và bài viết.
