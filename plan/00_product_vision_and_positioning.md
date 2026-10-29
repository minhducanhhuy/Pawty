# Tầng 0 — Tầm nhìn Sản phẩm & Định vị Thương hiệu

> Ngày lập: 29/10/2026 · Thị trường: Việt Nam · Phiên bản: v1.0
> Giả định nền: **Đã có cộng đồng người nuôi thú cưng hoạt động**

---

## 1. Sứ mệnh (Mission Statement)

**"Nuôi thú cưng nhẹ đầu hơn, có người đồng hành khi cần."**

Pawty là **hệ sinh thái số dành riêng cho người nuôi thú cưng** tại đô thị Việt Nam — nơi mọi tính năng, nội dung, thuật toán gợi ý và quy trình vận hành đều được thiết kế riêng xoay quanh nhu cầu chăm sóc, kết nối và chia sẻ của cộng đồng nuôi thú cưng.

Pawty không phải là mạng xã hội tổng hợp có thêm mục thú cưng. Mọi pixel trên ứng dụng đều phục vụ người nuôi.

## 2. Giả định Cộng đồng Hiện tại

| Yếu tố | Giả định |
|---|---|
| Cộng đồng | Đã có cộng đồng người nuôi thú cưng đang hoạt động (online groups, offline meetups) |
| Nhu cầu đã xác nhận | Phối hợp chăm sóc, tìm dịch vụ tin cậy, chia sẻ kinh nghiệm, kết nối cùng sở thích |
| Đối tác | 5-10 cơ sở dịch vụ thú cưng đã xác minh trong khu vực mục tiêu |
| Người dùng mục tiêu ban đầu | 200-500 hộ nuôi thú cưng tại đô thị |

## 3. Đối tượng Mục tiêu (Target Persona)

### Persona chính: Chủ nuôi đô thị bận rộn
- **Độ tuổi:** 22–38 (Gen Z & Millennials)
- **Đặc điểm:** DINK (Double Income No Kids), độc thân, hoặc gia đình trẻ
- **Nơi ở:** Chung cư / khu đô thị tại TP.HCM, Hà Nội
- **Loại thú cưng:** Chó & mèo (ưu tiên); mở rộng sau
- **Pain points:**
  1. Bận, không biết nhờ ai khi đi vắng/bệnh
  2. Thiếu hệ thống lưu hồ sơ chăm sóc, sổ tiêm, lịch tái khám
  3. Khó tìm dịch vụ grooming/vet/trông giữ tin cậy
  4. Thú cưng cô đơn, thiếu bạn chơi, thiếu kích thích
  5. Muốn chia sẻ khoảnh khắc với người HIỂU thú cưng (không phải bạn bè random)

### Persona phụ: Đối tác dịch vụ
- Pet Spa, Pet Café, Bác sĩ thú y, Dog walker, Pet sitter
- Cần tìm khách, quản lý lịch hẹn, xây uy tín

## 4. Bộ nhận diện Thương hiệu (Brand Identity)

### 4.1 Phong cách: Playful Minimalism
- Vui nhộn nhưng đáng tin cậy
- Giao diện sạch, dễ dùng, ấm áp
- Ngôn ngữ thân thiện, gần gũi, dùng từ "Boss" thay "thú cưng"

### 4.2 Bảng màu chủ đạo

| Token | Hex | Vai trò |
|---|---|---|
| `--color-coral` | `#FF6F61` | Năng động, ấm áp — CTA, accent chính |
| `--color-mint` | `#A3E4D7` | Tươi mát, an tâm — badges an toàn, sổ tiêm, xác nhận |
| `--color-cream` | `#FDFBF7` | Nền tảng — background chính |
| `--color-charcoal` | `#2D3436` | Nội dung chính — text body |
| `--color-soft-gray` | `#B2BEC3` | Phụ trợ — placeholder, divider |
| `--color-warning` | `#FDCB6E` | Cảnh báo — nhắc việc quá hạn |
| `--color-danger` | `#E17055` | Nguy hiểm — SOS, báo cáo sự cố |

### 4.3 Typography

| Mục đích | Font | Weight |
|---|---|---|
| Display / Headings | **Fredoka** | Bold (700) |
| Body Text | **Nunito** | Regular (400), Semi-bold (600) |
| Monospace / Data | **JetBrains Mono** | Regular (400) |

### 4.4 Logo & Assets

| Asset | Mô tả | Path |
|---|---|---|
| Icon rút gọn | Chữ **P** đội nón tiệc xanh mint + dấu chân thú cưng | `/assets/pawty-icon.png` |
| Full Wordmark | Chữ **Pawty** — 'y' cách điệu đuôi cún vẫy | `/assets/pawty-logo-full.png` |
| Splash | Gradient coral-to-mint + logo centered | `/assets/splash.png` |

### 4.5 Design Tokens

