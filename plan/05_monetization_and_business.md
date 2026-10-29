# Tầng 5 — Kinh tế & Mô hình Kinh doanh

> Chiến lược kiếm tiền thực tế, có kiểm chứng, phù hợp với hệ sinh thái thú cưng.

---

## 1. Triết lý Monetization

> **"Thu tiền từ giá trị đã chứng minh, không từ hy vọng."**

- Chỉ thu phí khi người dùng hoặc đối tác đã nhận được giá trị thực
- Giữ công cụ chăm sóc cơ bản miễn phí — đây là hook và retention
- Không gây áp lực trả phí để dùng tính năng an toàn
- Minh bạch: ai trả, bao nhiêu, cho cái gì

## 2. Ba Nguồn Thu

### 2.1 Nguồn Thu #1: Phí Dịch vụ Đối tác (Service Commission)

**Ưu tiên #1 — Revenue Engine chính**

| Yếu tố | Chi tiết |
|---|---|
| Mô hình | Phí hoa hồng trên dịch vụ hoàn tất |
| Bên trả | Đối tác (partner) |
| Mức phí | 10-15% giá trị dịch vụ, hoặc 20.000-40.000đ/đơn cố định |
| Điều kiện | Chỉ tính khi dịch vụ hoàn tất + khách confirm |
| Thanh toán | Đối tác thanh toán Pawty theo tháng |

**Ví dụ tính toán:**
```
100 booking/tháng × 300.000đ trung bình × 12% commission
= 3.600.000đ doanh thu Pawty/tháng

Chi phí biến đổi:
- Hỗ trợ khách: ~15.000đ/đơn × 100 = 1.500.000đ
- Hệ thống: ~500.000đ/tháng
- Tổng chi phí: 2.000.000đ

Lợi nhuận gộp: 1.600.000đ (chưa tính công sáng lập)
```

> [!WARNING]
> Mô hình không bền vững nếu công vận hành trên mỗi đơn > commission. Phải đo `phút xử lý/đơn` và tự động hóa dần.

---

### 2.2 Nguồn Thu #2: Gói Sen VIP (Premium Subscription)

**Ưu tiên #2 — Recurring Revenue**

| Tính năng | Free | Sen VIP (49.000đ/tháng) |
|---|---|---|
| Hồ sơ thú cưng | 2 Boss | Không giới hạn |
| Lịch & nhắc việc | ✅ | ✅ |
| Circle members | 3 người | Không giới hạn |
| Giao việc & xác nhận | ✅ | ✅ |
| Đăng moments | 5/tuần | Không giới hạn |
| Kho ảnh | 100 ảnh | Không giới hạn |
| Radar quẹt thẻ | 10 lượt/ngày | Không giới hạn |
| Ưu tiên hiển thị | - | ×3 trong Radar |
| Badge VIP | - | 👑 Vương miện vàng |
| Bản tổng hợp chăm sóc | - | Báo cáo tuần/tháng |
| Xuất PDF sổ tiêm | - | ✅ |
| Dịch vụ ưu tiên | - | Đặt lịch trước |

**Pricing Strategy:**
```
29.000đ/tháng — Gói Cơ bản (Circle mở rộng + kho ảnh)
49.000đ/tháng — Gói Sen VIP (full features)
399.000đ/năm  — Gói Sen VIP Năm (tiết kiệm 32%)
```

**Thanh toán:** VietQR động (ngân hàng) hoặc App Store/Google Play IAP khi ra mobile.

---

### 2.3 Nguồn Thu #3: Native Ads — Nội dung Đối tác

**Ưu tiên #3 — Chỉ khi đã có traffic thật**

| Yếu tố | Chi tiết |
|---|---|
| Format | Card tài trợ đan xen trong Feed (ghi rõ "Tài trợ") |
| Nguồn | Chỉ đối tác đã xác minh (pet spa, café, shop) |
| Nội dung | Pet-related only — ưu đãi, sự kiện, sản phẩm mới |
| Giá | 200.000-500.000đ/bài/tuần (CPM cho khu vực mục tiêu) |
| Tần suất | Max 1 sponsored post mỗi 10 organic posts |
| Quy định | Ghi rõ "Tài trợ", không giả dạng nội dung cá nhân |

**Ví dụ Native Ad:**
```
┌────────────────────────────┐
│ 🎯 TÀI TRỢ · PetSpa ABC   │
│                            │
│ [Ảnh đẹp Boss sau grooming]│
│                            │
│ 🎁 Giảm 20% Combo Tắm     │
│ + Cắt lông cho Boss mới!  │
│                            │
│ 📍 Q9 · ⭐ 4.8 (156 đánh giá)│
│ [Đặt lịch ngay]           │
└────────────────────────────┘
```

## 3. Nguồn Thu Tương lai (Post-Validation)

