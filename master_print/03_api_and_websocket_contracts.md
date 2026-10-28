# TẦNG 3: ĐẶC TẢ HỢP ĐỒNG API & WEBSOCKET GATEWAY (CONTRACTS)

> **Mã định danh:** `PAWTY-MP-TIER-3`  
> **Phiên bản:** `1.0.0 (Master Blueprint)`  
> **Trạng thái:** `Đã phê duyệt (SSOT)`

---

## 1. TIÊU CHUẨN CHUNG CỦA API (API CONVENTIONS)

- **Base URL:** `http://localhost:3000/api` (Development) / `https://api.pawty.app/api` (Production).
- **Format:** `application/json; charset=utf-8`.
- **Authentication:** `Bearer <JWT_TOKEN>` gửi trong header `Authorization`.
- **Cấu trúc chuẩn phản hồi (Standard Response Body):**
  ```json
  {
    "success": true,
    "statusCode": 200,
    "data": { ... },
    "message": "Thành công",
    "timestamp": "2026-10-19T12:00:00.000Z"
  }
  ```

---

## 2. DANH SÁCH REST API ENDPOINTS

### 2.1. Module Auth (Đăng nhập Google & Username/Password)
- **`POST /api/auth/register`**
  - *Request Body:* `{ "username": "sen_bo", "password": "securePassword123", "fullName": "Nguyễn Văn Sen", "condoComplex": "Vinhomes Central Park" }`
  - *Response 200:* `{ "token": "jwt...", "user": { "id": "...", "username": "sen_bo", "fullName": "..." } }`
- **`POST /api/auth/login`**
  - *Request Body:* `{ "username": "sen_bo", "password": "securePassword123" }`
  - *Response 200:* `{ "token": "jwt...", "user": { ... } }`
- **`POST /api/auth/google`**
  - *Request Body:* `{ "idToken": "google_token_or_profile", "email": "sen@gmail.com", "fullName": "Sen Bơ", "avatarUrl": "..." }`
  - *Response 200:* `{ "token": "jwt...", "user": { ... } }`
- **`POST /api/auth/send-otp`**
  - *Request Body:* `{ "phone": "0908123456" }`
  - *Response 200:* `{ "success": true, "sessionInfo": "firebase_mock_token_123" }`
- **`POST /api/auth/verify-otp`**
  - *Request Body:* `{ "phone": "0908123456", "otpCode": "888888" }`
  - *Response 200:* 
    ```json
    {
      "token": "eyJhbGciOi...",
      "user": {
        "id": "usr_sen_01",
        "phone": "0908123456",
        "isVerified": true,
        "isVip": false
      }
    }
    ```

---

### 2.2. Module Pets & Hồ Sơ (Core 1 & Core 3)
- **`POST /api/pets`**
  - *Request Body:*
    ```json
    {
      "name": "Bơ Lùn",
      "species": "dog",
      "breed": "Corgi Pembroke",
      "gender": "male",
      "isNeutered": true,
      "ageYears": 1,
      "ageMonths": 6,
      "weightKg": 11.2,
      "isVaccinated": true,
      "lastVaccineDate": "15/01/2026",
      "tags": ["Tăng động", "Thân thiện", "Mê xúc xích"],
      "habitsGood": ["Đi vệ sinh bãi cỏ", "Nghe lời"],
      "habitsBad": ["Hay sủa xe máy", "Rượt bồ câu"],
      "bio": "Mông trái tim chân ngắn.",
      "avatarUrl": "https://..."
    }
    ```
- **`GET /api/pets/me`**: Lấy hồ sơ Boss đang đăng nhập của Sen.
- **`GET /api/pets/:id`**: Lấy toàn bộ thông tin chi tiết và 2 tab hồ sơ của Boss bất kỳ.

---

### 2.3. Module Radar & PostGIS Quẹt Thẻ (Core 2)
- **`GET /api/radar`**
  - *Query Params:*
    - `lat` (float, required): Vĩ độ hiện tại của Sen (vd: `10.7951`).
    - `lng` (float, required): Kinh độ hiện tại của Sen (vd: `106.7218`).
    - `radius` (integer, default `1500`): Bán kính tính theo mét (500 - 3000).
    - `species` (string, optional): `'all'`, `'dog'`, `'cat'`.
    - `size` (string, optional): `'all'`, `'small'`, `'medium'`, `'large'`.
    - `verifiedOnly` (boolean, default `false`).
  - *SQL Query:* `ST_DWithin(u.location, ST_MakePoint(lng, lat)::geography, radius)`.
  - *Response 200:* Trả về danh sách Boss xung quanh kèm khoảng cách mét ước tính (`distanceMeters`), kèm các bản ghi `native_ads` được chèn vào vị trí chỉ định.
