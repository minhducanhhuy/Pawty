# TẦNG 7: LANDING PAGE SPECIFICATION (PAWTY MARKETING & CONVERSION)

---
description: # LANDING PAGE & HERO COVER DESIGN SYSTEM (PAWTY SUPER APP)
source_reference: VNHUB_Web/app & Figma Cover 1920x1080
target_project: Pawty-LandingPage
---

## 1. TỔNG QUAN THIẾT KẾ HERO COVER (VNHUB ADAPTATION)

Giao diện phần đầu (Hero Cover) của Landing Page được thiết kế theo phong cách **Kinetic 3D Showcase & Sunset Glow Gradient** mô phỏng chính xác cấu trúc và đẳng cấp thẩm mỹ từ `VNHUB_Web` và Figma Cover:
- **Tỉ lệ khung hình Hero:** 1920x1080 canvas responsive (full-bleed viewport `min-h-screen`).
- **Bảng màu chủ đạo của Hero Cover:**
  - Gradient chuyển màu đa tầng: `#FF1E56` (Crimson Coral) -> `#E11D48` (Vibrant Rose) -> `#C026D3` (Fuchsia Magenta) -> `#7C3AED` (Violet Purple) -> `#1E1B4B` / `#0F172A` (Deep Indigo Night).
  - Tilted Background Card Mosaic: Khung lưới thẻ Boss cưng (154.88px x 222px, bo góc `rx=16px`) xoay một góc nghiêng chính xác **39.7°**, độ trong suốt `opacity: 0.35 - 0.40`, hiển thị hình ảnh Boss (Corgi, Golden Retriever, Shiba Inu, Mèo Ba Tư, Mèo Anh Lông Dài, Poodle...) kèm chứng nhận Safe Pet.
- **Bộ 3 Điện Thoại 3D (Triple Phone Mockups):**
  - **Điện thoại trung tâm (Center Phone):** Đặt thẳng đứng ở trung tâm (`scale: 1.05`, `z-index: 20`, viền kim loại bo cong, Dynamic Island, bóng đổ 3D sâu `shadow-2xl`). Hiển thị màn hình Radar quẹt thẻ Pawty với hình ảnh Corgi Mochi, Safe Pet Mint Badge, khoảng cách 280m, các nút hành động (Hoàn tác Rewind, Bỏ qua Pass, Thả tim Like, Super Like Star).
  - **Điện thoại bên trái (Left Phone):** Nghiêng sang trái -10° (`rotate: -10deg`, `scale: 0.88`, `z-index: 10`), hiển thị màn hình Hồ Sơ Pet Family Passport & Sổ tiêm điện tử 7 bệnh + phòng dại Safe Pet.
  - **Điện thoại bên phải (Right Phone):** Nghiêng sang phải +10° (`rotate: +10deg`, `scale: 0.88`, `z-index: 10`), hiển thị màn hình Báo Động SOS Tìm Boss Lạc với **Huy hiệu ✨ AI Gemini Vision Tự Động Viết Mô Tả**, bản đồ tọa độ manh mối nhìn thấy từ cư dân.
- **Cột Nội Dung Bên Trái (Left Content Column):**
  - Nhãn Pill định vị: `🐾 SIÊU ỨNG DỤNG THÚ CƯNG ĐÔ THỊ TÍCH HỢP AI GOOGLE GEMINI`.
  - Tiêu đề Display lớn (Fredoka/Inter Bold, màu trắng): `Trải nghiệm kết nối Boss & Sen thông minh, an tâm tuyệt đối`.
  - Đoạn văn mô tả (text-white/90): `Pawty là siêu ứng dụng kết nối thú cưng đô thị đầu tiên tại Việt Nam, tích hợp trợ lý AI Google Gemini nhận diện Boss lạc, radar quẹt thẻ tìm bạn dắt dạo tuần hoàn vô tận, tách biệt 2 phân hệ chat hẹn hò & mạng xã hội, cùng sổ tiêm điện tử Safe Pet trong một hệ sinh thái toàn diện.`
  - Nút tải ứng dụng: App Store, Google Play, và nút Trải nghiệm Radar Web.
