# Tầng 6 — Kiến trúc Kỹ thuật

> Thiết kế vừa đủ cho MVP, mở rộng dần khi có nhu cầu thực.

---

## 1. Tech Stack Overview

### Phase 1: Web Demo (React + Vite)

| Layer             | Technology                | Lý do                       |
| ----------------- | ------------------------- | --------------------------- |
| **Frontend**      | React 19 + Vite           | Nhanh iterate, dễ demo      |
| **Styling**       | Tailwind CSS v4           | Rapid UI, design tokens     |
| **State**         | Zustand                   | Lightweight, simple         |
| **Routing**       | React Router v7           | Standard SPA routing        |
| **Data Fetching** | TanStack Query v5         | Caching, optimistic updates |
| **Forms**         | React Hook Form + Zod     | Validation, type-safe       |
| **Animations**    | Framer Motion             | 60fps, gesture support      |
| **Icons**         | Lucide React              | Consistent, tree-shakeable  |
| **Mock Backend**  | MSW (Mock Service Worker) | API mocking for demo        |

### Phase 2: Full-Stack (khi đã validate)

| Layer                  | Technology                                 | Lý do                          |
| ---------------------- | ------------------------------------------ | ------------------------------ |
| **Backend**            | NestJS (Node.js)                           | TypeScript full-stack, modular |
| **Database**           | PostgreSQL 16 + PostGIS                    | Spatial queries, mature        |
| **ORM**                | Prisma                                     | Type-safe, migration tools     |
| **Auth**               | Firebase Auth                              | OTP SMS, social login          |
| **Real-time**          | Socket.io                                  | Chat, notifications            |
| **File Storage**       | Cloudinary (→ AWS S3 later)                | Image optimization, CDN        |
| **Push Notifications** | Firebase Cloud Messaging                   | Cross-platform push            |
| **Search**             | PostgreSQL Full-Text (→ Meilisearch later) | Simple start                   |
| **Queue**              | BullMQ + Redis                             | Background jobs                |
| **Hosting**            | Railway / Render (→ AWS later)             | Low cost, easy deploy          |

### Phase 3: Mobile (React Native + Expo)

| Layer             | Technology                      | Lý do                   |
| ----------------- | ------------------------------- | ----------------------- |
| **Framework**     | React Native + Expo (SDK 58)    | Code reuse from React   |
| **Navigation**    | Expo Router (file-based)        | Familiar pattern        |
| **Styling**       | NativeWind v4                   | Tailwind on mobile      |
| **Animations**    | React Native Reanimated 3       | 60fps native animations |
| **Maps**          | React Native Maps + Google Maps | Location features       |
| **Camera**        | Expo Camera                     | Photo/video capture     |
| **Notifications** | Expo Notifications + FCM        | Push handling           |

## 2. System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENTS                                 │
│                                                                 │
│  ┌──────────┐  ┌──────────────┐  ┌──────────────────────────┐  │
│  │ Web App  │  │ Mobile App   │  │ Partner Admin (Web)      │  │
│  │ React    │  │ React Native │  │ React (shared components)│  │
│  │ + Vite   │  │ + Expo       │  │                          │  │
│  └────┬─────┘  └──────┬───────┘  └───────────┬──────────────┘  │
│       │               │                      │                  │
└───────┼───────────────┼──────────────────────┼──────────────────┘
        │               │                      │
        ▼               ▼                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY                                │
│              (NestJS — REST + WebSocket)                        │
│                                                                 │
│  ┌──────────┐ ┌───────────┐ ┌───────────┐ ┌──────────────┐    │
│  │ Auth     │ │ Rate      │ │ Validation│ │ Error        │    │
│  │ Guard    │ │ Limiting  │ │ Pipes     │ │ Handling     │    │
│  └──────────┘ └───────────┘ └───────────┘ └──────────────┘    │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    MODULES                               │   │
│  │                                                         │   │
│  │  Auth · Users · Pets · Households · Care · Social       │   │
│  │  Chat · Matching · Bookings · Partners · Moderation     │   │
│  │  Notifications · Analytics                              │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
        │                    │                    │
        ▼                    ▼                    ▼
