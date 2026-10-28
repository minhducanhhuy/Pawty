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


---

# PHỤ LỤC v1.1 — QUY TẮC NGHIỆP VỤ P1 (theo `plan/02`, `plan/03`)

## 4.1. Ba hạng thành viên (`vip_tier`)
| Quyền lợi | `free` | `vip` (49k/tháng · 399k/năm) | `vip_plus` (99k/tháng) |
| :--- | :--- | :--- | :--- |
| Lượt quẹt/ngày | 20 | Không giới hạn | Không giới hạn |
| Super Like/ngày | 1 | 5 | 10 |
| Rewind | ❌ (mua kèm VIP) | ✅ Không giới hạn | ✅ Không giới hạn |
| Boost miễn phí | 0 | 1/tuần | 3/tuần |
| Ảnh Khoảnh khắc | 5 | Không giới hạn | Không giới hạn |
| Số Boss/tài khoản | 1 | 2 | 5 |
| Huy hiệu 👑, ưu tiên Radar ×3 | ❌ | ✅ | ✅ |
| Xem "ai đã thích tôi" (`GET /matches/likes-me`) | Làm mờ, chỉ đếm số | ✅ | ✅ |
| Ẩn Native Ads | ❌ | ❌ | ✅ |
| Nhắc lịch sức khoẻ nâng cao | Cơ bản | Cơ bản | ✅ |
> Giá `vip_plus` và quota là **cấu hình** trong `server/src/config/business-rules.ts` (một nơi duy nhất, không hard-code rải rác).

## 4.2. Mua lẻ (IAP / VietQR)
| Sản phẩm | Giá | Hiệu lực |
| :--- | :--- | :--- |
| Boost 30 phút | 15.000đ | Thẻ Boss xếp đầu Radar quanh khu vực 30 phút (×5 tần suất) |
| Gói 5 Super Like | 29.000đ | Cộng vào `super_like_balance`, không hết hạn |
| Gói Boost ×3 | 39.000đ | Cộng vào `boost_balance` |
- Thanh toán đi qua `PaymentGateway` adapter (`sandbox` tự duyệt sau 5 giây; `vietqr` webhook thật khi có key).

## 4.3. Super Like / Rewind / Boost
- **Super Like:** hạ tầng như Like nhưng người nhận thấy thẻ có viền vàng ⭐ ở đầu danh sách "Thích bạn"; luôn đẩy FCM `match`-type "⭐ <Boss> đã Super Paw bạn!". Trừ quota ngày trước, hết quota thì trừ `super_like_balance`; hết cả hai → lỗi `SUPER_LIKE_EXHAUSTED`.
- **Rewind:** chỉ hoàn tác **lượt quẹt gần nhất** (trong 60 giây) của Boss hiện tại; đánh dấu `is_undone=true`, hoàn lại 1 lượt quẹt. Không rewind được khi đã `matched`. Không VIP → lỗi `VIP_REQUIRED`.
- **Boost:** kích hoạt dùng `boost_balance` hoặc quota tuần; đặt `boost_expires_at = now + 30 phút`. Không cộng dồn: đang chạy thì trả `BOOST_ALREADY_ACTIVE`.
- **Trọng số xếp hạng Radar:** `score = 1000 - distance_m` + (VIP ? +300 : 0) + (Boost active ? +1000 : 0) + (Super Like nhận được ? +500 : 0). Native Ad chèn sau mỗi 5–7 thẻ (vị trí ngẫu nhiên trong khoảng), không chèn cho `vip_plus`.

## 4.4. Dắt dạo ngay (Walk Now)
- Bật: `is_walking_now=true`, `walking_until = now + 30 phút` (gia hạn được). Hiện trên Radar với chấm xanh "Đang dắt dạo" và được tăng điểm ưu tiên +200.
- Quyền riêng tư: chỉ chia sẻ vị trí **làm tròn lưới 100m** và chỉ cho người trong bán kính lọc; tắt tự động khi hết hạn hoặc khi người dùng bấm Dừng.
- Khi Dừng: ghi `walk_logs` (quãng đường từ chuỗi điểm GPS client gửi lên, tối đa 50 điểm), cập nhật `walk_streak_days` (+1 nếu `last_walk_date = hôm qua`, giữ nếu = hôm nay, reset =1 nếu cũ hơn).

## 4.5. Check-in & hoàn thành kèo hẹn (Anti-flake nâng cấp)
- Cửa sổ check-in: từ **−30 phút đến +60 phút** quanh `scheduled_time`; khoảng cách GPS ≤ **150m** tới điểm hẹn (`place_lat/lng`), ngược lại lỗi `TOO_FAR_FROM_PLACE`.
- Cả hai bên check-in → `status='completed'`, +1 vào `walk_logs` cho mỗi người (source=`appointment`), cộng tiến độ huy hiệu.
- Sau `scheduled_time + 60 phút`, nếu chỉ một bên check-in thì bên đã check-in mới được bấm **Báo cáo bùng kèo** (`reported_flake`); bên chưa check-in không có quyền báo cáo. Phạt: lần 1/tuần cảnh báo, lần 2/tuần khoá quẹt 3 ngày (giữ nguyên quy tắc cũ), kèm ghi `audit_logs`.
- Nhắc lịch: server gửi push `appointment` trước 15 phút (đặt `reminder_sent_at`).

