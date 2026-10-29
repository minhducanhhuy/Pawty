# Tầng 3 — Luồng Người dùng & Đặc tả Màn hình

> Chi tiết từng màn hình, trạng thái, micro-interactions và luồng chuyển tiếp.

---

## 1. Tổng quan Navigation

### Bottom Tab Bar (5 tabs)

```
┌─────────────────────────────────────────────────────┐
│  🏠          🔍          ➕          💬         👤   │
│  Hôm nay    Khám phá    Tạo mới    Chat       Tôi  │
└─────────────────────────────────────────────────────┘
```

### Screen Map

```
App
├── Onboarding
│   ├── Welcome (3 slides)
│   ├── Phone Auth (OTP)
│   ├── Create Profile
│   └── Create Pet Profile (wizard)
│
├── 🏠 Hôm nay (Today)
│   ├── Daily Overview
│   ├── Task List (Care tasks)
│   ├── Circle Activity Feed
│   ├── Pending Requests
│   └── Upcoming Bookings
│
├── 🔍 Khám phá (Explore)
│   ├── Pet Social Feed
│   ├── Discover/Trending
│   ├── Community Groups
│   │   ├── Group List
│   │   ├── Group Detail
│   │   └── Create Group
│   ├── Places Map
│   ├── Q&A Section
│   └── Radar (Find nearby)
│       ├── Swipe Cards
│       ├── Match Screen
│       └── Filters
│
├── ➕ Tạo mới (Create) — Bottom Sheet
│   ├── New Moment (post)
│   ├── New Care Task
│   ├── New Request
│   └── Book Service
│
├── 💬 Chat (Messages)
│   ├── Conversation List
│   ├── Chat Room
│   │   ├── Text/Image/Voice
│   │   ├── Walk Appointment
│   │   └── Care Handover
│   └── Group Chat
│
├── 👤 Tôi (Profile)
│   ├── My Profile (2 tabs)
│   ├── My Pets (list + detail)
│   ├── My Circle
│   ├── Care Calendar
│   ├── Service History
│   ├── Saved / Bookmarks
│   ├── Settings
│   └── Privacy & Data
│
├── Pet Profile (Public)
│   ├── Tab 1: Moments (grid)
│   └── Tab 2: Bio & Care Info
│
├── Service Flow
│   ├── Partner List
│   ├── Partner Detail
│   ├── Booking Flow
│   ├── Booking Status
│   └── Review & Rating
│
└── Modals & Overlays
    ├── Notification Center
    ├── Report Content
    ├── Block User
    ├── SOS Alert (future)
    └── VIP Upgrade
```

## 2. Luồng Onboarding

### 2.1 Welcome Screens (3 Slides)

```
Slide 1:                    Slide 2:                    Slide 3:
┌──────────────────┐       ┌──────────────────┐       ┌──────────────────┐
│                  │       │                  │       │                  │
│    🐕 🐈         │       │    👨‍👩‍👧 🐕        │       │    📋 🔔         │
│                  │       │                  │       │                  │
│  "Tạo hồ sơ     │       │  "Mời người thân │       │  "Nhẹ đầu hơn   │
│   cho Boss"      │       │   cùng chăm sóc" │       │   mỗi ngày"     │
│                  │       │                  │       │                  │
│  Sổ tiêm, lịch  │       │  Giao việc, theo │       │  Nhắc việc,     │
│  chăm sóc, thói │       │  dõi, an tâm khi │       │  đặt dịch vụ,   │
│  quen — tất cả  │       │  đi vắng.        │       │  kết nối cộng   │
│  trong một app.  │       │                  │       │  đồng yêu Boss. │
│                  │       │                  │       │                  │
│  ● ○ ○           │       │  ○ ● ○           │       │  ○ ○ ●           │
│  [Tiếp]          │       │  [Tiếp]          │       │  [Bắt đầu]      │
└──────────────────┘       └──────────────────┘       └──────────────────┘
```

### 2.2 Phone Auth

