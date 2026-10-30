# Kế Hoạch Triển Khai: Hệ Thống AI Truy Vết Thú Cưng Thất Lạc Qua Mạng Xã Hội (AI Pet Tracing & Crowd Sighting)

> **Mục tiêu:** Tận dụng dữ liệu hình ảnh, văn bản check-in từ bài đăng mạng xã hội (Pet Feed) và manh mối cộng đồng để AI tự động trích xuất đặc điểm, định vị không gian - thời gian, từ đó xâu chuỗi lộ trình di chuyển (Spatiotemporal Trajectory) giúp chủ nuôi tìm lại Boss thất lạc nhanh nhất.

---

## 1. Mục Tiêu Nghiệp Vụ & Tiêu Chí Hoàn Thành (Goal & Definition of Done)

- **Mục tiêu cốt lõi:**
  1. Khi người dùng đăng ảnh/bài viết trên Feed hoặc gửi manh mối, AI tự động phân tích ảnh (giống, màu lông, vòng cổ) và vị trí văn bản.
  2. Tự động so khớp với các tin `SosAlert` đang hoạt động trong bán kính 3km.
  3. Nếu độ tương đồng $\ge 70\%$, tự động xâu chuỗi thành **Lộ trình di chuyển phỏng đoán** (Trajectory Map) và bắn Push Notification cho chủ nuôi.
- **Tiêu chí hoàn thành (Done When):**
  - [x] Cập nhật Master Print (`02_database_schema_and_models.md`, `03_api_and_websocket_contracts.md`, `04_screen_specifications_and_user_flows.md`).
  - [x] Module `PetTracingService` trên backend hoàn thành việc tính điểm tương đồng đa phương thức (Vision + NLP + Không gian thời gian).
  - [x] API `GET /api/sos/:id/trajectory` trả về danh sách các bài đăng/manh mối liên quan kèm tọa độ và đường nối lộ trình di chuyển.
  - [x] Giao diện `MobileSosScreen` hiển thị Tab bản đồ **"AI Radar Truy Vết"** với các điểm mốc $(t_0, p_0) \rightarrow (t_1, p_1) \rightarrow (t_2, p_2)$ kèm độ tương đồng %.
  - [x] Trên bài viết Feed xuất hiện huy hiệu nhận diện: *"AI nghi vấn: Khớp 88% với tin SOS Mochi"*.

---

## 2. Bảng Phân Bổ Kỹ Năng Hệ Thống (Skills Matrix & Tooling)

Dự án kích hoạt và tích hợp các kỹ năng chuyên biệt theo từng phân tầng kỹ thuật:

| Nhóm kỹ năng | Tên Skill | Vai trò & Trách nhiệm cụ thể trong tính năng |
|---|---|---|
| **AI Thị giác & Đa phương thức** | `ck:ai-multimodal` | Xử lý Vision Analysis trên ảnh bài đăng: phân tích giống loài, màu lông chủ đạo/phụ, phụ kiện vòng cổ, trích xuất vector đặc trưng nhận diện thú cưng (Pet Visual Signatures). |
| **Không gian địa lý & CSDL** | `geo-fundamentals`<br>`ck:databases` | Thiết kế cấu trúc bảng `pet_sighting_matches`, chỉ mục không gian GIST trên PostGIS, tối ưu truy vấn không gian `ST_DWithin` lọc tin trong bán kính 3km. |
| **Thiết kế API & Kiến trúc Backend** | `api-patterns`<br>`ck:backend-development` | Xây dựng RESTful API contracts cho endpoint `GET /api/sos/:id/trajectory`, chuẩn hóa cấu trúc DTOs và sự kiện WebSocket `sos:ai_sighting_detected`. |
| **Giao diện Di động Native** | `mobile-design`<br>`ck:mobile-development` | Thiết kế giao diện Tab "AI Radar Truy Vết" trên React Native + Expo (`MobileSosScreen`), biểu diễn đồ thị lộ trình $(t_1 \rightarrow t_2)$, tối ưu trải nghiệm chạm và hoạt cảnh 60 FPS. |
| **Giao diện Web & Styling** | `frontend-design`<br>`tailwind-patterns` | Tạo huy hiệu cảnh báo AI Match trên bài viết Feed (`ExploreScreen`), popup xác nhận manh mối của chủ nuôi, tương thích chuẩn Tailwind CSS v4. |
| **Kiến trúc Mã nguồn Sạch** | `clean-code`<br>`architecture` | Đảm bảo nguyên tắc Đơn trách nhiệm (SRP), tách biệt module toán học `PetTracingService`, xử lý lỗi chủ động `try...catch` không để chết ngầm. |
| **Kiểm thử & Đảm bảo Chất lượng** | `testing-patterns`<br>`lint-and-validate` | Thiết lập kịch bản kiểm thử luồng tích hợp toàn trình (End-to-End Test Scenario), kiểm tra tính tương thích kiểu TypeScript trên toàn Monorepo. |

