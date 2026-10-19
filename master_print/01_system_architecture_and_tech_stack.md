# TẦNG 1: KIẾN TRÚC HỆ THỐNG & TECH STACK FULL-STACK

> **Mã định danh:** `PAWTY-MP-TIER-1`  
> **Phiên bản:** `1.0.0 (Master Blueprint)`  
> **Trạng thái:** `Đã phê duyệt (SSOT)`

---

## 1. SƠ ĐỒ TỔNG THỂ KIẾN TRÚC HỆ THỐNG

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PAWTY CLIENT APPLICATION                         │
│   • Phase 1: React 19 + Vite (Web Mock Mobile Frame)                   │
│   • Phase 2: React Native & Expo SDK 57 (iOS / Android Native)         │
└──────────────────┬─────────────────────────────────┬───────────────────┘
                   │ HTTPS REST API                  │ WebSocket (Socket.io)
                   ▼                                 ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        NESTJS BACKEND GATEWAY                          │
│   • Controllers: Auth, Users, Pets, Radar, Moments, Chat, Payments     │
│   • Gateways: ChatGateway (@WebSocketGateway)                          │
│   • Services: PostGisRadarService, NotificationService, PaymentService │
└──────┬──────────────────┬─────────────────┬──────────────────┬─────────┘
       │                  │                 │                  │
       ▼                  ▼                 ▼                  ▼
