# MASTER PRINT — TẦNG 2: DATABASE SCHEMA & MODELS

> **Single Source of Truth (SSOT)** — Đồng bộ với cấu trúc dữ liệu thực tế của hệ thống Pawty.

---

## 1. Tổng Quan Các Bảng Dữ Liệu (PostgreSQL + PostGIS)

1. **`users`**: Định danh SĐT (`phone` unique), `display_name`, `avatar_url`, `bio`, `district`, `neighborhood` (tên chung cư, không lưu số phòng), `is_vip`, `vip_expires_at`, `role` (`user | moderator | admin`), `status` (`active | suspended | banned`), `primary_need`, cài đặt quyền riêng tư (`show_location`, `show_phone`, `allow_messages`).
2. **`households`**: Hộ nuôi thú cưng (`id`, `name`, `owner_id`).
3. **`pets`**: Hồ sơ Boss (`household_id`, `owner_id`, `name`, `species`, `breed`, `gender`, `date_of_birth`, `weight_kg`, `size_category`, `energy_level`, `avatar_url`, `cover_photo_url`, `is_neutered`, `allergies`, `medical_notes`, `vet_name`, `vet_contact`, `vaccination_status`, `last_vaccine_date`, `is_public`, `follower_count`).
4. **`pet_behaviors`**: Hành vi & tính cách (`pet_id`, `category`: `personality | good_habit | caution`, `label`, `description`).
5. **`vaccinations`**: Sổ tiêm điện tử (`pet_id`, `vaccine_name`, `date_given`, `next_due_date`, `vet_name`, `document_url`, `verified`).
6. **`circle_members`**: Thành viên vòng chăm sóc (`household_id`, `user_id`, `role`: `owner | caretaker | viewer`, `invited_by`, `invite_code`, `expires_at`, `status`: `pending | active | revoked`).
7. **`care_tasks`**: Công việc chăm sóc (`household_id`, `pet_id`, `created_by`, `assigned_to`, `title`, `description`, `category`: `feeding | medicine | grooming | walk | vet | litter | other`, `is_recurring`, `recurrence_rule`, `due_date`, `status`: `pending | done | missed | cancelled`, `completed_at`, `completed_by`, `completion_note`, `completion_photo`, `reminder_enabled`).
8. **`care_records`**: Nhật ký sức khỏe & bàn giao (`pet_id`, `recorded_by`, `record_type`: `weight | symptom | medication | handover | vet_visit`, `title`, `description`, `data_json`, `attachments`, `is_private`).
9. **`posts`**: Bài viết MXH thú cưng (`author_id`, `content_type`: `moment | care_log | question | tip | place_review | event`, `text_content`, `media` JSONB, `hashtags`, `pet_tags`, `species_tags`, `breed_tags`, `topic_tags`, `location_name`, `visibility`: `public | circle_only | private`, `is_expert_content`, `expert_verified`, `has_health_disclaimer`, `is_sponsored`, `sponsor_id`, `paw_count`, `comment_count`, `share_count`, `save_count`, `moderation_status`).
10. **`reactions`**: Cảm xúc Paw (`user_id`, `post_id`, `comment_id`, `reaction_type`: `paw | heart_eyes | laughing | worried | helpful`).
11. **`comments`**: Bình luận 1 cấp (`post_id`, `author_id`, `parent_id`, `text_content`, `mentions`, `is_expert`, `reaction_count`, `moderation_status`).
12. **`follows`** & **`bookmarks`**: Theo dõi người dùng/Boss và lưu bài viết theo thư mục.
13. **`groups`** & **`group_members`**: Nhóm cộng đồng khu dân cư/giống thú cưng.
14. **`matches`**: Ghép đôi Radar tìm bạn dắt cún (`user_a_id`, `user_b_id`, `status`).
15. **`conversations`** & **`messages`**: Tin nhắn real-time (`direct | group | circle`, `message_type`: `text | image | voice | system`).
16. **`sos_alerts`**: Báo động tìm Boss lạc bán kính 3km (`user_id`, `pet_id`, `last_seen_location`, `radius_km`, `description`, `reward_text`, `fee_paid_vnd`, `status`: `active | resolved | expired`, `sightings` JSONB, `visual_signatures` JSONB).
17. **`pet_sighting_matches`**: Khớp lệnh manh mối AI từ bài đăng Feed (`sos_alert_id`, `post_id`, `match_score`, `visual_similarity`, `text_similarity`, `kinematic_plausibility`, `detected_location_name`, `detected_coords` JSONB, `status`).
18. **`sighting_trajectories`**: Lộ trình di chuyển phỏng đoán (`sos_alert_id`, `points` JSONB, `total_distance_meters`, `updated_at`).
19. **`reports`**, **`events`**, **`consent_records`**, **`notifications`**: Kiểm duyệt nội dung, tracking sự kiện, lưu trữ đồng thuận và thông báo đẩy.