┌──────────────┐  ┌──────────────┐  ┌──────────────────────────┐
│  PostgreSQL  │  │    Redis     │  │   External Services      │
│  + PostGIS   │  │  (Cache +    │  │                          │
│              │  │   Queue)     │  │  Firebase Auth           │
│  • Users     │  │              │  │  Firebase FCM            │
│  • Pets      │  │  • Sessions  │  │  Cloudinary              │
│  • Posts     │  │  • Cache     │  │  Google Maps API         │
│  • Messages  │  │  • BullMQ    │  │  SMTP (email)            │
│  • Bookings  │  │  • Rate      │  │  VietQR API              │
│  • ...       │  │    Limits    │  │                          │
└──────────────┘  └──────────────┘  └──────────────────────────┘
```

## 3. Project Structure (Monorepo)

```
pawty/
├── apps/
│   ├── web/                    # React + Vite web app
│   │   ├── src/
│   │   │   ├── components/     # Shared UI components
│   │   │   │   ├── ui/         # Primitives (Button, Input, Card)
│   │   │   │   ├── layout/     # Layout components
│   │   │   │   ├── pet/        # Pet-specific components
│   │   │   │   ├── social/     # Feed, Post, Comment
│   │   │   │   ├── care/       # Tasks, Calendar, Handover
│   │   │   │   └── service/    # Booking, Partner card
│   │   │   ├── pages/          # Route pages
│   │   │   │   ├── onboarding/
│   │   │   │   ├── today/
│   │   │   │   ├── explore/
│   │   │   │   ├── chat/
│   │   │   │   ├── profile/
│   │   │   │   ├── service/
│   │   │   │   └── admin/
│   │   │   ├── hooks/          # Custom hooks
│   │   │   ├── stores/         # Zustand stores
│   │   │   ├── services/       # API service layer
│   │   │   ├── utils/          # Utility functions
│   │   │   ├── types/          # TypeScript types
│   │   │   ├── constants/      # App constants
│   │   │   └── mocks/          # MSW mock data
│   │   ├── public/
│   │   │   └── assets/
│   │   └── index.html
│   │
│   ├── mobile/                 # React Native + Expo (Phase 3)
│   │   ├── app/                # Expo Router pages
│   │   ├── components/
│   │   ├── hooks/
│   │   └── ...
│   │
│   └── partner-admin/          # Partner dashboard (Phase 2+)
│       └── ...
│
├── server/                     # NestJS backend (Phase 2)
│   ├── src/
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   ├── users/
│   │   │   ├── pets/
│   │   │   ├── households/
│   │   │   ├── care/
│   │   │   ├── social/
│   │   │   ├── chat/
│   │   │   ├── matching/
│   │   │   ├── bookings/
│   │   │   ├── partners/
│   │   │   ├── moderation/
│   │   │   ├── notifications/
│   │   │   └── analytics/
│   │   ├── common/
│   │   │   ├── guards/
│   │   │   ├── interceptors/
│   │   │   ├── pipes/
│   │   │   ├── filters/
│   │   │   └── decorators/
│   │   ├── config/
│   │   └── prisma/
│   │       ├── schema.prisma
│   │       └── migrations/
│   └── test/
│
├── packages/                   # Shared packages
│   ├── types/                  # Shared TypeScript types
│   ├── utils/                  # Shared utilities
│   └── validators/             # Shared Zod schemas
│
├── plan/                       # Product plan documents
│   └── *.md
│
├── master_print/               # Master Print (SSOT)
│   └── *.md
│
└── public/
    └── assets/                 # Brand assets
```

## 4. NestJS Module Design

### 4.1 Module Dependency Graph

```
                AppModule
                    │
    ┌───────────────┼───────────────────┐
    │               │                   │
AuthModule    ConfigModule         PrismaModule
    │                                   │
    ├── UsersModule ◄───────────────────┤
    │       │                           │
    │   PetsModule                      │
    │       │                           │
    │   HouseholdsModule                │
    │       ├── CareModule              │
    │       └── CircleModule            │
    │                                   │
    ├── SocialModule                    │
    │       ├── PostsService            │
    │       ├── FeedService             │
    │       ├── ModerationService       │
    │       └── CommentsService         │
    │                                   │
    ├── ChatModule ─── SocketGateway    │
    │                                   │
    ├── MatchingModule                  │
    │       └── RadarService            │
    │                                   │
    ├── BookingsModule                  │
    │       └── PartnersModule          │
    │                                   │
    ├── NotificationsModule ── FCM      │
    │                                   │
    └── AnalyticsModule                 │
