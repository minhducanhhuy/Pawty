# TẦNG 2: THIẾT KẾ CƠ SỞ DỮ LIỆU & POSTGIS MODELS (DATABASE SCHEMA)

> **Mã định danh:** `PAWTY-MP-TIER-2`  
> **Phiên bản:** `1.0.0 (Master Blueprint)`  
> **Trạng thái:** `Đã phê duyệt (SSOT)`

---

## 1. SƠ ĐỒ THỰC THỂ LIÊN KẾT (ERD OVERVIEW)

```
[Users] (1) ────< (n) [Pets] (1) ────< (n) [Pet_Moments] ────< (n) [Moment_Likes]
   │                     │
   │ (1)                 ├───< (n) [Matches] (sender/target)
   │                     ├───< (n) [Chat_Rooms] (pet_a/pet_b) ────< (n) [Chat_Messages]
   │                     │                                                │
   │                     └───< (n) [Walk_Appointments] <──────────────────┘
   │
   └───< (n) [Transactions] ────> [Sos_Alerts]
```

---

## 2. ĐẶC TẢ CHI TIẾT CÁC BẢNG (TABLE SPECIFICATIONS)

### 2.1. Bảng `users` (Chủ Nuôi / Sen)
| Tên Cột | Kiểu Dữ Liệu | Khóa / Ràng buộc | Mô Tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | **PK**, default `gen_random_uuid()` | Khóa chính định danh tài khoản Sen |
| `phone` | `VARCHAR(15)` | **UNIQUE**, NOT NULL | Số điện thoại thật định danh KYC |
| `full_name` | `VARCHAR(100)` | NOT NULL | Họ và tên chủ nuôi |
| `nickname` | `VARCHAR(50)` | NULL | Biệt danh trong app (vd: *Nhà Sen Bơ*) |
| `avatar_url` | `TEXT` | NOT NULL | Đường dẫn ảnh đại diện của chủ nuôi |
| `is_verified` | `BOOLEAN` | default `false` | Trạng thái xác thực OTP qua Firebase |
| `is_vip` | `BOOLEAN` | default `false` | Trạng thái hội viên VIP trả phí |
| `vip_expires_at` | `TIMESTAMPTZ` | NULL | Ngày hết hạn gói VIP |
| `daily_swipes_count`| `INTEGER` | default `0` | Số lượt quẹt thẻ đã dùng trong ngày |
| `location` | `GEOGRAPHY(Point, 4326)` | NOT NULL, **GiST Index** | Tọa độ GPS của Sen (Kinh độ, Vĩ độ) |
| `condo_complex` | `VARCHAR(150)` | NOT NULL | Tên cụm chung cư (vd: *Vinhomes Central Park*) |
| `flake_reports_count`| `INTEGER`| default `0` | Số lần bị báo cáo bùng kèo trong tuần |
| `is_banned_swiping` | `BOOLEAN`| default `false` | Bị khóa quẹt thẻ do tích lũy 2 lần bùng kèo |
| `ban_until` | `TIMESTAMPTZ` | NULL | Thời điểm mở khóa quẹt thẻ |
| `created_at` | `TIMESTAMPTZ` | default `NOW()` | Thời gian tạo tài khoản |
| `updated_at` | `TIMESTAMPTZ` | default `NOW()` | Thời gian cập nhật |

---

