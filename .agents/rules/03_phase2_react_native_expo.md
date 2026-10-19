---
trigger: always_on
---

# PHASE 2: NATIVE APP (REACT NATIVE + EXPO) STANDARDS

Giai đoạn 2 là giai đoạn đóng gói và chuyển hóa từ Demo Web thành ứng dụng di động thực sự, có khả năng đẩy lên App Store và Google Play.

## 1. TECH STACK VÀ MIGRATE
- Sử dụng Expo (Managed Workflow hoặc Bare Workflow tùy yêu cầu native) kết hợp với React Native.
- Tái sử dụng tối đa cấu trúc Component và các state (trạng thái) đã định hình ở Phase 1. Các thẻ `div`, `span` sẽ được refactor thành `View`, `Text`.
- CSS sẽ chuyển từ Tailwind sang `NativeWind` hoặc `StyleSheet`.

## 2. TỐI ƯU HIỆU NĂNG NATIVE
- **60 FPS Animations:** Trẻ em cực kỳ nhạy cảm với hình ảnh. Các hoạt cảnh linh vật xuất hiện, dỗ dành và tung sao Vàng phải đạt 60 FPS mượt mà (Ưu tiên dùng Reanimated hoặc Lottie).
- **Tối ưu Pin (Battery < 2%):** Ứng dụng chạy ngầm đếm ngược thời gian không được phép ngốn pin. Sử dụng các API đếm ngược tối ưu của Native thay vì chạy vòng lặp liên tục tốn CPU.
- **Zero-Latency Sync:** Nếu có luồng điều khiển đồng bộ giữa máy cha mẹ và máy con (qua WebSocket hoặc Firebase Realtime Database), độ trễ phải gần bằng 0.

## 3. TRIỂN KHAI CÁC MODULE ĐẶC THÙ NATIVE
- **App Lock / Kiosk Mode:** Tích hợp các thư viện chặn trẻ em tự thoát ứng dụng (Pin màn hình trên Android, Guided Access trên iOS).
- **Native Audio:** Ghi âm và phát file âm thanh (giọng phụ huynh) sử dụng thư viện native chất lượng cao, không có độ trễ và lưu trữ an toàn trong máy.
