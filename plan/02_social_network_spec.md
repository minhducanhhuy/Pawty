# Tầng 2 — Đặc tả Mạng xã hội Thú cưng (Pet Social Network)

> Tất cả tính năng mạng xã hội đều custom riêng cho thú cưng — từ content type, thuật toán gợi ý, hệ thống tương tác đến sàng lọc nội dung.

---

## 1. Triết lý Mạng xã hội Thú cưng

### Khác biệt với MXH tổng hợp

| Yếu tố | Instagram/Facebook | **Pawty Social** |
|---|---|---|
| Đơn vị chính | Người | **Thú cưng (Boss)** |
| Profile | Cá nhân | **Hồ sơ Boss** (chủ nuôi là người quản lý) |
| Nội dung | Mọi thứ | **Chỉ thú cưng** — kiểm duyệt nghiêm |
| Tương tác | Like ❤️ | **Paw 🐾** — cảm xúc riêng cho pet |
| Thuật toán | Engagement-maximizing | **Purpose-driven** — ưu tiên giúp ích |
| Quảng cáo | Mọi ngành | **Chỉ pet-related** — từ đối tác xác minh |
| Kết nối | Social graph | **Care graph** — theo nhu cầu chăm sóc |

### Nguyên tắc Content

1. **Boss-Centric:** Nội dung xoay quanh thú cưng, không phải selfie chủ nuôi
2. **Helpful over Viral:** Ưu tiên nội dung giúp ích hơn nội dung câu view
3. **Species-Aware:** Trải nghiệm khác nhau cho chủ chó vs chủ mèo
4. **Safety-First:** Không nội dung bạo lực, mua bán, phối giống, tự chữa bệnh
5. **Community-Verified:** Nội dung chuyên gia được gắn badge, kinh nghiệm cá nhân tách riêng

## 2. Hệ thống Nội dung (Content System)

### 2.1 Content Types

| Loại | Mô tả | Ví dụ |
|---|---|---|
| **Moment** | Ảnh/video khoảnh khắc Boss | "Lu sáng nay nghịch nước" 📸 |
| **Care Log** | Ghi chú chăm sóc có thể chia sẻ | "Mới tiêm phòng mũi 2 xong!" |
| **Question** | Hỏi cộng đồng | "Boss 3 tháng bỏ ăn bình thường không?" |
| **Tip** | Chia sẻ kinh nghiệm/mẹo | "Cách tập cho cún đi toilet" |
| **Place Review** | Đánh giá địa điểm pet-friendly | "Quán cafe XYZ cho mang pet 🌟" |
| **Event** | Buổi gặp, hoạt động cộng đồng | "Offline dắt cún Q2 Chủ nhật này" |
| **Service Review** | Đánh giá dịch vụ đã sử dụng | "Review spa ABC — grooming tốt" |

### 2.2 Post Structure

```json
{
  "post_id": "uuid",
  "author_id": "uuid",
  "pet_ids": ["uuid"],           // Tag Boss nào xuất hiện
  "content_type": "moment | care_log | question | tip | place_review | event | service_review",
  "text": "string (max 2000 chars)",
  "media": [
    {
      "type": "image | video",
      "url": "string",
      "thumbnail_url": "string",
      "aspect_ratio": "1:1 | 4:5 | 16:9"
    }
  ],
  "hashtags": ["#GoldenRetriever", "#MèoCon"],
  "location": {
    "name": "Vinhomes Central Park",
    "approximate": true          // Chỉ hiển thị khu vực, không chính xác
  },
  "species_tags": ["dog", "cat"],
  "breed_tags": ["golden_retriever"],
  "topic_tags": ["grooming", "nutrition", "training"],
  "visibility": "public | circle_only | private",
  "is_expert_content": false,
  "expert_verified": false,
  "health_disclaimer": false,    // Auto-true nếu chứa từ khóa sức khỏe
  "created_at": "ISO 8601",
  "engagement": {
    "paw_count": 0,
    "comment_count": 0,
    "share_count": 0,
    "save_count": 0
  }
}
```

### 2.3 Media Guidelines

