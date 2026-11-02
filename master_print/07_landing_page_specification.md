# MASTER PRINT — TẦNG 7: LANDING PAGE SPECIFICATION (PAWTY SUPER APP)

> **Single Source of Truth (SSOT)** — Đặc tả toàn diện cho Landing Page Pawty (`Pawty-LandingPage`), quy trình triển khai React + Vite, giao diện cute thân thiện và cấu hình Vercel Deployment.

---

## 1. Mục Tiêu & Định Vị Landing Page

- **Mục đích chính:**
  1. Giới thiệu giá trị cốt lõi của siêu ứng dụng Pawty: Chăm sóc thông minh (Sổ tiêm Safe Pet) — Bảng tin Khoảnh khắc (Facebook/Instagram style) — Hẹn dạo Pawty Dating (Facebook Dating style) — Tìm Boss lạc khẩn cấp (SOS AI Gemini Vision).
  2. Ứng dụng **hoàn toàn miễn phí 100%** cho cộng đồng cư dân nuôi thú cưng đô thị: Không có gói cước, không có phí dịch vụ, không quảng cáo spam hay kinh doanh dịch vụ spa/thương mại.
  3. Thúc đẩy lượt đăng ký sớm và tải ứng dụng (App Store, Google Play, Web Demo).
  4. Xây dựng niềm tin an toàn tuyệt đối cho cộng đồng chủ nuôi chung cư (Xác thực tiêm chủng Safe Pet, minh bạch thói quen tránh xung đột, chống bùng hẹn).
  5. Cung cấp đầy đủ các trang quy chế pháp lý theo chuẩn phát hành ứng dụng (Chính sách bảo mật vị trí, Quy chế cộng đồng, Điều khoản sử dụng).

- **Khách hàng mục tiêu truy cập:** Chủ nuôi thú cưng (Gen Z, Millennials, DINK) tại các khu căn hộ cao cấp, khu đô thị hiện đại (Vinhomes, Masteri, Sala, Times City, v.v.).

---

## 2. Kiến Trúc Nội Dung (Page Sections Breakdown)

| STT | Section | Vai trò & Nội dung | Ghi chú Giao diện |
|:---:|---|---|---|
| **01** | **Top Announcement Bar** | Lời chào mừng cute: 🐾 Cộng đồng miễn phí 100% cho Boss & Sen chung cư | Gradient Coral & Mint |
| **02** | **Header / Sticky Navigation** | Logo Pawty, Links (Tính năng, Dating, An toàn, FAQ, Tải app), CTA "Trải nghiệm Dating" & "Tải App Ngay" | Glassmorphism blur |
| **03** | **Hero Section** | Headline: *"Nuôi Boss nhàn tênh — Tìm bạn dắt dạo chung cư trong 3km"*, CTA tải app, 3 Phone Mockups thực tế (Bảng tin khoảnh khắc, SOS AI, Pawty Dating) | Cute rounded style |
| **04** | **Trust & Social Proof Bar** | Con số ấn tượng: 10,000+ Boss đã kết nối, 100% hồ sơ xác thực tiêm chủng, 45+ cụm chung cư đô thị, 100% Miễn phí trọn đời | Badge xanh Mint |
| **05** | **Core Features Showcase** | 4 Thẻ tính năng Bento Box:<br>1. Sổ tiêm điện tử 7 bệnh & dại<br>2. Pawty Dating (kết nối dắt dạo FB Dating style)<br>3. Chat & Hẹn dạo trung điểm Pet-friendly<br>4. Bảng tin khoảnh khắc mạng xã hội | Bento Grid bo tròn |
| **06** | **Interactive Dating Preview** | Mô phỏng trải nghiệm Pawty Dating trên web (FB Dating style: xem profile chi tiết, chuyển xem Boss tiếp theo, gửi lời mời dắt dạo an toàn) | Framer Motion tương tác |
| **07** | **Safety & Anti-Conflict Pillar** | Cam kết bảo vệ an toàn Boss: Huy hiệu Safe Pet Mint, minh bạch thói quen xấu/tốt, chế tài tạm khóa khi bùng hẹn | Card sắc nét |
| **08** | **Free Ecosystem Section** | Cam kết miễn phí 100% trọn đời: Card 1 Mạng xã hội & Pawty Dating; Card 2 Cứu hộ SOS 3km & AI Vision Gemini hỗ trợ tìm Boss lạc | Không gói cước, không spa |
| **09** | **Community Testimonials** | Đánh giá chân thực từ cư dân nuôi cún/mèo tại Vinhomes Central Park, Sala, Landmark... | Trích dẫn cư dân |
| **10** | **FAQ Accordion** | Giải đáp thắc mắc: Mô hình hoạt động giống FB & FB Dating, cách xác thực sổ tiêm, trợ lý AI tìm Boss lạc | Accordion cute |
| **11** | **App Download & QR CTA** | Banner kêu gọi tải ứng dụng đa nền tảng (iOS, Android), mở camera chụp mã QR tải app | Banner Gradient ấm áp |
| **12** | **Footer & Legal Documents** | Bản quyền Pawty, liên hệ, Bộ 4 trang quy chế (Bảo mật vị trí, Điều khoản sử dụng, Quy chế cộng đồng, Chế tài bùng hẹn) | Modal pháp lý tích hợp |

---

## 3. Hệ Thống Thiết Kế & Typography Siêu Dễ Thương (Cute Fonts)

- **Typography (Hỗ trợ 100% Native Glyph Tiếng Việt):**
  - Headings (`font-display` / `font-cute`): `Baloo 2`, `Quicksand`, `Nunito`, `cursive`, `sans-serif` (Dòng font bo tròn, béo múp, có bộ ký tự tiếng Việt nguyên bản từ Google Fonts — triệt tiêu hoàn toàn lỗi vỡ font / nhảy font chữ to chữ nhỏ ở các nguyên âm có dấu nặng, hỏi, ngã, ơ, ư).
  - Body & Buttons (`font-body`): `Quicksand`, `Nunito`, `sans-serif` (Nét chữ mềm mại, dễ đọc, ấm áp, full dấu tiếng Việt).
- **Bảng Màu Chủ Đạo:**
  - Hồng San Hô (`#FF6F61`): Tình yêu thương, năng động.
  - Xanh Mint (`#A3E4D7`): An toàn, tin cậy, huy hiệu Safe Pet.
  - Trắng Kem (`#FDFBF7`): Nền tảng dịu mắt thay cho màu trắng gắt.
  - Charcoal (`#2D3436`): Chữ đậm tương phản cao, dễ nhìn.
- **Quy Tắc Ngôn Từ (Tone & Voice):**
  - Tuyệt đối KHÔNG dùng: "spa", "dịch vụ", "voucher dịch vụ", "ra đa", "quét", "quẹt", "swipe".
  - Luôn sử dụng: "Pawty Dating", "Bảng tin khoảnh khắc", "Gửi lời mời dắt dạo", "Chụp mã QR", "Sổ tiêm Safe Pet", "Trợ lý AI Vision Gemini".
