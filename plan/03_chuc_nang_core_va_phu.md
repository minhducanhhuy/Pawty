# 03. DANH SÁCH CHỨC NĂNG HỆ THỐNG: KẾT NỐI NGƯỜI NUÔI THÚ CƯNG

Ký hiệu: **P0** = Bắt buộc MVP · **P1** = Mở rộng Pilot · **P2** = Nâng cao.

---

## A. CHỨC NĂNG CORE (KẾT NỐI NGƯỜI DÙNG & BOSS)

### A1. Xác thực & Hồ Sơ Kép (User Profile + Pet Profile)
| ID | Chức năng | Chi tiết | Ưu tiên |
|---|---|---|---|
| **A1.1** | Đăng nhập Google & Tài khoản Username/Password | 2 phương thức tiện lợi, không bắt buộc OTP giả lập | P0 |
| **A1.2** | **Nút Quay lại (Back Button) đa bước** | Cho phép quay lại bước trước trong quá trình tạo tài khoản & thiết lập hồ sơ | P0 |
| **A1.3** | **Phân loại Mục đích kết nối (Intent Tags)** | Lựa chọn ngay khi vào: ❤️ *Hẹn hò* · 🚶 *Đi dạo đôi* · 🐾 *Tìm bạn cho cún* · 💬 *Giao lưu* | P0 |
| **A1.4** | **Hồ sơ Người dùng (Chủ nuôi / Sen)** | Ảnh đại diện chủ, Tuổi, Nghề nghiệp, Bio giới thiệu bản thân, Cụm chung cư sinh sống | P0 |
| **A1.5** | **Hồ sơ Thú cưng đi cùng (Boss Profile)** | Tên Boss, Loài (Chó/Mèo), Giống loài, Cân nặng, Ảnh Boss, Sổ tiêm vắc-xin | P0 |
| **A1.6** | Xác minh Sổ tiêm Safe Pet | Huy hiệu bảo chứng an toàn tiêm phòng 7 bệnh & dại | P0 |
| **A1.7** | Xin quyền vị trí thực tế thiết bị | Tích hợp `expo-location` lấy toạ độ GPS chính xác quanh khu vực chung cư | P0 |

### A2. Radar Quẹt Thẻ Người Nuôi Thú Cưng
| ID | Chức năng | Chi tiết | Ưu tiên |
|---|---|---|---|
| **A2.1** | **Thẻ Radar Kép (User + Pet)** | Hiển thị ảnh chủ nuôi + avatar Boss đi cùng + Huy hiệu Mục đích kết nối (Dating/Walk Buddy/Playdate) | P0 |
| **A2.2** | **Hiệu ứng Kéo thả Tinder Thật** | Cử chỉ vuốt ngón tay PanResponder, góc xoay nghiêng mượt, tem stamp THÍCH / BỎ QUA | P0 |
| **A2.3** | **Bộ lọc Mục đích kết nối** | Lọc theo: Chỉ người tìm hẹn hò, Chỉ người tìm bạn dắt dạo, Bán kính (500m - 3km) | P0 |
| **A2.4** | Khớp lệnh Match 2 chiều | Khi cả 2 người nuôi thú cưng cùng thích nhau → Kích hoạt pháo hoa Confetti và mở phòng chat | P0 |
| **A2.5** | Trạng thái Dữ liệu thật (Zero Mock Data) | Không hiển thị user ảo hay pet giả; hiển thị Empty State mời bạn bè khi khu vực mới chưa có người quẹt | P0 |

### A3. Chat Thời Gian Thực & Hẹn Dạo Gặp Mặt (Socket.io Real-time)
| ID | Chức năng | Chi tiết | Ưu tiên |
|---|---|---|---|
| **A3.1** | **Socket.io Duplex Chat Thật** | Nhắn tin 2 chiều tức thì giữa 2 tài khoản thật khi đã Match; không dùng bot giả lập | P0 |
| **A3.2** | **Hẹn Dạo Trung Điểm** | Tự tính trung điểm giữa 2 toà nhà và đề xuất 3 quán cafe / công viên thân thiện thú cưng | P0 |
| **A3.3** | Bong bóng Lịch hẹn tương tác | Đồng ý / Đổi giờ / Huỷ lịch hẹn dạo | P0 |
| **A3.4** | Check-in GPS điểm hẹn | Xác thực cả 2 bên đã đến điểm hẹn (bán kính 150m) | P1 |
| **A3.5** | Chế độ an toàn chống bùng kèo | Khóa tài khoản quẹt thẻ nếu bị báo cáo bùng hẹn 2 lần/tuần | P0 |

### A4. Trang Cá Nhân & Feed Cộng Đồng
| ID | Chức năng | Chi tiết | Ưu tiên |
|---|---|---|---|
| **A4.1** | Trang cá nhân 2 Tab | Tab 1: Khoảnh khắc chủ & Boss đăng tải · Tab 2: Tiểu sử chi tiết + Sổ tiêm Safe Pet | P0 |
| **A4.2** | Feed cộng đồng khu vực | Lướt xem hình ảnh, video hoạt động của cộng đồng nuôi thú cưng nội khu | P1 |
| **A4.3** | Huy hiệu & Thành tích dắt dạo | Đếm streak dắt dạo mỗi ngày | P1 |

### A5. Kích Hoạt Doanh Thu
| ID | Chức năng | Chi tiết | Ưu tiên |
|---|---|---|---|
| **A5.1** | SOS Tìm Boss lạc khẩn cấp | 39k qua VietQR động, bắn thông báo push 3km | P0 |
| **A5.2** | Gói Sen VIP | 49k/tháng: quẹt vô hạn, lọc mục đích dating/playdate, xem ai thích tôi | P0 |
| **A5.3** | Ví Voucher Đối tác | Lưu và sử dụng voucher -35% tại các pet cafe/spa đối tác | P1 |
