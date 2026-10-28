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
| `username` | `VARCHAR(50)` | **UNIQUE**, NULL | Tên đăng nhập (Username/Password) |
| `password_hash` | `VARCHAR(255)` | NULL | Mật khẩu băm an toàn |
| `email` | `VARCHAR(150)` | NULL | Email đăng nhập Google |
| `google_id` | `VARCHAR(100)` | NULL | Google Sub ID |
| `phone` | `VARCHAR(15)` | NULL | Số điện thoại KYC (tùy chọn) |
| `full_name` | `VARCHAR(100)` | NOT NULL | Họ và tên chủ nuôi |
| `nickname` | `VARCHAR(50)` | NULL | Biệt danh trong app (vd: *Nhà Sen Bơ*) |
| `intent_tags` | `TEXT[]` | default `{'dating'}` | Mục đích kết nối (dating, walk_buddy, playdate, community) |
| `bio` | `TEXT` | NULL | Giới thiệu về chủ nuôi |
| `age` | `INTEGER` | NULL | Tuổi của chủ nuôi |
| `gender` | `VARCHAR(20)` | NULL | Giới tính chủ nuôi |
| `occupation` | `VARCHAR(100)` | NULL | Nghề nghiệp / Lĩnh vực |
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


---

# PHỤ LỤC v1.1 — MỞ RỘNG DATABASE CHO P0 + P1 (theo `plan/03_chuc_nang_core_va_phu.md`)

> **Phiên bản:** `1.1.0` · **Phạm vi:** Phase 0–2. Quy ước tên: DB dùng `snake_case`, JSON/API & code TypeScript dùng `camelCase` (map 1-1).
> **Trình điều khiển dữ liệu (Data Driver):** v1.1 chạy bằng `DataStoreService` in-memory + **lưu bền ra file `server/data/pawty-db.json`** (sandbox driver, bật/tắt bằng `DATA_PERSIST=true|false`). `server/prisma/schema.prisma` được cập nhật song song và là hợp đồng schema Production (PostgreSQL + PostGIS); driver Prisma là hạng mục của phiên sau.

## 3.1. Cột bổ sung cho bảng `users`
| Cột | Kiểu | Mặc định | Mô tả |
| :--- | :--- | :--- | :--- |
| `email` | `VARCHAR(150)` NULL | NULL | Email từ Google/Apple (không thay thế xác thực SĐT) |
| `auth_provider` | ENUM `phone`,`google`,`apple` | `phone` | Cách đăng nhập gần nhất |
| `role` | ENUM `user`,`moderator`,`admin` | `user` | Phân quyền Admin Portal |
| `locale` | ENUM `vi`,`en` | `vi` | Ngôn ngữ giao diện + push |
| `vip_tier` | ENUM `free`,`vip`,`vip_plus` | `free` | Gói thành viên (đồng bộ `is_vip = vip_tier != 'free'`) |
| `super_likes_today` | INT | 0 | Số Super Like đã dùng hôm nay |
| `super_like_balance` | INT | 0 | Super Like mua lẻ còn lại |
| `boost_balance` | INT | 0 | Số lượt Boost mua lẻ còn lại |
| `boost_expires_at` | TIMESTAMPTZ NULL | NULL | Hết hạn Boost đang chạy (30 phút) |
| `is_walking_now` | BOOLEAN | false | Đang bật chế độ Dắt dạo ngay |
| `walking_until` | TIMESTAMPTZ NULL | NULL | Tự tắt sau 30 phút |
| `referral_code` | `VARCHAR(12)` UNIQUE | sinh khi tạo | Mã giới thiệu |
| `referred_by_user_id` | UUID NULL FK | NULL | Người giới thiệu |
| `walk_streak_days` | INT | 0 | Chuỗi ngày dắt dạo liên tiếp |
| `last_walk_date` | DATE NULL | NULL | Ngày dắt dạo gần nhất |
| `total_walk_meters` | INT | 0 | Tổng quãng đường (từ `walk_logs`) |
| `is_distance_hidden` | BOOLEAN | false | Ẩn khoảng cách chính xác (chỉ hiện "Gần bạn") |
| `fcm_token` | TEXT NULL | NULL | Token push |
| `notification_prefs` | JSONB | tất cả `true` | `{match,message,appointment,sos,reminder,event}` |
| `is_deleted` | BOOLEAN | false | Xoá mềm (xoá cứng sau 30 ngày) |

## 3.2. Cột bổ sung cho bảng `pets`
| Cột | Kiểu | Mô tả |
| :--- | :--- | :--- |
| `is_primary` | BOOLEAN | Boss đang chọn làm Boss chính trên Radar |
| `vaccine_status` | ENUM `none`,`pending`,`verified`,`rejected` | Trạng thái xác minh sổ tiêm |
| `vaccine_proof_urls` | TEXT[] | Ảnh sổ tiêm đã upload |
| `vaccine_next_due_date` | DATE NULL | Hạn tái chủng kế tiếp (sinh nhắc lịch) |
| `vaccine_reject_reason` | TEXT NULL | Lý do từ chối khi `rejected` |
| `is_safe_pet` | BOOLEAN | `true` khi `vaccine_status = 'verified'` → huy hiệu Safe Pet |

