# 🐾 HƯỚNG DẪN CẬP NHẬT CODE & CHẠY LOCAL (PAWTY SUPER APP)

> **Dành cho:** Tất cả thành viên trong nhóm phát triển dự án Pawty.
> **Mục đích:** Đồng bộ mã nguồn mới nhất từ nhánh `main`, cập nhật cấu trúc cơ sở dữ liệu PostgreSQL, dọn sạch dữ liệu cũ, nạp 30 tài khoản thử nghiệm (`test1` $\rightarrow$ `test30`) và kiểm thử luồng ứng dụng trên môi trường local.

---

## 📌 NHỮNG ĐIỂM THAY ĐỔI CỐT LÕI CẦN LƯU Ý

1. **Xóa bỏ hoàn toàn Mock Data:** Mọi dữ liệu (người dùng, hồ sơ hẹn hò, bài viết, tin nhắn, thông báo) hiện tại đều lấy trực tiếp từ **PostgreSQL Database** thông qua Backend API Gateway. Nếu không chạy server hoặc database chưa seed thì ứng dụng sẽ không thể đăng nhập.
2. **Tách biệt 2 phân hệ Tin nhắn độc lập:**
   - **Mạng xã hội:** Nhắn tin tự do không cần kết bạn (chuẩn Pinterest / Facebook), xem trang cá nhân công khai.
   - **Hẹn hò & Kết nối:** Chỉ trò chuyện khi đã tương hợp (Match), chỉ xem được Hồ sơ Hẹn hò (không xem được mạng xã hội), có nút **Hủy tương hợp (Bỏ Match)** xóa sạch lịch sử trò chuyện.
3. **Cọc thẻ Hẹn hò không bao giờ hết:** Chỉ loại trừ các tài khoản đang match thực sự. Người từng bị từ chối (Pass/quẹt trái) hoặc đã hủy match sẽ tự động được tuần hoàn nạp lại định kỳ sau 2 phút hoặc khi cọc thẻ về 0 (có nút bấm làm mới ngay).
4. **Cố định Theme thương hiệu Pawty:** Cố định bộ nhận diện `Coral & Mint & Warm Cream`, loại bỏ hoàn toàn tính năng đổi theme.

---

## 🚀 QUY TRÌNH CHẠY LOCAL TỪNG BƯỚC

### BƯỚC 1: KÉO MÃ NGUỒN MỚI NHẤT TỪ GITHUB

Mở cửa sổ Terminal tại thư mục gốc của dự án (`Pawty`):

```bash
# 1. Chuyển sang nhánh main
git checkout main

# 2. Kéo code mới nhất đã được merge
git pull origin main
```

*(Lưu ý: Nếu bạn đang có code chưa commit trên nhánh cá nhân, hãy chạy `git stash` hoặc commit lại trước khi checkout main).*

---

### BƯỚC 2: CẤU HÌNH DATABASE POSTGRESQL & SEED 30 TÀI KHOẢN

1. Đảm bảo dịch vụ **PostgreSQL** trên máy của bạn đang chạy ở cổng mặc định `5432`.
2. Kiểm tra tệp tin `server/.env`:

   ```env
   PORT=3000
   DATABASE_URL="postgresql://postgres:MAT_KHAU_CUA_BAN@127.0.0.1:5432/pawty?schema=public"
   ```

   *(Thay `MAT_KHAU_CUA_BAN` bằng mật khẩu tài khoản postgres trên máy cá nhân của bạn, ví dụ: `123456`, `admin`, hoặc `root`).*
3. Mở Terminal tại thư mục `server` để đồng bộ bảng và dọn sạch dữ liệu cũ:

   ```bash
   cd server

   # Đẩy cấu trúc bảng Prisma vào PostgreSQL (tự động tạo database 'pawty' nếu chưa có)
   npx prisma db push

   # Chạy script làm sạch database và tạo mới 30 tài khoản test
   npm run seed
   ```
4. **Kết quả mong đợi:** Terminal hiển thị thông báo thành công:

   ```text
   [Seed] Đang dọn dẹp toàn bộ dữ liệu trong PostgreSQL...
   [Seed] Đã dọn dẹp sạch sẽ database. Bắt đầu tạo 30 tài khoản test1 -> test30...
   [Seed Thành Công] Đã khởi tạo thành công 30 tài khoản từ test1 -> test30:
   - Mật khẩu chung: 123456
   - Tài khoản từ test1 đến test30 đã có profile, avatar, khu vực sinh sống, sẵn sàng quẹt thẻ hẹn hò.
   ```

> 💡 **Mẹo xem dữ liệu trên pgAdmin:**
> Nếu trên pgAdmin chỉ thấy `Databases (1) -> postgres`, hãy **click chuột phải vào mục `Databases`** $\rightarrow$ chọn **`Refresh`**. Bạn sẽ thấy database **`pawty`** xuất hiện ngay lập tức. Mở `Schemas` $\rightarrow$ `public` $\rightarrow$ `Tables` để xem dữ liệu.

---

### BƯỚC 3: KHỞI ĐỘNG BACKEND API GATEWAY

Tại thư mục `server`:

```bash
# Biên dịch TypeScript
npm run build

# Khởi chạy server API
npm run start
```

Kiểm tra terminal hiển thị:

```text
[Pawty Server] API Gateway (PostgreSQL) running at http://0.0.0.0:3000/api/health
```

*(Bạn có thể mở trình duyệt truy cập `http://localhost:3000/api/health` để xác nhận server trả về `{"status":"ok"}`).*