- **`POST /api/matches`**
  - *Request Body:* `{ "targetPetId": "pet_mochi_02", "action": "like" | "dislike" }`
  - *Logic Khớp Lệnh Match:*
    - Nếu đối phương đã từng LIKE Boss này: Trạng thái đổi thành `'matched'`, kích hoạt tạo phòng chat và gửi thông báo FCM Push Notification.
    - Nếu đối phương chưa LIKE: Trạng thái ghi nhận `'liked'`.
  - *Response 200:* `{ "isMatch": true, "matchedAt": "19:42", "roomId": "room_mochi_01" }`

---

### 2.4. Module Moments - Nhật Ký Bựa (Core 3)
- **`GET /api/moments?filter=all|mine`**: Lấy danh sách ảnh lưới 3 cột.
- **`POST /api/moments`**: Đăng ảnh bựa mới (Kiểm tra quota: nếu không phải VIP và đã quá 5 ảnh -> trả mã lỗi `VIP_STORAGE_LIMIT_REACHED`).
- **`POST /api/moments/:id/like`**: Bấm Thả tim / Bỏ thả tim cho ảnh.

---

### 2.5. Module Kèo Hẹn & Gợi Ý Trung Điểm (Core 4)
- **`GET /api/places/suggestions?petAId=...&petBId=...`**
  - *Logic:* Tính trung điểm GPS của 2 Boss (`ST_Centroid(ST_Collect(locA, locB))`), truy vấn 3 địa điểm `pet_friendly_places` gần trung điểm nhất (bãi cỏ ven sông, quán cafe thú cưng, sân chơi nội khu).
- **`POST /api/appointments`**: Tạo cuộc hẹn dắt Boss dạo chung.
- **`PATCH /api/appointments/:id/status`**
  - *Request Body:* `{ "status": "confirmed" | "rejected" | "reported_flake" }`
  - *Cơ chế phạt bùng kèo:* Nếu status là `reported_flake`, tăng số đếm `flake_reports_count`. Khi đạt 2 lần/tuần, tự động khóa cờ `is_banned_swiping = true` trong 3 ngày.

---

### 2.6. Module Thanh Toán VietQR / PayOS (Monetization)
- **`POST /api/payments/create-qr`**
  - *Request Body:* `{ "serviceType": "sos_emergency" | "vip_subscription", "plan": "month" | "year" }`
  - *Response 200:*
    ```json
    {
      "qrCodeUrl": "https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=...",
      "bankName": "MBBank",
      "accountNo": "999988887777",
      "amount": 39000,
      "paymentCode": "PAWTY SOS 39K"
    }
    ```
- **`POST /api/payments/webhook`**: Nhận tín hiệu chuyển khoản thành công từ ngân hàng, tự động kích hoạt gói VIP hoặc phát sóng báo động SOS bán kính 3km.

---

## 3. ĐẶC TẢ SOCKET.IO GATEWAY EVENTS (REAL-TIME)

Khởi tạo kết nối qua `@WebSocketGateway({ cors: { origin: '*' } })`:

| Tên Event | Chiều gửi | Dữ liệu Payload | Mô Tả |
| :--- | :--- | :--- | :--- |
| `join_room` | Client -> Server | `{ "roomId": "room_mochi_01" }` | Tham gia vào phòng chat riêng của cặp match |
| `send_message` | Client -> Server | `{ "roomId": "...", "text": "...", "appointment": { ... } }` | Gửi tin nhắn hoặc lời mời hẹn |
| `receive_message` | Server -> Client | `{ "id": "...", "senderPetId": "...", "text": "...", "timestamp": "..." }` | Phát tin nhắn cho thiết bị còn lại trong phòng |
| `appointment_status_changed` | Server -> Client | `{ "appointmentId": "...", "status": "confirmed" }` | Đồng bộ trạng thái chốt kèo hoặc từ chối ngay lập tức |
| `fcm_push_notification` | Server -> Device | `{ "title": "...", "body": "...", "type": "match" }` | Bắn thông báo đẩy di động |


---

# PHỤ LỤC v1.1 — HỢP ĐỒNG API & WEBSOCKET CHO P0 + P1

> Mục này **ghi đè** các điểm khác biệt với phần v1.0 phía trên. Server, Mobile, Web, Admin đều phải tuân thủ chính xác.

