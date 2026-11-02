import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import Constants, { ExecutionEnvironment } from 'expo-constants';

// Kiểm tra xem ứng dụng có đang chạy trong môi trường Expo Go hay không
const isExpoGo =
  Constants.appOwnership === 'expo' ||
  Constants.executionEnvironment === ExecutionEnvironment.StoreClient;

// 1. Cấu hình Foreground Notification Handler để hiển thị banner, chuông, rung ngay cả khi đang mở app
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

let isConfigured = false;

/**
 * Khởi tạo kênh thông báo Android và xin cấp quyền Native Notifications
 */
export async function setupNativeNotifications(): Promise<boolean> {
  if (isConfigured) return true;

  try {
    // Lưu ý: Từ Expo SDK 53+, Expo Go trên Android không hỗ trợ Remote Notification Channels
    // Gọi setNotificationChannelAsync trên Expo Go Android sẽ bị NPE từ mã native của Expo.
    // Khi build file APK / Development Build thực tế (npx expo run:android), hàm này hoạt động 100%.
    if (Platform.OS === 'android' && !isExpoGo) {
      try {
        await Notifications.setNotificationChannelAsync('pawty_channel', {
          name: 'Pawty Thông Báo Khẩn & Kết Nối',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF6F61',
          sound: 'default',
        });
      } catch (channelErr: any) {
        // Bỏ qua lỗi native channel khi môi trường chưa sẵn sàng
      }
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    isConfigured = finalStatus === 'granted';
    return isConfigured;
  } catch (err) {
    // Ghi log nhẹ nhàng, không gây ảnh hưởng hay crash app
    return false;
  }
}

/**
 * Kích hoạt thông báo thực thụ trên thanh trạng thái / trung tâm thông báo của điện thoại (Android / iOS)
 */
export async function sendNativePushNotification(
  title: string,
  body: string,
  data: Record<string, any> = {}
): Promise<void> {
  try {
    await setupNativeNotifications();

    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
        badge: 1,
        channelId: Platform.OS === 'android' && !isExpoGo ? 'pawty_channel' : undefined,
        data,
      } as any,
      trigger: null, // Bắn thông báo ngay lập tức trên màn hình
    });
  } catch (err) {
    // Bỏ qua lỗi bắn thông báo khi Expo Go giới hạn
  }
}