```
┌──────────────────────────┐
│                          │
│  Pawty 🐾                │
│                          │
│  Đăng nhập bằng          │
│  số điện thoại           │
│                          │
│  ┌──────────────────┐    │
│  │ 🇻🇳 +84 │          │    │
│  └──────────────────┘    │
│  ┌──────────────────┐    │
│  │ Số điện thoại     │    │
│  └──────────────────┘    │
│                          │
│  [    Gửi mã OTP    ]    │  ← Coral button
│                          │
│  Bằng việc tiếp tục,    │
│  bạn đồng ý với         │
│  Điều khoản & Quyền     │
│  riêng tư                │
└──────────────────────────┘
        ↓
┌──────────────────────────┐
│                          │
│  Nhập mã xác thực       │
│                          │
│  Mã đã gửi đến          │
│  0912 *** 456            │
│                          │
│  ┌──┐ ┌──┐ ┌──┐ ┌──┐    │
│  │  │ │  │ │  │ │  │    │   ← Auto-focus, auto-submit
│  └──┘ └──┘ └──┘ └──┘    │
│                          │
│  Gửi lại mã (45s)       │
└──────────────────────────┘
```

### 2.3 Create Profile (Chủ nuôi)

```
┌──────────────────────────┐
│  ← Tạo hồ sơ            │
│                          │
│     ┌─────┐              │
│     │  📷 │              │  ← Tap to upload avatar
│     │ +   │              │
│     └─────┘              │
│                          │
│  Tên hiển thị *          │
│  ┌──────────────────┐    │
│  │                  │    │
│  └──────────────────┘    │
│                          │
│  Khu vực *               │
│  ┌──────────────────┐    │
│  │ Chọn quận/huyện ▾│    │
│  └──────────────────┘    │
│                          │
│  Tên chung cư/khu phố   │
│  ┌──────────────────┐    │
│  │ VD: Vinhomes Q9  │    │
│  └──────────────────┘    │
│                          │
│  [    Tiếp theo     ]    │
└──────────────────────────┘
```

### 2.4 Create Pet Profile (Wizard — 4 bước)

**Bước 1/4: Thông tin cơ bản**
```
┌──────────────────────────┐
│  ← Thêm Boss  (1/4)     │
│  ●━━━━○━━━━○━━━━○        │  ← Progress bar
│                          │
│     ┌─────┐              │
│     │ 🐕  │              │
│     │ +   │              │
│     └─────┘              │
│                          │
│  Tên Boss *              │
│  ┌──────────────────┐    │
│  │                  │    │
│  └──────────────────┘    │
│                          │
│  Loài *                  │
│  [🐕 Chó]  [🐈 Mèo]     │  ← Toggle chips
│                          │
│  Giống *                 │
│  ┌──────────────────┐    │
│  │ Tìm giống...    ▾│    │  ← Searchable dropdown
│  └──────────────────┘    │
│                          │
│  Giới tính *             │
│  [♂ Đực]  [♀ Cái]       │
│                          │
│  [    Tiếp theo     ]    │
└──────────────────────────┘
```

**Bước 2/4: Sức khỏe & Tiêm phòng**
```
┌──────────────────────────┐
│  ← Thêm Boss  (2/4)     │
│  ●━━━━●━━━━○━━━━○        │
│                          │
│  Ngày sinh / Tuổi ước    │
│  ┌──────────────────┐    │
│  │ DD/MM/YYYY       │    │
│  └──────────────────┘    │
│                          │
│  Cân nặng (kg)           │
│  ┌──────────────────┐    │
│  │                  │    │
│  └──────────────────┘    │
│                          │
│  Đã tiêm phòng?         │
│  [Đã tiêm đủ] [Chưa đủ] │
│  [Chưa tiêm]            │
│                          │
│  Đã triệt sản?          │
│  [Đã] [Chưa] [Chưa rõ]  │
│                          │
│  Bệnh lý / Dị ứng       │
│  ┌──────────────────┐    │
│  │ VD: dị ứng gà    │    │
│  └──────────────────┘    │
│                          │
│  [    Tiếp theo     ]    │
└──────────────────────────┘
```

**Bước 3/4: Tính cách & Hành vi**
```
┌──────────────────────────┐
│  ← Thêm Boss  (3/4)     │
│  ●━━━━●━━━━●━━━━○        │
│                          │
│  Mức năng lượng          │
│  ⚡ [Thấp] [TB] [Cao]    │
│                          │
│  Tính cách (chọn nhiều)  │
│  [Thân thiện] [Nhút nhát]│
│  [Hiếu động] [Bình tĩnh] │
│  [Tò mò] [Độc lập]      │
│                          │
│  ✅ Thói quen tốt         │
│  [+ Thêm]                │
│  ┌──────────────────┐    │
│  │ Nghe lệnh tốt    │    │
│  └──────────────────┘    │
│                          │
│  ⚠️ Cần lưu ý            │
│  [+ Thêm]                │
│  ┌──────────────────┐    │
│  │ Bảo vệ đồ ăn     │    │
│  └──────────────────┘    │
│                          │
│  [    Tiếp theo     ]    │
└──────────────────────────┘
```

