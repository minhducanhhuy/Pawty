# 04. YÊU CẦU PHI CHỨC NĂNG (NFR), LỘ TRÌNH & QUẢN TRỊ RỦI RO

## PHẦN A – NON-FUNCTIONAL REQUIREMENTS

### A1. Hiệu năng
| Chỉ tiêu | Mục tiêu |
|---|---|
| Khởi động app (cold start) | < 2.5s |
| API p95 | < 300ms (radar truy vấn PostGIS < 150ms) |
| Chat realtime latency | < 200ms |
| Animation | 60 FPS (Reanimated) |
| Tải ảnh | CDN Cloudinary, WebP/AVIF, lazy load, thumbnail |
| Pin | Location nền dùng chế độ tiết kiệm, không polling liên tục |

### A2. Khả năng mở rộng
- Giai đoạn 1: 1 instance NestJS + PostgreSQL managed (đủ 50k MAU).
- Giai đoạn 2: Horizontal scale (container + load balancer), Redis (cache radar, rate limit, Socket.io adapter), read replica.
- Giai đoạn 3: Tách microservice (Matching, Chat, Payment, Notification), message queue (BullMQ/Kafka), sharding theo vùng.
- Mục tiêu hạ tầng: chịu 1M MAU, 100k CCU.

### A3. Bảo mật & Riêng tư
- OTP + JWT (access ngắn hạn + refresh), thiết bị tin cậy.
- Mã hoá TLS 1.2+, mã hoá dữ liệu nhạy cảm at-rest.
- **Location privacy**: làm tròn/jitter vị trí, chỉ hiển thị khoảng cách tương đối và tên toà nhà, không lộ số phòng/tầng.
- Rate limiting, chống bot/scrape, chống spam chat.
- Tuân thủ **Nghị định 13/2023/NĐ-CP** (bảo vệ dữ liệu cá nhân), GDPR khi mở rộng; Apple/Google policy.
- Xác minh webhook thanh toán bằng chữ ký, idempotency key cho giao dịch.
- Kiểm thử bảo mật định kỳ (OWASP Top 10), bug bounty giai đoạn sau.

### A4. Độ tin cậy & Vận hành
- Uptime ≥ 99.9%; backup DB hàng ngày + PITR; DR plan.
- Logging tập trung, giám sát (Sentry, Grafana/Prometheus), alert on-call.
- CI/CD (GitHub Actions), EAS Build/Update cho Expo, staging environment.
- Feature flags và phát hành dần (staged rollout).

### A5. UX / Accessibility
- Playful Minimalism: Coral `#FF6F61`, Mint `#A3E4D7`, Cream `#FDFBF7`; Fredoka + Nunito.
- Hỗ trợ cỡ chữ hệ thống, độ tương phản WCAG AA, VoiceOver/TalkBack.
- Offline-friendly: cache profile/chat, hàng đợi gửi lại.
- Onboarding < 3 phút.

### A6. Chất lượng & Kiểm thử
- Unit test (Jest) ≥ 70% logic nghiệp vụ; e2e (Detox/Maestro) cho luồng core; load test (k6) radar & chat.
- Chuẩn code: lint, TypeScript strict, review bắt buộc.

### A7. Pháp lý & Tuân thủ
- Điều khoản, chính sách riêng tư, quy định về nội dung/hành vi.
- Chính sách cấm mua bán thú cưng trái phép, bạo hành động vật.
- Giấy phép: thương mại điện tử (khi có marketplace), cổng thanh toán/ví – dùng đối tác có giấy phép (PayOS, VNPay, MoMo, Stripe khi ra quốc tế).
- Bảo hiểm thú cưng: chỉ phân phối qua đối tác được cấp phép.

### A8. Quan sát & Dữ liệu (Analytics)
- Event tracking (Amplitude/PostHog/Firebase Analytics), funnel, cohort.
- North Star Metric: **Số cuộc hẹn dạo thực tế hoàn thành / tuần**.
- Dashboards: Acquisition, Activation, Retention, Revenue, Referral (AARRR).

---

## PHẦN B – LỘ TRÌNH TRIỂN KHAI (ROADMAP)

