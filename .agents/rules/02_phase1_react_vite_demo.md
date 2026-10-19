---
trigger: always_on
---

# PHASE 1: REACT + VITE DEMO STANDARDS

Giai đoạn 1 tập trung hoàn toàn vào việc xây dựng bộ Demo hoàn chỉnh về UX/UI bằng công nghệ Web Frontend (React + Vite) để dễ dàng thử nghiệm, lặp lại và duyệt luồng (User flow).

## 1. THIẾT KẾ ĐA NỀN TẢNG (Responsive & Mock Mobile)
- Giao diện phải được code bằng Tailwind CSS.
- Responsive phải chuẩn chỉnh. Vì đây là demo cho Mobile App, cấu trúc khung chính phải bao bọc trong một khối giả lập tỷ lệ màn hình điện thoại (VD: tỷ lệ 9:16) khi xem trên Desktop, và full màn hình khi xem trên Mobile thật.

## 2. GIẢ LẬP TÍNH NĂNG NATIVE (Mocking Native Features)
Vì đang chạy trên nền Web, các tính năng yêu cầu hệ điều hành di động can thiệp sẽ được giả lập (Mocking):
- **Khóa ứng dụng / Khóa màn hình:** Dựng màn hình overlay che toàn bộ nội dung web để mô phỏng tính năng "Khóa app".
- **Thông báo (Push Notification) / Báo thức 10 phút:** Sử dụng `setTimeout` hoặc `setInterval` trên React để đếm ngược giờ và hiển thị Modal popup kèm âm thanh mô phỏng tiếng báo thức.
- **Microphone / Ghi âm:** Sử dụng MediaRecorder API của trình duyệt HTML5 để thu âm tạm thời vào Blob và phát lại, chứng minh luồng ghi âm giọng nói cha mẹ hoạt động mượt mà.

## 3. VÒNG LẶP TEST & FIX (Iterative Loop)
- AI không được vội vàng code backend.
- Phải hoàn thành luồng UI -> Mời CTO test -> Sửa lỗi CSS/Tương tác -> Chốt bản demo cuối cùng trước khi chuyển sang Phase 2.
