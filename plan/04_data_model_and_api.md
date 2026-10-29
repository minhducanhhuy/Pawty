# Tầng 4 — Mô hình Dữ liệu & API Contracts

> Thiết kế database, quan hệ dữ liệu và đặc tả API cho toàn bộ hệ sinh thái.

---

## 1. Entity Relationship Overview

```
Users ─────────────── Households ─────────── Pets
  │                       │                    │
  │ has many              │ has many            │ has many
  │                       │                    │
  ├── Circle_Members ─────┘                    ├── Care_Tasks
  ├── Posts                                    ├── Care_Records
  ├── Comments                                 ├── Vaccinations
  ├── Reactions                                ├── Documents
  ├── Follows                                  ├── Pet_Behaviors
  ├── Messages                                 └── Moments (via Posts)
  ├── Notifications
  ├── Reports
  ├── Bookings ──────── Partners ──── Services
  ├── Walk_Appointments
  └── Matches
```

## 2. Database Schema (PostgreSQL + PostGIS)

### 2.1 Core Tables

#### `users`
```sql
CREATE TABLE users (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone           VARCHAR(15) UNIQUE NOT NULL,
  display_name    VARCHAR(50) NOT NULL,
  avatar_url      TEXT,
  bio             VARCHAR(200),
  district        VARCHAR(100),
  neighborhood    VARCHAR(200),       -- Tên chung cư/khu phố
  location        GEOGRAPHY(POINT, 4326),  -- PostGIS, chỉ gần đúng
  is_vip          BOOLEAN DEFAULT FALSE,
  vip_expires_at  TIMESTAMPTZ,
  role            VARCHAR(20) DEFAULT 'user',  -- user | moderator | admin
  status          VARCHAR(20) DEFAULT 'active', -- active | suspended | banned
  primary_need    VARCHAR(50),         -- Nhu cầu chính khi onboarding
  last_active_at  TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),

  -- Privacy settings
  show_location   BOOLEAN DEFAULT TRUE,
  show_phone      BOOLEAN DEFAULT FALSE,
  allow_messages  VARCHAR(20) DEFAULT 'circle_and_matches'
);

CREATE INDEX idx_users_location ON users USING GIST(location);
CREATE INDEX idx_users_district ON users(district);
```

#### `households`
```sql
CREATE TABLE households (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(100) NOT NULL,     -- "Nhà Mai"
  owner_id        UUID NOT NULL REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

#### `pets`
```sql
CREATE TABLE pets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id    UUID NOT NULL REFERENCES households(id),
  owner_id        UUID NOT NULL REFERENCES users(id),
  name            VARCHAR(50) NOT NULL,
  species         VARCHAR(20) NOT NULL,       -- dog | cat | other
  breed           VARCHAR(100),
  gender          VARCHAR(10),                -- male | female | unknown
  date_of_birth   DATE,
  weight_kg       DECIMAL(5,2),
  size_category   VARCHAR(20),                -- tiny | small | medium | large | giant
  energy_level    VARCHAR(10),                -- low | medium | high
  avatar_url      TEXT,
  cover_photo_url TEXT,
  is_neutered     BOOLEAN,
  allergies       TEXT,
  medical_notes   TEXT,
  vet_name        VARCHAR(100),
  vet_contact     VARCHAR(100),

  -- Vaccination status
  vaccination_status  VARCHAR(20) DEFAULT 'unknown',  -- full | partial | none | unknown
  last_vaccine_date   DATE,

  -- Public profile settings
  is_public       BOOLEAN DEFAULT TRUE,
  follower_count  INT DEFAULT 0,

  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pets_household ON pets(household_id);
