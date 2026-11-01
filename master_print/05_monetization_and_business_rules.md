# MASTER PRINT — TẦNG 5: COMMUNITY ACCESS POLICY & SOS PRIORITY RULES

> **Single Source of Truth (SSOT)** — Đồng bộ theo định hướng chiến lược mới nhất của CTO: **Nền tảng Cộng đồng Thú cưng Miễn phí 100%**.

---

## 1. Chính Sách Bình Đẳng Thành Viên (100% Free — Không Gói Thành Viên VIP)

- **Xóa bỏ hoàn toàn cơ chế Gói Thành Viên / Thu phí Premium:**
  - Hệ thống không phân chia tài khoản Thường hay VIP (`Pawty Plus`, `Pawty Gold`, `Sen VIP` đã được gỡ bỏ toàn bộ khỏi giao diện, logic và API).
  - Mọi thành viên tham gia Pawty đều bình đẳng và được mở khóa miễn phí 100% toàn bộ tính năng:
    1. **Hồ sơ Thú cưng không giới hạn:** Tự do tạo và quản lý nhiều bé thú cưng trong gia đình.
    2. **Xem ai đã thích bạn (`Likes You`):** Mở khóa hoàn toàn danh sách những người đã thả tim hồ sơ của bạn trên phân hệ Kết nối để phản hồi Match ngay lập tức.
    3. **Quẹt thẻ & Hoàn tác (`Rewind`) miễn phí:** Không giới hạn lượt kéo mỗi ngày, hoàn tác lượt quẹt nhầm tự do.
    4. **Tìm kiếm Không giới hạn khoảng cách:** Tự do điều chỉnh bán kính tìm kiếm hoặc mở rộng toàn quốc (bỏ giới hạn 160km).
    5. **Đăng tin SOS Tìm Thú Lạc miễn phí 100%:** Không thu bất kỳ khoản phí đăng bài hay mã QR thanh toán nào.

---

## 2. Quy Trình Cổng SOS Tìm Thú Lạc & Giới Hạn AI

### 2.1 Hoàn Toàn Miễn Phí & Tách Riêng Trực Quan
- Cổng SOS được mở qua nút `SOS` trên thanh Header, cho phép bất kỳ chủ nuôi nào không may lạc mất thú cưng đều có thể phát tín hiệu cầu cứu cộng đồng ngay lập tức mà không gặp rào cản thanh toán.

### 2.2 Quy Tắc Sử Dụng AI Duy Nhất Trong SOS
- **Chức năng AI duy nhất được phép hoạt động:** Khi chủ nuôi chọn ảnh thú cưng từ máy/camera để đăng bài SOS, chủ nuôi có thể nhấn nút **"AI Đọc Ảnh Tạo Mô Tả"** (`GeminiVisionService.generateSosPetDescription`) để AI đọc bức ảnh đó và sinh ra đoạn văn mô tả ngoại hình chi tiết.
- **Không sử dụng các luồng AI tự động khác:** Đã loại bỏ hoàn toàn AI tự động quét bảng tin Khám phá đối chiếu ảnh (`aiSosMatch`) và AI dự đoán quỹ đạo di chuyển (`SightingTrajectory`). Mọi manh mối nhìn thấy đều do cộng đồng người thật trực tiếp bấm **"Báo vừa nhìn thấy"** gửi về cho chủ nuôi.

### 2.3 Quy Trình Phản Hồi Manh Mối & Đón Bé Về Nhà
1. **Cộng đồng gửi manh mối (`Báo vừa nhìn thấy`):** Cư dân bấm báo cáo vị trí nhìn thấy + SĐT liên hệ + ghi chú -> Hệ thống lưu vào DB và gửi thông báo `sos_sighting` ngay cho chủ nuôi.
2. **Chủ nuôi xác nhận đón về (`Xác nhận đã đón về`):** Chỉ chủ tin SOS mới có quyền bấm xác nhận khi đã tìm thấy bé -> Trạng thái tin chuyển sang `resolved` (*"Đã về nhà an toàn"*).
