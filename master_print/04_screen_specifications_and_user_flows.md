# TẦNG 4: ĐẶC TẢ CHI TIẾT MÀN HÌNH & LUỒNG NGƯỜI DÙNG (SCREEN SPECS)

> **Mã định danh:** `PAWTY-MP-TIER-4`  
> **Phiên bản:** `1.0.0 (Master Blueprint)`  
> **Trạng thái:** `Đã phê duyệt (SSOT)`

---

## 1. SƠ ĐỒ ĐIỀU HƯỚNG MÀN HÌNH (NAVIGATION FLOW)

```
[Khởi động App]
       │
       ├───> [Splash & Intro Screen] Logo Pawty chính thức + Slogan
       ├───> [Auth Flow: Google SSO & Username/Password]
       ├───> [Xin quyền Vị trí GPS (expo-location)]
       ├───> [Onboarding Flow có nút Quay lại (Back Button)]
       │            │ (1) Chọn Mục đích (Hẹn hò/Đi dạo/Playdate) -> (2) Chủ nuôi -> (3) Boss đi cùng

       │            ▼
       └───> [Màn Hình Chính - Bottom Navigation (4 Tabs)]
                    │
                    ├── [Tab 1: Radar Boss] ───> [Match Celebration Modal] ──> [Vào Chat]
                    │           │
                    │           ├───> [Bộ Lọc Bán Kính & An Toàn Modal]
                    │           ├───> [Xem Hồ Sơ Chi Tiết Boss]
                    │           └───> [SOS Tìm Boss Lạc Modal]
                    │
                    ├── [Tab 2: Khoảnh Khắc] ──> [Xem Chi Tiết & Thả Tim Modal]
                    │           │
                    │           └───> [Đăng Khoảnh Khắc Bựa Mới Modal]
                    │
                    ├── [Tab 3: Chat & Hẹn Dạo] ──> [Phòng Chat Riêng]
                    │                                    │
                    │                                    ├───> [Lên Lịch Hẹn Dạo Modal]
                    │                                    ├───> [Bong Bóng Lời Mời: Đồng Ý / Từ Chối]
                    │                                    └───> [Báo Cáo Bùng Kèo Modal]
                    │
                    └── [Tab 4: Hồ Sơ Của Tôi] ──> [Tab 1: Khoảnh Khắc] & [Tab 2: Sổ Tiêm Safe Pet]
```

---

## 2. ĐẶC TẢ CHI TIẾT TỪNG MÀN HÌNH

### 2.1. Màn hình Khung Giả Lập & Điều Khiển (`DeviceFrame`)
- **Chế độ hiển thị:**
  - Trên màn hình máy tính (Desktop/Laptop): Hiển thị khung vỏ mô phỏng iPhone 16 Pro viền mỏng bo góc lớn (`rounded-[48px]`), có Dynamic Island ở đỉnh, thanh trạng thái (Giờ, 5G, Pin), và thanh gạch dưới đáy.
  - Cột điều khiển Desktop bên trái: Cho phép chuyển đổi toàn màn hình, chuyển vị trí GPS (Vinhomes Central Park, Masteri Thảo Điền, Sala, Times City), mở nhanh các luồng Onboarding/VIP/SOS, và **Quét mã QR để mở trên điện thoại cùng mạng Wi-Fi**.
  - Trên màn hình điện thoại thật: Tự động tràn viền toàn màn hình (Full Responsive).
- **Biểu ngữ FCM Push Notification:** Trượt từ đỉnh màn hình xuống khi có sự kiện (Match mới, tin nhắn, nhắc lịch dạo 15 phút, báo động SOS).

---

### 2.2. Màn hình Onboarding (`OnboardingModal`)
- **Bước 1 (Đăng ký SĐT thật):** Header chứa icon rút gọn `pawty-icon.png`, giữa màn hình là full logo `pawty-logo-full.png`, ô nhập SĐT đầu số `+84`.
- **Bước 2 (Xác thực OTP):** Ô nhập 6 số, đếm ngược 120s, nút *"Nhập nhanh mã test 888888 ⚡"*.
- **Bước 3 (Thông tin Sen):** Họ tên/biệt danh, dropdown chọn cụm chung cư.
- **Bước 4 (Tạo Boss qua Chips Component):**
  - Nút chuyển loài Chó 🐶 / Mèo 🐱.
  - Tên Boss, Chips chọn nhanh giống loài.
  - Cân nặng (kg) tự phân loại Size (Nhỏ, Vừa, Lớn).
  - Tích chọn tiêm phòng đầy đủ (mũi 7 bệnh + dại).
  - Chọn tối đa 4 Tag tính cách dạng Chips.
  - Nhập thói quen tốt/xấu và Bio tự viết.