## 5.1. Quy ước bổ sung
- **Envelope bắt buộc** cho MỌI response (qua `ResponseEnvelopeInterceptor`): `{ "success": true, "statusCode": 200, "data": <payload>, "message": "Thành công", "timestamp": "ISO" }`.
- **Lỗi:** `{ "success": false, "statusCode": 4xx, "error": { "code": "VIP_REQUIRED", "message": "Thông báo thân thiện tiếng Việt" }, "timestamp": "ISO" }` (qua `AllExceptionsFilter`). Mã lỗi nghiệp vụ dùng `UPPER_SNAKE_CASE`.
- **Phân trang:** `?page=1&limit=20` → `data: { "items": [], "page": 1, "limit": 20, "total": 0 }` (áp dụng cho các endpoint đánh dấu 📄).
- **Xác thực:** `Authorization: Bearer <JWT>` (HS256, secret `JWT_SECRET`, hạn 7 ngày; payload `{ sub, role }`). Mặc định mọi route cần JWT; route công khai gắn `@Public()`. Token đối tác riêng: `{ sub, kind: "partner" }`.
- **Boss đang hoạt động:** header tuỳ chọn `X-Pet-Id`; thiếu thì dùng Boss `is_primary`.
- **Ngôn ngữ:** header `Accept-Language: vi|en` (mặc định theo `users.locale`).
- **Sandbox:** OTP luôn là `888888`. Tài khoản seed: Admin `0900000000` (role `admin`), Moderator `0900000001`, Sen demo `0908123456`; Partner demo `partner@pawtyspa.vn` / `pawty123`. Khi tạo tài khoản mới → JWT trả ngay.
- **Adapters** (`server/src/adapters/*`, chọn bằng biến môi trường, mặc định `sandbox`): `OtpProvider` (`OTP_PROVIDER=sandbox|firebase`), `PushProvider` (`PUSH_PROVIDER=sandbox|fcm`), `MediaProvider` (`MEDIA_PROVIDER=sandbox|cloudinary`), `PaymentGateway` (`PAYMENT_GATEWAY=sandbox|vietqr|payos`), `PlacesProvider` (`PLACES_PROVIDER=sandbox|google`), `IcebreakerProvider` (`AI_PROVIDER=sandbox|gemini`), `OcrProvider`. Mọi adapter có interface + class sandbox; class thật chỉ là stub ném `NOT_CONFIGURED` rõ ràng khi thiếu key.

## 5.2. Auth & User
| Method | Path | Body / Query | Response `data` |
| :--- | :--- | :--- | :--- |
| POST | `/auth/send-otp` 🔓 | `{ phone }` | `{ sessionInfo }` |
| POST | `/auth/verify-otp` 🔓 | `{ phone, otpCode, referralCode? }` | `{ token, user, isNewUser }` |
| POST | `/auth/social` 🔓 | `{ provider: "google"|"apple", idToken, phone }` — sandbox chấp nhận `idToken` bất kỳ; **bắt buộc đã/đồng thời xác thực SĐT** | `{ token, user, isNewUser }` |
| GET | `/users/me` | — | `User` đầy đủ (gồm `vipTier`, quota hôm nay, `referralCode`, `walkStreakDays`, `locale`) |
| PATCH | `/users/me` | `{ fullName?, nickname?, avatarUrl?, condoComplex?, latitude?, longitude?, locale?, isDistanceHidden?, notificationPrefs?, fcmToken? }` | `User` |
| DELETE | `/users/me` | — | `{ scheduledHardDeleteAt }` |
| GET | `/users/me/export` | — | JSON toàn bộ dữ liệu cá nhân |
| POST | `/users/blocks` | `{ blockedUserId }` | `{ blocked: true }` |
| DELETE | `/users/blocks/:userId` | — | `{ blocked: false }` |
| GET | `/users/blocks` | — | `User[]` rút gọn |
| POST | `/reports` | `{ targetType, targetId, reason, detail? }` | `{ reportId }` |
| GET | `/media/upload-signature` | `?kind=pet|moment|vaccine` | `{ uploadUrl, method, fields, publicUrl }` (sandbox trả URL ảnh tạm + chấp nhận `data:`/`https:` trực tiếp) |