---

## 3. Phân Tích Hiện Trạng Ứng Dụng (Codebase Readiness)

| Thành phần hiện có trong Pawty | Mức độ sẵn sàng | Khả năng tận dụng |
|---|---|---|
| **Mạng xã hội Pet Feed (`SocialPost`)** | 90% | Đã có trường `media` (ảnh), `textContent` (bài viết), `locationName`, `speciesTags`, `breedTags`, `createdAt`. |
| **Hệ thống SOS cơ sở (`SosAlert`, `SosSighting`)** | 80% | Đã có thông tin Boss mất tích, ảnh đại diện, tọa độ `lastSeenCoords`, bán kính 3km, hệ thống nhận manh mối `sighting`. |
| **Công cụ toán học & Không gian (`@pawty/utils`)** | 85% | Đã có sẵn hàm `calculateDistanceMeters` (PostGIS Haversine), tính toán khoảng cách và lọc bán kính. |
| **Pipeline Kiểm duyệt (`ModerationService`)** | 75% | Đã có sẵn hook bắt sự kiện khi tạo bài viết mới (`POST /api/posts`), dễ dàng cắm thêm worker phân tích ảnh/text AI. |
| **Bản đồ & Giao diện SOS Mobile (`MobileSosScreen.tsx`)** | 70% | Đã có danh sách tin SOS, form báo manh mối kèm ảnh, cần bổ sung view Bản đồ nhiệt & Lộ trình vết tích. |

---

## 4. Kiến Trúc Giải Pháp Kỹ Thuật (Architecture Design)

```
[Người dùng đăng bài lên Feed / Báo manh mối]
                     │
                     ▼
       [Pipeline Moderation & AI Worker]  ◄── (Sử dụng: ck:ai-multimodal)
       ├── 1. Vision Feature Extractor:
       │      • Nhận diện: Chó/Mèo, Giống (Poodle, Corgi...), Màu lông (Nâu đỏ, Trắng...)
       │      • Phụ kiện: Vòng cổ (xanh/đỏ/chuông), Áo nơ
       │      • Tạo Visual Signature Vector
       │
       └── 2. NLP Location & Temporal Extractor:
              • Trích xuất Landmark từ text: "cổng S1.02", "công viên bờ sông"
              • Ánh xạ tọa độ GeoPoint (lat, lng)
                     │
                     ▼
    [Spatiotemporal Matching Engine - PetTracingService]  ◄── (Sử dụng: geo-fundamentals & clean-code)
    So sánh với các SosAlert đang ACTIVE trong bán kính 3km:
    • Điểm thị giác (Vision Match): Sim(Visual_A, Visual_B)  [Trọng số 45%]
    • Điểm văn bản (Text/Breed Match): Sim(Breed, Color)     [Trọng số 25%]
    • Tính hợp lý không gian-thời gian (Kinematic Check):     [Trọng số 30%]
      v = (Khoảng cách giữa 2 điểm) / (Khoảng thời gian) <= 8 km/h
                     │
                     ▼
         {Match Score >= 70%?}
        ├── CÓ ──► Gắn bài đăng vào `SosAlert.matchedSightings`
        │         ──► Tính lại Trajectory (Xâu chuỗi lộ trình)
        │         ──► Bắn FCM Push Notification cho Chủ nuôi
        └── KHÔNG ─► Lưu trữ bình thường trên Feed
```

---

## 5. Danh Sách Nhiệm Vụ Triển Khai Chi Tiết (Actionable Tasks)