| Quy định | Chi tiết |
|---|---|
| Ảnh | Max 10 ảnh/post, max 10MB/ảnh, JPEG/PNG/WebP |
| Video | Max 1 video/post, max 60s MVP (mở rộng 3 phút sau), max 100MB, MP4/MOV |
| Thumbnail | Auto-generated, lazy loading |
| Image Moderation | AI scan + manual review nếu bị flag |

## 3. Hệ thống Tương tác (Engagement System)

### 3.1 Reaction System — "Paw Reactions" 🐾

Thay vì Like đơn giản, Pawty có hệ thống reaction custom cho thú cưng:

| Reaction | Icon | Ý nghĩa | Code |
|---|---|---|---|
| **Paw** | 🐾 | Thích / Dễ thương | `paw` |
| **Heart Eyes** | 😍 | Yêu quá! | `heart_eyes` |
| **Laughing** | 😂 | Hài quá Boss! | `laughing` |
| **Worried** | 😟 | Lo lắng / Thương Boss | `worried` |
| **Helpful** | 💡 | Hữu ích (cho Tip/Q&A) | `helpful` |

- Tap nhanh = Paw (mặc định)
- Long press = Mở reaction picker với animation

### 3.2 Comment System

```json
{
  "comment_id": "uuid",
  "post_id": "uuid",
  "author_id": "uuid",
  "text": "string (max 500 chars)",
  "reply_to": "uuid | null",      // Nested comments (1 cấp)
  "is_expert": false,             // Badge chuyên gia
  "mentions": ["@username"],
  "reactions": { "paw": 0, "helpful": 0 },
  "created_at": "ISO 8601"
}
```

**Quy tắc comment:**
- Nested reply chỉ 1 cấp (tránh phức tạp)
- Expert comments hiển thị trước + badge xanh mint
- Bình luận chứa từ khóa sức khỏe kèm auto-disclaimer
- Anti-spam: rate limit 10 comment/phút

### 3.3 Share System

| Loại chia sẻ | Mô tả |
|---|---|
| Share to Feed | Chia sẻ lên feed cá nhân kèm caption |
| Share to Circle | Chia sẻ riêng cho vòng chăm sóc |
| Share to Group | Chia sẻ vào nhóm cộng đồng |
| External Share | Tạo link/ảnh để chia sẻ ngoài app (watermark Pawty) |

### 3.4 Save / Bookmark

- Save post vào bộ sưu tập cá nhân
- Tổ chức theo folder: "Mẹo chăm sóc", "Địa điểm hay", "Công thức nấu"

## 4. Feed Algorithm — "PawRank"

### 4.1 Triết lý Thuật toán

> [!IMPORTANT]
> Pawty KHÔNG dùng thuật toán tối đa engagement bằng mọi giá. PawRank ưu tiên **nội dung giúp ích** và **kết nối có mục đích**.

### 4.2 Feed Composition

Feed pha trộn từ nhiều nguồn, với tỷ lệ mục tiêu:

| Nguồn | Tỷ lệ | Mô tả |
|---|---|---|
| Circle & Following | 40% | Người đã follow/Circle |
| Local Community | 25% | Cùng khu vực, cùng nhóm |
| Discovery | 20% | Nội dung hay từ ngoài mạng lưới |
| Expert & Helpful | 10% | Nội dung chuyên gia, Q&A hữu ích |
| Partner Content | 5% | Từ đối tác xác minh (ghi rõ "Tài trợ") |

### 4.3 Ranking Signals

| Signal | Weight | Mô tả |
|---|---|---|
| **Relevance** | 30% | Cùng loài, giống, vấn đề tương tự |
| **Recency** | 25% | Mới hơn ưu tiên hơn |
| **Engagement Quality** | 20% | Comment dài > Paw > View |
| **Author Trust** | 15% | Đánh giá tốt, nội dung chất lượng, expert badge |
| **Proximity** | 10% | Gần về địa lý |

### 4.4 Content Boost & Demotion

**Boost (+):**
- Nội dung được expert xác nhận
- Q&A có answer được mark "Helpful" nhiều
- Care tips có ảnh/video minh họa
- Post đầu tiên của người dùng mới (khuyến khích tham gia)

**Demotion (-):**
- Clickbait (AI detect)
- Nội dung spam/trùng lặp
- Post không liên quan thú cưng
- Engagement bait ("Like nếu yêu Boss")