### 2.2. Bảng `pets` (Hồ Sơ Boss)
| Tên Cột | Kiểu Dữ Liệu | Khóa / Ràng buộc | Mô Tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | **PK**, default `gen_random_uuid()` | Khóa chính định danh Boss |
| `user_id` | `UUID` | **FK** -> `users.id`, ON DELETE CASCADE | Chủ sở hữu thú cưng |
| `name` | `VARCHAR(50)` | NOT NULL | Tên của Boss (vd: *Bơ Lùn*, *Mochi*) |
| `species` | `VARCHAR(10)` | ENUM (`'dog'`, `'cat'`) | Loài: Chó hoặc Mèo |
| `breed` | `VARCHAR(80)` | NOT NULL | Giống (vd: *Corgi Pembroke*, *Shiba Inu*) |
| `gender` | `VARCHAR(10)` | ENUM (`'male'`, `'female'`) | Giới tính Boss |
| `is_neutered` | `BOOLEAN` | default `false` | Tình trạng triệt sản an toàn |
| `age_years` | `INTEGER` | default `0` | Tuổi chẵn theo năm |
| `age_months` | `INTEGER` | default `0` | Số tháng tuổi lẻ |
| `weight_kg` | `DECIMAL(4, 1)`| NOT NULL | Cân nặng chính xác theo kilogram |
| `size` | `VARCHAR(10)` | ENUM (`'small'`, `'medium'`, `'large'`) | Nhỏ (<5kg), Vừa (5-15kg), Lớn (>15kg) |
| `is_vaccinated` | `BOOLEAN` | default `true` | Đã tiêm phòng đầy đủ |
| `last_vaccine_date` | `VARCHAR(30)` | NULL | Ngày tiêm mũi nhắc gần nhất |
| `vaccine_details` | `TEXT` | NULL | Chi tiết các mũi (7 bệnh, dại, phòng khám) |
| `bio` | `TEXT` | NULL | Lời tự giới thiệu hóm hỉnh |
| `tags` | `TEXT[]` | default `{}` | Mảng tag tính cách (['Tăng động', 'Thân thiện']) |
| `habits_good` | `TEXT[]` | default `{}` | Mảng thói quen tốt khi ra đường |
| `habits_bad` | `TEXT[]` | default `{}` | Mảng thói quen xấu cần chủ động phòng tránh |
| `avatar_url` | `TEXT` | NOT NULL | Ảnh chân dung đại diện chính |
| `photos` | `TEXT[]` | default `{}` | Danh sách ảnh bổ sung trong album |
| `created_at` | `TIMESTAMPTZ` | default `NOW()` | Thời gian tạo profile |

---

### 2.3. Bảng `matches` (Lịch Sử Quẹt Thẻ & Khớp Lệnh)
| Tên Cột | Kiểu Dữ Liệu | Khóa / Ràng buộc | Mô Tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | **PK** | Khóa chính lượt quẹt |
| `sender_pet_id` | `UUID` | **FK** -> `pets.id` | Boss thực hiện quẹt |
| `target_pet_id` | `UUID` | **FK** -> `pets.id` | Boss được quẹt |
| `status` | `VARCHAR(10)` | ENUM (`'liked'`, `'disliked'`, `'matched'`) | Trạng thái quẹt |
| `matched_at` | `TIMESTAMPTZ` | NULL | Thời điểm 2 bên cùng Like |
| `created_at` | `TIMESTAMPTZ` | default `NOW()` | Thời điểm quẹt |

---

### 2.4. Bảng `chat_rooms` & `chat_messages` (Phòng Chat & Tin Nhắn)
- **`chat_rooms`**:
  - `id` (UUID, PK)
  - `pet_a_id` (UUID, FK -> `pets.id`)
  - `pet_b_id` (UUID, FK -> `pets.id`)
  - `last_message_text` (TEXT)
  - `last_message_at` (TIMESTAMPTZ)
  - `created_at` (TIMESTAMPTZ)
- **`chat_messages`**:
  - `id` (UUID, PK)
  - `room_id` (UUID, FK -> `chat_rooms.id`, ON DELETE CASCADE)
  - `sender_pet_id` (UUID, FK -> `pets.id`)
  - `text` (TEXT, NULL nếu chỉ có appointment)
  - `appointment_id` (UUID, NULL, FK -> `walk_appointments.id`)
  - `is_read` (BOOLEAN, default false)
  - `created_at` (TIMESTAMPTZ)

---

