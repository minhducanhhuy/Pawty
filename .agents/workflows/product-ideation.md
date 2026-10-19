---
name: product-ideation
description: The workflow for generating product ideas and transforming them into comprehensive User Stories through a debate between the Customer and BA agents.
---

# Source Code Factory Workflow

**Mục tiêu:** Quy trình "Nhà máy sản xuất Code" (Source Code Factory) đi từ bước lên ý tưởng đến khi đóng gói hoàn thiện một sản phẩm (website, native app, mobile app) để **trưng bày và bán Source Code**.

## Các giai đoạn (Phases & Steps)

### PHASE 1: IDEATION & DESIGN (Lên ý tưởng & Chốt thiết kế)
Sự phối hợp và tranh luận liên tục giữa 2 vai trò AI: **Customer** (Khách hàng) và **BA** (Business Analyst).

* **Step 1: Khởi tạo Ý tưởng (Customer):** Đưa ra ý tưởng đột phá, mang tính thương mại cao (dễ bán source code, dễ tuỳ biến white-label).
* **Step 2: Phân tích & Phản biện (BA):** Đặt câu hỏi hóc búa về tính khả thi, luồng người dùng, và các tiêu chí cố định (Fixed Criteria).
* **Step 3: Thảo luận & Làm rõ (Customer):** Bảo vệ ý tưởng, bổ sung chi tiết về UI/UX.
*(Vòng lặp Step 2 & 3 tiếp tục cho đến khi đạt "Tiêu chí cố định" của BA).*
* **Step 4: Chốt bản thiết kế (BA):** Output danh sách User Story hoàn chỉnh, Epic List, Acceptance Criteria, và thông số cấu hình White-label.

### PHASE 2: IMPLEMENTATION (Xây dựng & Lập trình)
* **Step 5: Code & Build (Developer/App Builder Agent):** 
  - Tiếp nhận bản thiết kế từ BA.
  - Lập trình dự án theo chuẩn Clean Code, áp dụng kiến trúc Modular hoặc Polymorphic để khách hàng tương lai dễ dàng custom (tuỳ biến theme, layout).
  - Hoàn thiện 100% các tính năng theo User Story.

### PHASE 3: QUALITY ASSURANCE (Kiểm thử & Sửa lỗi)
* **Step 6: Testing & Bug Fixing (QA & Debugger Agent):**
  - Thực hiện kiểm test (Unit Test, E2E Test, Manual QA check).
  - Đóng vai "người mua code" để tự setup và tìm lỗi.
  - Fix lại ngay lập tức những lỗi logic, UI vỡ, hoặc các tính năng chưa bám sát bản thiết kế ban đầu.

### PHASE 4: PACKAGING & SHOWCASING (Đóng gói & Trưng bày bán)
* **Step 7: Packaging (Documentation & DevOps Agent):**
  - Viết tài liệu `README.md` cực kỳ hấp dẫn, hướng dẫn cài đặt từ A-Z.
  - Tạo các kịch bản Seed Data (dữ liệu mẫu) với tài khoản Demo (Admin, User) đầy đủ.
  - Đóng gói file config `.env`, Docker (nếu có) để người mua chỉ cần "1-click run".
* **Step 8: Showcasing:** Chụp ảnh màn hình (hoặc gen UI), viết bài PR (Product Requirements/Marketing) để sẵn sàng đăng lên các platform bán source code. Đảm bảo UI/UX "wow" nhất có thể.