| Nguồn | Điều kiện mở | Giá ước tính |
|---|---|---|
| **Pawty Pro** (SaaS đối tác) | ≥20 đối tác active | 199.000-499.000đ/tháng |
| **SOS Tìm Boss Lạc** | Có mật độ đủ trong khu | 39.000đ/lần (VietQR) |
| **Hàng hóa/Shop** | Sau khi có trust + volume | Phí sàn 5-10% |
| **Bảo hiểm thú cưng** | Có đối tác bảo hiểm | Hoa hồng giới thiệu |

> [!IMPORTANT]
> **Hoãn hoàn toàn:** Ví tiền, điểm thưởng phức tạp, sàn mua bán động vật, thiết bị IoT, AI chẩn đoán. Không giúp kiểm chứng nhanh hơn.

## 4. Cơ chế SOS Tìm Boss Lạc 🚨

> Tính năng mở sau khi có mật độ cộng đồng đủ trong khu vực.

**Luồng:**
1. Chủ nuôi kích hoạt SOS → Nhập thông tin Boss lạc + ảnh
2. Thanh toán 39.000đ qua VietQR
3. Push notification khẩn cấp tới tất cả user trong bán kính 3km
4. Hiển thị banner SOS trên Feed trong 24h
5. Ai thấy Boss → Tap "Tôi thấy Boss!" + ảnh + vị trí
6. Chủ nuôi nhận thông báo real-time
7. Kết nối chat giữa 2 bên
8. Chủ nuôi xác nhận đã tìm được → SOS kết thúc

**Biên LN ước tính:** ~90% (chi phí gần 0, chủ yếu push notification).

## 5. Cơ chế Phạt & An toàn Kinh tế

### 5.1 Anti-Flake (Chống bùng kèo hẹn dạo)

| Vi phạm | Hậu quả |
|---|---|
| No-show lần 1 | Cảnh báo + giảm ưu tiên radar 24h |
| No-show 2 lần/tuần | Khóa radar 3 ngày |
| No-show 3+ lần/tháng | Khóa radar 7 ngày + review thủ công |

### 5.2 Anti-Fraud (Chống lừa đảo)

- Xác thực SĐT bắt buộc
- Rate limit tạo yêu cầu: 5/ngày (free), 20/ngày (VIP)
- Tài khoản mới: giới hạn tin nhắn 48h đầu
- Report → 3 report = auto-review
- Đối tác bị report nhiều → tạm khóa pending review

## 6. Ước tính Kinh tế Theo Kịch bản

### Kịch bản A: 500 users, 50 bookings/tháng (Tháng 3-6)

```
Doanh thu:
  Booking commission: 50 × 250.000đ × 12% = 1.500.000đ
  VIP subscription: 20 users × 49.000đ = 980.000đ
  Native ads: 2 bài × 300.000đ = 600.000đ
  Tổng: 3.080.000đ

Chi phí:
  Server/infra: 500.000đ
  Hỗ trợ khách: 50 × 10.000đ = 500.000đ
  Content/moderation: 500.000đ
  Tổng: 1.500.000đ

Lợi nhuận gộp: 1.580.000đ (chưa tính công sáng lập)
```

### Kịch bản B: 2000 users, 200 bookings/tháng (Tháng 9-12)

```
Doanh thu:
  Booking commission: 200 × 300.000đ × 12% = 7.200.000đ
  VIP subscription: 100 users × 49.000đ = 4.900.000đ
  Native ads: 8 bài × 400.000đ = 3.200.000đ
  SOS (nếu mở): 5 × 39.000đ = 195.000đ
  Tổng: 15.495.000đ

Chi phí:
  Server/infra: 1.500.000đ
  Hỗ trợ: 200 × 10.000đ = 2.000.000đ
  Content/moderation: 1.000.000đ
  Marketing: 2.000.000đ
  Tổng: 6.500.000đ

Lợi nhuận gộp: 8.995.000đ (chưa tính công sáng lập)
```

> [!NOTE]
> Đây là ước tính giả định. Mỗi biến số phải được thay bằng dữ liệu thực từ vận hành.

## 7. Pricing Principles

1. **Value-first:** Công cụ cơ bản free → chứng minh giá trị → mở gói trả phí
2. **Transparency:** Giá hiển thị rõ, không phí ẩn, không auto-renew mà không thông báo
3. **Fair to Partners:** Commission chỉ tính khi đơn hoàn tất, hoàn tiền nếu dịch vụ kém
4. **Test & Learn:** Mỗi mức giá là giả thuyết — thử 2 tuần, đo willingness-to-pay
5. **No Data Sales:** Không bán dữ liệu cá nhân. Quảng cáo chỉ từ đối tác xác minh, ghi rõ "Tài trợ"

