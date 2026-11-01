# MASTER PRINT — TẦNG 3: API & WEBSOCKET CONTRACTS

> **Single Source of Truth (SSOT)** — Đồng bộ với các API thực tế của Pawty (100% Free Platform).

---

## 1. REST Endpoints (API Gateway: `0.0.0.0:3000`, Max Body: `25MB`)

### 1.1 Auth & Onboarding
- `POST /api/auth/login` (`identifier` [SĐT hoặc Username], `password`) → Xác thực trực tiếp trên PostgreSQL, trả về `{ success, token, user, message }`.
- `POST /api/auth/register` (`phone`, `username`, `password`, `displayName`, `district`, `neighborhood`, `petName`, `petSpecies`, `petBreed`) → Trả về `{ success, token, user, message }`.

### 1.2 Users, Unified Profiles & Tinder Setup
- `GET /api/users/me?userId=` & `PUT /api/users/me` (`userId`, `displayName`, `avatarUrl`, `coverUrl`, `bio`, `district`, `neighborhood`, `gender`, `age`, `birthDate`, `zodiac`, `mbti`, `occupation`, `education`, `noteBubble`, `privacySettings`, `tinderSetup` gồm `lookingFor` chọn 1 mục đích duy nhất).
- `GET /api/users/profile/:handle?currentUserId=` — Lấy đầy đủ hồ sơ đồng nhất của bất kỳ người dùng nào (thông tin chủ nuôi đầy đủ, danh sách thú cưng kèm sổ tiêm/cân nặng/thói quen, danh sách bài viết, trạng thái `friendStatus` & `isFollowing`).

### 1.3 Pets CRUD (Không giới hạn số lượng thú cưng)
- `GET /api/pets?userId=` — Danh sách thú cưng của người dùng.
- `POST /api/pets` — Tạo mới hồ sơ thú cưng trong PostgreSQL (tự động tạo `Household` nếu tài khoản chưa có, lưu đầy đủ `goodHabits`, `cautionHabits`, `vaccineRecords`, `weightHistory`, `favoriteFood`, `dewormingHistory`, `medicalHistory`, `galleryUrls`).
- `PUT /api/pets/:id` — Cập nhật toàn diện hồ sơ thú cưng trong PostgreSQL.
- `DELETE /api/pets/:id` — Xóa hồ sơ thú cưng khỏi PostgreSQL.

### 1.4 Social Feed, Posts, Reactions, Comments, Friends & Follows
- `GET /api/posts/feed` & `GET /api/posts/explore` — Danh sách bài viết từ PostgreSQL (hỗ trợ Pull-to-refresh).
- `POST /api/posts` (`authorId`/`userId`, `content`/`text`, `mediaUrls`, `mediaType`, `tags`/`hashtags`, `category`) — Lưu bài viết mới vào PostgreSQL và tự động gửi thông báo `new_post` cho toàn bộ người đang theo dõi tác giả.
- `DELETE /api/posts/:id` — Xóa bài viết khỏi PostgreSQL.
- `POST /api/posts/:id/reactions` (`userId`, `reactionType`) — Thả cảm xúc Paw / Tim và tạo thông báo `post_reaction` cho tác giả.
- `POST /api/posts/:id/comments` (`userId`, `content`, `parentId`) — Bình luận bài viết và tạo thông báo `post_comment` cho tác giả.
- `POST /api/social/friend-request` (`fromUserId`, `toHandle` / `toUserId`) — Gửi lời mời kết bạn, lưu vào DB và tạo thông báo `friend_request` (`status: 'pending'`) cho người nhận.
- `POST /api/social/friend-respond` (`userId`, `requesterId` / `notificationId`, `action: 'accept' | 'decline'`) — Chấp nhận hoặc từ chối lời mời kết bạn; nếu chấp nhận, tạo `Conversation` chung và bắn thông báo `friend_accepted` cho người gửi!
- `POST /api/social/unfriend` (`userId`, `targetHandle` / `targetUserId`) — Hủy kết bạn (`status = 'unfriended'`), khóa quyền gửi tin nhắn mới giữa hai người.
- `POST /api/social/follow` (`followerId`, `targetHandle` / `targetUserId`) — Theo dõi / Bỏ theo dõi người dùng; khi theo dõi mới, gửi thông báo `follow` cho đối phương.