- **Đường Cắt Uốn Lượn Đáy Hero (Bottom Wave Decoration):**
  - Đường cong SVG Wave màu `#FDFBF7` (Trắng kem Pawty), tạo đường nét mượt mà chuyển tiếp từ Cover rực rỡ sang phần thông tin chi tiết.

---

## 2. 4 TRỤ CỘT ĐỘT PHÁ (BENTO GRID FEATURES)

Landing Page đồng bộ 100% với 4 tính năng thực tế đang chạy trên Pawty Super App:
1. **Radar Tinder Hẹn Hò & Dắt Dạo Vô Tận (PostGIS 500m - 3km):**
   - Cơ chế cọc thẻ quẹt không bao giờ hết (Swipe Infinite Reload), tự động tuần hoàn hồ sơ quanh khu vực.
   - Nút **Hoàn tác (Rewind Swipe)** độc quyền lấy lại thẻ vừa quẹt nhầm.
   - Bộ lọc linh hoạt: Loài Boss (Chó / Mèo), cự ly và mục tiêu hẹn dạo. Khớp đôi bắn pháo hoa Confetti tức thì.
2. **Báo Động SOS Tìm Boss Lạc + Trợ Lý AI Vision Google Gemini:**
   - Đột phá công nghệ: Mô hình đa phương thức Google Gemini phân tích ảnh chụp từ camera điện thoại, tự động trích xuất màu lông, dáng vẻ, vòng cổ và viết đoạn mô tả nhận diện chuẩn xác chỉ trong 3 giây.
   - Bắn Push Notification khẩn cấp bán kính 3km tới toàn bộ chủ nuôi đô thị qua VietQR 39k.
   - Bản đồ AI Spatiotemporal Trajectory truy vết từng manh mối nhìn thấy từ cư dân xung quanh.
   - Phân quyền minh bạch: Người ngoài báo vị trí manh mối, chỉ chính chủ mới có quyền xác nhận "Đã đón bé về".
3. **Pet Family Passport & Mạng Xã Hội Khoảnh Khắc (Feed & Sổ Tiêm Safe Pet):**
   - Hồ sơ gia đình thú cưng chuẩn quốc tế: Phân trang thẻ ngang cho từng bé, sổ tiêm chủng Safe Pet (7 bệnh, dại, tẩy giun).
   - Khai báo thói quen tốt & thói quen cần lưu ý triệt tiêu nguy cơ cắn nhau ngoài công viên.
   - Mạng xã hội khoảnh khắc (Moments feed): Đăng ảnh/video thật từ điện thoại, hashtag tự do, thả tim và bình luận rôm rả.
4. **Hệ Thống Nhắn Tin Kép Độc Lập (Mạng Xã Hội Tự Do & Hẹn Hò Riêng Tư):**
   - **Tin nhắn Mạng Xã Hội:** Trò chuyện mở, kết nối cộng đồng cư dân nuôi thú cưng, xem profile công khai.
   - **Tin nhắn Hẹn Hò & Hẹn Dạo:** Chỉ kích hoạt khi đã Match, bảo mật riêng tư, tự động đề xuất 3 địa điểm trung điểm thân thiện Boss (Pet Cafe, Công viên), cơ chế Hủy Match (Unmatch) xóa sạch lịch sử trò chuyện chống quấy rối và chế tài phạt bùng kèo.

---

## 3. KHU VỰC TRẢI NGHIỆM THỰC TẾ (INTERACTIVE RADAR ARENA)
- Tích hợp bộ lọc loài (Tất cả / Chó / Mèo) và cự ly.
- Tích hợp nút **Hoàn tác (Rewind)** mô phỏng chính xác trải nghiệm trên app di động.
- Dữ liệu thẻ thú cưng đồng bộ với database hạt giống (Corgi Mochi, Golden Lu, Mèo Ba Tư Sâu, Poodle LuLu...).