**Bước 4/4: Nhu cầu chính**
```
┌──────────────────────────┐
│  ← Thêm Boss  (4/4)     │
│  ●━━━━●━━━━●━━━━●        │
│                          │
│  Bạn cần gì nhất? *      │
│  (Chọn 1-3)              │
│                          │
│  [📋 Quản lý chăm sóc]   │
│  [👥 Phối hợp gia đình]  │
│  [🐕 Tìm bạn dắt dạo]   │
│  [💇 Tìm dịch vụ grooming]│
│  [🏥 Tìm bác sĩ thú y]   │
│  [💬 Tham gia cộng đồng] │
│  [📸 Chia sẻ khoảnh khắc]│
│  [🏠 Nhờ trông khi đi vắng]│
│                          │
│  [   Hoàn tất 🎉    ]    │
└──────────────────────────┘
```

**Onboarding Success:**
```
┌──────────────────────────┐
│                          │
│       🎉 🐾              │
│                          │
│  Chào mừng Lu            │
│  đến Pawty!              │
│                          │
│  Hồ sơ Boss đã sẵn sàng │
│                          │
│  [Khám phá cộng đồng]   │  ← Primary
│  [Mời người chăm sóc]   │  ← Secondary
│  [Về trang chính]        │  ← Text link
└──────────────────────────┘
```

## 3. Trang "Hôm nay" (Today — Home Screen)

```
┌──────────────────────────────┐
│  Good morning, Mai! 🐾       │
│  Lu có 3 việc hôm nay       │
│                              │
│  ┌────────────────────────┐  │
│  │ 📋 VIỆC CẦN LÀM       │  │
│  │                        │  │
│  │ ☐ Cho Lu ăn sáng       │  │  ← Tap to mark done
│  │   👤 Mẹ Mai — chưa làm │  │
│  │                        │  │
│  │ ☐ Uống thuốc giun      │  │
│  │   👤 Mai — 8:00 AM     │  │
│  │                        │  │
│  │ ☑ Dắt dạo sáng ✓      │  │  ← Completed
│  │   👤 Ba Mai — 6:30 AM  │  │
│  └────────────────────────┘  │
│                              │
│  ┌────────────────────────┐  │
│  │ 📅 SẮP TỚI            │  │
│  │                        │  │
│  │ 🔔 Grooming @ PetSpa   │  │
│  │    Thứ 7, 10:00 AM     │  │
│  │    [Xem chi tiết]      │  │
│  └────────────────────────┘  │
│                              │
│  ┌────────────────────────┐  │
│  │ 👥 VÒNG CHĂM SÓC      │  │
│  │                        │  │
│  │ Mẹ Mai đã hoàn thành   │  │
│  │ "Thay nước" lúc 7:15   │  │
│  │                        │  │
│  │ Ba Mai: "Lu ăn hết     │  │
│  │ bát sáng rồi nha"     │  │
│  └────────────────────────┘  │
│                              │
│  ┌────────────────────────┐  │
│  │ 🔔 YÊU CẦU ĐANG CHỜ   │  │
│  │                        │  │
│  │ Hẹn dắt dạo với       │  │
│  │ Miu (Corgi) — Q9       │  │
│  │ [Xem] [Chấp nhận]     │  │
│  └────────────────────────┘  │
│                              │
│  🏠     🔍     ➕     💬  👤  │
└──────────────────────────────┘
```

## 4. Trang Khám phá (Explore)

