---
trigger: always_on
description: PET SAFETY & COMMUNITY PRIVACY (An Toàn Thú Cưng & Bảo Mật Cộng Đồng)
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
