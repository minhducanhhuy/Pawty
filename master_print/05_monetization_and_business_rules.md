# MASTER PRINT — TẦNG 5: MONETIZATION, TINDER PREMIUM & SOS ANTI-SPAM ALGORITHM

> **Single Source of Truth (SSOT)** — Đồng bộ với `.agents/rules/01_product_concept_and_design.md` và `plan/03_user_flows_and_screens.md`.

---

## 1. Hệ Thống Gói Premium (`Pawty Plus / VIP`) — Tối Ưu Cho Tinder & Luôn Hiển Thị Đầy Đủ Danh Sách Gói

- **Quy tắc hiển thị Quản lý VIP:** Dù người dùng **đang là thành viên VIP rồi** thì khi mở mục Quản lý Gói VIP **vẫn luôn hiển thị đầy đủ danh sách thông tin tất cả các gói**, quyền lợi chi tiết từng gói, trạng thái gói hiện tại (`Đang sử dụng`), và cho phép chuyển đổi gói.
- **Phân tích khóa tính năng Premium riêng cho phân hệ Hẹn hò (Tinder) mà không ảnh hưởng tính năng mạng xã hội cơ bản:**
  - Mạng xã hội (`Khám phá`, `Hồ sơ`, `Tin nhắn`, `Đặt dịch vụ`) hoàn toàn mở tự do, không gắn nhãn VIP gây phân biệt trên bài đăng.
  - **Các quyền lợi khóa riêng cho Gói Hẹn Hò Premium (`Pawty Plus` — 49.000đ/tháng):**
    1. **Xem ai đã thích bạn (`Likes You`):** Xem danh sách những người đã quẹt phải hồ sơ của bạn để Match ngay lập tức.
    2. **Hoàn tác lượt quẹt (`Rewind`):** Quay lại thẻ vừa vô tình kéo lướt qua.
    3. **Hộ chiếu vị trí (`Passport`):** Đổi khu vực tìm kiếm sang bất kỳ quận/thành phố nào.
    4. **Quẹt không giới hạn (`Unlimited Swipes`):** Không bị giới hạn 10 lượt kéo mỗi ngày.
    5. **Lời chào nổi bật (`Priority Intro`):** Đính kèm lời nhắn làm quen ngay khi kéo phải.

---

## 2. Giải Pháp Toàn Diện Cho Cổng SOS Tìm Thú Lạc (Tách Riêng, Chống Spam, Chống Trôi Bài & Quy Trình Tìm Thấy)

### 2.1 Tách Riêng Khỏi Trải Nghiệm Chính (Zero Intrusion)

- Không chèn banner báo động đỏ làm vướng màn hình chính của những người dùng đang lướt mạng xã hội.
- Toàn bộ chức năng SOS được gom vào **Cổng SOS Thú Lạc** riêng biệt (mở qua nút `SOS` trên Header). Khi bấm vào sẽ hiển thị **Bảng tin Thú Lạc** và nút **Đăng tin tìm thú lạc**.

### 2.2 Cơ Chế Phí Cam Kết Nhỏ Ban Đầu (Anti-Spam Gate)

- Để đăng tin lên Bảng tin SOS, người đăng cần thanh toán một khoản phí cam kết nhỏ (**19.000đ** qua VietQR).
- **Mục đích:** Ngăn chặn hoàn toàn việc đăng tin rác, tin giả trêu đùa hoặc lạm dụng thông báo cộng đồng, đồng thời tạo quỹ huy hiệu/thưởng uy tín cho người hỗ trợ.

### 2.3 Thuật Toán Chống Trôi Bài & Tiếp Cận Đúng Người (`Geo-Sighting Priority Score`)

Thay vì sắp xếp theo thời gian đăng thông thường (dẫn tới bài mới đè bài cũ làm trôi bài), Bảng tin SOS sử dụng công thức điểm ưu tiên động:
$$\text{PriorityScore} = (100 - \text{DistanceKm} \times 15) + \text{RecentSightingBoost} + \text{UrgencyWindowBoost}$$

- **Ưu tiên theo bán kính gần nhất (`DistanceKm`):** Người dùng ở khu vực nào sẽ luôn thấy các ca thất lạc trong bán kính **0.5km – 3km** quanh họ nằm ở đầu bảng.
- **Tự động cập nhật tâm tìm kiếm khi có người nhìn thấy (`RecentSightingBoost = +50 điểm`):** Mỗi khi có một thành viên bấm **"Báo vừa nhìn thấy"**, bài đăng tự động được làm mới thời gian, dịch chuyển tọa độ tâm sang vị trí vừa nhìn thấy mới nhất và đẩy lên đầu bảng tin của cư dân quanh vị trí mới đó.
- **Không làm phiền người dùng:** Không gửi thông báo đẩy tràn lan toàn thành phố; chỉ hiển thị chấm báo nhỏ trên nút `SOS` cho người dùng nằm trong bán kính 3km quanh vị trí thất lạc.

### 2.4 Quy Trình Khi Tìm Thấy & Thông Báo Phản Hồi Khép Kín (3 Bước)

1. **Bước 1 — Cộng đồng gửi manh mối (`Báo vừa nhìn thấy`):**
   - Người dùng nhìn thấy thú lạc bấm nút **"Báo vừa nhìn thấy"** trên thẻ SOS -> Nhập vị trí hiện tại + Số điện thoại liên hệ + Ghi chú tình trạng (hoặc ảnh chụp).
   - Hệ thống gửi thông báo tức thì vào mục **Thông báo** và **Tin nhắn** của chủ nuôi.
2. **Bước 2 — Chủ nuôi xác nhận đón thú cưng (`Xác nhận đã tìm thấy`):**
   - Sau khi liên hệ và đón được thú cưng về nhà, chủ nuôi bấm nút **"Xác nhận đã tìm thấy & Đón về"**.
3. **Bước 3 — Tự động đóng tin & Gửi thông báo cảm ơn:**
   - Bài đăng chuyển sang trạng thái **"Đã về nhà an toàn"** (ngừng hiển thị khẩn cấp để cộng đồng không mất công tìm kiếm thêm).
   - Hệ thống tự động gửi **Thông báo cảm ơn** tới tất cả những người đã gửi báo cáo vị trí hỗ trợ ca SOS đó.