---

### 2.3. Màn hình Radar Quẹt Thẻ (`RadarScreen`)
- **Thanh Header:** Avatar Boss góc trái kèm vương miện vàng (nếu là VIP), Logo thương hiệu chính thức `pawty-logo-full.png`, Huy hiệu GPS cụm chung cư, Nút 🚨 SOS khẩn cấp, Nút Bộ lọc.
- **Thẻ Quẹt Thẻ Kép (Chủ Nuôi & Boss) & Tinder Swipe Physics:**
  - Kết nối Người nuôi thú cưng: Hiển thị ảnh & thông tin Chủ nuôi (Tên, Tuổi, Nghề nghiệp/Bio) + Huy hiệu Mục đích (❤️ Hẹn hò, 🚶 Đi dạo đôi, 🐾 Bạn cho Boss).
  - Mini Card Boss đi cùng: Avatar Boss, Tên, Giống loài, Cân nặng, Huy hiệu Safe Pet bảo chứng.
  - Kéo thả cử chỉ ngón tay thật (PanResponder Drag & Swipe): Thẻ xoay góc nghiêng (-15° đến +15°), hiện stamp "THÍCH" / "BỎ QUA", thả tay quá ngưỡng thì quẹt thẻ.
  - Tinh giản Playful Minimalism: Ảnh lớn, thông tin cốt lõi, không nhồi nhét chữ gây ngợp.
  - Ảnh full tỷ lệ dọc, bo góc tròn lớn `rounded-[32px]`.
  - Huy hiệu khoảng cách: *"Cách bạn 280m • Park 3"*.
  - Huy hiệu an toàn: *"Đã tiêm 7 bệnh"*.
  - Tên Boss, tuổi, giống loài, giới tính, tình trạng triệt sản.
  - Đoạn bio ngắn và các chip tag tính cách (`#Tăng động`, `#Quý tộc`).
  - Huy hiệu chủ nuôi (Sen: Thanh Hằng).
- **Thẻ Quảng Cáo Bản Địa (Native Ad Card):**
  - Chèn sau mỗi 5-7 thẻ Boss.
  - Huy hiệu *"Được tài trợ • Native Ad"*, ảnh không gian tiệm Spa/Pet Bakery, nhãn *"Voucher -35%"*, nút CTA *"Lưu Voucher Ngay 🎁"*.
- **Cụm 5 nút điều khiển dưới đáy:**
  - ⏪ Tua lại thẻ (Rewind).
  - ❌ Bỏ qua (Dislike / Quẹt trái).
  - ⭐ Siêu thích (Super Paw).
  - 💖 Thích (Like / Quẹt phải).
  - ℹ️ Xem chi tiết hồ sơ 2 tab.

---

### 2.4. Modal Chúc Mừng Khớp Lệnh (`MatchModal`)
- Pháo hoa `canvas-confetti` bung tỏa 4 màu.
- Logo full `pawty-logo-full.png` và huy hiệu *"Khớp Lệnh Tuyệt Đối!"*.
- Hoạt ảnh 2 avatar cún đập chân vào nhau (Paw Bumping) với biểu tượng trái tim đập ở giữa.
- Nút CTA lớn: **"Nhắn Tin & Hẹn Dạo Ngay"** chuyển thẳng vào phòng chat.

---