**Block:**
- Mua bán thú cưng
- Phối giống
- Bạo lực / ngược đãi
- Tự chẩn đoán / kê đơn thuốc
- Quảng cáo trá hình

## 5. Hồ sơ Thú cưng Công khai (Public Pet Profile)

### 5.1 Layout: 2 Tab

#### Tab 1: "Khoảnh khắc" (Moments)
```
┌──────────────────────────────────┐
│  🖼️ Cover Photo (Boss)          │
│  ┌────┐                         │
│  │ 🐕 │  Lu — Golden Retriever  │
│  │avt │  📍 Vinhomes Q9         │
│  └────┘  🐾 245 followers       │
│                                  │
│  [Follow]  [Message]  [Share]    │
│                                  │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  Khoảnh khắc │ Hồ sơ            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                  │
│  ┌─────┐ ┌─────┐ ┌─────┐       │
│  │  📷 │ │  📷 │ │  📷 │       │
│  │     │ │     │ │     │       │
│  └─────┘ └─────┘ └─────┘       │
│  ┌─────┐ ┌─────┐ ┌─────┐       │
│  │  📷 │ │  📷 │ │  📷 │       │
│  │     │ │     │ │     │       │
│  └─────┘ └─────┘ └─────┘       │
└──────────────────────────────────┘
```

#### Tab 2: "Hồ sơ" (Bio & Care Info)
```
┌──────────────────────────────────┐
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│  Khoảnh khắc │ Hồ sơ            │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                  │
│  ┌────────────────────────────┐  │
│  │ 🟢 Đã tiêm phòng đầy đủ  │  │  ← Card xanh mint
│  │ Vắc-xin 7 bệnh ✓         │  │
│  │ Phòng dại ✓               │  │
│  │ Cập nhật: 15/10/2026      │  │
│  └────────────────────────────┘  │
│                                  │
│  📋 Thông tin cơ bản             │
│  • Giống: Golden Retriever       │
│  • Tuổi: 2 năm 3 tháng          │
│  • Cân nặng: 28kg (Lớn)         │
│  • Năng lượng: Cao ⚡⚡⚡         │
│  • Đã triệt sản: Có             │
│                                  │
│  ✅ Thói quen tốt                │
│  [Thân thiện] [Nghe lệnh tốt]   │
│  [Thích chơi bóng]              │
│                                  │
│  ⚠️ Cần lưu ý                    │
│  [Hay nhảy lên người] [Sợ pháo] │
│  [Bảo vệ đồ ăn]                 │
│                                  │
│  🏥 Bác sĩ thú y                │
│  BS. Nguyễn Văn A — PetCare Q9  │
└──────────────────────────────────┘
```

## 6. Hệ thống Sàng lọc Nội dung (Content Moderation)

### 6.1 Multi-Layer Moderation Pipeline

```
User Post
    ↓
[Layer 1] Auto-Filter (Real-time)
    │ • Từ khóa cấm (blacklist)
    │ • Spam detection (duplicate, link spam)
    │ • NSFW image detection
    │ • Violence/abuse detection
    ↓
[Layer 2] AI Classification
    │ • Pet-relevance score (< 0.3 → reject)
    │ • Health claim detection → add disclaimer
    │ • Breeding/trading detection → block
    │ • Sentiment analysis (toxic → flag)
    ↓
[Layer 3] Community Report
    │ • Users flag inappropriate content
    │ • Threshold: 3 reports → auto-hide + manual review
    ↓
[Layer 4] Human Review
    │ • Moderator team xử lý flagged content
    │ • Appeal process cho user
    ↓
Published / Removed
```

### 6.2 Content Categories & Rules

| Category | Cho phép | Kiểm duyệt | Cấm |
|---|---|---|---|
| Khoảnh khắc Boss | ✅ | | |
| Mẹo chăm sóc | ✅ | Gắn disclaimer nếu liên quan sức khỏe | |
| Review địa điểm | ✅ | | |
| Hỏi đáp | ✅ | Expert answer ưu tiên | |
| Mua bán thú cưng | | | ❌ |
| Phối giống | | | ❌ |
| Tự chữa bệnh/kê đơn | | | ❌ |
| Bạo lực/ngược đãi | | | ❌ |
| Nội dung người lớn | | | ❌ |
| Quảng cáo trá hình | | | ❌ |
| Spam/scam | | | ❌ |
| Chính trị/tôn giáo | | | ❌ |

