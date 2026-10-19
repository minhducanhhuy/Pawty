# TẦNG 5: HỆ THỐNG KÍCH HOẠT KINH TẾ & QUY TẮC NGHIỆP VỤ (MONETIZATION & RULES)

> **Mã định danh:** `PAWTY-MP-TIER-5`  
> **Phiên bản:** `1.0.0 (Master Blueprint)`  
> **Trạng thái:** `Đã phê duyệt (SSOT)`

---

## 1. MÔ HÌNH DOANH THU & 3 NGUỒN TIỀN CHÍNH (REVENUE STREAMS)

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              HỆ THỐNG KINH TẾ PAWTY                                    │
├──────────────────────────┬─────────────────────────────┬───────────────────────────────┤
│    1. SOS TÌM BOSS LẠC   │       2. GÓI SEN VIP        │        3. NATIVE ADS          │
│   • Phí: 39.000 VNĐ      │  • Phí: 49k/tháng, 399k/năm │  • Phí quảng cáo theo lượt xem│
│   • Biên LN: ~90%        │  • Biên LN: ~85%            │  • Biên LN: ~70%              │
│   • Bắn Push 3km khẩn cấp│  • Quẹt vô hạn, Kho ảnh VIP │  • Voucher -35% tiệm Pet nội  │
└──────────────────────────┴─────────────────────────────┴───────────────────────────────┘
```

---

## 2. CHI TIẾT CÁC NGUỒN THU & NGHIỆP VỤ

### 2.1. Nguồn 1: Thu phí Dịch Vụ SOS Tìm Boss Lạc Khẩn Cấp (Biên LN ~90%)
- **Bối cảnh kích hoạt:** Boss bị tuột dây dắt, chạy lạc trong khuôn viên chung cư, hầm gửi xe B1/B2 hoặc sảnh đón xe.
- **Giá dịch vụ:** **39.000 VNĐ / lần phát tin**.
- **Cơ chế hoạt động:**
  1. Người dùng mở Widget SOS trên màn hình chính hoặc Header.
  2. Điền thông tin Boss (Tên, Ảnh, Vị trí rơi dây dắt, Tiền hậu tạ, SĐT khẩn cấp).
  3. Màn hình tạo mã **VietQR động** (MBBank, Số tiền 39.000đ, Nội dung: `PAWTY SOS 39K`).
  4. Sau khi người dùng chuyển khoản (hoặc webhook ngân hàng xác nhận thành công):
     - Hệ thống Backend NestJS chạy câu lệnh PostGIS truy vấn tất cả tài khoản trong bán kính 3km:
       ```sql
       SELECT fcm_token FROM users WHERE ST_DWithin(location, ST_MakePoint(:lng, :lat)::geography, 3000);
       ```
     - Kích hoạt gửi thông báo đẩy khẩn cấp kèm rung chuông tới toàn bộ thiết bị lân cận: *"🚨 BÁO ĐỘNG SOS: Tìm Miu Miu lạc tại Sảnh Landmark 2! Hậu tạ 5.000.000đ. Nhấn để xem ảnh nhận diện"*.

---

### 2.2. Nguồn 2: Gói Đăng Ký Hội Viên Sen VIP (Biên LN ~85%)
- **Điều kiện kích hoạt:**
  - Người dùng dùng hết 20 lượt quẹt thẻ miễn phí trong ngày.
  - Người dùng đăng tải quá 5 ảnh khoảnh khắc bựa (chi phí lưu trữ cloud dung lượng cao).
  - Hoặc chủ động bấm vào huy hiệu VIP trên trang cá nhân / thanh thông báo.
- **Bảng giá:**
  - **Gói Tháng:** **49.000 VNĐ / tháng** (~$1.99).
  - **Gói Năm:** **399.000 VNĐ / năm** (~$15.99 - Tiết kiệm 32%).
- **Đặc quyền VIP (Value Propositions):**
  1. **Quẹt không giới hạn:** Xóa bỏ giới hạn 20 lượt/ngày.
  2. **Kho ảnh bựa không giới hạn:** Lưu trữ toàn bộ ảnh/video chất lượng cao lên Cloudinary CDN không giới hạn số lượng.
  3. **Huy hiệu Vương Miện Vàng 👑:** Gắn vĩnh viễn trên avatar Boss tại Radar và phòng Chat để khẳng định vị thế.
  4. **Tăng 300% tỷ lệ hiển thị Radar:** Thuật toán PostGIS ưu tiên đẩy thẻ Boss VIP lên đầu danh sách quẹt của các Sen xung quanh.
  5. **Tua lại thẻ vô hạn (Rewind):** Không lo quẹt nhầm thẻ.

---

### 2.3. Nguồn 3: Thẻ Quảng Cáo Bản Địa - Native Ads (Biên LN ~70%)
- **Cơ chế phân phối:** Cứ sau mỗi 5 - 7 thẻ Boss tự nhiên trên màn hình Radar, hệ thống NestJS sẽ trả về 1 bản ghi cấu hình quảng cáo có UI giống hệt thẻ thú cưng.
- **Nội dung:** Voucher giảm giá 30% - 35% của các tiệm Spa, Khách sạn thú cưng, Pet Cafe, Tiệm thức ăn tươi nằm trong bán kính 1km xung quanh chung cư của người dùng đó.
- **Phương thức thu tiền:** Thu tiền từ các chủ tiệm địa phương theo mô hình CPC (Cost per Click / Lưu Voucher) hoặc gói hiển thị tháng (vd: 1.500.000đ/tháng/cửa hàng).

---

## 3. CƠ CHẾ BẢO VỆ VĂN MINH CỘNG ĐỒNG: CHẾ TÀI BÙNG HẸN (ANTI-FLAKE)

Để bảo đảm trải nghiệm cho các chủ nuôi khi đã set kèo dắt Boss đi dạo:
1. **Báo cáo bùng kèo:** Sau khi cuộc hẹn chuyển sang trạng thái *"Đã chốt kèo!"*, nếu đến giờ hẹn mà đối phương không có mặt mà không thông báo trước, bên bị bùng hẹn có quyền bấm nút **"Báo cáo bùng kèo"**.
2. **Hệ thống cảnh báo:**
   - **Lần 1 trong tuần:** Ghi nhận log cảnh báo, gửi thông báo nhắc nhở tuân thủ văn minh cộng đồng.
   - **Lần 2 trong tuần:** Hệ thống tự động kích hoạt chế tài: **Khóa quyền quẹt thẻ Radar của tài khoản đó trong vòng 3 ngày (`is_banned_swiping = true`)**.
3. **Mở khóa:** Sau 3 ngày, hệ thống tự động gỡ cờ khóa và đặt lại số đếm bùng kèo về 0.