### 2.5. Màn hình Trang Cá Nhân 2 Tab (`PetProfileScreen`)
- **Cover & Avatar:** Ảnh bìa lớn ven sông, ảnh đại diện bo góc với huy hiệu VIP.
- **Tab 1 - Khoảnh khắc:** Lưới ảnh vuông 3 cột. Bấm vào bất kỳ ảnh nào để mở Modal xem ảnh lớn, đọc caption, và nút Thả tim tăng số lượt đếm tức thì. Nút *"Đăng khoảnh khắc bựa"* mở form giả lập tải ảnh lên Cloudinary/S3.
- **Tab 2 - Tiểu sử chuyên sâu:** Thiết kế các Card tông màu Xanh Mint (`#A3E4D7`):
  - Card 1: Cân nặng & phân khúc kích cỡ (vd: 11.2 kg - Size vừa).
  - Card 2: Sổ tiêm chủng điện tử (Vaccine 7 bệnh, dại, ngày tiêm gần nhất).
  - Card 3: Thói quen tốt khi ra đường.
  - Card 4: Thói quen cần lưu ý (phòng tránh cắn nhau khi gặp mặt).
  - Card 5: Thẻ chứng nhận KYC số điện thoại của chủ nuôi.

---

### 2.6. Màn hình Chat & Kèo Hẹn (`ChatRoomScreen`)
- **Header:** Nút Back, Avatar + Tên Boss, Nút **"📅 Hẹn Đi Dạo"**.
- **Luồng nhắn tin:** Tin nhắn của mình màu Hồng San Hô, tin nhắn đối phương màu trắng/xanh mint. Tích hợp bot tự động trả lời hóm hỉnh sau 1.5 giây.
- **Bong bóng Kèo hẹn đi dạo đặc biệt:**
  - Ảnh thu nhỏ địa điểm, tên địa điểm, giờ hẹn (vd: *Tối nay • 19:30*), ghi chú.
  - Nút **[Đồng Ý Kèo!]** và **[Để dịp khác]**.
  - Khi đã đồng ý: Chuyển sang huy hiệu xanh *"Đã chốt kèo!"* và hiển thị dòng chữ *"Pawty sẽ gửi thông báo nhắc cả 2 trước 15 phút giờ ra đường ⏰"*.
  - Nút *"Báo cáo bùng kèo"* mở hộp thoại cảnh báo: Nếu bị báo cáo 2 lần/tuần sẽ bị tạm khóa quẹt thẻ 3 ngày.


---

# PHỤ LỤC v1.1 — MÀN HÌNH & LUỒNG NGƯỜI DÙNG P1

## 4.1. Điều hướng mới (Mobile = bản chính)
```
RootStack
 ├─ Onboarding (Phone → OTP/Social → Sen info (+Referral code) → Boss 1)
 └─ MainTabs  (Radar | Feed | Chat | Hồ sơ)
      Stack con dùng chung: PetDetail, NotificationCenter, Settings, BossSwitcher/AddBoss,
      VaccineUpload, Reminders, Clubs → ClubDetail → CreateEvent, Events → EventDetail,
      Places → PlaceDetail(+Review), Vouchers, Badges, Streak/WalkLog, Referral,
      Language, Privacy&Blocks, WalkNow, Boost, Paywall(VIP/VIP+/IAP), SOS, SOSNearby,
      ChatRoom → WalkScheduler → CheckIn, LiveLocation
```