### 2.5. Bảng `walk_appointments` (Kèo Hẹn Đi Dạo Trung Điểm)
| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Mô Tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | **PK** | Khóa chính cuộc hẹn |
| `room_id` | `UUID` | **FK** -> `chat_rooms.id` | Phòng chat chứa lời mời |
| `sender_pet_id` | `UUID` | **FK** -> `pets.id` | Boss gửi lời mời |
| `receiver_pet_id`| `UUID` | **FK** -> `pets.id` | Boss nhận lời mời |
| `scheduled_time` | `TIMESTAMPTZ` | NOT NULL | Giờ hẹn dắt Boss ra đường |
| `display_time` | `VARCHAR(50)`| NOT NULL | Chuỗi hiển thị (vd: *Tối nay • 19:30*) |
| `place_name` | `VARCHAR(150)`| NOT NULL | Tên địa điểm thân thiện với thú cưng |
| `place_address` | `TEXT` | NOT NULL | Địa chỉ địa điểm |
| `place_thumbnail`| `TEXT` | NOT NULL | Ảnh thu nhỏ của địa điểm |
| `note` | `TEXT` | NULL | Ghi chú của Sen (mang xích, bóng, túi rác) |
| `status` | `VARCHAR(20)` | ENUM (`'pending'`, `'confirmed'`, `'rejected'`, `'reported_flake'`, `'completed'`) | Trạng thái cuộc hẹn |
| `created_at` | `TIMESTAMPTZ` | default `NOW()` | Thời gian tạo |

---

### 2.6. Bảng `pet_moments` & `moment_likes` (Nhật Ký Bựa)
- **`pet_moments`**:
  - `id` (UUID, PK)
  - `pet_id` (UUID, FK -> `pets.id`, ON DELETE CASCADE)
  - `media_url` (TEXT, NOT NULL)
  - `media_type` (VARCHAR(10), ENUM `'image'`, `'video'`)
  - `caption` (TEXT, NOT NULL)
  - `likes_count` (INTEGER, default 0)
  - `created_at` (TIMESTAMPTZ)
- **`moment_likes`**:
  - `id` (UUID, PK)
  - `moment_id` (UUID, FK -> `pet_moments.id`, ON DELETE CASCADE)
  - `user_id` (UUID, FK -> `users.id`, ON DELETE CASCADE)
  - Ràng buộc **UNIQUE (`moment_id`, `user_id`)** - mỗi Sen chỉ thả tim 1 lần.

---

### 2.7. Bảng `sos_alerts` (Báo Động Tìm Boss Lạc)
| Tên Cột | Kiểu Dữ Liệu | Ràng Buộc | Mô Tả |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` | **PK** | Mã định danh tin SOS |
| `pet_name` | `VARCHAR(50)`| NOT NULL | Tên Boss bị lạc |
| `species` | `VARCHAR(10)`| ENUM (`'dog'`, `'cat'`) | Loài |
| `breed` | `VARCHAR(80)`| NOT NULL | Giống |
| `pet_photo_url` | `TEXT` | NOT NULL | Ảnh cận cảnh nhận dạng |
| `last_seen_location`| `GEOGRAPHY(Point, 4326)` | NOT NULL, **GiST Index** | Tọa độ GPS nơi mất dấu Boss |
| `last_seen_address` | `TEXT` | NOT NULL | Tên sảnh/hầm/khu vực rơi dây dắt |
| `radius_km` | `INTEGER` | default `3` | Bán kính phát sóng thông báo (3km) |
| `reward_amount_vnd` | `VARCHAR(50)`| NOT NULL | Tiền chuộc hậu tạ |
| `contact_phone` | `VARCHAR(30)`| NOT NULL | Số điện thoại khẩn cấp gọi trực tiếp |
| `notes` | `TEXT` | NOT NULL | Đặc điểm vòng cổ, tính cách khi hoảng sợ |
| `status` | `VARCHAR(15)`| ENUM (`'active'`, `'resolved'`) | Đang tìm kiếm / Đã tìm thấy |
| `created_at` | `TIMESTAMPTZ` | default `NOW()` | Thời gian phát lệnh |
