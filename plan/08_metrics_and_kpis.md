# Tầng 8 — Chỉ số Đo lường & KPIs

> Đo đúng thứ cần đo. Không tính vanity metrics.

---

## 1. North Star Metric

> **Số hộ mỗi tháng hoàn thành ≥2 hành động chăm sóc có ích, trong đó ≥1 hành động có phối hợp với người khác hoặc đối tác.**

- Một hộ chỉ tính một lần
- Hành động có ích: tạo/hoàn tất care task, booking hoàn tất, yêu cầu hỗ trợ được giải quyết, bàn giao thành công
- Không tính: mở app, xem feed, scroll, like

## 2. KPI Framework

### 2.1 Acquisition (Thu hút)

| Metric | Definition | Target (Phase 1) | Target (Phase 2) |
|---|---|---|---|
| **New signups** | Tài khoản mới tạo/tháng | 30-50 | 100-200 |
| **Signup source** | Nguồn (referral, organic, partner) | Track | Track |
| **Onboarding completion** | % hoàn thành wizard đến tạo pet | ≥70% | ≥75% |
| **Cost per acquisition** | Chi phí tiền + công / user mới | ≤50.000đ | ≤30.000đ |
| **Pet profile created** | % user tạo ≥1 pet profile | ≥90% | ≥90% |

### 2.2 Activation (Kích hoạt)

| Metric | Definition | Target |
|---|---|---|
| **Aha moment** | Hoàn thành 1 hành động có ích trong 7 ngày đầu | ≥60% |
| **Care task created** | % user tạo ≥1 task trong 7 ngày | ≥50% |
| **Circle invited** | % user mời ≥1 người vào Circle trong 14 ngày | ≥30% |
| **First post** | % user đăng ≥1 moment trong 14 ngày | ≥40% |
| **Time to first value** | Phút từ signup đến hành động có ích đầu tiên | ≤15 phút |

### 2.3 Retention (Quay lại)

| Metric | Definition | Target |
|---|---|---|
| **D1 retention** | % quay lại ngày 1 | ≥50% |
| **D7 retention** | % quay lại ngày 7 | ≥35% |
| **D28 retention** | % quay lại ngày 28 | ≥20% |
| **W4 active** | % có hành động có ích trong ngày 22-28 | ≥40% |
| **Monthly active households** | Hộ active/tháng (North Star) | Track |
| **Care task frequency** | Tasks hoàn thành / hộ active / tuần | ≥3 |
| **Churn reason** | Lý do ngừng dùng (survey) | Track |

### 2.4 Engagement (Tương tác)

| Metric | Definition | Target |
|---|---|---|
| **DAU/MAU ratio** | Stickiness | ≥20% |
| **Posts per user per week** | Content creation | ≥1 |
| **Feed scroll depth** | Trung bình posts xem / session | Track |
| **Comments per post** | Discussion quality | ≥2 |
| **Circle tasks completed** | Phối hợp thành công / tuần | Track |
| **Chat messages per match** | Conversation depth | Track |

### 2.5 Revenue (Doanh thu)

| Metric | Definition | Target (Phase 2) |
|---|---|---|
| **MRR** | Monthly Recurring Revenue | Track |
| **Booking revenue** | Commission from services/tháng | Track |
| **VIP conversion** | % free → VIP | ≥5% |
| **VIP churn** | % VIP hủy/tháng | ≤10% |
| **ARPU** | Average Revenue Per User/tháng | Track |
| **LTV** | Lifetime Value (estimated) | Track |
| **Contribution margin** | Revenue - Variable costs per đơn | >0 |

### 2.6 Service Quality (Chất lượng dịch vụ)

| Metric | Definition | Target |
|---|---|---|
| **Request fulfillment rate** | % yêu cầu hợp lệ được xử lý đúng hạn | ≥80% |
| **Booking completion rate** | % booking hoàn tất (vs cancel/no-show) | ≥85% |
| **Partner rating average** | Đánh giá trung bình đối tác | ≥4.0/5 |
| **Response time** | Thời gian đối tác phản hồi booking | ≤2 giờ |
| **Ops time per request** | Phút vận hành / yêu cầu | Track & reduce |
| **Incident count** | Sự cố an toàn / tháng | 0 target |
| **Report resolution time** | Thời gian xử lý report | ≤24 giờ |

### 2.7 Community Health (Sức khỏe cộng đồng)

| Metric | Definition | Target |
|---|---|---|
| **Content moderation rate** | % posts bị flag / tổng posts | ≤5% |
| **Spam rate** | % posts bị remove do spam | ≤2% |
| **Report rate** | Reports / 1000 interactions | ≤3 |
| **Block rate** | Blocks / 1000 users | ≤10 |
| **Expert participation** | Expert comments / tuần | Track |
| **Group activity** | Posts/group/tuần (active groups) | ≥5 |
| **Helpful content ratio** | % posts tagged helpful / tổng | Track |

## 3. Ngưỡng Quyết định (Decision Gates)

### Gate 1: Sau 20 phỏng vấn (Ngày 10)