## 4.2. Đặc tả màn hình mới/thay đổi
| Màn hình | Nội dung bắt buộc |
| :--- | :--- |
| **Radar (nâng cấp)** | 5 nút dưới đáy: Rewind ⏪ (khoá 🔒 + mở Paywall nếu free) · Pass ❌ · Super Paw ⭐ (đếm quota) · Like 💖 · Info ℹ️. Chip lọc nhanh: Tất cả/Đang dắt dạo/Safe Pet. Thẻ Boss có chấm xanh "Đang dắt dạo" & viền vàng khi Boost/Super Like. Nút **Boost ⚡** ở header (hiện bộ đếm ngược khi đang chạy). Thẻ Native Ad chèn theo 4.3; click → `/ads/:id/click`; CTA lưu voucher. |
| **Walk Now** | Nút lớn "Dắt dạo ngay 🐕" trên Radar; màn hình đếm giờ 30 phút, bản đồ đơn giản (danh sách Boss đang dắt dạo gần), nút Gia hạn/Dừng, tóm tắt quãng đường & streak khi dừng. |
| **Feed** (thay tab Khoảnh khắc) | 2 sub-tab: "Khu vực" (`/feed`) · "Của tôi". Card ảnh + tim + bình luận + Share (xuất ảnh có watermark Pawty bằng `expo-sharing`/`Share` API). Màn bình luận bottom-sheet. |
| **Hồ sơ của tôi** | Header chuyển Boss (BossSwitcher), huy hiệu hàng ngang, Streak 🔥, nút Cài đặt. Tab 2 hiện **Safe Pet verified ✓ / Chờ duyệt ⏳ / Bị từ chối ✗**, nút Upload sổ tiêm, ngày tái chủng kế tiếp. |
| **VaccineUpload** | Chụp/chọn ảnh (≤4), ngày tiêm, hạn tái chủng, gửi duyệt. |
| **Reminders** | Danh sách nhắc (vaccine/tẩy giun/tuỳ chọn), tick hoàn thành, thêm mới. |
| **Chat Room (nâng cấp)** | Trạng thái gửi/đã đọc ✓✓, typing indicator, gợi ý mở đầu AI (3 chip khi phòng trống), nút 📅 Hẹn dạo, bong bóng hẹn có **nút Check-in** khi trong cửa sổ, nút **Chia sẻ vị trí trực tiếp 📍**, nút "Báo cáo bùng kèo" chỉ khi đủ điều kiện 4.5. Menu ⋯: Chặn / Báo cáo. |
| **CheckIn** | Hiển thị khoảng cách tới điểm hẹn (cập nhật), nút Check-in bật khi ≤150m, trạng thái đối phương. |
| **Places** | Danh sách + lọc danh mục (park/cafe/spa/vet/shop/hotel), chi tiết, đánh giá sao, nút "Chọn làm điểm hẹn". |
| **Clubs / Events** | Tìm CLB (breed/building), tham gia, danh sách sự kiện, RSVP, tạo sự kiện (owner). |
| **NotificationCenter** | Danh sách theo thời gian, chấm chưa đọc, đọc tất cả, điều hướng sâu theo `payload`; badge số trên chuông header. Banner push trong app khi nhận `notification_created`. |
| **Settings** | Ngôn ngữ (vi/en), thông báo theo loại, ẩn khoảng cách, danh sách chặn, xuất dữ liệu, xoá tài khoản (xác nhận 2 bước), điều khoản/riêng tư, đăng xuất. |
| **Paywall** | So sánh 3 gói (`free`/`vip`/`vip_plus`), gói tháng/năm, mua lẻ Boost/Super Like, hiển thị QR + poll trạng thái; thành công → confetti & cập nhật tier. |
| **Vouchers** | Ví voucher (mã `PAW-XXXXXX`, hạn dùng, trạng thái). |
| **Badges / Streak** | Lưới huy hiệu (earned/locked + tiến độ), lịch sử dạo, chuỗi ngày. |
| **Referral** | Mã + nút chia sẻ, số người đã mời, ngày VIP nhận được. |

## 4.3. Đa ngôn ngữ (i18n)
- File `mobile/src/i18n/{vi,en}.ts` (key phẳng dạng `radar.superLike.exhausted`). Mặc định `vi`; đổi runtime, lưu vào `users.locale`. Không còn chuỗi cứng trong component (trừ tên riêng/mock data).

## 4.4. Cổng quản trị & Đối tác (Web)
- **Admin Portal** (`/admin.html`, đăng nhập SĐT quản trị): Dashboard KPI (thẻ số + biểu đồ 14 ngày), Hàng đợi sổ tiêm (xem ảnh → Duyệt/Từ chối), Báo cáo vi phạm, Người dùng, Giao dịch, Đối tác & Quảng cáo, SOS, Audit log.
- **Partner Portal** (`/partner.html`): Đăng ký/đăng nhập, Tổng quan số dư & thống kê, Tạo/Sửa chiến dịch (preview thẻ Native Ad đúng như trên Radar), Nạp tiền, Redeem voucher.
- Cả hai dùng Tailwind v4 + brand tokens (Coral/Mint/Cream, Fredoka/Nunito), responsive desktop-first, bảng có tìm kiếm & phân trang.

## 4.5. Web demo (`src/`)
- Giữ vai trò bản **mô phỏng** để duyệt UX: đồng bộ các tính năng P1 chính (Super Like/Rewind/Boost, Walk Now, Feed + comment, Notifications, Reminders, Vouchers, Settings/i18n tối thiểu) — ưu tiên sau Mobile.