## 5.3. Pets & Sổ tiêm
| Method | Path | Mô tả |
| :--- | :--- | :--- |
| GET | `/pets/me` | **Trả mảng** `Pet[]` của chủ nuôi (đa Boss) |
| POST | `/pets` | Tạo Boss (vượt quota theo tier → `PET_LIMIT_REACHED`) |
| PATCH | `/pets/:id` | Sửa hồ sơ Boss của mình |
| DELETE | `/pets/:id` | Xoá Boss (không xoá được Boss duy nhất) |
| POST | `/pets/:id/primary` | Đặt Boss chính |
| GET | `/pets/:id` | Chi tiết 2 tab (kèm `isSafePet`, `vaccineStatus`, `vaccineNextDueDate`, `owner`, `badges`) |
| POST | `/pets/:id/vaccine-proof` | `{ proofUrls: string[], vaccineDetails?, lastVaccineDate?, nextDueDate? }` → `vaccineStatus='pending'` |
| GET | `/reminders` | Nhắc lịch của mọi Boss của tôi |
| POST | `/reminders` | `{ petId, kind, title, dueDate }` |
| PATCH | `/reminders/:id` | `{ isDone?, dueDate? }` |

## 5.4. Radar & Match nâng cao
| Method | Path | Mô tả |
| :--- | :--- | :--- |
| GET | `/radar` | Query như v1.0 + `walkingNow=true?`; trả `data: { items: RadarItem[], radiusMeters, totalFound }`. `RadarItem` = `{ type: "pet", pet, distanceMeters, distanceLabel, isBoosted, isWalkingNow, hasSuperLikedMe }` **hoặc** `{ type: "ad", ad }`. Áp dụng thứ tự điểm tại mục 4.3, loại Boss đã quẹt/đã block/đã bị chặn quẹt. |
| POST | `/matches` (alias `/radar/matches`) | `{ targetPetId, action: "like"|"dislike"|"superlike" }` → `{ isMatch, status, roomId?, matchedAt?, quota: { swipesLeft, superLikesLeft } }`. Lỗi: `SWIPE_LIMIT_REACHED`, `SUPER_LIKE_EXHAUSTED`, `SWIPING_BANNED` (kèm `banUntil`) |
| POST | `/matches/rewind` | → `{ restoredPet, quota }` hoặc `VIP_REQUIRED` / `NOTHING_TO_REWIND` |
| GET | `/matches/likes-me` | `{ count, items: Pet[] \| [] }` (free: `items=[]`, chỉ `count`) |
| GET | `/matches` | Danh sách match & `roomId` |
| POST | `/boosts/activate` | → `{ boostExpiresAt }` |
| GET | `/walks/live` | `?lat&lng&radius` → danh sách người đang Walk Now (toạ độ làm tròn 100m) |
| POST | `/walks/start` | `{ lat, lng, petId? }` → `{ walkingUntil }` |
| POST | `/walks/heartbeat` | `{ lat, lng }` (gia hạn + ghi điểm GPS) |
| POST | `/walks/stop` | `{ points?: [{lat,lng,t}] }` → `{ distanceMeters, streakDays, newBadges }` |

## 5.5. Moments, Feed, Comments
| Method | Path | Mô tả |
| :--- | :--- | :--- |
| GET | `/moments` 📄 | `?filter=all|mine&petId?` |
| POST | `/moments` | Như v1.0; lỗi `VIP_STORAGE_LIMIT_REACHED` |
| DELETE | `/moments/:id` | Xoá ảnh của mình |
| POST | `/moments/:id/like` | Toggle thả tim → `{ liked, likesCount }` |
| GET | `/moments/:id/comments` 📄 | — |
| POST | `/moments/:id/comments` | `{ text }` |
| DELETE | `/moments/:id/comments/:commentId` | Chủ comment / chủ ảnh / owner CLB |
| GET | `/moments/:id/share` | `{ shareUrl, imageUrl, caption, watermark: "Pawty" }` (client dựng ảnh có watermark Pawty) |
| GET | `/feed` 📄 | `?lat&lng&radius=3000` → moment khu vực theo thời gian, loại block/ẩn |

