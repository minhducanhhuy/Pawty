# MASTER PRINT — TẦNG 2: DATABASE SCHEMA & MODELS

> **Single Source of Truth (SSOT)** — Đồng bộ với cấu trúc dữ liệu thực tế của hệ thống Pawty.

---

## 1. Tổng Quan Các Bảng Dữ Liệu (PostgreSQL)

1. **`users`**: Định danh tài khoản (`phone` unique, `username` unique, `password`), `display_name`, `avatar_url`, `bio`, `district`, `neighborhood`, `role` (`user | moderator | admin`), `status` (`active | suspended | banned`), `primary_need` (Mục đích tìm kiếm kết nối duy nhất: `playdate | dating | community`), cài đặt quyền riêng tư (`show_location`, `show_phone`, `allow_messages`). Metadata mở rộng của chủ nuôi (`coverUrl`, `gender`, `age`, `birthDate`, `zodiac`, `mbti`, `occupation`, `education`, `noteBubble`, `privacySettings`, `tinderSetup`) được đồng bộ bền vững trong `events` (`event_type = 'user_profile_meta'`). Mọi thành viên có quyền lợi bình đẳng 100% (không phân biệt VIP).
2. **`households`**: Hộ nuôi thú cưng (`id`, `name`, `owner_id`) — tự động khởi tạo cho tài khoản mới khi thêm thú cưng đầu tiên.
3. **`pets`**: Hồ sơ Boss không giới hạn số lượng (`household_id`, `owner_id`, `name`, `species`, `breed`, `gender`, `date_of_birth`, `weight_kg`, `size_category`, `energy_level`, `avatar_url`, `cover_photo_url`, `is_neutered`, `allergies`, `medical_notes`, `vaccination_status`, `last_vaccine_date`, `is_public`, `follower_count`). Metadata chi tiết (`ageLabel`, `birthDate`, `furColor`, `favoriteFood`, `dewormingHistory`, `medicalHistory`, `galleryUrls`, `weightHistory`) lưu đồng bộ trong `care_records` (`record_type = 'pet_profile_meta'`).
4. **`pet_behaviors`**: Hành vi & tính cách chọn qua Selector (`pet_id`, `category`: `good_habit | caution`, `label`, `description`).
5. **`vaccinations`**: Sổ tiêm điện tử (`pet_id`, `vaccine_name`, `date_given`, `next_due_date`, `vet_name`, `document_url`, `verified`).
6. **`circle_members`**, **`care_tasks`**, **`care_records`**: Thành viên vòng chăm sóc, công việc chăm sóc và nhật ký sức khỏe.
7. **`posts`**: Bài viết MXH thú cưng (`author_id`, `content_type`, `text_content`, `media` JSONB chứa danh sách ảnh/video từ máy hoặc camera, `hashtags`, `location_name`, `visibility`, `has_health_disclaimer`, `paw_count`, `comment_count`, `share_count`, `save_count`, `moderation_status`).
8. **`reactions`** & **`comments`**: Cảm xúc Paw và bình luận bài viết.
9. **`matches`**: Quản lý kết nối & trạng thái bạn bè giữa 2 người dùng (`user_a_id`, `user_b_id`, `status`: `pending | matched | declined | unfriended`). Quan hệ theo dõi (`follow`) lưu trong `events` (`event_type = 'user_follow'`).
10. **`conversations`** & **`messages`**: Phòng chat và tin nhắn 2 chiều (`participant_ids`, `last_message_text`, `last_message_at`, `is_read`). Hỗ trợ xóa toàn bộ lịch sử tin nhắn của phòng chat và chặn gửi tin nhắn mới khi hai bên đã hủy kết bạn (`unfriended`).
11. **`sos_alerts`**: Báo động tìm Boss lạc hoàn toàn miễn phí (`fee_paid_vnd = 0`, `user_id`, `pet_id`, `last_seen_location`, `radius_km`, `description`, `reward_text`, `status`: `active | resolved`, `sightings` JSONB).
12. **`notifications`**: Hệ thống thông báo đa danh mục (`user_id`, `type`: `friend_request | friend_accepted | match | follow | new_post | post_reaction | post_comment | sos_alert | sos_sighting`, `title`, `body`, `data` JSONB lưu `senderId`, `senderHandle`, `senderName`, `senderAvatar`, `status`, `postId`, `conversationId`, `sosAlertId`, `is_read`, `created_at`).
13. **`reports`**, **`events`**, **`consent_records`**: Kiểm duyệt báo cáo, lưu trữ metadata/theo dõi và đồng thuận quyền riêng tư.