CREATE INDEX idx_pets_species ON pets(species);
```

#### `pet_behaviors`
```sql
CREATE TABLE pet_behaviors (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id          UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  category        VARCHAR(20) NOT NULL,       -- personality | good_habit | caution
  label           VARCHAR(100) NOT NULL,      -- "Thân thiện", "Bảo vệ đồ ăn"
  description     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pet_behaviors_pet ON pet_behaviors(pet_id);
```

#### `vaccinations`
```sql
CREATE TABLE vaccinations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id          UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  vaccine_name    VARCHAR(100) NOT NULL,
  date_given      DATE NOT NULL,
  next_due_date   DATE,
  vet_name        VARCHAR(100),
  document_url    TEXT,                       -- Ảnh chụp sổ tiêm
  verified        BOOLEAN DEFAULT FALSE,      -- Xác nhận bởi vet partner
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vaccinations_pet ON vaccinations(pet_id);
```

### 2.2 Circle & Care Tables

#### `circle_members`
```sql
CREATE TABLE circle_members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id    UUID NOT NULL REFERENCES households(id),
  user_id         UUID NOT NULL REFERENCES users(id),
  role            VARCHAR(20) NOT NULL,       -- owner | caretaker | viewer
  invited_by      UUID REFERENCES users(id),
  invite_code     VARCHAR(20),
  expires_at      TIMESTAMPTZ,                -- Quyền tạm thời
  status          VARCHAR(20) DEFAULT 'pending',  -- pending | active | revoked
  created_at      TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(household_id, user_id)
);
```

#### `care_tasks`
```sql
CREATE TABLE care_tasks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id    UUID NOT NULL REFERENCES households(id),
  pet_id          UUID NOT NULL REFERENCES pets(id),
  created_by      UUID NOT NULL REFERENCES users(id),
  assigned_to     UUID REFERENCES users(id),  -- Người được giao
  title           VARCHAR(200) NOT NULL,
  description     TEXT,
  category        VARCHAR(30),                -- feeding | medicine | grooming | walk | vet | other
  is_recurring    BOOLEAN DEFAULT FALSE,
  recurrence_rule VARCHAR(100),               -- RRULE format
  due_date        DATE,
  due_time        TIME,
  status          VARCHAR(20) DEFAULT 'pending',  -- pending | done | missed | cancelled
  completed_at    TIMESTAMPTZ,
  completed_by    UUID REFERENCES users(id),
  completion_note TEXT,
  completion_photo TEXT,
  reminder_enabled BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_care_tasks_household ON care_tasks(household_id);
CREATE INDEX idx_care_tasks_pet ON care_tasks(pet_id);
CREATE INDEX idx_care_tasks_assigned ON care_tasks(assigned_to);
CREATE INDEX idx_care_tasks_due ON care_tasks(due_date, status);
```

#### `care_records`
```sql
CREATE TABLE care_records (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id          UUID NOT NULL REFERENCES pets(id),
  recorded_by     UUID NOT NULL REFERENCES users(id),
  record_type     VARCHAR(30) NOT NULL,       -- weight | symptom | medication | note | vet_visit
  title           VARCHAR(200),
  description     TEXT,
  data_json       JSONB,                      -- Flexible data (weight value, temperature, etc.)
  attachments     TEXT[],                      -- URLs to photos/docs
  is_private      BOOLEAN DEFAULT TRUE,       -- Hồ sơ riêng vs chia sẻ
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_care_records_pet ON care_records(pet_id);
```

### 2.3 Social Tables

#### `posts`
```sql
CREATE TABLE posts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id       UUID NOT NULL REFERENCES users(id),
  content_type    VARCHAR(20) NOT NULL,       -- moment | care_log | question | tip | place_review | event | service_review
  text_content    TEXT,
  media           JSONB DEFAULT '[]',         -- [{type, url, thumbnail_url, aspect_ratio}]
  hashtags        TEXT[] DEFAULT '{}',
  pet_tags        UUID[] DEFAULT '{}',        -- Pet IDs tagged
  species_tags    TEXT[] DEFAULT '{}',
  breed_tags      TEXT[] DEFAULT '{}',
  topic_tags      TEXT[] DEFAULT '{}',
  location_name   VARCHAR(200),
  location_point  GEOGRAPHY(POINT, 4326),
  visibility      VARCHAR(20) DEFAULT 'public',  -- public | circle_only | private
  is_expert_content BOOLEAN DEFAULT FALSE,
  expert_verified BOOLEAN DEFAULT FALSE,
  has_health_disclaimer BOOLEAN DEFAULT FALSE,
  is_sponsored    BOOLEAN DEFAULT FALSE,
  sponsor_id      UUID REFERENCES partners(id),

  -- Engagement counts (denormalized for performance)
  paw_count       INT DEFAULT 0,
  comment_count   INT DEFAULT 0,
  share_count     INT DEFAULT 0,
  save_count      INT DEFAULT 0,

  -- Moderation
  moderation_status VARCHAR(20) DEFAULT 'approved',  -- pending | approved | flagged | removed
  moderation_note TEXT,

  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_content_type ON posts(content_type);
CREATE INDEX idx_posts_created ON posts(created_at DESC);
CREATE INDEX idx_posts_location ON posts USING GIST(location_point);
CREATE INDEX idx_posts_hashtags ON posts USING GIN(hashtags);
CREATE INDEX idx_posts_visibility ON posts(visibility);
CREATE INDEX idx_posts_moderation ON posts(moderation_status);
```

#### `reactions`
```sql
CREATE TABLE reactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id),
  post_id         UUID REFERENCES posts(id) ON DELETE CASCADE,
  comment_id      UUID REFERENCES comments(id) ON DELETE CASCADE,
  reaction_type   VARCHAR(20) NOT NULL,       -- paw | heart_eyes | laughing | worried | helpful
  created_at      TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, post_id),
  UNIQUE(user_id, comment_id),
  CHECK (post_id IS NOT NULL OR comment_id IS NOT NULL)
);