## 4.6. Sổ tiêm & Safe Pet
- Chủ nuôi upload ảnh sổ tiêm → `vaccine_status='pending'` → Admin/Moderator duyệt ở Admin Portal:
  - **Duyệt:** `verified`, `is_safe_pet=true`, đặt `vaccine_next_due_date` (admin nhập hoặc mặc định +365 ngày), sinh `reminders` kind=`vaccine`.
  - **Từ chối:** `rejected` kèm `vaccine_reject_reason`, push cho chủ nuôi.
- Nhắc tái chủng: gửi push ở mốc **30 / 7 / 1 / 0 ngày** trước hạn (ghi `last_notified_offset` để không gửi trùng).
- Gợi ý OCR: `OcrProvider` adapter (sandbox trả về "cần duyệt thủ công"); khi có key Vision API sẽ tự điền ngày tiêm.

## 4.7. Cộng đồng, CLB & Sự kiện
- CLB tự do tạo (tối đa 3 CLB/người, mỗi tên duy nhất); loại `breed` hoặc `building`. Người tạo là `owner`, có quyền tạo sự kiện và xoá bình luận.
- Sự kiện có `capacity`; RSVP vượt sức chứa → lỗi `EVENT_FULL`. Push `event` nhắc trước 1 giờ cho người `going`.
- Moderation: nội dung bị ≥3 `reports` mở sẽ tự ẩn chờ duyệt (`is_hidden=true`).

## 4.8. Gamification: Streak, Huy hiệu, Referral
| Huy hiệu (`code`) | Điều kiện |
| :--- | :--- |
| `first_match` | Match đầu tiên |
| `walk_7_streak` | Streak dắt dạo 7 ngày |
| `social_butterfly` | Hoàn thành 5 kèo hẹn (`completed`) |
| `safe_pet` | Boss được xác minh sổ tiêm |
| `moment_10` | Đăng 10 khoảnh khắc |
| `club_member` | Tham gia CLB đầu tiên |
| `referral_3` | Mời thành công 3 người |
| `sos_hero` | Phản hồi/ chia sẻ một SOS được đánh dấu "đã tìm thấy" |
- Mỗi lần mở khoá: tạo `notifications` loại `badge` + push.
- **Referral:** người mới nhập `referralCode` khi onboarding (hợp lệ trong 7 ngày đầu) → cả hai nhận **7 ngày VIP** (cộng dồn vào `vip_expires_at`, `vip_tier` tối thiểu `vip`). Mỗi người chỉ được giới thiệu tối đa 20 người; tự giới thiệu bị chặn (`SELF_REFERRAL`).

## 4.9. Native Ads & Voucher cho đối tác
- Đối tác đăng ký → `pending` → Admin duyệt → `approved` mới được tạo chiến dịch.
- Mô hình thu phí: `cpc` (3.000đ/lượt click/lưu voucher, trừ `balance_vnd`) hoặc `monthly` (1.500.000đ/tháng, không trừ theo lượt). Hết `balance_vnd` (gói cpc) → chiến dịch tự `paused`.
- Chỉ phát quảng cáo trong bán kính `radius_meters` quanh `target`, **tối đa 1 lần/giờ/chiến dịch/user** (frequency cap), user `vip_plus` không thấy.
- Voucher: mã dạng `PAW-XXXXXX`, hiệu lực 14 ngày, mỗi user 1 voucher/chiến dịch; cửa hàng "redeem" trong Partner Portal bằng cách nhập mã.

## 4.10. An toàn & Quyền riêng tư
- **Block:** chặn 2 chiều (không thấy nhau trên Radar, Chat bị ẩn, không match mới).
- **Report:** lý do liệt kê ở bảng `reports`; Admin xử lý (`resolved` kèm hành động: cảnh cáo / ẩn nội dung / khoá tài khoản).
- **Xoá tài khoản:** `DELETE /api/users/me` → xoá mềm ngay, ẩn khỏi Radar; xoá cứng sau 30 ngày. **Xuất dữ liệu:** `GET /api/users/me/export` trả JSON toàn bộ dữ liệu của người dùng.
- **Chia sẻ vị trí trực tiếp khi hẹn dạo:** chỉ giữa 2 người trong kèo `confirmed`, từ −15 phút đến +60 phút quanh giờ hẹn, tự tắt hết thời hạn; dữ liệu không lưu DB.

## 4.11. AI Icebreaker & Chatbot sức khoẻ
- `IcebreakerProvider` adapter (sandbox: bộ gợi ý theo `tags`/`breed` của hai Boss, hóm hỉnh tiếng Việt). Trả 3 câu/lần, giới hạn 10 lần/giờ/người.

## 4.12. Chỉ số & KPI hiển thị ở Admin
DAU, MAU, tổng user, Boss mới/ngày, match/ngày, kèo hẹn tạo/hoàn thành, tỷ lệ bùng kèo, doanh thu theo nguồn (SOS, VIP, IAP, Ads), báo cáo mở, sổ tiêm chờ duyệt, đối tác chờ duyệt. **North Star:** số kèo hẹn `completed` mỗi tuần.