### 6.3 Health Content Protocol

```
Khi phát hiện nội dung liên quan sức khỏe:
    ↓
[1] Gắn disclaimer tự động:
    "⚕️ Nội dung này chỉ mang tính tham khảo.
     Hãy tham khảo ý kiến bác sĩ thú y cho Boss của bạn."
    ↓
[2] Nếu có Expert comment → highlight
    ↓
[3] Nếu nội dung nghiêm trọng (triệu chứng cấp tính):
    Hiển thị: "🚨 Nếu Boss có triệu chứng này, hãy đến
    bác sĩ thú y ngay. [Tìm phòng khám gần nhất]"
```

## 7. Nhóm Cộng đồng (Community Groups)

### 7.1 Group Types

| Loại | Ví dụ | Ai tạo |
|---|---|---|
| **Khu vực** | "Pet Lovers Vinhomes Q9" | Auto-generated theo khu |
| **Giống** | "Hội Golden Retriever SG" | User-created |
| **Nhu cầu** | "Hỏi đáp sức khỏe Boss" | Pawty + Expert mod |
| **Hoạt động** | "Nhóm dắt dạo sáng Q7" | User-created |
| **Đối tác** | "PetSpa ABC — Tin tức" | Partner-created |

### 7.2 Group Governance

- Mỗi group có 1-3 người quản lý (moderator)
- Nội quy group mặc định + tùy chỉnh
- Member approval cho group private
- Report → Mod review → Action (warn/mute/ban)

## 8. Hashtag & Discovery System

### 8.1 Hashtag Categories

| Category | Ví dụ | Auto-suggest |
|---|---|---|
| **Loài** | #Chó, #Mèo, #Hamster | ✅ |
| **Giống** | #GoldenRetriever, #MèoAnh, #Corgi | ✅ |
| **Hoạt động** | #DắtDạo, #Grooming, #Swimming | ✅ |
| **Sức khỏe** | #TiêmPhòng, #Triệtsản, #GiảmCân | ✅ + disclaimer |
| **Địa điểm** | #VinhomesQ9, #ParkQ7 | ✅ |
| **Trending** | #BossNghịch, #MèoNgủ | Dynamic |
| **Sự kiện** | #PawtyMeetupQ9, #DogDaySG | Event-linked |

### 8.2 Explore/Discover Page

```
┌──────────────────────────────────┐
│  🔍 Tìm kiếm Boss, bài viết...  │
│                                  │
│  [Tất cả] [Chó] [Mèo] [Gần bạn]│
│                                  │
│  🔥 Trending                     │
│  ┌─────────────────────────────┐ │
│  │  #BossNghịch  #MèoNgủ      │ │
│  │  #GroomingSG  #ParkHCM     │ │
│  └─────────────────────────────┘ │
│                                  │
│  ⭐ Dành cho bạn                 │
│  (Content theo loài/giống/khu)   │
│  ┌──────┐ ┌──────┐              │
│  │  📷  │ │  📷  │              │
│  └──────┘ └──────┘              │
│                                  │
│  📍 Gần bạn                     │
│  (Posts từ chủ nuôi cùng khu)    │
│                                  │
│  💡 Mẹo hôm nay                 │
│  (Expert content curated)        │
└──────────────────────────────────┘
```

## 9. Notification Strategy cho Social

| Event | Push | In-app | Mặc định |
|---|---|---|---|
| Người follow mới | ❌ | ✅ | On |
| Paw trên post | ❌ | ✅ | On (batch) |
| Comment trên post | ✅ | ✅ | On |
| Reply comment | ✅ | ✅ | On |
| Mention (@) | ✅ | ✅ | On |
| Post mới từ Circle | ❌ | ✅ | On |
| Trending trong khu | ❌ | ✅ | Off |
| Expert trả lời Q&A | ✅ | ✅ | On |

> [!TIP]
> Batch paw notifications: "Lu, Miu và 12 Boss khác đã 🐾 bài viết của bạn" — tránh spam notification.