## 5.6. Chat, Hẹn dạo, Check-in, Places
| Method | Path | Mô tả |
| :--- | :--- | :--- |
| GET | `/chat/rooms` | Danh sách phòng + tin cuối + `unreadCount` |
| GET | `/chat/rooms/:roomId/messages` 📄 | Lịch sử |
| GET | `/chat/rooms/:roomId/icebreakers` | `{ suggestions: string[3] }` |
| POST | `/appointments` | `{ roomId, receiverPetId, scheduledTime, placeId?, placeName, placeAddress, placeThumbnail, placeLat, placeLng, note? }` |
| PATCH | `/appointments/:id/status` | `confirmed|rejected|reported_flake` (xem 4.5) |
| POST | `/appointments/:id/check-in` | `{ lat, lng }` → `{ checkedIn, isCompleted, newBadges }`; lỗi `CHECKIN_WINDOW_CLOSED`, `TOO_FAR_FROM_PLACE` |
| GET | `/places/suggestions` | `?petAId&petBId` → 3 địa điểm gần trung điểm (kèm `midpoint`) |
| GET | `/places` 📄 | `?lat&lng&radius&category&q` |
| GET | `/places/:id` | Chi tiết + 5 review mới nhất |
| POST | `/places/:id/reviews` | `{ rating, text }` |

## 5.7. Cộng đồng
| Method | Path | Mô tả |
| :--- | :--- | :--- |
| GET | `/clubs` 📄 | `?type&q&mine=true` |
| POST | `/clubs` | `{ name, type, breedOrBuilding, description, coverUrl? }` |
| GET | `/clubs/:id` | Chi tiết + `isMember` + 3 sự kiện sắp tới |
| POST | `/clubs/:id/join` · `/leave` | — |
| GET | `/events` 📄 | `?clubId&upcoming=true&lat&lng` |
| POST | `/events` | `{ clubId?, title, description, coverUrl?, placeName, lat, lng, startsAt, capacity }` |
| POST | `/events/:id/rsvp` | `{ status: "going"|"maybe"|"none" }` → `{ rsvpCount }` / `EVENT_FULL` |

## 5.8. Thông báo, Huy hiệu, Referral
| Method | Path | Mô tả |
| :--- | :--- | :--- |
| GET | `/notifications` 📄 | `{ items, unreadCount }` |
| POST | `/notifications/read` | `{ ids?: string[] }` (rỗng = đọc hết) |
| GET | `/badges/me` | `{ earned: Badge[], locked: Badge[withProgress] }` |
| GET | `/referrals/me` | `{ code, invitedCount, rewardDaysGranted, shareUrl }` |
| GET | `/streak/me` | `{ streakDays, lastWalkDate, totalWalkMeters, recentWalks }` |

## 5.9. Thanh toán & Quảng cáo
| Method | Path | Mô tả |
| :--- | :--- | :--- |
| POST | `/payments/create-qr` | `serviceType` ∈ `sos_emergency`,`vip_subscription`,`vip_plus_subscription`,`boost`,`boost_pack`,`super_like_pack`; `plan?` `month|year`; trả `{ transactionId, qrCodeUrl, bankName, accountNo, amount, paymentCode, expiresAt }` |
| GET | `/payments/:transactionId` | `{ status }` (client poll mỗi 3s) |
| POST | `/payments/webhook` 🔓 | Chữ ký `X-Pawty-Signature` (HMAC với `PAYMENT_WEBHOOK_SECRET`); idempotent theo `paymentCode` |
| POST | `/payments/sandbox/confirm` | Chỉ khi `PAYMENT_GATEWAY=sandbox`: duyệt giao dịch ngay |
| POST | `/sos` | Tạo tin SOS sau khi giao dịch `paid` → push cho user trong 3km |
| GET | `/sos/nearby` | `?lat&lng` → SOS đang `active` trong 3km |
| POST | `/sos/:id/resolve` | Đánh dấu đã tìm thấy |
| POST | `/ads/:id/impression` · `/click` | Ghi nhận; `click` trừ CPC |
| POST | `/ads/:id/save-voucher` | → `Voucher` (`ALREADY_SAVED`) |
| GET | `/vouchers/me` | Ví voucher |

## 5.10. Admin API (`role` ∈ admin/moderator; prefix `/admin`)
| Method | Path | Mô tả |
| :--- | :--- | :--- |
| GET | `/admin/kpi` | KPI mục 4.12 (kèm chuỗi 14 ngày) |
| GET | `/admin/users` 📄 · `PATCH /admin/users/:id` | Tìm, khoá/mở khoá quẹt, đổi role (chỉ admin), cấp VIP |
| GET | `/admin/vaccine-queue` 📄 · `POST /admin/pets/:id/vaccine-decision` | `{ decision: "verified"|"rejected", nextDueDate?, reason? }` |
| GET | `/admin/reports` 📄 · `PATCH /admin/reports/:id` | `{ status, action?: "warn"|"hide_content"|"ban_user" }` |
| GET | `/admin/transactions` 📄 | Lọc theo `type`, `status` |
| GET | `/admin/partners` 📄 · `PATCH /admin/partners/:id` | Duyệt/đình chỉ |
| GET | `/admin/ads` 📄 · `PATCH /admin/ads/:id` | Duyệt/tạm dừng |
| GET | `/admin/sos` · `GET /admin/audit-logs` 📄 | — |

