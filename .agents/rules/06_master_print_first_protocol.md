---
trigger: always_on
description: MASTER PRINT FIRST PROTOCOL (Quy tắc Bản Thiết Kế Nguồn Trước Tiên)
---

# MASTER PRINT FIRST PROTOCOL (Bản Thiết Kế Trước - Code Sau)

Thư mục `master_print/` là **Nguồn Chân Lý Duy Nhất (Single Source of Truth - SSOT)** của toàn bộ dự án Pawty.

## 1. QUY TẮC BẮT BUỘC KHI CÓ PROMPT YÊU CẦU MỚI HOẶC CHỈNH SỬA
Khi Người Dùng (CTO) gửi bất kỳ yêu cầu nào (sửa giao diện, thêm tính năng, đổi logic quẹt thẻ, cấu trúc database, logic socket, v.v.):
1. **Bước 1 (Check & Edit Master Print):** AI mở file tương ứng trong `master_print/` và cập nhật thông số, giao diện, bảng database, hoặc API payload trước.
2. **Bước 2 (Confirm Alignment):** Kiểm tra xem thay đổi có xung đột với các phân tầng khác không.
3. **Bước 3 (Implement Code):** Áp dụng thay đổi vào mã nguồn thực tế (Frontend Client / Backend Server).
4. **Bước 4 (Re-index Codegraph):** Chạy `codegraph index` để cập nhật đồ thị mã nguồn.

## 2. TIÊU CHUẨN CỦA BẢN THIẾT KẾ MASTER PRINT
Bản thiết kế được phân tầng chặt chẽ thành 6 tầng tài liệu:
- **Tầng 0 (`00_overview_and_brand_system.md`):** Sứ mệnh, đối tượng mục tiêu (DINK & Độc thân chung cư), Bộ nhận diện thương hiệu, Bảng màu (`#FF6F61`, `#A3E4D7`, `#FDFBF7`), Typography, Design Tokens, Asset Map.
- **Tầng 1 (`01_system_architecture_and_tech_stack.md`):** Kiến trúc hệ thống Full-Stack, Cấu trúc thư mục Monorepo, Luồng luân chuyển dữ liệu từ Client đến NestJS, PostgreSQL PostGIS, Socket.io, Firebase, Cloudinary.
- **Tầng 2 (`02_database_schema_and_models.md`):** Thiết kế chi tiết từng bảng Database PostgreSQL + PostGIS (Users, Pets, Pet_Moments, Matches, Messages, Walk_Appointments, Sos_Alerts, Native_Ads), quan hệ khóa ngoại (Foreign Keys), Indexing không gian.
- **Tầng 3 (`03_api_and_websocket_contracts.md`):** Đặc tả chi tiết từng Endpoint REST API (Request body, Response JSON) và Socket.io Gateway Events (Event names, payload data).
- **Tầng 4 (`04_screen_specifications_and_user_flows.md`):** Đặc tả giao diện chi tiết từng màn hình (Screen breakdown, State, Micro-interactions, Components hierarchy).
- **Tầng 5 (`05_monetization_and_business_rules.md`):** Toàn bộ quy tắc kinh tế & nghiệp vụ: SOS tìm Boss lạc (39k VietQR, bán kính 3km), Gói VIP (49k/tháng), Native Ads (-35% voucher), Cơ chế phạt bùng kèo hẹn dắt cún.

## 3. KHẢ NĂNG CLONE 100% CỦA MASTER PRINT
Bất kỳ một AI Agent nào khác hoặc Lập trình viên mới khi tiếp quản dự án, **chỉ cần đọc thư mục `master_print/` kèm thư mục `public/assets/` là có đủ 100% dữ liệu để dựng lại toàn bộ ứng dụng từ đầu** mà không cần phải đặt bất kỳ câu hỏi nào.
