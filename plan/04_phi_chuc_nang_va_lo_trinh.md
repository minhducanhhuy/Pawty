# 04. YÊU CẦU PHI CHỨC NĂNG (NFR), LỘ TRÌNH & QUẢN TRỊ RỦI RO

## PHẦN A – YÊU CẦU PHI CHỨC NĂNG (NON-FUNCTIONAL REQUIREMENTS)

### A1. Hiệu Năng & Trải Nghiệm Cử Chỉ (Gesture Performance)
- **Tinder PanResponder Drag & Swipe:** Hoạt cảnh xoay và quẹt thẻ đạt **60 FPS** mượt mà trên cả iOS và Android.
- **Socket.io Realtime Chat Latency:** Độ trễ nhận tin nhắn 2 chiều giữa 2 thiết bị < 200ms.
- **Khởi động ứng dụng (Cold start):** < 2.0s, hiển thị Logo mở đầu mượt mà.

### A2. Nguyên Tắc Dữ Liệu Thật (Zero Mock Data Policy)
- **Không cài cắm người dùng giả hoặc thú cưng ảo** tự động vào tài khoản của người dùng.
- Khi người dùng đăng ký mới: Trạng thái bắt đầu hoàn toàn sạch sẽ (Clean Slate).
- Khi chưa có người dùng nào khác trong bán kính quét: Hiển thị Empty State rõ ràng kèm nút mở rộng bán kính hoặc chia sẻ mời bạn bè tham gia.

### A3. Bảo Mật & Quyền Riêng Tư (Privacy by Design)
- **Bảo vệ quyền riêng tư vị trí:** Chỉ hiển thị khoảng cách tương đối (vd: *Cách bạn 280m*) và tên cụm chung cư. Tuyệt đối không lưu hay hiển thị số toà, số tầng hay số phòng căn hộ.
- **Tuân thủ Nghị định 13/2023/NĐ-CP:** Cho phép người dùng tải về dữ liệu cá nhân và yêu cầu xoá tài khoản vĩnh viễn bất kỳ lúc nào.

---

## PHẦN B – LỘ TRÌNH TRIỂN KHAI THỰC TẾ

| Giai đoạn | Thời gian | Trọng tâm |
|---|---|---|
| **Phase 1: MVP Core** | Tháng 1 – 3 | Profile kép (Chủ + Boss), Phân loại Mục đích (Hẹn hò / Đi dạo / Playdate), Quẹt thẻ Tinder thật, Socket chat thật 2 chiều, SOS tìm cún lạc 39k, Gói VIP 49k. |
| **Phase 2: Pilot Cụm Chung Cư** | Tháng 3 – 5 | Pilot tại Vinhomes Central Park & Masteri Thảo Điền, sự kiện dắt dạo đôi cuối tuần, tích hợp voucher Pet Cafe đối tác điểm hẹn. |
| **Phase 3: Mở Rộng TP.HCM & Hà Nội** | Tháng 5 – 12 | Scale 50.000 MAU, B2B Partner Portal cho các chuỗi Pet Cafe/Spa/Phòng khám. |
| **Phase 4: Mở Rộng Đông Nam Á** | Năm 2 – 4 | Thái Lan, Indonesia, Philippines với cùng playbook Hyperlocal Pet Lovers Network. |
