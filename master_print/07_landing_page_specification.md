# MASTER PRINT — TẦNG 7: LANDING PAGE SPECIFICATION (PAWTY SUPER APP)

> **Single Source of Truth (SSOT)** — Đặc tả toàn diện cho Landing Page Pawty (`Pawty-LandingPage`), quy trình triển khai React + Vite, giao diện cute thân thiện và cấu hình Vercel Deployment.

---

## 1. Mục Tiêu & Định Vị Landing Page

- **Mục đích chính:**
  1. Giới thiệu giá trị cốt lõi của siêu ứng dụng Pawty: **Kết nối những người nuôi thú cưng (Pet Owners)** — Bảng tin Khoảnh khắc (Facebook/Instagram style) — Hẹn dạo Pawty Dating (FB Dating style với thẻ 2 mặt Sen & Boss) — Báo động SOS tìm Boss lạc cộng đồng bán kính 3km.
  2. Ứng dụng **hoàn toàn miễn phí 100%** cho cộng đồng người nuôi thú cưng đô thị: Không có gói cước, không có phí dịch vụ, không quảng cáo spam, không dùng dữ liệu mẫu, phản ánh chân thực 100% tính năng ứng dụng thực tế.
  3. Thúc đẩy lượt đăng ký sớm và tải ứng dụng (App Store, Google Play, Web Demo).
  4. Minh bạch thông tin giữa các chủ nuôi (Chủ nuôi tự tích xác nhận đã tiêm phòng, tự nguyện chia sẻ thói quen dắt dạo). **Không bắt buộc kiểm chứng sổ tiêm và không cam kết an toàn tuyệt đối** vì hệ thống không có nhân sự thẩm định thực địa.
  5. Định hướng mở rộng toàn đô thị: **Không bó hẹp trong phạm vi chung cư**; phục vụ mọi người nuôi chó/mèo trong khu vực lân cận theo bán kính địa lý.

- **Khách hàng mục tiêu truy cập:** Người nuôi thú cưng (Gen Z, Millennials, DINK) tại các khu vực đô thị (TP.HCM, Hà Nội, Đà Nẵng, v.v.).

---

## 2. Kiến Trúc Nội Dung (Page Sections Breakdown)

| STT | Section | Vai trò & Nội dung | Ghi chú Giao diện |
|:---:|---|---|---|
| **01** | **Top Announcement Bar** | Lời chào mừng cute: 🐾 Cộng đồng miễn phí 100% kết nối những người nuôi thú cưng đô thị | Gradient Coral & Mint |
| **02** | **Header / Sticky Navigation** | Logo Pawty, Links (Trang chủ, Tính năng, Pawty Dating, Hệ sinh thái, FAQ, Tải app), CTA "Trải nghiệm Dating" & "Tải App Ngay" | Glassmorphism blur (Bỏ link "An toàn") |
| **03** | **Hero Section** | Headline: *"Nuôi Boss nhàn tênh — Kết nối bạn dắt dạo gần bạn trong bán kính 3km"*, CTA tải app, 3 Phone Mockups thực tế | Cute rounded style (Bỏ từ chung cư) |
| **04** | **Trust & Social Proof Bar** | Con số ấn tượng: 10,000+ Chủ nuôi kết nối, 100% Tự nguyện khai báo tiêm phòng, Kết nối đa quận huyện, 100% Miễn phí trọn đời | Badge xanh Mint (Bỏ 48 chung cư) |
| **05** | **Core Features Showcase** | 4 Thẻ tính năng Bento Box:<br>1. Hồ sơ thú cưng & Tích chọn đã tiêm phòng<br>2. Pawty Dating (kết nối người nuôi pet với thẻ lật 2 mặt Sen & Boss)<br>3. Chat & Hẹn dạo trung điểm Pet-friendly<br>4. Bảng tin khoảnh khắc mạng xã hội | Bento Grid bo tròn |
| **06** | **Interactive Dating Preview (Thẻ 2 Mặt Sen & Boss)** | **Thẻ lật 3D hai mặt (Flip Card):**<br>- **Mặt trước:** Thông tin chủ nuôi (ảnh chân dung, tên, tuổi, khu vực sống, bio, mục đích kết nối).<br>- **Mặt sau:** Thông tin Boss nuôi (ảnh cún/mèo, tên, giống, tuổi, tích "Đã tiêm phòng", thói quen khi dạo).<br>- Chạm/click thẻ để quay 180° chuyển đổi mượt mà. Bỏ filter loài Chó/Mèo để tập trung vào chủ nuôi. | Framer Motion 3D Flip Card |
| **07** | **Free Ecosystem Section** | Cam kết miễn phí 100% trọn đời: Card 1 Mạng xã hội & Pawty Dating; Card 2 Cứu hộ SOS 3km & AI Vision Gemini hỗ trợ tìm Boss lạc | Không gói cước, không spa |
| **08** | **Community Testimonials** | Đánh giá chân thực từ những người nuôi thú cưng tại Quận 1, Bình Thạnh, Cầu Giấy, Tây Hồ... | Trích dẫn chủ nuôi đô thị |
| **09** | **FAQ Accordion** | Giải đáp thắc mắc: Mô hình kết nối người nuôi pet, thẻ 2 mặt Sen & Boss, tự khai báo tiêm phòng, trợ lý AI tìm Boss lạc | Accordion cute |
| **10** | **App Download & QR CTA** | Banner kêu gọi tải ứng dụng đa nền tảng (iOS, Android), mở camera chụp mã QR tải app | Banner Gradient ấm áp |
| **11** | **Footer & Legal Documents** | Bản quyền Pawty, liên hệ, Bộ 3 trang quy chế (Bảo mật vị trí, Điều khoản sử dụng, Quy tắc ứng xử cộng đồng) | Modal pháp lý |

> **Lưu ý cập nhật quan trọng:**
> - ĐÃ BỎ hoàn toàn Section "Cam kết cộng đồng an toàn" (Safety & Anti-Conflict Pillar) vì không đảm bảo kiểm duyệt thực địa.
> - ĐÃ BỎ block "Đã có mặt tại hơn 48 cụm chung cư trọng điểm".
> - ĐÃ BỎ bộ lọc "Tất cả Boss / Loài Chó / Loài Mèo" trên thẻ Dating; thẻ trở thành thẻ 2 mặt lật (Mặt trước: Chủ pet; Mặt sau: Boss nuôi).
> - Tiêm chủng chuyển sang dạng người dùng tự tích chọn `Đã tiêm phòng`, không bắt buộc kiểm chứng hồ sơ.