> **Quy tắc Safe Pet:** bộ lọc `verifiedOnly` trên Radar dựa vào `is_safe_pet`, **không còn** dựa vào `is_vaccinated` tự khai.

## 3.3. Bảng `matches` — mở rộng
- `status` thêm giá trị `superliked`.
- Thêm `action` (`like`/`superlike`/`dislike`), `is_undone` (BOOLEAN, dùng cho Rewind).

## 3.4. Bảng `appointments` (`walk_appointments`) — mở rộng
| Cột | Mô tả |
| :--- | :--- |
| `place_lat`, `place_lng` | Tọa độ điểm hẹn (dùng cho check-in) |
| `checked_in_sender_at`, `checked_in_receiver_at` | Thời điểm mỗi bên check-in |
| `reminder_sent_at` | Đã bắn nhắc 15 phút chưa |
| `completed_at` | Khi cả hai check-in → `status='completed'` |

## 3.5. Bảng mới
| Bảng | Cột chính |
| :--- | :--- |
| `blocks` | `id`, `blocker_user_id`, `blocked_user_id`, `created_at`; UNIQUE(blocker, blocked) |
| `reports` | `id`, `reporter_user_id`, `target_type` (`user`,`pet`,`moment`,`message`,`club`), `target_id`, `reason` (`spam`,`harassment`,`abuse_animal`,`nsfw`,`fake`,`other`), `detail`, `status` (`open`,`resolved`,`dismissed`), `resolved_by`, `created_at` |
| `moment_comments` | `id`, `moment_id`, `user_id`, `text`, `created_at` |
| `notifications` | `id`, `user_id`, `type` (`match`,`message`,`appointment`,`sos`,`reminder`,`event`,`system`,`badge`,`referral`), `title`, `body`, `payload` JSONB, `is_read`, `created_at` |
| `reminders` | `id`, `pet_id`, `kind` (`vaccine`,`deworm`,`custom`), `title`, `due_date`, `is_done`, `last_notified_offset` (30/7/1/0) |
| `badges` | `code` PK (`first_match`,`walk_7_streak`,`social_butterfly`,`safe_pet`,`moment_10`,`club_member`,`referral_3`,`sos_hero`), `name_vi`, `name_en`, `icon`, `description_vi`, `description_en` |
| `user_badges` | `user_id`, `badge_code`, `earned_at`; PK(user, badge) |
| `walk_logs` | `id`, `user_id`, `pet_id`, `started_at`, `ended_at`, `distance_meters`, `source` (`walk_now`,`appointment`) |
| `clubs` | `id`, `name`, `type` (`breed`,`building`), `breed_or_building`, `cover_url`, `description`, `owner_user_id`, `members_count`, `created_at` |
| `club_members` | `club_id`, `user_id`, `role` (`owner`,`member`), `joined_at` |
| `events` | `id`, `club_id` NULL, `title`, `description`, `cover_url`, `place_name`, `lat`, `lng`, `starts_at`, `capacity`, `rsvp_count`, `created_by` |
| `event_rsvps` | `event_id`, `user_id`, `status` (`going`,`maybe`), `created_at` |
| `pet_friendly_places` | `id`, `name`, `category` (`park`,`cafe`,`spa`,`vet`,`shop`,`hotel`), `address`, `lat`, `lng`, `thumbnail_url`, `rating_avg`, `reviews_count`, `partner_id` NULL |
| `place_reviews` | `id`, `place_id`, `user_id`, `rating` 1–5, `text`, `created_at` |
| `partners` | `id`, `business_name`, `category`, `contact_email` UNIQUE, `password_hash`, `phone`, `lat`, `lng`, `address`, `status` (`pending`,`approved`,`suspended`), `plan` (`cpc`,`monthly`), `balance_vnd`, `created_at` |
| `native_ads` | `id`, `partner_id`, `title`, `description`, `image_url`, `discount_percent`, `voucher_quota`, `vouchers_issued`, `radius_meters` (default 1000), `target_lat`, `target_lng`, `status` (`draft`,`active`,`paused`,`ended`), `impressions`, `clicks`, `starts_at`, `ends_at` |
| `vouchers` | `id`, `ad_id`, `user_id`, `code` UNIQUE, `status` (`saved`,`redeemed`,`expired`), `expires_at`, `redeemed_at`, `created_at` |
| `referrals` | `id`, `referrer_user_id`, `referred_user_id` UNIQUE, `reward_granted_at`, `created_at` |
| `audit_logs` | `id`, `actor_id`, `action`, `target_type`, `target_id`, `meta` JSONB, `created_at` |
| `live_locations` | (in-memory/Redis, TTL) `room_id`, `user_id`, `lat`, `lng`, `updated_at` — chỉ tồn tại khi đang chia sẻ vị trí trong hẹn dạo |

## 3.6. Cập nhật `transactions.type`
`sos`, `vip_month`, `vip_year`, `vip_plus_month`, `boost`, `super_like_pack`, `partner_topup`.

## 3.7. Index bắt buộc
GiST trên `users.location`, `pet_friendly_places(lat,lng)`, `native_ads(target)`; B-tree trên `notifications(user_id, is_read, created_at DESC)`, `matches(sender_pet_id, target_pet_id)`, `reports(status)`.