| Phase | Thời gian | Mục tiêu | Nội dung chính |
|---|---|---|---|
| **0. Blueprint** | Tuần 0–2 | Chốt master_print | Cập nhật `master_print/` cho các tính năng 🆕 P1; chốt hợp đồng API/DB |
| **1. MVP (Core)** | Tháng 1–3 | Bản dùng được, pilot 1–2 chung cư | A1–A5 các mục P0: Onboarding, Radar, Match, Profile, Chat, Hẹn dạo, SOS, VIP, Admin cơ bản |
| **2. Pilot & Tối ưu** | Tháng 3–5 | Đạt PMF cục bộ | Đo retention, sửa UX, thêm Super Like/Rewind/Boost, Walk Now, nhắc tiêm, referral, Native Ads thử nghiệm |
| **3. Scale HCM/HN** | Tháng 5–12 | 50k MAU | Feed, CLB, sự kiện, bản đồ Pet-Friendly, B2B Partner Portal, đa ngôn ngữ, đẩy marketing mạnh |
| **4. Super App** | Năm 2 | 300k MAU | Marketplace dịch vụ, Booking, Health+, gamification, Adopt |
| **5. Thương mại hoá sâu** | Năm 3 | 1M MAU | E-commerce, bảo hiểm, SaaS đối tác, sponsorship |
| **6. Khu vực** | Năm 4–5 | ĐNÁ | TH/ID/PH/MY, localization, đối tác khu vực, cân nhắc gọi vốn Series A/B |

### Cột mốc quyết định (Go/No-Go)
- Sau MVP: D7 retention ≥ 20% → tiếp tục; < 10% → pivot sang "Pet Life OS" thiên về sức khoẻ/dịch vụ.
- Sau Pilot: ≥ 15% match chuyển thành hẹn thật → mở rộng.
- Doanh thu/user ≥ 10k đ/tháng → bật mở rộng paid UA.

---

## PHẦN C – NGÂN SÁCH & ĐỘI NGŨ (KHUNG THAM KHẢO)

| Hạng mục | Giai đoạn 1 (12 tháng) |
|---|---|
| Đội sản phẩm lõi: PM, 2 FE/Mobile, 2 BE, 1 Designer, 1 QA | Lõi |
| Growth/Community: 2–3 người + cộng tác viên chung cư | Marketing |
| Vận hành/CS/Moderation | 2 người |
| Hạ tầng cloud, SMS OTP, FCM, Cloudinary, Maps | ~5–15% tổng chi |
| Marketing | 50–60% tổng chi (nên chia: offline cụm, KOL, UGC, paid) |

> Nên giữ **ngân sách marketing giải ngân theo từng cụm (milestone-based)** thay vì dồn trước, để tránh đốt tiền khi chưa đạt PMF.

---

## PHẦN D – MA TRẬN RỦI RO

| Rủi ro | Xác suất | Tác động | Giảm thiểu |
|---|---|---|---|
| Không đủ mật độ → radar trống | Cao | Cao | Launch từng cụm, "waitlist unlock", hợp tác BQL |
| Retention thấp | Cao | Cao | Feed, health reminder, gamification, sự kiện |
| Sự cố an toàn (cắn nhau/quấy rối) | Trung | Rất cao | Safe Pet filter, báo cáo, ban, check-in, live-share |
| Rào cản thanh toán/pháp lý | Trung | Trung | Dùng đối tác có giấy phép, tư vấn luật sớm |
| Chi phí hạ tầng ảnh/video | Trung | Trung | CDN + nén, giới hạn gói Free, VIP trả phí lưu trữ |
| Đối thủ sao chép | Trung | Trung | Chiếm mật độ + dữ liệu + đối tác local sớm |
| Phụ thuộc 1 nguồn thu | Trung | Cao | Đa dạng 12 nguồn như `02_chien_luoc_ban_hang_va_kiem_tien.md` |

---

## PHẦN E – VIỆC TIẾP THEO (ACTION ITEMS)
1. CTO duyệt bộ kế hoạch này (4 file trong `plan/`).
2. Theo Master Print First: chuyển các tính năng 🆕 P0/P1 đã duyệt vào các tầng tương ứng của `master_print/` (DB, API, màn hình, nghiệp vụ).
3. Sau đó mới triển khai code mobile/server.