CREATE INDEX idx_reactions_post ON reactions(post_id);
CREATE INDEX idx_reactions_user ON reactions(user_id);
```

#### `comments`
```sql
CREATE TABLE comments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id         UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  author_id       UUID NOT NULL REFERENCES users(id),
  parent_id       UUID REFERENCES comments(id),  -- Reply (1 cấp)
  text_content    TEXT NOT NULL,
  mentions        TEXT[] DEFAULT '{}',
  is_expert       BOOLEAN DEFAULT FALSE,
  reaction_count  INT DEFAULT 0,
  moderation_status VARCHAR(20) DEFAULT 'approved',
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_comments_post ON comments(post_id);
CREATE INDEX idx_comments_parent ON comments(parent_id);
```

#### `follows`
```sql
CREATE TABLE follows (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id     UUID NOT NULL REFERENCES users(id),
  following_id    UUID REFERENCES users(id),
  following_pet_id UUID REFERENCES pets(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(follower_id, following_id),
  UNIQUE(follower_id, following_pet_id),
  CHECK (following_id IS NOT NULL OR following_pet_id IS NOT NULL)
);

CREATE INDEX idx_follows_follower ON follows(follower_id);
CREATE INDEX idx_follows_following ON follows(following_id);
```

#### `bookmarks`
```sql
CREATE TABLE bookmarks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id),
  post_id         UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  folder_name     VARCHAR(50) DEFAULT 'default',
  created_at      TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_id, post_id)
);
```

### 2.4 Community Tables

#### `groups`
```sql
CREATE TABLE groups (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(100) NOT NULL,
  description     TEXT,
  type            VARCHAR(20) NOT NULL,       -- area | breed | interest | activity | partner
  avatar_url      TEXT,
  cover_url       TEXT,
  area            VARCHAR(100),
  is_private      BOOLEAN DEFAULT FALSE,
  rules           TEXT,
  member_count    INT DEFAULT 0,
  created_by      UUID NOT NULL REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_groups_type ON groups(type);
CREATE INDEX idx_groups_area ON groups(area);
```

#### `group_members`
```sql
CREATE TABLE group_members (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id        UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id),
  role            VARCHAR(20) DEFAULT 'member',  -- admin | moderator | member
  status          VARCHAR(20) DEFAULT 'active',  -- pending | active | muted | banned
  joined_at       TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(group_id, user_id)
);
```

### 2.5 Connection Tables

#### `matches`
```sql
CREATE TABLE matches (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a_id       UUID NOT NULL REFERENCES users(id),
  user_b_id       UUID NOT NULL REFERENCES users(id),
  pet_a_id        UUID NOT NULL REFERENCES pets(id),
  pet_b_id        UUID NOT NULL REFERENCES pets(id),
  match_reason    TEXT,                       -- Giải thích gợi ý
  status          VARCHAR(20) DEFAULT 'pending',  -- pending | matched | declined | expired
  matched_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(user_a_id, user_b_id)
);
```

#### `walk_appointments`
```sql
CREATE TABLE walk_appointments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  initiator_id    UUID NOT NULL REFERENCES users(id),
  invitee_id      UUID NOT NULL REFERENCES users(id),
  pet_ids         UUID[] NOT NULL,
  scheduled_date  DATE NOT NULL,
  scheduled_time  TIME NOT NULL,
  location_name   VARCHAR(200),
  location_point  GEOGRAPHY(POINT, 4326),
  note            TEXT,
  status          VARCHAR(20) DEFAULT 'pending',  -- pending | confirmed | completed | cancelled | no_show
  confirmed_at    TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  cancel_reason   TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_walk_appointments_date ON walk_appointments(scheduled_date);
