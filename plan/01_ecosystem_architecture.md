# Tầng 1 — Kiến trúc Hệ sinh thái & 5 Lớp Sản phẩm

> Giả định: Đã có cộng đồng hoạt động. Tập trung xây dựng hệ sinh thái sản phẩm tối ưu.

---

## 1. Tổng quan Hệ sinh thái

Pawty là một ứng dụng duy nhất với 5 lớp tính năng dùng chung tài khoản, hồ sơ thú cưng, quyền chia sẻ và lịch sử tương tác.

```
┌─────────────────────────────────────────────────────────────────┐
│                        PAWTY SUPER APP                         │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              LAYER 5: PAWTY PRO                         │   │
│  │    Công cụ cho đối tác (lịch hẹn, quản lý, phản hồi)   │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              LAYER 4: PAWTY SERVICES                    │   │
│  │    Tìm & đặt dịch vụ từ đối tác đã xác minh            │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              LAYER 3: PAWTY LOCAL                       │   │
│  │    Cộng đồng gần mình + Mạng xã hội thú cưng           │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              LAYER 2: PAWTY CIRCLE                      │   │
│  │    Vòng chăm sóc (gia đình, bạn bè, người tin cậy)     │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              LAYER 1: PAWTY CARE                        │   │
│  │    Hồ sơ thú cưng, lịch, nhắc việc, ghi chú cá nhân   │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              FOUNDATION: Shared Infrastructure          │   │
│  │    Auth · Profile · Permissions · Notifications · Data  │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## 2. Chi tiết Từng Lớp

### 2.1 Layer 1: Pawty Care — Tiện ích Chăm sóc Cá nhân

**Mục đích:** Có giá trị dù chỉ một mình dùng. Đây là lý do đầu tiên để tải app.

| Tính năng | Mô tả | Ưu tiên |
|---|---|---|
| Hồ sơ thú cưng | Tên, loài, giống, ngày sinh, cân nặng, ảnh, chip ID | P0 |
| Sổ tiêm điện tử | Lịch sử vắc-xin, ngày tiêm, nhắc tái tiêm | P0 |
| Hồ sơ sức khỏe | Bệnh lý, thuốc đang dùng, dị ứng, bác sĩ thú y | P0 |
| Thói quen & hành vi | Thói quen tốt/cần lưu ý, mức năng lượng, tính cách | P0 |
| Lịch chăm sóc | Lịch tắm, cắt móng, thuốc giun, tái khám | P0 |
| Nhắc việc thông minh | Push notification theo lịch, có thể bật/tắt | P0 |
| Ghi chú bàn giao | Checklist khi nhờ người khác trông giữ | P1 |
| Tài liệu đính kèm | Ảnh chụp sổ tiêm, kết quả xét nghiệm, hóa đơn | P1 |
| Theo dõi cân nặng | Biểu đồ cân nặng theo thời gian | P2 |

**Tính năng riêng theo loài:**
- **Chó:** Lịch dắt dạo, mức năng lượng, hành vi xã hội, kích thước phân loại
- **Mèo:** Lịch vệ sinh khay cát, chu kỳ lông, mức hoạt động trong nhà

---

### 2.2 Layer 2: Pawty Circle — Vòng Chăm sóc

**Mục đích:** Kết nối có lý do thực tế — phối hợp chăm sóc với người tin cậy.

| Tính năng | Mô tả | Ưu tiên |
|---|---|---|
| Mời thành viên | Mời qua link/mã; gia đình, bạn bè, người giúp việc | P0 |
| Phân quyền | Xem hồ sơ / Nhận việc / Quản lý đầy đủ | P0 |
| Giao việc | Chủ nuôi giao việc cụ thể cho thành viên Circle | P0 |
| Xác nhận hoàn thành | Thành viên đánh dấu đã làm + ghi chú/ảnh | P0 |
| Bàn giao tạm thời | Chia sẻ thông tin có giới hạn thời gian | P1 |
| Lịch sử hoạt động | Timeline ai-làm-gì-khi-nào | P1 |
| Thu hồi quyền | Chủ nuôi có thể thu hồi mời bất kỳ lúc nào | P0 |

**Luồng hoạt động:**
```
Chủ nuôi Mai → Mời "Mẹ Mai" vào Circle
                 ↓
