# Tầng 7 — Lộ trình & Milestones

> Giả định: Đã có cộng đồng. Lộ trình tập trung vào xây dựng sản phẩm tối ưu.

---

## 1. Tổng quan 4 Phase

```
Phase 1          Phase 2          Phase 3          Phase 4
Web Demo         MVP Backend      Mobile App       Growth
(4-6 tuần)       (6-8 tuần)       (4-6 tuần)       (ongoing)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
UI/UX Demo       Full-Stack       React Native     Scale &
Mock Data        Real API         iOS/Android      Optimize
User Testing     Real Users       App Store        New Features
```

## 2. Phase 1: Web Demo (Tuần 1-6)

### Mục tiêu
- Demo hoàn chỉnh UX/UI toàn bộ luồng chính
- Test với 20-30 người dùng thực
- Validate product-market fit trước khi code backend

### Sprint 1 (Tuần 1-2): Foundation & Onboarding

| Task | Deliverable | Ưu tiên |
|---|---|---|
| Project setup | Vite + React + Tailwind + Router | P0 |
| Design system | Colors, typography, components | P0 |
| iPhone frame | Mobile mock container cho desktop | P0 |
| Splash screen | Logo animation | P0 |
| Welcome slides | 3-slide onboarding | P0 |
| Phone auth UI | OTP input (mock) | P0 |
| Create profile | User profile form | P0 |
| Create pet wizard | 4-step pet profile | P0 |
| Bottom tab bar | Navigation skeleton | P0 |

**✅ Milestone 1:** User có thể onboard, tạo profile và pet profile hoàn chỉnh.

### Sprint 2 (Tuần 3-4): Care + Circle + Today

| Task | Deliverable | Ưu tiên |
|---|---|---|
| Today screen | Daily overview layout | P0 |
| Care tasks | Create, list, mark done | P0 |
| Task reminders | Mock notification UI | P0 |
| Circle invite | Invite flow + role selection | P0 |
| Circle task assign | Giao việc cho thành viên | P0 |
| Task completion | Confirm + note + photo | P0 |
| Activity timeline | Ai-làm-gì-khi-nào | P1 |
| Care calendar | Monthly view | P1 |

**✅ Milestone 2:** User có thể tạo việc, mời Circle, giao việc và xác nhận hoàn thành.

### Sprint 3 (Tuần 5-6): Social + Explore + Services

| Task | Deliverable | Ưu tiên |
|---|---|---|
| Pet feed | Scrollable post list | P0 |
| Create moment | Post ảnh + caption + tags | P0 |
| Paw reactions | Reaction system | P0 |
| Comments | Comment + reply | P0 |
| Pet profile page | 2 tabs (Moments + Bio) | P0 |
| Explore/Discover | Trending, near me | P1 |
| Hashtag system | Auto-suggest | P1 |
| Partner list | Service provider cards | P1 |
| Booking flow | Select service → confirm | P1 |
| Chat UI | Basic chat interface | P1 |
| Radar UI | Swipe cards (mock) | P2 |

**✅ Milestone 3:** Demo hoàn chỉnh — toàn bộ luồng chính hoạt động với mock data.

### Phase 1 Deliverables
- [ ] Web demo chạy tốt trên mobile browser
- [ ] iPhone frame mock trên desktop
- [ ] 20+ người test và phản hồi
- [ ] Danh sách bugs/improvements từ testing
- [ ] Product-market fit assessment

---

## 3. Phase 2: MVP Backend (Tuần 7-14)

### Mục tiêu
- Backend hoạt động với dữ liệu thật
- 50-200 users thực đầu tiên
- Kiểm chứng retention và monetization

### Sprint 4 (Tuần 7-8): Backend Foundation

| Task | Deliverable |
|---|---|
| NestJS project setup | Monorepo structure |
| PostgreSQL + PostGIS | Database + migrations |
| Prisma schema | All tables from data model |
| Firebase Auth | OTP verification |
| JWT auth flow | Login, refresh, logout |
| User CRUD | Profile endpoints |
| Pet CRUD | Pet profile endpoints |
| File upload | Cloudinary integration |
| Error handling | Global exception filter |

### Sprint 5 (Tuần 9-10): Care + Circle + Chat

| Task | Deliverable |
|---|---|
| Household CRUD | Create, manage households |
| Circle invite | Invite, accept, revoke |
| Care tasks API | CRUD + assign + complete |
| Task reminders | BullMQ scheduled jobs |
| Push notifications | FCM integration |
| Socket.io gateway | Real-time infrastructure |
| Chat API | Send, receive, read receipts |
| Chat UI connect | Wire frontend to real API |

