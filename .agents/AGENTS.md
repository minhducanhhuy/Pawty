<!-- RULE START: 00_master_workflow.md -->
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
   - PostgreSQL tích hợp PostGIS extension xử lý định vị không gian địa lý (`ST_DWithin`).
   - Lưu trữ media: Cloudinary / AWS S3.
   - Định danh & Thông báo: Firebase Auth (OTP SMS) + FCM (Push Notification).
3. **Database & API Contract First:**
   - Dữ liệu và API payload luôn tuân thủ hợp đồng (Contract) quy định tại `master_print/02_database_schema_and_models.md` và `master_print/03_api_and_websocket_contracts.md`.

## 3. QUY TRÌNH ĐỒNG BỘ CODEGRAPH
- Sau mỗi phiên làm việc có thay đổi mã nguồn hoặc tài liệu, AI **bắt buộc chạy lệnh `codegraph index`** tại thư mục gốc của dự án.
<!-- RULE END: 00_master_workflow.md -->

<!-- RULE START: 06_master_print_first_protocol.md -->
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
- **Tầng 0 (`00_overview_and_brand_system.md`):** Sứ mệnh, đối tượng mục tiêu, Bảng màu (`#FF6F61`, `#A3E4D7`, `#FDFBF7`), Typography, Design Tokens, Asset Map.
- **Tầng 1 (`01_system_architecture_and_tech_stack.md`):** Kiến trúc hệ thống Full-Stack, Monorepo layout, Luồng dữ liệu Client -> NestJS -> PostgreSQL PostGIS -> Socket.io -> Firebase -> Cloudinary.
- **Tầng 2 (`02_database_schema_and_models.md`):** Thiết kế chi tiết từng bảng Database PostgreSQL + PostGIS (Users, Pets, Pet_Moments, Matches, Messages, Walk_Appointments, Sos_Alerts, Native_Ads), quan hệ Foreign Keys, Spatial Indexing.
- **Tầng 3 (`03_api_and_websocket_contracts.md`):** Đặc tả chi tiết từng Endpoint REST API (Request body, Response JSON) và Socket.io Gateway Events (Event names, payload data).
- **Tầng 4 (`04_screen_specifications_and_user_flows.md`):** Đặc tả chi tiết từng màn hình (Screen breakdown, State, Micro-interactions, Components hierarchy).
- **Tầng 5 (`05_monetization_and_business_rules.md`):** Toàn bộ quy tắc kinh tế & nghiệp vụ: SOS tìm Boss lạc (39k VietQR, bán kính 3km), Gói VIP (49k/tháng), Native Ads (-35% voucher), Cơ chế phạt bùng kèo hẹn dắt cún.

## 3. KHẢ NĂNG CLONE 100% CỦA MASTER PRINT
Bất kỳ một AI Agent nào khác hoặc Lập trình viên mới khi tiếp quản dự án, **chỉ cần đọc thư mục `master_print/` kèm thư mục `public/assets/` là có đủ 100% dữ liệu để dựng lại toàn bộ ứng dụng từ đầu** mà không cần phải đặt bất kỳ câu hỏi nào.
<!-- RULE END: 06_master_print_first_protocol.md -->

<!-- RULE START: 01_product_concept_and_design.md -->
---
trigger: always_on
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
<!-- RULE END: 01_product_concept_and_design.md -->

<!-- RULE START: 03_clean_code_architecture_rules.md -->
---
trigger: always_on
---

# CLEAN CODE & MAINTAINABILITY RULES

Mọi đoạn code được sinh ra phải vượt qua các tiêu chuẩn sau trước khi được đề xuất cho CTO:

## 1. NGUYÊN TẮC ĐẶT TÊN (Naming Conventions)
- **Tuyệt đối không dùng tên vô nghĩa:** Không dùng `data1`, `temp`, `handleStuff`.
- **Biến (Variables):** Phải là danh từ mô tả chính xác dữ liệu chứa bên trong (VD: `userProfileSettings`, `activeOrderList`).
- **Hàm (Functions):** Bắt đầu bằng một động từ mạnh, thể hiện rõ hành động (VD: `fetchUserDetails()`, `calculateTotalRevenue()`, `validateInputForm()`).
- **Booleans:** Bắt đầu bằng `is`, `has`, `should` (VD: `isAuthenticated`, `hasError`).

