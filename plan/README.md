# 📋 Pawty — Kế hoạch Sản phẩm & Hệ sinh thái

> **"Nuôi thú cưng nhẹ đầu hơn, có người đồng hành khi cần."**
>
> Hệ sinh thái số dành riêng cho người nuôi thú cưng tại đô thị Việt Nam.
> Giả định: **Đã có cộng đồng hoạt động** — tập trung xây sản phẩm tối ưu.

---

## 📂 Cấu trúc Tài liệu

| File | Tầng | Nội dung |
|---|---|---|
| [`00_product_vision_and_positioning.md`](./00_product_vision_and_positioning.md) | Tầng 0 | Tầm nhìn, sứ mệnh, brand identity, design tokens, personas |
| [`01_ecosystem_architecture.md`](./01_ecosystem_architecture.md) | Tầng 1 | 5 lớp hệ sinh thái (Care → Circle → Local → Services → Pro), navigation |
| [`02_social_network_spec.md`](./02_social_network_spec.md) | Tầng 2 | Mạng xã hội thú cưng: content types, PawRank, moderation, hashtags |
| [`03_user_flows_and_screens.md`](./03_user_flows_and_screens.md) | Tầng 3 | Luồng người dùng, wireframes, micro-interactions, empty states |
| [`04_data_model_and_api.md`](./04_data_model_and_api.md) | Tầng 4 | PostgreSQL schema, REST API contracts, WebSocket events |
| [`05_monetization_and_business.md`](./05_monetization_and_business.md) | Tầng 5 | 3 nguồn thu, pricing, SOS, anti-flake, ước tính kinh tế |
| [`06_technical_architecture.md`](./06_technical_architecture.md) | Tầng 6 | Tech stack, system architecture, monorepo structure, security |
| [`07_roadmap_and_milestones.md`](./07_roadmap_and_milestones.md) | Tầng 7 | 4 phases, sprint breakdown, release checklist, risk matrix |
| [`08_metrics_and_kpis.md`](./08_metrics_and_kpis.md) | Tầng 8 | North Star metric, KPIs, decision gates, analytics implementation |

## 🏗️ Hệ sinh thái 5 Lớp

```
┌─────────────────────────────────────────────────┐
│  Layer 5: PAWTY PRO — Công cụ cho đối tác       │
│  Layer 4: PAWTY SERVICES — Dịch vụ tin cậy      │
│  Layer 3: PAWTY LOCAL — Cộng đồng & MXH         │
│  Layer 2: PAWTY CIRCLE — Vòng chăm sóc          │
│  Layer 1: PAWTY CARE — Tiện ích cá nhân         │
│  ─────────────────────────────────────────────── │
│  FOUNDATION: Auth · Profile · Permissions · Data │
└─────────────────────────────────────────────────┘
```

## 🎯 4 Trụ cột Giá trị

| Trụ | Tên | Mô tả |
|---|---|---|
| 🐾 | **CARE** | Tổ chức chăm sóc: hồ sơ, lịch, nhắc việc, bàn giao |
| 🤝 | **CONNECT** | Kết nối phối hợp: Circle, radar, hẹn dạo |
| 📸 | **SHARE** | MXH thú cưng: feed, moments, Q&A, cộng đồng |
| 💼 | **SERVE** | Dịch vụ tin cậy: grooming, vet, booking |

## ⚡ Khác biệt Chiến lược

Pawty **không phải** mạng xã hội thêm mục thú cưng. Pawty là hệ sinh thái đầu tiên tại Việt Nam **nối liền**:

```
Chăm sóc cá nhân → Phối hợp gia đình → MXH cùng sở thích → Dịch vụ chuyên nghiệp
```

Một ứng dụng, bằng tiếng Việt, cho người nuôi thú cưng.

## 📅 Lộ trình

| Phase | Thời gian | Focus |
|---|---|---|
| **Phase 1** | 4-6 tuần | Web Demo (React + Vite) — UI/UX validation |
| **Phase 2** | 6-8 tuần | MVP Backend (NestJS + PostgreSQL) — Real users |
| **Phase 3** | 4-6 tuần | Mobile App (React Native + Expo) |
| **Phase 4** | Ongoing | Growth & Optimization |

## 📊 North Star Metric

> **Số hộ/tháng hoàn thành ≥2 hành động chăm sóc có ích, trong đó ≥1 có phối hợp với người khác hoặc đối tác.**

Không tính: mở app, xem ảnh, nhấn thích.

---

*Ngày lập: 29/10/2026 · Thị trường: Việt Nam*

