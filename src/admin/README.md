# Pawty Admin Portal & Partner Portal

Hai cổng Web quản trị và đối tác được tích hợp trực tiếp trong Vite multi-page (`admin.html` & `partner.html`), tuân thủ chặt chẽ đặc tả tại `master_print/03_api_and_websocket_contracts.md` (§5.10, §5.11) và `master_print/04_screen_specifications_and_user_flows.md` (§4.4).

## 1. Đường dẫn truy cập (Dev & Build)

- **Admin Portal:** `http://localhost:5173/admin.html`
- **Partner Portal:** `http://localhost:5173/partner.html`
- **Chế độ dữ liệu:**
  - Mặc định kết nối tới `VITE_API_URL` (`http://localhost:3000/api`).
  - Tự động fallback sang dữ liệu mẫu (`mockAdminApi` / `mockPartnerApi`) khi bật `VITE_USE_MOCK=true` hoặc khi máy chủ backend chưa khởi chạy.

## 2. Tài khoản Sandbox

### Cổng Quản trị (`/admin.html`)
- **Admin:** SĐT `0900000000` — OTP `888888`
- **Moderator:** SĐT `0900000001` — OTP `888888`

### Cổng Đối tác (`/partner.html`)
- **Email:** `partner@pawtyspa.vn`
- **Mật khẩu:** `pawty123`
- **Mã Voucher thử nghiệm Redeem:** `PAW-SPA35A`, `PAW-CAFE30`, hoặc bất kỳ mã định dạng `PAW-XXXXXX`.
