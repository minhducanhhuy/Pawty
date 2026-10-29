# MASTER PRINT — TẦNG 1: SYSTEM ARCHITECTURE & TECH STACK

> **Single Source of Truth (SSOT)** — Đồng bộ với `plan/01_ecosystem_architecture.md` & `plan/06_technical_architecture.md`.

---

## 1. Kiến Trúc Hệ Sinh Thái 5 Lớp (5-Layer Ecosystem)
1. **Layer 5 — PAWTY PRO:** Công cụ quản lý lịch hẹn, dịch vụ, doanh thu, phản hồi đánh giá cho đối tác (`apps/partner-admin`).
2. **Layer 4 — PAWTY SERVICES:** Đặt lịch Grooming, Khám thú y, Dog Walking từ đối tác đã xác minh.
3. **Layer 3 — PAWTY LOCAL:** Mạng xã hội thú cưng (Pet Feed, PawRank, 7 Content Types, 5 Paw Reactions) + Cộng đồng địa phương (Groups, Q&A, Places Map, Radar).
4. **Layer 2 — PAWTY CIRCLE:** Vòng chăm sóc gia đình/bạn bè (Mời qua mã, phân quyền RBAC, giao việc, xác nhận hoàn thành kèm ảnh, bàn giao tạm thời).
5. **Layer 1 — PAWTY CARE:** Hồ sơ Boss, Sổ tiêm điện tử, Lịch chăm sóc & Nhắc việc thông minh, Ghi chú bàn giao.
6. **FOUNDATION:** Auth (OTP), User/Pet Profiles, RBAC Permissions, Notifications, PostGIS Location, Moderation Pipeline, Privacy & Consent (Luật BVDLCN 91/2025/QH15).

## 2. Cấu Trúc Monorepo (`pawty/`)
```
pawty/
├── apps/
│   ├── web/                    # React 19 + Vite + Tailwind CSS v4 + Zustand (Phase 1 & 2 Web App)
│   ├── mobile/                 # React Native + Expo SDK + NativeWind (Phase 3 Mobile App)
│   └── partner-admin/          # React + Vite Portal cho Đối tác (Pawty Pro) & Admin Moderation/KPIs
├── server/                     # NestJS Backend (REST API + Socket.io Gateway + Prisma + PostGIS)
├── packages/
│   ├── types/                  # Shared TypeScript interfaces & DTO types
│   ├── utils/                  # Shared helper functions (midpoint, PawRank, date/currency formatters)
│   └── validators/             # Shared Zod schemas & Content Moderation rules
├── plan/                       # Tài liệu kế hoạch sản phẩm 9 tầng
├── master_print/               # Bản thiết kế kỹ thuật gốc (SSOT)
└── public/assets/              # Tài nguyên thương hiệu gốc
```

## 3. Tech Stack Chi Tiết
- **Frontend Web (`apps/web` & `apps/partner-admin`):** React 19, Vite, Tailwind CSS v4, Zustand, Lucide React. Hỗ trợ chế độ xem Khung iPhone giả lập trên Desktop hoặc Fullscreen trên Mobile.
- **Mobile App (`apps/mobile`):**
  - React Native + Expo SDK (`expo`, `react-native`, `expo-status-bar`, `expo-constants`), sử dụng `index.js` (`registerRootComponent(App)`), `babel.config.js` (`babel-preset-expo`) và `.npmrc` (`legacy-peer-deps=true`) để chạy trực tiếp trên thiết bị thật qua **Expo Go** (`npx expo start --lan`).
  - Tự động phát hiện IP mạng LAN từ `Constants.expoConfig.hostUri` để đồng bộ trực tiếp với Backend API Gateway (`http://<LAN_IP>:3000/api/*`) kèm cơ chế Offline/Local State Fallback mượt mà.
- **Backend (`server`):**
  - API Gateway (`server/src/main.ts`) lắng nghe trên `0.0.0.0:3000` (cho phép kết nối từ cả Web và điện thoại qua mạng LAN), lưu trữ bền vững vào `server/data/db.json` đồng bộ với lược đồ PostgreSQL 16 + PostGIS (`server/prisma/schema.prisma`).
  - Modular Services: `ModerationService` (4-layer pipeline) và `PawRankAndSpatialService` (PawRank feed ranking + PostGIS `ST_DWithin` / `ST_Centroid` midpoint calculation).
- **Content Moderation Pipeline (`ModerationService`):**
  - Layer 1: Real-time Auto-Filter (Blacklist từ khóa cấm: mua bán, phối giống, tự kê đơn, ngược đãi).
  - Layer 2: AI Classification (Pet-relevance score, tự động gắn Health Disclaimer `⚕️` khi có từ khóa sức khỏe).
  - Layer 3 & 4: Community Report (3 reports auto-hide) & Moderator Review trên `apps/partner-admin`.

