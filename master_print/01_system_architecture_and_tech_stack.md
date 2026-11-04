# MASTER PRINT — TẦNG 1: SYSTEM ARCHITECTURE & TECH STACK

> **Single Source of Truth (SSOT)** — Đồng bộ với kiến trúc hệ sinh thái & kỹ thuật Pawty.

---

## 1. Kiến Trúc Hệ Sinh Thái Trọng Tâm (100% Free Community Platform)
1. **PAWTY SOS KHẨN CẤP (100% MIỄN PHÍ):** Báo động tìm kiếm thú thất lạc miễn phí cho cộng đồng (Push notification bán kính 3km, AI Smart Description với Gemini Vision 2.5 Flash đọc ảnh do chủ nuôi gửi lên để tự động viết mô tả nhận dạng).
2. **PAWTY RADAR & CONNECT (MỞ KHÓA TOÀN BỘ):** Radar tìm bạn dắt dạo cún theo khoảng cách không giới hạn (2km – 500km hoặc Toàn quốc / Không giới hạn), xem danh sách "Ai đã thích bạn" miễn phí, hoàn tác lượt quẹt miễn phí, ghép đôi kết nối tương tác và nhắn tin trò chuyện.
3. **PAWTY LOCAL & SOCIAL:** Mạng xã hội hình ảnh thú cưng (Pet Feed hỗ trợ Pull-to-refresh, PawRank, các loại bài viết khoảnh khắc lưu trữ 100% vào PostgreSQL, tương tác cảm xúc Paw) + Cộng đồng địa phương.
4. **PAWTY CIRCLE:** Vòng chăm sóc gia đình/bạn bè (Mời qua mã, phân quyền RBAC, giao việc, xác nhận hoàn thành kèm ảnh, bàn giao tạm thời).
5. **PAWTY CARE:** Hồ sơ Boss không giới hạn số lượng bé, Sổ tiêm điện tử, Lịch chăm sóc & Nhắc việc thông minh.
6. **FOUNDATION:** Auth, User/Pet Profiles (Selector-first UX), Notifications đa phân loại (Kết bạn, Theo dõi, Match, Tương tác, SOS), Moderation Pipeline (kiểm duyệt từ khóa), Privacy & Consent (Luật BVDLCN 91/2025/QH15).

## 2. Cấu Trúc Monorepo (`pawty/`)
```
pawty/
├── apps/
│   ├── web/                    # React 19 + Vite + Tailwind CSS v4 + Zustand (Phase 1 Web App)
│   └── mobile/                 # React Native + Expo SDK 58 + NativeWind/StyleSheet (Phase 2 Mobile App)
├── server/                     # Node.js / TypeScript Backend (REST API + Prisma + PostgreSQL)
├── packages/
│   ├── types/                  # Shared TypeScript interfaces & DTO types
│   ├── utils/                  # Shared helper functions (distance, PawRank, date/currency formatters)
│   └── validators/             # Shared Zod schemas & Content Moderation rules
├── plan/                       # Tài liệu kế hoạch sản phẩm
├── master_print/               # Bản thiết kế kỹ thuật gốc (SSOT)
└── public/assets/              # Tài nguyên thương hiệu gốc
```

## 3. Tech Stack & Tiêu Chuẩn Hiệu Năng Chi Tiết
- **Frontend Web (`apps/web`):** React 19, Vite, Tailwind CSS v4, Zustand, Lucide React.
- **Mobile App (`apps/mobile`):**
  - React Native + Expo SDK 58 (`expo`, `react-native`, `expo-status-bar`, `expo-constants`), chạy trực tiếp trên thiết bị thật qua **Expo Go**.
  - **100% Database-Driven (Zero Client Mock Data):** Toàn bộ dữ liệu ứng dụng (Users, Pets, Feed Posts, Tinder Candidates, Likes You, Chats, SOS Alerts, Notifications, Public Profiles) được lưu trữ và tải trực tiếp từ PostgreSQL qua Backend API Gateway (`http://<LAN_IP>:3000/api/*`).
  - **Mobile Polling Cadence (15s):** Cơ chế nền thăm dò thông báo và tin nhắn chạy ở chu kỳ 15 giây (`15000ms`), giúp tiết kiệm pin, giảm 77% áp lực request lên hệ thống serverless.
