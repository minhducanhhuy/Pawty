import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Logger, OnModuleInit } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Server, Socket } from 'socket.io';
import { DataStoreService } from '../../database/data-store.service';
import { PushAdapterService } from '../../adapters/push.adapter';
import { WalksService } from '../walks/walks.service';
import { getJwtSecret } from '../../common/guards/jwt-auth.guard';
import { BUSINESS_RULES } from '../../config/business-rules';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly dataStore: DataStoreService,
    private readonly jwtService: JwtService,
    private readonly pushAdapter: PushAdapterService,
    private readonly walksService: WalksService,
  ) {}

  onModuleInit() {
    this.pushAdapter.registerSocketEmitter((userId, event, payload) => {
      if (this.server) {
        this.server.to(`user:${userId}`).emit(event, payload);
      }
    });

    this.walksService.registerBroadcastFn((userId, isWalkingNow) => {
      if (this.server) {
        this.server.emit('walking_now_changed', { userId, isWalkingNow });
      }
    });
  }

  handleConnection(client: Socket) {
    try {
      const rawToken =
        client.handshake?.auth?.token ||
        (typeof client.handshake?.headers?.authorization === 'string'
          ? client.handshake.headers.authorization.replace(/^Bearer\s+/i, '')
          : undefined) ||
        (client.handshake?.query?.token as string | undefined);

      if (rawToken) {
        const payload = this.jwtService.verify(rawToken, {
          secret: getJwtSecret(),
        });
        if (payload?.sub) {
          client.data.userId = payload.sub;
          client.join(`user:${payload.sub}`);
          this.logger.log(
            `Socket connected: ${client.id} (user=${payload.sub})`,
          );
          return;
        }
      }
      this.logger.log(`Socket connected (anonymous): ${client.id}`);
    } catch {
      this.logger.warn(`Socket connected with invalid token: ${client.id}`);
    }
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Socket disconnected: ${client.id}`);
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    if (data?.roomId) {
      client.join(data.roomId);
    }
    return { event: 'joined_room', roomId: data?.roomId };
  }

  @SubscribeMessage('send_message')
  async handleSendMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody()
    payload: {
      roomId: string;
      text?: string;
      senderPetId?: string;
      appointmentId?: string;
      appointment?: any;
    },
  ) {
    if (!payload?.roomId) {
      return { status: 'error', message: 'Missing roomId' };
    }

    const userId = client.data?.userId;
    if (!userId) {
      return { status: 'error', message: 'Unauthorized socket client' };
    }
    const senderPet =
      (payload.senderPetId &&
        this.dataStore.pets.find((p) => p.id === payload.senderPetId)) ||
      this.dataStore.getActivePetForUser(userId);
    const senderUser = this.dataStore.users.find((u) => u.id === userId);

    const nowIso = new Date().toISOString();
    const senderPetId = senderPet?.id || `pet_${userId}`;
    const messageRecord = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      roomId: payload.roomId,
      senderPetId,
      text: payload.text || null,
      appointmentId: payload.appointmentId || payload.appointment?.id || null,
      isRead: false,
      status: 'delivered' as const,
      createdAt: nowIso,
    };

    this.dataStore.chatMessages.push(messageRecord);

    const room = this.dataStore.chatRooms.find((r) => r.id === payload.roomId);
    if (room) {
      room.lastMessageText = payload.text || 'Lời mời hẹn dắt Boss đi dạo 📅';
      room.lastMessageAt = nowIso;
    }
    this.dataStore.save();

    const outbound = {
      ...messageRecord,
      senderName: senderPet?.name || senderUser?.fullName || 'Người dùng',
      senderAvatar: senderPet?.avatarUrl || senderUser?.avatarUrl || '',
      appointment: payload.appointment || null,
      timestamp: new Date().toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
      }),
    };

    if (this.server) {
      this.server.to(payload.roomId).emit('receive_message', outbound);
    }

    if (room) {
      const senderId = senderPet?.id || senderPetId;
      const recipientPetId =
        room.petAId === senderId ? room.petBId : room.petAId;
      const recipientPet = this.dataStore.pets.find(
        (p) => p.id === recipientPetId,
      );
      if (recipientPet && recipientPet.userId !== userId) {
        await this.pushAdapter.sendPush(recipientPet.userId, {
          type: 'message',
          title: `💬 Tin nhắn mới từ ${senderPet?.name || senderUser?.fullName || 'Bạn mới'}`,
          body: payload.text || 'Đã gửi lời mời hẹn dắt dạo!',
          payload: { roomId: room.id, senderPetId: senderId },
        });
      }
    }

    return { status: 'sent', message: outbound };
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; isTyping: boolean },
  ) {
    if (data?.roomId && this.server) {
      client.to(data.roomId).emit('typing', {
        roomId: data.roomId,
        userId: client.data?.userId || 'usr_sen_01',
        isTyping: Boolean(data.isTyping),
      });
    }
    return { status: 'ok' };
  }

  @SubscribeMessage('mark_read')
  handleMarkRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const readerUserId = client.data?.userId || 'usr_sen_01';
    if (data?.roomId) {
      for (const msg of this.dataStore.chatMessages) {
        if (msg.roomId === data.roomId) {
          msg.isRead = true;
          msg.status = 'read';
        }
      }
      this.dataStore.save();
      if (this.server) {
        this.server.to(data.roomId).emit('messages_read', {
          roomId: data.roomId,
          readerUserId,
        });
      }
    }
    return { status: 'ok' };
  }

  @SubscribeMessage('appointment_status_changed')
  handleAppointmentStatusChanged(
    @ConnectedSocket() _client: Socket,
    @MessageBody()
    payload: { roomId: string; appointmentId: string; status: string },
  ) {
    if (payload?.roomId && this.server) {
      this.server
        .to(payload.roomId)
        .emit('appointment_status_changed', payload);
    }
    return { status: 'broadcasted' };
  }

  @SubscribeMessage('location_share_start')
  handleLocationShareStart(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; appointmentId: string },
  ) {
    const userId = client.data?.userId || 'usr_sen_01';
    const apt = this.dataStore.appointments.find(
      (a) => a.id === data?.appointmentId && a.roomId === data?.roomId,
    );

    if (!apt || apt.status !== 'confirmed') {
      return {
        success: false,
        error: 'LOCATION_SHARE_NOT_ELIGIBLE',
        message: 'Chỉ chia sẻ vị trí khi kèo hẹn đã được xác nhận.',
      };
    }

    const senderPet = this.dataStore.pets.find(
      (p) => p.id === apt.senderPetId,
    );
    const receiverPet = this.dataStore.pets.find(
      (p) => p.id === apt.receiverPetId,
    );
    if (senderPet?.userId !== userId && receiverPet?.userId !== userId) {
      return {
        success: false,
        error: 'LOCATION_SHARE_NOT_ELIGIBLE',
        message: 'Bạn không thuộc kèo hẹn này.',
      };
    }

    const scheduledMs = new Date(apt.scheduledTime).getTime();
    const nowMs = Date.now();
    const minMs =
      scheduledMs -
      BUSINESS_RULES.privacy.liveLocationWindowBeforeMinutes * 60 * 1000;
    const maxMs =
      scheduledMs +
      BUSINESS_RULES.privacy.liveLocationWindowAfterMinutes * 60 * 1000;

    if (nowMs < minMs || nowMs > maxMs) {
      return {
        success: false,
        error: 'LOCATION_SHARE_NOT_ELIGIBLE',
        message:
          'Chỉ chia sẻ vị trí trực tiếp từ 15 phút trước đến 60 phút sau giờ hẹn.',
      };
    }

    const user = this.dataStore.users.find((u) => u.id === userId);
    const existingIdx = this.dataStore.liveLocations.findIndex(
      (l) => l.roomId === data.roomId && l.userId === userId,
    );
    const record = {
      roomId: data.roomId,
      appointmentId: apt.id,
      userId,
      lat: user?.latitude || apt.placeLat,
      lng: user?.longitude || apt.placeLng,
      updatedAt: new Date().toISOString(),
      expiresAt: new Date(maxMs).toISOString(),
    };

    if (existingIdx >= 0) {
      this.dataStore.liveLocations[existingIdx] = record;
    } else {
      this.dataStore.liveLocations.push(record);
    }

    return { success: true, roomId: data.roomId, appointmentId: apt.id };
  }

  @SubscribeMessage('location_update')
  handleLocationUpdate(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; lat: number; lng: number },
  ) {
    const userId = client.data?.userId || 'usr_sen_01';
    const session = this.dataStore.liveLocations.find(
      (l) => l.roomId === data?.roomId && l.userId === userId,
    );
    if (!session) {
      return {
        success: false,
        error: 'LOCATION_SHARE_NOT_ELIGIBLE',
      };
    }

    if (new Date(session.expiresAt).getTime() <= Date.now()) {
      this.dataStore.liveLocations = this.dataStore.liveLocations.filter(
        (l) => !(l.roomId === data.roomId && l.userId === userId),
      );
      return {
        success: false,
        error: 'LOCATION_SHARE_EXPIRED',
      };
    }

    const throttleKey = `${data.roomId}:${userId}`;
    const lastMs = this.dataStore.liveLocationLastUpdate.get(throttleKey) || 0;
    const minIntervalMs =
      BUSINESS_RULES.privacy.liveLocationMinIntervalSeconds * 1000;

    if (Date.now() - lastMs < minIntervalMs) {
      return { success: false, throttled: true };
    }

    this.dataStore.liveLocationLastUpdate.set(throttleKey, Date.now());
    session.lat = data.lat;
    session.lng = data.lng;
    session.updatedAt = new Date().toISOString();

    const payload = {
      roomId: data.roomId,
      userId,
      lat: data.lat,
      lng: data.lng,
      updatedAt: session.updatedAt,
    };

    if (this.server) {
      this.server.to(data.roomId).emit('partner_location', payload);
    }

    return { success: true, ...payload };
  }

  @SubscribeMessage('location_share_stop')
  handleLocationShareStop(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string },
  ) {
    const userId = client.data?.userId || 'usr_sen_01';
    this.dataStore.liveLocations = this.dataStore.liveLocations.filter(
      (l) => !(l.roomId === data?.roomId && l.userId === userId),
    );
    if (data?.roomId && this.server) {
      this.server.to(data.roomId).emit('location_share_stop', {
        roomId: data.roomId,
        userId,
      });
    }
    return { success: true };
  }
}
