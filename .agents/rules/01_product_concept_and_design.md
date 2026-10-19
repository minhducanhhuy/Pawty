---
trigger: always_on
description: PRODUCT CONCEPT & UX/UI DESIGN (Pawty Super App)
---

# PRODUCT CONCEPT & UX/UI DESIGN (Pawty Super App)

Dự án **Pawty** là Siêu Ứng Dụng (Super App) kết nối cộng đồng nuôi thú cưng tại chung cư/đô thị (khách hàng mục tiêu: DINK & Độc thân, Gen Z & Millennials tại TP.HCM, Hà Nội), giúp giải tỏa sự cô đơn, bí bách cho Boss bằng cách tìm bạn đi dạo chung, đồng thời lưu trữ những "khoảnh khắc bựa" hằng ngày.

## 1. ĐỊNH HƯỚNG THƯƠNG HIỆU (Playful Minimalism)
- **Bảng màu chủ đạo:**
  - **Hồng San Hô (`#FF6F61`):** Năng động, ấm áp, thể hiện tình yêu thương và sự gắn kết.
  - **Xanh Mint (`#A3E4D7`):** Tươi mát, an tâm, dùng cho các khu vực chứng nhận an toàn (Safe Pet, Sổ tiêm, Điểm hẹn dạo).
  - **Trắng Kem (`#FDFBF7`):** Nền tảng êm dịu, ấm cúng thay cho màu trắng tinh chói mắt.
- **Typography:** Phông chữ béo tròn, góc dày dặn, thân thiện (`Fredoka` cho Display Headings & `Nunito` cho Body Text).
- **Logo chính thức:**
  - Icon rút gọn: Chữ **P** đội nón tiệc màu xanh mint với dấu chân thú cưng (`/assets/pawty-icon.png`).
  - Full Wordmark: Chữ **Pawty** với chữ 'y' cách điệu đuôi cún vẫy mừng vui nhộn (`/assets/pawty-logo-full.png`).

## 2. 4 TÍNH NĂNG CORE TRỌNG TÂM
1. **Core 1: Onboarding & Sổ Tiêm Điện Tử:** Định danh SĐT chống bùng kèo, tạo profile Boss chi tiết với phân loại cân nặng, thói quen tốt/xấu, và tag tính cách dạng Chips.
2. **Core 2: Radar Quẹt Thẻ PostGIS:** Quét thẻ tìm bạn dắt dạo trong bán kính 500m - 3km; Khớp lệnh Match bắn pháo hoa Confetti và FCM Push Notification tức thì.
3. **Core 3: Trang Cá Nhân 2 Tab:** Tab 1 "Khoảnh khắc" (lưới 3 cột Instagram-style, thả tim) và Tab 2 "Tiểu sử chuyên sâu" (Card Xanh Mint sổ tiêm chủng & thói quen tránh cắn nhau).
4. **Core 4: Chat Real-time & Hẹn Dạo Trung Điểm:** Nhắn tin thời gian thực, nút Hẹn dạo tự tính trung điểm đề xuất 3 địa điểm thân thiện với thú cưng (Pet-Friendly Places), bong bóng hẹn tương tác có cơ chế phạt bùng kèo.

## 3. HỆ THỐNG KÍCH HOẠT KINH TẾ (MONETIZATION)
1. **🚨 SOS Tìm Boss Lạc Khẩn Cấp (Biên LN ~90%):** Thu 39k qua VietQR động -> Bắn Push Notification báo động khẩn cấp trong bán kính 3km.
2. **👑 Gói Sen VIP (Biên LN ~85%):** Thu 49k/tháng qua VietQR -> Quẹt không giới hạn, kho ảnh không giới hạn, vương miện vàng, ưu tiên hiển thị x3.
3. **🎁 Native Ads (-35% Voucher - Biên LN ~70%):** Thẻ quảng cáo bản địa đan xen trong cọc quẹt radar tài trợ bởi Pet Spa, Pet Cafe nội khu.