### 1.5 Kết Nối Hẹn Dạo (`Tinder` — Miễn phí 100%, Không giới hạn 160km)
- `GET /api/tinder/candidates?intent=&userId=&maxDistanceKm=` — Trả về danh sách ứng viên kèm `hasLikedMe` thực tế từ bảng `matches`, `lookingFor` đồng bộ từ `primaryNeed`/`tinderSetup`, hỗ trợ lọc không giới hạn khoảng cách (`all` hoặc bất kỳ km nào). **Quy tắc nạp cọc thẻ:** Chỉ loại trừ các tài khoản đang có trạng thái `matched` hoạt động với `userId`; các tài khoản từng bị từ chối (`rejected`/swipe left) vẫn được tuần hoàn nạp lại trong các chu kỳ làm mới để đảm bảo không bao giờ hết thẻ quẹt khi demo.
- `GET /api/tinder/likes-you?userId=` — Danh sách những người đã thả tim người dùng hiện tại (mở khóa miễn phí 100%).
- `POST /api/matches/swipe` (`userId`, `candidateId`, `direction: 'left' | 'right'`) — Ghi nhận lượt quẹt; khi cả 2 cùng thích (`matched`), cập nhật cả 2 chiều `Match` thành `matched`, khởi tạo `Conversation` phân loại hẹn hò (`type: 'dating'`), và **tạo thông báo `match` trong PostgreSQL cho cả 2 người dùng**!
- `POST /api/tinder/unmatch` (`userId`, `targetIdentifier` / `partnerHandle`) — **Hủy tương hợp (Bỏ Match):** Xóa sạch 100% tin nhắn trong PostgreSQL, xóa cuộc trò chuyện và cập nhật trạng thái `status: 'unmatched'` cho cả 2 bên. Khi làm mới cọc thẻ demo, đối phương được đưa trở lại danh sách chưa match để có thể quẹt lại.
- `POST /api/matches/rewind` (`userId`, `candidateId`) — Hoàn tác lượt quẹt miễn phí.

### 1.6 Chat Mạng Xã Hội (Mô Hình Mở) & Chat Hẹn Hò (Cô Lập Danh Tính)
- `GET /api/chats?userId=` — Trả về danh sách cuộc trò chuyện phân loại rõ `chatType: 'social' | 'dating'`:
  - `social` (Mạng xã hội): Nhắn tin tự do không cần kết bạn (`canMessage: true`), xem trang cá nhân xã hội.
  - `dating` (Hẹn hò): Bắt nguồn từ Tinder Match, chỉ cho phép xem Hồ sơ Hẹn hò, hỗ trợ hủy Match xóa sạch tin nhắn.
- `POST /api/chats/:id/messages` (`senderId`, `text`, `mediaUrl`) — Gửi tin nhắn mới.
- `DELETE /api/chats/:id/messages?userId=` — Xóa sạch toàn bộ tin nhắn trong phòng chat theo yêu cầu người dùng.
- `POST /api/chats/:id/read` — Đánh dấu đã đọc tin nhắn.

### 1.7 SOS Miễn Phí & AI Đọc Ảnh Tạo Mô Tả Duy Nhất
- `POST /api/sos` — Đăng bài SOS hoàn toàn miễn phí (`feePaidVnd = 0`), phát thông báo `sos_alert` cho cộng đồng.
- `POST /api/sos/:id/sighting` — Cộng đồng gửi báo cáo nhìn thấy thú lạc, tạo thông báo `sos_sighting` cho chủ nuôi.
- `POST /api/sos/:id/found` — Chủ nuôi xác nhận đã đón bé về nhà an toàn (`status = 'resolved'`).
- `POST /api/ai/describe-pet` (`{ imageUrl?: string, imageBase64?: string, mimeType?: string }`) — **Chức năng AI duy nhất của hệ thống:** Đọc ảnh thú cưng chủ nuôi gửi lên bằng Gemini 2.5 Flash Vision để tự động viết mô tả nhận dạng.

### 1.8 Quản Lý Thông Báo (`Notifications`) & Bootstrap
- `GET /api/notifications?userId=` — Lấy danh sách thông báo đầy đủ kèm `data` JSON (`actionPayload`).
- `POST /api/notifications/:id/read` & `POST /api/notifications/read-all` (`userId`) — Đánh dấu đã đọc 1 hoặc toàn bộ thông báo.
- `DELETE /api/notifications/:id` & `DELETE /api/notifications?userId=` — Xóa từng thông báo hoặc xóa sạch danh sách thông báo.
- `GET /api/bootstrap?userId=` — Đồng bộ toàn bộ trạng thái ứng dụng từ PostgreSQL.
