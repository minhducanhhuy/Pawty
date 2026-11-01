import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

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
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('pawty_channel', {
        name: 'Pawty Thông Báo Khẩn & Kết Nối',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF6F61',
        sound: 'default',
      });
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
    console.warn('[Pawty Notifications Setup Warning]:', err);
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
        channelId: Platform.OS === 'android' ? 'pawty_channel' : undefined,
        data,
      } as any,
      trigger: null, // Bắn thông báo ngay lập tức trên màn hình
    });
  } catch (err) {
    console.warn('[Pawty Native Notification Error]:', err);
  }
}
