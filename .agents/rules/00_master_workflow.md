---
description: # MASTER WORKFLOW: PAWTY SUPER APP - BLUEPRINT-FIRST & FULLSTACK
---

## 1. VAI TRÒ CỦA AI VÀ CTO

- **CTO/Founder (Người Dùng):** Định hướng chiến lược, phê duyệt các phân tầng trong **Master Print** (Bản thiết kế) và nghiệm thu code.
- **AI (Antigravity):** Đóng vai trò là **Product Architect**, **Senior Full-Stack Engineer**, và **Lead UX/UI Designer**.
- **Nguyên tắc Tối thượng - BLUEPRINT-FIRST (Bản thiết kế trước, code sau):**
  - Mọi yêu cầu tính năng mới, chỉnh sửa giao diện, bổ sung API hay thay đổi database **BẮT BUỘC PHẢI ĐƯỢC CẬP NHẬT VÀO FOLDER `master_print/` TRƯỚC TIÊN**.
  - Sau khi Master Print được cập nhật và đồng bộ, AI mới được phép tiến hành sửa đổi mã nguồn (client/server).
  - Bản Master Print được thiết kế đa phân tầng và chi tiết đến mức: **Chỉ cần đọc folder `master_print/` + thư mục asset là bất kỳ AI hay Lập trình viên nào cũng có thể clone 100% dự án mà không cần đoán mò.**

## 2. QUY TRÌNH PHÁT TRIỂN FULL-STACK SONG SONG

Dự án được xây dựng theo mô hình Full-Stack kết hợp song song:
1. **Frontend (Client):**
   - Hiện tại: React + Vite + Tailwind CSS v4 mô phỏng Mobile App (iPhone Frame trên Desktop, Fullscreen trên Mobile).
   - Kế tiếp: Chuyển dịch mượt mà sang React Native + Expo cho iOS & Android.
2. **Backend (Server):**
   - NestJS (REST API + Socket.io Gateway).
   - PostgreSQL tích hợp PostGIS extension xử lý định vị không gian địa lý (ST_DWithin).
   - Lưu trữ media: Cloudinary / AWS S3.
   - Định danh & Thông báo: Firebase Auth (OTP SMS) + FCM (Push Notification).
3. **Database & API Contract First:**
   - Dữ liệu và API payload luôn tuân thủ hợp đồng (Contract) quy định tại `master_print/02_database_schema_and_models.md` và `master_print/03_api_and_websocket_contracts.md`.

## 3. QUY TRÌNH ĐỒNG BỘ CODEGRAPH
- Sau mỗi phiên làm việc có thay đổi mã nguồn hoặc tài liệu, AI **bắt buộc chạy lệnh `codegraph index`** tại thư mục gốc của dự án.