┌──────────────┐   ┌──────────────┐  ┌──────────────┐   ┌──────────────┐
│  PostgreSQL  │   │  Cloudinary  │  │   Firebase   │   │    VietQR    │
│   + PostGIS  │   │   / AWS S3   │  │  Auth & FCM  │   │    / PayOS   │
│ (Geography)  │   │ (Media CDN)  │  │ (SMS & Push) │   │ (Dynamic QR) │
└──────────────┘   └──────────────┘  └──────────────┘   └──────────────┘
```

---

## 2. CHI TIẾT TECH STACK FULL-STACK

### 2.1. Frontend (Mobile & Web)
- **Công nghệ nền:** React 19 (Web Demo) -> React Native + Expo (Mobile App Native).
- **Chiến lược giải quyết giới hạn phiên bản Expo (Expo Dev Client & Zero Lock-in):**
  - **Mức 1 (Expo Go):** Dùng để test siêu tốc giao diện, logic quẹt thẻ, chat, và mock data (không cần build APK).
  - **Mức 2 (Expo Development Build - `expo-dev-client`):** Khi cần tích hợp các thư viện native có version đặc thù hoặc SDK riêng (Firebase Auth, PayOS, Native Push, Google Maps/Mapbox), ta chạy lệnh `npx expo run:android` (hoặc EAS Build) để tạo ra file APK Development của riêng Pawty. Cài file APK này 1 lần duy nhất vào điện thoại, sau đó **vẫn dùng lệnh `npx expo start` quét mã QR và Hot Reload bình thường** mà KHÔNG BỊ GIỚI HẠN bởi danh sách thư viện của Expo Go.
  - **Mức 3 (Continuous Native Generation - `npx expo prebuild`):** Bất kỳ lúc nào cần can thiệp trực tiếp vào mã nguồn Java/Kotlin/C++ hoặc Gradle, chỉ cần chạy lệnh `expo prebuild`, toàn bộ thư mục native `android/` và `ios/` sẽ được xuất ra hoàn toàn giống như React Native CLI thuần túy (Zero Lock-in).
  - **Quản lý tương thích thư viện:** Bắt buộc dùng `npx expo install <package>` thay vì `npm install` để hệ thống tự động chốt phiên bản tương thích 100% với SDK đang dùng.
- **Styling:** Tailwind CSS v4 trên Web -> NativeWind / StyleSheet trên React Native.
- **State Management:** React Context API + Custom Hooks (`useApp`, `useRadar`, `useChat`).
- **Icons:** `lucide-react` (hoặc `@expo/vector-icons`).
- **Tương tác:** Gesture handler (`react-native-deck-swiper` hoặc CSS drag physics), `canvas-confetti` cho hiệu ứng ăn mừng.

### 2.2. Backend (API & Real-time Server)
- **Framework:** **NestJS 10+** (TypeScript).
- **Giao thức:**
  - RESTful APIs cho xác thực, hồ sơ, khoảnh khắc, radar và thanh toán.
  - WebSockets (**Socket.io**) cho phòng chat và cập nhật trạng thái lịch hẹn tức thì.
- **ORM / Query Builder:** Prisma ORM hoặc TypeORM hỗ trợ PostGIS (`ST_DWithin`, `ST_Distance`).
- **Xác thực phiên:** JWT Token (JsonWebToken) ký từ Backend sau khi xác minh Firebase IdToken.

### 2.3. Cơ sở dữ liệu (Database)
- **Hệ quản trị:** **PostgreSQL 16+**.
- **Extension không gian địa lý:** **PostGIS 3.4+**.
- **Kiểu dữ liệu tọa độ:** `GEOGRAPHY(Point, 4326)` (Hệ quy chiếu WGS 84 tính toán khoảng cách mét thực tế trên mặt cầu Trái Đất).
- **Câu lệnh truy vấn Radar mẫu:**
  ```sql
  SELECT p.*, ST_Distance(u.location, ST_MakePoint(:lng, :lat)::geography) AS distance_meters
  FROM pets p
  JOIN users u ON p.user_id = u.id
  WHERE ST_DWithin(u.location, ST_MakePoint(:lng, :lat)::geography, :radius_meters)
    AND p.id NOT IN (SELECT target_pet_id FROM matches WHERE sender_pet_id = :my_pet_id)
  ORDER BY distance_meters ASC;
  ```

### 2.4. Lưu trữ đa phương tiện & Dịch vụ bên thứ ba
- **Cloudinary / AWS S3:** Client tải ảnh/video trực tiếp qua Pre-signed URL để tối ưu băng thông máy chủ NestJS.
- **Firebase Authentication:** Gửi mã xác thực OTP SMS đến số điện thoại thật của chủ nuôi.
- **Firebase Cloud Messaging (FCM):** Bắn Push Notification thời gian thực khi có Match mới, tin nhắn mới, nhắc lịch dạo trước 15 phút, và báo động SOS.
- **VietQR / PayOS:** Tạo mã QR ngân hàng động tự động điền số tiền (39.000đ SOS, 49.000đ VIP) và cú pháp nội dung chuyển khoản để tự động kích hoạt dịch vụ qua Webhook.

---

## 3. CẤU TRÚC THƯ MỤC DỰ ÁN MONOREPO CHUẨN

```
Pawty/
├── .agents/                      # Toàn bộ quy tắc, workflow, skills của AI Agent
├── master_print/                 # NGUỒN CHÂN LÝ DUY NHẤT (SSOT) - BẢN THIẾT KẾ
│   ├── 00_overview_and_brand_system.md
│   ├── 01_system_architecture_and_tech_stack.md
│   ├── 02_database_schema_and_models.md
│   ├── 03_api_and_websocket_contracts.md
│   ├── 04_screen_specifications_and_user_flows.md
│   └── 05_monetization_and_business_rules.md
├── public/
│   └── assets/                   # Assets chuẩn (Logo, Icon, QR)
│       ├── pawty-icon.png
│       └── pawty-logo-full.png
├── src/                          # FRONTEND CLIENT (React/Vite -> Expo Native)
│   ├── components/
│   │   ├── common/               # DeviceFrame, BottomNav
│   │   ├── onboarding/           # OnboardingModal (OTP, Profiling)
│   │   ├── radar/                # RadarScreen, MatchModal, RadarFilterModal
│   │   ├── profile/              # PetProfileScreen, UploadMomentModal
│   │   ├── chat/                 # ChatListScreen, ChatRoomScreen, WalkSchedulerModal
│   │   └── monetization/         # SosModal, VipModal
│   ├── context/                  # AppContext (Global State & Event Simulation)
│   ├── data/                     # Mock Data chuẩn phục vụ kiểm thử
│   ├── services/                 # StorageService (Local Storage & API Client)
│   └── types/                    # TypeScript interfaces & types
└── server/                       # BACKEND (NestJS API & Socket Server - Chuẩn bị khởi tạo)
    ├── src/
    │   ├── modules/
    │   │   ├── auth/
    │   │   ├── users/
    │   │   ├── pets/
    │   │   ├── radar/
    │   │   ├── moments/
    │   │   ├── chat/
    │   │   ├── appointments/
    │   │   └── payments/
    │   └── main.ts
    └── prisma/schema.prisma
```
