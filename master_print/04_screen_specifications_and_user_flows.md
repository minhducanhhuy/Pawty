# MASTER PRINT — TẦNG 4: SCREEN SPECIFICATIONS & USER FLOWS

> **Single Source of Truth (SSOT)** — Đồng bộ với `plan/03_user_flows_and_screens.md`.

---

## 1. Cấu Trúc Điều Hướng Chính (5 Bottom Tabs)
1. **🏠 Hôm nay (`Today`):**
   - Lời chào cá nhân hóa theo Boss đang chọn + Tổng quan số việc trong ngày.
   - **Việc cần làm (Care Tasks):** Checkbox hoàn thành (bắn hạt pháo hoa nhẹ), người phụ trách trong Circle, giờ hẹn, thêm ghi chú/ảnh xác nhận.
   - **Lịch hẹn sắp tới (Upcoming Bookings & Walk Appointments):** Grooming/Vet sắp tới, kèo hẹn dắt dạo chờ xác nhận.
   - **Hoạt động Vòng chăm sóc (Circle Activity Timeline):** Real-time log ai-làm-gì-khi-nào + Nút quản lý/mời thành viên Circle & Ghi chú bàn giao.
2. **🔍 Khám phá (`Explore`):**
   - Thanh tìm kiếm + Segmented Tabs:
     - **Feed:** Pet Social Feed (PawRank), bộ lọc Content Type, 5 cảm xúc Paw Reaction (`🐾`, `😍`, `😂`, `😟`, `💡`), bình luận 1 cấp (Expert badge xanh mint ưu tiên đầu), cảnh báo sức khỏe `⚕️`, thẻ Tài trợ Native Ads, banner SOS khẩn cấp.
     - **Khám phá / Trending:** Hashtag thông minh (`#GoldenRetriever`, `#MèoAnh`, `#BossNghịch`), bộ lọc loài Chó/Mèo/Gần bạn, Mẹo chuyên gia hôm nay.
     - **Nhóm (Groups):** Nhóm theo khu vực, giống, nhu cầu, hoạt động; tham gia và thảo luận.
     - **Hỏi đáp (Q&A):** Đặt câu hỏi sức khỏe/huấn luyện, câu trả lời từ Bác sĩ thú y/Trainer có badge xác minh.
     - **Dịch vụ & Địa điểm (Services & Places):** Danh sách đối tác xác minh (Spa, Phòng khám, Pet Cafe, Công viên), đặt lịch 4 bước, xem đánh giá thật.
     - **Radar:** Quét tìm bạn dắt dạo theo bán kính 500m–3km, bộ lọc tiêm chủng an toàn (`Safe Pet`), quẹt thẻ & Match Celebration Modal.
3. **➕ Tạo mới (`Create` Bottom Sheet):**
   - 5 lối tắt hành động nhanh:
     1. 📸 **Đăng khoảnh khắc** (Moment / Tip / Review)
     2. 📋 **Tạo việc chăm sóc** (Giao việc cho mình hoặc thành viên Circle)
     3. 🤝 **Gửi yêu cầu kết nối / Bàn giao chăm sóc**
     4. 📅 **Đặt dịch vụ** (Grooming, Khám định kỳ)
     5. ❓ **Đặt câu hỏi cộng đồng** (Q&A)
4. **💬 Chat (`Messages`):**
   - Danh sách hội thoại: Circle gia đình, Bạn dắt dạo (Matches), Nhóm cộng đồng, Đối tác dịch vụ.
   - Phòng chat real-time: Tin nhắn văn bản/ảnh/ghi âm, **Nút Hẹn Dắt Dạo (Walk Appointment)** tự động tính trung điểm 2 vị trí gợi ý 3 địa điểm Pet-Friendly, Bong bóng hẹn tương tác (`Chấp nhận` / `Đổi giờ` / `Báo bùng kèo`), và Thẻ bàn giao chăm sóc (`Care Handover`).
5. **👤 Tôi (`Profile`):**
   - **Public Pet Profile 2 Tab:**
     - **Tab 1 — Khoảnh khắc:** Lưới 3 cột Instagram-style hiển thị ảnh/video của Boss.
     - **Tab 2 — Hồ sơ (Bio & Care Info):** Card Xanh Mint chứng nhận tiêm phòng (`Vắc-xin 7 bệnh`, `Phòng dại`), thông tin cơ bản, biểu đồ cân nặng, Chips **Thói quen tốt** & **Cần lưu ý** (phòng tránh cắn nhau), thông tin Bác sĩ thú y.
   - Quản lý nhiều Boss (Boss Switcher), Vòng chăm sóc (My Circle), Lịch chăm sóc tháng (Care Calendar), Lịch sử dịch vụ (Service History), Đã lưu (Bookmarks theo folder), Gói Sen VIP, SOS Tìm Boss Lạc, và Trung tâm Quyền riêng tư & Dữ liệu (Xuất JSON/Xóa tài khoản theo Luật BVDLCN).

---

## 2. Đặc Tả Kiến Trúc Mobile Native (`apps/mobile` — Expo Go)
- **Hiệu năng Cuộn & Render (`mobile-performance.md`):**
  - Sử dụng `FlatList` kết hợp `React.memo`, `useCallback` và `keyExtractor` cho danh sách bài viết (`Pet Social Feed`), công việc (`Care Tasks`), hội thoại (`Conversations`), và đối tác (`Partners`).
- **Tâm lý Chạm & Vùng Ngón Cái (`touch-psychology.md`):**
  - Mọi nút bấm tương tác chính có kích thước chạm tối thiểu `48x48dp`.
  - Thanh điều hướng 5 tab cố định ở đáy màn hình kèm nút nổi trung tâm `➕ Tạo mới` (`#FF6F61`).
- **Đầy đủ luồng 5 Lớp trên Thiết Bị Thật:**
  - Hỗ trợ chuyển đổi nhanh giữa **Luồng Onboarding 4 bước** và **Ứng dụng chính 5 Tab**, đồng bộ dữ liệu thời gian thực với `http://<LAN_IP>:3000/api/*`.

