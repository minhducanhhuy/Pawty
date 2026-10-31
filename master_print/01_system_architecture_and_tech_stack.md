# MASTER PRINT — TẦNG 1: SYSTEM ARCHITECTURE & TECH STACK

> **Single Source of Truth (SSOT)** — Đồng bộ với kiến trúc hệ sinh thái & kỹ thuật Pawty.

---

## 1. Kiến Trúc Hệ Sinh Thái Trọng Tâm
1. **PAWTY SOS AI TRACING:** Báo động tìm kiếm thú thất lạc khẩn cấp (Push notification bán kính 3km, AI Smart Description với Gemini Vision 2.5 Flash, phân tích nhận dạng & đối soát vị trí).
2. **PAWTY RADAR & CONNECT:** Radar tìm bạn dắt dạo cún theo khoảng cách PostGIS (`ST_DWithin`), ghép đôi kết nối tương tác, nhắn tin trò chuyện.
3. **PAWTY LOCAL & SOCIAL:** Mạng xã hội hình ảnh thú cưng (Pet Feed, PawRank, các loại bài viết khoảnh khắc, tương tác cảm xúc Paw) + Cộng đồng địa phương.
4. **PAWTY CIRCLE:** Vòng chăm sóc gia đình/bạn bè (Mời qua mã, phân quyền RBAC, giao việc, xác nhận hoàn thành kèm ảnh, bàn giao tạm thời).
5. **PAWTY CARE:** Hồ sơ Boss, Sổ tiêm điện tử, Lịch chăm sóc & Nhắc việc thông minh.
6. **FOUNDATION:** Auth (OTP), User/Pet Profiles, RBAC Permissions, Notifications, PostGIS Location, Moderation Pipeline, Privacy & Consent (Luật BVDLCN 91/2025/QH15).

## 2. Cấu Trúc Monorepo (`pawty/`)
```
pawty/
├── apps/
│   ├── web/                    # React 19 + Vite + Tailwind CSS v4 + Zustand (Phase 1 Web App)
│   └── mobile/                 # React Native + Expo SDK 58 + NativeWind/StyleSheet (Phase 2 Mobile App)
├── server/                     # NestJS / Node.js Backend (REST API + Prisma + PostGIS)
├── packages/
│   ├── types/                  # Shared TypeScript interfaces & DTO types
│   ├── utils/                  # Shared helper functions (distance, PawRank, date/currency formatters)
│   └── validators/             # Shared Zod schemas & Content Moderation rules
├── plan/                       # Tài liệu kế hoạch sản phẩm
├── master_print/               # Bản thiết kế kỹ thuật gốc (SSOT)
└── public/assets/              # Tài nguyên thương hiệu gốc
```

## 3. Tech Stack Chi Tiết
- **Frontend Web (`apps/web`):** React 19, Vite, Tailwind CSS v4, Zustand, Lucide React. Hỗ trợ chế độ xem Khung iPhone giả lập trên Desktop hoặc Fullscreen trên Mobile.
- **Mobile App (`apps/mobile`):**
  - React Native + Expo SDK 58 (`expo`, `react-native`, `expo-status-bar`, `expo-constants`), chạy trực tiếp trên thiết bị thật qua **Expo Go** (`npx expo start --go`).
  - Đồng bộ trực tiếp với Backend API Gateway (`http://<LAN_IP>:3000/api/*`) kèm cơ chế Offline/Local State Fallback mượt mà.
- **Backend (`server`):**
  - API Gateway (`server/src/main.ts`) lắng nghe trên `0.0.0.0:3000` (cho phép kết nối từ cả Web và điện thoại qua mạng LAN), lưu trữ dữ liệu trực tiếp vào PostgreSQL 16 qua Prisma Client (`server/prisma/schema.prisma`).
  - Modular Services: `ModerationService` (4-layer pipeline) và `PawRankAndSpatialService` (PawRank feed ranking + PostGIS `ST_DWithin`).
- **Content Moderation Pipeline (`ModerationService`):**
  - Layer 1: Real-time Auto-Filter (Blacklist từ khóa cấm: mua bán, phối giống, tự kê đơn, ngược đãi).
  - Layer 2: AI Classification (Pet-relevance score, tự động gắn Health Disclaimer `⚕️` khi có từ khóa sức khỏe).
  - Layer 3 & 4: Community Report (3 reports auto-hide) & Admin Review.

- **AI Smart Description Assistant (`GeminiVisionService` + Google Gemini 2.5 Flash):**
  - Tự động phân tích ảnh thú cưng khi chủ nuôi tạo tin SOS.
  - Nhận diện trực quan loài, giống, màu lông, phụ kiện và đặc điểm dị biệt.
  - Tự động sinh đoạn văn mô tả nhận dạng tự nhiên, chi tiết và chuẩn xác bằng tiếng Việt, giúp người dùng tiết kiệm thời gian và công sức viết mô tả trong lúc cấp bách.
