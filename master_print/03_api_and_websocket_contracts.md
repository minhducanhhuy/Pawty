# MASTER PRINT — TẦNG 3: API & WEBSOCKET CONTRACTS

> **Single Source of Truth (SSOT)** — Đồng bộ với các API thực tế của Pawty (100% Free Platform).

---

## 1. REST Endpoints (API Gateway: `0.0.0.0:3000`, Max Body: `35MB`)

### 1.1 Auth, Security Session & Password Protection
- `POST /api/auth/login` (`identifier` [SĐT hoặc Username], `password`) → Xác thực trực tiếp trên PostgreSQL:
  - Băm mật khẩu bằng thuật toán `bcrypt` (10 rounds). Tài khoản cũ dạng văn bản được tự động nâng cấp sang bản băm khi đăng nhập thành công (tránh băm lại bản băm). Mật khẩu sai, rỗng hoặc `NULL` bị từ chối `401`.
  - Cấp token phiên làm việc có chữ ký điện tử HMAC-SHA256 (`token`, `refresh_token`), trả về user đã lọc sạch mật khẩu và bản băm: `{ success: true, token, refresh_token, user, message }`.
- `POST /api/auth/register` (`phone`, `username`, `password`, `displayName`, `district`, `neighborhood`, `petName`, `petSpecies`, `petBreed`) → Lưu mật khẩu đã băm bằng `bcrypt`, trả về `{ success: true, token, refresh_token, user, message }`.
- **Đóng vĩnh viễn các API OTP cũ & đường vòng:**
  - `POST /api/auth/send-otp` & `POST /api/auth/verify-otp` → Trả về `410 Gone` hoặc `404 Not Found`, không tạo user, không cấp token, không trả hồ sơ.
  - `POST /api/auth/register-or-sync` → Trả về `410 Gone` / `404 Not Found` (ngăn chặn bypass phiên chỉ bằng số điện thoại hoặc ID).
- **Nguyên tắc bảo vệ dữ liệu người dùng (Whitelist Sanitizer):** Mọi phản hồi API (login, register, bootstrap, feed bài viết, bình luận, tin báo SOS, thành viên hộ, gợi ý bạn bè) **tuyệt đối không bao giờ chứa trường `password` hay giá trị băm**.

### 1.2 Users, Unified Profiles & Tinder Setup
- `GET /api/users/me` & `PUT /api/users/me` — Yêu cầu `Authorization: Bearer <token>`. Danh tính người thao tác được trích xuất trực tiếp từ phiên xác thực của server (loại bỏ tự chọn user đầu tiên hay `user-test1`). Người dùng chỉ được sửa hồ sơ của chính mình.
- `GET /api/users/profile/:handle?currentUserId=` — Lấy đầy đủ hồ sơ đồng nhất của bất kỳ người dùng nào (thông tin chủ nuôi đầy đủ, danh sách thú cưng kèm sổ tiêm/cân nặng/thói quen, danh sách bài viết, trạng thái `friendStatus` & `isFollowing`). Dữ liệu người dùng trả về được làm sạch không chứa mật khẩu.

### 1.3 Pets CRUD (Không giới hạn số lượng thú cưng)
- `GET /api/pets` — Danh sách thú cưng của người dùng đang đăng nhập.
- `POST /api/pets` — Tạo mới hồ sơ thú cưng gắn với `ownerId` từ phiên đăng nhập.
- `PUT /api/pets/:id` & `DELETE /api/pets/:id` — Kiểm tra quyền sở hữu thú cưng trước khi cập nhật hoặc xóa. Nếu không phải chủ nuôi, trả về `403 Forbidden`.

### 1.4 Social Feed, Posts, Reactions, Comments, Friends & Follows
- `GET /api/posts/feed` & `GET /api/posts/explore` — Danh sách bài viết từ PostgreSQL (tác giả bài viết và tác giả bình luận được lọc sạch mật khẩu).
- `POST /api/posts` (`content`/`text`, `mediaUrls`, `tags`/`hashtags`, `category`) — Tạo bài viết với `authorId` lấy trực tiếp từ phiên làm việc.
- `DELETE /api/posts/:id` — Kiểm tra quyền sở hữu bài viết (`authorId === authUserId`). Nếu không phải tác giả, trả về `403 Forbidden` (ngăn xóa bài của người khác).
- `POST /api/posts/:id/reactions` & `POST /api/posts/:id/comments` — Người thao tác được lấy từ phiên đăng nhập hợp lệ.
- `POST /api/social/friend-request`, `POST /api/social/friend-respond`, `POST /api/social/unfriend`, `POST /api/social/follow` — Người gửi yêu cầu được lấy trực tiếp từ phiên đăng nhập.