```
┌──────────────────────────────┐
│  🔍 Tìm kiếm...             │
│                              │
│  [Feed] [Nhóm] [Địa điểm]   │  ← Segment control
│  [Q&A] [Radar]               │
│                              │
│ ─── Feed View ───            │
│                              │
│  ┌────────────────────────┐  │
│  │ 🐕 Lu · @mai_petmom    │  │
│  │ 2 giờ trước · Q9       │  │
│  │                        │  │
│  │ ┌────────────────────┐ │  │
│  │ │                    │ │  │
│  │ │    📷 Photo        │ │  │
│  │ │                    │ │  │
│  │ └────────────────────┘ │  │
│  │                        │  │
│  │ "Lu sáng nay tắm xong │  │
│  │  thơm phức, nghịch    │  │
│  │  máy sấy suýt rớt 😂" │  │
│  │                        │  │
│  │ #GoldenRetriever #Bath │  │
│  │                        │  │
│  │ 🐾 45  💬 12  🔗  📌   │  │
│  └────────────────────────┘  │
│                              │
│  ┌────────────────────────┐  │
│  │ 🎯 TÀI TRỢ            │  │  ← Ghi rõ "Tài trợ"
│  │ PetSpa ABC — Giảm 20%  │  │
│  │ Grooming cho Boss mới  │  │
│  │ [Đặt lịch ngay]       │  │
│  └────────────────────────┘  │
│                              │
│  🏠     🔍     ➕     💬  👤  │
└──────────────────────────────┘
```

## 5. Luồng Tạo mới (Create)

Tap ➕ → Bottom Sheet hiện lên:

```
┌──────────────────────────────┐
│  ━━━ (drag handle)           │
│                              │
│  Tạo mới                    │
│                              │
│  📸 Đăng khoảnh khắc        │
│     Chia sẻ ảnh/video Boss   │
│                              │
│  📋 Tạo việc chăm sóc       │
│     Thêm việc cần làm       │
│                              │
│  🤝 Gửi yêu cầu kết nối    │
│     Tìm bạn dắt dạo / giúp │
│                              │
│  📅 Đặt dịch vụ             │
│     Grooming, khám, spa...   │
│                              │
│  ❓ Đặt câu hỏi             │
│     Hỏi cộng đồng           │
└──────────────────────────────┘
```

### Luồng Đăng Moment

```
┌──────────────────────────────┐
│  ✕  Bài viết mới    [Đăng]  │
│                              │
│  ┌────────────────────────┐  │
│  │ + Thêm ảnh/video      │  │
│  │  📷  📹  📁            │  │
│  └────────────────────────┘  │
│                              │
│  ┌────────────────────────┐  │
│  │ Viết gì đó về Boss... │  │
│  │                        │  │
│  │                        │  │
│  └────────────────────────┘  │
│                              │
│  🐾 Tag Boss                 │
│  [Lu 🐕] [+ Thêm Boss]      │
│                              │
│  📍 Vị trí                   │
│  [Vinhomes Q9] [Thay đổi]   │
│                              │
│  # Hashtag                   │
│  [#GoldenRetriever] [+ Thêm]│
│                              │
│  👁️ Ai có thể xem?          │
│  (●) Công khai               │
│  ( ) Chỉ Circle              │
│  ( ) Chỉ mình tôi           │
└──────────────────────────────┘
```

## 6. Luồng Chat & Hẹn dạo

### Chat Room

```
┌──────────────────────────────┐
│  ← Miu (Corgi) · @hoa_corgi │
│              🐕 Online        │
│                              │
│  ┌────────────────────────┐  │
│  │  Chào bạn! Lu thích   │  │  ← Incoming
│  │  chơi bóng không? 🎾  │  │
│  └────────────────────────┘  │
│                              │
│          ┌────────────────┐  │
│          │  Lu mê bóng    │  │  ← Outgoing (coral)
│          │  lắm luôn! 😍  │  │
│          └────────────────┘  │
│                              │
│  ┌────────────────────────┐  │
│  │  Cuối tuần dắt dạo    │  │
│  │  ở công viên Q9 nha!  │  │
│  └────────────────────────┘  │
│                              │
│  ┌─────────────────────────┐ │
│  │ 📅 HẸN DẮT DẠO          │ │  ← Walk appointment bubble
│  │                         │ │
│  │ 📍 Công viên Gia Định   │ │
│  │ 📅 CN 03/11, 7:00 AM   │ │
│  │ 🐕 Lu + Miu             │ │
│  │                         │ │
│  │ [Chấp nhận] [Đổi giờ]  │ │
│  └─────────────────────────┘ │
│                              │
│  ┌──────────────────┐ 📎 🎤  │
│  │ Nhập tin nhắn... │ [Gửi] │
│  └──────────────────┘        │
│                              │
│  🏠     🔍     ➕     💬  👤  │
└──────────────────────────────┘
```

### Nút Hẹn Dạo — Luồng chi tiết