```

### 2.6 Messaging Tables

#### `conversations`
```sql
CREATE TABLE conversations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type            VARCHAR(20) NOT NULL,       -- direct | group | circle
  name            VARCHAR(100),               -- For group chats
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

#### `conversation_participants`
```sql
CREATE TABLE conversation_participants (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES users(id),
  role            VARCHAR(20) DEFAULT 'member',
  last_read_at    TIMESTAMPTZ,
  muted           BOOLEAN DEFAULT FALSE,
  joined_at       TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(conversation_id, user_id)
);
```

#### `messages`
```sql
CREATE TABLE messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES users(id),
  message_type    VARCHAR(20) DEFAULT 'text',  -- text | image | voice | walk_invite | care_handover | system
  text_content    TEXT,
  media_url       TEXT,
  metadata        JSONB,                       -- Walk appointment details, care handover data
  is_read         BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id, created_at DESC);
```

### 2.7 Service & Partner Tables

#### `partners`
```sql
CREATE TABLE partners (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            VARCHAR(200) NOT NULL,
  type            VARCHAR(30) NOT NULL,       -- grooming | vet | cafe | hotel | walker | sitter
  description     TEXT,
  address         TEXT,
  district        VARCHAR(100),
  location        GEOGRAPHY(POINT, 4326),
  phone           VARCHAR(15),
  avatar_url      TEXT,
  cover_url       TEXT,
  operating_hours JSONB,                      -- {"mon": {"open": "09:00", "close": "18:00"}, ...}
  services        JSONB,                      -- [{name, price, duration_min, description}]
  verification_status VARCHAR(20) DEFAULT 'pending',  -- pending | verified | suspended
  verified_at     TIMESTAMPTZ,
  verified_by     UUID REFERENCES users(id),
  rating_avg      DECIMAL(3,2) DEFAULT 0,
  review_count    INT DEFAULT 0,
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_partners_type ON partners(type);
CREATE INDEX idx_partners_location ON partners USING GIST(location);
CREATE INDEX idx_partners_district ON partners(district);
```

#### `bookings`
```sql
CREATE TABLE bookings (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id),
  partner_id      UUID NOT NULL REFERENCES partners(id),
  pet_id          UUID NOT NULL REFERENCES pets(id),
  service_name    VARCHAR(200) NOT NULL,
  service_price   INT NOT NULL,               -- VND
  scheduled_date  DATE NOT NULL,
  scheduled_time  TIME NOT NULL,
  note            TEXT,
  status          VARCHAR(20) DEFAULT 'pending',  -- pending | confirmed | in_progress | completed | cancelled
  confirmed_at    TIMESTAMPTZ,
  completed_at    TIMESTAMPTZ,
  cancelled_at    TIMESTAMPTZ,
  cancel_reason   TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_partner ON bookings(partner_id);
CREATE INDEX idx_bookings_date ON bookings(scheduled_date);
CREATE INDEX idx_bookings_status ON bookings(status);
```

#### `reviews`
```sql
CREATE TABLE reviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id      UUID NOT NULL REFERENCES bookings(id),
  user_id         UUID NOT NULL REFERENCES users(id),
  partner_id      UUID NOT NULL REFERENCES partners(id),
  rating          SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  text_content    TEXT,
  photos          TEXT[],
  partner_reply   TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(booking_id)
);

CREATE INDEX idx_reviews_partner ON reviews(partner_id);
```

### 2.8 Moderation & Safety Tables

#### `reports`
```sql
CREATE TABLE reports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id     UUID NOT NULL REFERENCES users(id),
  target_type     VARCHAR(20) NOT NULL,       -- user | post | comment | message | partner
  target_id       UUID NOT NULL,
  reason          VARCHAR(50) NOT NULL,       -- spam | inappropriate | harassment | fraud | safety | other
  description     TEXT,
  status          VARCHAR(20) DEFAULT 'pending',  -- pending | reviewed | resolved | dismissed
  reviewed_by     UUID REFERENCES users(id),
  action_taken    VARCHAR(50),                -- warning | mute | suspend | ban | remove_content
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  resolved_at     TIMESTAMPTZ
);

CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_target ON reports(target_type, target_id);
```

