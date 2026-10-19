# TẦNG 0: TỔNG QUAN DỰ ÁN & HỆ THỐNG NHẬN DIỆN THƯƠNG HIỆU (BRAND SYSTEM)

> **Mã định danh:** `PAWTY-MP-TIER-0`  
> **Phiên bản:** `1.0.0 (Master Blueprint)`  
> **Trạng thái:** `Đã phê duyệt (SSOT)`

---

## 1. BRIEF DỰ ÁN (PROJECT BRIEF)

- **Tên dự án:** **Pawty** (Ghép từ *Paw* 🐾 + *Party* 🎉).
- **Slogan:** *"Bạn dạo muôn nơi - Boss vui cả ngày"*.
- **Sứ mệnh:** Giải tỏa sự cô đơn, bí bách và trầm cảm cho thú cưng sống trong không gian khép kín tại các khu căn hộ, chung cư cao cấp. Giúp chủ nuôi (Sen) kết nối nhanh, an toàn để tìm bạn đi dạo chung nội khu, đồng thời tạo không gian lưu trữ và giải trí hằng ngày qua những "khoảnh khắc bựa" của Boss.
- **Tệp khách hàng mục tiêu:**
  - Nhóm **DINK** (*Double Income, No Kid* - Cặp đôi thu nhập tốt, chưa/không sinh con, xem thú cưng như con ruột).
  - Người trẻ **Độc thân** (Thế hệ Gen Z & Millennials, nhân viên văn phòng, chuyên gia, expat).
  - Địa bàn trọng điểm: Các khu đô thị, đại đô thị, chung cư cao cấp tại **TP.HCM** (Vinhomes Central Park, Masteri Thảo Điền, Sala Thủ Thiêm, The Sun Avenue,...) và **Hà Nội** (Times City, Vinhomes Smart City, Ocean Park,...).

---

## 2. ĐỊNH HƯỚNG THIẾT KẾ THƯƠNG HIỆU (PLAYFUL MINIMALISM)

Phong cách kết hợp giữa **sự tối giản, hiện đại (Minimalism)** của các ứng dụng công nghệ cao cấp và **nét hóm hỉnh, ấm áp, đáng yêu (Playful)** của thế giới thú cưng.

### 2.1. Bảng màu chuẩn mực (Color Palette Tokens)

| Token Name | Mã Hex | Ý nghĩa & Vùng áp dụng |
| :--- | :--- | :--- |
| `--color-coral` | `#FF6F61` | **Màu chủ đạo (Primary Brand):** Năng lượng, tình yêu thương, ấm áp. Dùng cho nút CTA chính, tin nhắn gửi đi, logo, tim like, thẻ quẹt. |
| `--color-coral-dark` | `#E85B4E` | Màu hover / gradient bóng của Coral. |
| `--color-coral-light` | `#FFE8E5` | Màu nền phụ, tag chip nổi bật. |
| `--color-mint` | `#A3E4D7` | **Màu an toàn (Safe & Health):** Sổ tiêm chủng Safe Pet, huy hiệu xác thực, nền card tiểu sử, nón tiệc logo. |
| `--color-mint-dark` | `#48C4B0` | Viền nhấn mạnh của Mint, nút đồng ý kèo hẹn. |
| `--color-mint-light` | `#E8F8F5` | Nền các thẻ Card chuyên sâu của thú cưng. |
| `--color-cream` | `#FDFBF7` | **Nền ứng dụng (App Canvas):** Trắng kem ấm áp, dịu mắt, thân thiện hơn trắng tinh. |
| `--color-cream-warm` | `#F6F1E8` | Nền khung ngoài / nền phụ của màn hình chat. |
| `--color-dark-navy` | `#1A1D24` | Nền vỏ thiết bị giả lập điện thoại, tương phản cao. |
| `--color-gold-vip` | `#FFD700` | Màu vương miện VIP, huy hiệu hạng sang, sao đánh giá. |

---

### 2.2. Hệ thống Logo & Tài nguyên Đồ họa (Assets Map)

Mọi bản clone hoặc mã nguồn mới **phải sử dụng trực tiếp các file ảnh trong thư mục `public/assets/`**:

1. **Icon Rút Gọn (`public/assets/pawty-icon.png`):**
   - **Mô tả:** Chữ cái **P** màu Hồng San Hô bo tròn dày dặn, bên trong khoét hình bàn chân cún màu trắng kem, trên đỉnh đội chiếc nón sinh nhật kẻ sọc màu Xanh Mint có cục bông tròn.
   - **Ứng dụng:** Favicon, App Launcher Icon, Dynamic Island, FCM Push Notification Toast, Thẻ nhận diện sidebar.
2. **Full Logo Wordmark (`public/assets/pawty-logo-full.png`):**
   - **Mô tả:** Chữ **Pawty** hoàn chỉnh, chữ P đội nón tiệc, chữ 'y' uốn cong cách điệu thành đuôi cún vẫy mừng với các vệt sóng chuyển động màu xanh mint.
   - **Ứng dụng:** Header chính thanh điều hướng, Màn hình Chào mừng Onboarding, Modal chúc mừng Khớp Lệnh Match, Bảng điều khiển Desktop.

---

### 2.3. Hệ thống Typography (Phông chữ)

- **Display & Headings:** `Fredoka` (Google Fonts) - Phông chữ béo tròn, các góc bo mập mạp, tạo cảm giác thân thiện, đáng yêu. Trọng số font: `600 (Semi-bold)`, `700 (Bold)`, `800 (Extra-bold)`.
- **Body & Subtitles:** `Nunito` (Google Fonts) - Phông chữ sans-serif tròn trịa, cân bằng tuyệt vời giữa tính dễ đọc cao và sự ấm áp. Trọng số font: `400 (Regular)`, `600 (Semi-bold)`, `700 (Bold)`.

---

### 2.4. Quy chuẩn Vi tương tác (Micro-interactions)

- **Confetti Explosion:** Khi khớp lệnh Match thành công hoặc kích hoạt VIP, bắn chùm pháo hoa 4 màu (`#FF6F61`, `#A3E4D7`, `#FFD166`, `#FF9A8B`).
- **Paw Bumping:** Hoạt ảnh 2 avatar cún nghiêng góc và đập bàn chân vào nhau khi có kết quả Match.
- **Heart Float:** Tim bay khi bấm Like ảnh khoảnh khắc bựa.
- **Radar Wave:** Vòng sóng radar tỏa xung quanh điểm GPS khi lọc tìm kiếm.
