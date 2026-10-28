# 03. DANH SÁCH CHỨC NĂNG (FUNCTIONAL REQUIREMENTS)

Ký hiệu: **P0** = bắt buộc MVP · **P1** = ngay sau MVP · **P2** = mở rộng · **P3** = tầm nhìn dài hạn.
Trạng thái: ✅ đã có trong master_print · 🆕 đề xuất mới (cần cập nhật `master_print/` trước khi code).

---

## A. CHỨC NĂNG CORE

### A1. Xác thực & Onboarding (Core 1)
| ID | Chức năng | P | Trạng thái |
|---|---|---|---|
| A1.1 | Đăng ký/đăng nhập SĐT + OTP (Firebase Auth) | P0 | ✅ |
| A1.2 | Đăng nhập Apple/Google (bổ trợ, vẫn bắt buộc xác thực SĐT) | P1 | 🆕 |
| A1.3 | Tạo profile Chủ nuôi (tên, ảnh, tên toà nhà – ẩn số phòng) | P0 | ✅ |
| A1.4 | Tạo profile Boss: loài, giống, tuổi, giới tính, cân nặng, triệt sản | P0 | ✅ |
| A1.5 | Tag tính cách (Chips), thói quen tốt/cần lưu ý | P0 | ✅ |
| A1.6 | Sổ tiêm điện tử: upload ảnh sổ, loại vắc-xin, ngày tiêm, ngày tái chủng | P0 | ✅ |
| A1.7 | Xác minh sổ tiêm (duyệt thủ công/AI OCR) → huy hiệu Safe Pet | P1 | 🆕 |
| A1.8 | Hỗ trợ nhiều Boss/tài khoản | P1 | 🆕 |
| A1.9 | Xác minh khuôn mặt chủ nuôi (selfie liveness) chống nick ảo | P2 | 🆕 |

### A2. Radar & Quẹt thẻ (Core 2)
| ID | Chức năng | P | Trạng thái |
|---|---|---|---|
| A2.1 | Radar PostGIS bán kính 500m–3km (`ST_DWithin`) | P0 | ✅ |
| A2.2 | Quẹt trái/phải, Like/Pass, giới hạn 20 lượt/ngày | P0 | ✅ |
| A2.3 | Match 2 chiều + Confetti + FCM push | P0 | ✅ |
| A2.4 | Bộ lọc: loài, size, độ tuổi, tính cách, chỉ Safe Pet | P0 | ✅ |
| A2.5 | Super Like, Rewind, Boost 30 phút | P1 | 🆕 |
| A2.6 | Native Ads card xen kẽ mỗi 5–7 thẻ | P1 | ✅ |
| A2.7 | Chế độ "Dắt dạo ngay" (Walk Now): bật trạng thái đang dắt dạo, hiện trên bản đồ live 30 phút | P1 | 🆕 |
| A2.8 | Bản đồ nhiệt (heatmap) khu dắt dạo đông | P2 | 🆕 |
| A2.9 | Thuật toán gợi ý theo độ tương thích (size, năng lượng, lịch dạo) | P2 | 🆕 |

### A3. Trang cá nhân 2 tab (Core 3)
| ID | Chức năng | P | Trạng thái |
|---|---|---|---|
| A3.1 | Tab "Khoảnh khắc": lưới 3 cột, đăng ảnh/video, thả tim | P0 | ✅ |
| A3.2 | Tab "Tiểu sử chuyên sâu": sổ tiêm, thói quen, tính cách | P0 | ✅ |
| A3.3 | Bình luận, chia sẻ khoảnh khắc ra mạng xã hội kèm watermark | P1 | 🆕 |
| A3.4 | Feed khoảnh khắc khu vực (Pawty Feed) | P1 | 🆕 |
| A3.5 | Huy hiệu & thành tích (Boss Siêng dạo, Chiến thần xã hội...) | P1 | 🆕 |
| A3.6 | Story 24h | P2 | 🆕 |

### A4. Chat & Hẹn dạo (Core 4)
| ID | Chức năng | P | Trạng thái |
|---|---|---|---|
| A4.1 | Chat realtime (Socket.io), ảnh, trạng thái đã đọc | P0 | ✅ |
| A4.2 | Hẹn dạo: tính trung điểm + 3 địa điểm pet-friendly | P0 | ✅ |
| A4.3 | Bong bóng hẹn tương tác (đồng ý/đổi giờ/huỷ) | P0 | ✅ |
| A4.4 | Báo cáo bùng kèo + khoá quẹt 3 ngày | P0 | ✅ |
| A4.5 | Check-in tại điểm hẹn (GPS) xác nhận đã gặp | P1 | 🆕 |
| A4.6 | Gợi ý mở đầu chat (icebreaker) bằng AI | P1 | 🆕 |
| A4.7 | Chia sẻ vị trí live trong lúc hẹn (an toàn) | P1 | 🆕 |
| A4.8 | Voice note, sticker Boss | P2 | 🆕 |