- **Backend (`server`):**
  - API Gateway (`server/src/main.ts`, hỗ trợ payload JSON Base64 ảnh tới 35MB) lắng nghe trên `0.0.0.0:3000`, lưu trữ dữ liệu trực tiếp vào PostgreSQL qua Prisma Client (`server/prisma/schema.prisma`), khởi tạo dữ liệu qua `server/src/data/seed-db.ts`.
  - **Connection Pool & Performance Standards:** Chuỗi kết nối PostgreSQL Supabase PgBouncer (cổng 6543) được cấu hình `pgbouncer=true&connection_limit=10&pool_timeout=30` chống tràn pool; endpoint `/api/bootstrap` gom tải metadata (`getUserMetaMap`) và follow graph (`getFollowSnapshot`) 1 lần duy nhất truyền xuống các hàm con; khử triệt để N+1 query trong `getChats`; phân trang giới hạn `take: 20` cho bài viết Feed và `take: 30` cho thông báo.
  - **Media Storage (Cloudinary CDN):** Tích hợp Cloudinary v2 SDK (`server/src/services/cloudinary.service.ts`). Mọi hình ảnh media tải lên từ ứng dụng (Avatar người dùng, Ảnh bìa, Ảnh thú cưng, Khoảnh khắc bài viết, Ảnh tin SOS) đều được tải lên Cloudinary lưu trữ bền vững. Cơ sở dữ liệu PostgreSQL chỉ lưu lại đường link HTTPS Cloudinary (`secure_url`), tuyệt đối không lưu dữ liệu chuỗi Base64 thô vào database.
  - Modular Services: `ModerationService` (kiểm duyệt từ khóa tự động & gắn cảnh báo y tế) và `PawRankAndSpatialService`.
- **Phạm vi AI Duy Nhất (`GeminiVisionService` + Google Gemini 2.5 Flash):**
  - **Chỉ thực hiện 1 chức năng AI duy nhất:** Đọc bức ảnh thú cưng mà chủ nuôi tải lên trong biểu mẫu tạo tin SOS (`POST /api/ai/describe-pet`) để tự động sinh đoạn văn mô tả đặc điểm nhận dạng bằng tiếng Việt.
  - Đã loại bỏ hoàn toàn các luồng AI phụ trợ khác (AI quét bài đăng Feed đối chiếu tự động `PetTracingService`, AI dự đoán quỹ đạo di chuyển `SightingTrajectory`, điểm AI Pet-relevance giả lập).

## 4. Giao Thức Tải Ảnh Trì Hoãn (Preview-First & Deferred Cloud Upload) & Chuẩn UX Toast

### 4.1. Kiến trúc Preview-First & Deferred Cloud Upload
- **Nguyên lý cốt lõi:** Khi người dùng chọn hoặc chụp ảnh (Đăng bài Feed, Album ảnh hẹn hò Tinder, Thêm bé cún mới, Báo động SOS), giao diện ứng dụng **lập tức lưu URI/DataURL cục bộ vào component state để hiển thị preview ngay với độ trễ 0ms**. Tuyệt đối **KHÔNG** gọi API tải lên Cloudinary ngay tại thời điểm mở ảnh/chụp ảnh.
- **Trì hoãn tải lên khi ấn Lưu / Đăng:**
  - Chỉ khi người dùng bấm nút **"Đăng khoảnh khắc"**, **"Lưu hồ sơ"**, **"Thêm bé cưng"**, hoặc **"Phát tín hiệu SOS"**, ứng dụng mới tiến hành tải ảnh lên Cloudinary qua hàm `resolveLocalMediaUrls()`.
  - Quá trình tải lên được thực hiện song song bằng `Promise.all` để tối đa hóa tốc độ mạng.
  - Nếu ảnh đã là URL mạng (`http://` hoặc `https://`), bỏ qua không tải lại nhằm tiết kiệm băng thông và hạn mức Cloudinary.
  - Nếu người dùng hủy chỉnh sửa hoặc xóa ảnh khỏi danh sách trước khi Lưu, không phát sinh bất kỳ request tải lên đám mây nào.

### 4.2. Chuẩn Thông Báo UX Hướng Người Dùng (User-Centric Messaging Standard)
- Loại bỏ hoàn toàn các thuật ngữ kỹ thuật mang tính nội bộ (`Cloudinary`, `PostgreSQL`, `Database`, `Cơ sở dữ liệu`, `Máy chủ`, `Server`) khỏi các thông báo Toast trên giao diện người dùng.
- Bảng ánh xạ chuẩn hóa:
  - `"Đã lưu ảnh lên cloudinary"` ➔ `"Đã tải ảnh lên thành công"`
  - `"Đang tải ảnh đại diện lên Cloudinary..."` ➔ `"Đang cập nhật ảnh đại diện..."`
  - `"Đã lưu hồ sơ cá nhân lên cơ sở dữ liệu."` ➔ `"Đã cập nhật hồ sơ cá nhân thành công!"`
  - `"Không thể lưu hồ sơ lên máy chủ."` ➔ `"Không thể lưu hồ sơ. Vui lòng thử lại sau."`
  - `"Đang kết nối lại máy chủ..."` ➔ `"Đang làm mới dữ liệu..."`
  - `"Đã đồng bộ Hồ sơ Kết nối & Mục đích tìm kiếm!"` ➔ `"Đã lưu thiết lập kết nối!"`
