# MASTER PRINT — TẦNG 0: OVERVIEW & BRAND SYSTEM (Pawty Super App)

> **Single Source of Truth (SSOT)** — Đồng bộ 100% với `plan/00_product_vision_and_positioning.md` & `plan/01_ecosystem_architecture.md`.

---

## 1. Sứ Mệnh & Định Vị (Mission & Positioning)
- **Tuyên ngôn sứ mệnh:** *"Nuôi thú cưng nhẹ đầu hơn, có người đồng hành khi cần."*
- **Bản chất sản phẩm:** Hệ sinh thái số 5 lớp đầu tiên tại Việt Nam dành riêng cho người nuôi thú cưng tại đô thị — nối liền:
  `Chăm sóc cá nhân (Care) → Phối hợp gia đình (Circle) → Mạng xã hội & Cộng đồng địa phương (Local) → Dịch vụ chuyên nghiệp (Services) → Công cụ đối tác (Pro)`
- **4 Trụ cột Giá trị (Value Pillars):**
  1. **🐾 CARE (Tổ chức chăm sóc):** Hồ sơ Boss, sổ tiêm điện tử, lịch nhắc việc, ghi chú bàn giao.
  2. **🤝 CONNECT (Kết nối phối hợp):** Vòng chăm sóc (Circle) giao việc gia đình, Radar tìm bạn dắt dạo, hẹn dạo trung điểm.
  3. **📸 SHARE (MXH thú cưng):** Pet Feed với 7 loại bài viết, tương tác 5 cảm xúc Paw, Hỏi đáp chuyên gia kiểm duyệt, Nhóm cộng đồng.
  4. **💼 SERVE (Dịch vụ tin cậy):** Đặt lịch Grooming/Vet từ đối tác xác minh, theo dõi trạng thái, đánh giá từ giao dịch thật.

## 2. Đối Tượng Mục Tiêu (Target Personas)
- **Persona chính (Chủ nuôi đô thị bận rộn):**
  - Độ tuổi: 22–38 (Gen Z & Millennials), DINK, độc thân, hoặc gia đình trẻ tại chung cư TP.HCM & Hà Nội.
  - Thú cưng: Chó & Mèo.
- **Persona phụ (Đối tác dịch vụ - Pawty Pro):**
  - Pet Spa, Pet Café, Phòng khám Thú y, Dog Walker, Pet Sitter.

## 3. Bộ Nhận Diện Thương Hiệu (Playful Minimalism)

### 3.1 Bảng Màu Chủ Đạo (Color Palette)
| Token | Hex | Vai trò thiết kế |
|---|---|---|
| `--color-coral` | `#FF6F61` | Hồng San Hô — Năng động, ấm áp, CTA chính, điểm nhấn thương hiệu |
| `--color-mint` | `#A3E4D7` | Xanh Mint — Tươi mát, an tâm, chứng nhận Safe Pet, Sổ tiêm, Điểm hẹn, Expert Badge |
| `--color-cream` | `#FDFBF7` | Trắng Kem — Nền tảng êm dịu, ấm cúng thay cho màu trắng chói |
| `--color-charcoal` | `#2D3436` | Xám Than — Nội dung chữ chính (Body & Headings) |
| `--color-soft-gray` | `#B2BEC3` | Xám Nhạt — Placeholder, viền mảnh, trạng thái vô hiệu |
| `--color-warning` | `#FDCB6E` | Vàng Ấm — Cảnh báo nhắc việc sắp tới hạn, vương miện Sen VIP |
| `--color-danger` | `#E17055` | Đỏ Cam — Báo động khẩn cấp SOS, cảnh báo dị ứng/cần lưu ý, báo cáo sự cố |

### 3.2 Typography
- **Display / Headings:** `Fredoka` (Weight: 600, 700) — Bo tròn, thân thiện, giàu cá tính.
- **Body Text:** `Nunito` (Weight: 400, 600, 700) — Dễ đọc trên màn hình di động, hỗ trợ tiếng Việt hoàn hảo.
- **Monospace / Data:** `JetBrains Mono` (Weight: 400, 500) — Hiển thị mã mời Circle, giờ hẹn, số liệu KPI.

### 3.3 Design Tokens Chuẩn
```css
:root {
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;

  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;

  --shadow-card: 0 2px 8px rgba(0, 0, 0, 0.08);
  --shadow-modal: 0 8px 32px rgba(0, 0, 0, 0.12);
  --shadow-floating: 0 4px 16px rgba(0, 0, 0, 0.10);
}
```

### 3.4 Asset Map & Animation Layers
- `/assets/pawty-icon.png`: Icon chữ **P** đội nón tiệc màu xanh mint với dấu chân thú cưng.
- `/assets/pawty-logo-full.png`: Full Wordmark **Pawty** với chữ 'y' cách điệu đuôi cún vẫy mừng (1024x764 transparent).
- `/assets/pawty-logo-body.png`: Thân chữ "Pawt" và bầu đáy 'y' đã bóc tách lớp đuôi & sóng chuyển động.
- `/assets/pawty-logo-tail.png`: Đuôi cún độc lập với tâm xoay tự nhiên tại `(X: 66.4%, Y: 67.4%)`.
- `/assets/pawty-logo-waves-left.png`: Sóng chuyển động mint bên trái `((`.
- `/assets/pawty-logo-waves-right.png`: Sóng chuyển động mint bên phải `))`.

### 3.5 Brand Motion System (Hiệu Ứng Mở Đầu & Hoạt Cảnh Sống Động)
- **Watercolor Bloom Reveal (Mở màn loang màu nước):** Logo mở ra từ tâm với hiệu ứng loang cọ màu nước hữu cơ, độ bão hòa tăng dần kết hợp độ phóng nhẹ `0.88 → 1.0` trong 1.2s.
- **Tail Wagging (Đuôi cún vẫy mừng):** Đuôi chữ 'y' lắc nhịp nhàng từ `-7deg` đến `+10deg` (chu kỳ `0.75s` lặp vô tận `ease-in-out`).
- **Motion Waves Vibration (Sóng mint rung rinh):** Hai vòng cung sóng mint bên trái `((` và phải `))` nhấp nháy phát sáng đồng điệu theo từng nhịp quẫy đuôi.
- **Màn hình chào (`AppSplashScreen`):** Chạy hoạt cảnh mở đầu trong 2.2 giây khi người dùng vừa mở app, đem lại trải nghiệm thân thiện, giàu cảm xúc.