### 1.5 Kết Nối Hẹn Dạo (`Tinder`) & Hủy Tương Hợp Chuẩn Xác
- `GET /api/tinder/candidates` & `GET /api/tinder/likes-you` — Trả về danh sách ứng viên cho người dùng từ phiên.
- `POST /api/matches/swipe` & `POST /api/matches/rewind` — Thao tác từ phiên người dùng.
- `POST /api/matches/unmatch` & `POST /api/tinder/unmatch` (`targetIdentifier` / `partnerHandle` / `candidateId`) — **Hủy tương hợp (Bỏ Match):**
  - Lấy người hủy từ phiên đăng nhập.
  - Sau khi chuyển ID hoặc handle của đối phương về user ID thật, **nếu hai ID trùng nhau thì trả về `400 Bad Request` ngay lập tức trước mọi thao tác ghi hoặc xóa**.
  - **Chỉ xóa phòng `dating` có đúng 2 thành viên của cặp đó và tin nhắn thuộc phòng ấy trong một transaction duy nhất**. Giữ nguyên vẹn lịch sử phòng `direct` (xã hội) của cùng cặp và toàn bộ phòng của người thứ ba.
  - Gửi lại cùng yêu cầu sau khi đã thành công đảm bảo an toàn (Idempotent).
  - Hàm lấy danh sách chat `GET /api/chats` không ẩn phòng xã hội khi có trạng thái `unmatched`.

### 1.6 Chat Mạng Xã Hội (Mô Hình Mở) & Chat Hẹn Hò (Cô Lập Danh Tính)
- `GET /api/chats` — Chỉ trả về danh sách cuộc trò chuyện mà người dùng trong phiên là thành viên (`participantIds.includes(authUserId)`). Phòng xã hội vẫn hiển thị đầy đủ kể cả sau khi hủy match hẹn hò.
- `GET /api/chats/:id/messages`, `POST /api/chats/:id/messages`, `DELETE /api/chats/:id/messages` — Kiểm tra tư cách thành viên phòng chat (`authUserId` thuộc `participantIds`). Người ngoài phòng chat bị từ chối `403 Forbidden`.
- `POST /api/chats/open` — Khởi tạo hoặc mở phòng chat.
- `POST /api/chats/:id/read` — Đánh dấu đã đọc tin nhắn cho thành viên phiên.

### 1.7 SOS Miễn Phí & Kiểm Soát Đóng Tin
- `POST /api/sos` — Đăng bài SOS miễn phí gắn với `userId` từ phiên.
- `POST /api/sos/:id/sighting` — Cộng đồng gửi manh mối nhìn thấy thú lạc.
- `POST /api/sos/:id/found` — Xác nhận tìm thấy thú cưng: Kiểm tra quyền sở hữu (`sosAlert.userId === authUserId`). Nếu không phải người tạo tin SOS, trả về `403 Forbidden` (ngăn người khác tự ý đóng tin SOS).
- `POST /api/ai/describe-pet` — Đọc ảnh thú cưng bằng Gemini 2.5 Flash Vision.

### 1.8 Quản Lý Thông Báo & Bootstrap
- `GET /api/bootstrap` — Đồng bộ toàn bộ trạng thái ứng dụng cho tài khoản đã xác thực trong phiên (`Authorization: Bearer <token>`). Nếu thiếu phiên hoặc phiên không hợp lệ, trả về `401 Unauthorized`.
- `GET /api/notifications`, `POST /api/notifications/read-all`, `DELETE /api/notifications` — Thao tác thông báo của tài khoản trong phiên.

### 1.9 Media Upload & Cloudinary Storage Pipeline
- `POST /api/upload` (`{ image: string (base64 hoặc data URI), folder?: string }`) → Tải ảnh lên Cloudinary CDN (`pawty/<folder>`), trả về `{ success: true, url: string, public_id: string }`.