| Metric | Pass | Fail |
|---|---|---|
| Vấn đề thật trong 30 ngày | ≥10/20 kể được | <10 → đổi nhóm |
| Sẵn sàng thử | ≥15/20 đồng ý | <15 → đổi pitch |

### Gate 2: Sau 7 ngày thử (Ngày 17)

| Metric | Pass | Fail |
|---|---|---|
| Activation rate | ≥60% tạo profile + 1 action | <60% → simplify onboarding |
| Circle invite rate | ≥30% mời ≥1 người | <30% → improve invite flow |

### Gate 3: Sau 28 ngày quan sát (Ngày 38)

| Metric | Pass | Fail |
|---|---|---|
| W4 retention | ≥40% quay lại ngày 22-28 | <40% → analyze churn |
| Benefit confirmed | ≥10 hộ xác nhận lợi ích | <10 → pivot value prop |
| Paid transactions | ≥5 giao dịch trả tiền | <5 → test pricing |

### Gate 4: Scale Decision (Ngày 90)

| Metric | Pass | Fail |
|---|---|---|
| North Star | Đạt ≥30 hộ active / tháng | <30 → 1 more iteration |
| Revenue | Contribution margin >0 | <0 → fix unit economics |
| Ops efficiency | <15 phút / yêu cầu | >15 → automate first |

> [!IMPORTANT]
> **Quy tắc 2 vòng:** Nếu 2 vòng lặp liên tiếp không có bằng chứng cải thiện → dừng xây tính năng mới, focus sửa chỉ số quan trọng nhất.

## 4. Analytics Implementation

### 4.1 Events to Track

```typescript
// Core events - DO track
const CORE_EVENTS = {
  // Acquisition
  'signup_started': { source: string },
  'signup_completed': { has_pet: boolean },
  'onboarding_step': { step: number, completed: boolean },

  // Activation
  'pet_profile_created': { species: string },
  'first_care_task_created': {},
  'first_circle_invite_sent': {},
  'first_post_created': { content_type: string },
  'first_booking_made': { service_type: string },

  // Engagement
  'care_task_completed': { assigned: boolean },
  'circle_invite_accepted': {},
  'post_created': { content_type: string, has_media: boolean },
  'post_reacted': { reaction_type: string },
  'comment_created': {},
  'booking_completed': {},
  'match_created': {},
  'appointment_confirmed': {},

  // Revenue
  'vip_subscription_started': { plan: string },
  'vip_subscription_cancelled': { reason: string },
  'booking_paid': { amount: number, service_type: string },

  // Safety
  'report_submitted': { target_type: string, reason: string },
  'user_blocked': {},
  'content_removed': { reason: string },
};

// PII events - DO NOT track externally
// - Tên, SĐT, địa chỉ chính xác, nội dung tin nhắn, hồ sơ sức khỏe chi tiết
```

### 4.2 Dashboard Layout

```
┌─────────────────────────────────────────────────────────┐
│  PAWTY DASHBOARD                          Last 30 days  │
│                                                         │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐      │
│  │ Active      │ │ North Star  │ │ MRR         │      │
│  │ Households  │ │ (qualified) │ │             │      │
│  │    127      │ │     45      │ │ 2.8M VND   │      │
│  │   +23%      │ │   +15%      │ │   +40%      │      │
│  └─────────────┘ └─────────────┘ └─────────────┘      │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Retention Curve (Cohort Analysis)               │   │
│  │                                                   │   │
│  │  100% ┤█                                          │   │
│  │   80% ┤██                                         │   │
│  │   60% ┤███                                        │   │
│  │   40% ┤████                                       │   │
│  │   20% ┤█████                                      │   │
│  │    0% ┼─────────────────────────                  │   │
│  │       D1  D3  D7  D14  D21  D28                   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌──────────────────┐ ┌──────────────────────────┐     │
│  │ Top Actions      │ │ Service Metrics           │     │
│  │                  │ │                          │     │
│  │ Task completed   │ │ Bookings: 89             │     │
│  │ Post created     │ │ Completion: 87%          │     │
│  │ Circle activity  │ │ Avg rating: 4.3          │     │
│  │ Booking made     │ │ Ops time: 12min/req      │     │
│  └──────────────────┘ └──────────────────────────┘     │
└─────────────────────────────────────────────────────────┘
```

## 5. Reporting Cadence

| Report | Frequency | Audience | Content |
|---|---|---|---|
| **Daily pulse** | Hằng ngày | Founder | DAU, signups, issues |
| **Weekly review** | Hằng tuần | Team | KPIs, cohort, top issues |
| **Monthly deep-dive** | Hằng tháng | Stakeholders | Full metrics, cohort analysis, revenue |
| **Gate assessment** | At each gate | Decision makers | Pass/fail criteria, next steps |

## 6. Tools Recommendation

| Purpose | Tool | Cost |
|---|---|---|
| Product analytics | PostHog (self-host) or Mixpanel (free tier) | Free-Low |
| Error monitoring | Sentry | Free tier |
| Uptime monitoring | Better Uptime or UptimeRobot | Free |
| User feedback | In-app form + Notion database | Free |
| A/B testing | PostHog (built-in) | Free |
| Dashboard | Metabase (self-host) or Grafana | Free |