```
Tap "📅 Hẹn dạo" trong chat
        ↓
┌──────────────────────────────┐
│  ← Tạo hẹn dắt dạo         │
│                              │
│  📅 Chọn ngày               │
│  [Calendar picker]           │
│                              │
│  ⏰ Chọn giờ                │
│  [Time picker]               │
│                              │
│  📍 Địa điểm gợi ý          │
│  (Tính trung điểm 2 vị trí) │
│                              │
│  ┌────────────────────────┐  │
│  │ 1. Công viên Gia Định  │  │  ← Pet-friendly verified
│  │    🐾 Pet-friendly      │  │
│  │    📏 Cách bạn 800m     │  │
│  │    ⭐ 4.5 (23 reviews)  │  │
│  └────────────────────────┘  │
│  ┌────────────────────────┐  │
│  │ 2. Cafe ABC Pet        │  │
│  │    🐾 Pet-friendly      │  │
│  │    📏 Cách bạn 1.2km    │  │
│  └────────────────────────┘  │
│  ┌────────────────────────┐  │
│  │ 3. Hồ Bán Nguyệt      │  │
│  │    🐾 Outdoor           │  │
│  │    📏 Cách bạn 1.5km    │  │
│  └────────────────────────┘  │
│                              │
│  📝 Ghi chú                  │
│  ┌────────────────────────┐  │
│  │ VD: Mang nước cho Boss │  │
│  └────────────────────────┘  │
│                              │
│  [    Gửi lời hẹn    ]      │
└──────────────────────────────┘
```

## 7. Luồng Dịch vụ (Service Flow)

```
Explore → Tab "Dịch vụ" → Chọn loại
        ↓
Partner List → Partner Detail → Chọn dịch vụ
        ↓
┌──────────────────────────────┐
│  ← Đặt lịch — PetSpa ABC   │
│                              │
│  Boss nào cần dịch vụ?      │
│  [🐕 Lu] [🐈 Miu] [+ Thêm] │
│                              │
│  Chọn dịch vụ               │
│  ☐ Tắm + sấy — 150.000đ    │
│  ☐ Cắt lông — 200.000đ     │
│  ☐ Cắt móng — 50.000đ      │
│  ☐ Combo full — 350.000đ   │
│                              │
│  📅 Chọn ngày               │
│  [1] [2] [3] [4] [5]...     │
│                              │
│  ⏰ Chọn slot               │
│  [9:00] [10:00] [14:00]     │
│  [15:00] — slot trống       │
│                              │
│  📝 Ghi chú cho đối tác     │
│  ┌────────────────────────┐  │
│  │ Boss sợ máy sấy       │  │
│  └────────────────────────┘  │
│                              │
│  Tổng: 350.000đ             │
│  [    Xác nhận đặt lịch ]   │
└──────────────────────────────┘
        ↓
┌──────────────────────────────┐
│  ✅ Đã gửi yêu cầu!         │
│                              │
│  PetSpa ABC sẽ xác nhận     │
│  trong vòng 2 giờ.          │
│                              │
│  Trạng thái: ⏳ Chờ xác nhận │
│                              │
│  [Xem chi tiết] [Về Hôm nay]│
└──────────────────────────────┘
```

## 8. Micro-Interactions & Animations

| Interaction | Animation | Thời lượng |
|---|---|---|
| Paw reaction | Paw stamp → bounce → fade | 400ms |
| Mark task done | Checkbox fills → confetti particles | 600ms |
| Match success | Cards merge → confetti burst 🎉 | 1200ms |
| Pull to refresh | Pet paw prints appear while loading | Variable |
| New notification | Gentle bounce on tab icon | 300ms |
| Swipe card | Smooth card exit + next card scales up | 350ms |
| Bottom sheet open | Spring animation from bottom | 400ms |
| Tab switch | Cross-fade content | 200ms |

## 9. Empty States

| Màn hình | Empty state |
|---|---|
| Today — No tasks | "Hôm nay Boss rảnh rồi! 🐾\nThêm việc chăm sóc hoặc khám phá cộng đồng." |
| Feed — No posts | "Chưa có gì mới!\nFollow thêm Boss để thấy khoảnh khắc dễ thương." |
| Circle — No members | "Chưa có ai trong vòng chăm sóc.\nMời người thân cùng chăm Boss nào! [Mời ngay]" |
| Chat — No messages | "Chưa có tin nhắn.\nKết nối với chủ nuôi gần bạn! [Khám phá]" |
| Services — No bookings | "Chưa có lịch hẹn nào.\nĐặt dịch vụ cho Boss? [Xem dịch vụ]" |

