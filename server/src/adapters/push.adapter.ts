import { HttpStatus, Injectable } from '@nestjs/common';
import { DataStoreService } from '../database/data-store.service';
import { NotificationRecord, NotificationType } from '../database/types';
import { DomainException } from '../common/errors';

export interface PushNotificationInput {
  type: NotificationType;
  title: string;
  body: string;
  payload?: Record<string, any>;
}

export interface PushProvider {
  deliverToDevice(
    fcmToken: string | null,
    notification: NotificationRecord,
  ): Promise<void>;
}

export class SandboxPushProvider implements PushProvider {
  async deliverToDevice(
    _fcmToken: string | null,
    _notification: NotificationRecord,
  ): Promise<void> {
    // Sandbox no-op external HTTP call; socket emission handled by PushAdapterService
  }
}

export class FcmPushProvider implements PushProvider {
  async deliverToDevice(
    _fcmToken: string | null,
    _notification: NotificationRecord,
  ): Promise<void> {
    if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_PRIVATE_KEY) {
      throw new DomainException(
        'NOT_CONFIGURED',
        'Firebase Cloud Messaging (FCM) chưa được cấu hình khoá thật.',
        HttpStatus.NOT_IMPLEMENTED,
      );
    }
    throw new DomainException(
      'NOT_CONFIGURED',
      'FCM Push Provider chưa được cấu hình.',
      HttpStatus.NOT_IMPLEMENTED,
    );
  }
}

type SocketPushEmitter = (
  userId: string,
  event: string,
  payload: any,
) => void;

@Injectable()
export class PushAdapterService {
  private readonly sandbox = new SandboxPushProvider();
  private readonly fcm = new FcmPushProvider();
  private socketEmitter: SocketPushEmitter | null = null;

  constructor(private readonly dataStore: DataStoreService) {}

  public registerSocketEmitter(emitter: SocketPushEmitter) {
    this.socketEmitter = emitter;
  }

  private getProvider(): PushProvider {
    const mode = (process.env.PUSH_PROVIDER || 'sandbox').toLowerCase();
    return mode === 'fcm' ? this.fcm : this.sandbox;
  }

  public async sendPush(
    userId: string,
    input: PushNotificationInput,
  ): Promise<NotificationRecord> {
    const user = this.dataStore.users.find((u) => u.id === userId);
    const record: NotificationRecord = {
      id: `notif_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      userId,
      type: input.type,
      title: input.title,
      body: input.body,
      payload: input.payload || {},
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    this.dataStore.notifications.unshift(record);
    this.dataStore.save();

    const prefKey = input.type as keyof NonNullable<typeof user>['notificationPrefs'];
    const isPrefAllowed =
      !user ||
      !(prefKey in user.notificationPrefs) ||
      user.notificationPrefs[prefKey] !== false;

    if (isPrefAllowed) {
      await this.getProvider().deliverToDevice(user?.fcmToken || null, record);

      if (this.socketEmitter) {
        this.socketEmitter(userId, 'notification_created', record);
        this.socketEmitter(userId, 'fcm_push_notification', {
          id: record.id,
          title: record.title,
          body: record.body,
          type: record.type,
          payload: record.payload,
          createdAt: record.createdAt,
        });
      }
    }

    return record;
  }
}