### A5. Doanh thu cốt lõi
| ID | Chức năng | P | Trạng thái |
|---|---|---|---|
| A5.1 | SOS tìm Boss lạc (VietQR 39k, push 3km) | P0 | ✅ |
| A5.2 | Gói Sen VIP (VietQR + IAP Apple/Google) | P0 | ✅ |
| A5.3 | Quản lý voucher Native Ads (ví voucher của user) | P1 | ✅ |
| A5.4 | Cổng quản trị đối tác (đăng quảng cáo, xem báo cáo) | P1 | 🆕 |

---

## B. CHỨC NĂNG PHỤ (SECONDARY)

### B1. Cộng đồng & Social
- Nhóm/CLB theo giống (Corgi Club, Poodle Club) & theo toà nhà – **P1**
- Sự kiện cộng đồng (Pawty Day, dạo tập thể), RSVP, nhắc lịch – **P1**
- Bảng tin cộng đồng khu vực, Q&A (hỏi đáp chăm sóc) – **P2**
- Cuộc thi "Boss của tháng" – bình chọn, giải thưởng tài trợ – **P2**
- Hệ thống follow (không cần match) – **P2**

### B2. Sức khoẻ & Chăm sóc (Pawty Health)
- Nhắc lịch tiêm phòng, tẩy giun, tái chủng (push) – **P1**
- Nhật ký cân nặng, bữa ăn, thuốc – **P2**
- Tìm phòng khám thú y gần, đặt lịch – **P2**
- Chatbot AI tư vấn sơ bộ (không thay thế bác sĩ, có disclaimer) – **P2**
- Tele-vet trả phí – **P3**
- Hồ sơ y tế xuất PDF/chia sẻ QR cho khách sạn thú cưng – **P2**

### B3. Dịch vụ & Thương mại
- Bản đồ Pet-Friendly Places (cafe, công viên, spa...) + review – **P1**
- Marketplace: dắt chó thuê, pet sitter, grooming tại nhà, huấn luyện – **P2**
- Booking Pet Hotel/Spa, thanh toán trong app – **P2**
- Shop/affiliate thức ăn, phụ kiện – **P3**
- Bảo hiểm thú cưng (đối tác) – **P3**
- Nhận nuôi (Adopt) & liên kết trạm cứu hộ, quyên góp – **P2**
- Ghép đôi giống (breeding) có kiểm duyệt đạo đức – **P3** *(cần chính sách chặt, tránh buôn bán trái phép)*

### B4. Gamification & Giữ chân
- Streak dắt dạo mỗi ngày, bước chân/km (GPS) cho Boss – **P1**
- Điểm "Paw Points" đổi voucher đối tác – **P2**
- Nhiệm vụ tuần, bảng xếp hạng khu vực – **P2**
- Referral & mã giới thiệu – **P1**
- Sinh nhật Boss: thiệp tự động + ưu đãi – **P2**

### B5. Thông báo & Cá nhân hoá
- Push đa loại: match, tin nhắn, hẹn dạo, SOS, nhắc tiêm, sự kiện – **P0/P1**
- Trung tâm thông báo trong app, tuỳ chọn tắt/bật theo loại – **P1**
- Đa ngôn ngữ (VI, EN → TH, ID) – **P1**
- Dark mode – **P2**

### B6. Cài đặt & An toàn người dùng
- Chặn, báo cáo, ẩn hồ sơ, chế độ ẩn danh vị trí – **P0**
- Quản lý quyền riêng tư (ai thấy vị trí, khoảng cách) – **P0**
- Xoá tài khoản + xuất dữ liệu (tuân thủ luật) – **P1**
- Trung tâm trợ giúp, chat hỗ trợ – **P1**

### B7. Admin & Vận hành (Back-office)
- Dashboard KPI (DAU/MAU, doanh thu, retention) – **P0**
- Duyệt sổ tiêm, ảnh vi phạm, báo cáo người dùng – **P0**
- Quản lý SOS, VIP, giao dịch (đối soát VietQR/webhook) – **P0**
- Quản lý Native Ads, đối tác, hợp đồng – **P1**
- Công cụ moderation tự động (AI nhận diện ảnh nhạy cảm/bạo hành thú) – **P1**
- Feature flag, A/B testing – **P1**
- CRM & Campaign push/email – **P2**

### B8. Dành cho Đối tác (B2B Portal)
- Đăng ký cửa hàng, xác minh – **P1**
- Tạo voucher/chiến dịch, targeting bán kính – **P1**
- Báo cáo lượt xem/click/redeem – **P1**
- Công cụ đặt lịch & CRM khách hàng cho spa/thú y – **P3**