### Giai đoạn 1: Master Print First (Cập nhật Thiết kế SSOT)
*(Kỹ năng áp dụng: `ck:databases`, `api-patterns`, `mobile-design`)*
- [x] **Task 1.1:** Cập nhật `master_print/02_database_schema_and_models.md` bổ sung bảng `pet_sighting_matches` và trường `visual_signatures` trong `SosAlert`.
- [x] **Task 1.2:** Cập nhật `master_print/03_api_and_websocket_contracts.md` đặc tả endpoint `GET /api/sos/:id/trajectory` và sự kiện Socket `sos:ai_sighting_detected`.
- [x] **Task 1.3:** Cập nhật `master_print/04_screen_specifications_and_user_flows.md` đặc tả màn hình Radar truy vết trên Mobile & Web.

### Giai đoạn 2: Types, Models & Backend Engine
*(Kỹ năng áp dụng: `ck:ai-multimodal`, `geo-fundamentals`, `ck:backend-development`, `clean-code`)*
- [x] **Task 2.1:** Thêm kiểu dữ liệu `PetVisualSignature`, `SightingTrajectoryPoint`, `SosMatchedPost` vào `packages/types/src/index.ts`.
- [x] **Task 2.2:** Xây dựng module `server/src/modules/sos/pet-tracing.service.ts`:
  - Trích xuất đặc trưng thị giác từ ảnh (giống, màu sắc, phụ kiện).
  - Trích xuất thực thể vị trí từ văn bản bài đăng (NLP Landmark Geocoding cho các đại đô thị).
  - Thuật toán tính độ tương đồng đa phương thức (Multimodal Score) và bộ lọc động học (Kinematic Check $\le 8\text{ km/h}$).
  - Thuật toán sắp xếp xâu chuỗi lộ trình di chuyển theo mốc thời gian $(T_0 \rightarrow T_1 \dots)$.
- [x] **Task 2.3:** Tích hợp hook phân tích tự động vào `POST /api/posts` trong `server/src/main.ts`: Khi có bài đăng mới có ảnh hoặc vị trí, tự động quét so khớp với các tin SOS đang mở trong bán kính 3km.
- [x] **Task 2.4:** Thêm endpoint `GET /api/sos/:id/trajectory` trả về tọa độ điểm xuất phát, các điểm phát hiện nghi vấn, và polyline lộ trình phỏng đoán.

### Giai đoạn 3: Giao Diện Mobile & Web Client
*(Kỹ năng áp dụng: `ck:mobile-development`, `mobile-design`, `frontend-design`, `tailwind-patterns`)*
- [x] **Task 3.1:** Cập nhật `apps/mobile/src/screens/MobileSosScreen.tsx`: Thêm component `SosTrajectoryMap` trực quan hóa các điểm nhìn thấy $(t_1, t_2, t_3)$, độ tương đồng % và liên kết mở bài viết gốc.
- [x] **Task 3.2:** Thêm huy hiệu nhận diện trên bài đăng Feed (`MobileExploreScreen.tsx` & `ExploreScreen.tsx` Web): Tag "🔍 AI phát hiện: Khớp 88% với tin SOS Mochi".
- [x] **Task 3.3:** Bổ sung Modal xác nhận manh mối cho chủ nuôi: "Có phải Boss của bạn không?" (Xác nhận giúp hoàn thiện lộ trình / Bỏ qua nếu nhầm lẫn).

### Giai đoạn 4: Kiểm Thử & Nghiệm Thu (Verification)
*(Kỹ năng áp dụng: `testing-patterns`, `lint-and-validate`)*
- [x] **Task 4.1:** Kiểm thử luồng tích hợp: Dữ liệu mẫu SOS bé Coca / Mochi với chuỗi 3 điểm mốc $(t_0 \rightarrow t_1 \rightarrow t_2)$, tính năng xác nhận manh mối và đường nối lộ trình.
- [x] **Task 4.2:** Xác thực tính toàn vẹn cấu trúc dữ liệu JSON và mã nguồn TypeScript.
- [x] **Task 4.3:** Cập nhật đồ thị mã nguồn và tài liệu SSOT đồng bộ 100%.