### Sprint 6 (Tuần 11-12): Social + Feed + Moderation

| Task | Deliverable |
|---|---|
| Posts API | Create, list, delete |
| Media upload | Multi-image, video support |
| Reactions API | Paw reactions system |
| Comments API | Comments + replies |
| Follow system | Follow/unfollow |
| Feed algorithm | PawRank v1 |
| Content moderation | Auto-filter pipeline |
| Hashtag indexing | Search + trending |
| Explore API | Discovery endpoints |

### Sprint 7 (Tuần 13-14): Services + Matching + Polish

| Task | Deliverable |
|---|---|
| Partners API | CRUD, search, slots |
| Booking API | Create, status, cancel |
| Review system | Rating + text + reply |
| Radar API | PostGIS proximity queries |
| Matching system | Swipe, match logic |
| Walk appointment | Create, confirm, complete |
| Notification center | In-app notifications |
| Admin dashboard | Basic moderation tools |
| Data export/delete | GDPR/BVDLCN compliance |

### Phase 2 Deliverables
- [ ] Backend API hoàn chỉnh, deployed
- [ ] 50+ real users onboarded
- [ ] 10+ care tasks completed through Circle
- [ ] 5+ bookings completed
- [ ] Retention metrics (D7, D28)
- [ ] First revenue (if applicable)

---

## 4. Phase 3: Mobile App (Tuần 15-20)

### Mục tiêu
- React Native app trên iOS & Android
- Tối ưu native experience
- App Store / Google Play submission

### Sprint 8-9 (Tuần 15-18): Core Migration

| Task | Deliverable |
|---|---|
| Expo project setup | React Native + Expo Router |
| NativeWind setup | Tailwind → NativeWind migration |
| Auth flow | Native OTP + biometric |
| Today screen | Native today view |
| Care tasks | Native task management |
| Circle | Native circle management |
| Social feed | Native feed + scroll performance |
| Post creation | Camera + gallery + post |
| Chat | Native chat with Socket.io |
| Push notifications | Native push handling |

### Sprint 10 (Tuần 19-20): Native Features + Polish

| Task | Deliverable |
|---|---|
| Native animations | Reanimated 3 (60fps) |
| Map integration | React Native Maps |
| Radar native | Native swipe gestures |
| Offline support | Cache key data |
| Deep linking | Universal links |
| App Store prep | Icons, screenshots, description |
| Performance | Optimize bundle, startup time |
| Testing | Device testing, crash monitoring |

### Phase 3 Deliverables
- [ ] iOS app on TestFlight / App Store
- [ ] Android app on Google Play
- [ ] <3s cold start time
- [ ] 60fps animations
- [ ] Push notifications working
- [ ] Deep links working

---

## 5. Phase 4: Growth & Optimization (Ongoing)

### Potential Features (prioritize by data)

| Feature | Trigger to Build |
|---|---|
| Groups v2 | >10 active groups requesting features |
| Stories | >100 daily active posters |
| SOS Tìm Boss | >500 users in single area |
| Pawty Pro SaaS | >20 active partners |
| Video content | User demand + infrastructure ready |
| AI care assistant | Clear use case with safety guardrails |
| Insurance referral | Partner available + legal review |
| Multi-city expansion | First city metrics stable |

---

## 6. Release Checklist

### Pre-Launch (mỗi version)

- [ ] All P0 features tested
- [ ] Performance benchmark passed
- [ ] Security checklist completed
- [ ] Privacy compliance verified
- [ ] Content moderation active
- [ ] Error monitoring setup (Sentry)
- [ ] Analytics events tracked
- [ ] Backup & restore tested
- [ ] Terms of Service + Privacy Policy published
- [ ] Support channel ready

### Day-1 Monitoring

- [ ] Error rates < 1%
- [ ] API response time < 500ms (p95)
- [ ] Onboarding completion > 70%
- [ ] No critical security issues
- [ ] Push notifications delivering
- [ ] File uploads working
- [ ] Chat real-time working

## 7. Risk & Contingency

| Risk | Probability | Impact | Mitigation |
|---|---|---|---|
| Low retention | High | Critical | Focus on Care value before social |
| No one pays | High | High | Test payment early (Phase 1 survey) |
| Tech debt pile-up | Medium | Medium | Code review, refactor sprints |
| Partner churn | Medium | High | Prove ROI with booking data |
| Content moderation overwhelm | Medium | Medium | Auto-filter + community mods |
| Firebase costs spike | Low | Medium | Monitor usage, plan migration path |
| App Store rejection | Low | Medium | Follow guidelines, prepare appeal |

