# MASTER PRINT — TẦNG 3: API & WEBSOCKET CONTRACTS

> **Single Source of Truth (SSOT)** — Đồng bộ với các API và sự kiện WebSocket của Pawty.

---

## 1. REST Endpoints (API Gateway: `0.0.0.0:3000`)

### 1.1 Auth & Onboarding
- `POST /api/auth/send-otp` (`phone`) → Trả về `{ success, message }`.
- `POST /api/auth/verify-otp` (`phone`, `otp`) → Trả về `{ token, refresh_token, user, is_new }`.
- `POST /api/auth/refresh` & `DELETE /api/auth/logout`.

### 1.2 Users, Profiles & Privacy (Luật BVDLCN 91/2025/QH15)
- `GET /api/users/me` & `PUT /api/users/me` (`display_name`, `bio`, `district`, `neighborhood`).
- `PUT /api/users/me/location` (`lat`, `lng`, `district`, `neighborhood`) & `PUT /api/users/me/privacy`.
- `POST /api/users/me/data-export` & `DELETE /api/users/me` (quyền được lãng quên).

### 1.3 Pets, Care Tasks & Handover
- `GET /api/pets`, `POST /api/pets`, `GET /api/pets/:id`, `PUT /api/pets/:id`, `DELETE /api/pets/:id`.
- `POST /api/pets/:id/vaccinations` & `POST /api/pets/:id/behaviors`.
- `GET /api/circle/members`, `POST /api/circle/invite`, `PUT /api/circle/members/:id`, `DELETE /api/circle/members/:id`.
- `GET /api/tasks`, `POST /api/tasks`, `PUT /api/tasks/:id`, `DELETE /api/tasks/:id`.
- `PUT /api/tasks/:id/complete` — Đánh dấu hoàn thành kèm `note` và `photo`, kích hoạt sự kiện `task:completed`.

### 1.4 Social Feed, Posts, Reactions, Comments & Groups
- `GET /api/posts/feed` — Bảng tin sắp xếp theo thuật toán **PawRank** (Circle 40%, Local 30%, Discovery 20%, Expert 10%).
- `GET /api/posts/explore` — Khám phá theo loài, hashtag, gần bạn, mẹo chuyên gia.
- `POST /api/posts` — Đăng bài mới qua `ModerationService` (tự động chặn nội dung vi phạm, gắn `has_health_disclaimer`).
- `POST /api/posts/:id/reactions` (`paw | heart_eyes | laughing | worried | helpful`) & `DELETE /api/posts/:id/reactions`.
- `GET /api/posts/:id/comments`, `POST /api/posts/:id/comments` (hỗ trợ reply 1 cấp & highlight Expert).
- `POST /api/posts/:id/bookmark`, `DELETE /api/posts/:id/bookmark`, `GET /api/bookmarks`.
- `GET /api/groups`, `POST /api/groups`, `GET /api/groups/:id`, `POST /api/groups/:id/join`, `DELETE /api/groups/:id/leave`.

### 1.5 Radar & Matching
- `GET /api/radar?lat=&lng=&radius=&species=&vaccinated_only=` — Tìm Boss gần bạn bằng PostGIS `ST_DWithin`.
- `POST /api/matches/:id/swipe` (`direction: 'left' | 'right'`) — Khớp lệnh Match & chúc mừng.

### 1.6 Monetization, SOS, AI Smart Description, Moderation & Analytics
- `POST /api/sos` & `POST /api/sos/:id/sighting` — Phát tín hiệu SOS 3km (39.000đ VietQR) và gửi manh mối nhìn thấy Boss.
- `POST /api/ai/describe-pet` (`{ imageUrl?: string, imageBase64?: string, mimeType?: string }`) — Phân tích ảnh đa phương thức qua Gemini 2.5 Flash Vision (hỗ trợ cả Base64 từ thiết bị di động và URL từ xa) để tự động sinh thông số nhận diện `{ success, species, breed, primaryColor, description, distinctiveFeatures }` cho form đăng tin SOS.
- `POST /api/vip/subscribe` — Nâng cấp gói Cơ bản (29k), Sen VIP (49k/tháng), Sen VIP Năm (399k/năm).
- `POST /api/reports`, `POST /api/users/:id/block`, `GET /api/admin/metrics` (North Star & KPI Dashboard).

## 2. WebSocket Events (Socket.io)
- **Client → Server:** `chat:send`, `chat:typing`, `chat:read`.
- **Server → Client:** `chat:new_message`, `chat:typing`, `chat:read_receipt`, `notification:new`, `task:completed`, `task:reminder`, `match:new`, `circle:activity`, `post:new`, `post:reaction`, `post:comment`, `sos:alert`.