```

### 4.2 Example Module: Social

```typescript
// social.module.ts
@Module({
  imports: [PrismaModule, UsersModule, NotificationsModule, MediaModule],
  controllers: [PostsController, CommentsController, FeedController],
  providers: [
    PostsService,
    CommentsService,
    ReactionsService,
    FeedService,
    ModerationService,
    ContentFilterPipeline,
    PawRankAlgorithm,
  ],
  exports: [PostsService, FeedService],
})
export class SocialModule {}
```

## 5. Real-time Architecture (Socket.io)

```typescript
// chat.gateway.ts
@WebSocketGateway({
  namespace: "/chat",
  cors: { origin: "*" },
})
export class ChatGateway {
  @SubscribeMessage("chat:send")
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: SendMessageDto,
  ): Promise<void> {
    // Validate, save to DB, broadcast to participants
  }

  @SubscribeMessage("chat:typing")
  async handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() payload: TypingDto,
  ): Promise<void> {
    // Broadcast typing indicator
  }
}
```

## 6. PostGIS Spatial Queries

### Tìm người dùng gần

```sql
-- Tìm users trong bán kính 3km
SELECT u.id, u.display_name, u.neighborhood,
       ST_Distance(u.location, ST_MakePoint(:lng, :lat)::geography) AS distance_m
FROM users u
WHERE ST_DWithin(
  u.location,
  ST_MakePoint(:lng, :lat)::geography,
  3000  -- 3km in meters
)
AND u.id != :current_user_id
AND u.show_location = true
ORDER BY distance_m ASC
LIMIT 20;
```

### Tính trung điểm cho hẹn dạo

```sql
-- Midpoint giữa 2 users
SELECT ST_AsGeoJSON(
  ST_Centroid(
    ST_Collect(
      (SELECT location::geometry FROM users WHERE id = :user_a_id),
      (SELECT location::geometry FROM users WHERE id = :user_b_id)
    )
  )
) AS midpoint;

-- Tìm địa điểm pet-friendly gần midpoint
SELECT p.name, p.address,
       ST_Distance(p.location, midpoint::geography) AS distance_m
FROM partners p
WHERE p.type IN ('cafe', 'park')
AND ST_DWithin(p.location, midpoint::geography, 2000)
ORDER BY distance_m ASC
LIMIT 3;
```

## 7. Content Moderation Pipeline

```typescript
// moderation.service.ts
export class ModerationService {
  async moderatePost(post: CreatePostDto): Promise<ModerationResult> {
    const pipeline = [
      this.checkBlacklist(post.text_content),
      this.checkSpamDuplicate(post),
      this.classifyPetRelevance(post),
      this.detectHealthClaims(post.text_content),
      this.scanMedia(post.media),
    ];

    const results = await Promise.all(pipeline);
    return this.aggregateResults(results);
  }
}
```

## 8. Event Tracking (Privacy-Compliant)

```typescript
// analytics.service.ts
const TRACKED_EVENTS = [
  "profile_created",
  "pet_added",
  "task_created",
  "task_completed",
  "invite_sent",
  "invite_accepted",
  "post_created",
  "booking_made",
  "booking_completed",
  "booking_cancelled",
  "match_created",
  "appointment_confirmed",
  "sos_activated",
] as const;

// Không gửi PII vào analytics
// Chỉ gửi event type + metadata an toàn
```

## 9. Infrastructure & Deployment

### Phase 1 (Demo)

```
Vercel / Netlify (free tier)
└── Static React app
└── MSW for mock API
```

### Phase 2 (MVP)

```
Railway / Render
├── NestJS API (1 instance)
├── PostgreSQL (managed)
├── Redis (managed)
└── Worker (BullMQ jobs)

External:
├── Firebase Auth + FCM
├── Cloudinary (free tier → paid)
└── Domain + SSL
```

### Phase 3 (Scale)

```
AWS / GCP
├── ECS or Cloud Run (auto-scale)
├── RDS PostgreSQL (read replicas)
├── ElastiCache Redis
├── S3 + CloudFront
├── SQS / Cloud Tasks
└── Monitoring (CloudWatch)
```

## 10. Security Checklist

| Concern          | Implementation                           |
| ---------------- | ---------------------------------------- |
| Authentication   | Firebase Auth (OTP), JWT tokens          |
| Authorization    | NestJS Guards + RBAC                     |
| Input Validation | Zod schemas, NestJS Pipes                |
| SQL Injection    | Prisma (parameterized queries)           |
| XSS              | React auto-escaping, CSP headers         |
| CSRF             | SameSite cookies, CSRF tokens            |
| Rate Limiting    | express-rate-limit, per-endpoint         |
| File Upload      | Type validation, size limits, virus scan |
| Data Encryption  | TLS in transit, encryption at rest       |
| Secrets          | Environment variables, no hardcoding     |
| Logging          | Structured logs, no PII in logs          |
| Dependencies     | npm audit, automated updates             |