## 2. SINGLE RESPONSIBILITY PRINCIPLE (Nguyên tắc Đơn trách nhiệm)
- Mỗi Function/Component chỉ làm ĐÚNG MỘT VIỆC.
- Nếu một Component UI dài quá 150 dòng hoặc chứa cả logic gọi API phức tạp, AI **bắt buộc** phải chẻ nhỏ nó ra thành các Sub-components hoặc tách logic ra Custom Hooks.

## 3. BÌNH LUẬN & TÀI LIỆU (Comments & Docs)
- **Không giải thích "Code làm gì" (What):** Code sạch tự nó đã nói lên nó làm gì.
- **Chỉ giải thích "Tại sao" (Why):** Bắt buộc phải có comment khi sử dụng một logic phức tạp, một mẹo (hack), hoặc một thuật toán cụ thể.

## 4. ERROR HANDLING (Xử lý lỗi chủ động)
- Không bao giờ để ứng dụng "chết im lặng".
- Mọi API call hoặc logic có rủi ro phải được bọc trong `try...catch`.
- Các lỗi phải được log ra console rõ ràng cho CTO kèm theo thông báo thân thiện cho người dùng cuối.
<!-- RULE END: 03_clean_code_architecture_rules.md -->

<!-- RULE START: 04_pet_safety_and_privacy.md -->
---
trigger: always_on
---

# PET SAFETY & COMMUNITY PRIVACY (An Toàn Thú Cưng & Bảo Mật)

Ứng dụng hướng tới cộng đồng thú cưng tại các khu chung cư cao cấp và đô thị, do đó tiêu chuẩn an toàn cho thú cưng và sự an tâm của chủ nuôi phải đạt mức cao nhất.

## 1. TIÊU CHUẨN AN TOÀN SỨC KHỎE (SAFE PET VACCINATION)
- Mọi Boss hiển thị trên Radar an toàn phải có thông tin xác minh sổ tiêm chủng điện tử (đặc biệt là vắc-xin 7 bệnh và phòng dại).
- Ứng dụng cung cấp bộ lọc an toàn cho phép chủ nuôi chỉ ghép đôi đi dạo với các Boss đã tiêm phòng đầy đủ.

## 2. MINH BẠCH HÀNH VI ĐỂ PHÒNG TRÁNH XUNG ĐỘT (FIGHT PREVENTION)
- Chủ nuôi phải khai báo trung thực các **Thói quen tốt** và **Thói quen cần lưu ý** của Boss (ví dụ: hay sủa xe máy, sợ người lạ, đuổi bồ câu, bảo vệ đồ ăn).
- Thông tin này được hiển thị rõ ràng trên Tab 2 (Tiểu sử chuyên sâu) của Profile trước khi hai bên quyết định gặp mặt dắt dạo, triệt tiêu nguy cơ cắn nhau ngoài công viên.

## 3. ĐỊNH DANH SỐ ĐIỆN THOẠI & CHỐNG BÙNG KÈO (ANTI-FLAKE & ANTI-FRAUD)
- Bắt buộc xác thực SĐT qua OTP (Firebase Auth) để ngăn chặn nick ảo, quấy rối, và lừa đảo.
- **Cơ chế chế tài bùng hẹn:** Nếu một tài khoản bị báo cáo không đến điểm hẹn 2 lần trong 1 tuần, hệ thống sẽ tự động khóa quyền quẹt thẻ của tài khoản đó trong vòng 3 ngày.

## 4. BẢO VỆ QUYỀN RIÊNG TƯ ĐỊA ĐIỂM (LOCATION PRIVACY)
- Không bao giờ hiển thị số phòng hay số tầng căn hộ chính xác của chủ nuôi.
- Chỉ hiển thị tên cụm chung cư (VD: *Vinhomes Central Park - Park 3*) và khoảng cách tương đối (VD: *Cách bạn 280m*).
<!-- RULE END: 04_pet_safety_and_privacy.md -->

<!-- RULE START: codegraph.md -->
---
trigger: always_on
---

- Luôn đọc codegraph để tối ưu việc tìm kiếm, thay vì phải tự đọc thủ công.
- Luôn chạy lại lệnh `codegraph index` ở thư mục dự án mỗi khi hoàn thiện phiên làm việc và có chỉnh sửa mới.
<!-- RULE END: codegraph.md -->
