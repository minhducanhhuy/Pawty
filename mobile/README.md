# Pawty Mobile App (Expo SDK 57 + React Native 0.86 + React 19)

Ứng dụng di động chính thức của **Pawty Super App** (*"Bạn dạo muôn nơi - Boss vui cả ngày"*), tuân thủ 100% thiết kế `master_print/` v1.1 (Tier 00–05).

## 1. Cấu trúc thư mục (`mobile/`)

- `App.tsx`: Entrypoint gọn nhẹ (<50 dòng) khởi tạo các Context Providers và `RootNavigator`.
- `src/theme/`: Hệ thống Design Tokens (`COLORS` Coral `#FF6F61`, Mint `#A3E4D7`, Cream `#FDFBF7`, `TYPOGRAPHY` Fredoka/Nunito, `SPACING`, `RADIUS`, `SHADOWS`).
- `src/i18n/`: Đa ngôn ngữ (`vi.ts`, `en.ts`, hook `useTranslation`, đổi ngôn ngữ thời gian thực lưu vào `AsyncStorage` và đồng bộ `PATCH /users/me`).
- `src/api/`:
  - `client.ts`: HTTP Client đọc `EXPO_PUBLIC_API_URL` (mặc định `http://localhost:3000/api`), đính kèm `Authorization: Bearer <token>`, `X-Pet-Id`, `Accept-Language`, tự động fallback sang kho dữ liệu giả lập cục bộ khi server offline hoặc `EXPO_PUBLIC_USE_MOCK=true`.
  - `endpoints.ts`: Toàn bộ hợp đồng REST API theo Tier 03 v1.1.
  - `mockStoreCore.ts`, `mockStoreCommunity.ts`, `mockHandlersCore.ts`, `mockHandlersCommunity.ts`, `mockHandlersExtras.ts`, `mockRouter.ts`: Kho dữ liệu giả lập đầy đủ giúp test 100% tính năng ngay cả khi không bật backend.
- `src/context/`: `AuthContext`, `AppConfigContext`, `ActivePetContext`, `NotificationContext` (tích hợp `socket.io-client`).
- `src/components/`: `Button`, `Chip`, `Card`, `Avatar`, `Badge`, `EmptyState`, `ModalSheet`, `ToastOverlay`, `ConfettiOverlay`, `HeaderBar`.
- `src/navigation/`: Bộ định tuyến Typed Stack + 4 Bottom Tabs (`NavigationContext`, `BottomTabBar`, `RootNavigator`) hỗ trợ nút Back phần cứng Android và tương thích 100% với React 19 + Expo Go.
- `src/screens/`: Toàn bộ các màn hình Part A & Part B (mỗi file < 150 dòng theo quy tắc Clean Code):
  - **Part A:** `OnboardingScreen` (`PhoneOtpStep`, `SenBossStep`), `RadarScreen` (`PetSwipeCard`, `NativeAdCard`, `RadarFilterModal`, `MatchCelebrationModal`, `RadarHeaderAndControls`), `WalkNowScreen`, `PaywallScreen` (`VietQrModal`), `SosModal`, `SosNearbyScreen`, `ProfileScreen` (`DeepBioTab`, `BossSwitcherModal`), `PetDetailScreen`, `VaccineUploadScreen`, `RemindersScreen`, `SettingsScreen`.
  - **Part B:** `FeedScreen` (`CommentsSheet`, `UploadMomentModal`), `ChatListScreen`, `ChatRoomScreen` (`AppointmentBubble`), `WalkSchedulerModal`, `CheckInScreen`, `LiveLocationModal`, `PlacesScreen`, `PlaceDetailScreen`, `ClubsScreen`, `ClubDetailScreen`, `EventsScreen`, `NotificationCenterScreen`, `VouchersScreen`, `BadgesScreen`, `ReferralScreen`.

## 2. Biến môi trường (`.env`)

```env
EXPO_PUBLIC_API_URL=http://localhost:3000/api
EXPO_PUBLIC_USE_MOCK=false
```

## 3. Hướng dẫn chạy & Kiểm tra TypeScript

```powershell
cd mobile
npx tsc --noEmit
npx expo start --go
```
