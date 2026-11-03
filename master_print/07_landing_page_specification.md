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
| **01** | **Header & Announcement Bar** | Lời chào mừng cute tích hợp gọn gàng ngay trên Navigation bar (không bị đè chéo): 🐾 Cộng đồng kết nối những người nuôi thú cưng | Header fixed không xung đột layout |
| **02** | **Hero Section** | Headline: Trải nghiệm kết nối Boss & Sen thông minh, CTA trải nghiệm & tải app, Badge "Hẹn hò dắt dạo" (Bỏ hoàn toàn SOS 3km & Sổ tiêm Safe Pet bắt buộc) | 3 Phone Mockups thực tế |
| **03** | **Core Features Showcase** | 4 Thẻ tính năng Bento Box:<br>1. Mạng xã hội khoảnh khắc Facebook/Instagram<br>2. Pawty Dating (kết nối người nuôi pet với thẻ lật 2 mặt Sen & Boss)<br>3. Bảng tin đăng bài tìm Boss lạc quanh bạn (Không dùng từ cứu hộ khẩn cấp)<br>4. Hồ sơ thú cưng tự khai báo tiêm phòng | Bento Grid bo tròn |
| **04** | **Interactive Dating Preview (Thẻ 2 Mặt Sen & Boss)** | **Thẻ lật 3D hai mặt (Flip Card) & Tương tác Pet đa tầng:**<br>- **Mặt trước:** Thông tin chủ nuôi (ảnh chân dung, tên, tuổi, khu vực sống, bio, mục đích kết nối).<br>- **Mặt sau:** Thông tin Boss nuôi (ảnh cún/mèo, tên, giống, tuổi, tích "Đã tiêm phòng", thói quen khi dạo).<br>- **Ấn vào thẻ:** Quay thẻ 180° giữa Mặt trước (Chủ nuôi) và Mặt sau (Boss).<br>- **2 nút mũi tên sang trái/phải (`<` và `>`):** Duyệt qua **tất cả các Boss của người chủ đó** (Bé 1/2, Bé 2/2...).<br>- **2 nút hành động ở dưới thẻ:**<br>&nbsp;&nbsp;1. Nút bên trái: **"Xem người khác"** (Chuyển sang người chủ tiếp theo).<br>&nbsp;&nbsp;2. Nút bên phải: **"❤️ Gửi lời mời dắt dạo"** (Thả tim gửi lời mời kết nối).<br>- Tiêu đề tinh gọn, gỡ bỏ đoạn văn mô tả thừa. | Framer Motion 3D Flip Card |
| **05** | **Free Ecosystem Section** | Cam kết miễn phí 100% trọn đời: Card 1 Mạng xã hội & Pawty Dating; Card 2 Bảng tin đăng bài tìm Boss lạc cộng đồng | Không gói cước, không cứu hộ |
| **06** | **Community Testimonials** | Đánh giá chân thực từ những người nuôi thú cưng tại TP.HCM, Hà Nội... | Trích dẫn chủ nuôi đô thị |
| **07** | **FAQ Accordion** | Giải đáp thắc mắc: Mô hình kết nối người nuôi pet, thẻ 2 mặt Sen & Boss, duyệt pet qua nút trái/phải, tự khai báo tiêm phòng, cách đăng bài tìm Boss lạc | Accordion cute |
| **08** | **App Download & QR CTA** | Banner kêu gọi tải ứng dụng đa nền tảng (iOS, Android), mở camera chụp mã QR tải app | Banner Gradient ấm áp |
| **09** | **Footer & Legal Documents** | Bản quyền Pawty, liên hệ, Bộ 3 trang quy chế (Bảo mật vị trí, Điều khoản sử dụng, Quy tắc ứng xử cộng đồng) | Modal pháp lý |