Mai giao việc: "Cho ăn 2 bữa/ngày, thuốc giun sáng thứ 7"
                 ↓
Mẹ Mai nhận notification → Đánh dấu "Đã cho ăn sáng" + ảnh
                 ↓
Mai thấy trạng thái real-time → Không cần nhắn hỏi
```

---

### 2.3 Layer 3: Pawty Local — Cộng đồng & Mạng xã hội

**Mục đích:** Kết nối chủ nuôi cùng khu vực và cùng sở thích. Đây là lớp mạng xã hội.

#### A. Mạng xã hội Thú cưng (Pet Social Network)

| Tính năng | Mô tả | Ưu tiên |
|---|---|---|
| Pet Feed | Bảng tin cuộn, content từ người follow + cộng đồng | P0 |
| Đăng Moment | Ảnh/video kèm caption, tag thú cưng, location | P0 |
| Tương tác Paw | 🐾 Paw (thay Like), Comment, Share, Save | P0 |
| Profile 2 Tab | Tab "Khoảnh khắc" (lưới 3 cột) + Tab "Hồ sơ" | P0 |
| Follow/Unfollow | Follow hồ sơ thú cưng hoặc chủ nuôi | P0 |
| Hashtag thú cưng | Auto-suggest theo loài, giống, hành vi (#GoldenRetriever, #MèoAnh) | P0 |
| Explore/Discover | Khám phá content theo loài, trending, gần mình | P1 |
| Stories | Story 24h cho update nhanh | P2 |

#### B. Cộng đồng Địa phương

| Tính năng | Mô tả | Ưu tiên |
|---|---|---|
| Nhóm theo nhu cầu | "Chó nhỏ Vinhomes", "Mèo Q7", "Golden SG" | P0 |
| Hỏi đáp | Hỏi đáp có người phụ trách + tag chuyên gia | P0 |
| Địa điểm pet-friendly | Bản đồ + review từ cộng đồng | P1 |
| Buổi gặp (Meetup) | Tổ chức/tham gia buổi gặp nhỏ theo khu vực | P1 |
| Radar kết nối | Tìm bạn dắt dạo/chơi chung theo proximity + filters | P1 |

#### C. Sàng lọc & Kiểm duyệt Nội dung

| Cơ chế | Mô tả |
|---|---|
| Content Policy | Chỉ cho phép nội dung liên quan thú cưng |
| Auto-filter | AI phát hiện nội dung không liên quan, spam, bạo lực |
| Community Report | Báo cáo nội dung vi phạm → review thủ công |
| Verified Expert | Badge cho bác sĩ thú y, trainer → ý kiến chuyên gia tách khỏi kinh nghiệm cá nhân |
| No Breeding/Trading | Không cho phép mua bán, phối giống, cho nhận nuôi chưa kiểm tra |
| Health Disclaimer | Mọi nội dung sức khỏe kèm disclaimer "Tham khảo bác sĩ thú y" |

---

### 2.4 Layer 4: Pawty Services — Dịch vụ Tin cậy

**Mục đích:** Kết nối nhu cầu với dịch vụ đã xác minh — hoàn tất tại thực tế.

| Tính năng | Mô tả | Ưu tiên |
|---|---|---|
| Danh sách đối tác | Cơ sở đã xác minh, có rating + review | P0 |
| Đặt lịch | Chọn dịch vụ → chọn slot → xác nhận | P0 |
| Theo dõi trạng thái | Pending → Confirmed → In-progress → Completed | P0 |
| Phản hồi | Rating + review sau khi dịch vụ hoàn tất | P0 |
| Lịch sử dịch vụ | Gắn với hồ sơ thú cưng | P1 |
| Yêu cầu tùy chỉnh | Gửi yêu cầu đặc biệt cho đối tác | P1 |

**Danh mục dịch vụ (phát hành dần):**

| Giai đoạn | Dịch vụ | Rủi ro |
|---|---|---|
| MVP | Grooming (tắm, cắt lông, cắt móng) | Thấp |
| MVP | Khám sức khỏe định kỳ | Thấp |
| V1.1 | Dog walking | Trung bình |
| V1.2 | Pet sitting (ngắn hạn, ban ngày) | Trung bình |
| V2+ | Pet boarding (qua đêm) | Cao |
| V2+ | Vận chuyển thú cưng | Cao |

> [!IMPORTANT]
> Dịch vụ rủi ro cao (boarding, vận chuyển) chỉ mở sau khi có: quy trình kiểm tra đối tác, xử lý sự cố, bảo hiểm đối tác, và đủ dữ liệu vận hành.

---

### 2.5 Layer 5: Pawty Pro — Công cụ cho Đối tác

**Mục đích:** Giúp đối tác vận hành hiệu quả → tăng chất lượng dịch vụ cho người nuôi.

| Tính năng | Mô tả | Ưu tiên |
|---|---|---|
| Dashboard | Tổng quan booking, doanh thu, đánh giá | P1 |
| Quản lý lịch hẹn | Xem/xác nhận/từ chối/đổi lịch | P0 |
| Nhắc khách | Tự động nhắc khách 24h trước hẹn | P1 |
| Hồ sơ cơ sở | Giờ mở, dịch vụ, giá, ảnh | P0 |
| Phản hồi & rating | Xem/phản hồi đánh giá từ khách | P1 |
| Báo cáo | Thống kê booking, doanh thu, retention | P2 |

## 3. Shared Infrastructure (Nền tảng Chung)

Tất cả 5 lớp dùng chung:

```
┌──────────────────────────────────────────────┐
│              SHARED FOUNDATION               │
│                                              │
│  Auth          │  Xác thực SĐT (OTP)        │
│  User Profile  │  Tài khoản chủ nuôi        │
│  Pet Profile   │  Hồ sơ thú cưng (shared)   │
│  Permissions   │  Phân quyền (RBAC)          │
│  Notifications │  Push/In-app/Email          │
│  Media Storage │  Ảnh/Video (Cloudinary/S3)  │
│  Location      │  Vị trí gần đúng (PostGIS)  │
│  Analytics     │  Event tracking (privacy)   │
│  Moderation    │  Kiểm duyệt nội dung       │
│  Data Privacy  │  Consent, Export, Delete     │
└──────────────────────────────────────────────┘
```

## 4. Dependency Map — Thứ tự Xây dựng

```
Foundation ─────→ Care ─────→ Circle ─────→ Local/Social ─────→ Services ─────→ Pro
   (Auth,           (Giá trị    (Kết nối     (Mạng xã hội      (Dịch vụ       (Công cụ
    Profile,         cá nhân)    gia đình)    + cộng đồng)       đặt lịch)      đối tác)
    Storage)
```

> [!NOTE]
> Mỗi lớp tạo giá trị riêng nhưng tăng mạnh khi kết hợp. Care có giá trị dù một mình; Circle có giá trị khi có ≥2 người; Local cần mật độ; Services cần đối tác; Pro cần đủ booking.

## 5. Navigation Architecture

```
┌─────────────────────────────────────────────────────┐
│                   BOTTOM TAB BAR                    │
│                                                     │
│  🏠 Hôm nay  │  🔍 Khám phá  │  ➕  │  💬 Chat  │  👤 Tôi  │
│  (Today)     │  (Explore)    │(New)│ (Messages)│ (Profile)│
└─────────────────────────────────────────────────────┘
```

| Tab | Nội dung chính |
|---|---|
| **Hôm nay** | Việc cần làm, ai phụ trách, yêu cầu đang chờ, booking sắp tới |
| **Khám phá** | Feed xã hội, nhóm cộng đồng, địa điểm, đối tác dịch vụ |
| **Tạo mới (+)** | Đăng moment, tạo việc, gửi yêu cầu, đặt lịch |
| **Chat** | Tin nhắn Circle, cộng đồng, đối tác |
| **Tôi** | Hồ sơ thú cưng, hồ sơ cá nhân, cài đặt, lịch sử |