## 5.11. Partner API (prefix `/partners`, token đối tác)
| Method | Path | Mô tả |
| :--- | :--- | :--- |
| POST | `/partners/register` 🔓 | `{ businessName, category, contactEmail, password, phone, address, lat, lng }` → `pending` |
| POST | `/partners/auth/login` 🔓 | `{ email, password }` → `{ token, partner }` |
| GET | `/partners/me` | Hồ sơ + số dư |
| POST | `/partners/me/topup` | `{ amountVnd }` → tạo QR (sandbox duyệt ngay) |
| GET/POST | `/partners/ads` · PATCH `/partners/ads/:id` | Quản lý chiến dịch (`title, description, imageUrl, discountPercent, voucherQuota, radiusMeters, startsAt, endsAt, status`) |
| GET | `/partners/ads/:id/stats` | `{ impressions, clicks, vouchersIssued, vouchersRedeemed, spendVnd }` |
| POST | `/partners/vouchers/redeem` | `{ code }` → `{ redeemed: true, discountPercent }` |

## 5.12. WebSocket (Socket.io) — bổ sung
Kết nối kèm `auth: { token }`. Phòng cá nhân tự động `user:<userId>`.
| Event | Chiều | Payload |
| :--- | :--- | :--- |
| `join_room` / `send_message` / `receive_message` / `appointment_status_changed` / `fcm_push_notification` | như v1.0 | `receive_message` thêm `status` (`sent`,`delivered`,`read`) |
| `typing` | C↔S | `{ roomId, isTyping }` |
| `mark_read` | C→S | `{ roomId }` → S phát `messages_read` `{ roomId, readerUserId }` |
| `notification_created` | S→C | `Notification` (cập nhật chuông thông báo realtime) |
| `location_share_start` | C→S | `{ roomId, appointmentId }` (server kiểm điều kiện 4.10) |
| `location_update` | C→S | `{ roomId, lat, lng }` (≤1 lần/5 giây) |
| `partner_location` | S→C | `{ roomId, userId, lat, lng, updatedAt }` |
| `location_share_stop` | C↔S | `{ roomId }` |
| `walking_now_changed` | S→C | `{ userId, isWalkingNow }` (cập nhật chấm xanh Radar) |


## 5.13. Cấu hình công khai & Health
| Method | Path | Mô tả |
| :--- | :--- | :--- |
| GET | `/config/public` 🔓 | `{ tiers: { free, vip, vip_plus: { quotas..., priceMonthVnd, priceYearVnd } }, products: { boost, superLikePack, boostPack }, sos: { priceVnd, radiusKm }, radar: { minRadius, maxRadius, adEveryMin, adEveryMax }, i18n: ["vi","en"] }` — sinh trực tiếp từ `business-rules.ts` |
| GET | `/health` 🔓 | `{ status: "ok", uptime, version, adapters: { otp, push, media, payment, places, ai } }` |


## Ghi chú triển khai
- **`GET /api/places/suggestions` & `GET /api/appointments/suggestions`:** Trả đồng thời `{ midpoint, suggestions, items }` (trong đó `suggestions` và `items` cùng chứa 3 địa điểm gần trung điểm nhất) để tương thích cả Mobile client v1.1 lẫn Web demo v1.0.
- **`POST /api/referrals/apply`:** Bổ sung endpoint cho phép người dùng mới (trong 7 ngày đầu, chưa nhập mã lúc `verify-otp`) áp dụng bổ sung `referralCode`.
- **`POST /api/payments/webhook`:** Chữ ký `X-Pawty-Signature` (HMAC-SHA256 với `PAYMENT_WEBHOOK_SECRET`) chấp nhận chữ ký tính trên chuỗi JSON body hoặc trên `paymentCode`, đảm bảo idempotent theo `paymentCode`.
- **Báo cáo bùng kèo (`PATCH /api/appointments/:id/status` với `status='reported_flake'`):** Khi có ít nhất một bên đã Check-in GPS (`POST /api/appointments/:id/check-in`), chỉ bên đã Check-in mới có quyền báo cáo bùng kèo (bên chưa Check-in gọi sẽ nhận lỗi `FLAKE_REPORT_NOT_ELIGIBLE`).