#### `blocks`
```sql
CREATE TABLE blocks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id      UUID NOT NULL REFERENCES users(id),
  blocked_id      UUID NOT NULL REFERENCES users(id),
  created_at      TIMESTAMPTZ DEFAULT NOW(),

  UNIQUE(blocker_id, blocked_id)
);
```

### 2.9 Analytics & Consent Tables

#### `events`
```sql
CREATE TABLE events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID REFERENCES users(id),
  event_type      VARCHAR(50) NOT NULL,       -- profile_created | task_completed | invite_sent | booking_made | ...
  event_data      JSONB,                      -- Metadata (không chứa PII)
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_events_type ON events(event_type);
CREATE INDEX idx_events_user ON events(user_id);
CREATE INDEX idx_events_created ON events(created_at);
```

#### `consent_records`
```sql
CREATE TABLE consent_records (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id),
  consent_type    VARCHAR(50) NOT NULL,       -- data_collection | location | notifications | marketing
  granted         BOOLEAN NOT NULL,
  ip_address      INET,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
```

#### `notifications`
```sql
CREATE TABLE notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id),
  type            VARCHAR(30) NOT NULL,
  title           VARCHAR(200) NOT NULL,
  body            TEXT,
  data            JSONB,                      -- Deep link data
  is_read         BOOLEAN DEFAULT FALSE,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);
```

## 3. REST API Contracts

### 3.1 Authentication

```
POST   /api/auth/send-otp          { phone }                    → { success, message }
POST   /api/auth/verify-otp        { phone, otp_code }          → { token, user, is_new }
POST   /api/auth/refresh           { refresh_token }             → { token, refresh_token }
DELETE /api/auth/logout                                          → { success }
```

### 3.2 Users

```
GET    /api/users/me                                             → { user }
PUT    /api/users/me               { display_name, bio, ... }   → { user }
PUT    /api/users/me/location      { lat, lng }                  → { success }
GET    /api/users/:id                                            → { user (public) }
PUT    /api/users/me/privacy       { show_location, ... }       → { success }
POST   /api/users/me/data-export                                 → { export_url }
DELETE /api/users/me                                             → { success } // Account deletion
```

### 3.3 Pets

```
POST   /api/pets                   { name, species, breed, ... } → { pet }
GET    /api/pets                                                  → { pets[] }
GET    /api/pets/:id                                              → { pet }
PUT    /api/pets/:id               { ... }                       → { pet }
DELETE /api/pets/:id                                              → { success }
POST   /api/pets/:id/behaviors     { category, label }           → { behavior }
DELETE /api/pets/:id/behaviors/:bid                               → { success }
POST   /api/pets/:id/vaccinations  { vaccine_name, date, ... }   → { vaccination }
GET    /api/pets/:id/vaccinations                                 → { vaccinations[] }
```

### 3.4 Circle & Care

```
POST   /api/households             { name }                      → { household }
POST   /api/households/:id/invite  { user_id, role, expires_at } → { invite }
PUT    /api/circle/:id/accept                                    → { member }
DELETE /api/circle/:id/revoke                                    → { success }
GET    /api/households/:id/members                                → { members[] }

POST   /api/tasks                  { pet_id, title, ... }       → { task }
GET    /api/tasks?date=&status=                                   → { tasks[] }
PUT    /api/tasks/:id              { ... }                       → { task }
PUT    /api/tasks/:id/complete     { note, photo }               → { task }
DELETE /api/tasks/:id                                             → { success }
```

### 3.5 Social (Posts, Comments, Reactions)

