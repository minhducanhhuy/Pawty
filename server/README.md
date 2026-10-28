# Pawty Fullstack Backend Server (v1.1)

Backend NestJS 10 + Socket.io + Prisma (PostgreSQL/PostGIS) cho siêu ứng dụng **Pawty**. Tuân thủ 100% hợp đồng tại `master_print/01..05` (bao gồm PHỤ LỤC v1.1).

## 1. Cấu trúc thư mục
- `src/common/`: `ResponseEnvelopeInterceptor`, `AllExceptionsFilter`, `DomainException` (`errors.ts`), `JwtAuthGuard`, `RolesGuard`, decorators (`@Public`, `@Roles`, `@PartnerOnly`, `@CurrentUser`, `@ActivePet`).
- `src/config/business-rules.ts`: Nguồn cấu hình duy nhất cho 3 hạng thành viên (`free`, `vip`, `vip_plus`), giá IAP/VIP/SOS, điểm xếp hạng Radar, quy tắc Check-in & Anti-flake.
- `src/adapters/`: Adapter pattern (`sandbox` mặc định + class thật ném `NOT_CONFIGURED` khi thiếu khoá): `otp`, `push`, `media`, `payment`, `places`, `icebreaker`, `ocr`.
- `src/database/`: `DataStoreService` (in-memory kèm lưu bền `data/pawty-db.json` khi `DATA_PERSIST=true`) và `seed-data.ts` (Admin, Moderator, Sen demo, ≥10 Boss tại TP.HCM & Hà Nội, 20 địa điểm Pet-Friendly, CLB, Sự kiện, Partner & Native Ads).
- `src/modules/`: Đầy đủ các module REST & WebSocket (`auth`, `users`, `pets`, `radar`, `walks`, `moments`, `chat`, `appointments`, `places`, `clubs`, `events`, `notifications`, `badges`, `referrals`, `payments`, `sos`, `ads`, `partners`, `admin`, `reports`).
- `src/jobs/`: `SchedulerService` (`@nestjs/schedule`) chạy cron nhắc hẹn 15 phút, nhắc tiêm chủng 30/7/1/0 ngày, nhắc sự kiện 1 giờ, tự động tắt Walk Now / Boost hết hạn, mở khoá quẹt thẻ, reset quota hằng ngày & hằng tuần.

## 2. Tài khoản Seed (Sandbox OTP: `888888`)
- **Admin:** SĐT `0900000000` (`role: admin`)
- **Moderator:** SĐT `0900000001` (`role: moderator`)
- **Sen Demo:** SĐT `0908123456` (`usr_sen_01`, Boss chính: `pet_bo_01` - Bơ Lùn)
- **Partner Demo:** Email `partner@pawtyspa.vn` / Mật khẩu `pawty123`

## 3. Lệnh chạy & Kiểm thử
```bash
# Cài đặt & kiểm tra schema Prisma
npx prisma validate

# Build TypeScript
npm run build

# Chạy bộ test E2E & Unit (Jest + Supertest)
npm test

# Khởi chạy server (mặc định PORT=3000)
npm run start:dev
```