---

### BƯỚC 4: KHỞI ĐỘNG ỨNG DỤNG DI ĐỘNG (EXPO MOBILE)

Mở một cửa sổ Terminal **mới**:

```bash
cd apps/mobile

# Bắt buộc dùng cờ -c để xóa sạch bộ nhớ cache Metro cũ
npx expo start -c
```

- **Trên điện thoại thật:** Mở ứng dụng **Expo Go**, quét mã QR hiển thị trên Terminal (đảm bảo điện thoại và máy tính kết nối chung một mạng Wi-Fi).
- **Trên máy ảo Android:** Nhấn phím `a` trên Terminal.
- **Trên nền tảng Web:** Nhấn phím `w` trên Terminal.

---

## 🔑 THÔNG TIN TÀI KHOẢN VÀ KỊCH BẢN KIỂM THỬ

### 1. Danh sách tài khoản đăng nhập

- **Tài khoản:** `test1`, `test2`, `test3`, ..., `test30`
- **Mật khẩu chung:** `123456`
- **Số điện thoại:** `0900000001` đến `0900000030`

---

### 2. Kịch bản kiểm thử các tính năng mới

#### Kịch bản A: Nhắn tin Mạng xã hội không cần kết bạn

1. Đăng nhập tài khoản `test1`.
2. Vào tab **Khám phá** $\rightarrow$ Chọn bài đăng của bất kỳ ai (hoặc vào Trang cá nhân của họ).
3. Bấm nút **`Nhắn tin`** $\rightarrow$ Phòng chat lập tức được mở ra.
4. Hai người có thể nhắn tin cho nhau tự do (theo chuẩn Pinterest / Facebook Messenger) mà không bị thông báo chặn *"Hai bạn đã hủy kết bạn"*.

#### Kịch bản B: Quẹt thẻ Kết nối Hẹn hò (Tinder) & Cơ chế không bao giờ hết thẻ

1. Vào tab **Kết nối** (icon Trái tim).
2. Danh sách cọc thẻ sẽ tải 29 tài khoản còn lại (`test2` đến `test30`) với đầy đủ ảnh chân dung, tên, bio và khu vực sinh sống.
3. **Quẹt trái (Pass):** Thẻ trượt sang trái. Thẻ này **không bị xóa vĩnh viễn**; khi cọc thẻ quẹt gần hết hoặc sau 2 phút, hệ thống tự động tải lại để luôn có người cho bạn quẹt thẻ.
4. **Nút Làm mới:** Nếu quẹt hết thẻ và thấy màn hình *"Đã xem hết hồ sơ phù hợp"*, chỉ cần bấm nút **`[🔄 Làm mới danh sách ngay]`** là toàn bộ ứng viên chưa match sẽ được nạp lại tức thì.
5. **Quẹt phải (Thả tim):**
   - Đăng nhập `test1` quẹt phải `test2`.
   - Mở cửa sổ ẩn danh hoặc thiết bị khác đăng nhập `test2` quẹt phải `test1`.
   - Hiệu ứng pháo hoa Confetti xuất hiện báo hiệu **Ghép đôi thành công (Match)**, kèm thông báo rung và chuông trên status bar điện thoại.

#### Kịch bản C: Bảo mật Hồ sơ Hẹn hò & Cơ chế Bỏ Match

1. Mở phòng chat hẹn hò vừa match giữa `test1` và `test2`.
2. Bấm vào Avatar hoặc tên đối phương: Hệ thống chỉ hiển thị **Hồ sơ Hẹn hò** (`Tinder Profile`), **hoàn toàn không có đường dẫn hay thông tin bài viết trang cá nhân mạng xã hội**.
3. Bấm vào nút `⋮` (Menu góc trên bên phải):
   - Chọn **`Xóa toàn bộ tin nhắn`**: Xác nhận xóa sạch lịch sử tin nhắn trong PostgreSQL.
   - Chọn **`Bỏ tương hợp & Xóa cuộc trò chuyện`**: Xác nhận bỏ match $\rightarrow$ Xóa sạch phòng chat, xóa tin nhắn trong database và đưa đối phương trở lại danh sách có thể quẹt thẻ lại sau này.

---

## 🛠️ XỬ LÝ LỖI THƯỜNG GẶP (TROUBLESHOOTING)

| Vấn đề                                             | Nguyên nhân                                        | Cách khắc phục                                                                                                                |
| :---------------------------------------------------- | :--------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------- |
| **Báo lỗi kết nối Database khi chạy seed** | Sai mật khẩu hoặc dịch vụ PostgreSQL chưa bật | Kiểm tra file `server/.env`, đổi lại mật khẩu chính xác của postgres trên máy bạn và chạy lại `npm run seed`. |
| **Expo bị lỗi Unexpected token / Cache cũ**  | Metro Bundler lưu cache của file cũ               | Dừng Expo (Ctrl + C), chạy lại bằng lệnh `npx expo start -c`.                                                             |
| **Điện thoại không tải được Expo Go**   | Máy tính và điện thoại khác mạng Wi-Fi       | Đảm bảo cả hai kết nối cùng một mạng Wi-Fi hoặc dùng chế độ `npx expo start --tunnel`.                           |
| **Đăng nhập báo không thành công**       | Chưa chạy backend server                           | Đảm bảo server backend đang chạy ở cổng 3000 (`npm run start` trong thư mục `server`).                              |

---

*Chúc các thành viên trong nhóm kiểm thử mượt mà! Mọi thắc mắc vui lòng liên hệ trực tiếp CTO.*