```
POST   /api/posts                  { content_type, text, media, ... } → { post }
GET    /api/posts/feed?cursor=&limit=                              → { posts[], next_cursor }
GET    /api/posts/explore?species=&tag=&cursor=                    → { posts[], next_cursor }
GET    /api/posts/:id                                              → { post }
DELETE /api/posts/:id                                              → { success }

POST   /api/posts/:id/reactions    { reaction_type }              → { reaction }
DELETE /api/posts/:id/reactions                                    → { success }

POST   /api/posts/:id/comments    { text, parent_id }            → { comment }
GET    /api/posts/:id/comments?cursor=                            → { comments[], next_cursor }
DELETE /api/comments/:id                                          → { success }

POST   /api/posts/:id/bookmark                                   → { bookmark }
DELETE /api/posts/:id/bookmark                                   → { success }
GET    /api/bookmarks?folder=                                    → { posts[] }

POST   /api/users/:id/follow                                     → { follow }
DELETE /api/users/:id/follow                                     → { success }
GET    /api/users/:id/followers?cursor=                           → { users[] }
GET    /api/users/:id/following?cursor=                           → { users[] }
```

### 3.6 Community Groups

```
POST   /api/groups                 { name, type, ... }          → { group }
GET    /api/groups?type=&area=                                   → { groups[] }
GET    /api/groups/:id                                           → { group }
POST   /api/groups/:id/join                                      → { member }
DELETE /api/groups/:id/leave                                     → { success }
GET    /api/groups/:id/posts?cursor=                             → { posts[] }
```

### 3.7 Matching & Appointments

```
GET    /api/radar?lat=&lng=&radius=&species=                     → { profiles[] }
POST   /api/matches/:id/swipe     { direction }                 → { match? }
GET    /api/matches                                              → { matches[] }

POST   /api/appointments          { invitee_id, date, time, location, ... } → { appointment }
PUT    /api/appointments/:id      { status }                    → { appointment }
GET    /api/appointments?status=                                 → { appointments[] }
```

### 3.8 Services & Bookings

```
GET    /api/partners?type=&district=&lat=&lng=                   → { partners[] }
GET    /api/partners/:id                                         → { partner }
GET    /api/partners/:id/services                                → { services[] }
GET    /api/partners/:id/slots?date=                             → { slots[] }

POST   /api/bookings              { partner_id, pet_id, service, date, time, note } → { booking }
GET    /api/bookings?status=                                     → { bookings[] }
GET    /api/bookings/:id                                         → { booking }
PUT    /api/bookings/:id/cancel   { reason }                    → { booking }

POST   /api/bookings/:id/review   { rating, text, photos }     → { review }
```

### 3.9 Moderation

```
POST   /api/reports               { target_type, target_id, reason, description } → { report }
POST   /api/users/:id/block                                     → { success }
DELETE /api/users/:id/block                                     → { success }
```

## 4. WebSocket Events (Socket.io)

### 4.1 Chat Events

```
Client → Server:
  chat:send          { conversation_id, message_type, text_content, media_url, metadata }
  chat:typing        { conversation_id }
  chat:read          { conversation_id, message_id }

Server → Client:
  chat:new_message   { message }
  chat:typing        { conversation_id, user_id }
  chat:read_receipt  { conversation_id, user_id, message_id }
```

### 4.2 Notification Events

```
Server → Client:
  notification:new   { notification }
  task:completed     { task_id, completed_by }
  task:reminder      { task }
  booking:update     { booking }
  match:new          { match }
  circle:activity    { activity }
```

### 4.3 Real-time Feed

```
Server → Client:
  post:new           { post }  // From followed users
  post:reaction      { post_id, reaction_type, user }
  post:comment       { post_id, comment }
```

## 5. Data Privacy Compliance

> [!CAUTION]
> Luật BVDLCN 91/2025/QH15 (hiệu lực 01/01/2026). Thiết kế tuân thủ từ đầu.

| Yêu cầu | Implementation |
|---|---|
| Đồng ý rõ ràng | `consent_records` table, consent UI trước khi thu thập |
| Quyền truy cập | `GET /api/users/me` trả toàn bộ dữ liệu cá nhân |
| Quyền xuất | `POST /api/users/me/data-export` → file JSON/CSV |
| Quyền xóa | `DELETE /api/users/me` → soft delete → hard delete sau 30 ngày |
| Tối thiểu hóa | Chỉ thu thập dữ liệu cần thiết; location gần đúng |
| Bảo mật | Mã hóa at rest & in transit; access logging |
| Phân quyền | Circle members chỉ xem được phần được cho phép |
| Không bán | Không bán dữ liệu cá nhân cho bên thứ ba |