```css
:root {
  /* Spacing */
  --space-xs: 4px;
  --space-sm: 8px;
  --space-md: 16px;
  --space-lg: 24px;
  --space-xl: 32px;
  --space-2xl: 48px;

  /* Border Radius */
  --radius-sm: 8px;
  --radius-md: 12px;
  --radius-lg: 16px;
  --radius-xl: 24px;
  --radius-full: 9999px;

  /* Shadows */
  --shadow-card: 0 2px 8px rgba(0, 0, 0, 0.08);
  --shadow-modal: 0 8px 32px rgba(0, 0, 0, 0.12);
  --shadow-floating: 0 4px 16px rgba(0, 0, 0, 0.10);

  /* Z-Index Scale */
  --z-base: 0;
  --z-dropdown: 10;
  --z-sticky: 20;
  --z-modal: 50;
  --z-toast: 100;
}
```

## 5. Giá trị Cốt lõi của Sản phẩm (Product Value Pillars)

```
┌─────────────────────────────────────────────────────┐
│                    PAWTY ECOSYSTEM                  │
│                                                     │
│  "Nuôi thú cưng nhẹ đầu hơn, có người đồng hành"  │
│                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │  CARE    │ │  CONNECT │ │  SHARE   │ │ SERVE  │ │
│  │ Chăm sóc │ │ Kết nối  │ │ Chia sẻ  │ │Dịch vụ │ │
│  │ tổ chức  │ │ phối hợp │ │ cộng đồng│ │tin cậy │ │
│  └──────────┘ └──────────┘ └──────────┘ └────────┘ │
└─────────────────────────────────────────────────────┘
```

### Pillar 1: CARE — Tổ chức Chăm sóc
- Hồ sơ thú cưng chi tiết (sổ tiêm, cân nặng, thói quen, hành vi)
- Lịch nhắc việc (tiêm phòng, tắm, tái khám, thuốc)
- Ghi chú bàn giao khi nhờ người khác trông

### Pillar 2: CONNECT — Kết nối Phối hợp
- Mời người nhà / bạn bè vào vòng chăm sóc
- Phân công việc, xác nhận hoàn thành
- Kết nối chủ nuôi cùng khu vực (dắt dạo, chơi chung)
- Radar tìm bạn theo mục đích, khoảng cách, loài & hành vi

### Pillar 3: SHARE — Mạng xã hội Thú cưng
- Đăng khoảnh khắc (ảnh/video) — feed custom cho thú cưng
- Tương tác: thả paw (🐾), bình luận, chia sẻ
- Hỏi đáp cộng đồng có kiểm duyệt
- Nội dung được phân loại & sàng lọc riêng cho thú cưng
- Hashtag thông minh theo loài, giống, vấn đề

### Pillar 4: SERVE — Dịch vụ Tin cậy
- Tìm & đặt dịch vụ từ đối tác đã xác minh
- Đánh giá từ giao dịch thật
- Lịch sử dịch vụ gắn với hồ sơ thú cưng

## 6. Khác biệt Chiến lược (Strategic Differentiation)

| Yếu tố | Facebook/Zalo Groups | 11pets | PetBacker | **Pawty** |
|---|---|---|---|---|
| Hồ sơ chăm sóc | ❌ | ✅ | ❌ | ✅ |
| Phối hợp nhiều người | ❌ | Cơ bản | ❌ | ✅ Full |
| Mạng xã hội cho pet | ❌ (chung) | ❌ | ❌ | ✅ Custom |
| Dịch vụ có tracking | ❌ | ❌ | ✅ | ✅ |
| Cộng đồng địa phương | ❌ (chung) | ❌ | ❌ | ✅ |
| Tiếng Việt native | ❌ (chung) | ❌ | Có | ✅ |
| Kết nối → kết quả | ❌ | ❌ | Một phần | ✅ |

**Giả thuyết khác biệt:** Pawty là hệ sinh thái đầu tiên tại Việt Nam **nối liền chăm sóc cá nhân → phối hợp gia đình → mạng xã hội cùng sở thích → dịch vụ chuyên nghiệp** trong một ứng dụng, bằng tiếng Việt, cho người nuôi thú cưng.

## 7. Nguyên tắc Sản phẩm (Product Principles)

1. **Pet-First, Always:** Mọi tính năng phải trả lời "điều này giúp Boss và chủ nuôi thế nào?"
2. **Privacy by Default:** Hồ sơ chăm sóc riêng tư; vị trí chỉ gần đúng; chủ nuôi quyết định chia sẻ gì
3. **Connection with Purpose:** Kết nối phải dẫn tới kết quả — không phải vanity metrics
4. **Trust Through Transparency:** Hành vi thú cưng, lịch sử dịch vụ, đánh giá — minh bạch để an tâm
5. **Community-Curated Content:** Nội dung sàng lọc bởi cộng đồng + chuyên gia, không phải thuật toán engagement-bait
6. **Lightweight but Complete:** Đủ dùng mà không quá tải — "nhẹ đầu" cả khi dùng app

## 8. Tên thương hiệu — Lưu ý

> [!WARNING]
> **Pet Pawty** đang tồn tại trong cùng lĩnh vực ([petpawty.app](https://petpawty.app/)). Trước khi chi lớn:**
> - Tra cứu nhãn hiệu tại Cục Sở hữu trí tuệ Việt Nam
> - Kiểm tra tên miền `.vn` và `.com`
> - Kiểm tra kho ứng dụng App Store / Google Play
> - Cân nhắc biến thể: **Pawty VN**, **Pawty.vn**, hoặc tên mới nếu cần

