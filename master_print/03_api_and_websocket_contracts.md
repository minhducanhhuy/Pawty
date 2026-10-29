# MASTER PRINT — TẦNG 3: API & WEBSOCKET CONTRACTS

> **Single Source of Truth (SSOT)** — Đồng bộ với `plan/04_data_model_and_api.md`.

---

## 1. REST API Endpoints (`/api/*`)

### 1.1 Auth & Users
- `POST /api/auth/send-otp` — Gửi mã OTP tới SĐT (`{ phone }`).
- `POST /api/auth/verify-otp` — Xác thực OTP (`{ phone, otp_code }`) → `{ token, refresh_token, user, is_new }`.
- `POST /api/auth/refresh` — Làm mới JWT token.
- `DELETE /api/auth/logout` — Đăng xuất.
- `GET /api/users/me` & `PUT /api/users/me` — Lấy và cập nhật hồ sơ chủ nuôi.
- `PUT /api/users/me/location` — Cập nhật tọa độ gần đúng (`{ lat, lng, district, neighborhood }`).
- `PUT /api/users/me/privacy` — Cập nhật quyền riêng tư & Consent (`consent_records`).
- `POST /api/users/me/data-export` — Xuất dữ liệu cá nhân (JSON/CSV) theo Luật BVDLCN.
- `DELETE /api/users/me` — Yêu cầu xóa tài khoản.

### 1.2 Pets, Vaccinations & Behaviors (Layer 1: Care)
- `GET /api/pets`, `POST /api/pets`, `GET /api/pets/:id`, `PUT /api/pets/:id`, `DELETE /api/pets/:id`.
- `POST /api/pets/:id/behaviors` & `DELETE /api/pets/:id/behaviors/:bid`.
- `GET /api/pets/:id/vaccinations` & `POST /api/pets/:id/vaccinations`.
- `GET /api/pets/:id/records` & `POST /api/pets/:id/records` (Theo dõi cân nặng, triệu chứng, bàn giao).

### 1.3 Households, Circle & Care Tasks (Layer 1 & Layer 2)
- `POST /api/households`, `GET /api/households/:id/members`.
- `POST /api/households/:id/invite` — Tạo mã mời/link mời thành viên vào Circle (`role`, `expires_at`).
- `PUT /api/circle/:id/accept` & `DELETE /api/circle/:id/revoke`.
- `GET /api/tasks`, `POST /api/tasks`, `PUT /api/tasks/:id`, `DELETE /api/tasks/:id`.
- `PUT /api/tasks/:id/complete` — Đánh dấu hoàn thành kèm `note` và `photo`, kích hoạt sự kiện `task:completed`.

### 1.4 Social Feed, Posts, Reactions, Comments & Groups (Layer 3: Local)
- `GET /api/posts/feed` — Bảng tin sắp xếp theo thuật toán **PawRank** (Circle 40%, Local 25%, Discovery 20%, Expert 10%, Partner 5%).
- `GET /api/posts/explore` — Khám phá theo loài, hashtag, gần bạn, mẹo chuyên gia.
- `POST /api/posts` — Đăng bài mới qua `ModerationService` (tự động chặn nội dung vi phạm và gắn `has_health_disclaimer` khi có từ khóa sức khỏe).
- `POST /api/posts/:id/reactions` (`paw | heart_eyes | laughing | worried | helpful`) & `DELETE /api/posts/:id/reactions`.
- `GET /api/posts/:id/comments`, `POST /api/posts/:id/comments` (hỗ trợ reply 1 cấp & highlight Expert).
- `POST /api/posts/:id/bookmark`, `DELETE /api/posts/:id/bookmark`, `GET /api/bookmarks`.
- `GET /api/groups`, `POST /api/groups`, `GET /api/groups/:id`, `POST /api/groups/:id/join`, `DELETE /api/groups/:id/leave`.

### 1.5 Radar, Matching & Walk Appointments
- `GET /api/radar?lat=&lng=&radius=&species=&vaccinated_only=` — Tìm Boss gần bạn bằng PostGIS `ST_DWithin`.
- `POST /api/matches/:id/swipe` (`direction: 'left' | 'right'`) — Khớp lệnh Match.
- `GET /api/appointments/midpoint?user_a=&user_b=` — Tính trung điểm `ST_Centroid` và gợi ý 3 địa điểm Pet-Friendly gần trung điểm nhất.
- `POST /api/appointments`, `PUT /api/appointments/:id` (`confirmed | completed | cancelled | no_show`).

### 1.6 Partners, Services & Bookings (Layer 4 & Layer 5)
- `GET /api/partners`, `GET /api/partners/:id`, `GET /api/partners/:id/services`, `GET /api/partners/:id/slots`.
- `POST /api/bookings`, `GET /api/bookings`, `PUT /api/bookings/:id/status`, `PUT /api/bookings/:id/cancel`.
- `POST /api/bookings/:id/review` — Đánh giá đối tác từ giao dịch hoàn tất.

### 1.7 Monetization, SOS, Moderation & Analytics
- `POST /api/sos` & `POST /api/sos/:id/sighting` — Phát tín hiệu SOS 3km (39.000đ VietQR) và báo nhìn thấy Boss.
- `POST /api/vip/subscribe` — Nâng cấp gói Cơ bản (29k), Sen VIP (49k/tháng), Sen VIP Năm (399k/năm).
- `POST /api/reports`, `POST /api/users/:id/block`, `GET /api/admin/metrics` (North Star & KPI Dashboard).

## 2. WebSocket Events (Socket.io)
- **Client → Server:** `chat:send`, `chat:typing`, `chat:read`.
- **Server → Client:** `chat:new_message`, `chat:typing`, `chat:read_receipt`, `notification:new`, `task:completed`, `task:reminder`, `booking:update`, `match:new`, `circle:activity`, `post:new`, `post:reaction`, `post:comment`, `sos:alert`.

