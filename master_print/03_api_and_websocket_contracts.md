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

### 2.1. Module Auth (Định danh SĐT thật)
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
